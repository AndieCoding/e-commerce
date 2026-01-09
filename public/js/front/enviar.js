import { Menu } from '../components/navigation/menu.js';
import { CartController } from '../components/cart/cart-controller.js';
import { Carrito } from '../components/cart/carrito.js';
import { MetPago } from '../components/products/metpago.js';
import { DireEnvio } from '../components/products/envio.js';
import { Footer } from '../components/navigation/footer.js';
import { ModalAgradecimiento } from '../components/user/modal-agradecimiento.js';

/*document.addEventListener('facturaCargada', () => {
    document.querySelector('factura-del-mate').style.display = 'block';
    document.querySelector('remito-del-mate').style.display = 'block';
    document.dispatchEvent(new CustomEvent('guardarFactura', { detail: {
        detail: document.querySelector('factura-del-mate') 
    }})); 
    document.dispatchEvent(new CustomEvent('guardarRemito', { detail: {
        detail: document.querySelector('remito-del-mate') 
    }}));       
    document.querySelector('factura-del-mate').style.display = 'none';
    document.querySelector('remito-del-mate').style.display = 'block';
    document.body.appendChild(document.createElement('modal-agradecimiento'));
});*/

const logged = localStorage.getItem('user');
const loggedUser = JSON.parse(logged);
if (!loggedUser) {
    document.querySelector('.dire-envio').remove();
}
