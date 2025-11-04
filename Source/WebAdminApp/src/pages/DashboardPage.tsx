import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, Skeleton, Alert } from '@mui/material';
import {
    dashboardService,
    type HealthCheckResponse,
    type DashboardStats,
    type PerformanceMetrics,
} from '@services/dashboardService';
import { HealthStatusCard } from '@components/dashboard/HealthStatusCard';
import { PerformanceChart } from '@components/dashboard/PerformanceChart';

export function DashboardPage() {
    const [healthData, setHealthData] = useState<HealthCheckResponse | null>(null);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [healthResponse, statsResponse, metricsResponse] = await Promise.all([
                dashboardService.getHealthChecks(),
                dashboardService.getStats(),
                dashboardService.getMetrics(24),
            ]);

            setHealthData(healthResponse);
            setStats(statsResponse);
            setMetrics(metricsResponse);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDashboardData();

        const interval = setInterval(() => {
            loadDashboardData();
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    const formatNumber = (value: number): string => {
        return value >= 1000 ? value.toLocaleString() : value.toString();
    };

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Admin Dashboard
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6, lg: 3 }}>
                    <Paper id="card-stat-users" sx={{ p: 2, height: '100%' }}>
                        {loading ? (
                            <>
                                <Typography variant="h6">Total Users</Typography>
                                <Skeleton variant="text" width={60} height={48} />
                            </>
                        ) : (
                            <>
                                <Typography variant="h6">Total Users</Typography>
                                <Typography variant="h3">
                                    {stats ? formatNumber(stats.totalUsers) : '-'}
                                </Typography>
                            </>
                        )}
                    </Paper>
                </Grid>

                <Grid size={{ xs: 12, md: 6, lg: 3 }}>
                    <Paper id="card-stat-sessions" sx={{ p: 2, height: '100%' }}>
                        {loading ? (
                            <>
                                <Typography variant="h6">Active Users (24h)</Typography>
                                <Skeleton variant="text" width={60} height={48} />
                            </>
                        ) : (
                            <>
                                <Typography variant="h6">Active Users (24h)</Typography>
                                <Typography variant="h3">
                                    {stats ? formatNumber(stats.activeUsers24h) : '-'}
                                </Typography>
                            </>
                        )}
                    </Paper>
                </Grid>

                <Grid size={{ xs: 12, md: 6, lg: 3 }}>
                    <Paper id="card-stat-audits" sx={{ p: 2, height: '100%' }}>
                        {loading ? (
                            <>
                                <Typography variant="h6">Audit Logs</Typography>
                                <Skeleton variant="text" width={60} height={48} />
                            </>
                        ) : (
                            <>
                                <Typography variant="h6">Audit Logs</Typography>
                                <Typography variant="h3">
                                    {stats ? formatNumber(stats.totalAuditLogs) : '-'}
                                </Typography>
                            </>
                        )}
                    </Paper>
                </Grid>

                <Grid size={{ xs: 12, md: 6, lg: 3 }}>
                    <Paper id="card-stat-storage" sx={{ p: 2, height: '100%' }}>
                        {loading ? (
                            <>
                                <Typography variant="h6">Storage Used</Typography>
                                <Skeleton variant="text" width={80} height={48} />
                            </>
                        ) : (
                            <>
                                <Typography variant="h6">Storage Used</Typography>
                                <Typography variant="h3">
                                    {stats ? `${stats.storageUsedGB.toFixed(2)} GB` : '-'}
                                </Typography>
                            </>
                        )}
                    </Paper>
                </Grid>
            </Grid>

            <Grid container spacing={3} sx={{ mt: 3 }}>
                <Grid size={{ xs: 12, md: 6 }}>
                    {loading ? (
                        <Paper sx={{ p: 2, height: 400 }}>
                            <Skeleton variant="rectangular" height="100%" />
                        </Paper>
                    ) : (
                        <HealthStatusCard healthData={healthData} loading={loading} />
                    )}
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                    {loading ? (
                        <Paper sx={{ p: 2, height: 400 }}>
                            <Skeleton variant="rectangular" height="100%" />
                        </Paper>
                    ) : (
                        <PerformanceChart metrics={metrics} loading={loading} />
                    )}
                </Grid>
            </Grid>
        </Box>
    );
}
