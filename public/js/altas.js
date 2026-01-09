import {CartController} from './components/cart/cart-controller.js';
import {Carrito} from './components/cart/carrito.js';
import {Menu} from './components/navigation/menu.js';
import { AdminNav } from './components/navigation/admin-nav.js';
import { Footer } from './components/navigation/footer.js';


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
	},2500 );
}

async function GuardarFactura() {		
	let tbody = document.querySelector('.tabla-carga-body').children;	
	const productos = [];
	Array.from(tbody).forEach( (element, index) => { 	

		if (
			element.children[4].children[0].value == "",
			element.children[3].children[0].value == "",
			element.children[2].children[0].value == "",
			element.children[1].children[0].value == ""
		) { return };
		let fileInput = element.children[4].children[0];
		let obj_factura = {			
			productType: document.getElementById(`nuevaf-tipo-${index+1}`).value,
			productName: element.childNodes[1].childNodes[0].value,
			marca: element.childNodes[2].childNodes[0].value,
			descripcion: element.childNodes[3].childNodes[0].value,
			cantidad: 0,
			product_image: fileInput !== undefined ? document.querySelector(`tr[tr='${index + 1 }'] input[type="file"]`).files[0] : ""
		};
		console.log(obj_factura);
		productos.push(obj_factura);
		console.log(productos)
	});	
	
	const formData = new FormData();	
	formData.append("productos", JSON.stringify(productos));
	productos.forEach((producto, index) => {
        if (producto.product_image) {
            formData.append(`product_image`, producto.product_image); 
        }
    });

	try 
	{
		const response = await fetch(`http://localhost:3000/api/alta-productos`, {
			method: "POST",
			body: formData
		})
		const data = await response.json();					
		MostrarRespuesta(data);							
		document.getElementById("nfacturaForm").reset();
	} 
	catch (error) 
	{
		console.error("Error submitting form: " + error);
	}
}

function cargarCampos() {

	const tbody = document.querySelector('tbody.tabla-carga-body');	    	

	for (let fila = 1; fila < 5; fila++) {
		const tr = document.createElement('tr');
		tr.setAttribute('tr', fila);			
		for (let col = 1; col < 6; col++) {
			const td = document.createElement('td');
			td.setAttribute('col', col);			
			const input = asignarProps(col, fila);
			td.appendChild(input);
			tr.appendChild(td);
		}	
		tr.setAttribute('tr', fila);			
		tbody.appendChild(tr);	
	};
}

function asignarProps(col, fila) {
	let input = document.createElement('input');
	
	if (col === 1) { input = document.createElement('select');}	
	if (col === 4) { input = document.createElement('textarea');} 

	input.setAttribute('tr', fila);	
	
	switch (col) {
		case 1:
			input.name = 'tipo';			
			input.setAttribute('id', `nuevaf-tipo-${fila}`);			
			input.innerHTML = 
			`	<option value="mate">Mate</option>
				<option value="termo">Termo</option>
				<option value="yerba">Yerba</option>								
			`;
			break;
		case 2:
			input.type = 'text';
			input.name = 'nombre';			
			input.setAttribute('id', `nuevaf-nombre-${fila}`);
			break;
		case 3:
			input.type = 'text';
			input.name = 'marca';			
			input.setAttribute('id', `nuevaf-marca-${fila}`);
			break;
		case 4:			
			input.name = 'descripcion';
			input.setAttribute('id', `nuevaf-descripcion`);
			break;
		case 5:
			input.type = 'file';
			input.name = 'imagen';			
			input.setAttribute('id', `nuevaf-imagen-${fila}`);
			input.addEventListener('change', (event) => {
				const img = document.createElement('img');
				img.classList.add('preview');
				
				const file = event.target.files[0];

				if (file) {
					const reader = new FileReader();					
					reader.onload = () => {
						img.src = `${reader.result}`;
					};
					
					reader.readAsDataURL(file); 
				}
				
				input.parentNode.appendChild(img);				
			});
			break;	
	}
	return input;
}

document.addEventListener("DOMContentLoaded", function() {

	cargarCampos();

	const form = document.forms["nfacturaForm"];
	const inputs = form.elements;
	const submitBtn = document.querySelector('.formButton.enviar');

	function isCompleted() {
		const isCompleted = Array.from(inputs).every( input => {			
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
