import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ResourceRole, type MediaResource } from '@/types/domain';
import { useMediaBrowser } from './useMediaBrowser';

describe('useMediaBrowser', () => {
    describe('initialization', () => {
        it('should return initial state', () => {
            const { result } = renderHook(() => useMediaBrowser());

            expect(result.current.selectedCategory).toBe(ResourceRole.Undefined);
            expect(result.current.searchQuery).toBe('');
            expect(result.current.ownershipFilter).toBe('all');
            expect(result.current.statusFilter).toBe('all');
            expect(result.current.viewMode).toBe('grid-large');
            expect(result.current.sortField).toBe('name');
            expect(result.current.sortDirection).toBe('asc');
            expect(result.current.selectedMediaId).toBeNull();
            expect(result.current.selectedMediaIds).toEqual([]);
            expect(result.current.skip).toBe(0);
            expect(result.current.take).toBe(50);
            expect(result.current.hasMore).toBe(false);
            expect(result.current.totalCount).toBe(0);
        });

        it('should have inspectorOpen false initially', () => {
            const { result } = renderHook(() => useMediaBrowser());

            expect(result.current.inspectorOpen).toBe(false);
        });

        it('should have isMultiSelectMode false initially', () => {
            const { result } = renderHook(() => useMediaBrowser());

            expect(result.current.isMultiSelectMode).toBe(false);
        });
    });

    describe('filter setters', () => {
        it('should update selectedCategory and reset skip', () => {
            const { result } = renderHook(() => useMediaBrowser());

            act(() => {
                result.current.setPagination(20, 50, true, 100);
            });

            expect(result.current.skip).toBe(20);

            act(() => {
                result.current.setSelectedCategory(ResourceRole.Background);
            });

            expect(result.current.selectedCategory).toBe(ResourceRole.Background);
            expect(result.current.skip).toBe(0);
        });

        it('should update searchQuery and reset skip', () => {
            const { result } = renderHook(() => useMediaBrowser());

            act(() => {
                result.current.setPagination(20, 50, true, 100);
            });

            act(() => {
                result.current.setSearchQuery('dragon');
            });

            expect(result.current.searchQuery).toBe('dragon');
            expect(result.current.skip).toBe(0);
        });

        it('should update ownershipFilter and reset skip', () => {
            const { result } = renderHook(() => useMediaBrowser());

            act(() => {
                result.current.setPagination(20, 50, true, 100);
            });

            act(() => {
                result.current.setOwnershipFilter('mine');
            });

            expect(result.current.ownershipFilter).toBe('mine');
            expect(result.current.skip).toBe(0);
        });

        it('should update statusFilter and reset skip', () => {
            const { result } = renderHook(() => useMediaBrowser());

            act(() => {
                result.current.setPagination(20, 50, true, 100);
            });

            act(() => {
                result.current.setStatusFilter('published');
            });

            expect(result.current.statusFilter).toBe('published');
            expect(result.current.skip).toBe(0);
        });
    });

    describe('view and sort', () => {
        it('should update viewMode without resetting skip', () => {
            const { result } = renderHook(() => useMediaBrowser());

            act(() => {
                result.current.setPagination(20, 50, true, 100);
            });

            act(() => {
                result.current.setViewMode('list');
            });

            expect(result.current.viewMode).toBe('list');
            expect(result.current.skip).toBe(20);
        });

        it('should update sort field and direction', () => {
            const { result } = renderHook(() => useMediaBrowser());

            act(() => {
                result.current.setSort('category', 'desc');
            });

            expect(result.current.sortField).toBe('category');
            expect(result.current.sortDirection).toBe('desc');
        });
    });

    describe('selection', () => {
        it('should set selected media ID', () => {
            const { result } = renderHook(() => useMediaBrowser());

            act(() => {
                result.current.setSelectedMediaId('media-123');
            });

            expect(result.current.selectedMediaId).toBe('media-123');
            expect(result.current.inspectorOpen).toBe(true);
        });

        it('should set selected media IDs', () => {
            const { result } = renderHook(() => useMediaBrowser());

            act(() => {
                result.current.setSelectedMediaIds(['media-1', 'media-2', 'media-3']);
            });

            expect(result.current.selectedMediaIds).toEqual(['media-1', 'media-2', 'media-3']);
            expect(result.current.isMultiSelectMode).toBe(true);
        });

        it('should toggle media selection - add', () => {
            const { result } = renderHook(() => useMediaBrowser());

            act(() => {
                result.current.toggleMediaSelection('media-1');
            });

            expect(result.current.selectedMediaIds).toContain('media-1');
            expect(result.current.isMultiSelectMode).toBe(true);
        });

        it('should toggle media selection - remove', () => {
            const { result } = renderHook(() => useMediaBrowser());

            act(() => {
                result.current.setSelectedMediaIds(['media-1', 'media-2']);
            });

            act(() => {
                result.current.toggleMediaSelection('media-1');
            });

            expect(result.current.selectedMediaIds).not.toContain('media-1');
            expect(result.current.selectedMediaIds).toContain('media-2');
        });

        it('should clear selection', () => {
            const { result } = renderHook(() => useMediaBrowser());

            act(() => {
                result.current.setSelectedMediaId('media-123');
                result.current.setSelectedMediaIds(['media-1', 'media-2']);
            });

            act(() => {
                result.current.clearSelection();
            });

            expect(result.current.selectedMediaId).toBeNull();
            expect(result.current.selectedMediaIds).toEqual([]);
            expect(result.current.inspectorOpen).toBe(false);
            expect(result.current.isMultiSelectMode).toBe(false);
        });
    });

    describe('pagination', () => {
        it('should set pagination values', () => {
            const { result } = renderHook(() => useMediaBrowser());

            act(() => {
                result.current.setPagination(50, 25, true, 200);
            });

            expect(result.current.skip).toBe(50);
            expect(result.current.take).toBe(25);
            expect(result.current.hasMore).toBe(true);
            expect(result.current.totalCount).toBe(200);
        });

        it('should load more when hasMore is true', () => {
            const { result } = renderHook(() => useMediaBrowser());

            act(() => {
                result.current.setPagination(0, 50, true, 200);
            });

            act(() => {
                result.current.loadMore();
            });

            expect(result.current.skip).toBe(50);
        });

        it('should not load more when hasMore is false', () => {
            const { result } = renderHook(() => useMediaBrowser());

            act(() => {
                result.current.setPagination(50, 50, false, 100);
            });

            act(() => {
                result.current.loadMore();
            });

            expect(result.current.skip).toBe(50);
        });
    });

    describe('resetFilters', () => {
        it('should reset all filters to defaults', () => {
            const { result } = renderHook(() => useMediaBrowser());

            act(() => {
                result.current.setSelectedCategory(ResourceRole.Background);
                result.current.setSearchQuery('test');
                result.current.setOwnershipFilter('mine');
                result.current.setStatusFilter('published');
                result.current.setPagination(50, 50, true, 100);
            });

            act(() => {
                result.current.resetFilters();
            });

            expect(result.current.selectedCategory).toBe(ResourceRole.Undefined);
            expect(result.current.searchQuery).toBe('');
            expect(result.current.ownershipFilter).toBe('all');
            expect(result.current.statusFilter).toBe('all');
            expect(result.current.skip).toBe(0);
        });

        it('should not reset viewMode or sort', () => {
            const { result } = renderHook(() => useMediaBrowser());

            act(() => {
                result.current.setViewMode('list');
                result.current.setSort('type', 'desc');
            });

            act(() => {
                result.current.resetFilters();
            });

            expect(result.current.viewMode).toBe('list');
            expect(result.current.sortField).toBe('type');
            expect(result.current.sortDirection).toBe('desc');
        });
    });

    describe('queryParams', () => {
        it('should include skip and take', () => {
            const { result } = renderHook(() => useMediaBrowser());

            expect(result.current.queryParams).toEqual({
                skip: 0,
                take: 50,
            });
        });

        it('should include role when category is selected', () => {
            const { result } = renderHook(() => useMediaBrowser());

            act(() => {
                result.current.setSelectedCategory(ResourceRole.Token);
            });

            expect(result.current.queryParams.role).toBe(ResourceRole.Token);
        });

        it('should not include role when category is Undefined', () => {
            const { result } = renderHook(() => useMediaBrowser());

            expect(result.current.queryParams.role).toBeUndefined();
        });

        it('should include searchText when query is provided', () => {
            const { result } = renderHook(() => useMediaBrowser());

            act(() => {
                result.current.setSearchQuery('dragon');
            });

            expect(result.current.queryParams.searchText).toBe('dragon');
        });

        it('should not include searchText when query is empty', () => {
            const { result } = renderHook(() => useMediaBrowser());

            expect(result.current.queryParams.searchText).toBeUndefined();
        });
    });

    describe('filterMedia', () => {
        const createMockMedia = (id: string, fileName: string, role: ResourceRole): MediaResource => ({
            id,
            fileName,
            role,
            path: `/media/${id}`,
            contentType: 'image/png',
            fileSize: 1000,
            dimensions: { width: 100, height: 100 },
            duration: '',
        });

        it('should sort media by name ascending', () => {
            const { result } = renderHook(() => useMediaBrowser());

            const media: MediaResource[] = [
                createMockMedia('1', 'Zebra.png', ResourceRole.Token),
                createMockMedia('2', 'Apple.png', ResourceRole.Token),
                createMockMedia('3', 'Mango.png', ResourceRole.Token),
            ];

            const sorted = result.current.filterMedia(media);

            expect(sorted[0]?.fileName).toBe('Apple.png');
            expect(sorted[1]?.fileName).toBe('Mango.png');
            expect(sorted[2]?.fileName).toBe('Zebra.png');
        });

        it('should sort media by name descending', () => {
            const { result } = renderHook(() => useMediaBrowser());

            act(() => {
                result.current.setSort('name', 'desc');
            });

            const media: MediaResource[] = [
                createMockMedia('1', 'Zebra.png', ResourceRole.Token),
                createMockMedia('2', 'Apple.png', ResourceRole.Token),
                createMockMedia('3', 'Mango.png', ResourceRole.Token),
            ];

            const sorted = result.current.filterMedia(media);

            expect(sorted[0]?.fileName).toBe('Zebra.png');
            expect(sorted[1]?.fileName).toBe('Mango.png');
            expect(sorted[2]?.fileName).toBe('Apple.png');
        });

        it('should sort media by category', () => {
            const { result } = renderHook(() => useMediaBrowser());

            act(() => {
                result.current.setSort('category', 'asc');
            });

            const media: MediaResource[] = [
                createMockMedia('1', 'Token.png', ResourceRole.Token),
                createMockMedia('2', 'Bg.png', ResourceRole.Background),
                createMockMedia('3', 'Overlay.png', ResourceRole.Overlay),
            ];

            const sorted = result.current.filterMedia(media);

            // Sorted alphabetically by role string: Background, Overlay, Token
            expect(sorted[0]?.role).toBe(ResourceRole.Background);
            expect(sorted[1]?.role).toBe(ResourceRole.Overlay);
            expect(sorted[2]?.role).toBe(ResourceRole.Token);
        });

        it('should not mutate original array', () => {
            const { result } = renderHook(() => useMediaBrowser());

            const media: MediaResource[] = [
                createMockMedia('1', 'Zebra.png', ResourceRole.Token),
                createMockMedia('2', 'Apple.png', ResourceRole.Token),
            ];

            const originalFirst = media[0];
            result.current.filterMedia(media);

            expect(media[0]).toBe(originalFirst);
        });
    });
});
