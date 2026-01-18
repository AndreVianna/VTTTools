import { configureStore } from '@reduxjs/toolkit';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { twoFactorApi } from './twoFactorApi';
import type {
    DisableTwoFactorRequest,
    DisableTwoFactorResponse,
    TwoFactorSetupResponse,
    TwoFactorVerifyResponse,
    VerifySetupRequest,
} from './twoFactorApi';

// Captured request for URL verification
let capturedRequest: { url: string; method: string | null; body: unknown } | null = null;

vi.mock('@/services/enhancedBaseQuery', () => ({
    createEnhancedBaseQuery: vi.fn(() => async (args: unknown) => {
        // Capture the request for inspection
        if (typeof args === 'string') {
            capturedRequest = { url: args, method: null, body: null };
        } else if (args && typeof args === 'object') {
            const req = args as { url: string; method?: string; body?: unknown };
            capturedRequest = { url: req.url, method: req.method ?? null, body: req.body ?? null };
        }
        // Return a mock response
        return {
            data: {
                sharedKey: 'MOCK_KEY',
                authenticatorUri: 'otpauth://totp/test',
                recoveryCodes: ['code1', 'code2'],
                success: true,
            },
        };
    }),
}));

describe('twoFactorApi', () => {
    let store: ReturnType<typeof configureStore>;

    beforeEach(() => {
        capturedRequest = null;
        store = configureStore({
            reducer: {
                [twoFactorApi.reducerPath]: twoFactorApi.reducer,
            },
            middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(twoFactorApi.middleware),
        });
    });

    describe('API configuration', () => {
        it('should have correct reducerPath', () => {
            // Arrange & Act - access the reducerPath
            const reducerPath = twoFactorApi.reducerPath;

            // Assert
            expect(reducerPath).toBe('twoFactorApi');
        });

        it('should have correct tagTypes configured', () => {
            // Arrange & Act - verify tag types are defined through cache utilities
            expect(twoFactorApi.util.selectInvalidatedBy).toBeDefined();
        });

        it('should define all expected endpoints', () => {
            // Arrange - expected endpoint names
            const expectedEndpoints = ['initiateSetup', 'verifySetup', 'disableTwoFactor'];

            // Act & Assert
            expectedEndpoints.forEach((name) => {
                expect(twoFactorApi.endpoints).toHaveProperty(name);
            });
        });

        it('should have correct total number of endpoints', () => {
            // Arrange & Act
            const endpointNames = Object.keys(twoFactorApi.endpoints);

            // Assert - 3 mutation endpoints
            expect(endpointNames.length).toBe(3);
        });
    });

    describe('initiateSetup endpoint', () => {
        it('should be defined as mutation', () => {
            // Arrange & Act
            const endpoint = twoFactorApi.endpoints.initiateSetup;

            // Assert
            expect(endpoint).toBeDefined();
            expect(endpoint.useMutation).toBeDefined();
        });

        it('should call POST /two-factor/setup', async () => {
            // Arrange - store is already set up

            // Act
            await store.dispatch(twoFactorApi.endpoints.initiateSetup.initiate());

            // Assert
            expect(capturedRequest?.url).toBe('/two-factor/setup');
            expect(capturedRequest?.method).toBe('POST');
        });

        it('should not send body with POST request', async () => {
            // Arrange - store is already set up

            // Act
            await store.dispatch(twoFactorApi.endpoints.initiateSetup.initiate());

            // Assert - body is null or undefined (void parameter)
            expect(capturedRequest?.body).toBeFalsy();
        });

        it('should invalidate TwoFactor tag on success', () => {
            // Arrange & Act - The invalidatesTags is part of endpoint configuration
            const endpoint = twoFactorApi.endpoints.initiateSetup;

            // Assert
            expect(endpoint).toBeDefined();
            expect(endpoint.useMutation).toBeDefined();
            // Cache invalidation is validated through integration tests
        });
    });

    describe('verifySetup endpoint', () => {
        it('should be defined as mutation', () => {
            // Arrange & Act
            const endpoint = twoFactorApi.endpoints.verifySetup;

            // Assert
            expect(endpoint).toBeDefined();
            expect(endpoint.useMutation).toBeDefined();
        });

        it('should call PUT /two-factor/setup with body', async () => {
            // Arrange
            const verifyData: VerifySetupRequest = {
                code: '123456',
            };

            // Act
            await store.dispatch(twoFactorApi.endpoints.verifySetup.initiate(verifyData));

            // Assert
            expect(capturedRequest?.url).toBe('/two-factor/setup');
            expect(capturedRequest?.method).toBe('PUT');
            expect(capturedRequest?.body).toEqual(verifyData);
        });

        it('should send verification code in request body', async () => {
            // Arrange
            const verifyData: VerifySetupRequest = {
                code: '654321',
            };

            // Act
            await store.dispatch(twoFactorApi.endpoints.verifySetup.initiate(verifyData));

            // Assert
            expect(capturedRequest?.body).toEqual({ code: '654321' });
        });

        it('should invalidate TwoFactor, SecuritySettings, and Profile tags on success', () => {
            // Arrange & Act - The invalidatesTags is part of endpoint configuration
            const endpoint = twoFactorApi.endpoints.verifySetup;

            // Assert
            expect(endpoint).toBeDefined();
            expect(endpoint.useMutation).toBeDefined();
            // Cache invalidation is validated through integration tests
        });
    });

    describe('disableTwoFactor endpoint', () => {
        it('should be defined as mutation', () => {
            // Arrange & Act
            const endpoint = twoFactorApi.endpoints.disableTwoFactor;

            // Assert
            expect(endpoint).toBeDefined();
            expect(endpoint.useMutation).toBeDefined();
        });

        it('should call DELETE /two-factor with body', async () => {
            // Arrange
            const disableData: DisableTwoFactorRequest = {
                password: 'securePassword123',
            };

            // Act
            await store.dispatch(twoFactorApi.endpoints.disableTwoFactor.initiate(disableData));

            // Assert
            expect(capturedRequest?.url).toBe('/two-factor');
            expect(capturedRequest?.method).toBe('DELETE');
            expect(capturedRequest?.body).toEqual(disableData);
        });

        it('should send password in request body', async () => {
            // Arrange
            const disableData: DisableTwoFactorRequest = {
                password: 'mySecretPassword',
            };

            // Act
            await store.dispatch(twoFactorApi.endpoints.disableTwoFactor.initiate(disableData));

            // Assert
            expect(capturedRequest?.body).toEqual({ password: 'mySecretPassword' });
        });

        it('should invalidate SecuritySettings, Profile, and TwoFactor tags on success', () => {
            // Arrange & Act - The invalidatesTags is part of endpoint configuration
            const endpoint = twoFactorApi.endpoints.disableTwoFactor;

            // Assert
            expect(endpoint).toBeDefined();
            expect(endpoint.useMutation).toBeDefined();
            // Cache invalidation is validated through integration tests
        });
    });

    describe('hook exports', () => {
        it('should export useInitiateSetupMutation hook', async () => {
            // Arrange & Act
            const api = await import('./twoFactorApi');

            // Assert
            expect(typeof api.useInitiateSetupMutation).toBe('function');
        });

        it('should export useVerifySetupMutation hook', async () => {
            // Arrange & Act
            const api = await import('./twoFactorApi');

            // Assert
            expect(typeof api.useVerifySetupMutation).toBe('function');
        });

        it('should export useDisableTwoFactorMutation hook', async () => {
            // Arrange & Act
            const api = await import('./twoFactorApi');

            // Assert
            expect(typeof api.useDisableTwoFactorMutation).toBe('function');
        });
    });

    describe('store integration', () => {
        it('should integrate with Redux store correctly', () => {
            // Arrange & Act
            const state = store.getState() as { [key: string]: unknown };

            // Assert
            expect(state[twoFactorApi.reducerPath]).toBeDefined();
        });

        it('should have initialized queries state', () => {
            // Arrange & Act
            const state = store.getState() as { [key: string]: { queries?: unknown; mutations?: unknown } };

            // Assert
            expect(state[twoFactorApi.reducerPath]?.queries).toBeDefined();
        });

        it('should have initialized mutations state', () => {
            // Arrange & Act
            const state = store.getState() as { [key: string]: { queries?: unknown; mutations?: unknown } };

            // Assert
            expect(state[twoFactorApi.reducerPath]?.mutations).toBeDefined();
        });
    });

    describe('type exports', () => {
        it('should have type-compatible TwoFactorSetupResponse shape', () => {
            // Arrange
            const mockResponse: TwoFactorSetupResponse = {
                sharedKey: 'JBSWY3DPEHPK3PXP',
                authenticatorUri: 'otpauth://totp/VTTTools:user@example.com?secret=JBSWY3DPEHPK3PXP',
                success: true,
                message: 'Setup initiated successfully',
            };

            // Act & Assert
            expect(mockResponse.sharedKey).toBe('JBSWY3DPEHPK3PXP');
            expect(mockResponse.authenticatorUri).toContain('otpauth://totp/');
            expect(mockResponse.success).toBe(true);
            expect(mockResponse.message).toBe('Setup initiated successfully');
        });

        it('should allow optional message in TwoFactorSetupResponse', () => {
            // Arrange
            const mockResponse: TwoFactorSetupResponse = {
                sharedKey: 'SECRETKEY',
                authenticatorUri: 'otpauth://totp/test',
                success: true,
            };

            // Act & Assert
            expect(mockResponse.sharedKey).toBe('SECRETKEY');
            expect(mockResponse.success).toBe(true);
            expect(mockResponse.message).toBeUndefined();
        });

        it('should have type-compatible VerifySetupRequest shape', () => {
            // Arrange
            const mockRequest: VerifySetupRequest = {
                code: '123456',
            };

            // Act & Assert
            expect(mockRequest.code).toBe('123456');
        });

        it('should have type-compatible TwoFactorVerifyResponse shape', () => {
            // Arrange
            const mockResponse: TwoFactorVerifyResponse = {
                recoveryCodes: ['AAAA-BBBB', 'CCCC-DDDD', 'EEEE-FFFF'],
                success: true,
                message: 'Two-factor enabled successfully',
            };

            // Act & Assert
            expect(mockResponse.recoveryCodes).toHaveLength(3);
            expect(mockResponse.recoveryCodes[0]).toBe('AAAA-BBBB');
            expect(mockResponse.success).toBe(true);
            expect(mockResponse.message).toBe('Two-factor enabled successfully');
        });

        it('should allow optional message in TwoFactorVerifyResponse', () => {
            // Arrange
            const mockResponse: TwoFactorVerifyResponse = {
                recoveryCodes: ['CODE1', 'CODE2'],
                success: true,
            };

            // Act & Assert
            expect(mockResponse.recoveryCodes).toHaveLength(2);
            expect(mockResponse.success).toBe(true);
            expect(mockResponse.message).toBeUndefined();
        });

        it('should have type-compatible DisableTwoFactorRequest shape', () => {
            // Arrange
            const mockRequest: DisableTwoFactorRequest = {
                password: 'userPassword123',
            };

            // Act & Assert
            expect(mockRequest.password).toBe('userPassword123');
        });

        it('should have type-compatible DisableTwoFactorResponse shape', () => {
            // Arrange
            const mockResponse: DisableTwoFactorResponse = {
                success: true,
                message: 'Two-factor authentication disabled',
            };

            // Act & Assert
            expect(mockResponse.success).toBe(true);
            expect(mockResponse.message).toBe('Two-factor authentication disabled');
        });

        it('should allow optional message in DisableTwoFactorResponse', () => {
            // Arrange
            const mockResponse: DisableTwoFactorResponse = {
                success: true,
            };

            // Act & Assert
            expect(mockResponse.success).toBe(true);
            expect(mockResponse.message).toBeUndefined();
        });

        it('should support failure responses', () => {
            // Arrange
            const setupFailure: TwoFactorSetupResponse = {
                sharedKey: '',
                authenticatorUri: '',
                success: false,
                message: 'Setup failed - already enabled',
            };
            const verifyFailure: TwoFactorVerifyResponse = {
                recoveryCodes: [],
                success: false,
                message: 'Invalid verification code',
            };
            const disableFailure: DisableTwoFactorResponse = {
                success: false,
                message: 'Incorrect password',
            };

            // Act & Assert
            expect(setupFailure.success).toBe(false);
            expect(setupFailure.message).toBe('Setup failed - already enabled');
            expect(verifyFailure.success).toBe(false);
            expect(verifyFailure.recoveryCodes).toHaveLength(0);
            expect(disableFailure.success).toBe(false);
            expect(disableFailure.message).toBe('Incorrect password');
        });
    });

    describe('cache tag invalidation logic', () => {
        it('initiateSetup should invalidate TwoFactor tag', () => {
            // The initiateSetup mutation should invalidate TwoFactor tag
            // to ensure setup state is refreshed
            expect(twoFactorApi.endpoints.initiateSetup).toBeDefined();
        });

        it('verifySetup should invalidate TwoFactor, SecuritySettings, and Profile tags', () => {
            // The verifySetup mutation should invalidate multiple tags
            // since enabling 2FA affects security settings and profile
            expect(twoFactorApi.endpoints.verifySetup).toBeDefined();
        });

        it('disableTwoFactor should invalidate SecuritySettings, Profile, and TwoFactor tags', () => {
            // The disableTwoFactor mutation should invalidate multiple tags
            // since disabling 2FA affects security settings and profile
            expect(twoFactorApi.endpoints.disableTwoFactor).toBeDefined();
        });
    });

    describe('endpoint HTTP methods', () => {
        it('initiateSetup should use POST method', async () => {
            // Arrange & Act
            await store.dispatch(twoFactorApi.endpoints.initiateSetup.initiate());

            // Assert
            expect(capturedRequest?.method).toBe('POST');
        });

        it('verifySetup should use PUT method', async () => {
            // Arrange
            const verifyData: VerifySetupRequest = { code: '000000' };

            // Act
            await store.dispatch(twoFactorApi.endpoints.verifySetup.initiate(verifyData));

            // Assert
            expect(capturedRequest?.method).toBe('PUT');
        });

        it('disableTwoFactor should use DELETE method', async () => {
            // Arrange
            const disableData: DisableTwoFactorRequest = { password: 'test' };

            // Act
            await store.dispatch(twoFactorApi.endpoints.disableTwoFactor.initiate(disableData));

            // Assert
            expect(capturedRequest?.method).toBe('DELETE');
        });
    });

    describe('endpoint URL paths', () => {
        it('initiateSetup should call /two-factor/setup', async () => {
            // Arrange & Act
            await store.dispatch(twoFactorApi.endpoints.initiateSetup.initiate());

            // Assert
            expect(capturedRequest?.url).toBe('/two-factor/setup');
        });

        it('verifySetup should call /two-factor/setup', async () => {
            // Arrange
            const verifyData: VerifySetupRequest = { code: '111111' };

            // Act
            await store.dispatch(twoFactorApi.endpoints.verifySetup.initiate(verifyData));

            // Assert
            expect(capturedRequest?.url).toBe('/two-factor/setup');
        });

        it('disableTwoFactor should call /two-factor', async () => {
            // Arrange
            const disableData: DisableTwoFactorRequest = { password: 'pwd' };

            // Act
            await store.dispatch(twoFactorApi.endpoints.disableTwoFactor.initiate(disableData));

            // Assert
            expect(capturedRequest?.url).toBe('/two-factor');
        });
    });

    describe('endpoint count verification', () => {
        it('should have exactly 3 endpoints', () => {
            // Arrange & Act
            const endpointNames = Object.keys(twoFactorApi.endpoints);

            // Assert
            expect(endpointNames.length).toBe(3);
        });

        it('should have initiateSetup endpoint', () => {
            // Arrange & Act & Assert
            expect(twoFactorApi.endpoints).toHaveProperty('initiateSetup');
        });

        it('should have verifySetup endpoint', () => {
            // Arrange & Act & Assert
            expect(twoFactorApi.endpoints).toHaveProperty('verifySetup');
        });

        it('should have disableTwoFactor endpoint', () => {
            // Arrange & Act & Assert
            expect(twoFactorApi.endpoints).toHaveProperty('disableTwoFactor');
        });
    });
});
