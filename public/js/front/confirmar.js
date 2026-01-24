import { Menu } from '../components/navigation/menu.js';
import { CartController } from '../components/cart/cart-controller.js';
import { ItemCard } from '../components/products/item-card.js';
import { Footer } from '../components/navigation/footer.js';
import { ConfirmCart } from '../components/products/confirm-cart.js';
import { Carrito } from '../components/cart/carrito.js';
import { ConfirmarCompra } from '../components/products/confirmar-compra.js';

document.addEventListener('turbo:load', () => {
    document.querySelector('confirm-cart').shadowRoot.querySelector('.empty-message').style.fontFamily = 'Segoe UI';
    document.querySelector('confirm-cart').shadowRoot.querySelector('.empty-message').style.fontWeight = '100';
    document.querySelector('confirm-cart').shadowRoot.querySelector('.empty-message').style.textAlign = 'center';
    document.querySelector('confirm-cart').shadowRoot.querySelector('.empty-message').style.margin = '30px auto';
    document.querySelector('confirm-cart').shadowRoot.querySelector('.empty-message').style.fontSize = '14px';
});