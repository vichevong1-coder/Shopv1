import mongoose, { Document, Schema } from 'mongoose';
import Product from './Product';

export interface IReview extends Document {
  product: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  rating: number;
  title: string;
  comment: string;
  isVerifiedPurchase: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, required: true, trim: true, maxlength: 100 },
    comment: { type: String, required: true, trim: true, minlength: 10, maxlength: 1000 },
    isVerifiedPurchase: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// One review per user per product
reviewSchema.index({ product: 1, user: 1 }, { unique: true });
reviewSchema.index({ product: 1, createdAt: -1 });

// ─── Rating aggregation ───────────────────────────────────────────────────────

const recalculateRatings = async (productId: mongoose.Types.ObjectId): Promise<void> => {
  const stats = await Review.aggregate([
    { $match: { product: productId } },
    {
      $group: {
        _id: '$product',
        average: { $avg: '$rating' },
        count: { $sum: 1 },
        dist1: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } },
        dist2: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
        dist3: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
        dist4: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
        dist5: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
      },
    },
  ]);

  if (stats.length === 0) {
    await Product.findByIdAndUpdate(productId, {
      $set: {
        'ratings.average': 0,
        'ratings.count': 0,
        'ratings.distribution': { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      },
    });
  } else {
    const s = stats[0];
    await Product.findByIdAndUpdate(productId, {
      $set: {
        'ratings.average': Math.round(s.average * 10) / 10,
        'ratings.count': s.count,
        'ratings.distribution': {
          1: s.dist1,
          2: s.dist2,
          3: s.dist3,
          4: s.dist4,
          5: s.dist5,
        },
      },
    });
  }
};

reviewSchema.post('save', async function () {
  await recalculateRatings(this.product);
});

// Fires after review.deleteOne() is called on a document instance
reviewSchema.post('deleteOne', { document: true, query: false }, async function () {
  await recalculateRatings(this.product);
});

const Review = mongoose.model<IReview>('Review', reviewSchema);

export default Review;
