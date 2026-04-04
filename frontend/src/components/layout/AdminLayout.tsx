import type { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { logoutThunk } from '../../redux/slices/authSlice';

const IconDashboard = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
  </svg>
);

const IconProducts = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);

const IconOrders = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
  </svg>
);

const IconUsers = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const IconSignOut = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const NAV_LINKS = [
  { to: '/admin', label: 'Dashboard', exact: true, Icon: IconDashboard },
  { to: '/admin/products', label: 'Products', exact: false, Icon: IconProducts },
  { to: '/admin/orders', label: 'Orders', exact: false, Icon: IconOrders },
  { to: '/admin/users', label: 'Users', exact: false, Icon: IconUsers },
];

const AdminLayout = ({ children }: { children: ReactNode }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((s) => s.auth.user);

  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const handleLogout = async () => {
    await dispatch(logoutThunk());
    navigate('/auth/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      {/* Sidebar */}
      <aside style={{ width: 220, background: '#111827', color: '#f9fafb', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        {/* Brand */}
        <div style={{ padding: '1.25rem 1.25rem 1rem', borderBottom: '1px solid #1f2937' }}>
          <span style={{ fontWeight: 700, fontSize: '0.9375rem', letterSpacing: '0.025em', color: '#f9fafb' }}>
            Shopv1 Admin
          </span>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '0.75rem 0' }}>
          <p style={{ fontSize: '0.65rem', fontWeight: 600, color: '#4b5563', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '0.5rem 1.25rem 0.25rem', margin: 0 }}>
            Navigation
          </p>
          {NAV_LINKS.map(({ to, label, exact, Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.625rem',
                padding: '0.6rem 1.25rem',
                color: isActive ? '#fff' : '#9ca3af',
                background: isActive ? '#1f2937' : 'transparent',
                textDecoration: 'none',
                fontSize: '0.875rem',
                fontWeight: isActive ? 600 : 400,
                borderLeft: isActive ? '3px solid #6366f1' : '3px solid transparent',
                transition: 'color 0.15s, background 0.15s',
              })}
            >
              <Icon />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Profile footer */}
        <div style={{ padding: '0.875rem 1.25rem', borderTop: '1px solid #1f2937', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div style={{
            width: '1.875rem', height: '1.875rem', borderRadius: '50%',
            background: '#374151', color: '#e5e7eb',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.7rem', fontWeight: 700, flexShrink: 0,
          }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: '0.8125rem', color: '#f9fafb', margin: 0, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name}
            </p>
            <p style={{ fontSize: '0.7rem', color: '#6b7280', margin: 0 }}>Admin</p>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', padding: '0.25rem', display: 'flex', flexShrink: 0, lineHeight: 0 }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#9ca3af')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#6b7280')}
          >
            <IconSignOut />
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, background: '#f9fafb', overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
