export class Card extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }
    static get observedAttributes() {
        return ['tipo'];
    }
    attributeChangedCallback(attr, oldValue, newValue) {
        if (attr === 'tipo') {
            this.tipo = newValue;
            if (this.shadowRoot) {
                const card = this.shadowRoot.querySelector('.card');
                if (card) {
                    if (this.tipo === 'list') {
                        card.classList.add('list');
                    } else {
                        card.classList.remove('list');
                    }
                }
            }
        }
    }

    connectedCallback() {
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
            @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Roboto+Condensed:ital,wght@0,100..900;1,100..900&display=swap');
            @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap');
            @import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');
            .card {
                border-radius: 10px;
                padding: 1.5em;                
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
                    font-size: 14px;
                    margin-top: 0;
                    &:hover {
                        background-color: green;
                        color: white;
                    }
                }
                .confirmacion {
                    color: green;                    
                    margin-left: 10px;
                    opacity: 0;
                    transition: opacity 0.5s;
                    display: flex;
                    align-items: end;
                    justify-content: center;
                    gap: 0.5em;
                    font-family: poppins;
                    font-size: 12px;
                    margin: 0;
                    background-color: #96da96ff;
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
                grid-template-columns: 1fr 2fr 1fr;
                gap: 1em;
                width: 100%; 
                max-width: 800px;
                padding: 1em 0.5em;
            }

            .card.list .img {
                height: 120px;
            }

            .card.list .buttons {
                flex-direction: column;
                justify-content: center;
            }
            .card.list .buttons a.agregar {
                position: absolute;
                bottom: 5%;
            }
            
            .card.list .product-marca, 
            .card.list .product-description {
                margin: 0;
            }
            .card.list .confirmacion {
                font-size: 14px;                
                position: absolute;
                top: 40%;
                right: 5%;
                z-index: 10;
                width: 220px;;
            }
            .product-name {
                font-family: Roboto Condensed;
                font-size: 18px;
                text-transform: uppercase;
                color: #553b28;
                margin: 0.5em 0;      
                text-wrap: nowrap;
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
            }
            .price {
                //background-color: #f5cc81cc;
                border-radius: 5px;
                padding: 0.1em 0.5em;
                font-family: Roboto Condensed;
                font-size: 20px;
                font-weight: 400;
                text-transform: uppercase;
                color: #26313d;
                position: absolute;
                top: 45%;
                right: 20px;
                margin: 0;
            }
            .old-price {
                font-size: 14px;
                text-decoration: line-through;
                color: #888;
                margin-right: 5px;
            }
            .offer-price {                
                color: #4e595cff;
            }
            .card.list .product-info .product-price .price {
                top:70%;
                left: 210px;
                display: inline-block;
                width: fit-content;
                height: fit-content;    
            }
            .card.list .product-info .stock {
                top: 55%;
                left: 220px;
            }
            .stock {
                display: flex;
                align-items: center;     
                gap:5px;           
                font-size: 10px;
                font-weight: 100;
                letter-spacing: -0.5px;
                position: absolute;
                top: 38%;
                right: 25px;
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
            </style>
            <div class="card ${this.tipo === 'list' ? 'list' : ''}">
                <a>
                    <div class="img">
                        <img src="${productImage}" alt="${productName}">
                    </div>
                </a>
                <section>
                    <div class="product-info">
                        <div>
                            <h3 class="product-name">${productName}</h3>
                        </div>
                        <div class="product-price">
                        <p class="stock">
                        <span class="dot">&#8226;</span>
                        ${stockClass === '#c5640aff' ? `${stockState} ${stock < 2 ? 'unidad' : 'unidades'}` : `${stockState}`}
                        </p>
                        <h4 class="price">
                            ${stock > 0 ? (
                parseInt(productOferta) > 0 ?
                    `<span class="old-price">$ ${productPrice}</span><span class="offer-price">$ ${productOferta}</span>` :
                    `$ ${productPrice}`
            ) : "$ -"}
                        </h4>
                        </div>
                    </div>
                    <div class="product-details">
                        <h4 class="product-marca">${productMarca}</h4>          
                    </div>
                    <div class="confirmacion">
                        <span>Producto agregado</span><span class="tick">&#10004;</span>
                    </div>
                </section>
                <section>
                    <div class="buttons">
                        <a 
                            class="agregar ${stock === 'Agotado' ? 'disabled' : ''}"
                        >
                            Agregar al carrito
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
        this.shadowRoot.querySelector('.agregar').addEventListener('click', (event) => {
            this.shadowRoot.querySelector('.confirmacion').classList.add('show');
            setTimeout(() => {
                this.shadowRoot.querySelector('.confirmacion').classList.remove('show');
            }, 4000);
        });
    }
}

customElements.define('product-card', Card);