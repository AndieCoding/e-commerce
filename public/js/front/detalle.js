import { Menu } from '../components/navigation/menu.js';
import { Footer } from '../components/navigation/footer.js';
import { CartController } from '../components/cart/cart-controller.js';

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    const cartController = new CartController();

    if (!productId) {
        window.location.href = '/productos';
        return;
    }

    try {
        const response = await fetch(`/api/product/${productId}`);
        const data = await response.json();

        if (data.success && data.product) {
            renderProduct(data.product);
        } else {
            console.error('Producto no encontrado');
            // Podrías mostrar un mensaje de error en el DOM
        }
    } catch (error) {
        console.error('Error al obtener el producto:', error);
    }

    function renderProduct(product) {
        const productDetail = document.querySelector('.producto-detalle');
        const imgContainer = document.querySelector('.img-detalle');
        const infoContainer = document.querySelector('.detalles-producto');
        const locationSpan = document.querySelector('.ubicacion-producto a');

        // Update breadcrumb
        if (locationSpan) {
            locationSpan.textContent = product.P_NOMBRE;
        }

        // Update Image
        imgContainer.innerHTML = `<img src="${product.P_IMG}" alt="${product.P_NOMBRE}" id="product-image" class="product-image">`;

        // Update Info
        infoContainer.innerHTML = `
            <style>        
            .cantidad-container {
                display: flex;
                align-items: center;
                margin-bottom: 1em;
            }
            .cantidad-restar,
            .cantidad-sumar {
                background-color: #28a745;
                color: white;
                border: none;            
                cursor: pointer;
                border-radius: 3px;
            }
            .cantidad-selector {
                display: flex;
                align-items: center;
                gap: 10px;
                margin-left: 10px;
            }
            .product-nombre {
                font-family: 'Roboto';     
                text-transform: uppercase;           
                margin: 0;
                margin-bottom: 15px;
                color: #232b25ff;
            }
            .product-marca-detalle {
                font-family: 'Roboto';     
                text-transform: uppercase;           
                margin: 0;
                color: #576e5cff;
            }
            .price-container {
                h4 {
                    font-size: 28px;
                    color: #111412ff;
                    margin:0 0 20px 0;
                }
                h4 span {
                    text-decoration: line-through; 
                    color: #888; 
                    font-size: 0.6em; 
                    margin-right: 10px;
                }
            }
                .cart-msg {
                    margin-top:1em; 
                    color: green;                      
                    display:none; 
                    text-align:center;                    
                }
            .cantidad-selector button {
                transition: all 0.2s;
                font-weight: bold;
            }
            .cantidad-selector button:hover {
                filter: brightness(1.1);
            }
            .cantidad-producto {
                width: 40px; 
                text-align: center; 
                border:none; 
                background:transparent;
            }
                .disponible-producto {
                    margin-left:15px; 
                    color: #666;
                }
            .buttons-detalle {
                display:flex; 
                gap:15px; 
                margin-top: 2em;
            }
                
            .buttons-detalle button {
                display: inline-block;
                text-decoration: none;
                background-color: #28a745;
                color: white;
                border: none;
                border-radius: 8px;
                padding: 1.2em 2em;
                margin-top: 1em;
                font-family: 'Poppins', sans-serif;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                flex:1;
            }

            .buttons-detalle .comprar-detalle {
                background-color: #007bff;
            }

            .buttons-detalle button:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
                filter: brightness(1.1);
            }
            </style>

            <h2 class="product-nombre">${product.P_NOMBRE}</h2>
            <h3 class="product-marca-detalle">${product.P_MARCA}</h3>
            <p class="product-description-detalle">${product.P_DESCRIPCION || 'Sin descripción disponible.'}</p>
            <div class="price-container">
                <h4>
                    ${product.P_PR_OFERTA > 0 ?
                `<span>$${product.P_PRECIO}</span>$${product.P_PR_OFERTA}` :
                `$${product.P_PRECIO}`}
                </h4>
            </div>
            <div class="cantidad-container">
                <label for="cantidad">Cantidad:</label>
                <div class="cantidad-selector">                    
                    <button id="btn-minus" class="cantidad-restar">-</button>
                    <input class="cantidad-producto" type="number" id="cantidad" name="cantidad" value="1" min="1" max="${product.P_CANTIDAD}" readonly>
                    <button id="btn-plus" class="cantidad-sumar">+</button>
                </div>
                <span class="disponible-producto">(Disponible: <span id="disponible">${product.P_CANTIDAD}</span> unidades)</span>
            </div>
            <div class="buttons-detalle">
                <button id="btn-agregar" class="agregar-detalle">AGREGAR AL CARRITO</button>
                <button id="btn-comprar" class="comprar-detalle">COMPRAR AHORA</button>
            </div>
            <div id="cart-msg" class="cart-msg">¡Producto agregado con éxito! ✓</div>
        `;

        const qtyInput = document.getElementById('cantidad');
        const btnMinus = document.getElementById('btn-minus');
        const btnPlus = document.getElementById('btn-plus');
        const btnAgregar = document.getElementById('btn-agregar');
        const btnComprar = document.getElementById('btn-comprar');
        const cartMsg = document.getElementById('cart-msg');

        btnMinus.addEventListener('click', () => {
            let val = parseInt(qtyInput.value);
            if (val > 1) qtyInput.value = val - 1;
        });

        btnPlus.addEventListener('click', () => {
            let val = parseInt(qtyInput.value);
            if (val < product.P_CANTIDAD) qtyInput.value = val + 1;
        });

        const addToCart = () => {
            const productData = {
                P_ID: product.ID_PROD,
                P_IMG: product.P_IMG,
                P_NOMBRE: product.P_NOMBRE,
                P_PRECIO: product.P_PR_OFERTA > 0 ? product.P_PR_OFERTA : product.P_PRECIO,
                P_DESCRIPCION: product.P_DESCRIPCION,
                P_TIPO: product.P_TIPO,
                P_CANTIDAD: parseInt(qtyInput.value),
                P_STOCK: product.P_CANTIDAD
            };

            document.dispatchEvent(new CustomEvent('agregarProducto', {
                detail: productData,
                bubbles: true,
                composed: true
            }));

            cartMsg.style.display = 'block';
            setTimeout(() => { cartMsg.style.display = 'none'; }, 3000);
        };

        btnAgregar.addEventListener('click', addToCart);

        btnComprar.addEventListener('click', () => {
            addToCart();
            window.location.href = '/confirmar';
        });
    }
});
