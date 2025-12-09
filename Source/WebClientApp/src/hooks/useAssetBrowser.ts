import { useState, useCallback, useMemo } from 'react';
import type { Asset, AssetKind } from '@/types/domain';
import type { ViewMode, SortField, SortDirection } from '@/components/assets/browser/BrowserToolbar';

export interface AssetBrowserState {
  selectedPath: string[];
  searchQuery: string;
  attributeFilters: Record<string, [number, number]>;
  tagFilters: string[];
  ownershipFilter: 'mine' | 'others' | 'all';
  statusFilter: 'all' | 'published' | 'draft';
  viewMode: ViewMode;
  sortField: SortField;
  sortDirection: SortDirection;
  selectedAssetId: string | null;
  selectedAssetIds: string[];
  expandedTreeNodes: string[];
}

const initialState: AssetBrowserState = {
  selectedPath: [],
  searchQuery: '',
  attributeFilters: {},
  tagFilters: [],
  ownershipFilter: 'all',
  statusFilter: 'all',
  viewMode: 'grid-large',
  sortField: 'name',
  sortDirection: 'asc',
  selectedAssetId: null,
  selectedAssetIds: [],
  expandedTreeNodes: [],
};

export function useAssetBrowser() {
  const [state, setState] = useState<AssetBrowserState>(initialState);

  const setSelectedPath = useCallback((path: string[]) => {
    setState((prev) => ({ ...prev, selectedPath: path }));
  }, []);

  const setSearchQuery = useCallback((query: string) => {
    setState((prev) => ({ ...prev, searchQuery: query }));
  }, []);

  const setAttributeFilter = useCallback((key: string, value: [number, number] | null) => {
    setState((prev) => {
      const filters = { ...prev.attributeFilters };
      if (value === null) {
        delete filters[key];
      } else {
        filters[key] = value;
      }
      return { ...prev, attributeFilters: filters };
    });
  }, []);

  const setTagFilters = useCallback((tags: string[]) => {
    setState((prev) => ({ ...prev, tagFilters: tags }));
  }, []);

  const setOwnershipFilter = useCallback((filter: 'mine' | 'others' | 'all') => {
    setState((prev) => ({ ...prev, ownershipFilter: filter }));
  }, []);

  const setStatusFilter = useCallback((filter: 'all' | 'published' | 'draft') => {
    setState((prev) => ({ ...prev, statusFilter: filter }));
  }, []);

  const setViewMode = useCallback((mode: ViewMode) => {
    setState((prev) => ({ ...prev, viewMode: mode }));
  }, []);

  const setSort = useCallback((field: SortField, direction: SortDirection) => {
    setState((prev) => ({ ...prev, sortField: field, sortDirection: direction }));
  }, []);

  const setSelectedAssetId = useCallback((id: string | null) => {
    setState((prev) => ({ ...prev, selectedAssetId: id }));
  }, []);

  const setSelectedAssetIds = useCallback((ids: string[]) => {
    setState((prev) => ({ ...prev, selectedAssetIds: ids }));
  }, []);

  const toggleAssetSelection = useCallback((id: string) => {
    setState((prev) => {
      const ids = prev.selectedAssetIds.includes(id)
        ? prev.selectedAssetIds.filter((i) => i !== id)
        : [...prev.selectedAssetIds, id];
      return { ...prev, selectedAssetIds: ids };
    });
  }, []);

  const clearSelection = useCallback(() => {
    setState((prev) => ({ ...prev, selectedAssetId: null, selectedAssetIds: [] }));
  }, []);

  const setExpandedTreeNodes = useCallback((nodes: string[]) => {
    setState((prev) => ({ ...prev, expandedTreeNodes: nodes }));
  }, []);

  const resetFilters = useCallback(() => {
    setState((prev) => ({
      ...prev,
      selectedPath: [],
      searchQuery: '',
      attributeFilters: {},
      tagFilters: [],
      ownershipFilter: 'all',
      statusFilter: 'all',
    }));
  }, []);

  const queryParams = useMemo(() => {
    const params: Record<string, unknown> = {};

    if (state.selectedPath.length > 0) {
      const [kind, category, type, subtype] = state.selectedPath;
      if (kind) params.kind = kind as AssetKind;
      if (category) params.category = category;
      if (type) params.type = type;
      if (subtype) params.subtype = subtype;
    }

    if (state.searchQuery) {
      params.search = `%${state.searchQuery}%`;
    }

    if (state.ownershipFilter === 'mine') {
      params.availability = 'MineOnly';
    } else if (state.ownershipFilter === 'others') {
      params.availability = 'PublishedOnly';
    }

    return params;
  }, [state.selectedPath, state.searchQuery, state.ownershipFilter]);

  const filterAssets = useCallback(
    (assets: Asset[]): Asset[] => {
      let filtered = [...assets];

      if (state.statusFilter === 'published') {
        filtered = filtered.filter((a) => a.isPublished);
      } else if (state.statusFilter === 'draft') {
        filtered = filtered.filter((a) => !a.isPublished);
      }

      for (const [key, [min, max]] of Object.entries(state.attributeFilters)) {
        filtered = filtered.filter((a) => {
          const stat = a.statBlocks[0]?.[key];
          if (!stat?.value) return false;
          const val = parseFloat(stat.value);
          return !isNaN(val) && val >= min && val <= max;
        });
      }

      if (state.tagFilters.length > 0) {
        filtered = filtered.filter((_a) => {
          return true;
        });
      }

      filtered.sort((a, b) => {
        let comparison = 0;
        switch (state.sortField) {
          case 'name':
            comparison = a.name.localeCompare(b.name);
            break;
          case 'category':
            comparison = (a.classification.category || '').localeCompare(
              b.classification.category || ''
            );
            break;
          case 'type':
            comparison = (a.classification.type || '').localeCompare(b.classification.type || '');
            break;
          default:
            comparison = 0;
            break;
        }
        return state.sortDirection === 'asc' ? comparison : -comparison;
      });

      return filtered;
    },
    [state.statusFilter, state.attributeFilters, state.tagFilters, state.sortField, state.sortDirection]
  );

  const inspectorOpen = state.selectedAssetId !== null;
  const isMultiSelectMode = state.selectedAssetIds.length > 0;

  return {
    ...state,
    inspectorOpen,
    isMultiSelectMode,
    queryParams,
    setSelectedPath,
    setSearchQuery,
    setAttributeFilter,
    setTagFilters,
    setOwnershipFilter,
    setStatusFilter,
    setViewMode,
    setSort,
    setSelectedAssetId,
    setSelectedAssetIds,
    toggleAssetSelection,
    clearSelection,
    setExpandedTreeNodes,
    resetFilters,
    filterAssets,
  };
}

export type UseAssetBrowserReturn = ReturnType<typeof useAssetBrowser>;
