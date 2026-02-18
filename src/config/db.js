import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    ssl: { rejectUnauthorized: false },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    idleTimeout: 120000,
    maxIdle: 5,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,

});

export async function getConn() {
    try {
        let conn = await pool.getConnection();
        return conn;
    }
    catch (err) {
        console.error('Error getting MySQL connection:', err);
        throw err;
    }
}
