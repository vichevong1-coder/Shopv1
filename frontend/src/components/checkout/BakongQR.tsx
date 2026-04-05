import { useEffect, useRef, useState } from 'react';
import QRCode from 'react-qr-code';
import { createBakongQR, getBakongStatus } from '../../api/payment';
import { useCurrency } from '../../utils/money';
import Button from '../common/Button';
import Spinner from '../common/Spinner';

interface Props {
  orderId: string;
  totalInCents: number;
  onSuccess: () => void;
  onError: (msg: string) => void;
  onBack: () => void;
}

type Stage = 'loading' | 'ready' | 'paid' | 'error';

const BakongQR = ({ orderId, totalInCents, onSuccess, onError, onBack }: Props) => {
  const { formatPrice } = useCurrency();
  const [stage, setStage] = useState<Stage>('loading');
  const [qrString, setQrString] = useState('');
  const [bakongRef, setBakongRef] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Generate QR on mount
  useEffect(() => {
    createBakongQR(orderId)
      .then(({ qrString: qs, bakongRef: ref }) => {
        setQrString(qs);
        setBakongRef(ref);
        setStage('ready');
      })
      .catch((err) => {
        const msg = err?.response?.data?.message ?? 'Failed to generate QR code';
        setErrorMsg(msg);
        setStage('error');
        onError(msg);
      });
  }, [orderId, onError]);

  // Poll for payment once QR is ready
  useEffect(() => {
    if (stage !== 'ready' || !bakongRef) return;

    pollRef.current = setInterval(async () => {
      try {
        const { status } = await getBakongStatus(bakongRef);
        if (status === 'paid') {
          clearInterval(pollRef.current!);
          setStage('paid');
          setTimeout(onSuccess, 1500);
        }
      } catch {
        // network blip — keep polling
      }
    }, 5000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [stage, bakongRef, onSuccess]);

  if (stage === 'loading') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '3rem 0' }}>
        <Spinner />
        <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.875rem', color: '#9a8f85', margin: 0 }}>
          Generating QR code…
        </p>
      </div>
    );
  }

  if (stage === 'error') {
    return (
      <div style={{ textAlign: 'center', padding: '2rem 0' }}>
        <p style={{ fontFamily: '"DM Sans", sans-serif', color: '#d42e2e', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          {errorMsg}
        </p>
        <Button variant="secondary" onClick={onBack}>Back</Button>
      </div>
    );
  }

  if (stage === 'paid') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', padding: '3rem 0' }}>
        <div style={{ fontSize: '3rem' }}>✓</div>
        <p style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '1.5rem', fontWeight: 600, color: '#0f0f0f', margin: 0 }}>
          Payment received!
        </p>
        <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.875rem', color: '#9a8f85', margin: 0 }}>
          Redirecting…
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '1.6rem', fontWeight: 600, marginBottom: '0.25rem', color: '#0f0f0f' }}>
        Bakong KHQR
      </h2>
      <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.8rem', color: '#9a8f85', margin: '0 0 1.5rem' }}>
        Open your Bakong app and scan the QR code below to complete payment.
      </p>

      {/* QR box */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.25rem',
        padding: '1.75rem',
        border: '1.5px solid #e8e2d9',
        borderRadius: '0.75rem',
        marginBottom: '1.5rem',
        background: '#fafaf8',
      }}>
        <div style={{ background: '#fff', padding: '0.875rem', borderRadius: '0.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <QRCode value={qrString} size={180} />
        </div>

        {/* Amount */}
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.7rem', fontWeight: 600, color: '#9a8f85', letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 0.2rem' }}>
            Amount to pay
          </p>
          <p style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '1.75rem', fontWeight: 700, color: '#0f0f0f', margin: 0 }}>
            {formatPrice(totalInCents)}
          </p>
        </div>

        {/* Polling indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{
            display: 'inline-block',
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: '#22c55e',
            animation: 'pulse 1.5s ease-in-out infinite',
          }} />
          <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.8rem', color: '#6b7280', margin: 0 }}>
            Waiting for payment…
          </p>
        </div>
      </div>

      {/* Instructions */}
      <ol style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.8rem', color: '#9a8f85', paddingLeft: '1.25rem', margin: '0 0 1.5rem', lineHeight: 1.8 }}>
        <li>Open your <strong style={{ color: '#0f0f0f' }}>Bakong</strong> app</li>
        <li>Tap <strong style={{ color: '#0f0f0f' }}>Scan</strong> and point at the QR code</li>
        <li>Confirm the amount and pay</li>
        <li>This page will update automatically</li>
      </ol>

      <Button variant="secondary" type="button" onClick={onBack} style={{ width: '100%' }}>
        Back
      </Button>
    </div>
  );
};

export default BakongQR;
