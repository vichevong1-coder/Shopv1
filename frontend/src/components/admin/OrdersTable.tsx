import { useNavigate } from 'react-router-dom';
import type { Order, OrderStatus, OrderUser } from '../../types/order';
import { formatPrice } from '../../utils/money';

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

const relativeDate = (dateStr: string): string => {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const shortId = (orderNumber: string): string => {
  const parts = orderNumber.split('-');
  return '#' + (parts[parts.length - 1] ?? orderNumber);
};

const itemsPreview = (order: Order): { short: string; full: string } => {
  if (!order.items.length) return { short: '—', full: '' };
  const first = order.items[0].name;
  const truncated = first.length > 40 ? first.slice(0, 40).trimEnd() + '…' : first;
  const short = order.items.length > 1 ? `${truncated} +${order.items.length - 1}` : truncated;
  const full = order.items.map((i) => `${i.name} (${i.size} / ${i.color} × ${i.quantity})`).join('\n');
  return { short, full };
};

const thBase: React.CSSProperties = {
  textAlign: 'left',
  padding: '0.75rem 1rem',
  fontWeight: 600,
  color: '#374151',
  whiteSpace: 'nowrap',
  fontSize: '0.8125rem',
};

const SortTh = ({
  label, col, sortCol, sortDir, onSort,
}: {
  label: string;
  col: 'date' | 'total';
  sortCol: 'date' | 'total';
  sortDir: 'asc' | 'desc';
  onSort: (c: 'date' | 'total') => void;
}) => (
  <th onClick={() => onSort(col)} style={{ ...thBase, cursor: 'pointer', userSelect: 'none' }}>
    {label}{' '}
    <span style={{ opacity: sortCol === col ? 0.85 : 0.2, fontSize: '0.7rem' }}>
      {sortCol === col ? (sortDir === 'asc' ? '▲' : '▼') : '↕'}
    </span>
  </th>
);

interface Props {
  orders: Order[];
  updatingId: string | null;
  onStatusChange: (orderId: string, status: string) => void;
  sortCol: 'date' | 'total';
  sortDir: 'asc' | 'desc';
  onSort: (col: 'date' | 'total') => void;
  onClearFilters?: () => void;
}

const OrdersTable = ({ orders, updatingId, onStatusChange, sortCol, sortDir, onSort, onClearFilters }: Props) => {
  const navigate = useNavigate();

  if (!orders.length) {
    return (
      <div style={{ padding: '3.5rem 2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📭</div>
        <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: '0 0 1rem' }}>
          No orders match your current filters.
        </p>
        {onClearFilters && (
          <button
            onClick={onClearFilters}
            style={{
              padding: '0.5rem 1.25rem',
              background: '#111827',
              color: '#fff',
              border: 'none',
              borderRadius: '0.375rem',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Clear filters
          </button>
        )}
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
            <th style={thBase}>Order #</th>
            <th style={thBase}>Customer</th>
            <th style={thBase}>Items</th>
            <SortTh label="Date" col="date" sortCol={sortCol} sortDir={sortDir} onSort={onSort} />
            <SortTh label="Total" col="total" sortCol={sortCol} sortDir={sortDir} onSort={onSort} />
            <th style={thBase}>Status</th>
            <th style={{ padding: '0.75rem 1rem' }} />
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => {
            const user = order.user as OrderUser | string;
            const userName = typeof user === 'object' ? user.name : 'Guest';
            const userEmail = typeof user === 'object' ? user.email : '';
            const isUpdating = updatingId === order._id;
            const c = STATUS_COLORS[order.orderStatus] ?? { bg: '#f3f4f6', color: '#6b7280' };
            const fullDate = new Date(order.createdAt).toLocaleString('en-US', {
              year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
            });
            const preview = itemsPreview(order);

            return (
              <tr
                key={order._id}
                onClick={() => navigate(`/admin/orders/${order._id}`)}
                style={{
                  borderBottom: '1px solid #f3f4f6',
                  opacity: isUpdating ? 0.6 : 1,
                  transition: 'background 0.1s, opacity 0.15s',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#f9fafb'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = ''; }}
              >
                {/* Order # */}
                <td style={{ padding: '0.75rem 1rem', fontWeight: 600, whiteSpace: 'nowrap', fontFamily: 'monospace', fontSize: '0.8125rem' }}>
                  {shortId(order.orderNumber)}
                </td>

                {/* Customer */}
                <td style={{ padding: '0.75rem 1rem', maxWidth: 180 }}>
                  <div style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userName}</div>
                  {userEmail && (
                    <div style={{ fontSize: '0.75rem', color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {userEmail}
                    </div>
                  )}
                </td>

                {/* Items preview */}
                <td style={{ padding: '0.75rem 1rem', maxWidth: 260 }} title={preview.full}>
                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.8125rem', color: '#374151' }}>
                    {preview.short}
                  </div>
                </td>

                {/* Date */}
                <td style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap', color: '#6b7280', fontSize: '0.8125rem' }} title={fullDate}>
                  {relativeDate(order.createdAt)}
                </td>

                {/* Total */}
                <td style={{ padding: '0.75rem 1rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
                  {formatPrice(order.totalAmountInCents)}
                </td>

                {/* Status pill-dropdown — stop row click propagation so dropdown change doesn't navigate */}
                <td
                  style={{ padding: '0.75rem 1rem' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <select
                    value={order.orderStatus}
                    disabled={isUpdating}
                    onChange={(e) => onStatusChange(order._id, e.target.value)}
                    style={{
                      padding: '0.2rem 0.6rem',
                      borderRadius: '9999px',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                      border: 'none',
                      outline: 'none',
                      background: c.bg,
                      color: c.color,
                      cursor: isUpdating ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {ORDER_STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </td>

                {/* View link */}
                <td
                  style={{ padding: '0.75rem 1rem', textAlign: 'right', whiteSpace: 'nowrap' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#6366f1' }}>
                    View →
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default OrdersTable;
