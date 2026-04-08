import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { fetchFeaturedProducts, fetchNewArrivals, fetchBestSellers } from '../redux/slices/productSlice';
import HeroSlider from '../components/layout/HeroSlider';
import ProductCarousel from '../components/product/ProductCarousel';

interface Category {
  label: string;
  sub: string;
  href: string;
  bg: string;
}

const categories: Category[] = [
  { label: 'Men',         sub: 'View all',  href: '/shop/men',                bg: '#1e1e1e' },
  { label: 'Women',       sub: 'View all',  href: '/shop/women',              bg: '#2e1a2e' },
  { label: 'Kids',        sub: 'View all',  href: '/shop/kids',               bg: '#1a2e1e' },
  { label: 'Accessories', sub: 'View all',  href: '/shop/category/accessory', bg: '#2e2a1a' },
  { label: 'Sale',        sub: 'Up to 50%', href: '/shop?sale=true',          bg: '#2e1a1a' },
];

const Home = () => {
  const dispatch = useAppDispatch();
  const { featuredItems, newArrivals, bestSellers, isLoading } = useAppSelector((s) => s.products);

  useEffect(() => {
    dispatch(fetchFeaturedProducts());
    dispatch(fetchNewArrivals());
    dispatch(fetchBestSellers());
  }, [dispatch]);

  return (
    <>
      {/* ── Hero Slider ── */}
      <HeroSlider />

      {/* ── Marquee Strip ── */}
      <div style={{ background: '#ffffff', overflow: 'hidden', width: '100%', padding: '0.85rem 0', borderBottom: '1px solid #e8e2d9', borderTop: '1px solid #e8e2d9' }}>
        <style>{`
          @keyframes marquee {
            0%   { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .marquee-track {
            display: flex;
            width: max-content;
            animation: marquee 35s linear infinite;
          }
          .marquee-track:hover {
            animation-play-state: paused;
          }
          .cat-tile {
            background: #f8f5f1;
            border: 1px solid #e8e2d9;
            aspect-ratio: 3 / 2;
            border-radius: 4px;
            display: flex;
            flex-direction: column;
            justify-content: flex-end;
            padding: 1.25rem;
            cursor: pointer;
            transition: border-color 0.2s ease;
            overflow: hidden;
          }
          .cat-tile:hover {
            border-color: #111827;
          }
          .cat-arrow {
            display: inline-flex;
            align-items: center;
            gap: 0.4rem;
            margin-top: 0.6rem;
            font-family: "DM Sans", sans-serif;
            font-size: 0.7rem;
            font-weight: 500;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            color: #111827;
            opacity: 0;
            transform: translateX(-10px);
            transition: opacity 0.25s ease, transform 0.25s ease;
          }
          .cat-tile:hover .cat-arrow {
            opacity: 1;
            transform: translateX(0);
          }
          .category-grid {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 0.75rem;
          }
          @media (max-width: 767px) {
            .category-grid {
              grid-template-columns: repeat(2, 1fr);
            }
          }
        `}</style>
        <div className="marquee-track">
          {[...Array(24)].map((_, i) => (
            <span
              key={i}
              style={{
                fontFamily: '"DM Sans", sans-serif',
                fontSize: '0.75rem',
                fontWeight: 400,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: '#111827',
                whiteSpace: 'nowrap',
                padding: '0 1.5rem',
              }}
            >
              {['Minimalistic', 'Simple', 'Essential', 'Comfort'][i % 4]}
              <span style={{ marginLeft: '1.5rem', color: '#9a8f85' }}>•</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── Category Grid ── */}
      <section style={{ padding: 'clamp(3rem, 6vw, 5rem) 0', background: '#f8f5f1' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 clamp(2.5rem, 5vw, 4rem)' }}>
          <div style={{ marginBottom: '2rem' }}>
            <h2
              style={{
                fontFamily: '"Cormorant Garamond", serif',
                fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
                fontWeight: 500,
                color: '#111827',
                margin: 0,
              }}
            >
              Shop by Category
            </h2>
          </div>

          <div className="category-grid">
            {categories.map((cat) => (
              <Link
                key={cat.label}
                to={cat.href}
                style={{ textDecoration: 'none' }}
              >
                <div className="cat-tile">
                  <p
                    style={{
                      fontFamily: '"DM Sans", sans-serif',
                      fontSize: '0.65rem',
                      fontWeight: 400,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      color: '#9a8f85',
                      margin: '0 0 0.3rem',
                    }}
                  >
                    {cat.sub}
                  </p>
                  <h3
                    style={{
                      fontFamily: '"Cormorant Garamond", serif',
                      fontSize: 'clamp(1.3rem, 2.5vw, 1.8rem)',
                      fontWeight: 500,
                      color: '#111827',
                      margin: 0,
                      lineHeight: 1.1,
                    }}
                  >
                    {cat.label}
                  </h3>
                  <span className="cat-arrow">
                    Shop now &rarr;
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Products ── */}
      <ProductCarousel
        title="Featured"
        viewAllHref="/shop?isFeatured=true&sort=featured"
        products={featuredItems}
        isLoading={isLoading}
      />

      {/* ── New Arrivals ── */}
      <ProductCarousel
        title="New Arrivals"
        viewAllHref="/shop?sort=newest"
        products={newArrivals}
        isLoading={isLoading}
      />

      {/* ── Best Sellers ── */}
      <ProductCarousel
        title="Best Sellers"
        viewAllHref="/shop?sort=popular"
        products={bestSellers}
        isLoading={isLoading}
      />
    </>
  );
};

export default Home;
