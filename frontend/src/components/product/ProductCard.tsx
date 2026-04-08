import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '../../types/product';
import { useCurrency } from '../../utils/money';

interface Props {
  product: Product;
}

const StarRating = ({ average, count }: { average: number; count: number }) => {
  if (!count) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
      <div style={{ display: 'flex', gap: '1px' }}>
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = average >= star;
          const half = !filled && average >= star - 0.5;
          return (
            <svg key={star} width="11" height="11" viewBox="0 0 11 11" fill="none">
              <path
                d="M5.5 0.5l1.3 3.1h3.2l-2.6 1.9.9 3.2L5.5 6.8 2.7 8.7l.9-3.2L1 3.6h3.2z"
                fill={filled ? '#c4845e' : half ? 'url(#half)' : 'none'}
                stroke={filled || half ? '#c4845e' : '#d4c8bc'}
                strokeWidth="0.5"
              />
              {half && (
                <defs>
                  <linearGradient id="half" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="50%" stopColor="#c4845e" />
                    <stop offset="50%" stopColor="transparent" />
                  </linearGradient>
                </defs>
              )}
            </svg>
          );
        })}
      </div>
      <span style={{ fontSize: '0.68rem', color: '#9a8f85' }}>
        {average.toFixed(1)} ({count})
      </span>
    </div>
  );
};

