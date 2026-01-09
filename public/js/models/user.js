export class User {
    constructor(data) {
        this.ID = data.ID_US || data.ID || undefined;
        this.NOMBRE = data.NOMBRE;
        this.APELLIDO = data.APELLIDO;
        this.DOMICILIO = data.DOMICILIO;
        this.CIUDAD = data.CIUDAD;
        this.EMAIL = data.EMAIL;
        this.DNI = data.DNI;
        this.PASS = data.PASS;
        this.FOTO = data.FOTO;
        this.TIPO = data.TIPO;
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
