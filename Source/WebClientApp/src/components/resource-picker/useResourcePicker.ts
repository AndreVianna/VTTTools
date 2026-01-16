import { useCallback, useMemo, useState } from 'react';
import type { MediaResource, ResourceFilterData } from '@/types/domain';
import { useFilterResourcesQuery } from '@/services/mediaApi';
import type { ResourcePickerConfig, ResourcePickerState, ResourceContentType } from './types';

export interface UseResourcePickerOptions {
    /** Configuration for the picker */
    config: ResourcePickerConfig;
    /** Initially selected resource ID */
    initialResourceId?: string | undefined;
}

export interface UseResourcePickerReturn extends ResourcePickerState {
    /** Filtered resources from the API */
    resources: MediaResource[];
    /** Selected resource object (if any) */
    selectedResource: MediaResource | null;
    /** Whether resources are loading */
    isLoading: boolean;
    /** Refetch resources from API */
    refetch: () => void;
    /** Set search query */
    setSearchQuery: (query: string) => void;
    /** Set ownership filter */
    setOwnershipFilter: (filter: 'mine' | 'all') => void;
    /** Select a resource by ID or object */
    selectResource: (resource: MediaResource | null) => void;
    /** Toggle view mode between grid and list */
    toggleViewMode: () => void;
    /** Reset all filters and selection */
    reset: () => void;
    /** The configuration being used */
    config: ResourcePickerConfig;
    /** Maximum duration in milliseconds from API response */
    maxDurationMs: number;
    /** Whether there are more resources to load */
    hasMore: boolean;
    /** Whether more resources are being loaded */
    isLoadingMore: boolean;
    /** Set media type filter */
    setMediaTypeFilter: (types: string[]) => void;
    /** Set dimension range filter */
    setDimensionRange: (range: [number, number] | null) => void;
    /** Set duration range filter */
    setDurationRange: (range: [number, number] | null) => void;
    /** Toggle preview collapse state */
    togglePreviewCollapse: () => void;
    /** Load more resources for infinite scroll */
    loadMore: () => void;
}

/** Page size for infinite scroll pagination */
const PAGE_SIZE = 50;

/**
 * Determines the default view mode based on content type hint.
 */
function getDefaultViewMode(contentTypeHint?: ResourceContentType): 'grid' | 'list' {
    return contentTypeHint === 'audio' ? 'list' : 'grid';
}

/**
 * Custom hook for managing resource picker state and data fetching.
 */
