import {Menu} from './components/navigation/menu.js';
import { AdminNav } from './components/navigation/admin-nav.js';
import { Footer } from './components/navigation/footer.js';
import {CartController} from './components/cart/cart-controller.js';
import {Carrito} from './components/cart/carrito.js';

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

document.addEventListener("DOMContentLoaded", () => {
	crearGraficos();
	selectMes.onchange = async function () {
		try {
		const response = await fetch(`http://localhost:3000/api/Informes/${this.value}`)
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

	fetch("http://localhost:3000/api/Periodo")
		.then((response) => response.json())
		.then((data) => {
			console.log(data);
			const valor_anual = data.total_facturado;
			td_periodo.innerText = valor_anual;
			
			if (valor_anual < 2108288) {
				td_categoria.innerText = "A";
			} else if (valor_anual < 3133942) {
				td_categoria.innerText = "B";
			} else if (valor_anual < 4387518) {
				td_categoria.innerText = "C";
			} else if (valor_anual < 5449095) {
				td_categoria.innerText = "D";
			} else if (valor_anual < 6416529) {
				td_categoria.innerText = "E";
			} else if (valor_anual < 8020661) {
				td_categoria.innerText = "F";
			} else if (valor_anual < 9624793) {
				td_categoria.innerText = "G";
			} else if (valor_anual < 11916410) {
				td_categoria.innerText = "H";
			} else if (valor_anual < 13337213) {
				td_categoria.innerText = "I";
			} else if (valor_anual < 15285088) {
				td_categoria.innerText = "J";
			} else if (valor_anual < 16957969) {
				td_categoria.innerText = "K";
			}
		});

		//facturacion
		const $tabla_facturas = document.querySelector("#body-facturas");
		//cargarSelect();
					
		checkbox_todas.addEventListener('change', function() { 
			console.clear();
			limpiarTabla();		
			setTimeout(() => { 
				llamarRegistros(this.value) 
			}, 500);							
		});	
		function limpiarTabla() {
			const tabla = document.querySelector("#body-facturas");
			while (tabla.firstChild) {
				tabla.removeChild(tabla.firstChild);
			}
		}
	
		async function llamarRegistros(mes) {
			console.log(mes);
			//Por ahora son todas "facturas"
			let response, error;
			try {
				response = await fetch(`http://localhost:3000/api/Ficha/facturacion?mes=${mes}`);	
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
							td.innerHTML += `<input type="date" name="fecha${id_fila},${columna}" value="${factura.fecha.slice(0,10)}" disabled />`;
							break;
						case 2:
							td.innerHTML += `<input type="number" name="factura${id_fila},${columna}" value="${factura.n_factura}" disabled /></td>`;
							break;
						case 3:
							td.innerHTML = `<p class="total${factura.n_factura}">${factura.total}</p>`;
							break;
						case 4:
							td.innerHTML = `<a href='http://localhost:3000/${factura.link}' target='_blank' class="link${factura.n_factura}"> Ver </a>`;
							break;
						case 5:
							td.innerHTML = `<a href='http://localhost:3000/${factura.link_remito}' target='_blank' class="link${factura.n_factura}"> Ver </a>`;
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
			const LineChart = document.getElementById('myLineChart');
			const BarChart = document.getElementById('myBarChart');
			

			let data = await fetchTo(`/api/ventasDiarias`);
			let stockData = await fetchTo(`/api/stockActual`);
			let gananciasBrutasData = await fetchTo(`/api/ganancias-brutas`);
			let ganancias_brutas = gananciasBrutasData.ventas_totales;
			document.querySelector('#ganancias-brutas-valor').innerText = '$ ' + ganancias_brutas;			

			let button = document.querySelector('#calcula-ganancias');
			button.addEventListener('click', function() {
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

				let ganancias_netas = ganancias_brutas - luz - alquiler - otros - impuesto_ganancias_brutas;

				let p_ganancias_netas = document.querySelector('#ganancias-netas-valor');
				p_ganancias_netas.innerText = '$ ' + Math.floor(ganancias_netas);
				p_ganancias_netas.style.display = 'block';
			})

			const productos_stock = ['Termo', 'Mate', 'Yerba'];
			for (let product of productos_stock) {
				let ventasDiariasData = await fetchTo(`/api/ventasDiarias/${product}`);
				let ingresos_egresosData = await fetchTo(`/api/ingresos-egresos?prod=${product}`);
				console.log('This is ingresos-egresosData in client side ',ingresos_egresosData)

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

				new Chart(productChart, {
					type: 'line',
					data: {
						labels: fechas,
						datasets: [{
							label: `Ventas de ${product}`,
							data: total_diario,
							fill: false,
							borderColor: `${color}`,
							tension: 0.1
						}]
					},
					options: {
					responsive: true,
					scales: {
						x: {
						title: {
							display: true,
							text: 'Días', // X-axis label (Days)
						}
						},
						y: {
						title: {
							display: true,
							text: 'Ventas totales' // Y-axis label (Quantity sold)
						},
						beginAtZero: true, 
						ticks: {
							stepSize: 1,
							callback: function(value) {
								return Math.round(value);
							}
						}
						}
					}
					}
				})

				new Chart(IngresosEgresosChart, {
					type: 'bar',
					data: {
						labels: ['Ingresos','Egresos'],
						datasets: [{
							label: 'Movimiento de ' + product,
							data: [ingresos_egresosData.stock_actual, ingresos_egresosData.total_vendido],
							borderWidth: 2,
							backgroundColor: [
								'#316767',
								'#025811b3'
							],
						}]
					},
					options: {
						scales: {
							y: {
								beginAtZero: true,
								ticks: {
									stepSize: 1,
									callback: function(value) {
										return Math.round(value);
									}
								}
							}
						}
					}
				});
			}
			const fechas = data.map(day => day.fecha);
			const total_diario = data.map(day => day.total_diario);

			
			const stock = productos_stock.map(label => {
				const product = stockData.find(item => item.producto.toUpperCase() === label.toUpperCase());
				return product ? product.stock : 0; // Default to 0 if not found
			});
			
			new Chart(LineChart, {
				type: 'line',
				data: {
					labels: fechas,
					datasets: [{
						label: 'Ventas Totales',
						data: total_diario,
						fill: false,
						borderColor: 'rgb(75, 192, 192)',
						tension: 0.1
					}]
				},
				options: {
				responsive: true,
				scales: {
					x: {
					title: {
						display: true,
						text: 'Días', // X-axis label (Days)
					}
					},
					y: {
					title: {
						display: true,
						text: 'Ventas totales' // Y-axis label (Quantity sold)
					},
					beginAtZero: true, // Ensures the Y-axis starts from 0
					}
				}
				}
			})

			new Chart(BarChart, {
			type: 'bar',
			data: {
				labels: productos_stock,
				datasets: [{
					label: 'Stock',
					data: stock,
					borderWidth: 2,
					backgroundColor: [
						'#f5cf5ed9',
						'#025811b3',
						'#582e02c7'
					],
				}]
			},
			options: {
				scales: {
				y: {
					beginAtZero: true
				}
				}
			}
			});
		}	
});
