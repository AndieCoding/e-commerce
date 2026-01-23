import { CartCard } from "./cart-card.js";
import { Carrito } from "./carrito.js";

export class CartController {
    constructor() {
        if (CartController.instance) {
            return CartController.instance;
        }

        this.orden = this.cargarDesdeLocalStorage();

        if (!CartController.hasInitializedListeners) {
            document.addEventListener('actualizarCantidad', (event) => {
                const { productId, newQuantity } = event.detail;
                this.actualizarCantidad(productId, newQuantity);
            });

            document.addEventListener('agregarProducto', (event) => {
                this.agregarProducto(event.detail);
            });

            document.addEventListener('vaciarCarrito', (event) => {
                this.vaciarCarrito(event.detail);
            });

            document.addEventListener('eliminarItem', (event) => {
                this.eliminarProducto(event.detail);
            });

            CartController.hasInitializedListeners = true;
        }

        CartController.instance = this;
    }

    eliminarProducto(id) {
        const existingProduct = this.orden.find(p => p.P_ID === id);
        if (existingProduct) {
            this.orden.splice(this.orden.indexOf(existingProduct), 1);
            this.guardarEnLocalStorage();
            this.actualizarCarrito();
        } else {
            console.log('Producto no encontrado');
            return;
        }
    }

    agregarProducto(cartItem) {
        const existingProduct = this.orden.find(p => p.P_ID === cartItem.P_ID);
        console.log('ID de item seleccionado: ' + cartItem.P_ID);

        if (existingProduct) {
            console.log('ID de productos encontrado: ' + existingProduct.P_ID);
            existingProduct.P_CANTIDAD = (Number(existingProduct.P_CANTIDAD) + Number(cartItem.P_CANTIDAD) <= cartItem.P_STOCK) ? Number(existingProduct.P_CANTIDAD) + Number(cartItem.P_CANTIDAD) : Number(cartItem.P_STOCK);
        } else {
            cartItem.P_CANTIDAD = Number(cartItem.P_CANTIDAD);
            this.orden.push(cartItem);
        }
        this.guardarEnLocalStorage();
        this.actualizarCarrito();
    }

    actualizarCantidad(id, valor) {
        const existingProduct = this.orden.find(p => p.P_ID === id);
        if (!existingProduct) {
            return;
        }
        existingProduct.P_CANTIDAD = Number(valor);

        this.guardarEnLocalStorage();
        this.actualizarCarrito();
        this.actualizarTotal();
        this.actualizarTotalProducts();
    }

    generarCard(product) {
        const cartCard = document.createElement('carrito-card');
        cartCard.setAttribute('id', product.P_ID);
        cartCard.setAttribute('image', product.P_IMG);
        cartCard.setAttribute('name', product.P_NOMBRE);
        cartCard.setAttribute('price', product.P_PRECIO);
        cartCard.setAttribute('quantity', product.P_CANTIDAD);
        cartCard.setAttribute('stock', product.P_STOCK);

        return cartCard;
    }

    actualizarCarrito() {
        document.dispatchEvent(new CustomEvent('actualizarCarrito', { detail: this.orden }));
        this.actualizarTotalProducts();
    }

    actualizarTotal() {
        document.dispatchEvent(new CustomEvent('actualizarTotal', { detail: this.getTotal() }));
    }

    actualizarTotalProducts() {
        document.dispatchEvent(new CustomEvent('actualizarTotalProducts', { detail: this.getTotalProducts() }));
    }

    vaciarCarrito(array) {
        this.orden.forEach(p => p.P_CANTIDAD = 0);
        this.orden = array;
        console.log('Carrito vacío');
        this.guardarEnLocalStorage();
        this.actualizarCarrito();
        this.actualizarTotalProducts();
    }

    cargarDesdeLocalStorage() {
        const products = JSON.parse(localStorage.getItem('ordenCompra')) || [];
        return products;
    }

    guardarEnLocalStorage() {
        localStorage.removeItem('ordenCompra');
        localStorage.setItem('ordenCompra', JSON.stringify(this.orden));
    }

    getProducts() {
        return this.orden;
    }

    getTotal() {
        return this.orden.reduce((total, product) => total + product.P_CANTIDAD * product.P_PRECIO, 0);
    }

    getTotalProducts() {
        return this.orden.reduce((total, product) => total + product.P_CANTIDAD, 0);
    }
}