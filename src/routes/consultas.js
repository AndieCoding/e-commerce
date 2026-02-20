import express from "express";
import consultaDb from "../config/consultas.js";
import userModel from "../config/userModel.js";
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import path from 'path';
import { Producto } from "../../public/js/models/producto.js";
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';
import { Ticket } from "../../public/js/models/ticket.js";

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'users-ecommerce',
        allowed_formats: ['jpg', 'png', 'jpeg']
    }
});

const upload = multer({ storage: storage });

/*const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.fieldname == 'FOTO' || file.fieldname == 'pdf') {
            const productDir = path.join(__dirname, '../../public/img/users');
            cb(null, productDir);
        } else {
            const productDir = path.join(__dirname, '../../public/img/products');
            cb(null, productDir);
        }
    },
    filename: (req, file, cb) => {
        cb(null, `${file.originalname.replace(/\s+/g, '-').toLowerCase()}`);
    }
});*/

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.use(express.json());
router.use(express.urlencoded({ extended: true }));


//guardar pdf de factura
router.post("/guardarFactura/:id", upload.single('pdf'), async (req, res, next) => {
    const nfactura = req.body.nFactura;
    const userId = req.params.id;
    const factura = req.body
    try {
        const actualDir = path.join(__dirname, `../../public/img/users/${req.params.id}`);
        if (req.file) {
            await fs.mkdir(actualDir, { recursive: true });
            const extension = path.extname(req.file.originalname);
            const targetPath = path.join(actualDir, `factura-${nfactura}${extension}`);

            await fs.rename(req.file.path, targetPath);

            const imagePath = `/img/users/${req.params.id}/factura-${nfactura}${extension}`;

            const result = await consultaDb.guardarFactura(imagePath, req.params.id, nfactura, factura);
            if (result) {
                res.json({ 'message': 'Factura guardada', 'success': true, 'factura': result });
            } else {
                res.status(400).json({ message: 'Error guardando factura' });
            }
        }
    } catch (err) {
        console.error('Error guardando factura:', err);
        res.status(500).json({ message: 'Error interno al guardar factura' });
    }
});

//pdf factura en sistema
router.post("/guardarFactura/sistema/:nfactura", upload.single('pdf'), async (req, res, next) => {
    const nFactura = req.params.nfactura;
    const formData = req.body;
    console.log('this is routes to usuariossincuenta');
    try {
        const actualDir = path.join(__dirname, `../../public/img/bills/${nFactura}`);
        if (req.file) {
            await fs.mkdir(actualDir, { recursive: true });
            const extension = path.extname(req.file.originalname);
            const targetPath = path.join(actualDir, `${nFactura}${extension}`);

            await fs.rename(req.file.path, targetPath);

            const imagePath = `/img/bills/${nFactura}/${nFactura}${extension}`;
            const result = await consultaDb.guardarFacturaUsuarioSinCuenta(imagePath, formData);
            if (result) {
                res.json({ 'message': 'Factura guardada', 'success': true, 'factura': result });
            } else {
                res.status(400).json({ message: 'Error guardando factura' });
            }
        }
    } catch (err) {
        console.error('Error guardando factura sistema:', err);
        res.status(500).json({ message: 'Error interno al guardar factura' });
    }
});

//guardar pdf remito
router.post("/guardarRemito", upload.single('pdf'), async (req, res, next) => {
    const nRemito = req.body.nRemito;
    const formData = req.body;
    console.log('this is guardar remito');
    try {
        const actualDir = path.join(__dirname, `../../public/img/bills/remitos/${nRemito}`);
        if (req.file) {
            await fs.mkdir(actualDir, { recursive: true });
            const extension = path.extname(req.file.originalname);
            const targetPath = path.join(actualDir, `${nRemito}${extension}`);

            await fs.rename(req.file.path, targetPath);

            const imagePath = `/img/bills/remitos/${nRemito}/${nRemito}${extension}`;
            const result = await consultaDb.guardarRemito(imagePath, nRemito);
            if (result) {
                res.json({ 'message': 'Remito guardado', 'success': true, 'remito': result });
            } else {
                res.status(400).json({ message: 'Error guardando factura' });
            }
        }
    } catch (err) {
        console.error('Error guardando remito:', err);
        res.status(500).json({ message: 'Error interno al guardar remito' });
    }
});


