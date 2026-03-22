interface Props {
  page: number;
  pages: number;
  onChange: (page: number) => void;
}

const btn = (active: boolean, disabled: boolean): React.CSSProperties => ({
  padding: '0.375rem 0.75rem',
  border: '1px solid #e5e7eb',
  borderRadius: '0.375rem',
  background: active ? '#111827' : '#fff',
  color: active ? '#fff' : '#374151',
  fontWeight: active ? 600 : 400,
  cursor: disabled ? 'not-allowed' : 'pointer',
  opacity: disabled ? 0.4 : 1,
  fontSize: '0.875rem',
});

const Pagination = ({ page, pages, onChange }: Props) => {
  if (pages <= 1) return null;

  const nums: (number | '...')[] = [];
  if (pages <= 7) {
    for (let i = 1; i <= pages; i++) nums.push(i);
  } else {
    nums.push(1);
    if (page > 3) nums.push('...');
    for (let i = Math.max(2, page - 1); i <= Math.min(pages - 1, page + 1); i++) nums.push(i);
    if (page < pages - 2) nums.push('...');
    nums.push(pages);
  }

  return (
    <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center', justifyContent: 'center', padding: '1.5rem 0' }}>
      <button style={btn(false, page === 1)} disabled={page === 1} onClick={() => onChange(page - 1)}>
        &larr; Prev
      </button>
      {nums.map((n, i) =>
        n === '...' ? (
          <span key={`ellipsis-${i}`} style={{ padding: '0 0.25rem', color: '#9ca3af' }}>…</span>
        ) : (
          <button key={n} style={btn(n === page, false)} onClick={() => onChange(n as number)}>
            {n}
          </button>
        )
      )}
      <button style={btn(false, page === pages)} disabled={page === pages} onClick={() => onChange(page + 1)}>
        Next &rarr;
      </button>
    </div>
  );
};

export default Pagination;
