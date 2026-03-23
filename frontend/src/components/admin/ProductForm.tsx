import { useState, useRef } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import type { Product, ProductVariant, ProductImage } from '../../types/product';
import { useAppDispatch } from '../../redux/hooks';
import { createProductThunk, updateProductThunk } from '../../redux/slices/productSlice';
import { getUploadSignature } from '../../api/upload';
import { uploadToSupabase } from '../../utils/supabaseUpload';
import Button from '../common/Button';
import Input from '../common/Input';

interface Props {
  product?: Product;
  onSuccess?: () => void;
}

type SizeRow = { _id?: string; size: string; stock: number; sku: string };
type ColorGroup = { color: string; colorHex: string; sizes: SizeRow[] };
type VariantDraft = Omit<ProductVariant, '_id'> & { _id?: string };

const CATEGORIES = ['hat', 'shirt', 'pant', 'shoe', 'accessory'] as const;
const GENDERS = ['men', 'women', 'kids', 'unisex'] as const;
type Tab = 'general' | 'images' | 'variants';

const emptyGroup = (): ColorGroup => ({
  color: '',
  colorHex: '#000000',
  sizes: [{ size: '', stock: 0, sku: '' }],
});

const variantsToGroups = (variants: ProductVariant[]): ColorGroup[] => {
  if (!variants.length) return [emptyGroup()];
  return variants.reduce<ColorGroup[]>((acc, v) => {
    const existing = acc.find((g) => g.color === v.color);
    if (existing) {
      existing.sizes.push({ _id: v._id, size: v.size, stock: v.stock, sku: v.sku });
    } else {
      acc.push({
        color: v.color,
        colorHex: v.colorHex,
        sizes: [{ _id: v._id, size: v.size, stock: v.stock, sku: v.sku }],
      });
    }
    return acc;
  }, []);
};

const groupsToVariants = (groups: ColorGroup[]): VariantDraft[] =>
  groups.flatMap((g) =>
    g.sizes.map((s) => ({
      ...(s._id ? { _id: s._id } : {}),
      size: s.size,
      color: g.color,
      colorHex: g.colorHex,
      stock: s.stock,
      reservedStock: 0,
      sku: s.sku,
    }))
  );

