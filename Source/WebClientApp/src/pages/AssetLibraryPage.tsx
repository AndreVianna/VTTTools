import React, { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AssetBrowserLayout, AssetInspectorPanel } from '@/components/assets/browser';
import { useAssetBrowser } from '@/hooks/useAssetBrowser';
import { useLetterFilter } from '@/hooks/useLetterFilter';
import { useGetAssetsQuery, useDeleteAssetMutation, useCloneAssetMutation } from '@/services/assetsApi';
import { AssetLibraryContent, AssetLibrarySidebar } from './AssetLibrary/components';
import type { Asset } from '@/types/domain';

export const AssetLibraryPage: React.FC = () => {
    // ═══════════════════════════════════════════════════════════════════════════
    // ROUTING
    // ═══════════════════════════════════════════════════════════════════════════
    const navigate = useNavigate();

    // ═══════════════════════════════════════════════════════════════════════════
    // QUERIES & MUTATIONS
    // ═══════════════════════════════════════════════════════════════════════════
    const { data: allAssets, isLoading, error, refetch } = useGetAssetsQuery({});
    const [deleteAsset] = useDeleteAssetMutation();
    const [cloneAsset] = useCloneAssetMutation();

    // ═══════════════════════════════════════════════════════════════════════════
    // DOMAIN HOOKS
    // ═══════════════════════════════════════════════════════════════════════════
    const browser = useAssetBrowser();

    const { availableLetters } = useLetterFilter({
        items: allAssets,
        getName: (asset) => asset.name,
    });

    // ═══════════════════════════════════════════════════════════════════════════
    // DERIVED STATE
    // ═══════════════════════════════════════════════════════════════════════════
    const filteredAssets = useMemo(() => {
        if (!allAssets) return [];
        return browser.filterAssets(allAssets);
    }, [allAssets, browser]);

    const selectedAsset = useMemo(() => {
        if (!browser.selectedAssetId || !filteredAssets) return null;
        return filteredAssets.find((a) => a.id === browser.selectedAssetId) ?? null;
    }, [browser.selectedAssetId, filteredAssets]);

    // ═══════════════════════════════════════════════════════════════════════════
    // HANDLERS
    // ═══════════════════════════════════════════════════════════════════════════
    const handleAssetClick = useCallback((asset: Asset) => {
        browser.setSelectedAssetId(asset.id);
    }, [browser]);

    const handleAssetDoubleClick = useCallback((asset: Asset) => {
        navigate(`/assets/${asset.id}/edit`);
    }, [navigate]);

    const handleCreateNew = useCallback(() => {
        navigate('/assets/new');
    }, [navigate]);

    const handleEditAsset = useCallback(() => {
        if (selectedAsset) {
            navigate(`/assets/${selectedAsset.id}/edit`);
        }
    }, [navigate, selectedAsset]);

    const handleDeleteAsset = useCallback(async () => {
        if (selectedAsset && window.confirm(`Delete "${selectedAsset.name}"?`)) {
            await deleteAsset(selectedAsset.id);
            browser.setSelectedAssetId(null);
        }
    }, [browser, deleteAsset, selectedAsset]);

    const handleCloneAsset = useCallback(async () => {
        if (selectedAsset) {
            const result = await cloneAsset(selectedAsset.id);
            if ('data' in result && result.data) {
                navigate(`/assets/${result.data.id}/edit`);
            }
        }
    }, [cloneAsset, navigate, selectedAsset]);

    const handleBulkDelete = useCallback(async () => {
        if (browser.selectedAssetIds.length === 0) return;
        if (window.confirm(`Delete ${browser.selectedAssetIds.length} selected assets?`)) {
            for (const id of browser.selectedAssetIds) {
                await deleteAsset(id);
            }
            browser.clearSelection();
        }
    }, [browser, deleteAsset]);

    // ═══════════════════════════════════════════════════════════════════════════
    // RENDER
    // ═══════════════════════════════════════════════════════════════════════════
    return (
        <AssetBrowserLayout
            leftSidebar={
                <AssetLibrarySidebar
                    assets={allAssets ?? []}
                    selectedPath={browser.selectedPath}
                    onPathChange={browser.setSelectedPath}
                    expandedNodes={browser.expandedTreeNodes}
                    onExpandedChange={browser.setExpandedTreeNodes}
                    attributeFilters={browser.attributeFilters}
                    onAttributeFilterChange={browser.setAttributeFilter}
                    ownershipFilter={browser.ownershipFilter}
                    onOwnershipFilterChange={browser.setOwnershipFilter}
                    statusFilter={browser.statusFilter}
                    onStatusFilterChange={browser.setStatusFilter}
                    searchQuery={browser.searchQuery}
                    letterFilter={browser.letterFilter}
                    onResetFilters={browser.resetFilters}
                    onCreateNew={handleCreateNew}
                />
            }
            mainContent={
                <AssetLibraryContent
                    assets={filteredAssets}
                    isLoading={isLoading}
                    error={error}
                    onRefetch={refetch}
                    searchQuery={browser.searchQuery}
                    onSearchChange={browser.setSearchQuery}
                    sortField={browser.sortField}
                    sortDirection={browser.sortDirection}
                    onSortChange={browser.setSort}
                    viewMode={browser.viewMode}
                    onViewModeChange={browser.setViewMode}
                    selectedAssetId={browser.selectedAssetId}
                    selectedAssetIds={browser.selectedAssetIds}
                    onSelectionChange={browser.setSelectedAssetIds}
                    isMultiSelectMode={browser.isMultiSelectMode}
                    onToggleAssetSelection={browser.toggleAssetSelection}
                    letterFilter={browser.letterFilter}
                    onLetterChange={browser.setLetterFilter}
                    availableLetters={availableLetters}
                    onAssetClick={handleAssetClick}
                    onAssetDoubleClick={handleAssetDoubleClick}
                    onBulkDelete={handleBulkDelete}
                    onCreateNew={handleCreateNew}
                />
            }
            rightSidebar={
                selectedAsset ? (
                    <AssetInspectorPanel
                        asset={selectedAsset}
                        onEdit={handleEditAsset}
                        onDelete={handleDeleteAsset}
                        onClone={handleCloneAsset}
                    />
                ) : null
            }
            rightSidebarOpen={browser.inspectorOpen}
        />
    );
};

export default AssetLibraryPage;
