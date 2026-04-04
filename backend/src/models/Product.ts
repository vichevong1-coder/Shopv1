import mongoose, { Document, Schema } from 'mongoose';

export interface IVariant {
  size: string;
  color: string;
  colorHex: string;
  stock: number;
  reservedStock: number;
  sku: string;
}

export interface IImage {
  url: string;
  publicId: string;
}

export interface IProduct extends Document {
  name: string;
  description: string;
  priceInCents: number;
  compareAtPriceInCents?: number;
  category: 'hat' | 'shirt' | 'pant' | 'shoe' | 'accessory';
  gender: 'men' | 'women' | 'kids' | 'unisex';
  brand: string;
  images: IImage[];
  variants: IVariant[];
  tags: string[];
  isFeatured: boolean;
  isActive: boolean;
  isDeleted: boolean;
  deletedAt?: Date;
  ratings: {
    average: number;
    count: number;
    distribution: { 1: number; 2: number; 3: number; 4: number; 5: number };
  };
}

const variantSchema = new Schema<IVariant>(
  {
    size: { type: String, required: true, trim: true },
    color: { type: String, required: true, trim: true },
    colorHex: { type: String, required: true, trim: true },
    stock: { type: Number, required: true, min: 0, default: 0 },
    reservedStock: { type: Number, required: true, min: 0, default: 0 },
    sku: { type: String, required: true, trim: true },
  },
  { _id: true }
);

const imageSchema = new Schema<IImage>(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
  },
  { _id: false }
);

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    priceInCents: { type: Number, required: true, min: 0 },
    compareAtPriceInCents: { type: Number, min: 0 },
    category: {
      type: String,
      required: true,
      enum: ['hat', 'shirt', 'pant', 'shoe', 'accessory'],
    },
    gender: {
      type: String,
      required: true,
      enum: ['men', 'women', 'kids', 'unisex'],
    },
    brand: { type: String, required: true, trim: true },
    images: [imageSchema],
    variants: [variantSchema],
    tags: [{ type: String, trim: true }],
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
    ratings: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0, min: 0 },
      distribution: {
        1: { type: Number, default: 0, min: 0 },
        2: { type: Number, default: 0, min: 0 },
        3: { type: Number, default: 0, min: 0 },
        4: { type: Number, default: 0, min: 0 },
        5: { type: Number, default: 0, min: 0 },
      },
    },
  },
  { timestamps: true }
);

// Compound index for catalog queries
productSchema.index({ gender: 1, category: 1, priceInCents: 1, isActive: 1, isDeleted: 1 });
productSchema.index({ isFeatured: 1, isActive: 1, isDeleted: 1 });
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

// Auto-exclude soft-deleted docs from find queries.
// If the query already contains an explicit `isDeleted` condition the hook is
// skipped — admin controllers use this to opt-in to seeing deleted documents.
productSchema.pre<mongoose.Query<IProduct[], IProduct>>('find', function () {
  const conditions = this.getFilter() as Record<string, unknown>;
  if (!('isDeleted' in conditions)) {
    this.where({ isDeleted: { $ne: true } });
  }
});

productSchema.pre<mongoose.Query<IProduct | null, IProduct>>('findOne', function () {
  const conditions = this.getFilter() as Record<string, unknown>;
  if (!('isDeleted' in conditions)) {
    this.where({ isDeleted: { $ne: true } });
  }
});

const Product = mongoose.model<IProduct>('Product', productSchema);

export default Product;
