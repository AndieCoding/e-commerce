import { User } from "./user.js";

export class Manager {
    constructor() {
    }
    async consultarNFactura() {
        let response, error;
        try {
            response = await fetch(`${window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:3000' : 'https://tienda-mate.vercel.app/'}api/nfactura`);
        } catch (err) {
            error = err;
        }
        const data = await response.json();
        if (data.success) {
            return data;
        } else {
            throw error;
        }
    }

    async registrarVenta(formData) {
        let response, error;
        try {
            response = await fetch(`${window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:3000' : 'https://tienda-mate.vercel.app/'}api/registrarVenta`, {
                method: "POST",
                body: formData
            });
        } catch (err) {
            error = err;
        }
        if (response) {
            return await response.json();
        } else {
            throw error;
        }
    }

    async actualizar(data) {
        try {
            const user = new User(JSON.parse(localStorage.getItem('user')));
            const userId = user.ID;

            const isFormData = data instanceof FormData;

            const response = await fetch(`${window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:3000' : 'https://tienda-mate.vercel.app/'}api/update/${userId}`, {
                method: "PUT",
                body: isFormData ? data : JSON.stringify(data),  // Send FormData if available
                headers: !isFormData
                    ? {
                        "Content-type": "application/json",  // Only set for non-FormData requests
                    }
                    : undefined
            });

            const dataResponse = await response.json();

            if (dataResponse.success) {
                const dataValues = isFormData ? [...data.entries()] : Object.entries(data);
                user.setProperty(dataValues[0][0], dataValues[0][1]);
                localStorage.setItem('user', user.stringify());

            }
            return dataResponse;

        } catch (err) {
            console.error("Error:", err);
        }
    };
    async guardarFactura(image, nFactura) {
        try {
            const user = new User(JSON.parse(localStorage.getItem('user')));
            let response;

            if (nFactura) {
                console.log('fetch segun el sistema')
                response = await fetch(`${window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:3000' : 'https://tienda-mate.vercel.app/'}api/guardarFactura/sistema/${nFactura}`, {
                    method: "POST",
                    body: image
                });
            } else {
                response = await fetch(`${window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:3000' : 'https://tienda-mate.vercel.app/'}api/guardarFactura/${user.ID}`, {
                    method: "POST",
                    body: image
                });
            }
            return response.json();
        }
        catch (err) {
            console.log(err);
        }
    }
    async guardarRemito(image) {
        try {
            let response;


            response = await fetch(`/api/guardarRemito`, {
                method: "POST",
                body: image
            });

            console.log(response);
            return response.json();
        }
        catch (err) {
            console.error(err);
        }
    }
    async registro(data) {

        try {
            const user = new User({
                NOMBRE: data.nombre,
                DOMICILIO: data.domicilio,
                APELLIDO: data.apellido,
                CIUDAD: data.ciudad,
                EMAIL: data.email,
                PASS: data.password,
            });
            const response = await fetch(`/api/registro`, {
                method: "POST",
                headers: {
                    "Content-type": "application/json",
                },
                body: JSON.stringify(user),
            });
            const result = await response.json();
            if (result.success) {
                user.setID(result.userId);
                localStorage.setItem('user', JSON.stringify(user))
            }

            return result;
        }
        catch (error) {
            console.error("Error:", error);
        };
    }

    async ingresar(data) {

        const credentials = { email: data.email, pass: data.pass };

        try {
            const response = await fetch(`${window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:3000' : 'https://tienda-mate.vercel.app/'}api/user`, {
                method: "POST",
                headers: {
                    "Content-type": "application/json",
                },
                body: JSON.stringify(credentials)
            });

            const result = await response.json();

            if (result.success) {
                const user = new User(result.user);
                localStorage.setItem('user', user.stringify());
            }
            return result;
        } catch (err) {
            console.error("Error during login:", err);
            throw err;
        }
    }

    async eliminar(user) {
        const response = await fetch(`${window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:3000' : 'https://tienda-mate.vercel.app/'}api/deleteAccount?user=${user}`, {
            method: "DELETE",
        });
        const data = await response.json();
        return data;
    }
}
