import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { getCart, addItem, updateItem, removeItem, clearCart, mergeCart } from '../controllers/cart';

const router = Router();

router.use(authMiddleware);

router.get('/', getCart);
router.post('/add', addItem);
router.post('/merge', mergeCart);
router.put('/update', updateItem);
router.delete('/remove/:itemId', removeItem);
router.delete('/clear', clearCart);

export default router;
