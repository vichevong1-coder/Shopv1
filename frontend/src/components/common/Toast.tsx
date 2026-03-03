import { useUI } from '../../context/UIContext';

const colors = {
  success: '#16a34a',
  error:   '#dc2626',
  info:    '#2563eb',
};

const Toast = () => {
  const { toast } = useUI();
  if (!toast) return null;

  return (
    <div
      role="alert"
      style={{
        position: 'fixed',
        top: '1.25rem',
        right: '1.25rem',
        zIndex: 9999,
        padding: '0.75rem 1.25rem',
        borderRadius: '0.5rem',
        background: colors[toast.type],
        color: '#fff',
        fontSize: '0.875rem',
        fontWeight: 500,
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        maxWidth: '22rem',
        wordBreak: 'break-word',
      }}
    >
      {toast.message}
    </div>
  );
};

export default Toast;
