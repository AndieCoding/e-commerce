import { Carrito } from "../cart/carrito.js";
export class ConfirmCart extends Carrito {
    constructor() {
        super();        
    }
    getStyles() {
        return `
        <style>
                
        .carrito-cerrar, 
        div.carrito-header,
        div.carrito-controles {
        display: none;
        }

        div.carrito-item {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
            align-items: center;
            padding: 10px 0;
            border-bottom: 1px solid #ddd;
            text-align: center;
        }

        .carrito-item-imagen {
            width: 80px;
            height: 80px;
            object-fit: cover;
            margin-right: 20px;
        }

        .carrito-item-detalles {
            flex-grow: 0.3;
        }

        .carrito-item-nombre {
            margin: 0;
            font-size: 18px;
            text-align: left;
        }

        .carrito-item-controles {
            display: flex;
            align-items: center;
            gap: 10px;
            justify-content: center;
        }

        .cantidad-restar,
        .cantidad-sumar {
            background-color: #28a745;
            color: white;
            border: none;
            padding: 5px 10px;
            cursor: pointer;
            border-radius: 3px;
        }

        .carrito-item-cantidad {
            width: 30px;
            text-align: center;
        }

        .carrito-item-subtotal {
            width: 100px;
            text-align: center;
        }

        .carrito-item-precio {
            font-size: 18px;
            color: #333;
            text-align: right;
        }

        .eliminar-item {
            background-color: transparent;
            border: none;
            cursor: pointer;
        }

        .eliminar-item img {
            width: 40px;
            height: 40px;
        }

        @media (max-width: 768px) {
            .carrito-item {
                grid-template-columns: 1fr 1fr;
                grid-row-gap: 10px;
                text-align: left;
            }

            .carrito-item-imagen {
                width: 60px;
                height: 60px;
            }

            .carrito-item-precio, .carrito-item-subtotal, .carrito-item-controles {
                text-align: left;
            }

            .carrito-item-detalles {
                grid-column: 1 / -1;
                margin-bottom: 10px;
            }

            .carrito-item-precio {
                grid-column: 1 / -1;
            }
        }

        @media (max-width: 480px) {
            .carrito-item-imagen {
                width: 50px;
                height: 50px;
            }

            .carrito-item-nombre {
                font-size: 14px;
            }

            .cantidad-restar, .cantidad-sumar {
                width: 30px;
            }
        }
        </style>`;    
    }
    template() {

    }
}
customElements.define('confirm-cart', ConfirmCart);