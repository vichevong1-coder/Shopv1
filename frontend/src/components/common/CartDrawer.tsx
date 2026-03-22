import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useUI } from '../../context/UIContext';

const CartDrawer = () => {
  const { cartDrawerOpen, closeCart } = useUI();
  const [giftWrap, setGiftWrap] = useState(false);
  const [discountCode, setDiscountCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState(false);

  // Placeholder: cart items will come from Redux cart slice (Step 5)
  const cartItems: { id: string; name: string; price: number; quantity: number; image?: string }[] = [];
  const subtotal = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const isEmpty = cartItems.length === 0;

  if (!cartDrawerOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={closeCart}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.35)',
          zIndex: 500,
          animation: 'fadeIn 0.2s ease',
        }}
      />

      {/* Drawer */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '420px',
          maxWidth: '100vw',
          background: '#ffffff',
          zIndex: 501,
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideInRight 0.3s ease',
          fontFamily: '"DM Sans", sans-serif',
          boxShadow: '-4px 0 40px rgba(0,0,0,0.1)',
        }}
        role="dialog"
        aria-label="Shopping cart"
        aria-modal="true"
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #e8e2d9',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexShrink: 0,
          }}
        >
          <h2 style={{ fontSize: '1rem', fontWeight: 600, letterSpacing: '0.04em', color: '#0f0f0f', margin: 0 }}>
            Your cart
          </h2>
          <button
            onClick={closeCart}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', color: '#0f0f0f', transition: 'opacity 0.2s' }}
            aria-label="Close cart"
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.5')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M1 1l14 14M15 1L1 15" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: isEmpty ? '0' : '1rem 1.5rem' }}>
          {isEmpty ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                padding: '3rem 2rem',
                gap: '1.25rem',
                textAlign: 'center',
              }}
            >
              <svg width="56" height="56" viewBox="0 0 56 56" fill="none" style={{ opacity: 0.2 }}>
                <path d="M4 4h8l8 32a3 3 0 003 2.25h25.6a3 3 0 002.88-2.19L55 18H13" stroke="#0f0f0f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="24" cy="49" r="4" fill="#0f0f0f" />
                <circle cx="44" cy="49" r="4" fill="#0f0f0f" />
              </svg>
              <p style={{ fontSize: '1rem', color: '#0f0f0f', fontWeight: 500, margin: 0 }}>Your cart is empty</p>
              <p style={{ fontSize: '0.82rem', color: '#9a8f85', margin: 0, lineHeight: 1.5 }}>
                Looks like you haven't added anything yet.
              </p>
              <Link
                to="/shop"
                onClick={closeCart}
                style={{
                  display: 'inline-block',
                  marginTop: '0.5rem',
                  padding: '0.7rem 2rem',
                  background: '#0f0f0f',
                  color: '#ffffff',
                  textDecoration: 'none',
                  fontSize: '0.75rem',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  fontWeight: 500,
                  transition: 'background 0.2s',
                }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = '#2a2a2a')}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = '#0f0f0f')}
              >
                Continue shopping
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {cartItems.map((item) => (
                <div key={item.id} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ width: '72px', height: '88px', flexShrink: 0, background: '#f8f5f1', overflow: 'hidden' }}>
                    {item.image && <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 500, color: '#0f0f0f', marginBottom: '0.25rem' }}>{item.name}</div>
                    <div style={{ fontSize: '0.78rem', color: '#9a8f85' }}>${(item.price / 100).toFixed(2)}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.6rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e8e2d9' }}>
                        <button style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: '#0f0f0f' }}>−</button>
                        <span style={{ width: '32px', textAlign: 'center', fontSize: '0.82rem' }}>{item.quantity}</span>
                        <button style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: '#0f0f0f' }}>+</button>
                      </div>
                      <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.72rem', color: '#9a8f85', letterSpacing: '0.06em', textTransform: 'uppercase', padding: 0, fontFamily: 'inherit' }}>Remove</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer (only show when has items) */}
        {!isEmpty && (
          <div style={{ borderTop: '1px solid #e8e2d9', padding: '1.25rem 1.5rem', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Gift wrap */}
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={giftWrap}
                onChange={e => setGiftWrap(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: '#0f0f0f', cursor: 'pointer', flexShrink: 0 }}
              />
              <span style={{ fontSize: '0.8rem', color: '#0f0f0f' }}>Gift wrap</span>
              <span style={{ fontSize: '0.78rem', color: '#9a8f85', marginLeft: 'auto' }}>+$10.00</span>
            </label>

            {/* Discount code */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                placeholder="Discount code"
                value={discountCode}
                onChange={e => setDiscountCode(e.target.value)}
                style={{ flex: 1, padding: '0.55rem 0.75rem', border: '1px solid #e8e2d9', fontSize: '0.82rem', fontFamily: 'inherit', outline: 'none', color: '#0f0f0f', background: discountApplied ? '#f0faf0' : '#ffffff' }}
              />
              <button
                onClick={() => setDiscountApplied(!!discountCode)}
                style={{ padding: '0.55rem 0.9rem', background: '#0f0f0f', color: '#ffffff', border: 'none', cursor: 'pointer', fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'inherit', fontWeight: 500, flexShrink: 0, transition: 'background 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#2a2a2a')}
                onMouseLeave={e => (e.currentTarget.style.background = '#0f0f0f')}
              >
                Apply
              </button>
            </div>

            {/* Subtotal */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderTop: '1px solid #e8e2d9' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.04em', color: '#0f0f0f' }}>Subtotal</span>
              <span style={{ fontSize: '1rem', fontWeight: 600, color: '#0f0f0f' }}>
                ${((subtotal + (giftWrap ? 1000 : 0)) / 100).toFixed(2)}
              </span>
            </div>

            <p style={{ fontSize: '0.72rem', color: '#9a8f85', margin: 0, textAlign: 'center' }}>
              Taxes and shipping calculated at checkout
            </p>

            {/* Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Link
                to="/cart"
                onClick={closeCart}
                style={{ display: 'block', textAlign: 'center', padding: '0.75rem', border: '1px solid #e8e2d9', color: '#0f0f0f', textDecoration: 'none', fontSize: '0.78rem', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 500, transition: 'background 0.2s', fontFamily: 'inherit' }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = '#f8f5f1')}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
              >
                View Cart
              </Link>
              <Link
                to="/checkout"
                onClick={closeCart}
                style={{ display: 'block', textAlign: 'center', padding: '0.85rem', background: '#0f0f0f', color: '#ffffff', textDecoration: 'none', fontSize: '0.78rem', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, transition: 'background 0.2s', fontFamily: 'inherit' }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = '#2a2a2a')}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = '#0f0f0f')}
              >
                Check out
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