//venta web transferencia - ultima actualizacion
router.post('/registrarVenta', async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            console.log('No user found');
            return res.status(400).json({ message: 'No user found' });
        }
        console.log(`User: ${JSON.stringify(user)}`);
        const items = req.body.productos;
        let total = 0;
        const productosVerificados = [];

        for (const item of items) {
            const productRow = await consultaDb.getProductById(item.id);
            if (!productRow) {
                console.log(`Product not found: ${item.id}`);
                continue;
            }
            const producto = new Producto(productRow);
            const precio = producto.precioFinal;
            const subtotal = precio * item.cantidad;
            total += subtotal;

            productosVerificados.push({
                id: producto.id,
                nombre: producto.nombre,
                cantidad: item.cantidad,
                precio: precio,
                subtotal: subtotal
            });
        }
        const { n_fac } = await consultaDb.getNFactura();
        const facturaData = {
            n_fac: n_fac,
            id_cl: user.id,
            total_compra: total,
            fecha: new Date().toISOString(),
            met_pago: req.body.met_pago,
            productos: productosVerificados
        };
        const ticket = new Ticket(facturaData);
        const result = await consultaDb.registrarVenta(ticket);
        await resumenMail(ticket, user);
        if (result) {
            console.log('Venta registrada');
            res.status(200).json({
                success: true,
                message: 'Venta registrada',
                orderId: n_fac,
                ticket: ticket
            });
        } else {
            console.log('Error guardando venta');
            res.status(400).json({ message: 'Error guardando venta' });
        }
    } catch (err) {
        console.log('Error guardando venta');
        res.status(500).json({
            message: 'Error',
            success: false,
            error: err.message,
            stack: err.stack,
            details: JSON.stringify(err, Object.getOwnPropertyNames(err))
        });
        console.log(err);
    }
});


//cargar compra
router.post("/images", upload.array('product_image', 5), async (req, res, next) => {
    try {
        let productos = JSON.parse(req.body.productos);
        let factura = {
            fecha: req.body.fecha.toString(),
            empresa: req.body.empresa.toLowerCase(),
            tipo: req.body.tipo.toLowerCase(),
            nFactura: Number(req.body.nFactura),
            total: Number(req.body.total),
            productos: productos
        };
        console.log(factura);

        if (factura.tipo === "original") {
            const [newProducts] = await consultaDb.RegistrarCompra(factura);
            console.log('Este es el array de ids : ', newProducts);

            /*newProducts.forEach(async p => {
                if (req.files) {
                    console.log(req.files)
                    const targetDir = path.join(__dirname, `../../../assets/img/products/${getProductFolder(p.P_TIPO)}`);
                    const targetPath = path.join(targetDir, p.ID_PROD + '.png');
                    
                    await fs.rename(req.files.path, targetPath, (err) => {
                        if (err) {
                            console.error('File moving error:', err);
                            return res.status(500).json({ message: 'Error moving file' });
                        }
                    });
                    const baseDir = path.join(__dirname,'..', '..','..');
                    const image = path.relative(baseDir, targetPath);        
                    imagePath = path.join('..',image);
                    await userModel.insertarImgPath(imagePath, p.ID_PROD);
                }
            })
            if (req.files && req.files.length > 0) {
                // Iterate over the newProducts and req.files together
                newProducts.forEach(async (p, index) => {
                    const file = req.files[index];  // Get the corresponding uploaded file
                    const targetPath = path.join(targetDir, p.ID_PROD + '.png');
                    
                    // Move the file from temporary directory to the target directory
                    await fs.rename(file.path, targetPath, (err) => {
                        if (err) {
                            console.error('File moving error:', err);
                            return res.status(500).json({ message: 'Error moving file' });
                        }
                    });
                    const baseDir = path.join(__dirname,'..', '..','..');
                    const image = path.relative(baseDir, targetPath);        
                    imagePath = path.join('..',image);
                    await userModel.insertarImgPath(imagePath, p.ID_PROD);
                });
            }*/
        }
        res.json({ 'message': 'Producto registrado' });

    } catch (err) {
        console.log(err);
    }
});

