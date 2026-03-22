import { useState, useCallback } from 'react';
import type { ProductFilters } from '../../types/product';

const COLOR_ROWS = [
  // Row 1 — standard
  [
    { name: 'White',   hex: '#f5f5f5' },
    { name: 'Black',   hex: '#0f0f0f' },
    { name: 'Grey',    hex: '#9a9a9a' },
    { name: 'Blue',    hex: '#3b6fd4' },
    { name: 'Red',     hex: '#c0392b' },
    { name: 'Green',   hex: '#3d7a44' },
  ],
  // Row 2 — actual clothing colors
  [
    { name: 'Olive',       hex: '#556B2F' },
    { name: 'Charcoal',    hex: '#4A4A4A' },
    { name: 'Khaki',       hex: '#C3A882' },
    { name: 'Sage',        hex: '#8FAE97' },
    { name: 'Steel Blue',  hex: '#607D8B' },
  ],
];

const SIZES = ['XS', 'S', 'M', 'L', 'XL'];

interface AccordionProps {
  label: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

const Accordion = ({ label, defaultOpen = false, children }: AccordionProps) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ borderBottom: '1px solid #e8e2d9' }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1rem 0',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontFamily: '"DM Sans", sans-serif',
          fontSize: '0.82rem',
          fontWeight: 600,
          letterSpacing: '0.06em',
          color: '#0f0f0f',
          textAlign: 'left',
          textTransform: 'uppercase',
        }}
        aria-expanded={open}
      >
        <span>{label}</span>
        <svg
          width="10"
          height="6"
          viewBox="0 0 10 6"
          fill="none"
          style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none', flexShrink: 0 }}
        >
          <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      </button>
      {open && <div style={{ paddingBottom: '1.25rem' }}>{children}</div>}
    </div>
  );
};

interface FilterSidebarProps {
  filters: ProductFilters;
  onChange: (f: ProductFilters) => void;
  totalInStock?: number;
  totalOutOfStock?: number;
  maxPrice?: number;
  isMobileDialog?: boolean;
  onClose?: () => void;
}

