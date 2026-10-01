import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import { useUI } from '../../context/UIContext';
import { updateProfile } from '../../api/auth';
import { setUser } from '../../redux/slices/authSlice';
import Spinner from '../../components/common/Spinner';

const NAV_LINKS = [
  { to: '/profile', label: 'Account' },
  { to: '/profile/orders', label: 'Order History' },
];

const Profile = () => {
  const dispatch = useAppDispatch();
  const { showToast } = useUI();
  const { user } = useAppSelector((s) => s.auth);
  
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);

  if (!user) return null;

  const initials = user.name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword && !currentPassword) {
      return showToast('Current password is required to set a new password', 'error');
    }

    setSaving(true);
    try {
      const res = await updateProfile({
        name: name !== user.name ? name : undefined,
        currentPassword: currentPassword || undefined,
        newPassword: newPassword || undefined
      });
      dispatch(setUser(res.user));
      showToast('Profile updated successfully', 'success');
      setIsEditing(false);
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ background: '#f8f5f1', minHeight: '100vh' }}>
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
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
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                style={{ background: 'none', border: 'none', color: '#c4845e', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}
              >
                Edit Profile
              </button>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontFamily: '"DM Sans", sans-serif', fontSize: '0.72rem', fontWeight: 600, color: '#9a8f85', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', fontSize: '0.9rem', border: '1px solid #e8e2d9', borderRadius: '0.375rem', outline: 'none' }}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontFamily: '"DM Sans", sans-serif', fontSize: '0.72rem', fontWeight: 600, color: '#9a8f85', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  style={{ width: '100%', padding: '0.75rem', fontSize: '0.9rem', border: '1px solid #e8e2d9', borderRadius: '0.375rem', background: '#f8f5f1', color: '#6b7280', cursor: 'not-allowed', outline: 'none' }}
                />
                <span style={{ fontSize: '0.75rem', color: '#9a8f85', marginTop: '0.25rem', display: 'block' }}>Email cannot be changed for security reasons.</span>
              </div>
              
              <div style={{ height: '1px', background: '#e8e2d9', margin: '0.5rem 0' }} />
              
              <h3 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '1.1rem', margin: '0' }}>Change Password (Optional)</h3>
              
              <div>
                <label style={{ display: 'block', fontFamily: '"DM Sans", sans-serif', fontSize: '0.72rem', fontWeight: 600, color: '#9a8f85', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Leave blank to keep current"
                  style={{ width: '100%', padding: '0.75rem', fontSize: '0.9rem', border: '1px solid #e8e2d9', borderRadius: '0.375rem', outline: 'none' }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', fontFamily: '"DM Sans", sans-serif', fontSize: '0.72rem', fontWeight: 600, color: '#9a8f85', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  style={{ width: '100%', padding: '0.75rem', fontSize: '0.9rem', border: '1px solid #e8e2d9', borderRadius: '0.375rem', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button
                  type="submit"
                  disabled={saving}
                  style={{ background: '#0f0f0f', color: '#fff', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '0.375rem', fontWeight: 600, cursor: 'pointer', flex: 1, display: 'flex', justifyContent: 'center' }}
                >
                  {saving ? <Spinner size="sm" /> : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  disabled={saving}
                  style={{ background: '#f8f5f1', color: '#0f0f0f', border: '1px solid #e8e2d9', padding: '0.75rem 1.5rem', borderRadius: '0.375rem', fontWeight: 600, cursor: 'pointer', flex: 1 }}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {[
                { label: 'Name', value: user.name },
                { label: 'Email', value: user.email },
                { label: 'Password', value: '••••••••' }
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
          )}

          <div style={{ height: '1px', background: '#e8e2d9', margin: '2rem 0' }} />

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
