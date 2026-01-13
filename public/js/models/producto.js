export class Producto {
    constructor(data) {
        this.tipo = data.tipo;
        this.nombre = data.nombre;
        this.marca = data.marca;
        this.descripcion = data.descripcion;

        /*this.precio_compra = data.precio_compra;
        this.precio_venta = data.precio_venta;
        this.cantidad = data.cantidad;*/
        this.image = data.image || null;
    }
}
