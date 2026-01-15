import { CartController } from './components/cart/cart-controller.js';
import { Carrito } from './components/cart/carrito.js';
import { Menu } from './components/navigation/menu.js';
import { AdminNav } from './components/navigation/admin-nav.js';
import { Footer } from './components/navigation/footer.js';
import { Producto } from './models/producto.js';

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
	const form = document.querySelector('#nfacturaForm');

	const tipo = document.getElementById('tipo').value;
	const nombre = document.getElementById('nombre').value;
	const marca = document.getElementById('marca').value;
	const descripcion = document.getElementById('descripcion').value;
	const imagenInput = document.getElementById('imagen');

	const precio = document.getElementById('precio').value;
	const oferta = document.getElementById('oferta').value || 0;
	const stock = document.getElementById('stock').value;

	if (tipo === "" || nombre.trim() === "" || marca.trim() === "" || precio === "" || stock === "" || !imagenInput.files[0]) {
		return;
	}

	const obj_producto = {
		tipo: tipo,
		nombre: nombre,
		marca: marca,
		descripcion: descripcion,
		precio: precio,
		oferta: oferta,
		stock: stock
	};

	const formData = new FormData();
	formData.append("producto", JSON.stringify(obj_producto));
	formData.append("image", imagenInput.files[0]);

	try {
		const response = await fetch(`/api/alta-productos`, {
			method: "POST",
			body: formData
		})
		const data = await response.json();
		MostrarRespuesta(data);

		if (data.success) {
			form.reset();
			const imgPreview = document.getElementById('image-preview');
			const uploadText = document.getElementById('upload-text');
			imgPreview.src = '';
			imgPreview.classList.add('hidden');
			uploadText.classList.remove('hidden');
			document.querySelector('.formButton.enviar').disabled = true;
		}
	}
	catch (error) {
		console.error("Error submitting form: " + error);
		MostrarRespuesta({ success: false, message: 'Error de conexión con el servidor' });
	}
}

document.addEventListener("DOMContentLoaded", function () {
	const imagenInput = document.getElementById('imagen');
	const imgPreview = document.getElementById('image-preview');
	const uploadText = document.getElementById('upload-text');

	imagenInput.addEventListener('change', function (e) {
		const file = e.target.files[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = function (e) {
				imgPreview.src = e.target.result;
				imgPreview.classList.remove('hidden');
				uploadText.classList.add('hidden');
			}
			reader.readAsDataURL(file);
		} else {
			imgPreview.src = '';
			imgPreview.classList.add('hidden');
			uploadText.classList.remove('hidden');
		}
		isCompleted();
	});

	const form = document.getElementById("nfacturaForm");
	const inputs = form.querySelectorAll('input, select, textarea');
	const submitBtn = document.querySelector('.formButton.enviar');

	function isCompleted() {
		const tipo = document.getElementById('tipo').value;
		const nombre = document.getElementById('nombre').value;
		const marca = document.getElementById('marca').value;
		const precio = document.getElementById('precio').value;
		const stock = document.getElementById('stock').value;
		const file = document.getElementById('imagen').files[0];

		const editId = new URLSearchParams(window.location.search).get('edit');
		const isFileValid = editId || file;

		const isValid = tipo !== "" && nombre.trim() !== '' && marca.trim() !== '' && precio !== "" && stock !== "" && isFileValid;
		submitBtn.disabled = !isValid;
	}

	inputs.forEach(input => {
		input.addEventListener('input', isCompleted);
		input.addEventListener('change', isCompleted);
	});

	const urlParams = new URLSearchParams(window.location.search);
	const editId = urlParams.get('edit');

	if (editId) {
		document.querySelector('title').textContent = 'Modificar producto';
		document.querySelector('h1')?.textContent && (document.querySelector('h1').textContent = 'Modificar producto');

		fetch(`/api/product/${editId}`)
			.then(res => res.json())
			.then(data => {
				if (data.success) {
					const p = data.product;
					document.getElementById('tipo').value = p.P_TIPO.toLowerCase();
					document.getElementById('nombre').value = p.P_NOMBRE;
					document.getElementById('marca').value = p.P_MARCA;
					document.getElementById('descripcion').value = p.P_DESCRIPCION;
					document.getElementById('precio').value = p.P_PRECIO;
					document.getElementById('oferta').value = p.P_PR_OFERTA;
					document.getElementById('stock').value = p.P_CANTIDAD;

					if (p.P_IMG) {
						imgPreview.src = p.P_IMG;
						imgPreview.classList.remove('hidden');
						uploadText.classList.add('hidden');
					}
					submitBtn.textContent = 'Actualizar Producto';
					document.getElementById('imagen').removeAttribute('required');
					isCompleted();
				}
			})
			.catch(err => {
				console.error("Error fetching product data:", err);
				MostrarRespuesta({ success: false, message: 'No se pudo cargar la información del producto' });
			});
	}

	submitBtn.addEventListener('click', async () => {
		if (editId) {
			await ActualizarProducto(editId);
		} else {
			await GuardarFactura();
		}
	});

	async function ActualizarProducto(id) {
		const tipo = document.getElementById('tipo').value;
		const nombre = document.getElementById('nombre').value;
		const marca = document.getElementById('marca').value;
		const descripcion = document.getElementById('descripcion').value;
		const precio = document.getElementById('precio').value;
		const oferta = document.getElementById('oferta').value || 0;
		const stock = document.getElementById('stock').value;
		const imagenInput = document.getElementById('imagen');

		const obj_producto = {
			tipo: tipo,
			nombre: nombre,
			marca: marca,
			descripcion: descripcion,
			precio: precio,
			oferta: oferta,
			stock: stock
		};

		const formData = new FormData();
		formData.append("producto", JSON.stringify(obj_producto));
		if (imagenInput.files[0]) {
			formData.append("image", imagenInput.files[0]);
		}

		try {
			const response = await fetch(`/api/products/${id}`, {
				method: "PUT",
				body: formData
			});
			const data = await response.json();
			MostrarRespuesta(data);
			if (data.success) {
				setTimeout(() => window.location.href = '/administrar', 1500);
			}
		} catch (error) {
			console.error("Error updating product: " + error);
			MostrarRespuesta({ success: false, message: 'Error de conexión con el servidor' });
		}
	}
});
