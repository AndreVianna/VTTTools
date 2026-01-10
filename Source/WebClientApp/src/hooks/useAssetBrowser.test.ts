import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AssetKind, type Asset } from '@/types/domain';
import { useAssetBrowser } from './useAssetBrowser';

// Mock getFirstLetter
vi.mock('@/hooks/useLetterFilter', () => ({
    getFirstLetter: vi.fn((name: string) => {
        if (!name) return '#';
        const first = name.charAt(0).toUpperCase();
        if (/[A-Z]/.test(first)) return first;
        return '#';
    }),
}));

describe('useAssetBrowser', () => {
    describe('initialization', () => {
        it('should return initial state', () => {
            const { result } = renderHook(() => useAssetBrowser());

            expect(result.current.selectedPath).toEqual([]);
            expect(result.current.searchQuery).toBe('');
            expect(result.current.attributeFilters).toEqual({});
            expect(result.current.tagFilters).toEqual([]);
            expect(result.current.letterFilter).toBeNull();
            expect(result.current.ownershipFilter).toBe('all');
            expect(result.current.statusFilter).toBe('all');
            expect(result.current.viewMode).toBe('grid-large');
            expect(result.current.sortField).toBe('name');
            expect(result.current.sortDirection).toBe('asc');
            expect(result.current.selectedAssetId).toBeNull();
            expect(result.current.selectedAssetIds).toEqual([]);
            expect(result.current.expandedTreeNodes).toEqual([]);
        });

        it('should have inspectorOpen false initially', () => {
            const { result } = renderHook(() => useAssetBrowser());
            expect(result.current.inspectorOpen).toBe(false);
        });

        it('should have isMultiSelectMode false initially', () => {
            const { result } = renderHook(() => useAssetBrowser());
            expect(result.current.isMultiSelectMode).toBe(false);
        });
    });

    describe('path and search', () => {
        it('should set selected path', () => {
            const { result } = renderHook(() => useAssetBrowser());

            act(() => {
                result.current.setSelectedPath(['Creature', 'Monster', 'Dragon']);
            });

            expect(result.current.selectedPath).toEqual(['Creature', 'Monster', 'Dragon']);
        });

        it('should set search query', () => {
            const { result } = renderHook(() => useAssetBrowser());

            act(() => {
                result.current.setSearchQuery('dragon');
            });

            expect(result.current.searchQuery).toBe('dragon');
        });
    });

    describe('attribute filters', () => {
        it('should add attribute filter', () => {
            const { result } = renderHook(() => useAssetBrowser());

            act(() => {
                result.current.setAttributeFilter('hitPoints', [10, 100]);
            });

            expect(result.current.attributeFilters).toEqual({
                hitPoints: [10, 100],
            });
        });

        it('should update attribute filter', () => {
            const { result } = renderHook(() => useAssetBrowser());

            act(() => {
                result.current.setAttributeFilter('hitPoints', [10, 100]);
            });

            act(() => {
                result.current.setAttributeFilter('hitPoints', [20, 200]);
            });

            expect(result.current.attributeFilters.hitPoints).toEqual([20, 200]);
        });

        it('should remove attribute filter with null value', () => {
            const { result } = renderHook(() => useAssetBrowser());

            act(() => {
                result.current.setAttributeFilter('hitPoints', [10, 100]);
                result.current.setAttributeFilter('speed', [30, 60]);
            });

            act(() => {
                result.current.setAttributeFilter('hitPoints', null);
            });

            expect(result.current.attributeFilters.hitPoints).toBeUndefined();
            expect(result.current.attributeFilters.speed).toEqual([30, 60]);
        });
    });

    describe('tag filters', () => {
        it('should set tag filters', () => {
            const { result } = renderHook(() => useAssetBrowser());

            act(() => {
                result.current.setTagFilters(['fire', 'flying']);
            });

            expect(result.current.tagFilters).toEqual(['fire', 'flying']);
        });
    });

    describe('letter filter', () => {
        it('should set letter filter', () => {
            const { result } = renderHook(() => useAssetBrowser());

            act(() => {
                result.current.setLetterFilter('D');
            });

            expect(result.current.letterFilter).toBe('D');
        });

        it('should clear letter filter with null', () => {
            const { result } = renderHook(() => useAssetBrowser());

            act(() => {
                result.current.setLetterFilter('D');
            });

            act(() => {
                result.current.setLetterFilter(null);
            });

            expect(result.current.letterFilter).toBeNull();
        });
    });

    describe('ownership and status filters', () => {
        it('should set ownership filter', () => {
            const { result } = renderHook(() => useAssetBrowser());

            act(() => {
                result.current.setOwnershipFilter('mine');
            });

            expect(result.current.ownershipFilter).toBe('mine');
        });

        it('should set status filter', () => {
            const { result } = renderHook(() => useAssetBrowser());

            act(() => {
                result.current.setStatusFilter('published');
            });

            expect(result.current.statusFilter).toBe('published');
        });
    });

    describe('view and sort', () => {
        it('should set view mode', () => {
            const { result } = renderHook(() => useAssetBrowser());

            act(() => {
                result.current.setViewMode('list');
            });

            expect(result.current.viewMode).toBe('list');
        });

        it('should set sort field and direction', () => {
            const { result } = renderHook(() => useAssetBrowser());

            act(() => {
                result.current.setSort('category', 'desc');
            });

            expect(result.current.sortField).toBe('category');
            expect(result.current.sortDirection).toBe('desc');
        });
    });

    describe('selection', () => {
        it('should set selected asset ID', () => {
            const { result } = renderHook(() => useAssetBrowser());

            act(() => {
                result.current.setSelectedAssetId('asset-123');
            });

            expect(result.current.selectedAssetId).toBe('asset-123');
            expect(result.current.inspectorOpen).toBe(true);
        });

        it('should set selected asset IDs', () => {
            const { result } = renderHook(() => useAssetBrowser());

            act(() => {
                result.current.setSelectedAssetIds(['asset-1', 'asset-2']);
            });

            expect(result.current.selectedAssetIds).toEqual(['asset-1', 'asset-2']);
            expect(result.current.isMultiSelectMode).toBe(true);
        });

        it('should toggle asset selection - add', () => {
            const { result } = renderHook(() => useAssetBrowser());

            act(() => {
                result.current.toggleAssetSelection('asset-1');
            });

            expect(result.current.selectedAssetIds).toContain('asset-1');
        });

        it('should toggle asset selection - remove', () => {
            const { result } = renderHook(() => useAssetBrowser());

            act(() => {
                result.current.setSelectedAssetIds(['asset-1', 'asset-2']);
            });

            act(() => {
                result.current.toggleAssetSelection('asset-1');
            });

            expect(result.current.selectedAssetIds).not.toContain('asset-1');
            expect(result.current.selectedAssetIds).toContain('asset-2');
        });

        it('should clear selection', () => {
            const { result } = renderHook(() => useAssetBrowser());

            act(() => {
                result.current.setSelectedAssetId('asset-123');
                result.current.setSelectedAssetIds(['asset-1', 'asset-2']);
            });

            act(() => {
                result.current.clearSelection();
            });

            expect(result.current.selectedAssetId).toBeNull();
            expect(result.current.selectedAssetIds).toEqual([]);
        });
    });

    describe('expanded tree nodes', () => {
        it('should set expanded tree nodes', () => {
            const { result } = renderHook(() => useAssetBrowser());

            act(() => {
                result.current.setExpandedTreeNodes(['node-1', 'node-2']);
            });

            expect(result.current.expandedTreeNodes).toEqual(['node-1', 'node-2']);
        });
    });

    describe('resetFilters', () => {
        it('should reset all filters to defaults', () => {
            const { result } = renderHook(() => useAssetBrowser());

            act(() => {
                result.current.setSelectedPath(['Creature', 'Monster']);
                result.current.setSearchQuery('dragon');
                result.current.setAttributeFilter('hitPoints', [10, 100]);
                result.current.setTagFilters(['fire']);
                result.current.setLetterFilter('D');
                result.current.setOwnershipFilter('mine');
                result.current.setStatusFilter('published');
            });

            act(() => {
                result.current.resetFilters();
            });

            expect(result.current.selectedPath).toEqual([]);
            expect(result.current.searchQuery).toBe('');
            expect(result.current.attributeFilters).toEqual({});
            expect(result.current.tagFilters).toEqual([]);
            expect(result.current.letterFilter).toBeNull();
            expect(result.current.ownershipFilter).toBe('all');
            expect(result.current.statusFilter).toBe('all');
        });

        it('should not reset viewMode, sort, or selection', () => {
            const { result } = renderHook(() => useAssetBrowser());

            act(() => {
                result.current.setViewMode('list');
                result.current.setSort('category', 'desc');
                result.current.setSelectedAssetId('asset-123');
            });

            act(() => {
                result.current.resetFilters();
            });

            expect(result.current.viewMode).toBe('list');
            expect(result.current.sortField).toBe('category');
            expect(result.current.sortDirection).toBe('desc');
            expect(result.current.selectedAssetId).toBe('asset-123');
        });
    });

    describe('queryParams', () => {
        it('should return empty params when no filters', () => {
            const { result } = renderHook(() => useAssetBrowser());

            expect(result.current.queryParams).toEqual({});
        });

        it('should include kind from selectedPath', () => {
            const { result } = renderHook(() => useAssetBrowser());

            act(() => {
                result.current.setSelectedPath(['Creature']);
            });

            expect(result.current.queryParams.kind).toBe('Creature');
        });

        it('should include category from selectedPath', () => {
            const { result } = renderHook(() => useAssetBrowser());

            act(() => {
                result.current.setSelectedPath(['Creature', 'Monster']);
            });

            expect(result.current.queryParams.kind).toBe('Creature');
            expect(result.current.queryParams.category).toBe('Monster');
        });

        it('should include type and subtype from deep path', () => {
            const { result } = renderHook(() => useAssetBrowser());

            act(() => {
                result.current.setSelectedPath(['Creature', 'Monster', 'Dragon', 'Ancient']);
            });

            expect(result.current.queryParams.kind).toBe('Creature');
            expect(result.current.queryParams.category).toBe('Monster');
            expect(result.current.queryParams.type).toBe('Dragon');
            expect(result.current.queryParams.subtype).toBe('Ancient');
        });

        it('should include search with wildcards', () => {
            const { result } = renderHook(() => useAssetBrowser());

            act(() => {
                result.current.setSearchQuery('dragon');
            });

            expect(result.current.queryParams.search).toBe('%dragon%');
        });

        it('should include availability for mine ownership', () => {
            const { result } = renderHook(() => useAssetBrowser());

            act(() => {
                result.current.setOwnershipFilter('mine');
            });

            expect(result.current.queryParams.availability).toBe('MineOnly');
        });

        it('should include availability for others ownership', () => {
            const { result } = renderHook(() => useAssetBrowser());

            act(() => {
                result.current.setOwnershipFilter('others');
            });

            expect(result.current.queryParams.availability).toBe('PublishedOnly');
        });
    });

    describe('filterAssets', () => {
        const createMockAsset = (
            id: string,
            name: string,
            options: {
                isPublished?: boolean;
                tags?: string[];
                statBlocks?: Record<string, { value: string }>[];
                classification?: { kind: AssetKind; category?: string; type?: string };
            } = {}
        ): Asset => ({
            id,
            name,
            description: '',
            isPublished: options.isPublished ?? true,
            tags: options.tags ?? [],
            statBlocks: options.statBlocks ?? [],
            classification: options.classification ?? { kind: AssetKind.Creature },
            tokenId: null,
            tokenSize: 1,
            source: null,
            createdAt: new Date().toISOString(),
            modifiedAt: new Date().toISOString(),
        });

        it('should filter by published status', () => {
            const { result } = renderHook(() => useAssetBrowser());

            act(() => {
                result.current.setStatusFilter('published');
            });

            const assets: Asset[] = [
                createMockAsset('1', 'Published Asset', { isPublished: true }),
                createMockAsset('2', 'Draft Asset', { isPublished: false }),
            ];

            const filtered = result.current.filterAssets(assets);

            expect(filtered).toHaveLength(1);
            expect(filtered[0]?.name).toBe('Published Asset');
        });

        it('should filter by draft status', () => {
            const { result } = renderHook(() => useAssetBrowser());

            act(() => {
                result.current.setStatusFilter('draft');
            });

            const assets: Asset[] = [
                createMockAsset('1', 'Published Asset', { isPublished: true }),
                createMockAsset('2', 'Draft Asset', { isPublished: false }),
            ];

            const filtered = result.current.filterAssets(assets);

            expect(filtered).toHaveLength(1);
            expect(filtered[0]?.name).toBe('Draft Asset');
        });

        it('should filter by attribute range', () => {
            const { result } = renderHook(() => useAssetBrowser());

            act(() => {
                result.current.setAttributeFilter('hitPoints', [50, 100]);
            });

            const assets: Asset[] = [
                createMockAsset('1', 'Low HP', { statBlocks: [{ hitPoints: { value: '25' } }] }),
                createMockAsset('2', 'Medium HP', { statBlocks: [{ hitPoints: { value: '75' } }] }),
                createMockAsset('3', 'High HP', { statBlocks: [{ hitPoints: { value: '150' } }] }),
            ];

            const filtered = result.current.filterAssets(assets);

            expect(filtered).toHaveLength(1);
            expect(filtered[0]?.name).toBe('Medium HP');
        });

        it('should filter by tags (all must match)', () => {
            const { result } = renderHook(() => useAssetBrowser());

            act(() => {
                result.current.setTagFilters(['fire', 'flying']);
            });

            const assets: Asset[] = [
                createMockAsset('1', 'Fire Only', { tags: ['fire'] }),
                createMockAsset('2', 'Fire and Flying', { tags: ['fire', 'flying', 'dragon'] }),
                createMockAsset('3', 'Flying Only', { tags: ['flying'] }),
            ];

            const filtered = result.current.filterAssets(assets);

            expect(filtered).toHaveLength(1);
            expect(filtered[0]?.name).toBe('Fire and Flying');
        });

        it('should filter by letter', () => {
            const { result } = renderHook(() => useAssetBrowser());

            act(() => {
                result.current.setLetterFilter('D');
            });

            const assets: Asset[] = [
                createMockAsset('1', 'Dragon', {}),
                createMockAsset('2', 'Orc', {}),
                createMockAsset('3', 'Demon', {}),
            ];

            const filtered = result.current.filterAssets(assets);

            expect(filtered).toHaveLength(2);
            expect(filtered.map(a => a.name)).toEqual(['Demon', 'Dragon']); // sorted
        });

        it('should sort by name ascending', () => {
            const { result } = renderHook(() => useAssetBrowser());

            const assets: Asset[] = [
                createMockAsset('1', 'Zebra', {}),
                createMockAsset('2', 'Apple', {}),
                createMockAsset('3', 'Mango', {}),
            ];

            const filtered = result.current.filterAssets(assets);

            expect(filtered[0]?.name).toBe('Apple');
            expect(filtered[1]?.name).toBe('Mango');
            expect(filtered[2]?.name).toBe('Zebra');
        });

        it('should sort by name descending', () => {
            const { result } = renderHook(() => useAssetBrowser());

            act(() => {
                result.current.setSort('name', 'desc');
            });

            const assets: Asset[] = [
                createMockAsset('1', 'Zebra', {}),
                createMockAsset('2', 'Apple', {}),
                createMockAsset('3', 'Mango', {}),
            ];

            const filtered = result.current.filterAssets(assets);

            expect(filtered[0]?.name).toBe('Zebra');
            expect(filtered[1]?.name).toBe('Mango');
            expect(filtered[2]?.name).toBe('Apple');
        });

        it('should sort by category', () => {
            const { result } = renderHook(() => useAssetBrowser());

            act(() => {
                result.current.setSort('category', 'asc');
            });

            const assets: Asset[] = [
                createMockAsset('1', 'Asset1', { classification: { kind: AssetKind.Creature, category: 'Monster' } }),
                createMockAsset('2', 'Asset2', { classification: { kind: AssetKind.Creature, category: 'Beast' } }),
                createMockAsset('3', 'Asset3', { classification: { kind: AssetKind.Creature, category: 'Humanoid' } }),
            ];

            const filtered = result.current.filterAssets(assets);

            expect(filtered[0]?.classification.category).toBe('Beast');
            expect(filtered[1]?.classification.category).toBe('Humanoid');
            expect(filtered[2]?.classification.category).toBe('Monster');
        });

        it('should sort by type', () => {
            const { result } = renderHook(() => useAssetBrowser());

            act(() => {
                result.current.setSort('type', 'asc');
            });

            const assets: Asset[] = [
                createMockAsset('1', 'Asset1', { classification: { kind: AssetKind.Creature, type: 'Dragon' } }),
                createMockAsset('2', 'Asset2', { classification: { kind: AssetKind.Creature, type: 'Aberration' } }),
            ];

            const filtered = result.current.filterAssets(assets);

            expect(filtered[0]?.classification.type).toBe('Aberration');
            expect(filtered[1]?.classification.type).toBe('Dragon');
        });

        it('should not mutate original array', () => {
            const { result } = renderHook(() => useAssetBrowser());

            const assets: Asset[] = [
                createMockAsset('1', 'Zebra', {}),
                createMockAsset('2', 'Apple', {}),
            ];

            const originalFirst = assets[0];
            result.current.filterAssets(assets);

            expect(assets[0]).toBe(originalFirst);
        });
    });
});
