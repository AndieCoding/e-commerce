import { CartCard } from "../cart/cart-card.js";
export class ItemCard extends CartCard {
    constructor() {
        super();
    }

    getStyles() {
        return `
        <style>
        .carrito-item {
            display: flex;
            align-items: center;
            justify-content: space-around;
            padding: 10px 0;
            border-bottom: 1px solid #ddd;
            gap: 10px;
            width: 100%;
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

            .carrito-item-nombre {
                margin: 0;
                text-overflow: ellipsis;
                overflow: hidden;
                white-space: nowrap;
                width: 100%;
            }
        }

        .carrito-item-controles {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 1px;            
            
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
            width: 90px;
        }

        .carrito-item-precio {
            font-size: 18px;
            color: #333;
            width: 90px;
            text-align: right;
            font-weight: 100;
        }

        .eliminar-item {
            background-color: transparent;
            border: none;
            cursor: pointer;

            img {
            width: 30px;
            height: 40px;
            }
        }
             
        </style>
        `
    }
}

customElements.define('item-card', ItemCard);