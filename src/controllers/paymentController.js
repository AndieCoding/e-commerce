import { MercadoPagoConfig, Preference } from 'mercadopago';
import consultaDb from '../config/consultas.js';
import { Producto } from "../../public/js/models/producto.js";
import dotenv from 'dotenv';

dotenv.config();

const client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN
});

export const createPreference = async (req, res) => {
    try {
        const { items: clientItems, external_reference } = req.body;
        const user = req.user;

        if (!user) {
            return res.status(401).json({ message: 'Usuario no autenticado o datos de usuario faltantes.' });
        }

        const validatedItems = [];

        for (const item of clientItems) {
            const productRow = await consultaDb.getProductById(item.id);
            if (!productRow) {
                console.error(`Producto no encontrado ID: ${item.id}`);
                continue;
            }

            const producto = new Producto(productRow);

            validatedItems.push({
                title: `${producto.nombre}`,
                unit_price: Number(producto.precioFinal),
                quantity: Number(item.quantity),
                currency_id: 'ARS'
            });
        }

        if (validatedItems.length === 0) {
            return res.status(400).json({ message: 'No se encontraron productos válidos para procesar.' });
        }

        const preference = new Preference(client);

        const backUrls = {
            success: `https://tienda-mate.vercel.app/mis_compras`,
            failure: `https://tienda-mate.vercel.app/confirmar-compra`,
            pending: `https://tienda-mate.vercel.app/confirmar-compra`
        };

        const body = {
            items: validatedItems,
            payer: {
                email: user.email,
                name: user.nombre || user.name
            },
            back_urls: backUrls,
            auto_return: 'approved',
            external_reference: external_reference,
            statement_descriptor: 'FAN DEL MATE'
        };

        console.log('Preference Body:', JSON.stringify(body, null, 2));

        const response = await preference.create({ body });

        res.status(200).json({
            id: response.id,
            init_point: response.init_point,
            sandbox_init_point: response.sandbox_init_point
        });

    } catch (error) {
        console.error('Error creating Mercado Pago preference:', error);
        res.status(500).json({ message: 'Error al crear preferencia de pago', error: error.message });
    }
};

export const confirmTransferOrder = async (req, res) => {
    try {
        const orderData = req.body;

        if (!orderData.fecha) {
            orderData.fecha = new Date().toISOString().slice(0, 19).replace('T', ' ');
        }

        if (!orderData.empresa) {
            orderData.empresa = orderData.userEmail || 'Cliente Web';
        }

        const lastInvoice = await consultaDb.getNFactura();
        const nextInvoiceNumber = (lastInvoice.n_factura || 0) + 1;

        orderData.nFactura = nextInvoiceNumber;
        const result = await consultaDb.registrarVenta(orderData);

        if (result.success) {
            res.status(200).json({
                success: true,
                message: 'Orden registrada correctamente',
                orderId: nextInvoiceNumber
            });
        } else {
            res.status(400).json({ success: false, message: 'No se pudo registrar la venta en la base de datos' });
        }

    } catch (error) {
        console.error('Error creating transfer order:', error);
        res.status(500).json({ message: 'Error al registrar orden', error: error.message });
    }
};