router.post("/alta-productos", upload.single('image'), async (req, res, next) => {
    try {
        let producto = JSON.parse(req.body.producto);
        console.log('Petición de alta de nuevo producto: ', JSON.stringify(producto));

        if (req.file) {
            const timestamp = new Date().getTime();
            const targetDir = path.join(__dirname, `../../public/img/products/${producto.tipo.toLowerCase().trim()}`);
            const fileName = `${timestamp}.png`;
            const targetPath = path.join(targetDir, fileName);

            await fs.mkdir(targetDir, { recursive: true });

            await fs.rename(req.file.path, targetPath, (err) => {
                if (err) {
                    console.error('File moving error:', err);
                    return res.status(500).json({ message: 'Error moving file' });
                }
            });

            const baseDir = path.join(__dirname, '../../public');
            const image = path.relative(baseDir, targetPath).replace(/\\/g, '/');
            producto.image = '/' + image;
        } else {
            producto.image = null;
        }

        const [newProduct] = await consultaDb.AltaProductos(JSON.stringify(producto));
        console.log('Nuevo producto registrado: ' + producto.nombre + " ", JSON.stringify(newProduct));
        res.json({ 'message': 'Producto registrado con éxito', 'success': true });

    } catch (err) {
        console.error('Error en el servidor al registrar nuevo producto:', err);
        res.status(500).json({ 'message': 'Error al registrar el producto', 'success': false });
    }
});


//INFORMES
//obtener numero de factura
router.get('/nfactura', async (req, res) => {
    try {
        const objeto = await consultaDb.getNFactura();
        console.log('Número de nueva factura: ', objeto.n_factura + 1);
        console.log('Número de nueva factura: ', objeto.n_remito);
        res.json({
            message: 'El número de factura es: ' + objeto.n_factura + 1,
            number: objeto.n_factura + 1,
            n_remito: objeto.n_remito,
            success: true
        });
    } catch (err) {
        console.error('Error fetching número de factura', err);
        res.status(500).json({ message: 'Error fetching número de factura' });
    }
});

//monto mensual de ventas
router.get("/Informes/:month", async (req, res) => {
    let month = req.params.month;
    try {
        const [rows] = await consultaDb.GenerarInforme(month);
        res.json({ montoMensual: rows, success: true });
    } catch (err) {
        console.error("Error fetching records:", err);
        res.status(500).json({ message: "Error retrieving records" });
    }
});

//obtener facturas
router.get('/Ficha/facturacion', async (req, res) => {
    try {
        //por ahora son todas facturas c      
        const mes = req.query.mes;
        const [rows] = await consultaDb.getFichaFacturacion(mes);
        res.json({ facturacion: rows, success: true });
    } catch (err) {
        console.error("Error fetching records:", err);
        res.status(500).json({ message: "Error retrieving records" });
    }
});

//facturacion del periodo
router.get("/Periodo", async (req, res) => {
    try {
        const periodo = await consultaDb.MontoPeriodo();
        res.json({ total_facturado: periodo, success: true });
    } catch (err) {
        console.error("Error fetching records:", err);
        res.status(500).json({ message: "Error retrieving records" });
    }
});

