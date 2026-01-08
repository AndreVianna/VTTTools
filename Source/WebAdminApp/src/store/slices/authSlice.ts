import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AdminUser, AuthState } from '../../types/auth';

const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    token: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },

        setAuthenticated: (state, action: PayloadAction<{ user: AdminUser }>) => {
            state.user = action.payload.user;
            state.isAuthenticated = true;
            state.isLoading = false;
            state.error = null;
        },

        setAuthError: (state, action: PayloadAction<string>) => {
            state.error = action.payload;
            state.isAuthenticated = false;
            state.user = null;
            state.isLoading = false;
        },

        clearError: (state) => {
            state.error = null;
        },

        logout: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.isLoading = false;
            state.error = null;
        },

        updateUser: (state, action: PayloadAction<Partial<AdminUser>>) => {
            if (state.user) {
                state.user = { ...state.user, ...action.payload };
            }
        },
    },
});

export const {
    setLoading,
    setAuthenticated,
    setAuthError,
    clearError,
    logout,
    updateUser,
} = authSlice.actions;

export default authSlice.reducer;

export const selectAuth = (state: { auth: AuthState }) => state.auth;
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectAuthLoading = (state: { auth: AuthState }) => state.auth.isLoading;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;
