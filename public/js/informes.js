import { ProductChart } from './components/admin/product-chart.js';

const body = document.querySelector(".body-informes");
const selectMes = document.querySelector("#select-impuestos-mes");
const td = document.querySelector("#total-facturado");
const td_ingresos = document.querySelector("#ingresos-pagar");
const td_dri = document.querySelector("#dri-pagar");
const td_periodo = document.querySelector("#total-periodo");
const td_categoria = document.querySelector("#categoria");
//const select = document.querySelector("#select-producto");
const checkbox_todas = document.querySelector('#checkbox-facturas');

/*function cargarSelect() {	
	const values = [		
		{
			name: "TODAS",
		}
	];
	values.forEach(
		(value) => {
			const option = document.createElement('option');
			option.textContent = value.name;
			option.value = value.name.toLowerCase();
			select.appendChild(option);
	});	
}*/

document.addEventListener("turbo:load", () => {

	const informes_container = document.querySelector("#informes-container");
	if (informes_container) {
		crearGraficos();
	}
	selectMes.onchange = async function () {
		try {
			const response = await fetch(`/api/informes/${this.value}`)
			const data = await response.json();
			console.log(data);
			const total_facturado = data.montoMensual[0].total_facturado;
			td.innerText = total_facturado
			const monto_ing_brutos = (total_facturado * 2.76) / 100;
			td_ingresos.innerText = monto_ing_brutos < 4000 ? 4000 : monto_ing_brutos.toFixed(2);
			document.querySelector('#gastos-ingresos-brutos').value = monto_ing_brutos < 4000 ? 4000 : monto_ing_brutos.toFixed(2);
			const monto_dri = (total_facturado * 0.63) / 100;
			td_dri.innerText = monto_ing_brutos < 3200 ? 3200 : monto_dri.toFixed(2);
			document.querySelector('#gastos-dri').value = monto_ing_brutos < 3200 ? 3200 : monto_dri.toFixed(2);
			console.clear();
			limpiarTabla();
			setTimeout(() => {
				llamarRegistros(this.value)
			}, 500);
		} catch (err) {
			throw Error
		}
	};
	const $tabla_facturas = document.querySelector("#body-facturas");
	if ($tabla_facturas) {
		checkbox_todas.addEventListener('change', function () {
			console.clear();
			limpiarTabla();
			setTimeout(() => {
				llamarRegistros(this.value)
			}, 500);
		});
	}
	function limpiarTabla() {
		const tabla = document.querySelector("#body-facturas");
		while (tabla.firstChild) {
			tabla.removeChild(tabla.firstChild);
		}
	}
	//Por ahora son todas "facturas"
	async function llamarRegistros(mes) {
		let response, error;
		try {
			response = await fetch(`/api/Ficha/facturacion?mes=${mes}`);
		} catch (err) {
			error = err;
		}
		if (error) {
			console.error(error);
			return;
		}
		const data = await response.json();

		let id_fila = 0;
		console.log(data);
		data.facturacion.forEach((factura) => {
			console.log("Cargada la fila Nº ", id_fila + 1);
			let columna = 0;
			id_fila++;

			const new_row = document.createElement("tr");
			new_row.classList.add(`fila${id_fila}`);

			for (let i = 1; i < 6; i++) {
				const td = document.createElement("td");
				columna++;

				switch (i) {
					case 1:
						td.innerHTML += `<input type="date" name="fecha${id_fila},${columna}" value="${factura.fecha.slice(0, 10)}" disabled />`;
						break;
					case 2:
						td.innerHTML += `<input type="number" name="factura${id_fila},${columna}" value="${factura.n_factura}" disabled /></td>`;
						break;
					case 3:
						td.innerHTML = `<p class="total${factura.n_factura}">${factura.total}</p>`;
						break;
					case 4:
						td.innerHTML = `<a href='${factura.link}' target='_blank' class="link${factura.n_factura}"> Ver </a>`;
						break;
					case 5:
						td.innerHTML = `<a href='${factura.link_remito}' target='_blank' class="link${factura.n_factura}"> Ver </a>`;
						break;
				}

				new_row.appendChild(td);
			}
			$tabla_facturas.appendChild(new_row);
		});
		console.log("Data fetched from server");
	};
	async function fetchTo(url) {
		const response = await fetch(url);
		let data = await response.json();
		return data;
	}
	//tipo
	async function crearGraficos() {
		//const LineChart = document.getElementById('myLineChart');
		//let stockData = await fetchTo(`/api/stockActual`);
		//let gananciasBrutasData = await fetchTo(`/api/ganancias-brutas`);
		//let ganancias_brutas = gananciasBrutasData.ventas_totales;
		//document.querySelector('#ganancias-brutas-valor').innerText = '$ ' + ganancias_brutas;

		/*let button = document.querySelector('#calcula-ganancias');
		if (button) {
			button.addEventListener('click', () => {
				let p_ganancias_netas = document.querySelector('#ganancias-netas-valor');
				p_ganancias_netas.innerText = '$ ' + Math.floor(calcularGanancias());
				p_ganancias_netas.style.display = 'block';
			});
		}

		const productos_stock = ['Termo', 'Mate', 'Yerba'];
		for (let product of productos_stock) {
			let ventasDiariasData = await fetchTo(`/api/ventasDiarias/${product}`);
			let ingresos_egresosData = await fetchTo(`/api/ingresos-egresos?prod=${product}`);
			const fechas = ventasDiariasData.map(day => day.FECHA.split('T')[0]);
			const total_diario = ventasDiariasData.map(day => day.total_acumulado);
			const productChart = document.getElementById(`${product}VentasDiariasChart`);
			const IngresosEgresosChart = document.getElementById(`${product}Ing-EgresosChart`);
			let color = '';
			switch (product) {
				case 'Mate': color = '#025811b3'; break;
				case 'Termo': color = '#f5cf5ed9'; break;
				case 'Yerba': color = '#582e02c7'; break;
			}
			//vtas diarias
			crearGrafico(productChart, 'line', product, fechas, total_diario, [color]);
			//mov de productos
			crearGrafico(IngresosEgresosChart, 'bar', product, ['Ingresos', 'Egresos'], [ingresos_egresosData.stock_actual, ingresos_egresosData.total_vendido], ['#316767', '#025811b3']);
		}
		const fechas = data.map(day => day.fecha);
		const total_diario = data.map(day => day.total_diario);
		const stock = productos_stock.map(label => {
			const product = stockData.find(item => item.producto.toUpperCase() === label.toUpperCase());
			return product ? product.stock : 0;
		});
		//vtas totales
		crearGrafico(LineChart, 'line', 'Ventas Totales', fechas, total_diario, ['#025811b3']);
		//stock
		crearGrafico(BarChart, 'bar', 'Stock', productos_stock, stock, ['#f5cf5ed9', '#025811b3', '#582e02c7']);
		*/
	}
});

const calcularGanancias = () => {
	let luz = document.querySelector('#luz').value;
	let alquiler = document.querySelector('#alquiler').value;
	let otros = document.querySelector('#otros').value;
	let impuesto_ganancias_brutas = document.querySelector('#gastos-ingresos-brutos').value;
	let impuesto_dri = document.querySelector('#gastos-dri').value;

	if (impuesto_ganancias_brutas == "") {
		return;
	}
	if (impuesto_dri == "") {
		return;
	}

	return ganancias_netas = ganancias_brutas - luz - alquiler - otros - impuesto_ganancias_brutas;
}

function crearGrafico(contenedor, tipo_grafico, product, labels, data, colors) {
	let stockChart = document.createElement('product-chart');
	stockChart.setAttribute('type', tipo_grafico);
	stockChart.setAttribute('product', product);
	stockChart.labels = labels;
	stockChart.data = data;
	stockChart.colors = colors;
	contenedor.appendChild(stockChart);
}