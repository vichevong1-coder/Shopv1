import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { AuthState } from '../../types/user';
import * as authApi from '../../api/auth';

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isLoading: false,
  isInitialized: false,
  error: null,
};

// Restore session on app load using the httpOnly refresh cookie
export const initAuth = createAsyncThunk(
  'auth/init',
  async (_, { rejectWithValue }) => {
    try {
      const { accessToken } = await authApi.refreshToken();
      const { user } = await authApi.getMe(accessToken);
      return { user, accessToken };
    } catch {
      return rejectWithValue(null);
    }
  }
);

export const loginThunk = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      return await authApi.login(credentials);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message;
      return rejectWithValue(msg ?? 'Login failed');
    }
  }
);

export const registerThunk = createAsyncThunk(
  'auth/register',
  async (data: { name: string; email: string; password: string }, { rejectWithValue }) => {
    try {
      return await authApi.register(data);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message;
      return rejectWithValue(msg ?? 'Registration failed');
    }
  }
);

export const logoutThunk = createAsyncThunk('auth/logout', async () => {
  await authApi.logout();
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAccessToken(state, action: PayloadAction<string>) {
      state.accessToken = action.payload;
    },
    clearAuth(state) {
      state.user = null;
      state.accessToken = null;
      state.error = null;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initAuth.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.isInitialized = true;
      })
      .addCase(initAuth.rejected, (state) => {
        state.isInitialized = true;
      });

    builder
      .addCase(loginThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.isLoading = false;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(registerThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerThunk.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.isLoading = false;
      })
      .addCase(registerThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder.addCase(logoutThunk.fulfilled, (state) => {
      state.user = null;
      state.accessToken = null;
    });
  },
});

export const { setAccessToken, clearAuth, clearError } = authSlice.actions;

// Selector
export const selectAuth = (state: { auth: AuthState }) => state.auth;
export const selectUser = (state: { auth: AuthState }) => state.auth.user;

export default authSlice.reducer;
