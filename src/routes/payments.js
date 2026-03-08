import express from 'express';
import { createPreference, checkoutResult, validateMPSignature } from '../controllers/paymentController.js';

const router = express.Router();

router.post('/mp/create_preference', createPreference);
//router.post('/transfer/confirm', confirmTransferOrder);
//router.post('/checkout/result', validateMPSignature, checkoutResult);
router.post('/checkout/result', checkoutResult);

export default router;
