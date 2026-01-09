import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import router from './src/routes/consultas.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas de API
app.use('/api', router);

// Archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Rutas de Vistas (Frontend)
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "views", "index.html"));
});

app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "views", "login.html"));
});

app.get("/user_menu", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "views", "user_menu.html"));
});

app.get("/productos", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "views", "products.html"));
});

app.get("/registro", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "views", "registro.html"));
});

app.get("/detalle", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "views", "detalle.html"));
});

app.get("/confirmar", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "views", "confirmar-compra.html"));
});

app.get("/envio", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "views", "envio.html"));
});

app.get("/nosotros", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "views", "nosotros.html"));
});

// Rutas de Administración
app.get("/ventas", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "views", "admin", "ventas.html"));
});

app.get("/compras", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "views", "admin", "compras.html"));
});

app.get("/ficha", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "views", "admin", "ficha-stock.html"));
});

app.get("/informes", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "views", "admin", "informes.html"));
});

app.get("/altas", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "views", "admin", "alta-productos.html"));
});

app.listen(port, () => {
    console.log(`\nApp listening on port ${port} \n`);
});
