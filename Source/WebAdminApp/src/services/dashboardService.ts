import client from '@api/client';

export interface HealthCheckResult {
    name: string;
    status: 'Healthy' | 'Degraded' | 'Unhealthy';
    duration: string;
    description?: string;
    data?: Record<string, unknown>;
}

export interface HealthCheckResponse {
    status: string;
    totalDuration: string;
    results: HealthCheckResult[];
}

export interface DashboardStats {
    totalUsers: number;
    activeUsers24h: number;
    totalAuditLogs: number;
    storageUsedGB: number;
}

export interface TimeSeriesDataPoint {
    timestamp: string;
    value: number;
}

export interface PerformanceMetrics {
    averageResponseTimeMs: number;
    requestsPerMinute: number;
    responseTimeHistory: TimeSeriesDataPoint[];
}

class DashboardService {
    async getHealthChecks(): Promise<HealthCheckResponse> {
        const response = await client.get('/api/admin/dashboard/health-checks');
        return response.data;
    }

    async getStats(): Promise<DashboardStats> {
        const response = await client.get('/api/admin/dashboard/stats');
        return response.data;
    }

    async getMetrics(hours: number = 24): Promise<PerformanceMetrics> {
        const response = await client.get(`/api/admin/dashboard/metrics?hours=${hours}`);
        return response.data;
    }
}

export const dashboardService = new DashboardService();
