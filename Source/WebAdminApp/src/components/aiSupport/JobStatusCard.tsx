import {
    Paper,
    Typography,
    Chip,
    Stack,
    LinearProgress,
    Box,
    IconButton,
    Tooltip,
} from '@mui/material';
import {
    Cancel as CancelIcon,
    Refresh as RefreshIcon,
} from '@mui/icons-material';
import type { JobResponse } from '@/types/jobs';
import { JobStatus } from '@/types/jobs';

interface JobStatusCardProps {
    job: JobResponse;
    onCancel?: (jobId: string) => void;
    onRetry?: (jobId: string) => void;
    onViewDetails?: (jobId: string) => void;
    compact?: boolean;
}

export function JobStatusCard({
    job,
    onCancel,
    onRetry,
    onViewDetails,
    compact = false,
}: JobStatusCardProps) {
    const getStatusColor = (status: JobStatus): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
        switch (status) {
            case JobStatus.Pending:
                return 'default';
            case JobStatus.InProgress:
                return 'primary';
            case JobStatus.Completed:
                return job.failedItems > 0 ? 'warning' : 'success';
            case JobStatus.Canceled:
                return 'default';
            default:
                return 'default';
        }
    };

    const getStatusLabel = (status: JobStatus): string => {
        switch (status) {
            case JobStatus.InProgress:
                return 'In Progress';
            default:
                return status;
        }
    };

    const getJobTypeLabel = (jobType: string): string => {
        switch (jobType) {
            case 'BulkAssetPortraitGeneration':
                return 'Portrait Generation';
            case 'BulkAssetTokenGeneration':
                return 'Token Generation';
            default:
                return jobType;
        }
    };

    const progress = job.totalItems > 0
        ? ((job.completedItems + job.failedItems) / job.totalItems) * 100
        : 0;

    const canCancel = job.status === JobStatus.Pending || job.status === JobStatus.InProgress;
    const canRetry = job.status === JobStatus.Completed && job.failedItems > 0;

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

    if (compact) {
        return (
            <Paper
                sx={{
                    p: 2,
                    cursor: onViewDetails ? 'pointer' : 'default',
                    '&:hover': onViewDetails ? { bgcolor: 'action.hover' } : {},
                }}
                onClick={() => onViewDetails?.(job.jobId)}
            >
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="subtitle2" noWrap>
                            {getJobTypeLabel(job.jobType)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {job.completedItems}/{job.totalItems} items
                            {job.failedItems > 0 && ` (${job.failedItems} failed)`}
                        </Typography>
                    </Box>
                    <Chip
                        label={getStatusLabel(job.status)}
                        color={getStatusColor(job.status)}
                        size="small"
                    />
                </Stack>
                {job.status === JobStatus.InProgress && (
                    <LinearProgress
                        variant="determinate"
                        value={progress}
                        sx={{ mt: 1 }}
                    />
                )}
            </Paper>
        );
    }

    return (
        <Paper sx={{ p: 3 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
                <Box>
                    <Typography variant="h6">
                        {getJobTypeLabel(job.jobType)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        ID: {job.jobId}
                    </Typography>
                </Box>
                <Stack direction="row" spacing={1} alignItems="center">
                    <Chip
                        label={getStatusLabel(job.status)}
                        color={getStatusColor(job.status)}
                    />
                    {canCancel && onCancel && (
                        <Tooltip title="Cancel Job">
                            <IconButton
                                size="small"
                                onClick={() => onCancel(job.jobId)}
                                color="error"
                            >
                                <CancelIcon />
                            </IconButton>
                        </Tooltip>
                    )}
                    {canRetry && onRetry && (
                        <Tooltip title="Retry Failed Items">
                            <IconButton
                                size="small"
                                onClick={() => onRetry(job.jobId)}
                                color="primary"
                            >
                                <RefreshIcon />
                            </IconButton>
                        </Tooltip>
                    )}
                </Stack>
            </Stack>

            <Box mb={2}>
                <Stack direction="row" justifyContent="space-between" mb={0.5}>
                    <Typography variant="body2">Progress</Typography>
                    <Typography variant="body2">
                        {job.completedItems + job.failedItems}/{job.totalItems}
                    </Typography>
                </Stack>
                <LinearProgress
                    variant="determinate"
                    value={progress}
                    color={job.failedItems > 0 ? 'warning' : 'primary'}
                />
                <Stack direction="row" spacing={2} mt={1}>
                    <Typography variant="caption" color="success.main">
                        Completed: {job.completedItems}
                    </Typography>
                    {job.failedItems > 0 && (
                        <Typography variant="caption" color="error.main">
                            Failed: {job.failedItems}
                        </Typography>
                    )}
                </Stack>
            </Box>

            <Stack spacing={1}>
                <Stack direction="row" justifyContent="space-between">
                    <Typography variant="caption" color="text.secondary">Created:</Typography>
                    <Typography variant="caption">{formatDate(job.createdAt)}</Typography>
                </Stack>
                {job.startedAt && (
                    <Stack direction="row" justifyContent="space-between">
                        <Typography variant="caption" color="text.secondary">Started:</Typography>
                        <Typography variant="caption">{formatDate(job.startedAt)}</Typography>
                    </Stack>
                )}
                {job.completedAt && (
                    <Stack direction="row" justifyContent="space-between">
                        <Typography variant="caption" color="text.secondary">Completed:</Typography>
                        <Typography variant="caption">{formatDate(job.completedAt)}</Typography>
                    </Stack>
                )}
                {job.actualDurationMs && (
                    <Stack direction="row" justifyContent="space-between">
                        <Typography variant="caption" color="text.secondary">Duration:</Typography>
                        <Typography variant="caption">{formatDuration(job.actualDurationMs)}</Typography>
                    </Stack>
                )}
            </Stack>
        </Paper>
    );
}
