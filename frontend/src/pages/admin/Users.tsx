import { useEffect, useState, useRef } from 'react';
import { getAdminUsers, type AdminUser } from '../../api/admin';
import AdminLayout from '../../components/layout/AdminLayout';
import UsersTable from '../../components/admin/UsersTable';
import Spinner from '../../components/common/Spinner';
import type { AdminPagination } from '../../types/order';

const AdminUsers = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [pagination, setPagination] = useState<AdminPagination>({ page: 1, limit: 20, total: 0, pages: 1 });
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = (p: number, q: string) => {
    setLoading(true);
    getAdminUsers({ page: p, limit: 20, search: q || undefined })
      .then(({ users: u, pagination: pg }) => {
        setUsers(u);
        setPagination(pg);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load(page, search);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleSearch = (value: string) => {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      load(1, value);
    }, 300);
  };

  return (
    <AdminLayout>
      <div style={{ padding: '2rem', maxWidth: '1000px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>
            Users
            {pagination.total > 0 && (
              <span style={{ marginLeft: '0.5rem', fontSize: '0.9rem', fontWeight: 400, color: '#9ca3af' }}>
                ({pagination.total})
              </span>
            )}
          </h1>
          <input
            type="search"
            placeholder="Search name or email…"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            style={{
              padding: '0.5rem 0.875rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              fontSize: '0.875rem',
              width: 240,
              outline: 'none',
            }}
          />
        </div>

        {/* Table card */}
        <div style={{ background: '#fff', borderRadius: '0.5rem', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
              <Spinner />
            </div>
          ) : (
            <UsersTable users={users} />
          )}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{
                padding: '0.4rem 0.875rem',
                border: '1px solid #e5e7eb',
                borderRadius: '0.375rem',
                background: '#fff',
                fontSize: '0.8125rem',
                cursor: page === 1 ? 'not-allowed' : 'pointer',
                color: page === 1 ? '#d1d5db' : '#374151',
              }}
            >
              ← Prev
            </button>
            <span style={{ fontSize: '0.8125rem', color: '#6b7280' }}>
              Page {page} of {pagination.pages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
              disabled={page === pagination.pages}
              style={{
                padding: '0.4rem 0.875rem',
                border: '1px solid #e5e7eb',
                borderRadius: '0.375rem',
                background: '#fff',
                fontSize: '0.8125rem',
                cursor: page === pagination.pages ? 'not-allowed' : 'pointer',
                color: page === pagination.pages ? '#d1d5db' : '#374151',
              }}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
