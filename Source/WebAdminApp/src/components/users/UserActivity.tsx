import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Typography,
    List,
    ListItem,
    Button,
    CircularProgress,
    Divider,
    Chip,
} from '@mui/material';
import {
    CheckCircle as SuccessIcon,
    Error as ErrorIcon,
    Warning as WarningIcon,
    Refresh as RefreshIcon,
} from '@mui/icons-material';
import { userService, AuditLogSummary } from '@services/userService';

interface UserActivityProps {
    userId: string;
}

export const UserActivity: React.FC<UserActivityProps> = ({ userId }) => {
    const [logs, setLogs] = useState<AuditLogSummary[]>([]);
    const [loading, setLoading] = useState(false);
    const [skip, setSkip] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [totalCount, setTotalCount] = useState(0);

    const TAKE = 20;

    const loadAuditLogs = useCallback(async (reset: boolean = false, currentSkip?: number) => {
        setLoading(true);
        try {
            const skipValue = currentSkip !== undefined ? currentSkip : (reset ? 0 : skip);
            const response = await userService.getUserAuditTrail(userId, {
                skip: skipValue,
                take: TAKE,
            });

            if (reset) {
                setLogs(response.logs);
                setSkip(TAKE);
            } else {
                setLogs(prev => [...prev, ...response.logs]);
                setSkip(skipValue + TAKE);
            }

            setHasMore(response.logs.length === TAKE && skipValue + TAKE < response.totalCount);
            setTotalCount(response.totalCount);
        } catch (error) {
            console.error('Failed to load audit logs:', error);
        } finally {
            setLoading(false);
        }
    }, [userId, skip]);

    useEffect(() => {
        loadAuditLogs(true, 0);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId]);

    const handleLoadMore = () => {
        if (!loading && hasMore) {
            loadAuditLogs(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString();
    };

    const getResultIcon = (result: string) => {
        switch (result.toLowerCase()) {
            case 'success':
                return <SuccessIcon sx={{ color: 'success.main', fontSize: 20 }} />;
            case 'failure':
            case 'error':
                return <ErrorIcon sx={{ color: 'error.main', fontSize: 20 }} />;
            default:
                return <WarningIcon sx={{ color: 'warning.main', fontSize: 20 }} />;
        }
    };

    const getResultColor = (result: string): 'success' | 'error' | 'warning' => {
        switch (result.toLowerCase()) {
            case 'success':
                return 'success';
            case 'failure':
            case 'error':
                return 'error';
            default:
                return 'warning';
        }
    };

    if (loading && logs.length === 0) {
        return (
            <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
            </Box>
        );
    }

    if (logs.length === 0) {
        return (
            <Box textAlign="center" p={4}>
                <Typography variant="body2" color="textSecondary">
                    No activity recorded for this user
                </Typography>
                <Button
                    startIcon={<RefreshIcon />}
                    onClick={() => loadAuditLogs(true)}
                    sx={{ mt: 2 }}
                >
                    Refresh
                </Button>
            </Box>
        );
    }

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="subtitle2">
                    Activity History ({totalCount} total entries)
                </Typography>
                <Button
                    size="small"
                    startIcon={<RefreshIcon />}
                    onClick={() => loadAuditLogs(true)}
                    disabled={loading}
                >
                    Refresh
                </Button>
            </Box>

            <List sx={{ maxHeight: 500, overflow: 'auto' }}>
                {logs.map((log, index) => (
                    <React.Fragment key={log.id}>
                        <ListItem
                            alignItems="flex-start"
                            sx={{
                                '&:hover': {
                                    bgcolor: 'action.hover',
                                },
                            }}
                        >
                            <Box display="flex" alignItems="flex-start" width="100%" gap={2}>
                                <Box mt={0.5}>
                                    {getResultIcon(log.result)}
                                </Box>
                                <Box flex={1}>
                                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={0.5}>
                                        <Typography variant="body2" fontWeight="medium">
                                            {log.action}
                                        </Typography>
                                        <Chip
                                            label={log.result}
                                            color={getResultColor(log.result)}
                                            size="small"
                                        />
                                    </Box>
                                    <Typography variant="caption" color="textSecondary" display="block">
                                        {formatDate(log.timestamp)}
                                    </Typography>
                                    {log.entityType && (
                                        <Typography variant="caption" color="textSecondary" display="block">
                                            Entity: {log.entityType}
                                            {log.entityId && ` (${log.entityId})`}
                                        </Typography>
                                    )}
                                    <Box display="flex" gap={1} mt={0.5}>
                                        {log.ipAddress && (
                                            <Chip
                                                label={`IP: ${log.ipAddress}`}
                                                size="small"
                                                variant="outlined"
                                            />
                                        )}
                                        <Chip
                                            label={`${log.durationInMilliseconds}ms`}
                                            size="small"
                                            variant="outlined"
                                        />
                                    </Box>
                                </Box>
                            </Box>
                        </ListItem>
                        {index < logs.length - 1 && <Divider variant="inset" component="li" />}
                    </React.Fragment>
                ))}
            </List>

            {hasMore && (
                <Box textAlign="center" mt={2}>
                    <Button
                        variant="outlined"
                        onClick={handleLoadMore}
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} /> : undefined}
                    >
                        {loading ? 'Loading...' : `Load More (${totalCount - logs.length} remaining)`}
                    </Button>
                </Box>
            )}
        </Box>
    );
};
