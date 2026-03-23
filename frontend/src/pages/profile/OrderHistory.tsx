import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { fetchMyOrdersThunk } from '../../redux/slices/orderSlice';
import { formatPrice } from '../../utils/money';
import Spinner from '../../components/common/Spinner';
import type { Order } from '../../types/order';

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  pending:    { bg: '#fef3cd', text: '#b07d0a' },
  confirmed:  { bg: '#d4edda', text: '#1a7a3c' },
  processing: { bg: '#d0e4ff', text: '#1a4fa3' },
  shipped:    { bg: '#ede0ff', text: '#5a2d9e' },
  delivered:  { bg: '#d4edda', text: '#1a7a3c' },
  cancelled:  { bg: '#fde0e0', text: '#b02020' },
};

const StatusBadge = ({ status }: { status: string }) => {
  const c = STATUS_COLORS[status] ?? { bg: '#f0ede9', text: '#9a8f85' };
  return (
    <span style={{
      padding: '0.2rem 0.65rem',
      borderRadius: '1rem',
      background: c.bg,
      color: c.text,
      fontFamily: '"DM Sans", sans-serif',
      fontSize: '0.72rem',
      fontWeight: 600,
      letterSpacing: '0.04em',
      textTransform: 'uppercase',
      whiteSpace: 'nowrap',
    }}>
      {status}
    </span>
  );
};

