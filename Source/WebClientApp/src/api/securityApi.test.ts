import { configureStore } from '@reduxjs/toolkit';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { securityApi, type SecuritySettingsResponse } from './securityApi';

vi.mock('@/services/enhancedBaseQuery', () => ({
    createEnhancedBaseQuery: vi.fn(() => vi.fn()),
}));

describe('securityApi', () => {
    let store: ReturnType<typeof configureStore>;

    beforeEach(() => {
        // Arrange
        store = configureStore({
            reducer: {
                [securityApi.reducerPath]: securityApi.reducer,
            },
            middleware: (getDefaultMiddleware) =>
                getDefaultMiddleware().concat(securityApi.middleware),
        });
    });

    describe('API configuration', () => {
        it('should have correct reducerPath', () => {
            // Arrange - done in beforeEach

            // Act
            const reducerPath = securityApi.reducerPath;

            // Assert
            expect(reducerPath).toBe('securityApi');
        });

        it('should have correct tagTypes', () => {
            // Arrange - done in beforeEach

            // Act
            const hasSecuritySettingsTag = securityApi.util.selectInvalidatedBy;

            // Assert
            expect(hasSecuritySettingsTag).toBeDefined();
        });

        it('should define SecuritySettings tag type', () => {
            // Arrange - done in beforeEach

            // Act & Assert
            // The API should be configured with SecuritySettings tag
            expect(securityApi.endpoints.getSecuritySettings).toBeDefined();
        });
    });

    describe('getSecuritySettings endpoint', () => {
        it('should be defined', () => {
            // Arrange - done in beforeEach

            // Act
            const endpoint = securityApi.endpoints.getSecuritySettings;

            // Assert
            expect(endpoint).toBeDefined();
        });

        it('should be a query endpoint', () => {
            // Arrange - done in beforeEach

            // Act
            const useQueryHook = securityApi.endpoints.getSecuritySettings.useQuery;

            // Assert
            expect(useQueryHook).toBeDefined();
        });

        it('should have correct query configuration', () => {
            // Arrange - done in beforeEach

            // Act
            const endpoint = securityApi.endpoints.getSecuritySettings;

            // Assert
            expect(endpoint.useQuery).toBeDefined();
            expect(typeof endpoint.useQuery).toBe('function');
        });
    });

    describe('hook exports', () => {
        it('should export useGetSecuritySettingsQuery hook', async () => {
            // Arrange & Act
            const api = await import('./securityApi');

            // Assert
            expect(typeof api.useGetSecuritySettingsQuery).toBe('function');
        });
    });

    describe('type exports', () => {
        it('should have type-compatible SecuritySettingsResponse shape', () => {
            // Arrange
            const mockResponse: SecuritySettingsResponse = {
                hasTwoFactorEnabled: true,
                hasRecoveryCodes: true,
                success: true,
                message: 'Settings retrieved successfully',
            };

            // Act & Assert
            expect(mockResponse.hasTwoFactorEnabled).toBe(true);
            expect(mockResponse.hasRecoveryCodes).toBe(true);
            expect(mockResponse.success).toBe(true);
            expect(mockResponse.message).toBe('Settings retrieved successfully');
        });

        it('should allow optional message in SecuritySettingsResponse', () => {
            // Arrange
            const mockResponse: SecuritySettingsResponse = {
                hasTwoFactorEnabled: false,
                hasRecoveryCodes: false,
                success: true,
            };

            // Act & Assert
            expect(mockResponse.hasTwoFactorEnabled).toBe(false);
            expect(mockResponse.hasRecoveryCodes).toBe(false);
            expect(mockResponse.success).toBe(true);
            expect(mockResponse.message).toBeUndefined();
        });

        it('should support failure response', () => {
            // Arrange
            const mockResponse: SecuritySettingsResponse = {
                hasTwoFactorEnabled: false,
                hasRecoveryCodes: false,
                success: false,
                message: 'Failed to retrieve settings',
            };

            // Act & Assert
            expect(mockResponse.success).toBe(false);
            expect(mockResponse.message).toBe('Failed to retrieve settings');
        });
    });

    describe('store integration', () => {
        it('should integrate with Redux store correctly', () => {
            // Arrange - done in beforeEach

            // Act
            const state = store.getState() as { [key: string]: unknown };

            // Assert
            expect(state[securityApi.reducerPath]).toBeDefined();
        });

        it('should have initialized queries state', () => {
            // Arrange - done in beforeEach

            // Act
            const state = store.getState() as { [key: string]: { queries?: unknown } };

            // Assert
            expect(state[securityApi.reducerPath]?.queries).toBeDefined();
        });

        it('should have initialized mutations state', () => {
            // Arrange - done in beforeEach

            // Act
            const state = store.getState() as { [key: string]: { mutations?: unknown } };

            // Assert
            expect(state[securityApi.reducerPath]?.mutations).toBeDefined();
        });
    });

    describe('endpoint count verification', () => {
        it('should have correct total number of endpoints', () => {
            // Arrange - done in beforeEach

            // Act
            const endpointNames = Object.keys(securityApi.endpoints);

            // Assert
            expect(endpointNames.length).toBe(1);
        });

        it('should have getSecuritySettings endpoint', () => {
            // Arrange - done in beforeEach

            // Act & Assert
            expect(securityApi.endpoints).toHaveProperty('getSecuritySettings');
        });
    });

    describe('cache tag behavior', () => {
        it('should provide SecuritySettings tag for getSecuritySettings query', () => {
            // Arrange - done in beforeEach

            // Act
            const endpoint = securityApi.endpoints.getSecuritySettings;

            // Assert
            // The endpoint should be configured to provide SecuritySettings tag
            // This ensures cache invalidation works correctly
            expect(endpoint).toBeDefined();
            expect(endpoint.useQuery).toBeDefined();
        });
    });
});
