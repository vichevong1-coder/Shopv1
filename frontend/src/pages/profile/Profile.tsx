import { Link } from 'react-router-dom';
import { useAppSelector } from '../../redux/hooks';

const NAV_LINKS = [
  { to: '/profile', label: 'Account' },
  { to: '/profile/orders', label: 'Order History' },
];

const Profile = () => {
  const { user } = useAppSelector((s) => s.auth);
  if (!user) return null;

  const initials = user.name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div style={{ minHeight: '100vh', background: '#f8f5f1' }}>
      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e8e2d9', padding: '1.25rem 2rem' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto' }}>
          <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '1.4rem', fontWeight: 600, color: '#0f0f0f', margin: 0 }}>
            My Account
          </h1>
        </div>
      </div>

      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '2rem 1.5rem', display: 'grid', gridTemplateColumns: '200px 1fr', gap: '2rem', alignItems: 'start' }}>
        {/* Sidebar nav */}
        <div style={{ background: '#fff', borderRadius: '0.75rem', border: '1.5px solid #e8e2d9', overflow: 'hidden' }}>
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              style={{
                display: 'block',
                padding: '0.875rem 1.25rem',
                fontFamily: '"DM Sans", sans-serif',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: '#0f0f0f',
                textDecoration: 'none',
                borderBottom: '1px solid #e8e2d9',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#f8f5f1')}
              onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Account info card */}
        <div style={{ background: '#fff', borderRadius: '0.75rem', border: '1.5px solid #e8e2d9', padding: '2rem' }}>
          {/* Avatar + name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '2rem' }}>
            <div style={{
              width: '3.5rem',
              height: '3.5rem',
              borderRadius: '50%',
              background: '#0f0f0f',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: '"DM Sans", sans-serif',
              fontWeight: 700,
              fontSize: '1.1rem',
              flexShrink: 0,
            }}>
              {initials}
            </div>
            <div>
              <p style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '1.3rem', fontWeight: 600, color: '#0f0f0f', margin: 0 }}>
                {user.name}
              </p>
              <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.85rem', color: '#9a8f85', margin: '0.2rem 0 0' }}>
                {user.role === 'admin' ? 'Administrator' : 'Customer'}
              </p>
            </div>
          </div>

          {/* Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { label: 'Name', value: user.name },
              { label: 'Email', value: user.email },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.72rem', fontWeight: 600, color: '#9a8f85', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  {label}
                </span>
                <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.9rem', color: '#0f0f0f' }}>
                  {value}
                </span>
              </div>
            ))}
          </div>

          <div style={{ height: '1px', background: '#e8e2d9', margin: '1.5rem 0' }} />

          <Link
            to="/profile/orders"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontFamily: '"DM Sans", sans-serif', fontSize: '0.875rem', fontWeight: 600, color: '#c4845e', textDecoration: 'none' }}
          >
            View Order History →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Profile;
