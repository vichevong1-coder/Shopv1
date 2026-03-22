import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import {
  updateItemThunk, removeItemThunk, clearCartThunk,
  updateItemLocal, removeItemLocal, clearCartLocal,
} from '../redux/slices/cartSlice';
import { formatPrice } from '../utils/money';

const Cart = () => {
  const dispatch = useAppDispatch();
  const { items, isLoading } = useAppSelector((s) => s.cart);
  const { user } = useAppSelector((s) => s.auth);

  const subtotal = items.reduce((sum, i) => sum + i.priceInCents * i.quantity, 0);
  const tax = Math.round(subtotal * 0.1);
  const total = subtotal + tax;
  const isEmpty = items.length === 0;

  const handleQty = (itemId: string, qty: number) => {
    if (qty < 1) return;
    if (user) dispatch(updateItemThunk({ itemId, quantity: qty }));
    else dispatch(updateItemLocal({ _id: itemId, quantity: qty }));
  };

  const handleRemove = (itemId: string) => {
    if (user) dispatch(removeItemThunk(itemId));
    else dispatch(removeItemLocal(itemId));
  };

  const handleClear = () => {
    if (user) dispatch(clearCartThunk());
    else dispatch(clearCartLocal());
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2.5rem 1.5rem', fontFamily: '"DM Sans", sans-serif', minHeight: '60vh' }}>
      {/* Page title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f0f0f', margin: 0, fontFamily: '"Cormorant Garamond", serif' }}>
          Shopping Cart
        </h1>
        {!isEmpty && (
          <button
            onClick={handleClear}
            disabled={isLoading}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.78rem', color: '#9a8f85', letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: 'inherit', padding: 0 }}
          >
            Clear all
          </button>
        )}
      </div>

      {isEmpty ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', padding: '6rem 1rem', textAlign: 'center' }}>
          <svg width="64" height="64" viewBox="0 0 56 56" fill="none" style={{ opacity: 0.2 }}>
            <path d="M4 4h8l8 32a3 3 0 003 2.25h25.6a3 3 0 002.88-2.19L55 18H13" stroke="#0f0f0f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="24" cy="49" r="4" fill="#0f0f0f" />
            <circle cx="44" cy="49" r="4" fill="#0f0f0f" />
          </svg>
          <p style={{ fontSize: '1.1rem', color: '#0f0f0f', fontWeight: 500, margin: 0 }}>Your cart is empty</p>
          <p style={{ fontSize: '0.875rem', color: '#9a8f85', margin: 0 }}>Browse our collection and add something you love.</p>
          <Link
            to="/shop"
            style={{ marginTop: '0.5rem', padding: '0.8rem 2.5rem', background: '#0f0f0f', color: '#ffffff', textDecoration: 'none', fontSize: '0.78rem', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}
          >
            Shop Now
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '3rem', alignItems: 'start' }}>
          {/* Items list */}
          <div style={{ opacity: isLoading ? 0.6 : 1, transition: 'opacity 0.15s' }}>
            <div style={{ borderTop: '1px solid #e8e2d9' }}>
              {items.map((item) => (
                <div
                  key={item._id}
                  style={{ display: 'flex', gap: '1.5rem', padding: '1.5rem 0', borderBottom: '1px solid #e8e2d9', alignItems: 'flex-start' }}
                >
                  {/* Image */}
                  <Link to={`/product/${item.productId}`} style={{ flexShrink: 0, display: 'block', width: '100px', height: '125px', background: '#f8f5f1', overflow: 'hidden' }}>
                    {item.image && (
                      <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    )}
                  </Link>

                  {/* Details */}
                  <div style={{ flex: 1 }}>
                    <Link to={`/product/${item.productId}`} style={{ textDecoration: 'none' }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#0f0f0f', margin: '0 0 0.35rem' }}>{item.name}</h3>
                    </Link>
                    <p style={{ fontSize: '0.82rem', color: '#9a8f85', margin: '0 0 0.75rem' }}>
                      Size: {item.size} &nbsp;·&nbsp; Colour: {item.color}
                    </p>
                    <p style={{ fontSize: '0.875rem', color: '#0f0f0f', margin: '0 0 1rem' }}>{formatPrice(item.priceInCents)}</p>

                    {/* Qty + remove */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e8e2d9' }}>
                        <button
                          onClick={() => handleQty(item._id, item.quantity - 1)}
                          disabled={isLoading || item.quantity <= 1}
                          style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: item.quantity <= 1 ? 'not-allowed' : 'pointer', fontSize: '1.1rem', color: '#0f0f0f', opacity: item.quantity <= 1 ? 0.3 : 1 }}
                        >−</button>
                        <span style={{ width: '40px', textAlign: 'center', fontSize: '0.9rem', fontWeight: 500 }}>{item.quantity}</span>
                        <button
                          onClick={() => handleQty(item._id, item.quantity + 1)}
                          disabled={isLoading}
                          style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', color: '#0f0f0f' }}
                        >+</button>
                      </div>
                      <button
                        onClick={() => handleRemove(item._id)}
                        disabled={isLoading}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', color: '#9a8f85', letterSpacing: '0.06em', textTransform: 'uppercase', padding: 0, fontFamily: 'inherit' }}
                      >Remove</button>
                    </div>
                  </div>

                  {/* Line total */}
                  <div style={{ fontSize: '1rem', fontWeight: 600, color: '#0f0f0f', flexShrink: 0, paddingTop: '0.1rem' }}>
                    {formatPrice(item.priceInCents * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '1.5rem' }}>
              <Link to="/shop" style={{ fontSize: '0.82rem', color: '#9a8f85', letterSpacing: '0.04em', textDecoration: 'none' }}>
                ← Continue Shopping
              </Link>
            </div>
          </div>

          {/* Order summary */}
          <div style={{ background: '#f8f5f1', padding: '1.75rem', position: 'sticky', top: '80px' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 600, letterSpacing: '0.05em', color: '#0f0f0f', margin: '0 0 1.5rem', textTransform: 'uppercase' }}>
              Order Summary
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: '#0f0f0f' }}>
                <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: '#9a8f85' }}>
                <span>Tax (10%)</span>
                <span>{formatPrice(tax)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: '#9a8f85' }}>
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>
            </div>

            <div style={{ borderTop: '1px solid #e8e2d9', paddingTop: '1.25rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '1rem', fontWeight: 700, color: '#0f0f0f' }}>Total</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f0f0f' }}>{formatPrice(total)}</span>
            </div>

            <Link
              to="/checkout"
              style={{ display: 'block', textAlign: 'center', padding: '1rem', background: '#0f0f0f', color: '#ffffff', textDecoration: 'none', fontSize: '0.82rem', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, transition: 'background 0.2s' }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = '#2a2a2a')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = '#0f0f0f')}
            >
              Proceed to Checkout
            </Link>

            {!user && (
              <p style={{ fontSize: '0.75rem', color: '#9a8f85', textAlign: 'center', marginTop: '1rem', lineHeight: 1.5 }}>
                <Link to="/auth/login" style={{ color: '#0f0f0f', fontWeight: 600 }}>Sign in</Link>
                {' '}to save your cart and earn rewards
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
