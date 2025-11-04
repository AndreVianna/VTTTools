import { Paper, Typography, Box, useTheme } from '@mui/material';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import dayjs from 'dayjs';
import type { PerformanceMetrics } from '@services/dashboardService';

interface PerformanceChartProps {
    metrics: PerformanceMetrics | null;
    loading?: boolean;
}

export function PerformanceChart({ metrics, loading }: PerformanceChartProps) {
    const theme = useTheme();

    if (loading || !metrics) {
        return (
            <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                    Performance Metrics
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Loading...
                </Typography>
            </Paper>
        );
    }

    const chartData = metrics.responseTimeHistory.map((point) => ({
        timestamp: new Date(point.timestamp).getTime(),
        displayTime: dayjs(point.timestamp).format('HH:mm'),
        value: point.value,
    }));

    return (
        <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
                Performance Metrics
            </Typography>

            <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
                <Box>
                    <Typography variant="caption" color="text.secondary">
                        Avg Response Time
                    </Typography>
                    <Typography variant="h6">
                        {metrics.averageResponseTimeMs.toFixed(1)} ms
                    </Typography>
                </Box>
                <Box>
                    <Typography variant="caption" color="text.secondary">
                        Requests/Min
                    </Typography>
                    <Typography variant="h6">
                        {metrics.requestsPerMinute.toFixed(1)}
                    </Typography>
                </Box>
            </Box>

            <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
                    <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={theme.palette.divider}
                    />
                    <XAxis
                        dataKey="displayTime"
                        stroke={theme.palette.text.secondary}
                        style={{ fontSize: '0.75rem' }}
                    />
                    <YAxis
                        stroke={theme.palette.text.secondary}
                        style={{ fontSize: '0.75rem' }}
                        label={{
                            value: 'Response Time (ms)',
                            angle: -90,
                            position: 'insideLeft',
                            style: {
                                fill: theme.palette.text.secondary,
                                fontSize: '0.75rem',
                            },
                        }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: theme.palette.background.paper,
                            border: `1px solid ${theme.palette.divider}`,
                            borderRadius: theme.shape.borderRadius,
                        }}
                        labelFormatter={(value) => `Time: ${value}`}
                        formatter={(value: number) => [`${value.toFixed(1)} ms`, 'Response Time']}
                    />
                    <Line
                        type="monotone"
                        dataKey="value"
                        stroke={theme.palette.primary.main}
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </Paper>
    );
}
