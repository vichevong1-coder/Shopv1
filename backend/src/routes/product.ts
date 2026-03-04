import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { adminMiddleware } from '../middleware/admin';
import {
  listProducts,
  getFeaturedProducts,
  getProduct,
  createProduct,
  updateProduct,
  softDeleteProduct,
  restoreProduct,
  adminListProducts,
} from '../controllers/product';

const router = Router();

// ─── Public ───────────────────────────────────────────────────────────────────
router.get('/', listProducts);
router.get('/featured', getFeaturedProducts);
router.get('/:id', getProduct);

// ─── Admin ────────────────────────────────────────────────────────────────────
router.post('/', authMiddleware, adminMiddleware, createProduct);
router.put('/:id', authMiddleware, adminMiddleware, updateProduct);
router.patch('/:id/soft-delete', authMiddleware, adminMiddleware, softDeleteProduct);
router.patch('/:id/restore', authMiddleware, adminMiddleware, restoreProduct);

export default router;