//sugerencias
router.get("/Suggestions/empresa/:q", async (req, res) => {
    let query = req.params.q;
    console.log('Valor ingresado: ' + query);
    const [suggestions] = await consultaDb.getSuggestions('empresa', query);
    console.log('Autocompletado: empresas. Sugerencias: ' + suggestions.length);
    res.json({ suggestions });
})
router.get("/Suggestions/productName/:q", async (req, res) => {
    let query = req.params.q;
    const [suggestions] = await consultaDb.getSuggestions('nombre', query);
    console.log('Autocompletado: productos. Sugerencias: ' + suggestions.length);
    res.json({ suggestions });
})

//ficha de stock
router.get("/Ficha/:prod", async (req, res) => {
    try {
        let product = req.params.prod;
        const [ficha] = await consultaDb.DevolverFichaDeStock(product);
        res.json({ ficha });
    } catch (err) {
        console.error("Error fetching records:", err);
        res.status(500).json({ message: "Error retrieving records" });
    }
});

//graficos
router.get("/ventasDiarias", async (req, res) => {
    try {
        const [rows] = await consultaDb.getVentasDiarias();
        if (rows) console.log('Endpoint de Ventas. Rows -> ', rows)
        res.json(rows);
    } catch (err) {
        console.error("Error fetching records:", err);
        res.status(500).json({ message: "Error retrieving records" });
    }
});
router.get("/ventasDiarias/:prod", async (req, res) => {
    const tipo = req.params.prod;
    try {
        const [rows] = await consultaDb.getVentasAcumuladas(tipo);
        if (rows) console.log('Endpoint de Ventas por tipo. Rows -> ', rows)
        res.json(rows);
    } catch (err) {
        console.error("Error fetching records:", err);
        res.status(500).json({ message: "Error retrieving records" });
    }
});
router.get("/stockActual", async (req, res) => {
    try {
        const [rows] = await consultaDb.getStockActual();
        if (rows) console.log('Endpoint de Stock. Rows -> ', rows)
        res.json(rows);
    } catch (err) {
        console.error("Error fetching records:", err);
        res.status(500).json({ message: "Error retrieving records" });
    }
});

//ingresos - egresos
router.get("/ingresos-egresos", async (req, res) => {
    const producto = req.query.prod;
    try {
        const rows = await consultaDb.getVentasTotales(producto);
        if (rows) console.log('Endpoint de Ingresos-egresos. Rows -> ', rows)
        res.json(rows);
    } catch (err) {
        console.error("Error fetching records:", err);
        res.status(500).json({ message: "Error retrieving records" });
    }
});

//ganancias brutas
router.get("/ganancias-brutas", async (req, res) => {
    const mes = req.query.mes;
    try {
        const rows = await consultaDb.getGananciasBrutas(mes);
        if (rows) console.log('Endpoint de ganancias brutas. Rows -> ', rows)
        res.json(rows);
    } catch (err) {
        console.error("Error fetching records:", err);
        res.status(500).json({ message: "Error retrieving records" });
    }
});

//PRODUCTOS
//!Revisar llamada a las categorias
router.get("/productos/:categoria", async (req, res) => {
    try {
        let categoria = req.params.categoria;
        const [productos] = await consultaDb.ObtenerProductosPorCategoria(categoria);
        res.status(200).json({ productos });
    } catch (err) {
        console.error("Error fetching records:", err);
        res.status(500).json({ message: "Error retrieving records" });
    }
})

//Productos para el index
router.get("/indexProducts", async (req, res) => {
    try {
        const indexProducts = await consultaDb.productosIndex();
        console.log('Productos para index enviados correctamente.');
        res.json(indexProducts);
    } catch (err) {
        console.error("Error fetching records:", err);
        res.status(500).json({ message: "Error retrieving records" });
    }
});

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

//Obtener marcas
router.get("/marcas/:categoria", async (req, res) => {
    try {
        let categoria = req.params.categoria;
        categoria = categoria.replace('s', '');
        const [marcasTodas] = await consultaDb.ObtenerMarcas(categoria);
        const marcasFiltradas = marcasTodas.filter(brand => brand.marca != '""' && brand.marca != '');
        const marcas = marcasFiltradas.map(value => ({ marca: capitalizeFirstLetter(value.marca) }));
        res.json({ marcas });
    } catch (err) {
        console.error("Error fetching brands:", err);
        res.status(500).json({ message: "Error retrieving brands" });
    }
});

