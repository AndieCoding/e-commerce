export class AdminNav extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }
    getStyles() {
        return `
        <style> 
            *{
                --color-personalizado: #87C987;   
                --color-secundario: #255200ff;   
            }
            :host {
                display: block;
                width:100%;
            }            
            div.aside {	
                font-family: Roboto, Arial;
                background-color: var(--color-personalizado);                
                flex-direction: column;
                align-items: center;
                justify-content: center;                                
            }
                    
            .aside ul {
                display: grid;	
                grid-template-columns: repeat(3, 1fr);
                justify-items: center;
                max-width: 500px;                
                margin: auto;
                li {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 40px;   
                }
            }
            .aside ul li:hover {
                font-weight: 600;
            }
            a { 
                display: inline-block;
                color: rgb(63, 63, 63);
                text-decoration: none;
            }
            a.active {
                font-weight: 600;
                color: var(--color-secundario);
            }
        </style>
        `
    }

    getTemplate() {
        const template = document.createElement('template');
        template.innerHTML = `            
           <div class="aside">
				<ul>
                    <li><a href="/altas">Nuevo</a></li>
                    <li><a href="/administrar">Administrar</a></li>
                    <!--<li><a href="/compras">Compras</a></li>
                    <li><a href="/ventas">Ventas</a></li>
					<li><a href="/ficha">Ficha de Stock</a></li>-->
					<li><a href="/panel">Informes</a></li>
				</ul>
			</div>

            ${this.getStyles()}
        `
        return template.content.cloneNode(true);
    }

    connectedCallback() {
        this.shadowRoot.appendChild(this.getTemplate());
        this.addActivePage();
    }

    addActivePage() {
        const path = window.location.pathname;
        const links = this.shadowRoot.querySelectorAll('a');
        links.forEach(link => {
            if (link.getAttribute('href') === path) {
                link.classList.add('active');
            }
        });
    }
}
customElements.define('admin-nav', AdminNav);