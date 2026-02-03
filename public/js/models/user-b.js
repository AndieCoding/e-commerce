export class UserB {
    constructor(dbUser) {
        this.id = dbUser.ID_US || dbUser.ID;
        this.nombre = dbUser.NOMBRE;
        this.email = dbUser.EMAIL;
        this.rol = dbUser.TIPO;
        this.foto = dbUser.FOTO || '/img/icons/sin-foto.svg';
        this.password = dbUser.PASSWORD || '';
        this.domicilio = dbUser.DOMICILIO || '';
    }

    esAdmin() {
        return this.rol === 'ad';
    }

    toClient() {
        return {
            nombre: this.nombre,
            email: this.email,
            foto: this.foto,
            tipo: this.esAdmin(),
            domicilio: this.domicilio
        }
    }
    getPassword() {
        return this.password;
    }
}