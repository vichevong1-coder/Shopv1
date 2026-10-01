import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { addItemThunk, addItemLocal } from '../../redux/slices/cartSlice';
import { useCurrency } from '../../utils/money';
import { useUI } from '../../context/UIContext';
import ProductImageGallery from './ProductImageGallery';
import SizeSelector from './SizeSelector';
import ColorSwatch from './ColorSwatch';
import StarRating from './StarRating';
import Badge from '../common/Badge';
import Button from '../common/Button';
import type { Product } from '../../types/product';
import { Link } from 'react-router-dom';

interface QuickViewModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

const QuickViewModal = ({ product, isOpen, onClose }: QuickViewModalProps) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);
  const cartLoading = useAppSelector((s) => s.cart.isLoading);
  const { openCart, showToast } = useUI();
  const { formatPrice } = useCurrency();

  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [sizeError, setSizeError] = useState(false);
  const [colorError, setColorError] = useState(false);

  const handleAddToCart = async () => {
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
        onClose();
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
      onClose();
    }
  };

  if (!isOpen) return null;

  const availableStock = product.variants.reduce((sum, v) => sum + (v.stock - v.reservedStock), 0);
  const hasDiscount = !!product.compareAtPriceInCents && product.compareAtPriceInCents > product.priceInCents;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#fff', borderRadius: '8px', width: '100%', maxWidth: '900px',
          maxHeight: '90vh', overflowY: 'auto', position: 'relative',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', padding: '2rem',
        }}
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', zIndex: 10 }}
        >
          &times;
        </button>

        <ProductImageGallery images={product.images} name={product.name} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Badge label={product.category} />
              <Badge label={product.gender} background="#dbeafe" color="#1e40af" />
            </div>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0 0 0.25rem' }}>{product.brand}</p>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', margin: 0 }}>{product.name}</h2>
          </div>

          {product.ratings.count > 0 && (
            <StarRating average={product.ratings.average} count={product.ratings.count} />
          )}

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'baseline' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 700, color: hasDiscount ? '#d42e2e' : '#111827' }}>
              {formatPrice(product.priceInCents)}
            </span>
            {hasDiscount && (
              <span style={{ fontSize: '1rem', color: '#9ca3af', textDecoration: 'line-through' }}>
                {formatPrice(product.compareAtPriceInCents!)}
              </span>
            )}
          </div>

          <p style={{ color: '#374151', lineHeight: 1.6, margin: 0, fontSize: '0.9rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {product.description}
          </p>
          
          <Link to={`/product/${product._id}`} onClick={onClose} style={{ fontSize: '0.85rem', color: '#6366f1' }}>
            View full details &rarr;
          </Link>

          {product.variants.length > 0 && (
            <div>
              <ColorSwatch
                variants={product.variants}
                selectedColor={selectedColor}
                onSelect={(c) => { setSelectedColor(c); setColorError(false); }}
              />
              {colorError && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>Please select a colour</p>}
            </div>
          )}

          {product.variants.length > 0 && (
            <div>
              <SizeSelector
                variants={product.variants}
                selectedSize={selectedSize}
                selectedColor={selectedColor}
                onSelect={(s) => { setSelectedSize(s); setSizeError(false); }}
              />
              {sizeError && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>Please select a size</p>}
            </div>
          )}

          <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
            {availableStock === 0 ? (
              <Button disabled style={{ width: '100%', background: '#f3f4f6', color: '#9ca3af' }}>Out of Stock</Button>
            ) : (
              <Button onClick={handleAddToCart} disabled={cartLoading} style={{ width: '100%' }}>
                {cartLoading ? 'Adding...' : 'Add to Cart'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickViewModal;
