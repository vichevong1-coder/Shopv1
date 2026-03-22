import type { ProductVariant } from '../../types/product';

interface Props {
  variants: ProductVariant[];
  selectedSize: string;
  selectedColor: string;
  onSelect: (size: string) => void;
}

const SizeSelector = ({ variants, selectedSize, selectedColor, onSelect }: Props) => {
  const sizes = [...new Set(variants.map((v) => v.size))];

  const isOutOfStock = (size: string) => {
    const matching = variants.filter((v) => v.size === size && (!selectedColor || v.color === selectedColor));
    return matching.every((v) => v.stock - v.reservedStock <= 0);
  };

  return (
    <div>
      <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
        Size
        {selectedSize && <span style={{ fontWeight: 400, color: '#6b7280', marginLeft: '0.5rem' }}>{selectedSize}</span>}
      </p>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {sizes.map((size) => {
          const oos = isOutOfStock(size);
          const active = selectedSize === size;
          return (
            <button
              key={size}
              onClick={() => !oos && onSelect(size)}
              disabled={oos}
              style={{
                padding: '0.375rem 0.875rem',
                border: active ? '2px solid #111827' : '1px solid #e5e7eb',
                borderRadius: '0.375rem',
                background: active ? '#111827' : '#fff',
                color: active ? '#fff' : oos ? '#d1d5db' : '#374151',
                fontWeight: active ? 600 : 400,
                fontSize: '0.875rem',
                cursor: oos ? 'not-allowed' : 'pointer',
                textDecoration: oos ? 'line-through' : 'none',
              }}
            >
              {size}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SizeSelector;
