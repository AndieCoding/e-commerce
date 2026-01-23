import { CartController } from './components/cart/cart-controller.js';
import { Carrito } from './components/cart/carrito.js';
import { Menu } from './components/navigation/menu.js';
import { AdminNav } from './components/navigation/admin-nav.js';
import { AdminMobileNavBar } from './components/navigation/admin-mobile-nav-bar.js';
import { Footer } from './components/navigation/footer.js';


function CalcularTotal(input) {
	const tr = input.getAttribute('tr');
	let cantidad = Number(document.querySelector(`#nuevaf-cantidad-${tr}`).value);
	let precio = Number(document.querySelector(`#nuevaf-precio-${tr}`).value);

	if (cantidad && precio) {
		let total = cantidad * precio;
		document.querySelector(`#nuevaf-total-${tr}`).value = total;
		document.querySelector(`#nuevaf-pr-sugerido-${tr}`).value = Math.round(precio * 1.4);
	}
}
function MostrarRespuesta(mensaje) {
	const divGuardar = document.querySelector('.guardar');

	const div = document.createElement('div');
	const span = document.createElement('span');
	span.textContent = mensaje.message;
	div.appendChild(span);
	divGuardar.appendChild(div);
	div.classList.add(mensaje.success ? 'ok-message' : 'error-message');

	setTimeout(() => {
		divGuardar.removeChild(div);
	}, 2500);
}

async function GuardarFactura() {
	let fecha = document.getElementById("nuevaf-fecha").value;
	let tipo = 'original';
	let empresa = document.getElementById("nuevaf-emp").value;
	let nFactura = document.getElementById("nuevaf-num").value;
	let total = document.getElementById("total-facturado").value;

	let tbody = document.querySelector('.tabla-carga-body').children;
	const productos = [];
	Array.from(tbody).forEach((element, index) => {
		console.log(element);
		if (element.children[1].children[0].value === "") { return };
		let fileInput = element.children[8].children[0];
		let obj_factura = {
			productType: document.getElementById(`nuevaf-tipo-${index + 1}`).value,
			productName: element.childNodes[1].childNodes[0].value,
			marca: element.childNodes[2].childNodes[0].value,
			descripcion: element.childNodes[3].childNodes[0].value,
			cantidad: element.childNodes[4].childNodes[0].value,
			precio: element.childNodes[5].childNodes[0].value,
			pr_vta: element.childNodes[6].childNodes[0].value,
			p_total: element.childNodes[7].childNodes[0].value,
			id_prod: element.childNodes[1].childNodes[1] ? element.childNodes[1].childNodes[1].value : null,
			product_image: element.childNodes[1].childNodes[1] ? null : document.querySelector(`tr[tr='${index + 1}'] input[type="file"]`).files[0]
		};
		console.log(obj_factura);
		productos.push(obj_factura);
		console.log(productos)
	});

	const formData = new FormData();
	formData.append("fecha", fecha);
	formData.append("empresa", empresa);
	formData.append("tipo", tipo);
	formData.append("nFactura", nFactura);
	formData.append('total', productos.reduce((total, producto) => {
		const p = Number(producto.p_total)
		return total + p
	}, 0));
	formData.append("productos", JSON.stringify(productos));
	productos.forEach((producto, index) => {
		if (producto.product_image) {
			formData.append(`product_image`, producto.product_image); // Add images to formData
		}
	});/*
	if (obj_factura.id === null) {
		formData.append("marca", obj_factura.marca);
		formData.append("descripcion", obj_factura.descripcion);
		formData.append("product-image", fileInput.files[0]); 
	}*/

	;
	try {
		const response = await fetch(`/api/images`, {
			method: "POST",
			body: formData
		})
		const data = await response.json();
		MostrarRespuesta(data);
		//document.getElementById("nfacturaForm").reset();
	}
	catch (error) {
		console.error("Error submitting form: " + error);
	}
}


document.addEventListener("DOMContentLoaded", function () {

	cargarCampos();

	const form = document.forms["nfacturaForm"];
	const inputs = form.elements;
	const submitBtn = document.querySelector('.formButton.enviar');

	function isCompleted() {
		const isCompleted = Array.from(inputs).every(input => {
			if (input.type === "file" || input.closest('.tabla-carga-body')) {
				return true; // Check if file is selected
			} else {
				return input.value.trim() !== ""; // Check if input is not empty
			}
		})
		submitBtn.disabled = !isCompleted;
	}

	Array.from(inputs).forEach(input => {
		input.addEventListener('input', isCompleted);
		input.addEventListener('change', isCompleted);
	});

	submitBtn.addEventListener('click', GuardarFactura);
	let inputEmpresa = document.querySelector('#nuevaf-emp').addEventListener("keyup", function () { getSuggestions(this) });
});