const OrderCard = ({ order }: { order: Order }) => {
  const [open, setOpen] = useState(false);
  const date = new Date(order.createdAt).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  const totalQty = order.items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div style={{
      background: '#fff',
      borderRadius: '0.75rem',
      border: '1.5px solid',
      borderColor: open ? '#c4845e' : '#e8e2d9',
      overflow: 'hidden',
      transition: 'border-color 0.2s',
    }}>
      {/* Header row */}
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          width: '100%',
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          alignItems: 'center',
          gap: '1rem',
          padding: '1.1rem 1.25rem',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        {/* Left: meta */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 700, fontSize: '0.9rem', color: '#0f0f0f' }}>
            #{order.orderNumber}
          </span>
          <StatusBadge status={order.orderStatus} />
          <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.8rem', color: '#9a8f85' }}>
            {date}
          </span>
          <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.8rem', color: '#9a8f85' }}>
            {totalQty} {totalQty === 1 ? 'item' : 'items'}
          </span>
        </div>

        {/* Right: total + chevron */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', flexShrink: 0 }}>
          <span style={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 700, fontSize: '0.95rem', color: '#0f0f0f' }}>
            {formatPrice(order.totalAmountInCents)}
          </span>
          <span style={{
            fontSize: '0.75rem',
            color: '#9a8f85',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s',
            display: 'inline-block',
          }}>
            ▼
          </span>
        </div>
      </button>

      {/* Thumbnail strip */}
      <div style={{ display: 'flex', gap: '0.5rem', padding: '0 1.25rem 0.9rem', flexWrap: 'wrap' }}>
        {order.items.slice(0, 5).map((item) => (
          <img
            key={item._id}
            src={item.image || '/placeholder.png'}
            alt={item.name}
            title={item.name}
            style={{ width: '3rem', height: '3rem', objectFit: 'cover', borderRadius: '0.375rem', background: '#f8f5f1' }}
          />
        ))}
        {order.items.length > 5 && (
          <div style={{ width: '3rem', height: '3rem', borderRadius: '0.375rem', background: '#f8f5f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"DM Sans", sans-serif', fontSize: '0.75rem', color: '#9a8f85', fontWeight: 600 }}>
            +{order.items.length - 5}
          </div>
        )}
      </div>

      {/* Expanded detail */}
      {open && (
        <div style={{ borderTop: '1px solid #e8e2d9' }}>
          {/* Items */}
          <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.72rem', fontWeight: 600, color: '#9a8f85', letterSpacing: '0.06em', textTransform: 'uppercase', margin: 0 }}>
              Items
            </p>
            {order.items.map((item) => (
              <div key={item._id} style={{ display: 'flex', gap: '0.875rem', alignItems: 'center' }}>
                <img
                  src={item.image || '/placeholder.png'}
                  alt={item.name}
                  style={{ width: '3.5rem', height: '3.5rem', objectFit: 'cover', borderRadius: '0.375rem', background: '#f8f5f1', flexShrink: 0 }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 500, fontSize: '0.875rem', color: '#0f0f0f', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.name}
                  </p>
                  <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.78rem', color: '#9a8f85', margin: '0.15rem 0 0' }}>
                    {item.size} · {item.color} · Qty {item.quantity}
                  </p>
                </div>
                <p style={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 600, fontSize: '0.875rem', color: '#0f0f0f', margin: 0, flexShrink: 0 }}>
                  {formatPrice(item.priceInCents * item.quantity)}
                </p>
              </div>
            ))}
          </div>

          <div style={{ height: '1px', background: '#e8e2d9', margin: '0 1.25rem' }} />

          {/* Totals + address */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', padding: '1.25rem' }}>
            {/* Totals */}
            <div>
              <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.72rem', fontWeight: 600, color: '#9a8f85', letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 0.6rem' }}>
                Summary
              </p>
              {[
                { label: 'Subtotal', value: formatPrice(order.itemsTotalInCents) },
                { label: 'Tax', value: formatPrice(order.taxAmountInCents) },
                { label: 'Shipping', value: order.shippingPriceInCents === 0 ? 'Free' : formatPrice(order.shippingPriceInCents) },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontFamily: '"DM Sans", sans-serif', fontSize: '0.82rem', color: '#9a8f85', marginBottom: '0.3rem' }}>
                  <span>{label}</span><span>{value}</span>
                </div>
              ))}
              <div style={{ height: '1px', background: '#e8e2d9', margin: '0.4rem 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: '"DM Sans", sans-serif', fontSize: '0.9rem', fontWeight: 700, color: '#0f0f0f' }}>
                <span>Total</span><span>{formatPrice(order.totalAmountInCents)}</span>
              </div>
            </div>

            {/* Address + payment */}
            <div>
              <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.72rem', fontWeight: 600, color: '#9a8f85', letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 0.6rem' }}>
                Delivery
              </p>
              <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.82rem', color: '#0f0f0f', margin: '0 0 0.75rem', lineHeight: 1.5 }}>
                {order.shippingAddress.street}<br />
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}<br />
                {order.shippingAddress.country}
                {order.shippingAddress.phone && <><br />{order.shippingAddress.phone}</>}
              </p>
              <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.72rem', fontWeight: 600, color: '#9a8f85', letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 0.3rem' }}>
                Payment
              </p>
              <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.82rem', color: '#0f0f0f', margin: 0 }}>
                {order.paymentMethod === 'stripe' ? 'Credit / Debit Card' : 'Bakong KHQR'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const OrderHistory = () => {
  const dispatch = useAppDispatch();
  const { orders, isLoading } = useAppSelector((s) => s.orders);

  useEffect(() => {
    dispatch(fetchMyOrdersThunk());
  }, [dispatch]);

  return (
    <div style={{ minHeight: '100vh', background: '#f8f5f1' }}>
      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e8e2d9', padding: '1.25rem 2rem' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/profile" style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.85rem', color: '#9a8f85', textDecoration: 'none' }}>
            Account
          </Link>
          <span style={{ color: '#e8e2d9' }}>›</span>
          <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '1.4rem', fontWeight: 600, color: '#0f0f0f', margin: 0 }}>
            Order History
          </h1>
        </div>
      </div>

      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
            <Spinner />
          </div>
        ) : orders.length === 0 ? (
          /* Empty state */
          <div style={{ textAlign: 'center', padding: '5rem 1rem' }}>
            <p style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🛍️</p>
            <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '1.8rem', fontWeight: 600, color: '#0f0f0f', margin: '0 0 0.5rem' }}>
              No orders yet
            </h2>
            <p style={{ fontFamily: '"DM Sans", sans-serif', color: '#9a8f85', margin: '0 0 1.75rem' }}>
              When you place an order, it will appear here.
            </p>
            <Link
              to="/shop"
              style={{ display: 'inline-block', padding: '0.75rem 2rem', background: '#0f0f0f', color: '#fff', textDecoration: 'none', borderRadius: '0.375rem', fontFamily: '"DM Sans", sans-serif', fontWeight: 600, fontSize: '0.875rem', letterSpacing: '0.05em' }}
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.85rem', color: '#9a8f85', margin: '0 0 0.5rem' }}>
              {orders.length} {orders.length === 1 ? 'order' : 'orders'} · {orders.reduce((s, o) => s + o.items.reduce((q, i) => q + i.quantity, 0), 0)} items total
            </p>
            {orders.map((order) => (
              <OrderCard key={order._id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;
