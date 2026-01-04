import { renderHook, waitFor, act } from '@testing-library/react';
import type React from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { beforeEach, describe, expect, it, vi, afterEach } from 'vitest';
import { useAuthenticatedResource, useAuthenticatedResourceCached } from './useAuthenticatedResource';

// Mock URL.createObjectURL and URL.revokeObjectURL
const mockCreateObjectURL = vi.fn();
const mockRevokeObjectURL = vi.fn();

// Helper to create a proper mock Response
const createMockResponse = (options: { ok: boolean; status?: number; blob?: Blob }) => ({
    ok: options.ok,
    status: options.status ?? (options.ok ? 200 : 500),
    blob: () => Promise.resolve(options.blob ?? new Blob(['test'], { type: 'image/png' })),
    clone: function() { return this; },
    headers: new Headers(),
    redirected: false,
    statusText: options.ok ? 'OK' : 'Error',
    type: 'basic' as ResponseType,
    url: '',
    body: null,
    bodyUsed: false,
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    formData: () => Promise.resolve(new FormData()),
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
});

// Helper to get URL from fetch call (handles both string and Request)
const getFetchUrl = (call: unknown[]): string => {
    const input = call[0];
    if (typeof input === 'string') return input;
    if (input instanceof Request) return input.url;
    // For JSDOM's internal Request representation
    if (input && typeof input === 'object' && 'url' in input) return String((input as { url: string }).url);
    return '';
};

// Create a mock store with auth state
const createMockStore = (isAuthenticated: boolean) =>
    configureStore({
        reducer: {
            auth: () => ({ isAuthenticated }),
        },
    });

// Wrapper component for rendering hooks with Redux
const createWrapper = (isAuthenticated: boolean): React.FC<{ children: React.ReactNode }> => {
    const store = createMockStore(isAuthenticated);
    const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
        <Provider store={store}>{children}</Provider>
    );
    Wrapper.displayName = 'TestWrapper';
    return Wrapper;
};

