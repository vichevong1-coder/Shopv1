import type { Product } from '../../types/product';
import { formatPrice } from '../../utils/money';
import Button from '../common/Button';

interface Props {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onRestore: (product: Product) => void;
}

const pill = (label: string, bg: string, color = '#fff'): React.CSSProperties => ({
  display: 'inline-block',
  padding: '0.125rem 0.5rem',
  borderRadius: '9999px',
  fontSize: '0.75rem',
  fontWeight: 600,
  background: bg,
  color,
  whiteSpace: 'nowrap',
});

const stockBadge = (total: number) => {
  if (total === 0)
    return <span style={pill('Out of Stock', '#fee2e2', '#991b1b')}>Out of Stock</span>;
  if (total <= 10)
    return <span style={pill(`Low: ${total}`, '#fef3c7', '#92400e')}>Low: {total}</span>;
  return <span style={pill(`${total} in stock`, '#d1fae5', '#065f46')}>{total} in stock</span>;
};

const ProductsTable = ({ products, onEdit, onDelete, onRestore }: Props) => {
  if (!products.length) {
    return (
      <p style={{ padding: '2rem', textAlign: 'center', color: '#6b7280', fontSize: '0.875rem' }}>
        No products found.
      </p>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
            {['Image', 'Name', 'Category', 'Gender', 'Price', 'Stock', 'Status', 'Actions'].map((h) => (
              <th
                key={h}
                style={{
                  textAlign: 'left',
                  padding: '0.75rem 1rem',
                  fontWeight: 600,
                  color: '#374151',
                  whiteSpace: 'nowrap',
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {products.map((p) => {
            const total = p.variants.reduce((s, v) => s + v.stock, 0);
            const distinctColors = new Set(p.variants.map((v) => v.color)).size;
            const distinctSizes = new Set(p.variants.map((v) => v.size)).size;

            return (
              <tr
                key={p._id}
                style={{
                  borderBottom: '1px solid #f3f4f6',
                  background: p.isDeleted ? '#fef2f2' : 'transparent',
                }}
              >
                {/* Image */}
                <td style={{ padding: '0.75rem 1rem' }}>
                  {p.images[0] ? (
                    <img
                      src={p.images[0].url}
                      alt={p.name}
                      style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: '0.375rem', border: '1px solid #e5e7eb' }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 48, height: 48,
                        background: '#f3f4f6',
                        borderRadius: '0.375rem',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#9ca3af', fontSize: '0.75rem',
                      }}
                    >
                      No img
                    </div>
                  )}
                </td>

                {/* Name + brand + variant summary */}
                <td style={{ padding: '0.75rem 1rem', fontWeight: 500, maxWidth: 220 }}>
                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{p.brand}</div>
                  {p.variants.length > 0 && (
                    <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.125rem' }}>
                      {distinctColors} color{distinctColors !== 1 ? 's' : ''} · {distinctSizes} size{distinctSizes !== 1 ? 's' : ''}
                    </div>
                  )}
                </td>

                {/* Category */}
                <td style={{ padding: '0.75rem 1rem', textTransform: 'capitalize' }}>{p.category}</td>

                {/* Gender */}
                <td style={{ padding: '0.75rem 1rem', textTransform: 'capitalize' }}>{p.gender}</td>

                {/* Price */}
                <td style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}>
                  {formatPrice(p.priceInCents)}
                </td>

                {/* Stock */}
                <td style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}>
                  {stockBadge(total)}
                </td>

                {/* Status */}
                <td style={{ padding: '0.75rem 1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '0.25rem' }}>
                    {p.isDeleted && (
                      <span style={pill('Deleted', '#ef4444')}>Deleted</span>
                    )}
                    {!p.isDeleted && !p.isActive && (
                      <span style={pill('Inactive', '#f59e0b')}>Inactive</span>
                    )}
                    {!p.isDeleted && p.isActive && (
                      <span style={pill('Active', '#10b981')}>Active</span>
                    )}
                    {p.isFeatured && (
                      <span style={pill('Featured', '#6366f1')}>Featured</span>
                    )}
                  </div>
                </td>

                {/* Actions */}
                <td style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Button
                      variant="secondary"
                      onClick={() => onEdit(p)}
                      style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}
                    >
                      Edit
                    </Button>
                    {p.isDeleted ? (
                      <Button
                        variant="secondary"
                        onClick={() => onRestore(p)}
                        style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem', color: '#10b981' }}
                      >
                        Restore
                      </Button>
                    ) : (
                      <Button
                        variant="secondary"
                        onClick={() => onDelete(p)}
                        style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem', color: '#ef4444' }}
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ProductsTable;
