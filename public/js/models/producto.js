export class Producto {
    constructor(data) {
        this.nombre = data.nombre;
        this.marca = data.marca;
        this.tipo = data.tipo;
        this.precio_compra = data.precio_compra;
        this.precio_venta = data.precio_venta;
        this.cantidad = data.cantidad;
    }
}
