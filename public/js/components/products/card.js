export class Card extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.tipo = 'grid';
        this.isLoading = false;
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
                min-width: 160px;
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
                    width: 140px;
                    min-width: 140px;
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
        const productId = this.getAttribute('id');
        const productImage = this.getAttribute('image') || '';
        const productName = this.getAttribute('name') || 'Product Name';
        const productPrice = this.getAttribute('price') || 0;
        const productOferta = this.getAttribute('oferta') || '';
        const productMarca = this.getAttribute('marca') || 'Product Marca';
        const productDescription = this.getAttribute('description') || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.';
        const productType = this.getAttribute('type') || 'Product Type';
        let stock = this.getAttribute('stock') || 0;
        let stockClass = '';
        let stockState = '';

        if (stock > 9) {
            stockState = 'Disponible';
            stockClass = 'green';
        } else if (stock < 1) {
            stockState = 'Agotado';
            stockClass = 'gray';
        } else if (stock < 10) {
            stockState = stock;
            stockClass = '#c5640aff';
        }

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
                min-width: 170px;                                 
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
                input {
                    display: none;
                }
            }
         
            .card.list {
                display: grid;
                grid-template-columns: 1fr 2fr;               
                width: 100%; 
                height: 100%;
                max-width: 800px;
            }

            .card.list .img {
                height: 120px;
            }
            .card.list .buttons .agregar{
                position: absolute;
                bottom: 10px;
                right: 10px;
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
                margin-right: 25px  ;
                backdrop-filter: blur(5px);
                padding: 0.1em 0.5em;
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
                top: 50%;
                right: 5px;
                @media (width<900px) {
                    top: 55%;
                }
            }
            .card.list .product-price {                
                align-items: start;
                left: 125px;
                top: 70%;
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
                    width: 160px;
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
                .old-price {
                    display: none; 
                }
                
                .offer-price {
                    margin-left: 0;
                    font-size: 16px;
                }
            }
            </style>

            <div class="card ${this.tipo === 'list' ? 'list' : ''}">
                <a href="/detalle?id=${productId}">
                    <div class="img">
                        <img src="${productImage}" alt="${productName}" loading="lazy">
                    </div>
                </a>
                <section class="descripcion">
                    <div class="product-info">
                        <a class="product-name" href="/detalle?id=${productId}">
                            <p>${productName}</p>
                        </a>
                        <div class="product-price">
                            <p class="stock">
                                <span class="dot">&#8226;</span>
                                ${this.evaluarStock(stockClass, stockState, stock)}
                            </p>
                            <h4 class="price">
                                ${this.evaluarOferta(stock, productPrice, productOferta)}
                            </h4>
                        </div>
                    </div>                 
                    <div class="confirmacion">
                        <span>Producto agregado</span><span class="tick">&#10004;</span>
                    </div>
                </section>
                <section class="buttons-section">
                    <div class="buttons">
                        <a id="btn-agregar" class="agregar ${stock === 'Agotado' ? 'disabled' : ''}">
                            <span class="btn-text">Agregar al carrito</span><img class="cart-icon" src="../../../img/icons/cart.svg" alt="cart" loading="lazy">
                        </a>                        
                    </div>
                </section>                
            </div>
        `;

        this.shadowRoot.querySelector('.agregar').addEventListener('click', (event) => {
            event.preventDefault();

            this.productData = {
                P_ID: productId,
                P_IMG: productImage,
                P_NOMBRE: productName,
                P_PRECIO: productPrice,
                P_DESCRIPCION: productDescription,
                P_TIPO: productType,
                P_CANTIDAD: 1,
                P_STOCK: stock
            };

            this.dispatchEvent(new CustomEvent('agregarProducto', {
                detail: this.productData,
                bubbles: true,
                composed: true
            }));
        });
        this.addEventListeners();
    }

    addEventListeners() {
        const btnAgregar = this.shadowRoot.querySelector('.agregar');
        if (btnAgregar) {
            btnAgregar.addEventListener('click', (event) => {
                this.shadowRoot.querySelector('.confirmacion').classList.add('show');
                setTimeout(() => {
                    this.shadowRoot.querySelector('.confirmacion').classList.remove('show');
                }, 4000);
            });
        }
    }
    evaluarStock(stockClass, stockState, stock) {
        return stockClass === '#c5640aff' ? `${stockState} ${stock < 2 ? 'unidad' : 'unidades'}` : `${stockState}`;

    }
    evaluarOferta(stock, productPrice, productOferta) {
        if (stock > 0) {
            if (parseInt(productOferta) > 0) {
                return `<span class="old-price">$ ${productPrice}</span><span class="offer-price">$ ${productOferta}</span>`;
            } else {
                return `$ ${productPrice}`;
            }
        } else {
            return '$ -';
        }
    }
}

customElements.define('product-card', Card);