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
                background-color: rgb(41, 126, 49);
                color: white;
                padding: 1em;
                text-align: center;
                font-family: Roboto Condensed;
                ${window.location.pathname === '/' ? 'position: absolute; z-index: 100;background: linear-gradient(rgb(41, 126, 49, 0), rgb(41, 126, 49, 0.6),rgb(41, 126, 49, 0.9)); width: 100%; bottom: 0;' : ''}
                height: 150px;                
                gap: 30px;
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
        </style>
        `;
    }
    template() {
        const template = document.createElement('template');
        template.innerHTML = this.getStyles() +
            `
            <p>© 2024 Fan del Mate. Todos los derechos reservados.</p>
            <div class="redes">
                <a href="#"><img src="/img/icons/redes/facebook.png" alt="Facebook" loading="lazy"></a>
                <a href="#"><img src="/img/icons/redes/instagram.png" alt="Instagram" loading="lazy"></a>
                <a href="#"><img src="/img/icons/redes/twitter.png" alt="Twitter" loading="lazy"></a>
            </div>            
        `;
        return template.content.cloneNode(true);
    }
    connectedCallback() {
        this.shadowRoot.appendChild(this.template());
    }
}

customElements.define('footer-del-mate', Footer);