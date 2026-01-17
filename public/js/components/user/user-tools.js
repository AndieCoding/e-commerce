import { Manager } from "../../models/manager.js";
import { ConfirmWindow } from "./confirmWindow.js";

export class UserTools extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.edit = false;
        try {
            this.userData = JSON.parse(localStorage.getItem('user')) || {};
        } catch (e) {
            this.userData = {};
        }
        this.manager = new Manager();
    }
    static get observedAttributes() {
        return ['name'];
    }
    attributeChangedCallback(attr, oldValue, newValue) {
        if (attr === 'name') {
            this.name = newValue;
        }
    }

    getStyles() {
        return `
        <style>
        :host {
            display: flex;            
            justify-content: space-between;
            align-items: center;
        }
        :host(:hover){
        cursor: default;
            p {
                color: #005500;
            }
        }
        p{
            font-size: 14px;
            color: gray;
        }
        img {
            display: inline-block;
            width: 16px;
            cursor: pointer;
        }

        .checkIcon, .cancelIcon {
            width: 20px;
            margin-left: 5px;
        }   
        </style>
        `;
    }
    template() {
        const template = document.createElement('template');
        template.innerHTML = `
            <div>
            <label><slot name="label"></slot></label>
            <p id="${this.name}">
            ${this.userData[this.name] == "" || !this.userData[this.name] || this.name === 'PASSWORD' ? "" : this.userData[this.name]}</p>
            </div>
        `;
        if (!this.edit) {
            template.innerHTML += `            
            ${this.getStyles()}     
            <div>   
            <img 
            id="editIcon" 
            src="/img/icons/edit.png" 
            alt="Editar" 
            name="${this.name}" />
            </div>`;
        } else {
            template.innerHTML += `
            ${this.getStyles()}
            <div>
            <img 
            id="checkIcon" 
            class="checkIcon" 
            src="/img/icons/check.png" 
            alt="Guardar" 
            name='${this.name}' />
            <img 
            id="cancelIcon" 
            class="cancelIcon" 
            src="/img/icons/undo.png" 
            alt="Undo" 
            name='${this.name}' />
            </div>
            `;
        }

        return template.content.cloneNode(true);
    }
    connectedCallback() {
        this.render();
        this.addEventListeners();
        window.addEventListener('userUpdated', (e) => {
            this.userData = e.detail;
            this.render();
            this.addEventListeners();
        });
    }

    render() {
        this.shadowRoot.innerHTML = '';
        this.shadowRoot.appendChild(this.template());
    }

    addEventListeners() {
        const editIcon = this.shadowRoot.querySelector('#editIcon');
        const checkIcon = this.shadowRoot.querySelector('#checkIcon');
        const cancelIcon = this.shadowRoot.querySelector('#cancelIcon');

        if (!this.edit) {
            editIcon.addEventListener('click', () => {
                this.toggleEdit('edit', this.name);
            });
        }
        else {
            checkIcon.addEventListener('click', () => {
                this.toggleEdit('check');
            });
            cancelIcon.addEventListener('click', () => {
                this.toggleEdit('cancel');
            });
        }
    }

    toggleEdit(string, type) {

        this.edit = !this.edit;
        if (string === 'edit' && type === 'PASSWORD') {
            const passwordValidated = this.confirmWindow();
            if (passwordValidated) {
                this.render();
            }
            return;
        }
        switch (string) {
            case 'edit':
                this.render();
                this.habilitarEdicion();
                this.addEventListeners();
                break;
            case 'check':
                this.terminarEdicion('check');
                this.render();
                this.addEventListeners();
                break;
            case 'cancel':
                this.terminarEdicion('cancel');
                this.render();
                this.addEventListeners();
                break;
            default:
                break;
        }
    }

    confirmWindow() {
        const confirmWindow = document.createElement('confirm-window');
        this.shadowRoot.appendChild(confirmWindow);

        document.addEventListener('validationResponse', async (e) => {
            const passwordValidated = e.detail;
            confirmWindow.remove();
            if (!passwordValidated) {
                return false;
            } else {
                this.render();
                this.habilitarEdicion();
                this.addEventListeners();
            }
        });
        confirmWindow.addEventListener('cancel', () => {
            this.terminarEdicion('cancel');
            this.addEventListeners();
        });

    }

    habilitarEdicion() {
        const p = this.shadowRoot.querySelector(`#${this.name}`);
        const input = document.createElement("input");
        input.type = "text";
        input.setAttribute('id', this.name);
        input.value = this.userData[this.name];
        p.replaceWith(input);
        input.focus();
    };

    terminarEdicion(string) {
        const p = document.createElement('p');
        const input = this.shadowRoot.querySelector(`#${this.name}`);
        const newValue = input.value;
        if (newValue === "" || string === 'cancel') {
            p.textContent = this.userData[this.name];
            input.replaceWith(p);
            this.render();
            return;
        }
        this.userData[this.name] = newValue;
        p.textContent = newValue;
        input.replaceWith(p);
        const response = this.manager.actualizar({ [this.name]: newValue });
        if (response.success) {
            this.userData[this.name] = newValue;
            this.render();
        }
    }
}

customElements.define('user-tools', UserTools);