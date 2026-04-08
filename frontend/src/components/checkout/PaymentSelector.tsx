type PaymentMethodOption = 'stripe';

interface Props {
  selected: PaymentMethodOption;
  onChange: (m: PaymentMethodOption) => void;
}

const Radio = ({ active }: { active: boolean }) => (
  <div style={{
    width: '1.1rem',
    height: '1.1rem',
    borderRadius: '50%',
    border: `2px solid ${active ? '#0f0f0f' : '#d1d5db'}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  }}>
    {active && <div style={{ width: '0.55rem', height: '0.55rem', borderRadius: '50%', background: '#0f0f0f' }} />}
  </div>
);

const PaymentSelector = ({ selected, onChange }: Props) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
    <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.75rem', fontWeight: 600, color: '#9a8f85', letterSpacing: '0.06em', textTransform: 'uppercase', margin: 0 }}>
      Payment method
    </p>

    {/* Stripe */}
    <button
      onClick={() => onChange('stripe')}
      style={{
        display: 'flex', alignItems: 'center', gap: '0.875rem',
        padding: '1rem', border: `2px solid ${selected === 'stripe' ? '#0f0f0f' : '#e8e2d9'}`,
        borderRadius: '0.5rem', background: '#fff', cursor: 'pointer', textAlign: 'left',
        transition: 'border-color 0.2s',
      }}
    >
      <Radio active={selected === 'stripe'} />
      <div>
        <p style={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 600, fontSize: '0.9rem', color: '#0f0f0f', margin: 0 }}>
          Credit / Debit Card
        </p>
        <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.78rem', color: '#9a8f85', margin: '0.15rem 0 0' }}>
          Visa, Mastercard, Amex — powered by Stripe
        </p>
      </div>
      <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.4rem' }}>
        {['VISA', 'MC', 'AMEX'].map((c) => (
          <span key={c} style={{ padding: '0.2rem 0.45rem', background: '#f8f5f1', border: '1px solid #e8e2d9', borderRadius: '0.25rem', fontFamily: '"DM Sans", sans-serif', fontSize: '0.65rem', fontWeight: 700, color: '#9a8f85', letterSpacing: '0.04em' }}>
            {c}
          </span>
        ))}
      </div>
    </button>
  </div>
);

export default PaymentSelector;
