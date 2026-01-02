/**
 * HealthStatusCard Component Tests
 * Tests rendering states, status chip colors, and health data display
 * Coverage: Health status display scenarios for dashboard cards
 *
 * Test Coverage:
 * - Default service name rendering
 * - Custom service name rendering
 * - Loading state display
 * - Error alert display
 * - No health data state
 * - Health data with status chip
 * - Response duration display
 * - Status chip color mapping (Healthy, Degraded, Unhealthy, Unavailable, unknown)
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { HealthStatusCard } from './HealthStatusCard';
import type { HealthCheckResponse } from '@services/healthCheckService';

// Mock data for different health statuses
const mockHealthyData: HealthCheckResponse = {
    status: 'Healthy',
    totalDuration: '00:00:00.0150000',
    results: [],
};

const mockDegradedData: HealthCheckResponse = {
    status: 'Degraded',
    totalDuration: '00:00:01.5000000',
    results: [],
};

const mockUnhealthyData: HealthCheckResponse = {
    status: 'Unhealthy',
    totalDuration: '00:00:05.0000000',
    results: [],
};

describe('HealthStatusCard', () => {
    describe('Rendering States', () => {
        it('should render default service name when not provided', () => {
            // Arrange & Act
            render(<HealthStatusCard healthData={mockHealthyData} />);

            // Assert
            expect(screen.getByText('System Health')).toBeInTheDocument();
        });

        it('should render custom service name when provided', () => {
            // Arrange
            const customName = 'Auth Service';

            // Act
            render(<HealthStatusCard serviceName={customName} healthData={mockHealthyData} />);

            // Assert
            expect(screen.getByText('Auth Service')).toBeInTheDocument();
        });

        it('should render loading state with Loading text', () => {
            // Arrange & Act
            render(<HealthStatusCard healthData={null} loading={true} />);

            // Assert
            expect(screen.getByText('Loading...')).toBeInTheDocument();
        });

        it('should render service name during loading state', () => {
            // Arrange
            const serviceName = 'Database Service';

            // Act
            render(<HealthStatusCard serviceName={serviceName} healthData={null} loading={true} />);

            // Assert
            expect(screen.getByText('Database Service')).toBeInTheDocument();
            expect(screen.getByText('Loading...')).toBeInTheDocument();
        });

        it('should render error alert when error prop is provided', () => {
            // Arrange
            const errorMessage = 'Failed to fetch health data';

            // Act
            render(<HealthStatusCard healthData={null} error={errorMessage} />);

            // Assert
            expect(screen.getByRole('alert')).toBeInTheDocument();
            expect(screen.getByText('Failed to fetch health data')).toBeInTheDocument();
        });

        it('should render service name when showing error', () => {
            // Arrange
            const serviceName = 'Media Service';
            const errorMessage = 'Connection timeout';

            // Act
            render(<HealthStatusCard serviceName={serviceName} healthData={null} error={errorMessage} />);

            // Assert
            expect(screen.getByText('Media Service')).toBeInTheDocument();
            expect(screen.getByText('Connection timeout')).toBeInTheDocument();
        });

        it('should render no health data message when healthData is null', () => {
            // Arrange & Act
            render(<HealthStatusCard healthData={null} />);

            // Assert
            expect(screen.getByText('No health data available')).toBeInTheDocument();
        });

        it('should render service name when no health data is available', () => {
            // Arrange
            const serviceName = 'Game Service';

            // Act
            render(<HealthStatusCard serviceName={serviceName} healthData={null} />);

            // Assert
            expect(screen.getByText('Game Service')).toBeInTheDocument();
            expect(screen.getByText('No health data available')).toBeInTheDocument();
        });

        it('should render health status chip when healthData is provided', () => {
            // Arrange & Act
            render(<HealthStatusCard healthData={mockHealthyData} />);

            // Assert
            expect(screen.getByText('Healthy')).toBeInTheDocument();
        });

        it('should render response duration when healthData is provided', () => {
            // Arrange & Act
            render(<HealthStatusCard healthData={mockHealthyData} />);

            // Assert
            expect(screen.getByText('Response: 00:00:00.0150000')).toBeInTheDocument();
        });

        it('should render service name and status together', () => {
            // Arrange
            const serviceName = 'Assets Service';

            // Act
            render(<HealthStatusCard serviceName={serviceName} healthData={mockHealthyData} />);

            // Assert
            expect(screen.getByText('Assets Service')).toBeInTheDocument();
            expect(screen.getByText('Healthy')).toBeInTheDocument();
            expect(screen.getByText('Response: 00:00:00.0150000')).toBeInTheDocument();
        });
    });

    describe('Status Chip Colors', () => {
        it('should render success chip for Healthy status', () => {
            // Arrange & Act
            render(<HealthStatusCard healthData={mockHealthyData} />);

            // Assert
            const chip = screen.getByText('Healthy').closest('.MuiChip-root');
            expect(chip).toHaveClass('MuiChip-colorSuccess');
        });

        it('should render warning chip for Degraded status', () => {
            // Arrange & Act
            render(<HealthStatusCard healthData={mockDegradedData} />);

            // Assert
            const chip = screen.getByText('Degraded').closest('.MuiChip-root');
            expect(chip).toHaveClass('MuiChip-colorWarning');
        });

        it('should render error chip for Unhealthy status', () => {
            // Arrange & Act
            render(<HealthStatusCard healthData={mockUnhealthyData} />);

            // Assert
            const chip = screen.getByText('Unhealthy').closest('.MuiChip-root');
            expect(chip).toHaveClass('MuiChip-colorError');
        });

        it('should render error chip for Unavailable status', () => {
            // Arrange
            const unavailableData = {
                status: 'Unavailable' as 'Healthy' | 'Degraded' | 'Unhealthy',
                totalDuration: '00:00:10.0000000',
                results: [],
            };

            // Act
            render(<HealthStatusCard healthData={unavailableData as HealthCheckResponse} />);

            // Assert
            const chip = screen.getByText('Unavailable').closest('.MuiChip-root');
            expect(chip).toHaveClass('MuiChip-colorError');
        });

        it('should render default chip for unknown status', () => {
            // Arrange
            const unknownStatusData = {
                status: 'Unknown' as 'Healthy' | 'Degraded' | 'Unhealthy',
                totalDuration: '00:00:00.0000000',
                results: [],
            };

            // Act
            render(<HealthStatusCard healthData={unknownStatusData as HealthCheckResponse} />);

            // Assert
            const chip = screen.getByText('Unknown').closest('.MuiChip-root');
            expect(chip).toHaveClass('MuiChip-colorDefault');
        });
    });

    describe('Priority of States', () => {
        it('should show loading state over error state', () => {
            // Arrange & Act
            render(<HealthStatusCard healthData={null} loading={true} error="Some error" />);

            // Assert
            expect(screen.getByText('Loading...')).toBeInTheDocument();
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });

        it('should show error state over no data state', () => {
            // Arrange & Act
            render(<HealthStatusCard healthData={null} error="Connection failed" />);

            // Assert
            expect(screen.getByRole('alert')).toBeInTheDocument();
            expect(screen.queryByText('No health data available')).not.toBeInTheDocument();
        });

        it('should show health data state when data is provided without loading or error', () => {
            // Arrange & Act
            render(<HealthStatusCard healthData={mockHealthyData} loading={false} error={null} />);

            // Assert
            expect(screen.getByText('Healthy')).toBeInTheDocument();
            expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });
    });

    describe('Duration Display', () => {
        it('should display short duration correctly', () => {
            // Arrange
            const shortDurationData: HealthCheckResponse = {
                status: 'Healthy',
                totalDuration: '00:00:00.0010000',
                results: [],
            };

            // Act
            render(<HealthStatusCard healthData={shortDurationData} />);

            // Assert
            expect(screen.getByText('Response: 00:00:00.0010000')).toBeInTheDocument();
        });

        it('should display long duration correctly', () => {
            // Arrange
            const longDurationData: HealthCheckResponse = {
                status: 'Degraded',
                totalDuration: '00:00:30.0000000',
                results: [],
            };

            // Act
            render(<HealthStatusCard healthData={longDurationData} />);

            // Assert
            expect(screen.getByText('Response: 00:00:30.0000000')).toBeInTheDocument();
        });

        it('should display millisecond format duration', () => {
            // Arrange
            const msFormatData: HealthCheckResponse = {
                status: 'Healthy',
                totalDuration: '150ms',
                results: [],
            };

            // Act
            render(<HealthStatusCard healthData={msFormatData} />);

            // Assert
            expect(screen.getByText('Response: 150ms')).toBeInTheDocument();
        });
    });
});
