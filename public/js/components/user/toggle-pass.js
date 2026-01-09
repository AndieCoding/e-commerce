export class TogglePass extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.mostrar = false;
    }
    getStyles() {
        return `
        <style>
        div {
            position: relative;
        }
        input {
            width: 95%;
            padding: 0.5em;
            border-radius: 8px;
            border: 0.5px solid rgba(72, 72, 72, 0.308);
            box-shadow: 1px 1px rgba(128, 128, 128, 0.875);
        }
        img {
            display: none;
            width: 30px;
            cursor: pointer;
            position: absolute;
            top: 0;
            right: 0;
        }
        </style>`;
    }
    template() {
        const template = document.createElement('template');
        template.innerHTML = `
        ${this.getStyles()}
        <div>
        <input type="password" id="pass"/><img
            id="img-open-eye"
            class="eye-icon"
            src="/img/icons/open-eye.png"
        />
        </div>
        `;
        return template.content.cloneNode(true);
    }
    connectedCallback() {
        this.render();
        this.addEventListeners();
    }

    render() {
        this.shadowRoot.innerHTML = '';
        this.shadowRoot.appendChild(this.template());
    }

    addEventListeners() {
        const pass = this.shadowRoot.getElementById("pass");
        const eye = this.shadowRoot.querySelector('img');

        pass.addEventListener('input', () => {
            if (pass.value !== "") {
                eye.style.display = "inline-block";
            }
        });

        eye.addEventListener('click', () => {
            pass.type = pass.type === "text" ? "password" : "text";
            eye.src = eye.src.includes("open") ? "/img/icons/close-eye.png" : "/img/icons/open-eye.png";
        });

        document.addEventListener('passRequest', () => {
            document.dispatchEvent(new CustomEvent('passSubmitted', {
                detail: pass.value
            }));
        });
    }
}

customElements.define('toggle-pass', TogglePass);