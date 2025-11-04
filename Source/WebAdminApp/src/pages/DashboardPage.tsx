import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, Skeleton, Alert } from '@mui/material';
import {
    dashboardService,
    type DashboardStats,
    type PerformanceMetrics,
} from '@services/dashboardService';
import { healthCheckService, type AllServicesHealth } from '@services/healthCheckService';
import { HealthStatusCard } from '@components/dashboard/HealthStatusCard';
import { PerformanceChart } from '@components/dashboard/PerformanceChart';

export function DashboardPage() {
    const [allHealth, setAllHealth] = useState<AllServicesHealth>({});
    const [infrastructure, setInfrastructure] = useState<AllServicesHealth>({});
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [allServicesHealth, statsResponse, metricsResponse] = await Promise.all([
                healthCheckService.getAllHealth(),
                dashboardService.getStats(),
                dashboardService.getMetrics(24),
            ]);

            setAllHealth(allServicesHealth);

            const adminHealthData = allServicesHealth['Admin']?.healthData;
            if (adminHealthData) {
                const infraHealth = healthCheckService.extractInfrastructureHealth(adminHealthData);
                setInfrastructure({
                    Database: infraHealth.database,
                    Redis: infraHealth.redis,
                    BlobStorage: infraHealth.blobStorage,
                });
            }

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
                <Grid size={{ xs: 12 }}>
                    <Typography variant="h5" sx={{ mb: 2 }}>
                        Infrastructure Health
                    </Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <HealthStatusCard
                        serviceName="Database"
                        healthData={infrastructure['Database']?.healthData || null}
                        error={infrastructure['Database']?.error || null}
                        loading={loading}
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <HealthStatusCard
                        serviceName="Blob Storage"
                        healthData={infrastructure['BlobStorage']?.healthData || null}
                        error={infrastructure['BlobStorage']?.error || null}
                        loading={loading}
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <HealthStatusCard
                        serviceName="Redis Cache"
                        healthData={infrastructure['Redis']?.healthData || null}
                        error={infrastructure['Redis']?.error || null}
                        loading={loading}
                    />
                </Grid>

                <Grid size={{ xs: 12 }}>
                    <Typography variant="h5" sx={{ mb: 2, mt: 3 }}>
                        Frontend Applications
                    </Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <HealthStatusCard
                        serviceName="Admin App"
                        healthData={allHealth['AdminApp']?.healthData || null}
                        error={allHealth['AdminApp']?.error || null}
                        loading={loading}
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <HealthStatusCard
                        serviceName="Main App"
                        healthData={allHealth['MainApp']?.healthData || null}
                        error={allHealth['MainApp']?.error || null}
                        loading={loading}
                    />
                </Grid>

                <Grid size={{ xs: 12 }}>
                    <Typography variant="h5" sx={{ mb: 2, mt: 3 }}>
                        Backend Services
                    </Typography>
                </Grid>
                {['Admin', 'Auth', 'Assets', 'Library', 'Game', 'Media'].map((service) => (
                    <Grid key={service} size={{ xs: 12, sm: 6, md: 4 }}>
                        <HealthStatusCard
                            serviceName={`${service} API`}
                            healthData={allHealth[service]?.healthData || null}
                            error={allHealth[service]?.error || null}
                            loading={loading}
                        />
                    </Grid>
                ))}

                <Grid size={{ xs: 12 }}>
                    <Typography variant="h5" sx={{ mb: 2, mt: 3 }}>
                        Performance Metrics
                    </Typography>
                </Grid>
                <Grid size={{ xs: 12 }}>
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
