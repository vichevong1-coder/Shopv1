import Button from '../common/Button';
import { formatPrice } from '../../utils/money';
import type { CartItem } from '../../types/cart';
import type { ShippingAddress } from '../../types/order';

interface Props {
  items: CartItem[];
  shippingAddress: ShippingAddress;
  onBack: () => void;
  onNext: () => void;
  renderAboveActions?: React.ReactNode;
}

const OrderReview = ({ items, shippingAddress, onBack, onNext, renderAboveActions }: Props) => {
  const subtotal = items.reduce((s, i) => s + i.priceInCents * i.quantity, 0);
  const tax = Math.round(subtotal * 0.1);
  const shipping = 0;
  const total = subtotal + tax + shipping;

  return (
    <div>
      <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '1.6rem', fontWeight: 600, marginBottom: '1.5rem', color: '#0f0f0f' }}>
        Review Order
      </h2>

      {/* Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
        {items.map((item) => (
          <div key={item._id} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <img
              src={item.image || '/placeholder.png'}
              alt={item.name}
              style={{ width: '4rem', height: '4rem', objectFit: 'cover', borderRadius: '0.25rem', background: '#f8f5f1', flexShrink: 0 }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 500, fontSize: '0.9rem', color: '#0f0f0f', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {item.name}
              </p>
              <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.8rem', color: '#9a8f85', margin: '0.2rem 0 0' }}>
                {item.size} · {item.color} · Qty {item.quantity}
              </p>
            </div>
            <p style={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 600, fontSize: '0.9rem', color: '#0f0f0f', margin: 0, flexShrink: 0 }}>
              {formatPrice(item.priceInCents * item.quantity)}
            </p>
          </div>
        ))}
      </div>

      <div style={{ height: '1px', background: '#e8e2d9', marginBottom: '1rem' }} />

      {/* Shipping address recap */}
      <div style={{ marginBottom: '1.25rem', padding: '0.875rem', background: '#f8f5f1', borderRadius: '0.5rem' }}>
        <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.75rem', fontWeight: 600, color: '#9a8f85', letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 0.4rem' }}>
          Ships to
        </p>
        <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.875rem', color: '#0f0f0f', margin: 0 }}>
          {shippingAddress.street}, {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}, {shippingAddress.country}
          {shippingAddress.phone && <><br />{shippingAddress.phone}</>}
        </p>
      </div>

      {/* Totals */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Subtotal', value: formatPrice(subtotal) },
          { label: 'Tax (10%)', value: formatPrice(tax) },
          { label: 'Shipping', value: shipping === 0 ? 'Free' : formatPrice(shipping) },
        ].map(({ label, value }) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontFamily: '"DM Sans", sans-serif', fontSize: '0.875rem', color: '#9a8f85' }}>
            <span>{label}</span>
            <span>{value}</span>
          </div>
        ))}
        <div style={{ height: '1px', background: '#e8e2d9', margin: '0.25rem 0' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: '"DM Sans", sans-serif', fontSize: '1rem', fontWeight: 700, color: '#0f0f0f' }}>
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>

      {renderAboveActions}

      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <Button variant="secondary" onClick={onBack} style={{ flex: 1 }}>
          Back
        </Button>
        <Button onClick={onNext} style={{ flex: 2, background: '#0f0f0f', color: '#fff', padding: '0.875rem', fontSize: '0.95rem', letterSpacing: '0.05em' }}>
          Continue to Payment
        </Button>
      </div>
    </div>
  );
};

export default OrderReview;
