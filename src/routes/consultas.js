import express from "express";
import consultaDb from "../config/consultas.js";
import multer from 'multer';
import path from 'path';
import { Factura } from "../../public/js/models/factura.js";
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

const storage = multer.diskStorage({
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
});
const upload = multer({ storage: storage });

//guardar pdf de factura
router.post("/guardarFactura/:id", upload.single('pdf'), async (req, res, next) => {
    const nfactura = req.body.nFactura;
    const userId = req.params.id;
    const factura = req.body
    try {
        const actualDir = path.join(__dirname, `../../public/img/users/${req.params.id}`);
        if (req.file) {
            await fs.mkdir(actualDir, { recursive: true });
            const targetPath = path.join(actualDir, req.file.originalname);

            await fs.rename(req.file.path, targetPath, (err) => {
                if (err) {
                    console.error('File moving error:', err);
                    return res.status(500).json({ message: 'Error moving file' });
                }
            });
            const baseDir = path.join(__dirname, '../../public');
            const image = path.relative(baseDir, targetPath).replace(/\\/g, '/');

            const imagePath = '/img/users/' + req.params.id + '/' + req.file.originalname;

            const result = await consultaDb.guardarFactura(imagePath, req.params.id, nfactura, factura);
            if (result) {
                res.json({ 'message': 'Factura guardada', 'success': true, 'factura': result });
            } else {
                res.status(400).json({ message: 'Error guardando factura' });
            }
        }

    } catch (err) {
        console.log(err);
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
            const targetPath = path.join(actualDir, req.file.originalname);

            await fs.rename(req.file.path, targetPath, (err) => {
                if (err) {
                    console.error('File moving error:', err);
                    return res.status(500).json({ message: 'Error moving file' });
                }
            });
            const baseDir = path.join(__dirname, '../../public');
            const image = path.relative(baseDir, targetPath).replace(/\\/g, '/');

            const imagePath = '/img/bills/' + nFactura + '/' + req.file.originalname;
            const result = await consultaDb.guardarFacturaUsuarioSinCuenta(imagePath, formData);
            if (result) {
                res.json({ 'message': 'Factura guardada', 'success': true, 'factura': result });
            } else {
                res.status(400).json({ message: 'Error guardando factura' });
            }
        }

    } catch (err) {
        console.log(err);
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
            const targetPath = path.join(actualDir, req.file.originalname);

            await fs.rename(req.file.path, targetPath, (err) => {
                if (err) {
                    console.error('File moving error:', err);
                    return res.status(500).json({ message: 'Error moving file' });
                }
            });
            const baseDir = path.join(__dirname, '../../public');
            const image = path.relative(baseDir, targetPath).replace(/\\/g, '/');

            const imagePath = '/img/bills/remitos/' + nRemito + '/' + req.file.originalname;
            const result = await consultaDb.guardarRemito(imagePath, nRemito);
            if (result) {
                res.json({ 'message': 'Remito guardado', 'success': true, 'remito': result });
            } else {
                res.status(400).json({ message: 'Error guardando factura' });
            }
        }

    } catch (err) {
        console.log(err);
    }
});

