import { pool, getConn } from "./db.js";
import { Producto } from "../../public/js/models/producto.js";
async function actualizarEstadoVenta(n_factura, total_pagado) {
	try {
		const [result] = await pool.query(
			`UPDATE facturas_ventas 
             SET status = 'aprobado' 
             WHERE n_fac = ? AND total_compra = ?`,
			[Number(n_factura), Number(total_pagado)]
		);
		if (result.affectedRows === 0) {
			console.error(`No se encontró la factura ${n_factura} o el monto $${total_pagado} no coincide.`);
			return { success: false, message: "Factura no encontrada o monto inválido" };
		}

		console.log(`Factura ${n_factura} marcada como aprobada en db.`);
		return { success: true, affectedRows: result.affectedRows };

	} catch (err) {
		console.error("Error actualizando estado de venta:", err);
		throw err;
	}
}
async function AltaProductos(product) {
	let producto = JSON.parse(product);
	const conn = await getConn();
	try {
		await conn.beginTransaction();
		console.log('Transacción iniciada.')

		const [rows] = await conn.query(
			`INSERT INTO productos
			(P_TIPO, P_NOMBRE, P_MARCA, P_DESCRIPCION, P_IMG, P_PRECIO, P_PR_OFERTA, P_CANTIDAD) 
			VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
			[producto.tipo, producto.nombre, producto.marca, producto.descripcion, producto.image, producto.precio, producto.oferta, producto.stock]
		);
		producto.id_prod = rows.insertId;
		console.log(`Alta registrada en MySQL. \n`);
		await conn.commit();
		return [producto];

	} catch (err) {
		await conn.rollback();
		console.log("Error saving sell invoice");
		console.log(err);
	} finally {
		conn.release();
	}
};


async function GenerarInforme(month) {
	try {
		const [montoMensual] = await pool.query(
			`SELECT SUM(total_compra) as total_facturado 
			FROM facturas_ventas
			WHERE month(fecha) = MONTH(CURRENT_DATE()) AND status = 'aprobado';`
		);
		console.log('Informe cargado.');
		return [montoMensual];
	}
	catch (err) {
		console.log("Error updating bill");
		console.log(err);
	}
}

async function getGananciasBrutas(mes) {
	const conn = await getConn();
	try {
		const [rows] = await conn.query(
			`SELECT 
				SUM(fv.v_cantidad * fv.v_precio) AS ventas_totales,
				SUM(fv.v_cantidad * p.pr_compra) AS costos_totales,
				(SUM(fv.v_cantidad * fv.v_precio) - SUM(fv.v_cantidad * p.pr_compra)) AS ganancias
			FROM 
				facturas_ventas fv
			JOIN 
				productos p ON fv.id_prod = p.id_prod;`);
		console.log('This is the getGananciasBrutas() method in the db -> ' + rows[0])
		return rows[0];
	}
	catch (err) {
		console.log("Error updating bill");
		console.log(err);
	}
	finally {
		conn.release();
	}
}

async function getNFactura() {
	let conn = await getConn();
	try {
		const [rows] = await conn.query(
			`SELECT IFNULL(MAX(n_fac), 0) AS n_fac 
     		FROM facturas_ventas`
		);
		let n_fac = rows.length > 0 ? rows[0].n_fac : 0;
		/*const [insertRemito] = await conn.query(
			`INSERT INTO remitos(N_FACTURA) VALUES (?);`, [n_fac + 1]
		);*/
		//const [numeroRemitoRow] = await conn.query(`SELECT LAST_INSERT_ID() AS n_remito`);
		return {
			'n_fac': rows.length > 0 ? rows[0].n_fac + 1 : null,
			//'n_remito': numeroRemitoRow.length > 0 ? numeroRemitoRow[0].n_remito : null
		};
	} catch (err) {
		console.log("Error getting records");
		console.log(err);
	}
	finally {
		conn.release();
	}
}

async function getProductsByQuery(query) {
	const conn = await getConn();
	try {

		const [rows] = await conn.query(
			`SELECT * 
			FROM productos 
			WHERE p_nombre LIKE ? 
			OR p_descripcion LIKE ?
			OR p_tipo LIKE ?`,
			[`%${query}%`, `%${query}%`, `%${query}%`]
		);
		return [rows];
	} catch (err) {
		console.log("Error", err);
	} finally {
		conn.release();
	}
}

// config/consultas.js
async function ObtenerFiltrosPorCategoria(categoriaId) {
	const conn = await getConn();
	try {
		// Esta query busca qué Atributos tiene la categoría 
		// y qué Valores distintos hay cargados en los productos.
		const [rows] = await conn.query(
			`SELECT DISTINCT a.nombre AS filtro_nombre, pa.valor
             FROM categorias_atr ca
             JOIN atributos a ON ca.atributo_id = a.id
             JOIN producto_atr pa ON a.id = pa.atributo_id
             JOIN productos p ON pa.producto_id = p.id_prod
             WHERE ca.categoria_id = ? AND p.categoria_id = ?`,
			[categoriaId, categoriaId]
		);

		// Agrupamos los valores por nombre de filtro para el Frontend
		const estructuraFiltros = rows.reduce((acc, row) => {
			if (!acc[row.filtro_nombre]) acc[row.filtro_nombre] = [];
			acc[row.filtro_nombre].push(row.valor);
			return acc;
		}, {});

		return estructuraFiltros;
	} finally {
		conn.release();
	}
}

async function getStockTotal(product) {
	let conn = await getConn();
	try {
		const [rows] = await conn.query(`SELECT SUM(p_cantidad) AS total FROM productos_${product}`);
		return rows[0].total;
	}
	catch (err) {
		console.log("Error updating bill");
		console.log(err);
	}
	finally {
		conn.release();
	}
}

async function getSuggestions(tipo, value) {
	let conn = await getConn();
	try {
		let rows;
		switch (tipo) {
			case 'empresa':
				[rows] = await conn.query(
					`SELECT DISTINCT empresa
					FROM facturas 
					WHERE empresa
					LIKE '%${value}%'`);
				break;
			case 'nombre':
				[rows] = await conn.query(
					`SELECT 
					id_prod as id,
					p_tipo as tipo,
					p_nombre as nombre,
					p_marca as marca,
					p_descripcion as descripcion,
					pr_compra as precio,
					p_precio as precio_vta,
					p_cantidad as stock,
					p_img as imagen
					FROM productos
					WHERE p_nombre
					LIKE '%${value}%'`);
				break;
			case 'descripcion':
				[rows] = await conn.query(
					`SELECT DISTINCT p_descripcion as result
					FROM productos
					WHERE p_descripcion
					LIKE '%${value}%'`);
				break;
		}
		return [rows];
	}
	catch (err) {
		console.log("Error getting suggestions");
		console.log(err);
	}
	finally {
		conn.release();
	}
}

/*sync function getVentasDiarias() {
	let conn = await getConn();
	try {
		const [rows] = await conn.query(
			`SELECT 
			DATE(f.FECHA) AS fecha,  	
			SUM(
			CASE 
				WHEN f.TIPO = 'duplicado' THEN fv.V_CANTIDAD
			END
			) AS total_diario
			FROM 
				facturas f
			JOIN 
				facturas_ventas fv ON f.N_FACTURA = fv.N_FACTURA
			WHERE f.FECHA BETWEEN '2024-12-01' AND '2024-12-31' AND curdate()
			GROUP BY 
				DATE(f.FECHA)
			ORDER BY 
				fecha;`);
		const formattedRows = rows.map(row => ({
			...row,
			fecha: new Date(row.fecha).toISOString().split('T')[0]
		}));
		console.log('Consulta de ventas realizada. Rows -> ', formattedRows)
		return [formattedRows];
	}
	catch (err) {
		console.log("Error updating bill");
		console.log(err);
	}
	finally {
		conn.release();
	}
}*/

async function getVentasTotales() {
	let conn = await getConn();
	try {
		const [rows] = await conn.query(
			`SELECT 
				p.p_tipo AS etiqueta, 
				SUM(d.cant_ticket) AS total_vendido
			FROM productos p
			JOIN detalle_factura d ON p.id_prod = d.id_prod
			JOIN facturas_ventas v ON d.id_fac = v.id_fac
			WHERE MONTH(v.fecha) = MONTH(CURRENT_DATE()) 
			AND YEAR(v.fecha) = YEAR(CURRENT_DATE())
			GROUP BY p.p_tipo
			ORDER BY total_vendido DESC;`);
		console.log('Consulta de ventas realizada. Rows -> ', rows)
		return [rows];
	}
	catch (err) {
		console.log("Error updating bill");
		console.log(err);
	}
	finally {
		conn.release();
	}
}
/*async function getVentasAcumuladas(tipo) {
	let conn = await getConn();
	try {
		console.log('This is the product in getVentasAcumuladas: ', tipo)
		const [rows] = await conn.query(
			`SELECT 
				f.FECHA,
				f.N_FACTURA,
				f.TIPO,
				fv.V_CANTIDAD,
				p.P_TIPO,

				CASE 
					WHEN f.TIPO = 'duplicado' THEN fv.V_CANTIDAD
					ELSE fv.V_CANTIDAD 
				END AS adjusted_quantity,
				-- Running total of adjusted_quantity, ordered by date and invoice
				SUM(
					CASE 
						WHEN f.TIPO = 'duplicado' THEN fv.V_CANTIDAD
						ELSE fv.V_CANTIDAD
					END
				) OVER (PARTITION BY p.P_TIPO ORDER BY f.FECHA, f.N_FACTURA) AS total_acumulado
			FROM 
				facturas f
			JOIN 
				facturas_ventas fv ON f.N_FACTURA = fv.N_FACTURA
			JOIN
				productos p ON fv.ID_PROD = p.ID_PROD AND p.P_TIPO = '${tipo}';`);
		const formattedRows = rows.map(row => ({
			...row,
			fecha: new Date(row.FECHA).toISOString().split('T')[0]
		}));
		console.log('Consulta de ventas realizada. Rows -> ', formattedRows)
		return [formattedRows];
	}
	catch (err) {
		console.log("Error updating bill");
		console.log(err);
	}
	finally {
		conn.release();
	}
}*/

async function getStockActual(producto) {
	let conn = await getConn();
	try {
		let rows = [];
		if (!producto) {
			[rows] = await conn.query(
				`SELECT 
				P_TIPO AS producto, 
				SUM(P_CANTIDAD) AS stock 
			FROM 
				productos 
			WHERE 
				P_TIPO IN ('MATE', 'TERMO', 'YERBA') 
			GROUP BY 
				P_TIPO;`
			);
		} else {
			[rows] = await conn.query(
				`SELECT 
					P_TIPO AS producto, 
					SUM(P_CANTIDAD) AS stock 
				FROM 
					productos 
				WHERE 
					P_TIPO = '${producto}' 
				GROUP BY 
					P_TIPO;`
			);
		}

		console.log('Consulta de stock realizada. Rows -> ', rows)
		return [rows];
	}
	catch (err) {
		console.log("Error updating bill");
		console.log(err);
	}
	finally {
		conn.release();
	}
}

async function actualizarStatusPago(n_fac, status) {
	try {
		const [result] = await pool.query(
			`UPDATE facturas_ventas SET status = ? WHERE n_fac = ?`,
			[status, n_fac]
		);
		return result;
	} catch (err) {
		console.error("❌ Error al actualizar estado de pago:", err.message);
		throw err;
	}
}

async function actualizarStatusEnvio(n_fac, status) {
	try {
		const [result] = await pool.query(
			`UPDATE facturas_ventas SET env_stus = ? WHERE n_fac = ?`,
			[status, n_fac]
		);
		return result;
	} catch (err) {
		console.error("❌ Error al actualizar estado de envío:", err.message);
		throw err;
	}
}

async function getTickets() {
	try {
		const query = `
			SELECT 
				fv.id_fac,
				fv.n_fac,
				fv.total_compra,
				fv.fecha,
				fv.status,
				fv.met_pago,
				u.NOMBRE as nom_cl,
				u.ID_US as id_cl
			FROM 
				facturas_ventas fv
			JOIN 
				usuarios u ON fv.id_cl = u.ID_US
			ORDER BY 
				fv.fecha DESC;
		`;
		const [rows] = await pool.query(query);

		return rows;
	} catch (err) {
		console.error("Error al obtener todos los tickets:", err.message);
		throw err;
	}
}

async function getTicketById(id_fac, userId) {
	let conn = await getConn();
	try {
		let query = `
            SELECT f.*, d.id_prod, d.nbre_hist, d.cant_ticket, d.pcio_un_pgdo, d.subtotal, p.P_IMG
            FROM facturas_ventas f
            JOIN detalle_factura d ON f.id_fac = d.id_fac
            JOIN productos p ON d.id_prod = p.ID_PROD
            WHERE f.id_fac = ?
        `;
		let params = [id_fac];

		if (userId) {
			query += " AND f.id_cl = ?";
			params.push(userId);
		}

		const [pedido] = await conn.query(query, params);
		return [pedido];
	}
	catch (err) {
		console.log("Error updating bill");
		console.log(err);
	}
	finally {
		conn.release();
	}
}

async function getVentasTotalesProducto(nombre_id_producto) {
	try {
		const queryVentas = `
            SELECT 
                IFNULL(SUM(df.cant_ticket), 0) AS total_vendido
            FROM 
                detalle_factura df
            JOIN 
                facturas_ventas fv ON df.id_fac = fv.id_fac
            JOIN 
                productos p ON df.id_prod = p.ID_PROD
            WHERE 
                p.ID_PROD = ? OR p.P_TIPO = ?; 
        `;
		const [ventasRows] = await pool.query(queryVentas, [nombre_id_producto]);
		const stockRows = await getStockActual(nombre_id_producto);
		const totalVendido = ventasRows[0]?.total_vendido || 0;
		const stockActual = stockRows[0]?.stock || 0;
		const result = {
			producto: nombre_id_producto,
			total_vendido: Number(totalVendido),
			stock_actual: Number(stockActual)
		};

		console.log(`Reporte generado para ${nombre_id_producto}`);
		//return result;

	} catch (err) {
		console.error("Error en getVentasTotales:", err.message);
		//throw err;
	}

	/*tener en cuenta
	try {
		const query = `
			SELECT 
				IFNULL(SUM(df.cant_ticket), 0) AS unidades,
				IFNULL(SUM(df.subtotal), 0) AS recaudacion
			FROM detalle_factura df
			JOIN facturas_ventas fv ON df.id_fac = fv.id_fac
			JOIN productos p ON df.id_prod = p.ID_PROD
			WHERE p.P_TIPO = ?;
		`;

		const [rows] = await pool.query(query, [categoria]);

		return {
			categoria: categoria,
			unidades: Number(rows[0].unidades),
			recaudacion: Number(rows[0].recaudacion)
		};

	} catch (err) {
		console.error("Error al obtener ventas por categoría:", err);
		throw err;
	}*/

}
/*
async function guardarRemito(imagePath, nRemito) {
	let conn = await getConn();
	try {
		const sql = `UPDATE remitos SET PDF = '${imagePath}' WHERE N_REMITO = ${nRemito}`;
		const [result] = await conn.query(sql);

		if (result.affectedRows > 0) {
			console.log('Factura guardada');
			return result;
		} else {
			console.log('Error guardando factura');
			return null;
		}

	} catch (err) {
		console.log("Error saving invoice");
		console.log(err);
	}
	finally {
		conn.release();
	}
}*/

//cambiar
/*async function insertarEnFicha(conn, factura, producto) {
	console.log('insertando en ficha ', producto);
	const [rows] = await conn.query(
		`INSERT INTO ficha_stock_${producto.P_TIPO}s(
		f_fecha, tipo, n_factura, c_cantidad, v_cantidad, v_precio)
		VALUES (?,?,?,?,?, ?)`,
		[factura.fecha, 'duplicado', factura.nFactura, null, producto.P_CANTIDAD, producto.P_PRECIO]
	);
}*/

async function insertarImgPath(imagePath, id) {
	try {
		const conn = await getConn();
		const [rows] = await conn.query(
			`UPDATE productos SET p_img = ? WHERE id_prod = ?`,
			[imagePath, id]
		);
		console.log(rows);

		conn.release();
		return rows;
	} catch (err) {
		console.log("Error inserting image path");
		console.log(err);
	}
}

async function MontoPeriodo() {
	const conn = await getConn();
	try {
		const [montoPeriodo] = await conn.query(
			`SELECT SUM(total) as total_facturado 
			FROM facturas 
			WHERE fecha > '2024-06-30' AND fecha < '2025-07-30' AND tipo = 'duplicado';`
		);
		console.log(montoPeriodo)
		console.log('Periodo cargado.');
		return montoPeriodo[0].total_facturado;
	}
	catch (err) {
		console.log("Error getting total amount for the period");
		console.log(err);
	}
	finally {
		conn.release();
	}
}

async function ObtenerProductosPorCategoria(categoria) {
	try {
		console.log('Consultando productos por categoría.');
		let [rows] = await pool.query(
			`SELECT * FROM productos WHERE p_tipo LIKE '%${categoria}%'`);
		return [rows];
	}
	catch (err) {
		console.log("Error getting products by category");
		console.log(err);
	}
}

async function productosIndex() {
	let conn = await getConn();
	try {
		const [rows] = await conn.query(
			`SELECT * FROM productos ORDER BY p_precio ASC LIMIT 6`
		);
		return rows.map(row => new Producto(row).toClient());
	}
	catch (err) {
		console.log("Error getting top three products");
		console.log(err);
	}
	finally {
		conn.release();
	}
}

async function registrarVenta(factura) {
	const conn = await getConn();
	try {
		await conn.beginTransaction();
		const [facturaInsertada] = await conn.query(
			`INSERT INTO facturas_ventas(
			n_fac, id_cl,nombre_contacto, email_contacto, total_compra, met_pago, status) 
			VALUES (?, ?, ?, ?, ?, ?, ?);`,
			[factura.n_fac, factura.id_cl, factura.nbre_cto, factura.em_cto, factura.total, factura.met_pago, factura.status]
		);
		const id_fac = facturaInsertada.insertId;
		const n_fac = factura.n_fac;
		for (const producto of factura.detalle) {
			await conn.query(
				`INSERT INTO detalle_factura (
				id_fac, n_fac, id_prod, nbre_hist, cant_ticket, pcio_un_pgdo, subtotal) 
				VALUES (?,?,?,?,?,?,?)`, [
				id_fac,
				n_fac,
				producto.id,
				producto.nombre,
				producto.cantidad,
				producto.precio,
				producto.subtotal
			]);

			// Actualizar stock
			await conn.query(
				`UPDATE productos SET p_cantidad = p_cantidad - ? WHERE id_prod = ?`,
				[producto.cantidad, producto.id]
			);
		};
		console.log(`BBDD actualizada. \n`);
		await conn.commit();

		return ({ message: 'Venta registrada', n_fac: n_fac, success: true });

	} catch (err) {
		await conn.rollback();
		console.log("Error saving sell invoice");
		console.log(err);
	} finally {
		conn.release();
	}
}

async function deleteProduct(id) {
	const conn = await getConn();
	try {
		const [result] = await conn.query(`DELETE FROM productos WHERE id_prod = ?`, [id]);
		return result;
	} catch (err) {
		console.log("Error deleting product");
		console.log(err);
		throw err;
	} finally {
		conn.release();
	}
}

async function getProductById(id) {
	const conn = await getConn();
	try {
		const [rows] = await conn.query(`SELECT * FROM productos WHERE id_prod = ?`, [id]);
		return rows[0];
	} catch (err) {
		console.log("Error getting product by id");
		console.log(err);
		throw err;
	} finally {
		conn.release();
	}
}

async function updateProduct(id, product, imagePath) {
	const conn = await getConn();
	try {
		let query = `UPDATE productos SET p_tipo = ?, p_nombre = ?, p_marca = ?, p_descripcion = ?, p_precio = ?, p_pr_oferta = ?, p_cantidad = ?`;
		let params = [product.tipo, product.nombre, product.marca, product.descripcion, product.precio, product.oferta, product.stock];

		if (imagePath) {
			query += `, p_img = ?`;
			params.push(imagePath);
		}

		query += ` WHERE id_prod = ?`;
		params.push(id);

		const [result] = await conn.query(query, params);
		return result;
	} catch (err) {
		console.log("Error updating product");
		console.log(err);
		throw err;
	} finally {
		conn.release();
	}
}

export default {
	actualizarEstadoVenta,
	registrarVenta,
	getStockTotal,
	GenerarInforme,
	insertarImgPath,
	MontoPeriodo,
	getSuggestions,
	productosIndex,
	ObtenerProductosPorCategoria,
	ObtenerFiltrosPorCategoria,
	getProductsByQuery,
	getNFactura,
	getVentasTotales,
	getVentasTotalesProducto,
	getStockActual,
	AltaProductos,
	//guardarRemito,
	deleteProduct,
	getProductById,
	getTicketById,
	updateProduct,
	getTickets,
	actualizarStatusPago,
	actualizarStatusEnvio
};
