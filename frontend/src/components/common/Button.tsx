import type { ButtonHTMLAttributes } from 'react';
import Spinner from './Spinner';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  loading?: boolean;
  fullWidth?: boolean;
}

const styles: Record<string, React.CSSProperties> = {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    padding: '0.625rem 1.25rem',
    borderRadius: '0.375rem',
    fontWeight: 600,
    fontSize: '0.875rem',
    border: 'none',
    cursor: 'pointer',
    transition: 'opacity 0.15s, background 0.15s',
  },
  primary:   { background: '#111827', color: '#fff' },
  secondary: { background: '#f3f4f6', color: '#111827', border: '1px solid #e5e7eb' },
};

const Button = ({
  variant = 'primary',
  loading = false,
  fullWidth = false,
  children,
  disabled,
  style,
  ...props
}: Props) => (
  <button
    style={{
      ...styles.base,
      ...styles[variant],
      width: fullWidth ? '100%' : undefined,
      opacity: disabled || loading ? 0.65 : 1,
      cursor: disabled || loading ? 'not-allowed' : 'pointer',
      ...style,
    }}
    disabled={disabled || loading}
    {...props}
  >
    {loading && <Spinner size="sm" />}
    {children}
  </button>
);

export default Button;