//Obtener productos por categoria
router.get("/products/:categoria", async (req, res) => {
    try {
        let categoria = req.params.categoria;
        const [products] = await consultaDb.ObtenerProductosPorCategoria(categoria);
        res.json({ products });
    } catch (err) {
        console.error("Error fetching records:", err);
        res.status(500).json({ message: "Error retrieving records" });
    }
})

//buscar productos por busqueda
router.get("/products/search/:query", async (req, res) => {
    res.set('Cache-Control', 's-maxage=60, stale-while-revalidate');
    const query = req.params.query;
    try {
        console.log('Valor a buscar: ', query);
        const [products] = await consultaDb.getProductsByQuery(query);
        res.json({ products });
    } catch (err) {
        console.error("Error fetching records:", err);
        res.status(500).json({ message: "Error retrieving records" });
    }
});

//buscar productos
router.get("/product/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const product = await consultaDb.getProductById(id);
        if (product) {
            res.json({ product, success: true });
        } else {
            res.status(404).json({ success: false, message: 'Producto no encontrado' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Error retrieving product' });
    }
});

//Eliminar producto
router.delete("/products/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const result = await consultaDb.deleteProduct(id);
        if (result.affectedRows > 0) {
            res.json({ success: true, message: 'Producto eliminado' });
        } else {
            res.status(404).json({ success: false, message: 'Producto no encontrado' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Error al eliminar producto' });
    }
});

router.put("/products/:id", upload.single('image'), async (req, res) => {
    try {
        const id = req.params.id;
        let producto = JSON.parse(req.body.producto);
        let imagePath = null;

        if (req.file) {
            const timestamp = new Date().getTime();
            const targetDir = path.join(__dirname, `../../public/img/products/${producto.tipo.toLowerCase().trim()}`);
            const fileName = `${timestamp}.png`;
            const targetPath = path.join(targetDir, fileName);

            await fs.mkdir(targetDir, { recursive: true });
            await fs.rename(req.file.path, targetPath);

            const baseDir = path.join(__dirname, '../../public');
            imagePath = '/' + path.relative(baseDir, targetPath).replace(/\\/g, '/');
        }

        const result = await consultaDb.updateProduct(id, producto, imagePath);
        if (result.affectedRows > 0) {
            const updatedProduct = { ...producto, id, image: imagePath || producto.image };
            console.log(`Producto (${producto.nombre}) actualizado:`, JSON.stringify(updatedProduct, null, 2));
            res.json({ success: true, message: 'Producto actualizado con éxito' });
        } else {
            console.error(`Error al actualizar producto (${producto.nombre}): No se encontró el producto con ID ${id}`);
            res.status(404).json({ success: false, message: 'No se pudo actualizar: Producto no encontrado' });
        }
    } catch (err) {
        console.error('Error en el servidor al actualizar producto:', err);
        res.status(500).json({ success: false, message: 'Error interno al actualizar el producto' });
    }
});


//USUARIO
//Login de usuario
/*router.post('/user', async (req, res) => {
    try {
        console.log(req.body);
        const { email, pass } = { ...req.body };
        console.log('Email', email);
        console.log('Pass', pass);
        const rows = await userModel.Login(email, pass);
        const currentTime = new Date().toLocaleTimeString();

        if (rows) {
            res.status(200).json({
                success: true,
                message: 'Login successful',
                user: rows
            });
            console.log('Usuario: ', rows.ID_US, '\n Hora:', currentTime);
        } else {
            res.status(400).json({
                success: false,
                message: 'Los datos son incorrectos'
            });
        }
    }
    catch (err) {
        console.error('Error al ingresar', err);
        res.status(500).json({
            success: false,
            message: 'Error al ingresar'
        });
    }
});*/

router.post('/registro', async (req, res) => {
    try {
        console.log("Tipo de dato:", typeof req.body);
        console.log("Contenido real:", req.body);
        const user = { ...req.body };
        console.log('Pedido de registro de nuevo usuario: ', user)
        const rows = await userModel.RegistrarUsuario(user);
        if (rows.affectedRows > 0) {
            console.log('Registro de nuevo usuario exitoso (201)');
            res.status(201).json({
                success: true,
                message: 'Registro de nuevo usuario exitoso',
                userId: rows.insertId
            });
        } else {
            console.log('Falló el registro de nuevo usuario (400)');
            res.status(400).json({
                success: false,
                message: 'Falló el registro de nuevo usuario'
            });
        }
    }
    catch (err) {
        console.error('Error al registrar nuevo usuario (500)', err);
        res.status(500).json({
            success: false,
            message: 'Error al registrar nuevo usuario'
        });
    }
});

//Actualizar usuario con foto
router.post("/update/profile", upload.single('FOTO'), async (req, res) => {
    const userId = Number(req.body.id);
    try {
        if (req.file) {
            // En CloudinaryStorage, req.file.path es la URL de la imagen en la nube
            const imagePath = req.file.path;

            console.log('La URL de la foto en Cloudinary es: ' + imagePath);
            const [result] = await userModel.updateUserData(userId, { 'FOTO': imagePath });

            if (result && result.affectedRows > 0) {
                if (req.user) {
                    req.user.FOTO = imagePath;
                }
                req.login(req.user, (err) => {
                    if (err) {
                        console.error("Error al re-loguear:", err);
                        return res.status(500).json({ success: false });
                    }

                    req.session.save(() => {
                        return res.json({
                            message: 'Perfil actualizado',
                            success: true,
                            foto: imagePath
                        });
                    });
                });
            } else {
                return res.status(400).json({
                    message: 'No se pudo actualizar la foto en la base de datos',
                    success: false
                });
            }
        } else {
            return res.status(400).json({ message: 'No se recibió ninguna imagen', success: false });
        }
    } catch (err) {
        console.error('Error al actualizar el perfil', err);
        res.status(500).json({ message: 'Error al actualizar el perfil', success: false });
    }
});

router.post("/contact", async (req, res) => {
    const { nombre, email, asunto, mensaje } = req.body;
    if (!nombre || !email || !asunto || !mensaje) {
        return res.status(400).json({ success: false, message: 'Todos los campos son obligatorios' });
    }

    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
        const mailOptions = {
            from: `"${nombre}" <${email}>`,
            to: process.env.EMAIL_USER,
            subject: `Nuevo mensaje de Contacto: ${asunto}`,
            text: `
                Has recibido un nuevo mensaje desde el formulario de contacto de Fan del Mate.
                
                Detalles:
                Nombre: ${nombre}
                Email: ${email}
                Asunto: ${asunto}
                
                Mensaje:
                ${mensaje}
            `,
            html: `
                <h3>Nuevo mensaje de Contacto</h3>
                <p><strong>Nombre:</strong> ${nombre}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Asunto:</strong> ${asunto}</p>
                <p><strong>Mensaje:</strong></p>
                <p>${mensaje}</p>
            `
        };


        await transporter.sendMail(mailOptions);

        console.log('Email sent successfully');
        res.json({ success: true, message: 'Mensaje enviado correctamente' });

    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ success: false, message: 'Error al enviar el email: ' + error.message });
    }
});

