import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { CartItem, CartState } from '../../types/cart';
import * as cartApi from '../../api/cart';
import type { AddItemPayload } from '../../api/cart';
import { logoutThunk } from './authSlice';

const GUEST_CART_KEY = 'nimbus_guest_cart';

export const loadGuestCart = (): CartItem[] => {
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
};

const saveGuestCart = (items: CartItem[]) => {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
};

const initialState: CartState = {
  items: [],
  isLoading: false,
  error: null,
};

// ─── Async Thunks (DB — logged-in users) ─────────────────────────────────────

export const fetchCartThunk = createAsyncThunk(
  'cart/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const { items } = await cartApi.fetchCart();
      return items;
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message;
      return rejectWithValue(msg ?? 'Failed to fetch cart');
    }
  }
);

export const addItemThunk = createAsyncThunk(
  'cart/addItem',
  async (payload: AddItemPayload, { rejectWithValue }) => {
    try {
      const { items } = await cartApi.addItem(payload);
      return items;
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message;
      return rejectWithValue(msg ?? 'Failed to add item');
    }
  }
);

export const updateItemThunk = createAsyncThunk(
  'cart/updateItem',
  async ({ itemId, quantity }: { itemId: string; quantity: number }, { rejectWithValue }) => {
    try {
      const { items } = await cartApi.updateItem(itemId, quantity);
      return items;
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message;
      return rejectWithValue(msg ?? 'Failed to update item');
    }
  }
);

export const removeItemThunk = createAsyncThunk(
  'cart/removeItem',
  async (itemId: string, { rejectWithValue }) => {
    try {
      const { items } = await cartApi.removeItem(itemId);
      return items;
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message;
      return rejectWithValue(msg ?? 'Failed to remove item');
    }
  }
);

export const clearCartThunk = createAsyncThunk(
  'cart/clear',
  async (_, { rejectWithValue }) => {
    try {
      const { items } = await cartApi.clearCart();
      return items;
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message;
      return rejectWithValue(msg ?? 'Failed to clear cart');
    }
  }
);

export const mergeCartThunk = createAsyncThunk(
  'cart/merge',
  async (_, { rejectWithValue }) => {
    try {
      const guestItems = loadGuestCart();
      const payload = guestItems.map((i) => ({
        productId: i.productId,
        size: i.size,
        color: i.color,
        quantity: i.quantity,
      }));
      const { items } = guestItems.length > 0
        ? await cartApi.mergeCart(payload)
        : await cartApi.fetchCart();
      localStorage.removeItem('nimbus_guest_cart');
      return items;
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message;
      return rejectWithValue(msg ?? 'Failed to merge cart');
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setCartItems(state, action: { payload: CartItem[] }) {
      state.items = action.payload;
    },
    addItemLocal(state, action: { payload: CartItem }) {
      const item = action.payload;
      const idx = state.items.findIndex(
        (i) => i._id === item._id ||
          (i.productId === item.productId && i.size === item.size && i.color === item.color)
      );
      if (idx !== -1) {
        state.items[idx].quantity += item.quantity;
      } else {
        state.items.push(item);
      }
      saveGuestCart(state.items);
    },
    updateItemLocal(state, action: { payload: { _id: string; quantity: number } }) {
      const { _id, quantity } = action.payload;
      const idx = state.items.findIndex((i) => i._id === _id);
      if (idx !== -1) {
        state.items[idx].quantity = Math.max(1, quantity);
      }
      saveGuestCart(state.items);
    },
    removeItemLocal(state, action: { payload: string }) {
      state.items = state.items.filter((i) => i._id !== action.payload);
      saveGuestCart(state.items);
    },
    clearCartLocal(state) {
      state.items = [];
      localStorage.removeItem(GUEST_CART_KEY);
    },
  },
  extraReducers: (builder) => {
    const pending = (state: CartState) => {
      state.isLoading = true;
      state.error = null;
    };
    const rejected = (state: CartState, action: { payload: unknown }) => {
      state.isLoading = false;
      state.error = action.payload as string;
    };
    const fulfilled = (state: CartState, action: { payload: CartItem[] }) => {
      state.isLoading = false;
      state.items = action.payload;
    };

    builder
      .addCase(fetchCartThunk.pending, pending)
      .addCase(fetchCartThunk.fulfilled, fulfilled)
      .addCase(fetchCartThunk.rejected, rejected);

    builder
      .addCase(addItemThunk.pending, pending)
      .addCase(addItemThunk.fulfilled, fulfilled)
      .addCase(addItemThunk.rejected, rejected);

    builder
      .addCase(updateItemThunk.pending, pending)
      .addCase(updateItemThunk.fulfilled, fulfilled)
      .addCase(updateItemThunk.rejected, rejected);

    builder
      .addCase(removeItemThunk.pending, pending)
      .addCase(removeItemThunk.fulfilled, fulfilled)
      .addCase(removeItemThunk.rejected, rejected);

    builder
      .addCase(clearCartThunk.pending, pending)
      .addCase(clearCartThunk.fulfilled, fulfilled)
      .addCase(clearCartThunk.rejected, rejected);

    builder
      .addCase(mergeCartThunk.pending, pending)
      .addCase(mergeCartThunk.fulfilled, fulfilled)
      .addCase(mergeCartThunk.rejected, rejected);

    // Clear cart state on logout
    builder.addCase(logoutThunk.fulfilled, (state) => {
      state.items = [];
      state.error = null;
    });
  },
});

export const {
  setCartItems,
  addItemLocal,
  updateItemLocal,
  removeItemLocal,
  clearCartLocal,
} = cartSlice.actions;

export default cartSlice.reducer;
