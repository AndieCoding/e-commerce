import { Menu } from '../../components/navigation/menu.js';
import { CartController } from '../../components/cart/cart-controller.js';
import { ItemCard } from '../../components/products/item-card.js';
import { Footer } from '../../components/navigation/footer.js';
import { ConfirmCart } from '../../components/products/confirm-cart.js';
import { Carrito } from '../../components/cart/carrito.js';
import { MetPago } from './metpago.js';

export class ConfirmarCompra extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.controller = new CartController();
    document.addEventListener('actualizarTotal', (event) => {
      const precioTotal = event.detail;
      this.mostrarTotal(precioTotal);
    });
    document.addEventListener('actualizarTotalProducts', (event) => {
      this.mostrarTotalProducts(event.detail);
    });
    document.addEventListener('actualizarCarrito', () => {
      this.mostrarTotal();
    });
  }

  connectedCallback() {
    this.render();
    this.setupListeners();
    this.mostrarTotal();
    this.mostrarTotalProducts();
  }

  setupListeners() {
    this.shadowRoot.querySelector('.boton-vaciar-carrito').addEventListener('click', () => {
      this.vaciarCarrito();
    });

    this.shadowRoot.querySelector('.carrito-seguir').addEventListener('click', () => {
      window.location.href = '/';
    });
  }

  mostrarTotalProducts(total) {
    const cantidadProductosElement = this.shadowRoot.querySelector('#cantidad-productos');
    cantidadProductosElement.textContent = total ? total : this.controller.getTotalProducts();
  }
  mostrarTotal(precioTotal) {
    const totalElement = this.shadowRoot.querySelector('#total-precio');
    totalElement.textContent = `$  ${precioTotal ? precioTotal : this.controller.getTotal()}`;
  }

  vaciarCarrito() {
    this.controller.vaciarCarrito([]);
    this.controller.guardarEnLocalStorage();
    this.shadowRoot.querySelector('.resultados').innerHTML = '';
    this.mostrarTotal();
  }

  render() {
    this.shadowRoot.innerHTML = `
    <style>
    @import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');
    
    .detalle-pedido {
      gap:15px;
      background-color: #ffffffff;
      padding: 15px;
      border-radius: 5px;
      box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
      text-align: center;
    }
    h3{
      font-weight: 600;
      text-transform: uppercase;
    }
    .boton-vaciar-carrito {      
      border: none;
      background-color: white;
      padding: 12px 20px;
      padding-top: 14px;
      font-size: 12px;
      cursor: pointer;
      border-radius: 5px;        
      color: #a7aaadff;
      &:hover {
        color: #f77000;
      }
    }    
    .carrito-comprar {
      background-color: #28a745;
      color: white;
      border: none;
      padding: 10px 15px;
      font-size: 12px;
      cursor: pointer;
      border-radius: 5px;
      box-shadow: 1px 1px 2px 1px #82b845aa;
      &:hover {
        box-shadow: 0 0 0 0;
        filter: brightness(1.1)
      }
    }
    #total-precio{
      font-size: 18px;
      font-weight: bold; 
    }
    
    .carrito-seguir {
      background-color: white;
      color: #0084ffff;
      border: none;
      padding: 10px 15px;
      font-size: 14px;
      cursor: pointer;
      border-radius: 5px;
      margin-top: 10px;
      display:flex;
      align-items: center;
      justify-content: center;
      gap: 5px;        
      transition: all 0.1s ease;
      &:hover {
        box-shadow: 0 0 0 0;
        color: #00d9ffff;
      }
    }    
    .cantidad-productos{
      font-size: 42px; 
      font-weight: bold; 
      text-align: center;
      margin-bottom: 15px; 
      color: #249900;
    }

    .botones-inferiores {
      margin-top: 15px;
      display: flex;
      flex-direction: column;
      gap: 15px;
    }
    .curve-arrow {
      font-size: 16px;
    }
    </style>
    <div class="detalle-pedido">
      <p>Total de productos: </p>
      <p id="cantidad-productos" class="cantidad-productos"></p>
      <p>Total: <span id="total-precio"></span></p>
      <a href="/envio"><button class="carrito-comprar">Confirmar</button></a>
      <div class="botones-inferiores">
        <button class="carrito-seguir">Seguir Comprando <span class="curve-arrow">&#8618;</span></button>
        <button class="boton-vaciar-carrito">Vaciar</button>
      </div>
    </div>
    `;
  }
}

customElements.define('confirmar-compra', ConfirmarCompra);
