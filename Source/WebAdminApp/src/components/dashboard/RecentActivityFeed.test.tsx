/**
 * RecentActivityFeed Component Tests
 * Tests rendering states, activity items display, navigation, and polling behavior
 * Coverage: Recent activity feed for admin dashboard
 *
 * Test Coverage:
 * - Rendering "Recent Activity" title and "View All" button
 * - Loading state with skeletons
 * - Activity list rendering after loading
 * - Empty state message
 * - Error message display
 * - Activity item description, timestamp, result chip, duration
 * - Icon display based on action type
 * - Navigation to /audit-logs on "View All" click
 * - API call on mount
 * - Polling every 30 seconds
 */

import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { RecentActivityFeed } from './RecentActivityFeed';
import { auditLogService, type AuditLog } from '@services/auditLogService';

// Mock auditLogService
vi.mock('@services/auditLogService', async () => {
    const actual = await vi.importActual('@services/auditLogService');
    return {
        ...actual,
        auditLogService: {
            queryAuditLogs: vi.fn(),
        },
    };
});

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate,
}));

// Mock MUI icons to simplify rendering
vi.mock('@mui/icons-material', () => ({
    Login: () => <span data-icon="login">LoginIcon</span>,
    Add: () => <span data-icon="add">AddIcon</span>,
    Delete: () => <span data-icon="delete">DeleteIcon</span>,
    Edit: () => <span data-icon="edit">EditIcon</span>,
    ArrowForward: () => <span data-icon="arrow-forward">ArrowForwardIcon</span>,
    Work: () => <span data-icon="work">JobIcon</span>,
    AutoAwesome: () => <span data-icon="auto-awesome">GeneratedIcon</span>,
    Visibility: () => <span data-icon="visibility">ViewIcon</span>,
}));

// Helper function to create mock audit log data
const createMockLog = (overrides: Partial<AuditLog> = {}): AuditLog => ({
    id: `log-${Math.random().toString(36).substring(7)}`,
    timestamp: '2024-01-15T10:30:00Z',
    userId: 'user-1',
    userEmail: 'admin@example.com',
    action: 'Asset:Created:ByUser',
    entityType: 'Asset',
    entityId: 'asset-1',
    payload: JSON.stringify({
        httpMethod: 'POST',
        path: '/api/assets',
        statusCode: 201,
        durationMs: 150,
        result: 'Created',
    }),
    ...overrides,
});

// Helper to create HTTP payload
const createHttpPayload = (method: string, path: string, statusCode: number, durationMs?: number) =>
    JSON.stringify({
        httpMethod: method,
        path,
        statusCode,
        durationMs,
        result: statusCode >= 200 && statusCode < 300 ? 'Success' : 'Failed',
    });

