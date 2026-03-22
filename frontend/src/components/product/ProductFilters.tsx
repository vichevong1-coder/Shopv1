import { useEffect, useRef, useState } from 'react';
import type { ProductFilters } from '../../types/product';

const GENDERS = ['men', 'women', 'kids', 'unisex'];
const CATEGORIES = ['hat', 'shirt', 'pant', 'shoe', 'accessory'];
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '6', '7', '8', '9', '10', '11', '12'];
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low → High' },
  { value: 'price_desc', label: 'Price: High → Low' },
  { value: 'rating', label: 'Top Rated' },
];

interface Props {
  filters: ProductFilters;
  onChange: (filters: ProductFilters) => void;
}

const chipStyle = (active: boolean): React.CSSProperties => ({
  padding: '0.25rem 0.75rem',
  borderRadius: '9999px',
  border: active ? '1.5px solid #111827' : '1px solid #e5e7eb',
  background: active ? '#111827' : '#fff',
  color: active ? '#fff' : '#374151',
  fontSize: '0.8rem',
  fontWeight: active ? 600 : 400,
  cursor: 'pointer',
  whiteSpace: 'nowrap' as const,
});

const inputStyle: React.CSSProperties = {
  padding: '0.3rem 0.5rem',
  border: '1px solid #e5e7eb',
  borderRadius: '0.375rem',
  fontSize: '0.8rem',
  color: '#374151',
  width: '5rem',
};

const ProductFilters = ({ filters, onChange }: Props) => {
  const [search, setSearch] = useState(filters.search ?? '');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync search from outside (e.g. URL param change)
  useEffect(() => {
    setSearch(filters.search ?? '');
  }, [filters.search]);

  const update = (patch: Partial<ProductFilters>) => onChange({ ...filters, ...patch });

  const handleSearchChange = (val: string) => {
    setSearch(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => update({ search: val || undefined }), 400);
  };

  const toggleSize = (size: string) => {
    const current = filters.size ? filters.size.split(',') : [];
    const next = current.includes(size) ? current.filter((s) => s !== size) : [...current, size];
    update({ size: next.length ? next.join(',') : undefined });
  };

  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: '0.5rem',
        padding: '0.75rem 1rem',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.75rem',
        alignItems: 'center',
        marginBottom: '1.5rem',
      }}
    >
      {/* Search */}
      <input
        type="text"
        placeholder="Search…"
        value={search}
        onChange={(e) => handleSearchChange(e.target.value)}
        style={{ ...inputStyle, width: '10rem' }}
      />

      <span style={{ width: '1px', height: '1.5rem', background: '#e5e7eb' }} />

      {/* Gender */}
      <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
        {GENDERS.map((g) => (
          <button
            key={g}
            style={chipStyle(filters.gender === g)}
            onClick={() => update({ gender: filters.gender === g ? undefined : g })}
          >
            {g}
          </button>
        ))}
      </div>

      <span style={{ width: '1px', height: '1.5rem', background: '#e5e7eb' }} />

      {/* Category */}
      <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
        {CATEGORIES.map((c) => (
          <button
            key={c}
            style={chipStyle(filters.category === c)}
            onClick={() => update({ category: filters.category === c ? undefined : c })}
          >
            {c}
          </button>
        ))}
      </div>

      <span style={{ width: '1px', height: '1.5rem', background: '#e5e7eb' }} />

      {/* Sizes (multi) */}
      <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
        {SIZES.map((s) => {
          const active = (filters.size ?? '').split(',').includes(s);
          return (
            <button key={s} style={chipStyle(active)} onClick={() => toggleSize(s)}>
              {s}
            </button>
          );
        })}
      </div>

      <span style={{ width: '1px', height: '1.5rem', background: '#e5e7eb' }} />

      {/* Price range */}
      <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center' }}>
        <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>$</span>
        <input
          type="number"
          placeholder="Min"
          value={filters.minPrice !== undefined ? filters.minPrice / 100 : ''}
          onChange={(e) => update({ minPrice: e.target.value ? Math.round(Number(e.target.value) * 100) : undefined })}
          style={inputStyle}
          min={0}
        />
        <span style={{ color: '#9ca3af' }}>–</span>
        <input
          type="number"
          placeholder="Max"
          value={filters.maxPrice !== undefined ? filters.maxPrice / 100 : ''}
          onChange={(e) => update({ maxPrice: e.target.value ? Math.round(Number(e.target.value) * 100) : undefined })}
          style={inputStyle}
          min={0}
        />
      </div>

      <span style={{ width: '1px', height: '1.5rem', background: '#e5e7eb' }} />

      {/* Sort */}
      <select
        value={filters.sort ?? 'newest'}
        onChange={(e) => update({ sort: e.target.value })}
        style={{ ...inputStyle, width: 'auto', cursor: 'pointer' }}
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>

      {/* Clear */}
      {Object.values(filters).some(Boolean) && (
        <button
          style={{ fontSize: '0.75rem', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}
          onClick={() => { setSearch(''); onChange({}); }}
        >
          Clear all
        </button>
      )}
    </div>
  );
};

export default ProductFilters;
