import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { fetchOrderByIdThunk, updateOrderStatusThunk } from '../../redux/slices/orderSlice';
import { useUI } from '../../context/UIContext';
import { formatPrice } from '../../utils/money';
import type { OrderStatus, OrderUser } from '../../types/order';
import AdminLayout from '../../components/layout/AdminLayout';
import Spinner from '../../components/common/Spinner';

const ORDER_STATUSES: OrderStatus[] = [
  'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled',
];

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  pending:    { bg: '#fef3cd', color: '#b07d0a' },
  confirmed:  { bg: '#dbeafe', color: '#1e40af' },
  processing: { bg: '#ede9fe', color: '#5b21b6' },
  shipped:    { bg: '#ccfbf1', color: '#0f766e' },
  delivered:  { bg: '#d1fae5', color: '#065f46' },
  cancelled:  { bg: '#fee2e2', color: '#991b1b' },
};

const CopyButton = ({ text, label = 'Copy' }: { text: string; label?: string }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };
  return (
    <button
      onClick={handleCopy}
      title={copied ? 'Copied!' : `Copy ${label}`}
      style={{
        background: copied ? '#d1fae5' : '#f3f4f6',
        border: 'none',
        borderRadius: '0.25rem',
        padding: '0.15rem 0.5rem',
        fontSize: '0.72rem',
        fontWeight: 500,
        color: copied ? '#065f46' : '#6b7280',
        cursor: 'pointer',
        transition: 'background 0.15s, color 0.15s',
        whiteSpace: 'nowrap',
      }}
    >
      {copied ? '✓ Copied' : `📋 ${label}`}
    </button>
  );
};

const AdminOrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { showToast } = useUI();
  const { currentOrder, isLoading, error } = useAppSelector((s) => s.orders);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    if (id) dispatch(fetchOrderByIdThunk(id));
  }, [id, dispatch]);

  const handleStatusChange = async (newStatus: string) => {
    if (!currentOrder) return;
    setUpdatingStatus(true);
    const result = await dispatch(updateOrderStatusThunk({ orderId: currentOrder._id, status: newStatus }));
    setUpdatingStatus(false);
    if (updateOrderStatusThunk.fulfilled.match(result)) {
      // currentOrder is updated in the slice — no re-fetch needed
      showToast(`Status updated to ${newStatus}`, 'success');
    } else {
      showToast('Failed to update status', 'error');
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <Spinner />
        </div>
      </AdminLayout>
    );
  }

  if (error || !currentOrder || (id && currentOrder._id !== id)) {
    return (
      <AdminLayout>
        <div style={{ padding: '2rem', color: '#ef4444', fontSize: '0.875rem' }}>
          {error || 'Order not found.'}
        </div>
      </AdminLayout>
    );
  }

  const order = currentOrder;
  const user = order.user as OrderUser | string;
  const displayId = '#' + (order.orderNumber.split('-').pop() ?? order.orderNumber);
  const c = STATUS_COLORS[order.orderStatus] ?? { bg: '#f3f4f6', color: '#6b7280' };

  const fullAddress = [
    order.shippingAddress.street,
    `${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}`,
    order.shippingAddress.country,
    order.shippingAddress.phone ? `Phone: ${order.shippingAddress.phone}` : '',
  ].filter(Boolean).join('\n');

  const maskedPI = order.stripePaymentIntentId
    ? `pi_…${order.stripePaymentIntentId.slice(-6)}`
    : null;

  return (
    <AdminLayout>
      <div style={{ padding: '2rem', maxWidth: '960px' }}>
        {/* Back */}
        <button
          onClick={() => navigate('/admin/orders')}
          style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: '0.8125rem', padding: 0, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
        >
          ← Back to Orders
        </button>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            {/* Short ID + copy chip */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.5rem' }}>
              <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700 }}>Order {displayId}</h1>
              <CopyButton text={order.orderNumber} label="ID" />
            </div>
            {/* Placed on date */}
            <p style={{ margin: 0, fontSize: '0.8125rem', color: '#6b7280' }}>
              <span style={{ fontWeight: 500, color: '#9ca3af', marginRight: '0.3rem' }}>Placed on</span>
              {new Date(order.createdAt).toLocaleString('en-US', {
                year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
              })}
              {typeof user === 'object' && (
                <> · <strong style={{ color: '#374151' }}>{user.name}</strong> <span style={{ color: '#9ca3af' }}>({user.email})</span></>
              )}
            </p>
          </div>

          {/* Status updater */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <span style={{ fontSize: '0.8125rem', color: '#374151', fontWeight: 500 }}>Status</span>
            <select
              value={order.orderStatus}
              disabled={updatingStatus}
              onChange={(e) => handleStatusChange(e.target.value)}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: '9999px',
                border: 'none',
                background: c.bg,
                color: c.color,
                fontSize: '0.8rem',
                fontWeight: 700,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                cursor: updatingStatus ? 'not-allowed' : 'pointer',
                outline: 'none',
              }}
            >
              {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            {updatingStatus && <Spinner size="sm" />}
          </div>
        </div>

        {/* Items table */}
        <div style={{ background: '#fff', borderRadius: '0.5rem', border: '1px solid #e5e7eb', marginBottom: '1.25rem', overflow: 'hidden' }}>
          <div style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid #e5e7eb', fontWeight: 600, fontSize: '0.875rem', color: '#111827' }}>
            Items ({order.items.length})
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                {['Product', 'Size / Color', 'Qty', 'Unit Price', 'Line Total'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: '0.625rem 1.25rem', fontWeight: 600, color: '#6b7280', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item._id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '0.875rem 1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img
                        src={item.image || '/placeholder.png'}
                        alt={item.name}
                        style={{ width: '2.75rem', height: '2.75rem', objectFit: 'cover', borderRadius: '0.375rem', background: '#f3f4f6', flexShrink: 0 }}
                      />
                      <span style={{ fontWeight: 500 }}>{item.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '0.875rem 1.25rem', color: '#6b7280', whiteSpace: 'nowrap' }}>{item.size} / {item.color}</td>
                  <td style={{ padding: '0.875rem 1.25rem' }}>{item.quantity}</td>
                  <td style={{ padding: '0.875rem 1.25rem' }}>{formatPrice(item.priceInCents)}</td>
                  <td style={{ padding: '0.875rem 1.25rem', fontWeight: 600 }}>{formatPrice(item.priceInCents * item.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bottom grid: summary + shipping + payment */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
          {/* Summary — consistent colors: all #374151, total bold #111827 only */}
          <div style={{ background: '#fff', borderRadius: '0.5rem', border: '1px solid #e5e7eb', padding: '1.25rem' }}>
            <p style={{ margin: '0 0 0.875rem', fontWeight: 600, fontSize: '0.875rem', color: '#111827' }}>Summary</p>
            {[
              { label: 'Subtotal', value: formatPrice(order.itemsTotalInCents) },
              { label: 'Tax (10%)', value: formatPrice(order.taxAmountInCents) },
              { label: 'Shipping', value: order.shippingPriceInCents === 0 ? 'Free' : formatPrice(order.shippingPriceInCents) },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', color: '#374151', marginBottom: '0.3rem' }}>
                <span>{label}</span><span>{value}</span>
              </div>
            ))}
            <div style={{ height: '1px', background: '#e5e7eb', margin: '0.5rem 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '0.9375rem', color: '#111827' }}>
              <span>Total</span><span>{formatPrice(order.totalAmountInCents)}</span>
            </div>
          </div>

          {/* Shipping address */}
          <div style={{ background: '#fff', borderRadius: '0.5rem', border: '1px solid #e5e7eb', padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.875rem' }}>
              <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem', color: '#111827' }}>Ship To</p>
              <CopyButton text={fullAddress} label="Address" />
            </div>
            <div style={{ fontSize: '0.8125rem', lineHeight: 1.7 }}>
              <div style={{ color: '#6b7280', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.1rem' }}>Street</div>
              <div style={{ color: '#374151', marginBottom: '0.4rem' }}>{order.shippingAddress.street}</div>
              <div style={{ color: '#6b7280', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.1rem' }}>City / State / Postal</div>
              <div style={{ color: '#374151', marginBottom: '0.4rem' }}>
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
              </div>
              <div style={{ color: '#6b7280', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.1rem' }}>Country</div>
              <div style={{ color: '#374151' }}>{order.shippingAddress.country}</div>
              {order.shippingAddress.phone && (
                <div style={{ marginTop: '0.4rem', color: '#6b7280', fontSize: '0.8125rem' }}>Phone: {order.shippingAddress.phone}</div>
              )}
            </div>
          </div>

          {/* Payment */}
          <div style={{ background: '#fff', borderRadius: '0.5rem', border: '1px solid #e5e7eb', padding: '1.25rem' }}>
            <p style={{ margin: '0 0 0.875rem', fontWeight: 600, fontSize: '0.875rem', color: '#111827' }}>Payment</p>
            <div style={{ fontSize: '0.8125rem', lineHeight: 1.8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#374151' }}>
                <span style={{ color: '#6b7280' }}>Method</span>
                <span>{order.paymentMethod === 'stripe' ? 'Card' : 'Bakong KHQR'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#374151' }}>
                <span style={{ color: '#6b7280' }}>Status</span>
                <span style={{ fontWeight: 600, color: order.paymentProcessed ? '#065f46' : '#b07d0a' }}>
                  {order.paymentProcessed ? 'Paid' : 'Unpaid'}
                </span>
              </div>
              {order.paymentResult?.paidAt && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#374151' }}>
                  <span style={{ color: '#6b7280' }}>Paid on</span>
                  <span>{new Date(order.paymentResult.paidAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
              )}
              {/* Masked Stripe PI with copy */}
              {maskedPI && (
                <div style={{ marginTop: '0.625rem', paddingTop: '0.625rem', borderTop: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#9ca3af' }} title={order.stripePaymentIntentId}>
                    {maskedPI}
                  </span>
                  <CopyButton text={order.stripePaymentIntentId!} label="PI" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminOrderDetail;
