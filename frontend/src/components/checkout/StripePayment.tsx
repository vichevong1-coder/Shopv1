import { useState } from 'react';
import {
  useStripe,
  useElements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
} from '@stripe/react-stripe-js';
import Button from '../common/Button';

interface Props {
  clientSecret: string;
  onSuccess: () => void;
  onError: (msg: string) => void;
  onBack: () => void;
  totalLabel: string;
  submitting: boolean;
  setSubmitting: (v: boolean) => void;
}

const FIELD_STYLE = {
  base: {
    fontFamily: '"DM Sans", sans-serif',
    fontSize: '15px',
    color: '#0f0f0f',
    '::placeholder': { color: '#c4bdb6' },
  },
  invalid: { color: '#d42e2e' },
};

const fieldWrap: React.CSSProperties = {
  padding: '0.9rem 1rem',
  background: '#fff',
};

const divider: React.CSSProperties = {
  height: '1px',
  background: '#e8e2d9',
  margin: '0 1rem',
};

const fieldLabel: React.CSSProperties = {
  fontFamily: '"DM Sans", sans-serif',
  fontSize: '0.7rem',
  fontWeight: 600,
  color: '#9a8f85',
  letterSpacing: '0.06em',
  textTransform: 'uppercase' as const,
  marginBottom: '0.45rem',
};

const StripePayment = ({
  clientSecret, onSuccess, onError, onBack, totalLabel, submitting, setSubmitting,
}: Props) => {
  const stripe = useStripe();
  const elements = useElements();
  const [cardError, setCardError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    const cardNumber = elements.getElement(CardNumberElement);
    if (!cardNumber) return;

    setSubmitting(true);
    setCardError(null);

    const { error } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: cardNumber },
    });

    setSubmitting(false);

    if (error) {
      const msg = error.message ?? 'Payment failed';
      setCardError(msg);
      onError(msg);
    } else {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '1.6rem', fontWeight: 600, marginBottom: '1.5rem', color: '#0f0f0f' }}>
        Card Details
      </h2>

      {/* Card frame */}
      <div style={{ border: '1.5px solid #e8e2d9', borderRadius: '0.75rem', overflow: 'hidden', marginBottom: cardError ? '0.5rem' : '1.5rem' }}>

        {/* Card number row */}
        <div style={fieldWrap}>
          <p style={fieldLabel}>Card number</p>
          <CardNumberElement options={{ style: FIELD_STYLE, showIcon: true }} />
        </div>

        <div style={divider} />

        {/* Expiry + CVC row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
          <div style={fieldWrap}>
            <p style={fieldLabel}>Expiry date</p>
            <CardExpiryElement options={{ style: FIELD_STYLE }} />
          </div>
          <div style={{ ...fieldWrap, borderLeft: '1px solid #e8e2d9' }}>
            <p style={fieldLabel}>CVC</p>
            <CardCvcElement options={{ style: FIELD_STYLE }} />
          </div>
        </div>
      </div>

      {cardError && (
        <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.8rem', color: '#d42e2e', margin: '0 0 1rem' }}>
          {cardError}
        </p>
      )}

      <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.78rem', color: '#9a8f85', marginBottom: '1.25rem' }}>
        Test card: 4242 4242 4242 4242 · Exp 12/34 · CVC 123
      </p>

      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <Button variant="secondary" type="button" onClick={onBack} style={{ flex: 1 }} disabled={submitting}>
          Back
        </Button>
        <Button
          type="submit"
          loading={submitting}
          disabled={!stripe || submitting}
          style={{ flex: 2, background: '#c4845e', color: '#fff', padding: '0.875rem', fontSize: '0.95rem', letterSpacing: '0.05em' }}
        >
          Place Order · {totalLabel}
        </Button>
      </div>
    </form>
  );
};

export default StripePayment;
