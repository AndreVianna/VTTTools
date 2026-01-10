import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Alert,
    Box,
    Button,
    Checkbox,
    CircularProgress,
    FormControlLabel,
    FormGroup,
    Tab,
    Tabs,
    Typography,
    useTheme,
} from '@mui/material';
import {
    ExpandMore as ExpandMoreIcon,
    FilterList as FilterListIcon,
} from '@mui/icons-material';
import React, { useMemo, useCallback } from 'react';

import { AssetBrowserLayout, BrowserToolbar } from '@/components/assets/browser';
import { MediaGrid } from '@/components/media/MediaGrid';
import { MediaList } from '@/components/media/MediaList';
import { useMediaBrowser } from '@/hooks/useMediaBrowser';
import { useFilterResourcesQuery, useDeleteResourceMutation } from '@/services/mediaApi';
import { ResourceRole, type MediaResource } from '@/types/domain';

const categoryTabs = [
    { value: ResourceRole.Undefined, label: 'All' },
    { value: ResourceRole.Background, label: 'Background' },
    { value: ResourceRole.Token, label: 'Token' },
    { value: ResourceRole.Portrait, label: 'Portrait' },
    { value: ResourceRole.Overlay, label: 'Overlay' },
    { value: ResourceRole.Illustration, label: 'Illustration' },
    { value: ResourceRole.SoundEffect, label: 'Sound Effect' },
    { value: ResourceRole.AmbientSound, label: 'Ambient Sound' },
    { value: ResourceRole.CutScene, label: 'Cut Scene' },
];

const isAudioCategory = (category: ResourceRole): boolean => {
    return category === ResourceRole.SoundEffect || category === ResourceRole.AmbientSound;
};

