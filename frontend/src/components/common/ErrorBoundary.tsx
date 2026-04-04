import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(err: unknown): State {
    const message =
      err instanceof Error ? err.message : 'An unexpected error occurred.';
    return { hasError: true, message };
  }

  componentDidCatch(err: unknown, info: { componentStack: string }) {
    console.error('[ErrorBoundary]', err, info.componentStack);
  }

  handleRetry = () => {
    this.setState({ hasError: false, message: '' });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div
        style={{
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          textAlign: 'center',
          fontFamily: '"DM Sans", sans-serif',
        }}
      >
        <p style={{ fontSize: '3rem', margin: '0 0 1rem' }}>⚠️</p>
        <h2
          style={{
            fontFamily: '"Cormorant Garamond", serif',
            fontSize: '1.75rem',
            fontWeight: 600,
            color: '#0f0f0f',
            margin: '0 0 0.5rem',
          }}
        >
          Something went wrong
        </h2>
        <p
          style={{
            color: '#9a8f85',
            fontSize: '0.875rem',
            maxWidth: '360px',
            margin: '0 0 1.75rem',
            lineHeight: 1.6,
          }}
        >
          {this.state.message}
        </p>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={this.handleRetry}
            style={{
              padding: '0.625rem 1.5rem',
              background: '#0f0f0f',
              color: '#fff',
              border: 'none',
              borderRadius: '0.375rem',
              fontFamily: '"DM Sans", sans-serif',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
          <a
            href="/"
            style={{
              padding: '0.625rem 1.5rem',
              background: 'transparent',
              color: '#0f0f0f',
              border: '1.5px solid #e8e2d9',
              borderRadius: '0.375rem',
              fontFamily: '"DM Sans", sans-serif',
              fontWeight: 600,
              fontSize: '0.875rem',
              textDecoration: 'none',
            }}
          >
            Go home
          </a>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