describe('useAuthenticatedResource', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.stubGlobal('fetch', vi.fn());
        global.URL.createObjectURL = mockCreateObjectURL;
        global.URL.revokeObjectURL = mockRevokeObjectURL;
        mockCreateObjectURL.mockReturnValue('blob:http://localhost/test-blob-url');
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });

    describe('when authenticated', () => {
        it('should fetch resource and return blob URL', async () => {
            const mockBlob = new Blob(['test content'], { type: 'image/png' });
            vi.mocked(fetch).mockResolvedValueOnce(
                createMockResponse({ ok: true, blob: mockBlob }) as Response
            );

            const { result } = renderHook(
                () => useAuthenticatedResource('resource-123'),
                { wrapper: createWrapper(true) }
            );

            expect(result.current.isLoading).toBe(true);
            expect(result.current.url).toBeNull();

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.url).toBe('blob:http://localhost/test-blob-url');
            expect(result.current.error).toBeNull();
            expect(fetch).toHaveBeenCalledTimes(1);
            const fetchUrl = getFetchUrl(vi.mocked(fetch).mock.calls[0] ?? []);
            expect(fetchUrl).toContain('/api/resources/resource-123');
        });

        it('should handle paths starting with /api/', async () => {
            vi.mocked(fetch).mockResolvedValueOnce(
                createMockResponse({ ok: true }) as Response
            );

            const { result } = renderHook(
                () => useAuthenticatedResource('/api/custom/endpoint'),
                { wrapper: createWrapper(true) }
            );

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(fetch).toHaveBeenCalledTimes(1);
            const fetchUrl = getFetchUrl(vi.mocked(fetch).mock.calls[0] ?? []);
            expect(fetchUrl).toContain('/api/custom/endpoint');
        });

        it('should normalize absolute URLs to relative paths', async () => {
            vi.mocked(fetch).mockResolvedValueOnce(
                createMockResponse({ ok: true }) as Response
            );

            const { result } = renderHook(
                () => useAuthenticatedResource('http://example.com/api/resources/test'),
                { wrapper: createWrapper(true) }
            );

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(fetch).toHaveBeenCalledTimes(1);
            const fetchUrl = getFetchUrl(vi.mocked(fetch).mock.calls[0] ?? []);
            expect(fetchUrl).toContain('/api/resources/test');
        });

        it('should handle fetch errors', async () => {
            vi.mocked(fetch).mockResolvedValueOnce(
                createMockResponse({ ok: false, status: 404 }) as Response
            );

            const { result } = renderHook(
                () => useAuthenticatedResource('not-found'),
                { wrapper: createWrapper(true) }
            );

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.url).toBeNull();
            expect(result.current.error).toBeInstanceOf(Error);
            expect(result.current.error?.message).toBe('Failed to fetch resource: 404');
        });

        it('should handle network errors', async () => {
            vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

            const { result } = renderHook(
                () => useAuthenticatedResource('resource'),
                { wrapper: createWrapper(true) }
            );

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(result.current.url).toBeNull();
            expect(result.current.error?.message).toBe('Network error');
        });

        it('should revoke previous blob URL when fetching new resource', async () => {
            vi.mocked(fetch).mockResolvedValue(
                createMockResponse({ ok: true }) as Response
            );

            mockCreateObjectURL
                .mockReturnValueOnce('blob:first-url')
                .mockReturnValueOnce('blob:second-url');

            const { result, rerender } = renderHook(
                ({ path }) => useAuthenticatedResource(path),
                {
                    wrapper: createWrapper(true),
                    initialProps: { path: 'resource-1' },
                }
            );

            await waitFor(() => {
                expect(result.current.url).toBe('blob:first-url');
            });

            rerender({ path: 'resource-2' });

            await waitFor(() => {
                expect(result.current.url).toBe('blob:second-url');
            });

            expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:first-url');
        });

        it('should support refetch', async () => {
            vi.mocked(fetch).mockResolvedValue(
                createMockResponse({ ok: true }) as Response
            );

            const { result } = renderHook(
                () => useAuthenticatedResource('resource'),
                { wrapper: createWrapper(true) }
            );

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(fetch).toHaveBeenCalledTimes(1);

            act(() => {
                result.current.refetch();
            });

            await waitFor(() => {
                expect(fetch).toHaveBeenCalledTimes(2);
            });
        });

        it('should abort fetch on unmount', async () => {
            const abortSpy = vi.spyOn(AbortController.prototype, 'abort');
            vi.mocked(fetch).mockImplementation(() => new Promise(() => {})); // Never resolves

            const { unmount } = renderHook(
                () => useAuthenticatedResource('resource'),
                { wrapper: createWrapper(true) }
            );

            unmount();

            expect(abortSpy).toHaveBeenCalled();
        });

        it('should revoke blob URL on unmount', async () => {
            vi.mocked(fetch).mockResolvedValueOnce(
                createMockResponse({ ok: true }) as Response
            );

            const { result, unmount } = renderHook(
                () => useAuthenticatedResource('resource'),
                { wrapper: createWrapper(true) }
            );

            await waitFor(() => {
                expect(result.current.url).toBe('blob:http://localhost/test-blob-url');
            });

            unmount();

            expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:http://localhost/test-blob-url');
        });
    });

    describe('when not authenticated', () => {
        it('should return null URL without fetching', async () => {
            const { result } = renderHook(
                () => useAuthenticatedResource('resource'),
                { wrapper: createWrapper(false) }
            );

            // Wait a tick to ensure no async operations are pending
            await act(async () => {
                await new Promise(resolve => setTimeout(resolve, 0));
            });

            expect(result.current.url).toBeNull();
            expect(result.current.isLoading).toBe(false);
            expect(fetch).not.toHaveBeenCalled();
        });
    });

    describe('when disabled', () => {
        it('should return null URL without fetching', async () => {
            const { result } = renderHook(
                () => useAuthenticatedResource('resource', { enabled: false }),
                { wrapper: createWrapper(true) }
            );

            await act(async () => {
                await new Promise(resolve => setTimeout(resolve, 0));
            });

            expect(result.current.url).toBeNull();
            expect(result.current.isLoading).toBe(false);
            expect(fetch).not.toHaveBeenCalled();
        });
    });

    describe('when resourcePath is null or undefined', () => {
        it('should return null URL for null path', async () => {
            const { result } = renderHook(
                () => useAuthenticatedResource(null),
                { wrapper: createWrapper(true) }
            );

            await act(async () => {
                await new Promise(resolve => setTimeout(resolve, 0));
            });

            expect(result.current.url).toBeNull();
            expect(fetch).not.toHaveBeenCalled();
        });

        it('should return null URL for undefined path', async () => {
            const { result } = renderHook(
                () => useAuthenticatedResource(undefined),
                { wrapper: createWrapper(true) }
            );

            await act(async () => {
                await new Promise(resolve => setTimeout(resolve, 0));
            });

            expect(result.current.url).toBeNull();
            expect(fetch).not.toHaveBeenCalled();
        });
    });

    describe('URL normalization', () => {
        it('should handle relative paths starting with /', async () => {
            vi.mocked(fetch).mockResolvedValueOnce(
                createMockResponse({ ok: true }) as Response
            );

            const { result } = renderHook(
                () => useAuthenticatedResource('/some/path'),
                { wrapper: createWrapper(true) }
            );

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(fetch).toHaveBeenCalledTimes(1);
            const fetchUrl = getFetchUrl(vi.mocked(fetch).mock.calls[0] ?? []);
            expect(fetchUrl).toContain('/api/resources//some/path');
        });

        it('should preserve query strings and hashes from absolute URLs', async () => {
            vi.mocked(fetch).mockResolvedValueOnce(
                createMockResponse({ ok: true }) as Response
            );

            const { result } = renderHook(
                () => useAuthenticatedResource('http://example.com/api/test?query=1#hash'),
                { wrapper: createWrapper(true) }
            );

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });

            expect(fetch).toHaveBeenCalledTimes(1);
            const fetchUrl = getFetchUrl(vi.mocked(fetch).mock.calls[0] ?? []);
            expect(fetchUrl).toContain('/api/test');
            expect(fetchUrl).toContain('query=1');
        });
    });
});

