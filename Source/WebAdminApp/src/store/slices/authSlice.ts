import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { authService } from '@services/authService';
import type { AdminUser, AuthState, LoginRequest } from '@types/auth';

const TOKEN_STORAGE_KEY = 'vtttools_admin_token';

const loadTokenFromStorage = (): string | null => {
    try {
        return localStorage.getItem(TOKEN_STORAGE_KEY);
    } catch {
        return null;
    }
};

const saveTokenToStorage = (token: string): void => {
    try {
        localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } catch {
    }
};

const removeTokenFromStorage = (): void => {
    try {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
    } catch {
    }
};

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  token: loadTokenFromStorage(),
};

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginRequest, { rejectWithValue }) => {
    const result = await authService.login(credentials);
    if (!result.success) {
      return rejectWithValue(result.error || 'Login failed');
    }

    if (result.token) {
      saveTokenToStorage(result.token);
    }

    const user = result.user || await authService.getCurrentUser();
    if (!user) {
      return rejectWithValue('Failed to get user information');
    }
    return { user, token: result.token };
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  removeTokenFromStorage();
  await authService.logout();
});

export const checkAuth = createAsyncThunk('auth/checkAuth', async () => {
  const user = await authService.getCurrentUser();
  return user;
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<{ user: AdminUser; token?: string }>) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token || null;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = action.payload as string;
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = null;
      })
      // Check auth
      .addCase(checkAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action: PayloadAction<AdminUser | null>) => {
        state.isLoading = false;
        if (action.payload) {
          state.isAuthenticated = true;
          state.user = action.payload;
        } else {
          state.isAuthenticated = false;
          state.user = null;
          state.token = null;
          removeTokenFromStorage();
        }
      })
      .addCase(checkAuth.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        removeTokenFromStorage();
      });
  },
});

export const { clearError } = authSlice.actions;

export const selectToken = (state: { auth: AuthState }) => state.auth.token;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;

export default authSlice.reducer;
