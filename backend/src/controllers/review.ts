import { Request, Response, NextFunction } from 'express';
import sanitizeHtml from 'sanitize-html';
import prisma from '../config/prisma';

const strip = (input: string) =>
  sanitizeHtml(input, { allowedTags: [], allowedAttributes: {} }).trim();

const formatReview = (r: any) => ({
  _id: r.id,
  id: r.id,
  product: r.productId,
  user: {
    _id: r.user?.id || r.userId,
    id: r.user?.id || r.userId,
    name: r.user?.name || 'Customer',
  },
  rating: r.rating,
  title: r.title,
  comment: r.comment,
  isVerifiedPurchase: r.verifiedPurchase,
  verifiedPurchase: r.verifiedPurchase,
  createdAt: r.createdAt,
  updatedAt: r.updatedAt,
});

/** GET /api/products/:id/reviews?page=1&limit=10 */
export const getReviews = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const productId = req.params.id as string;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, parseInt(req.query.limit as string) || 10);
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { productId },
        include: {
          user: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.review.count({ where: { productId } }),
    ]);

    res.json({
      reviews: reviews.map(formatReview),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

/** POST /api/products/:id/reviews */
export const createReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const productId = req.params.id as string;
    const userId = req.user!.userId;

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const existing = await prisma.review.findFirst({
      where: { productId, userId },
    });
    if (existing) return res.status(409).json({ message: 'You have already reviewed this product' });

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

    // Check for verified purchase
    const verifiedOrder = await prisma.order.findFirst({
      where: {
        userId,
        paymentProcessed: true,
        items: { some: { productId } },
      },
    });

    const roundedRating = Math.round(rating);

    const review = await prisma.review.create({
      data: {
        productId,
        userId,
        rating: roundedRating,
        title: cleanTitle,
        comment: cleanComment,
        verifiedPurchase: !!verifiedOrder,
      },
      include: {
        user: { select: { id: true, name: true } },
      },
    });

    // Update product ratings distribution and average
    const allReviews = await prisma.review.findMany({
      where: { productId },
      select: { rating: true },
    });

    const totalCount = allReviews.length;
    const sum = allReviews.reduce((acc, r) => acc + r.rating, 0);
    const avg = totalCount > 0 ? Number((sum / totalCount).toFixed(2)) : 0;

    const dist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const r of allReviews) {
      if (dist[r.rating] !== undefined) dist[r.rating]++;
    }

    await prisma.product.update({
      where: { id: productId },
      data: {
        ratingAverage: avg,
        ratingCount: totalCount,
        ratingDist1: dist[1],
        ratingDist2: dist[2],
        ratingDist3: dist[3],
        ratingDist4: dist[4],
        ratingDist5: dist[5],
      },
    });

    res.status(201).json({ review: formatReview(review) });
  } catch (err) {
    next(err);
  }
};

/** DELETE /api/products/:id/reviews/:reviewId */
export const deleteReview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const reviewId = req.params.reviewId as string;
    const userId = req.user!.userId;

    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });
    if (!review) return res.status(404).json({ message: 'Review not found' });

    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (dbUser?.role !== 'admin' && review.userId !== userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await prisma.review.delete({
      where: { id: reviewId },
    });

    res.json({ message: 'Review deleted' });
  } catch (err) {
    next(err);
  }
};
