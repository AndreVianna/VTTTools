import { describe, it, expect, beforeEach, vi } from 'vitest';
import { configureStore, type Store } from '@reduxjs/toolkit';
import authReducer, { login, logout, checkAuth, clearError } from './authSlice';
import { authService } from '@services/authService';
import type { AuthState } from '../../types/auth';

vi.mock('@services/authService');

describe('authSlice', () => {
    let store: Store<{ auth: AuthState }>;

    const mockUser = {
        id: '123',
        email: 'admin@test.com',
        displayName: 'Admin User',
        isAdmin: true,
        emailConfirmed: true,
        twoFactorEnabled: false,
    };

    beforeEach(() => {
        store = configureStore({
            reducer: {
                auth: authReducer,
            },
        });
        vi.clearAllMocks();
    });

    describe('initial state', () => {
        it('should have correct initial state', () => {
            const state = store.getState().auth;

            expect(state.user).toBeNull();
            expect(state.isAuthenticated).toBe(false);
            expect(state.isLoading).toBe(false);
            expect(state.error).toBeNull();
            expect(state.token).toBeNull();
        });
    });

    describe('login', () => {
        it('should set loading state when login is pending', async () => {
            vi.mocked(authService.login).mockImplementation(
                () => new Promise(() => {}) // Never resolves
            );

            store.dispatch(login({ email: 'admin@test.com', password: 'password' }) as any);

            const state = store.getState().auth;
            expect(state.isLoading).toBe(true);
            expect(state.error).toBeNull();
        });

        it('should handle successful login', async () => {
            vi.mocked(authService.login).mockResolvedValue({
                success: true,
                user: mockUser,
            });

            await store.dispatch(login({ email: 'admin@test.com', password: 'password' }) as any);

            const state = store.getState().auth;
            expect(state.isAuthenticated).toBe(true);
            expect(state.user).toEqual(mockUser);
            expect(state.isLoading).toBe(false);
            expect(state.error).toBeNull();
        });

        it('should fetch user from getCurrentUser when not in login response', async () => {
            vi.mocked(authService.login).mockResolvedValue({
                success: true,
            });
            vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser);

            await store.dispatch(login({ email: 'admin@test.com', password: 'password' }) as any);

            const state = store.getState().auth;
            expect(state.isAuthenticated).toBe(true);
            expect(state.user).toEqual(mockUser);
            expect(authService.getCurrentUser).toHaveBeenCalled();
        });

        it('should handle failed login with error message', async () => {
            vi.mocked(authService.login).mockResolvedValue({
                success: false,
                error: 'Invalid credentials',
            });

            await store.dispatch(login({ email: 'admin@test.com', password: 'wrong' }) as any);

            const state = store.getState().auth;
            expect(state.isAuthenticated).toBe(false);
            expect(state.user).toBeNull();
            expect(state.isLoading).toBe(false);
            expect(state.error).toBe('Invalid credentials');
        });

        it('should handle failed login with default error', async () => {
            vi.mocked(authService.login).mockResolvedValue({
                success: false,
            });

            await store.dispatch(login({ email: 'admin@test.com', password: 'wrong' }) as any);

            const state = store.getState().auth;
            expect(state.error).toBe('Login failed');
        });

        it('should handle failed getCurrentUser after login', async () => {
            vi.mocked(authService.login).mockResolvedValue({
                success: true,
            });
            vi.mocked(authService.getCurrentUser).mockResolvedValue(null);

            await store.dispatch(login({ email: 'admin@test.com', password: 'password' }) as any);

            const state = store.getState().auth;
            expect(state.isAuthenticated).toBe(false);
            expect(state.error).toBe('Failed to get user information');
        });
    });

    describe('logout', () => {
        it('should clear user and authentication state', async () => {
            // Set up authenticated state
            store = configureStore({
                reducer: {
                    auth: authReducer,
                },
                preloadedState: {
                    auth: {
                        user: mockUser,
                        isAuthenticated: true,
                        isLoading: false,
                        error: null,
                        token: null,
                    },
                },
            });

            vi.mocked(authService.logout).mockResolvedValue();

            await store.dispatch(logout() as any);

            const state = store.getState().auth;
            expect(state.isAuthenticated).toBe(false);
            expect(state.user).toBeNull();
            expect(state.error).toBeNull();
            expect(authService.logout).toHaveBeenCalled();
        });
    });

    describe('checkAuth', () => {
        it('should set loading state when checking auth', async () => {
            vi.mocked(authService.getCurrentUser).mockImplementation(
                () => new Promise(() => {})
            );

            store.dispatch(checkAuth() as any);

            const state = store.getState().auth;
            expect(state.isLoading).toBe(true);
        });

        it('should set authenticated state when user exists', async () => {
            vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser);

            await store.dispatch(checkAuth() as any);

            const state = store.getState().auth;
            expect(state.isAuthenticated).toBe(true);
            expect(state.user).toEqual(mockUser);
            expect(state.isLoading).toBe(false);
        });

        it('should clear authenticated state when user is null', async () => {
            vi.mocked(authService.getCurrentUser).mockResolvedValue(null);

            await store.dispatch(checkAuth() as any);

            const state = store.getState().auth;
            expect(state.isAuthenticated).toBe(false);
            expect(state.user).toBeNull();
            expect(state.isLoading).toBe(false);
        });

        it('should clear authenticated state on error', async () => {
            vi.mocked(authService.getCurrentUser).mockRejectedValue(new Error('Network error'));

            await store.dispatch(checkAuth() as any);

            const state = store.getState().auth;
            expect(state.isAuthenticated).toBe(false);
            expect(state.user).toBeNull();
            expect(state.isLoading).toBe(false);
        });
    });

    describe('clearError', () => {
        it('should clear error from state', () => {
            store = configureStore({
                reducer: {
                    auth: authReducer,
                },
                preloadedState: {
                    auth: {
                        user: null,
                        isAuthenticated: false,
                        isLoading: false,
                        error: 'Some error',
                        token: null,
                    },
                },
            });

            store.dispatch(clearError());

            const state = store.getState().auth;
            expect(state.error).toBeNull();
        });
    });
});
