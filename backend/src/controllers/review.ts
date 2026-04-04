import { Request, Response, NextFunction } from 'express';
import sanitizeHtml from 'sanitize-html';
import Review from '../models/Review';
import Product from '../models/Product';
import Order from '../models/Order';
import User from '../models/User';

const strip = (input: string) =>
  sanitizeHtml(input, { allowedTags: [], allowedAttributes: {} }).trim();

/** GET /api/products/:id/reviews?page=1&limit=10 */
export const getReviews = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id: productId } = req.params;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, parseInt(req.query.limit as string) || 10);
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      Review.find({ product: productId })
        .populate('user', 'name avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Review.countDocuments({ product: productId }),
    ]);

    res.json({
      reviews,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

/** POST /api/products/:id/reviews */
export const createReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id: productId } = req.params;
    const userId = req.user!.userId;

    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // Reject duplicate before touching anything else
    const existing = await Review.findOne({ product: productId, user: userId });
    if (existing) return res.status(409).json({ message: 'You have already reviewed this product' });

    // Validate inputs
    const { rating, title, comment } = req.body as {
      rating: number;
      title: string;
      comment: string;
    };

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const cleanTitle = strip(title ?? '');
    const cleanComment = strip(comment ?? '');

    if (!cleanTitle) return res.status(400).json({ message: 'Title is required' });
    if (cleanComment.length < 10) {
      return res.status(400).json({ message: 'Comment must be at least 10 characters' });
    }

    // Verified purchase: user must have a paid order containing this product
    const verifiedOrder = await Order.exists({
      user: userId,
      'items.product': productId,
      paymentProcessed: true,
    });

    const review = await Review.create({
      product: productId,
      user: userId,
      rating: Math.round(rating),
      title: cleanTitle,
      comment: cleanComment,
      isVerifiedPurchase: !!verifiedOrder,
    });

    // Return the review populated with user info
    const populated = await Review.findById(review._id)
      .populate('user', 'name avatar')
      .lean();

    res.status(201).json({ review: populated });
  } catch (err) {
    next(err);
  }
};

/** DELETE /api/products/:id/reviews/:reviewId */
export const deleteReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user!.userId;

    const review = await Review.findById(reviewId);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    const dbUser = await User.findById(userId).select('role').lean();
    if (dbUser?.role !== 'admin' && review.user.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await review.deleteOne();

    res.json({ message: 'Review deleted' });
  } catch (err) {
    next(err);
  }
};
