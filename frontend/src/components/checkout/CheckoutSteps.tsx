interface Props {
  currentStep: 1 | 2 | 3;
}

const STEPS = [
  { n: 1, label: 'Shipping' },
  { n: 2, label: 'Review' },
  { n: 3, label: 'Payment' },
] as const;

const CheckoutSteps = ({ currentStep }: Props) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: '2.5rem' }}>
    {STEPS.map((step, i) => {
      const done = currentStep > step.n;
      const active = currentStep === step.n;
      return (
        <div key={step.n} style={{ display: 'flex', alignItems: 'center' }}>
          {/* connector */}
          {i > 0 && (
            <div style={{
              width: '4rem',
              height: '2px',
              background: done || active ? '#0f0f0f' : '#e8e2d9',
              transition: 'background 0.3s',
            }} />
          )}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
            <div style={{
              width: '2rem',
              height: '2rem',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: '"DM Sans", sans-serif',
              fontWeight: 600,
              fontSize: '0.8rem',
              background: done ? '#0f0f0f' : active ? '#c4845e' : 'transparent',
              color: done || active ? '#fff' : '#9a8f85',
              border: done || active ? 'none' : '2px solid #e8e2d9',
              transition: 'all 0.3s',
            }}>
              {done ? '✓' : step.n}
            </div>
            <span style={{
              fontFamily: '"DM Sans", sans-serif',
              fontSize: '0.72rem',
              fontWeight: active ? 600 : 400,
              color: active ? '#0f0f0f' : done ? '#9a8f85' : '#9a8f85',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}>
              {step.label}
            </span>
          </div>
        </div>
      );
    })}
  </div>
);

export default CheckoutSteps;
