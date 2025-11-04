import { useState, useEffect } from 'react';
import {
    Paper,
    Typography,
    Box,
    List,
    ListItem,
    Stack,
    Chip,
    Button,
    Skeleton,
    useTheme,
} from '@mui/material';
import {
    Login as LoginIcon,
    Add as AddIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import dayjs from 'dayjs';
import { auditLogService, type AuditLog } from '@services/auditLogService';
import { useNavigate } from 'react-router-dom';

export function RecentActivityFeed() {
    const theme = useTheme();
    const navigate = useNavigate();
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadRecentActivity = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await auditLogService.queryAuditLogs({
                skip: 0,
                take: 10,
            });
            setLogs(response.items);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load recent activity');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRecentActivity();

        const interval = setInterval(() => {
            loadRecentActivity();
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    const getActionIcon = (httpMethod: string) => {
        switch (httpMethod.toUpperCase()) {
            case 'POST':
                return <AddIcon fontSize="small" color="primary" />;
            case 'DELETE':
                return <DeleteIcon fontSize="small" color="error" />;
            case 'PUT':
            case 'PATCH':
                return <EditIcon fontSize="small" color="info" />;
            default:
                return <LoginIcon fontSize="small" color="action" />;
        }
    };

    const getResultColor = (result: string): 'success' | 'warning' | 'error' | 'default' => {
        switch (result.toLowerCase()) {
            case 'success':
                return 'success';
            case 'failure':
                return 'warning';
            case 'error':
                return 'error';
            default:
                return 'default';
        }
    };

    return (
        <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Recent Activity</Typography>
                <Button
                    variant="outlined"
                    size="small"
                    endIcon={<ArrowForwardIcon />}
                    onClick={() => navigate('/audit-logs')}
                >
                    View All
                </Button>
            </Box>

            {loading && logs.length === 0 ? (
                <Stack spacing={1}>
                    {[1, 2, 3, 4, 5].map((i) => (
                        <Skeleton key={i} variant="rectangular" height={60} />
                    ))}
                </Stack>
            ) : error ? (
                <Typography variant="body2" color="error">
                    {error}
                </Typography>
            ) : logs.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                    No recent activity
                </Typography>
            ) : (
                <List sx={{ p: 0 }}>
                    {logs.map((log, index) => (
                        <ListItem
                            key={log.id}
                            sx={{
                                p: 2,
                                borderBottom:
                                    index < logs.length - 1
                                        ? `1px solid ${theme.palette.divider}`
                                        : 'none',
                                '&:hover': {
                                    backgroundColor: theme.palette.action.hover,
                                },
                            }}
                        >
                            <Stack direction="row" alignItems="center" spacing={2} sx={{ width: '100%' }}>
                                <Box sx={{ minWidth: 24 }}>
                                    {getActionIcon(log.httpMethod)}
                                </Box>
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            fontWeight: 500,
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        {log.userEmail || 'Anonymous'} {log.httpMethod} {log.path}
                                    </Typography>
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <Typography variant="caption" color="text.secondary">
                                            {dayjs(log.timestamp).format('MMM DD, HH:mm:ss')}
                                        </Typography>
                                        <Chip
                                            label={log.result}
                                            color={getResultColor(log.result)}
                                            size="small"
                                            sx={{ height: 20 }}
                                        />
                                        <Typography variant="caption" color="text.secondary">
                                            {log.durationInMilliseconds}ms
                                        </Typography>
                                    </Stack>
                                </Box>
                            </Stack>
                        </ListItem>
                    ))}
                </List>
            )}
        </Paper>
    );
}
