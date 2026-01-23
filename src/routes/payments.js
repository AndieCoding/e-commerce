import express from 'express';
import { createPreference, confirmTransferOrder } from '../controllers/paymentController.js';

const router = express.Router();

router.post('/mp/create_preference', createPreference);
router.post('/transfer/confirm', confirmTransferOrder);

export default router;
