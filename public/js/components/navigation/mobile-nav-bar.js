import { CartController } from '../cart/cart-controller.js';

export class MobileNavBar extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.cartController = new CartController();
        this.user = JSON.parse(localStorage.getItem('user'));
    }
    getStyles() {
        return `
        <style>
            :host {
                display: none;
                position: fixed;
                bottom: 0 !important;
                left: 0;
                width: 100%;
                z-index: 9999;
                pointer-events: none;
            }

            @media (max-width: 700px) {
                :host {
                    display: block;
                }
            }

            .nav-container {
                pointer-events: auto;
                display: flex;
                justify-content: space-around;
                align-items: center;
                background: #e4ffefa1;
                backdrop-filter: blur(15px);
                -webkit-backdrop-filter: blur(15px);
                border-top: 1px solid rgba(255, 255, 255, 0.3);
                padding: 10px 0;
                padding-bottom: calc(10px + env(safe-area-inset-bottom));
                box-shadow: 0 -5px 20px rgba(0, 0, 0, 0.1);
            }

            .nav-item {
                display: flex;
                flex-direction: column;
                align-items: center;
                text-decoration: none;
                color: #555;
                font-family: 'Poppins', sans-serif;
                font-size: 10px;
                transition: all 0.3s ease;
                gap: 4px;
                position: relative;
                width: 25%;
            }

            .nav-item img {
                width: 24px;
                height: 24px;
                filter: grayscale(1) opacity(0.7);
                transition: all 0.3s ease;
            }

            .nav-item.profile-img img {
                border-radius: 50%;
                filter: none;
                opacity: 1;
                border: 1px solid #ddd;
                object-fit: cover;
            }

            .icon-wrapper {
                position: relative;
                display: flex;
                flex-direction: column;
                align-items: center;
            }

            .badge {
                padding: 10px;
                position: absolute;
                top: -8px;
                right: -12px;                
                color: rgb(41, 126, 49);
                font-size: 16px;
                font-weight: bold;
                width: 15px;
                height: 15px;
                border-radius: 50%;
                display: block;
                align-items: center;
                justify-content: center;
            }

            .nav-item.active {
                color: rgb(41, 126, 49);
                font-weight: 600;
            }

            .nav-item.active img {
                filter: none;
                opacity: 1;
                transform: translateY(-2px);
            }

            .nav-item.active::after {
                content: '';
                position: absolute;
                bottom: -8px;
                width: 15px;
                height: 3px;
                background-color: rgb(41, 126, 49);
                border-radius: 10px;
                box-shadow: 0 0 8px rgba(41, 126, 49, 0.5);
            }

            .nav-item:hover {
                color: #222;
            }
            
            .nav-item:hover img {
                opacity: 1;
            }
        </style>
        `;
    }
    getTemplate() {
        const currentPath = window.location.pathname;
        const userLink = this.user ? '/user_menu' : '/login';
        const userLabel = this.user ? 'Perfil' : 'Ingresar';
        const template = document.createElement('template');
        template.innerHTML = `
            ${this.getStyles()}
            <nav class="nav-container">
                <a href="/" class="nav-item ${currentPath === '/' ? 'active' : ''}">
                    <img src="/img/icons/home.svg" alt="Inicio">
                    <span>Inicio</span>
                </a>
                <a href="/productos" class="nav-item ${currentPath === '/productos' ? 'active' : ''}">
                    <img src="/img/icons/grid.svg" alt="Productos">
                    <span>Productos</span>
                </a>
                <div id="btn-carrito" class="nav-item">
                    <div class="icon-wrapper">
                        <img src="/img/icons/cart.svg" alt="Carrito">
                        <span id="cart-badge" class="badge">${this.cartController.getTotalProducts()}</span>
                    </div>
                    <span>Carrito</span>
                </div>
                <a href="${userLink}" class="nav-item ${currentPath === userLink ? 'active' : ''} ${this.user ? 'profile-img' : ''}">
                    <img src="${this.user.foto !== '' ? this.user.foto : '/img/icons/user.svg'}" alt="${userLabel}" loading="lazy">
                    <span>${userLabel}</span>
                </a>
            </nav>
        `;
        return template.content.cloneNode(true);
    }
    render() {
        this.shadowRoot.innerHTML = '';
        this.shadowRoot.appendChild(this.getTemplate());

        const btnCarrito = this.shadowRoot.querySelector('#btn-carrito');
        if (btnCarrito) {
            btnCarrito.addEventListener('click', () => {
                document.dispatchEvent(new CustomEvent('toggleCarrito'));
            });
        }
    }
    connectedCallback() {
        this.render();

        this._actualizarBadge = () => {
            const badge = this.shadowRoot.querySelector('#cart-badge');
            if (badge) {
                badge.textContent = this.cartController.getTotalProducts();
            }
        }
        document.addEventListener('actualizarTotalProducts', this._actualizarBadge);

        this._onUserUpdated = (e) => {
            this.user = e.detail;
            if (this.isConnected && this.user) { this.render(); }
        };
        window.addEventListener('userUpdated', this._onUserUpdated);

    }
    disconnectedCallback() {
        document.removeEventListener('actualizarTotalProducts', this._actualizarBadge);
        window.removeEventListener('userUpdated', this._onUserUpdated);
    }

}


customElements.define('mobile-nav-bar', MobileNavBar);
