import React, { useState, useCallback } from 'react';
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
    Button,
    Checkbox,
    CircularProgress,
    Avatar,
    ButtonGroup,
} from '@mui/material';
import {
    Check as CheckIcon,
    Close as CloseIcon,
    Delete as DeleteIcon,
} from '@mui/icons-material';
import type { AppDispatch } from '@store/store';
import {
    approveAssets,
    discardAssets,
    rejectAssets,
    selectSelectedAssetIds,
    toggleAssetSelection,
    selectAllAssets,
    clearSelection,
    selectIsSubmitting,
} from '@store/slices/ingestSlice';
import type { IngestAssetResponse } from '@/types/ingest';
import { RejectDialog } from './RejectDialog';
import { BatchRejectDialog } from './BatchRejectDialog';

interface ReviewTabProps {
    assets: IngestAssetResponse[];
    totalCount: number;
    page: number;
    rowsPerPage: number;
    isLoading: boolean;
    onPageChange: (page: number) => void;
    onRefresh: () => void;
}

export function ReviewTab({
    assets,
    totalCount,
    page,
    rowsPerPage,
    isLoading,
    onPageChange,
    onRefresh,
}: ReviewTabProps) {
    const dispatch = useDispatch<AppDispatch>();
    const selectedAssetIds = useSelector(selectSelectedAssetIds);
    const isSubmitting = useSelector(selectIsSubmitting);

    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    const [rejectingAsset, setRejectingAsset] = useState<IngestAssetResponse | null>(null);
    const [batchRejectDialogOpen, setBatchRejectDialogOpen] = useState(false);

    const allAssetIds = assets.map(a => a.id);
    const selectedOnPage = selectedAssetIds.filter(id => allAssetIds.includes(id));

    const handleToggleSelect = useCallback((assetId: string) => {
        dispatch(toggleAssetSelection(assetId));
    }, [dispatch]);

    const handleSelectAll = useCallback(() => {
        if (selectedOnPage.length === allAssetIds.length) {
            dispatch(clearSelection());
        } else {
            dispatch(selectAllAssets(allAssetIds));
        }
    }, [dispatch, selectedOnPage.length, allAssetIds]);

    const handleApprove = useCallback(async () => {
        if (selectedOnPage.length === 0) return;
        const result = await dispatch(approveAssets({ assetIds: selectedOnPage }));
        if (approveAssets.fulfilled.match(result)) {
            dispatch(clearSelection());
            onRefresh();
        }
    }, [dispatch, selectedOnPage, onRefresh]);

    const handleDiscard = useCallback(async () => {
        if (selectedOnPage.length === 0) return;
        const result = await dispatch(discardAssets({ assetIds: selectedOnPage }));
        if (discardAssets.fulfilled.match(result)) {
            dispatch(clearSelection());
            onRefresh();
        }
    }, [dispatch, selectedOnPage, onRefresh]);

    const handleOpenRejectDialog = useCallback((asset: IngestAssetResponse) => {
        setRejectingAsset(asset);
        setRejectDialogOpen(true);
    }, []);

    const handleCloseRejectDialog = useCallback(() => {
        setRejectDialogOpen(false);
        setRejectingAsset(null);
    }, []);

    const handleRejectComplete = useCallback(() => {
        setRejectDialogOpen(false);
        setRejectingAsset(null);
        dispatch(clearSelection());
        onRefresh();
    }, [dispatch, onRefresh]);

    const handleOpenBatchRejectDialog = useCallback(() => {
        setBatchRejectDialogOpen(true);
    }, []);

    const handleCloseBatchRejectDialog = useCallback(() => {
        setBatchRejectDialogOpen(false);
    }, []);

    const handleBatchRejectComplete = useCallback(() => {
        setBatchRejectDialogOpen(false);
        dispatch(clearSelection());
        onRefresh();
    }, [dispatch, onRefresh]);

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
                    No assets are pending review
                </Typography>
            </Box>
        );
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                    {selectedOnPage.length} of {assets.length} items selected
                </Typography>
                <ButtonGroup variant="outlined" size="small" disabled={selectedOnPage.length === 0 || isSubmitting}>
                    <Button
                        startIcon={<CheckIcon />}
                        onClick={handleApprove}
                        color="success"
                    >
                        Approve
                    </Button>
                    <Button
                        startIcon={<CloseIcon />}
                        onClick={handleOpenBatchRejectDialog}
                        color="warning"
                    >
                        Reject
                    </Button>
                    <Button
                        startIcon={<DeleteIcon />}
                        onClick={handleDiscard}
                        color="error"
                    >
                        Discard
                    </Button>
                </ButtonGroup>
            </Box>

            <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell padding="checkbox">
                                <Checkbox
                                    indeterminate={selectedOnPage.length > 0 && selectedOnPage.length < allAssetIds.length}
                                    checked={allAssetIds.length > 0 && selectedOnPage.length === allAssetIds.length}
                                    onChange={handleSelectAll}
                                />
                            </TableCell>
                            <TableCell>Portrait</TableCell>
                            <TableCell>Token</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>Category</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {assets.map((asset) => {
                            const isSelected = selectedAssetIds.includes(asset.id);

                            return (
                                <TableRow
                                    key={asset.id}
                                    hover
                                    selected={isSelected}
                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                >
                                    <TableCell padding="checkbox">
                                        <Checkbox
                                            checked={isSelected}
                                            onChange={() => handleToggleSelect(asset.id)}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {asset.portrait ? (
                                            <Avatar
                                                src={asset.portrait.path}
                                                variant="rounded"
                                                sx={{ width: 48, height: 48 }}
                                            />
                                        ) : (
                                            <Avatar variant="rounded" sx={{ width: 48, height: 48, bgcolor: 'grey.300' }}>
                                                ?
                                            </Avatar>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {asset.tokens && asset.tokens[0] ? (
                                            <Avatar
                                                src={asset.tokens[0].path}
                                                variant="circular"
                                                sx={{ width: 48, height: 48 }}
                                            />
                                        ) : (
                                            <Avatar variant="circular" sx={{ width: 48, height: 48, bgcolor: 'grey.300' }}>
                                                ?
                                            </Avatar>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" fontWeight="medium">
                                            {asset.name}
                                        </Typography>
                                        {asset.description && (
                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                                {asset.description.substring(0, 100)}
                                                {asset.description.length > 100 ? '...' : ''}
                                            </Typography>
                                        )}
                                    </TableCell>
                                    <TableCell>{asset.category}</TableCell>
                                    <TableCell>{asset.type}</TableCell>
                                    <TableCell align="right">
                                        <Button
                                            startIcon={<CloseIcon />}
                                            onClick={() => handleOpenRejectDialog(asset)}
                                            size="small"
                                            color="warning"
                                            disabled={isSubmitting}
                                        >
                                            Reject
                                        </Button>
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

            <RejectDialog
                open={rejectDialogOpen}
                asset={rejectingAsset}
                onClose={handleCloseRejectDialog}
                onComplete={handleRejectComplete}
            />

            <BatchRejectDialog
                open={batchRejectDialogOpen}
                assetIds={selectedOnPage}
                assetCount={selectedOnPage.length}
                onClose={handleCloseBatchRejectDialog}
                onComplete={handleBatchRejectComplete}
            />
        </Box>
    );
}