//venta a través de la web
router.post('/registrarVenta', upload.none(), async (req, res) => {
    try {
        const factura = new Factura(req.body);
        console.log('This is registrar venta: ' + factura)
        const result = await consultaDb.registrarVenta(factura);
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ message: 'Error', success: false });
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
                    await consultaDb.insertarImgPath(imagePath, p.ID_PROD);
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
                    await consultaDb.insertarImgPath(imagePath, p.ID_PROD);
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
        console.log('Petición de alta de nuevo producto: ', producto);

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

            // Construct relative path for DB
            const baseDir = path.join(__dirname, '../../public');
            const image = path.relative(baseDir, targetPath).replace(/\\/g, '/');
            producto.image = '/' + image;
        } else {
            producto.image = null; // Or handle as error if image is required
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

        const indexProducts = await consultaDb.ObtenerTresProductos();
        console.log('Productos de index enviados.');
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

//Obtener productos por categoria o filtrados
router.get("/products/:product/:query?", async (req, res) => {
    try {
        let product = req.params.product;
        let query = req.params.query || "";
        if (query) {
            query = JSON.parse(query);
        }
        const [products] = await consultaDb.ObtenerProductosPorCategoria(product, query);
        res.json({ products });
    } catch (err) {
        console.error("Error fetching records:", err);
        res.status(500).json({ message: "Error retrieving records" });
    }
})

//buscar productos
router.get("/search/:query", async (req, res) => {
    try {
        const query = req.params.query;
        console.log('Valor ingresado: ' + query);
        console.log(query);
        const [products] = await consultaDb.getProductsByQuery(query);
        console.log('primera funcion de search: ' + products);
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

router.get("/search/:query", async (req, res) => {
    try {
        const query = req.params.query;

        const [products] = await consultaDb.getProductsByQuery(query);
        console.log('Valor ingresado: ' + query + '. Valores obtenidos: ' + products.length);
        res.json({ products });
    } catch (err) {
        console.error("Error fetching records:", err);
        res.status(500).json({ message: "Error retrieving records" });
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
router.post('/user', async (req, res) => {
    try {
        console.log(req.body);
        const { email, pass } = { ...req.body };
        console.log('Email', email);
        console.log('Pass', pass);
        const rows = await consultaDb.Login(email, pass);
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
});

router.post('/registro', async (req, res) => {
    try {
        console.log("Tipo de dato:", typeof req.body);
        console.log("Contenido real:", req.body);
        const user = { ...req.body };
        console.log('Pedido de registro de nuevo usuario: ', user)
        const rows = await consultaDb.RegistrarUsuario(user);
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
router.post("/update/profile/:userNumber", upload.single('FOTO'), async (req, res) => {

    console.log(req.file);
    const userId = Number(req.params.userNumber);
    try {
        if (req.file) {
            const targetDir = path.join(__dirname, `../../public/img/users/${userId}`);
            await fs.mkdir(targetDir, { recursive: true });
            const targetPath = path.join(targetDir, userId + '.jpg');

            await fs.rename(req.file.path, targetPath, (err) => {
                if (err) {
                    console.error('File moving error:', err);
                    return res.status(500).json({ message: 'Error moving file' });
                }
            });
            const baseDir = path.join(__dirname, '../../public');
            const image1 = path.relative(baseDir, targetPath).replace(/\\/g, '/'); // Replace backslashes with forward slashes
            imagePath = '/' + image1;

            console.log('La ruta de la foto es : ' + imagePath);
            await consultaDb.updateUserData(userId, { 'FOTO': imagePath });
            res.json({ 'message': 'Perfil actualizado', success: true, 'foto': imagePath });
        }
    } catch (err) {
        console.error('Error al actualizar el perfil', err);
        res.status(500).json({ message: 'Error al actualizar el perfil' });
    }
});

//Actualizar usuario sin foto
router.put("/update/:userNumber", upload.single('FOTO'), async (req, res) => {

    try {
        const userId = Number(req.params.userNumber);
        const updateData = req.body;

        const [result] = await consultaDb.updateUserData(userId, updateData);
        if (result.affectedRows > 0) {
            console.log('Datos actualizados');
            res.status(200).json({
                success: true,
                message: 'Datos actualizados',
                userData: result[0]
            });
        } else {
            console.log('Datos no actualizados');
            res.status(400).json({
                success: false,
                message: 'Datos no actualizados'
            });
        }
    } catch (err) {
        res.status(404).json({ success: false, message: "User not found" });
    }
});

//llamar factura del cliente ( pdf )
router.get("/compras_usuario/:userId", async (req, res) => {
    let userId = req.params.userId;
    console.log(userId);
    try {
        const [rows] = await consultaDb.getComprasUsuario(userId);
        console.log(rows);
        res.json(rows);
    } catch (err) {
        console.error("Error fetching records:", err);
        res.status(500).json({ message: "Error retrieving records" });
    }
});




export default router;
