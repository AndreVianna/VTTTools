/**
 * BulkAssetGenerationPage Component Tests
 * Tests AI-Powered Asset Generation page with tabs, Redux integration, and SignalR hub
 * Coverage: Tab navigation, job actions, error handling, and navigation
 *
 * Test Coverage:
 * - Page title rendering
 * - Tab rendering (New Generation, Job History, Job Details)
 * - View Resources and Refresh buttons
 * - Error alert display when error state set
 * - Tab switching functionality
 * - Redux dispatch on mount (fetchJobHistory)
 * - Navigation to resources page
 * - Confirm dialog for cancel job action
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BulkAssetGenerationPage } from './BulkAssetGenerationPage';
import { JobStatus, JobType } from '@/types/jobs';
import type { JobResponse } from '@/types/jobs';

// Mock MUI icons to prevent file loading issues
vi.mock('@mui/icons-material', () => {
    const RefreshComponent = () => <span>RefreshIcon</span>;
    const OpenInNewComponent = () => <span>OpenInNewIcon</span>;
    return {
        Refresh: RefreshComponent,
        OpenInNew: OpenInNewComponent,
    };
});

// Track dispatch calls
const mockDispatch = vi.fn();
const mockUnwrap = vi.fn();

// Mock Redux hooks
vi.mock('react-redux', () => ({
    useDispatch: () => mockDispatch,
    useSelector: vi.fn((selector) => {
        // Return values based on selector function name or behavior
        const state = getMockState();
        return selector(state);
    }),
}));

// Mock navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate,
}));

// Mock SignalR hook
vi.mock('@/hooks/useJobsHub', () => ({
    useJobsHub: () => ({
        connect: vi.fn().mockResolvedValue(undefined),
        disconnect: vi.fn().mockResolvedValue(undefined),
        subscribeToJob: vi.fn().mockResolvedValue(undefined),
        unsubscribeFromJob: vi.fn().mockResolvedValue(undefined),
        connectionState: 'Disconnected',
        error: null,
        failedSubscriptions: [],
        isResubscribing: false,
        retryFailedSubscriptions: vi.fn().mockResolvedValue(undefined),
    }),
}));

// Mock child components
vi.mock('@components/aiSupport', () => ({
    BulkAssetGenerationForm: ({ onSubmit, isSubmitting, disabled }: {
        onSubmit: (request: unknown) => void;
        isSubmitting: boolean;
        disabled: boolean;
    }) => (
        <div>
            <span>Generation Form</span>
            <span>Submitting: {isSubmitting ? 'yes' : 'no'}</span>
            <span>Disabled: {disabled ? 'yes' : 'no'}</span>
            <button onClick={() => onSubmit({ items: [], generatePortrait: true, generateToken: false })}>
                Submit Form
            </button>
        </div>
    ),
    JobStatusCard: ({ job, onCancel, onRetry }: {
        job: JobResponse;
        onCancel: (jobId: string) => void;
        onRetry: (jobId: string) => void;
    }) => (
        <div>
            <span>Job Status Card</span>
            <span>Job ID: {job.jobId}</span>
            <button onClick={() => onCancel(job.jobId)}>Cancel Job</button>
            <button onClick={() => onRetry(job.jobId)}>Retry Job</button>
        </div>
    ),
    JobProgressLog: () => <div>Progress Log</div>,
    JobHistoryList: ({ onViewJob, onCancelJob, onRetryJob }: {
        jobs: JobResponse[];
        totalCount: number;
        page: number;
        rowsPerPage: number;
        isLoading: boolean;
        error: string | null;
        onPageChange: (page: number) => void;
        onRowsPerPageChange: (rpp: number) => void;
        onViewJob: (jobId: string) => void;
        onCancelJob: (jobId: string) => void;
        onRetryJob: (jobId: string) => void;
    }) => (
        <div>
            <span>Job History List</span>
            <button onClick={() => onViewJob('job-123')}>View Job</button>
            <button onClick={() => onCancelJob('job-123')}>Cancel From History</button>
            <button onClick={() => onRetryJob('job-123')}>Retry From History</button>
        </div>
    ),
}));

// Mock state configuration
let mockStateOverrides: Partial<{
    jobs: JobResponse[];
    totalCount: number;
    currentJob: JobResponse | null;
    isLoading: boolean;
    isSubmitting: boolean;
    error: string | null;
    itemUpdates: Record<string, unknown[]>;
}> = {};

function getMockState() {
    return {
        jobs: {
            jobs: mockStateOverrides.jobs ?? [],
            totalCount: mockStateOverrides.totalCount ?? 0,
            currentJob: mockStateOverrides.currentJob ?? null,
            isLoading: mockStateOverrides.isLoading ?? false,
            isSubmitting: mockStateOverrides.isSubmitting ?? false,
            error: mockStateOverrides.error ?? null,
            itemUpdates: mockStateOverrides.itemUpdates ?? {},
        },
    };
}

function setMockState(overrides: typeof mockStateOverrides) {
    mockStateOverrides = overrides;
}

// Mock async thunks
vi.mock('@store/slices/jobsSlice', async () => {
    const actual = await vi.importActual<typeof import('@store/slices/jobsSlice')>('@store/slices/jobsSlice');
    return {
        ...actual,
        fetchJobHistory: vi.fn(() => ({
            type: 'jobs/fetchJobHistory',
            payload: { skip: 0, take: 20 },
        })),
        fetchJobStatus: vi.fn((jobId: string) => ({
            type: 'jobs/fetchJobStatus',
            payload: jobId,
        })),
        startBulkGeneration: Object.assign(
            vi.fn(() => ({ type: 'jobs/startBulkGeneration' })),
            { fulfilled: { match: () => false } }
        ),
        cancelJob: Object.assign(
            vi.fn(() => ({ type: 'jobs/cancelJob' })),
            { fulfilled: { match: () => true } }
        ),
        retryJob: Object.assign(
            vi.fn(() => ({ type: 'jobs/retryJob' })),
            { fulfilled: { match: () => true } }
        ),
        clearItemUpdates: vi.fn((jobId: string) => ({
            type: 'jobs/clearItemUpdates',
            payload: jobId,
        })),
    };
});

describe('BulkAssetGenerationPage', () => {
    const mockJob: JobResponse = {
        jobId: 'job-123',
        jobType: JobType.BulkAssetPortraitGeneration,
        status: JobStatus.Pending,
        totalItems: 5,
        completedItems: 0,
        failedItems: 0,
        createdAt: '2024-01-01T00:00:00Z',
        items: [],
    };

    beforeEach(() => {
        vi.clearAllMocks();
        setMockState({});
        mockDispatch.mockReturnValue({ unwrap: mockUnwrap });
    });

    describe('Rendering', () => {
        it('should render page title "AI-Powered Asset Generation"', async () => {
            // Arrange & Act
            render(<BulkAssetGenerationPage />);

            // Assert
            expect(screen.getByRole('heading', { name: /ai-powered asset generation/i })).toBeInTheDocument();
        });

        it('should render tabs (New Generation, Job History, Job Details)', async () => {
            // Arrange & Act
            render(<BulkAssetGenerationPage />);

            // Assert
            expect(screen.getByRole('tab', { name: /new generation/i })).toBeInTheDocument();
            expect(screen.getByRole('tab', { name: /job history/i })).toBeInTheDocument();
            expect(screen.getByRole('tab', { name: /job details/i })).toBeInTheDocument();
        });

        it('should render View Resources and Refresh buttons', async () => {
            // Arrange & Act
            render(<BulkAssetGenerationPage />);

            // Assert
            expect(screen.getByRole('button', { name: /view resources/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /refresh/i })).toBeInTheDocument();
        });

        it('should display error alert when error state is set', async () => {
            // Arrange
            setMockState({ error: 'Failed to fetch jobs' });

            // Act
            render(<BulkAssetGenerationPage />);

            // Assert
            expect(screen.getByRole('alert')).toBeInTheDocument();
            expect(screen.getByText('Failed to fetch jobs')).toBeInTheDocument();
        });

        it('should not display error alert when no error', async () => {
            // Arrange
            setMockState({ error: null });

            // Act
            render(<BulkAssetGenerationPage />);

            // Assert
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });

        it('should disable Job Details tab when no current job', async () => {
            // Arrange
            setMockState({ currentJob: null });

            // Act
            render(<BulkAssetGenerationPage />);

            // Assert
            const jobDetailsTab = screen.getByRole('tab', { name: /job details/i });
            // MUI Tab uses the disabled class, not aria-disabled attribute
            expect(jobDetailsTab).toHaveClass('Mui-disabled');
        });

        it('should enable Job Details tab when current job exists', async () => {
            // Arrange
            setMockState({ currentJob: mockJob });

            // Act
            render(<BulkAssetGenerationPage />);

            // Assert
            const jobDetailsTab = screen.getByRole('tab', { name: /job details/i });
            expect(jobDetailsTab).not.toHaveAttribute('aria-disabled', 'true');
        });
    });

    describe('Tab Interactions', () => {
        it('should switch to Job History tab when clicked', async () => {
            // Arrange
            const user = userEvent.setup();
            render(<BulkAssetGenerationPage />);

            // Act
            await user.click(screen.getByRole('tab', { name: /job history/i }));

            // Assert
            const historyTab = screen.getByRole('tab', { name: /job history/i });
            expect(historyTab).toHaveAttribute('aria-selected', 'true');
            expect(screen.getByText('Job History List')).toBeInTheDocument();
        });

        it('should show Generation Form on New Generation tab', async () => {
            // Arrange & Act
            render(<BulkAssetGenerationPage />);

            // Assert - New Generation tab is selected by default
            const newGenTab = screen.getByRole('tab', { name: /new generation/i });
            expect(newGenTab).toHaveAttribute('aria-selected', 'true');
            expect(screen.getByText('Generation Form')).toBeInTheDocument();
        });

        it('should switch to Job Details tab when clicked with current job', async () => {
            // Arrange
            setMockState({ currentJob: mockJob });
            const user = userEvent.setup();
            render(<BulkAssetGenerationPage />);

            // Act
            await user.click(screen.getByRole('tab', { name: /job details/i }));

            // Assert
            const detailsTab = screen.getByRole('tab', { name: /job details/i });
            expect(detailsTab).toHaveAttribute('aria-selected', 'true');
            expect(screen.getByText('Job Status Card')).toBeInTheDocument();
        });
    });

    describe('Redux Integration', () => {
        it('should dispatch fetchJobHistory on mount', async () => {
            // Arrange & Act
            render(<BulkAssetGenerationPage />);

            // Assert
            await waitFor(() => {
                expect(mockDispatch).toHaveBeenCalled();
            });
            const dispatchCalls = mockDispatch.mock.calls;
            const fetchHistoryCall = dispatchCalls.find(
                (call) => call[0]?.type === 'jobs/fetchJobHistory'
            );
            expect(fetchHistoryCall).toBeDefined();
        });

        it('should dispatch fetchJobHistory when refresh button is clicked', async () => {
            // Arrange
            const user = userEvent.setup();
            render(<BulkAssetGenerationPage />);

            vi.clearAllMocks();

            // Act
            await user.click(screen.getByRole('button', { name: /refresh/i }));

            // Assert
            await waitFor(() => {
                const dispatchCalls = mockDispatch.mock.calls;
                const fetchHistoryCall = dispatchCalls.find(
                    (call) => call[0]?.type === 'jobs/fetchJobHistory'
                );
                expect(fetchHistoryCall).toBeDefined();
            });
        });

        it('should disable refresh button while loading', async () => {
            // Arrange
            setMockState({ isLoading: true });

            // Act
            render(<BulkAssetGenerationPage />);

            // Assert
            expect(screen.getByRole('button', { name: /refresh/i })).toBeDisabled();
        });
    });

    describe('Navigation', () => {
        it('should navigate to /admin/resources when View Resources button is clicked', async () => {
            // Arrange
            const user = userEvent.setup();
            render(<BulkAssetGenerationPage />);

            // Act
            await user.click(screen.getByRole('button', { name: /view resources/i }));

            // Assert
            expect(mockNavigate).toHaveBeenCalledWith('/admin/resources');
        });
    });

    describe('Confirm Dialog', () => {
        it('should show confirm dialog when cancel job action is triggered from history', async () => {
            // Arrange
            const user = userEvent.setup();
            render(<BulkAssetGenerationPage />);

            // Switch to Job History tab
            await user.click(screen.getByRole('tab', { name: /job history/i }));

            // Act
            await user.click(screen.getByRole('button', { name: /cancel from history/i }));

            // Assert
            await waitFor(() => {
                expect(screen.getByRole('dialog')).toBeInTheDocument();
            });
            expect(screen.getByText('Cancel Job?')).toBeInTheDocument();
            expect(screen.getByText(/are you sure you want to cancel this job/i)).toBeInTheDocument();
        });

        it('should show retry confirm dialog when retry job action is triggered', async () => {
            // Arrange
            const user = userEvent.setup();
            render(<BulkAssetGenerationPage />);

            // Switch to Job History tab
            await user.click(screen.getByRole('tab', { name: /job history/i }));

            // Act
            await user.click(screen.getByRole('button', { name: /retry from history/i }));

            // Assert
            await waitFor(() => {
                expect(screen.getByRole('dialog')).toBeInTheDocument();
            });
            expect(screen.getByText('Retry Failed Items?')).toBeInTheDocument();
            expect(screen.getByText(/this will retry all failed items/i)).toBeInTheDocument();
        });

        it('should close confirm dialog when Cancel button is clicked', async () => {
            // Arrange
            const user = userEvent.setup();
            render(<BulkAssetGenerationPage />);

            // Switch to Job History tab and trigger cancel action
            await user.click(screen.getByRole('tab', { name: /job history/i }));
            await user.click(screen.getByRole('button', { name: /cancel from history/i }));

            await waitFor(() => {
                expect(screen.getByRole('dialog')).toBeInTheDocument();
            });

            // Act - Click the Cancel button in the dialog
            const dialogCancelButton = screen.getByRole('button', { name: /^cancel$/i });
            await user.click(dialogCancelButton);

            // Assert
            await waitFor(() => {
                expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
            });
        });

        it('should dispatch cancelJob when confirm button is clicked for cancel action', async () => {
            // Arrange
            const user = userEvent.setup();
            render(<BulkAssetGenerationPage />);

            // Switch to Job History tab and trigger cancel action
            await user.click(screen.getByRole('tab', { name: /job history/i }));
            await user.click(screen.getByRole('button', { name: /cancel from history/i }));

            await waitFor(() => {
                expect(screen.getByRole('dialog')).toBeInTheDocument();
            });

            vi.clearAllMocks();

            // Act - Click the Cancel Job button in the dialog
            const confirmButton = screen.getByRole('button', { name: /cancel job/i });
            await user.click(confirmButton);

            // Assert
            await waitFor(() => {
                expect(mockDispatch).toHaveBeenCalled();
            });
        });
    });

    describe('Job Status Card Actions', () => {
        it('should show confirm dialog when cancel is triggered from JobStatusCard', async () => {
            // Arrange
            setMockState({ currentJob: mockJob });
            const user = userEvent.setup();
            render(<BulkAssetGenerationPage />);

            // Switch to Job Details tab
            await user.click(screen.getByRole('tab', { name: /job details/i }));

            // Act
            await user.click(screen.getByRole('button', { name: /cancel job/i }));

            // Assert
            await waitFor(() => {
                expect(screen.getByRole('dialog')).toBeInTheDocument();
            });
            expect(screen.getByText('Cancel Job?')).toBeInTheDocument();
        });

        it('should show retry confirm dialog when retry is triggered from JobStatusCard', async () => {
            // Arrange
            setMockState({ currentJob: mockJob });
            const user = userEvent.setup();
            render(<BulkAssetGenerationPage />);

            // Switch to Job Details tab
            await user.click(screen.getByRole('tab', { name: /job details/i }));

            // Act
            await user.click(screen.getByRole('button', { name: /retry job/i }));

            // Assert
            await waitFor(() => {
                expect(screen.getByRole('dialog')).toBeInTheDocument();
            });
            expect(screen.getByText('Retry Failed Items?')).toBeInTheDocument();
        });
    });

    describe('View Job from History', () => {
        it('should dispatch fetchJobStatus when view job is clicked from history', async () => {
            // Arrange
            const user = userEvent.setup();
            render(<BulkAssetGenerationPage />);

            // Switch to Job History tab
            await user.click(screen.getByRole('tab', { name: /job history/i }));

            vi.clearAllMocks();

            // Act
            await user.click(screen.getByRole('button', { name: /view job/i }));

            // Assert
            await waitFor(() => {
                const dispatchCalls = mockDispatch.mock.calls;
                const fetchStatusCall = dispatchCalls.find(
                    (call) => call[0]?.type === 'jobs/fetchJobStatus'
                );
                expect(fetchStatusCall).toBeDefined();
            });
        });
    });

    describe('Form Submission State', () => {
        it('should pass isSubmitting state to BulkAssetGenerationForm', async () => {
            // Arrange
            setMockState({ isSubmitting: true });

            // Act
            render(<BulkAssetGenerationPage />);

            // Assert
            expect(screen.getByText('Submitting: yes')).toBeInTheDocument();
            expect(screen.getByText('Disabled: yes')).toBeInTheDocument();
        });

        it('should pass isSubmitting=false to form when not submitting', async () => {
            // Arrange
            setMockState({ isSubmitting: false });

            // Act
            render(<BulkAssetGenerationPage />);

            // Assert
            expect(screen.getByText('Submitting: no')).toBeInTheDocument();
            expect(screen.getByText('Disabled: no')).toBeInTheDocument();
        });
    });

    describe('TabPanel Accessibility', () => {
        it('should render tabpanels with correct aria attributes', async () => {
            // Arrange & Act
            render(<BulkAssetGenerationPage />);

            // Assert
            const newGenPanel = screen.getByRole('tabpanel');
            expect(newGenPanel).toHaveAttribute('id', 'ai-support-tabpanel-0');
            expect(newGenPanel).toHaveAttribute('aria-labelledby', 'ai-support-tab-0');
        });

        it('should have correct tab aria attributes', async () => {
            // Arrange & Act
            render(<BulkAssetGenerationPage />);

            // Assert
            const newGenTab = screen.getByRole('tab', { name: /new generation/i });
            expect(newGenTab).toHaveAttribute('id', 'ai-support-tab-0');
            expect(newGenTab).toHaveAttribute('aria-controls', 'ai-support-tabpanel-0');
        });
    });
});
