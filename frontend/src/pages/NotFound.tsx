import { Link } from 'react-router-dom';

const NotFound = () => (
  <div
    style={{
      minHeight: '70vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      textAlign: 'center',
      fontFamily: '"DM Sans", sans-serif',
    }}
  >
    <p
      style={{
        fontFamily: '"Cormorant Garamond", serif',
        fontSize: '6rem',
        fontWeight: 700,
        color: '#e8e2d9',
        margin: '0 0 0.25rem',
        lineHeight: 1,
      }}
    >
      404
    </p>
    <h1
      style={{
        fontFamily: '"Cormorant Garamond", serif',
        fontSize: '2rem',
        fontWeight: 600,
        color: '#0f0f0f',
        margin: '0 0 0.75rem',
      }}
    >
      Page not found
    </h1>
    <p
      style={{
        color: '#9a8f85',
        fontSize: '0.9rem',
        maxWidth: '340px',
        margin: '0 0 2rem',
        lineHeight: 1.6,
      }}
    >
      The page you're looking for doesn't exist or has been moved.
    </p>
    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
      <Link
        to="/shop"
        style={{
          padding: '0.625rem 1.5rem',
          background: '#0f0f0f',
          color: '#fff',
          textDecoration: 'none',
          borderRadius: '0.375rem',
          fontFamily: '"DM Sans", sans-serif',
          fontWeight: 600,
          fontSize: '0.875rem',
          letterSpacing: '0.04em',
        }}
      >
        Browse Shop
      </Link>
      <Link
        to="/"
        style={{
          padding: '0.625rem 1.5rem',
          background: 'transparent',
          color: '#0f0f0f',
          textDecoration: 'none',
          border: '1.5px solid #e8e2d9',
          borderRadius: '0.375rem',
          fontFamily: '"DM Sans", sans-serif',
          fontWeight: 600,
          fontSize: '0.875rem',
        }}
      >
        Go Home
      </Link>
    </div>
  </div>
);

export default NotFound;
