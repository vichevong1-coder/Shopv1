import { useEffect, useRef, useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUI } from '../../context/UIContext';
import { useAppSelector } from '../../redux/hooks';
import axiosInstance from '../../api/axiosInstance';
import type { Product } from '../../types/product';
import ProductCard from '../product/ProductCard';
import Spinner from './Spinner';

const CATEGORIES = [
  { label: 'Shop All', href: '/shop' },
  { label: 'Men', href: '/shop?gender=men' },
  { label: 'Women', href: '/shop?gender=women' },
  { label: 'Kids', href: '/shop?gender=kids' },
];

const SearchDialog = () => {
  const { searchOpen, closeSearch } = useUI();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const { featuredItems, items } = useAppSelector((s) => s.products);
  const trending = useMemo(() => {
    const pool = featuredItems.length >= 5 ? featuredItems : [...featuredItems, ...items];
    return Array.from(new Map(pool.map(p => [p._id, p.name])).values()).slice(0, 5);
  }, [featuredItems, items]);

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => inputRef.current?.focus(), 80);
    } else {
      setQuery('');
      setDebouncedQuery('');
      setResults([]);
    }
  }, [searchOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeSearch();
    };
    if (searchOpen) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [searchOpen, closeSearch]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 400);
    return () => clearTimeout(handler);
  }, [query]);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      return;
    }
    const fetchResults = async () => {
      setLoading(true);
      try {
        const { data } = await axiosInstance.get<{ products: Product[] }>('/products', {
          params: { search: debouncedQuery.trim(), limit: 4 },
        });
        setResults(data.products);
      } catch (err) {
        setResults([]);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [debouncedQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    closeSearch();
    navigate(`/shop?search=${encodeURIComponent(query.trim())}`);
    setQuery('');
  };

  if (!searchOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 600,
        background: 'rgba(255,255,255,0.97)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '5rem 2rem 3rem',
        animation: 'scaleIn 0.18s ease',
        fontFamily: '"DM Sans", sans-serif',
        overflowY: 'auto'
      }}
      role="dialog"
      aria-label="Search"
      aria-modal="true"
    >
      {/* Close */}
      <button
        onClick={closeSearch}
        style={{
          position: 'absolute',
          top: '1.5rem',
          right: '1.5rem',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '8px',
          color: '#0f0f0f',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'opacity 0.2s',
        }}
        aria-label="Close search"
        onMouseEnter={e => (e.currentTarget.style.opacity = '0.5')}
        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M1 1l18 18M19 1L1 19" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </button>

      {/* Search form */}
      <div style={{ width: '100%', maxWidth: '900px', animation: 'fadeUp 0.22s ease' }}>
        <form onSubmit={handleSubmit} style={{ maxWidth: '680px', margin: '0 auto' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              borderBottom: '2px solid #0f0f0f',
              paddingBottom: '0.75rem',
              gap: '1rem',
            }}
          >
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" style={{ flexShrink: 0, opacity: 0.4 }}>
              <circle cx="9.5" cy="9.5" r="7.5" stroke="#0f0f0f" strokeWidth="1.6" />
              <path d="M15 15l5 5" stroke="#0f0f0f" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search products…"
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                fontSize: '1.4rem',
                fontWeight: 400,
                color: '#0f0f0f',
                background: 'transparent',
                fontFamily: '"Cormorant Garamond", serif',
                letterSpacing: '0.02em',
              }}
            />
            {query && (
              <button
                type="button"
                onClick={() => { setQuery(''); inputRef.current?.focus(); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#9a8f85', display: 'flex', transition: 'opacity 0.2s' }}
                aria-label="Clear search"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
              </button>
            )}
            <button
              type="submit"
              style={{
                background: '#0f0f0f',
                color: '#ffffff',
                border: 'none',
                cursor: 'pointer',
                padding: '0.55rem 1.25rem',
                fontSize: '0.72rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                fontWeight: 500,
                fontFamily: 'inherit',
                flexShrink: 0,
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#2a2a2a')}
              onMouseLeave={e => (e.currentTarget.style.background = '#0f0f0f')}
            >
              Search
            </button>
          </div>
        </form>

        <div style={{ marginTop: '2.5rem' }}>
          {query.trim() ? (
            loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                <Spinner size="md" />
              </div>
            ) : results.length > 0 ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '1.5rem',
              }}>
                {results.map(product => (
                  <div key={product._id} onClick={closeSearch}>
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '0.9rem', marginTop: '2rem' }}>
                No products found for "{query}".
              </p>
            )
          ) : (
            <div style={{ maxWidth: '680px', margin: '0 auto' }}>
              {/* Trending */}
              <div>
                <p style={{ fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600, color: '#9a8f85', marginBottom: '1rem' }}>
                  Trending
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {trending.map((term) => (
                    <button
                      key={term}
                      onClick={() => {
                        closeSearch();
                        navigate(`/shop?search=${encodeURIComponent(term)}`);
                      }}
                      style={{
                        background: 'none',
                        border: '1px solid #e8e2d9',
                        padding: '0.45rem 1rem',
                        fontSize: '0.8rem',
                        color: '#0f0f0f',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        transition: 'background 0.15s, border-color 0.15s',
                        letterSpacing: '0.02em',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#f8f5f1'; e.currentTarget.style.borderColor = '#9a8f85'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.borderColor = '#e8e2d9'; }}
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>

              {/* Categories */}
              <div style={{ marginTop: '2.5rem' }}>
                <p style={{ fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600, color: '#9a8f85', marginBottom: '1rem' }}>
                  Browse Categories
                </p>
                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                  {CATEGORIES.map((cat) => (
                    <Link
                      key={cat.href}
                      to={cat.href}
                      onClick={closeSearch}
                      style={{
                        color: '#0f0f0f',
                        textDecoration: 'none',
                        fontSize: '0.9rem',
                        fontFamily: '"Cormorant Garamond", serif',
                        fontWeight: 500,
                        letterSpacing: '0.06em',
                        borderBottom: '1px solid transparent',
                        paddingBottom: '2px',
                        transition: 'border-color 0.2s',
                      }}
                      onMouseEnter={e => ((e.currentTarget as HTMLElement).style.borderColor = '#0f0f0f')}
                      onMouseLeave={e => ((e.currentTarget as HTMLElement).style.borderColor = 'transparent')}
                    >
                      {cat.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchDialog;
