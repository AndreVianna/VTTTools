import { useEffect, useRef } from 'react';
import {
    Paper,
    Typography,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Box,
    Chip,
} from '@mui/material';
import {
    CheckCircle as CheckIcon,
    Error as ErrorIcon,
    HourglassEmpty as PendingIcon,
    Settings as InProgressIcon,
    Cancel as CanceledIcon,
} from '@mui/icons-material';
import type { JobProgressEvent } from '@/types/jobs';
import { JobItemStatus } from '@/types/jobs';

interface JobProgressLogProps {
    events: JobProgressEvent[];
    maxHeight?: number;
    autoScroll?: boolean;
}

export function JobProgressLog({
    events,
    maxHeight = 400,
    autoScroll = true,
}: JobProgressLogProps) {
    const listEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (autoScroll && listEndRef.current) {
            listEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [events, autoScroll]);

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

    if (events.length === 0) {
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
                <Typography variant="caption" color="text.secondary">
                    {events.length} events
                </Typography>
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
                {events.map((event, index) => (
                    <ListItem key={`${event.jobId}-${event.itemIndex}-${index}`} alignItems="flex-start">
                        <ListItemIcon sx={{ minWidth: 40, mt: 1 }}>
                            {getStatusIcon(event.itemStatus)}
                        </ListItemIcon>
                        <ListItemText
                            primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography variant="body2" component="span">
                                        {event.message}
                                    </Typography>
                                    <Chip
                                        label={event.itemStatus}
                                        color={getStatusColor(event.itemStatus)}
                                        size="small"
                                        variant="outlined"
                                    />
                                </Box>
                            }
                            secondary={
                                <Box component="span">
                                    {event.itemName && (
                                        <Typography variant="caption" color="text.secondary" component="span">
                                            Item: {event.itemName}
                                        </Typography>
                                    )}
                                    {event.errorMessage && (
                                        <Typography
                                            variant="caption"
                                            color="error"
                                            component="div"
                                            sx={{ mt: 0.5 }}
                                        >
                                            Error: {event.errorMessage}
                                        </Typography>
                                    )}
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        component="div"
                                    >
                                        Progress: {event.currentItem}/{event.totalItems}
                                    </Typography>
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
