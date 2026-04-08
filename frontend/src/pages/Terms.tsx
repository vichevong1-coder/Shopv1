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

const Terms = () => (
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
        Terms of Service
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
      <Section title="1. Acceptance of Terms">
        <p>
          By accessing or using Vongshop ("the Site"), you agree to be bound by these Terms of Service.
          If you do not agree, please do not use the Site.
        </p>
        <p style={{ marginTop: '0.75rem' }}>
          <strong>Note:</strong> Vongshop is a demonstration project created for educational and portfolio
          purposes. No real transactions, legal obligations, or commercial activities take place.
        </p>
      </Section>

      <Section title="2. Use of the Site">
        <p>You agree to use Vongshop only for lawful purposes. You must not:</p>
        <ul style={{ marginTop: '0.5rem', paddingLeft: '1.25rem' }}>
          <li>Attempt to gain unauthorised access to any part of the Site or its servers</li>
          <li style={{ marginTop: '0.4rem' }}>Transmit harmful, offensive, or malicious content</li>
          <li style={{ marginTop: '0.4rem' }}>Impersonate another person or misrepresent your identity</li>
          <li style={{ marginTop: '0.4rem' }}>Use automated tools to scrape, crawl, or overload the Site</li>
          <li style={{ marginTop: '0.4rem' }}>Violate any applicable local, national, or international laws</li>
        </ul>
      </Section>

      <Section title="3. Accounts">
        <p>
          To access certain features (checkout, order history, profile), you must create an account. You
          are responsible for maintaining the confidentiality of your credentials and for all activity
          under your account.
        </p>
        <p style={{ marginTop: '0.75rem' }}>
          We reserve the right to suspend or terminate accounts that violate these Terms or engage in
          fraudulent activity.
        </p>
      </Section>

      <Section title="4. Orders and Payments">
        <p>
          All orders placed on Vongshop are subject to availability and acceptance. We reserve the right
          to refuse or cancel any order at our discretion.
        </p>
        <p style={{ marginTop: '0.75rem' }}>
          Prices displayed are in USD unless otherwise stated. Payment is processed securely via Stripe
          (card) or Bakong KHQR (local QR transfer). We do not store payment card details on our servers.
        </p>
        <p style={{ marginTop: '0.75rem' }}>
          Since this is a demo application, no real charges are processed. Use Stripe test card numbers
          (e.g. 4242 4242 4242 4242) to simulate payments.
        </p>
      </Section>

      <Section title="5. Pricing and Availability">
        <p>
          All product prices are shown in US cents internally and formatted for display. We make no
          guarantee that any listed product will be available at the time of your order. In the event a
          product becomes unavailable after an order is placed, we will contact you to offer an
          alternative or a full refund.
        </p>
      </Section>

      <Section title="6. Returns and Refunds">
        <p>
          We want you to be satisfied with your purchase. If you are not happy with your order for any
          reason, please contact us within 14 days of delivery. Items must be unused, in original
          condition, and in original packaging to qualify for a return.
        </p>
        <p style={{ marginTop: '0.75rem' }}>
          Refunds are issued to the original payment method within 5–10 business days of receiving the
          returned item. Shipping costs are non-refundable unless the item is defective or we made an error.
        </p>
      </Section>

      <Section title="7. Intellectual Property">
        <p>
          All content on this Site — including text, images, logos, and code — is the property of
          Vongshop or its respective owners. You may not reproduce, distribute, or create derivative
          works without explicit written permission.
        </p>
      </Section>

      <Section title="8. Disclaimer of Warranties">
        <p>
          Vongshop is provided "as is" without warranties of any kind, express or implied. We do not
          guarantee that the Site will be error-free, uninterrupted, or free of viruses or other harmful
          components. Your use of the Site is at your own risk.
        </p>
      </Section>

      <Section title="9. Limitation of Liability">
        <p>
          To the maximum extent permitted by law, Vongshop and its operators shall not be liable for
          any indirect, incidental, special, or consequential damages arising from your use of, or
          inability to use, the Site or its services — including loss of data, revenue, or profits.
        </p>
      </Section>

      <Section title="10. Third-Party Links">
        <p>
          The Site may contain links to third-party websites. These links are provided for convenience
          only. We have no control over the content or practices of those sites and accept no
          responsibility for them.
        </p>
      </Section>

      <Section title="11. Governing Law">
        <p>
          These Terms shall be governed by and construed in accordance with the laws of Cambodia, without
          regard to its conflict of law provisions. Any disputes shall be resolved in the competent
          courts of Phnom Penh, Cambodia.
        </p>
      </Section>

      <Section title="12. Changes to These Terms">
        <p>
          We reserve the right to update these Terms at any time. The "Last updated" date at the top of
          this page will reflect the latest revision. Continued use of the Site after changes are posted
          constitutes acceptance of the revised Terms.
        </p>
      </Section>

      <Section title="13. Contact">
        <p>
          For questions about these Terms, contact us at{' '}
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

export default Terms;