const FilterSidebar = ({
  filters,
  onChange,
  totalInStock = 39,
  totalOutOfStock = 1,
  maxPrice = 38000,
  isMobileDialog = false,
  onClose,
}: FilterSidebarProps) => {
  const [priceMin, setPriceMin] = useState(filters.minPrice ?? 0);
  const [priceMax, setPriceMax] = useState(filters.maxPrice ?? maxPrice);

  const update = useCallback(
    (patch: Partial<ProductFilters>) => onChange({ ...filters, ...patch }),
    [filters, onChange]
  );

  const applyPrice = () => {
    update({ minPrice: priceMin || undefined, maxPrice: priceMax < maxPrice ? priceMax : undefined });
  };

  const sidebarContent = (
    <div style={{ fontFamily: '"DM Sans", sans-serif' }}>
      {isMobileDialog && (
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e8e2d9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <h2 style={{ fontSize: '0.9rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', margin: 0 }}>Filters</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex' }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M1 1l14 14M15 1L1 15" stroke="#0f0f0f" strokeWidth="1.4" strokeLinecap="round" /></svg>
          </button>
        </div>
      )}

      <div style={{ padding: isMobileDialog ? '0 1.5rem' : '0' }}>
        {/* Availability */}
        <Accordion label="Availability" defaultOpen>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {[
              { label: `In stock (${totalInStock})`, value: 'in_stock' },
              { label: `Out of stock (${totalOutOfStock})`, value: 'out_of_stock' },
            ].map((opt) => (
              <label key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  style={{ width: '15px', height: '15px', accentColor: '#0f0f0f', cursor: 'pointer', flexShrink: 0 }}
                  onChange={() => {/* availability filter placeholder */}}
                />
                <span style={{ fontSize: '0.82rem', color: '#374151' }}>{opt.label}</span>
              </label>
            ))}
          </div>
        </Accordion>

        {/* Price */}
        <Accordion label="Price" defaultOpen>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p style={{ fontSize: '0.76rem', color: '#9a8f85', margin: 0 }}>
              Highest price is ${(maxPrice / 100).toFixed(2)}
            </p>
            {/* Dual range slider */}
            <div style={{ position: 'relative', height: '20px', display: 'flex', alignItems: 'center' }}>
              <div style={{ position: 'absolute', left: `${(priceMin / maxPrice) * 100}%`, right: `${100 - (priceMax / maxPrice) * 100}%`, height: '3px', background: '#0f0f0f', top: '50%', transform: 'translateY(-50%)' }} />
              <div style={{ position: 'absolute', width: '100%', height: '3px', background: '#e8e2d9', top: '50%', transform: 'translateY(-50%)', zIndex: 0 }} />
              <input
                type="range"
                min={0}
                max={maxPrice}
                value={priceMin}
                onChange={e => { const v = Math.min(Number(e.target.value), priceMax - 100); setPriceMin(v); }}
                onMouseUp={applyPrice}
                onTouchEnd={applyPrice}
                style={{ position: 'absolute', width: '100%', appearance: 'none', background: 'transparent', cursor: 'pointer', zIndex: 2, pointerEvents: 'all', height: '20px', margin: 0 }}
              />
              <input
                type="range"
                min={0}
                max={maxPrice}
                value={priceMax}
                onChange={e => { const v = Math.max(Number(e.target.value), priceMin + 100); setPriceMax(v); }}
                onMouseUp={applyPrice}
                onTouchEnd={applyPrice}
                style={{ position: 'absolute', width: '100%', appearance: 'none', background: 'transparent', cursor: 'pointer', zIndex: 3, pointerEvents: 'all', height: '20px', margin: 0 }}
              />
            </div>
            {/* Price inputs */}
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <div style={{ flex: 1, border: '1px solid #e8e2d9', display: 'flex', alignItems: 'center', padding: '0 0.5rem' }}>
                <span style={{ fontSize: '0.78rem', color: '#9a8f85' }}>$</span>
                <input
                  type="number"
                  min={0}
                  max={priceMax}
                  value={Math.round(priceMin / 100)}
                  onChange={e => setPriceMin(Number(e.target.value) * 100)}
                  onBlur={applyPrice}
                  style={{ flex: 1, border: 'none', outline: 'none', padding: '0.4rem 0.25rem', fontSize: '0.78rem', fontFamily: 'inherit', color: '#0f0f0f', width: '100%', background: 'transparent' }}
                />
              </div>
              <span style={{ fontSize: '0.78rem', color: '#9a8f85' }}>–</span>
              <div style={{ flex: 1, border: '1px solid #e8e2d9', display: 'flex', alignItems: 'center', padding: '0 0.5rem' }}>
                <span style={{ fontSize: '0.78rem', color: '#9a8f85' }}>$</span>
                <input
                  type="number"
                  min={priceMin}
                  max={maxPrice}
                  value={Math.round(priceMax / 100)}
                  onChange={e => setPriceMax(Number(e.target.value) * 100)}
                  onBlur={applyPrice}
                  style={{ flex: 1, border: 'none', outline: 'none', padding: '0.4rem 0.25rem', fontSize: '0.78rem', fontFamily: 'inherit', color: '#0f0f0f', width: '100%', background: 'transparent' }}
                />
              </div>
            </div>
          </div>
        </Accordion>

        {/* Color */}
        <Accordion label="Color" defaultOpen>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {COLOR_ROWS.map((row, rowIdx) => (
              <div key={rowIdx} style={{ display: 'flex', gap: '8px' }}>
                {row.map((c) => {
                  const isSelected = filters.color === c.name.toLowerCase();
                  return (
                    <button
                      key={c.name}
                      title={c.name}
                      onClick={() => update({ color: isSelected ? undefined : c.name.toLowerCase() })}
                      aria-label={c.name}
                      aria-pressed={isSelected}
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        border: isSelected ? '2px solid #0f0f0f' : '2px solid transparent',
                        boxShadow: isSelected ? '0 0 0 1px #0f0f0f' : '0 0 0 1px rgba(0,0,0,0.12)',
                        cursor: 'pointer',
                        background: c.hex,
                        padding: 0,
                        transition: 'transform 0.15s',
                        outline: 'none',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.12)')}
                      onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </Accordion>

        {/* Size */}
        <Accordion label="Size" defaultOpen>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {SIZES.map((size) => {
              const isSelected = filters.size === size;
              return (
                <button
                  key={size}
                  onClick={() => update({ size: isSelected ? undefined : size })}
                  style={{
                    border: `1px solid ${isSelected ? '#0f0f0f' : '#e8e2d9'}`,
                    background: isSelected ? '#0f0f0f' : 'transparent',
                    color: isSelected ? '#ffffff' : '#374151',
                    padding: '0.35rem 0.65rem',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    letterSpacing: '0.04em',
                    transition: 'all 0.15s',
                    minWidth: '40px',
                    textAlign: 'center',
                  }}
                  onMouseEnter={e => { if (!isSelected) { e.currentTarget.style.borderColor = '#9a8f85'; e.currentTarget.style.background = '#f8f5f1'; } }}
                  onMouseLeave={e => { if (!isSelected) { e.currentTarget.style.borderColor = '#e8e2d9'; e.currentTarget.style.background = 'transparent'; } }}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </Accordion>

        {/* Brand */}
        <Accordion label="Brand">
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}>
            <input type="checkbox" style={{ width: '15px', height: '15px', accentColor: '#0f0f0f', cursor: 'pointer' }} />
            <span style={{ fontSize: '0.82rem', color: '#374151' }}>Shopv1 ({totalInStock + totalOutOfStock})</span>
          </label>
        </Accordion>
      </div>

      {/* Mobile apply button */}
      {isMobileDialog && (
        <div style={{ padding: '1.25rem 1.5rem', borderTop: '1px solid #e8e2d9', marginTop: '1rem', display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => { onChange({}); onClose?.(); }}
            style={{ flex: 1, padding: '0.7rem', border: '1px solid #e8e2d9', background: 'none', cursor: 'pointer', fontSize: '0.78rem', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'inherit', fontWeight: 500, color: '#0f0f0f', transition: 'background 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#f8f5f1')}
            onMouseLeave={e => (e.currentTarget.style.background = 'none')}
          >
            Clear all
          </button>
          <button
            onClick={onClose}
            style={{ flex: 2, padding: '0.7rem', border: 'none', background: '#0f0f0f', cursor: 'pointer', fontSize: '0.78rem', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'inherit', fontWeight: 600, color: '#ffffff', transition: 'background 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#2a2a2a')}
            onMouseLeave={e => (e.currentTarget.style.background = '#0f0f0f')}
          >
            Apply
          </button>
        </div>
      )}
    </div>
  );

  if (isMobileDialog) {
    return (
      <>
        <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 500, animation: 'fadeIn 0.2s ease' }} />
        <div style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: '360px', maxWidth: '100vw', background: '#ffffff', zIndex: 501, overflowY: 'auto', animation: 'slideInLeft 0.28s ease', boxShadow: '4px 0 32px rgba(0,0,0,0.1)' }}>
          {sidebarContent}
        </div>
      </>
    );
  }

  return (
    <aside style={{ width: '260px', flexShrink: 0, position: 'sticky', top: '80px', maxHeight: 'calc(100vh - 100px)', overflowY: 'auto', paddingRight: '1.5rem', fontFamily: '"DM Sans", sans-serif' }}>
      {sidebarContent}
    </aside>
  );
};

export default FilterSidebar;
