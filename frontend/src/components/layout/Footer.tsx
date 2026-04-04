import { Link } from 'react-router-dom';

const FOOTER_LINKS = {
  Company: [
    { label: 'About Us', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ],
  Collections: [
    { label: 'All Products', href: '/shop' },
    { label: 'Clothing', href: '/shop/category/shirt' },
    { label: 'Bottoms', href: '/shop/category/pant' },
    { label: 'Shoes', href: '/shop/category/shoe' },
    { label: 'Accessories', href: '/shop/category/accessory' },
  ],
  Support: [
    { label: 'Privacy Policy', href: '/privacy-policy' },
    { label: 'Terms of Service', href: '/terms' },
  ],
};

const SOCIAL = [
  {
    name: 'GitHub',
    href: '#',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
      </svg>
    ),
  },
  {
    name: 'Email',
    href: 'mailto:contact@vongshop.com',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="M2 7l10 7 10-7" />
      </svg>
    ),
  },
  {
    name: 'Instagram',
    href: '#',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    ),
  },
];

const PAYMENT_ICONS = ['Visa', 'Mastercard', 'Amex', 'PayPal'];

const Footer = () => {
  const linkStyle: React.CSSProperties = {
    color: '#9a8f85',
    textDecoration: 'none',
    fontSize: '0.82rem',
    lineHeight: 1.8,
    display: 'block',
    transition: 'color 0.2s',
  };

  return (
    <footer
      style={{
        background: '#0f0f0f',
        color: '#f8f5f1',
        fontFamily: '"DM Sans", sans-serif',
        marginTop: 'auto',
      }}
    >
      {/* Main footer grid */}
      <div
        style={{
          maxWidth: '1440px',
          margin: '0 auto',
          padding: '4rem 1.5rem 2.5rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '2.5rem',
        }}
      >
        {/* Brand + Social */}
        <div style={{ gridColumn: 'span 1' }}>
          <Link
            to="/"
            style={{
              textDecoration: 'none',
              fontFamily: '"Cormorant Garamond", serif',
              fontSize: '1.5rem',
              fontWeight: 600,
              color: '#f8f5f1',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              display: 'block',
              marginBottom: '1rem',
              lineHeight: 1,
            }}
          >
            Shopv1
          </Link>
          <p style={{ fontSize: '0.8rem', color: '#9a8f85', lineHeight: 1.7, maxWidth: '220px', marginBottom: '1.25rem' }}>
            Thoughtfully crafted essentials for the modern wardrobe. Quality over quantity, always.
          </p>

          {/* Social icons */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {SOCIAL.map((s) => (
              <a
                key={s.name}
                href={s.href}
                aria-label={s.name}
                style={{ color: '#9a8f85', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'color 0.2s' }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#f8f5f1')}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#9a8f85')}
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Link columns */}
        {Object.entries(FOOTER_LINKS).map(([title, links]) => (
          <div key={title}>
            <h3
              style={{
                fontSize: '0.7rem',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                fontWeight: 600,
                color: '#f8f5f1',
                marginBottom: '1rem',
              }}
            >
              {title}
            </h3>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    style={linkStyle}
                    onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#f8f5f1')}
                    onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#9a8f85')}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div
        style={{
          borderTop: '1px solid rgba(255,255,255,0.08)',
          padding: '1.25rem 1.5rem',
          maxWidth: '1440px',
          margin: '0 auto',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.72rem', color: '#9a8f85' }}>
            © {new Date().getFullYear()} Shopv1 · All rights reserved
          </span>
          {['Privacy policy', 'Terms of service'].map((t) => (
            <Link
              key={t}
              to={`/${t.toLowerCase().replace(/\s+/g, '-')}`}
              style={{ fontSize: '0.72rem', color: '#9a8f85', textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#f8f5f1')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#9a8f85')}
            >
              {t}
            </Link>
          ))}
        </div>

        {/* Payment icons */}
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          {PAYMENT_ICONS.map((name) => (
            <div
              key={name}
              title={name}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.08)',
                padding: '3px 7px',
                fontSize: '0.6rem',
                color: '#9a8f85',
                letterSpacing: '0.04em',
                fontWeight: 600,
                borderRadius: '2px',
              }}
            >
              {name.toUpperCase()}
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
