import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { createOrderThunk } from '../redux/slices/orderSlice';
import { clearCartLocal } from '../redux/slices/cartSlice';
import { createStripePaymentIntent } from '../api/payment';
import { useUI } from '../context/UIContext';
import { useCurrency } from '../utils/money';
import type { ShippingAddress } from '../types/order';
import CheckoutSteps from '../components/checkout/CheckoutSteps';
import ShippingForm from '../components/checkout/ShippingForm';
import OrderReview from '../components/checkout/OrderReview';
import StripePayment from '../components/checkout/StripePayment';
import Spinner from '../components/common/Spinner';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ?? '');

const EMPTY_ADDRESS: ShippingAddress = {
  street: '', city: '', state: '', postalCode: '', country: '',
};

const Checkout = () => {
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { showToast } = useUI();

  const cartItems = useAppSelector((s) => s.cart.items);
  const currentOrder = useAppSelector((s) => s.orders.currentOrder);

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [address, setAddress] = useState<ShippingAddress>(EMPTY_ADDRESS);
  const [paymentMethod] = useState<'stripe'>('stripe');
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [preparing, setPreparing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const subtotal = cartItems.reduce((s, i) => s + i.priceInCents * i.quantity, 0);
  const tax = Math.round(subtotal * 0.1);
  const total = subtotal + tax;

  if (cartItems.length === 0 && step === 1) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', fontFamily: '"DM Sans", sans-serif' }}>
        <p style={{ color: '#9a8f85', fontSize: '1.1rem' }}>Your cart is empty.</p>
        <button onClick={() => navigate('/shop')} style={{ background: '#0f0f0f', color: '#fff', border: 'none', padding: '0.75rem 2rem', borderRadius: '0.375rem', cursor: 'pointer', fontFamily: '"DM Sans", sans-serif', fontWeight: 600 }}>
          Shop Now
        </button>
      </div>
    );
  }

  const handleGoToPayment = async () => {
    setPreparing(true);
    try {
      // 1. Create order
      const result = await dispatch(
        createOrderThunk({
          items: cartItems.map((i) => ({
            product: i.productId,
            size: i.size,
            color: i.color,
            quantity: i.quantity,
          })),
          shippingAddress: address,
          paymentMethod,
        })
      );

      if (createOrderThunk.rejected.match(result)) {
        throw new Error((result.payload as string) ?? 'Failed to create order');
      }

      const order = result.payload as { _id: string };

      // 2. For Stripe: also create payment intent now
      if (paymentMethod === 'stripe') {
        const { clientSecret: cs } = await createStripePaymentIntent(order._id);
        setClientSecret(cs);
      }

      setStep(3);
    } catch (err) {
      showToast((err as Error).message ?? 'Something went wrong', 'error');
    } finally {
      setPreparing(false);
    }
  };

  const handlePaymentSuccess = () => {
    dispatch(clearCartLocal());
    const orderId = currentOrder?._id;
    navigate(`/order-confirmation/${orderId}`);
  };

  const handlePaymentError = (msg: string) => {
    showToast(msg, 'error');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8f5f1', paddingBottom: '4rem' }}>
      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e8e2d9', padding: '1.25rem 1rem', textAlign: 'center' }}>
        <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '1.5rem', fontWeight: 600, color: '#0f0f0f', margin: 0 }}>
          Checkout
        </h1>
      </div>

      <div style={{ maxWidth: '560px', margin: '0 auto', padding: 'clamp(1.25rem, 5vw, 2.5rem) clamp(1rem, 4vw, 1.5rem) 0' }}>
        <CheckoutSteps currentStep={step} />

        <div style={{ background: '#fff', borderRadius: '0.75rem', padding: 'clamp(1.25rem, 5vw, 2rem)', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          {/* Step 1 — Shipping */}
          {step === 1 && (
            <ShippingForm value={address} onChange={setAddress} onNext={() => setStep(2)} />
          )}

          {/* Step 2 — Review + payment method selection */}
          {step === 2 && (
            preparing ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem 0' }}>
                <Spinner />
              </div>
            ) : (
              <OrderReview
                items={cartItems}
                shippingAddress={address}
                onBack={() => setStep(1)}
                onNext={handleGoToPayment}
              />
            )
          )}

          {/* Step 3 — Payment */}
          {step === 3 && (
            <>
              {paymentMethod === 'stripe' && clientSecret && (
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <StripePayment
                    clientSecret={clientSecret}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                    onBack={() => setStep(2)}
                    totalLabel={formatPrice(total)}
                    submitting={submitting}
                    setSubmitting={setSubmitting}
                  />
                </Elements>
              )}

              {/* Loading state */}
              {!clientSecret && (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem 0' }}>
                  <Spinner />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Checkout;
