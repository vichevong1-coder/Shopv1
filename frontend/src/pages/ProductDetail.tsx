import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { fetchProduct, clearCurrentProduct } from '../redux/slices/productSlice';
import { addItemThunk, addItemLocal } from '../redux/slices/cartSlice';
import { formatPrice } from '../utils/money';
import { useUI } from '../context/UIContext';
import ProductImageGallery from '../components/product/ProductImageGallery';
import SizeSelector from '../components/product/SizeSelector';
import ColorSwatch from '../components/product/ColorSwatch';
import StarRating from '../components/product/StarRating';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Spinner from '../components/common/Spinner';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { currentProduct: product, isLoading, error } = useAppSelector((s) => s.products);
  const { user } = useAppSelector((s) => s.auth);
  const cartLoading = useAppSelector((s) => s.cart.isLoading);
  const { openCart, showToast } = useUI();

  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [sizeError, setSizeError] = useState(false);
  const [colorError, setColorError] = useState(false);

  useEffect(() => {
    if (id) dispatch(fetchProduct(id));
    return () => { dispatch(clearCurrentProduct()); };
  }, [id, dispatch]);

  // Reset selections when product changes
  useEffect(() => {
    setSelectedSize('');
    setSelectedColor('');
    setSizeError(false);
    setColorError(false);
  }, [product?._id]);

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

  if (isLoading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><Spinner /></div>;

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
    </div>
  );
};

export default ProductDetail;
