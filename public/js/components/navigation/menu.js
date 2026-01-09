import { Carrito } from '../cart/carrito.js';
import { CartController } from '../cart/cart-controller.js';
import { User } from '../../models/user.js';
import { dropdownUsuario } from './dropdown-usuario.js';

export class Menu extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.cartController = "";
        const logged = localStorage.getItem('user');
        const loggedUser = JSON.parse(logged);
        this.user = loggedUser ? new User(loggedUser) : null;
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
                height: 70px;
                padding: 0 20px;
                padding-top: 10px;
                padding-right: 30px;
                background-color: var(--custom-green);
                margin: 0;
                font-family: Roboto Condensed;
                font-size: 12px;
                color: white;
                @media (width<800px) {
                    padding: 5px 10px;
                }  
            }
            .menu {
                padding-inline: 40px;
                height: 100%;
                flex-wrap: nowrap;
                margin: auto;
                display: flex;
                align-items: center;
                justify-content: space-between;
                max-width: 1100px;       
                position: relative;
                margin: 5px auto;  
                margin-top:0;
                ul {
                    display: inherit;
                    justify-content: end;
                    align-items: center;
                    list-style: none;
                    gap: 2em;
                    a {
                        text-decoration: none;
                        color: white;
                        font-family: Roboto Condensed;
                        font-weight: 500;
                        letter-spacing: 1px;
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
                        .ingresar-text {
                            display:block;
                            @media (width<900px) {
                                display: block;
                                margin:0;
                            }                         
                        }
                        .ingresar-icon {                            
                                display: none;
                            
                        }
                    }       
                }
                .li-contenedor-dropdown-usuario {
                    position: relative;
                    display: block;
                }
            }            
            .menu a img {
                height: 35px;
            }
            .buscar {
                position: relative;
                width:50%;
                input {
                    box-sizing: border-box;
                    min-width: 150px;
                    height: 2em;
                    padding: 2px 5px;
                    padding-left: 15px;
                    border-radius: 10px;
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
                img {
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                    color: white;
                    cursor: pointer;
                }
            }

            nav .sm-menu{
                @media (width<900px) {        
                    display: none;
                    transform: translateX(100px);
                    background-color: rgb(41, 126, 49);
                    position: absolute;
                    top: 55px;
                    right: -100px;
                    flex-direction: column;
                    justify-content: center;
                    z-index: 100;
                    width: 0;
                    margin: 0;
                    padding-left: 0;
                    opacity: 0;
                    transition: transform 0.3s ease, opacity 0.5s ease, width 0.4s ease ;    
                    border-radius: 0 0 0 5px;
                    gap: 0;
                    li {
                            width: 100%;    
                            text-wrap: nowrap  ;
                            padding-left: 24px;
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
                    }           
                }
            }
            nav .sm-menu.open {
                opacity: 1;
                right: -30px;                    
                width: 50%;
                max-width: 200px;
                transform: translateX(0);
            }
            .burguer {
                width: 20px;
                margin-top: 5px;
                display: none;
                @media (width<900px) {
                    display: block;
                    cursor: pointer;
                }    
            }         
            .user {
                width: 30px;
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
                    @media (width<900px) {
                        width: 40px;
                        height: 30px;
                    }
                }
            .contenedor-busqueda-carrito {
               width: 50%;
               display: flex;
               justify-content: space-between;
               align-items: center;               
               @media (width<900px) {
                   width: 80%;
                   justify-content: space-around;
                   align-items: center;
               }
            }
            .contenedor-imagen-usuario {
                position: relative;
                width: 100px;
                text-align: center;
                @media (width<800px) {
                    display: none;
                }
            }

            nav .sm-menu .li-contenedor-dropdown-usuario {
                @media (width<900px) {
                    padding-left: 0;
                }
            }
            dropdown-usuario{
                opacity: 0;
                width: 0px;
                transform: translateX(-100px);
                transition: opacity 0.3s ease, width 0.5s ease-in-out, transform 0.4s ease-in-out;
                @media (width<900px) {
                    opacity: 1;
                    width: 100%;
                    transform: translateX(0px);
                }
            }
            dropdown-usuario.open{
                opacity: 1;
                transform: translateX(0px);
                width: 150px;
            }                
            .dropdown-usuario-dinamico{
                opacity: 0;
                width: 0;
                transform: translateY(-15px);
                transition: opacity 0.1s ease, width 0.2s ease-in-out, transform 0.2s ease-in-out;
            }
            .dropdown-usuario-dinamico.open{
                opacity: 1;
                transform: translateY(0px);
                width: 150px;
            }
            .dropdown-ingresar {                
                padding: 0;
                
                width: 100%;
                a{
                    width: 100%;
                }
                @media (width<900px) {
                    padding-left: 24px;
                }
            }
            .pantallas-grandes-ingresar{
                display:block;
                @media (width<900px) {
                    display: none;
                }
            }
        </style>
        `
    }
    template() {
        const template = document.createElement('template');
        template.innerHTML = `            
            <nav>
                <div class="menu">
                    <a href="${window.location.pathname === '/' ? '#' : '/'}">                    
                        <img src="/img/icons/mate.svg" alt="logo">
                    </a>
                    <div class="contenedor-busqueda-carrito">
                        <div class="cart-icon">
                            <img src="/img/icons/cart.png" alt="icono de carrito">
                        </div>              
                        <div class="buscar">
                            <input type="text" placeholder="Buscar" name="buscar">
                            <span class="lupa">&#9906;</span>
                        </div>
                    </div>
                    <img class="nav-icons burguer" src="/img/icons/menu.svg" />
                    
                    <ul class="sm-menu">
                        <li><a href="/productos">Productos</a></li>                        
                        <li><a href="/nosotros">Quienes somos</a></li>
                        <li class="li-contenedor-dropdown-usuario"> ${this.user ? `
                                <dropdown-usuario></dropdown-usuario>
                            `
                :
                `<ul class="dropdown-ingresar">
                                <a href="/login">
                                <img class="ingresar-icon" src="/img/icons/login.svg" alt="login" /><p class="ingresar-text">Ingresar</p>
                                </a>
                                </ul>`}    

                        </li>
                    </ul>
                    ${this.user ?

                `<div class="contenedor-imagen-usuario">
                            <img id="icono-usuario" class="nav-icons user" src="../../img/icons/sin-foto.svg" />                            
                </div>
                `
                :
                ``}
                </div>   
            </nav>
            ${this.getStyles()}
    `
        return template.content.cloneNode(true);
    }

    connectedCallback() {
        this.shadowRoot.appendChild(this.template());
        this.carrito = new Carrito();
        this.shadowRoot.appendChild(this.carrito);
        const cartIcon = this.shadowRoot.querySelector('.cart-icon');

        this.addEventListeners();

        cartIcon.addEventListener('click', () => {
            this.toggleCart();
        });
    }

    addEventListeners() {
        const searchInput = this.shadowRoot.querySelector('.buscar input');
        const searchIcon = this.shadowRoot.querySelector('.buscar span');
        const burguerIcon = this.shadowRoot.querySelector('.burguer');
        const iconoUsuario = this.shadowRoot.querySelector('#icono-usuario');
        const menuEnMovil = this.shadowRoot.querySelector('.sm-menu');

        if (iconoUsuario) {
            iconoUsuario.addEventListener('click', () => {
                let desplegable = this.shadowRoot.querySelector('#desplegable-dinamico');
                if (!desplegable) {
                    desplegable = document.createElement('dropdown-usuario');
                    desplegable.classList.add('dropdown-usuario-dinamico');
                    desplegable.setAttribute('id', 'desplegable-dinamico');
                    desplegable.style.position = 'absolute';
                    desplegable.style.zIndex = '500';
                    desplegable.style.top = "-3px";
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

                this.shadowRoot.querySelector('.contenedor-imagen-usuario').appendChild(desplegable);
            });
        }

        searchIcon.addEventListener('click', async () => {
            window.location.href = "http://localhost:3000/productos";
            const searchTerm = searchInput.value;
            const regex = new RegExp(searchTerm, 'i');
            localStorage.setItem('categoria', 'busqueda');
            localStorage.setItem('query', regex.source);
        });

        searchInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                searchIcon.click();
            }
        });
        burguerIcon.addEventListener('click', () => {
            if (menuEnMovil.classList.contains('open')) {
                menuEnMovil.classList.toggle('open');
                menuEnMovil.addEventListener('transitionend', () => {
                    requestAnimationFrame(() => {
                        menuEnMovil.style.display = 'none';
                    });
                }, { once: true });
            } else {
                menuEnMovil.style.display = 'flex';
                requestAnimationFrame(() => {
                    menuEnMovil.classList.toggle('open');
                });
            }
        });
    }

    toggleCart() {
        const carritoElement = this.carrito.shadowRoot.querySelector('.carrito');
        carritoElement.classList.toggle('open');
    }
    showLookupInput() {
        const searchInput = this.shadowRoot.querySelector('.buscar input');
        searchInput.style.display = searchInput.style.display === 'block' ? 'none' : 'block';
    }
}

customElements.define('menu-del-mate', Menu);