import { Router } from 'express';
import { authMiddleware as auth } from '../middleware/auth';
import {
  createPaymentIntent,
  createBakongQR,
  getBakongStatus,
  bakongWebhook,
} from '../controllers/payment';

const router = Router();

// Stripe — stripe/webhook is NOT here; it's registered directly in app.ts
// before express.json() using express.raw({ type: 'application/json' })
router.post('/stripe/create-payment-intent', auth, createPaymentIntent);

// Bakong KHQR
router.post('/bakong/create-qr', auth, createBakongQR);
router.get('/bakong/status/:bakongRef', auth, getBakongStatus);
router.post('/bakong/webhook', bakongWebhook);

export default router;
