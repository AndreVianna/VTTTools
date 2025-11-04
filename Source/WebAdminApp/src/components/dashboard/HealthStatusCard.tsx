import { Box, Paper, Typography, Chip, Stack, useTheme } from '@mui/material';
import { FiberManualRecord as FiberManualRecordIcon } from '@mui/icons-material';
import type { HealthCheckResponse, HealthCheckResult } from '@services/dashboardService';

interface HealthStatusCardProps {
    healthData: HealthCheckResponse | null;
    loading?: boolean;
}

export function HealthStatusCard({ healthData, loading }: HealthStatusCardProps) {
    const theme = useTheme();

    const getStatusColor = (status: string): string => {
        switch (status) {
            case 'Healthy':
                return theme.palette.success.main;
            case 'Degraded':
                return theme.palette.warning.main;
            case 'Unhealthy':
                return theme.palette.error.main;
            default:
                return theme.palette.grey[500];
        }
    };

    const getStatusChipColor = (status: string): 'success' | 'warning' | 'error' | 'default' => {
        switch (status) {
            case 'Healthy':
                return 'success';
            case 'Degraded':
                return 'warning';
            case 'Unhealthy':
                return 'error';
            default:
                return 'default';
        }
    };

    if (loading || !healthData) {
        return (
            <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                    System Health
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Loading...
                </Typography>
            </Paper>
        );
    }

    return (
        <Paper sx={{ p: 2, height: '100%' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="h6">System Health</Typography>
                <Stack direction="row" alignItems="center" spacing={1}>
                    <FiberManualRecordIcon
                        sx={{
                            fontSize: 16,
                            color: getStatusColor(healthData.status),
                        }}
                    />
                    <Chip
                        label={healthData.status}
                        color={getStatusChipColor(healthData.status)}
                        size="small"
                    />
                </Stack>
            </Stack>

            <Stack spacing={1.5}>
                {healthData.results.map((check: HealthCheckResult) => (
                    <Box
                        key={check.name}
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            p: 1,
                            borderRadius: 1,
                            backgroundColor: theme.palette.background.default,
                        }}
                    >
                        <Stack direction="row" alignItems="center" spacing={1}>
                            <FiberManualRecordIcon
                                sx={{
                                    fontSize: 12,
                                    color: getStatusColor(check.status),
                                }}
                            />
                            <Typography variant="body2">{check.name}</Typography>
                        </Stack>
                        <Stack direction="row" alignItems="center" spacing={1}>
                            <Chip
                                label={check.status}
                                color={getStatusChipColor(check.status)}
                                size="small"
                            />
                            <Typography variant="caption" color="text.secondary">
                                {check.duration}
                            </Typography>
                        </Stack>
                    </Box>
                ))}
            </Stack>

            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
                Total Duration: {healthData.totalDuration}
            </Typography>
        </Paper>
    );
}
