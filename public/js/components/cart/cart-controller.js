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
        const existingProduct = this.orden.find(p => p.id === id);
        if (existingProduct) {
            this.orden.splice(this.orden.indexOf(existingProduct), 1);
            this.guardarEnLocalStorage();
            this.actualizarCarrito();
        } else {
            console.log('Producto no encontrado');
            return;
        }
    }

    agregarProducto(product) {
        const existingProduct = this.orden.find(p => p.id === product.id);
        if (existingProduct) {
            existingProduct.order_quantity = (Number(existingProduct.order_quantity) + Number(product.order_quantity) <= product.stock) ? Number(existingProduct.order_quantity) + Number(product.order_quantity) : Number(product.stock);
        } else {
            product.order_quantity = Number(product.order_quantity);
            this.orden.push(product);
        }
        this.guardarEnLocalStorage();
        this.actualizarCarrito();
    }

    actualizarCantidad(id, valor) {
        const existingProduct = this.orden.find(p => p.id === id);
        if (!existingProduct) {
            return;
        }
        existingProduct.order_quantity = Number(valor);

        this.guardarEnLocalStorage();
        this.actualizarCarrito();
        this.actualizarTotal();
        this.actualizarTotalProducts();
    }

    generarCard(product) {
        const cartCard = document.createElement('carrito-card');
        cartCard.setAttribute('quantity', product.order_quantity !== 0 ? product.order_quantity : 1);
        cartCard.setAttribute('price', product.precio);
        cartCard.data = product;
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

    vaciarCarrito(array = []) {
        if (this.orden) {
            this.orden.forEach(p => p.order_quantity = 0);
        }
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
        return this.orden.reduce((total, product) => {
            return total + product.order_quantity * (product.oferta ? product.oferta : product.precio);
        }, 0);
    }

    getTotalProducts() {
        return this.orden.reduce((total, product) => total + product.order_quantity, 0) || 0;
    }
}