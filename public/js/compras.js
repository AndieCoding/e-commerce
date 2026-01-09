import {CartController} from './components/cart/cart-controller.js';
import {Carrito} from './components/cart/carrito.js';
import {Menu} from './components/navigation/menu.js';
import { AdminNav } from './components/navigation/admin-nav.js';
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
	},2500 );
}

async function GuardarFactura() {		
	let fecha = document.getElementById("nuevaf-fecha").value;
	let tipo = 'original';
	let empresa = document.getElementById("nuevaf-emp").value;
	let nFactura = document.getElementById("nuevaf-num").value;
	let total = document.getElementById("total-facturado").value;

	let tbody = document.querySelector('.tabla-carga-body').children;	
	const productos = [];
	Array.from(tbody).forEach( (element, index) => { 	
		console.log(element);
		if (element.children[1].children[0].value === "") { return };
		let fileInput = element.children[8].children[0];
		let obj_factura = {			
			productType: document.getElementById(`nuevaf-tipo-${index+1}`).value,
			productName: element.childNodes[1].childNodes[0].value,
			marca: element.childNodes[2].childNodes[0].value,
			descripcion: element.childNodes[3].childNodes[0].value,
			cantidad: element.childNodes[4].childNodes[0].value,
			precio: element.childNodes[5].childNodes[0].value,
			pr_vta: element.childNodes[6].childNodes[0].value,
			p_total: element.childNodes[7].childNodes[0].value,
			id_prod: element.childNodes[1].childNodes[1] ? element.childNodes[1].childNodes[1].value : null,
			product_image: element.childNodes[1].childNodes[1] ? null : document.querySelector(`tr[tr='${index + 1 }'] input[type="file"]`).files[0]
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
	try 
	{
		const response = await fetch(`http://localhost:3000/api/images`, {
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
	}
}

async function completadoAutomatico(item,row) {
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

async function getSuggestions(input) {
	const fila = input.getAttribute('tr');
	const col = input.getAttribute('col');
	const texto = input.value;
	let response;	
	switch (input.name) {
		case "empresa": 
			response = await fetch(`http://localhost:3000/api/Suggestions/empresa/${texto.toString()}`);			
			break;
		case "nombre":
			response = await fetch(`http://localhost:3000/api/Suggestions/productName/${texto.toString()}`);
			break;
		/*case "descripcion":
			response = await fetch(`http://localhost:3000/api/Suggestions/productDescription/${texto.toString()}`);			;
			break;*/
	}

	const data = response != undefined ? await response.json() : [];    	

	if (data.length === 0) { return; }

	if (document.querySelector('.suggestions')) {
		document.querySelector('.suggestions').remove();
	}
	const div = document.createElement('div');
	div.classList.add('suggestions');
	const table = document.createElement('table');
	const tbody = document.createElement('tbody');	
	data.suggestions.forEach( (item) => {		
		const tr = document.createElement('tr');
		if (input.name !== 'empresa') {			
			tr.innerHTML = `<td>${item.id}</td><td>${item.nombre}</td><td>${item.descripcion}</td>`;
			tr.addEventListener('click', () => {
				completadoAutomatico(item,fila);								
				return;
			})			
		} else {
			div.style.left = "38%";
			tr.innerHTML = `<td>${item.empresa}</td>`;
			tr.addEventListener('click', () => {
				const input = document.querySelector(`input#nuevaf-emp`);
				input.value = item.empresa;		
				div.remove();		
				return;						
			})	
		}
		tbody.appendChild(tr);
	});
	
	table.appendChild(tbody);
	div.appendChild(table);
	input.parentNode.appendChild(div);

	input.addEventListener('blur', () => {
        setTimeout(() => {
            div.remove();
        }, 150); 
    });
}

function cargarCampos() {

	const tbody = document.querySelector('tbody.tabla-carga-body');	    	

	for (let fila = 1; fila < 5; fila++) {
		const tr = document.createElement('tr');
		tr.setAttribute('tr', fila);			
		for (let col = 1; col < 11; col++) {
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
			input.addEventListener('keyup', function () { 
				getSuggestions(this) });
			break;
		case 3:
			input.type = 'text';
			input.name = 'marca';			
			input.setAttribute('id', `nuevaf-marca-${fila}`);
			//input.addEventListener('keyup', function () { 
			//	getSuggestions(this) });
			break;
		case 4:			
			input.name = 'descripcion';
			input.setAttribute('id', `nuevaf-descripcion`);
			input.addEventListener('keyup', function () { 
				getSuggestions(this) });
			break;
		case 5:
			input.type = 'number';
			input.name = 'cantidad';
			input.setAttribute('id', `nuevaf-cantidad-${fila}`);
			input.addEventListener('input',function () { CalcularTotal(this) } );
			break;	
		case 6:
			input.type = 'number';
			input.name = 'precio';
			input.setAttribute('id', `nuevaf-precio-${fila}`);
			input.addEventListener('input',function () { CalcularTotal(this) } );
			break;
		case 7:
			input.type = 'number';
			input.name = 'pr-sugerido';
			input.setAttribute('id', `nuevaf-pr-sugerido-${fila}`);
			input.addEventListener('input',function () {} );
			break;	
		case 8:
			input.type = 'number';
			input.name = 'total';
			input.disabled = true;
			input.setAttribute('id', `nuevaf-total-${fila}`);
			break;	
		case 9:
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
		case 10:
			input.type = 'number';
			input.name = 'stock';
			input.disabled = true;
			input.setAttribute('id', `nuevaf-stock-${fila}`);
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
	let inputEmpresa = document.querySelector('#nuevaf-emp').addEventListener("keyup", function () { getSuggestions(this)});
});
