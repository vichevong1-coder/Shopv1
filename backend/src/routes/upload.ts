import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { adminMiddleware } from '../middleware/admin';
import { getUploadSignature, uploadFile } from '../controllers/upload';

const router = Router();

router.post('/signature', authMiddleware, adminMiddleware, getUploadSignature);
router.put('/file/*filePath', uploadFile);

export default router;
