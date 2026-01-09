export class Card extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        const productId = this.getAttribute('id');
        const productImage = this.getAttribute('image') || '';
        const productName = this.getAttribute('name') || 'Product Name';
        const productPrice = this.getAttribute('price') || 'Product Price';
        const productMarca = this.getAttribute('marca') || 'Product Marca';
        const productDescription = this.getAttribute('description') || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.';
        const productType = this.getAttribute('type') || 'Product Type';
        let stock = this.getAttribute('stock') || 0;
        let stockClass = '';
        let stockState = '';

        if ( stock > 9 ) {
            stockState = 'Disponible';
            stockClass = 'green';
        } else if (stock < 1) {
            stockState = 'Agotado';
            stockClass = 'gray';
        } else  if (stock < 10 ){
            stockState = stock;
            stockClass = '#c50a0a';
        } 
        
        
        this.shadowRoot.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Roboto+Condensed:ital,wght@0,100..900;1,100..900&display=swap');
            @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap');
            @import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');
            :host-context(.resultados) .img {             
                height: 200px;
            }
            :host-context(.resultados) .stock {             
                top: 35%;
            }

            .card {
                height: 475px;
                font-family: arial;
                border-radius: 10px;
                padding: 1.5em;                
                overflow: hidden;
                box-shadow: 0 0 4px 1px rgb(124, 159, 195, 0.3);
                background-color: white;
                position: relative;
               
                .img {             
                    height: 220px;
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
                    justify-content: space-between;
                    gap: 1em;
                }

                .buttons a {
                    display: block;
                    text-decoration: none;
                    background-color: blue;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    padding: 1em 3em;
                    width: fit-content;
                    margin: 0.5em auto;
                    cursor: pointer;
                }
                .buttons a.agregar {
                    background-color: rgb(59 201 59);
                    color: #eee;
                    font-weight: 600;
                    transition: background-color 0.2s;

                    &:hover {
                        outline: 1px solid green;
                        background-color: rgb(105 225 105);
                        color: #394f4b;
                    }
                }
                .confirmacion {
                    color: green;                    
                    margin-left: 10px;
                    opacity: 0;
                    transition: opacity 0.5s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5em;
                    font-family: poppins;
                    font-weight: 500;
                    
                    .tick {
                        font-size: 20px;
                    }
                }

                .confirmacion.show {
                    opacity: 1;
                }

                input {
                    display: none;
                }
            }

            .product-name {
                font-family: Roboto Condensed;
                font-size: 28px;
                text-transform: uppercase;
                color: #553b28;
                margin: 0.5em 0;      
            }
            .price {
                background-color: #ffa500cc;
                border-radius: 5px;
                padding: 0.1em 0.5em;
                font-family: Roboto Condensed;
                font-size: 26px;
                font-weight: 400;
                text-transform: uppercase;
                color: #26313d;
                position: absolute;
                top: 45%;
                right: 20px;
            }

            .stock {
                display: flex;
                align-items: center;     
                gap:5px;           
                font-size: 18px;
                font-weight: 200;
                position: absolute;
                top: 40%;
                right: 15px;
                color: ${stockClass};
                background-color: white;
                border-radius: 10px;
                box-shadow: 1px 1px 5px 1px white;
            }
            .stock .dot {
                font-size: 30px;
            }

            .product-details {
                margin-bottom: 0.5em;
            }

            .product-marca {
                font-family: Bebas Neue;
                font-size: 20px;
                letter-spacing: 2px;
                text-transform: uppercase;
                color: #53585fd4;
                margin: 0.3em 0;
            }

            .product-description {
                font-family: Roboto Condensed;
                font-size: 16px;
                color: #53585f;
                height: 55px;
            }

            .card a.disabled {
                pointer-events: none;  
                opacity: 0.5;       
                cursor: not-allowed;
            }
            </style>
            <div class="card">
                <a>
                <div class="img">
                    <img src="${productImage}" alt="${productName}">
                </div>
                </a>
                <div class="product-info">
                    <div>
                        <h3 class="product-name">${productName}</h3>
                    </div>
                    <div class="product-price">
                        <p class="stock">
                        <span class="dot">&#8226;</span>
                        ${stockClass === '#c50a0a' ? `${stockState} ${stock < 2 ? 'unidad' : 'unidades'}` : `${stockState}`}
                        </p>
                        <h4 class="price">${stock > '0' ? '$ ' + productPrice : ""}</h4>
                    </div>
                </div>
                <div class="product-details">
                    <h4 class="product-marca">${productMarca}</h4>                
                    <p class="product-description">${productDescription}</p>
                </div>
                <div class="confirmacion">
                <span>Producto agregado</span><span class="tick">&#10004;</span>
                </div>
                <div class="buttons">
                    <a 
                        class="agregar ${stock === 'Agotado' ? 'disabled' : ''}"
                    >
                        Agregar al carrito
                    </a>                        
                </div>
                
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