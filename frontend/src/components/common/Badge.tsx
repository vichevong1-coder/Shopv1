interface Props {
  label: string;
  color?: string;
  background?: string;
}

const Badge = ({ label, color = '#374151', background = '#e5e7eb' }: Props) => (
  <span
    style={{
      display: 'inline-block',
      padding: '0.2rem 0.6rem',
      borderRadius: '9999px',
      fontSize: '0.75rem',
      fontWeight: 600,
      color,
      background,
      textTransform: 'capitalize',
    }}
  >
    {label}
  </span>
);

export default Badge;
