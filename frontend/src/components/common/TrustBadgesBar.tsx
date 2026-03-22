const BADGES = [
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <path d="M16 4C9.373 4 4 9.373 4 16s5.373 12 12 12 12-5.373 12-12S22.627 4 16 4z" stroke="currentColor" strokeWidth="1.5" />
        <path d="M11 16.5l3.5 3.5 6.5-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    heading: 'Customer service',
    subtext: 'Mon – Fri, 9am – 5pm',
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <path d="M4 20h18M4 20V13l5-8h10l5 8v7M4 20l-2 6h28l-2-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M22 20v-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="9" cy="26" r="2" fill="currentColor" />
        <circle cx="23" cy="26" r="2" fill="currentColor" />
      </svg>
    ),
    heading: 'Free shipping',
    subtext: 'On all orders over $75',
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <path d="M8 8h16v14a4 4 0 01-4 4h-8a4 4 0 01-4-4V8z" stroke="currentColor" strokeWidth="1.5" />
        <path d="M4 8h24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M12 8V6a4 4 0 018 0v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M16 14v6M13 17l3-3 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    heading: 'Free returns',
    subtext: '30-day hassle-free returns',
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <path d="M16 4l10 4v8c0 6-4 11-10 13C10 27 6 22 6 16V8l10-4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M11.5 16.5l3 3 6-6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    heading: 'Secure payment',
    subtext: '256-bit SSL encryption',
  },
];

const TrustBadgesBar = () => (
  <div
    style={{
      background: '#f8f5f1',
      borderTop: '1px solid #e8e2d9',
      borderBottom: '1px solid #e8e2d9',
      fontFamily: '"DM Sans", sans-serif',
      padding: '2.5rem 1.5rem',
    }}
  >
    <div
      style={{
        maxWidth: '1440px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '2rem',
      }}
    >
      {BADGES.map((badge) => (
        <div
          key={badge.heading}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: '0.75rem',
            padding: '0.5rem',
          }}
        >
          <div style={{ color: '#0f0f0f', opacity: 0.7 }}>{badge.icon}</div>
          <div>
            <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: '#0f0f0f', letterSpacing: '0.02em' }}>
              {badge.heading}
            </p>
            <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: '#9a8f85' }}>
              {badge.subtext}
            </p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default TrustBadgesBar;
