import type { AdminUser } from '../../api/admin';

const initials = (name: string) =>
  name
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');

const thBase: React.CSSProperties = {
  textAlign: 'left',
  padding: '0.75rem 1rem',
  fontWeight: 600,
  color: '#6b7280',
  fontSize: '0.75rem',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  whiteSpace: 'nowrap',
};

interface Props {
  users: AdminUser[];
}

const UsersTable = ({ users }: Props) => {
  if (!users.length) {
    return (
      <div style={{ padding: '3.5rem 2rem', textAlign: 'center', color: '#6b7280', fontSize: '0.875rem' }}>
        No users found.
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
        <thead>
          <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
            <th style={thBase}>User</th>
            <th style={thBase}>Email</th>
            <th style={thBase}>Role</th>
            <th style={thBase}>Joined</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const isAdmin = user.role === 'admin';
            return (
              <tr
                key={user.id}
                style={{ borderBottom: '1px solid #f3f4f6', transition: 'background 0.1s' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#f9fafb'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = ''; }}
              >
                {/* Avatar + Name */}
                <td style={{ padding: '0.75rem 1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          background: isAdmin ? '#eef2ff' : '#f3f4f6',
                          color: isAdmin ? '#4338ca' : '#6b7280',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        {initials(user.name)}
                      </div>
                    )}
                    <span style={{ fontWeight: 500 }}>{user.name}</span>
                  </div>
                </td>

                {/* Email */}
                <td style={{ padding: '0.75rem 1rem', color: '#6b7280', fontSize: '0.8125rem' }}>
                  {user.email}
                </td>

                {/* Role badge */}
                <td style={{ padding: '0.75rem 1rem' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '0.15rem 0.6rem',
                      borderRadius: '9999px',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      background: isAdmin ? '#eef2ff' : '#f3f4f6',
                      color: isAdmin ? '#4338ca' : '#6b7280',
                    }}
                  >
                    {user.role}
                  </span>
                </td>

                {/* Joined */}
                <td style={{ padding: '0.75rem 1rem', color: '#9ca3af', fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>
                  {new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default UsersTable;
