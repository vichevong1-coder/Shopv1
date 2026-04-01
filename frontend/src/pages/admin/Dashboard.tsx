import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAdminStats, type AdminStats } from '../../api/admin';
import { formatPrice } from '../../utils/money';
import type { OrderUser } from '../../types/order';
import AdminLayout from '../../components/layout/AdminLayout';
import StatsCard from '../../components/admin/StatsCard';
import Spinner from '../../components/common/Spinner';

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  pending:    { bg: '#fef3cd', color: '#b07d0a' },
  confirmed:  { bg: '#dbeafe', color: '#1e40af' },
  processing: { bg: '#ede9fe', color: '#5b21b6' },
  shipped:    { bg: '#ccfbf1', color: '#0f766e' },
  delivered:  { bg: '#d1fae5', color: '#065f46' },
  cancelled:  { bg: '#fee2e2', color: '#991b1b' },
};

const pill = (status: string) => {
  const c = STATUS_COLORS[status] ?? { bg: '#f3f4f6', color: '#6b7280' };
  return (
    <span style={{
      display: 'inline-block',
      padding: '0.15rem 0.55rem',
      borderRadius: '9999px',
      fontSize: '0.7rem',
      fontWeight: 600,
      background: c.bg,
      color: c.color,
      textTransform: 'uppercase',
      letterSpacing: '0.04em',
      whiteSpace: 'nowrap',
    }}>
      {status}
    </span>
  );
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
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const shortId = (orderNumber: string) => '#' + (orderNumber.split('-').pop() ?? orderNumber);

const AdminDashboard = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminStats()
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminLayout>
      <div style={{ padding: '2rem', maxWidth: '1100px' }}>
        <h1 style={{ margin: '0 0 1.75rem', fontSize: '1.5rem', fontWeight: 700 }}>Dashboard</h1>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
            <Spinner />
          </div>
        ) : (
          <>
            {/* KPI row */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
              <StatsCard
                title="Total Revenue"
                value={formatPrice(stats?.totalRevenue ?? 0)}
                sub="Paid orders only"
                color="#059669"
              />
              <StatsCard
                title="Total Orders"
                value={String(stats?.totalOrders ?? 0)}
                color="#6366f1"
              />
              <StatsCard
                title="Pending"
                value={String(stats?.pendingOrders ?? 0)}
                sub="Awaiting fulfilment"
                color="#d97706"
              />
              <StatsCard
                title="Users"
                value={String(stats?.totalUsers ?? 0)}
                color="#0891b2"
              />
              <StatsCard
                title="Products"
                value={String(stats?.totalProducts ?? 0)}
                sub="Active in catalog"
                color="#7c3aed"
              />
            </div>

            {/* Recent orders */}
            <div style={{ background: '#fff', borderRadius: '0.5rem', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', borderBottom: '1px solid #e5e7eb' }}>
                <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9375rem' }}>Recent Orders</p>
                <Link to="/admin/orders" style={{ fontSize: '0.8125rem', color: '#6366f1', textDecoration: 'none', fontWeight: 500 }}>
                  View all →
                </Link>
              </div>

              {!stats?.recentOrders.length ? (
                <p style={{ padding: '2rem', textAlign: 'center', color: '#6b7280', fontSize: '0.875rem' }}>No orders yet.</p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                  <thead>
                    <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                      {['Order #', 'Customer', 'Date', 'Total', 'Status', ''].map((h) => (
                        <th key={h} style={{ textAlign: 'left', padding: '0.625rem 1.25rem', fontWeight: 600, color: '#6b7280', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentOrders.map((order) => {
                      const user = order.user as OrderUser | string;
                      const userName = typeof user === 'object' ? user.name : 'Guest';
                      return (
                        <tr key={order._id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                          <td style={{ padding: '0.75rem 1.25rem', fontWeight: 600, fontFamily: 'monospace', fontSize: '0.8125rem' }}>
                            {shortId(order.orderNumber)}
                          </td>
                          <td style={{ padding: '0.75rem 1.25rem', color: '#374151' }}>{userName}</td>
                          <td style={{ padding: '0.75rem 1.25rem', color: '#6b7280', fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>
                            {relativeDate(order.createdAt)}
                          </td>
                          <td style={{ padding: '0.75rem 1.25rem', fontWeight: 600 }}>
                            {formatPrice(order.totalAmountInCents)}
                          </td>
                          <td style={{ padding: '0.75rem 1.25rem' }}>{pill(order.orderStatus)}</td>
                          <td style={{ padding: '0.75rem 1.25rem', textAlign: 'right' }}>
                            <Link
                              to={`/admin/orders/${order._id}`}
                              style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#6366f1', textDecoration: 'none' }}
                            >
                              View →
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
