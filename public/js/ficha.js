import { CartController } from './components/cart/cart-controller.js';
import { Carrito } from './components/cart/carrito.js';
import { Menu } from './components/navigation/menu.js';
import { AdminNav } from './components/navigation/admin-nav.js';
import { AdminMobileNavBar } from './components/navigation/admin-mobile-nav-bar.js';
import { Footer } from './components/navigation/footer.js'

function cargarSelect() {
	const select = document.querySelector("#select-producto");
	const values = [
		{
			name: "MATES",
		},
		{
			name: "TERMOS",
		},
		{
			name: "YERBAS",
		},
	];
	values.forEach(
		(value) => {
			const option = document.createElement('option');
			option.textContent = value.name;
			option.value = value.name.toLowerCase();
			select.appendChild(option);
		});
}

function limpiarTabla() {
	const tabla = document.querySelector("tbody");
	while (tabla.firstChild) {
		tabla.removeChild(tabla.firstChild);
	}
}

document.addEventListener("DOMContentLoaded", function () {
	const select = document.querySelector("select[name='lista']");
	const fecha_body = document.querySelector("#fecha tbody");
	const bodys = Array.from(document.querySelectorAll("tbody"));
	bodys.shift()
	cargarSelect();

	select.onchange = function () {
		console.clear();
		limpiarTabla();
		setTimeout(() => { llamarRegistros(this.value) }, 500);
	};

	async function llamarRegistros(product) {
		const response = await fetch(`/api/Ficha/${product}`);
		const data = await response.json();

		let id_fila = 0;
		let antigua_factura = 0;
		let precioAnterior = null;
		let cantidadAnterior = null;
		let nuevaCantidad;
		let nuevoPrecio;
		let precioCompraAnterior = [];
		let precioVtaAnterior = [];
		data.ficha.forEach((factura) => {
			console.log("Cargada la fila Nº ", id_fila + 1);

			let nuevo_nFactura = factura.n_factura;
			let mismaFactura = nuevo_nFactura === antigua_factura ? true : false;
			let columna = 0;
			const factura_de_compra = factura.tipo === "original" ? true : false;

			console.log('esto es la factura ', factura);
			if (mismaFactura) {


				nuevaCantidad = factura.cantidades_stock;
				nuevoPrecio = factura.precio_stock;

				if (nuevoPrecio !== precioAnterior) {
					const li = document.createElement("li");
					li.textContent = nuevaCantidad;
					document.querySelector(`.s-cantidad${factura.n_factura}`).appendChild(li);
					cantidadAnterior = nuevaCantidad;

					const li_prec = document.createElement("li");
					li_prec.textContent = factura.precio_stock;
					document.querySelector(`.s-precio${factura.n_factura}`).appendChild(li_prec);
					precioAnterior = nuevoPrecio;


				}

				document.querySelector(`.total${factura.n_factura}`).textContent = factura.total

				if (factura_de_compra) {
					if (!precioCompraAnterior.includes(factura.precio_compra)) {
						const li_prec = document.createElement("li");
						li_prec.textContent = factura.precio_compra;
						document.querySelector(`.c-precio${factura.n_factura}`).appendChild(li_prec);
						precioCompraAnterior.push(factura.precio_compra);

						const li_cant = document.createElement("li");
						li_cant.textContent = factura.cantidad_compra;
						document.querySelector(`.c-cantidad${factura.n_factura}`).appendChild(li_cant);
					}
				} else {
					if (!precioVtaAnterior.includes(factura.precio_venta)) {
						const li_prec = document.createElement("li");
						li_prec.textContent = factura.precio_venta;
						document.querySelector(`.v-precio${factura.n_factura}`).appendChild(li_prec);
						precioVtaAnterior.push(factura.precio_venta);

						const li_cant = document.createElement("li");
						li_cant.textContent = factura.cantidad_venta;
						document.querySelector(`.v-cantidad${factura.n_factura}`).appendChild(li_cant);

					}
				}

			} else {
				precioCompraAnterior = [];
				precioVtaAnterior = [];
				id_fila++;
				const new_row = document.createElement("tr");
				new_row.classList.add(`fila${id_fila}`);

				for (let i = 1; i < 13; i++) {
					const td = document.createElement("td");
					columna++;
					switch (i) {
						case 1:
							td.innerHTML += `<input type="date" name="fecha${id_fila},${columna}" value="${factura.fecha.slice(0, 10)}" disabled />`;
							break;
						case 2:
							td.innerHTML += `<input value='${factura.tipo.toUpperCase()}' name='${id_fila},${columna}' disabled>`;
							break;
						case 3:
							td.innerHTML += `<input type="number" name="factura${id_fila},${columna}" value="${factura.n_factura}" disabled /></td>`;
							break;
						case 4:
							if (!factura_de_compra) { break; }
							const c_cantidad = document.createElement("ul");
							c_cantidad.classList.add(`c-cantidad${factura.n_factura}`);
							let li_c_cantidad = document.createElement('li');
							li_c_cantidad.textContent = factura.cantidad_compra;
							c_cantidad.appendChild(li_c_cantidad);
							td.appendChild(c_cantidad);
							break;
						case 5:
							if (!factura_de_compra) { break; }
							const c_precio = document.createElement("ul");
							c_precio.classList.add(`c-precio${factura.n_factura}`);
							let li_c_precio = document.createElement('li');
							li_c_precio.textContent = factura.precio_compra;
							c_precio.appendChild(li_c_precio);
							td.appendChild(c_precio);
							break;
						case 6:
							if (!factura_de_compra) { break; }
							td.innerHTML += `<input name="total${id_fila},${columna}" type="number" disabled value="${factura_de_compra ? factura.cantidad_compra * factura.precio_compra : ""}" />`;
							break;
						case 7:
							if (factura_de_compra) { break; }
							const v_cantidad = document.createElement("ul");
							v_cantidad.classList.add(`v-cantidad${factura.n_factura}`);
							let li_v_cantidad = document.createElement('li');
							li_v_cantidad.textContent = factura.cantidad_venta;
							v_cantidad.appendChild(li_v_cantidad);
							td.appendChild(v_cantidad);


							//td.innerHTML += `<input name="v-cantidad${id_fila},${columna}" type="number" value="${
							//	factura_de_compra ? "" : factura.cantidad_venta}" disabled />`;
							break;
						case 8:
							if (factura_de_compra) { break; }
							const v_precio = document.createElement("ul");
							v_precio.classList.add(`v-precio${factura.n_factura}`);
							let li_v_precio = document.createElement('li');
							li_v_precio.textContent = factura.precio_venta;
							v_precio.appendChild(li_v_precio);
							td.appendChild(v_precio);
							//td.innerHTML += `<input name="v-precio-unitario${id_fila},${columna}" type="number" value="${
							//	factura_de_compra ? "" : factura.precio_venta}" disabled />`;
							break;
						case 9:
							if (factura_de_compra) { break; }
							td.innerHTML += `<input name="v-total${id_fila},${columna}" type="number" value="${factura_de_compra ? "" : factura.cantidad_venta * factura.precio_venta}" disabled />`;
							break;
						case 10:
							const ul = document.createElement("ul");
							ul.classList.add(`s-cantidad${factura.n_factura}`);
							let li = document.createElement('li');
							li.textContent = factura.cantidades_stock === 0 ? "" : factura.cantidades_stock;
							cantidadAnterior = factura.cantidades_stock;
							ul.appendChild(li);
							td.appendChild(ul);

							break;
						case 11:
							const ul_prec = document.createElement("ul");
							ul_prec.classList.add(`s-precio${factura.n_factura}`);
							let li_prec = document.createElement('li');
							li_prec.textContent = factura.cantidades_stock === 0 ? "" : factura.precio_stock;
							precioAnterior = factura.precio_stock;
							ul_prec.appendChild(li_prec);
							td.appendChild(ul_prec);
							break;
						case 12:
							td.innerHTML = `<p class="total${factura.n_factura}">${factura.total === 0 ? 0 : factura.total}</p>`;
							break;
							//case 11:
							/*
							td.innerHTML = `
							<div onclick="Borrar(${id_fila})" class="flex align-end justify-end">
								<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 icon">
									<path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
								</svg>
							</div>`;
							td.style.textAlign = "end";*/
							break;
					}

					new_row.appendChild(td);
					fecha_body.appendChild(new_row);
				}
			}
			antigua_factura = nuevo_nFactura;
			if (factura_de_compra) { precioCompraAnterior.push(factura.precio_compra); }
			else { precioVtaAnterior.push(factura.precio_venta); }
		});
		console.log("Data fetched from server");
	};
});

