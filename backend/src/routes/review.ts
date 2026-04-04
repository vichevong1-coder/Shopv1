import { Router } from 'express';
import { authMiddleware as auth } from '../middleware/auth';
import { getReviews, createReview, deleteReview } from '../controllers/review';

const router = Router({ mergeParams: true }); // inherit :id from parent

router.get('/', getReviews);
router.post('/', auth, createReview);
router.delete('/:reviewId', auth, deleteReview);

export default router;
