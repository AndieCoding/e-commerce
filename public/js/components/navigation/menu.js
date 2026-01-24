import { Carrito } from '../cart/carrito.js';
import { CartController } from '../cart/cart-controller.js';
import { User } from '../../models/user.js';
import { dropdownUsuario } from './dropdown-usuario.js';

export class Menu extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.cartController = new CartController();
        const logged = localStorage.getItem('user');
        const loggedUser = JSON.parse(logged);
        this.user = loggedUser ? new User(loggedUser) : null;
    }

    async checkAuth() {
        try {
            const response = await fetch('/api/me');
            const auth = await response.json();
            if (auth.logged) {
                return;
            } else {
                this.user = null;
                localStorage.removeItem('user');
            }
            this.render();
            console.log('Usuario: ', this.user);
            window.dispatchEvent(new CustomEvent('userUpdated', { detail: this.user }));
        } catch (error) {
            console.error("Error al verificar sesión:", error);
        }
    }

    render() {
        const nav = this.shadowRoot.querySelector('nav');
        if (nav) nav.remove();

        this.shadowRoot.prepend(this.template());
        if (this.carrito && !this.shadowRoot.contains(this.carrito)) {
            this.shadowRoot.appendChild(this.carrito);
        }
        this.addEventListeners();
    }
    getStyles() {
        return `
        <style>   
              @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Roboto+Condensed:ital,wght@0,100..900;1,100..900&display=swap');      
            * {
                --custom-green: rgb(41, 126, 49); 
                box-sizing: border-box;
            }
            nav {
                position: relative;
                z-index: 100;
                height: 70px;
                padding: 0 20px;
                padding-top: 10px;
                padding-right: 30px;
                background-color: var(--custom-green);
                margin: 0;
                font-family: Roboto Condensed;
                font-size: 12px;
                color: white;
                ${window.location.pathname === '/' ? 'position: absolute; width: 100%;z-index: 100;background: linear-gradient(rgb(41, 126, 49, 0.8), rgb(41, 126, 49, 0));' : ''}
                @media (width<800px) {
                    padding: 5px 10px;
                }  
            }
            .logo {
                margin-top: 1em;
                @media (width<800px) {
                    display: none;
                }
            }
            a{
                text-decoration: none;
                color: white;
                font-size: 14px;
            }
            .menu {
                padding-inline: 40px;
                height: 100%;
                flex-wrap: nowrap;
                margin: auto;
                grid-template-columns: auto 1fr auto;
                display: grid;
                place-content: center;
                max-width: 1100px;       
                position: relative;
                
                @media (width<800px) {
                    padding-inline: 25px;
                    display: flex;
                    justify-content: center;
                    align-items: center;                   
                }  
            }       
                .contenedor-lista {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    list-style: none;
                    gap: 3em;
              
                @media (width<800px) {
                    display: none;
                }
                    a {
                        text-decoration: none;
                        color: white;
                        font-family: Roboto;
                        font-size: 14px;
                        cursor: pointer;
                        width: 100%;
                        display: inline-block;
                        &:hover {
                            text-shadow: 0 0 3px rgb(141, 137, 137);
                        }                            
                        img {
                            display:block;
                            width: 30px;
                            cursor: pointer;
                            @media (width<900px) {
                                display: none;
                            }
                        }
                        .ingresar-icon {                            
                                display: none;                            
                        }
                    }       
                }     
            .menu a img {
                height: 35px;
            }
            .buscar {
                position: relative;
                width:clamp(180px, 50%, 350px);
                input {
                    box-sizing: border-box;
                    min-width: 100px;
                    height: 2em;
                    padding: 2px 5px;
                    padding-left: 15px;
                    border-radius: 5px;
                    border: 0;
                    outline: 0;
                    width:100%;
                    margin-top: 2px;
                    &:focus {
                        border: 1px solid black;
                        outline: 3px solid rgb(19, 110, 31);                        
                    }
                }
            }
            .lupa {
                position:absolute;
                top: -5px;
                right: 10px;
                transform: rotate(-45deg);
                font-size: 30px;
                color: rgb(92, 91, 91);
                cursor: pointer;
                @media (width<800px) {                                        
                    color: gray;
                }
            }
            
            .cart-icon {
                width: 30px;
                position: relative;                
                img {
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                    color: white;
                    cursor: pointer;
                }
                @media (width<800px) {
                    display: none;
                }
            }
            .badge {
                position: absolute;
                top: -5px;
                right: -10px;
                background-color: white;
                color: var(--custom-green);
                font-size: 16px;
                font-weight: bold;
                width: 16px;
                height: 16px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                pointer-events: none;
            }       
            .user {
                width: 40px;
                height: 40px;
                object-position: center;
                object-fit: cover;
                cursor: pointer;
                transition: box-shadow 0.1s ease;
                border-radius: 50%;
                position: relative;
                margin: 0 auto;
                &:hover {
                    box-shadow: 0 0 5px 1px rgb(124, 159, 195);
                }
                @media (width<800px) {
                    display: none;
                }    
            }
            .menu a img.logo {
                    width: 50px;
                    height: 35px;
                }
            .contenedor-busqueda {
               width: 100%;
               display: flex;
               justify-content: center;
               align-items: center;               
               @media (width<900px) {
                   width: 80%;
                   justify-content: center;
                   align-items: center;
               }
            }
            .contenedor-imagen-usuario {
                position: relative;
                text-align: center;
                @media (width<800px) {
                    display: none;
                }
            }
            #contenedor-desplegable {
                position: absolute;
                top: 52px;         
                left: -90px;       
                width: 200px;
                height: 135px;
                z-index: 1;
                overflow:hidden;
            }
            .dropdown-usuario-dinamico{   
                position: absolute;             
                transform: translateY(-135px);
                transition: transform 0.3s ease-in-out;
                pointer-events: none;
            }
            .dropdown-usuario-dinamico.open{                
                transform: translateY(0px);
                pointer-events: all;
            }
        </style>
        `
    }
    template() {
        const template = document.createElement('template');
        template.innerHTML = `            
            <nav>
                <div class="menu">
                    <a class="logo" href="${window.location.pathname === '/' ? '#' : '/'}">                    
                        <img src="/img/icons/mate.svg" alt="logo" loading="lazy">
                    </a>
                    <div class="contenedor-busqueda">                                   
                        <div class="buscar">
                            <input type="text" placeholder="Mate, yerba, termo..." name="buscar">
                            <span class="lupa">&#9906;</span>
                        </div>
                    </div>              
                    <ul class="contenedor-lista">
                        <li>
                            <div class="cart-icon">
                                <img src="/img/icons/cart.png" alt="icono de carrito" loading="lazy">
                                <span id="cart-badge-desktop" class="badge">${this.cartController.getTotalProducts()}</span>
                            </div>
                        </li>
                        <li>
                            <a class="nav-item" href="/productos">Productos</a>
                        </li>
                        <li>
                            <div class="contenedor-imagen-usuario">
                            ${this.user ?
                `<img id="icono-usuario" class="nav-icons user" src="${(this.user.FOTO && this.user.FOTO !== "null") ? this.user.FOTO : "/img/icons/sin-foto.svg"}" loading="lazy" />`
                : `<a class="nav-item" href="/login">Ingresar</a>`}                                
                            </div>
                        </li>
                    </ul>
                </div>   
            </nav>
            ${this.getStyles()}
    `
        return template.content.cloneNode(true);
    }

    connectedCallback() {
        if (!this.shadowRoot.querySelector('nav')) {
            this.shadowRoot.appendChild(this.template());
        }

        if (!this.carrito) {
            this.carrito = new Carrito();
        }

        if (!this.shadowRoot.contains(this.carrito)) {
            this.shadowRoot.appendChild(this.carrito);
        }

        this.addEventListeners();

        if (!this.hasGlobalListeners) {
            document.addEventListener('actualizarTotalProducts', () => {
                const badge = this.shadowRoot.querySelector('#cart-badge-desktop');
                if (badge) {
                    badge.textContent = this.cartController.getTotalProducts();
                }
            });
            this.hasGlobalListeners = true;
        }

        this.checkAuth();
    }

    addEventListeners() {
        const searchInput = this.shadowRoot.querySelector('.buscar input');
        const searchIcon = this.shadowRoot.querySelector('.buscar span');
        const iconoUsuario = this.shadowRoot.querySelector('#icono-usuario');
        const cartIcon = this.shadowRoot.querySelector('.cart-icon');

        if (cartIcon) {
            cartIcon.addEventListener('click', () => {
                this.toggleCart();
            });
        }

        if (iconoUsuario) {
            iconoUsuario.addEventListener('click', () => {
                let desplegable = this.shadowRoot.querySelector('#desplegable-dinamico');
                let div = this.shadowRoot.querySelector('#contenedor-desplegable');
                if (!desplegable) {
                    desplegable = document.createElement('dropdown-usuario');
                    desplegable.classList.add('dropdown-usuario-dinamico');
                    desplegable.setAttribute('id', 'desplegable-dinamico');
                    div = document.createElement('div');
                    div.setAttribute('id', 'contenedor-desplegable');
                    div.classList.add('contenedor-dropdown');
                    div.appendChild(desplegable);
                }
                if (desplegable.classList.contains('open')) {
                    requestAnimationFrame(() => {
                        desplegable.classList.remove('open');
                    });
                    desplegable.addEventListener('transitionend', () => {
                        desplegable.remove();
                    }, { once: true });
                } else {
                    requestAnimationFrame(() => {
                        desplegable.classList.add('open');
                    });
                }

                this.shadowRoot.querySelector('.contenedor-imagen-usuario').appendChild(div);
            });

            window.addEventListener('userUpdated', (e) => {
                this.user = e.detail;
                this.render();
            });
        }

        const ejecutarBusqueda = () => {
            const valor = searchInput.value.trim();
            if (valor === "") return;
            localStorage.setItem('categoria', 'busqueda');
            localStorage.setItem('query', valor);
            searchInput.value = "";
            searchInput.blur();

            if (window.location.pathname === '/productos') {
                document.dispatchEvent(new Event('turbo:load'));
            } else {
                Turbo.visit("/productos");
            }
        };

        searchIcon.addEventListener('click', ejecutarBusqueda);

        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') ejecutarBusqueda();
        });
    }

    toggleCart() {
        document.dispatchEvent(new CustomEvent('toggleCarrito'));
    }

    showLookupInput() {
        const searchInput = this.shadowRoot.querySelector('.buscar input');
        searchInput.style.display = searchInput.style.display === 'block' ? 'none' : 'block';
    }
}

customElements.define('menu-del-mate', Menu);