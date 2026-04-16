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

    render() {
        const currentPath = window.location.pathname;

        this.shadowRoot.innerHTML = `
            ${this.getStyles()}
            <nav class="nav-container">
                <a href="/panel-altas" class="nav-item ${currentPath === '/panel-altas' ? 'active' : ''}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#000000" viewBox="0 0 256 256"><path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z"></path></svg>
                    <span>Nuevo</span>
                </a>
                <a href="/panel-administrar" class="nav-item ${currentPath === '/panel-administrar' ? 'active' : ''}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#000000" viewBox="0 0 256 256"><path d="M128,80a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Zm109.94-52.79a8,8,0,0,0-3.89-5.4l-29.83-17-.12-33.62a8,8,0,0,0-2.83-6.08,111.91,111.91,0,0,0-36.72-20.67,8,8,0,0,0-6.46.59L128,41.85,97.88,25a8,8,0,0,0-6.47-.6A112.1,112.1,0,0,0,54.73,45.15a8,8,0,0,0-2.83,6.07l-.15,33.65-29.83,17a8,8,0,0,0-3.89,5.4,106.47,106.47,0,0,0,0,41.56,8,8,0,0,0,3.89,5.4l29.83,17,.12,33.62a8,8,0,0,0,2.83,6.08,111.91,111.91,0,0,0,36.72,20.67,8,8,0,0,0,6.46-.59L128,214.15,158.12,231a7.91,7.91,0,0,0,3.9,1,8.09,8.09,0,0,0,2.57-.42,112.1,112.1,0,0,0,36.68-20.73,8,8,0,0,0,2.83-6.07l.15-33.65,29.83-17a8,8,0,0,0,3.89-5.4A106.47,106.47,0,0,0,237.94,107.21Zm-15,34.91-28.57,16.25a8,8,0,0,0-3,3c-.58,1-1.19,2.06-1.81,3.06a7.94,7.94,0,0,0-1.22,4.21l-.15,32.25a95.89,95.89,0,0,1-25.37,14.3L134,199.13a8,8,0,0,0-3.91-1h-.19c-1.21,0-2.43,0-3.64,0a8.08,8.08,0,0,0-4.1,1l-28.84,16.1A96,96,0,0,1,67.88,201l-.11-32.2a8,8,0,0,0-1.22-4.22c-.62-1-1.23-2-1.8-3.06a8.09,8.09,0,0,0-3-3.06l-28.6-16.29a90.49,90.49,0,0,1,0-28.26L61.67,97.63a8,8,0,0,0,3-3c.58-1,1.19-2.06,1.81-3.06a7.94,7.94,0,0,0,1.22-4.21l.15-32.25a95.89,95.89,0,0,1,25.37-14.3L122,56.87a8,8,0,0,0,4.1,1c1.21,0,2.43,0,3.64,0a8.08,8.08,0,0,0,4.1-1l28.84-16.1A96,96,0,0,1,188.12,55l.11,32.2a8,8,0,0,0,1.22,4.22c.62,1,1.23,2,1.8,3.06a8.09,8.09,0,0,0,3,3.06l28.6,16.29A90.49,90.49,0,0,1,222.9,142.12Z"></path></svg>
                    <span>Administrar</span>
                </a>
                <a href="/panel-informes" class="nav-item ${currentPath === '/panel-informes' ? 'active' : ''}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#000000" viewBox="0 0 256 256"><path d="M232,208a8,8,0,0,1-8,8H32a8,8,0,0,1-8-8V48a8,8,0,0,1,16,0V156.69l50.34-50.35a8,8,0,0,1,11.32,0L128,132.69,180.69,80H160a8,8,0,0,1,0-16h40a8,8,0,0,1,8,8v40a8,8,0,0,1-16,0V91.31l-58.34,58.35a8,8,0,0,1-11.32,0L96,123.31l-56,56V200H224A8,8,0,0,1,232,208Z"></path></svg>
                    <span>Informes</span>
                </a>
                <a href="/" class="nav-item">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#000000" viewBox="0 0 256 256"><path d="M232,96a7.89,7.89,0,0,0-.3-2.2L217.35,43.6A16.07,16.07,0,0,0,202,32H54A16.07,16.07,0,0,0,38.65,43.6L24.31,93.8A7.89,7.89,0,0,0,24,96h0v16a40,40,0,0,0,16,32v72a8,8,0,0,0,8,8H208a8,8,0,0,0,8-8V144a40,40,0,0,0,16-32V96ZM54,48H202l11.42,40H42.61Zm50,56h48v8a24,24,0,0,1-48,0Zm-16,0v8a24,24,0,0,1-35.12,21.26,7.88,7.88,0,0,0-1.82-1.06A24,24,0,0,1,40,112v-8ZM200,208H56V151.2a40.57,40.57,0,0,0,8,.8,40,40,0,0,0,32-16,40,40,0,0,0,64,0,40,40,0,0,0,32,16,40.57,40.57,0,0,0,8-.8Zm4.93-75.8a8.08,8.08,0,0,0-1.8,1.05A24,24,0,0,1,168,112v-8h48v8A24,24,0,0,1,204.93,132.2Z"></path></svg>
                    <span>Tienda</span>
                </a>
            </nav>
        `;
    }
}

customElements.define('admin-mobile-nav-bar', AdminMobileNavBar);