const ProductForm = ({ product, onSuccess }: Props) => {
  const dispatch = useAppDispatch();
  const fileRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<Tab>('general');

  // General Info state
  const [name, setName] = useState(product?.name ?? '');
  const [description, setDescription] = useState(product?.description ?? '');
  const [brand, setBrand] = useState(product?.brand ?? '');
  const [category, setCategory] = useState<Product['category']>(product?.category ?? 'shirt');
  const [gender, setGender] = useState<Product['gender']>(product?.gender ?? 'unisex');
  const [priceStr, setPriceStr] = useState(product ? String(product.priceInCents / 100) : '');
  const [compareStr, setCompareStr] = useState(
    product?.compareAtPriceInCents ? String(product.compareAtPriceInCents / 100) : ''
  );
  const [tags, setTags] = useState(product?.tags.join(', ') ?? '');
  const [isFeatured, setIsFeatured] = useState(product?.isFeatured ?? false);
  const [isActive, setIsActive] = useState(product?.isActive ?? true);

  // Images state
  const [images, setImages] = useState<ProductImage[]>(product?.images ?? []);
  const [uploading, setUploading] = useState(false);

  // Variants state (color-grouped)
  const [colorGroups, setColorGroups] = useState<ColorGroup[]>(
    product ? variantsToGroups(product.variants) : [emptyGroup()]
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // ── Image upload ─────────────────────────────────────────────────────────────

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    setError('');
    try {
      const signedParams = await getUploadSignature();
      const results = await Promise.all(files.map((f) => uploadToSupabase(f, signedParams)));
      setImages((prev) => [...prev, ...results]);
    } catch (err: unknown) {
      setError((err as Error).message ?? 'Image upload failed');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const removeImage = (idx: number) =>
    setImages((prev) => prev.filter((_, i) => i !== idx));

  // ── Color group helpers ──────────────────────────────────────────────────────

  const updateGroup = <K extends keyof ColorGroup>(gi: number, key: K, value: ColorGroup[K]) => {
    setColorGroups((prev) => prev.map((g, i) => (i === gi ? { ...g, [key]: value } : g)));
  };

  const updateSize = <K extends keyof SizeRow>(gi: number, si: number, key: K, value: SizeRow[K]) => {
    setColorGroups((prev) =>
      prev.map((g, i) =>
        i === gi
          ? { ...g, sizes: g.sizes.map((s, j) => (j === si ? { ...s, [key]: value } : s)) }
          : g
      )
    );
  };

  const addSizeToGroup = (gi: number) => {
    setColorGroups((prev) =>
      prev.map((g, i) =>
        i === gi ? { ...g, sizes: [...g.sizes, { size: '', stock: 0, sku: '' }] } : g
      )
    );
  };

  const removeSizeFromGroup = (gi: number, si: number) => {
    setColorGroups((prev) =>
      prev.map((g, i) =>
        i === gi ? { ...g, sizes: g.sizes.filter((_, j) => j !== si) } : g
      )
    );
  };

  const addColorGroup = () => setColorGroups((prev) => [...prev, emptyGroup()]);

  const removeColorGroup = (gi: number) =>
    setColorGroups((prev) => prev.filter((_, i) => i !== gi));

  // ── Submit ───────────────────────────────────────────────────────────────────

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    const priceInCents = Math.round(parseFloat(priceStr) * 100);
    if (isNaN(priceInCents) || priceInCents <= 0) {
      setError('Enter a valid price');
      setActiveTab('general');
      return;
    }

    const body: Partial<Product> = {
      name,
      description,
      brand,
      category,
      gender,
      priceInCents,
      compareAtPriceInCents: compareStr ? Math.round(parseFloat(compareStr) * 100) : undefined,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      isFeatured,
      isActive,
      images,
      variants: groupsToVariants(colorGroups) as ProductVariant[],
    };

    setSaving(true);
    try {
      if (product) {
        await dispatch(updateProductThunk({ id: product._id, body })).unwrap();
      } else {
        await dispatch(createProductThunk(body)).unwrap();
      }
      onSuccess?.();
    } catch (err: unknown) {
      setError(typeof err === 'string' ? err : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  // ── Styles ───────────────────────────────────────────────────────────────────

  const selectStyle: React.CSSProperties = {
    padding: '0.625rem 0.875rem',
    borderRadius: '0.375rem',
    border: '1px solid #d1d5db',
    fontSize: '0.875rem',
    width: '100%',
    boxSizing: 'border-box',
    background: '#fff',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '0.875rem',
    fontWeight: 500,
    color: '#374151',
  };

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: '0.625rem 1.25rem',
    border: 'none',
    borderBottom: active ? '2px solid #6366f1' : '2px solid transparent',
    background: 'none',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: active ? 600 : 400,
    color: active ? '#6366f1' : '#6b7280',
    transition: 'color 0.15s',
  });

  const totalGroupStock = (g: ColorGroup) => g.sizes.reduce((s, r) => s + r.stock, 0);

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <p style={{ color: '#ef4444', fontSize: '0.875rem', marginBottom: '1rem' }}>{error}</p>
      )}

      {/* Tab bar */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', marginBottom: '1.5rem' }}>
        {(['general', 'images', 'variants'] as Tab[]).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            style={tabStyle(activeTab === tab)}
          >
            {tab === 'general' ? 'General Info' : tab === 'images' ? 'Images' : 'Variants & Stock'}
          </button>
        ))}
      </div>

      {/* ── Tab: General Info ── */}
      {activeTab === 'general' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
            <Input label="Brand" value={brand} onChange={(e) => setBrand(e.target.value)} required />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <label style={labelStyle}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
              style={{ ...selectStyle, resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <label style={labelStyle}>Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Product['category'])}
                style={selectStyle}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <label style={labelStyle}>Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as Product['gender'])}
                style={selectStyle}
              >
                {GENDERS.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input
              label="Price (USD)"
              type="number"
              min="0"
              step="0.01"
              placeholder="29.99"
              value={priceStr}
              onChange={(e) => setPriceStr(e.target.value)}
              required
            />
            <Input
              label="Compare-at Price (USD)"
              type="number"
              min="0"
              step="0.01"
              placeholder="39.99"
              value={compareStr}
              onChange={(e) => setCompareStr(e.target.value)}
            />
          </div>

          <Input
            label="Tags (comma-separated)"
            placeholder="summer, casual, new"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />

          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} />
              Featured
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
              Active
            </label>
          </div>
        </div>
      )}

      {/* ── Tab: Images ── */}
      {activeTab === 'images' && (
        <div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
            {images.map((img, i) => (
              <div key={img.publicId} style={{ position: 'relative' }}>
                <img
                  src={img.url}
                  alt=""
                  style={{ width: 96, height: 96, objectFit: 'cover', borderRadius: '0.375rem', border: '1px solid #e5e7eb' }}
                />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  style={{
                    position: 'absolute', top: 4, right: 4,
                    background: 'rgba(0,0,0,0.6)', color: '#fff',
                    border: 'none', borderRadius: '50%',
                    width: 22, height: 22, fontSize: '0.625rem',
                    cursor: 'pointer', lineHeight: 1,
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          {images.length === 0 && (
            <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginBottom: '1rem' }}>No images yet.</p>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <Button
            type="button"
            variant="secondary"
            loading={uploading}
            onClick={() => fileRef.current?.click()}
          >
            {uploading ? 'Uploading…' : '+ Add Images'}
          </Button>
        </div>
      )}

      {/* ── Tab: Variants & Stock ── */}
      {activeTab === 'variants' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {colorGroups.map((group, gi) => {
            const totalStock = totalGroupStock(group);
            return (
              <div
                key={gi}
                style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  overflow: 'hidden',
                }}
              >
                {/* Color group header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem 1rem',
                    background: '#f9fafb',
                    borderBottom: '1px solid #e5e7eb',
                  }}
                >
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      background: group.colorHex,
                      border: '1px solid #d1d5db',
                      flexShrink: 0,
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Color name"
                    value={group.color}
                    onChange={(e) => updateGroup(gi, 'color', e.target.value)}
                    style={{
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      padding: '0.375rem 0.625rem',
                      fontSize: '0.875rem',
                      width: 140,
                    }}
                  />
                  <input
                    type="color"
                    value={group.colorHex}
                    onChange={(e) => updateGroup(gi, 'colorHex', e.target.value)}
                    style={{
                      width: 36,
                      height: 32,
                      padding: 2,
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      cursor: 'pointer',
                    }}
                  />
                  <span style={{ fontSize: '0.8125rem', color: '#6b7280', marginLeft: 'auto' }}>
                    Total: {totalStock} units
                  </span>
                  <button
                    type="button"
                    onClick={() => removeColorGroup(gi)}
                    disabled={colorGroups.length === 1}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#ef4444',
                      cursor: colorGroups.length === 1 ? 'not-allowed' : 'pointer',
                      fontSize: '1rem',
                      opacity: colorGroups.length === 1 ? 0.3 : 1,
                      padding: '0.125rem 0.25rem',
                    }}
                  >
                    ✕
                  </button>
                </div>

                {/* Sizes table */}
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e5e7eb', background: '#fff' }}>
                      {['Size', 'Stock', 'SKU', ''].map((h) => (
                        <th
                          key={h}
                          style={{
                            padding: '0.5rem 0.75rem',
                            textAlign: 'left',
                            fontWeight: 600,
                            color: '#6b7280',
                            fontSize: '0.75rem',
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {group.sizes.map((row, si) => {
                      const stockCellBg =
                        row.stock === 0
                          ? '#fef2f2'
                          : row.stock <= 5
                          ? '#fef3c7'
                          : 'transparent';
                      const stockCellColor =
                        row.stock === 0
                          ? '#991b1b'
                          : row.stock <= 5
                          ? '#92400e'
                          : '#111827';

                      return (
                        <tr key={si} style={{ borderBottom: '1px solid #f3f4f6' }}>
                          <td style={{ padding: '0.5rem 0.75rem', width: 140 }}>
                            <input
                              type="text"
                              placeholder="M"
                              value={row.size}
                              onChange={(e) => updateSize(gi, si, 'size', e.target.value)}
                              style={{
                                border: '1px solid #d1d5db',
                                borderRadius: '0.375rem',
                                padding: '0.375rem 0.5rem',
                                fontSize: '0.8125rem',
                                width: '100%',
                              }}
                            />
                          </td>
                          <td style={{ padding: '0.5rem 0.75rem', width: 120, background: stockCellBg }}>
                            <input
                              type="number"
                              min="0"
                              value={row.stock}
                              onChange={(e) =>
                                updateSize(gi, si, 'stock', parseInt(e.target.value, 10) || 0)
                              }
                              style={{
                                border: '1px solid #d1d5db',
                                borderRadius: '0.375rem',
                                padding: '0.375rem 0.5rem',
                                fontSize: '0.8125rem',
                                width: '100%',
                                color: stockCellColor,
                                fontWeight: row.stock <= 5 ? 600 : 400,
                              }}
                            />
                          </td>
                          <td style={{ padding: '0.5rem 0.75rem' }}>
                            <input
                              type="text"
                              placeholder="SKU-001"
                              value={row.sku}
                              onChange={(e) => updateSize(gi, si, 'sku', e.target.value)}
                              style={{
                                border: '1px solid #d1d5db',
                                borderRadius: '0.375rem',
                                padding: '0.375rem 0.5rem',
                                fontSize: '0.8125rem',
                                width: '100%',
                              }}
                            />
                          </td>
                          <td style={{ padding: '0.5rem 0.75rem', width: 40 }}>
                            <button
                              type="button"
                              onClick={() => removeSizeFromGroup(gi, si)}
                              disabled={group.sizes.length === 1}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#ef4444',
                                cursor: group.sizes.length === 1 ? 'not-allowed' : 'pointer',
                                fontSize: '0.875rem',
                                opacity: group.sizes.length === 1 ? 0.3 : 1,
                                padding: '0.125rem',
                              }}
                            >
                              ✕
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                <div style={{ padding: '0.625rem 0.75rem', borderTop: '1px solid #f3f4f6' }}>
                  <button
                    type="button"
                    onClick={() => addSizeToGroup(gi)}
                    style={{
                      background: 'none',
                      border: '1px dashed #d1d5db',
                      borderRadius: '0.375rem',
                      padding: '0.375rem 0.875rem',
                      fontSize: '0.8125rem',
                      color: '#6b7280',
                      cursor: 'pointer',
                    }}
                  >
                    + Add Size to this color
                  </button>
                </div>
              </div>
            );
          })}

          <Button type="button" variant="secondary" onClick={addColorGroup}>
            + Add Color
          </Button>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '2rem', borderTop: '1px solid #e5e7eb', marginTop: '2rem' }}>
        <Button type="button" variant="secondary" onClick={() => onSuccess?.()}>
          Cancel
        </Button>
        <Button type="submit" loading={saving}>
          {product ? 'Save Changes' : 'Create Product'}
        </Button>
      </div>
    </form>
  );
};

export default ProductForm;
