/**
 * DashboardPage Component Tests
 * Tests admin dashboard rendering, data loading, and error handling
 * Coverage: Dashboard workflow scenarios for WebAdminApp
 *
 * Test Coverage:
 * - Page title rendering
 * - Loading skeleton display
 * - Stat cards with data when loaded
 * - Health status cards for infrastructure
 * - Error alert display on API failure
 * - Service calls on mount
 * - Large number formatting
 */

import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { DashboardPage } from './DashboardPage';
import type {
    DashboardStats,
    PerformanceMetrics,
} from '@services/dashboardService';
import type { AllServicesHealth, HealthCheckResponse } from '@services/healthCheckService';

// Mock dashboardService
const mockGetStats = vi.fn();
const mockGetMetrics = vi.fn();
vi.mock('@services/dashboardService', () => ({
    dashboardService: {
        getStats: () => mockGetStats(),
        getMetrics: (hours: number) => mockGetMetrics(hours),
    },
}));

// Mock healthCheckService
const mockGetAllHealth = vi.fn();
const mockExtractInfrastructureHealth = vi.fn();
vi.mock('@services/healthCheckService', () => ({
    healthCheckService: {
        getAllHealth: () => mockGetAllHealth(),
        extractInfrastructureHealth: (data: HealthCheckResponse) => mockExtractInfrastructureHealth(data),
    },
}));

// Mock HealthStatusCard component
vi.mock('@components/dashboard/HealthStatusCard', () => ({
    HealthStatusCard: ({ serviceName, loading }: { serviceName: string; loading: boolean }) => (
        <div role="article" aria-label={`${serviceName} health card`}>
            {loading ? 'Loading...' : serviceName}
        </div>
    ),
}));

// Mock PerformanceChart component
vi.mock('@components/dashboard/PerformanceChart', () => ({
    PerformanceChart: () => <div role="img" aria-label="Performance chart">Chart</div>,
}));

