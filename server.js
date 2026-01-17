import express from 'express';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';
import path from 'path';
import { fileURLToPath } from 'url';
import router from './src/routes/consultas.js';
import shippingRouter from './src/routes/shipping.js';
import paymentRouter from './src/routes/payments.js';
import dotenv from 'dotenv';
import logger from 'morgan';
import authRouter from './src/routes/auth.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.set('trust proxy', 1);
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger('dev'));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// Rutas de API
app.use('/', authRouter);
app.use('/api', router);
app.use('/api/shipping', shippingRouter);
app.use('/api/payments', paymentRouter);

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

app.get("/contacto", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "views", "contacto.html"));
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

app.get("/panel", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "views", "admin", "informes.html"));
});

app.get("/administrar", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "views", "admin", "administrar.html"));
});

app.get("/altas", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "views", "admin", "alta-productos.html"));
});

app.listen(port, () => {
    console.log(`\nApp listening on port ${port} \n`);
});
