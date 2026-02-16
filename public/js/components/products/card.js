import { Producto } from '../../models/producto.js';

export class Card extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.tipo = 'grid';
        this.isLoading = false;
        this.item = null;
    }
    static get observedAttributes() {
        return ['tipo', 'loading'];
    }
    attributeChangedCallback(attr, oldValue, newValue) {
        if (attr === 'tipo') {
            this.tipo = newValue;
            this.render();
        }
        if (attr === 'loading') {
            this.isLoading = newValue === 'true';
            this.render();
        }
    }

    set data(value) {
        this._item = value instanceof Producto ? value : new Producto(value);
        this._item.order_quantity = 1;
        this.render();
    }

    get data() {
        return this._item;
    }

    connectedCallback() {
        this.render();
    }

    render() {
        if (this.isLoading) {
            this.renderSkeleton();
        } else {
            this.renderContent();
        }
    }

    renderSkeleton() {
        this.shadowRoot.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Bebas+Neue&family=Roboto+Condensed:ital,wght@0,100..900;1,100..900&display=swap');                        
            * {
                box-sizing: border-box;
            }
            .card {
                border-radius: 10px;
                padding: 0.5em 1.2em;                
                overflow: hidden;
                box-shadow: 0 0 4px 1px rgb(124, 159, 195, 0.3);
                background-color: white;
                position: relative;
                display: flex;
                flex-direction: column;    
                
                gap: 10px;
            }
            .card.list {
                display: grid;
                grid-template-columns: 1fr 2fr;                               
                width: 100%; 
                height: 100%;
                max-width: 800px;
                gap: 20px;
                padding: 15px 5px;
            }
            .skeleton {
                background: #eee;
                background: linear-gradient(110deg, #ececec 8%, #f5f5f5 18%, #ececec 33%);
                border-radius: 5px;
                background-size: 200% 100%;
                animation: 1.5s shine linear infinite;
            }
            @keyframes shine {
                to {
                    background-position-x: -200%;
                }
            }
            .skeleton-img {
                height: 170px;
                width: 100%;
            }
            .card.list .skeleton-img {
                height: 120px;
            }
            .skeleton-title {
                height: 20px;
                width: 80%;
                margin: 10px 0;
            }
            .skeleton-text {
                height: 15px;
                width: 60%;
            }
            .skeleton-button {
                height: 40px;
                width: 100%;
                margin-top: 10px;
            }
            @media (width<900px) {
                .card {
                    padding: 8px;
                    width: 100%;
                }
                .skeleton-img {
                    height: 100px;
                }
            }
        </style>
        <div class="card ${this.tipo === 'list' ? 'list' : ''}">
            <div class="skeleton skeleton-img"></div>
            <div class="skeleton-info">
                <div class="skeleton skeleton-title"></div>
                <div class="skeleton skeleton-text"></div>
                <div class="skeleton skeleton-button"></div>
            </div>
        </div>
        `;
    }

    renderContent() {
        const { id, nombre, imagen, stockInfo, precioHtml, estaAgotado, stock } = this._item || {};
        let stockClass = stockInfo.class;
        let stockState = stockInfo.state;

        this.shadowRoot.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Roboto+Flex:opsz,wght,XOPQ,XTRA,YOPQ,YTDE,YTFI,YTLC,YTUC@8..144,100..1000,96,468,79,-203,738,514,712&family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Bebas+Neue&family=Roboto+Condensed:ital,wght@0,100..900;1,100..900&display=swap');                        
            * {
                box-sizing: border-box;
            }
            .card {
                border-radius: 10px;
                padding: 0.5em 1.2em;                
                overflow: hidden;
                box-shadow: 0 0 4px 1px rgb(124, 159, 195, 0.3);
                background-color: white;
                position: relative;
                display: flex;
                flex-direction: column;    
                
                .img {             
                    height: 170px;
                }
                img {
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                }

                p {
                    text-wrap: balance;
                }
                .buttons {                    
                    display: flex;
                    flex-direction: row;
                    justify-content: space-between;
                    gap: 1em;
                }

                .buttons-section {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    gap: 1em;
                }
                    
                .buttons-section input {
                    border: 0;                    
                }

                .quantity-selector {
                    display: flex;
                    flex-direction: row;
                    margin: auto;
                    gap: 0.5em;
                    width: clamp(100px, 100%, 200px);
                    justify-content: center;
                    align-items: center;

                    
                    input[type="number"] {
                        -moz-appearance: textfield;
                        appearance: textfield;
                    }
                    /*chrome*/
                    input[type="number"]::-webkit-inner-spin-button,
                    input[type="number"]::-webkit-outer-spin-button {
                        -webkit-appearance: none;
                    }
                    input {
                        width: 30px;
                        text-align: center;
                        font-family: Roboto;                                                
                    }
                    button {
                        background-color: transparent;
                        border: none;
                        cursor: pointer;
                        font-family: Roboto;
                        font-size: 16px;
                        color: green;
                        &:hover {
                            color: darkgreen;
                        }    
                    }
                }

                .buttons a {
                    display: block;
                    text-decoration: none;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    padding: 1em 1.2em;
                    width: fit-content;
                    margin: 0.5em auto;
                    cursor: pointer;
                    font-family: Arial;
                }
                .buttons a.agregar {
                    outline: 1px solid green;
                    color: green;
                    transition: background-color 0.2s;
                    font-size: 12px;
                    margin-top: 0;  
                    text-wrap: nowrap;
                    &:hover {
                        background-color: green;
                        color: white;
                    }
                }
                .confirmacion {
                    color: #091c09;                    
                    margin-left: 10px;
                    opacity: 0;
                    transition: opacity 0.5s;
                    display: flex;
                    align-items: end;
                    justify-content: center;
                    gap: 0.5em;
                    font-family: poppins;
                    font-size: 9px;
                    margin: 0;
                    background-color: #96da9661;
                    border-radius: 10px;                    
                    .tick {
                        font-size: 12px;
                    }
                }
                .confirmacion.show {
                    opacity: 1;
                }
            }
         
            .card.list {
                display: grid;
                grid-template-columns: 1fr 2fr;    
                grid-template-rows: 1fr 1fr 1fr;           
                width: 100%; 
                height: 100%;
                max-width: 800px;
            }

            #imagen-section {
                grid-row: span 2;
            }

            .card.list .img {
                height: 120px;
                max-width: 180px;
                grid-row: span 2;
            }
            .card.list .buttons-section {
                flex-direction: row;      
                justify-content: end;
                gap: 2rem;
            }
            .card.list .buttons .agregar{
                @media (width<900px) {
                 width: 120px;
                }
            }
            
            .card.list .product-info {
                height: 100%;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
            }
            
            .card.list .product-marca, 
            .card.list .product-description {
                margin: 0;
            }
            .card.list .confirmacion {
                font-size: 10px;             
                width: 140px;
                position: absolute;
                top: 45%;
                right: 5px;
            }
            .card.list .product-name {
                margin: 0;
                margin-top: 0.5em;
            }
            .product-name {
                text-decoration: none;
                font-family: Roboto Condensed;
                font-size: 14px;
                text-transform: uppercase;
                color: #83766cff;
                margin: 0.5em 0;      
                text-wrap: nowrap;
                overflow: hidden;
                white-space: wrap;
                height: 2.5em;                
                text-overflow: ellipsis;
            }
          
            .price {
                //background-color: #f5cc81cc;
                border-radius: 5px;
                padding: 0.1em 0.5em;
                font-family: Roboto Condensed;
                font-size: 16px;
                font-weight: 400;
                text-transform: uppercase;
                color: #2c4e3dff;                
                margin: 0;                                
            }
          
            .old-price {
                font-size: 14px;
                text-decoration: line-through;
                color: #526858ff;                
                backdrop-filter: blur(5px);                
                border-radius: 5px;
            }
            .offer-price {                
                color: #4e595cff;
                background-color: #ffffffdd;
                width: fit-content;
                border-radius: 10px;
                padding: 2px;
            }
            .stock {
                display: flex;
                align-items: center;   
                margin:0;  
                gap:5px;           
                font-size: 10px;
                font-weight: 100;
                letter-spacing: -0.5px;                
                color: ${stockClass};
                background-color: white;
                border-radius: 10px;
                box-shadow: 1px 1px 3px 1px white;
                line-height: 12px;                
                font-family: Roboto;
            }
            .stock .dot {
                font-size: 20px;
            }

            .product-details {
                margin-bottom: 0.5em;
            }

            .product-marca {
                font-family: Bebas Neue;
                font-size: 14px;
                color: #53585fd4;
                margin: 0.3em 0;
                font-weight: 100;
            }
            .card a.disabled {
                pointer-events: none;  
                opacity: 0.5;       
                cursor: not-allowed;
            }
            img.cart-icon{
                display: none;
            }
            .product-price {
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: end;
                position: absolute;
                top: 45%;
                right: 5px;
                @media (width<900px) {
                    top: 50%;
                }
            }
            .card.list .product-price {                
                align-items: start;
                left: 125px;
                top: 60%;     
                @media (width<900px) {
                left: clamp(90px, 20%, 220px);                            
                }           
            }
            .product-price .price {
                display:flex;
                flex-direction: row-reverse;
                align-items: center;
                @media (width<900px) {
                    flex-direction: row;
                }
            }
            .descripcion {
                height: 80px;
                @media (width<900px) {
                    height: 60px;
                }
            }
            @media (width<900px) {
                .card {
                    padding: 8px;
                    width: 100%;
                    max-height: 290px;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    border: 1px solid #f0f0f0;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.05);
                }

                .img {             
                    height: 100px;
                    width: 100%;
                    margin-bottom: 5px;
                }
                
                img {
                    object-fit: contain;
                }

                .product-name {
                    font-family: 'Roboto Condensed', sans-serif;
                    font-size: 12px;
                    text-transform: uppercase; 
                    color: #83766cff; 
                    margin: 4px 0;      
                    height: auto;
                    max-height: 3em;
                    line-height: 1.2;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    text-align: left;
                    font-weight: 400; 
                    text-wrap: balance;
                    white-space: normal;
                }

                .price {
                    font-size: 16px;
                    font-weight: 700;
                    color: #2c4e3d;
                    position: static; 
                    background: none;
                    padding: 0;
                }

                .stock {
                    position: static;
                    font-size: 9px;
                    color: ${stockClass};
                    background: none;
                    box-shadow: none;
                    padding: 0;
                    margin-bottom: 2px;
                }
                
                .buttons {                    
                    width: 100%;
                }
                .card{
                    .buttons a.agregar {
                        width: 150px;
                        padding: 6px 0; 
                        margin: 0;
                        font-size: 13px;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        background-color: transparent;                   
                        color: green;
                }
                .btn-text{
                    display: none;
                }
                .buttons a.agregar img.cart-icon {
                    display: block;
                    width: 16px;
                    height: 16px;
                    filter: invert(24%) sepia(96%) saturate(1750%) hue-rotate(95deg) brightness(94%) contrast(104%); /* Make icon match green text */
                }
                .buttons a.agregar:hover {
                    background-color: #5d995dff; 
                    color: green;
                }

                .confirmacion {
                    display: none;
                }

            }
            </style>

            <div class="card ${this.tipo === 'list' ? 'list' : ''}">
                <a id="imagen-section" href="/detalle?id=${id}">
                    <div class="img">
                        <img src="${imagen}" alt="${nombre}" loading="lazy">
                    </div>
                </a>
                <section class="descripcion">
                    <div class="product-info">
                        <a class="product-name" href="/detalle?id=${id}">
                            <p>${nombre}</p>
                        </a>
                        <div class="product-price">
                            <p class="stock">
                                <span class="dot">&#8226;</span>
                                ${stockState}
                            </p>
                            <h4 class="price">
                                ${precioHtml}
                            </h4>
                        </div>
                    </div>                 
                    <div class="confirmacion">
                        <span>Producto agregado</span><span class="tick">&#10004;</span>
                    </div>
                </section>
                <section class="buttons-section">
                <div class="quantity-selector">
                    <button id='control-resta' class="controles-cantidad">-</button>
                    <input disabled type="number" id="quantity" class="quantity" value="${this._item.order_quantity}" min="1" max="${stock}">
                    <button id='control-suma' class="controles-cantidad">+</button>
                </div>          
                
                    <div class="buttons">
                        <a id="btn-agregar" class="agregar ${estaAgotado ? 'disabled' : ''}">
                            <span class="btn-text">Agregar al carrito</span><img class="cart-icon" src="../../../img/icons/cart.svg" alt="cart" loading="lazy">
                        </a>                        
                    </div>
                </section>                      
            </div>
        `;

        this.addEventListeners();
    }
    addEventListeners() {
        const inputCantidad = this.shadowRoot.querySelector('#quantity')
        this.shadowRoot.querySelector('.agregar').addEventListener('click', (event) => {
            event.preventDefault();
            this.shadowRoot.querySelector('.confirmacion').classList.add('show');
            setTimeout(() => this.shadowRoot.querySelector('.confirmacion').classList.remove('show'), 4000);
            this._item.order_quantity = Number(inputCantidad.value);
            this.dispatchEvent(new CustomEvent('agregarProducto', {
                detail: this._item,
                bubbles: true,
                composed: true
            }));
        });

        this.shadowRoot.querySelector('#control-resta').addEventListener('click', (event) => {
            event.preventDefault();
            inputCantidad.value--;
            if (inputCantidad.value < 1) {
                inputCantidad.value = 1;
            }
        });
        this.shadowRoot.querySelector('#control-suma').addEventListener('click', (event) => {
            event.preventDefault();
            inputCantidad.value++;
            if (inputCantidad.value > this._item.stock) {
                inputCantidad.value = this._item.stock;
                this.shadowRoot.querySelector('#control-suma').setAttribute('disabled', true);
                this.shadowRoot.querySelector('#control-suma').innerHTML = 'Límite en stock';
                this.shadowRoot.querySelector('#control-suma').style.fontSize = '12px';
                this.shadowRoot.querySelector('#control-suma').style.color = 'red';
            }
            setTimeout(() => {
                this.shadowRoot.querySelector('#control-suma').removeAttribute('disabled');
                this.shadowRoot.querySelector('#control-suma').innerHTML = '+';
                this.shadowRoot.querySelector('#control-suma').style.color = 'green';
                this.shadowRoot.querySelector('#control-suma').style.fontSize = '16px';
            }, 4000);
        });
    }
}

customElements.define('product-card', Card);