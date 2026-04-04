import { useState } from 'react';
import { Link } from 'react-router-dom';

const STACK = [
  { name: 'MongoDB',         role: 'Database',          desc: 'Document store for users, products, orders, and carts.' },
  { name: 'Express',         role: 'REST API',           desc: 'Route handling, middleware, auth, and payment endpoints.' },
  { name: 'React',           role: 'UI Framework',       desc: 'Vite + TypeScript SPA with lazy-loaded routes.' },
  { name: 'Node.js',         role: 'Runtime',            desc: 'Server runtime powering the entire backend.' },
  { name: 'Redux Toolkit',   role: 'State Management',   desc: 'Auth, cart, products, and orders — all in Redux slices.' },
  { name: 'Stripe',          role: 'Card Payments',      desc: 'PaymentIntent flow with idempotent webhook confirmation.' },
  { name: 'Bakong KHQR',    role: 'Local Payments',     desc: 'QR-based payment flow via the NBC Bakong platform.' },
  { name: 'Supabase',        role: 'File Storage',       desc: 'Direct frontend image uploads via signed URLs.' },
  { name: 'Docker',          role: 'Containerisation',   desc: 'Multi-stage Dockerfiles for backend and frontend (Nginx).' },
  { name: 'GitHub Actions',  role: 'CI / CD',            desc: 'Automated build, image push, and deploy pipeline on every push.' },
  { name: 'Coolify',         role: 'Self-hosted Deploy', desc: 'Git-triggered deployments on a self-managed Ubuntu VPS.' },
  { name: 'Cloudflare',      role: 'DNS & Proxy',        desc: 'Domain management, SSL termination, and DDoS protection.' },
];

const TEST_CARDS = [
  {
    status: 'Success',
    statusColor: '#c4845e',
    card: '4242 4242 4242 4242',
    desc: 'Payment succeeds immediately — order is confirmed.',
  },
  {
    status: '3D Auth Required',
    statusColor: '#9a8f85',
    card: '4000 0025 0000 3155',
    desc: 'Triggers Stripe 3D Secure authentication flow.',
  },
  {
    status: 'Declined',
    statusColor: '#6b6b6b',
    card: '4000 0000 0000 9995',
    desc: 'Card is declined — tests error handling and stock release.',
  },
];

const SectionLabel = ({ children }: { children: string }) => (
  <p style={{
    fontFamily: '"DM Sans", sans-serif',
    fontSize: '0.7rem',
    letterSpacing: '0.16em',
    textTransform: 'uppercase',
    color: '#9a8f85',
    marginBottom: '0.75rem',
  }}>
    {children}
  </p>
);

