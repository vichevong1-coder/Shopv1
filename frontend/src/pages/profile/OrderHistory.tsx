import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { fetchMyOrdersThunk } from '../../redux/slices/orderSlice';
import { addItemThunk } from '../../redux/slices/cartSlice';
import { useUI } from '../../context/UIContext';
import { useCurrency } from '../../utils/money';
import { OrderCardSkeleton } from '../../components/common/Skeleton';
import type { Order } from '../../types/order';

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  pending:    { bg: '#fef3cd', text: '#b07d0a', border: '#f59e0b' },
  confirmed:  { bg: '#d4edda', text: '#1a7a3c', border: '#3b82f6' },
  processing: { bg: '#d0e4ff', text: '#1a4fa3', border: '#8b5cf6' },
  shipped:    { bg: '#ccfbf1', text: '#0f766e', border: '#14b8a6' },
  delivered:  { bg: '#d4edda', text: '#1a7a3c', border: '#10b981' },
  cancelled:  { bg: '#fde0e0', text: '#b02020', border: '#ef4444' },
};

const STATUS_TABS = ['All', 'Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
const THUMB_MAX = 3;

const StatusBadge = ({ status }: { status: string }) => {
  const c = STATUS_COLORS[status] ?? { bg: '#f0ede9', text: '#9a8f85', border: '#e8e2d9' };
  return (
    <span style={{
      padding: '0.2rem 0.65rem', borderRadius: '1rem',
      background: c.bg, color: c.text,
      fontFamily: '"DM Sans", sans-serif', fontSize: '0.72rem',
      fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', whiteSpace: 'nowrap',
    }}>
      {status}
    </span>
  );
};

const relativeDate = (dateStr: string): string => {
  const diffDays = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

// Truncates at the last word boundary before `max` chars
const wordTruncate = (text: string, max: number): string => {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > 0 ? cut.slice(0, lastSpace) : cut) + '…';
};

const primaryLabel = (order: Order): string => {
  if (order.items.length === 0) return 'Empty order';
  const first = wordTruncate(order.items[0].name, 32);
  return order.items.length > 1 ? `${first} +${order.items.length - 1} more` : first;
};

const shortOrderId = (orderNumber: string) =>
  '#' + (orderNumber.split('-').pop() ?? orderNumber);

const capitalise = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const paymentLabel = (order: Order): string => {
  if (order.paymentMethod === 'bakong') return 'Bakong KHQR';
  const { cardBrand, cardLast4 } = order.paymentResult ?? {};
  if (cardBrand && cardLast4) return `${capitalise(cardBrand)} •••• ${cardLast4}`;
  return 'Credit / Debit Card';
};

const OrderCard = ({ order }: { order: Order }) => {
  const { formatPrice } = useCurrency();
  const dispatch = useAppDispatch();
  const { openCart, showToast } = useUI();
  const [open, setOpen] = useState(false);
  const [buyingAgain, setBuyingAgain] = useState(false);
  const [trackCopied, setTrackCopied] = useState(false);

  const totalQty = order.items.reduce((sum, i) => sum + i.quantity, 0);
  const statusStyle = STATUS_COLORS[order.orderStatus] ?? { bg: '#f0ede9', text: '#9a8f85', border: '#e8e2d9' };
  const thumbItems = order.items.slice(0, THUMB_MAX);
  const overflow = order.items.length - THUMB_MAX;

  const handleBuyAgain = async () => {
    setBuyingAgain(true);
    for (const item of order.items) {
      await dispatch(addItemThunk({
        productId: item.product as string,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
      }));
    }
    setBuyingAgain(false);
    openCart();
    showToast('Added to cart', 'success');
  };

  const handleCopyTracking = () => {
    if (!order.trackingNumber) return;
    navigator.clipboard.writeText(order.trackingNumber).then(() => {
      setTrackCopied(true);
      setTimeout(() => setTrackCopied(false), 1500);
    });
  };

  const handlePrint = () => {
    const win = window.open('', '_blank', 'width=720,height=900');
    if (!win) return;
    const rows = order.items
      .map(
        (i) =>
          `<tr>
            <td>${i.name}<br/><small style="color:#6b7280">${i.size} / ${i.color}</small></td>
            <td style="text-align:center">${i.quantity}</td>
            <td style="text-align:right">${formatPrice(i.priceInCents)}</td>
            <td style="text-align:right">${formatPrice(i.priceInCents * i.quantity)}</td>
          </tr>`
      )
      .join('');
    win.document.write(`<!DOCTYPE html><html><head>
      <title>Receipt — ${order.orderNumber}</title>
      <style>
        body{font-family:sans-serif;padding:2rem;color:#0f0f0f;max-width:620px;margin:0 auto}
        h2{margin:0 0 0.25rem}
        .meta{color:#6b7280;font-size:0.875rem;margin-bottom:2rem}
        table{width:100%;border-collapse:collapse;margin-bottom:1.25rem}
        th{text-align:left;padding:0.5rem;border-bottom:2px solid #0f0f0f;font-size:0.75rem;text-transform:uppercase;letter-spacing:0.05em}
        td{padding:0.5rem;border-bottom:1px solid #e5e7eb;font-size:0.875rem;vertical-align:top}
        .totals{width:220px;margin-left:auto}
        .totals td{font-size:0.875rem}
        .grand td{font-weight:700;border-top:2px solid #0f0f0f;border-bottom:none;padding-top:0.625rem}
        footer{margin-top:2rem;font-size:0.8rem;color:#9ca3af;text-align:center}
      </style>
    </head><body>
      <h2>Order Receipt</h2>
      <div class="meta">
        <strong>${order.orderNumber}</strong><br/>
        ${new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}<br/>
        ${paymentLabel(order)}
      </div>
      <table>
        <thead><tr><th>Item</th><th style="text-align:center">Qty</th><th style="text-align:right">Unit Price</th><th style="text-align:right">Total</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <table class="totals">
        <tr><td>Subtotal</td><td style="text-align:right">${formatPrice(order.itemsTotalInCents)}</td></tr>
        <tr><td>Tax</td><td style="text-align:right">${formatPrice(order.taxAmountInCents)}</td></tr>
        <tr><td>Shipping</td><td style="text-align:right">${order.shippingPriceInCents === 0 ? 'Free' : formatPrice(order.shippingPriceInCents)}</td></tr>
        <tr class="grand"><td>Total</td><td style="text-align:right">${formatPrice(order.totalAmountInCents)}</td></tr>
      </table>
      <footer>Thank you for your order!</footer>
      <script>window.onload=function(){window.print()}</script>
    </body></html>`);
    win.document.close();
  };

  return (
    <div style={{
      background: '#fff',
      borderRadius: '0.75rem',
      border: `1.5px solid ${open ? '#c4845e' : '#e8e2d9'}`,
      borderLeft: `3px solid ${statusStyle.border}`,
      overflow: 'hidden',
      transition: 'border-color 0.2s',
    }}>
      {/* Header button */}
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          width: '100%', display: 'grid', gridTemplateColumns: '1fr auto',
          alignItems: 'center', gap: '1rem', padding: '1.1rem 1.25rem',
          background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = '#fafaf9'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
      >
        {/* Left: order ID chip + product name + meta */}
        <div>
          <div style={{ marginBottom: '0.2rem' }}>
            <span style={{
              fontFamily: 'monospace', fontSize: '0.68rem', fontWeight: 700,
              color: '#9a8f85', background: '#f0ede9',
              padding: '0.1rem 0.4rem', borderRadius: '0.25rem', letterSpacing: '0.04em',
            }}>
              {shortOrderId(order.orderNumber)}
            </span>
          </div>
          <p style={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 700, fontSize: '0.95rem', color: '#0f0f0f', margin: 0 }}>
            {primaryLabel(order)}
          </p>
          <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.78rem', color: '#9a8f85', margin: '0.2rem 0 0' }}>
            {relativeDate(order.createdAt)} · {totalQty} {totalQty === 1 ? 'item' : 'items'}
          </p>
        </div>

        {/* Right: total + status badge + details label */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.35rem', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <span style={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 700, fontSize: '0.95rem', color: '#0f0f0f' }}>
              {formatPrice(order.totalAmountInCents)}
            </span>
            <StatusBadge status={order.orderStatus} />
          </div>
          <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.75rem', color: '#9a8f85' }}>
            {open ? 'Hide ▲' : 'Details ▼'}
          </span>
        </div>
      </button>

      {/* Thumbnail strip — 3 max with overlay "+N" on the last if overflow */}
      <div style={{ display: 'flex', gap: '0.5rem', padding: '0 1.25rem 0.9rem' }}>
        {thumbItems.map((item, idx) => {
          const isLastAndOverflow = idx === THUMB_MAX - 1 && overflow > 0;
          return (
            <div key={item._id} style={{ position: 'relative', width: '3rem', height: '3rem', flexShrink: 0 }}>
              <img
                src={item.image || '/placeholder.png'}
                alt={item.name}
                title={item.name}
                style={{ width: '3rem', height: '3rem', objectFit: 'cover', borderRadius: '0.375rem', background: '#f8f5f1', display: 'block' }}
              />
              {isLastAndOverflow && (
                <div style={{
                  position: 'absolute', inset: 0, borderRadius: '0.375rem',
                  background: 'rgba(0,0,0,0.52)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: '"DM Sans", sans-serif', fontSize: '0.72rem', fontWeight: 700, color: '#fff',
                }}>
                  +{overflow}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Expanded detail */}
      {open && (
        <div style={{ borderTop: '1px solid #e8e2d9' }}>
          {/* Items list */}
          <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.72rem', fontWeight: 600, color: '#9a8f85', letterSpacing: '0.06em', textTransform: 'uppercase', margin: 0 }}>
              Items
            </p>
            {order.items.map((item) => (
              <div key={item._id} style={{ display: 'flex', gap: '0.875rem', alignItems: 'center' }}>
                <Link to={`/product/${item.product}`} style={{ flexShrink: 0 }}>
                  <img
                    src={item.image || '/placeholder.png'}
                    alt={item.name}
                    style={{ width: '3.5rem', height: '3.5rem', objectFit: 'cover', borderRadius: '0.375rem', background: '#f8f5f1', display: 'block' }}
                  />
                </Link>
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

          {/* Totals + delivery + payment */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', padding: '1.25rem' }}>
            {/* Summary */}
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

            {/* Delivery + Payment */}
            <div>
              <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.72rem', fontWeight: 600, color: '#9a8f85', letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 0.6rem' }}>
                Delivery
              </p>
              <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.82rem', color: '#0f0f0f', marginBottom: '0.75rem', lineHeight: 1.6 }}>
                <div>{order.shippingAddress.street}</div>
                <div>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</div>
                <div>{order.shippingAddress.country}</div>
                {order.shippingAddress.phone && <div>Phone: {order.shippingAddress.phone}</div>}
              </div>
              <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.72rem', fontWeight: 600, color: '#9a8f85', letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 0.3rem' }}>
                Payment
              </p>
              <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.82rem', color: '#0f0f0f', margin: 0 }}>
                {paymentLabel(order)}
              </p>
            </div>
          </div>

          {/* Footer: Track + Print on left, Buy Again on right */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '0.75rem 1.25rem 1.25rem', borderTop: '1px solid #e8e2d9',
            gap: '0.75rem', flexWrap: 'wrap',
          }}>
            {/* Left: secondary actions */}
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              {/* Track Shipment */}
              {order.trackingNumber ? (
                <button
                  onClick={handleCopyTracking}
                  style={{
                    padding: '0.45rem 0.9rem',
                    background: trackCopied ? '#d4edda' : '#f0ede9',
                    color: trackCopied ? '#1a7a3c' : '#0f0f0f',
                    border: 'none', borderRadius: '0.375rem',
                    fontFamily: '"DM Sans", sans-serif', fontWeight: 500, fontSize: '0.78rem',
                    cursor: 'pointer', transition: 'background 0.15s',
                  }}
                >
                  {trackCopied ? '✓ Tracking copied' : '📦 Track Shipment'}
                </button>
              ) : (
                <span style={{
                  padding: '0.45rem 0.9rem', borderRadius: '0.375rem',
                  fontFamily: '"DM Sans", sans-serif', fontSize: '0.78rem',
                  color: '#9a8f85', background: '#f8f5f1',
                }}>
                  Awaiting tracking
                </span>
              )}

              {/* Print Receipt */}
              <button
                onClick={handlePrint}
                style={{
                  padding: '0.45rem 0.9rem',
                  background: '#f0ede9', color: '#0f0f0f',
                  border: 'none', borderRadius: '0.375rem',
                  fontFamily: '"DM Sans", sans-serif', fontWeight: 500, fontSize: '0.78rem',
                  cursor: 'pointer',
                }}
              >
                🖨 Print Receipt
              </button>
            </div>

            {/* Right: Buy Again */}
            <button
              onClick={handleBuyAgain}
              disabled={buyingAgain}
              style={{
                padding: '0.55rem 1.4rem',
                background: buyingAgain ? '#e8e2d9' : '#0f0f0f',
                color: buyingAgain ? '#9a8f85' : '#fff',
                border: 'none', borderRadius: '0.375rem',
                fontFamily: '"DM Sans", sans-serif', fontWeight: 600, fontSize: '0.8rem',
                letterSpacing: '0.04em', cursor: buyingAgain ? 'not-allowed' : 'pointer',
                transition: 'background 0.15s',
              }}
            >
              {buyingAgain ? 'Adding…' : 'Buy Again'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const OrderHistory = () => {
  const dispatch = useAppDispatch();
  const { orders, isLoading } = useAppSelector((s) => s.orders);
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    dispatch(fetchMyOrdersThunk());
  }, [dispatch]);

  const filtered = useMemo(() => {
    let result = activeTab === 'All'
      ? orders
      : orders.filter((o) => o.orderStatus.toLowerCase() === activeTab.toLowerCase());

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          o.items.some((i) => i.name.toLowerCase().includes(q))
      );
    }
    return result;
  }, [orders, activeTab, searchQuery]);

  const totalItems = orders.reduce((s, o) => s + o.items.reduce((q, i) => q + i.quantity, 0), 0);

  return (
    <div style={{ background: '#f8f5f1', minHeight: '60vh' }}>
      {/* Sub-header */}
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {Array.from({ length: 3 }).map((_, i) => <OrderCardSkeleton key={i} />)}
          </div>
        ) : orders.length === 0 ? (
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Summary line */}
            <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.875rem', color: '#0f0f0f', margin: 0, fontWeight: 500 }}>
              {orders.length} {orders.length === 1 ? 'order' : 'orders'} · {totalItems} items total
            </p>

            {/* Search bar */}
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', fontSize: '0.875rem', color: '#9a8f85', pointerEvents: 'none' }}>
                🔍
              </span>
              <input
                type="text"
                placeholder="Search by order # or product name"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%', padding: '0.625rem 1rem 0.625rem 2.25rem',
                  border: '1.5px solid #e8e2d9', borderRadius: '0.5rem',
                  fontFamily: '"DM Sans", sans-serif', fontSize: '0.875rem',
                  outline: 'none', background: '#fff', boxSizing: 'border-box',
                  transition: 'border-color 0.15s',
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = '#c4845e'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = '#e8e2d9'; }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#9a8f85', cursor: 'pointer', fontSize: '0.875rem', padding: 0 }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Status filter tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {STATUS_TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: '0.35rem 0.9rem', borderRadius: '2rem',
                    border: activeTab === tab ? 'none' : '1.5px solid #e8e2d9',
                    background: activeTab === tab ? '#0f0f0f' : '#fff',
                    color: activeTab === tab ? '#fff' : '#0f0f0f',
                    fontFamily: '"DM Sans", sans-serif', fontSize: '0.8rem', fontWeight: 500,
                    cursor: 'pointer', transition: 'background 0.15s, color 0.15s',
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Order list or empty state */}
            {filtered.length === 0 ? (
              <div style={{ padding: '3rem 0', textAlign: 'center' }}>
                <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.875rem', color: '#9a8f85', margin: '0 0 0.75rem' }}>
                  {searchQuery
                    ? `No orders match "${searchQuery}"`
                    : `No ${activeTab.toLowerCase()} orders.`}
                </p>
                {(searchQuery || activeTab !== 'All') && (
                  <button
                    onClick={() => { setSearchQuery(''); setActiveTab('All'); }}
                    style={{ background: 'none', border: 'none', color: '#c4845e', fontFamily: '"DM Sans", sans-serif', fontSize: '0.875rem', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
                  >
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              filtered.map((order) => (
                <OrderCard key={order._id} order={order} />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;
