import type { ProductVariant } from '../../types/product';

interface Props {
  variants: ProductVariant[];
  selectedColor: string;
  onSelect: (color: string) => void;
}

const ColorSwatch = ({ variants, selectedColor, onSelect }: Props) => {
  const colors = [...new Map(variants.map((v) => [v.color, v.colorHex])).entries()];

  if (colors.length === 0) return null;

  return (
    <div>
      <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
        Color
        {selectedColor && <span style={{ fontWeight: 400, color: '#6b7280', marginLeft: '0.5rem' }}>{selectedColor}</span>}
      </p>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {colors.map(([color, hex]) => {
          const active = selectedColor === color;
          return (
            <button
              key={color}
              title={color}
              onClick={() => onSelect(color)}
              style={{
                width: '2rem',
                height: '2rem',
                borderRadius: '50%',
                background: hex || '#ccc',
                border: active ? '3px solid #111827' : '2px solid #e5e7eb',
                cursor: 'pointer',
                outline: active ? '2px solid #fff' : 'none',
                outlineOffset: '-4px',
                boxShadow: active ? '0 0 0 2px #111827' : 'none',
                transition: 'box-shadow 0.15s',
              }}
              aria-label={color}
              aria-pressed={active}
            />
          );
        })}
      </div>
    </div>
  );
};

export default ColorSwatch;
