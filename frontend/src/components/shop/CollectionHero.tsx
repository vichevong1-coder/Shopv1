import { Link } from 'react-router-dom';

const CATEGORY_TABS = [
  { label: 'All', href: '/shop' },
  { label: 'Clothing', href: '/shop/category/shirt' },
  { label: 'Bottoms', href: '/shop/category/pant' },
  { label: 'Shoes', href: '/shop/category/shoe' },
  { label: 'Accessories', href: '/shop/category/accessory' },
  { label: 'Hats', href: '/shop/category/hat' },
];

interface CollectionHeroProps {
  title?: string;
  breadcrumbs?: { label: string; href?: string }[];
  activeCategory?: string;
  backgroundImage?: string;
}

const CollectionHero = ({
  title = 'Products',
  breadcrumbs = [{ label: 'Home', href: '/' }, { label: 'Shop', href: '/shop' }, { label: 'Products' }],
  activeCategory,
  backgroundImage,
}: CollectionHeroProps) => {
  const defaultBg =
    'linear-gradient(160deg, #2c2c2c 0%, #1a1a2e 40%, #3d2b1f 100%)';

  return (
    <section
      style={{
        position: 'relative',
        height: '420px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        fontFamily: '"DM Sans", sans-serif',
      }}
    >
      {/* Background */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: backgroundImage ? `url(${backgroundImage}) center/cover no-repeat` : defaultBg,
          zIndex: 0,
        }}
      />
      {/* Dark overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.5) 100%)',
          zIndex: 1,
        }}
      />

      {/* Content */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
          padding: '0 1.5rem',
          width: '100%',
          animation: 'fadeUp 0.4s ease',
        }}
      >
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb">
          <ol
            style={{
              display: 'flex',
              gap: '0.5rem',
              listStyle: 'none',
              margin: 0,
              padding: 0,
              alignItems: 'center',
            }}
          >
            {breadcrumbs.map((crumb, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {i > 0 && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ opacity: 0.5 }}>
                    <path d="M4 2l4 4-4 4" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
                  </svg>
                )}
                {crumb.href ? (
                  <Link
                    to={crumb.href}
                    style={{
                      color: 'rgba(255,255,255,0.75)',
                      textDecoration: 'none',
                      fontSize: '0.72rem',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      fontWeight: 400,
                      transition: 'color 0.2s',
                    }}
                    onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = 'white')}
                    onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.75)')}
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span
                    style={{
                      color: 'rgba(255,255,255,0.9)',
                      fontSize: '0.72rem',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      fontWeight: 400,
                    }}
                  >
                    {crumb.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>

        {/* Title */}
        <h1
          style={{
            fontFamily: '"Cormorant Garamond", serif',
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            fontWeight: 500,
            color: '#ffffff',
            letterSpacing: '0.06em',
            margin: 0,
            textAlign: 'center',
            lineHeight: 1.1,
            textShadow: '0 2px 20px rgba(0,0,0,0.3)',
          }}
        >
          {title}
        </h1>

        {/* Category tabs */}
        <nav style={{ marginTop: '0.5rem' }} aria-label="Category filter">
          <ul
            style={{
              display: 'flex',
              gap: '0',
              listStyle: 'none',
              margin: 0,
              padding: 0,
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            {CATEGORY_TABS.map((tab) => {
              const isActive =
                !activeCategory ? tab.label === 'All'
                : tab.label.toLowerCase() === activeCategory.toLowerCase();
              return (
                <li key={tab.label}>
                  <Link
                    to={tab.href}
                    style={{
                      display: 'block',
                      padding: '0.4rem 1rem',
                      color: isActive ? '#ffffff' : 'rgba(255,255,255,0.65)',
                      textDecoration: 'none',
                      fontSize: '0.75rem',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      fontWeight: isActive ? 600 : 400,
                      borderBottom: isActive ? '2px solid rgba(255,255,255,0.9)' : '2px solid transparent',
                      paddingBottom: '0.4rem',
                      transition: 'color 0.2s, border-color 0.2s',
                    }}
                    onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.9)'; }}
                    onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.65)'; }}
                  >
                    {tab.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </section>
  );
};

export default CollectionHero;
