import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import apiClient from '@api/client';
import { authService } from './authService';
import type { AdminUser, LoginRequest, LoginResponse } from '../types/auth';

describe('authService', () => {
    let mockAxios: MockAdapter;

    const mockUser: AdminUser = {
        id: 'user-123',
        email: 'admin@example.com',
        displayName: 'Admin User',
        isAdmin: true,
        emailConfirmed: true,
        twoFactorEnabled: false,
    };

    const validCredentials: LoginRequest = {
        email: 'admin@example.com',
        password: 'SecurePassword123!',
    };

    beforeEach(() => {
        mockAxios = new MockAdapter(apiClient);
    });

    afterEach(() => {
        mockAxios.restore();
    });

    describe('login', () => {
        it('should call login endpoint with credentials', async () => {
            // Arrange
            const successResponse: LoginResponse = {
                success: true,
                user: mockUser,
                token: 'jwt-token-123',
            };
            mockAxios.onPost('/api/admin/auth/login').reply(200, successResponse);

            // Act
            await authService.login(validCredentials);

            // Assert
            expect(mockAxios.history.post).toHaveLength(1);
            expect(mockAxios.history.post[0]?.url).toBe('/api/admin/auth/login');
            expect(JSON.parse(mockAxios.history.post[0]?.data)).toEqual(validCredentials);
        });

        it('should return success response with user and token', async () => {
            // Arrange
            const successResponse: LoginResponse = {
                success: true,
                user: mockUser,
                token: 'jwt-token-123',
            };
            mockAxios.onPost('/api/admin/auth/login').reply(200, successResponse);

            // Act
            const result = await authService.login(validCredentials);

            // Assert
            expect(result.success).toBe(true);
            expect(result.user).toEqual(mockUser);
            expect(result.token).toBe('jwt-token-123');
        });

        it('should return success response without optional fields when not provided', async () => {
            // Arrange
            const successResponse: LoginResponse = {
                success: true,
            };
            mockAxios.onPost('/api/admin/auth/login').reply(200, successResponse);

            // Act
            const result = await authService.login(validCredentials);

            // Assert
            expect(result.success).toBe(true);
            expect(result.user).toBeUndefined();
            expect(result.token).toBeUndefined();
        });

        it('should return original response when success is false', async () => {
            // Arrange
            const failureResponse: LoginResponse = {
                success: false,
                error: 'Invalid credentials',
            };
            mockAxios.onPost('/api/admin/auth/login').reply(200, failureResponse);

            // Act
            const result = await authService.login(validCredentials);

            // Assert
            expect(result.success).toBe(false);
            expect(result.error).toBe('Invalid credentials');
        });

        it('should return requiresTwoFactor when 401 with flag', async () => {
            // Arrange
            mockAxios.onPost('/api/admin/auth/login').reply(401, {
                requiresTwoFactor: true,
            });

            // Act
            const result = await authService.login(validCredentials);

            // Assert
            expect(result.success).toBe(false);
            expect(result.requiresTwoFactor).toBe(true);
        });

        it('should return error message from API error response', async () => {
            // Arrange
            mockAxios.onPost('/api/admin/auth/login').reply(400, {
                message: 'Account is locked',
            });

            // Act
            const result = await authService.login(validCredentials);

            // Assert
            expect(result.success).toBe(false);
            expect(result.error).toBe('Account is locked');
        });

        it('should return default error message when API error has no message', async () => {
            // Arrange
            mockAxios.onPost('/api/admin/auth/login').reply(500, {});

            // Act
            const result = await authService.login(validCredentials);

            // Assert
            expect(result.success).toBe(false);
            expect(result.error).toBe('Login failed');
        });

        it('should return Network error on network failure', async () => {
            // Arrange
            mockAxios.onPost('/api/admin/auth/login').networkError();

            // Act
            const result = await authService.login(validCredentials);

            // Assert
            expect(result.success).toBe(false);
            expect(result.error).toBe('Network error');
        });
    });

    describe('logout', () => {
        it('should call logout endpoint', async () => {
            // Arrange
            mockAxios.onPost('/api/admin/auth/logout').reply(200);

            // Act
            await authService.logout();

            // Assert
            expect(mockAxios.history.post).toHaveLength(1);
            expect(mockAxios.history.post[0]?.url).toBe('/api/admin/auth/logout');
        });

        it('should not throw on error', async () => {
            // Arrange
            mockAxios.onPost('/api/admin/auth/logout').reply(500, {
                message: 'Internal server error',
            });

            // Act & Assert
            await expect(authService.logout()).resolves.toBeUndefined();
        });

        it('should not throw on network error', async () => {
            // Arrange
            mockAxios.onPost('/api/admin/auth/logout').networkError();

            // Act & Assert
            await expect(authService.logout()).resolves.toBeUndefined();
        });
    });

    describe('getCurrentUser', () => {
        it('should return user data on success', async () => {
            // Arrange
            mockAxios.onGet('/api/admin/auth/me').reply(200, mockUser);

            // Act
            const result = await authService.getCurrentUser();

            // Assert
            expect(result).toEqual(mockUser);
            expect(result?.id).toBe('user-123');
            expect(result?.email).toBe('admin@example.com');
            expect(result?.isAdmin).toBe(true);
        });

        it('should return null on error', async () => {
            // Arrange
            mockAxios.onGet('/api/admin/auth/me').reply(401, {
                message: 'Unauthorized',
            });

            // Act
            const result = await authService.getCurrentUser();

            // Assert
            expect(result).toBeNull();
        });

        it('should return null on network error', async () => {
            // Arrange
            mockAxios.onGet('/api/admin/auth/me').networkError();

            // Act
            const result = await authService.getCurrentUser();

            // Assert
            expect(result).toBeNull();
        });
    });

    describe('checkSession', () => {
        it('should return true when session valid (200)', async () => {
            // Arrange
            mockAxios.onGet('/api/admin/auth/session').reply(200, { valid: true });

            // Act
            const result = await authService.checkSession();

            // Assert
            expect(result).toBe(true);
        });

        it('should return false when session invalid (401)', async () => {
            // Arrange
            mockAxios.onGet('/api/admin/auth/session').reply(401);

            // Act
            const result = await authService.checkSession();

            // Assert
            expect(result).toBe(false);
        });

        it('should return false when session check fails (500)', async () => {
            // Arrange
            mockAxios.onGet('/api/admin/auth/session').reply(500);

            // Act
            const result = await authService.checkSession();

            // Assert
            expect(result).toBe(false);
        });

        it('should return false on network error', async () => {
            // Arrange
            mockAxios.onGet('/api/admin/auth/session').networkError();

            // Act
            const result = await authService.checkSession();

            // Assert
            expect(result).toBe(false);
        });
    });
});
