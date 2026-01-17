export class User {
    constructor(data) {
        this.ID = data.ID_US || data.id_us || data.ID || data.id || undefined;
        this.NOMBRE = data.NOMBRE || data.nombre;
        this.APELLIDO = data.APELLIDO || data.apellido;
        this.DOMICILIO = data.DOMICILIO || data.domicilio;
        this.CIUDAD = data.CIUDAD || data.ciudad;
        this.EMAIL = data.EMAIL || data.email;
        this.DNI = data.DNI || data.dni || 0;
        this.PASS = data.PASS || data.pass;
        this.FOTO = data.FOTO || data.foto;
        this.TIPO = data.TIPO || data.tipo;
    }

    setID(id) {
        this.ID = id;
    }

    setProperty(key, value) {
        this[key] = value;
    }

    stringify() {
        return JSON.stringify(this);
    }
}
