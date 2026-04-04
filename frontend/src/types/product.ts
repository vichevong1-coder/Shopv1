export interface ProductVariant {
  _id: string;
  size: string;
  color: string;
  colorHex: string;
  stock: number;
  reservedStock: number;
  sku: string;
}

export interface ProductImage {
  url: string;
  publicId: string;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  priceInCents: number;
  compareAtPriceInCents?: number;
  category: 'hat' | 'shirt' | 'pant' | 'shoe' | 'accessory';
  gender: 'men' | 'women' | 'kids' | 'unisex';
  brand: string;
  images: ProductImage[];
  variants: ProductVariant[];
  tags: string[];
  isFeatured: boolean;
  isActive: boolean;
  isDeleted: boolean;
  deletedAt?: string;
  ratings: {
    average: number;
    count: number;
    distribution: { 1: number; 2: number; 3: number; 4: number; 5: number };
  };
  createdAt: string;
  updatedAt: string;
}

export interface ProductFilters {
  gender?: string;
  category?: string;
  size?: string;
  color?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  search?: string;
}

export interface ProductPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ProductState {
  items: Product[];
  featuredItems: Product[];
  currentProduct: Product | null;
  pagination: ProductPagination;
  filters: ProductFilters;
  isLoading: boolean;
  error: string | null;
}
