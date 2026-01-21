import { CartController } from '../cart/cart-controller.js';

export class MobileNavBar extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.cartController = new CartController();

    }

    connectedCallback() {
        this.render();

        if (!this.hasGlobalListeners) {
            document.addEventListener('actualizarTotalProducts', (event) => {
                const badge = this.shadowRoot.querySelector('#cart-badge');
                if (badge) {
                    badge.textContent = event.detail !== undefined ? event.detail : this.cartController.getTotalProducts();
                }
            });
            this.hasGlobalListeners = true;
        }
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

            @media (max-width: 800px) {
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
            }

            .nav-item img {
                width: 24px;
                height: 24px;
                filter: grayscale(1) opacity(0.7);
                transition: all 0.3s ease;
            }

            .icon-wrapper {
                position: relative;
                display: flex;
                flex-direction: column;
                align-items: center;
            }

            .badge {
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

    render() {
        const currentPath = window.location.pathname;

        this.shadowRoot.innerHTML = `
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
                <a href="/login" class="nav-item ${currentPath === '/login' ? 'active' : ''}">
                    <img src="/img/icons/login-green.svg" alt="Cuenta">
                    <span>Cuenta</span>
                </a>
            </nav>
        `;
        this.shadowRoot.querySelector('#btn-carrito').addEventListener('click', () => {
            document.dispatchEvent(new CustomEvent('toggleCarrito'));
        });

    }
}

customElements.define('mobile-nav-bar', MobileNavBar);
