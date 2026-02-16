export class Producto {
    constructor(dbRow = {}) {
        this.id = dbRow.ID_PROD || dbRow.id;
        this.nombre = dbRow.P_NOMBRE || dbRow.nombre || 'Producto sin nombre';
        this.precio = parseFloat(dbRow.P_PRECIO || dbRow.precio || 0);
        this.oferta = parseFloat(dbRow.P_PR_OFERTA || dbRow.oferta || 0);
        this.stock = parseInt(dbRow.P_CANTIDAD || dbRow.stock || 0);
        this.imagen = dbRow.P_IMG || dbRow.imagen || '/img/placeholder.jpg';
        this.marca = dbRow.P_MARCA || dbRow.marca || '';
        this.descripcion = dbRow.P_DESCRIPCION || dbRow.descripcion || '';
        this.order_quantity = parseInt(dbRow.order_quantity || 0) || dbRow.cantidad;
    }
    get stockInfo() {
        if (this.stock > 9) return { state: 'Disponible', class: 'green' };
        if (this.stock <= 0) return { state: 'Agotado', class: 'gray' };
        return {
            state: `${this.stock} ${this.stock === 1 ? 'unidad' : 'unidades'}`,
            class: '#c5640aff'
        };
    }
    get precioHtml() {
        if (this.stock <= 0) return '$ -';
        if (this.oferta > 0) {
            return `<span class="old-price">$ ${this.precio}</span><span class="offer-price">$ ${this.oferta}</span>`;
        }
        return `$ ${this.precio}`;
    }
    get precioHtmlAdmin() {
        if (this.stock <= 0) return '$ -';
        if (this.oferta > 0) {
            return `<span class="old-price">$ ${this.precio}</span><span class="offer-price"> | Precio de oferta: $ ${this.oferta}</span>`;
        }
        return `$ ${this.precio}`;
    }
    get estaAgotado() {
        return this.stock <= 0;
    }
    toClient() {
        return {
            id: this.id,
            nombre: this.nombre,
            precio: this.precio,
            oferta: this.oferta,
            marca: this.marca,
            descripcion: this.descripcion,
            stock: this.stock,
            imagen: this.imagen,
            isOffer: this.oferta > 0 && this.oferta < this.precio,
            isAvailable: this.stock > 0,
            thumbnail: this.thumbnail
        };
    }
    get thumbnail() {
        return this.imagen.includes('cloudinary')
            ? this.imagen.replace('/upload/', '/upload/w_400,c_fill,f_auto,q_auto/')
            : this.imagen;
    }
    get precioFinal() {
        return (this.oferta > 0 && this.oferta < this.precio) ? this.oferta : this.precio;
    }
}