export function useResourcePicker(options: UseResourcePickerOptions): UseResourcePickerReturn {
    const { config, initialResourceId } = options;

    // Internal state
    const [state, setState] = useState<ResourcePickerState>({
        searchQuery: '',
        ownershipFilter: 'mine',
        selectedResourceId: initialResourceId ?? null,
        viewMode: getDefaultViewMode(config.contentTypeHint),
        mediaTypeFilter: [],
        dimensionRange: null,
        durationRange: null,
        isPreviewCollapsed: false,
        currentSkip: 0,
    });

    // Build query parameters for RTK Query
    const queryParams = useMemo((): ResourceFilterData => {
        const params: ResourceFilterData = {
            skip: state.currentSkip,
            take: PAGE_SIZE,
        };

        // If only one role is allowed, filter by it
        const firstRole = config.allowedRoles[0];
        if (config.allowedRoles.length === 1 && firstRole !== undefined) {
            params.role = firstRole;
        }

        // Add search text if provided
        if (state.searchQuery.trim()) {
            params.searchText = state.searchQuery.trim();
        }

        // Add media type filter
        if (state.mediaTypeFilter.length > 0) {
            params.mediaTypes = state.mediaTypeFilter;
        }

        // Add dimension range filter
        if (state.dimensionRange) {
            params.minWidth = state.dimensionRange[0];
            params.maxWidth = state.dimensionRange[1];
        }

        // Add duration range filter
        if (state.durationRange) {
            params.minDurationMs = state.durationRange[0];
            params.maxDurationMs = state.durationRange[1];
        }

        return params;
    }, [
        config.allowedRoles,
        state.searchQuery,
        state.mediaTypeFilter,
        state.dimensionRange,
        state.durationRange,
        state.currentSkip,
    ]);

    // Fetch resources from API
    const { data, isLoading, refetch } = useFilterResourcesQuery(queryParams);

    // Filter resources client-side for multiple roles
    const filteredResources = useMemo(() => {
        const items = data?.items ?? [];

        // Filter by allowed roles if multiple
        let filtered = items;
        if (config.allowedRoles.length > 1) {
            filtered = items.filter((r) => {
                // Match by role
                if (config.allowedRoles.includes(r.role)) {
                    return true;
                }
                // Fallback: For audio content hint, also include 'Undefined' role
                // resources with audio content types (handles legacy uploads)
                if (
                    config.contentTypeHint === 'audio' &&
                    r.role === 'Undefined' &&
                    r.contentType.startsWith('audio/')
                ) {
                    return true;
                }
                return false;
            });
        }

        // Note: Ownership filtering would require backend support
        // For now, we show all resources (API doesn't currently support owner filter)

        return filtered;
    }, [data, config.allowedRoles, config.contentTypeHint]);

    // Get selected resource object
    const selectedResource = useMemo(() => {
        if (!state.selectedResourceId) return null;
        return filteredResources.find((r) => r.id === state.selectedResourceId) ?? null;
    }, [filteredResources, state.selectedResourceId]);

    // Get maxDurationMs based on content type hint
    const maxDurationMs = useMemo(() => {
        if (config.contentTypeHint === 'audio') {
            return data?.maxAudioDurationMs ?? 0;
        }
        return data?.maxVideoDurationMs ?? 0;
    }, [data, config.contentTypeHint]);

    // Calculate hasMore for infinite scroll
    const hasMore = useMemo(() => {
        if (!data) return false;
        return state.currentSkip + (data.items?.length ?? 0) < data.totalCount;
    }, [data, state.currentSkip]);

    // Track loading state for pagination (isLoading is true when currentSkip > 0)
    const isLoadingMore = isLoading && state.currentSkip > 0;

    // Actions
    const setSearchQuery = useCallback((query: string) => {
        setState((prev) => ({ ...prev, searchQuery: query, currentSkip: 0 }));
    }, []);

    const setOwnershipFilter = useCallback((filter: 'mine' | 'all') => {
        setState((prev) => ({ ...prev, ownershipFilter: filter, currentSkip: 0 }));
    }, []);

    const selectResource = useCallback((resource: MediaResource | null) => {
        setState((prev) => ({
            ...prev,
            selectedResourceId: resource?.id ?? null,
        }));
    }, []);

    const toggleViewMode = useCallback(() => {
        setState((prev) => ({
            ...prev,
            viewMode: prev.viewMode === 'grid' ? 'list' : 'grid',
        }));
    }, []);

    const reset = useCallback(() => {
        setState({
            searchQuery: '',
            ownershipFilter: 'mine',
            selectedResourceId: initialResourceId ?? null,
            viewMode: getDefaultViewMode(config.contentTypeHint),
            mediaTypeFilter: [],
            dimensionRange: null,
            durationRange: null,
            isPreviewCollapsed: false,
            currentSkip: 0,
        });
    }, [initialResourceId, config.contentTypeHint]);

    const setMediaTypeFilter = useCallback((types: string[]) => {
        setState((prev) => ({ ...prev, mediaTypeFilter: types, currentSkip: 0 }));
    }, []);

    const setDimensionRange = useCallback((range: [number, number] | null) => {
        setState((prev) => ({ ...prev, dimensionRange: range, currentSkip: 0 }));
    }, []);

    const setDurationRange = useCallback((range: [number, number] | null) => {
        setState((prev) => ({ ...prev, durationRange: range, currentSkip: 0 }));
    }, []);

    const togglePreviewCollapse = useCallback(() => {
        setState((prev) => ({ ...prev, isPreviewCollapsed: !prev.isPreviewCollapsed }));
    }, []);

    const loadMore = useCallback(() => {
        if (!hasMore || isLoading) return;
        setState((prev) => ({ ...prev, currentSkip: prev.currentSkip + PAGE_SIZE }));
    }, [hasMore, isLoading]);

    return {
        // State
        ...state,
        resources: filteredResources,
        selectedResource,
        isLoading,
        maxDurationMs,
        hasMore,
        isLoadingMore,

        // Actions
        refetch,
        setSearchQuery,
        setOwnershipFilter,
        selectResource,
        toggleViewMode,
        reset,
        setMediaTypeFilter,
        setDimensionRange,
        setDurationRange,
        togglePreviewCollapse,
        loadMore,

        // Config
        config,
    };
}
