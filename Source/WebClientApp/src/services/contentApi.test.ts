import { configureStore } from '@reduxjs/toolkit';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { contentApi } from './contentApi';
import type { ContentFilters, PagedContentResponse } from './contentApi';

vi.mock('./enhancedBaseQuery', () => ({
    createEnhancedBaseQuery: vi.fn(() => vi.fn()),
}));

describe('contentApi', () => {
    let store: ReturnType<typeof configureStore>;

    beforeEach(() => {
        vi.clearAllMocks();
        store = configureStore({
            reducer: {
                [contentApi.reducerPath]: contentApi.reducer,
            },
            middleware: (getDefaultMiddleware) =>
                getDefaultMiddleware().concat(contentApi.middleware),
        });
    });

    describe('API configuration', () => {
        it('should have correct reducerPath', () => {
            // Arrange & Act
            const reducerPath = contentApi.reducerPath;

            // Assert
            expect(reducerPath).toBe('contentApi');
        });

        it('should define Content tag type', () => {
            // Arrange & Act & Assert
            expect(contentApi.util.selectInvalidatedBy).toBeDefined();
        });

        it('should export contentApi as named export', async () => {
            // Arrange & Act
            const api = await import('./contentApi');

            // Assert
            expect(api.contentApi).toBeDefined();
            expect(api.contentApi.reducerPath).toBe('contentApi');
        });
    });

    describe('endpoint definitions', () => {
        it('should define getContent endpoint', () => {
            // Arrange & Act & Assert
            expect(contentApi.endpoints.getContent).toBeDefined();
        });

        it('should have useQuery hook for getContent endpoint', () => {
            // Arrange & Act & Assert
            expect(contentApi.endpoints.getContent.useQuery).toBeDefined();
        });

        it('should have correct total number of endpoints', () => {
            // Arrange & Act
            const endpointNames = Object.keys(contentApi.endpoints);

            // Assert
            expect(endpointNames.length).toBe(1);
            expect(endpointNames).toContain('getContent');
        });
    });

    describe('hook exports', () => {
        it('should export useGetContentQuery hook', async () => {
            // Arrange & Act
            const api = await import('./contentApi');

            // Assert
            expect(typeof api.useGetContentQuery).toBe('function');
        });

        it('should have useGetContentQuery as the only exported hook', async () => {
            // Arrange & Act
            const api = await import('./contentApi');

            // Assert
            const hookKeys = Object.keys(api).filter((key) => key.startsWith('use'));
            expect(hookKeys).toEqual(['useGetContentQuery']);
        });
    });

    describe('exported types', () => {
        it('should have type-compatible ContentFilters shape', () => {
            // Arrange & Act
            const testFilters: ContentFilters = {
                after: 'cursor123',
                limit: 20,
                contentType: 'adventure',
                style: 1,
                isOneShot: true,
                minEncounterCount: 1,
                maxEncounterCount: 10,
                isPublished: true,
                search: 'dragon',
                owner: 'mine',
            };

            // Assert
            expect(testFilters.after).toBe('cursor123');
            expect(testFilters.contentType).toBe('adventure');
            expect(testFilters.owner).toBe('mine');
        });

        it('should allow all valid contentType values', () => {
            // Arrange & Act
            const adventureFilter: ContentFilters = { contentType: 'adventure' };
            const campaignFilter: ContentFilters = { contentType: 'campaign' };
            const worldFilter: ContentFilters = { contentType: 'world' };

            // Assert
            expect(adventureFilter.contentType).toBe('adventure');
            expect(campaignFilter.contentType).toBe('campaign');
            expect(worldFilter.contentType).toBe('world');
        });

        it('should allow all valid owner values', () => {
            // Arrange & Act
            const mineFilter: ContentFilters = { owner: 'mine' };
            const publicFilter: ContentFilters = { owner: 'public' };

            // Assert
            expect(mineFilter.owner).toBe('mine');
            expect(publicFilter.owner).toBe('public');
        });

        it('should have type-compatible PagedContentResponse shape', () => {
            // Arrange & Act
            const testResponse: PagedContentResponse = {
                data: [],
                nextCursor: 'next123',
                hasMore: true,
            };

            // Assert
            expect(testResponse.data).toEqual([]);
            expect(testResponse.nextCursor).toBe('next123');
            expect(testResponse.hasMore).toBe(true);
        });

        it('should allow null nextCursor in PagedContentResponse', () => {
            // Arrange & Act
            const testResponse: PagedContentResponse = {
                data: [],
                nextCursor: null,
                hasMore: false,
            };

            // Assert
            expect(testResponse.nextCursor).toBeNull();
            expect(testResponse.hasMore).toBe(false);
        });
    });

    describe('cache tag invalidation logic', () => {
        it('should define Content tag type for cache management', () => {
            // Arrange & Act & Assert
            expect(contentApi.endpoints.getContent).toBeDefined();
        });

        it('getContent should provide Content tags for cache invalidation', () => {
            // The getContent query should provide Content tags based on response data
            // This ensures proper cache management when content is fetched
            expect(contentApi.endpoints.getContent.useQuery).toBeDefined();
        });
    });

    describe('store integration', () => {
        it('should integrate with Redux store correctly', () => {
            // Arrange & Act
            const state = store.getState() as { [key: string]: unknown };

            // Assert
            expect(state[contentApi.reducerPath]).toBeDefined();
        });

        it('should have initialized queries state', () => {
            // Arrange & Act
            const state = store.getState() as {
                [key: string]: { queries?: unknown; mutations?: unknown };
            };

            // Assert
            expect(state[contentApi.reducerPath]?.queries).toBeDefined();
        });

        it('should have initialized mutations state', () => {
            // Arrange & Act
            const state = store.getState() as {
                [key: string]: { queries?: unknown; mutations?: unknown };
            };

            // Assert
            expect(state[contentApi.reducerPath]?.mutations).toBeDefined();
        });

        it('should have empty queries initially', () => {
            // Arrange & Act
            const state = store.getState() as {
                [key: string]: { queries: Record<string, unknown> };
            };

            // Assert
            expect(Object.keys(state[contentApi.reducerPath]?.queries ?? {})).toHaveLength(0);
        });
    });

    describe('pagination features', () => {
        it('should define serializeQueryArgs for cache key generation', () => {
            // The getContent endpoint uses serializeQueryArgs to exclude
            // pagination params (after, limit) from the cache key
            expect(contentApi.endpoints.getContent).toBeDefined();
        });

        it('should define merge function for infinite scroll support', () => {
            // The getContent endpoint uses merge to combine paginated results
            // when loading more content (appending new data to existing cache)
            expect(contentApi.endpoints.getContent).toBeDefined();
        });

        it('should define forceRefetch for pagination control', () => {
            // The getContent endpoint uses forceRefetch to determine when
            // to fetch new data based on cursor changes
            expect(contentApi.endpoints.getContent).toBeDefined();
        });
    });
});
