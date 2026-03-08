import { CartCard } from "../cart/cart-card.js";
export class SimpleItemCard extends CartCard {
    constructor() {
        super();
    }

    getStyles() {
        return `
        ${super.getStyles()}
        <style>
        .carrito-item-controles {display: none;}
        .carrito-item-eliminar {display: none;}
        .carrito-item{

        }
        .img-container{
            flex: 0 0 60px;
            min-width: 0;
        }
        .img-container img{
            max-width: 50px;            
        }
        
        .carrito-item-detalles{
            flex: 2;
            min-width: 0;
            width: 100%;
            @media (max-width: 500px) {
                max-width: 150px;
            }
            .carrito-item-nombre{
                font-size: 16px;
            }
        }
        .carrito-item-precio {
            font-size: 16px;
            flex: 1;
            text-align: right;   
            white-space: nowrap; 
        }
        </style>
        `
    }
}

customElements.define('simple-item-card', SimpleItemCard);