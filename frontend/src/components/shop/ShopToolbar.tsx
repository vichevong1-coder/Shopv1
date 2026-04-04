type GridCols = 2 | 3 | 4;
type SortOption = { value: string; label: string };

const SORT_OPTIONS: SortOption[] = [
  { value: '', label: 'Featured' },
  { value: 'popular', label: 'Best Selling' },
  { value: 'name_asc', label: 'A–Z' },
  { value: 'name_desc', label: 'Z–A' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'oldest', label: 'Date: Old to New' },
  { value: 'newest', label: 'Date: New to Old' },
];

const GridIcon2 = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <rect x="1" y="1" width="7" height="16" rx="1" stroke="currentColor" strokeWidth="1.4" />
    <rect x="10" y="1" width="7" height="16" rx="1" stroke="currentColor" strokeWidth="1.4" />
  </svg>
);

const GridIcon3 = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <rect x="1" y="1" width="4" height="16" rx="0.5" stroke="currentColor" strokeWidth="1.4" />
    <rect x="7" y="1" width="4" height="16" rx="0.5" stroke="currentColor" strokeWidth="1.4" />
    <rect x="13" y="1" width="4" height="16" rx="0.5" stroke="currentColor" strokeWidth="1.4" />
  </svg>
);

const GridIcon4 = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <rect x="1"  y="1" width="2.5" height="16" rx="0.5" stroke="currentColor" strokeWidth="1.4" />
    <rect x="5.2" y="1" width="2.5" height="16" rx="0.5" stroke="currentColor" strokeWidth="1.4" />
    <rect x="9.4" y="1" width="2.5" height="16" rx="0.5" stroke="currentColor" strokeWidth="1.4" />
    <rect x="13.6" y="1" width="2.5" height="16" rx="0.5" stroke="currentColor" strokeWidth="1.4" />
  </svg>
);

interface ShopToolbarProps {
  total: number;
  gridCols: GridCols;
  onGridChange: (cols: GridCols) => void;
  sort: string;
  onSortChange: (sort: string) => void;
  hasFilters?: boolean;
  onClearFilters?: () => void;
  onOpenMobileFilters?: () => void;
}

const ShopToolbar = ({
  total,
  gridCols,
  onGridChange,
  sort,
  onSortChange,
  hasFilters,
  onClearFilters,
  onOpenMobileFilters,
}: ShopToolbarProps) => {
  const btnBase: React.CSSProperties = {
    background: 'none',
    border: '1px solid transparent',
    cursor: 'pointer',
    padding: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'color 0.2s, border-color 0.2s',
    borderRadius: '2px',
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.85rem 0',
        borderBottom: '1px solid #e8e2d9',
        fontFamily: '"DM Sans", sans-serif',
        gap: '1rem',
      }}
    >
      {/* Left: Grid toggles + mobile filter button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
        {/* Mobile filter trigger */}
        {onOpenMobileFilters && (
          <button
            onClick={onOpenMobileFilters}
            style={{
              ...btnBase,
              border: '1px solid #e8e2d9',
              padding: '6px 12px',
              gap: '6px',
              fontSize: '0.75rem',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#0f0f0f',
              fontFamily: 'inherit',
              fontWeight: 500,
              marginRight: '0.5rem',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#f8f5f1')}
            onMouseLeave={e => (e.currentTarget.style.background = 'none')}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 2h12M3 7h8M5 12h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            Filters and sort
          </button>
        )}

        {([2, 3, 4] as GridCols[]).map((cols) => {
          const isActive = gridCols === cols;
          const Icon = cols === 2 ? GridIcon2 : cols === 3 ? GridIcon3 : GridIcon4;
          return (
            <button
              key={cols}
              onClick={() => onGridChange(cols)}
              title={`${cols} column${cols > 1 ? 's' : ''}`}
              style={{
                ...btnBase,
                color: isActive ? '#0f0f0f' : '#9a8f85',
                borderColor: isActive ? '#e8e2d9' : 'transparent',
                background: isActive ? '#f8f5f1' : 'none',
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = '#0f0f0f'; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = '#9a8f85'; }}
            >
              <Icon />
            </button>
          );
        })}
      </div>

      {/* Right: Product count + sort + clear */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <span style={{ fontSize: '0.78rem', color: '#9a8f85', whiteSpace: 'nowrap' }}>
          {total} product{total !== 1 ? 's' : ''}
        </span>

        {hasFilters && onClearFilters && (
          <button
            onClick={onClearFilters}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.72rem',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#9a8f85',
              fontFamily: 'inherit',
              fontWeight: 500,
              padding: '4px 0',
              borderBottom: '1px solid #9a8f85',
              transition: 'color 0.2s, border-color 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#0f0f0f'; e.currentTarget.style.borderColor = '#0f0f0f'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#9a8f85'; e.currentTarget.style.borderColor = '#9a8f85'; }}
          >
            Clear all
          </button>
        )}

        <select
          value={sort}
          onChange={e => onSortChange(e.target.value)}
          style={{
            border: '1px solid #e8e2d9',
            background: '#ffffff',
            padding: '0.45rem 2rem 0.45rem 0.75rem',
            fontSize: '0.78rem',
            color: '#0f0f0f',
            cursor: 'pointer',
            fontFamily: 'inherit',
            outline: 'none',
            appearance: 'none',
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%239a8f85' stroke-width='1.2' stroke-linecap='round'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 0.6rem center',
            minWidth: '180px',
            transition: 'border-color 0.2s',
          }}
          onFocus={e => (e.currentTarget.style.borderColor = '#0f0f0f')}
          onBlur={e => (e.currentTarget.style.borderColor = '#e8e2d9')}
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default ShopToolbar;
