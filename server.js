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
import mysqlSession from 'express-mysql-session';
import { isAdmin, isAuthenticated } from './src/middleware/authMiddleware.js';
import helmet from 'helmet';

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
app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                "default-src": ["'self'"],
                "script-src": ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://code.jquery.com"],
                "style-src": ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://fonts.googleapis.com"],
                "font-src": ["'self'", "https://fonts.gstatic.com"],
                "img-src": ["'self'", "data:", "https:"],
                "connect-src": ["'self'", "https://cdn.jsdelivr.net"],
            },
        },
    })
);
console.log("Helmet CSP middleware initialized");

const options = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
};

const MySQLStore = mysqlSession(session);
const sessionStore = new MySQLStore(options);

app.use(session({
    key: process.env.SESSION_KEY,
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 30, // 30 días en milisegundos
        httpOnly: true,
        secure: false, // Set to true only for HTTPS
        sameSite: 'lax'
    }
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

app.get("/mis_datos", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "views", "mis_datos.html"));
});

app.get("/mis_compras", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "views", "mis_compras.html"));
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
app.get("/ventas", isAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, "public", "views", "admin", "ventas.html"));
});

app.get("/compras", isAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, "public", "views", "admin", "compras.html"));
});

app.get("/ficha", isAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, "public", "views", "admin", "ficha-stock.html"));
});

app.get("/panel", isAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, "public", "views", "admin", "informes.html"));
});

app.get("/administrar", isAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, "public", "views", "admin", "administrar.html"));
});

app.get("/altas", isAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, "public", "views", "admin", "alta-productos.html"));
});

app.listen(port, () => {
    console.log(`\nApp listening on port ${port} \n`);
});