export const MediaLibraryPage: React.FC = () => {
    const theme = useTheme();
    const browser = useMediaBrowser();
    const [deleteResource] = useDeleteResourceMutation();

    const { data, isLoading, isFetching, error, refetch } = useFilterResourcesQuery(browser.queryParams);

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
        return displayItems.find((m) => m.id === browser.selectedMediaId) || null;
    }, [browser.selectedMediaId, displayItems]);

    const handleMediaClick = useCallback((media: MediaResource) => {
        browser.setSelectedMediaId(media.id);
    }, [browser]);

    const handleMediaDoubleClick = useCallback((_media: MediaResource) => {
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
            await Promise.all(browser.selectedMediaIds.map(id => deleteResource(id)));
            browser.clearSelection();
        }
    }, [browser, deleteResource]);

    const hasActiveFilters =
        browser.selectedCategory !== ResourceRole.Undefined ||
        browser.searchQuery !== '' ||
        browser.ownershipFilter !== 'all' ||
        browser.statusFilter !== 'all';

    const leftSidebar = (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs
                    id="media-category-tabs"
                    orientation="vertical"
                    value={browser.selectedCategory}
                    onChange={(_e, value) => browser.setSelectedCategory(value)}
                    sx={{
                        '& .MuiTab-root': {
                            alignItems: 'flex-start',
                            textAlign: 'left',
                            minHeight: 48,
                        },
                    }}
                >
                    {categoryTabs.map((tab) => (
                        <Tab
                            id={`media-tab-${tab.value.toLowerCase()}`}
                            key={tab.value}
                            label={tab.label}
                            value={tab.value}
                        />
                    ))}
                </Tabs>
            </Box>

            <Box sx={{ flexGrow: 1, overflow: 'auto', px: 1 }}>
                <Accordion id="media-filter-ownership" disableGutters elevation={0}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            Ownership
                        </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <FormGroup>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        size="small"
                                        checked={browser.ownershipFilter === 'mine' || browser.ownershipFilter === 'all'}
                                        onChange={(e) =>
                                            browser.setOwnershipFilter(
                                                e.target.checked
                                                    ? browser.ownershipFilter === 'others'
                                                        ? 'all'
                                                        : 'mine'
                                                    : 'others'
                                            )
                                        }
                                    />
                                }
                                label={<Typography variant="body2">Mine</Typography>}
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        size="small"
                                        checked={browser.ownershipFilter === 'others' || browser.ownershipFilter === 'all'}
                                        onChange={(e) =>
                                            browser.setOwnershipFilter(
                                                e.target.checked
                                                    ? browser.ownershipFilter === 'mine'
                                                        ? 'all'
                                                        : 'others'
                                                    : 'mine'
                                            )
                                        }
                                    />
                                }
                                label={<Typography variant="body2">Others</Typography>}
                            />
                        </FormGroup>
                    </AccordionDetails>
                </Accordion>

                <Accordion id="media-filter-status" disableGutters elevation={0}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            Status
                        </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <FormGroup>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        size="small"
                                        checked={browser.statusFilter === 'all' || browser.statusFilter === 'published'}
                                        onChange={(e) =>
                                            browser.setStatusFilter(
                                                e.target.checked
                                                    ? browser.statusFilter === 'draft'
                                                        ? 'all'
                                                        : 'published'
                                                    : 'draft'
                                            )
                                        }
                                    />
                                }
                                label={<Typography variant="body2">Published</Typography>}
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        size="small"
                                        checked={browser.statusFilter === 'all' || browser.statusFilter === 'draft'}
                                        onChange={(e) =>
                                            browser.setStatusFilter(
                                                e.target.checked
                                                    ? browser.statusFilter === 'published'
                                                        ? 'all'
                                                        : 'draft'
                                                    : 'published'
                                            )
                                        }
                                    />
                                }
                                label={<Typography variant="body2">Draft</Typography>}
                            />
                        </FormGroup>
                    </AccordionDetails>
                </Accordion>

                {hasActiveFilters && (
                    <Box sx={{ p: 1, pt: 2 }}>
                        <Button
                            id="media-btn-reset-filters"
                            size="small"
                            startIcon={<FilterListIcon />}
                            onClick={browser.resetFilters}
                            fullWidth
                            variant="outlined"
                        >
                            Reset Filters
                        </Button>
                    </Box>
                )}
            </Box>
        </Box>
    );

    const shouldUseListView = browser.viewMode === 'table' || isAudioCategory(browser.selectedCategory);

    const mainContent = (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <BrowserToolbar
                searchQuery={browser.searchQuery}
                onSearchChange={browser.setSearchQuery}
                sortField={browser.sortField}
                sortDirection={browser.sortDirection}
                onSortChange={browser.setSort}
                viewMode={browser.viewMode}
                onViewModeChange={browser.setViewMode}
                selectedCount={browser.selectedMediaIds.length}
                onBulkDelete={handleBulkDelete}
                totalCount={paginationInfo.totalCount}
            />

            <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
                {isLoading && displayItems.length === 0 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <CircularProgress />
                    </Box>
                )}

                {error && (
                    <Box sx={{ p: 2 }}>
                        <Alert
                            severity="error"
                            action={
                                <Button color="inherit" size="small" onClick={() => refetch()}>
                                    Retry
                                </Button>
                            }
                        >
                            Failed to load media. Please try again.
                        </Alert>
                    </Box>
                )}

                {!isLoading && !error && displayItems.length === 0 && (
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100%',
                            color: theme.palette.text.secondary,
                        }}
                    >
                        <Typography variant="h6">No media found</Typography>
                        <Typography variant="body2">Try adjusting your filters</Typography>
                    </Box>
                )}

                {!error && displayItems.length > 0 && shouldUseListView && (
                    <MediaList
                        items={displayItems}
                        selectedId={browser.selectedMediaId}
                        selectedIds={browser.selectedMediaIds}
                        isMultiSelectMode={browser.isMultiSelectMode}
                        onItemClick={handleMediaClick}
                        onItemDoubleClick={handleMediaDoubleClick}
                        onCheckChange={browser.toggleMediaSelection}
                    />
                )}

                {!error && displayItems.length > 0 && !shouldUseListView && (
                    <MediaGrid
                        items={displayItems}
                        selectedId={browser.selectedMediaId}
                        selectedIds={browser.selectedMediaIds}
                        isMultiSelectMode={browser.isMultiSelectMode}
                        viewMode={browser.viewMode === 'grid-large' ? 'grid-large' : 'grid-small'}
                        onItemClick={handleMediaClick}
                        onItemDoubleClick={handleMediaDoubleClick}
                        onCheckChange={browser.toggleMediaSelection}
                        onLoadMore={browser.loadMore}
                        hasMore={paginationInfo.hasMore}
                        isLoading={isFetching}
                    />
                )}
            </Box>
        </Box>
    );

    const rightSidebar = selectedMedia ? (
        <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
                Media Inspector
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
                {selectedMedia.fileName}
            </Typography>
            <Typography variant="caption" display="block" gutterBottom>
                Type: {selectedMedia.role}
            </Typography>
            <Typography variant="caption" display="block" gutterBottom>
                Size: {(selectedMedia.fileSize / 1024).toFixed(2)} KB
            </Typography>
            <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                <Button
                    id="media-btn-delete-selected"
                    variant="outlined"
                    size="small"
                    color="error"
                    onClick={handleDeleteMedia}
                >
                    Delete
                </Button>
            </Box>
        </Box>
    ) : null;

    return (
        <AssetBrowserLayout
            leftSidebar={leftSidebar}
            mainContent={mainContent}
            rightSidebar={rightSidebar}
            rightSidebarOpen={browser.inspectorOpen}
        />
    );
};

export default MediaLibraryPage;
