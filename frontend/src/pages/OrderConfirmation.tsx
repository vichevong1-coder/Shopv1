import { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { fetchOrderByIdThunk } from '../redux/slices/orderSlice';
import { formatPrice } from '../utils/money';
import Spinner from '../components/common/Spinner';

const STATUS_COLORS: Record<string, string> = {
  pending:    '#e8a838',
  confirmed:  '#2d9e5f',
  processing: '#3b7de8',
  shipped:    '#7c3aed',
  delivered:  '#2d9e5f',
  cancelled:  '#d42e2e',
};

const OrderConfirmation = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { currentOrder, isLoading } = useAppSelector((s) => s.orders);

  useEffect(() => {
    if (id) dispatch(fetchOrderByIdThunk(id));
  }, [id, dispatch]);

  useEffect(() => {
    if (!isLoading && !currentOrder && id) {
      navigate('/', { replace: true });
    }
  }, [isLoading, currentOrder, id, navigate]);

  if (isLoading || !currentOrder) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spinner />
      </div>
    );
  }

  const { orderNumber, orderStatus, items, shippingAddress, paymentMethod, itemsTotalInCents, taxAmountInCents, shippingPriceInCents, totalAmountInCents } = currentOrder;
  const statusColor = STATUS_COLORS[orderStatus] ?? '#9a8f85';

  return (
    <div style={{ minHeight: '100vh', background: '#f8f5f1', paddingBottom: '4rem' }}>
      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e8e2d9', padding: '1.25rem 2rem', textAlign: 'center' }}>
        <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '1.5rem', fontWeight: 600, color: '#0f0f0f', margin: 0 }}>
          Order Confirmation
        </h1>
      </div>

      <div style={{ maxWidth: '620px', margin: '0 auto', padding: '2.5rem 1.5rem 0' }}>
        {/* Success banner */}
        <div style={{ background: '#fff', borderRadius: '0.75rem', padding: '2rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: '1.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>✓</div>
          <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '1.8rem', fontWeight: 600, color: '#0f0f0f', margin: '0 0 0.5rem' }}>
            Thank you!
          </h2>
          <p style={{ fontFamily: '"DM Sans", sans-serif', color: '#9a8f85', margin: '0 0 1rem', fontSize: '0.9rem' }}>
            Your order has been placed and is being processed.
          </p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 1.25rem', background: '#f8f5f1', borderRadius: '0.5rem' }}>
            <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.8rem', color: '#9a8f85', fontWeight: 500 }}>Order</span>
            <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.875rem', fontWeight: 700, color: '#0f0f0f' }}>#{orderNumber}</span>
            <span style={{ padding: '0.2rem 0.6rem', background: statusColor + '20', color: statusColor, borderRadius: '1rem', fontFamily: '"DM Sans", sans-serif', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              {orderStatus}
            </span>
          </div>
        </div>

        {/* Items */}
        <div style={{ background: '#fff', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: '1.5rem' }}>
          <h3 style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.75rem', fontWeight: 600, color: '#9a8f85', letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 1rem' }}>
            Items ordered
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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

          <div style={{ height: '1px', background: '#e8e2d9', margin: '1rem 0' }} />

          {/* Totals */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            {[
              { label: 'Subtotal', value: formatPrice(itemsTotalInCents) },
              { label: 'Tax (10%)', value: formatPrice(taxAmountInCents) },
              { label: 'Shipping', value: shippingPriceInCents === 0 ? 'Free' : formatPrice(shippingPriceInCents) },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontFamily: '"DM Sans", sans-serif', fontSize: '0.875rem', color: '#9a8f85' }}>
                <span>{label}</span><span>{value}</span>
              </div>
            ))}
            <div style={{ height: '1px', background: '#e8e2d9', margin: '0.25rem 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: '"DM Sans", sans-serif', fontSize: '1rem', fontWeight: 700, color: '#0f0f0f' }}>
              <span>Total</span><span>{formatPrice(totalAmountInCents)}</span>
            </div>
          </div>
        </div>

        {/* Shipping + Payment info */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ background: '#fff', borderRadius: '0.75rem', padding: '1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.72rem', fontWeight: 600, color: '#9a8f85', letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 0.5rem' }}>
              Ships to
            </p>
            <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.85rem', color: '#0f0f0f', margin: 0, lineHeight: 1.5 }}>
              {shippingAddress.street}<br />
              {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}<br />
              {shippingAddress.country}
              {shippingAddress.phone && <><br />{shippingAddress.phone}</>}
            </p>
          </div>
          <div style={{ background: '#fff', borderRadius: '0.75rem', padding: '1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.72rem', fontWeight: 600, color: '#9a8f85', letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 0.5rem' }}>
              Payment
            </p>
            <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.85rem', color: '#0f0f0f', margin: 0 }}>
              {paymentMethod === 'stripe' ? 'Credit / Debit Card' : 'Bakong KHQR'}
            </p>
          </div>
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center' }}>
          <Link
            to="/shop"
            style={{ display: 'inline-block', padding: '0.875rem 2.5rem', background: '#0f0f0f', color: '#fff', textDecoration: 'none', borderRadius: '0.375rem', fontFamily: '"DM Sans", sans-serif', fontWeight: 600, fontSize: '0.9rem', letterSpacing: '0.05em' }}
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
