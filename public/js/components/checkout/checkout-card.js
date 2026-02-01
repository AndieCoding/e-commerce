export class CheckoutCard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.method = this.getAttribute('data-method') || '';
    }

    static get observedAttributes() {
        return ['img', 'title', 'data-method', 'description'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'img') {
            this.img = newValue;
        }
        if (name === 'title') {
            this._title = newValue;
        }
        if (name === 'description') {
            this.description = newValue;
        }
        if (name === 'method') {
            this.method = newValue;
        }
    }

    getStyles() {
        return `
        <style>
            .checkout-card {
                background: #fdfdfd;
                padding: 1.5rem;
                cursor: pointer;
                border-radius: 12px;
                display: flex;
                flex-direction: column;
                align-items: center;
                text-align: center;
                position: relative;
            }
            .checkout-card .icon {
                width: 64px;
                height: 64px;
                object-fit: contain;
            }

            .checkout-card h4 {
                margin: 0.5rem 0;
                font-size: 1.1rem;
                font-weight: 600;
            }

            .checkout-card p {
                font-size: 0.9rem;
                color: #777;
                margin: 0;
            }
        </style>
        `;
    }

    getTemplate() {
        return `
        ${this.getStyles()}
        <div class="checkout-card" data-method="${this.method}" role="button" tabindex="0">
            <img class="icon" src="${this.img}" alt="${this.title}">
            <h4>${this._title}</h4>
            <p>${this.description}</p>
        </div>
        `;
    }

    connectedCallback() {
        this.render();
    }

    render() {
        this.shadowRoot.innerHTML = this.getTemplate();
    }
}
customElements.define('checkout-card', CheckoutCard);