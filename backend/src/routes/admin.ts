import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { adminMiddleware } from '../middleware/admin';
import { adminListProducts } from '../controllers/product';
import { getStats, getUsers } from '../controllers/admin';

const router = Router();

// Products (with deleted)
router.get('/products', authMiddleware, adminMiddleware, adminListProducts);

// Stats
router.get('/stats', authMiddleware, adminMiddleware, getStats);

// Users
router.get('/users', authMiddleware, adminMiddleware, getUsers);

export default router;
