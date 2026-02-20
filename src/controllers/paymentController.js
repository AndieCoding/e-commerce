import { MercadoPagoConfig, Preference } from 'mercadopago';
import consultaDb from '../config/consultas.js';
import { Producto } from "../../public/js/models/producto.js";
import { Ticket } from "../../public/js/models/ticket.js";
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

const client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN
});

export const createPreference = async (req, res) => {
    try {
        const { items: clientItems } = req.body;
        const user = req.user;

        if (!user) {
            return res.status(401).json({ message: 'Usuario no autenticado o datos de usuario faltantes.' });
        }

        const validatedItems = [];
        const database_products = [];
        let total = 0;
        for (const item of clientItems) {
            const productRow = await consultaDb.getProductById(item.id);
            if (!productRow) {
                console.error(`Producto no encontrado ID: ${item.id}`);
                continue;
            }

            const producto = new Producto(productRow);
            const precio = producto.precioFinal;
            const subtotal = precio * item.cantidad;
            total += subtotal;
            validatedItems.push({
                title: `${producto.nombre}`,
                unit_price: Number(precio),
                quantity: Number(item.cantidad),
                currency_id: 'ARS'
            });
            database_products.push({
                id: producto.id,
                nombre: producto.nombre,
                cantidad: item.cantidad,
                precio: precio,
                subtotal: subtotal
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

        const { n_fac } = await consultaDb.getNFactura();
        const facturaData = {
            n_fac: n_fac,
            id_cl: user.id,
            total_compra: total,
            fecha: new Date().toISOString(),
            met_pago: 0,
            productos: database_products
        };
        console.log(facturaData);
        const ticket = new Ticket(facturaData);
        console.log(ticket);
        const result = await consultaDb.registrarVenta(ticket);
        if (!result.success) {
            return res.status(400).json({ message: 'No se pudo registrar la venta en la base de datos' });
        }

        const body = {
            items: validatedItems,
            payer: {
                email: user.email,
                name: user.nombre || user.name
            },
            back_urls: backUrls,
            auto_return: 'approved',
            external_reference: n_fac,
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
/*
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
*/
export const checkoutResult = async (req, res) => {
    try {
        if (req.type === 'payment') {
            const payment = new Payment(client);
            const data = await payment.get({ id: req.id });
            if (data.status === 'approved') {
                const n_factura_referencia = data.external_reference;
                console.log(`Pago aprobado para la factura: ${n_factura_referencia}`);
                const total_pagado = data.transaction_amount;
                const result = await consultaDb.actualizarEstadoVenta(n_factura_referencia, total_pagado);
            }
        }

        res.sendStatus(200);

    } catch (error) {
        console.error('Error en el Webhook:', error);
        res.sendStatus(500);
    }
};

export const validateMPSignature = (req, res, next) => {
    try {
        const xSignature = req.headers['x-signature'];
        const xRequestId = req.headers['x-request-id'];

        const dataId = req.query['data.id'] || (req.body.data && req.body.data.id);

        if (!xSignature || !xRequestId || !dataId) {
            console.warn('Webhook recibido sin headers de seguridad o ID');
            return res.status(400).send('Missing security headers');
        }

        const parts = xSignature.split(',');
        let ts, hash;
        parts.forEach(part => {
            const [key, value] = part.split('=');
            if (key.trim() === 'ts') ts = value;
            if (key.trim() === 'v1') hash = value;
        });

        const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;

        const hmac = crypto.createHmac('sha256', process.env.MP_WEBHOOK_SECRET);
        hmac.update(manifest);
        const generatedHash = hmac.digest('hex');

        if (generatedHash !== hash) {
            console.error('Firma inválida');
            return res.status(401).send('Invalid signature');
        }

        console.log('Firma validada');
        next();

    } catch (error) {
        console.error('Error en middleware de validación:', error);
        res.status(500).send('Internal validation error');
    }
};
