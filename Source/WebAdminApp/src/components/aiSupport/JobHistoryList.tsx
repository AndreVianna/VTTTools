import {
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Chip,
    IconButton,
    Tooltip,
    Box,
    CircularProgress,
    Alert,
} from '@mui/material';
import {
    Visibility as ViewIcon,
    Cancel as CancelIcon,
    Refresh as RefreshIcon,
} from '@mui/icons-material';
import type { JobResponse } from '@/types/jobs';
import { JobStatus } from '@/types/jobs';

interface JobHistoryListProps {
    jobs: JobResponse[];
    totalCount: number;
    page: number;
    rowsPerPage: number;
    isLoading?: boolean;
    error?: string | null;
    onPageChange: (page: number) => void;
    onRowsPerPageChange: (rowsPerPage: number) => void;
    onViewJob?: (jobId: string) => void;
    onCancelJob?: (jobId: string) => void;
    onRetryJob?: (jobId: string) => void;
}

export function JobHistoryList({
    jobs,
    totalCount,
    page,
    rowsPerPage,
    isLoading = false,
    error = null,
    onPageChange,
    onRowsPerPageChange,
    onViewJob,
    onCancelJob,
    onRetryJob,
}: JobHistoryListProps) {
    const getStatusColor = (status: JobStatus): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
        switch (status) {
            case JobStatus.Pending:
                return 'default';
            case JobStatus.InProgress:
                return 'primary';
            case JobStatus.Completed:
                return 'success';
            case JobStatus.Failed:
                return 'error';
            case JobStatus.PartialSuccess:
                return 'warning';
            case JobStatus.Cancelled:
                return 'default';
            default:
                return 'default';
        }
    };

    const getStatusLabel = (status: JobStatus): string => {
        switch (status) {
            case JobStatus.InProgress:
                return 'In Progress';
            case JobStatus.PartialSuccess:
                return 'Partial';
            default:
                return status;
        }
    };

    const getJobTypeLabel = (jobType: string): string => {
        switch (jobType) {
            case 'BulkAssetPortraitGeneration':
                return 'Portraits';
            case 'BulkAssetTokenGeneration':
                return 'Tokens';
            default:
                return jobType;
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleString();
    };

    const formatDuration = (ms?: number) => {
        if (!ms) return '-';
        if (ms < 1000) return `${ms}ms`;
        if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
        return `${(ms / 60000).toFixed(1)}m`;
    };

    const handleChangePage = (_: unknown, newPage: number) => {
        onPageChange(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        onRowsPerPageChange(parseInt(event.target.value, 10));
    };

    if (error) {
        return (
            <Alert severity="error" sx={{ mb: 2 }}>
                {error}
            </Alert>
        );
    }

    return (
        <Paper>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="h6">Job History</Typography>
            </Box>
            <TableContainer>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Type</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align="right">Progress</TableCell>
                            <TableCell>Created</TableCell>
                            <TableCell>Duration</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                                    <CircularProgress size={24} />
                                </TableCell>
                            </TableRow>
                        ) : jobs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        No jobs found
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            jobs.map((job) => {
                                const canCancel = job.status === JobStatus.Pending || job.status === JobStatus.InProgress;
                                const canRetry = job.status === JobStatus.Failed || job.status === JobStatus.PartialSuccess;

                                return (
                                    <TableRow key={job.jobId} hover>
                                        <TableCell>{getJobTypeLabel(job.jobType)}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={getStatusLabel(job.status)}
                                                color={getStatusColor(job.status)}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell align="right">
                                            <Typography variant="body2">
                                                {job.completedItems}/{job.totalItems}
                                            </Typography>
                                            {job.failedItems > 0 && (
                                                <Typography variant="caption" color="error">
                                                    ({job.failedItems} failed)
                                                </Typography>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" noWrap>
                                                {formatDate(job.createdAt)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>{formatDuration(job.actualDurationMs)}</TableCell>
                                        <TableCell align="right">
                                            {onViewJob && (
                                                <Tooltip title="View Details">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => onViewJob(job.jobId)}
                                                    >
                                                        <ViewIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                            {canCancel && onCancelJob && (
                                                <Tooltip title="Cancel">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => onCancelJob(job.jobId)}
                                                        color="error"
                                                    >
                                                        <CancelIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                            {canRetry && onRetryJob && (
                                                <Tooltip title="Retry Failed">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => onRetryJob(job.jobId)}
                                                        color="primary"
                                                    >
                                                        <RefreshIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                component="div"
                count={totalCount}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[10, 20, 50]}
            />
        </Paper>
    );
}
