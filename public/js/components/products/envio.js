import { Menu } from "../navigation/menu.js";
import { CartController } from "../cart/cart-controller.js";
import { Carrito } from "../cart/carrito.js";
import { MetPago } from "./metpago.js";

export class DireEnvio extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.direcciones = ['Dirección Registrada 1', 'Dirección Registrada 2'];
        const logged = localStorage.getItem('user');
        const loggedUser = JSON.parse(logged);
        this.user = loggedUser ? loggedUser : false;
    }
    getTemplate() {
        return `
        <style>
        .dire-envio {
            display: ${this.user ? 'block' : 'none'};
            font-family: 'Helvetica Neue', Arial, sans-serif;
            padding: 30px;
            padding-bottom: 57.48px;
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
        h4 { 
            margin: 10px 0;
            margin-bottom: 20px;
        }
        .dire-envio select, 
        .dire-envio input {
            width: calc(100% - 22px);
            padding: 10px;
            margin-top: 10px;
            border: 1px solid #ccc;
            border-radius: 5px;
            font-size: 18px;
        }

        button {
            background-color: #4CAF50;
            color: white;
            padding: 10px;
            margin-top: 10px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
        }

        button:hover {
            background-color: #45a049;
        }

        .hidden {display: none;}

        .dire-envio .direccion-agregar {
            margin-top: 15px;
        }

        .dire-envio .direccion-agregar input {
            display: block;
            margin-bottom: 10px;
        }

        @media (max-width: 600px) {
            .dire-envio {
                padding: 15px;
            }

            .dire-envio select, 
            .dire-envio input {
                font-size: 16px;
                padding: 8px;
            }

            button {
                font-size: 0.9em;
                padding: 8px;
            }
        }
        </style>

        <div class="dire-envio">
            <h4>Seleccionar Dirección de Envío</h4>
            <label for="envioSelect">Método de Envío:</label>
            <select id="envioSelect">
                <option value="retira">Retiro en sucursal</option>
                
            </select>
            
            <div id="direccionOptions" class="hidden">
                <label for="addressSelect"><h4>Dirección registrada:</h4></label>
                <select id="addressSelect">
                    <option value="">Seleccionar</option>
                    ${this.direcciones.map(direccion => `<option value="${direccion}">${direccion}</option>`).join('')}
                </select>
                <button id="agregarNuevaDireccion">Agregar Nueva Dirección</button>
                <div id="nuevaDireccion" class="hidden direccion-agregar">
                    <input type="text" id="calle" placeholder="Calle" />
                    <input type="text" id="numero" placeholder="Número" />
                    <input type="text" id="codigoPostal" placeholder="Código Postal" />
                    <input type="text" id="localidad" placeholder="Localidad" />
                    <input type="text" id="provincia" placeholder="Provincia" />
                    <input type="text" id="pais" placeholder="País" />
                    <button id="guardarDireccion">Guardar</button>
                </div>
            </div>
        </div>
        `;
    }

    connectedCallback() {
        this.shadowRoot.innerHTML = this.getTemplate();
        const envioSelect = this.shadowRoot.querySelector('#envioSelect');
        const direccionOptionsDiv = this.shadowRoot.querySelector('#direccionOptions');

        envioSelect.addEventListener('change', () => {
            if (envioSelect.value === 'domicilio') {
                direccionOptionsDiv.classList.remove('hidden');
            } else {
                direccionOptionsDiv.classList.add('hidden');
            }
        });

    }

}

customElements.define('dire-envio', DireEnvio);
