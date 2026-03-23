import { useEffect, useState, useCallback, useMemo } from 'react';
import type { ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import {
  fetchAdminProducts,
  softDeleteProductThunk,
  restoreProductThunk,
} from '../../redux/slices/productSlice';
import type { Product } from '../../types/product';
import AdminLayout from '../../components/layout/AdminLayout';
import ProductsTable from '../../components/admin/ProductsTable';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';

type SortOption =
  | 'name_asc'
  | 'name_desc'
  | 'price_asc'
  | 'price_desc'
  | 'stock_asc'
  | 'stock_desc';

const CATEGORIES = ['', 'hat', 'shirt', 'pant', 'shoe', 'accessory'] as const;
const GENDERS = ['', 'men', 'women', 'kids', 'unisex'] as const;
type StatusFilter = 'all' | 'active' | 'inactive' | 'deleted';

const selectStyle: React.CSSProperties = {
  padding: '0.5rem 0.75rem',
  border: '1px solid #d1d5db',
  borderRadius: '0.375rem',
  fontSize: '0.8125rem',
  background: '#fff',
  cursor: 'pointer',
};

const totalStock = (p: Product) => p.variants.reduce((s, v) => s + v.stock, 0);

const AdminProducts = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items, pagination, isLoading, error } = useAppSelector((s) => s.products);

  // API-level filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [gender, setGender] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [page, setPage] = useState(1);

  // Client-side filters
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [sort, setSort] = useState<SortOption>('name_asc');

  const includeDeleted = status === 'deleted' || status === 'all';
  const isActive = status === 'active' ? true : status === 'inactive' ? false : undefined;

  const load = useCallback(() => {
    dispatch(
      fetchAdminProducts({
        page,
        limit: 20,
        search: search || undefined,
        includeDeleted: status === 'deleted' ? true : status === 'all' ? true : false,
        category: category || undefined,
        gender: gender || undefined,
        isActive,
      })
    );
  }, [dispatch, page, search, status, category, gender, isActive]);

  useEffect(() => {
    load();
  }, [load]);

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

  // Client-side low-stock filter + sort
  const displayedProducts = useMemo(() => {
    let list = [...items];

    if (lowStockOnly) {
      list = list.filter((p) => totalStock(p) <= 10);
    }

    list.sort((a, b) => {
      switch (sort) {
        case 'name_asc':
          return a.name.localeCompare(b.name);
        case 'name_desc':
          return b.name.localeCompare(a.name);
        case 'price_asc':
          return a.priceInCents - b.priceInCents;
        case 'price_desc':
          return b.priceInCents - a.priceInCents;
        case 'stock_asc':
          return totalStock(a) - totalStock(b);
        case 'stock_desc':
          return totalStock(b) - totalStock(a);
        default:
          return 0;
      }
    });

    return list;
  }, [items, lowStockOnly, sort]);

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
          <Button onClick={() => navigate('/admin/products/new')}>+ New Product</Button>
        </div>

        {/* Search */}
        <div style={{ marginBottom: '0.75rem' }}>
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
        </div>

        {/* Filter bar */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.625rem', alignItems: 'center', marginBottom: '1.25rem' }}>
          <select
            value={category}
            onChange={(e) => { setCategory(e.target.value); setPage(1); }}
            style={selectStyle}
          >
            <option value="">All Categories</option>
            {CATEGORIES.filter(Boolean).map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={gender}
            onChange={(e) => { setGender(e.target.value); setPage(1); }}
            style={selectStyle}
          >
            <option value="">All Genders</option>
            {GENDERS.filter(Boolean).map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>

          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value as StatusFilter); setPage(1); }}
            style={selectStyle}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="deleted">Deleted</option>
          </select>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', cursor: 'pointer', userSelect: 'none' }}>
            <input
              type="checkbox"
              checked={lowStockOnly}
              onChange={(e) => setLowStockOnly(e.target.checked)}
            />
            Low Stock only (≤10)
          </label>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            style={{ ...selectStyle, marginLeft: 'auto' }}
          >
            <option value="name_asc">Name A→Z</option>
            <option value="name_desc">Name Z→A</option>
            <option value="price_asc">Price ↑</option>
            <option value="price_desc">Price ↓</option>
            <option value="stock_asc">Stock ↑</option>
            <option value="stock_desc">Stock ↓</option>
          </select>
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
              products={displayedProducts}
              onEdit={(p) => navigate(`/admin/products/${p._id}/edit`)}
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
    </AdminLayout>
  );
};

export default AdminProducts;
