import { describe, it, expect, beforeEach, vi } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import MockAdapter from 'axios-mock-adapter';
import apiClient, { configureApiClient } from './client';
import authReducer from '@store/slices/authSlice';
import type { AuthState } from '@types/auth';

describe('API Client', () => {
    let mockAxios: MockAdapter;
    let store: ReturnType<typeof configureStore>;

    beforeEach(() => {
        mockAxios = new MockAdapter(apiClient);
        store = configureStore({
            reducer: {
                auth: authReducer,
            },
        });
        configureApiClient(store);
    });

    it('should include Authorization header when token is present', async () => {
        const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.token';

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
                } as AuthState,
            },
        });

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
                } as AuthState,
            },
        });

        configureApiClient(store);

        Object.defineProperty(window, 'location', {
            value: { href: originalLocation },
            writable: true,
        });

        mockAxios.onGet('/api/admin/test').reply(401);

        try {
            await apiClient.get('/api/admin/test');
        } catch (error) {
            expect(window.location.href).toBe('/admin/login');
        }
    });
});
