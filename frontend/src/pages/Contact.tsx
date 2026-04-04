import { useState } from 'react';

const Contact = () => {
  const [githubHovered, setGithubHovered] = useState(false);
  const [telegramHovered, setTelegramHovered] = useState(false);

  return (
    <div style={{ minHeight: '100vh', background: '#f8f5f1' }}>
      {/* Hero */}
      <div
        style={{
          background: '#0f0f0f',
          color: '#f8f5f1',
          padding: 'clamp(3rem, 8vw, 5rem) 1.5rem',
          textAlign: 'center',
        }}
      >
        <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.75rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#9a8f85', marginBottom: '1rem' }}>
          Get in touch
        </p>
        <h1
          style={{
            fontFamily: '"Cormorant Garamond", serif',
            fontSize: 'clamp(2.5rem, 6vw, 4rem)',
            fontWeight: 600,
            margin: '0 auto',
            letterSpacing: '0.02em',
            lineHeight: 1.1,
            maxWidth: '600px',
          }}
        >
          Contact
        </h1>
      </div>

      <div style={{ maxWidth: '680px', margin: '0 auto', padding: 'clamp(2.5rem, 6vw, 4rem) 1.5rem' }}>

        {/* Intro */}
        <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '1rem', color: '#6b6b6b', lineHeight: 1.8, marginBottom: '3rem', textAlign: 'center' }}>
          This is a personal portfolio project. For questions, collaboration ideas, or just to say hi — reach out via GitHub or Telegram.
        </p>

        {/* GitHub card */}
        <div
          style={{
            background: '#fff',
            border: '1.5px solid #e8e2d9',
            borderRadius: '0.75rem',
            padding: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem',
            marginBottom: '2rem',
            flexWrap: 'wrap',
          }}
        >
          {/* GitHub icon */}
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: '#0f0f0f',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="#f8f5f1">
              <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
            </svg>
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9a8f85', margin: '0 0 0.25rem' }}>
              Developer
            </p>
            <p style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '1.4rem', fontWeight: 600, color: '#0f0f0f', margin: '0 0 0.25rem', lineHeight: 1.2 }}>
              vichevong1-coder
            </p>
            <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.8rem', color: '#9a8f85', margin: 0, wordBreak: 'break-all' }}>
              github.com/vichevong1-coder
            </p>
          </div>

          <a
            href="https://github.com/vichevong1-coder"
            target="_blank"
            rel="noopener noreferrer"
            onMouseEnter={() => setGithubHovered(true)}
            onMouseLeave={() => setGithubHovered(false)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: githubHovered ? '#1a1a1a' : '#0f0f0f',
              color: '#f8f5f1',
              textDecoration: 'none',
              fontFamily: '"DM Sans", sans-serif',
              fontWeight: 600,
              fontSize: '0.82rem',
              letterSpacing: '0.04em',
              padding: '0.65rem 1.25rem',
              borderRadius: '0.375rem',
              transition: 'background 0.2s',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
            </svg>
            View Profile
          </a>
        </div>

        {/* Telegram card */}
        <div
          style={{
            background: '#fff',
            border: '1.5px solid #e8e2d9',
            borderRadius: '0.75rem',
            padding: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem',
            marginBottom: '2rem',
            flexWrap: 'wrap',
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: '#229ED9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="#fff">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.17 13.67l-2.94-.918c-.64-.203-.652-.64.135-.954l11.57-4.461c.527-.194.988.131.96.884z" />
            </svg>
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9a8f85', margin: '0 0 0.25rem' }}>
              Telegram
            </p>
            <p style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '1.4rem', fontWeight: 600, color: '#0f0f0f', margin: '0 0 0.25rem', lineHeight: 1.2 }}>
              +885 78 800 449
            </p>
            <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.8rem', color: '#9a8f85', margin: 0 }}>
              Message me on Telegram
            </p>
          </div>

          <a
            href="https://t.me/+88578800449"
            target="_blank"
            rel="noopener noreferrer"
            onMouseEnter={() => setTelegramHovered(true)}
            onMouseLeave={() => setTelegramHovered(false)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: telegramHovered ? '#1a8fbf' : '#229ED9',
              color: '#fff',
              textDecoration: 'none',
              fontFamily: '"DM Sans", sans-serif',
              fontWeight: 600,
              fontSize: '0.82rem',
              letterSpacing: '0.04em',
              padding: '0.65rem 1.25rem',
              borderRadius: '0.375rem',
              transition: 'background 0.2s',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.17 13.67l-2.94-.918c-.64-.203-.652-.64.135-.954l11.57-4.461c.527-.194.988.131.96.884z" />
            </svg>
            Message
          </a>
        </div>

        {/* Note */}
        <div
          style={{
            background: '#fff',
            border: '1px solid #e8e2d9',
            borderRadius: '0.75rem',
            padding: '1.5rem 2rem',
          }}
        >
          <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '1.3rem', fontWeight: 600, color: '#0f0f0f', margin: '0 0 0.75rem' }}>
            About this project
          </h2>
          <ul
            style={{
              fontFamily: '"DM Sans", sans-serif',
              fontSize: '0.85rem',
              color: '#6b6b6b',
              lineHeight: 1.9,
              paddingLeft: '1.25rem',
              margin: 0,
            }}
          >
            <li>This store is a demo — no real transactions are processed</li>
            <li>All product images and descriptions are AI-generated (Gemini)</li>
            <li>Use Stripe test card <code style={{ background: '#f8f5f1', padding: '1px 5px', borderRadius: 3, fontSize: '0.8rem', color: '#0f0f0f' }}>4242 4242 4242 4242</code> to test checkout</li>
            <li>Built with MongoDB, Express, React, Node.js, Stripe & Bakong KHQR</li>
            <li>Open to feedback, bug reports, or collaboration ideas</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Contact;
