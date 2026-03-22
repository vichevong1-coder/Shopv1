import { useState } from 'react';
import { Link } from 'react-router-dom';

const FOOTER_LINKS = {
  Company: [
    { label: 'About Us', href: '/about' },
    { label: 'Contact', href: '/contact' },
    { label: 'Sustainability', href: '/sustainability' },
    { label: 'Stores', href: '/stores' },
  ],
  Collections: [
    { label: 'All Products', href: '/shop' },
    { label: 'Clothing', href: '/shop/category/shirt' },
    { label: 'Bottoms', href: '/shop/category/pant' },
    { label: 'Shoes', href: '/shop/category/shoe' },
    { label: 'Accessories', href: '/shop/category/accessory' },
    { label: 'Outerwear', href: '/shop' },
  ],
  Support: [
    { label: 'Refund Policy', href: '/refund-policy' },
    { label: 'Privacy Policy', href: '/privacy-policy' },
    { label: 'Shipping Policy', href: '/shipping-policy' },
    { label: 'Terms of Service', href: '/terms' },
  ],
};

const SOCIAL = [
  { name: 'Facebook', href: '#', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" /></svg> },
  { name: 'Instagram', href: '#', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg> },
  { name: 'YouTube', href: '#', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 00-1.95 1.96A29 29 0 001 12a29 29 0 00.46 5.58A2.78 2.78 0 003.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.95A29 29 0 0023 12a29 29 0 00-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z" /></svg> },
  { name: 'TikTok', href: '#', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.77 1.52V6.72a4.85 4.85 0 01-1-.03z" /></svg> },
  { name: 'X', href: '#', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg> },
  { name: 'Pinterest', href: '#', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" /></svg> },
];

const PAYMENT_ICONS = ['Visa', 'Mastercard', 'Amex', 'PayPal', 'Discover'];

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
    }
  };

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
        {/* Brand */}
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
          <p
            style={{
              fontSize: '0.8rem',
              color: '#9a8f85',
              lineHeight: 1.7,
              maxWidth: '220px',
            }}
          >
            Thoughtfully crafted essentials for the modern wardrobe. Quality over quantity, always. Powered by Shopv1.
          </p>
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

        {/* Newsletter */}
        <div>
          <h3
            style={{
              fontSize: '0.7rem',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              fontWeight: 600,
              color: '#f8f5f1',
              marginBottom: '0.6rem',
            }}
          >
            Subscribe to our emails
          </h3>
          <p style={{ fontSize: '0.78rem', color: '#9a8f85', lineHeight: 1.6, marginBottom: '1rem' }}>
            Be the first to know about new collections and exclusive offers.
          </p>

          {subscribed ? (
            <p style={{ fontSize: '0.8rem', color: '#c4845e', fontWeight: 500 }}>Thanks for subscribing!</p>
          ) : (
            <form onSubmit={handleSubscribe}>
              <div style={{ display: 'flex', border: '1px solid rgba(255,255,255,0.15)', overflow: 'hidden' }}>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Your email"
                  required
                  style={{
                    flex: 1,
                    padding: '0.6rem 0.75rem',
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: '#f8f5f1',
                    fontSize: '0.8rem',
                    fontFamily: 'inherit',
                    minWidth: 0,
                  }}
                />
                <button
                  type="submit"
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0.6rem 0.75rem',
                    color: '#f8f5f1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background 0.2s',
                    flexShrink: 0,
                  }}
                  aria-label="Subscribe"
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M2 8h12M9 3l5 5-5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </form>
          )}

          <p style={{ fontSize: '0.68rem', color: '#9a8f85', marginTop: '0.6rem', lineHeight: 1.5 }}>
            By subscribing you agree to our{' '}
            <Link to="/privacy-policy" style={{ color: '#9a8f85', textDecoration: 'underline' }}>Privacy Policy</Link>
            {' '}and{' '}
            <Link to="/terms" style={{ color: '#9a8f85', textDecoration: 'underline' }}>Terms</Link>.
          </p>

          {/* Social */}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
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
          {['Privacy policy', 'Terms of service', 'Refund policy', 'Shipping policy'].map((t) => (
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
