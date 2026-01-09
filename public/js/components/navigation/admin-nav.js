export class AdminNav extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }
    getStyles() {
        return `
        <style> 
            :host {
                display: block;
                height:40px; 
            }            
            div.aside {	
                font-family: Roboto, Arial;
                padding: 0;
                float: left;
                background-color: rgb(163, 186, 207);
                color: black;
                display: flex;
                align-items: center;
                justify-content: center;
                width: 100%;	
                height: 40px;
                margin-right: 0;
            }
                    
            .aside ul {
                display: inherit;	
                list-style-type: none;
                padding: 0;
                margin: 0;
                height: 100%;
                gap: 2em;                
                justify-content: space-around;     
                align-items: center;  
                
                li {
                    height: 40px;
                    display:flex;
                    align-items: center;
                    padding: 0 20px
                }
            }
            .aside ul li:hover {
                transition: background-color 0.4s ease;                
                &:hover {
                    background-color: rgb(145 189 155);
                };                  
            }
            a { 
                display: inline-block;
                color: rgb(63, 63, 63);
                text-decoration: none;
                font-weight: 600;
                }
            }

        </style>
        `
    }

    getTemplate() {
        const template = document.createElement('template');
        template.innerHTML =  `            
           <div class="aside">
				<ul>
                    <li><a href="/altas">Alta de productos</a></li>
                    <li><a href="/compras">Compras</a></li>
                    <li><a href="/ventas">Ventas</a></li>
					<li><a href="/ficha">Ficha de Stock</a></li>                    				
					<li><a href="/informes">Informes</a></li>
				</ul>
			</div>

            ${this.getStyles()}
        `
        return template.content.cloneNode(true);
    }

    connectedCallback() {
        this.shadowRoot.appendChild(this.getTemplate());        
    }
}
customElements.define('admin-nav', AdminNav);