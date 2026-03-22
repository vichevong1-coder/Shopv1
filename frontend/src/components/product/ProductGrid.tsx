import type { Product } from '../../types/product';
import ProductCard from './ProductCard';
import Skeleton from '../common/Skeleton';

interface Props {
  products: Product[];
  isLoading?: boolean;
}

const SKELETON_COUNT = 8;

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
  gap: '1.5rem',
};

const ProductGrid = ({ products, isLoading = false }: Props) => {
  if (isLoading) {
    return (
      <div style={gridStyle}>
        {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <Skeleton height="200px" borderRadius="0.5rem" />
            <Skeleton width="60%" height="0.75rem" />
            <Skeleton width="80%" height="1rem" />
            <Skeleton width="40%" height="0.875rem" />
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 0', color: '#6b7280' }}>
        No products found.
      </div>
    );
  }

  return (
    <div style={gridStyle}>
      {products.map((p) => (
        <ProductCard key={p._id} product={p} />
      ))}
    </div>
  );
};

export default ProductGrid;
