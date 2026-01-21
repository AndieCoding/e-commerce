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
                width: 90px;
                height: 90px;
                @media (width<900px){
                    width: 70px;
                    height: 70px;
                }
            }
           div {
                width: 120px;
                height: 120px;
                background-color: #6ca3565d;
                box-shadow: 0 0 4px 1px rgb(124, 159, 195, 0.3);
                border-radius: 10px;
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
                font-family: Roboto;
                text-align: center;
                margin-top: 5px;
                font-weight: 100;
                font-size: 12px;
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
                <img src="${this.img}" alt="${this.name}" loading="lazy">
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