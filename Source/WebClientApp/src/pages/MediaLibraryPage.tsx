import React, { useCallback, useMemo } from 'react';
import { AssetBrowserLayout } from '@/components/assets/browser';
import { useMediaBrowser } from '@/hooks/useMediaBrowser';
import { useFilterResourcesQuery, useDeleteResourceMutation } from '@/services/mediaApi';
import { ResourceRole, type MediaResource } from '@/types/domain';
import {
    MediaInspectorPanel,
    MediaLibraryContent,
    MediaLibrarySidebar,
} from './MediaLibrary/components';

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════
const isAudioCategory = (category: ResourceRole): boolean => {
    return category === ResourceRole.SoundEffect || category === ResourceRole.AmbientSound;
};

export const MediaLibraryPage: React.FC = () => {
    // ═══════════════════════════════════════════════════════════════════════════
    // QUERIES & MUTATIONS
    // ═══════════════════════════════════════════════════════════════════════════
    const { data, isLoading, isFetching, error, refetch } = useFilterResourcesQuery({});
    const [deleteResource] = useDeleteResourceMutation();

    // ═══════════════════════════════════════════════════════════════════════════
    // DOMAIN HOOKS
    // ═══════════════════════════════════════════════════════════════════════════
    const browser = useMediaBrowser();

    // ═══════════════════════════════════════════════════════════════════════════
    // DERIVED STATE
    // ═══════════════════════════════════════════════════════════════════════════
    const displayItems = useMemo(() => {
        if (!data) return [];
        return browser.filterMedia(data.items);
    }, [data, browser]);

    const paginationInfo = useMemo(() => {
        if (!data) return { hasMore: false, totalCount: 0 };
        return {
            hasMore: data.skip + data.items.length < data.totalCount,
            totalCount: data.totalCount,
        };
    }, [data]);

    const selectedMedia = useMemo(() => {
        if (!browser.selectedMediaId || !displayItems) return null;
        return displayItems.find((m) => m.id === browser.selectedMediaId) ?? null;
    }, [browser.selectedMediaId, displayItems]);

    const hasActiveFilters = useMemo(() => {
        return (
            browser.selectedCategory !== ResourceRole.Undefined ||
            browser.searchQuery !== '' ||
            browser.ownershipFilter !== 'all' ||
            browser.statusFilter !== 'all'
        );
    }, [browser.selectedCategory, browser.searchQuery, browser.ownershipFilter, browser.statusFilter]);

    const shouldUseListView = useMemo(
        () => browser.viewMode === 'table' || isAudioCategory(browser.selectedCategory),
        [browser.viewMode, browser.selectedCategory]
    );

    // ═══════════════════════════════════════════════════════════════════════════
    // HANDLERS
    // ═══════════════════════════════════════════════════════════════════════════
    const handleMediaClick = useCallback((media: MediaResource) => {
        browser.setSelectedMediaId(media.id);
    }, [browser]);

    const handleMediaDoubleClick = useCallback((_media: MediaResource) => {
        // Future: open media editor or preview modal
    }, []);

    const handleDeleteMedia = useCallback(async () => {
        if (selectedMedia && window.confirm(`Delete "${selectedMedia.fileName}"?`)) {
            await deleteResource(selectedMedia.id);
            browser.setSelectedMediaId(null);
        }
    }, [selectedMedia, deleteResource, browser]);

    const handleBulkDelete = useCallback(async () => {
        if (browser.selectedMediaIds.length === 0) return;
        if (window.confirm(`Delete ${browser.selectedMediaIds.length} selected items?`)) {
            await Promise.all(browser.selectedMediaIds.map((id) => deleteResource(id)));
            browser.clearSelection();
        }
    }, [browser, deleteResource]);

    // ═══════════════════════════════════════════════════════════════════════════
    // RENDER
    // ═══════════════════════════════════════════════════════════════════════════
    return (
        <AssetBrowserLayout
            leftSidebar={
                <MediaLibrarySidebar
                    selectedCategory={browser.selectedCategory}
                    onCategoryChange={browser.setSelectedCategory}
                    ownershipFilter={browser.ownershipFilter}
                    onOwnershipFilterChange={browser.setOwnershipFilter}
                    statusFilter={browser.statusFilter}
                    onStatusFilterChange={browser.setStatusFilter}
                    hasActiveFilters={hasActiveFilters}
                    onResetFilters={browser.resetFilters}
                />
            }
            mainContent={
                <MediaLibraryContent
                    items={displayItems}
                    isLoading={isLoading}
                    isFetching={isFetching}
                    error={error}
                    onRefetch={refetch}
                    searchQuery={browser.searchQuery}
                    onSearchChange={browser.setSearchQuery}
                    sortField={browser.sortField}
                    sortDirection={browser.sortDirection}
                    onSortChange={browser.setSort}
                    viewMode={browser.viewMode}
                    onViewModeChange={browser.setViewMode}
                    selectedMediaId={browser.selectedMediaId}
                    selectedMediaIds={browser.selectedMediaIds}
                    isMultiSelectMode={browser.isMultiSelectMode}
                    onToggleMediaSelection={browser.toggleMediaSelection}
                    onMediaClick={handleMediaClick}
                    onMediaDoubleClick={handleMediaDoubleClick}
                    onBulkDelete={handleBulkDelete}
                    onLoadMore={browser.loadMore}
                    hasMore={paginationInfo.hasMore}
                    totalCount={paginationInfo.totalCount}
                    shouldUseListView={shouldUseListView}
                />
            }
            rightSidebar={
                selectedMedia ? (
                    <MediaInspectorPanel
                        media={selectedMedia}
                        onDelete={handleDeleteMedia}
                    />
                ) : null
            }
            rightSidebarOpen={browser.inspectorOpen}
        />
    );
};

export default MediaLibraryPage;
