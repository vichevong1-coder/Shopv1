const BADGES = [
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect x="4" y="6" width="24" height="20" rx="3" stroke="currentColor" strokeWidth="1.5" />
        <path d="M4 13h24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="16" cy="21" r="3" stroke="currentColor" strokeWidth="1.5" />
        <path d="M16 18v-2M16 24v2M13 21h-2M19 21h2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    ),
    heading: 'Portfolio project',
    subtext: 'Built for demonstration',
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <path d="M16 4C9.373 4 4 9.373 4 16s5.373 12 12 12 12-5.373 12-12S22.627 4 16 4z" stroke="currentColor" strokeWidth="1.5" />
        <path d="M10 16.5l4 4 8-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    heading: 'No real orders',
    subtext: 'Safe to explore freely',
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect x="5" y="9" width="22" height="15" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M5 14h22" stroke="currentColor" strokeWidth="1.5" />
        <path d="M9 18h4M9 21h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M20 17l2 2-2 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    heading: 'Test checkout',
    subtext: '4242 4242 4242 4242',
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect x="4" y="8" width="10" height="16" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="18" y="4" width="10" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="18" y="16" width="10" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M14 12h4M14 20h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    heading: 'MERN stack',
    subtext: 'MongoDB, Express, React, Node.js',
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
