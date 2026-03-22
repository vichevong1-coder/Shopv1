import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import { logoutThunk } from '../../redux/slices/authSlice';
import { useUI } from '../../context/UIContext';

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  {
    label: 'Shop',
    href: '/shop',
    dropdown: [
      { label: 'All Products', href: '/shop' },
      { label: 'Men', href: '/shop/men' },
      { label: 'Women', href: '/shop/women' },
      { label: 'Kids', href: '/shop/kids' },
      { label: 'Hats', href: '/shop/category/hat' },
      { label: 'Shirts', href: '/shop/category/shirt' },
      { label: 'Pants', href: '/shop/category/pant' },
      { label: 'Shoes', href: '/shop/category/shoe' },
      { label: 'Accessories', href: '/shop/category/accessory' },
    ],
  },
  {
    label: 'Features',
    href: '#',
    dropdown: [
      { label: 'New Arrivals', href: '/shop?sort=newest' },
      { label: 'Best Sellers', href: '/shop?sort=popular' },
      { label: 'Sale', href: '/shop?sort=price_asc' },
    ],
  },
  {
    label: 'Pages',
    href: '#',
    dropdown: [
      { label: 'About Us', href: '/about' },
      { label: 'Contact', href: '/contact' },
      { label: 'FAQ', href: '/faq' },
    ],
  },
];

const CURRENCIES = [
  { flag: '🇺🇸', code: 'USD', label: 'US Dollar' },
  { flag: '🇰🇭', code: 'KHR', label: 'Cambodian Riel' },
  { flag: '🇪🇺', code: 'EUR', label: 'Euro' },
  { flag: '🇬🇧', code: 'GBP', label: 'British Pound' },
];

const dropdownStyle: React.CSSProperties = {
  position: 'absolute',
  top: 'calc(100% + 12px)',
  left: 0,
  background: '#ffffff',
  border: '1px solid #e8e2d9',
  boxShadow: '0 12px 40px rgba(0,0,0,0.08)',
  minWidth: '200px',
  zIndex: 300,
  padding: '6px 0',
  animation: 'fadeIn 0.15s ease',
};

