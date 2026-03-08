import type { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { logoutThunk } from '../../redux/slices/authSlice';

const NAV_LINKS = [
  { to: '/admin', label: 'Dashboard', exact: true },
  { to: '/admin/products', label: 'Products', exact: false },
  { to: '/admin/orders', label: 'Orders', exact: false },
  { to: '/admin/users', label: 'Users', exact: false },
];

const AdminLayout = ({ children }: { children: ReactNode }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((s) => s.auth.user);

  const handleLogout = async () => {
    await dispatch(logoutThunk());
    navigate('/auth/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      {/* Sidebar */}
      <aside
        style={{
          width: 220,
          background: '#111827',
          color: '#f9fafb',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
        }}
      >
        <div style={{ padding: '1.5rem 1.25rem', borderBottom: '1px solid #1f2937' }}>
          <span style={{ fontWeight: 700, fontSize: '1rem', letterSpacing: '0.025em' }}>
            Shopv1 Admin
          </span>
        </div>

        <nav style={{ flex: 1, padding: '1rem 0' }}>
          {NAV_LINKS.map(({ to, label, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              style={({ isActive }) => ({
                display: 'block',
                padding: '0.625rem 1.25rem',
                color: isActive ? '#fff' : '#9ca3af',
                background: isActive ? '#1f2937' : 'transparent',
                textDecoration: 'none',
                fontSize: '0.875rem',
                fontWeight: isActive ? 600 : 400,
                borderLeft: isActive ? '3px solid #6366f1' : '3px solid transparent',
                transition: 'color 0.15s, background 0.15s',
              })}
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid #1f2937' }}>
          <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '0 0 0.5rem' }}>
            {user?.name}
          </p>
          <button
            onClick={handleLogout}
            style={{
              background: 'none',
              border: 'none',
              color: '#9ca3af',
              fontSize: '0.8125rem',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            Sign out
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
