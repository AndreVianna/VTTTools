import React from 'react';
import { Alert, Box, Button, CircularProgress, Typography, useTheme } from '@mui/material';
import { BrowserToolbar } from '@/components/assets/browser';
import { MediaGrid } from '@/components/media/MediaGrid';
import { MediaList } from '@/components/media/MediaList';
import type { MediaResource } from '@/types/domain';

export interface MediaLibraryContentProps {
    items: MediaResource[];
    isLoading: boolean;
    isFetching: boolean;
    error: unknown;
    onRefetch: () => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    sortField: string;
    sortDirection: 'asc' | 'desc';
    onSortChange: (field: string, direction: 'asc' | 'desc') => void;
    viewMode: 'grid-small' | 'grid-large' | 'table';
    onViewModeChange: (mode: 'grid-small' | 'grid-large' | 'table') => void;
    selectedMediaId: string | null;
    selectedMediaIds: string[];
    isMultiSelectMode: boolean;
    onToggleMediaSelection: (id: string) => void;
    onMediaClick: (media: MediaResource) => void;
    onMediaDoubleClick: (media: MediaResource) => void;
    onBulkDelete: () => void;
    onLoadMore: () => void;
    hasMore: boolean;
    totalCount: number;
    shouldUseListView: boolean;
}

export const MediaLibraryContent: React.FC<MediaLibraryContentProps> = ({
    items,
    isLoading,
    isFetching,
    error,
    onRefetch,
    searchQuery,
    onSearchChange,
    sortField,
    sortDirection,
    onSortChange,
    viewMode,
    onViewModeChange,
    selectedMediaId,
    selectedMediaIds,
    isMultiSelectMode,
    onToggleMediaSelection,
    onMediaClick,
    onMediaDoubleClick,
    onBulkDelete,
    onLoadMore,
    hasMore,
    totalCount,
    shouldUseListView,
}) => {
    const theme = useTheme();

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <BrowserToolbar
                searchQuery={searchQuery}
                onSearchChange={onSearchChange}
                sortField={sortField}
                sortDirection={sortDirection}
                onSortChange={onSortChange}
                viewMode={viewMode}
                onViewModeChange={onViewModeChange}
                selectedCount={selectedMediaIds.length}
                onBulkDelete={onBulkDelete}
                totalCount={totalCount}
            />

            <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
                {isLoading && items.length === 0 && <LoadingState />}

                {error && <ErrorState onRetry={onRefetch} />}

                {!isLoading && !error && items.length === 0 && (
                    <EmptyState theme={theme} />
                )}

                {!error && items.length > 0 && shouldUseListView && (
                    <MediaList
                        items={items}
                        selectedId={selectedMediaId}
                        selectedIds={selectedMediaIds}
                        isMultiSelectMode={isMultiSelectMode}
                        onItemClick={onMediaClick}
                        onItemDoubleClick={onMediaDoubleClick}
                        onCheckChange={onToggleMediaSelection}
                    />
                )}

                {!error && items.length > 0 && !shouldUseListView && (
                    <MediaGrid
                        items={items}
                        selectedId={selectedMediaId}
                        selectedIds={selectedMediaIds}
                        isMultiSelectMode={isMultiSelectMode}
                        viewMode={viewMode === 'grid-large' ? 'grid-large' : 'grid-small'}
                        onItemClick={onMediaClick}
                        onItemDoubleClick={onMediaDoubleClick}
                        onCheckChange={onToggleMediaSelection}
                        onLoadMore={onLoadMore}
                        hasMore={hasMore}
                        isLoading={isFetching}
                    />
                )}
            </Box>
        </Box>
    );
};

const LoadingState: React.FC = () => (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
    </Box>
);

interface ErrorStateProps {
    onRetry: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({ onRetry }) => (
    <Box sx={{ p: 2 }}>
        <Alert
            severity="error"
            action={
                <Button color="inherit" size="small" onClick={onRetry}>
                    Retry
                </Button>
            }
        >
            Failed to load media. Please try again.
        </Alert>
    </Box>
);

interface EmptyStateProps {
    theme: ReturnType<typeof useTheme>;
}

const EmptyState: React.FC<EmptyStateProps> = ({ theme }) => (
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
);
