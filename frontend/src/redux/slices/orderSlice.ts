import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { Order, OrderState } from '../../types/order';
import * as orderApi from '../../api/order';
import type { CreateOrderPayload, GetAllOrdersParams } from '../../api/order';

const initialState: OrderState = {
  orders: [],
  currentOrder: null,
  adminOrders: [],
  adminPagination: { page: 1, limit: 20, total: 0, pages: 1 },
  isLoading: false,
  error: null,
};

// ─── Async Thunks ─────────────────────────────────────────────────────────────

export const createOrderThunk = createAsyncThunk(
  'orders/create',
  async (payload: CreateOrderPayload, { rejectWithValue }) => {
    try {
      return await orderApi.createOrder(payload);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message;
      return rejectWithValue(msg ?? 'Failed to create order');
    }
  }
);

export const fetchMyOrdersThunk = createAsyncThunk(
  'orders/fetchMine',
  async (_, { rejectWithValue }) => {
    try {
      return await orderApi.getMyOrders();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message;
      return rejectWithValue(msg ?? 'Failed to fetch orders');
    }
  }
);

export const fetchOrderByIdThunk = createAsyncThunk(
  'orders/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      return await orderApi.getOrderById(id);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message;
      return rejectWithValue(msg ?? 'Failed to fetch order');
    }
  }
);

export const fetchAllOrdersThunk = createAsyncThunk(
  'orders/fetchAll',
  async (params: GetAllOrdersParams, { rejectWithValue }) => {
    try {
      return await orderApi.getAllOrders(params);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message;
      return rejectWithValue(msg ?? 'Failed to fetch orders');
    }
  }
);

export const updateOrderStatusThunk = createAsyncThunk(
  'orders/updateStatus',
  async ({ orderId, status }: { orderId: string; status: string }, { rejectWithValue }) => {
    try {
      return await orderApi.updateOrderStatus(orderId, status);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message;
      return rejectWithValue(msg ?? 'Failed to update status');
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearCurrentOrder(state) {
      state.currentOrder = null;
    },
    clearOrderError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    const pending = (state: OrderState) => {
      state.isLoading = true;
      state.error = null;
    };
    const rejected = (state: OrderState, action: { payload: unknown }) => {
      state.isLoading = false;
      state.error = action.payload as string;
    };

    builder
      .addCase(createOrderThunk.pending, pending)
      .addCase(createOrderThunk.fulfilled, (state, action: { payload: Order }) => {
        state.isLoading = false;
        state.currentOrder = action.payload;
        state.orders.unshift(action.payload);
      })
      .addCase(createOrderThunk.rejected, rejected);

    builder
      .addCase(fetchMyOrdersThunk.pending, pending)
      .addCase(fetchMyOrdersThunk.fulfilled, (state, action: { payload: Order[] }) => {
        state.isLoading = false;
        state.orders = action.payload;
      })
      .addCase(fetchMyOrdersThunk.rejected, rejected);

    builder
      .addCase(fetchOrderByIdThunk.pending, pending)
      .addCase(fetchOrderByIdThunk.fulfilled, (state, action: { payload: Order }) => {
        state.isLoading = false;
        state.currentOrder = action.payload;
      })
      .addCase(fetchOrderByIdThunk.rejected, rejected);

    builder
      .addCase(fetchAllOrdersThunk.pending, pending)
      .addCase(fetchAllOrdersThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.adminOrders = action.payload.orders;
        state.adminPagination = action.payload.pagination;
      })
      .addCase(fetchAllOrdersThunk.rejected, rejected);

    builder
      .addCase(updateOrderStatusThunk.pending, (state) => { state.error = null; })
      .addCase(updateOrderStatusThunk.fulfilled, (state, action) => {
        const updated = action.payload;
        const idx = state.adminOrders.findIndex((o) => o._id === updated._id);
        if (idx !== -1) state.adminOrders[idx] = updated;
        // Also sync currentOrder so the detail page reflects the change immediately
        if (state.currentOrder?._id === updated._id) state.currentOrder = updated;
      })
      .addCase(updateOrderStatusThunk.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearCurrentOrder, clearOrderError } = orderSlice.actions;

export default orderSlice.reducer;
