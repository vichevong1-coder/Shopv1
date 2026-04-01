import { useEffect, useState, useCallback, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { fetchAllOrdersThunk, updateOrderStatusThunk } from '../../redux/slices/orderSlice';
import { getAllOrders } from '../../api/order';
import { useUI } from '../../context/UIContext';
import { formatPrice } from '../../utils/money';
import type { OrderStatus, OrderUser } from '../../types/order';
import AdminLayout from '../../components/layout/AdminLayout';
import OrdersTable from '../../components/admin/OrdersTable';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

const DATE_OPTIONS = [
  { value: '', label: 'All Time' },
  { value: 'today', label: 'Today' },
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: 'custom', label: 'Custom Range' },
];

const selStyle: React.CSSProperties = {
  padding: '0.5rem 0.75rem',
  border: '1px solid #d1d5db',
  borderRadius: '0.375rem',
  fontSize: '0.8125rem',
  background: '#fff',
  cursor: 'pointer',
  outline: 'none',
};

const inputStyle: React.CSSProperties = {
  padding: '0.5rem 0.625rem',
  border: '1px solid #d1d5db',
  borderRadius: '0.375rem',
  fontSize: '0.8125rem',
  outline: 'none',
  background: '#fff',
};

const AdminOrders = () => {
  const dispatch = useAppDispatch();
  const { showToast } = useUI();
  const { adminOrders, adminPagination, isLoading, error } = useAppSelector((s) => s.orders);

  const [status, setStatus] = useState<OrderStatus | ''>('');
  const [dateRange, setDateRange] = useState<'' | 'today' | '7d' | '30d' | 'custom'>('');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [sortCol, setSortCol] = useState<'date' | 'total'>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [pendingTotal, setPendingTotal] = useState<number | null>(null);

  const load = useCallback(() => {
    dispatch(fetchAllOrdersThunk({ page, limit: 50, status: status || undefined }));
  }, [dispatch, page, status]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    getAllOrders({ status: 'pending', limit: 1 })
      .then((res) => setPendingTotal(res.pagination.total))
      .catch(() => {});
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    const result = await dispatch(updateOrderStatusThunk({ orderId, status: newStatus }));
    setUpdatingId(null);
    if (updateOrderStatusThunk.fulfilled.match(result)) {
      showToast('Status updated', 'success');
    }
  };

  const handleSort = (col: 'date' | 'total') => {
    if (sortCol === col) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortCol(col);
      setSortDir('desc');
    }
  };

  const clearFilters = () => {
    setSearch('');
    setDateRange('');
    setCustomFrom('');
    setCustomTo('');
    setStatus('');
    setPage(1);
  };

  const displayOrders = useMemo(() => {
    let result = [...adminOrders];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((o) => {
        const u = o.user as OrderUser | string;
        const name = typeof u === 'object' ? u.name.toLowerCase() : '';
        const email = typeof u === 'object' ? u.email.toLowerCase() : '';
        return o.orderNumber.toLowerCase().includes(q) || name.includes(q) || email.includes(q);
      });
    }

    if (dateRange && dateRange !== 'custom') {
      const cutoff =
        dateRange === 'today'
          ? new Date().setHours(0, 0, 0, 0)
          : dateRange === '7d'
          ? Date.now() - 7 * 86400000
          : Date.now() - 30 * 86400000;
      result = result.filter((o) => new Date(o.createdAt).getTime() >= cutoff);
    }

    if (dateRange === 'custom') {
      if (customFrom) {
        result = result.filter((o) => new Date(o.createdAt) >= new Date(customFrom));
      }
      if (customTo) {
        result = result.filter((o) => new Date(o.createdAt) <= new Date(customTo + 'T23:59:59'));
      }
    }

    result.sort((a, b) => {
      const av = sortCol === 'date' ? new Date(a.createdAt).getTime() : a.totalAmountInCents;
      const bv = sortCol === 'date' ? new Date(b.createdAt).getTime() : b.totalAmountInCents;
      return sortDir === 'asc' ? av - bv : bv - av;
    });

    return result;
  }, [adminOrders, search, dateRange, customFrom, customTo, sortCol, sortDir]);

  const pageRevenue = adminOrders.reduce((s, o) => s + o.totalAmountInCents, 0);

  return (
    <AdminLayout>
      <div style={{ padding: '2rem' }}>
        <h1 style={{ margin: '0 0 1.5rem', fontSize: '1.5rem', fontWeight: 700 }}>Orders</h1>

        {/* KPI chips */}
        <div style={{ display: 'flex', gap: '0.875rem', marginBottom: '1.75rem', flexWrap: 'wrap' }}>
          {[
            { label: status ? `${status} orders` : 'Total Orders', value: adminPagination.total.toString(), color: '#4338ca', bg: '#eef2ff' },
            { label: 'Pending', value: pendingTotal !== null ? pendingTotal.toString() : '…', color: '#b07d0a', bg: '#fef9c3' },
            {
              label: 'Revenue',
              value: formatPrice(pageRevenue),
              color: '#065f46',
              bg: '#d1fae5',
              tooltip: 'Sum of currently loaded orders',
            },
          ].map(({ label, value, color, bg, tooltip }) => (
            <div key={label} style={{ background: bg, borderRadius: '0.625rem', padding: '0.875rem 1.25rem', minWidth: '9.5rem' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 600, color, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                {label}
                {tooltip && (
                  <span title={tooltip} style={{ cursor: 'help', opacity: 0.6, fontSize: '0.75rem' }}>ⓘ</span>
                )}
              </div>
              <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#111827' }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Filter bar */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.625rem', alignItems: 'center', marginBottom: '0.75rem' }}>
          <input
            type="text"
            placeholder="Search order #, name, or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ ...inputStyle, flex: '1 1 220px', maxWidth: '320px' }}
          />
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value as OrderStatus | ''); setPage(1); }}
            style={selStyle}
          >
            {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as '' | 'today' | '7d' | '30d' | 'custom')}
            style={selStyle}
          >
            {DATE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          {/* Custom date inputs */}
          {dateRange === 'custom' && (
            <>
              <input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} style={inputStyle} title="From" />
              <span style={{ color: '#9ca3af', fontSize: '0.8125rem' }}>—</span>
              <input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} style={inputStyle} title="To" />
            </>
          )}
        </div>

        {/* Results count above table */}
        <p style={{ fontSize: '0.8125rem', color: '#6b7280', margin: '0 0 0.5rem' }}>
          Showing {displayOrders.length} of {adminPagination.total} orders
        </p>

        {/* Table */}
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
            <Spinner />
          </div>
        ) : (
          <>
            {error && <p style={{ color: '#ef4444', fontSize: '0.875rem', marginBottom: '1rem' }}>{error}</p>}
            <div style={{ background: '#fff', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
              <OrdersTable
                orders={displayOrders}
                updatingId={updatingId}
                onStatusChange={handleStatusChange}
                sortCol={sortCol}
                sortDir={sortDir}
                onSort={handleSort}
                onClearFilters={clearFilters}
              />
            </div>
          </>
        )}

        {/* Pagination */}
        {adminPagination.pages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '1.25rem' }}>
            <Button variant="secondary" disabled={page === 1} onClick={() => setPage((p) => p - 1)} style={{ padding: '0.375rem 0.875rem' }}>
              ← Prev
            </Button>
            <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              Page {page} of {adminPagination.pages}
            </span>
            <Button variant="secondary" disabled={page === adminPagination.pages} onClick={() => setPage((p) => p + 1)} style={{ padding: '0.375rem 0.875rem' }}>
              Next →
            </Button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;
