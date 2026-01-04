import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import apiClient, { configureApiClient } from './client';

describe('API Client', () => {
    let mockAxios: MockAdapter;

    beforeEach(() => {
        mockAxios = new MockAdapter(apiClient);
    });

    afterEach(() => {
        mockAxios.restore();
        vi.clearAllMocks();
    });

    describe('configuration', () => {
        it('should use withCredentials for cookie-based auth', () => {
            // Arrange & Act - access the axios defaults
            const defaults = apiClient.defaults;

            // Assert
            expect(defaults.withCredentials).toBe(true);
        });
    });

    describe('configureApiClient', () => {
        it('should accept onUnauthorized callback', () => {
            // Arrange
            const onUnauthorized = vi.fn();

            // Act - should not throw
            configureApiClient({ onUnauthorized });

            // Assert
            expect(onUnauthorized).not.toHaveBeenCalled();
        });

        it('should accept empty callbacks object', () => {
            // Arrange & Act - should not throw
            configureApiClient({});

            // Assert - no error thrown
            expect(true).toBe(true);
        });
    });

    describe('successful requests', () => {
        it('should pass through successful responses', async () => {
            // Arrange
            mockAxios.onGet('/api/admin/test').reply(200, { success: true, data: 'test' });

            // Act
            const response = await apiClient.get('/api/admin/test');

            // Assert
            expect(response.status).toBe(200);
            expect(response.data).toEqual({ success: true, data: 'test' });
        });

        it('should handle POST requests', async () => {
            // Arrange
            const requestData = { name: 'Test' };
            mockAxios.onPost('/api/admin/create').reply(201, { id: '123' });

            // Act
            const response = await apiClient.post('/api/admin/create', requestData);

            // Assert
            expect(response.status).toBe(201);
            expect(response.data).toEqual({ id: '123' });
        });
    });

    describe('unauthorized handling', () => {
        it('should call onUnauthorized callback on 401 response', async () => {
            // Arrange
            const onUnauthorized = vi.fn();
            configureApiClient({ onUnauthorized });
            mockAxios.onGet('/api/admin/protected').reply(401);

            // Act
            try {
                await apiClient.get('/api/admin/protected');
            } catch {
                // Expected to throw
            }

            // Assert
            expect(onUnauthorized).toHaveBeenCalledTimes(1);
        });

        it('should reject promise on 401 response', async () => {
            // Arrange
            const onUnauthorized = vi.fn();
            configureApiClient({ onUnauthorized });
            mockAxios.onGet('/api/admin/protected').reply(401);

            // Act & Assert
            await expect(apiClient.get('/api/admin/protected')).rejects.toThrow();
        });

        it('should not call onUnauthorized on other error codes', async () => {
            // Arrange
            const onUnauthorized = vi.fn();
            configureApiClient({ onUnauthorized });
            mockAxios.onGet('/api/admin/test').reply(403);

            // Act
            try {
                await apiClient.get('/api/admin/test');
            } catch {
                // Expected to throw
            }

            // Assert
            expect(onUnauthorized).not.toHaveBeenCalled();
        });

        it('should not call onUnauthorized on 500 error', async () => {
            // Arrange
            const onUnauthorized = vi.fn();
            configureApiClient({ onUnauthorized });
            mockAxios.onGet('/api/admin/test').reply(500);

            // Act
            try {
                await apiClient.get('/api/admin/test');
            } catch {
                // Expected to throw
            }

            // Assert
            expect(onUnauthorized).not.toHaveBeenCalled();
        });
    });

    describe('error handling', () => {
        it('should reject on 404 errors', async () => {
            // Arrange
            mockAxios.onGet('/api/admin/notfound').reply(404);

            // Act & Assert
            await expect(apiClient.get('/api/admin/notfound')).rejects.toThrow();
        });

        it('should reject on network errors', async () => {
            // Arrange
            mockAxios.onGet('/api/admin/test').networkError();

            // Act & Assert
            await expect(apiClient.get('/api/admin/test')).rejects.toThrow();
        });

        it('should reject on timeout', async () => {
            // Arrange
            mockAxios.onGet('/api/admin/test').timeout();

            // Act & Assert
            await expect(apiClient.get('/api/admin/test')).rejects.toThrow();
        });
    });

    describe('request methods', () => {
        it('should support GET requests', async () => {
            // Arrange
            mockAxios.onGet('/api/admin/items').reply(200, [{ id: 1 }]);

            // Act
            const response = await apiClient.get('/api/admin/items');

            // Assert
            expect(response.data).toEqual([{ id: 1 }]);
        });

        it('should support PUT requests', async () => {
            // Arrange
            mockAxios.onPut('/api/admin/items/1').reply(200, { updated: true });

            // Act
            const response = await apiClient.put('/api/admin/items/1', { name: 'Updated' });

            // Assert
            expect(response.data).toEqual({ updated: true });
        });

        it('should support DELETE requests', async () => {
            // Arrange
            mockAxios.onDelete('/api/admin/items/1').reply(204);

            // Act
            const response = await apiClient.delete('/api/admin/items/1');

            // Assert
            expect(response.status).toBe(204);
        });

        it('should support PATCH requests', async () => {
            // Arrange
            mockAxios.onPatch('/api/admin/items/1').reply(200, { patched: true });

            // Act
            const response = await apiClient.patch('/api/admin/items/1', { field: 'value' });

            // Assert
            expect(response.data).toEqual({ patched: true });
        });
    });
});
