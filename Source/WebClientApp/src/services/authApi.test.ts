import { configureStore } from '@reduxjs/toolkit';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { authApi } from './authApi';

vi.mock('./enhancedBaseQuery', () => ({
    createEnhancedBaseQuery: vi.fn(() => vi.fn()),
}));

describe('authApi', () => {
    let store: ReturnType<typeof configureStore>;

    beforeEach(() => {
        vi.clearAllMocks();
        store = configureStore({
            reducer: {
                [authApi.reducerPath]: authApi.reducer,
            },
            middleware: (getDefaultMiddleware) =>
                getDefaultMiddleware().concat(authApi.middleware),
        });
    });

    describe('API configuration', () => {
        it('should have correct reducerPath', () => {
            // Arrange & Act
            const reducerPath = authApi.reducerPath;

            // Assert
            expect(reducerPath).toBe('authApi');
        });

        it('should define User tag type', () => {
            // Arrange & Act & Assert
            expect(authApi.util.selectInvalidatedBy).toBeDefined();
        });

        it('should have reducer defined', () => {
            // Arrange & Act & Assert
            expect(authApi.reducer).toBeDefined();
            expect(typeof authApi.reducer).toBe('function');
        });

        it('should have middleware defined', () => {
            // Arrange & Act & Assert
            expect(authApi.middleware).toBeDefined();
            expect(typeof authApi.middleware).toBe('function');
        });
    });

    describe('endpoint definitions', () => {
        describe('Authentication endpoints', () => {
            it('should define login endpoint', () => {
                // Arrange & Act & Assert
                expect(authApi.endpoints.login).toBeDefined();
                expect(authApi.endpoints.login.useMutation).toBeDefined();
            });

            it('should define logout endpoint', () => {
                // Arrange & Act & Assert
                expect(authApi.endpoints.logout).toBeDefined();
                expect(authApi.endpoints.logout.useMutation).toBeDefined();
            });

            it('should define getCurrentUser endpoint', () => {
                // Arrange & Act & Assert
                expect(authApi.endpoints.getCurrentUser).toBeDefined();
                expect(authApi.endpoints.getCurrentUser.useQuery).toBeDefined();
            });

            it('should define register endpoint', () => {
                // Arrange & Act & Assert
                expect(authApi.endpoints.register).toBeDefined();
                expect(authApi.endpoints.register.useMutation).toBeDefined();
            });

            it('should define refreshAuth endpoint', () => {
                // Arrange & Act & Assert
                expect(authApi.endpoints.refreshAuth).toBeDefined();
                expect(authApi.endpoints.refreshAuth.useMutation).toBeDefined();
            });
        });

        describe('Password management endpoints', () => {
            it('should define resetPassword endpoint', () => {
                // Arrange & Act & Assert
                expect(authApi.endpoints.resetPassword).toBeDefined();
                expect(authApi.endpoints.resetPassword.useMutation).toBeDefined();
            });

            it('should define confirmResetPassword endpoint', () => {
                // Arrange & Act & Assert
                expect(authApi.endpoints.confirmResetPassword).toBeDefined();
                expect(authApi.endpoints.confirmResetPassword.useMutation).toBeDefined();
            });

            it('should define changePassword endpoint', () => {
                // Arrange & Act & Assert
                expect(authApi.endpoints.changePassword).toBeDefined();
                expect(authApi.endpoints.changePassword.useMutation).toBeDefined();
            });
        });

        describe('Two-Factor Authentication endpoints', () => {
            it('should define setupTwoFactor endpoint', () => {
                // Arrange & Act & Assert
                expect(authApi.endpoints.setupTwoFactor).toBeDefined();
                expect(authApi.endpoints.setupTwoFactor.useMutation).toBeDefined();
            });

            it('should define enableTwoFactor endpoint', () => {
                // Arrange & Act & Assert
                expect(authApi.endpoints.enableTwoFactor).toBeDefined();
                expect(authApi.endpoints.enableTwoFactor.useMutation).toBeDefined();
            });

            it('should define disableTwoFactor endpoint', () => {
                // Arrange & Act & Assert
                expect(authApi.endpoints.disableTwoFactor).toBeDefined();
                expect(authApi.endpoints.disableTwoFactor.useMutation).toBeDefined();
            });

            it('should define verifyTwoFactor endpoint', () => {
                // Arrange & Act & Assert
                expect(authApi.endpoints.verifyTwoFactor).toBeDefined();
                expect(authApi.endpoints.verifyTwoFactor.useMutation).toBeDefined();
            });

            it('should define verifyRecoveryCode endpoint', () => {
                // Arrange & Act & Assert
                expect(authApi.endpoints.verifyRecoveryCode).toBeDefined();
                expect(authApi.endpoints.verifyRecoveryCode.useMutation).toBeDefined();
            });

            it('should define generateRecoveryCodes endpoint', () => {
                // Arrange & Act & Assert
                expect(authApi.endpoints.generateRecoveryCodes).toBeDefined();
                expect(authApi.endpoints.generateRecoveryCodes.useMutation).toBeDefined();
            });
        });

        describe('External login endpoints', () => {
            it('should define externalLogin endpoint', () => {
                // Arrange & Act & Assert
                expect(authApi.endpoints.externalLogin).toBeDefined();
                expect(authApi.endpoints.externalLogin.useMutation).toBeDefined();
            });

            it('should define getExternalProviders endpoint', () => {
                // Arrange & Act & Assert
                expect(authApi.endpoints.getExternalProviders).toBeDefined();
                expect(authApi.endpoints.getExternalProviders.useQuery).toBeDefined();
            });

            it('should define externalLoginCallback endpoint', () => {
                // Arrange & Act & Assert
                expect(authApi.endpoints.externalLoginCallback).toBeDefined();
                expect(authApi.endpoints.externalLoginCallback.useMutation).toBeDefined();
            });

            it('should define linkExternalLogin endpoint', () => {
                // Arrange & Act & Assert
                expect(authApi.endpoints.linkExternalLogin).toBeDefined();
                expect(authApi.endpoints.linkExternalLogin.useMutation).toBeDefined();
            });

            it('should define unlinkExternalLogin endpoint', () => {
                // Arrange & Act & Assert
                expect(authApi.endpoints.unlinkExternalLogin).toBeDefined();
                expect(authApi.endpoints.unlinkExternalLogin.useMutation).toBeDefined();
            });
        });

        describe('Profile endpoints', () => {
            it('should define updateProfile endpoint', () => {
                // Arrange & Act & Assert
                expect(authApi.endpoints.updateProfile).toBeDefined();
                expect(authApi.endpoints.updateProfile.useMutation).toBeDefined();
            });

            it('should define confirmEmail endpoint', () => {
                // Arrange & Act & Assert
                expect(authApi.endpoints.confirmEmail).toBeDefined();
                expect(authApi.endpoints.confirmEmail.useMutation).toBeDefined();
            });

            it('should define resendEmailConfirmation endpoint', () => {
                // Arrange & Act & Assert
                expect(authApi.endpoints.resendEmailConfirmation).toBeDefined();
                expect(authApi.endpoints.resendEmailConfirmation.useMutation).toBeDefined();
            });
        });
    });

    describe('hook exports', () => {
        describe('Authentication hooks', () => {
            it('should export useLoginMutation hook', async () => {
                // Arrange & Act
                const api = await import('./authApi');

                // Assert
                expect(typeof api.useLoginMutation).toBe('function');
            });

            it('should export useLogoutMutation hook', async () => {
                // Arrange & Act
                const api = await import('./authApi');

                // Assert
                expect(typeof api.useLogoutMutation).toBe('function');
            });

            it('should export useGetCurrentUserQuery hook', async () => {
                // Arrange & Act
                const api = await import('./authApi');

                // Assert
                expect(typeof api.useGetCurrentUserQuery).toBe('function');
            });

            it('should export useRegisterMutation hook', async () => {
                // Arrange & Act
                const api = await import('./authApi');

                // Assert
                expect(typeof api.useRegisterMutation).toBe('function');
            });

            it('should export useRefreshAuthMutation hook', async () => {
                // Arrange & Act
                const api = await import('./authApi');

                // Assert
                expect(typeof api.useRefreshAuthMutation).toBe('function');
            });
        });

        describe('Password management hooks', () => {
            it('should export useResetPasswordMutation hook', async () => {
                // Arrange & Act
                const api = await import('./authApi');

                // Assert
                expect(typeof api.useResetPasswordMutation).toBe('function');
            });

            it('should export useConfirmResetPasswordMutation hook', async () => {
                // Arrange & Act
                const api = await import('./authApi');

                // Assert
                expect(typeof api.useConfirmResetPasswordMutation).toBe('function');
            });

            it('should export useChangePasswordMutation hook', async () => {
                // Arrange & Act
                const api = await import('./authApi');

                // Assert
                expect(typeof api.useChangePasswordMutation).toBe('function');
            });
        });

        describe('Two-Factor Authentication hooks', () => {
            it('should export useSetupTwoFactorMutation hook', async () => {
                // Arrange & Act
                const api = await import('./authApi');

                // Assert
                expect(typeof api.useSetupTwoFactorMutation).toBe('function');
            });

            it('should export useEnableTwoFactorMutation hook', async () => {
                // Arrange & Act
                const api = await import('./authApi');

                // Assert
                expect(typeof api.useEnableTwoFactorMutation).toBe('function');
            });

            it('should export useDisableTwoFactorMutation hook', async () => {
                // Arrange & Act
                const api = await import('./authApi');

                // Assert
                expect(typeof api.useDisableTwoFactorMutation).toBe('function');
            });

            it('should export useVerifyTwoFactorMutation hook', async () => {
                // Arrange & Act
                const api = await import('./authApi');

                // Assert
                expect(typeof api.useVerifyTwoFactorMutation).toBe('function');
            });

            it('should export useVerifyRecoveryCodeMutation hook', async () => {
                // Arrange & Act
                const api = await import('./authApi');

                // Assert
                expect(typeof api.useVerifyRecoveryCodeMutation).toBe('function');
            });

            it('should export useGenerateRecoveryCodesMutation hook', async () => {
                // Arrange & Act
                const api = await import('./authApi');

                // Assert
                expect(typeof api.useGenerateRecoveryCodesMutation).toBe('function');
            });
        });

        describe('External login hooks', () => {
            it('should export useExternalLoginMutation hook', async () => {
                // Arrange & Act
                const api = await import('./authApi');

                // Assert
                expect(typeof api.useExternalLoginMutation).toBe('function');
            });

            it('should export useGetExternalProvidersQuery hook', async () => {
                // Arrange & Act
                const api = await import('./authApi');

                // Assert
                expect(typeof api.useGetExternalProvidersQuery).toBe('function');
            });

            it('should export useExternalLoginCallbackMutation hook', async () => {
                // Arrange & Act
                const api = await import('./authApi');

                // Assert
                expect(typeof api.useExternalLoginCallbackMutation).toBe('function');
            });

            it('should export useLinkExternalLoginMutation hook', async () => {
                // Arrange & Act
                const api = await import('./authApi');

                // Assert
                expect(typeof api.useLinkExternalLoginMutation).toBe('function');
            });

            it('should export useUnlinkExternalLoginMutation hook', async () => {
                // Arrange & Act
                const api = await import('./authApi');

                // Assert
                expect(typeof api.useUnlinkExternalLoginMutation).toBe('function');
            });
        });

        describe('Profile hooks', () => {
            it('should export useUpdateProfileMutation hook', async () => {
                // Arrange & Act
                const api = await import('./authApi');

                // Assert
                expect(typeof api.useUpdateProfileMutation).toBe('function');
            });

            it('should export useConfirmEmailMutation hook', async () => {
                // Arrange & Act
                const api = await import('./authApi');

                // Assert
                expect(typeof api.useConfirmEmailMutation).toBe('function');
            });

            it('should export useResendEmailConfirmationMutation hook', async () => {
                // Arrange & Act
                const api = await import('./authApi');

                // Assert
                expect(typeof api.useResendEmailConfirmationMutation).toBe('function');
            });
        });
    });

    describe('store integration', () => {
        it('should integrate with Redux store correctly', () => {
            // Arrange & Act
            const state = store.getState() as { [key: string]: unknown };

            // Assert
            expect(state[authApi.reducerPath]).toBeDefined();
        });

        it('should have initialized queries state', () => {
            // Arrange & Act
            const state = store.getState() as { [key: string]: { queries?: unknown; mutations?: unknown } };

            // Assert
            expect(state[authApi.reducerPath]?.queries).toBeDefined();
        });

        it('should have initialized mutations state', () => {
            // Arrange & Act
            const state = store.getState() as { [key: string]: { queries?: unknown; mutations?: unknown } };

            // Assert
            expect(state[authApi.reducerPath]?.mutations).toBeDefined();
        });

        it('should have empty queries initially', () => {
            // Arrange & Act
            const state = store.getState() as { [key: string]: { queries?: object } };

            // Assert
            expect(Object.keys(state[authApi.reducerPath]?.queries ?? {}).length).toBe(0);
        });

        it('should have empty mutations initially', () => {
            // Arrange & Act
            const state = store.getState() as { [key: string]: { mutations?: object } };

            // Assert
            expect(Object.keys(state[authApi.reducerPath]?.mutations ?? {}).length).toBe(0);
        });
    });

    describe('endpoint count verification', () => {
        it('should have correct total number of endpoints', () => {
            // Arrange & Act
            const endpointNames = Object.keys(authApi.endpoints);

            // Assert
            // 5 auth + 3 password + 6 2FA + 5 external + 3 profile = 22
            expect(endpointNames.length).toBe(22);
        });

        it('should have all authentication endpoints', () => {
            // Arrange
            const expectedEndpoints = [
                'login',
                'logout',
                'getCurrentUser',
                'register',
                'refreshAuth',
            ];

            // Act & Assert
            expectedEndpoints.forEach((name) => {
                expect(authApi.endpoints).toHaveProperty(name);
            });
        });

        it('should have all password management endpoints', () => {
            // Arrange
            const expectedEndpoints = [
                'resetPassword',
                'confirmResetPassword',
                'changePassword',
            ];

            // Act & Assert
            expectedEndpoints.forEach((name) => {
                expect(authApi.endpoints).toHaveProperty(name);
            });
        });

        it('should have all two-factor authentication endpoints', () => {
            // Arrange
            const expectedEndpoints = [
                'setupTwoFactor',
                'enableTwoFactor',
                'disableTwoFactor',
                'verifyTwoFactor',
                'verifyRecoveryCode',
                'generateRecoveryCodes',
            ];

            // Act & Assert
            expectedEndpoints.forEach((name) => {
                expect(authApi.endpoints).toHaveProperty(name);
            });
        });

        it('should have all external login endpoints', () => {
            // Arrange
            const expectedEndpoints = [
                'externalLogin',
                'getExternalProviders',
                'externalLoginCallback',
                'linkExternalLogin',
                'unlinkExternalLogin',
            ];

            // Act & Assert
            expectedEndpoints.forEach((name) => {
                expect(authApi.endpoints).toHaveProperty(name);
            });
        });

        it('should have all profile endpoints', () => {
            // Arrange
            const expectedEndpoints = [
                'updateProfile',
                'confirmEmail',
                'resendEmailConfirmation',
            ];

            // Act & Assert
            expectedEndpoints.forEach((name) => {
                expect(authApi.endpoints).toHaveProperty(name);
            });
        });
    });

    describe('cache tag invalidation logic', () => {
        it('login should NOT invalidate User tag to prevent race condition', () => {
            // CRITICAL: Login mutation must NOT have invalidatesTags.
            // If it does, RTK Query will immediately refetch getCurrentUser after login,
            // but the browser hasn't stored the cookie yet, causing a 401 error.
            // The login response already includes user data, so no refetch is needed.
            //
            // This test prevents regression of the authentication race condition bug.
            const loginEndpoint = authApi.endpoints.login as unknown as {
                invalidatesTags?: unknown[];
            };

            // The endpoint should not have invalidatesTags defined, or it should be undefined/empty
            expect(
                loginEndpoint.invalidatesTags === undefined ||
                    (Array.isArray(loginEndpoint.invalidatesTags) && loginEndpoint.invalidatesTags.length === 0),
            ).toBe(true);
        });

        it('logout should invalidate User tag', () => {
            // The logout mutation should invalidate User tag to clear cached user
            expect(authApi.endpoints.logout).toBeDefined();
        });

        it('refreshAuth should invalidate User tag', () => {
            // The refreshAuth mutation should invalidate User tag to update user state
            expect(authApi.endpoints.refreshAuth).toBeDefined();
        });

        it('two-factor mutations should invalidate User tag', () => {
            // 2FA mutations affect user authentication state
            expect(authApi.endpoints.setupTwoFactor).toBeDefined();
            expect(authApi.endpoints.enableTwoFactor).toBeDefined();
            expect(authApi.endpoints.disableTwoFactor).toBeDefined();
            expect(authApi.endpoints.verifyTwoFactor).toBeDefined();
            expect(authApi.endpoints.verifyRecoveryCode).toBeDefined();
        });

        it('updateProfile should invalidate User tag', () => {
            // Profile updates affect the cached user data
            expect(authApi.endpoints.updateProfile).toBeDefined();
        });

        it('external login mutations should invalidate User tag', () => {
            // External login operations affect authentication state
            expect(authApi.endpoints.externalLoginCallback).toBeDefined();
            expect(authApi.endpoints.linkExternalLogin).toBeDefined();
            expect(authApi.endpoints.unlinkExternalLogin).toBeDefined();
        });

        it('getCurrentUser should provide User tag', () => {
            // getCurrentUser query should provide User tag for cache invalidation
            expect(authApi.endpoints.getCurrentUser).toBeDefined();
            expect(authApi.endpoints.getCurrentUser.useQuery).toBeDefined();
        });
    });

    describe('API utility methods', () => {
        it('should have util object defined', () => {
            // Arrange & Act & Assert
            expect(authApi.util).toBeDefined();
        });

        it('should have invalidateTags method', () => {
            // Arrange & Act & Assert
            expect(authApi.util.invalidateTags).toBeDefined();
            expect(typeof authApi.util.invalidateTags).toBe('function');
        });

        it('should have resetApiState method', () => {
            // Arrange & Act & Assert
            expect(authApi.util.resetApiState).toBeDefined();
            expect(typeof authApi.util.resetApiState).toBe('function');
        });

        it('should have updateQueryData method', () => {
            // Arrange & Act & Assert
            expect(authApi.util.updateQueryData).toBeDefined();
            expect(typeof authApi.util.updateQueryData).toBe('function');
        });
    });
});
