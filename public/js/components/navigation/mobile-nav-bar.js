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
                background-color: white;
                border-top: 1px solid rgba(255, 255, 255, 0.3);
                padding-bottom: calc(10px + env(safe-area-inset-bottom));
                box-shadow: 0 -5px 20px rgba(0, 0, 0, 0.1);
            }

            .nav-item {
                display: flex;
                flex-direction: column;
                align-items: center;
                text-decoration: none;
                color: #555;
                padding: 10px 0;
                font-family: 'Poppins', sans-serif;
                font-size: 10px;
                transition: all 0.3s ease;
                gap: 4px;
                position: relative;
                width: 25%;
            }

            .nav-icon {
                fill: #84c08b;
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
                top: -20px;
                right: -70%;                
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
            scale: 1.2;
                color: #03640fff;
                font-weight: 600;
            }

            .nav-item.active .nav-icon {
                fill: #03640fff;
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
                    <svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#000000" viewBox="0 0 256 256"><path d="M219.31,108.68l-80-80a16,16,0,0,0-22.62,0l-80,80A15.87,15.87,0,0,0,32,120v96a8,8,0,0,0,8,8h64a8,8,0,0,0,8-8V160h32v56a8,8,0,0,0,8,8h64a8,8,0,0,0,8-8V120A15.87,15.87,0,0,0,219.31,108.68ZM208,208H160V152a8,8,0,0,0-8-8H104a8,8,0,0,0-8,8v56H48V120l80-80,80,80Z"></path></svg>
                    <span>Inicio</span>
                </a>
                <a href="/productos" class="nav-item ${currentPath === '/productos' ? 'active' : ''}">
                    <svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#000000" viewBox="0 0 256 256"><path d="M104,40H56A16,16,0,0,0,40,56v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V56A16,16,0,0,0,104,40Zm0,64H56V56h48v48Zm96-64H152a16,16,0,0,0-16,16v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V56A16,16,0,0,0,200,40Zm0,64H152V56h48v48Zm-96,32H56a16,16,0,0,0-16,16v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V152A16,16,0,0,0,104,136Zm0,64H56V152h48v48Zm96-64H152a16,16,0,0,0-16,16v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V152A16,16,0,0,0,200,136Zm0,64H152V152h48v48Z"></path></svg>
                    <span>Productos</span>
                </a>
                <div id="btn-carrito" class="nav-item">
                    <div class="icon-wrapper">
                        <svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#000000" viewBox="0 0 256 256"><path d="M104,216a16,16,0,1,1-16-16A16,16,0,0,1,104,216Zm88-16a16,16,0,1,0,16,16A16,16,0,0,0,192,200ZM239.71,74.14l-25.64,92.28A24.06,24.06,0,0,1,191,184H92.16A24.06,24.06,0,0,1,69,166.42L33.92,40H16a8,8,0,0,1,0-16H40a8,8,0,0,1,7.71,5.86L57.19,64H232a8,8,0,0,1,7.71,10.14ZM221.47,80H61.64l22.81,82.14A8,8,0,0,0,92.16,168H191a8,8,0,0,0,7.71-5.86Z"></path></svg>
                        <span id="cart-badge" class="badge">${this.cartController.getTotalProducts()}</span>
                    </div>
                    <span>Carrito</span>
                </div>
                <a href="${userLink}" class="nav-item ${currentPath === userLink ? 'active' : ''} ${this.user ? 'profile-img' : ''}">
                    <svg class="nav-icon" xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#000000" viewBox="0 0 256 256"><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24ZM74.08,197.5a64,64,0,0,1,107.84,0,87.83,87.83,0,0,1-107.84,0ZM96,120a32,32,0,1,1,32,32A32,32,0,0,1,96,120Zm97.76,66.41a79.66,79.66,0,0,0-36.06-28.75,48,48,0,1,0-59.4,0,79.66,79.66,0,0,0-36.06,28.75,88,88,0,1,1,131.52,0Z"></path></svg>
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
