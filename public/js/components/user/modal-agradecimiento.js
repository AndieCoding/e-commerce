import { Manager } from "../../models/manager.js";
import { ConfirmWindow } from "./confirmWindow.js";

export class ModalAgradecimiento extends ConfirmWindow {
    constructor() {
        super();
    }
    getStyles() {
        return `
        <style>
        @import url('https://fonts.googleapis.com/css2?family=Roboto+Condensed:ital,wght@0,100..900;1,100..900&display=swap');
        :host {
            display: flex;
            justify-content: center;
            align-items: center;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            z-index: 10;
        }

        .confirmWindow {        
            position: relative;
            width: 300px;
            height: 170px;
            background-color: white;
            border-radius: 5px;
            display: flex;
            flex-direction: column;
            justify-content: space-around;
            align-items: center;
            padding: 10px;
            font-family: Roboto Condensed;
            padding-bottom: 20px;
        }

        .confirmWindow h1 {
            font-size: 20px;
            margin-bottom: 10px;
        }

        .confirmWindow p {
            text-align: center;
            font-size: 16px;
        }

        button {        
            width: 80%;
            height: 30px;
            border-radius: 5px;
            border: 1px solid #ccc;
            padding: 0 10px;
            margin-top: 20px;
            background-color: rgb(6 169 62);
            color: white;
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 0.5em;
            cursor: pointer;
        }

        button.volver {
            background-color: rgb(6 169 130);
        }

        .close-button {
            position: absolute;
            top: 5%; 
            right: 5%;
            color: gray;
            cursor: pointer;
            
        }
        
        .icon-ir {
            font-size: 20px;
        }
       

        </style>
        `;
    }
    template() {
        const template = document.createElement('template');
        template.innerHTML = `
            ${this.getStyles()}
            <div class="confirmWindow">
                <h1>¡Gracias por confiar en nosotros!</h1>
                <button id="ver-factura">Ver factura<span class="icon-ir">&#8680;</span></button> 
                <button id="volver" class="volver">Volver a inicio</button>                    
            </div>
            `;
        return template.content.cloneNode(true);
    }

    addEventListeners() {
        const close = this.shadowRoot.querySelector('#volver');
        close.addEventListener('click', () => {
            this.remove();
            window.location.href = '/';
        });
        const verFactura = this.shadowRoot.querySelector('#ver-factura');
        verFactura.addEventListener('click', () => {
            const factura = localStorage.getItem('pdfUrl');
            if (!factura) {
                console.log('No hay factura');
                return;
            }
            window.open(factura, '_blank');
        });
        const volver = this.shadowRoot.querySelector('#volver');
        volver.addEventListener('click', () => {
            this.remove();
            localStorage.removeItem('pdfUrl');
            window.location.href = '/';
        });
    }
}

customElements.define('modal-agradecimiento', ModalAgradecimiento);