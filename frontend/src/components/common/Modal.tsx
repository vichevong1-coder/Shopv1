import { useEffect } from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  /** Max width of the modal panel. Defaults to 480px */
  maxWidth?: string;
}

const Modal = ({ isOpen, onClose, title, children, maxWidth = '480px' }: Props) => {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.4)',
          zIndex: 600,
          animation: 'fadeIn 0.15s ease',
        }}
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: `min(${maxWidth}, calc(100vw - 2rem))`,
          background: '#ffffff',
          borderRadius: '0.75rem',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          zIndex: 601,
          display: 'flex',
          flexDirection: 'column',
          fontFamily: '"DM Sans", sans-serif',
          animation: 'scaleIn 0.2s ease',
          maxHeight: 'calc(100vh - 2rem)',
          overflowY: 'auto',
        }}
      >
        {/* Header */}
        {title && (
          <div
            style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid #e8e2d9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0,
            }}
          >
            <h2
              id="modal-title"
              style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#0f0f0f' }}
            >
              {title}
            </h2>
            <button
              onClick={onClose}
              aria-label="Close"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                color: '#0f0f0f',
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.5')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M1 1l14 14M15 1L1 15" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        )}

        {/* Body */}
        <div style={{ padding: '1.5rem', flex: 1 }}>
          {children}
        </div>
      </div>
    </>
  );
};

export default Modal;
