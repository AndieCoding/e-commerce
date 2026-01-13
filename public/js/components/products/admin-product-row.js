export class AdminProductRow extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    static get observedAttributes() {
        return ['id', 'image', 'name', 'type', 'brand', 'stock', 'price'];
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
            }
            .row:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 8px rgba(0,0,0,0.1);
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

    getTemplate() {
        const id = this.getAttribute('id');
        const image = this.getAttribute('image') || '/img/placeholder.png';
        const name = this.getAttribute('name') || 'Producto sin nombre';
        const type = this.getAttribute('type') || 'General';
        const stock = this.getAttribute('stock') || '0';
        const price = this.getAttribute('price') || '0';

        const template = document.createElement('template');
        template.innerHTML = `
            ${this.getStyles()}
            <div class="row">
                <div class="image-container">
                    <img src="${image}" alt="${name}" onerror="this.src='/img/placeholder.png'">
                </div>
                <div class="info">
                    <div class="name">${name}</div>
                    <div class="details">${type} | Stock total: ${stock} | $${price}</div>
                    <a href="/ficha?id=${id}" class="stock-link">Ver detalle de stock</a>
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
        return template.content.cloneNode(true);
    }

    render() {
        this.shadowRoot.innerHTML = '';
        this.shadowRoot.appendChild(this.getTemplate());

        this.shadowRoot.querySelector('.btn-delete').addEventListener('click', () => {
            if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
                this.dispatchEvent(new CustomEvent('delete-product', {
                    detail: { id: this.getAttribute('id') },
                    bubbles: true,
                    composed: true
                }));
            }
        });

        this.shadowRoot.querySelector('.btn-edit').addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('edit-product', {
                detail: { id: this.getAttribute('id') },
                bubbles: true,
                composed: true
            }));
        });
    }

    connectedCallback() {
        this.render();
    }

    attributeChangedCallback() {
        this.render();
    }
}

customElements.define('admin-product-row', AdminProductRow);