const iconBtn: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: '#0f0f0f',
  padding: '6px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'opacity 0.2s',
};

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState(CURRENCIES[0]);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const { openCart, openSearch } = useUI();
  const { user } = useAppSelector((s) => s.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const navRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
        setCurrencyOpen(false);
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const onEnter = (label: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setOpenDropdown(label);
  };
  const onLeave = () => {
    timerRef.current = setTimeout(() => setOpenDropdown(null), 120);
  };

  const handleLogout = () => {
    dispatch(logoutThunk());
    navigate('/auth/login');
    setUserMenuOpen(false);
  };

  const menuLink = (to: string, label: string, onClick?: () => void) => (
    <Link
      to={to}
      onClick={onClick}
      style={{ display: 'block', padding: '0.55rem 1.25rem', color: '#0f0f0f', textDecoration: 'none', fontSize: '0.8rem', transition: 'background 0.12s' }}
      onMouseEnter={e => (e.currentTarget.style.background = '#f8f5f1')}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
    >
      {label}
    </Link>
  );

  return (
    <>
      <header
        ref={navRef}
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 200,
          background: '#ffffff',
          borderBottom: `1px solid ${scrolled ? '#e8e2d9' : 'rgba(232,226,217,0.5)'}`,
          boxShadow: scrolled ? '0 2px 24px rgba(0,0,0,0.05)' : 'none',
          transition: 'box-shadow 0.3s ease, border-color 0.3s ease',
          fontFamily: '"DM Sans", sans-serif',
        }}
      >
        <div
          style={{
            maxWidth: '1440px',
            margin: '0 auto',
            padding: '0 1.5rem',
            height: '64px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          {/* LEFT — nav + mobile hamburger */}
          <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <button
              onClick={() => setMobileOpen(true)}
              style={{ ...iconBtn, gap: '6px', marginRight: '0.5rem', padding: '6px 8px' }}
              aria-label="Menu"
            >
              <svg width="20" height="15" viewBox="0 0 20 15" fill="none">
                <path d="M0 1h20M0 7.5h20M0 14h20" stroke="#0f0f0f" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <span style={{ fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500, display: window.innerWidth > 768 ? 'none' : 'block' }}>Menu</span>
            </button>

            <nav style={{ display: 'flex', alignItems: 'center' }}>
              {NAV_LINKS.map((link) => (
                <div key={link.label} style={{ position: 'relative' }}>
                  {link.dropdown ? (
                    <>
                      <button
                        onMouseEnter={() => onEnter(link.label)}
                        onMouseLeave={onLeave}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#0f0f0f',
                          fontSize: '0.75rem',
                          letterSpacing: '0.09em',
                          textTransform: 'uppercase',
                          fontWeight: 500,
                          padding: '0 0.8rem',
                          height: '64px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontFamily: 'inherit',
                          whiteSpace: 'nowrap',
                          transition: 'opacity 0.2s',
                        }}
                        onMouseDown={() => navigate(link.href)}
                      >
                        {link.label}
                        <svg width="9" height="5" viewBox="0 0 9 5" fill="none" style={{ transition: 'transform 0.2s', transform: openDropdown === link.label ? 'rotate(180deg)' : 'none' }}>
                          <path d="M1 1l3.5 3 3.5-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                        </svg>
                      </button>
                      {openDropdown === link.label && (
                        <div
                          onMouseEnter={() => onEnter(link.label)}
                          onMouseLeave={onLeave}
                          style={dropdownStyle}
                        >
                          {link.dropdown.map((item) => (
                            <Link
                              key={item.href}
                              to={item.href}
                              onClick={() => setOpenDropdown(null)}
                              style={{ display: 'block', padding: '0.6rem 1.25rem', color: '#0f0f0f', textDecoration: 'none', fontSize: '0.8rem', letterSpacing: '0.03em', transition: 'background 0.12s' }}
                              onMouseEnter={e => (e.currentTarget.style.background = '#f8f5f1')}
                              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                            >
                              {item.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      to={link.href}
                      style={{
                        textDecoration: 'none',
                        color: '#0f0f0f',
                        fontSize: '0.75rem',
                        letterSpacing: '0.09em',
                        textTransform: 'uppercase',
                        fontWeight: 500,
                        padding: '0 0.8rem',
                        height: '64px',
                        display: 'flex',
                        alignItems: 'center',
                        whiteSpace: 'nowrap',
                        transition: 'opacity 0.2s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.opacity = '0.5')}
                      onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                    >
                      {link.label}
                    </Link>
                  )}
                </div>
              ))}
            </nav>
          </div>

          {/* CENTER — Logo */}
          <div style={{ flexShrink: 0 }}>
            <Link
              to="/"
              style={{
                textDecoration: 'none',
                fontFamily: '"Cormorant Garamond", serif',
                fontSize: '1.55rem',
                fontWeight: 600,
                color: '#0f0f0f',
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                lineHeight: 1,
                display: 'block',
              }}
            >
              Shopv1
            </Link>
          </div>

          {/* RIGHT — utilities */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '2px', flex: 1, justifyContent: 'flex-end' }}>
            {/* Currency */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => { setCurrencyOpen(v => !v); setUserMenuOpen(false); }}
                style={{ ...iconBtn, fontSize: '0.7rem', letterSpacing: '0.06em', gap: '4px', padding: '6px 8px', fontFamily: 'inherit' }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.5')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                <span style={{ fontSize: '0.9rem' }}>{selectedCurrency.flag}</span>
                <span>{selectedCurrency.code} $</span>
                <svg width="8" height="5" viewBox="0 0 8 5" fill="none" style={{ transition: 'transform 0.2s', transform: currencyOpen ? 'rotate(180deg)' : 'none' }}>
                  <path d="M1 1l3 3 3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
              </button>
              {currencyOpen && (
                <div style={{ ...dropdownStyle, left: 'auto', right: 0, minWidth: '210px' }}>
                  {CURRENCIES.map((c) => (
                    <button
                      key={c.code}
                      onClick={() => { setSelectedCurrency(c); setCurrencyOpen(false); }}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', width: '100%', padding: '0.6rem 1.25rem', background: c.code === selectedCurrency.code ? '#f8f5f1' : 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', color: '#0f0f0f', fontFamily: 'inherit', textAlign: 'left', transition: 'background 0.12s' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#f8f5f1')}
                      onMouseLeave={e => (e.currentTarget.style.background = c.code === selectedCurrency.code ? '#f8f5f1' : 'transparent')}
                    >
                      <span style={{ fontSize: '1rem' }}>{c.flag}</span>
                      <span>{c.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Language */}
            <button style={{ ...iconBtn, fontSize: '0.7rem', letterSpacing: '0.06em', padding: '6px 8px', fontFamily: 'inherit', fontWeight: 500 }} onMouseEnter={e => (e.currentTarget.style.opacity = '0.5')} onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>EN</button>

            {/* Search */}
            <button onClick={openSearch} style={iconBtn} aria-label="Search" onMouseEnter={e => (e.currentTarget.style.opacity = '0.5')} onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <circle cx="7.5" cy="7.5" r="5.5" stroke="currentColor" strokeWidth="1.4" />
                <path d="M11.5 11.5l4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            </button>

            {/* Account */}
            {user ? (
              <div style={{ position: 'relative' }}>
                <button onClick={() => { setUserMenuOpen(v => !v); setCurrencyOpen(false); }} style={iconBtn} aria-label="Account" onMouseEnter={e => (e.currentTarget.style.opacity = '0.5')} onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <circle cx="9" cy="5.5" r="3.5" stroke="currentColor" strokeWidth="1.4" />
                    <path d="M2 16c0-3.866 3.134-7 7-7s7 3.134 7 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                </button>
                {userMenuOpen && (
                  <div style={{ ...dropdownStyle, left: 'auto', right: 0, minWidth: '190px' }}>
                    <div style={{ padding: '0.75rem 1.25rem 0.6rem', borderBottom: '1px solid #e8e2d9', marginBottom: '4px' }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>{user.name}</div>
                      <div style={{ fontSize: '0.72rem', color: '#9a8f85', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</div>
                    </div>
                    {menuLink('/profile', 'My Profile', () => setUserMenuOpen(false))}
                    {menuLink('/profile/orders', 'Order History', () => setUserMenuOpen(false))}
                    {user.role === 'admin' && (
                      <Link to="/admin" onClick={() => setUserMenuOpen(false)} style={{ display: 'block', padding: '0.55rem 1.25rem', color: '#c4845e', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 500, transition: 'background 0.12s' }} onMouseEnter={e => (e.currentTarget.style.background = '#f8f5f1')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>Admin Panel</Link>
                    )}
                    <div style={{ borderTop: '1px solid #e8e2d9', marginTop: '4px' }}>
                      <button onClick={handleLogout} style={{ display: 'block', width: '100%', padding: '0.55rem 1.25rem', background: 'none', border: 'none', color: '#9a8f85', fontSize: '0.8rem', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.12s' }} onMouseEnter={e => (e.currentTarget.style.background = '#f8f5f1')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>Sign Out</button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/auth/login" style={iconBtn as React.CSSProperties} aria-label="Sign in" onMouseEnter={e => ((e.currentTarget as HTMLElement).style.opacity = '0.5')} onMouseLeave={e => ((e.currentTarget as HTMLElement).style.opacity = '1')}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <circle cx="9" cy="5.5" r="3.5" stroke="currentColor" strokeWidth="1.4" />
                  <path d="M2 16c0-3.866 3.134-7 7-7s7 3.134 7 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
              </Link>
            )}

            {/* Cart */}
            <button onClick={openCart} style={iconBtn} aria-label="Cart" onMouseEnter={e => (e.currentTarget.style.opacity = '0.5')} onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M1 1.5h2.2l2.4 9.6a1 1 0 001 .75h7.6a1 1 0 00.96-.73L17 5.5H4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="7" cy="15.5" r="1.2" fill="currentColor" />
                <circle cx="13.5" cy="15.5" r="1.2" fill="currentColor" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 400, display: 'flex' }}>
          <div
            style={{
              width: '320px',
              maxWidth: '88vw',
              background: '#ffffff',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              animation: 'slideInLeft 0.28s ease',
              boxShadow: '4px 0 40px rgba(0,0,0,0.1)',
              fontFamily: '"DM Sans", sans-serif',
              overflowY: 'auto',
            }}
          >
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e8e2d9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '1.3rem', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase' }}>Shopv1</span>
              <button onClick={() => setMobileOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex' }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M1 1l14 14M15 1L1 15" stroke="#0f0f0f" strokeWidth="1.4" strokeLinecap="round" /></svg>
              </button>
            </div>

            <nav style={{ flex: 1 }}>
              {NAV_LINKS.map((link) => (
                <div key={link.label}>
                  <Link
                    to={link.href === '#' ? '/' : link.href}
                    onClick={() => setMobileOpen(false)}
                    style={{ display: 'block', padding: '0.9rem 1.5rem', color: '#0f0f0f', textDecoration: 'none', fontSize: '0.78rem', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500, borderBottom: '1px solid rgba(232,226,217,0.6)' }}
                  >
                    {link.label}
                  </Link>
                  {link.dropdown && (
                    <div style={{ background: '#f8f5f1' }}>
                      {link.dropdown.map((item) => (
                        <Link key={item.href} to={item.href} onClick={() => setMobileOpen(false)} style={{ display: 'block', padding: '0.65rem 2rem', color: '#374151', textDecoration: 'none', fontSize: '0.78rem', borderBottom: '1px solid rgba(232,226,217,0.4)' }}>
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>

            <div style={{ padding: '1.25rem 1.5rem', borderTop: '1px solid #e8e2d9' }}>
              {user ? (
                <>
                  <div style={{ fontSize: '0.78rem', color: '#9a8f85', marginBottom: '0.75rem' }}>Signed in as {user.name}</div>
                  <button onClick={handleLogout} style={{ background: 'none', border: '1px solid #e8e2d9', padding: '0.55rem 1rem', cursor: 'pointer', fontSize: '0.78rem', fontFamily: 'inherit', width: '100%', color: '#0f0f0f' }}>Sign Out</button>
                </>
              ) : (
                <Link to="/auth/login" onClick={() => setMobileOpen(false)} style={{ display: 'block', textAlign: 'center', padding: '0.7rem', background: '#0f0f0f', color: '#ffffff', textDecoration: 'none', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500 }}>Sign In</Link>
              )}
            </div>
          </div>
          <div onClick={() => setMobileOpen(false)} style={{ flex: 1, background: 'rgba(0,0,0,0.35)' }} />
        </div>
      )}
    </>
  );
};

export default Navbar;
