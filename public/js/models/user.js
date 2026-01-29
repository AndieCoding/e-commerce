export class User {
    constructor(data = {}) {
        this.ID = data.ID || data.ID_US || data.id_us || data.id || undefined;
        this.NOMBRE = data.NOMBRE || data.nombre || null;
        this.APELLIDO = data.APELLIDO || data.apellido || null;
        this.DOMICILIO = data.DOMICILIO || data.domicilio || null;
        this.CIUDAD = data.CIUDAD || data.ciudad || null;
        this.EMAIL = data.EMAIL || data.email || null;
        this.DNI = data.DNI || data.dni || null;
        this.PASS = data.PASS || data.pass || null || data.HASHED_PASSWORD;
        this.FOTO = data.FOTO || data.foto || null;
        this.TIPO = data.TIPO || data.tipo || null;
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
