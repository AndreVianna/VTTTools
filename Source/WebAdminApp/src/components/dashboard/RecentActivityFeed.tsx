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
    Work as JobIcon,
    AutoAwesome as GeneratedIcon,
    Visibility as ViewIcon,
} from '@mui/icons-material';
import dayjs from 'dayjs';
import {
    auditLogService,
    type AuditLog,
    isHttpAction,
    isJobAction,
    isViaJobAction,
    parsePayload,
    HttpAuditPayload,
} from '@services/auditLogService';
import { useNavigate } from 'react-router-dom';

// Get display info from action
function getActionDisplayInfo(log: AuditLog): { icon: React.ReactNode; label: string; color: 'success' | 'warning' | 'error' | 'info' | 'secondary' | 'default' } {
    // Job-related actions
    if (isJobAction(log.action)) {
        return { icon: <JobIcon fontSize="small" color="info" />, label: 'Job', color: 'info' };
    }

    // AI-generated actions
    if (isViaJobAction(log.action)) {
        return { icon: <GeneratedIcon fontSize="small" color="secondary" />, label: 'Generated', color: 'secondary' };
    }

    // HTTP actions - determine icon from payload
    if (isHttpAction(log.action) && log.payload) {
        const httpPayload = parsePayload<HttpAuditPayload>(log.payload);
        if (httpPayload) {
            const method = httpPayload.httpMethod?.toUpperCase() || '';
            let icon: React.ReactNode;
            switch (method) {
                case 'POST':
                    icon = <AddIcon fontSize="small" color="primary" />;
                    break;
                case 'DELETE':
                    icon = <DeleteIcon fontSize="small" color="error" />;
                    break;
                case 'PUT':
                case 'PATCH':
                    icon = <EditIcon fontSize="small" color="info" />;
                    break;
                case 'GET':
                    icon = <ViewIcon fontSize="small" color="action" />;
                    break;
                default:
                    icon = <LoginIcon fontSize="small" color="action" />;
            }

            // Determine result color from status code
            const statusCode = httpPayload.statusCode || 0;
            let color: 'success' | 'warning' | 'error' | 'default' = 'default';
            let label = httpPayload.result || 'Unknown';
            if (statusCode >= 200 && statusCode < 300) {
                color = 'success';
                label = 'Success';
            } else if (statusCode >= 400 && statusCode < 500) {
                color = 'warning';
                label = 'Failure';
            } else if (statusCode >= 500) {
                color = 'error';
                label = 'Error';
            }

            return { icon, label, color };
        }
    }

    // Check for error
    if (log.errorMessage) {
        return { icon: <LoginIcon fontSize="small" color="error" />, label: 'Error', color: 'error' };
    }

    // Default
    return { icon: <LoginIcon fontSize="small" color="action" />, label: 'Success', color: 'success' };
}

// Get description for display
function getActionDescription(log: AuditLog): string {
    const userPart = log.userEmail || 'Anonymous';

    if (isHttpAction(log.action) && log.payload) {
        const httpPayload = parsePayload<HttpAuditPayload>(log.payload);
        if (httpPayload) {
            return `${userPart} ${httpPayload.httpMethod} ${httpPayload.path}`;
        }
    }

    // For non-HTTP actions, use the action directly
    return `${userPart} - ${log.action}`;
}

// Get duration from payload
function getDuration(log: AuditLog): number | undefined {
    if (log.payload) {
        const httpPayload = parsePayload<HttpAuditPayload>(log.payload);
        return httpPayload?.durationMs;
    }
    return undefined;
}

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
                    {logs.map((log, index) => {
                        const { icon, label, color } = getActionDisplayInfo(log);
                        const description = getActionDescription(log);
                        const duration = getDuration(log);

                        return (
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
                                        {icon}
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
                                            {description}
                                        </Typography>
                                        <Stack direction="row" spacing={2} alignItems="center">
                                            <Typography variant="caption" color="text.secondary">
                                                {dayjs(log.timestamp).format('MMM DD, HH:mm:ss')}
                                            </Typography>
                                            <Chip
                                                label={label}
                                                color={color}
                                                size="small"
                                                sx={{ height: 20 }}
                                            />
                                            {duration !== undefined && (
                                                <Typography variant="caption" color="text.secondary">
                                                    {duration}ms
                                                </Typography>
                                            )}
                                        </Stack>
                                    </Box>
                                </Stack>
                            </ListItem>
                        );
                    })}
                </List>
            )}
        </Paper>
    );
}
