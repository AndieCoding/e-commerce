import { Producto } from '../../models/producto.js';

export class AdminProductRow extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.isLoading = true;
        this.tipo = 'list';
        this._item = null;
    }
    static get observedAttributes() {
        return ['tipo', 'loading'];
    }
    attributeChangedCallback(attr, oldValue, newValue) {
        if (attr === 'tipo') {
            this.tipo = newValue;
            this.render();
        }
        if (attr === 'loading') {
            this.isLoading = newValue === 'true';
            this.render();
        }
    }
    set data(value) {
        this._item = value instanceof Producto ? value : new Producto(value);
        this.render();
    }

    get data() {
        return this._item;
    }

    getStyles() {
        return `
        <style>
            :host {
                display: block;
                width: 100%;
            }
            .row {
                display: flex;
                align-items: center;
                gap: 1.5em;
                padding: 1em;
                background: white;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                transition: transform 0.2s, box-shadow 0.2s;
                border: 1px solid #eee;
                @media (width < 500px) {
                    flex-direction: column;
                }
            }
            .row:hover {
                transform: translateY(-1px);
                box-shadow: 0 3px 6px rgba(76, 136, 90, 0.2);
            }
            .image-container {
                width: 60px;
                height: 60px;
                border-radius: 50%;
                overflow: hidden;
                background: #f5f5f5;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
            }
            img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            .info {
                flex: 1;
                display: flex;
                flex-direction: column;
                gap: 0.2em;
            }
            .name {
                font-weight: 600;
                font-size: 1.1rem;
                color: #333;
            }
            .details {
                font-size: 0.9rem;
                color: #666;
            }
            .stock-link {
                font-size: 0.8rem;
                color: #4CAF50;
                text-decoration: none;
                font-weight: bold;
                margin-top: 0.3em;
                text-transform: uppercase;
            }
            .actions {
                display: flex;
                gap: 1em;
                align-items: center;
                @media (width < 500px) {
                    gap: 0;
                    justify-content: space-around;
                    width: 90%;   
                }
            }
            .btn-icon {
                background: transparent;
                border: none;
                cursor: pointer;
                padding: 0.5em;
                border-radius: 4px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #666;
                transition: background 0.2s, color 0.2s;
            }
            .btn-icon:hover {
                background: #f0f0f0;
            }
            .btn-edit:hover {
                color: #2196F3;
            }
            .btn-delete:hover {
                color: #F44336;
            }
            svg {
                width: 20px;
                height: 20px;
                fill: currentColor;
            }
        </style>
        `;
    }
    render() {
        this.shadowRoot.innerHTML = '';
        if (!this._item) {
            this.renderSkeleton();
        } else {
            this.renderContent();
        }

    }

    renderSkeleton() {
        this.shadowRoot.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Bebas+Neue&family=Roboto+Condensed:ital,wght@0,100..900;1,100..900&display=swap');                        
            * {
                box-sizing: border-box;
            }
            .card {
                border-radius: 10px;
                padding: 0.5em 1.2em;                
                overflow: hidden;
                box-shadow: 0 0 4px 1px rgb(124, 159, 195, 0.3);
                background-color: white;
                position: relative;
                display: flex;
                flex-direction: column;    
                
                gap: 10px;
            }
            .card.list {
                display: grid;
                grid-template-columns: 1fr 2fr;               
                width: 100%; 
                height: 100%;
                max-width: 800px;
                gap: 20px;
                padding: 15px 5px;
            }
            .skeleton {
                background: #eee;
                background: linear-gradient(110deg, #ececec 8%, #f5f5f5 18%, #ececec 33%);
                border-radius: 5px;
                background-size: 200% 100%;
                animation: 1.5s shine linear infinite;
            }
            @keyframes shine {
                to {
                    background-position-x: -200%;
                }
            }
            .skeleton-img {
                height: 170px;
                width: 100%;
            }
            .card.list .skeleton-img {
                height: 120px;
            }
            .skeleton-title {
                height: 20px;
                width: 80%;
                margin: 10px 0;
            }
            .skeleton-text {
                height: 15px;
                width: 60%;
            }
            .skeleton-button {
                height: 40px;
                width: 100%;
                margin-top: 10px;
            }
            @media (width<900px) {
                .card {
                    padding: 8px;
                    width: 100%;
                }
                .skeleton-img {
                    height: 100px;
                }
            }
        </style>
        <div class="card ${this.tipo === 'list' ? 'list' : ''}">
            <div class="skeleton skeleton-img"></div>
            <div class="skeleton-info">
                <div class="skeleton skeleton-title"></div>
                <div class="skeleton skeleton-text"></div>
                <div class="skeleton skeleton-button"></div>
            </div>
        </div>
        `;
    }

    renderContent() {
        const { id, nombre, imagen, stock, precioHtml, estaAgotado } = this._item;

        const type = this.getAttribute('type') || 'General';

        const template = document.createElement('template');
        template.innerHTML = `
            ${this.getStyles()}
            <div class="row">
                <div class="image-container">
                    <img src="${imagen}" alt="${nombre}" onerror="this.src='/img/placeholder.png'">
                </div>
                <div class="info">
                    <div class="name">${nombre}</div>
                    <div class="details">${type} | Stock total: ${stock} | $${precioHtml}</div>
                    <!--<a href="/ficha?id=${id}" class="stock-link">Ver detalle de stock</a>-->
                </div>
                <div class="actions">
                    <button class="btn-icon btn-edit" title="Modificar">
                        <svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                    </button>
                    <button class="btn-icon btn-delete" title="Borrar">
                        <svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                    </button>
                </div>
            </div>
        `;
        this.shadowRoot.appendChild(template.content.cloneNode(true));
    }

    addEventListeners() {
        this.shadowRoot.querySelector('.btn-delete').addEventListener('click', () => {
            if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
                this.dispatchEvent(new CustomEvent('delete-product', {
                    detail: { id: this._item.id },
                    bubbles: true,
                    composed: true
                }));
            }
        });

        this.shadowRoot.querySelector('.btn-edit').addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('edit-product', {
                detail: { id: this._item.id },
                bubbles: true,
                composed: true
            }));
        });
    }

    connectedCallback() {
        this.render();
        this.addEventListeners();
    }
}

customElements.define('admin-product-row', AdminProductRow);
