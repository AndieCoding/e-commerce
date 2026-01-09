import { getConn } from "./db.js";
import { Factura } from "../../public/js/models/factura.js";
import { Producto } from "../../public/js/models/producto.js";


async function AltaProductos(factura) {

	const mates = factura.productos.filter((producto) => { return producto.productType.includes('mate') });
	const termos = factura.productos.filter((producto) => { return producto.productType.includes('termo') });
	const yerbas = factura.productos.filter((producto) => { return producto.productType.includes('yerba') });
	let newProducts = [];
	const conn = await getConn();
	console.log('En la database')
	try {
		await conn.beginTransaction();


		if (mates.length > 0) {
			for (const producto of mates) {
				await conn.query(
					`INSERT INTO productos
					(p_tipo, p_nombre, p_marca, p_descripcion, p_img) 
					VALUES (?, ?, ?, ?, ?);`,
					[producto.productType, producto.productName, producto.marca, producto.descripcion, producto.image]
				);
				const [rows] = await conn.query(
					`SELECT * 
					FROM productos
					WHERE id_prod = LAST_INSERT_ID();`
				)
				newProducts.push(rows[0]);
				producto.id_prod = rows[0].ID_PROD;
			}
		};
		if (termos.length > 0) {
			for (const producto of termos) {

				await conn.query(
					`INSERT INTO productos
					(p_tipo, p_nombre, p_marca, p_descripcion, p_img) 
					VALUES (?, ?, ?, ?, ?);`,
					[producto.productType, producto.productName, producto.marca, producto.descripcion, producto.image]
				);
				const [rows] = await conn.query(
					`SELECT * 
					FROM productos
					WHERE id_prod = LAST_INSERT_ID();`
				)
				newProducts.push(rows[0]);
				producto.id_prod = rows[0];
			};

		}
		if (yerbas.length > 0) {
			for (const producto of yerbas) {

				await conn.query(
					`INSERT INTO productos
					(p_tipo, p_nombre, p_marca, p_descripcion, p_img) 
					VALUES (?, ?, ?, ?, ?);`,
					[producto.productType, producto.productName, producto.marca, producto.descripcion, producto.image]
				);
				const [rows] = await conn.query(
					`SELECT * 
					FROM productos
					WHERE id_prod = LAST_INSERT_ID();`
				)
				newProducts.push(rows[0]);
				producto.id_prod = rows[0].ID_PROD;
			}
		}

		console.log('array newProducts', newProducts);
		console.log(`Alta registrada en MySQL. \n`);
		await conn.commit();

		return [newProducts];

	} catch (err) {
		await conn.rollback();
		console.log("Error saving sell invoice");
		console.log(err);
	} finally {
		conn.release();
	}
}

async function cargarCompra(factura, conn) {
	await conn.query(
		`INSERT INTO facturas_compras (
			n_factura, c_cantidad, c_precio, id_prod) VALUES (?,?, ?,?)`, [
		factura.nFactura,
		producto.cantidad,
		producto.precio,
		producto.id_prod
	]);
}

async function DevolverFichaDeStock(product) {
	let conn = await getConn();
	try {
		const [ficha] = await conn.query(
			`SELECT  
				f.f_fecha AS fecha,
				f.tipo,
				f.n_factura,
				f.c_cantidad AS cantidad_compra,
				f.c_precio AS precio_compra,
				f.v_cantidad AS cantidad_venta,
				f.v_precio AS precio_venta,
				s.s_cantidad AS cantidades_stock,
				s.s_precio AS precio_stock,
				s.s_total AS total
				FROM ficha_stock_${product} f 
				INNER JOIN saldos_${product} s
				ON f.n_factura = s.n_factura
				ORDER BY f.f_fecha ASC`
		);
		console.log(ficha);
		console.log(`Registros de ${product} enviados.`);
		conn.release();
		return [ficha];

	} catch (err) {
		console.log("Error getting records");
		console.log(err);
	}
}

