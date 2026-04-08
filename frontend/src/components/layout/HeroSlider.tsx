import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

interface Slide {
  id: number;
  label: string;
  headline: string;
  sub: string;
  cta: string;
  href: string;
  accent: string;
  bg: string;
}

const slides: Slide[] = [
  {
    id: 1,
    label: 'New Season',
    headline: "Men's Collection",
    sub: 'Refined essentials for the modern wardrobe.',
    cta: 'Shop Men',
    href: '/shop/men',
    accent: '#c4845e',
    bg: 'linear-gradient(160deg, #2c2c2c 0%, #1a1a2e 40%, #3d2b1f 100%)',
  },
  {
    id: 2,
    label: 'Just Arrived',
    headline: "Women's Edit",
    sub: 'Curated pieces from the latest drops.',
    cta: 'Shop Women',
    href: '/shop/women',
    accent: '#b07d9a',
    bg: 'linear-gradient(160deg, #1e1a2e 0%, #2e1a2e 50%, #3d1f35 100%)',
  },
  {
    id: 3,
    label: 'Fresh Drops',
    headline: 'Kids & Juniors',
    sub: 'Playful styles built to last.',
    cta: 'Shop Kids',
    href: '/shop/kids',
    accent: '#5e9ac4',
    bg: 'linear-gradient(160deg, #1a2e2c 0%, #1a2e1e 50%, #1f3d2b 100%)',
  },
];

const INTERVAL_MS = 3500;

const HeroSlider = () => {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const advance = () => setActive((i) => (i + 1) % slides.length);

  useEffect(() => {
    if (paused) return;
    intervalRef.current = setInterval(advance, INTERVAL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [paused]);

  const goTo = (idx: number) => {
    setActive(idx);
    // reset timer
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (!paused) {
      intervalRef.current = setInterval(advance, INTERVAL_MS);
    }
  };

  return (
    <div
      style={{ position: 'relative', width: '100%', overflow: 'hidden', transform: 'translateZ(0)' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* slides */}
      <div
        style={{
          display: 'flex',
          transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: `translateX(-${active * 100}%)`,
          willChange: 'transform',
        }}
      >
        {slides.map((slide) => (
          <div
            key={slide.id}
            style={{
              minWidth: '100%',
              height: 'clamp(520px, 90vh, 860px)',
              background: slide.bg,
              display: 'flex',
              alignItems: 'center',
              padding: '0 clamp(1.5rem, 8vw, 8rem)',
              boxSizing: 'border-box',
            }}
          >
            <div style={{ maxWidth: 560 }}>
              {/* label */}
              <p
                style={{
                  fontSize: '0.72rem',
                  fontFamily: '"DM Sans", sans-serif',
                  fontWeight: 500,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: slide.accent,
                  marginBottom: '1rem',
                }}
              >
                {slide.label}
              </p>

              {/* headline */}
              <h1
                style={{
                  fontFamily: '"Cormorant Garamond", serif',
                  fontSize: 'clamp(3rem, 6vw, 5rem)',
                  fontWeight: 500,
                  lineHeight: 1.05,
                  color: '#f8f5f1',
                  margin: '0 0 1.25rem',
                }}
              >
                {slide.headline}
              </h1>

              {/* sub */}
              <p
                style={{
                  fontFamily: '"DM Sans", sans-serif',
                  fontSize: '1rem',
                  fontWeight: 300,
                  color: '#9a8f85',
                  lineHeight: 1.6,
                  marginBottom: '2.5rem',
                  maxWidth: 400,
                }}
              >
                {slide.sub}
              </p>

              {/* CTA */}
              <Link
                to={slide.href}
                style={{
                  display: 'inline-block',
                  fontFamily: '"DM Sans", sans-serif',
                  fontSize: '0.78rem',
                  fontWeight: 500,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: '#f8f5f1',
                  border: `1px solid rgba(248,245,241,0.4)`,
                  padding: '0.75rem 2rem',
                  textDecoration: 'none',
                  transition: 'background 0.2s, border-color 0.2s, color 0.2s',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.background = slide.accent;
                  (e.currentTarget as HTMLAnchorElement).style.borderColor = slide.accent;
                  (e.currentTarget as HTMLAnchorElement).style.color = '#fff';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.background = 'transparent';
                  (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(248,245,241,0.4)';
                  (e.currentTarget as HTMLAnchorElement).style.color = '#f8f5f1';
                }}
              >
                {slide.cta}
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* dot navigation */}
      <div
        style={{
          position: 'absolute',
          bottom: '2rem',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '0.5rem',
          zIndex: 10,
        }}
      >
        {slides.map((slide, idx) => (
          <button
            key={slide.id}
            onClick={() => goTo(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            style={{
              width: idx === active ? '2rem' : '0.5rem',
              height: '0.5rem',
              borderRadius: '9999px',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              background: idx === active ? slides[active].accent : 'rgba(248,245,241,0.35)',
              transition: 'width 0.3s ease, background 0.3s ease',
            }}
          />
        ))}
      </div>

      {/* slide counter */}
      <div
        style={{
          position: 'absolute',
          bottom: '2rem',
          right: 'clamp(1.5rem, 4vw, 4rem)',
          fontFamily: '"DM Sans", sans-serif',
          fontSize: '0.7rem',
          letterSpacing: '0.1em',
          color: 'rgba(248,245,241,0.4)',
          userSelect: 'none',
        }}
      >
        {String(active + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
      </div>
    </div>
  );
};

export default HeroSlider;
