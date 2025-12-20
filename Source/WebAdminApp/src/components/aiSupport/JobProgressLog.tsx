import { useEffect, useRef, useMemo, useState, useCallback } from 'react';
import {
    Paper,
    Typography,
    List,
    ListItemButton,
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
import { JobItemDetailsDialog } from './JobItemDetailsDialog';

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
    const [selectedItem, setSelectedItem] = useState<JobProgressItem | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);

    const handleItemClick = useCallback((item: JobProgressItem) => {
        setSelectedItem(item);
        setDialogOpen(true);
    }, []);

    const handleCloseDialog = useCallback(() => {
        setDialogOpen(false);
        setSelectedItem(null);
    }, []);

    const stats = useMemo(() => {
        const success = itemUpdates.filter(u => u.status === JobItemStatus.Success).length;
        const failed = itemUpdates.filter(u => u.status === JobItemStatus.Failed).length;
        const inProgress = itemUpdates.filter(u => u.status === JobItemStatus.InProgress).length;
        const pending = itemUpdates.filter(u => u.status === JobItemStatus.Pending).length;
        const completed = success + failed;
        const progress = totalItems > 0 ? (completed / totalItems) * 100 : 0;
        return { success, failed, inProgress, pending, completed, progress };
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
                    No items to display. Start a job to see progress.
                </Typography>
            </Paper>
        );
    }

    return (
        <Paper sx={{ overflow: 'hidden' }}>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="h6">Progress Log</Typography>
                <Box sx={{ display: 'flex', gap: 2, mt: 1, mb: 1, flexWrap: 'wrap' }}>
                    <Chip label={`${stats.pending} Pending`} color="default" size="small" variant="outlined" />
                    <Chip label={`${stats.inProgress} In Progress`} color="primary" size="small" variant="outlined" />
                    <Chip label={`${stats.success} Success`} color="success" size="small" variant="outlined" />
                    <Chip label={`${stats.failed} Failed`} color="error" size="small" variant="outlined" />
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
                    '& .MuiListItemButton-root': {
                        borderBottom: 1,
                        borderColor: 'divider',
                    },
                }}
            >
                {itemUpdates.map((update) => (
                    <ListItemButton
                        key={`${update.jobId}-${update.index}`}
                        onClick={() => handleItemClick(update)}
                        sx={{ py: 1 }}
                    >
                        <ListItemIcon sx={{ minWidth: 40 }}>
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
                        />
                    </ListItemButton>
                ))}
                <div ref={listEndRef} />
            </List>

            <JobItemDetailsDialog
                item={selectedItem}
                open={dialogOpen}
                onClose={handleCloseDialog}
            />
        </Paper>
    );
}
