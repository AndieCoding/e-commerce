import { TogglePass } from "./toggle-pass.js";
import { Manager } from "../../models/manager.js";

export class ConfirmWindow extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.userData = JSON.parse(localStorage.getItem('user'));
        this.manager = new Manager();
    }
    getStyles() {
        return `
        <style>
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
            background-color: white;
            border-radius: 5px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            align-items: center;
            padding: 10px;
        }

        .confirmWindow h1 {
            font-size: 20px;
            margin-bottom: 10px;
        }

        .confirmWindow p {
            text-align: center;
            font-size: 16px;
        }

        toggle-pass {
            width: 70%;
        }

        .confirmWindow button {        
            width: 80%;
            height: 30px;
            border-radius: 5px;
            border: 1px solid #ccc;
            padding: 0 10px;
            margin-top: 20px;
            background-color: rgb(6 169 62);
            color: white;
        }
        .close-button {
            position: absolute;
            top: 5%; 
            right: 5%;
            color: gray;
            cursor: pointer;
            
        }
            .loginError{
                color: red;
                font-size: 12px;
                font-weight: 500;
                text-align: center;
                max-width: 390px;
            }
        </style>
        `;
    }
    template() {
        const template = document.createElement('template');
        template.innerHTML = `
                ${this.getStyles()}
                <div class="confirmWindow">
                    <span class="close-button">&times;</span>
                    <h1>Confirmar cambios</h1>
                    <p>¿Está seguro de que desea cambiar la contraseña?</p>
                    <toggle-pass></toggle-pass>
                    <button id="confirm">Confirmar</button>                    
                </div>
                `;
        return template.content.cloneNode(true);
    }
    connectedCallback() {
        this.render();
        this.addEventListeners();
    }

    disconnectedCallback() {
        document.body.classList.remove('no-scroll');
    }

    render() {
        document.body.classList.add('no-scroll');
        this.shadowRoot.innerHTML = '';
        this.shadowRoot.appendChild(this.template());
    }
    addEventListeners() {
        const confirmBtn = this.shadowRoot.querySelector('#confirm');
        confirmBtn.addEventListener('click', () => {
            document.dispatchEvent(new CustomEvent('passRequest', { detail: true }));
        });
        document.addEventListener('passSubmitted', async (e) => {
            const dataVerification = { email: this.userData.EMAIL, pass: e.detail };
            const response = await this.manager.ingresar(dataVerification);
            if (response.success) {
                document.dispatchEvent(new CustomEvent('validationResponse', { detail: response.success }));
            } else {
                const div = document.createElement('div');
                div.classList.add('loginError');
                div.innerHTML = `<p><span>&#10006;</span> Los datos ingresados son incorrectos</p>`;
                this.shadowRoot.querySelector('div.confirmWindow').appendChild(div);
                setTimeout(() => {
                    div.remove();
                }, 2000);
            }
        });

        const close = this.shadowRoot.querySelector('span');
        close.addEventListener('click', () => {
            this.remove();
        });
    }
}

customElements.define('confirm-window', ConfirmWindow);