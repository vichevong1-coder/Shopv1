// ── Primitive ────────────────────────────────────────────────────────────────

interface Props {
  width?: string;
  height?: string;
  borderRadius?: string;
  style?: React.CSSProperties;
}

const Skeleton = ({
  width = '100%',
  height = '1rem',
  borderRadius = '0.375rem',
  style,
}: Props) => (
  <div
    style={{
      width,
      height,
      borderRadius,
      background: 'linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%)',
      backgroundSize: '200% 100%',
      animation: 'skeleton-pulse 1.4s ease infinite',
      flexShrink: 0,
      ...style,
    }}
  />
);

// Inject keyframe once
if (typeof document !== 'undefined' && !document.getElementById('skeleton-style')) {
  const s = document.createElement('style');
  s.id = 'skeleton-style';
  s.textContent = `@keyframes skeleton-pulse { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`;
  document.head.appendChild(s);
}

export default Skeleton;

// ── Composite: ProductCard ────────────────────────────────────────────────────

export const ProductCardSkeleton = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
    <Skeleton height="0" style={{ paddingBottom: '133%', borderRadius: '0.5rem' }} />
    <div style={{ display: 'flex', gap: '0.35rem' }}>
      {[1, 2, 3].map((i) => <Skeleton key={i} width="1rem" height="1rem" borderRadius="50%" />)}
    </div>
    <Skeleton width="75%" height="0.75rem" />
    <Skeleton width="50%" height="0.875rem" />
  </div>
);

// ── Composite: ProductDetail ──────────────────────────────────────────────────

export const ProductDetailSkeleton = () => (
  <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
    <Skeleton width="200px" height="0.75rem" style={{ marginBottom: '1.5rem' }} />
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
      {/* Image side */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <Skeleton height="0" style={{ paddingBottom: '100%', borderRadius: '0.75rem' }} />
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} width="60px" height="60px" borderRadius="0.375rem" />)}
        </div>
      </div>
      {/* Info side */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <Skeleton width="40%" height="0.75rem" />
        <Skeleton width="85%" height="1.75rem" />
        <Skeleton width="60%" height="1.75rem" />
        <Skeleton width="30%" height="0.875rem" />
        <Skeleton width="25%" height="1.25rem" style={{ marginTop: '0.5rem' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
          <Skeleton width="80px" height="0.75rem" />
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} width="44px" height="44px" borderRadius="0.375rem" />)}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <Skeleton width="60px" height="0.75rem" />
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {[1, 2, 3].map((i) => <Skeleton key={i} width="44px" height="44px" borderRadius="50%" />)}
          </div>
        </div>
        <Skeleton height="3rem" borderRadius="0.375rem" style={{ marginTop: '0.75rem' }} />
      </div>
    </div>
  </div>
);

// ── Composite: OrderCard ──────────────────────────────────────────────────────

export const OrderCardSkeleton = () => (
  <div style={{ background: '#fff', borderRadius: '0.75rem', border: '1.5px solid #e8e2d9', overflow: 'hidden', padding: '1.1rem 1.25rem' }}>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', marginBottom: '0.9rem' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <Skeleton width="80px" height="0.65rem" />
        <Skeleton width="60%" height="0.9rem" />
        <Skeleton width="40%" height="0.75rem" />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
        <Skeleton width="80px" height="0.9rem" />
        <Skeleton width="60px" height="1.25rem" borderRadius="1rem" />
      </div>
    </div>
    <div style={{ display: 'flex', gap: '0.5rem' }}>
      {[1, 2, 3].map((i) => <Skeleton key={i} width="48px" height="48px" borderRadius="0.375rem" />)}
    </div>
  </div>
);
