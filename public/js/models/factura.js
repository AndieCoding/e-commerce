export class Factura {
    constructor(data) {
        this.fecha = data.fecha.slice(0, 10);
        this.empresa = data.empresa;
        this.tipo = data.P_TIPO;
        this.nFactura = data.nFactura;
        this.productos = JSON.parse(data.productos);
        this.total = data.total;
    }
}
