import { useState, useEffect } from 'react';

const ScrollToTopButton = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Scroll to top"
      style={{
        position: 'fixed',
        bottom: '1.75rem',
        right: '1.75rem',
        width: '42px',
        height: '42px',
        background: '#0f0f0f',
        color: '#ffffff',
        border: 'none',
        borderRadius: '50%',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 400,
        boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
        animation: 'fadeIn 0.2s ease',
        transition: 'background 0.2s, transform 0.2s',
        fontFamily: '"DM Sans", sans-serif',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = '#2a2a2a'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = '#0f0f0f'; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M7 12V2M2 7l5-5 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
};

export default ScrollToTopButton;
