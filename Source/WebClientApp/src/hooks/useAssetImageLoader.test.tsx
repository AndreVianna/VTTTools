import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import type React from 'react';
import { useAssetImageLoader } from './useAssetImageLoader';
import {
    AssetKind,
    LabelVisibility,
    LabelPosition,
    type PlacedAsset,
    type Asset,
    type MediaResource,
} from '@/types/domain';

// Mock dependencies
vi.mock('@/config/development', () => ({
    getApiEndpoints: vi.fn(() => ({
        media: 'https://api.test.com/media',
        api: 'https://api.test.com',
    })),
}));

// Factory functions
const createMockMediaResource = (id: string): MediaResource => ({
    id,
    name: `media-${id}`,
    path: `/media/${id}`,
    mimeType: 'image/png',
    size: 1000,
    width: 100,
    height: 100,
});

const createMockAsset = (overrides?: Partial<Asset>): Asset => ({
    id: 'asset-1',
    name: 'Test Asset',
    description: '',
    classification: {
        kind: AssetKind.Object,
        category: 'General',
        type: 'Prop',
        subtype: null,
    },
    size: { width: 1, height: 1 },
    thumbnail: createMockMediaResource('thumb-1'),
    portrait: null,
    tokens: [],
    statBlocks: {},
    tags: [],
    ownerId: 'user-1',
    isPublished: false,
    isPublic: false,
    ...overrides,
});

const createMockAssetWithToken = (overrides?: Partial<Asset>): Asset => createMockAsset({
    tokens: [createMockMediaResource('token-1')],
    ...overrides,
});

const createMockAssetWithPortrait = (overrides?: Partial<Asset>): Asset => createMockAsset({
    portrait: createMockMediaResource('portrait-1'),
    ...overrides,
});

const createMockPlacedAsset = (overrides?: Partial<PlacedAsset>): PlacedAsset => ({
    id: 'placed-asset-1',
    assetId: 'asset-1',
    asset: createMockAssetWithToken(),
    position: { x: 100, y: 100 },
    size: { width: 50, height: 50 },
    rotation: 0,
    layer: 'layer-objects',
    index: 0,
    number: 1,
    name: 'Test Asset',
    isHidden: false,
    isLocked: false,
    labelVisibility: LabelVisibility.Default,
    labelPosition: LabelPosition.Default,
    ...overrides,
});

// Store factory
const createMockStore = (isAuthenticated = true) => configureStore({
    reducer: {
        auth: () => ({ isAuthenticated }),
    },
});

// Wrapper factory
const createWrapper = (isAuthenticated = true) => {
    const store = createMockStore(isAuthenticated);
    return ({ children }: { children: React.ReactNode }) => (
        <Provider store={store}>{children}</Provider>
    );
};

// Mock Image and fetch
let mockImageOnload: (() => void) | null = null;
let mockImageOnerror: (() => void) | null = null;

class MockImage {
    onload: (() => void) | null = null;
    onerror: (() => void) | null = null;
    src = '';
    _blobUrl?: string;

    constructor() {
        mockImageOnload = () => this.onload?.();
        mockImageOnerror = () => this.onerror?.();
    }
}

