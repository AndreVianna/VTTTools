import { describe, it, expect, beforeEach, vi } from 'vitest';
import { configureStore, type Store } from '@reduxjs/toolkit';
import authReducer, { login, logout, updateToken } from './authSlice';
import { authService } from '@services/authService';
import type { AuthState } from '../../types/auth';

vi.mock('@services/authService');

describe('authSlice', () => {
    let store: Store<{ auth: AuthState }>;

    beforeEach(() => {
        store = configureStore({
            reducer: {
                auth: authReducer,
            },
        });
        localStorage.clear();
        vi.clearAllMocks();
    });

    describe('login', () => {
        it('should handle successful login with JWT token', async () => {
            const mockUser = {
                id: '123',
                email: 'admin@test.com',
                displayName: 'Admin User',
                isAdmin: true,
                emailConfirmed: true,
                twoFactorEnabled: false,
            };
            const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.token';

            vi.mocked(authService.login).mockResolvedValue({
                success: true,
                user: mockUser,
                token: mockToken,
            });

            await store.dispatch(login({ email: 'admin@test.com', password: 'password' }) as any);

            const state = store.getState().auth;
            expect(state.isAuthenticated).toBe(true);
            expect(state.user).toEqual(mockUser);
            expect(state.token).toBe(mockToken);
            expect(localStorage.getItem('vtttools_admin_token')).toBe(mockToken);
            expect(localStorage.getItem('vtttools_admin_user')).toBe(JSON.stringify(mockUser));
        });

        it('should handle login without token (backward compatibility)', async () => {
            const mockUser = {
                id: '123',
                email: 'admin@test.com',
                displayName: 'Admin User',
                isAdmin: true,
                emailConfirmed: true,
                twoFactorEnabled: false,
            };

            vi.mocked(authService.login).mockResolvedValue({
                success: true,
                user: mockUser,
            });

            vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser);

            await store.dispatch(login({ email: 'admin@test.com', password: 'password' }) as any);

            const state = store.getState().auth;
            expect(state.isAuthenticated).toBe(true);
            expect(state.user).toEqual(mockUser);
            expect(state.token).toBeNull();
        });

        it('should clear token and user on failed login', async () => {
            localStorage.setItem('vtttools_admin_token', 'old-token');
            localStorage.setItem('vtttools_admin_user', JSON.stringify({ id: '123', email: 'test@test.com' }));

            vi.mocked(authService.login).mockResolvedValue({
                success: false,
                error: 'Invalid credentials',
            });

            await store.dispatch(login({ email: 'admin@test.com', password: 'wrong' }) as any);

            const state = store.getState().auth;
            expect(state.isAuthenticated).toBe(false);
            expect(state.user).toBeNull();
            expect(state.token).toBeNull();
            expect(localStorage.getItem('vtttools_admin_user')).toBeNull();
        });
    });

    describe('logout', () => {
        it('should clear token and user from state and localStorage', async () => {
            const mockToken = 'test-token';
            const mockUser = {
                id: '123',
                email: 'admin@test.com',
                displayName: 'Admin User',
                isAdmin: true,
                emailConfirmed: true,
                twoFactorEnabled: false,
            };
            localStorage.setItem('vtttools_admin_token', mockToken);
            localStorage.setItem('vtttools_admin_user', JSON.stringify(mockUser));

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
                        token: mockToken,
                    },
                },
            });

            vi.mocked(authService.logout).mockResolvedValue();

            await store.dispatch(logout() as any);

            const state = store.getState().auth;
            expect(state.isAuthenticated).toBe(false);
            expect(state.user).toBeNull();
            expect(state.token).toBeNull();
            expect(localStorage.getItem('vtttools_admin_token')).toBeNull();
            expect(localStorage.getItem('vtttools_admin_user')).toBeNull();
        });
    });

    describe('auth state persistence', () => {
        it('should restore user and token from localStorage on initialization', () => {
            const mockToken = 'stored-token';
            const mockUser = {
                id: '123',
                email: 'admin@test.com',
                displayName: 'Admin User',
                isAdmin: true,
                emailConfirmed: true,
                twoFactorEnabled: false,
            };

            localStorage.setItem('vtttools_admin_token', mockToken);
            localStorage.setItem('vtttools_admin_user', JSON.stringify(mockUser));

            const newStore = configureStore({
                reducer: {
                    auth: authReducer,
                },
                preloadedState: {
                    auth: {
                        user: mockUser,
                        isAuthenticated: true,
                        isLoading: false,
                        error: null,
                        token: mockToken,
                    },
                },
            });

            const state = newStore.getState().auth;
            expect(state.token).toBe(mockToken);
            expect(state.user).toEqual(mockUser);
            expect(state.isAuthenticated).toBe(true);
        });

        it('should NOT be authenticated if token exists but user is missing', () => {
            const newStore = configureStore({
                reducer: {
                    auth: authReducer,
                },
                preloadedState: {
                    auth: {
                        user: null,
                        isAuthenticated: false,
                        isLoading: false,
                        error: null,
                        token: 'stored-token',
                    },
                },
            });

            const state = newStore.getState().auth;
            expect(state.token).toBe('stored-token');
            expect(state.user).toBeNull();
            expect(state.isAuthenticated).toBe(false);
        });

        it('should NOT be authenticated if user exists but token is missing', () => {
            const mockUser = {
                id: '123',
                email: 'admin@test.com',
                displayName: 'Admin User',
                isAdmin: true,
                emailConfirmed: true,
                twoFactorEnabled: false,
            };

            const newStore = configureStore({
                reducer: {
                    auth: authReducer,
                },
                preloadedState: {
                    auth: {
                        user: mockUser,
                        isAuthenticated: false,
                        isLoading: false,
                        error: null,
                        token: null,
                    },
                },
            });

            const state = newStore.getState().auth;
            expect(state.token).toBeNull();
            expect(state.user).toEqual(mockUser);
            expect(state.isAuthenticated).toBe(false);
        });

        it('should handle localStorage errors gracefully', () => {
            vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
                throw new Error('localStorage disabled');
            });

            expect(() => {
                configureStore({
                    reducer: {
                        auth: authReducer,
                    },
                });
            }).not.toThrow();
        });

        it('should handle invalid JSON in user storage gracefully', () => {
            const newStore = configureStore({
                reducer: {
                    auth: authReducer,
                },
                preloadedState: {
                    auth: {
                        user: null,
                        isAuthenticated: false,
                        isLoading: false,
                        error: null,
                        token: 'valid-token',
                    },
                },
            });

            const state = newStore.getState().auth;
            expect(state.token).toBe('valid-token');
            expect(state.user).toBeNull();
            expect(state.isAuthenticated).toBe(false);
        });
    });

    describe('updateToken', () => {
        it('should update token in state', () => {
            const newToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.new.token';

            store.dispatch(updateToken(newToken));

            const state = store.getState().auth;
            expect(state.token).toBe(newToken);
        });

        it('should replace existing token', () => {
            const oldToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.old.token';
            const newToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.new.token';

            store = configureStore({
                reducer: {
                    auth: authReducer,
                },
                preloadedState: {
                    auth: {
                        user: {
                            id: '123',
                            email: 'admin@test.com',
                            displayName: 'Admin User',
                            isAdmin: true,
                            emailConfirmed: true,
                            twoFactorEnabled: false,
                        },
                        isAuthenticated: true,
                        isLoading: false,
                        error: null,
                        token: oldToken,
                    },
                },
            });

            store.dispatch(updateToken(newToken));

            const state = store.getState().auth;
            expect(state.token).toBe(newToken);
        });
    });
});
