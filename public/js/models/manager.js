import { UserB } from "./user-b.js";

export class Manager {
    constructor() {
    }
    async registrarVenta(formData) {
        let response, error;
        try {
            response = await fetch(`/api/registrarVenta`, {
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
    async actualizar(data, id_user) {
        try {
            const isFormData = data instanceof FormData;

            const response = await fetch(`/api/update/${id_user}`, {
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
                console.log('Actualización exitosa', dataResponse);
            }
            return dataResponse;

        } catch (err) {
            console.error("Error al actualizar:", err);
        }
    };
    async registro(data) {

        try {
            const user = new User({
                NOMBRE: data.nombre,
                DOMICILIO: data.domicilio,
                APELLIDO: data.apellido,
                CIUDAD: data.ciudad,
                EMAIL: data.email,
                PASS: data.password
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
            return { success: false, message: "Error de conexión al intentar registrarse." };
        };
    }
    async ingresar(data) {

        const credentials = { email: data.email, pass: data.pass };

        try {
            const response = await fetch(`/api/user`, {
                method: "POST",
                headers: {
                    "Content-type": "application/json",
                },
                body: JSON.stringify(credentials)
            });

            const result = await response.json();

            if (result.success) {
                const user = new UserB(result.user);
                localStorage.setItem('user', user.stringify());
            }
            return result;
        } catch (err) {
            console.error("Error during login:", err);
            return { success: false, message: "Error de conexión al intentar ingresar." };
        }
    }

    async eliminar(user) {
        const response = await fetch(`/api/deleteAccount?user=${user}`, {
            method: "DELETE",
        });
        const data = await response.json();
        return data;
    }
}
