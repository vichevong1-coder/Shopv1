import { useEffect, useState, useCallback } from 'react';
import type { ChangeEvent } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import {
  fetchAdminProducts,
  softDeleteProductThunk,
  restoreProductThunk,
} from '../../redux/slices/productSlice';
import type { Product } from '../../types/product';
import AdminLayout from '../../components/layout/AdminLayout';
import ProductsTable from '../../components/admin/ProductsTable';
import ProductForm from '../../components/admin/ProductForm';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';

const AdminProducts = () => {
  const dispatch = useAppDispatch();
  const { items, pagination, isLoading, error } = useAppSelector((s) => s.products);

  const [search, setSearch] = useState('');
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [page, setPage] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);

  const load = useCallback(() => {
    dispatch(fetchAdminProducts({ page, limit: 20, search: search || undefined, includeDeleted }));
  }, [dispatch, page, search, includeDeleted]);

  useEffect(() => {
    load();
  }, [load]);

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormOpen(true);
  };

  const handleNew = () => {
    setEditingProduct(undefined);
    setFormOpen(true);
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingProduct(undefined);
    load();
  };

  const handleDelete = async (product: Product) => {
    if (!confirm(`Delete "${product.name}"? This is a soft delete.`)) return;
    await dispatch(softDeleteProductThunk(product._id));
  };

  const handleRestore = async (product: Product) => {
    await dispatch(restoreProductThunk(product._id));
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  return (
    <AdminLayout>
      <div style={{ padding: '2rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>Products</h1>
            <p style={{ margin: '0.25rem 0 0', color: '#6b7280', fontSize: '0.875rem' }}>
              {pagination.total} total
            </p>
          </div>
          <Button onClick={handleNew}>+ New Product</Button>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
          <input
            type="text"
            placeholder="Search products…"
            value={search}
            onChange={handleSearchChange}
            style={{
              padding: '0.5rem 0.875rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              fontSize: '0.875rem',
              width: 280,
            }}
          />
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={includeDeleted}
              onChange={(e) => { setIncludeDeleted(e.target.checked); setPage(1); }}
            />
            Show deleted
          </label>
        </div>

        {/* Content */}
        {isLoading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
            <Spinner />
          </div>
        )}

        {error && (
          <p style={{ color: '#ef4444', fontSize: '0.875rem' }}>{error}</p>
        )}

        {!isLoading && (
          <div style={{ background: '#fff', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
            <ProductsTable
              products={items}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onRestore={handleRestore}
            />
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
            <Button
              variant="secondary"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              style={{ padding: '0.375rem 0.875rem' }}
            >
              ← Prev
            </Button>
            <span style={{ display: 'flex', alignItems: 'center', fontSize: '0.875rem', color: '#6b7280' }}>
              Page {page} of {pagination.pages}
            </span>
            <Button
              variant="secondary"
              disabled={page === pagination.pages}
              onClick={() => setPage((p) => p + 1)}
              style={{ padding: '0.375rem 0.875rem' }}
            >
              Next →
            </Button>
          </div>
        )}
      </div>

      {formOpen && (
        <ProductForm product={editingProduct} onClose={handleFormClose} />
      )}
    </AdminLayout>
  );
};

export default AdminProducts;
