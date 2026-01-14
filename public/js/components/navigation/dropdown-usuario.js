export class dropdownUsuario extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        let user = JSON.parse(localStorage.getItem('user'));
        this.admin = user.TIPO === 'AD' ? true : false;
    }
    getStyles() {
        return `
        <style>
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Roboto+Condensed:ital,wght@0,100..900;1,100..900&display=swap');  
            :host {
                display: block;
            }    
            :host-context(.contenedor-imagen-usuario) .dropdown-usuario {
                top: 35px;
                color:red;
                width: 150px;                
            }
            * {
                --custom-green: rgb(41, 126, 49); 
            }

            .dropdown-usuario{
                font-family: 'Roboto', Arial;
                list-style: none;
                background-color: var(--custom-green);
                position: absolute;
                left: 0;
                top: 0;
                margin: 0;
                padding: 0;                                
                text-align: left;                        
                z-index: 100;  
                border-radius: 0 0 0 10px;
                overflow: hidden;            
                @media (width>900px) {
                    width: 150px;
                    top:25px;
                }    
                @media (width<900px) {
                    width: 100%;
                }
                li {                   
                    color: white;
                    width: 100%;
                    cursor: pointer;                    
                    padding-left: 24px;    
                    background-color: var(--custom-green);
                    @media (width>900px) {
                        width: 150px;
                    }
                    &:hover {
                        cursor: pointer;
                        background-color: rgb(38, 115, 38);
                    }                    
                    a { 
                        display: block;
                        width: 100%;
                        text-decoration: none;
                        font-size: 14px;
                        padding: 15px 0;
                        color: white;
                        font-weight: 500;
                        letter-spacing: 1px;
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
        <ul class="dropdown-usuario">    
            <li><a href="/user_menu">Mi cuenta</a></li>
            ${this.admin ? `<li><a href="/panel">Panel de Control</a></li>` : ''}
            <li id="logOut"><a href="">Salir</a></li>
        </ul>
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
    cerrarSesion() {
        localStorage.removeItem('user');
        this.user = null;
        window.location.href = "/";
    }
}

customElements.define('dropdown-usuario', dropdownUsuario);