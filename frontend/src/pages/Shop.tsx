import { useEffect, useCallback, useState, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { fetchProducts } from '../redux/slices/productSlice';
import type { ProductFilters } from '../types/product';
import ProductCard from '../components/product/ProductCard';
import Pagination from '../components/common/Pagination';
import TrustBadgesBar from '../components/common/TrustBadgesBar';
import CollectionHero from '../components/shop/CollectionHero';
import ShopToolbar from '../components/shop/ShopToolbar';
import FilterSidebar from '../components/shop/FilterSidebar';

type GridCols = 2 | 3 | 4;

const paramsToFilters = (sp: URLSearchParams): ProductFilters => ({
  gender: sp.get('gender') ?? undefined,
  category: sp.get('category') ?? undefined,
  size: sp.get('size') ?? undefined,
  color: sp.get('color') ?? undefined,
  minPrice: sp.get('minPrice') ? Number(sp.get('minPrice')) : undefined,
  maxPrice: sp.get('maxPrice') ? Number(sp.get('maxPrice')) : undefined,
  sort: sp.get('sort') ?? undefined,
  search: sp.get('search') ?? undefined,
});

const filtersToParams = (f: ProductFilters, page: number): Record<string, string> => {
  const p: Record<string, string> = {};
  if (f.gender) p.gender = f.gender;
  if (f.category) p.category = f.category;
  if (f.size) p.size = f.size;
  if (f.color) p.color = f.color;
  if (f.minPrice) p.minPrice = String(f.minPrice);
  if (f.maxPrice) p.maxPrice = String(f.maxPrice);
  if (f.sort) p.sort = f.sort;
  if (f.search) p.search = f.search;
  if (page > 1) p.page = String(page);
  return p;
};

const hasActiveFilters = (f: ProductFilters) =>
  !!(f.gender || f.category || f.size || f.color || f.minPrice || f.maxPrice || f.search);


const SkeletonCard = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
    <div style={{ background: '#f0ece6', aspectRatio: '3/4', animation: 'pulse 1.6s ease-in-out infinite' }} />
    <div style={{ height: '10px', background: '#f0ece6', width: '45%', borderRadius: '2px', animation: 'pulse 1.6s ease-in-out infinite' }} />
    <div style={{ height: '14px', background: '#f0ece6', width: '80%', borderRadius: '2px', animation: 'pulse 1.6s ease-in-out infinite' }} />
    <div style={{ height: '14px', background: '#f0ece6', width: '35%', borderRadius: '2px', animation: 'pulse 1.6s ease-in-out infinite' }} />
  </div>
);

const Shop = () => {
  const dispatch = useAppDispatch();
  const { items, pagination, isLoading } = useAppSelector((s) => s.products);
  const { gender: genderParam, cat: catParam } = useParams<{ gender?: string; cat?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const [gridCols, setGridCols] = useState<GridCols>(() => window.innerWidth < 768 ? 2 : 4);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setGridCols(cols => cols > 2 ? 2 : cols as GridCols);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const page = Number(searchParams.get('page') ?? 1);
  const filters = paramsToFilters(searchParams);

  const effectiveFilters: ProductFilters = {
    ...filters,
    gender: filters.gender ?? genderParam,
    category: filters.category ?? catParam,
  };

  const limit = gridCols * 4;
  const shouldScrollRef = useRef(false);

  useEffect(() => {
    if (searchParams.toString()) shouldScrollRef.current = true;
    dispatch(fetchProducts({ ...effectiveFilters, page, limit }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, genderParam, catParam, gridCols]);

  // Scroll to products once loading completes
  useEffect(() => {
    if (!isLoading && shouldScrollRef.current) {
      shouldScrollRef.current = false;
      toolbarRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [isLoading]);

  const handleFiltersChange = useCallback(
    (newFilters: ProductFilters) => setSearchParams(filtersToParams(newFilters, 1)),
    [setSearchParams]
  );

  const handleSortChange = useCallback(
    (sort: string) =>
      setSearchParams(filtersToParams({ ...effectiveFilters, sort: sort || undefined }, 1)),
    [effectiveFilters, setSearchParams]
  );

  const handleClearFilters = useCallback(() => setSearchParams({}), [setSearchParams]);

  const handlePageChange = useCallback(
    (p: number) => {
      setSearchParams(filtersToParams(effectiveFilters, p));
      toolbarRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },
    [effectiveFilters, setSearchParams]
  );

  const heroTitle = effectiveFilters.category
    ? effectiveFilters.category.charAt(0).toUpperCase() + effectiveFilters.category.slice(1) + 's'
    : effectiveFilters.gender
    ? effectiveFilters.gender.charAt(0).toUpperCase() + effectiveFilters.gender.slice(1)
    : 'Products';

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Shop', href: '/shop' },
    { label: heroTitle },
  ];

  const gridCssColumns =
    gridCols === 2 ? 'repeat(2, 1fr)' : gridCols === 3 ? 'repeat(3, 1fr)' : 'repeat(4, 1fr)';

  return (
    <div style={{ fontFamily: '"DM Sans", sans-serif' }}>
      {/* Hero banner */}
      <CollectionHero
        title={heroTitle}
        breadcrumbs={breadcrumbs}
        activeCategory={effectiveFilters.category}
      />

      {/* Shop content */}
      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 1.5rem 3rem' }}>
        {/* Toolbar row */}
        <div ref={toolbarRef} />
        <ShopToolbar
          total={pagination.total}
          gridCols={gridCols}
          onGridChange={setGridCols}
          sort={effectiveFilters.sort ?? ''}
          onSortChange={handleSortChange}
          hasFilters={hasActiveFilters(effectiveFilters)}
          onClearFilters={handleClearFilters}
          onOpenMobileFilters={isMobile ? () => setMobileFiltersOpen(true) : undefined}
        />

        {/* Sidebar + grid layout */}
        <div style={{ display: 'flex', gap: '2rem', marginTop: '1.75rem', alignItems: 'flex-start' }}>
          {/* Desktop filter sidebar — hidden on mobile */}
          {!isMobile && (
            <FilterSidebar
              filters={effectiveFilters}
              onChange={handleFiltersChange}

            />
          )}

          {/* Products */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {isLoading ? (
              <div style={{ display: 'grid', gridTemplateColumns: gridCssColumns, gap: '1.5rem' }}>
                {Array.from({ length: limit }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : items.length === 0 ? (
              <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                <p style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '1.2rem', color: '#0f0f0f', marginBottom: '0.5rem' }}>No products found</p>
                <p style={{ fontSize: '0.82rem', color: '#9a8f85', marginBottom: '1.5rem' }}>Try adjusting your filters or search terms.</p>
                <button
                  onClick={handleClearFilters}
                  style={{ background: '#0f0f0f', color: '#ffffff', border: 'none', padding: '0.7rem 1.75rem', cursor: 'pointer', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'inherit', fontWeight: 500 }}
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: gridCssColumns, gap: '1.5rem' }}>
                {items.map((item) => (
                  <ProductCard key={item._id} product={item} />
                ))}
              </div>
            )}

            {!isLoading && pagination.pages > 1 && (
              <div style={{ marginTop: '3rem' }}>
                <Pagination page={pagination.page} pages={pagination.pages} onChange={handlePageChange} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Trust badges */}
      <TrustBadgesBar />

      {/* Mobile filter dialog */}
      {mobileFiltersOpen && (
        <FilterSidebar
          filters={effectiveFilters}
          onChange={handleFiltersChange}
          isMobileDialog
          onClose={() => setMobileFiltersOpen(false)}
        />
      )}
    </div>
  );
};

export default Shop;