const About = () => {
  const [githubHovered, setGithubHovered] = useState(false);

  return (
    <div style={{ fontFamily: '"DM Sans", sans-serif' }}>

      {/* ── 1. HERO ── */}
      <section style={{
        background: '#0f0f0f',
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '5rem 1.5rem',
        gap: '1rem',
      }}>
        <p style={{
          fontFamily: '"DM Sans", sans-serif',
          fontSize: '0.7rem',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: '#9a8f85',
          animation: 'fadeIn 0.6s ease forwards',
        }}>
          MERN Stack · Portfolio Project
        </p>

        <h1 style={{
          fontFamily: '"Cormorant Garamond", serif',
          fontSize: 'clamp(3rem, 8vw, 5rem)',
          fontWeight: 400,
          color: '#f8f5f1',
          margin: 0,
          letterSpacing: '0.08em',
          animation: 'fadeUp 0.7s ease 0.1s forwards',
          opacity: 0,
        }}>
          About Shopv1
        </h1>

        <div style={{ width: '48px', height: '2px', background: '#c4845e', margin: '0.5rem 0' }} />

        <p style={{
          fontFamily: '"DM Sans", sans-serif',
          fontSize: 'clamp(0.9rem, 2.5vw, 1.05rem)',
          color: '#9a8f85',
          maxWidth: '520px',
          lineHeight: 1.7,
          margin: 0,
          animation: 'fadeUp 0.7s ease 0.2s forwards',
          opacity: 0,
        }}>
          A full-stack e-commerce experience built to demonstrate real-world patterns — not to sell anything.
        </p>
      </section>

      {/* ── 2. DISCLAIMER BANNER ── */}
      <div style={{
        background: '#e8e2d9',
        borderTop: '1px solid rgba(154,143,133,0.3)',
        borderBottom: '1px solid rgba(154,143,133,0.3)',
        padding: '1rem 1.5rem',
        textAlign: 'center',
        animation: 'fadeIn 0.5s ease forwards',
      }}>
        <p style={{
          fontSize: '0.82rem',
          color: '#0f0f0f',
          margin: 0,
          lineHeight: 1.6,
        }}>
          <span style={{ color: '#c4845e', fontWeight: 600, marginRight: '0.5rem' }}>⚠ Demo only.</span>
          This is not a real store. No real transactions are processed. No real products are sold. All data is for demonstration purposes only.
        </p>
      </div>

      {/* ── 3. ABOUT THE PROJECT ── */}
      <section style={{
        background: '#f8f5f1',
        padding: 'clamp(3rem, 8vw, 5rem) 1.5rem',
      }}>
        <div style={{
          maxWidth: '1100px',
          margin: '0 auto',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '3rem',
          alignItems: 'flex-start',
        }}>
          {/* Left */}
          <div style={{ flex: '1 1 340px', animation: 'slideInLeft 0.6s ease forwards' }}>
            <SectionLabel>About</SectionLabel>
            <h2 style={{
              fontFamily: '"Cormorant Garamond", serif',
              fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
              fontWeight: 400,
              color: '#0f0f0f',
              margin: '0 0 1.5rem',
              lineHeight: 1.25,
            }}>
              Built to demonstrate a complete e-commerce system
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#374151', lineHeight: 1.8, marginBottom: '1rem' }}>
              Shopv1 is a portfolio project that presents a production-ready e-commerce application built entirely from scratch. It covers every layer of a modern web stack, including database schema design, JWT-based authentication, payment integration, and cloud-based file storage.
            </p>
            <p style={{ fontSize: '0.9rem', color: '#374151', lineHeight: 1.8, marginBottom: '1rem' }}>
              Users can browse products, add items to their cart as guests or authenticated users, complete a multi-step checkout process, and make payments via Stripe test cards or Bakong KHQR. An admin dashboard enables product management, order tracking, and role-based user control.
            </p>
            <p style={{ fontSize: '0.9rem', color: '#374151', lineHeight: 1.8 }}>
              Target audience: recruiters, developers.
            </p>
          </div>

          {/* Right — pull quote */}
          <div style={{
            flex: '1 1 280px',
            background: '#e8e2d9',
            borderLeft: '3px solid #c4845e',
            padding: '2rem',
            animation: 'slideInRight 0.6s ease forwards',
          }}>
            <blockquote style={{
              fontFamily: '"Cormorant Garamond", serif',
              fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)',
              fontStyle: 'italic',
              color: '#0f0f0f',
              margin: 0,
              lineHeight: 1.6,
            }}>
              "Every feature reflects a real-world requirement — authentication, payments, image storage, inventory reservation, and state management."
            </blockquote>
            <p style={{ marginTop: '1.25rem', fontSize: '0.75rem', color: '#9a8f85', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              — Project goal
            </p>
          </div>
        </div>
      </section>

      {/* ── 4. TECH STACK ── */}
      <section style={{
        background: '#ffffff',
        padding: 'clamp(3rem, 8vw, 5rem) 1.5rem',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <SectionLabel>Built With</SectionLabel>
          <h2 style={{
            fontFamily: '"Cormorant Garamond", serif',
            fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
            fontWeight: 400,
            color: '#0f0f0f',
            margin: '0 0 2.5rem',
          }}>
            The Stack
          </h2>

          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '1rem',
          }}>
            {STACK.map((item, i) => (
              <div
                key={item.name}
                style={{
                  background: '#f8f5f1',
                  border: '1px solid #e8e2d9',
                  padding: '1.5rem 1.25rem',
                  width: '200px',
                  textAlign: 'left',
                  animation: `scaleIn 0.4s ease ${i * 0.06}s forwards`,
                  opacity: 0,
                }}
              >
                <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.65rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#c4845e', margin: '0 0 0.4rem', fontWeight: 600 }}>
                  {item.role}
                </p>
                <p style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '1.25rem', fontWeight: 600, color: '#0f0f0f', margin: '0 0 0.5rem' }}>
                  {item.name}
                </p>
                <p style={{ fontSize: '0.78rem', color: '#9a8f85', lineHeight: 1.6, margin: 0 }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. STRIPE TESTING GUIDE ── */}
      <section style={{
        background: '#f8f5f1',
        padding: 'clamp(3rem, 8vw, 5rem) 1.5rem',
      }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <SectionLabel>Testing</SectionLabel>
          <h2 style={{
            fontFamily: '"Cormorant Garamond", serif',
            fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
            fontWeight: 400,
            color: '#0f0f0f',
            margin: '0 0 0.75rem',
          }}>
            Try the Checkout
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#9a8f85', lineHeight: 1.7, marginBottom: '2rem' }}>
            Use the following Stripe test cards to simulate different payment outcomes.
            Enter any future expiry date and any 3-digit CVC.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
            {TEST_CARDS.map((tc) => (
              <div
                key={tc.card}
                style={{
                  background: '#ffffff',
                  borderLeft: `3px solid ${tc.statusColor}`,
                  padding: '1.1rem 1.25rem',
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  gap: '0.75rem 1.5rem',
                }}
              >
                <span style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: tc.statusColor, minWidth: '110px' }}>
                  {tc.status}
                </span>
                <code style={{
                  fontFamily: 'ui-monospace, "Courier New", monospace',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  color: '#0f0f0f',
                  letterSpacing: '0.12em',
                  background: '#f8f5f1',
                  padding: '0.2rem 0.5rem',
                }}>
                  {tc.card}
                </code>
                <span style={{ fontSize: '0.8rem', color: '#9a8f85', flex: 1, minWidth: '180px' }}>
                  {tc.desc}
                </span>
              </div>
            ))}
          </div>

          <div style={{ background: '#e8e2d9', padding: '0.85rem 1.25rem', fontSize: '0.8rem', color: '#374151', lineHeight: 1.6 }}>
            <strong>Expiry:</strong> any future date (e.g., 12/26) &nbsp;·&nbsp; <strong>CVC:</strong> any 3 digits (e.g., 123) &nbsp;·&nbsp; <strong>Name:</strong> any value
          </div>

          <div style={{ marginTop: '1.5rem', padding: '1.25rem', background: '#ffffff', borderLeft: '3px solid #e8e2d9' }}>
            <p style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0f0f0f', marginBottom: '0.4rem' }}>Bakong KHQR</p>
            <p style={{ fontSize: '0.8rem', color: '#9a8f85', lineHeight: 1.6, margin: 0 }}>
              Select "Bakong QR" at checkout to see the QR payment flow. In test mode the QR is generated but actual payment confirmation requires a Bakong-connected account. Status polling is wired and ready.
            </p>
          </div>
        </div>
      </section>

      {/* ── 6. PRODUCTS DISCLAIMER ── */}
      <section style={{
        background: '#ffffff',
        padding: 'clamp(3rem, 8vw, 5rem) 1.5rem',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', animation: 'fadeIn 0.6s ease forwards' }}>
          <div style={{ width: '40px', height: '2px', background: '#c4845e', margin: '0 auto 2rem' }} />

          <h2 style={{
            fontFamily: '"Cormorant Garamond", serif',
            fontSize: 'clamp(1.6rem, 4vw, 2.2rem)',
            fontWeight: 400,
            color: '#0f0f0f',
            margin: '0 0 1.25rem',
          }}>
            About the Products
          </h2>

          <p style={{ fontSize: '0.9rem', color: '#374151', lineHeight: 1.8, marginBottom: '1rem' }}>
            All product images displayed in Shopv1 are AI-generated using <strong>Google Gemini</strong>. They are purely illustrative and do not represent real items for sale.
          </p>
          <p style={{ fontSize: '0.9rem', color: '#374151', lineHeight: 1.8, marginBottom: '1.5rem' }}>
            Product names, descriptions, prices, and stock quantities are fictional and exist solely to simulate a realistic shopping experience for demonstration purposes.
          </p>

          <p style={{ fontSize: '0.75rem', color: '#9a8f85', fontStyle: 'italic', lineHeight: 1.6 }}>
            Images generated with Google Gemini — not affiliated with or endorsed by Google LLC.
          </p>
        </div>
      </section>

      {/* ── 7. DISCLAIMER & LEGAL ── */}
      <section style={{
        background: '#f8f5f1',
        padding: 'clamp(2.5rem, 6vw, 4rem) 1.5rem',
      }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <SectionLabel>Disclaimer</SectionLabel>
          <h2 style={{
            fontFamily: '"Cormorant Garamond", serif',
            fontSize: 'clamp(1.6rem, 4vw, 2.2rem)',
            fontWeight: 400,
            color: '#0f0f0f',
            margin: '0 0 1.25rem',
          }}>
            Important Notice
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              { title: 'No real commerce', body: 'Shopv1 is a demonstration project. It does not sell real goods or services. Any "purchases" made are test transactions only.' },
              { title: 'No real payments', body: 'All Stripe transactions use Stripe\'s test mode. No real money is charged. Real payment credentials should never be entered here.' },
              { title: 'No data guarantees', body: 'Account data, order history, and cart contents may be reset or cleared at any time without notice as part of development and testing.' },
              { title: 'AI-generated content', body: 'Product images, descriptions, and names are artificially generated and do not represent real brands, people, or products.' },
              { title: 'Third-party services', body: 'Shopv1 integrates Stripe, Bakong KHQR, Supabase, and Google Gemini for demonstration. Their respective terms of service apply to those services.' },
            ].map((item) => (
              <div key={item.title} style={{ background: '#ffffff', padding: '1rem 1.25rem', borderLeft: '2px solid #e8e2d9' }}>
                <p style={{ fontWeight: 600, fontSize: '0.85rem', color: '#0f0f0f', margin: '0 0 0.3rem' }}>{item.title}</p>
                <p style={{ fontSize: '0.82rem', color: '#9a8f85', lineHeight: 1.6, margin: 0 }}>{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 8. GITHUB CTA ── */}
      <section style={{
        background: '#0f0f0f',
        padding: 'clamp(4rem, 10vw, 6rem) 1.5rem',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.25rem',
      }}>
        <SectionLabel>Open Source</SectionLabel>

        <h2 style={{
          fontFamily: '"Cormorant Garamond", serif',
          fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
          fontWeight: 400,
          color: '#f8f5f1',
          margin: 0,
          animation: 'fadeUp 0.6s ease forwards',
        }}>
          View the Source
        </h2>

        <p style={{
          fontSize: '0.88rem',
          color: '#9a8f85',
          maxWidth: '420px',
          lineHeight: 1.7,
          margin: 0,
        }}>
          The full codebase is available on GitHub — frontend, backend, and full TypeScript throughout.
        </p>

        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          onMouseEnter={() => setGithubHovered(true)}
          onMouseLeave={() => setGithubHovered(false)}
          style={{
            marginTop: '0.5rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.6rem',
            padding: '0.8rem 2rem',
            border: `1px solid ${githubHovered ? '#c4845e' : 'rgba(255,255,255,0.25)'}`,
            color: githubHovered ? '#c4845e' : '#f8f5f1',
            textDecoration: 'none',
            fontSize: '0.78rem',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            fontFamily: '"DM Sans", sans-serif',
            fontWeight: 500,
            transition: 'color 0.2s, border-color 0.2s',
            animation: 'scaleIn 0.4s ease 0.15s forwards',
            opacity: 0,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
          </svg>
          View on GitHub
        </a>

        <p style={{ fontSize: '0.72rem', color: '#9a8f85', marginTop: '1rem' }}>
          © {new Date().getFullYear()} Shopv1 · Built for learning, not for profit ·{' '}
          <Link to="/shop" style={{ color: '#c4845e', textDecoration: 'none' }}>Browse the demo →</Link>
        </p>
      </section>

    </div>
  );
};

export default About;
