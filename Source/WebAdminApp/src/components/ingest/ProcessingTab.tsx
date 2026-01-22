import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Paper,
    Chip,
    Button,
    Checkbox,
    CircularProgress,
} from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import type { AppDispatch } from '@store/store';
import {
    retryFailed,
    selectSelectedAssetIds,
    toggleAssetSelection,
    selectAllAssets,
    clearSelection,
    selectIsSubmitting,
} from '@store/slices/ingestSlice';
import type { IngestAssetResponse } from '@/types/ingest';
import { IngestStatus } from '@/types/ingest';

interface ProcessingTabProps {
    assets: IngestAssetResponse[];
    totalCount: number;
    page: number;
    rowsPerPage: number;
    isLoading: boolean;
    onPageChange: (page: number) => void;
    onRefresh: () => void;
}

function getStatusColor(status: IngestStatus): 'default' | 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success' {
    switch (status) {
        case IngestStatus.Pending:
            return 'default';
        case IngestStatus.Processing:
            return 'primary';
        case IngestStatus.PartialFailure:
            return 'warning';
        case IngestStatus.Failed:
            return 'error';
        default:
            return 'default';
    }
}

function getStatusLabel(status: IngestStatus): string {
    switch (status) {
        case IngestStatus.Pending:
            return 'Queued';
        case IngestStatus.Processing:
            return 'Processing';
        case IngestStatus.PartialFailure:
            return 'Partial Failure';
        case IngestStatus.Failed:
            return 'Failed';
        default:
            return status;
    }
}

export function ProcessingTab({
    assets,
    totalCount,
    page,
    rowsPerPage,
    isLoading,
    onPageChange,
    onRefresh,
}: ProcessingTabProps) {
    const dispatch = useDispatch<AppDispatch>();
    const selectedAssetIds = useSelector(selectSelectedAssetIds);
    const isSubmitting = useSelector(selectIsSubmitting);

    const failedOrPartialAssets = assets.filter(
        a => a.ingestStatus === IngestStatus.Failed || a.ingestStatus === IngestStatus.PartialFailure
    );
    const retryableIds = failedOrPartialAssets.map(a => a.id);
    const selectedRetryable = selectedAssetIds.filter(id => retryableIds.includes(id));

    const handleToggleSelect = useCallback((assetId: string) => {
        dispatch(toggleAssetSelection(assetId));
    }, [dispatch]);

    const handleSelectAll = useCallback(() => {
        if (selectedRetryable.length === retryableIds.length) {
            dispatch(clearSelection());
        } else {
            dispatch(selectAllAssets(retryableIds));
        }
    }, [dispatch, selectedRetryable.length, retryableIds]);

    const handleRetry = useCallback(async () => {
        if (selectedRetryable.length === 0) return;
        const result = await dispatch(retryFailed({ assetIds: selectedRetryable }));
        if (retryFailed.fulfilled.match(result)) {
            dispatch(clearSelection());
            onRefresh();
        }
    }, [dispatch, selectedRetryable, onRefresh]);

    const handlePageChange = (_: unknown, newPage: number) => {
        onPageChange(newPage);
    };

    if (isLoading && assets.length === 0) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (assets.length === 0) {
        return (
            <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="text.secondary">
                    No assets are currently being processed
                </Typography>
            </Box>
        );
    }

    return (
        <Box>
            {retryableIds.length > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                        {selectedRetryable.length} of {retryableIds.length} failed items selected
                    </Typography>
                    <Button
                        startIcon={<RefreshIcon />}
                        onClick={handleRetry}
                        disabled={selectedRetryable.length === 0 || isSubmitting}
                        variant="outlined"
                        size="small"
                    >
                        Retry Selected
                    </Button>
                </Box>
            )}

            <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            {retryableIds.length > 0 && (
                                <TableCell padding="checkbox">
                                    <Checkbox
                                        indeterminate={selectedRetryable.length > 0 && selectedRetryable.length < retryableIds.length}
                                        checked={retryableIds.length > 0 && selectedRetryable.length === retryableIds.length}
                                        onChange={handleSelectAll}
                                    />
                                </TableCell>
                            )}
                            <TableCell>Name</TableCell>
                            <TableCell>Category</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Portrait</TableCell>
                            <TableCell>Token</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {assets.map((asset) => {
                            const isRetryable = retryableIds.includes(asset.id);
                            const isSelected = selectedAssetIds.includes(asset.id);

                            return (
                                <TableRow
                                    key={asset.id}
                                    hover
                                    selected={isSelected}
                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                >
                                    {retryableIds.length > 0 && (
                                        <TableCell padding="checkbox">
                                            {isRetryable && (
                                                <Checkbox
                                                    checked={isSelected}
                                                    onChange={() => handleToggleSelect(asset.id)}
                                                />
                                            )}
                                        </TableCell>
                                    )}
                                    <TableCell>{asset.name}</TableCell>
                                    <TableCell>{asset.category}</TableCell>
                                    <TableCell>{asset.type}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={getStatusLabel(asset.ingestStatus)}
                                            color={getStatusColor(asset.ingestStatus)}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {asset.portrait ? (
                                            <Chip label="Ready" color="success" size="small" variant="outlined" />
                                        ) : asset.ingestStatus === IngestStatus.Processing ? (
                                            <CircularProgress size={16} />
                                        ) : asset.ingestStatus === IngestStatus.Failed || asset.ingestStatus === IngestStatus.PartialFailure ? (
                                            <Chip label="Failed" color="error" size="small" variant="outlined" />
                                        ) : (
                                            <Chip label="Pending" size="small" variant="outlined" />
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {asset.tokens && asset.tokens.length > 0 ? (
                                            <Chip label="Ready" color="success" size="small" variant="outlined" />
                                        ) : asset.ingestStatus === IngestStatus.Processing ? (
                                            <CircularProgress size={16} />
                                        ) : asset.ingestStatus === IngestStatus.Failed || asset.ingestStatus === IngestStatus.PartialFailure ? (
                                            <Chip label="Failed" color="error" size="small" variant="outlined" />
                                        ) : (
                                            <Chip label="Pending" size="small" variant="outlined" />
                                        )}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>

            <TablePagination
                rowsPerPageOptions={[rowsPerPage]}
                component="div"
                count={totalCount}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handlePageChange}
            />
        </Box>
    );
}
