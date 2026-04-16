export class Ticket {
    constructor(data) {
        this.nom_cl = data.nom_cl || 'Cliente';
        this.id_fac = data.id_fac || null;
        this.n_fac = data.n_fac ?? data.N_FACTURA ?? null;
        this.id_cl = data.id_cl ?? data.ID_CL;
        this.total = data.total_compra ?? data.total ?? data.TOTAL ?? 0;
        this.fecha = data.fecha || data.FECHA;
        this.met_pago = data.met_pago ?? data.MET_PAGO;
        this.detalle = data.productos || data.detalle || [];
        this.status = data.status?.toLowerCase() || 'pendiente';
        this.env_stus = data.env_stus?.toLowerCase() || 'pendiente';
        this.env_nro = data.env_nro || null;
        this.em_cto = data.em_cto;
        this.nbre_cto = data.nbre_cto;
    }

    get id() { return this.n_fac; }
    get date() { return this.fecha; }
    get items() { return this.detalle; }
    get NumeroEnvio() {
        if (this.env_stus.toLowerCase() === 'enviado') {
            return this.env_nro;
        }
        return null;
    }
    get fechaFormateada() {
        if (!this.fecha) return "Sin fecha";

        try {
            // Manejamos tanto objetos Date como strings ISO
            const isoString = typeof this.fecha === 'string'
                ? this.fecha
                : this.fecha.toISOString();

            const [fechaParte, horaParte] = isoString.split('T');
            const [year, month, day] = fechaParte.split('-');
            const horaLimpia = horaParte.split('.')[0];

            return `${day}/${month}/${year.slice(-2)} ${horaLimpia}`;
        } catch (error) {
            console.error("Error formateando fecha en Ticket:", error);
            return this.fecha; // Retorno de seguridad
        }
    }

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
