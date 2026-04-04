import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { ProductState, ProductFilters } from '../../types/product';
import * as productApi from '../../api/product';
import * as adminApi from '../../api/admin';

const initialState: ProductState = {
  items: [],
  featuredItems: [],
  currentProduct: null,
  pagination: { page: 1, limit: 16, total: 0, pages: 0 },
  filters: {},
  isLoading: false,
  error: null,
};

export const fetchProducts = createAsyncThunk(
  'products/fetchPublic',
  async (
    params: ProductFilters & { page?: number; limit?: number },
    { rejectWithValue }
  ) => {
    try {
      return await productApi.listProducts(params);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message;
      return rejectWithValue(msg ?? 'Failed to fetch products');
    }
  }
);

export const fetchFeaturedProducts = createAsyncThunk(
  'products/fetchFeatured',
  async (_, { rejectWithValue }) => {
    try {
      const { products } = await productApi.getFeaturedProducts();
      return products;
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message;
      return rejectWithValue(msg ?? 'Failed to fetch featured products');
    }
  }
);

export const fetchAdminProducts = createAsyncThunk(
  'products/fetchAdmin',
  async (
    params: { page?: number; limit?: number; search?: string; includeDeleted?: boolean; category?: string; gender?: string; isActive?: boolean },
    { rejectWithValue }
  ) => {
    try {
      return await adminApi.adminListProducts(params);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message;
      return rejectWithValue(msg ?? 'Failed to fetch products');
    }
  }
);

export const fetchProduct = createAsyncThunk(
  'products/fetchOne',
  async (id: string, { rejectWithValue }) => {
    try {
      const { product } = await productApi.getProduct(id);
      return product;
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message;
      return rejectWithValue(msg ?? 'Failed to fetch product');
    }
  }
);

export const createProductThunk = createAsyncThunk(
  'products/create',
  async (body: Parameters<typeof productApi.createProduct>[0], { rejectWithValue }) => {
    try {
      const { product } = await productApi.createProduct(body);
      return product;
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message;
      return rejectWithValue(msg ?? 'Failed to create product');
    }
  }
);

export const updateProductThunk = createAsyncThunk(
  'products/update',
  async (
    { id, body }: { id: string; body: Parameters<typeof productApi.updateProduct>[1] },
    { rejectWithValue }
  ) => {
    try {
      const { product } = await productApi.updateProduct(id, body);
      return product;
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message;
      return rejectWithValue(msg ?? 'Failed to update product');
    }
  }
);

export const softDeleteProductThunk = createAsyncThunk(
  'products/softDelete',
  async (id: string, { rejectWithValue }) => {
    try {
      const { product } = await productApi.softDeleteProduct(id);
      return product;
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message;
      return rejectWithValue(msg ?? 'Failed to delete product');
    }
  }
);

export const restoreProductThunk = createAsyncThunk(
  'products/restore',
  async (id: string, { rejectWithValue }) => {
    try {
      const { product } = await productApi.restoreProduct(id);
      return product;
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message;
      return rejectWithValue(msg ?? 'Failed to restore product');
    }
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setFilters(state, action: { payload: ProductFilters }) {
      state.filters = action.payload;
    },
    clearCurrentProduct(state) {
      state.currentProduct = null;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    const pending = (state: ProductState) => {
      state.isLoading = true;
      state.error = null;
    };
    const rejected = (state: ProductState, action: { payload: unknown }) => {
      state.isLoading = false;
      state.error = action.payload as string;
    };

    builder
      .addCase(fetchProducts.pending, pending)
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.products;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchProducts.rejected, rejected);

    builder
      .addCase(fetchFeaturedProducts.pending, pending)
      .addCase(fetchFeaturedProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.featuredItems = action.payload;
      })
      .addCase(fetchFeaturedProducts.rejected, rejected);

    builder
      .addCase(fetchAdminProducts.pending, pending)
      .addCase(fetchAdminProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.products;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchAdminProducts.rejected, rejected);

    builder
      .addCase(fetchProduct.pending, pending)
      .addCase(fetchProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentProduct = action.payload;
      })
      .addCase(fetchProduct.rejected, rejected);

    builder
      .addCase(createProductThunk.pending, pending)
      .addCase(createProductThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items.unshift(action.payload);
        state.pagination.total += 1;
      })
      .addCase(createProductThunk.rejected, rejected);

    builder
      .addCase(updateProductThunk.pending, pending)
      .addCase(updateProductThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        const idx = state.items.findIndex((p) => p._id === action.payload._id);
        if (idx !== -1) state.items[idx] = action.payload;
        if (state.currentProduct?._id === action.payload._id) {
          state.currentProduct = action.payload;
        }
      })
      .addCase(updateProductThunk.rejected, rejected);

    builder
      .addCase(softDeleteProductThunk.pending, pending)
      .addCase(softDeleteProductThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        const idx = state.items.findIndex((p) => p._id === action.payload._id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(softDeleteProductThunk.rejected, rejected);

    builder
      .addCase(restoreProductThunk.pending, pending)
      .addCase(restoreProductThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        const idx = state.items.findIndex((p) => p._id === action.payload._id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(restoreProductThunk.rejected, rejected);
  },
});

export const { setFilters, clearCurrentProduct, clearError } = productSlice.actions;
export default productSlice.reducer;