async function GenerarInforme(month) {
	let conn = await getConn();
	try {
		const [montoMensual] = await conn.query(
			`SELECT SUM(total) as total_facturado 
			FROM facturas 
			WHERE month(fecha) = ? AND tipo = 'duplicado';`,
			[month]
		);
		console.log('Informe cargado.');
		return [montoMensual];
	}
	catch (err) {
		console.log("Error updating bill");
		console.log(err);
	}
	finally {
		conn.release();
	}
}

async function getComprasUsuario(userId) {
	let conn = await getConn();
	try {
		const [rows] = await conn.query(
			`SELECT * 
			FROM compras_usuario			
			WHERE id_us = ?
			ORDER BY hora DESC`,
			[userId]
		);
		return [rows];
	} catch (err) {
		console.log("Error getting records");
		console.log(err);
	}
	finally {
		conn.release();
	}
}

async function getFichaFacturacion(mes) {
	let conn = await getConn();
	try {
		const sql =
			`SELECT DISTINCT
			f.fecha,
			f.n_factura, 
			f.total,
            c.fact_us AS link,
            r.pdf AS link_remito
		FROM facturas f
		LEFT JOIN compras_usuario c ON f.n_factura = c.n_factura
        JOIN remitos r ON f.N_FACTURA = r.N_FACTURA
        WHERE tipo = 'duplicado'  AND month(fecha) = 12 
		ORDER BY fecha DESC`;
		const [facturacion] = await conn.query(sql);
		return [facturacion];
	} catch (err) {
		console.log("Error getting records");
		console.log(err);
	}
	finally {
		conn.release();
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
			`SELECT DISTINCT N_FACTURA 
			FROM facturas WHERE tipo = 'duplicado' 
			ORDER BY N_FACTURA DESC LIMIT 1`
		);
		let n_factura = rows.length > 0 ? rows[0].N_FACTURA : 0;
		const [insertRemito] = await conn.query(
			`INSERT INTO remitos(N_FACTURA) VALUES (?);`, [n_factura + 1]
		);
		const [numeroRemitoRow] = await conn.query(`SELECT LAST_INSERT_ID() AS n_remito`);
		return {
			'n_factura': rows.length > 0 ? rows[0].N_FACTURA : null,
			'n_remito': numeroRemitoRow.length > 0 ? numeroRemitoRow[0].n_remito : null
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
			WHERE p_nombre LIKE '%${query}%' 
			OR p_marca LIKE '%${query}%' 
			OR p_descripcion LIKE '%${query}%'`,
			[query]
		);
		return [rows];
	} catch (err) {
		console.log("Error", err);
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

async function getVentasDiarias() {
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
}
async function getVentasAcumuladas(tipo) {
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
}

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

async function getVentasTotales(producto) {
	let conn = await getConn();
	try {
		const [ventasRows] = await conn.query(
			`SELECT  
				SUM(
					CASE 
						WHEN f.TIPO = 'duplicado' THEN fv.V_CANTIDAD            
					END
				) AS total_vendido
			FROM 
				facturas f    
			JOIN 
				facturas_ventas fv ON f.N_FACTURA = fv.N_FACTURA
			JOIN
				productos p ON fv.ID_PROD = p.ID_PROD AND p.P_TIPO = '${producto}';   
			`
		);
		console.log('Consulta de ventas totales de ', producto, ' realizada. Rows -> ', ventasRows);

		const [stockRows] = await getStockActual(producto);  // Await the result of getStockActual

		console.log('this is stock rows en database ing-egresos : ' + stockRows.length > 0 ? stockRows[0].stock : 0);
		// Extract stock and total sold values
		const totalVendido = ventasRows[0] ? ventasRows[0].total_vendido : 0;
		const stockActual = stockRows[0] ? stockRows[0].stock : 0;

		// Combine both values and return the result
		const result = {
			producto: producto,
			total_vendido: totalVendido,
			stock_actual: stockActual
		};

		console.log(result);

		return result;
	} catch (err) {
		console.log("Error updating bill");
		console.log(err);
	} finally {
		conn.release();
	}
}

async function guardarFactura(imagePath, userId, nfactura, factura) {
	let conn = await getConn();
	try {
		await conn.query(
			`INSERT INTO facturas(
			fecha, tipo, empresa, n_factura, total) 
			VALUES (?, ?, ?, ?, ?);`,
			[factura.fecha,
				'duplicado',
			factura.empresa,
			factura.nFactura,
			factura.total]
		);

		console.log(imagePath);
		const sql = `INSERT INTO compras_usuario (ID_US, FACT_US, N_FACTURA) VALUES ('${userId}', '${imagePath}', '${nfactura}')`;
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
}

async function guardarFacturaUsuarioSinCuenta(imagePath, formData) {
	let conn = await getConn();
	let data = formData;
	console.log('This is form in guardarFacturaUsuarioSinCuenta: ', data);
	try {
		const sql = `INSERT INTO facturas (FECHA, EMPRESA, TIPO, N_FACTURA, TOTAL, PDF) 
			VALUES ('${data.fecha}', '${data.empresa}', '${data.tipo}', '${data.nFactura}', '${data.total}', '${imagePath}')`;
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
}

async function guardarRemito(imagePath, nRemito) {
	let conn = await getConn();

	console.log('This is database guardarRemito. ');
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
}

async function insertarEnFicha(conn, factura, producto) {
	console.log('insertando en ficha ', producto);
	const [rows] = await conn.query(
		`INSERT INTO ficha_stock_${producto.P_TIPO}s(
		f_fecha, tipo, n_factura, c_cantidad, v_cantidad, v_precio)
		VALUES (?,?,?,?,?, ?)`,
		[factura.fecha, 'duplicado', factura.nFactura, null, producto.P_CANTIDAD, producto.P_PRECIO]
	);
}

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

async function Login(email, pass) {
	let conn = await getConn();
	try {
		const [rows] = await conn.query(
			`SELECT * FROM usuarios WHERE email =? AND pass =?`,
			[email, pass]
		);
		if (rows.length > 0) {
			console.log('Login successful');
			return rows[0];
		} else {
			console.log('Login failed');
			return null;
		}
	}
	catch (err) {
		console.log("Error logging in");
		console.log(err);
	}
	finally {
		conn.release();
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

async function ObtenerMarcas(categoria) {
	let conn = await getConn();
	try {
		const [rows] = await conn.query(
			`SELECT DISTINCT p_marca as marca 
			FROM productos
			WHERE p_nombre LIKE '%${categoria}%'`);
		return [rows];
	}
	catch (err) {
		console.log("Error getting brands");
		console.log(err);
	}
	finally {
		conn.release();
	}
}

async function ObtenerProductosPorCategoria(categoria, query) {
	let conn = await getConn();
	try {
		let rows = [];
		if (query === "" || query === null || query === undefined) {
			[rows] = await conn.query(`SELECT * FROM productos WHERE p_nombre LIKE '%${categoria}%'`);
			return [rows];
		}
		if (query !== "" && query.marca && query.price) {
			[rows] = await conn.query(
				`SELECT * FROM productos 
				WHERE p_nombre LIKE '%${categoria}%'
				AND p_marca LIKE '${query.marca}'
				AND ${query.price}`);
		} else if (query !== "" && query.price) {
			[rows] = await conn.query(
				`SELECT * FROM productos 
				WHERE p_nombre LIKE '%${categoria}%' 
				AND ${query.price}`);
		} else if (query !== "" && query.marca) {
			[rows] = await conn.query(
				`SELECT * FROM productos 
				WHERE p_nombre LIKE '%${categoria}%'
				AND p_marca LIKE '${query.marca}'`);
		}
		console.log("Query es: " + JSON.stringify(query));
		return [rows];

	}
	catch (err) {
		console.log("Error getting products by category");
		console.log(err);
	}
	finally {
		conn.release();
	}
}

async function ObtenerTresProductos() {
	let conn = await getConn();
	try {
		const [rows] = await conn.query(
			`SELECT DISTINCT * FROM productos ORDER BY p_precio ASC LIMIT 3`
		);
		return rows;
	}
	catch (err) {
		console.log("Error getting top three products");
		console.log(err);
	}
	finally {
		conn.release();
	}
}

async function RegistrarCompra(factura) {
	const termos = factura.productos.filter((producto) => { return producto.productType.includes('termo') });
	const mates = factura.productos.filter((producto) => { return producto.productType.includes('mate') });
	const yerbas = factura.productos.filter((producto) => { return producto.productType.includes('yerba') });
	let newProducts = [];
	const conn = await getConn();
	try {
		await conn.beginTransaction();
		await conn.query(
			`INSERT INTO facturas(
			fecha, tipo, empresa, n_factura, total) 
			VALUES (?, ?, ?, ?, ?);`,
			[factura.fecha,
				'original',
			factura.empresa,
			factura.nFactura,
			factura.total]
		);
		for (const producto of factura.productos) {
			if (producto.id_prod == null) { continue; }
			await conn.query(
				`INSERT INTO facturas_compras (
				n_factura, c_cantidad, c_precio, id_prod) VALUES (?,?, ?,?)`, [
				factura.nFactura,
				producto.cantidad,
				producto.precio,
				producto.id_prod
			]);
		};



		if (termos.length > 0) {
			for (const producto of termos) {

				if (producto.id_prod) {//actualizar existente
					await conn.query(
						`UPDATE productos 
						SET p_cantidad = p_cantidad + ${producto.cantidad}, p_precio = ?, pr_compra = ?
						WHERE id_prod = ?`,
						[producto.pr_vta, producto.precio, producto.id_prod]
					);
					prodActualizado = true;

				}
				await conn.query(
					`INSERT INTO ficha_stock_${producto.productType}s(
					f_fecha, tipo, n_factura, c_cantidad, c_precio, v_cantidad, v_precio)
					VALUES (?,?,?,?,?, ?, ?)`,
					[factura.fecha, 'original', factura.nFactura, producto.cantidad, producto.precio, null, null]
				);
			};
			const [stock] = await selectStock('termo', conn);
			if (stock.length < 1) {
				for (termo of termos) {
					await conn.query(
						`INSERT INTO saldos_termos(
					n_factura, s_cantidad, s_precio, s_total)
						VALUES (?,?,?,?)`,
						[factura.nFactura, termos.cantidad, termos.precio, termos.total]
					);
				}
			} else {
				for (const producto of stock) {
					try {
						await conn.query(
							`INSERT INTO saldos_termos(
						n_factura, s_cantidad, s_precio, s_total)
							VALUES (?,?,?,?)`,
							[factura.nFactura, producto.cantidad, producto.precio, producto.total]
						);
					} catch (err) {
						console.log(err);
					}
				};
			}
		}
		if (mates.length > 0) {
			for (const producto of mates) {

				if (producto.id_prod) {//actualizar existente
					await conn.query(
						`UPDATE productos 
						SET p_cantidad = p_cantidad + ${producto.cantidad}, p_precio = ?, pr_compra = ?
						WHERE id_prod = ?`,
						[producto.pr_vta, producto.precio, producto.id_prod]
					);

				}
				await conn.query(
					`INSERT INTO ficha_stock_mates(
					f_fecha, tipo, n_factura, c_cantidad, c_precio, v_cantidad, v_precio)
					VALUES (?,?,?,?,?, ?, ?)`,
					[factura.fecha, 'original', factura.nFactura, producto.cantidad, producto.precio, null, null]
				);
			};
			const [stock] = await selectStock('mate', conn);
			if (stock.length < 1) {
				for (mate of mates) {
					await conn.query(
						`INSERT INTO saldos_mates(
						n_factura, s_cantidad, s_precio, s_total)
							VALUES (?,?,?,?)`,
						[factura.nFactura, mate.cantidad, mate.precio, mate.total]
					);
				}
			} else {
				for (const producto of stock) {
					console.log('producto de stock ', producto);
					try {
						await conn.query(
							`INSERT INTO saldos_mates(
						n_factura, s_cantidad, s_precio, s_total)
							VALUES (?,?,?,?)`,
							[factura.nFactura, producto.cantidad, producto.precio, producto.total]
						);
					} catch (err) {
						console.log(err);
					}
				};
			}
		};
		if (yerbas.length > 0) {
			for (const producto of yerbas) {

				if (producto.id_prod) {//actualizar existente
					await conn.query(
						`UPDATE productos 
						SET p_cantidad = p_cantidad + ${producto.cantidad}, p_precio = ?, pr_compra = ?
						WHERE id_prod = ?`,
						[producto.pr_vta, producto.precio, producto.id_prod]
					);
					prodActualizado = true;

				}
				await conn.query(
					`INSERT INTO ficha_stock_${producto.productType}s(
					f_fecha, tipo, n_factura, c_cantidad, c_precio, v_cantidad, v_precio)
					VALUES (?,?,?,?,?, ?, ?)`,
					[factura.fecha, 'original', factura.nFactura, producto.cantidad, producto.precio, null, null]
				);
			};
			const [stock] = await selectStock('yerba', conn);
			if (stock.length < 1) {
				for (yerba of yerbas) {
					await conn.query(
						`INSERT INTO saldos_yerbas(
					n_factura, s_cantidad, s_precio, s_total)
						VALUES (?,?,?,?)`,
						[factura.nFactura, yerba.cantidad, yerba.precio, yerba.total]
					);
				}
			} else {
				for (const producto of stock) {
					try {
						await conn.query(
							`INSERT INTO saldos_yerbas(
						n_factura, s_cantidad, s_precio, s_total)
							VALUES (?,?,?,?)`,
							[factura.nFactura, producto.cantidad, producto.precio, producto.total]
						);
					} catch (err) {
						console.log(err);
					}
				};
			}
		}

		console.log('array newProducts', newProducts);
		console.log(`Compra registrada en la database. \n`);
		console.log('Numero de factura: ', factura.nFactura);
		await conn.commit();

		return [newProducts];

	} catch (err) {
		await conn.rollback();
		console.log("Error saving sell invoice");
		console.log(err);
	} finally {
		conn.release();
	}
}

async function registrarVenta(factura) {
	console.log(factura.productos)
	const termos = factura.productos.filter((producto) => { return producto.P_TIPO.includes('termo') });
	const mates = factura.productos.filter((producto) => { return producto.P_TIPO.includes('mate') });
	const yerbas = factura.productos.filter((producto) => { return producto.P_TIPO.includes('yerba') });
	const conn = await getConn();
	try {
		await conn.beginTransaction();

		for (const producto of factura.productos) {
			await conn.query(
				`INSERT INTO facturas_ventas (
				n_factura, v_cantidad, v_precio, id_prod) VALUES (?,?, ?,?)`, [
				factura.nFactura,
				producto.P_CANTIDAD,
				producto.P_PRECIO,
				producto.P_ID
			]);
		};

		if (termos.length > 0) {
			let cantidad_de_termos = 0;
			for (const producto of termos) {
				await insertarEnFicha(conn, factura, producto);
				console.log('Registrando venta en ficha de stock termos');
				cantidad_de_termos = cantidad_de_termos + producto.P_CANTIDAD;
			};
			const [stock] = await selectStock('termo', conn);
			for (const producto of stock) {
				try {
					await conn.query(
						`INSERT INTO saldos_termos(
						n_factura, s_cantidad, s_precio, s_total)
							VALUES (?,?,?,?)`,
						[factura.nFactura, producto.cantidad, producto.precio, producto.total]
					);
				} catch (err) {
					console.log(err);
				}
			};

		}
		if (mates.length > 0) {
			for (const producto of mates) {
				await insertarEnFicha(conn, factura, producto);
			};
			const [stock] = await selectStock('mate', conn);
			for (const producto of stock) {
				console.log('producto de stock ', producto);
				try {
					await conn.query(
						`INSERT INTO saldos_mates(
						n_factura, s_cantidad, s_precio, s_total)
							VALUES (?,?,?,?)`,
						[factura.nFactura, producto.cantidad, producto.precio, producto.total]
					);
				} catch (err) {
					console.log(err);
				}
			};
			//}
		};
		if (yerbas.length > 0) {
			for (const producto of yerbas) {
				await insertarEnFicha(conn, factura, producto);

			};
			const [stock] = await selectStock('yerba', conn);
			for (const producto of stock) {
				try {
					await conn.query(
						`INSERT INTO saldos_yerbas(
						n_factura, s_cantidad, s_precio, s_total)
							VALUES (?,?,?,?)`,
						[factura.nFactura, producto.cantidad, producto.precio, producto.total]
					);
				} catch (err) {
					console.log(err);
				}
			};
		}
		console.log(`Venta registrada. \n`);
		console.log('Numero de factura: ', factura.nFactura);
		await conn.commit();

		return ({ message: 'Venta registrada', success: true });

	} catch (err) {
		await conn.rollback();
		console.log("Error saving sell invoice");
		console.log(err);
	} finally {
		conn.release();
	}
}

async function RegistrarUsuario(user) {
	let conn = await getConn();
	try {
		console.log('Cargando datos en la base de datos : ', user);
		const [existentUser] = await conn.query(
			`SELECT * FROM usuarios WHERE email =?`,
			[user.EMAIL]
		);
		if (existentUser.length > 0) {
			console.log('Email existente. Cancelando registro');
			return { message: "El email ya existe", success: false };
		}
		const [result] = await conn.query(
			`INSERT INTO usuarios(
			nombre, 
			apellido, 
			domicilio,
			ciudad,
			email, 
			pass,
			dni
			) 
		 	VALUES ( ?, ?, ?, ?, ?, ?, ?)`, [
			user.NOMBRE,
			user.APELLIDO,
			user.DOMICILIO,
			user.CIUDAD,
			user.EMAIL,
			user.PASS,
			user.DNI
		]
		);
		console.log('Usuario registrado en la base de datos: ' + result);
		return result;
	}
	catch (err) {
		console.log("Error en la inserción de datos.");
		console.log(err);
	}
	finally {
		conn.release();
	}
}

async function selectStock(product, conn) {
	const [stock] = await conn.query(
		`SELECT p_tipo,p_precio as precio, 
		p_cantidad as cantidad,
		SUM(p_cantidad) OVER (PARTITION BY p_tipo) as total
		FROM productos
		WHERE p_tipo = '${product}' AND p_cantidad != 0
		GROUP BY p_tipo, p_precio, p_cantidad`
	);
	return [stock];
}

async function updateUserData(userId, data) {
	let conn = await getConn();
	try {
		let option = Object.keys(data)[0];
		const value = data[option];

		if (value === undefined || value === "") {
			console.log('Sin valores para actualizar')
			return;
		}

		if (option === 'PASSWORD') {
			option = 'PASS';
		}
		const [rows] = await conn.query(
			`UPDATE usuarios SET ${option} = ? WHERE ID_US = ?`, [
			value, userId
		]);

		console.log(`${option} updated`);
		return [rows];

		/*if (option === 'user') { 
				const [newUser] = await conn.query(
					`SELECT * FROM users WHERE user = ?`,
					[ value ]
				);
				return [newUser];
		}
		const [updatedData] = await conn.query(
			`SELECT * FROM users WHERE user = ?`,
			[ user ]
		);
		return [updatedData];*/
	} catch (err) {
		console.log("Update error", err);
	} finally {
		conn.release();
	}
}

export default {

	DevolverFichaDeStock,
	RegistrarCompra,
	registrarVenta,
	getStockTotal,
	GenerarInforme,
	MontoPeriodo,
	getSuggestions,
	ObtenerTresProductos,
	ObtenerProductosPorCategoria,
	RegistrarUsuario,
	Login,
	ObtenerMarcas,
	updateUserData,
	insertarImgPath,
	getProductsByQuery,
	guardarFactura,
	getComprasUsuario,
	getFichaFacturacion,
	getGananciasBrutas,
	getNFactura,
	getVentasDiarias,
	getVentasAcumuladas,
	getVentasTotales,
	getStockActual,
	AltaProductos,
	guardarFacturaUsuarioSinCuenta,
	guardarRemito
};
