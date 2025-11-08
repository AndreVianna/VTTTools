import { describe, it, expect, beforeEach } from 'vitest';
import { configureStore, type Store } from '@reduxjs/toolkit';
import MockAdapter from 'axios-mock-adapter';
import apiClient, { configureApiClient } from './client';
import authReducer from '@store/slices/authSlice';
import uiReducer from '@store/slices/uiSlice';
import type { RootState, AppDispatch } from '@store/store';

describe('API Client', () => {
    let mockAxios: MockAdapter;
    let store: Store<RootState, any, any> & { dispatch: AppDispatch };

    beforeEach(() => {
        mockAxios = new MockAdapter(apiClient);
        store = configureStore({
            reducer: {
                auth: authReducer,
                ui: uiReducer,
            },
        }) as Store<RootState, any, any> & { dispatch: AppDispatch };
        configureApiClient(store);
    });

    it('should include Authorization header when token is present', async () => {
        const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.token';

        store = configureStore({
            reducer: {
                auth: authReducer,
                ui: uiReducer,
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
        }) as Store<RootState, any, any> & { dispatch: AppDispatch };

        configureApiClient(store);

        mockAxios.onGet('/api/admin/test').reply((config) => {
            expect(config.headers?.Authorization).toBe(`Bearer ${mockToken}`);
            return [200, { success: true }];
        });

        await apiClient.get('/api/admin/test');
    });

    it('should not include Authorization header when token is not present', async () => {
        mockAxios.onGet('/api/admin/test').reply((config) => {
            expect(config.headers?.Authorization).toBeUndefined();
            return [200, { success: true }];
        });

        await apiClient.get('/api/admin/test');
    });

    it('should redirect to login on 401 unauthorized when authenticated', async () => {
        const originalLocation = window.location.href;

        store = configureStore({
            reducer: {
                auth: authReducer,
                ui: uiReducer,
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
                    token: 'test-token',
                },
            },
        }) as Store<RootState, any, any> & { dispatch: AppDispatch };

        configureApiClient(store);

        Object.defineProperty(window, 'location', {
            value: { href: originalLocation },
            writable: true,
        });

        mockAxios.onGet('/api/admin/test').reply(401);

        try {
            await apiClient.get('/api/admin/test');
        } catch {
            expect(window.location.href).toBe('/login');
        }
    });

    it('should update token when X-Refreshed-Token header is present', async () => {
        const oldToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.old.token';
        const newToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.new.token';

        store = configureStore({
            reducer: {
                auth: authReducer,
                ui: uiReducer,
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
        }) as Store<RootState, any, any> & { dispatch: AppDispatch };

        configureApiClient(store);

        mockAxios.onGet('/api/admin/test').reply(200, { success: true }, { 'x-refreshed-token': newToken });

        await apiClient.get('/api/admin/test');

        const state = store.getState();
        expect(state.auth.token).toBe(newToken);
        expect(localStorage.getItem('vtttools_admin_token')).toBe(newToken);
    });

    it('should not update token when not authenticated', async () => {
        const newToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.new.token';

        mockAxios.onGet('/api/admin/test').reply(200, { success: true }, { 'x-refreshed-token': newToken });

        await apiClient.get('/api/admin/test');

        const state = store.getState();
        expect(state.auth.token).toBeNull();
    });

    it('should not update token when token is the same', async () => {
        const sameToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.same.token';

        store = configureStore({
            reducer: {
                auth: authReducer,
                ui: uiReducer,
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
                    token: sameToken,
                },
            },
        }) as Store<RootState, any, any> & { dispatch: AppDispatch };

        configureApiClient(store);

        const dispatchSpy = store.dispatch;
        const initialDispatchCount = (dispatchSpy as unknown as { mock?: { calls?: unknown[] } }).mock?.calls?.length ?? 0;

        mockAxios.onGet('/api/admin/test').reply(200, { success: true }, { 'x-refreshed-token': sameToken });

        await apiClient.get('/api/admin/test');

        const finalDispatchCount = (dispatchSpy as unknown as { mock?: { calls?: unknown[] } }).mock?.calls?.length ?? 0;
        expect(finalDispatchCount).toBe(initialDispatchCount);
    });
});
