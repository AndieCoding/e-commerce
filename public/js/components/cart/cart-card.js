export class CartCard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.productId = 0;
        this.subtotal = 0;
        this.productPrice = 0;
    }

    attributeChangedCallback(att, oldValue, newValue) {
        if (att === 'quantity') {
            this.productQuantity = newValue;
        }
    }

    getStyles() {
        return `
        <style>
        :host-context(.carrito-items-confirmar){
            .carrito-item-detalles {            
                overflow: hidden;
                width: 200px;            

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

            .carrito-item-cantidad {
                width: 20px;
                text-align: center;
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

    connectedCallback() {
        this.productId = this.getAttribute('id') || '';
        const productImage = this.getAttribute('image') || '';
        const productName = this.getAttribute('name') || 'Product Name';
        this.productPrice = Number(this.getAttribute('price') || 'Product Price');
        this.productQuantity = Number(this.getAttribute('quantity') || '1');
        this.stock = this.getAttribute('stock') || 0;

        this.shadowRoot.innerHTML = `        
        <div class="carrito-item">
            <div class="img-container">
                <img src="${productImage}" alt="${productName}" class="carrito-item-imagen" />
            </div>
            <div>
            <div class="carrito-item-detalles">
                <h3 class="carrito-item-nombre">${productName}</h3>
            </div>
            <div class="carrito-item-controles">
                <button class="cantidad-restar">-</button>
                <input type="number" class="carrito-item-cantidad" value="${this.productQuantity}" min="1" />
                <button class="cantidad-sumar">+</button>
            </div>
            </div>
            <div class="carrito-item-subtotal">
                <h2 class="carrito-item-precio">$${this.productPrice * this.productQuantity}</h2>
            </div>
            <div class="carrito-item-eliminar">
                <button class="eliminar-item">
                    <img src="/img/icons/basura1.png" alt="Eliminar" />
                </button>
            </div>
        </div>

        ${this.getStyles()}
        `;


        this.addEventListeners();
    }

    actualizarCantidad(id, cantidad) {
        this.stock = cantidad;
        document.dispatchEvent(new CustomEvent('actualizarCantidad', {
            detail: {
                productId: id,
                newQuantity: cantidad
            }
        }))
    }

    eliminarItem(id) {
        document.dispatchEvent(new CustomEvent('eliminarItem', { detail: id }));
    }

    addEventListeners() {
        const restarButton = this.shadowRoot.querySelector('.cantidad-restar');
        const sumarButton = this.shadowRoot.querySelector('.cantidad-sumar');
        const cantidadInput = this.shadowRoot.querySelector('.carrito-item-cantidad');

        sumarButton.addEventListener('click', () => {

            if (cantidadInput.value == this.stock) {
                cantidadInput.value = Number(this.stock);
            } else {
                cantidadInput.value = Number(this.productQuantity + 1);
            }

            this.actualizarCantidad(this.productId, cantidadInput.value), this.stock;
        });

        restarButton.addEventListener('click', () => {
            const newQuantity = this.productQuantity - 1;
            if (newQuantity > 0) {
                cantidadInput.value = newQuantity;
                this.actualizarCantidad(this.productId, cantidadInput.value);
            }
        });

        cantidadInput.addEventListener('change', (event) => {
            if (isNaN(event.target.value) || event.target.value < 1) {
                event.target.value = 1;
            }
            this.actualizarCantidad(this.productId, event.target.value);
        });
        cantidadInput.addEventListener('keyup', (event) => {
            if (isNaN(event.target.value) || event.target.value < 1) {
                event.target.value = 1;
            }
            this.actualizarCantidad(this.productId, event.target.value);
        });

        const eliminarButton = this.shadowRoot.querySelector('.eliminar-item');
        eliminarButton.addEventListener('click', () => {
            this.eliminarItem(this.productId);
            this.remove();
        });
    }
}

customElements.define('carrito-card', CartCard);