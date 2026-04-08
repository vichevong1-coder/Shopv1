import { useState } from 'react';
import type { ProductImage } from '../../types/product';

interface Props {
  images: ProductImage[];
  name: string;
}

const ProductImageGallery = ({ images, name }: Props) => {
  const [activeIdx, setActiveIdx] = useState(0);

  if (images.length === 0) {
    return (
      <div style={{ background: '#f3f4f6', borderRadius: '0.5rem', aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: '0.875rem' }}>
        No image
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {/* Main image */}
      <div style={{ borderRadius: '0.5rem', overflow: 'hidden', background: '#f8f5f1', aspectRatio: '3/4' }}>
        <img
          src={images[activeIdx].url}
          alt={name}
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {images.map((img, i) => (
            <button
              key={img.publicId || i}
              onClick={() => setActiveIdx(i)}
              style={{
                width: '4rem',
                height: '4rem',
                borderRadius: '0.375rem',
                overflow: 'hidden',
                border: i === activeIdx ? '2px solid #111827' : '2px solid transparent',
                cursor: 'pointer',
                padding: 0,
                background: '#f3f4f6',
              }}
            >
              <img src={img.url} alt={`${name} ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductImageGallery;
