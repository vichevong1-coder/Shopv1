import { useRef } from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '../../types/product';
import ProductCard from './ProductCard';
import { ProductCardSkeleton } from '../common/Skeleton';

interface ProductCarouselProps {
  title: string;
  viewAllHref: string;
  products: Product[];
  isLoading: boolean;
}

const ProductCarousel = ({ title, viewAllHref, products, isLoading }: ProductCarouselProps) => {
  const trackRef = useRef<HTMLDivElement>(null);

  const slide = (dir: 'left' | 'right') => {
    if (!trackRef.current) return;
    const w = trackRef.current.offsetWidth;
    trackRef.current.scrollBy({ left: dir === 'right' ? w : -w, behavior: 'smooth' });
  };

  return (
    <section style={{ padding: 'clamp(2rem, 4vw, 3rem) 0 clamp(4rem, 8vw, 6rem)', background: '#f8f5f1', overflow: 'hidden' }}>
      <style>{`
        .carousel-item {
          flex: 0 0 calc(20% - 0.8rem);
          min-width: 0;
          scroll-snap-align: start;
        }
        @media (max-width: 767px) {
          .carousel-item {
            flex: 0 0 calc(50% - 0.5rem);
          }
        }
      `}</style>

      {/* header */}
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '0 clamp(2.5rem, 5vw, 4rem)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5rem',
        }}
      >
        <h2
          style={{
            fontFamily: '"Cormorant Garamond", serif',
            fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
            fontWeight: 500,
            color: '#111827',
            margin: 0,
          }}
        >
          {title}
        </h2>
        <Link
          to={viewAllHref}
          style={{
            fontFamily: '"DM Sans", sans-serif',
            fontSize: '0.75rem',
            fontWeight: 500,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: '#9a8f85',
            textDecoration: 'none',
            borderBottom: '1px solid #e8e2d9',
            paddingBottom: '2px',
            transition: 'color 0.15s',
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = '#111827')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = '#9a8f85')}
        >
          View all
        </Link>
      </div>

      {/* carousel + flanking arrows */}
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '0 clamp(2.5rem, 5vw, 4rem)',
          position: 'relative',
        }}
      >
        {/* left arrow */}
        <ArrowBtn dir="left" onClick={() => slide('left')} />

        {/* track */}
        <div
          ref={trackRef}
          style={{
            display: 'flex',
            gap: '1rem',
            overflowX: 'hidden',
            scrollSnapType: 'x mandatory',
            scrollbarWidth: 'none',
          }}
        >
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="carousel-item">
                  <ProductCardSkeleton />
                </div>
              ))
            : products.map((p) => (
                <div key={p._id} className="carousel-item">
                  <ProductCard product={p} />
                </div>
              ))
          }
        </div>

        {/* right arrow */}
        <ArrowBtn dir="right" onClick={() => slide('right')} />
      </div>
    </section>
  );
};

const ArrowBtn = ({ dir, onClick }: { dir: 'left' | 'right'; onClick: () => void }) => (
  <button
    onClick={onClick}
    aria-label={dir === 'left' ? 'Previous' : 'Next'}
    style={{
      position: 'absolute',
      [dir]: 0,
      top: '50%',
      transform: 'translateY(-50%)',
      zIndex: 2,
      width: 36,
      height: 36,
      borderRadius: '50%',
      border: '1px solid #e8e2d9',
      background: '#ffffff',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '0.9rem',
      color: '#111827',
      transition: 'border-color 0.15s, background 0.15s, color 0.15s',
    }}
    onMouseEnter={(e) => {
      const b = e.currentTarget as HTMLButtonElement;
      b.style.background = '#111827'; b.style.borderColor = '#111827'; b.style.color = '#f8f5f1';
    }}
    onMouseLeave={(e) => {
      const b = e.currentTarget as HTMLButtonElement;
      b.style.background = '#ffffff'; b.style.borderColor = '#e8e2d9'; b.style.color = '#111827';
    }}
  >
    {dir === 'left' ? '←' : '→'}
  </button>
);

export default ProductCarousel;