describe('useAuthenticatedResourceCached', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.stubGlobal('fetch', vi.fn());
        global.URL.createObjectURL = mockCreateObjectURL;
        global.URL.revokeObjectURL = mockRevokeObjectURL;
        mockCreateObjectURL.mockReturnValue('blob:http://localhost/cached-blob-url');
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });

    it('should fetch and cache resource', async () => {
        vi.mocked(fetch).mockResolvedValueOnce(
            createMockResponse({ ok: true }) as Response
        );

        const { result } = renderHook(
            () => useAuthenticatedResourceCached('cached-resource'),
            { wrapper: createWrapper(true) }
        );

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.url).toBe('blob:http://localhost/cached-blob-url');
        expect(fetch).toHaveBeenCalledTimes(1);
    });

    it('should return cached URL on repeated calls for same resource', async () => {
        vi.mocked(fetch).mockResolvedValue(
            createMockResponse({ ok: true }) as Response
        );

        mockCreateObjectURL.mockReturnValue('blob:cached-url');

        // First hook instance
        const { result: result1 } = renderHook(
            () => useAuthenticatedResourceCached('shared-resource'),
            { wrapper: createWrapper(true) }
        );

        await waitFor(() => {
            expect(result1.current.url).toBe('blob:cached-url');
        });

        // Second hook instance with same resource
        const { result: result2 } = renderHook(
            () => useAuthenticatedResourceCached('shared-resource'),
            { wrapper: createWrapper(true) }
        );

        await waitFor(() => {
            expect(result2.current.url).toBe('blob:cached-url');
        });

        // Should only fetch once due to caching
        expect(fetch).toHaveBeenCalledTimes(1);
    });

    it('should return null when not authenticated', async () => {
        const { result } = renderHook(
            () => useAuthenticatedResourceCached('resource'),
            { wrapper: createWrapper(false) }
        );

        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 0));
        });

        expect(result.current.url).toBeNull();
        expect(fetch).not.toHaveBeenCalled();
    });

    it('should return null when disabled', async () => {
        const { result } = renderHook(
            () => useAuthenticatedResourceCached('resource', { enabled: false }),
            { wrapper: createWrapper(true) }
        );

        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 0));
        });

        expect(result.current.url).toBeNull();
        expect(fetch).not.toHaveBeenCalled();
    });

    it('should handle fetch errors', async () => {
        vi.mocked(fetch).mockResolvedValueOnce(
            createMockResponse({ ok: false, status: 500 }) as Response
        );

        const { result } = renderHook(
            () => useAuthenticatedResourceCached('error-resource'),
            { wrapper: createWrapper(true) }
        );

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.url).toBeNull();
        expect(result.current.error?.message).toBe('Failed to fetch resource: 500');
    });

    it('should support refetch', async () => {
        vi.mocked(fetch).mockResolvedValue(
            createMockResponse({ ok: true }) as Response
        );

        mockCreateObjectURL.mockReturnValue('blob:refetch-url');

        const { result } = renderHook(
            () => useAuthenticatedResourceCached('refetch-resource'),
            { wrapper: createWrapper(true) }
        );

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(typeof result.current.refetch).toBe('function');
    });
});