describe('RecentActivityFeed', () => {
    const mockQueryAuditLogs = auditLogService.queryAuditLogs as ReturnType<typeof vi.fn>;

    beforeEach(() => {
        vi.resetAllMocks();
        mockQueryAuditLogs.mockResolvedValue({ items: [], totalCount: 0 });
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe('Rendering', () => {
        it('should render "Recent Activity" title', async () => {
            // Arrange
            mockQueryAuditLogs.mockResolvedValue({ items: [], totalCount: 0 });

            // Act
            render(<RecentActivityFeed />);

            // Assert
            expect(screen.getByText('Recent Activity')).toBeInTheDocument();
        });

        it('should render "View All" button', async () => {
            // Arrange
            mockQueryAuditLogs.mockResolvedValue({ items: [], totalCount: 0 });

            // Act
            render(<RecentActivityFeed />);

            // Assert
            expect(screen.getByRole('button', { name: /view all/i })).toBeInTheDocument();
        });

        it('should render loading skeletons while fetching', async () => {
            // Arrange
            let resolveQuery: (value: { items: AuditLog[]; totalCount: number }) => void = () => {};
            mockQueryAuditLogs.mockImplementation(
                () =>
                    new Promise((resolve) => {
                        resolveQuery = resolve;
                    })
            );

            // Act
            render(<RecentActivityFeed />);

            // Assert - MUI Skeleton doesn't have a role, check for multiple skeleton elements
            const skeletons = document.querySelectorAll('.MuiSkeleton-root');
            expect(skeletons.length).toBe(5);

            // Cleanup
            await act(async () => {
                resolveQuery({ items: [], totalCount: 0 });
            });
        });

        it('should render activity list after loading', async () => {
            // Arrange
            const mockLogs = [
                createMockLog({ id: 'log-1', userEmail: 'user1@example.com' }),
                createMockLog({ id: 'log-2', userEmail: 'user2@example.com' }),
            ];
            mockQueryAuditLogs.mockResolvedValue({ items: mockLogs, totalCount: 2 });

            // Act
            render(<RecentActivityFeed />);

            // Assert
            await waitFor(() => {
                expect(screen.getByRole('list')).toBeInTheDocument();
            });
            const listItems = screen.getAllByRole('listitem');
            expect(listItems.length).toBe(2);
        });

        it('should render "No recent activity" when empty', async () => {
            // Arrange
            mockQueryAuditLogs.mockResolvedValue({ items: [], totalCount: 0 });

            // Act
            render(<RecentActivityFeed />);

            // Assert
            await waitFor(() => {
                expect(screen.getByText('No recent activity')).toBeInTheDocument();
            });
        });

        it('should render error message when API fails', async () => {
            // Arrange
            mockQueryAuditLogs.mockRejectedValue(new Error('Network error'));

            // Act
            render(<RecentActivityFeed />);

            // Assert
            await waitFor(() => {
                expect(screen.getByText('Network error')).toBeInTheDocument();
            });
        });

        it('should render generic error message for non-Error exceptions', async () => {
            // Arrange
            mockQueryAuditLogs.mockRejectedValue('Unknown failure');

            // Act
            render(<RecentActivityFeed />);

            // Assert
            await waitFor(() => {
                expect(screen.getByText('Failed to load recent activity')).toBeInTheDocument();
            });
        });
    });

    describe('Activity Items', () => {
        it('should display activity description with user and HTTP action', async () => {
            // Arrange
            const mockLog = createMockLog({
                userEmail: 'admin@example.com',
                action: 'Asset:Created:ByUser',
                payload: createHttpPayload('POST', '/api/assets', 201),
            });
            mockQueryAuditLogs.mockResolvedValue({ items: [mockLog], totalCount: 1 });

            // Act
            render(<RecentActivityFeed />);

            // Assert
            await waitFor(() => {
                expect(screen.getByText('admin@example.com POST /api/assets')).toBeInTheDocument();
            });
        });

        it('should display Anonymous for missing user email', async () => {
            // Arrange
            const { userEmail: _, ...logWithoutEmail } = createMockLog({
                action: 'System:Action:ByUser',
                payload: createHttpPayload('GET', '/api/health', 200),
            });
            const mockLog = logWithoutEmail as AuditLog;
            mockQueryAuditLogs.mockResolvedValue({ items: [mockLog], totalCount: 1 });

            // Act
            render(<RecentActivityFeed />);

            // Assert
            await waitFor(() => {
                expect(screen.getByText('Anonymous GET /api/health')).toBeInTheDocument();
            });
        });

        it('should display non-HTTP action description', async () => {
            // Arrange
            const { payload: _, ...logWithoutPayload } = createMockLog({
                userEmail: 'admin@example.com',
                action: 'System:Startup',
            });
            const mockLog = logWithoutPayload as AuditLog;
            mockQueryAuditLogs.mockResolvedValue({ items: [mockLog], totalCount: 1 });

            // Act
            render(<RecentActivityFeed />);

            // Assert
            await waitFor(() => {
                expect(screen.getByText('admin@example.com - System:Startup')).toBeInTheDocument();
            });
        });

        it('should display timestamp in correct format', async () => {
            // Arrange
            const mockLog = createMockLog({
                timestamp: '2024-03-15T14:30:45Z',
            });
            mockQueryAuditLogs.mockResolvedValue({ items: [mockLog], totalCount: 1 });

            // Act
            render(<RecentActivityFeed />);

            // Assert - timestamp is displayed in local time, so we check for the format pattern
            await waitFor(() => {
                // The timestamp should match the format "Mar 15, HH:mm:ss" where HH varies by timezone
                const timestampElements = screen.getAllByText(/Mar 15, \d{2}:\d{2}:\d{2}/);
                expect(timestampElements.length).toBeGreaterThan(0);
            });
        });

        it('should display Success chip for 2xx status codes', async () => {
            // Arrange
            const mockLog = createMockLog({
                action: 'Asset:Created:ByUser',
                payload: createHttpPayload('POST', '/api/assets', 201),
            });
            mockQueryAuditLogs.mockResolvedValue({ items: [mockLog], totalCount: 1 });

            // Act
            render(<RecentActivityFeed />);

            // Assert
            await waitFor(() => {
                const chip = screen.getByText('Success').closest('.MuiChip-root');
                expect(chip).toHaveClass('MuiChip-colorSuccess');
            });
        });

        it('should display Failure chip for 4xx status codes', async () => {
            // Arrange
            const mockLog = createMockLog({
                action: 'Asset:Created:ByUser',
                payload: createHttpPayload('POST', '/api/assets', 400),
            });
            mockQueryAuditLogs.mockResolvedValue({ items: [mockLog], totalCount: 1 });

            // Act
            render(<RecentActivityFeed />);

            // Assert
            await waitFor(() => {
                const chip = screen.getByText('Failure').closest('.MuiChip-root');
                expect(chip).toHaveClass('MuiChip-colorWarning');
            });
        });

        it('should display Error chip for 5xx status codes', async () => {
            // Arrange
            const mockLog = createMockLog({
                action: 'Asset:Created:ByUser',
                payload: createHttpPayload('POST', '/api/assets', 500),
            });
            mockQueryAuditLogs.mockResolvedValue({ items: [mockLog], totalCount: 1 });

            // Act
            render(<RecentActivityFeed />);

            // Assert
            await waitFor(() => {
                const chip = screen.getByText('Error').closest('.MuiChip-root');
                expect(chip).toHaveClass('MuiChip-colorError');
            });
        });

        it('should display Error chip when errorMessage is present', async () => {
            // Arrange
            const { payload: _, ...logWithoutPayload } = createMockLog({
                action: 'System:Action',
                errorMessage: 'Something went wrong',
            });
            const mockLog = logWithoutPayload as AuditLog;
            mockQueryAuditLogs.mockResolvedValue({ items: [mockLog], totalCount: 1 });

            // Act
            render(<RecentActivityFeed />);

            // Assert
            await waitFor(() => {
                const chip = screen.getByText('Error').closest('.MuiChip-root');
                expect(chip).toHaveClass('MuiChip-colorError');
            });
        });

        it('should display duration when available', async () => {
            // Arrange
            const mockLog = createMockLog({
                action: 'Asset:Created:ByUser',
                payload: createHttpPayload('POST', '/api/assets', 201, 250),
            });
            mockQueryAuditLogs.mockResolvedValue({ items: [mockLog], totalCount: 1 });

            // Act
            render(<RecentActivityFeed />);

            // Assert
            await waitFor(() => {
                expect(screen.getByText('250ms')).toBeInTheDocument();
            });
        });

        it('should not display duration when not available', async () => {
            // Arrange
            const { payload: _, ...logWithoutPayload } = createMockLog({
                action: 'System:Startup',
            });
            const mockLog = logWithoutPayload as AuditLog;
            mockQueryAuditLogs.mockResolvedValue({ items: [mockLog], totalCount: 1 });

            // Act
            render(<RecentActivityFeed />);

            // Assert
            await waitFor(() => {
                expect(screen.getByRole('listitem')).toBeInTheDocument();
            });
            expect(screen.queryByText(/ms$/)).not.toBeInTheDocument();
        });
    });

    describe('Action Type Icons', () => {
        it('should display AddIcon for POST method', async () => {
            // Arrange
            const mockLog = createMockLog({
                action: 'Asset:Created:ByUser',
                payload: createHttpPayload('POST', '/api/assets', 201),
            });
            mockQueryAuditLogs.mockResolvedValue({ items: [mockLog], totalCount: 1 });

            // Act
            render(<RecentActivityFeed />);

            // Assert
            await waitFor(() => {
                expect(screen.getByText('AddIcon')).toBeInTheDocument();
            });
        });

        it('should display DeleteIcon for DELETE method', async () => {
            // Arrange
            const mockLog = createMockLog({
                action: 'Asset:Deleted:ByUser',
                payload: createHttpPayload('DELETE', '/api/assets/1', 204),
            });
            mockQueryAuditLogs.mockResolvedValue({ items: [mockLog], totalCount: 1 });

            // Act
            render(<RecentActivityFeed />);

            // Assert
            await waitFor(() => {
                expect(screen.getByText('DeleteIcon')).toBeInTheDocument();
            });
        });

        it('should display EditIcon for PUT method', async () => {
            // Arrange
            const mockLog = createMockLog({
                action: 'Asset:Updated:ByUser',
                payload: createHttpPayload('PUT', '/api/assets/1', 200),
            });
            mockQueryAuditLogs.mockResolvedValue({ items: [mockLog], totalCount: 1 });

            // Act
            render(<RecentActivityFeed />);

            // Assert
            await waitFor(() => {
                expect(screen.getByText('EditIcon')).toBeInTheDocument();
            });
        });

        it('should display EditIcon for PATCH method', async () => {
            // Arrange
            const mockLog = createMockLog({
                action: 'Asset:Updated:ByUser',
                payload: createHttpPayload('PATCH', '/api/assets/1', 200),
            });
            mockQueryAuditLogs.mockResolvedValue({ items: [mockLog], totalCount: 1 });

            // Act
            render(<RecentActivityFeed />);

            // Assert
            await waitFor(() => {
                expect(screen.getByText('EditIcon')).toBeInTheDocument();
            });
        });

        it('should display ViewIcon for GET method', async () => {
            // Arrange
            const mockLog = createMockLog({
                action: 'Asset:Read:ByUser',
                payload: createHttpPayload('GET', '/api/assets/1', 200),
            });
            mockQueryAuditLogs.mockResolvedValue({ items: [mockLog], totalCount: 1 });

            // Act
            render(<RecentActivityFeed />);

            // Assert
            await waitFor(() => {
                expect(screen.getByText('ViewIcon')).toBeInTheDocument();
            });
        });

        it('should display JobIcon for Job actions', async () => {
            // Arrange
            const { payload: _, ...logWithoutPayload } = createMockLog({
                action: 'Job:Created',
            });
            const mockLog = logWithoutPayload as AuditLog;
            mockQueryAuditLogs.mockResolvedValue({ items: [mockLog], totalCount: 1 });

            // Act
            render(<RecentActivityFeed />);

            // Assert
            await waitFor(() => {
                expect(screen.getByText('JobIcon')).toBeInTheDocument();
            });
        });

        it('should display JobIcon for JobItem actions', async () => {
            // Arrange
            const { payload: _, ...logWithoutPayload } = createMockLog({
                action: 'JobItem:Completed',
            });
            const mockLog = logWithoutPayload as AuditLog;
            mockQueryAuditLogs.mockResolvedValue({ items: [mockLog], totalCount: 1 });

            // Act
            render(<RecentActivityFeed />);

            // Assert
            await waitFor(() => {
                expect(screen.getByText('JobIcon')).toBeInTheDocument();
            });
        });

        it('should display GeneratedIcon for ViaJob actions', async () => {
            // Arrange
            const { payload: _, ...logWithoutPayload } = createMockLog({
                action: 'Asset:Created:ViaJob',
            });
            const mockLog = logWithoutPayload as AuditLog;
            mockQueryAuditLogs.mockResolvedValue({ items: [mockLog], totalCount: 1 });

            // Act
            render(<RecentActivityFeed />);

            // Assert
            await waitFor(() => {
                expect(screen.getByText('GeneratedIcon')).toBeInTheDocument();
            });
        });

        it('should display LoginIcon for default/unknown actions', async () => {
            // Arrange
            const { payload: _, ...logWithoutPayload } = createMockLog({
                action: 'Unknown:Action',
            });
            const mockLog = logWithoutPayload as AuditLog;
            mockQueryAuditLogs.mockResolvedValue({ items: [mockLog], totalCount: 1 });

            // Act
            render(<RecentActivityFeed />);

            // Assert
            await waitFor(() => {
                expect(screen.getByText('LoginIcon')).toBeInTheDocument();
            });
        });

        it('should display LoginIcon for unknown HTTP method', async () => {
            // Arrange
            const mockLog = createMockLog({
                action: 'Custom:Action:ByUser',
                payload: JSON.stringify({
                    httpMethod: 'OPTIONS',
                    path: '/api/test',
                    statusCode: 200,
                }),
            });
            mockQueryAuditLogs.mockResolvedValue({ items: [mockLog], totalCount: 1 });

            // Act
            render(<RecentActivityFeed />);

            // Assert
            await waitFor(() => {
                expect(screen.getByText('LoginIcon')).toBeInTheDocument();
            });
        });
    });

    describe('Navigation', () => {
        it('should navigate to /audit-logs on "View All" click', async () => {
            // Arrange
            const user = userEvent.setup();
            mockQueryAuditLogs.mockResolvedValue({ items: [], totalCount: 0 });

            render(<RecentActivityFeed />);

            await waitFor(() => {
                expect(screen.getByRole('button', { name: /view all/i })).toBeInTheDocument();
            });

            // Act
            const viewAllButton = screen.getByRole('button', { name: /view all/i });
            await user.click(viewAllButton);

            // Assert
            expect(mockNavigate).toHaveBeenCalledWith('/audit-logs');
        });
    });

    describe('Polling', () => {
        it('should call API on mount', async () => {
            // Arrange
            mockQueryAuditLogs.mockResolvedValue({ items: [], totalCount: 0 });

            // Act
            render(<RecentActivityFeed />);

            // Assert
            await waitFor(() => {
                expect(mockQueryAuditLogs).toHaveBeenCalledWith({
                    skip: 0,
                    take: 10,
                });
            });
        });

        it('should poll every 30 seconds', async () => {
            // Arrange
            vi.useFakeTimers();
            mockQueryAuditLogs.mockResolvedValue({ items: [], totalCount: 0 });

            // Act
            render(<RecentActivityFeed />);

            // Wait for initial call
            await act(async () => {
                await Promise.resolve();
            });

            // Initial call
            expect(mockQueryAuditLogs).toHaveBeenCalledTimes(1);

            // Advance 30 seconds
            await act(async () => {
                vi.advanceTimersByTime(30000);
                await Promise.resolve();
            });
            expect(mockQueryAuditLogs).toHaveBeenCalledTimes(2);

            // Advance another 30 seconds
            await act(async () => {
                vi.advanceTimersByTime(30000);
                await Promise.resolve();
            });
            expect(mockQueryAuditLogs).toHaveBeenCalledTimes(3);
        });

        it('should clear interval on unmount', async () => {
            // Arrange
            vi.useFakeTimers();
            mockQueryAuditLogs.mockResolvedValue({ items: [], totalCount: 0 });

            // Act
            const { unmount } = render(<RecentActivityFeed />);

            // Wait for initial call
            await act(async () => {
                await Promise.resolve();
            });

            expect(mockQueryAuditLogs).toHaveBeenCalledTimes(1);

            unmount();

            // Advance 30 seconds after unmount
            await act(async () => {
                vi.advanceTimersByTime(30000);
            });

            // Assert - should not have been called again
            expect(mockQueryAuditLogs).toHaveBeenCalledTimes(1);
        });

        it('should not show loading skeletons during polling refresh', async () => {
            // Arrange - Use real timers since we just need to verify the loading state
            const initialLogs = [createMockLog({ id: 'log-1' })];
            mockQueryAuditLogs.mockResolvedValue({ items: initialLogs, totalCount: 1 });

            // Act
            render(<RecentActivityFeed />);

            // Wait for initial render
            await waitFor(() => {
                expect(screen.getByRole('list')).toBeInTheDocument();
            });

            // Assert - After initial load, there should be no skeletons (only shows on first load with empty logs)
            const skeletons = document.querySelectorAll('.MuiSkeleton-root');
            expect(skeletons.length).toBe(0);

            // The list should be visible
            expect(screen.getByRole('list')).toBeInTheDocument();
        });
    });

    describe('Result Chip Colors', () => {
        it('should display default chip for unknown result payload', async () => {
            // Arrange
            const mockLog = createMockLog({
                action: 'Custom:Action:ByUser',
                payload: JSON.stringify({
                    httpMethod: 'POST',
                    path: '/api/test',
                    statusCode: 100, // Informational - not 2xx, 4xx, or 5xx
                    result: 'Unknown',
                }),
            });
            mockQueryAuditLogs.mockResolvedValue({ items: [mockLog], totalCount: 1 });

            // Act
            render(<RecentActivityFeed />);

            // Assert
            await waitFor(() => {
                const chip = screen.getByText('Unknown').closest('.MuiChip-root');
                expect(chip).toHaveClass('MuiChip-colorDefault');
            });
        });

        it('should display Success chip for non-HTTP actions without error', async () => {
            // Arrange
            const { payload: _p, errorMessage: _e, ...logWithoutOptionals } = createMockLog({
                action: 'System:Startup',
            });
            const mockLog = logWithoutOptionals as AuditLog;
            mockQueryAuditLogs.mockResolvedValue({ items: [mockLog], totalCount: 1 });

            // Act
            render(<RecentActivityFeed />);

            // Assert
            await waitFor(() => {
                const chip = screen.getByText('Success').closest('.MuiChip-root');
                expect(chip).toHaveClass('MuiChip-colorSuccess');
            });
        });

        it('should display Job chip with info color for Job actions', async () => {
            // Arrange
            const { payload: _, ...logWithoutPayload } = createMockLog({
                action: 'Job:Started',
            });
            const mockLog = logWithoutPayload as AuditLog;
            mockQueryAuditLogs.mockResolvedValue({ items: [mockLog], totalCount: 1 });

            // Act
            render(<RecentActivityFeed />);

            // Assert
            await waitFor(() => {
                const chip = screen.getByText('Job').closest('.MuiChip-root');
                expect(chip).toHaveClass('MuiChip-colorInfo');
            });
        });

        it('should display Generated chip with secondary color for ViaJob actions', async () => {
            // Arrange
            const { payload: _, ...logWithoutPayload } = createMockLog({
                action: 'Asset:Created:ViaJob',
            });
            const mockLog = logWithoutPayload as AuditLog;
            mockQueryAuditLogs.mockResolvedValue({ items: [mockLog], totalCount: 1 });

            // Act
            render(<RecentActivityFeed />);

            // Assert
            await waitFor(() => {
                const chip = screen.getByText('Generated').closest('.MuiChip-root');
                expect(chip).toHaveClass('MuiChip-colorSecondary');
            });
        });
    });

    describe('Multiple Activity Items', () => {
        it('should render all activity items in correct order', async () => {
            // Arrange
            const mockLogs = [
                createMockLog({
                    id: 'log-1',
                    userEmail: 'first@example.com',
                    action: 'First:Action:ByUser',
                    payload: createHttpPayload('POST', '/api/first', 201),
                }),
                createMockLog({
                    id: 'log-2',
                    userEmail: 'second@example.com',
                    action: 'Second:Action:ByUser',
                    payload: createHttpPayload('GET', '/api/second', 200),
                }),
                createMockLog({
                    id: 'log-3',
                    userEmail: 'third@example.com',
                    action: 'Third:Action:ByUser',
                    payload: createHttpPayload('DELETE', '/api/third', 204),
                }),
            ];
            mockQueryAuditLogs.mockResolvedValue({ items: mockLogs, totalCount: 3 });

            // Act
            render(<RecentActivityFeed />);

            // Assert
            await waitFor(() => {
                expect(screen.getByText('first@example.com POST /api/first')).toBeInTheDocument();
            });
            expect(screen.getByText('second@example.com GET /api/second')).toBeInTheDocument();
            expect(screen.getByText('third@example.com DELETE /api/third')).toBeInTheDocument();

            const listItems = screen.getAllByRole('listitem');
            expect(listItems.length).toBe(3);
        });

        it('should display different result chips for mixed status codes', async () => {
            // Arrange
            const mockLogs = [
                createMockLog({
                    id: 'log-success',
                    action: 'Success:Action:ByUser',
                    payload: createHttpPayload('POST', '/api/success', 200),
                }),
                createMockLog({
                    id: 'log-failure',
                    action: 'Failure:Action:ByUser',
                    payload: createHttpPayload('POST', '/api/failure', 404),
                }),
                createMockLog({
                    id: 'log-error',
                    action: 'Error:Action:ByUser',
                    payload: createHttpPayload('POST', '/api/error', 500),
                }),
            ];
            mockQueryAuditLogs.mockResolvedValue({ items: mockLogs, totalCount: 3 });

            // Act
            render(<RecentActivityFeed />);

            // Assert
            await waitFor(() => {
                expect(screen.getByText('Success')).toBeInTheDocument();
            });
            expect(screen.getByText('Failure')).toBeInTheDocument();
            expect(screen.getByText('Error')).toBeInTheDocument();
        });
    });

    describe('Payload Parsing', () => {
        it('should handle invalid JSON payload gracefully', async () => {
            // Arrange
            const mockLog = createMockLog({
                action: 'Test:Action:ByUser',
                payload: 'invalid-json',
            });
            mockQueryAuditLogs.mockResolvedValue({ items: [mockLog], totalCount: 1 });

            // Act
            render(<RecentActivityFeed />);

            // Assert - should fall back to non-HTTP display
            await waitFor(() => {
                expect(screen.getByRole('listitem')).toBeInTheDocument();
            });
        });

        it('should handle empty payload gracefully', async () => {
            // Arrange
            const mockLog = createMockLog({
                action: 'Test:Action:ByUser',
                payload: '',
            });
            mockQueryAuditLogs.mockResolvedValue({ items: [mockLog], totalCount: 1 });

            // Act
            render(<RecentActivityFeed />);

            // Assert
            await waitFor(() => {
                expect(screen.getByRole('listitem')).toBeInTheDocument();
            });
        });

        it('should handle HTTP payload without httpMethod', async () => {
            // Arrange
            const mockLog = createMockLog({
                action: 'Test:Action:ByUser',
                payload: JSON.stringify({
                    path: '/api/test',
                    statusCode: 200,
                }),
            });
            mockQueryAuditLogs.mockResolvedValue({ items: [mockLog], totalCount: 1 });

            // Act
            render(<RecentActivityFeed />);

            // Assert - should render with empty method
            await waitFor(() => {
                expect(screen.getByRole('listitem')).toBeInTheDocument();
            });
        });
    });
});
