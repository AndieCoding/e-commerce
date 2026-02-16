export class Ticket {
    constructor(data) {
        this.n_fac = data.n_fac || data.N_FACTURA || null;
        this.id_cl = data.id_cl || data.ID_CL;
        this.total = data.total_compra || data.total || data.TOTAL;
        this.fecha = data.fecha || data.FECHA;
        this.met_pago = data.met_pago || data.MET_PAGO;
        this.detalle = data.productos || data.detalle || [];
        this.status = data.status || 'Pendiente';
        this.seg = data.seg || null;
    }

    get id() { return this.n_fac; }
    get date() { return this.fecha; }
    get items() { return this.detalle; }

    /*lógica de seguimiento
    getLinkSeguimiento() {
        if (!this.seg) return null;

        // Ejemplo: Si el seguimiento empieza con "CP", es Correo Argentino
        if (this.seg.startsWith('CP')) {
            return `https://www.correoargentino.com.ar/formularios/e-commerce?id=${this.seg}`;
        }
        
        // Ejemplo: Si son solo números largos, podría ser Andreani
        if (/^\d{10,}$/.test(this.seg)) {
            return `https://seguimiento.andreani.com/envio/${this.seg}`;
        }

        // Por defecto, si no reconoce la empresa, devuelve un buscador general o el nro
        return `https://www.google.com/search?q=seguimiento+paquete+${this.seg}`;
    }
    */

}
