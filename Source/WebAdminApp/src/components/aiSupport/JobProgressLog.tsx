import { useEffect, useRef, useMemo } from 'react';
import {
    Paper,
    Typography,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Box,
    Chip,
    LinearProgress,
} from '@mui/material';
import {
    CheckCircle as CheckIcon,
    Error as ErrorIcon,
    HourglassEmpty as PendingIcon,
    Settings as InProgressIcon,
    Cancel as CanceledIcon,
} from '@mui/icons-material';
import type { JobProgressItem } from '@/types/jobs';
import { JobItemStatus } from '@/types/jobs';

interface JobProgressLogProps {
    itemUpdates: JobProgressItem[];
    totalItems: number;
    maxHeight?: number;
    autoScroll?: boolean;
}

export function JobProgressLog({
    itemUpdates,
    totalItems,
    maxHeight = 400,
    autoScroll = true,
}: JobProgressLogProps) {
    const listEndRef = useRef<HTMLDivElement>(null);

    const stats = useMemo(() => {
        const success = itemUpdates.filter(u => u.status === JobItemStatus.Success).length;
        const failed = itemUpdates.filter(u => u.status === JobItemStatus.Failed).length;
        const inProgress = itemUpdates.filter(u => u.status === JobItemStatus.InProgress).length;
        const completed = success + failed;
        const progress = totalItems > 0 ? (completed / totalItems) * 100 : 0;
        return { success, failed, inProgress, completed, progress };
    }, [itemUpdates, totalItems]);

    useEffect(() => {
        if (autoScroll && listEndRef.current) {
            listEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [itemUpdates, autoScroll]);

    const getStatusIcon = (status: JobItemStatus) => {
        switch (status) {
            case JobItemStatus.Pending:
                return <PendingIcon color="disabled" />;
            case JobItemStatus.InProgress:
                return <InProgressIcon color="primary" />;
            case JobItemStatus.Success:
                return <CheckIcon color="success" />;
            case JobItemStatus.Failed:
                return <ErrorIcon color="error" />;
            case JobItemStatus.Canceled:
                return <CanceledIcon color="warning" />;
            default:
                return <PendingIcon color="disabled" />;
        }
    };

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

    if (itemUpdates.length === 0) {
        return (
            <Paper sx={{ p: 3 }}>
                <Typography variant="body2" color="text.secondary" textAlign="center">
                    No progress events yet. Events will appear here as the job runs.
                </Typography>
            </Paper>
        );
    }

    return (
        <Paper sx={{ overflow: 'hidden' }}>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="h6">Progress Log</Typography>
                <Box sx={{ display: 'flex', gap: 2, mt: 1, mb: 1 }}>
                    <Chip label={`${stats.success} Success`} color="success" size="small" variant="outlined" />
                    <Chip label={`${stats.failed} Failed`} color="error" size="small" variant="outlined" />
                    <Chip label={`${stats.inProgress} In Progress`} color="primary" size="small" variant="outlined" />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LinearProgress
                        variant="determinate"
                        value={stats.progress}
                        sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                        {stats.completed}/{totalItems}
                    </Typography>
                </Box>
            </Box>
            <List
                sx={{
                    maxHeight,
                    overflow: 'auto',
                    '& .MuiListItem-root': {
                        borderBottom: 1,
                        borderColor: 'divider',
                    },
                }}
            >
                {itemUpdates.map((update) => (
                    <ListItem key={`${update.jobId}-${update.index}`} alignItems="flex-start">
                        <ListItemIcon sx={{ minWidth: 40, mt: 1 }}>
                            {getStatusIcon(update.status)}
                        </ListItemIcon>
                        <ListItemText
                            primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography variant="body2" component="span">
                                        Item {update.index + 1}
                                    </Typography>
                                    <Chip
                                        label={update.status}
                                        color={getStatusColor(update.status)}
                                        size="small"
                                        variant="outlined"
                                    />
                                </Box>
                            }
                            secondary={
                                <Box component="span">
                                    {update.message && (
                                        <Typography
                                            variant="caption"
                                            color={update.status === JobItemStatus.Failed ? 'error' : 'text.secondary'}
                                            component="span"
                                            sx={{ display: 'block' }}
                                        >
                                            {update.message}
                                        </Typography>
                                    )}
                                </Box>
                            }
                        />
                    </ListItem>
                ))}
                <div ref={listEndRef} />
            </List>
        </Paper>
    );
}
