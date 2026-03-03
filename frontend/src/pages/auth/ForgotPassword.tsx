import { useState } from 'react';
import { Link } from 'react-router-dom';
import * as authApi from '../../api/auth';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSubmitted(true);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message;
      setError(msg ?? 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <h1 style={titleStyle}>Reset password</h1>

        {submitted ? (
          <div>
            <p style={{ color: '#374151', fontSize: '0.9rem', lineHeight: 1.6 }}>
              If an account exists for <strong>{email}</strong>, a reset link has been sent.
              Check your inbox and follow the instructions.
            </p>
            <Link to="/auth/login" style={{ ...linkStyle, display: 'block', marginTop: '1.5rem', textAlign: 'center' }}>
              Back to sign in
            </Link>
          </div>
        ) : (
          <>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1.5rem' }}>
              Enter your email and we'll send you a reset link.
            </p>

            {error && <p style={errorStyle}>{error}</p>}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
              <Button type="submit" loading={isLoading} fullWidth>
                Send reset link
              </Button>
            </form>

            <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: '#6b7280' }}>
              <Link to="/auth/login" style={linkStyle}>Back to sign in</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;

const pageStyle: React.CSSProperties = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: '#f9fafb',
  padding: '1rem',
};

const cardStyle: React.CSSProperties = {
  background: '#fff',
  borderRadius: '0.75rem',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)',
  padding: '2rem',
  width: '100%',
  maxWidth: '24rem',
};

const titleStyle: React.CSSProperties = {
  fontSize: '1.5rem',
  fontWeight: 700,
  color: '#111827',
  marginBottom: '1rem',
};

const errorStyle: React.CSSProperties = {
  background: '#fef2f2',
  color: '#dc2626',
  border: '1px solid #fecaca',
  borderRadius: '0.375rem',
  padding: '0.625rem 0.875rem',
  fontSize: '0.875rem',
  marginBottom: '1rem',
};

const linkStyle: React.CSSProperties = {
  color: '#111827',
  fontWeight: 500,
  textDecoration: 'underline',
};
