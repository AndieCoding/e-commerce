import { Manager } from "../../../models/manager.js";
import { CartController } from "../cart/cart-controller.js";

export class Remito extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.nFactura = 1;
        this.numeroRemito = 1;
        this.CartController = new CartController();
        this.total = this.CartController.getTotal();
        this.manager = new Manager();

        document.addEventListener('numeroParaRemito', async (event) => {
            this.nFactura = event.detail.n_factura ? event.detail.n_factura : 1;
            this.numeroRemito = event.detail.n_remito ? event.detail.n_remito : 1;
            console.log('Evento n_remito en remito')
        });

        document.addEventListener('cargarRemito', async (event) => {
            this.fecha = new Date();
            this.dia = this.fecha.getDate();
            this.mes = this.fecha.getMonth() + 1;
            this.anio = this.fecha.getFullYear();
            this.ticket = event.detail.products;
            this.client = event.detail.client;
            await this.completarDatosFactura();
            console.log('completado el remito');
        });

        document.addEventListener('guardarRemito', async (event) => {
            console.log('this is event.detail in remito: ' + event.detail.origen);
            if (event.detail.origen) {
                await this.crearFactura(event.detail.detail, event.detail.origen)
            } else {
                await this.crearFactura(event.detail.detail);
            }

            console.log('recibida');
        });

    }

    getStyles() {
        return `
        <style>
        @import url('https://fonts.googleapis.com/css2?family=Source+Sans+3:ital,wght@0,200..900;1,200..900&display=swap');

        * {
            box-sizing: border-box;    
            font-family: "Source Sans 3", sans-serif;
        }

        p {
            margin: 0;
        }

        input {
            border: none;
            outline: none;
            border-bottom: 1px dotted black;
        }

        input[type='text'],
        input[type='number'] {
            font-size: 16px;
            ;
        }

        h1{
            text-align: center;
            font-size: 24px;
            margin-bottom: 0;
        }
        h3{
            margin-top: 0;
            text-align: center;
        }
        h4 {
            text-align: center;
        }
        fieldset {
            margin-inline: 35px;
            margin: auto;
            width: 100%;
            padding-inline: 1em;
            padding-right: 2em;
            border: 1px solid black;
            border-left: 4px solid black;
            border-right: 4px solid black;
        }
        label {
            text-wrap: nowrap;
        }
        table {
            width: 100%;
            border-top: 1px solid black;
            border-bottom: 1px solid black;
            border-collapse: collapse;

            input {
                width: 90%;
                border: none;
            }
        }

        th, td {
            border: 1px solid black;            
        }
        tr {
        line-height: 30px;
        }

        tr td:first-child {
            border-bottom: none;

            input {
            margin-left: 5px;
            }
        }
        tr td:last-child {
            border-bottom: none;

            input {
            margin-right: 5px;
            width: 90%;            
            }
        }
        
        tr:last-child {
            line-height: 30px;   
        }

        tr:last-child td {
            border-bottom: none;      

        }

        .border-bottom-dotted-input {
            border: none;
            outline: none;
            border-bottom: 1px dotted black;
        }

        .font-weight-500 { font-weight: 500; }
        .font-weight-600 { font-weight: 600; }
        .font-weight-700 { font-weight: 700; }
        .font-size-10px { font-size: 10px; }
        .font-size-12px { font-size: 12px; }
        .font-size-14px { font-size: 14px; }
        .font-size-16px { font-size: 16px; }
        .font-size-18px { font-size: 18px; }
        .line-height-0 { line-height: 0 }
        .line-height-05em { line-height: 0.5em }

        .m-0 { margin: 0;}
        .m-auto-auto { margin: auto; }
        .m-auto { margin-inline: auto; }
        .m-40px { margin: 40px; }
        .m-top-0 { margin-top: 0; }
        .m-top-05em { margin-top: 0.5em; }
        .m-top-1em { margin-top: 1em; }
        .m-top-1-5em { margin-top: 1.5em; }
        .m-top-2em { margin-top: 2em; }
        .m-right-1em{ margin-right:1em; }
        .m-right-2em{ margin-right:2em; }
        .m-bottom-0 { margin-bottom: 0; }
        .m-bottom-5px { margin-bottom: 5px; } /* nuevo*/
        .m-bottom-01em { margin-bottom: 0.1em; }
        .m-bottom-05em { margin-bottom: 0.5em; }
        .m-bottom-1em { margin-bottom: 1em; }
        .m-bottom-2em { margin-bottom: 2em; }
        .m-left-05em{ margin-left: 0.5em; }
        .m-left-1em{ margin-left: 1em; }
        .m-inline-40px { margin-inline: 40px; }

        .p-left-2em { padding-left: 2em }
        .p-left-1em { padding-left: 1em }
        .p-40px { padding: 40px }
        .p-top-05em { padding-top: 0.5em }
        .p-top-5em { padding-top: 5em }
        .p-top-1em { padding-top: 1em }
        .p-bottom-0 { padding-bottom: 0 }
        .p-bottom-05em { padding-bottom: 0.5em }
        .p-bottom-1em { padding-bottom: 1em }
        .p-bottom-5em { padding-bottom: 5em }
        .p-1em { padding: 1em }
        .p-02em { padding: 0.2em;} /*nuevo*/
        .p-inline-1em { padding-inline: 1em }
        .p-inline-2em { padding-inline: 2em }
        .p-0 { padding: 0 }

        .float-left { float: left; }
        .d-block { display: block; }

        .flex { display: flex; }
        .column { flex-direction: column; }
        .align-start { align-items: start; }
        .align-center { align-items: center; }
        .align-end { align-items: end; }
        .justify-center { justify-content: center; }
        .justify-end { justify-content: end; }
        .space-around { justify-content: space-around; }
        .space-between { justify-content: space-between; }
        .gap-05em { gap: 0.5em; }
        .gap-5px { gap: 5px; } /*nuevo*/
        .gap-1em { gap: 1em; }

        .border-left-2px {border-left: 2px solid black;} /*nuevo*/
        .border-4px { border: 4px solid black; }
        .border-left-4px { border-left: 4px solid black; }
        .border-right-4px { border-right: 4px solid black; }
        .border-right-3px { border-right: 3px solid black; } /*nuevo*/
        .border-right-2px { border-right: 2px solid black; } /*nuevo*/
        .border-right-0 { border-right: 0; } /*nuevo*/
        .border-3px { border: 3px solid black; }
        .border-2px { border: 2px solid black; } /*nuevo*/
        .border { border: 1px solid black; }
        .b-top-none { border-top: none; }
        .b-bottom-none { border-bottom: none; }
        .b-right { border-right: 1px solid black; }
        .b-right-0 { border-right: none; }
        .b-bottom-0 { border-bottom: 0; }
        .b-bottom { border-bottom: 1px solid black; }
        .b-bottom-2px { border-bottom: 2px solid black; }/*nuevo*/
        .b-none { border: none; }
        .border-top-left-radius-15px { border-top-left-radius: 15px; }
        .border-radius-10px { border-radius: 10px; }
        .border-radius-5px { border-radius: 15px; }
        .border-radius-25px { border-radius: 25px; } /*nuevo*/
        .border-left-0 { border-left: none;}
        .border-left-1px { border-left: 1px solid black;} /*nuevo*/
        .border-left-2px { border-left: 2px solid black;} /*nuevo*/
        .border-right-0 { border-right: none;}/*nuevo*/
        .border-2px-sinbottom { 
            border-left: 2px solid black;
            border-right: 2px solid black;
            border-top: 2px solid black;
            border-bottom: none;
        }


        .text-indent-1em { text-indent: 1em; } 
        .text-left { text-align: left; } 
        .text-center { text-align: center; } 
        .text-right { text-align: right; } 

        .w-50px { width: 50px; }
        .w-110px { width: 110px; }
        .w-120px { width: 120px; }
        .w-140px { width: 140px; }
        .w-160px { width: 160px; }
        .w-250px { width: 250px; }
        .w-300px { width: 300px; }

        .w-10porciento { width: 10%;} /*nuevo*/
        .w-20porciento { width: 20%;}/*nuevo*/
        .w-30porciento { width: 30%;} /*nuevo*/
        .w-40porciento { width: 40%; }
        .w-45porciento { width: 45%; }
        .w-50porciento { width: 50%; }
        .w-55porciento { width: 55%; } /*nuevo*/
        .w-60porciento { width: 60%; }
        .w-70porciento { width: 70%; }
        .w-75porciento { width: 75%; }
        .w-80porciento { width: 80%; }
        .w-85porciento { width: 85%; }
        .w-90porciento { width: 90%; }
        .w-95porciento { width: 95%; }
        .w-100porciento { width: 100%; }
        .min-width-850 { min-width: 850px; }

        .text-balance { text-wrap: balance; }
        .underline { text-decoration: underline; }

        .input-w-50px{
            input { width: 50px; }
        }

        .container {
            padding-bottom: 1em;
            width: 800px;
            margin: 0 auto;
            background-color: white;
            border-radius: 5px;
            outline: 2px solid gray
        }

        .encabezado { 
            position: relative;
            width: 100%;
            height: 220px;
            border-radius: 10px 10px 0 0;
            border-bottom: none;
        }
        .encabezado-izquierda,
        .encabezado-derecha {
            display: grid;
            width: 100%;
            height: 200px;
            grid-template-columns: 1fr;
            grid-template-rows: repeat(10, 20px);
        }
        .encabezado-izquierda { 
            justify-items: center;
        }

        .logo {
            grid-row: 1 / 9;
        }

        .logo-empresa {
            width: 100%;
            height: 100%;
        }
        .ivaInscripto {
            width: 100%;
            grid-row: 9 / 11;
            border-top: 1px solid black;
        }

        .marca-documento {
            position: absolute;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            width: 40px;
            background-color: white;
            top: 15%;
            left: calc(50% - 40px);

            h1 {
                font-size: 32px;
                line-height: 1em;
            }
        }

        .border-bottom-noradius {
            border-radius: 15px 15px 0 0;
        }
        .border-top-noradius {
            border-radius: 0 0 15px 15px;
        }

        .encabezado-derecha > h4 {
            grid-row: span 2;
        }

        .encabezado-tres-filas {
            grid-row: span 3;
        }
        .fecha {
            grid-row: span 2;
            align-items: center;
        }

        .letter-spacing-largo {
            letter-spacing: 1px;
        }
        .encabezado-izquierda-h , .encabezado-derecha-h {
            height: 180px;
        } 
        .box-shadow {
            box-shadow: 2px 2px 2px 0;
        }

        .p-relative {
            position: relative;
        }

        footer {
            margin-top: 10px;
        }

        .letter-spacing-1 {
            letter-spacing: 1px;
        }
        </style>
        `;
    }
    template() {
        const template = document.createElement('template');
        template.innerHTML =
            `
        ${this.getStyles()}
        <div class="container p-40px font-weight-600 p-top-3em">
			<div class="encabezado flex border-4px">
				<div class="encabezado-izquierda border-2px border-radius-5px ">
					<div class="logo"> 
                        <img src="/img/fan_del_mate-sinbg.png" alt="logo" class="logo-empresa">
                    </div>
					
					<div class="ivaInscripto flex justify-center">
						<p> RESP. MONOTRIBUTO </p>
					</div>
				</div>
				<div class="encabezado-derecha p-inline-2em">
					<h4 class="m-0 m-top-1em">REMITO</h4>
					<p class="font-size-10px line-height-1em text-center letter-spacing-1">DOC. NO VÁLIDO</p>
					<p class="font-size-10px line-height-1em text-center letter-spacing-1">COMO FACTURA</p>
					<h3 class="m-0 text-left line-height-01em">Nº0001 - <span id="numero-remito"></span></h3>
					<div class="fecha flex">
						<p> Fecha: </p>
						<p id='fecha-actual'>Fecha: 01/01/2019</p>
					</div>
					<div class="flex space-between font-size-12px">
						<p>CUIT</p>
						<p>30-37814311-0</p>
					</div>
					<div class="flex space-between font-size-12px">
						<p>Ing. Brutos C.M</p>
						<p>901-0000000-1</p>
					</div>
					<div class="flex space-between font-size-12px">
						<p>Inicio Actividades</p>
						<p>01/01/24</p>
					</div>
				</div>
				<div class="marca-documento border">
                    <h1 class="m-0">R</h1>
                    <p>Cod. 91</p>
                </div>
			</div>

			<fieldset>
				<div class="flex space-between align-end m-bottom-02em">
					<label for="senior"> Sr./es: </label>
					<input class="w-95porciento" type="text" id="senior" />
				</div>
				<div class="flex space-between">
					<div class="flex space-between align-end w-60porciento">
						<label for="domicilio"> Domicilio: </label>
						<input class="w-90porciento" type="text" id="domicilio" />
					</div>
					<div class="flex space-between align-end w-40porciento">
						<label for="localidad"> Localidad </label>
						<input class="w-90porciento" type="text" id="localidad" />
					</div>
				</div>
			</fieldset>
			<fieldset class="flex space-between b-top-none">
				<div class="flex space-between align-end w-40porciento">
					<p>IVA</p>
                    <input class="" type="checkbox" id="ri" />
					<label for="ri"> R. Inscr. </label>					
                    <input class="" type="checkbox" id="cf" checked />
					<label for="cf"> Cons. Final </label>
				</div>
				<div class="flex space-between align-end w-40porciento">
					<label for="cuit"> CUIT </label>
					<input class="w-90porciento" type="text" id="cuit" />
				</div>
			</fieldset>
			<fieldset class="flex space-between b-top-none b-bottom-none p-left-02em">
				<div class="flex space-between align-end w-50porciento ">
					<p class="w-50porciento">Condiciones de venta</p>
					<div class="flex space-around w-50porciento">
						<div class="flex">
							<label for="contado"> Contado </label>
							<input type="radio" id="contado" name="condiciones-venta" />
						</div>	
						<div class="flex">
							<label for="cta-cte"> Cta. Cte. </label>
							<input type="radio" id="cta-cte" name="condiciones-venta"/>
						</div>
					</div>
				</div>

				<div class="flex space-between align-end w-40porciento">
					<label for="cuit"> Factura Nº </label>
					<input class="w-90porciento" type="text" id="numero-factura" />
				</div>
			</fieldset>
			<fieldset class="p-0 b-top-none b-bottom-none">
				<table class="tabla-remito">
					<tr>
						<th>CANTIDAD</th>
						<th class="w-90porciento">DESCRIPCIÓN</th>
					</tr>                   				
                    <tbody id="lista-productos"></tbody>                    
					
				</table>
			</fieldset>
			<div class="flex b-top-none border-right-4px border-left-4px b-bottom">
				<div class="flex column w-50porciento b-right p-left-1em gap-05em p-top-05em p-bottom-1em">
					<div class="flex space-between align-end w-80porciento">
						<label for="transporte"> Transporte </label>
						<input class="w-90porciento" type="text" id="transporte" />
					</div>
					<div class="flex space-between align-end w-80porciento">
						<label for="domic"> Domicilio </label>
						<input class="w-90porciento" type="text" id="domic" />
					</div>
					<div class="flex space-between align-end w-80porciento">
						<label for="cuit"> CUIT </label>
						<input class="w-90porciento" type="text" id="cuit" />
					</div>
				</div>
				<div class="flex column w-50porciento p-left-2em justify-end align-center">
					<div class="justify-center">
						<input class="w-100porciento" type="text" />
						<p class="text-center">RECIBÍ CONFORME</p>
					</div>
				</div>
			</div>
			<footer class="p-bottom-3em">
				<div class="footer border-4px flex font-size-10px p-top-05em p-bottom-05em b-top-none p-inline-05em">
					<div class="w-50porciento p-top-05em">
						<div class="flex space-between w-80porciento">
							<p>CUIT 20-04487242-1</p>
						</div>
						<p>Numerado del Nº 0001-00000851 al 0001-00001250</p>
					</div>
					<div class="flex w-55porciento p-right-1em">
						<div class="telefono w-50porciento p-inline-1em">
							<div class="flex justify-center align-end">
								<p class="font-size-18px">147</p>
								<p> Teléfono gratuito CABA </p>
							</div>
							<div class="flex justify-center align-end">
								<p class="text-center"> Área de defensa y protección al consumidor </p>
							</div>
						</div>
						<div class="flex column align-end justify-end w-60porciento">							
							<h2 class="m-0 font-weight-500 line-height-05em">CAI: 45000000000003</h2>
							<h2 class="m-0 font-weight-500">F. VTO: 1/07/2026</h2>
						</div>
					</div>
				</div>
			</footer>
		</div>
		<script>
			const cuitInputs = document.querySelectorAll("#cuit");

			cuitInputs.forEach((input) => {
				input.addEventListener("input", function (e) {
					let cuit = e.target.value.replace(/\D/g, "");
					if (cuit.length > 2) {
						cuit = cuit.substring(0, 2) + "-" + cuit.substring(2);
					}
					if (cuit.length > 11) {
						cuit = cuit.substring(0, 11) + "-" + cuit.substring(11, 12);
					}
					e.target.value = cuit;
				});
			});
		</script>
        `
            ;
        return template.content.cloneNode(true);
    }
    connectedCallback() {
        this.render();
    }

    render() {
        this.shadowRoot.appendChild(this.template());
    }
    async completarDatosFactura() {

        this.shadowRoot.querySelector('#numero-factura').value = this.nFactura;
        this.shadowRoot.querySelector('#fecha-actual').textContent = this.dia + ' /' + this.mes + ' /' + this.anio;
        this.shadowRoot.querySelector('#senior').value = this.client.senior;
        this.shadowRoot.querySelector('#domicilio').value = this.client.domicilio;
        this.shadowRoot.querySelector('#localidad').value = this.client.localidad;
        this.shadowRoot.querySelector('input[name="condiciones-venta"]').value = '';
        if (this.client.condicion_vta === 'contado') {
            this.shadowRoot.querySelector('#contado').checked = true;
        } else {
            this.shadowRoot.querySelector('#cta-cte').checked = true;
        }
        this.shadowRoot.querySelector('#numero-remito').innerText = this.numeroRemito.toString().padStart(8, '0');
        const lista = this.shadowRoot.querySelector('#lista-productos');

        lista.innerHTML = this.ticket.map(product =>
            `<tr>
				<td><input type="number" value="${product.P_CANTIDAD}"/></td>
				<td><input type="text" value="${product.P_DESCRIPCION}" /></td>
			</tr>`
        ).join('');
    }

    async crearFactura(element, origen) {
        html2canvas(element).then(async canvas => {
            const formData = new FormData();
            formData.append('nRemito', this.numeroRemito || 1);
            const imageData = canvas.toDataURL('image/jpeg');

            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF();
            pdf.addImage(imageData, 'jpeg', -52, -10, 320, 200);

            const pdfBlob = pdf.output('blob');
            const timestamp = new Date().getTime();

            formData.append('pdf', pdfBlob, `factura${timestamp}.pdf`);
            let response;
            if (origen) {
                console.log('redirigido según el sistema');
                response = await this.manager.guardarRemito(formData, this.numeroRemito);
            } else {
                response = await this.manager.guardarRemito(formData);
            }
            console.log(response);

            if (response.success) {
                console.log('Guardado');
                return;
            } else {
                console.error('Error');
                return;
            }
        });

    }
}
customElements.define('remito-del-mate', Remito);