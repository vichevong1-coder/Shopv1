import { useCallback, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { fetchProduct, clearCurrentProduct } from '../redux/slices/productSlice';
import { addItemThunk, addItemLocal } from '../redux/slices/cartSlice';
import { useCurrency } from '../utils/money';
import { useUI } from '../context/UIContext';
import ProductImageGallery from '../components/product/ProductImageGallery';
import SizeSelector from '../components/product/SizeSelector';
import ColorSwatch from '../components/product/ColorSwatch';
import StarRating from '../components/product/StarRating';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import { ProductDetailSkeleton } from '../components/common/Skeleton';
import { getReviews, createReview, deleteReview } from '../api/review';
import type { Review, ReviewPagination } from '../types/review';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { currentProduct: product, isLoading, error } = useAppSelector((s) => s.products);
  const { user } = useAppSelector((s) => s.auth);
  const cartLoading = useAppSelector((s) => s.cart.isLoading);
  const { openCart, showToast } = useUI();
  const { formatPrice } = useCurrency();

  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [sizeError, setSizeError] = useState(false);
  const [colorError, setColorError] = useState(false);

  // Reviews state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewPagination, setReviewPagination] = useState<ReviewPagination | null>(null);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewPage, setReviewPage] = useState(1);

  // Review form state
  const [formOpen, setFormOpen] = useState(false);
  const [formRating, setFormRating] = useState(0);
  const [formTitle, setFormTitle] = useState('');
  const [formComment, setFormComment] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (id) dispatch(fetchProduct(id));
    return () => { dispatch(clearCurrentProduct()); };
  }, [id, dispatch]);

  const loadReviews = useCallback(async (page: number) => {
    if (!id) return;
    setReviewsLoading(true);
    try {
      const data = await getReviews(id, page);
      setReviews(data.reviews);
      setReviewPagination(data.pagination);
    } catch {
      // non-critical — reviews section just stays empty
    } finally {
      setReviewsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadReviews(reviewPage);
  }, [loadReviews, reviewPage]);

  // Reset selections when product changes
  useEffect(() => {
    setSelectedSize('');
    setSelectedColor('');
    setSizeError(false);
    setColorError(false);
  }, [product?._id]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    if (formRating === 0) { setFormError('Please select a rating'); return; }
    if (formComment.trim().length < 10) { setFormError('Comment must be at least 10 characters'); return; }
    setFormError('');
    setIsSubmitting(true);
    try {
      const review = await createReview(id, { rating: formRating, title: formTitle, comment: formComment });
      setReviews((prev) => [review, ...prev]);
      setReviewPagination((prev) => prev ? { ...prev, total: prev.total + 1 } : prev);
      setFormOpen(false);
      setFormRating(0);
      setFormTitle('');
      setFormComment('');
      showToast('Review submitted!', 'success');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setFormError(msg ?? 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!id) return;
    try {
      await deleteReview(id, reviewId);
      setReviews((prev) => prev.filter((r) => r._id !== reviewId));
      setReviewPagination((prev) => prev ? { ...prev, total: prev.total - 1 } : prev);
      showToast('Review deleted', 'success');
    } catch {
      showToast('Failed to delete review', 'error');
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;

    const hasVariants = product.variants.length > 0;
    const needsSize = hasVariants && !selectedSize;
    const needsColor = hasVariants && !selectedColor;

    if (needsSize || needsColor) {
      setSizeError(needsSize);
      setColorError(needsColor);
      showToast('Please select a size and colour', 'error');
      return;
    }

    if (user) {
      const result = await dispatch(
        addItemThunk({ productId: product._id, size: selectedSize, color: selectedColor, quantity: 1 })
      );
      if (addItemThunk.fulfilled.match(result)) {
        openCart();
        showToast('Added to cart', 'success');
      } else {
        showToast((result.payload as string) ?? 'Failed to add to cart', 'error');
      }
    } else {
      dispatch(
        addItemLocal({
          _id: crypto.randomUUID(),
          productId: product._id,
          name: product.name,
          image: product.images[0]?.url ?? '',
          size: selectedSize,
          color: selectedColor,
          quantity: 1,
          priceInCents: product.priceInCents,
        })
      );
      openCart();
      showToast('Added to cart', 'success');
    }
  };

  if (isLoading) return <ProductDetailSkeleton />;

  if (error || !product) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '4rem 1rem', textAlign: 'center' }}>
        <p style={{ color: '#ef4444', marginBottom: '1rem' }}>{error ?? 'Product not found.'}</p>
        <Link to="/shop" style={{ color: '#111827', fontWeight: 600 }}>← Back to Shop</Link>
      </div>
    );
  }

  const availableStock = product.variants.reduce((sum, v) => sum + (v.stock - v.reservedStock), 0);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
      {/* Breadcrumb */}
      <nav style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '1.5rem' }}>
        <Link to="/" style={{ color: '#6b7280' }}>Home</Link>
        {' / '}
        <Link to="/shop" style={{ color: '#6b7280' }}>Shop</Link>
        {' / '}
        <span style={{ color: '#111827' }}>{product.name}</span>
      </nav>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '3rem',
          alignItems: 'start',
        }}
      >
        {/* Gallery */}
        <ProductImageGallery images={product.images} name={product.name} />

        {/* Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Badge label={product.category} />
              <Badge label={product.gender} background="#dbeafe" color="#1e40af" />
            </div>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0 0 0.25rem' }}>{product.brand}</p>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', margin: 0 }}>{product.name}</h1>
          </div>

          {/* Rating */}
          {product.ratings.count > 0 && (
            <StarRating average={product.ratings.average} count={product.ratings.count} />
          )}

          {/* Price */}
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'baseline' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827' }}>
              {formatPrice(product.priceInCents)}
            </span>
            {product.compareAtPriceInCents && product.compareAtPriceInCents > product.priceInCents && (
              <span style={{ fontSize: '1rem', color: '#9ca3af', textDecoration: 'line-through' }}>
                {formatPrice(product.compareAtPriceInCents)}
              </span>
            )}
          </div>

          {/* Description */}
          <p style={{ color: '#374151', lineHeight: 1.6, margin: 0 }}>{product.description}</p>

          {/* Color */}
          {product.variants.length > 0 && (
            <div>
              <ColorSwatch
                variants={product.variants}
                selectedColor={selectedColor}
                onSelect={(c) => { setSelectedColor(c); setColorError(false); }}
              />
              {colorError && (
                <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                  Please select a colour
                </p>
              )}
            </div>
          )}

          {/* Size */}
          {product.variants.length > 0 && (
            <div>
              <SizeSelector
                variants={product.variants}
                selectedSize={selectedSize}
                selectedColor={selectedColor}
                onSelect={(s) => { setSelectedSize(s); setSizeError(false); }}
              />
              {sizeError && (
                <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                  Please select a size
                </p>
              )}
            </div>
          )}

          {/* Stock info */}
          {availableStock <= 5 && availableStock > 0 && (
            <p style={{ color: '#f59e0b', fontSize: '0.875rem', margin: 0, fontWeight: 500 }}>
              Only {availableStock} left in stock!
            </p>
          )}
          {availableStock === 0 && (
            <p style={{ color: '#ef4444', fontSize: '0.875rem', margin: 0, fontWeight: 500 }}>
              Out of stock
            </p>
          )}

          <Button
            fullWidth
            disabled={availableStock === 0 || cartLoading}
            onClick={handleAddToCart}
            style={{ marginTop: '0.5rem' }}
          >
            {cartLoading ? 'Adding…' : availableStock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </Button>
        </div>
      </div>

      {/* ── Reviews Section ────────────────────────────────────────────── */}
      <div style={{ marginTop: '4rem', borderTop: '1px solid #e5e7eb', paddingTop: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', margin: '0 0 0.25rem' }}>
              Customer Reviews
            </h2>
            {product.ratings.count > 0 && (
              <StarRating average={product.ratings.average} count={product.ratings.count} />
            )}
          </div>
          {user && !formOpen && (
            <Button onClick={() => setFormOpen(true)}>Write a Review</Button>
          )}
        </div>

        {/* Rating distribution bar chart */}
        {product.ratings.count > 0 && product.ratings.distribution && (
          <div style={{ marginBottom: '2rem', maxWidth: '320px' }}>
            {([5, 4, 3, 2, 1] as const).map((star) => {
              const count = product.ratings.distribution[star] ?? 0;
              const pct = product.ratings.count > 0
                ? Math.round((count / product.ratings.count) * 100)
                : 0;
              return (
                <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                  <span style={{ fontSize: '0.75rem', color: '#6b7280', width: '40px', flexShrink: 0 }}>{star} star</span>
                  <div style={{ flex: 1, height: '8px', background: '#f3f4f6', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: '#f59e0b', borderRadius: '4px', transition: 'width 0.3s' }} />
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#6b7280', width: '28px', textAlign: 'right', flexShrink: 0 }}>{count}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Review form */}
        {user && formOpen && (
          <form onSubmit={handleSubmitReview} style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '1.5rem', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 1rem', color: '#111827' }}>Your Review</h3>

            {/* Star picker */}
            <div style={{ marginBottom: '1rem' }}>
              <p style={{ fontSize: '0.875rem', color: '#374151', margin: '0 0 0.375rem', fontWeight: 500 }}>Rating *</p>
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormRating(star)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: star <= formRating ? '#f59e0b' : '#d1d5db', padding: '0 0.1rem', lineHeight: 1 }}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div style={{ marginBottom: '0.75rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.375rem' }}>
                Title *
              </label>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Summarize your experience"
                maxLength={100}
                required
                style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.875rem', boxSizing: 'border-box', outline: 'none' }}
              />
            </div>

            {/* Comment */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.375rem' }}>
                Comment * <span style={{ fontWeight: 400, color: '#9ca3af' }}>(min 10 characters)</span>
              </label>
              <textarea
                value={formComment}
                onChange={(e) => setFormComment(e.target.value)}
                placeholder="Tell others what you think about this product..."
                rows={4}
                maxLength={1000}
                required
                style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.875rem', resize: 'vertical', boxSizing: 'border-box', outline: 'none' }}
              />
              <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: '0.25rem 0 0', textAlign: 'right' }}>
                {formComment.length}/1000
              </p>
            </div>

            {formError && (
              <p style={{ color: '#ef4444', fontSize: '0.875rem', margin: '0 0 0.75rem' }}>{formError}</p>
            )}

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting…' : 'Submit Review'}
              </Button>
              <Button
                type="button"
                onClick={() => { setFormOpen(false); setFormError(''); }}
                style={{ background: 'transparent', color: '#374151', border: '1px solid #d1d5db' }}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}

        {/* Review list */}
        {reviewsLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ height: '100px', background: '#f3f4f6', borderRadius: '8px', animation: 'pulse 1.5s ease-in-out infinite' }} />
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#6b7280' }}>
            <p style={{ fontSize: '2rem', margin: '0 0 0.5rem' }}>★</p>
            <p style={{ fontWeight: 600, color: '#374151', margin: '0 0 0.5rem' }}>No reviews yet</p>
            <p style={{ fontSize: '0.875rem', margin: 0 }}>
              {user ? 'Be the first to review this product!' : 'Log in to leave a review.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {reviews.map((review) => (
              <div key={review._id} style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.875rem', color: '#111827' }}>
                        {review.user.name}
                      </span>
                      {review.isVerifiedPurchase && (
                        <span style={{ fontSize: '0.7rem', background: '#dcfce7', color: '#166534', borderRadius: '9999px', padding: '0.125rem 0.5rem', fontWeight: 500 }}>
                          Verified Purchase
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                      <span style={{ color: '#f59e0b', fontSize: '0.875rem' }}>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                      <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                        {new Date(review.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                  {(user?.id === review.user._id || user?.role === 'admin') && (
                    <button
                      onClick={() => handleDeleteReview(review._id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                      title="Delete review"
                    >
                      Delete
                    </button>
                  )}
                </div>
                <p style={{ fontWeight: 600, fontSize: '0.875rem', color: '#111827', margin: '0.5rem 0 0.25rem' }}>{review.title}</p>
                <p style={{ fontSize: '0.875rem', color: '#374151', margin: 0, lineHeight: 1.6 }}>{review.comment}</p>
              </div>
            ))}

            {/* Pagination */}
            {reviewPagination && reviewPagination.pages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', paddingTop: '0.5rem' }}>
                {Array.from({ length: reviewPagination.pages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setReviewPage(p)}
                    style={{
                      width: '32px', height: '32px', border: '1px solid', borderRadius: '6px', cursor: 'pointer', fontSize: '0.875rem',
                      background: p === reviewPage ? '#111827' : 'transparent',
                      color: p === reviewPage ? '#fff' : '#374151',
                      borderColor: p === reviewPage ? '#111827' : '#d1d5db',
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
