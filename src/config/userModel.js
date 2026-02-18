import { getConn } from "./db.js";
import { UserB } from "../../public/js/models/user-b.js";

async function getComprasUsuario(userId) {
    let conn = await getConn();
    try {
        const [rows] = await conn.query(
            `SELECT * 
			FROM facturas_ventas			
			WHERE id_cl = ?
			ORDER BY fecha DESC`,
            [userId]
        );
        return [rows];
    } catch (err) {
        console.log("Error getting records");
        console.log(err);
    }
    finally {
        conn.release();
    }
}

async function getUser(id) {
    let conn = await getConn();
    try {
        const [rows] = await conn.query(
            `SELECT * FROM usuarios WHERE ID_US = ?`,
            [id]
        );

        if (!rows || rows.length === 0) {
            return null;
        }

        const user = new UserB(rows[0]);
        return user;
    }
    catch (err) {
        console.log("Error getting user");
        console.log(err);
    }
    finally {
        conn.release();
    }
}


async function Login(email, pass) {
    let conn = await getConn();
    try {
        const [rows] = await conn.query(
            `SELECT * FROM usuarios WHERE email =? AND pass =?`,
            [email, pass]
        );
        if (rows.length > 0) {
            console.log('Login successful');
            return rows[0];
        } else {
            console.log('Login failed');
            return null;
        }
    }
    catch (err) {
        console.log("Error logging in");
        console.log(err);
    }
    finally {
        conn.release();
    }
}

async function LoginOrRegisterWithGoogle(profile) {
    let conn = await getConn();
    try {
        const issuer = 'https://accounts.google.com';
        const googleId = profile.id;
        //Usuario y credenciales
        const [rows] = await conn.query(
            `SELECT u.* FROM usuarios u
			JOIN federated_credentials fc ON u.ID_US = fc.user_id
			WHERE fc.provider = ? AND fc.subject = ?`,
            [issuer, googleId]
        );
        if (rows.length > 0) {
            return new UserB(rows[0]);
        }

        //Si no existe, chequeo email por si se registró manualmente
        const email = profile.emails[0].value;
        const [existing] = await conn.query('SELECT * FROM usuarios WHERE email = ?', [email]);

        let user;
        if (existing.length > 0) {
            user = existing[0];
        } else {
            //Nuevo usuario
            const [result] = await conn.query(
                `INSERT INTO usuarios(nombre, email) VALUES (?, ?)`,
                [profile.displayName, email]
            );
            user = { ID_US: result.insertId, nombre: profile.displayName, email: email, TIPO: 'us' };
        }

        // Insertar en tabla federada
        await conn.query(
            'INSERT INTO federated_credentials (user_id, provider, subject) VALUES (?, ?, ?)',
            [user.ID_US, issuer, googleId]
        );

        return new UserB(user);

    } catch (err) {
        console.error('Error en estrategia Google:', err);
        throw err;
    } finally {
        conn.release();
    }
}

async function RegistrarUsuario(user) {
    let conn = await getConn();
    try {
        console.log('Cargando datos en la base de datos : ', user);
        const [existentUser] = await conn.query(
            `SELECT * FROM usuarios WHERE email =?`,
            [user.EMAIL]
        );
        if (existentUser.length > 0) {
            console.log('Email existente. Cancelando registro');
            return { message: "El email ya existe", success: false };
        }
        const [result] = await conn.query(
            `INSERT INTO usuarios(
			nombre, 
			apellido, 
			domicilio,
			ciudad,
			email, 
			pass,
			dni) 
		 	VALUES ( ?, ?, ?, ?, ?, ?, ?)`, [
            user.NOMBRE,
            user.APELLIDO,
            user.DOMICILIO,
            user.CIUDAD,
            user.EMAIL,
            user.PASS,
            user.DNI
        ]
        );
        console.log('Usuario registrado en la base de datos: ' + result);
        return result;
    }
    catch (err) {
        console.log("Error en la inserción de datos.");
        console.log(err);
    }
    finally {
        conn.release();
    }
}

async function updateUserData(userId, data) {
    let conn = await getConn();
    try {
        const key = Object.keys(data)[0];
        const value = data[key];

        if (value === undefined || value === "") {
            console.log('Sin valores para actualizar')
            return;
        }

        const fieldMapping = {
            'NOMBRE': 'NOMBRE',
            'DOMICILIO': 'DOMIC',
            'CIUDAD': 'CIUD',
            'DNI': 'DNI',
            'PASSWORD': 'PASS'
        };
        let dbColumn = fieldMapping[key];

        if (!dbColumn) {
            console.log(`Campo no permitido o desconocido: ${key}`);
            return;
        }

        const [rows] = await conn.query(
            `UPDATE usuarios SET ${dbColumn} = ? WHERE ID_US = ?`, [
            value, userId
        ]);
        console.log(`${dbColumn} updated`);
        return [rows];

    } catch (err) {
        console.log("Update error", err);
        throw err;
    } finally {
        conn.release();
    }
}

export default {
    getComprasUsuario,
    getUser,
    Login,
    LoginOrRegisterWithGoogle,
    RegistrarUsuario,
    updateUserData
};
