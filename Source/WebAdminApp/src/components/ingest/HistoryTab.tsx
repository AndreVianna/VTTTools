import React from 'react';
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
    Avatar,
    CircularProgress,
} from '@mui/material';
import type { IngestAssetResponse } from '@/types/ingest';
import { IngestStatus } from '@/types/ingest';

interface HistoryTabProps {
    assets: IngestAssetResponse[];
    totalCount: number;
    page: number;
    rowsPerPage: number;
    isLoading: boolean;
    onPageChange: (page: number) => void;
}

function getStatusColor(status: IngestStatus): 'default' | 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success' {
    switch (status) {
        case IngestStatus.Approved:
            return 'success';
        case IngestStatus.Discarded:
            return 'error';
        default:
            return 'default';
    }
}

function getStatusLabel(status: IngestStatus): string {
    switch (status) {
        case IngestStatus.Approved:
            return 'Approved';
        case IngestStatus.Discarded:
            return 'Discarded';
        default:
            return status;
    }
}

export function HistoryTab({
    assets,
    totalCount,
    page,
    rowsPerPage,
    isLoading,
    onPageChange,
}: HistoryTabProps) {
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
                    No history items yet
                </Typography>
            </Box>
        );
    }

    return (
        <Box>
            <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Portrait</TableCell>
                            <TableCell>Token</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>Category</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell>Status</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {assets.map((asset) => (
                            <TableRow
                                key={asset.id}
                                sx={{
                                    '&:last-child td, &:last-child th': { border: 0 },
                                    opacity: asset.ingestStatus === IngestStatus.Discarded ? 0.6 : 1,
                                }}
                            >
                                <TableCell>
                                    {asset.portrait ? (
                                        <Avatar
                                            src={asset.portrait.path}
                                            variant="rounded"
                                            sx={{ width: 40, height: 40 }}
                                        />
                                    ) : (
                                        <Avatar variant="rounded" sx={{ width: 40, height: 40, bgcolor: 'grey.300' }}>
                                            -
                                        </Avatar>
                                    )}
                                </TableCell>
                                <TableCell>
                                    {asset.tokens && asset.tokens[0] ? (
                                        <Avatar
                                            src={asset.tokens[0].path}
                                            variant="circular"
                                            sx={{ width: 40, height: 40 }}
                                        />
                                    ) : (
                                        <Avatar variant="circular" sx={{ width: 40, height: 40, bgcolor: 'grey.300' }}>
                                            -
                                        </Avatar>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2" fontWeight="medium">
                                        {asset.name}
                                    </Typography>
                                </TableCell>
                                <TableCell>{asset.category}</TableCell>
                                <TableCell>{asset.type}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={getStatusLabel(asset.ingestStatus)}
                                        color={getStatusColor(asset.ingestStatus)}
                                        size="small"
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
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
