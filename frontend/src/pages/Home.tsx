import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { fetchFeaturedProducts } from '../redux/slices/productSlice';
import ProductGrid from '../components/product/ProductGrid';

const Home = () => {
  const dispatch = useAppDispatch();
  const { featuredItems, isLoading } = useAppSelector((s) => s.products);

  useEffect(() => {
    dispatch(fetchFeaturedProducts());
  }, [dispatch]);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', marginBottom: '1.5rem' }}>
        Featured
      </h1>
      <ProductGrid products={featuredItems} isLoading={isLoading} />
    </div>
  );
};

export default Home;