//resumen de compra (llamada en /registrarVenta)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});
async function resumenMail(ticket, user) {
    const { nombre, email } = user;
    if (!ticket) {
        console.error('Ticket data missing for email');
        return;
    }
    try {
        const subject = `El Fan del Mate - Resumen de compra #${ticket.orden}`;
        const detalleHtml = ticket.detalle.map(product => `
            <div style="align-items: center; margin-bottom: 10px;">
                <img src="${product.imagen}" alt="${product.nombre}" style="width: 50px; height: 50px; object-fit: cover; margin-right: 10px;">
                <span>
                    <strong>${product.nombre}</strong> x ${product.cantidad} = $${product.subtotal}
                </span>
            </div>
        `).join('');
        const html = `                        
            <p>Tu número de ticket es <strong>#${ticket.n_fac}</strong>.</p>
            <p>Detalle:</p>
            ${detalleHtml}
            <p><strong>Total a pagar:</strong> $${ticket.total}</p>
            <hr>
            <a href="https://tienda-mate.vercel.app/mis_compras">Ver resumen de compra</a>
            <p>Si elegiste abonar con transferencia, por favor envía el comprobante respondiendo a este correo o por WhatsApp al +54 3462 336880.</p>
        `;

        const mailOptionsClient = {
            from: `"Fan del Mate" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: subject,
            html: `<h3>Hola ${nombre}, gracias por tu compra</h3>${html}`
        };

        const mailOptionsAdmin = {
            from: `"Fan del Mate" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER,
            subject: `Nueva Venta - #${ticket.n_fac}`,
            html: `
                <h3>Nueva Venta</h3>
                <p><strong>Cliente:</strong> ${nombre}</p>
                <p><strong>Email:</strong> ${email}</p>                
                <p><strong>Ticket:</strong> #${ticket.n_fac}</p>
                <p>Detalle:</p>
                ${detalleHtml}
                <p><strong>Total a pagar:</strong> $${ticket.total}</p>
                <a href="https://tienda-mate.vercel.app/panel-informes">Ir a la tienda</a>
            `
        };

        await Promise.all([
            transporter.sendMail(mailOptionsClient),
            transporter.sendMail(mailOptionsAdmin)
        ]);

        console.log('\n Emails enviados a comprador y vendedor.\n');

    } catch (error) {
        console.error('Error sending email:', error);
    }
};