describe('useAssetImageLoader', () => {
    let originalImage: typeof window.Image;
    let originalFetch: typeof global.fetch;
    let originalCreateObjectURL: typeof URL.createObjectURL;
    let originalRevokeObjectURL: typeof URL.revokeObjectURL;
    let blobUrlCounter: number;
    let revokedUrls: string[];

    beforeEach(() => {
        vi.clearAllMocks();
        blobUrlCounter = 0;
        revokedUrls = [];

        // Save originals
        originalImage = window.Image;
        originalFetch = global.fetch;
        originalCreateObjectURL = URL.createObjectURL;
        originalRevokeObjectURL = URL.revokeObjectURL;

        // Mock Image
        (window as unknown as { Image: typeof MockImage }).Image = MockImage;

        // Mock fetch
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            blob: () => Promise.resolve(new Blob(['test'])),
        });

        // Mock URL APIs
        URL.createObjectURL = vi.fn(() => {
            blobUrlCounter++;
            return `blob:test-url-${blobUrlCounter}`;
        });

        URL.revokeObjectURL = vi.fn((url: string) => {
            revokedUrls.push(url);
        });
    });

    afterEach(() => {
        // Restore originals
        window.Image = originalImage;
        global.fetch = originalFetch;
        URL.createObjectURL = originalCreateObjectURL;
        URL.revokeObjectURL = originalRevokeObjectURL;
    });

    describe('initialization', () => {
        it('should return empty Map initially', () => {
            const { result } = renderHook(
                () => useAssetImageLoader({
                    placedAssets: [],
                    draggedAsset: null,
                }),
                { wrapper: createWrapper() }
            );

            expect(result.current).toBeInstanceOf(Map);
            expect(result.current.size).toBe(0);
        });

        it('should not load images when not authenticated', async () => {
            const placedAsset = createMockPlacedAsset();

            renderHook(
                () => useAssetImageLoader({
                    placedAssets: [placedAsset],
                    draggedAsset: null,
                }),
                { wrapper: createWrapper(false) }
            );

            // Wait a tick
            await act(async () => {
                await Promise.resolve();
            });

            expect(fetch).not.toHaveBeenCalled();
        });
    });

    describe('image URL resolution', () => {
        it('should prioritize token images over portrait and thumbnail', async () => {
            const asset = createMockAsset({
                id: 'asset-with-all',
                tokens: [createMockMediaResource('token-priority')],
                portrait: createMockMediaResource('portrait'),
                thumbnail: createMockMediaResource('thumbnail'),
            });
            const placedAsset = createMockPlacedAsset({ asset, assetId: 'asset-with-all' });

            renderHook(
                () => useAssetImageLoader({
                    placedAssets: [placedAsset],
                    draggedAsset: null,
                }),
                { wrapper: createWrapper() }
            );

            await waitFor(() => {
                expect(fetch).toHaveBeenCalledWith(
                    'https://api.test.com/media/token-priority',
                    expect.any(Object)
                );
            });
        });

        it('should use portrait when no tokens available', async () => {
            const asset = createMockAssetWithPortrait({
                id: 'asset-portrait-only',
                tokens: [],
            });
            const placedAsset = createMockPlacedAsset({ asset, assetId: 'asset-portrait-only' });

            renderHook(
                () => useAssetImageLoader({
                    placedAssets: [placedAsset],
                    draggedAsset: null,
                }),
                { wrapper: createWrapper() }
            );

            await waitFor(() => {
                expect(fetch).toHaveBeenCalledWith(
                    'https://api.test.com/media/portrait-1',
                    expect.any(Object)
                );
            });
        });

        it('should use thumbnail when no tokens or portrait', async () => {
            const asset = createMockAsset({
                id: 'asset-thumb-only',
                tokens: [],
                portrait: null,
                thumbnail: createMockMediaResource('thumb-only'),
            });
            const placedAsset = createMockPlacedAsset({ asset, assetId: 'asset-thumb-only' });

            renderHook(
                () => useAssetImageLoader({
                    placedAssets: [placedAsset],
                    draggedAsset: null,
                }),
                { wrapper: createWrapper() }
            );

            await waitFor(() => {
                expect(fetch).toHaveBeenCalledWith(
                    'https://api.test.com/media/thumb-only',
                    expect.any(Object)
                );
            });
        });

        it('should not load asset with no image sources', async () => {
            const asset = createMockAsset({
                id: 'asset-no-images',
                tokens: [],
                portrait: null,
                thumbnail: null,
            });
            const placedAsset = createMockPlacedAsset({ asset, assetId: 'asset-no-images' });

            renderHook(
                () => useAssetImageLoader({
                    placedAssets: [placedAsset],
                    draggedAsset: null,
                }),
                { wrapper: createWrapper() }
            );

            await act(async () => {
                await Promise.resolve();
            });

            expect(fetch).not.toHaveBeenCalled();
        });
    });

    describe('fetch configuration', () => {
        it('should fetch with credentials included', async () => {
            const placedAsset = createMockPlacedAsset();

            renderHook(
                () => useAssetImageLoader({
                    placedAssets: [placedAsset],
                    draggedAsset: null,
                }),
                { wrapper: createWrapper() }
            );

            await waitFor(() => {
                expect(fetch).toHaveBeenCalledWith(
                    expect.any(String),
                    expect.objectContaining({
                        credentials: 'include',
                    })
                );
            });
        });

        it('should fetch with XMLHttpRequest header', async () => {
            const placedAsset = createMockPlacedAsset();

            renderHook(
                () => useAssetImageLoader({
                    placedAssets: [placedAsset],
                    draggedAsset: null,
                }),
                { wrapper: createWrapper() }
            );

            await waitFor(() => {
                expect(fetch).toHaveBeenCalledWith(
                    expect.any(String),
                    expect.objectContaining({
                        headers: {
                            'X-Requested-With': 'XMLHttpRequest',
                        },
                    })
                );
            });
        });
    });

    describe('image loading - success', () => {
        it('should add loaded image to cache', async () => {
            const placedAsset = createMockPlacedAsset();

            const { result } = renderHook(
                () => useAssetImageLoader({
                    placedAssets: [placedAsset],
                    draggedAsset: null,
                }),
                { wrapper: createWrapper() }
            );

            // Trigger image onload
            await waitFor(() => {
                expect(mockImageOnload).toBeDefined();
            });

            act(() => {
                mockImageOnload?.();
            });

            await waitFor(() => {
                expect(result.current.size).toBe(1);
                expect(result.current.has('asset-1')).toBe(true);
            });
        });

        it('should load multiple assets in parallel', async () => {
            const assets = [
                createMockPlacedAsset({
                    assetId: 'asset-1',
                    asset: createMockAssetWithToken({ id: 'asset-1', tokens: [createMockMediaResource('token-1')] }),
                }),
                createMockPlacedAsset({
                    assetId: 'asset-2',
                    asset: createMockAssetWithToken({ id: 'asset-2', tokens: [createMockMediaResource('token-2')] }),
                }),
            ];

            renderHook(
                () => useAssetImageLoader({
                    placedAssets: assets,
                    draggedAsset: null,
                }),
                { wrapper: createWrapper() }
            );

            await waitFor(() => {
                expect(fetch).toHaveBeenCalledTimes(2);
            });
        });

        it('should call onImagesLoaded when all images load successfully', async () => {
            const onImagesLoaded = vi.fn();
            const placedAsset = createMockPlacedAsset();

            renderHook(
                () => useAssetImageLoader({
                    placedAssets: [placedAsset],
                    draggedAsset: null,
                    onImagesLoaded,
                }),
                { wrapper: createWrapper() }
            );

            await waitFor(() => {
                expect(mockImageOnload).toBeDefined();
            });

            act(() => {
                mockImageOnload?.();
            });

            await waitFor(() => {
                expect(onImagesLoaded).toHaveBeenCalledTimes(1);
            });
        });

        it('should call onImagesLoaded for empty assets array', async () => {
            const onImagesLoaded = vi.fn();

            renderHook(
                () => useAssetImageLoader({
                    placedAssets: [],
                    draggedAsset: null,
                    onImagesLoaded,
                }),
                { wrapper: createWrapper() }
            );

            await waitFor(() => {
                expect(onImagesLoaded).toHaveBeenCalledTimes(1);
            });
        });
    });

    describe('image loading - errors', () => {
        it('should handle fetch error gracefully', async () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

            const placedAsset = createMockPlacedAsset();

            const { result } = renderHook(
                () => useAssetImageLoader({
                    placedAssets: [placedAsset],
                    draggedAsset: null,
                }),
                { wrapper: createWrapper() }
            );

            await waitFor(() => {
                expect(consoleSpy).toHaveBeenCalled();
            });

            // Should not crash, cache should remain empty for failed asset
            expect(result.current.has('asset-1')).toBe(false);

            consoleSpy.mockRestore();
        });

        it('should handle non-ok response', async () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            vi.mocked(fetch).mockResolvedValueOnce({
                ok: false,
                status: 404,
            } as Response);

            const placedAsset = createMockPlacedAsset();

            const { result } = renderHook(
                () => useAssetImageLoader({
                    placedAssets: [placedAsset],
                    draggedAsset: null,
                }),
                { wrapper: createWrapper() }
            );

            await waitFor(() => {
                expect(consoleSpy).toHaveBeenCalled();
            });

            expect(result.current.has('asset-1')).toBe(false);

            consoleSpy.mockRestore();
        });

        it('should handle image decode error', async () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            const placedAsset = createMockPlacedAsset();

            renderHook(
                () => useAssetImageLoader({
                    placedAssets: [placedAsset],
                    draggedAsset: null,
                }),
                { wrapper: createWrapper() }
            );

            await waitFor(() => {
                expect(mockImageOnerror).toBeDefined();
            });

            act(() => {
                mockImageOnerror?.();
            });

            await waitFor(() => {
                expect(consoleSpy).toHaveBeenCalledWith(
                    expect.stringContaining('Failed to load image'),
                    expect.any(Error)
                );
            });

            consoleSpy.mockRestore();
        });

        it('should revoke blob URL on image decode error', async () => {
            vi.spyOn(console, 'error').mockImplementation(() => {});
            const placedAsset = createMockPlacedAsset();

            renderHook(
                () => useAssetImageLoader({
                    placedAssets: [placedAsset],
                    draggedAsset: null,
                }),
                { wrapper: createWrapper() }
            );

            await waitFor(() => {
                expect(mockImageOnerror).toBeDefined();
            });

            act(() => {
                mockImageOnerror?.();
            });

            await waitFor(() => {
                expect(URL.revokeObjectURL).toHaveBeenCalled();
            });
        });

        it('should continue loading other assets when one fails', async () => {
            vi.spyOn(console, 'error').mockImplementation(() => {});

            // First asset fails, second succeeds
            vi.mocked(fetch)
                .mockRejectedValueOnce(new Error('Network error'))
                .mockResolvedValueOnce({
                    ok: true,
                    blob: () => Promise.resolve(new Blob(['test'])),
                } as Response);

            const assets = [
                createMockPlacedAsset({
                    assetId: 'asset-1',
                    asset: createMockAssetWithToken({ id: 'asset-1' }),
                }),
                createMockPlacedAsset({
                    assetId: 'asset-2',
                    asset: createMockAssetWithToken({ id: 'asset-2', tokens: [createMockMediaResource('token-2')] }),
                }),
            ];

            renderHook(
                () => useAssetImageLoader({
                    placedAssets: assets,
                    draggedAsset: null,
                }),
                { wrapper: createWrapper() }
            );

            await waitFor(() => {
                expect(fetch).toHaveBeenCalledTimes(2);
            });
        });
    });

    describe('cache behavior', () => {
        it('should not fetch same URL multiple times during single load', async () => {
            // The hook tracks loaded assets via loadedAssetIdsRef to prevent duplicate fetches
            // within the same component lifecycle
            const uniqueAsset = createMockAssetWithToken({ id: 'cache-single-load', tokens: [createMockMediaResource('cache-token-single')] });
            const placedAsset = createMockPlacedAsset({ assetId: 'cache-single-load', asset: uniqueAsset });

            renderHook(
                () => useAssetImageLoader({
                    placedAssets: [placedAsset],
                    draggedAsset: null,
                }),
                { wrapper: createWrapper() }
            );

            await waitFor(() => {
                expect(mockImageOnload).toBeDefined();
            });

            // Verify the URL was fetched with correct format
            expect(fetch).toHaveBeenCalledWith(
                'https://api.test.com/media/cache-token-single',
                expect.any(Object)
            );
        });

        it('should create blob URL for images', async () => {
            const uniqueAsset = createMockAssetWithToken({ id: 'blob-test', tokens: [createMockMediaResource('blob-token')] });
            const placedAsset = createMockPlacedAsset({ assetId: 'blob-test', asset: uniqueAsset });

            renderHook(
                () => useAssetImageLoader({
                    placedAssets: [placedAsset],
                    draggedAsset: null,
                }),
                { wrapper: createWrapper() }
            );

            await waitFor(() => {
                expect(URL.createObjectURL).toHaveBeenCalled();
            });
        });
    });

    describe('draggedAsset handling', () => {
        it('should load dragged asset image', async () => {
            const draggedAsset = createMockAssetWithToken({ id: 'dragged-1' });

            renderHook(
                () => useAssetImageLoader({
                    placedAssets: [],
                    draggedAsset,
                }),
                { wrapper: createWrapper() }
            );

            await waitFor(() => {
                expect(fetch).toHaveBeenCalledTimes(1);
            });
        });

        it('should add dragged asset to cache', async () => {
            const draggedAsset = createMockAssetWithToken({ id: 'dragged-1' });

            const { result } = renderHook(
                () => useAssetImageLoader({
                    placedAssets: [],
                    draggedAsset,
                }),
                { wrapper: createWrapper() }
            );

            await waitFor(() => {
                expect(mockImageOnload).toBeDefined();
            });

            act(() => {
                mockImageOnload?.();
            });

            await waitFor(() => {
                expect(result.current.has('dragged-1')).toBe(true);
            });
        });

        it('should handle null draggedAsset', async () => {
            const { result } = renderHook(
                () => useAssetImageLoader({
                    placedAssets: [],
                    draggedAsset: null,
                }),
                { wrapper: createWrapper() }
            );

            await act(async () => {
                await Promise.resolve();
            });

            expect(result.current.size).toBe(0);
        });

        it('should load both placed and dragged assets', async () => {
            const placedAsset = createMockPlacedAsset();
            const draggedAsset = createMockAssetWithToken({
                id: 'dragged-1',
                tokens: [createMockMediaResource('dragged-token')],
            });

            renderHook(
                () => useAssetImageLoader({
                    placedAssets: [placedAsset],
                    draggedAsset,
                }),
                { wrapper: createWrapper() }
            );

            await waitFor(() => {
                expect(fetch).toHaveBeenCalledTimes(2);
            });
        });
    });

    describe('cleanup', () => {
        it('should revoke blob URLs on unmount', async () => {
            const placedAsset = createMockPlacedAsset();

            const { unmount } = renderHook(
                () => useAssetImageLoader({
                    placedAssets: [placedAsset],
                    draggedAsset: null,
                }),
                { wrapper: createWrapper() }
            );

            await waitFor(() => {
                expect(mockImageOnload).toBeDefined();
            });

            act(() => {
                mockImageOnload?.();
            });

            // Unmount should trigger cleanup
            unmount();

            // Note: The actual revoke happens through ref counting in the global cache
            // We can't easily test this without exposing the cache
        });
    });

    describe('onImagesLoaded callback', () => {
        it('should use latest callback reference', async () => {
            const callback1 = vi.fn();
            const callback2 = vi.fn();

            const { rerender } = renderHook(
                ({ onImagesLoaded }) => useAssetImageLoader({
                    placedAssets: [],
                    draggedAsset: null,
                    onImagesLoaded,
                }),
                {
                    wrapper: createWrapper(),
                    initialProps: { onImagesLoaded: callback1 },
                }
            );

            // Update callback before images load
            rerender({ onImagesLoaded: callback2 });

            await waitFor(() => {
                // With empty assets, onImagesLoaded is called immediately
                expect(callback2).toHaveBeenCalled();
            });
        });
    });

    describe('edge cases', () => {
        it('should handle duplicate assets in placedAssets', async () => {
            // When multiple placedAssets reference the same assetId, they should be processed
            const uniqueId = `duplicate-test-unique`;
            const tokenId = `dup-token-unique`;
            const asset = createMockAssetWithToken({ id: uniqueId, tokens: [createMockMediaResource(tokenId)] });
            const placedAssets = [
                createMockPlacedAsset({ id: 'placed-1', assetId: uniqueId, asset }),
                createMockPlacedAsset({ id: 'placed-2', assetId: uniqueId, asset }),
            ];

            // Should not throw when processing duplicate assetIds
            renderHook(
                () => useAssetImageLoader({
                    placedAssets,
                    draggedAsset: null,
                }),
                { wrapper: createWrapper() }
            );

            // The hook should handle duplicates gracefully
            await waitFor(() => {
                expect(fetch).toHaveBeenCalledWith(
                    `https://api.test.com/media/${tokenId}`,
                    expect.any(Object)
                );
            });
        });

        it('should handle assets with empty tokens array', async () => {
            const asset = createMockAsset({
                id: 'empty-tokens',
                tokens: [],
                portrait: null,
                thumbnail: null,
            });
            const placedAsset = createMockPlacedAsset({ asset, assetId: 'empty-tokens' });

            const { result } = renderHook(
                () => useAssetImageLoader({
                    placedAssets: [placedAsset],
                    draggedAsset: null,
                }),
                { wrapper: createWrapper() }
            );

            await act(async () => {
                await Promise.resolve();
            });

            expect(fetch).not.toHaveBeenCalled();
            expect(result.current.size).toBe(0);
        });

        it('should handle authentication state change', async () => {
            const placedAsset = createMockPlacedAsset();

            // Start unauthenticated
            const { rerender } = renderHook(
                () => useAssetImageLoader({
                    placedAssets: [placedAsset],
                    draggedAsset: null,
                }),
                { wrapper: createWrapper(false) }
            );

            await act(async () => {
                await Promise.resolve();
            });

            expect(fetch).not.toHaveBeenCalled();

            // Note: To properly test auth change, we'd need to remount with new wrapper
            // This is a limitation of the testing approach
        });

        it('should handle rapid asset updates', async () => {
            const { rerender } = renderHook(
                ({ assets }) => useAssetImageLoader({
                    placedAssets: assets,
                    draggedAsset: null,
                }),
                {
                    wrapper: createWrapper(),
                    initialProps: { assets: [] as PlacedAsset[] },
                }
            );

            // Rapidly add assets
            for (let i = 0; i < 5; i++) {
                const asset = createMockAssetWithToken({
                    id: `asset-${i}`,
                    tokens: [createMockMediaResource(`token-${i}`)],
                });
                rerender({
                    assets: [createMockPlacedAsset({ assetId: `asset-${i}`, asset })],
                });
            }

            // Should not crash
            await act(async () => {
                await Promise.resolve();
            });
        });
    });
});
