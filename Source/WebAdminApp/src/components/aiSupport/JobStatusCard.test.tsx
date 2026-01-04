/**
 * JobStatusCard Component Tests
 * Tests rendering states, status chip colors, job type labels, and action buttons
 * Coverage: Normal/compact mode rendering, status colors, button visibility, and callbacks
 *
 * Test Coverage:
 * - Normal mode rendering (job type, ID, status chip, progress bar, counts, dates)
 * - Compact mode rendering (job type, item counts, status chip, progress bar)
 * - Status chip colors (Pending, InProgress, Completed, Canceled)
 * - Job type labels (BulkAssetPortraitGeneration, BulkAssetTokenGeneration, unknown)
 * - Cancel button visibility and callbacks
 * - Retry button visibility and callbacks
 * - View details callback in compact mode
 * - Duration formatting (milliseconds, seconds, minutes)
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { JobStatusCard } from './JobStatusCard';
import { JobStatus, JobType } from '@/types/jobs';
import type { JobResponse } from '@/types/jobs';

// Mock MUI icons to prevent file loading issues
vi.mock('@mui/icons-material', () => {
    const CancelComponent = () => <svg role="img" aria-label="Cancel" className="MuiSvgIcon-root" />;
    const RefreshComponent = () => <svg role="img" aria-label="Refresh" className="MuiSvgIcon-root" />;
    return {
        Cancel: CancelComponent,
        Refresh: RefreshComponent,
    };
});

// Helper to create a mock job with overrides
function createMockJob(overrides: Partial<JobResponse> = {}): JobResponse {
    return {
        jobId: 'job-123',
        jobType: JobType.BulkAssetPortraitGeneration,
        status: JobStatus.Pending,
        totalItems: 10,
        completedItems: 0,
        failedItems: 0,
        createdAt: '2024-01-15T10:30:00Z',
        items: [],
        ...overrides,
    };
}

describe('JobStatusCard', () => {
    describe('Rendering (Normal Mode)', () => {
        it('should render job type label', () => {
            // Arrange
            const job = createMockJob({ jobType: JobType.BulkAssetPortraitGeneration });

            // Act
            render(<JobStatusCard job={job} />);

            // Assert
            expect(screen.getByRole('heading', { level: 6 })).toHaveTextContent('Portrait Generation');
        });

        it('should render job ID', () => {
            // Arrange
            const job = createMockJob({ jobId: 'unique-job-456' });

            // Act
            render(<JobStatusCard job={job} />);

            // Assert
            expect(screen.getByText(/ID: unique-job-456/)).toBeInTheDocument();
        });

        it('should render status chip', () => {
            // Arrange
            const job = createMockJob({ status: JobStatus.Pending });

            // Act
            render(<JobStatusCard job={job} />);

            // Assert
            expect(screen.getByText('Pending')).toBeInTheDocument();
        });

        it('should render progress bar', () => {
            // Arrange
            const job = createMockJob({ totalItems: 10, completedItems: 3, failedItems: 1 });

            // Act
            render(<JobStatusCard job={job} />);

            // Assert
            const progressBar = screen.getByRole('progressbar');
            expect(progressBar).toBeInTheDocument();
            expect(progressBar).toHaveAttribute('aria-valuenow', '40'); // (3+1)/10 * 100 = 40
        });

        it('should render completed count', () => {
            // Arrange
            const job = createMockJob({ completedItems: 7 });

            // Act
            render(<JobStatusCard job={job} />);

            // Assert
            expect(screen.getByText(/Completed: 7/)).toBeInTheDocument();
        });

        it('should render failed count when failures exist', () => {
            // Arrange
            const job = createMockJob({ failedItems: 3 });

            // Act
            render(<JobStatusCard job={job} />);

            // Assert
            expect(screen.getByText(/Failed: 3/)).toBeInTheDocument();
        });

        it('should not render failed count when no failures', () => {
            // Arrange
            const job = createMockJob({ failedItems: 0 });

            // Act
            render(<JobStatusCard job={job} />);

            // Assert
            expect(screen.queryByText(/Failed:/)).not.toBeInTheDocument();
        });

        it('should render progress text with total and processed items', () => {
            // Arrange
            const job = createMockJob({ totalItems: 15, completedItems: 8, failedItems: 2 });

            // Act
            render(<JobStatusCard job={job} />);

            // Assert
            expect(screen.getByText('10/15')).toBeInTheDocument(); // (8+2)/15
        });

        it('should render Created date', () => {
            // Arrange
            const job = createMockJob({ createdAt: '2024-01-15T10:30:00Z' });

            // Act
            render(<JobStatusCard job={job} />);

            // Assert
            expect(screen.getByText('Created:')).toBeInTheDocument();
        });

        it('should render Started date when available', () => {
            // Arrange
            const job = createMockJob({ startedAt: '2024-01-15T10:31:00Z' });

            // Act
            render(<JobStatusCard job={job} />);

            // Assert
            expect(screen.getByText('Started:')).toBeInTheDocument();
        });

        it('should not render Started date when not available', () => {
            // Arrange
            const job = createMockJob({ startedAt: undefined });

            // Act
            render(<JobStatusCard job={job} />);

            // Assert
            expect(screen.queryByText('Started:')).not.toBeInTheDocument();
        });

        it('should render Completed date when available', () => {
            // Arrange
            const job = createMockJob({ completedAt: '2024-01-15T10:35:00Z' });

            // Act
            render(<JobStatusCard job={job} />);

            // Assert
            expect(screen.getByText('Completed:')).toBeInTheDocument();
        });

        it('should not render Completed date when not available', () => {
            // Arrange
            const job = createMockJob({ completedAt: undefined });

            // Act
            render(<JobStatusCard job={job} />);

            // Assert
            expect(screen.queryByText('Completed:')).not.toBeInTheDocument();
        });

        it('should render Duration when available', () => {
            // Arrange
            const job = createMockJob({ actualDurationMs: 5000 });

            // Act
            render(<JobStatusCard job={job} />);

            // Assert
            expect(screen.getByText('Duration:')).toBeInTheDocument();
        });

        it('should not render Duration when not available', () => {
            // Arrange
            const job = createMockJob({ actualDurationMs: undefined });

            // Act
            render(<JobStatusCard job={job} />);

            // Assert
            expect(screen.queryByText('Duration:')).not.toBeInTheDocument();
        });
    });

    describe('Rendering (Compact Mode)', () => {
        it('should render job type in compact view', () => {
            // Arrange
            const job = createMockJob({ jobType: JobType.BulkAssetTokenGeneration });

            // Act
            render(<JobStatusCard job={job} compact />);

            // Assert
            expect(screen.getByText('Token Generation')).toBeInTheDocument();
        });

        it('should render item counts in compact view', () => {
            // Arrange
            const job = createMockJob({ totalItems: 20, completedItems: 15, failedItems: 2 });

            // Act
            render(<JobStatusCard job={job} compact />);

            // Assert
            expect(screen.getByText(/15\/20 items/)).toBeInTheDocument();
        });

        it('should render failed count in compact view when failures exist', () => {
            // Arrange
            const job = createMockJob({ failedItems: 3 });

            // Act
            render(<JobStatusCard job={job} compact />);

            // Assert
            expect(screen.getByText(/\(3 failed\)/)).toBeInTheDocument();
        });

        it('should not render failed count in compact view when no failures', () => {
            // Arrange
            const job = createMockJob({ failedItems: 0 });

            // Act
            render(<JobStatusCard job={job} compact />);

            // Assert
            expect(screen.queryByText(/failed/)).not.toBeInTheDocument();
        });

        it('should render status chip in compact view', () => {
            // Arrange
            const job = createMockJob({ status: JobStatus.InProgress });

            // Act
            render(<JobStatusCard job={job} compact />);

            // Assert
            expect(screen.getByText('In Progress')).toBeInTheDocument();
        });

        it('should render progress bar for InProgress jobs in compact mode', () => {
            // Arrange
            const job = createMockJob({ status: JobStatus.InProgress });

            // Act
            render(<JobStatusCard job={job} compact />);

            // Assert
            expect(screen.getByRole('progressbar')).toBeInTheDocument();
        });

        it('should not render progress bar for Completed jobs in compact mode', () => {
            // Arrange
            const job = createMockJob({ status: JobStatus.Completed });

            // Act
            render(<JobStatusCard job={job} compact />);

            // Assert
            expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
        });

        it('should not render progress bar for Pending jobs in compact mode', () => {
            // Arrange
            const job = createMockJob({ status: JobStatus.Pending });

            // Act
            render(<JobStatusCard job={job} compact />);

            // Assert
            expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
        });

        it('should not render progress bar for Canceled jobs in compact mode', () => {
            // Arrange
            const job = createMockJob({ status: JobStatus.Canceled });

            // Act
            render(<JobStatusCard job={job} compact />);

            // Assert
            expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
        });

        it('should not render job ID in compact mode', () => {
            // Arrange
            const job = createMockJob({ jobId: 'job-xyz' });

            // Act
            render(<JobStatusCard job={job} compact />);

            // Assert
            expect(screen.queryByText(/ID:/)).not.toBeInTheDocument();
        });

        it('should not render date information in compact mode', () => {
            // Arrange
            const job = createMockJob({
                createdAt: '2024-01-15T10:30:00Z',
                startedAt: '2024-01-15T10:31:00Z',
                completedAt: '2024-01-15T10:35:00Z',
            });

            // Act
            render(<JobStatusCard job={job} compact />);

            // Assert
            expect(screen.queryByText('Created:')).not.toBeInTheDocument();
            expect(screen.queryByText('Started:')).not.toBeInTheDocument();
            expect(screen.queryByText('Completed:')).not.toBeInTheDocument();
        });
    });

    describe('Status Chip Colors', () => {
        it('should render default chip for Pending status', () => {
            // Arrange
            const job = createMockJob({ status: JobStatus.Pending });

            // Act
            render(<JobStatusCard job={job} />);

            // Assert
            const chip = screen.getByText('Pending').closest('.MuiChip-root');
            expect(chip).toHaveClass('MuiChip-colorDefault');
        });

        it('should render primary chip for InProgress status', () => {
            // Arrange
            const job = createMockJob({ status: JobStatus.InProgress });

            // Act
            render(<JobStatusCard job={job} />);

            // Assert
            const chip = screen.getByText('In Progress').closest('.MuiChip-root');
            expect(chip).toHaveClass('MuiChip-colorPrimary');
        });

        it('should render success chip for Completed status with no failures', () => {
            // Arrange
            const job = createMockJob({ status: JobStatus.Completed, failedItems: 0 });

            // Act
            render(<JobStatusCard job={job} />);

            // Assert
            const chip = screen.getByText('Completed').closest('.MuiChip-root');
            expect(chip).toHaveClass('MuiChip-colorSuccess');
        });

        it('should render warning chip for Completed status with failures', () => {
            // Arrange
            const job = createMockJob({ status: JobStatus.Completed, failedItems: 2 });

            // Act
            render(<JobStatusCard job={job} />);

            // Assert
            const chip = screen.getByText('Completed').closest('.MuiChip-root');
            expect(chip).toHaveClass('MuiChip-colorWarning');
        });

        it('should render default chip for Canceled status', () => {
            // Arrange
            const job = createMockJob({ status: JobStatus.Canceled });

            // Act
            render(<JobStatusCard job={job} />);

            // Assert
            const chip = screen.getByText('Canceled').closest('.MuiChip-root');
            expect(chip).toHaveClass('MuiChip-colorDefault');
        });
    });

    describe('Job Type Labels', () => {
        it('should display "Portrait Generation" for BulkAssetPortraitGeneration', () => {
            // Arrange
            const job = createMockJob({ jobType: JobType.BulkAssetPortraitGeneration });

            // Act
            render(<JobStatusCard job={job} />);

            // Assert
            expect(screen.getByRole('heading', { level: 6 })).toHaveTextContent('Portrait Generation');
        });

        it('should display "Token Generation" for BulkAssetTokenGeneration', () => {
            // Arrange
            const job = createMockJob({ jobType: JobType.BulkAssetTokenGeneration });

            // Act
            render(<JobStatusCard job={job} />);

            // Assert
            expect(screen.getByRole('heading', { level: 6 })).toHaveTextContent('Token Generation');
        });

        it('should display type name as-is for unknown type', () => {
            // Arrange
            const job = createMockJob({ jobType: 'UnknownJobType' as JobType });

            // Act
            render(<JobStatusCard job={job} />);

            // Assert
            expect(screen.getByRole('heading', { level: 6 })).toHaveTextContent('UnknownJobType');
        });
    });

    describe('Cancel Button', () => {
        it('should show cancel button for Pending jobs with onCancel', () => {
            // Arrange
            const onCancel = vi.fn();
            const job = createMockJob({ status: JobStatus.Pending });

            // Act
            render(<JobStatusCard job={job} onCancel={onCancel} />);

            // Assert
            expect(screen.getByRole('button', { name: /cancel job/i })).toBeInTheDocument();
        });

        it('should show cancel button for InProgress jobs with onCancel', () => {
            // Arrange
            const onCancel = vi.fn();
            const job = createMockJob({ status: JobStatus.InProgress });

            // Act
            render(<JobStatusCard job={job} onCancel={onCancel} />);

            // Assert
            expect(screen.getByRole('button', { name: /cancel job/i })).toBeInTheDocument();
        });

        it('should not show cancel button for Completed jobs', () => {
            // Arrange
            const onCancel = vi.fn();
            const job = createMockJob({ status: JobStatus.Completed });

            // Act
            render(<JobStatusCard job={job} onCancel={onCancel} />);

            // Assert
            expect(screen.queryByRole('button', { name: /cancel job/i })).not.toBeInTheDocument();
        });

        it('should not show cancel button for Canceled jobs', () => {
            // Arrange
            const onCancel = vi.fn();
            const job = createMockJob({ status: JobStatus.Canceled });

            // Act
            render(<JobStatusCard job={job} onCancel={onCancel} />);

            // Assert
            expect(screen.queryByRole('button', { name: /cancel job/i })).not.toBeInTheDocument();
        });

        it('should not show cancel button when onCancel is not provided', () => {
            // Arrange
            const job = createMockJob({ status: JobStatus.Pending });

            // Act
            render(<JobStatusCard job={job} />);

            // Assert
            expect(screen.queryByRole('button', { name: /cancel job/i })).not.toBeInTheDocument();
        });

        it('should call onCancel with jobId when clicked', async () => {
            // Arrange
            const user = userEvent.setup();
            const onCancel = vi.fn();
            const job = createMockJob({ jobId: 'cancel-me-123', status: JobStatus.InProgress });

            render(<JobStatusCard job={job} onCancel={onCancel} />);

            // Act
            await user.click(screen.getByRole('button', { name: /cancel job/i }));

            // Assert
            expect(onCancel).toHaveBeenCalledTimes(1);
            expect(onCancel).toHaveBeenCalledWith('cancel-me-123');
        });
    });

    describe('Retry Button', () => {
        it('should show retry button for Completed jobs with failures and onRetry', () => {
            // Arrange
            const onRetry = vi.fn();
            const job = createMockJob({ status: JobStatus.Completed, failedItems: 3 });

            // Act
            render(<JobStatusCard job={job} onRetry={onRetry} />);

            // Assert
            expect(screen.getByRole('button', { name: /retry failed items/i })).toBeInTheDocument();
        });

        it('should not show retry button when no failures', () => {
            // Arrange
            const onRetry = vi.fn();
            const job = createMockJob({ status: JobStatus.Completed, failedItems: 0 });

            // Act
            render(<JobStatusCard job={job} onRetry={onRetry} />);

            // Assert
            expect(screen.queryByRole('button', { name: /retry failed items/i })).not.toBeInTheDocument();
        });

        it('should not show retry button for Pending jobs even with failures', () => {
            // Arrange
            const onRetry = vi.fn();
            const job = createMockJob({ status: JobStatus.Pending, failedItems: 2 });

            // Act
            render(<JobStatusCard job={job} onRetry={onRetry} />);

            // Assert
            expect(screen.queryByRole('button', { name: /retry failed items/i })).not.toBeInTheDocument();
        });

        it('should not show retry button for InProgress jobs even with failures', () => {
            // Arrange
            const onRetry = vi.fn();
            const job = createMockJob({ status: JobStatus.InProgress, failedItems: 2 });

            // Act
            render(<JobStatusCard job={job} onRetry={onRetry} />);

            // Assert
            expect(screen.queryByRole('button', { name: /retry failed items/i })).not.toBeInTheDocument();
        });

        it('should not show retry button when onRetry is not provided', () => {
            // Arrange
            const job = createMockJob({ status: JobStatus.Completed, failedItems: 3 });

            // Act
            render(<JobStatusCard job={job} />);

            // Assert
            expect(screen.queryByRole('button', { name: /retry failed items/i })).not.toBeInTheDocument();
        });

        it('should call onRetry with jobId when clicked', async () => {
            // Arrange
            const user = userEvent.setup();
            const onRetry = vi.fn();
            const job = createMockJob({ jobId: 'retry-me-456', status: JobStatus.Completed, failedItems: 2 });

            render(<JobStatusCard job={job} onRetry={onRetry} />);

            // Act
            await user.click(screen.getByRole('button', { name: /retry failed items/i }));

            // Assert
            expect(onRetry).toHaveBeenCalledTimes(1);
            expect(onRetry).toHaveBeenCalledWith('retry-me-456');
        });
    });

    describe('View Details (Compact Mode)', () => {
        it('should call onViewDetails when compact card is clicked', async () => {
            // Arrange
            const user = userEvent.setup();
            const onViewDetails = vi.fn();
            const job = createMockJob({ jobId: 'view-me-789' });

            render(<JobStatusCard job={job} onViewDetails={onViewDetails} compact />);

            // Act
            const card = screen.getByText('Portrait Generation').closest('div[class*="MuiPaper"]');
            await user.click(card!);

            // Assert
            expect(onViewDetails).toHaveBeenCalledTimes(1);
            expect(onViewDetails).toHaveBeenCalledWith('view-me-789');
        });

        it('should not call onViewDetails when onViewDetails is not provided', async () => {
            // Arrange
            const user = userEvent.setup();
            const job = createMockJob();

            render(<JobStatusCard job={job} compact />);

            // Act
            const card = screen.getByText('Portrait Generation').closest('div[class*="MuiPaper"]');
            await user.click(card!);

            // Assert - no error thrown, component handles gracefully
            expect(card).toBeInTheDocument();
        });

        it('should have pointer cursor when onViewDetails is provided in compact mode', () => {
            // Arrange
            const onViewDetails = vi.fn();
            const job = createMockJob();

            // Act
            render(<JobStatusCard job={job} onViewDetails={onViewDetails} compact />);

            // Assert
            const card = screen.getByText('Portrait Generation').closest('div[class*="MuiPaper"]');
            expect(card).toHaveStyle({ cursor: 'pointer' });
        });

        it('should not have pointer cursor when onViewDetails is not provided in compact mode', () => {
            // Arrange
            const job = createMockJob();

            // Act
            render(<JobStatusCard job={job} compact />);

            // Assert
            const card = screen.getByText('Portrait Generation').closest('div[class*="MuiPaper"]');
            expect(card).toHaveStyle({ cursor: 'default' });
        });
    });

    describe('Duration Formatting', () => {
        it('should format milliseconds correctly', () => {
            // Arrange
            const job = createMockJob({ actualDurationMs: 500 });

            // Act
            render(<JobStatusCard job={job} />);

            // Assert
            expect(screen.getByText('500ms')).toBeInTheDocument();
        });

        it('should format seconds correctly', () => {
            // Arrange
            const job = createMockJob({ actualDurationMs: 5500 });

            // Act
            render(<JobStatusCard job={job} />);

            // Assert
            expect(screen.getByText('5.5s')).toBeInTheDocument();
        });

        it('should format minutes correctly', () => {
            // Arrange
            const job = createMockJob({ actualDurationMs: 90000 });

            // Act
            render(<JobStatusCard job={job} />);

            // Assert
            expect(screen.getByText('1.5m')).toBeInTheDocument();
        });

        it('should format duration at boundary of seconds', () => {
            // Arrange
            const job = createMockJob({ actualDurationMs: 1000 });

            // Act
            render(<JobStatusCard job={job} />);

            // Assert
            expect(screen.getByText('1.0s')).toBeInTheDocument();
        });

        it('should format duration at boundary of minutes', () => {
            // Arrange
            const job = createMockJob({ actualDurationMs: 60000 });

            // Act
            render(<JobStatusCard job={job} />);

            // Assert
            expect(screen.getByText('1.0m')).toBeInTheDocument();
        });

        it('should show dash when duration is undefined', () => {
            // Arrange
            const job = createMockJob({ actualDurationMs: undefined });

            // Act
            render(<JobStatusCard job={job} />);

            // Assert
            expect(screen.queryByText('Duration:')).not.toBeInTheDocument();
        });

        it('should show dash when duration is zero', () => {
            // Arrange
            const job = createMockJob({ actualDurationMs: 0 });

            // Act
            render(<JobStatusCard job={job} />);

            // Assert
            // When duration is 0, formatDuration returns '-' and the row is not shown
            expect(screen.queryByText('Duration:')).not.toBeInTheDocument();
        });
    });

    describe('Progress Calculation', () => {
        it('should show 0% progress when no items processed', () => {
            // Arrange
            const job = createMockJob({ totalItems: 10, completedItems: 0, failedItems: 0 });

            // Act
            render(<JobStatusCard job={job} />);

            // Assert
            const progressBar = screen.getByRole('progressbar');
            expect(progressBar).toHaveAttribute('aria-valuenow', '0');
        });

        it('should show correct progress for partial completion', () => {
            // Arrange
            const job = createMockJob({ totalItems: 10, completedItems: 5, failedItems: 0 });

            // Act
            render(<JobStatusCard job={job} />);

            // Assert
            const progressBar = screen.getByRole('progressbar');
            expect(progressBar).toHaveAttribute('aria-valuenow', '50');
        });

        it('should show 100% progress when all items processed', () => {
            // Arrange
            const job = createMockJob({ totalItems: 10, completedItems: 8, failedItems: 2 });

            // Act
            render(<JobStatusCard job={job} />);

            // Assert
            const progressBar = screen.getByRole('progressbar');
            expect(progressBar).toHaveAttribute('aria-valuenow', '100');
        });

        it('should handle zero total items gracefully', () => {
            // Arrange
            const job = createMockJob({ totalItems: 0, completedItems: 0, failedItems: 0 });

            // Act
            render(<JobStatusCard job={job} />);

            // Assert
            const progressBar = screen.getByRole('progressbar');
            expect(progressBar).toHaveAttribute('aria-valuenow', '0');
        });
    });

    describe('Progress Bar Color', () => {
        it('should show warning color progress bar when there are failures', () => {
            // Arrange
            const job = createMockJob({ failedItems: 2 });

            // Act
            render(<JobStatusCard job={job} />);

            // Assert
            const progressBar = screen.getByRole('progressbar');
            expect(progressBar).toHaveClass('MuiLinearProgress-colorWarning');
        });

        it('should show primary color progress bar when no failures', () => {
            // Arrange
            const job = createMockJob({ failedItems: 0 });

            // Act
            render(<JobStatusCard job={job} />);

            // Assert
            const progressBar = screen.getByRole('progressbar');
            expect(progressBar).toHaveClass('MuiLinearProgress-colorPrimary');
        });
    });

    describe('Status Label Formatting', () => {
        it('should display "In Progress" with space for InProgress status', () => {
            // Arrange
            const job = createMockJob({ status: JobStatus.InProgress });

            // Act
            render(<JobStatusCard job={job} />);

            // Assert
            expect(screen.getByText('In Progress')).toBeInTheDocument();
        });

        it('should display "Pending" as-is for Pending status', () => {
            // Arrange
            const job = createMockJob({ status: JobStatus.Pending });

            // Act
            render(<JobStatusCard job={job} />);

            // Assert
            expect(screen.getByText('Pending')).toBeInTheDocument();
        });

        it('should display "Completed" as-is for Completed status', () => {
            // Arrange
            const job = createMockJob({ status: JobStatus.Completed });

            // Act
            render(<JobStatusCard job={job} />);

            // Assert
            expect(screen.getByText('Completed')).toBeInTheDocument();
        });

        it('should display "Canceled" as-is for Canceled status', () => {
            // Arrange
            const job = createMockJob({ status: JobStatus.Canceled });

            // Act
            render(<JobStatusCard job={job} />);

            // Assert
            expect(screen.getByText('Canceled')).toBeInTheDocument();
        });
    });

    describe('Compact Mode Defaults', () => {
        it('should default to normal mode when compact prop is not provided', () => {
            // Arrange
            const job = createMockJob();

            // Act
            render(<JobStatusCard job={job} />);

            // Assert - normal mode shows ID, compact does not
            expect(screen.getByText(/ID:/)).toBeInTheDocument();
        });

        it('should use compact mode when compact is true', () => {
            // Arrange
            const job = createMockJob();

            // Act
            render(<JobStatusCard job={job} compact={true} />);

            // Assert
            expect(screen.queryByText(/ID:/)).not.toBeInTheDocument();
        });

        it('should use normal mode when compact is false', () => {
            // Arrange
            const job = createMockJob();

            // Act
            render(<JobStatusCard job={job} compact={false} />);

            // Assert
            expect(screen.getByText(/ID:/)).toBeInTheDocument();
        });
    });
});
