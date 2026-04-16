export class Footer extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }
    getStyles() {
        return `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Roboto+Condensed:ital,wght@0,100..900;1,100..900&display=swap');
            :host {
                display: flex;
                align-items: center;
                justify-content: center;
                flex-direction: column;
                background-color: var(--accent-color-active);
                color: white;
                padding: 1em;
                padding-bottom: 60px;
                text-align: center;
                font-family: Roboto Condensed;;
                ${window.location.pathname === '/' ? 'padding-bottom: 120px;justify-content: flex-end;position: absolute; z-index: 100;background: var(--footer-gradient); width: 100%; top: 0;' : ''}
                height: 180px;                
                gap: 30px;

                @media (width>800px) {
                height: 80px;
                    flex-direction: row;
                    margin-top: 40px;
                    ${window.location.pathname === '/' ? 'justify-content: center; align-items: end' : ''}
                }
            }
            a {
                color: white;
                text-decoration: none;
            }
            img {
                width: 50px;
                height: 50px;
            }
            p{
                font-size: 14px;
                font-weight: 200;
                backdrop-filter: blur(3px);
                border-radius: 5px;
                
                @media (max-width: 900px) {
                    font-size: 12px;
                }
            }
            .redes{
                display: flex;
                justify-content: center;
                gap: 20px;
            }
            .wa, .fb, .ig {
                fill: white;
            }
        </style>
        `;
    }
    template() {
        const template = document.createElement('template');
        const isMobile = window.innerWidth < 600;
        const isConfirmar = window.location.pathname === '/confirmar';
        const isEnvio = window.location.pathname === '/envio';
        const isMisDatos = window.location.pathname === '/mis_datos';
        const isUserMenu = window.location.pathname === '/user_menu';

        template.innerHTML = this.getStyles() +
            isConfirmar || isEnvio || isMisDatos || isUserMenu && isMobile ? '' : `
            <div class="redes">
                <a href="#"><svg class="icon fb" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 256 256"><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm8,191.63V152h24a8,8,0,0,0,0-16H136V112a16,16,0,0,1,16-16h16a8,8,0,0,0,0-16H152a32,32,0,0,0-32,32v24H96a8,8,0,0,0,0,16h24v63.63a88,88,0,1,1,16,0Z"></path></svg></a>
                <a href="#"><svg class="icon ig" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 256 256"><path d="M128,80a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160ZM176,24H80A56.06,56.06,0,0,0,24,80v96a56.06,56.06,0,0,0,56,56h96a56.06,56.06,0,0,0,56-56V80A56.06,56.06,0,0,0,176,24Zm40,152a40,40,0,0,1-40,40H80a40,40,0,0,1-40-40V80A40,40,0,0,1,80,40h96a40,40,0,0,1,40,40ZM192,76a12,12,0,1,1-12-12A12,12,0,0,1,192,76Z"></path></svg></a>
                <a href="#"><svg class="icon wa" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 256 256"><path
                        d="M187.58,144.84l-32-16a8,8,0,0,0-8,.5l-14.69,9.8a40.55,40.55,0,0,1-16-16l9.8-14.69a8,8,0,0,0,.5-8l-16-32A8,8,0,0,0,104,64a40,40,0,0,0-40,40,88.1,88.1,0,0,0,88,88,40,40,0,0,0,40-40A8,8,0,0,0,187.58,144.84ZM152,176a72.08,72.08,0,0,1-72-72A24,24,0,0,1,99.29,80.46l11.48,23L101,118a8,8,0,0,0-.73,7.51,56.47,56.47,0,0,0,30.15,30.15A8,8,0,0,0,138,155l14.61-9.74,23,11.48A24,24,0,0,1,152,176ZM128,24A104,104,0,0,0,36.18,176.88L24.83,210.93a16,16,0,0,0,20.24,20.24l34.05-11.35A104,104,0,1,0,128,24Zm0,192a87.87,87.87,0,0,1-44.06-11.81,8,8,0,0,0-6.54-.67L40,216,52.47,178.6a8,8,0,0,0-.66-6.54A88,88,0,1,1,128,216Z">
                    </path>
                </svg></a>
            </div>   
            <p>© 2024 Fan del Mate. Todos los derechos reservados.</p>
                     
        `;
        return template.content.cloneNode(true);
    }
    connectedCallback() {
        this.shadowRoot.appendChild(this.template());
        if (window.location.pathname === '/confirmar' ||
            window.location.pathname === '/envio' ||
            window.location.pathname === '/mis_datos' ||
            window.location.pathname === '/user_menu' && window.innerWidth < 600) {
            this.style.display = 'none';
        }
    }
}

customElements.define('footer-del-mate', Footer);