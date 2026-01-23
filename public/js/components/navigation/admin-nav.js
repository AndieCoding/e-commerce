export class AdminNav extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }
    getStyles() {
        return `
        <style> 
            *{                
                --color-secundario: #255200ff;   
            }         
            div.aside {	
                font-family: Roboto, Arial; 
                width: 100%;
                height: 100%;
                display: grid;
                place-items: center;
                @media (width < 800px) {
                    display: none;
                }
            }
                    
            .aside ul {
                display: grid;	                
                justify-items: center;
                max-width: 500px;                
                margin: auto;
                padding: 0;
                list-style: none;
                
                li {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 40px;   
                    width: 100%;
                }
                
                @media (width < 900px) {
                     display: flex;
                     flex-wrap: wrap;
                     justify-content: center;
                     gap: 10px;
                     max-width: 100%;
                     
                     li {
                         width: auto;
                         height: auto;
                     }
                }
            }
            .aside ul li:hover {
                font-weight: 600;
            }
            a { 
                display: inline-block;
                color: rgb(63, 63, 63);
                text-decoration: none;
                padding: 8px 16px;
                border-radius: 20px;
                transition: color 0.2s ease;
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