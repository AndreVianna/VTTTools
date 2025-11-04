import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import client from '@api/client';
import {
    dashboardService,
    type HealthCheckResponse,
    type DashboardStats,
    type PerformanceMetrics,
} from './dashboardService';

describe('dashboardService', () => {
    let mockAxios: MockAdapter;

    beforeEach(() => {
        mockAxios = new MockAdapter(client);
    });

    afterEach(() => {
        mockAxios.restore();
    });

    describe('getHealthChecks', () => {
        it('returns health check results', async () => {
            const mockResponse: HealthCheckResponse = {
                status: 'Healthy',
                totalDuration: '125ms',
                results: [
                    {
                        name: 'Database',
                        status: 'Healthy',
                        duration: '50ms',
                        description: 'PostgreSQL connection',
                    },
                    {
                        name: 'BlobStorage',
                        status: 'Healthy',
                        duration: '75ms',
                        description: 'Azure Blob Storage',
                    },
                ],
            };

            mockAxios.onGet('/api/admin/dashboard/health-checks').reply(200, mockResponse);

            const result = await dashboardService.getHealthChecks();

            expect(result).toEqual(mockResponse);
            expect(result.status).toBe('Healthy');
            expect(result.results).toHaveLength(2);
            expect(result.results[0]?.name).toBe('Database');
        });
    });

    describe('getStats', () => {
        it('returns dashboard statistics', async () => {
            const mockResponse: DashboardStats = {
                totalUsers: 1250,
                activeUsers24h: 342,
                totalAuditLogs: 5678,
                storageUsedGB: 12.45,
            };

            mockAxios.onGet('/api/admin/dashboard/stats').reply(200, mockResponse);

            const result = await dashboardService.getStats();

            expect(result).toEqual(mockResponse);
            expect(result.totalUsers).toBe(1250);
            expect(result.activeUsers24h).toBe(342);
            expect(result.totalAuditLogs).toBe(5678);
            expect(result.storageUsedGB).toBe(12.45);
        });
    });

    describe('getMetrics', () => {
        it('returns performance metrics with time series', async () => {
            const mockResponse: PerformanceMetrics = {
                averageResponseTimeMs: 125.5,
                requestsPerMinute: 45.2,
                responseTimeHistory: [
                    { timestamp: '2025-11-02T10:00:00Z', value: 120 },
                    { timestamp: '2025-11-02T10:15:00Z', value: 130 },
                    { timestamp: '2025-11-02T10:30:00Z', value: 125 },
                ],
            };

            mockAxios.onGet('/api/admin/dashboard/metrics?hours=24').reply(200, mockResponse);

            const result = await dashboardService.getMetrics(24);

            expect(result).toEqual(mockResponse);
            expect(result.averageResponseTimeMs).toBe(125.5);
            expect(result.requestsPerMinute).toBe(45.2);
            expect(result.responseTimeHistory).toHaveLength(3);
            expect(result.responseTimeHistory[0]?.value).toBe(120);
        });

        it('handles API error', async () => {
            mockAxios.onGet('/api/admin/dashboard/metrics?hours=24').reply(500, {
                error: 'Internal server error',
            });

            await expect(dashboardService.getMetrics(24)).rejects.toThrow();
        });
    });

    describe('getHealthChecks', () => {
        it('handles network error', async () => {
            mockAxios.onGet('/api/admin/dashboard/health-checks').networkError();

            await expect(dashboardService.getHealthChecks()).rejects.toThrow();
        });
    });
});
