import { describe, it, expect, beforeEach, vi } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import authReducer, { login, logout } from './authSlice';
import { authService } from '@services/authService';
import type { AuthState } from '@types/auth';

vi.mock('@services/authService');

describe('authSlice', () => {
    let store: ReturnType<typeof configureStore>;

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

            await store.dispatch(login({ email: 'admin@test.com', password: 'password' }));

            const state = store.getState().auth as AuthState;
            expect(state.isAuthenticated).toBe(true);
            expect(state.user).toEqual(mockUser);
            expect(state.token).toBe(mockToken);
            expect(localStorage.getItem('vtttools_admin_token')).toBe(mockToken);
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

            await store.dispatch(login({ email: 'admin@test.com', password: 'password' }));

            const state = store.getState().auth as AuthState;
            expect(state.isAuthenticated).toBe(true);
            expect(state.user).toEqual(mockUser);
            expect(state.token).toBeNull();
        });

        it('should clear token on failed login', async () => {
            localStorage.setItem('vtttools_admin_token', 'old-token');

            vi.mocked(authService.login).mockResolvedValue({
                success: false,
                error: 'Invalid credentials',
            });

            await store.dispatch(login({ email: 'admin@test.com', password: 'wrong' }));

            const state = store.getState().auth as AuthState;
            expect(state.isAuthenticated).toBe(false);
            expect(state.user).toBeNull();
            expect(state.token).toBeNull();
        });
    });

    describe('logout', () => {
        it('should clear token from state and localStorage', async () => {
            const mockToken = 'test-token';
            localStorage.setItem('vtttools_admin_token', mockToken);

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
                        token: mockToken,
                    },
                },
            });

            vi.mocked(authService.logout).mockResolvedValue();

            await store.dispatch(logout());

            const state = store.getState().auth as AuthState;
            expect(state.isAuthenticated).toBe(false);
            expect(state.user).toBeNull();
            expect(state.token).toBeNull();
            expect(localStorage.getItem('vtttools_admin_token')).toBeNull();
        });
    });

    describe('token persistence', () => {
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
    });
});
