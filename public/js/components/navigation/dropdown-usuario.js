export class dropdownUsuario extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        let user = JSON.parse(localStorage.getItem('user'));
        this.admin = user.TIPO === 'ad' ? true : false;
    }
    getStyles() {
        return `
        <style>
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Roboto+Condensed:ital,wght@0,100..900;1,100..900&display=swap');  
            :host {
                display: block;                    
            }    
            * {
                --custom-green: rgba(41, 126, 49, 0.35); 
            }
            .contenedor-dropdown {
                position: relative;
                width:200px;
                height: 95px;
            }
            .dropdown-usuario{
                font-family: 'Roboto', Arial;                
                width: 200px;       
                list-style: none;
                background-color: var(--custom-green);
                position: absolute;
                left: 0;
                top: 0;                
                margin: 0;
                padding: 0;                                
                text-align: center;                        
                z-index: 1;  
                border-radius: 0 0 10px 10px;
                overflow: hidden;         
                backdrop-filter: blur(10px);   
                display: grid;
                grid-template-rows: repeat(3, 45px); 
                justify-items: center;    
                li {                   
                    color: white;
                    width: 100%;
                    height: 100%;
                    cursor: pointer;                    
                    padding-left: 24px;
                    &:hover {
                        background-color: rgba(38, 115, 38, 0.74);
                    }                    
                    a { 
                        display: flex;
                        width: inherit;
                        height: inherit;
                        text-decoration: none;
                        font-size: 14px;
                        color: white;
                        font-weight: 500;
                        justify-content:center;
                        align-items: center;
                    }
                    a:visited{
                        color: white;
                    }
                }
            }                
        </style>                
        `;

    }
    template() {
        const template = document.createElement('template');
        template.innerHTML =
            `        
        ${this.getStyles()}
        <div class="contenedor-dropdown">
        <ul class="dropdown-usuario">    
            <li><a href="/user_menu">Mi cuenta</a></li>
            ${this.admin ? `<li><a href="/panel">Panel de Control</a></li>` : ''}
            <li id="logOut"><a href="">Salir</a></li>
        </ul>
        </div>
        `;
        return template.content.cloneNode(true);
    }
    connectedCallback() {
        this.render();
        this.addEventListeners();
    }
    render() {
        this.shadowRoot.innerHTML = '';
        this.shadowRoot.appendChild(this.template());
    }
    addEventListeners() {
        this.shadowRoot.querySelector('#logOut').addEventListener('click', () => {
            this.cerrarSesion();
        });
    }
    async cerrarSesion() {
        try {
            const response = await fetch('/logout', { method: 'POST' });
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    localStorage.removeItem('user');
                    window.location.href = '/login';
                }
            } else {
                console.error('Logout fallido');
            }
        } catch (error) {
            console.error('Error logging out:', error);
        }
    }
}

customElements.define('dropdown-usuario', dropdownUsuario);