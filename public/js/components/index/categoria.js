export class Categoria extends HTMLElement {
    constructor() {
        super();

        this.attachShadow({ mode: 'open' });
        this.img = '';
        this.name = '';
    }

    static get observedAttributes() {
        return ['img', 'name'];
    }
    attributeChangedCallback(att, oldValue, newValue) {
        if (att === 'img') {
            this.img = newValue;
        }
        if (att === 'name') {
            this.name = newValue;
        }
    }

    getStyles() {
        return `
        <style>
          :host-context(.product-card) div{
                width: 100px;
                height: 100px;
                @media (width<900px){
                    width: 70px;
                    height: 70px;
                }
            }
           div {
                width: 120px;
                height: 120px;
                background-color: greenyellow;
                outline: 2px solid rgba(0, 97, 5, 0.799);
                border-radius: 50%;
                overflow: hidden;
                cursor: pointer;
                @media (width<900px){
                    width: 80px;
                    height: 80px;
                }
            }        
            img {
                width: 100%;
                height: 100%;
                object-fit: contain;
            }
            h3 {
                text-transform: uppercase;
                font-family: Arial, Helvetica;
                text-align: center;
                margin-top: 10px;
                @media (width<900px){
                    font-size: 12px;
                    margin-top: 5px;
                }
            }
        </style>
        `;
    }
    template() {
        const template = document.createElement('template');
        template.innerHTML = `
            ${this.getStyles()}
            <div>
                <img src="${this.img}" alt="${this.name}">
            </div>
            <h3>${this.name}</h3>
        `;

        return template.content.cloneNode(true);
    }

    connectedCallback() {
        this.shadowRoot.appendChild(this.template());
        this.addEventListeners();
    }
    addEventListeners() {
        this.addEventListener('click', async () => {
            localStorage.setItem('categoria', this.name.toLowerCase());
            window.location.href = '/productos'
        });
    }
}

customElements.define('circulo-categoria', Categoria);