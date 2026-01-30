export class AdminMobileNavBar extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
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
                background: rgba(228, 255, 239, 0.63);
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
                font-family: 'Roboto', 'Poppins', sans-serif;
                font-size: 11px;
                transition: all 0.3s ease;
                gap: 4px;
                position: relative;
                width: 25%;
                cursor: pointer;
            }

            .nav-item img {
                width: 24px;
                height: 24px;
                filter: grayscale(1) opacity(0.7);
                transition: all 0.3s ease;
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
                <a href="/panel-altas" class="nav-item ${currentPath === '/panel-altas' ? 'active' : ''}">
                    <img src="/img/icons/plus.svg" alt="Nuevo">
                    <span>Nuevo</span>
                </a>
                <a href="/panel-administrar" class="nav-item ${currentPath === '/panel-administrar' ? 'active' : ''}">
                    <img src="/img/icons/gear.svg" alt="Administrar">
                    <span>Administrar</span>
                </a>
                <a href="/panel-informes" class="nav-item ${currentPath === '/panel-informes' ? 'active' : ''}">
                    <img src="/img/icons/graph.svg" alt="Informes">
                    <span>Informes</span>
                </a>
                <a href="/" class="nav-item">
                    <img src="/img/icons/store.svg" alt="Tienda">
                    <span>Tienda</span>
                </a>
            </nav>
        `;
    }
}

customElements.define('admin-mobile-nav-bar', AdminMobileNavBar);