//Actualizar usuario sin foto
router.put("/update/:userNumber", async (req, res) => {
    try {
        const userId = Number(req.params.userNumber);
        const updateData = req.body;

        const [result] = await userModel.updateUserData(userId, updateData);

        if (result && result.affectedRows > 0) {
            if (req.user) {
                const key = Object.keys(updateData)[0];
                const value = updateData[key];
                req.user[key] = value;
            }
            req.login(req.user, (err) => {
                if (err) {
                    console.error("Error al re-loguear:", err);
                    return res.status(500).json({ success: false });
                }

                req.session.save(() => {
                    console.log(req.user)
                    return res.json({
                        message: 'Perfil actualizado',
                        success: true,
                        user: req.user
                    });
                });
            });
        } else {
            console.log('Datos no actualizados');
            res.status(400).json({
                success: false,
                message: 'Datos no actualizados'
            });
        }
    } catch (err) {
        console.error("Error updating user:", err);
        res.status(500).json({ success: false, message: "Error interno del servidor" });
    }
});

//llamar factura del cliente ( pdf )
router.get("/compras_usuario", async (req, res) => {
    let userId = req.user.id;
    try {
        const [rows] = await userModel.getComprasUsuario(userId);
        console.log(rows);
        res.json(rows);
    } catch (err) {
        console.error("Error fetching records:", err);
        res.status(500).json({ message: "Error retrieving records" });
    }
});

//llamar factura del cliente detalle
router.get('/compras_usuario/:id', async (req, res) => {
    try {
        const id_fac = req.params.id;
        const userId = req.user.id;

        const rows = await consultaDb.getTicketById(id_fac, userId);
        if (rows.length === 0) return res.status(404).send("Pedido no encontrado");
        const ticket = new Ticket(rows[0][0]);
        console.log('rows', rows[0])
        ticket.detalle = rows[0].map(p => ({
            nombre: p.nbre_hist,
            cantidad: p.cant_ticket,
            precio: p.pcio_un_pgdo,
            subtotal: p.subtotal,
            imagen: p.P_IMG
        }));
        console.log(' detalle', ticket.detalle)

        res.json(ticket);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
