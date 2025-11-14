import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { User } from '@/types/domain';

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  loginAttempts: number;
  lastLoginAttempt: number | null;
}

const TOKEN_STORAGE_KEY = 'vtt_auth_token';

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
    // Silently ignore localStorage errors
  }
};

const clearTokenFromStorage = (): void => {
  try {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch {
    // Silently ignore localStorage errors
  }
};

const initialState: AuthState = {
  user: null,
  token: loadTokenFromStorage(),
  isAuthenticated: false,
  isLoading: false,
  error: null,
  loginAttempts: 0,
  lastLoginAttempt: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Set loading state for authentication operations
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    // Set authentication success
    setAuthenticated: (state, action: PayloadAction<{ user: User; token?: string }>) => {
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.error = null;
      state.loginAttempts = 0;

      if (action.payload.token) {
        state.token = action.payload.token;
        saveTokenToStorage(action.payload.token);
      }
    },

    // Set authentication failure
    setAuthError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isAuthenticated = false;
      state.user = null;
      state.isLoading = false;
      state.loginAttempts += 1;
      state.lastLoginAttempt = Date.now();
    },

    // Clear authentication error
    clearAuthError: (state) => {
      state.error = null;
    },

    // Logout user
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
      state.loginAttempts = 0;
      state.lastLoginAttempt = null;
      clearTokenFromStorage();
    },

    // Update user profile
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },

    // Reset login attempts (for rate limiting)
    resetLoginAttempts: (state) => {
      state.loginAttempts = 0;
      state.lastLoginAttempt = null;
    },
  },
});

export const { setLoading, setAuthenticated, setAuthError, clearAuthError, logout, updateUser, resetLoginAttempts } =
  authSlice.actions;

export default authSlice.reducer;

// Selectors
export const selectAuth = (state: { auth: AuthState }) => state.auth;
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectToken = (state: { auth: AuthState }) => state.auth.token;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectAuthLoading = (state: { auth: AuthState }) => state.auth.isLoading;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;
export const selectLoginAttempts = (state: { auth: AuthState }) => state.auth.loginAttempts;
