import { Carrito } from '../cart/carrito.js';
import { CartController } from '../cart/cart-controller.js';
import { dropdownUsuario } from './dropdown-usuario.js';
import '../../front/app.js';

export class Menu extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.cartController = new CartController();
        this.user = JSON.parse(localStorage.getItem('user'));
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
                box-sizing: border-box;
            }
            nav {
                position: relative;
                z-index: 100;
                height: 70px;
                padding: 0 20px;
                padding-top: 10px;
                padding-right: 30px;
                background-color: var(--navbar-color);
                
                ${window.location.pathname === '/' ? 'background-color: transparent;z-index: 100;position: absolute; top:0; width: 100%;background-color: transparent;' : 'box-shadow: var(--menu-shadow);'}
                font-size: 12px;
                margin: 0;
                font-family: Roboto Condensed;
                @media (width<800px) {
                    background-color: transparent;
                    ${window.location.pathname === '/' ? ' top:50%;' : ''}
                }  
            }
            .icon.mate{
                fill: var(--navbar-items-color);
                ${window.location.pathname === '/' ? 'fill:white;' : ''}
            }
            .logo {
            width: 40px;
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
                        color: var(--navbar-items-color);
                        ${window.location.pathname === '/' ? 'color:white;' : ''}
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
                width:clamp(240px, 50%, 350px);
                input {
                    box-sizing: border-box;
                    min-width: 100px;
                    height: 2em;
                    padding: 2px 5px;
                    padding-left: 15px;
                    border-radius: 50px;
                    border: 0;
                    outline: 0;
                    width:100%;
                    margin-top: 2px;
                    box-shadow: 10px 5px 10px rgb(0,100,100,0.05);
                    &:focus {
                        border: 1px solid black;
                        outline: 3px solid rgb(19, 110, 31);                        
                    }
                }
                input::placeholder {
                    color: rgb(164 181 168);
                }
            }
            .lupa {
                position:absolute;
                top: 3px;
                right: 10px;
                font-size: 30px;
                fill: gray;
                cursor: pointer;
            }
            
            .cart-icon {
                width: 30px;
                position: relative;                
                
                @media (width<800px) {
                    display: none;
                }
            }
                .cart {
                fill: var(--navbar-items-color);
                ${window.location.pathname === '/' ? 'fill:white;' : ''}
                }
            .badge {
                position: absolute;
                padding: 10px;
                top: -5px;
                right: -10px;
                background-color: white;
                color: var(--custom-green);
                font-size: 14px;
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
        const isLoginPage = window.location.pathname.includes('login');
        const isUserPage = window.location.pathname.includes('user_menu');
        const isMobile = window.innerWidth < 700;
        template.innerHTML = ` 
            ${isLoginPage && isMobile || isUserPage && isMobile ? '<div style="background-transparent; height: 70px;"></div>' : `
            <nav>
                <div class="menu">
                    <a class="logo" href="${window.location.pathname === '/' ? '#' : '/'}">                    
                       <svg class="icon mate" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M39.580078 1.9941406 A 1.50015 1.50015 0 0 0 39.035156 2.0742188L35.132812 3.3457031L35.103516 3.3574219C32.973703 4.1550658 31.195652 5.6835617 30.091797 7.6699219C30.091797 7.6699219 30.089844 7.6699219 30.089844 7.6699219L30.082031 7.6894531L30.039062 7.7714844L28.208984 12.667969C27.052003 12.865401 25.647338 13 24 13C19.66 13 16.979688 12.07 16.179688 11.5C16.979688 10.93 19.66 10 24 10C24.7 10 25.360469 10.020312 25.980469 10.070312L27.080078 7.1601562C25.980078 7.0501562 24.92 7 24 7C20.598149 7 15.257647 7.6619276 13.552734 9.9257812 A 1.50015 1.50015 0 0 0 13.320312 10.173828C13.320312 10.173828 12.536919 11.167614 11.746094 12.369141C11.350681 12.969904 10.949638 13.624605 10.625 14.277344C10.300362 14.930083 10 15.517212 10 16.394531C10 16.563 10.013687 16.728396 10.037109 16.890625C8.8130173 18.299926 5 23.262428 5 30.568359C5 35.537722 7.6190476 39.324858 11.255859 41.648438C14.892672 43.972017 19.514706 45 24 45C28.485294 45 33.107328 43.972017 36.744141 41.648438C40.380953 39.324858 43 35.537722 43 30.568359C43 23.262428 39.186983 18.299926 37.962891 16.890625C37.986313 16.728396 38 16.563 38 16.394531C38 15.517212 37.699638 14.930083 37.375 14.277344C37.050362 13.624605 36.649319 12.969904 36.253906 12.369141C35.463081 11.167614 34.679688 10.173828 34.679688 10.173828 A 1.50015 1.50015 0 0 0 34.439453 9.9277344C34.090598 9.4654123 33.598448 9.0679725 32.992188 8.7324219C33.752823 7.5718136 34.8403 6.661454 36.148438 6.1699219L39.964844 4.9257812 A 1.50015 1.50015 0 0 0 39.580078 1.9941406 z M 14.365234 13.859375C16.583166 15.493693 21.029526 16 24 16C25.620701 16 27.675282 15.840459 29.576172 15.439453 A 1.5002762 1.5002762 0 0 0 29.771484 15.390625C31.278116 15.056526 32.669459 14.570677 33.634766 13.859375C33.675163 13.919694 33.70561 13.958023 33.746094 14.019531C34.100681 14.558268 34.449638 15.13502 34.6875 15.613281C34.925362 16.091542 35 16.534851 35 16.394531C35 16.562825 34.91998 16.838403 34.480469 17.259766C34.040952 17.681128 33.274932 18.166563 32.265625 18.583984C30.24701 19.418827 27.279709 20 24 20C20.720291 20 17.75299 19.418827 15.734375 18.583984C14.725068 18.166563 13.959048 17.681128 13.519531 17.259766C13.080015 16.838403 13 16.562825 13 16.394531C13 16.534851 13.07464 16.091542 13.3125 15.613281C13.550362 15.13502 13.899319 14.558268 14.253906 14.019531C14.29439 13.958023 14.324837 13.919694 14.365234 13.859375 z M 11.677734 19.623047C12.468853 20.317805 13.445435 20.882981 14.587891 21.355469C17.093276 22.391626 20.375709 23 24 23C27.624291 23 30.906724 22.391626 33.412109 21.355469C34.554565 20.882981 35.531147 20.317805 36.322266 19.623047C37.645227 21.363662 40 25.197922 40 30.568359C40 34.529996 38.119047 37.20997 35.130859 39.119141C32.142672 41.028311 28.014706 42 24 42C19.985294 42 15.857328 41.028311 12.869141 39.119141C9.8809524 37.20997 8 34.529996 8 30.568359C8 25.197922 10.354773 21.363662 11.677734 19.623047 z"></path></g></svg>
                    </a>
                    <div class="contenedor-busqueda">                                   
                        <div class="buscar">
                            <input type="text" placeholder="Mate de madera" name="buscar">
                            <svg class="lupa" id="lupa-icon" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 256 256"><path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"></path></svg>
                        </div>
                    </div>              
                    <ul class="contenedor-lista">
                        <li>
                            <div class="cart-icon" id="toggleCarrito">
                                <svg class="nav-icon cart" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 256 256"><path d="M104,216a16,16,0,1,1-16-16A16,16,0,0,1,104,216Zm88-16a16,16,0,1,0,16,16A16,16,0,0,0,192,200ZM239.71,74.14l-25.64,92.28A24.06,24.06,0,0,1,191,184H92.16A24.06,24.06,0,0,1,69,166.42L33.92,40H16a8,8,0,0,1,0-16H40a8,8,0,0,1,7.71,5.86L57.19,64H232a8,8,0,0,1,7.71,10.14ZM221.47,80H61.64l22.81,82.14A8,8,0,0,0,92.16,168H191a8,8,0,0,0,7.71-5.86Z"></path></svg>
                                <span id="cart-badge-desktop" class="badge">${this.cartController.getTotalProducts()}</span>
                            </div>
                        </li>
                        <li>
                            <a class="nav-item" id="link-productos" href="/productos">Productos</a>
                        </li>
                        <li>
                            <div class="contenedor-imagen-usuario">
                            ${this.user ?
                    `<img id="icono-usuario" class="nav-icons user" src="${this.user.foto ? this.user.foto : '/img/icons/sin-foto.svg'}" loading="lazy" />`
                    : `<a class="nav-item" href="/login">Ingresar</a>`}                                
                            </div>
                        </li>
                    </ul>
                </div>   
            </nav>
            ${this.getStyles()}
    `}`
        return template.content.cloneNode(true);
    }

    connectedCallback() {
        if (!this.shadowRoot.querySelector('nav')) {
            this.shadowRoot.appendChild(this.template());
        }

        if (window.location.pathname === '/confirmar' || window.location.pathname === '/envio') {
            this.shadowRoot.querySelector('nav').style.visibility = 'hidden';
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

        this._onUserUpdated = (e) => {
            this.user = e.detail;
            if (this.isConnected && this.user) {
                this.render();
            }
        };

        window.addEventListener('userUpdated', this._onUserUpdated);
        window.checkAuth;
    }

    addEventListeners() {
        const searchInput = this.shadowRoot.querySelector('.buscar input');
        const searchIcon = this.shadowRoot.querySelector('#lupa-icon');
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
        this._handleClickProductos = (e) => {
            const link = e.target.closest('#link-productos');
            if (link) {
                localStorage.setItem('categoria', 'mates');
                localStorage.removeItem('query');
            }
        };
        this.shadowRoot.addEventListener('click', this._handleClickProductos);
    }

    disconnectedCallback() {
        window.removeEventListener('userUpdated', this._onUserUpdated);
        this.shadowRoot.removeEventListener('click', this._handleClickProductos);
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