describe('DashboardPage', () => {
    const defaultStats: DashboardStats = {
        totalUsers: 1500,
        activeUsers24h: 42,
        totalAuditLogs: 10234,
        storageUsedGB: 2.45,
    };

    const defaultMetrics: PerformanceMetrics = {
        averageResponseTimeMs: 125.5,
        requestsPerMinute: 50.2,
        responseTimeHistory: [
            { timestamp: '2024-01-01T00:00:00Z', value: 100 },
            { timestamp: '2024-01-01T01:00:00Z', value: 150 },
        ],
    };

    const healthyResponse: HealthCheckResponse = {
        status: 'Healthy',
        totalDuration: '100ms',
        results: [
            {
                name: 'database',
                status: 'Healthy',
                duration: '50ms',
                description: 'Database is healthy',
                data: null,
                exception: null,
                tags: ['database'],
            },
        ],
    };

    const defaultAllHealth: AllServicesHealth = {
        Admin: {
            serviceName: 'Admin',
            status: 'Healthy',
            healthData: healthyResponse,
            error: null,
        },
        Auth: {
            serviceName: 'Auth',
            status: 'Healthy',
            healthData: healthyResponse,
            error: null,
        },
        Assets: {
            serviceName: 'Assets',
            status: 'Healthy',
            healthData: healthyResponse,
            error: null,
        },
        Library: {
            serviceName: 'Library',
            status: 'Healthy',
            healthData: healthyResponse,
            error: null,
        },
        Game: {
            serviceName: 'Game',
            status: 'Healthy',
            healthData: healthyResponse,
            error: null,
        },
        Media: {
            serviceName: 'Media',
            status: 'Healthy',
            healthData: healthyResponse,
            error: null,
        },
        AdminApp: {
            serviceName: 'Admin App',
            status: 'Healthy',
            healthData: healthyResponse,
            error: null,
        },
        MainApp: {
            serviceName: 'Main App',
            status: 'Healthy',
            healthData: healthyResponse,
            error: null,
        },
    };

    const defaultInfrastructureHealth = {
        database: {
            serviceName: 'Database',
            status: 'Healthy' as const,
            healthData: healthyResponse,
            error: null,
        },
        redis: {
            serviceName: 'Redis',
            status: 'Healthy' as const,
            healthData: healthyResponse,
            error: null,
        },
        blobStorage: {
            serviceName: 'Blob Storage',
            status: 'Healthy' as const,
            healthData: healthyResponse,
            error: null,
        },
    };

    beforeEach(() => {
        vi.resetAllMocks();

        // Default successful responses
        mockGetAllHealth.mockResolvedValue(defaultAllHealth);
        mockGetStats.mockResolvedValue(defaultStats);
        mockGetMetrics.mockResolvedValue(defaultMetrics);
        mockExtractInfrastructureHealth.mockReturnValue(defaultInfrastructureHealth);
    });

    afterEach(() => {
        vi.clearAllTimers();
    });

    describe('Rendering', () => {
        it('should render page title "Admin Dashboard"', async () => {
            // Arrange & Act
            render(<DashboardPage />);

            // Assert
            expect(screen.getByRole('heading', { name: /admin dashboard/i })).toBeInTheDocument();

            // Wait for loading to complete to prevent act() warnings
            await waitFor(() => {
                expect(mockGetAllHealth).toHaveBeenCalled();
            });
        });

        it('should display loading skeletons while loading', async () => {
            // Arrange - Create promises that never resolve to keep component in loading state
            mockGetAllHealth.mockImplementation(() => new Promise(() => {}));
            mockGetStats.mockImplementation(() => new Promise(() => {}));
            mockGetMetrics.mockImplementation(() => new Promise(() => {}));

            // Act
            render(<DashboardPage />);

            // Assert - Skeletons are present during loading
            // The component renders Typography with "Total Users" etc. and Skeleton components
            expect(screen.getByText('Total Users')).toBeInTheDocument();
            expect(screen.getByText('Active Users (24h)')).toBeInTheDocument();
            expect(screen.getByText('Audit Logs')).toBeInTheDocument();
            expect(screen.getByText('Storage Used')).toBeInTheDocument();

            // Health status cards show loading
            const healthCards = screen.getAllByRole('article');
            expect(healthCards.some(card => card.textContent?.includes('Loading...'))).toBe(true);
        });

        it('should display stat cards with data when loaded', async () => {
            // Arrange & Act
            render(<DashboardPage />);

            // Assert - Wait for data to load
            await waitFor(() => {
                expect(screen.getByText('1,500')).toBeInTheDocument();
            });

            expect(screen.getByText('42')).toBeInTheDocument(); // activeUsers24h
            expect(screen.getByText('10,234')).toBeInTheDocument(); // totalAuditLogs formatted
            expect(screen.getByText('2.45 GB')).toBeInTheDocument(); // storageUsedGB
        });

        it('should display health status cards for infrastructure', async () => {
            // Arrange & Act
            render(<DashboardPage />);

            // Assert - Check for infrastructure health section and cards
            await waitFor(() => {
                expect(screen.getByText('Infrastructure Health')).toBeInTheDocument();
            });

            expect(screen.getByRole('article', { name: /database health card/i })).toBeInTheDocument();
            expect(screen.getByRole('article', { name: /blob storage health card/i })).toBeInTheDocument();
            expect(screen.getByRole('article', { name: /redis cache health card/i })).toBeInTheDocument();
        });

        it('should display error alert on API error', async () => {
            // Arrange
            mockGetAllHealth.mockRejectedValue(new Error('Network error'));
            mockGetStats.mockRejectedValue(new Error('Network error'));
            mockGetMetrics.mockRejectedValue(new Error('Network error'));

            // Act
            render(<DashboardPage />);

            // Assert
            await waitFor(() => {
                expect(screen.getByRole('alert')).toBeInTheDocument();
            });

            expect(screen.getByText('Network error')).toBeInTheDocument();
        });
    });

    describe('Data loading', () => {
        it('should call services on mount', async () => {
            // Arrange & Act
            render(<DashboardPage />);

            // Assert - Wait for services to be called
            await waitFor(() => {
                expect(mockGetAllHealth).toHaveBeenCalledTimes(1);
            });

            expect(mockGetStats).toHaveBeenCalledTimes(1);
            expect(mockGetMetrics).toHaveBeenCalledWith(24);
        });

        it('should format large numbers with locale string', async () => {
            // Arrange
            const statsWithLargeNumbers: DashboardStats = {
                totalUsers: 12345,
                activeUsers24h: 9876,
                totalAuditLogs: 1000000,
                storageUsedGB: 123.456,
            };
            mockGetStats.mockResolvedValue(statsWithLargeNumbers);

            // Act
            render(<DashboardPage />);

            // Assert - Numbers >= 1000 should be formatted with locale separators
            await waitFor(() => {
                expect(screen.getByText('12,345')).toBeInTheDocument();
            });

            expect(screen.getByText('9,876')).toBeInTheDocument();
            expect(screen.getByText('1,000,000')).toBeInTheDocument();
            expect(screen.getByText('123.46 GB')).toBeInTheDocument();
        });
    });
});
