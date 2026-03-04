import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { adminMiddleware } from '../middleware/admin';
import { getUploadSignature } from '../controllers/upload';

const router = Router();

router.post('/signature', authMiddleware, adminMiddleware, getUploadSignature);

export default router;
