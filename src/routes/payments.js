import express from 'express';
import { createPreference, confirmTransferOrder } from '../controllers/paymentController.js';

const router = express.Router();

router.post('/mp/create_preference', createPreference);
router.post('/transfer/confirm', confirmTransferOrder);
router.post('/checkout/result', async (req, res) => {
    res.status(200).send('OK');
    console.log('Checkout result body:', req.body);
    console.log('Checkout result req:', req);
});

export default router;
