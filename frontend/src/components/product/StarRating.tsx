interface Props {
  average: number;
  count: number;
  size?: string;
}

const StarRating = ({ average, count, size = '1rem' }: Props) => {
  const stars = Array.from({ length: 5 }, (_, i) => {
    const filled = i + 1 <= Math.floor(average);
    const half = !filled && i < average;
    return { filled, half };
  });

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
      {stars.map((s, i) => (
        <span key={i} style={{ fontSize: size, color: s.filled || s.half ? '#f59e0b' : '#d1d5db' }}>
          {s.filled ? '★' : s.half ? '⯨' : '☆'}
        </span>
      ))}
      <span style={{ fontSize: '0.75rem', color: '#6b7280', marginLeft: '0.25rem' }}>
        ({count})
      </span>
    </div>
  );
};

export default StarRating;
