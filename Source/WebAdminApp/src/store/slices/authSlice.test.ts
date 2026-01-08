import { describe, it, expect, beforeEach } from 'vitest';
import { configureStore, type Store } from '@reduxjs/toolkit';
import authReducer, {
    setLoading,
    setAuthenticated,
    setAuthError,
    clearError,
    logout,
    updateUser,
} from './authSlice';
import type { AuthState } from '../../types/auth';

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

    describe('setLoading', () => {
        it('should set loading state to true', () => {
            store.dispatch(setLoading(true));

            const state = store.getState().auth;
            expect(state.isLoading).toBe(true);
        });

        it('should set loading state to false', () => {
            store.dispatch(setLoading(true));
            store.dispatch(setLoading(false));

            const state = store.getState().auth;
            expect(state.isLoading).toBe(false);
        });
    });

    describe('setAuthenticated', () => {
        it('should set authenticated state with user', () => {
            store.dispatch(setAuthenticated({ user: mockUser }));

            const state = store.getState().auth;
            expect(state.isAuthenticated).toBe(true);
            expect(state.user).toEqual(mockUser);
            expect(state.isLoading).toBe(false);
            expect(state.error).toBeNull();
        });
    });

    describe('setAuthError', () => {
        it('should set error and clear authentication', () => {
            // First authenticate
            store.dispatch(setAuthenticated({ user: mockUser }));

            // Then set error
            store.dispatch(setAuthError('Invalid credentials'));

            const state = store.getState().auth;
            expect(state.error).toBe('Invalid credentials');
            expect(state.isAuthenticated).toBe(false);
            expect(state.user).toBeNull();
            expect(state.isLoading).toBe(false);
        });
    });

    describe('clearError', () => {
        it('should clear error from state', () => {
            store.dispatch(setAuthError('Some error'));
            store.dispatch(clearError());

            const state = store.getState().auth;
            expect(state.error).toBeNull();
        });
    });

    describe('logout', () => {
        it('should clear user and authentication state', () => {
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
                        token: 'test-token',
                    },
                },
            });

            store.dispatch(logout());

            const state = store.getState().auth;
            expect(state.isAuthenticated).toBe(false);
            expect(state.user).toBeNull();
            expect(state.token).toBeNull();
            expect(state.error).toBeNull();
            expect(state.isLoading).toBe(false);
        });
    });

    describe('updateUser', () => {
        it('should update user properties', () => {
            store.dispatch(setAuthenticated({ user: mockUser }));
            store.dispatch(updateUser({ displayName: 'Updated Name' }));

            const state = store.getState().auth;
            expect(state.user?.displayName).toBe('Updated Name');
            expect(state.user?.email).toBe('admin@test.com');
        });

        it('should not update if no user is authenticated', () => {
            store.dispatch(updateUser({ displayName: 'Updated Name' }));

            const state = store.getState().auth;
            expect(state.user).toBeNull();
        });
    });
});
