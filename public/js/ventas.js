import { CartController } from './components/cart/cart-controller.js';
import { Carrito } from './components/cart/carrito.js';
import { Menu } from './components/navigation/menu.js';
import { AdminNav } from './components/navigation/admin-nav.js';
import { Footer } from './components/navigation/footer.js';
import { ModalAgradecimiento } from './components/user/modal-agradecimiento.js';



document.addEventListener('facturaCargada', () => {
	document.querySelector('factura-del-mate').style.display = 'block';
	console.log('Factura cargada, a punto de enviar evento guardar')
	document.dispatchEvent(new CustomEvent('guardarFactura', {
		detail: {
			detail: document.querySelector('factura-del-mate'),
			origen: 'sistema'
		}
	}));
	document.querySelector('factura-del-mate').style.display = 'none';
	document.body.appendChild(document.createElement('modal-agradecimiento'));
});

function CalcularTotal(input) {
	const tr = input.getAttribute('tr');
	let cantidad = Number(document.querySelector(`#nuevaf-cantidad-${tr}`).value);
	let precio = Number(document.querySelector(`#nuevaf-pr-sugerido-${tr}`).value);

	if (cantidad && precio) {
		let total = cantidad * precio;
		document.querySelector(`#nuevaf-total-${tr}`).value = total;
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
	let tipo = 'duplicado';
	let cliente = document.getElementById("nuevaf-cte").value;
	let domicilio = document.getElementById("nuevaf-dom").value;
	let localidad = document.getElementById("nuevaf-loc").value;

	let tbody = document.querySelector('.tabla-carga-body').children;
	const productos = [];
	let totalAcumulado = 0;
	Array.from(tbody).forEach((element, index) => {
		console.log(element);
		if (
			element.children[4].children[0].value == "",
			element.children[3].children[0].value == "",
			element.children[2].children[0].value == "",
			element.children[1].children[0].value == ""
		) { return };
		let obj_factura = {
			P_TIPO: document.getElementById(`nuevaf-tipo-${index + 1}`).value,
			productName: element.childNodes[1].childNodes[0].value,
			marca: element.childNodes[2].childNodes[0].value,
			P_DESCRIPCION: element.childNodes[3].childNodes[0].value,
			P_CANTIDAD: element.childNodes[4].childNodes[0].value,
			precio: element.childNodes[5].childNodes[0].value,
			P_PRECIO: element.childNodes[6].childNodes[0].value,
			p_total: parseInt(element.childNodes[7].childNodes[0].value),
			P_ID: element.childNodes[1].childNodes[1] ? element.childNodes[1].childNodes[1].value : null,
		};
		totalAcumulado = parseInt(totalAcumulado) + parseInt(element.childNodes[7].childNodes[0].value);
		console.log(obj_factura);
		productos.push(obj_factura);
		console.log(productos)
	});

	const formData = new FormData();
	let paymentData = {
		senior: cliente,
		domicilio: domicilio,
		localidad: localidad,
		condicion_vta: 'contado',
		total: totalAcumulado
	};

	document.dispatchEvent(new CustomEvent('pagoConfirmado', {
		detail: {
			products: productos,
			client: paymentData
		}
	}));

	/*
		try 
		{
			const response = await fetch(`http://localhost:3000/api/registrarVenta`, {
				method: "POST",
				body: formData
			})
			const data = await response.json();					
			MostrarRespuesta(data);							
			//document.getElementById("nfacturaForm").reset();
		} 
		catch (error) 
		{
			console.error("Error submitting form: " + error);
		}*/
}

async function completadoAutomatico(item, row) {
	const $select = document.querySelector(`select#nuevaf-tipo-${row}`);
	const input = document.querySelector(`input#nuevaf-nombre-${row}`);
	const $inputMarca = document.querySelector(`input#nuevaf-marca-${row}`);
	let textArea = document.querySelector(`textarea[tr="${row}"]`);
	let $actualRow = document.querySelector(`tr[tr="${row}"]`)
	let imagePreview = document.querySelector('.preview');
	let image = document.createElement('img');
	let inputFile = document.querySelector(`#nuevaf-imagen-${row}`);
	let $stock = document.querySelector(`#nuevaf-stock-${row}`);
	let $precio_vta = document.querySelector(`#nuevaf-pr-sugerido-${row}`);
	let $precio = document.querySelector(`#nuevaf-precio-${row}`);

	$select.value = item.tipo;
	input.value = item.nombre;
	const id = document.createElement('input');
	id.type = 'hidden';
	id.name = 'id';
	id.value = item.id;
	input.parentElement.appendChild(id);
	$inputMarca.value = item.marca;
	textArea.value = item.descripcion;
	$precio_vta.value = item.precio_vta;
	$precio.value = item.precio;
	image.src = item.imagen;
	image.classList.add('preview');
	inputFile.replaceWith(image);
	$stock.value = item.stock;
	document.querySelector('.suggestions').remove();
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
});
