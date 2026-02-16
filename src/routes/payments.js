import express from 'express';
import { createPreference, confirmTransferOrder, checkoutResult, validateMPSignature } from '../controllers/paymentController.js';

const router = express.Router();

router.post('/mp/create_preference', createPreference);
router.post('/transfer/confirm', confirmTransferOrder);
router.post('/checkout/result', validateMPSignature, checkoutResult);

export default router;
