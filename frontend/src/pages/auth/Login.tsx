import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { loginThunk, clearError } from '../../redux/slices/authSlice';
import { mergeCartThunk } from '../../redux/slices/cartSlice';
import { useUI } from '../../context/UIContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

const Login = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useUI();

  const { isLoading, error, user } = useAppSelector((s) => s.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const from = (location.state as { from?: string })?.from ?? '/';

  useEffect(() => {
    if (user) navigate(from, { replace: true });
  }, [user, navigate, from]);

  useEffect(() => () => { dispatch(clearError()); }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await dispatch(loginThunk({ email, password }));
    if (loginThunk.fulfilled.match(result)) {
      dispatch(mergeCartThunk());
      showToast('Welcome back!', 'success');
    }
  };

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <h1 style={titleStyle}>Sign in</h1>

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
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />

          <div style={{ textAlign: 'right' }}>
            <Link to="/auth/forgot-password" style={linkStyle}>Forgot password?</Link>
          </div>

          <Button type="submit" loading={isLoading} fullWidth>
            Sign in
          </Button>
        </form>

        <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: '#6b7280' }}>
          Don't have an account?{' '}
          <Link to="/auth/register" style={linkStyle}>Register</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;

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
  marginBottom: '1.5rem',
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
