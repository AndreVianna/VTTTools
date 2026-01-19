import React from 'react';
import type { Theme } from '@mui/material';
import { Alert, Box, Button, CircularProgress, Grid, Typography, useTheme } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import {
    AssetCardCompact,
    AssetTableView,
    BrowserToolbar,
    type SortField,
    type SortDirection,
} from '@/components/assets/browser';
import { LetterFilterBar } from '@/components/common/LetterFilterBar';
import type { Asset } from '@/types/domain';

export interface AssetLibraryContentProps {
    assets: Asset[];
    isLoading: boolean;
    error: unknown;
    onRefetch: () => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    sortField: SortField;
    sortDirection: SortDirection;
    onSortChange: (field: SortField, direction: SortDirection) => void;
    viewMode: 'grid-small' | 'grid-large' | 'table';
    onViewModeChange: (mode: 'grid-small' | 'grid-large' | 'table') => void;
    selectedAssetId: string | null;
    selectedAssetIds: string[];
    onSelectionChange: (ids: string[]) => void;
    isMultiSelectMode: boolean;
    onToggleAssetSelection: (id: string) => void;
    letterFilter: string | null;
    onLetterChange: (letter: string | null) => void;
    availableLetters: Set<string>;
    onAssetClick: (asset: Asset) => void;
    onAssetDoubleClick: (asset: Asset) => void;
    onBulkDelete: () => void;
    onCreateNew: () => void;
}

export const AssetLibraryContent: React.FC<AssetLibraryContentProps> = ({
    assets,
    isLoading,
    error,
    onRefetch,
    searchQuery,
    onSearchChange,
    sortField,
    sortDirection,
    onSortChange,
    viewMode,
    onViewModeChange,
    selectedAssetId,
    selectedAssetIds,
    onSelectionChange,
    isMultiSelectMode,
    onToggleAssetSelection,
    letterFilter,
    onLetterChange,
    availableLetters,
    onAssetClick,
    onAssetDoubleClick,
    onBulkDelete,
    onCreateNew,
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
                selectedCount={selectedAssetIds.length}
                onBulkDelete={onBulkDelete}
                totalCount={assets.length}
            />

            <LetterFilterBar
                selectedLetter={letterFilter}
                onLetterChange={onLetterChange}
                availableLetters={availableLetters}
                compact
            />

            <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
                {isLoading && <LoadingState />}

                {error != null && <ErrorState onRetry={onRefetch} />}

                {!isLoading && !error && assets.length === 0 && (
                    <EmptyState theme={theme} onCreateNew={onCreateNew} />
                )}

                {!isLoading && !error && assets.length > 0 && viewMode === 'table' && (
                    <AssetTableView
                        assets={assets}
                        selectedIds={selectedAssetIds}
                        onSelectionChange={onSelectionChange}
                        onRowClick={onAssetClick}
                        onRowDoubleClick={onAssetDoubleClick}
                    />
                )}

                {!isLoading && !error && assets.length > 0 && viewMode !== 'table' && (
                    <Grid container spacing={1.5}>
                        {assets.map((asset) => (
                            <Grid key={asset.id}>
                                <AssetCardCompact
                                    asset={asset}
                                    isSelected={selectedAssetId === asset.id}
                                    isMultiSelectMode={isMultiSelectMode}
                                    isChecked={selectedAssetIds.includes(asset.id)}
                                    onClick={() => onAssetClick(asset)}
                                    onDoubleClick={() => onAssetDoubleClick(asset)}
                                    onCheckChange={() => onToggleAssetSelection(asset.id)}
                                    size={viewMode === 'grid-large' ? 'large' : 'small'}
                                />
                            </Grid>
                        ))}
                    </Grid>
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
    <Alert
        severity="error"
        action={
            <Button color="inherit" size="small" onClick={onRetry}>
                Retry
            </Button>
        }
    >
        Failed to load assets. Please try again.
    </Alert>
);

interface EmptyStateProps {
    theme: Theme;
    onCreateNew: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ theme, onCreateNew }) => (
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
        <Typography variant="h6">No assets found</Typography>
        <Typography variant="body2">Try adjusting your filters or create a new asset</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={onCreateNew} sx={{ mt: 2 }}>
            Create Asset
        </Button>
    </Box>
);
