import { Paper, Typography, Chip, Stack, Alert } from '@mui/material';
import type { HealthCheckResponse } from '@services/healthCheckService';

interface HealthStatusCardProps {
    serviceName?: string;
    healthData: HealthCheckResponse | null;
    error?: string | null;
    loading?: boolean;
}

export function HealthStatusCard({ serviceName = 'System Health', healthData, error, loading }: HealthStatusCardProps) {
    const getStatusChipColor = (status: string): 'success' | 'warning' | 'error' | 'default' => {
        switch (status) {
            case 'Healthy':
                return 'success';
            case 'Degraded':
                return 'warning';
            case 'Unhealthy':
            case 'Unavailable':
                return 'error';
            default:
                return 'default';
        }
    };

    if (loading) {
        return (
            <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                    {serviceName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Loading...
                </Typography>
            </Paper>
        );
    }

    if (error) {
        return (
            <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                    {serviceName}
                </Typography>
                <Alert severity="error">{error}</Alert>
            </Paper>
        );
    }

    if (!healthData) {
        return (
            <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                    {serviceName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    No health data available
                </Typography>
            </Paper>
        );
    }

    return (
        <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: 100 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">{serviceName}</Typography>
                <Chip
                    label={healthData.status}
                    color={getStatusChipColor(healthData.status)}
                    size="small"
                />
            </Stack>

            <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                Response: {healthData.totalDuration}
            </Typography>
        </Paper>
    );
}
