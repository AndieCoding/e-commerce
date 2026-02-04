import { MercadoPagoConfig, Preference } from 'mercadopago';
import consultaDb from '../config/consultas.js';
import dotenv from 'dotenv';

dotenv.config();

const client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN || 'TEST-00000000-0000-0000-0000-000000000000'
});

export const createPreference = async (req, res) => {
    try {
        const { items, payer, external_reference } = req.body;

        const preference = new Preference(client);

        const protocol = req.protocol || 'http';
        const host = req.get('host') || 'localhost:3000';
        const backUrls = {
            success: `https://tienda-mate.vercel.app/`,
            failure: `https://tienda-mate.vercel.app/confirmar-compra`,
            pending: `https://tienda-mate.vercel.app/confirmar-compra`
        };

        console.log('Constructed Back URLs:', backUrls);

        const body = {
            items: items.map(item => ({
                title: item.title,
                unit_price: Number(item.unit_price),
                quantity: Number(item.quantity),
                currency_id: 'ARS'
            })),
            payer: {
                email: payer.email,
                name: payer.name
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
        console.error('Error details:', JSON.stringify(error, null, 2)); // Detailed error log
        res.status(500).json({ message: 'Error al crear preferencia de pago', error: error.message, details: error });
    }
};

export const confirmTransferOrder = async (req, res) => {
    try {
        const orderData = req.body;

        // Ensure "fecha" is set if not provided
        if (!orderData.fecha) {
            orderData.fecha = new Date().toISOString().slice(0, 19).replace('T', ' ');
        }

        // Ensure "empresa" matches expected format (e.g. 'Fan del Mate' or user email)
        if (!orderData.empresa) {
            orderData.empresa = orderData.userEmail || 'Cliente Web';
        }

        // We need to generate a "nFactura". 
        // Ideally, we should fetch the last one + 1 like in `getNFactura` or let the DB handle auto-increment if possible.
        // However, `registrarVenta` expects `nFactura`.
        // Let's use `getNFactura` from consultaDb first.

        // Note: getNFactura returns { n_factura: number, n_remito: number } and inserts a remito.
        // This logic might be tightly coupled to "duplicado" (sales) type.
        // Assuming we are registering a sale ("Factura B" or similar).

        // Retrieve next invoice number
        const lastInvoice = await consultaDb.getNFactura();
        const nextInvoiceNumber = (lastInvoice.n_factura || 0) + 1;

        orderData.nFactura = nextInvoiceNumber;

        // Call registrarVenta
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
