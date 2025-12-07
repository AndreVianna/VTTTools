import { useState, useCallback, useMemo } from 'react';
import { ResourceType, type MediaResource, type ResourceFilterData } from '@/types/domain';
import type { ViewMode, SortField, SortDirection } from '@/components/assets/browser/BrowserToolbar';

export interface MediaBrowserState {
  selectedCategory: ResourceType;
  searchQuery: string;
  ownershipFilter: 'mine' | 'others' | 'all';
  statusFilter: 'all' | 'published' | 'draft';
  viewMode: ViewMode;
  sortField: SortField;
  sortDirection: SortDirection;
  selectedMediaId: string | null;
  selectedMediaIds: string[];
  skip: number;
  take: number;
  hasMore: boolean;
  totalCount: number;
}

const initialState: MediaBrowserState = {
  selectedCategory: ResourceType.Undefined,
  searchQuery: '',
  ownershipFilter: 'all',
  statusFilter: 'all',
  viewMode: 'grid-large',
  sortField: 'name',
  sortDirection: 'asc',
  selectedMediaId: null,
  selectedMediaIds: [],
  skip: 0,
  take: 50,
  hasMore: false,
  totalCount: 0,
};

export function useMediaBrowser() {
  const [state, setState] = useState<MediaBrowserState>(initialState);

  const setSelectedCategory = useCallback((category: ResourceType) => {
    setState((prev) => ({ ...prev, selectedCategory: category, skip: 0 }));
  }, []);

  const setSearchQuery = useCallback((query: string) => {
    setState((prev) => ({ ...prev, searchQuery: query, skip: 0 }));
  }, []);

  const setOwnershipFilter = useCallback((filter: 'mine' | 'others' | 'all') => {
    setState((prev) => ({ ...prev, ownershipFilter: filter, skip: 0 }));
  }, []);

  const setStatusFilter = useCallback((filter: 'all' | 'published' | 'draft') => {
    setState((prev) => ({ ...prev, statusFilter: filter, skip: 0 }));
  }, []);

  const setViewMode = useCallback((mode: ViewMode) => {
    setState((prev) => ({ ...prev, viewMode: mode }));
  }, []);

  const setSort = useCallback((field: SortField, direction: SortDirection) => {
    setState((prev) => ({ ...prev, sortField: field, sortDirection: direction }));
  }, []);

  const setSelectedMediaId = useCallback((id: string | null) => {
    setState((prev) => ({ ...prev, selectedMediaId: id }));
  }, []);

  const setSelectedMediaIds = useCallback((ids: string[]) => {
    setState((prev) => ({ ...prev, selectedMediaIds: ids }));
  }, []);

  const toggleMediaSelection = useCallback((id: string) => {
    setState((prev) => {
      const ids = prev.selectedMediaIds.includes(id)
        ? prev.selectedMediaIds.filter((i) => i !== id)
        : [...prev.selectedMediaIds, id];
      return { ...prev, selectedMediaIds: ids };
    });
  }, []);

  const clearSelection = useCallback(() => {
    setState((prev) => ({ ...prev, selectedMediaId: null, selectedMediaIds: [] }));
  }, []);

  const setPagination = useCallback((skip: number, take: number, hasMore: boolean, totalCount: number) => {
    setState((prev) => ({ ...prev, skip, take, hasMore, totalCount }));
  }, []);

  const loadMore = useCallback(() => {
    setState((prev) => {
      if (!prev.hasMore) return prev;
      return { ...prev, skip: prev.skip + prev.take };
    });
  }, []);

  const resetFilters = useCallback(() => {
    setState((prev) => ({
      ...prev,
      selectedCategory: ResourceType.Undefined,
      searchQuery: '',
      ownershipFilter: 'all',
      statusFilter: 'all',
      skip: 0,
    }));
  }, []);

  const queryParams = useMemo((): ResourceFilterData => {
    const params: ResourceFilterData = {
      skip: state.skip,
      take: state.take,
    };

    if (state.selectedCategory !== ResourceType.Undefined) {
      params.resourceType = state.selectedCategory;
    }

    if (state.searchQuery) {
      params.searchText = state.searchQuery;
    }

    if (state.ownershipFilter === 'mine') {
      params.isPublic = false;
    } else if (state.ownershipFilter === 'others') {
      params.isPublic = true;
    }

    if (state.statusFilter === 'published') {
      params.isPublished = true;
    } else if (state.statusFilter === 'draft') {
      params.isPublished = false;
    }

    return params;
  }, [state.selectedCategory, state.searchQuery, state.ownershipFilter, state.statusFilter, state.skip, state.take]);

  const filterMedia = useCallback(
    (media: MediaResource[]): MediaResource[] => {
      let filtered = [...media];

      if (state.statusFilter === 'published') {
        filtered = filtered.filter((m) => m.isPublished);
      } else if (state.statusFilter === 'draft') {
        filtered = filtered.filter((m) => !m.isPublished);
      }

      filtered.sort((a, b) => {
        let comparison = 0;
        switch (state.sortField) {
          case 'name':
            comparison = a.fileName.localeCompare(b.fileName);
            break;
          case 'category':
            comparison = (a.classification?.category || '').localeCompare(
              b.classification?.category || ''
            );
            break;
          case 'type':
            comparison = (a.classification?.type || '').localeCompare(
              b.classification?.type || ''
            );
            break;
        }
        return state.sortDirection === 'asc' ? comparison : -comparison;
      });

      return filtered;
    },
    [state.statusFilter, state.sortField, state.sortDirection]
  );

  const inspectorOpen = state.selectedMediaId !== null;
  const isMultiSelectMode = state.selectedMediaIds.length > 0;

  return {
    ...state,
    inspectorOpen,
    isMultiSelectMode,
    queryParams,
    setSelectedCategory,
    setSearchQuery,
    setOwnershipFilter,
    setStatusFilter,
    setViewMode,
    setSort,
    setSelectedMediaId,
    setSelectedMediaIds,
    toggleMediaSelection,
    clearSelection,
    setPagination,
    loadMore,
    resetFilters,
    filterMedia,
  };
}

export type UseMediaBrowserReturn = ReturnType<typeof useMediaBrowser>;
