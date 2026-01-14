import express from 'express';
import fetch from 'node-fetch';

const router = express.Router();

// Configuración de Correo Argentino (Valores por defecto/prueba)
// IMPORTANTE: Mover a .env en producción
const CORREO_API_BASE = 'https://apitest.correoargentino.com.ar/micorreo/v1';
const ORIGIN_POSTAL_CODE = '2600'; // Venado Tuerto

// Helper para obtener Token
async function getAuthToken() {
    // Estas son las credenciales que el usuario debería configurar en su .env
    const user = process.env.CORREO_USER || 'TEST_USER';
    const pass = process.env.CORREO_PASS || 'TEST_PASS';

    const auth = Buffer.from(`${user}:${pass}`).toString('base64');

    try {
        const response = await fetch(`${CORREO_API_BASE}/token`, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`
            }
        });

        if (!response.ok) throw new Error('Failed to get auth token');

        const data = await response.json();
        return data.token;
    } catch (error) {
        console.error('Correo Argentino Auth Error:', error);
        return null;
    }
}

router.post('/calculate', async (req, res) => {
    const { destinationCP, weight, height, width, length } = req.body;

    // Si no hay credenciales, retornamos un mock para desarrollo
    if (!process.env.CORREO_USER) {
        console.log('Using Correo Argentino MOCK (No credentials found)');
        return res.json({
            price: 2450.50,
            service: 'Correo Argentino Clásico',
            deliveryTime: '3-5 días hábiles',
            isMock: true
        });
    }

    const token = await getAuthToken();
    if (!token) return res.status(500).json({ error: 'Auth failed with carrier' });

    try {
        const response = await fetch(`${CORREO_API_BASE}/rates`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                customerId: process.env.CORREO_CUSTOMER_ID,
                postalCodeOrigin: ORIGIN_POSTAL_CODE,
                postalCodeDestination: destinationCP,
                deliveredType: 'D', // Domicilio
                dimensions: {
                    weight: weight || 1000,
                    height: height || 10,
                    width: width || 10,
                    length: length || 10
                }
            })
        });

        const data = await response.json();

        if (data.rates && data.rates.length > 0) {
            // Tomamos el primer servicio disponible (usualmente el Clásico)
            const rate = data.rates[0];
            res.json({
                price: rate.price,
                service: rate.productName,
                deliveryTime: `${rate.deliveryTimeMin}-${rate.deliveryTimeMax} días`,
                success: true
            });
        } else {
            res.status(404).json({ error: 'No rates available for this destination' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Carrier communication failed' });
    }
});

export default router;
