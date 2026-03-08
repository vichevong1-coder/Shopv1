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
  onClose: () => void;
}

type VariantDraft = Omit<ProductVariant, '_id'> & { _id?: string };

const CATEGORIES = ['hat', 'shirt', 'pant', 'shoe', 'accessory'] as const;
const GENDERS = ['men', 'women', 'kids', 'unisex'] as const;

const emptyVariant = (): VariantDraft => ({
  size: '',
  color: '',
  colorHex: '#000000',
  stock: 0,
  reservedStock: 0,
  sku: '',
});

const ProductForm = ({ product, onClose }: Props) => {
  const dispatch = useAppDispatch();
  const fileRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(product?.name ?? '');
  const [description, setDescription] = useState(product?.description ?? '');
  const [brand, setBrand] = useState(product?.brand ?? '');
  const [category, setCategory] = useState<Product['category']>(product?.category ?? 'shirt');
  const [gender, setGender] = useState<Product['gender']>(product?.gender ?? 'unisex');
  // Prices stored as dollar strings for the input; converted to cents on submit
  const [priceStr, setPriceStr] = useState(
    product ? String(product.priceInCents / 100) : ''
  );
  const [compareStr, setCompareStr] = useState(
    product?.compareAtPriceInCents ? String(product.compareAtPriceInCents / 100) : ''
  );
  const [tags, setTags] = useState(product?.tags.join(', ') ?? '');
  const [isFeatured, setIsFeatured] = useState(product?.isFeatured ?? false);
  const [isActive, setIsActive] = useState(product?.isActive ?? true);
  const [images, setImages] = useState<ProductImage[]>(product?.images ?? []);
  const [variants, setVariants] = useState<VariantDraft[]>(
    product?.variants.length ? product.variants : [emptyVariant()]
  );

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // ── Image upload ────────────────────────────────────────────────────────────

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

  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  // ── Variant helpers ─────────────────────────────────────────────────────────

  const updateVariant = <K extends keyof VariantDraft>(
    idx: number,
    key: K,
    value: VariantDraft[K]
  ) => {
    setVariants((prev) => prev.map((v, i) => (i === idx ? { ...v, [key]: value } : v)));
  };

  const addVariant = () => setVariants((prev) => [...prev, emptyVariant()]);
  const removeVariant = (idx: number) =>
    setVariants((prev) => prev.filter((_, i) => i !== idx));

  // ── Submit ──────────────────────────────────────────────────────────────────

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    const priceInCents = Math.round(parseFloat(priceStr) * 100);
    if (isNaN(priceInCents) || priceInCents <= 0) {
      setError('Enter a valid price');
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
      variants: variants as ProductVariant[],
    };

    setSaving(true);
    try {
      if (product) {
        await dispatch(updateProductThunk({ id: product._id, body })).unwrap();
      } else {
        await dispatch(createProductThunk(body)).unwrap();
      }
      onClose();
    } catch (err: unknown) {
      setError(typeof err === 'string' ? err : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  const selectStyle: React.CSSProperties = {
    padding: '0.625rem 0.875rem',
    borderRadius: '0.375rem',
    border: '1px solid #d1d5db',
    fontSize: '0.875rem',
    width: '100%',
    boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '0.875rem',
    fontWeight: 500,
    color: '#374151',
  };

  return (
    /* Backdrop */
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        overflowY: 'auto',
        zIndex: 1000,
        padding: '2rem 1rem',
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: '0.5rem',
          width: '100%',
          maxWidth: 720,
          padding: '2rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700 }}>
            {product ? 'Edit Product' : 'New Product'}
          </h2>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#6b7280' }}
          >
            ✕
          </button>
        </div>

        {error && (
          <p style={{ color: '#ef4444', fontSize: '0.875rem', marginBottom: '1rem' }}>{error}</p>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Basic info */}
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label="Brand" value={brand} onChange={(e) => setBrand(e.target.value)} required />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            <label style={labelStyle}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={3}
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

          {/* Images */}
          <div>
            <label style={{ ...labelStyle, display: 'block', marginBottom: '0.5rem' }}>Images</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
              {images.map((img, i) => (
                <div key={img.publicId} style={{ position: 'relative' }}>
                  <img
                    src={img.url}
                    alt=""
                    style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: '0.375rem', border: '1px solid #e5e7eb' }}
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    style={{
                      position: 'absolute', top: 2, right: 2,
                      background: 'rgba(0,0,0,0.6)', color: '#fff',
                      border: 'none', borderRadius: '50%',
                      width: 20, height: 20, fontSize: '0.625rem',
                      cursor: 'pointer', lineHeight: 1,
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
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
              {uploading ? 'Uploading…' : 'Add Images'}
            </Button>
          </div>

          {/* Variants */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label style={labelStyle}>Variants</label>
              <Button type="button" variant="secondary" onClick={addVariant} style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}>
                + Add Variant
              </Button>
            </div>

            {variants.map((v, i) => (
              <div
                key={i}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr auto 1fr 1fr auto',
                  gap: '0.5rem',
                  alignItems: 'end',
                  marginBottom: '0.625rem',
                  background: '#f9fafb',
                  padding: '0.75rem',
                  borderRadius: '0.375rem',
                }}
              >
                <Input
                  label="Size"
                  placeholder="M"
                  value={v.size}
                  onChange={(e) => updateVariant(i, 'size', e.target.value)}
                  required
                />
                <Input
                  label="Color"
                  placeholder="Black"
                  value={v.color}
                  onChange={(e) => updateVariant(i, 'color', e.target.value)}
                  required
                />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                  <label style={labelStyle}>Hex</label>
                  <input
                    type="color"
                    value={v.colorHex}
                    onChange={(e) => updateVariant(i, 'colorHex', e.target.value)}
                    style={{ width: 40, height: 38, padding: 2, border: '1px solid #d1d5db', borderRadius: '0.375rem', cursor: 'pointer' }}
                  />
                </div>
                <Input
                  label="Stock"
                  type="number"
                  min="0"
                  value={String(v.stock)}
                  onChange={(e) => updateVariant(i, 'stock', parseInt(e.target.value, 10) || 0)}
                  required
                />
                <Input
                  label="SKU"
                  placeholder="SKU-001"
                  value={v.sku}
                  onChange={(e) => updateVariant(i, 'sku', e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => removeVariant(i)}
                  disabled={variants.length === 1}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#ef4444',
                    cursor: variants.length === 1 ? 'not-allowed' : 'pointer',
                    fontSize: '1rem',
                    padding: '0.25rem',
                    opacity: variants.length === 1 ? 0.4 : 1,
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '0.5rem' }}>
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              {product ? 'Save Changes' : 'Create Product'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;
