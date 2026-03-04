import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { adminMiddleware } from '../middleware/admin';
import { adminListProducts } from '../controllers/product';

const router = Router();

// Products (with deleted)
router.get('/products', authMiddleware, adminMiddleware, adminListProducts);

export default router;
