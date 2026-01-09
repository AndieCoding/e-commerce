import { Manager } from "../../../models/manager.js";
import { CartController } from "../cart/cart-controller.js";
import { Remito } from "./remito.js";

export class Factura extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.nFactura = 1;
        this.numeroRemito = 1;
        this.CartController = new CartController();
        this.total = this.CartController.getTotal();
        this.manager = new Manager();

        document.addEventListener('pagoConfirmado', async (event) => {
            await this.consultarNumeración();
            this.fecha = new Date();
            this.dia = this.fecha.getDate();
            this.mes = this.fecha.getMonth() + 1;
            this.anio = this.fecha.getFullYear();
            this.ticket = event.detail.products;
            this.client = event.detail.client;
            this.completarDatosFactura();
            console.log('completado la factura');
            document.dispatchEvent(new CustomEvent('cargarRemito', {
                detail: {
                    products: event.detail.products,
                    client: event.detail.client
                }
            }));
            document.dispatchEvent(new CustomEvent('facturaCargada', {}));
        });

        document.addEventListener('guardarFactura', async (event) => {
            console.log('this is event.detail in facturaC: ' + event.detail.origen);
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
            grid-row: span 3 ;
        }

        .encabezado-tres-filas {
            grid-row: span 3;
        }
        .fecha {
            grid-row: span 4;
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
        </style>
        `;
    }
    template() {
        const template = document.createElement('template');
        template.innerHTML =
            `
        ${this.getStyles()}
        <div class="container factura p-40px font-weight-600 p-top-5em">
			<div class="p-relative flex gap-5px m-bottom-5px">
				<div class="encabezado-izquierda border-2px border-radius-5px ">
					<div class="logo"> 
                        <img src="/img/fan_del_mate-sinbg.png" alt="logo" class="logo-empresa">
                    </div>
					
					<div class="ivaInscripto flex justify-center">
						<p> RESP. MONOTRIBUTO </p>
					</div>
				</div>
				<div class="encabezado-derecha p-inline-2em border-2px border-radius-5px">
					<h2 class="m-0 text-center">FACTURA</h2>
					<h3 class="m-0 text-left line-height-01em">Nº0001 - <span id="numero-boleta"></span></h3>
					<div class="fecha flex">
						<p id='fecha-actual'> Fecha: 01/01/2019 </p>   
					</div>
					<div class="encabezado-tres-filas">
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
					
				</div>
				<div class="marca-documento border-2px border-radius-10px">
                    <h1 class="m-0">C</h1>
                </div>
			</div>

			<fieldset class="border-2px m-bottom-5px border-radius-5px">
				<div class="flex space-between align-end m-bottom-5px">
					<label for="senior"> Señores: </label>
					<input class="w-95porciento" type="text" id="senior" />
				</div>
				<div class="flex space-between">
					<div class="flex space-between align-end w-60porciento">
						<label for="domicilio"> Dirección: </label>
						<input class="w-90porciento" type="text" id="domicilio" />
					</div>
					<div class="flex space-between align-end w-40porciento">
						<label for="localidad"> Loc.: </label>
						<input class="w-90porciento" type="text" id="localidad" />
					</div>
				</div>
			</fieldset>
			<fieldset class="flex space-between border-2px-sinbottom border-radius-5px p-0 border-bottom-noradius">
				<div class="flex space-between  w-100porciento">
					<div class="w-10porciento border-right-2px flex justify-center align-center">
						<p>IVA</p>
					</div>
					<div class=" w-60porciento border-right-2px flex column justify-center align-center">
						<div>
                            <input class="" type="checkbox" id="ri" />
							<label for="ri"> R. Inscripto </label>
							<input class="" type="checkbox" id="rm" />
							<label for="rm"> R. Monotributo </label>
						</div>
						<p>
							<input class="" type="checkbox" id="ex" />
							<label for="ex"> Exento </label>
							<input class="" type="checkbox" id="nr" />
							<label for="nr"> No Resp. </label>
							<input class="" type="checkbox" id="cf" checked />
							<label for="cf"> Cons. Final </label>							
						</p>
					</div>
					<div class="flex space-between align-center w-40porciento p-02em">
						<label for="cuit"> C.U.I.T. N°: </label>
						<input class="w-90porciento b-none" type="text" id="cuit" />
					</div>
				</div>
			</fieldset>
			<fieldset class="flex space-between border-2px m-bottom-5px border-radius-5px p-0 border-top-noradius">
				<div class=" w-30porciento border-right-2px p-02em ">
					<b>Condiciones de Venta</b>
				</div>
				<div class="flex space-around w-40porciento border-right-2px p-02em" >
					<div>
						<label for="contado"> Contado </label>
						<input type="radio" id="contado" name="condiciones-venta" value="contado" />
					</div>
					<div>
						<label for="cta-cte"> Cta. Cte. </label>
						<input type="radio" id="cta-cte" name="condiciones-venta" value="cta-cte" />
					</div>
				</div>

				<div class="flex space-between align-end w-40porciento p-02em">
					<label for="cuit"> REMITO Nº </label>
					<input class="w-70porciento b-none" type="text" id="numero-remito" />
				</div>
			</fieldset>
			<fieldset class="p-0 m-bottom-5px border-radius-5px border-2px">
				<table class="b-none border-radius-5px">
                    <thead>
                        <tr class="b-none border-radius-5px">
                            <th class="b-top-none border-left-0 b-bottom-2px border-top-left-radius-15px">CANTIDAD</th>
                            <th class="b-top-none border-left-2px b-bottom-2px w-55porciento">DETALLE</th>
                            <th class="b-top-none border-left-2px b-bottom-2px">PR. UNIT.</th>
                            <th class="b-top-none b-right-0 border-left-2px b-bottom-2px ">IMPORTE</th>

                        </tr>
                    </thead>
                    <tbody id="lista-productos">
                    </tbody>
				</table>
			</fieldset>
			
			<footer>
				<div class="w-100porciento flex gap-5px">
					<div class="border-2px border-radius-5px flex font-size-10px  w-80porciento">
						<div class="w-80porciento p-02em p-inline-1em flex column space-between">
							<p>ORIGINAL BLANCO - DUPLICADO COLOR</p>
							<br>
							<p class="font-weight-700 letter-spacing-largo">147 Teléfono gratuito CABA. Área de defensa y protección al consumidor</p>
						</div>
						<div class="w-20porciento p-inline-1em flex justify-center align-center">
							<h1 class="m-0 font-weight-600" for="total">TOTAL  $</h1>
						</div>
					</div>

					<div class="justify-end flex w-20porciento border-radius-5px border-2px align-center">
						<input class="w-95porciento font-size-16px b-bottom-none" type="number" id="total-ticket"/>
					</div>
				</div>		
			</footer>
		</div>
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

    async consultarNumeración() {
        const response = await this.manager.consultarNFactura();
        this.nFactura = response.number ? response.number : 1;
        this.numeroRemito = response.n_remito ? response.n_remito : 1;
        document.dispatchEvent(new CustomEvent('numeroParaRemito', {
            detail: {
                'n_factura': response.number,
                'n_remito': response.n_remito,
            }
        }));
    }

    async completarDatosFactura() {

        this.shadowRoot.querySelector('#numero-boleta').textContent = this.nFactura.toString().padStart(8, '0');
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
        this.shadowRoot.querySelector('#numero-remito').value = this.numeroRemito;
        this.shadowRoot.querySelector('#total-ticket').value = this.client.total;
        const lista = this.shadowRoot.querySelector('#lista-productos');

        lista.innerHTML = this.ticket.map(product =>
            `<tr><td class="border-left-0"><input type="number" value="${product.P_CANTIDAD}" /></td>
			    <td><input type="text" value="${product.P_DESCRIPCION}" /></td>
				<td><input type="number" value="${product.P_PRECIO}" /></td>
				<td class="border-right-0 "><input type="number" value="${product.P_CANTIDAD * product.P_PRECIO}" /></td>
			</tr>`
        ).join('');
    }

    async crearFactura(element, origen) {
        html2canvas(element).then(async canvas => {
            const formData = new FormData();
            formData.append('nFactura', this.nFactura || 1);
            const imageData = canvas.toDataURL('image/jpeg');

            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF();
            pdf.addImage(imageData, 'jpeg', -52, -10, 320, 200);

            const pdfBlob = pdf.output('blob');
            const timestamp = new Date().getTime();

            formData.append('pdf', pdfBlob, `factura${timestamp}.pdf`);
            formData.append('fecha', `${this.anio}-${this.mes}-${this.dia}`);
            formData.append('empresa', this.client.senior);
            formData.append('tipo', 'duplicado');
            formData.append('total', this.client.total);
            let response;
            if (origen) {
                console.log('redirigido según el sistema');
                response = await this.manager.guardarFactura(formData, this.nFactura);
            } else {
                response = await this.manager.guardarFactura(formData);
            }
            console.log(response);

            if (response.success) {
                console.log('Guardado');
                const pdfUrl = URL.createObjectURL(pdfBlob);
                localStorage.setItem('pdfUrl', pdfUrl);
                return;
            } else {
                console.error('Error');
                return;
            }


        });
        const formData = new FormData();
        formData.append('nFactura', this.nFactura || 1);
        formData.append('fecha', `${this.anio}-${this.mes}-${this.dia}`);
        formData.append('empresa', this.client.senior);
        formData.append('tipo', 'duplicado');
        formData.append('total', this.total);
        formData.append('productos', JSON.stringify(this.ticket));
        console.log(this.ticket);
        let response = await this.manager.registrarVenta(formData);
        if (!response.success) {
            return;
        }

    }
}
customElements.define('factura-del-mate', Factura);