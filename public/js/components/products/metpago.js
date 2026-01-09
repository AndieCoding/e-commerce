import { CartController } from "../cart/cart-controller.js";
import { Carrito } from "../cart/carrito.js";
import { User } from "../../models/user.js";


export class MetPago extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.cartController = new CartController();
        this.total = this.cartController.getTotal();
        this.metodosPago = ['Seleccionar', 'Tarjeta de Débito', 'Tarjeta de Crédito'];
        this.ticket = this.cartController.getProducts();
        this.paymentData = {};
        const logged = localStorage.getItem('user');
        const loggedUser = JSON.parse(logged);
        this.user = loggedUser ? loggedUser : false;
    }

    getTemplate() {
        return `
        <style>
        .met-pago {
            font-family: 'Helvetica Neue', Arial, sans-serif;
            padding: 30px;
            background-color: #ffffff;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            max-width: 100%;
            width: 100%;
            margin: 0 auto;
            color: #333333;
            box-sizing: border-box;
        }

        .met-pago h3 {
            font-size: 1.5em;
            margin-top: 10px;
            margin-bottom: 20px;
            color: #333333;
        }

        .met-pago label {
            display: block;
            font-size: 1em;
            margin-top: 5px;
        }

        .met-pago select, 
        .met-pago input {
            width: calc(100% - 22px);
            padding: 10px;
            margin-bottom: 10px;
            border: 1px solid #ccc;
            border-radius: 5px;
            font-size: 18px;
        }
        .met-pago select {
            margin-top: 10px;
        }

        .met-pago button {
            background-color: #4CAF50;
            color: white;
            padding: 10px;
            margin-top: 10px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
        }

        .met-pago button:hover {
            background-color: #45a049;
        }

        .hidden {
            display: none;
        }
        .mensaje-confirmacion {
            font-size: 1.2em;
            color: #4CAF50;
            margin-top: 20px;
        }
        .spinner {
            margin-left: 2rem;
            display: none;
            border: 8px solid #f3f3f3; 
            border-top: 8px solid #34dbd4b8; 
            border-radius: 50%; 
            width: 60px;
            height: 60px;
            animation: spin 1.5s linear infinite; 
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); border-top-color: #34db61c7; }
        }
        
        .spinner.show{ display: inline-block; }

        @media (max-width: 600px) {
            .met-pago {
                padding: 15px;
            }
            .met-pago h3 {
                font-size: 1em;
            }
            .met-pago button {
                padding: 15px;
                width: 150px;
                margin: 0 auto;
                display: block;
                margin-top: 30px;
            }

            .met-pago select {
                font-size: 16px;
            }
        }

        .container-necesita-loggin {
           display: flex;
           flex-direction: column;
           justify-content: center;
           align-items: center;
           max-height: 450px;
           gap: 20px;
           min-height: 90vh;
           max-height: 600px;
           h3 {
               text-wrap: balance;
               text-align: center;
           }
           a {
               text-decoration: none;
               min-width: 180px;
               width: 60%;
               height: 190px;
               cursor: pointer;
               }
               img {
                   width: 100%;
                   height : 100%;
                   border-radius: 50%;
               }
           }
        .container-fin-de-prueba {
            display: flex;
            position: relative;
            padding: 2em;
            width: 100%;
            min-height: 300px;
            max-width: 900px;
            margin: 0 auto;
            overflow: hidden;
            opacity: 0;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            transition: opacity 1s ease-out;

            h3 {
                text-align: center;
            }
        }
        .container-fin-de-prueba.hidden {
            display: none;
        }
        .container-fin-de-prueba.active {
            opacity: 1;
        }
        .container-fin-de-prueba::before {
            content: "";
            position: absolute;
            top: 0;
            left: -25%;
            width: 100%;
            height: 100%;
            background-image: url('../../img/banner/streamer.png');
            background-size: contain;
            background-position: right;
            background-repeat: no-repeat;
            transform: rotate(45deg);
        }
        </style>

        ${this.user ? `<div class="met-pago">
            <h3>Seleccionar Método de Pago</h3>
            <p>Total a pagar: <strong>$${this.total.toFixed(2)}</strong></p>
            <label for="paymentSelect">Método de Pago:</label>
            <select id="paymentSelect">
                ${this.metodosPago.map(metodo => `<option value="${metodo === 'Selecionar' ? '' : metodo}">${metodo}</option>`).join('')}
            </select>
            
            <div id="infoPago" class="hidden">
                <label for="numeroTarjeta">Número de tarjeta:</label>
                <input type="text" id="numeroTarjeta" placeholder="XXXX XXXX XXXX XXXX" maxlength="19" />
                
                <label for="fechaVencimiento">Fecha de vencimiento (MM/AA):</label>
                <input type="text" id="fechaVencimiento" placeholder="MM/AA" />
                
                <label for="titular">Titular de la tarjeta:</label>
                <input type="text" id="titular" placeholder="Nombre y apellido" />
                
                <label for="dni">DNI:</label>
                <input type="text" id="dni" placeholder="DNI" />
                
                <label for="codigoSeguridad">Código de seguridad:</label>
                <input type="text" id="codigoSeguridad" placeholder="XXXX" />
                
                
                <button id="pagar">Pagar</button><div class='spinner'></div>
                <div id="resultadoValidacion">
                </div>
            </div>

            <div id="infoPagoEmail" class="hidden">
                <label for="emailPago">Correo electrónico:</label>
                <input type="email" id="emailPago" placeholder="Correo electrónico" />
                <button id="continuarPago">Continuar</button>
            </div>
        </div>` : `
        <div class='met-pago container-necesita-loggin'>
            <h3>Debe estar logueado para comprar</h3>
            <a href="/login">
                <img class='imagen-necesita-loggin' src='../../img/banner/imagen-necesita-login.jpg'/>
            </a>
        </div>`}
        <div class='met-pago container-fin-de-prueba hidden'>
            <h3>Esta fue una demostración gratuita de e-commerce</h3>
        </div>
       
        `;
    }

    connectedCallback() {
        this.shadowRoot.innerHTML = this.getTemplate();

        const select = this.shadowRoot.querySelector('#paymentSelect');
        const infoPagoDiv = this.shadowRoot.querySelector('#infoPago');
        const infoPagoEmailDiv = this.shadowRoot.querySelector('#infoPagoEmail');
        const numeroTarjetaInput = this.shadowRoot.querySelector('#numeroTarjeta');
        const fechaVencimientoInput = this.shadowRoot.querySelector('#fechaVencimiento');
        const titularInput = this.shadowRoot.querySelector('#titular');
        const dniInput = this.shadowRoot.querySelector('#dni');
        const codigoSeguridadInput = this.shadowRoot.querySelector('#codigoSeguridad');
        const pagarBtn = this.shadowRoot.querySelector('#pagar');
        const resultadoValidacion = this.shadowRoot.querySelector('#resultadoValidacion');
        const emailPagoInput = this.shadowRoot.querySelector('#emailPago');
        const continuarBtn = this.shadowRoot.querySelector('#continuarPago');

        select.addEventListener('change', () => {
            if (select.value === 'Tarjeta de Débito' || select.value === 'Tarjeta de Crédito') {
                infoPagoDiv.classList.remove('hidden');
                infoPagoEmailDiv.classList.add('hidden');
            } else if (select.value === 'PayPal' || select.value === 'Mercado Pago') {
                infoPagoDiv.classList.add('hidden');
                infoPagoEmailDiv.classList.remove('hidden');
            } else {
                infoPagoDiv.classList.add('hidden');
                infoPagoEmailDiv.classList.add('hidden');
            }
        });

        pagarBtn.addEventListener('click', async () => {
            const numeroTarjeta = numeroTarjetaInput.value;
            const fechaVencimiento = fechaVencimientoInput.value;
            const titular = titularInput.value;
            const dni = dniInput.value;
            const codigoSeguridad = codigoSeguridadInput.value;
            let spinner = this.shadowRoot.querySelector('.spinner');

            spinner.classList.add('show');
            setTimeout(() => {
                spinner.classList.remove('show');
            }, 2000);

            this.paymentData = {
                numeroTarjeta,
                fechaVencimiento,
                senior: this.user.NOMBRE + ' ' + this.user.APELLIDO,
                domicilio: this.user.DOMICILIO,
                localidad: this.user.CIUDAD,
                condicion_vta: 'contado',
                total: this.total,
            };

            /*document.dispatchEvent(new CustomEvent('pagoConfirmado', {
                detail: {
                    products: this.ticket,
                    client: this.paymentData
                }
            }));*/
        });

        continuarBtn.addEventListener('click', () => {
            const emailPago = emailPagoInput.value;
            if (emailPago) {
                if (select.value === 'PayPal') {
                    window.location.href = `${this.paypalUrl}?email=${encodeURIComponent(emailPago)}`;
                } else if (select.value === 'Mercado Pago') {
                    window.location.href = `${this.mercadoPagoUrl}?email=${encodeURIComponent(emailPago)}`;
                }
            }
        });

        this.shadowRoot.querySelector('#numeroTarjeta').addEventListener('input', (event) => {
            this.formatInput(event);
        });


    }
    formatInput(event) {
        let inputSinEspaciado = event.target.value.replace(/\s+/g, '');

        if (inputSinEspaciado.length > 19) {
            inputSinEspaciado = inputSinEspaciado.slice(0, 19);
        }

        const formattedValue = inputSinEspaciado.replace(/(\d{4})(?=\d)/g, '$1-');

        event.target.value = formattedValue;
    }
}

customElements.define('met-pago', MetPago);
