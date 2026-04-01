interface Props {
  title: string;
  value: string;
  sub?: string;
  color?: string;
}

const StatsCard = ({ title, value, sub, color = '#6366f1' }: Props) => (
  <div
    style={{
      background: '#fff',
      border: '1px solid #e5e7eb',
      borderRadius: '0.75rem',
      padding: '1.25rem 1.5rem',
      flex: '1 1 160px',
      borderTop: `3px solid ${color}`,
    }}
  >
    <p
      style={{
        margin: '0 0 0.35rem',
        fontSize: '0.7rem',
        fontWeight: 600,
        color: '#6b7280',
        textTransform: 'uppercase',
        letterSpacing: '0.07em',
      }}
    >
      {title}
    </p>
    <p style={{ margin: 0, fontSize: '1.6rem', fontWeight: 700, color: '#111827', lineHeight: 1.1 }}>
      {value}
    </p>
    {sub && (
      <p style={{ margin: '0.3rem 0 0', fontSize: '0.75rem', color: '#9ca3af' }}>{sub}</p>
    )}
  </div>
);

export default StatsCard;
