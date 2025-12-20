import { useMemo } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Chip,
    Stack,
    IconButton,
    Table,
    TableBody,
    TableRow,
    TableCell,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import type { JobProgressItem } from '@/types/jobs';
import { JobItemStatus } from '@/types/jobs';

interface JobItemDetailsDialogProps {
    item: JobProgressItem | null;
    open: boolean;
    onClose: () => void;
}

interface ParsedResult {
    isJson: boolean;
    data: Record<string, unknown> | null;
    rawText: string;
}

function parseResult(result: string): ParsedResult {
    try {
        const parsed = JSON.parse(result) as unknown;
        if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
            return { isJson: true, data: parsed as Record<string, unknown>, rawText: result };
        }
        return { isJson: false, data: null, rawText: result };
    } catch {
        return { isJson: false, data: null, rawText: result };
    }
}

function formatValue(value: unknown): string {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    return String(value);
}

function formatKey(key: string): string {
    return key
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (str) => str.toUpperCase())
        .trim();
}

export function JobItemDetailsDialog({ item, open, onClose }: JobItemDetailsDialogProps) {
    const parsedResult = useMemo(() => {
        if (!item?.result) return null;
        return parseResult(item.result);
    }, [item?.result]);

    if (!item) return null;

    const getStatusColor = (status: JobItemStatus): 'default' | 'primary' | 'success' | 'error' | 'warning' => {
        switch (status) {
            case JobItemStatus.Pending:
                return 'default';
            case JobItemStatus.InProgress:
                return 'primary';
            case JobItemStatus.Success:
                return 'success';
            case JobItemStatus.Failed:
                return 'error';
            case JobItemStatus.Canceled:
                return 'warning';
            default:
                return 'default';
        }
    };

    const formatDateTime = (dateString?: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleString();
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            id="dialog-job-item-details"
        >
            <DialogTitle>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="h6">Item {item.index + 1}</Typography>
                        <Chip
                            label={item.status}
                            color={getStatusColor(item.status)}
                            size="small"
                        />
                    </Stack>
                    <IconButton
                        id="btn-close-item-details"
                        onClick={onClose}
                        size="small"
                        aria-label="Close"
                    >
                        <CloseIcon />
                    </IconButton>
                </Stack>
            </DialogTitle>

            <DialogContent dividers>
                <Stack spacing={2}>
                    <Box>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Status
                        </Typography>
                        <Chip
                            label={item.status}
                            color={getStatusColor(item.status)}
                            size="small"
                        />
                    </Box>

                    <Box>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Started At
                        </Typography>
                        <Typography variant="body2">
                            {formatDateTime(item.startedAt)}
                        </Typography>
                    </Box>

                    <Box>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Completed At
                        </Typography>
                        <Typography variant="body2">
                            {formatDateTime(item.completedAt)}
                        </Typography>
                    </Box>

                    {parsedResult && (
                        <Box>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Result
                            </Typography>
                            {parsedResult.isJson && parsedResult.data ? (
                                <Table size="small" sx={{ bgcolor: 'action.hover', borderRadius: 1 }}>
                                    <TableBody>
                                        {Object.entries(parsedResult.data).map(([key, value]) => (
                                            <TableRow key={key} sx={{ '&:last-child td': { borderBottom: 0 } }}>
                                                <TableCell
                                                    component="th"
                                                    scope="row"
                                                    sx={{
                                                        fontWeight: 500,
                                                        color: 'text.secondary',
                                                        width: '40%',
                                                        verticalAlign: 'top',
                                                    }}
                                                >
                                                    {formatKey(key)}
                                                </TableCell>
                                                <TableCell
                                                    sx={{
                                                        wordBreak: 'break-word',
                                                        whiteSpace: 'pre-wrap',
                                                    }}
                                                >
                                                    {formatValue(value)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <Typography
                                    variant="body2"
                                    color={item.status === JobItemStatus.Failed ? 'error' : 'text.primary'}
                                    sx={{
                                        whiteSpace: 'pre-wrap',
                                        wordBreak: 'break-word',
                                        bgcolor: 'action.hover',
                                        p: 1.5,
                                        borderRadius: 1,
                                    }}
                                >
                                    {parsedResult.rawText}
                                </Typography>
                            )}
                        </Box>
                    )}
                </Stack>
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button id="btn-close-details" onClick={onClose}>
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
}
