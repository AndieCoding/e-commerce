import { CartController } from "./cart-controller.js";

export class Carrito extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.cartController = new CartController();
        this.lista = "";
        this.products = [];
    }

    getStyles() {
        return `
        <style>                   
            .carrito {
                opacity: 0;
                transform: translateX(-100%);
                width: 100px;
                transition: transform 0.3s ease, opacity 0.5s ease, width 0.5s ease;
                font-family: Arial, Helvetica, sans-serif;                
                background-color: white;
                padding: 30px; 
                border-radius: 5px;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                position: fixed;
                left: 0;
                top: 55px;
                z-index: 1000;
                max-height: 70vh; 
                outline: 2px solid #ccf0c5;  
                display: block;              
            }
            .carrito.open {                
                transform: translateX(0);
                opacity: 1;
                width: 290px;
            }

            .carrito-header {
                display: grid;
                grid-template-columns: 3fr 1fr 1fr;
                font-weight: 500;   
                text-align: center;
                font-size: 10px;
                color: #8da382ff;
                border-bottom: 1px solid #c5c5c5;
                padding: 5px 0;
                text-transform: uppercase;
                border-radius: 5px 5px 0 0;
            }

             .carrito-items {
                overflow-y: auto;
                max-height: 55vh;     
                scrollbar-color: #5da767 white;
                scrollbar-width: thin;            
            }

            .carrito-cerrar {
                position: absolute;
                top: 10px;
                right: 10px;
                background: transparent;
                border: none;
                font-size: 27px;
                cursor: pointer;
                z-index: 100;
            }

            .boton-vaciar-carrito,
            .carrito-comprar {                    
                flex: 1;
                font-size: 14px;
                font-weight: 500;
                border-radius: 5px;                
                border: none;  
                cursor: pointer;
            }

            .carrito-controles {
                margin-top: 20px;
                display: flex;
                justify-content: space-around;
                background-color: white;
                gap: 1.5em;

               .boton-vaciar-carrito {
                    background-color: transparent;
                    color: #999a9b;
                    padding: 10px 5px;
                    width: 45%;
                    transition: color 0.1s;
                    &:hover {
                        color: #f77000;
                        font-weight: bold;
                    }
                }
                .carrito-comprar {
                    background-color: #28a745;
                    color: white;
                    box-shadow: 1px 1px 2px 1px #82b845aa;
                    transition: filter 0.1s;
                    &:hover {
                        box-shadow: 0 0 0 0;
                        filter: brightness(1.1)
                    }
                } 
            }
        
            .empty-message {
                margin: 30px auto;
                font-weight: 200;
                text-align: center;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            }     

            .flecha-icon,
            .vaciar-icon {
                margin-left: 8px;
            }
        </style>
    `
    }

    getTemplate() {
        const template = document.createElement('template');
        template.innerHTML = `
        <div class="carrito">            
            <button class="carrito-cerrar">&times;</button>  
            <div class="carrito-header">
                <span>Producto</span>                
                <span>Subtotal</span>                
            </div>

            <div class="carrito-items"></div>
        
            <div class="carrito-controles">                
                <button class="carrito-comprar" onclick="window.location.href='/confirmar'">Confirmar<span class="flecha-icon">&#8702;</span></button>
                <button class="boton-vaciar-carrito">Vaciar<span class="vaciar-icon">&#10006;</span></button>
            </div>
        </div>

        ${this.getStyles()}
        `;
        return template.content.cloneNode(true);
    }

    connectedCallback() {
        this.shadowRoot.appendChild(this.getTemplate());
        this.lista = this.shadowRoot.querySelector('.carrito-items');
        this.products = this.cartController.getProducts();

        this.mostrarProductos();
        this.addEventListeners();

        document.addEventListener('actualizarCarrito', (event) => {
            this.products = event.detail;
            this.mostrarProductos();
            this.mostrarCarrito();
        });
    }
    addEventListeners() {
        this.shadowRoot.querySelector('.boton-vaciar-carrito').addEventListener('click', () => {
            this.products = [];
            document.dispatchEvent(new CustomEvent('vaciarCarrito', { detail: this.products }));
            this.mostrarProductos();
        });

        this.shadowRoot.querySelector('.carrito-cerrar').addEventListener('click', () => {
            this.ocultarCarrito();
        });
    }

    mostrarProductos() {
        this.lista.innerHTML = "";
        if (this.products.length > 0) {
            this.products.forEach(item => {
                const cartCard = this.cartController.generarCard(item);
                this.lista.appendChild(cartCard);
            })
        } else {
            this.displayMsg();
        }
    }

    mostrarCarrito() {
        if (window.location.pathname === '/confirmar') { return; }
        this.shadowRoot.querySelector('.carrito').classList.add('open');
    }
    ocultarCarrito() {
        this.shadowRoot.querySelector('.carrito').classList.remove('open');
    }
    displayMsg() {
        const mensaje = document.createElement('p');
        mensaje.className = 'empty-message';
        mensaje.textContent = 'El carrito está vacío';
        this.lista.appendChild(mensaje);
    }
}

customElements.define('carrito-del-mate', Carrito);