const ProductCard = ({ product }: Props) => {
  const { formatPrice } = useCurrency();
  const [imgIndex, setImgIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  const images = product.images;
  const hasMultiple = images.length > 1;
  const currentImg = images[imgIndex]?.url;

  const hasDiscount =
    product.compareAtPriceInCents && product.compareAtPriceInCents > product.priceInCents;
  const discountPct = hasDiscount
    ? Math.round((1 - product.priceInCents / product.compareAtPriceInCents!) * 100)
    : 0;

  const uniqueColors = Array.from(
    new Map(product.variants.map(v => [v.color, v.colorHex])).entries()
  ).slice(0, 6);

  const preloadImages = useCallback(() => {
    images.forEach(img => {
      const el = new Image();
      el.src = img.url;
    });
  }, [images]);

  const prevImg = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setImgIndex(i => (i - 1 + images.length) % images.length);
    },
    [images.length]
  );

  const nextImg = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setImgIndex(i => (i + 1) % images.length);
    },
    [images.length]
  );

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', fontFamily: '"DM Sans", sans-serif', position: 'relative' }}
      onMouseEnter={() => { setHovered(true); preloadImages(); }}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image container */}
      <div
        style={{
          position: 'relative',
          background: '#f8f5f1',
          overflow: 'hidden',
          aspectRatio: '3/4',
          marginBottom: '0.85rem',
          cursor: 'pointer',
        }}
      >
        {/* Sale badge */}
        {hasDiscount && (
          <div
            style={{
              position: 'absolute',
              top: '10px',
              left: '10px',
              background: '#d42e2e',
              color: '#ffffff',
              fontSize: '0.65rem',
              fontWeight: 700,
              letterSpacing: '0.06em',
              padding: '3px 8px',
              zIndex: 2,
              textTransform: 'uppercase',
            }}
          >
            Save {discountPct}%
          </div>
        )}

        {/* Product image */}
        <Link to={`/product/${product._id}`} style={{ display: 'block', width: '100%', height: '100%' }}>
          {currentImg ? (
            <img
              src={currentImg}
              alt={product.name}
              loading="lazy"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                transition: 'transform 0.5s ease',
                transform: hovered ? 'scale(1.08)' : 'scale(1)',
              }}
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#c8c0b8',
                fontSize: '0.78rem',
                letterSpacing: '0.06em',
                flexDirection: 'column',
                gap: '0.5rem',
              }}
            >
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" style={{ opacity: 0.3 }}>
                <rect x="2" y="6" width="28" height="20" rx="2" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="11" cy="13" r="3" stroke="currentColor" strokeWidth="1.5" />
                <path d="M2 22l7-6 5 4 5-6 11 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              No image
            </div>
          )}
        </Link>

        {/* Image nav arrows */}
        {hasMultiple && hovered && (
          <>
            <button
              onClick={prevImg}
              style={{
                position: 'absolute',
                left: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(255,255,255,0.85)',
                border: 'none',
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 3,
                transition: 'background 0.2s',
              }}
              aria-label="Previous image"
              onMouseEnter={e => (e.currentTarget.style.background = '#ffffff')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.85)')}
            >
              <svg width="7" height="12" viewBox="0 0 7 12" fill="none">
                <path d="M6 1L1 6l5 5" stroke="#0f0f0f" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              onClick={nextImg}
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(255,255,255,0.85)',
                border: 'none',
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 3,
                transition: 'background 0.2s',
              }}
              aria-label="Next image"
              onMouseEnter={e => (e.currentTarget.style.background = '#ffffff')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.85)')}
            >
              <svg width="7" height="12" viewBox="0 0 7 12" fill="none">
                <path d="M1 1l5 5-5 5" stroke="#0f0f0f" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </>
        )}

        {/* Image dots */}
        {hasMultiple && (
          <div style={{ position: 'absolute', bottom: '8px', left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: '4px', zIndex: 2 }}>
            {images.map((_, i) => (
              <button
                key={i}
                onClick={e => { e.preventDefault(); e.stopPropagation(); setImgIndex(i); }}
                style={{ width: i === imgIndex ? '14px' : '5px', height: '5px', borderRadius: '3px', background: i === imgIndex ? '#ffffff' : 'rgba(255,255,255,0.5)', border: 'none', cursor: 'pointer', padding: 0, transition: 'width 0.2s, background 0.2s' }}
                aria-label={`Image ${i + 1}`}
              />
            ))}
          </div>
        )}

        {/* Quick view */}
        <Link
          to={`/product/${product._id}`}
          style={{
            position: 'absolute',
            bottom: '12px',
            left: '50%',
            transform: hovered ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(8px)',
            background: 'rgba(255,255,255,0.92)',
            border: 'none',
            padding: '0.45rem 1.25rem',
            fontSize: '0.7rem',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            fontWeight: 600,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            zIndex: 3,
            opacity: hovered ? 1 : 0,
            transition: 'opacity 0.25s ease, transform 0.25s ease',
            textDecoration: 'none',
            color: '#0f0f0f',
            fontFamily: '"DM Sans", sans-serif',
          }}
        >
          Quick View
        </Link>
      </div>

      {/* Info */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Vendor */}
        <p style={{ fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9a8f85', margin: '0 0 4px', fontWeight: 500 }}>
          {product.brand}
        </p>

        {/* Name */}
        <Link
          to={`/product/${product._id}`}
          style={{ textDecoration: 'none', color: '#0f0f0f', fontSize: '0.88rem', fontWeight: 500, lineHeight: 1.35, letterSpacing: '0.01em', marginBottom: '4px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
        >
          {product.name}
        </Link>

        {/* Rating */}
        {product.ratings.count > 0 && (
          <StarRating average={product.ratings.average} count={product.ratings.count} />
        )}

        {/* Price */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '6px' }}>
          <span style={{ fontSize: '0.92rem', fontWeight: 600, color: hasDiscount ? '#d42e2e' : '#0f0f0f' }}>
            {formatPrice(product.priceInCents)}
          </span>
          {hasDiscount && (
            <span style={{ fontSize: '0.8rem', color: '#9a8f85', textDecoration: 'line-through' }}>
              {formatPrice(product.compareAtPriceInCents!)}
            </span>
          )}
        </div>

        {/* Color swatches */}
        {uniqueColors.length > 0 && (
          <div style={{ display: 'flex', gap: '4px', marginTop: '8px', flexWrap: 'wrap' }}>
            {uniqueColors.map(([colorName, colorHex], i) => {
              const isSelected = selectedColor === colorName;
              return (
                <button
                  key={colorName}
                  title={colorName}
                  onClick={e => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedColor(colorName);
                    // map color index → image index (bounded by images array)
                    setImgIndex(Math.min(i, images.length - 1));
                  }}
                  style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    background: colorHex || '#e8e2d9',
                    border: '1.5px solid rgba(0,0,0,0.1)',
                    cursor: 'pointer',
                    padding: 0,
                    outline: 'none',
                    transition: 'transform 0.15s',
                    transform: isSelected ? 'scale(1.2)' : 'scale(1)',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.2)')}
                  onMouseLeave={e => { e.currentTarget.style.transform = isSelected ? 'scale(1.2)' : 'scale(1)'; }}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
