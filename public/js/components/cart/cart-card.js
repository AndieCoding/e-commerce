import { Producto } from "../../models/producto.js";

export class CartCard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.productId = 0;
        this.subtotal = 0;
        this.productPrice = 0;
        this._item = null;
    }

    attributeChangedCallback(att, oldValue, newValue) {
        if (att === 'quantity') {
            this.productQuantity = newValue;
        }
    }
    set data(value) {
        this._item = value instanceof Producto ? value : new Producto(value);
        this.render();
    }
    get data() {
        return this._item;
    }

    getStyles() {
        return `
        <style>
        :host-context(.carrito-items-confirmar){
            .carrito-item-detalles {            
                overflow: hidden;
                width: 200px;  
                @media (max-width: 768px) {
                    width: 120px;
                }          

                .carrito-item-nombre {
                    margin: 0;
                    text-overflow: ellipsis;
                    overflow: hidden;
                    white-space: nowrap;
                    width: 100%;
                    color: #343f4d;
                    text-transform: Capitalize;
                    font-size: 18px;
                    margin-bottom: 5px;
                    font-weight: 100;
                }
            }

        }

        .carrito-item {
            display: flex;
            align-items: center;
            justify-content: space-around;
            border-bottom: 1px solid #ddd;
            gap: 10px;
            width: 100%;
            padding: 5px 0;
        }

        .img-container {
            width: 80px;
            height: 80px;
            margin-right: 10px;   

            .carrito-item-imagen {            
                width: 100%;
                height: 100%;
                object-fit: contain;
            }
        }

        .carrito-item-detalles {            
            overflow: hidden;
            width: 100px;            

            .carrito-item-nombre {
                margin: 0;
                text-overflow: ellipsis;
                overflow: hidden;
                white-space: nowrap;
                width: 100%;
                color: #343f4d;
                text-transform: Capitalize;
                font-size: 14px;
                margin-bottom: 5px;
                font-weight: 100;
            }
        }

        .carrito-item-controles {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 2px;
            width: 67px;
            
            .cantidad-restar,
            .cantidad-sumar {
                background-color: #28a745;
                color: white;
                border: none;            
                cursor: pointer;
                border-radius: 3px;
            }
            .cantidad-sumar.disabled {
                font-size: 10px;
                background-color: transparent;
                border-radius: 3px;
                cursor: not-allowed;
                pointer-events: none;
                color: #345310;
                width: fit-content;
            }

            .carrito-item-cantidad {
                width: 20px;
                text-align: center;
                border: none;
            }

        }
       
        input[type="number"] {
            -moz-appearance: textfield;
            appearance: textfield;
        }
        /*chrome*/
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button {
            -webkit-appearance: none;
        }

        .carrito-item-subtotal {
            text-align: center;
            width: 70px;
        }

        .carrito-item-precio {
            font-size: 16px;
            color: #333;
            width: 70px;
            text-align: right;
            font-weight: 100;
        }

        .eliminar-item {
            background-color: transparent;
            border: none;
            cursor: pointer;

            img {
            width: 20px;
            height: 25px;
            }
        }          
        </style>
        `
    }
    getTemplate() {
        const { id, nombre, imagen, precio, stock, estaAgotado, oferta } = this._item;
        this.productId = id;
        this.productPrice = Number(this.getAttribute('price') || 'Product Price');
        this.productQuantity = Number(this.getAttribute('quantity') || '1');
        this.stock = stock;
        const template = document.createElement('template');
        template.innerHTML = `        
        ${this.getStyles()}
        <div class="carrito-item">
            <div class="img-container">
                <img src="${imagen}" alt="${nombre}" class="carrito-item-imagen" />
            </div>
            <div>
                <div class="carrito-item-detalles">
                    <h3 class="carrito-item-nombre">${nombre}</h3>
                </div>
                <div class="carrito-item-controles">
                    <button id="restar-btn" class="cantidad-restar">-</button>
                    <input id="input-cantidad" type="number" class="carrito-item-cantidad" value="${this.productQuantity}" min="1" max="${this.stock}" disabled />
                    <button id="sumar-btn" class="cantidad-sumar">+</button>
                </div>
            </div>
            <div class="carrito-item-subtotal">
                <h2 class="carrito-item-precio">$ ${oferta ? oferta * this.productQuantity : precio * this.productQuantity}</h2>
            </div>
            <div class="carrito-item-eliminar">
                <button class="eliminar-item">
                    <img src="/img/icons/basura1.png" alt="Eliminar" />
                </button>
            </div>
        </div>
        `;
        return template.content.cloneNode(true);
    }
    render() {
        this.shadowRoot.innerHTML = '';
        this.shadowRoot.appendChild(this.getTemplate());
        this.addEventListeners();
    }
    connectedCallback() {
        this.render();
    }

    actualizarCantidad(id, cantidad) {
        document.dispatchEvent(new CustomEvent('actualizarCantidad', {
            detail: {
                productId: id,
                newQuantity: cantidad
            }
        }));
    }

    eliminarItem(id) {
        document.dispatchEvent(new CustomEvent('eliminarItem', { detail: id }));
    }

    addEventListeners() {
        const restarButton = this.shadowRoot.querySelector('#restar-btn');
        const sumarButton = this.shadowRoot.querySelector('#sumar-btn');
        const cantidadInput = this.shadowRoot.querySelector('#input-cantidad');

        sumarButton.addEventListener('click', async () => {
            cantidadInput.value++;
            if (cantidadInput.value >= this.stock) {
                cantidadInput.value = this.stock;
                sumarButton.innerHTML = 'Stock Límite';
                sumarButton.classList.add('disabled');
                restarButton.setAttribute('disabled', true);
                this.shadowRoot.querySelector('.carrito-item-controles').style.width = '120px';
                await new Promise(resolve => setTimeout(resolve, 3000));
                sumarButton.innerHTML = '+';
                sumarButton.classList.remove('disabled');
                restarButton.removeAttribute('disabled');
                this.shadowRoot.querySelector('.carrito-item-controles').style.width = '67px';
            }
            this.actualizarCantidad(this.productId, cantidadInput.value);
        });

        restarButton.addEventListener('click', () => {
            cantidadInput.value--;
            if (cantidadInput.value < 1) {
                cantidadInput.value = 1;
            }
            this.actualizarCantidad(this.productId, cantidadInput.value);
        });
        const eliminarButton = this.shadowRoot.querySelector('.eliminar-item');
        eliminarButton.addEventListener('click', () => {
            this.eliminarItem(this.productId);
            this.remove();
        });
    }
}

customElements.define('carrito-card', CartCard);