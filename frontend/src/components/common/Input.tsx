import type { InputHTMLAttributes } from 'react';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = ({ label, error, id, style, ...props }: Props) => {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
      {label && (
        <label
          htmlFor={inputId}
          style={{ fontSize: '0.875rem', fontWeight: 500, color: '#374151' }}
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        style={{
          padding: '0.625rem 0.875rem',
          borderRadius: '0.375rem',
          border: `1px solid ${error ? '#ef4444' : '#d1d5db'}`,
          fontSize: '0.875rem',
          outline: 'none',
          width: '100%',
          boxSizing: 'border-box',
          ...style,
        }}
        {...props}
      />
      {error && (
        <p style={{ fontSize: '0.75rem', color: '#ef4444', margin: 0 }}>{error}</p>
      )}
    </div>
  );
};

export default Input;
