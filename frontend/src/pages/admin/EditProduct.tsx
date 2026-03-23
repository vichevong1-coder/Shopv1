import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { fetchProduct, clearCurrentProduct } from '../../redux/slices/productSlice';
import AdminLayout from '../../components/layout/AdminLayout';
import ProductForm from '../../components/admin/ProductForm';
import Spinner from '../../components/common/Spinner';

const EditProduct = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentProduct, isLoading } = useAppSelector((s) => s.products);

  const isNew = !id;

  useEffect(() => {
    if (id) {
      dispatch(fetchProduct(id));
    }
    return () => {
      dispatch(clearCurrentProduct());
    };
  }, [dispatch, id]);

  const handleSuccess = () => navigate('/admin/products');

  const loadingProduct = id && isLoading && !currentProduct;
  const ready = isNew || (!isLoading && currentProduct);

  return (
    <AdminLayout>
      <div style={{ padding: '2rem', maxWidth: 900 }}>
        <button
          onClick={() => navigate('/admin/products')}
          style={{
            background: 'none',
            border: 'none',
            color: '#6b7280',
            cursor: 'pointer',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
            marginBottom: '1.5rem',
            padding: 0,
          }}
        >
          ← Back to Products
        </button>

        <h1 style={{ margin: '0 0 1.5rem', fontSize: '1.5rem', fontWeight: 700 }}>
          {isNew ? 'New Product' : 'Edit Product'}
        </h1>

        {loadingProduct && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
            <Spinner />
          </div>
        )}

        {ready && (
          <ProductForm
            product={isNew ? undefined : (currentProduct ?? undefined)}
            onSuccess={handleSuccess}
          />
        )}
      </div>
    </AdminLayout>
  );
};

export default EditProduct;
