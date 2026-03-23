import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { adminMiddleware } from '../middleware/admin';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  getOrders,
  updateOrderStatus,
} from '../controllers/order';

const router = Router();

// CRITICAL: /my-orders must come before /:id to prevent Express treating
// "my-orders" as an ObjectId param
router.post('/', authMiddleware, createOrder);
router.get('/my-orders', authMiddleware, getMyOrders);
router.get('/:id', authMiddleware, getOrderById);
router.get('/', authMiddleware, adminMiddleware, getOrders);
router.put('/:id/status', authMiddleware, adminMiddleware, updateOrderStatus);

export default router;
