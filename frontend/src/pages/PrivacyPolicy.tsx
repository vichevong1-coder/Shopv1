const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div style={{ marginBottom: '2.5rem' }}>
    <h2
      style={{
        fontFamily: '"Cormorant Garamond", serif',
        fontSize: 'clamp(1.2rem, 2vw, 1.5rem)',
        fontWeight: 500,
        color: '#111827',
        marginBottom: '0.75rem',
      }}
    >
      {title}
    </h2>
    <div
      style={{
        fontFamily: '"DM Sans", sans-serif',
        fontSize: '0.9rem',
        lineHeight: 1.85,
        color: '#4b5563',
      }}
    >
      {children}
    </div>
  </div>
);

const PrivacyPolicy = () => (
  <div style={{ background: '#f8f5f1', minHeight: '100vh' }}>
    {/* Hero */}
    <div
      style={{
        background: '#111827',
        padding: 'clamp(3rem, 6vw, 5rem) clamp(1.5rem, 5vw, 4rem)',
        textAlign: 'center',
      }}
    >
      <p
        style={{
          fontFamily: '"DM Sans", sans-serif',
          fontSize: '0.7rem',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: '#9a8f85',
          marginBottom: '0.75rem',
        }}
      >
        Legal
      </p>
      <h1
        style={{
          fontFamily: '"Cormorant Garamond", serif',
          fontSize: 'clamp(2rem, 4vw, 3rem)',
          fontWeight: 500,
          color: '#f8f5f1',
          margin: 0,
        }}
      >
        Privacy Policy
      </h1>
      <p
        style={{
          fontFamily: '"DM Sans", sans-serif',
          fontSize: '0.8rem',
          color: '#9a8f85',
          marginTop: '0.75rem',
        }}
      >
        Last updated: January 1, 2025
      </p>
    </div>

    {/* Body */}
    <div
      style={{
        maxWidth: 760,
        margin: '0 auto',
        padding: 'clamp(3rem, 6vw, 5rem) clamp(1.5rem, 5vw, 3rem)',
      }}
    >
      <Section title="1. Introduction">
        <p>
          Welcome to Vongshop ("we", "our", or "us"). This Privacy Policy explains how we collect, use,
          and protect information you provide when using our website and services. By using Vongshop, you
          agree to the terms described here.
        </p>
        <p style={{ marginTop: '0.75rem' }}>
          <strong>Note:</strong> Vongshop is a demonstration project built for educational and portfolio
          purposes. No real personal data is collected, sold, or shared with third parties for commercial purposes.
        </p>
      </Section>

      <Section title="2. Information We Collect">
        <p>We may collect the following categories of information:</p>
        <ul style={{ marginTop: '0.5rem', paddingLeft: '1.25rem' }}>
          <li><strong>Account information</strong> — name, email address, and password (stored as a bcrypt hash).</li>
          <li style={{ marginTop: '0.4rem' }}><strong>Order information</strong> — shipping address, items purchased, and payment status.</li>
          <li style={{ marginTop: '0.4rem' }}><strong>Usage data</strong> — pages visited, products viewed, and general interaction with the site.</li>
          <li style={{ marginTop: '0.4rem' }}><strong>Device information</strong> — browser type, operating system, and IP address for security and session management.</li>
        </ul>
        <p style={{ marginTop: '0.75rem' }}>
          We do <strong>not</strong> store raw payment card details. Payment processing is handled by
          Stripe and Bakong, which have their own privacy policies.
        </p>
      </Section>

      <Section title="3. How We Use Your Information">
        <p>Information collected is used to:</p>
        <ul style={{ marginTop: '0.5rem', paddingLeft: '1.25rem' }}>
          <li>Process and fulfil orders</li>
          <li style={{ marginTop: '0.4rem' }}>Send order confirmation and status updates</li>
          <li style={{ marginTop: '0.4rem' }}>Maintain and secure your account</li>
          <li style={{ marginTop: '0.4rem' }}>Improve site functionality and user experience</li>
          <li style={{ marginTop: '0.4rem' }}>Comply with legal obligations</li>
        </ul>
      </Section>

      <Section title="4. Cookies and Tracking">
        <p>
          Vongshop uses browser cookies and local storage to maintain your session and remember your
          shopping cart. We do not use third-party advertising trackers or sell your data to data brokers.
        </p>
        <p style={{ marginTop: '0.75rem' }}>
          You can disable cookies in your browser settings at any time. This may affect cart persistence
          and login functionality.
        </p>
      </Section>

      <Section title="5. Data Sharing">
        <p>We do not sell, rent, or trade your personal information. We may share data only:</p>
        <ul style={{ marginTop: '0.5rem', paddingLeft: '1.25rem' }}>
          <li>With payment processors (Stripe, Bakong) to complete transactions</li>
          <li style={{ marginTop: '0.4rem' }}>With cloud storage providers (Supabase) for image hosting</li>
          <li style={{ marginTop: '0.4rem' }}>When required by law or to protect our rights</li>
        </ul>
      </Section>

      <Section title="6. Data Retention">
        <p>
          Account and order data is retained for as long as your account is active or as required for
          record-keeping purposes. You may request deletion of your account and associated data by
          contacting us at the email below.
        </p>
      </Section>

      <Section title="7. Security">
        <p>
          We use industry-standard security practices including bcrypt password hashing, JWT-based
          authentication with short-lived access tokens, HTTPS, and refresh token rotation. While we take
          reasonable measures to protect your data, no system is completely secure.
        </p>
      </Section>

      <Section title="8. Children's Privacy">
        <p>
          Vongshop is not directed at children under the age of 13. We do not knowingly collect personal
          information from children. If you believe a child has provided us with personal data, please
          contact us and we will remove it promptly.
        </p>
      </Section>

      <Section title="9. Changes to This Policy">
        <p>
          We may update this Privacy Policy occasionally. The "Last updated" date at the top of this
          page reflects the most recent revision. Continued use of the site after changes constitutes
          your acceptance of the updated policy.
        </p>
      </Section>

      <Section title="10. Contact">
        <p>
          If you have questions about this Privacy Policy, please reach out at{' '}
          <a href="mailto:contact@vongshop.com" style={{ color: '#111827' }}>
            contact@vongshop.com
          </a>
          .
        </p>
      </Section>

      {/* Divider */}
      <div
        style={{
          borderTop: '1px solid #e8e2d9',
          paddingTop: '2rem',
          fontFamily: '"DM Sans", sans-serif',
          fontSize: '0.8rem',
          color: '#9a8f85',
        }}
      >
        This is a demo application. Content is for illustrative purposes only.
      </div>
    </div>
  </div>
);

export default PrivacyPolicy;
