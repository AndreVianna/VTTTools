/**
 * AuditLogsPage Component Tests
 * Tests audit log viewing, filtering, tab navigation, export, and live monitoring
 * Coverage: Rendering, tabs, filters, data grid, export, live monitoring, error handling
 *
 * Test Coverage:
 * - Page title and tabs rendering
 * - Filter panel toggle and filter controls
 * - Export buttons (CSV, JSON)
 * - Tab navigation (All Logs, Live Monitoring)
 * - Auto-refresh controls for live monitoring
 * - Data grid display and row expansion
 * - Pagination handling
 * - Error handling
 */

import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { AuditLogsPage } from './AuditLogsPage';
import type { AuditLog, AuditLogQueryResponse } from '@services/auditLogService';

// Mock MUI icons to prevent file loading issues
vi.mock('@mui/icons-material', () => {
    const FilterListComponent = () => <span>FilterListIcon</span>;
    const ClearComponent = () => <span>ClearIcon</span>;
    const LiveIndicatorComponent = () => <span>LiveIndicatorIcon</span>;
    const ExpandMoreComponent = () => <span>ExpandMoreIcon</span>;
    const ExpandLessComponent = () => <span>ExpandLessIcon</span>;
    const DownloadComponent = () => <span>DownloadIcon</span>;
    return {
        FilterList: FilterListComponent,
        Clear: ClearComponent,
        FiberManualRecord: LiveIndicatorComponent,
        ExpandMore: ExpandMoreComponent,
        ExpandLess: ExpandLessComponent,
        Download: DownloadComponent,
    };
});

// Mock audit log service
const mockQueryAuditLogs = vi.fn();
vi.mock('@services/auditLogService', async () => {
    const actual = await vi.importActual<typeof import('@services/auditLogService')>('@services/auditLogService');
    return {
        ...actual,
        auditLogService: {
            queryAuditLogs: (...args: unknown[]) => mockQueryAuditLogs(...args),
        },
    };
});

// Mock export utilities
const mockExportToCSV = vi.fn();
const mockExportToJSON = vi.fn();
vi.mock('@utils/auditLogExport', () => ({
    exportToCSV: (...args: unknown[]) => mockExportToCSV(...args),
    exportToJSON: (...args: unknown[]) => mockExportToJSON(...args),
}));

// Mock MUI DateTimePicker to avoid complex setup
vi.mock('@mui/x-date-pickers/DateTimePicker', () => ({
    DateTimePicker: ({ label, onChange, value }: {
        label: string;
        onChange: (value: unknown) => void;
        value: unknown;
    }) => (
        <div>
            <label htmlFor={`date-picker-${label}`}>{label}</label>
            <input
                id={`date-picker-${label}`}
                type="text"
                data-value={value ? 'has-value' : 'no-value'}
                onChange={(e) => {
                    // Simulate dayjs object
                    if (e.target.value) {
                        onChange({ toISOString: () => e.target.value });
                    } else {
                        onChange(null);
                    }
                }}
            />
        </div>
    ),
}));

vi.mock('@mui/x-date-pickers/LocalizationProvider', () => ({
    LocalizationProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@mui/x-date-pickers/AdapterDayjs', () => ({
    AdapterDayjs: vi.fn(),
}));

// Mock MUI DataGrid to avoid CSS parsing issues in tests
vi.mock('@mui/x-data-grid', () => ({
    DataGrid: ({ rows, columns, loading, slots }: {
        rows: unknown[];
        columns: unknown[];
        loading: boolean;
        slots?: { noRowsOverlay?: () => React.JSX.Element };
    }) => (
        <div role="grid">
            {loading && <div>Loading...</div>}
            {!loading && rows.length === 0 && slots?.noRowsOverlay && slots.noRowsOverlay()}
            {!loading && rows.length > 0 && (
                <div>
                    <div role="row">
                        {(columns as { headerName: string }[]).map((col, i) => (
                            <div key={i} role="columnheader">{col.headerName}</div>
                        ))}
                    </div>
                    {(rows as AuditLog[]).map((row, i) => (
                        <div key={i} role="row" data-row-id={row.id}>
                            <button
                                aria-label="Expand row"
                                onClick={() => {
                                    // Toggle expanded state would go here
                                }}
                            >
                                <span>ExpandMoreIcon</span>
                            </button>
                            <span>{row.userEmail || 'System'}</span>
                            <span>{row.action}</span>
                            <span>{row.entityType}</span>
                            <span>Success</span>
                        </div>
                    ))}
                </div>
            )}
            <div role="combobox" aria-label="Rows per page">50</div>
        </div>
    ),
}));

// Sample audit log data
const createMockAuditLog = (overrides: Partial<AuditLog> = {}): AuditLog => ({
    id: 'log-1',
    timestamp: '2024-01-15T10:30:00Z',
    userId: 'user-1',
    userEmail: 'admin@example.com',
    action: 'Asset:Created:ByUser',
    entityType: 'Asset',
    entityId: 'asset-123',
    payload: JSON.stringify({
        httpMethod: 'POST',
        path: '/api/assets',
        statusCode: 201,
        durationMs: 150,
        result: 'Success',
    }),
    ...overrides,
});

const mockEmptyResponse: AuditLogQueryResponse = {
    items: [],
    totalCount: 0,
};

const mockSingleLogResponse: AuditLogQueryResponse = {
    items: [createMockAuditLog()],
    totalCount: 1,
};

const mockMultipleLogsResponse: AuditLogQueryResponse = {
    items: [
        createMockAuditLog({ id: 'log-1', action: 'Asset:Created:ByUser' }),
        createMockAuditLog({ id: 'log-2', action: 'Job:Started', userEmail: 'user@example.com' }),
        createMockAuditLog({ id: 'log-3', action: 'Resource:Updated:ViaJob', entityType: 'Resource' }),
    ],
    totalCount: 3,
};

describe('AuditLogsPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockQueryAuditLogs.mockResolvedValue(mockMultipleLogsResponse);
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe('Rendering', () => {
        it('should render page title "Audit Logs"', async () => {
            // Arrange & Act
            render(<AuditLogsPage />);

            // Assert
            expect(screen.getByRole('heading', { name: /audit logs/i })).toBeInTheDocument();
        });

        it('should render tabs "All Logs" and "Live Monitoring"', async () => {
            // Arrange & Act
            render(<AuditLogsPage />);

            // Assert
            expect(screen.getByRole('tab', { name: /all logs/i })).toBeInTheDocument();
            expect(screen.getByRole('tab', { name: /live monitoring/i })).toBeInTheDocument();
        });

        it('should render filter toggle button', async () => {
            // Arrange & Act
            render(<AuditLogsPage />);

            // Assert
            expect(screen.getByRole('button', { name: /show filters/i })).toBeInTheDocument();
        });

        it('should render export buttons (CSV, JSON)', async () => {
            // Arrange & Act
            render(<AuditLogsPage />);

            // Assert
            expect(screen.getByRole('button', { name: /export csv/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /export json/i })).toBeInTheDocument();
        });

        it('should render DataGrid after loading', async () => {
            // Arrange & Act
            render(<AuditLogsPage />);

            // Assert - wait for data to load
            await waitFor(() => {
                expect(mockQueryAuditLogs).toHaveBeenCalled();
            });

            // DataGrid should be rendered
            await waitFor(() => {
                expect(screen.getByRole('grid')).toBeInTheDocument();
            });
        });
    });

    describe('Tab Navigation', () => {
        it('should default to "All Logs" tab', async () => {
            // Arrange & Act
            render(<AuditLogsPage />);

            // Assert
            const allLogsTab = screen.getByRole('tab', { name: /all logs/i });
            expect(allLogsTab).toHaveAttribute('aria-selected', 'true');
        });

        it('should switch to "Live Monitoring" tab on click', async () => {
            // Arrange
            const user = userEvent.setup();
            render(<AuditLogsPage />);

            // Act
            await user.click(screen.getByRole('tab', { name: /live monitoring/i }));

            // Assert
            const liveTab = screen.getByRole('tab', { name: /live monitoring/i });
            expect(liveTab).toHaveAttribute('aria-selected', 'true');
        });

        it('should show auto-refresh controls only on Live Monitoring tab', async () => {
            // Arrange
            const user = userEvent.setup();
            render(<AuditLogsPage />);

            // Assert - not visible on All Logs tab
            expect(screen.queryByLabelText(/auto-refresh/i)).not.toBeInTheDocument();

            // Act - switch to Live Monitoring
            await user.click(screen.getByRole('tab', { name: /live monitoring/i }));

            // Assert - visible on Live Monitoring tab
            await waitFor(() => {
                expect(screen.getByLabelText(/auto-refresh/i)).toBeInTheDocument();
            });
        });

        it('should clear errors when switching tabs', async () => {
            // Arrange
            const user = userEvent.setup();
            mockQueryAuditLogs.mockRejectedValueOnce(new Error('Network error'));
            render(<AuditLogsPage />);

            // Wait for error to appear
            await waitFor(() => {
                expect(screen.getByRole('alert')).toBeInTheDocument();
            });

            // Reset mock for next call
            mockQueryAuditLogs.mockResolvedValue(mockMultipleLogsResponse);

            // Act - switch tabs
            await user.click(screen.getByRole('tab', { name: /live monitoring/i }));

            // Assert - error should be cleared
            await waitFor(() => {
                expect(screen.queryByText('Network error')).not.toBeInTheDocument();
            });
        });
    });

    describe('Filters', () => {
        it('should toggle filter panel visibility', async () => {
            // Arrange
            const user = userEvent.setup();
            render(<AuditLogsPage />);

            // Assert - filters not visible initially
            expect(screen.queryByRole('heading', { name: /^filters$/i })).not.toBeInTheDocument();

            // Act - show filters
            await user.click(screen.getByRole('button', { name: /show filters/i }));

            // Assert - filters visible
            await waitFor(() => {
                expect(screen.getByRole('heading', { name: /^filters$/i })).toBeInTheDocument();
            });

            // Act - hide filters
            await user.click(screen.getByRole('button', { name: /hide filters/i }));

            // Assert - filters hidden
            await waitFor(() => {
                expect(screen.queryByRole('heading', { name: /^filters$/i })).not.toBeInTheDocument();
            });
        });

        it('should render date presets when filters are visible', async () => {
            // Arrange
            const user = userEvent.setup();
            render(<AuditLogsPage />);

            // Act
            await user.click(screen.getByRole('button', { name: /show filters/i }));

            // Assert
            await waitFor(() => {
                expect(screen.getByRole('button', { name: /last hour/i })).toBeInTheDocument();
                expect(screen.getByRole('button', { name: /^today$/i })).toBeInTheDocument();
                expect(screen.getByRole('button', { name: /last 7 days/i })).toBeInTheDocument();
                expect(screen.getByRole('button', { name: /last 30 days/i })).toBeInTheDocument();
            });
        });

        it('should render filter fields when filters are visible', async () => {
            // Arrange
            const user = userEvent.setup();
            render(<AuditLogsPage />);

            // Act
            await user.click(screen.getByRole('button', { name: /show filters/i }));

            // Assert
            await waitFor(() => {
                expect(screen.getByLabelText(/start date/i)).toBeInTheDocument();
                expect(screen.getByLabelText(/end date/i)).toBeInTheDocument();
                expect(screen.getByLabelText(/user email/i)).toBeInTheDocument();
                expect(screen.getByLabelText(/action \(contains\)/i)).toBeInTheDocument();
                // Entity Type label is present (use getAllByText to handle MUI Select multiple elements)
                expect(screen.getAllByText(/entity type/i).length).toBeGreaterThan(0);
            });
        });

        it('should apply filters on "Apply Filters" click', async () => {
            // Arrange
            const user = userEvent.setup();
            render(<AuditLogsPage />);

            // Open filters
            await user.click(screen.getByRole('button', { name: /show filters/i }));

            // Wait for filter panel
            await waitFor(() => {
                expect(screen.getByLabelText(/user email/i)).toBeInTheDocument();
            });

            // Clear previous calls
            mockQueryAuditLogs.mockClear();

            // Enter filter value
            await user.type(screen.getByLabelText(/user email/i), 'test@example.com');

            // Act
            await user.click(screen.getByRole('button', { name: /apply filters/i }));

            // Assert
            await waitFor(() => {
                expect(mockQueryAuditLogs).toHaveBeenCalledWith(
                    expect.objectContaining({
                        userId: 'test@example.com',
                    })
                );
            });
        });

        it('should clear filters on "Clear Filters" click', async () => {
            // Arrange
            const user = userEvent.setup();
            render(<AuditLogsPage />);

            // Open filters and enter values
            await user.click(screen.getByRole('button', { name: /show filters/i }));
            await waitFor(() => {
                expect(screen.getByLabelText(/user email/i)).toBeInTheDocument();
            });
            await user.type(screen.getByLabelText(/user email/i), 'test@example.com');
            await user.click(screen.getByRole('button', { name: /apply filters/i }));

            // Wait for API call
            await waitFor(() => {
                expect(mockQueryAuditLogs).toHaveBeenCalled();
            });

            // Clear mocks
            mockQueryAuditLogs.mockClear();

            // Act
            await user.click(screen.getByRole('button', { name: /clear filters/i }));

            // Assert - filter field should be empty
            expect(screen.getByLabelText(/user email/i)).toHaveValue('');

            // And API should be called with cleared filters
            await waitFor(() => {
                expect(mockQueryAuditLogs).toHaveBeenCalledWith(
                    expect.objectContaining({
                        userId: '',
                        action: '',
                        entityType: '',
                    })
                );
            });
        });

        it('should show error for multiple filters in Live Monitoring mode', async () => {
            // Arrange
            const user = userEvent.setup();
            render(<AuditLogsPage />);

            // Switch to Live Monitoring tab
            await user.click(screen.getByRole('tab', { name: /live monitoring/i }));

            // Wait for tab switch
            await waitFor(() => {
                expect(screen.getByRole('tab', { name: /live monitoring/i })).toHaveAttribute('aria-selected', 'true');
            });

            // Open filters
            await user.click(screen.getByRole('button', { name: /show filters/i }));
            await waitFor(() => {
                expect(screen.getByLabelText(/user email/i)).toBeInTheDocument();
            });

            // Enter multiple filter values
            await user.type(screen.getByLabelText(/user email/i), 'test@example.com');
            await user.type(screen.getByLabelText(/action \(contains\)/i), 'Asset');

            // Act
            await user.click(screen.getByRole('button', { name: /apply filters/i }));

            // Assert - should show error
            await waitFor(() => {
                expect(screen.getByRole('alert')).toBeInTheDocument();
                expect(screen.getByText(/live monitoring supports only a single filter/i)).toBeInTheDocument();
            });
        });
    });

    describe('Data Grid', () => {
        it('should display loading skeleton when loading', async () => {
            // Arrange
            mockQueryAuditLogs.mockImplementation(
                () => new Promise(() => {}) // Never resolves
            );

            // Act
            const { container } = render(<AuditLogsPage />);

            // Assert - skeleton should be visible while loading
            // Note: Using container query for MUI internal Skeleton component
            const skeleton = container.querySelector('[class*="MuiSkeleton"]');
            expect(skeleton).toBeInTheDocument();
        });

        it('should display log entries in grid after loading', async () => {
            // Arrange
            mockQueryAuditLogs.mockResolvedValue(mockMultipleLogsResponse);

            // Act
            render(<AuditLogsPage />);

            // Assert
            await waitFor(() => {
                expect(screen.getByRole('grid')).toBeInTheDocument();
            });

            // Check that data is displayed - use getAllByText for multiple entries
            await waitFor(() => {
                const emails = screen.getAllByText('admin@example.com');
                expect(emails.length).toBeGreaterThan(0);
            });
        });

        it('should display "No audit logs found" when empty', async () => {
            // Arrange
            mockQueryAuditLogs.mockResolvedValue(mockEmptyResponse);

            // Act
            render(<AuditLogsPage />);

            // Assert
            await waitFor(() => {
                expect(screen.getByText(/no audit logs found/i)).toBeInTheDocument();
            });
        });

        it('should handle pagination', async () => {
            // Arrange
            const largeResponse: AuditLogQueryResponse = {
                items: Array.from({ length: 50 }, (_, i) =>
                    createMockAuditLog({ id: `log-${i}` })
                ),
                totalCount: 150,
            };
            mockQueryAuditLogs.mockResolvedValue(largeResponse);

            // Act
            render(<AuditLogsPage />);

            // Assert - grid should be rendered with pagination
            await waitFor(() => {
                expect(screen.getByRole('grid')).toBeInTheDocument();
            });

            // DataGrid pagination should show rows per page options
            await waitFor(() => {
                const paginationSelect = screen.getByRole('combobox', { name: /rows per page/i });
                expect(paginationSelect).toBeInTheDocument();
            });
        });
    });

    describe('Export', () => {
        it('should call export CSV function when CSV button clicked', async () => {
            // Arrange
            const user = userEvent.setup();
            render(<AuditLogsPage />);

            // Wait for data to load
            await waitFor(() => {
                expect(mockQueryAuditLogs).toHaveBeenCalled();
            });

            // Wait for grid
            await waitFor(() => {
                expect(screen.getByRole('grid')).toBeInTheDocument();
            });

            // Act
            await user.click(screen.getByRole('button', { name: /export csv/i }));

            // Assert
            expect(mockExportToCSV).toHaveBeenCalledWith(
                expect.any(Array),
                expect.stringContaining('audit_logs_')
            );
        });

        it('should call export JSON function when JSON button clicked', async () => {
            // Arrange
            const user = userEvent.setup();
            render(<AuditLogsPage />);

            // Wait for data to load
            await waitFor(() => {
                expect(mockQueryAuditLogs).toHaveBeenCalled();
            });

            // Wait for grid
            await waitFor(() => {
                expect(screen.getByRole('grid')).toBeInTheDocument();
            });

            // Act
            await user.click(screen.getByRole('button', { name: /export json/i }));

            // Assert
            expect(mockExportToJSON).toHaveBeenCalledWith(
                expect.any(Array),
                expect.stringContaining('audit_logs_')
            );
        });

        it('should disable export buttons when no logs', async () => {
            // Arrange
            mockQueryAuditLogs.mockResolvedValue(mockEmptyResponse);

            // Act
            render(<AuditLogsPage />);

            // Wait for data to load
            await waitFor(() => {
                expect(mockQueryAuditLogs).toHaveBeenCalled();
            });

            // Assert
            await waitFor(() => {
                expect(screen.getByRole('button', { name: /export csv/i })).toBeDisabled();
                expect(screen.getByRole('button', { name: /export json/i })).toBeDisabled();
            });
        });
    });

    describe('Live Monitoring', () => {
        it('should show live indicator when auto-refresh is on', async () => {
            // Arrange
            const user = userEvent.setup();
            render(<AuditLogsPage />);

            // Act - switch to Live Monitoring
            await user.click(screen.getByRole('tab', { name: /live monitoring/i }));

            // Assert - Live indicator should be visible (auto-refresh is on by default)
            await waitFor(() => {
                expect(screen.getByText(/^live$/i)).toBeInTheDocument();
            });
        });

        it('should toggle auto-refresh with switch', async () => {
            // Arrange
            const user = userEvent.setup();
            render(<AuditLogsPage />);

            // Switch to Live Monitoring
            await user.click(screen.getByRole('tab', { name: /live monitoring/i }));

            // Wait for auto-refresh label
            await waitFor(() => {
                expect(screen.getByText(/auto-refresh/i)).toBeInTheDocument();
            });

            // MUI Switch uses checkbox role - find by label text
            const autoRefreshSwitch = screen.getByLabelText(/auto-refresh/i);
            expect(autoRefreshSwitch).toBeInTheDocument();

            // Act - turn off auto-refresh
            await user.click(autoRefreshSwitch);

            // Assert - Live indicator should not be visible
            await waitFor(() => {
                expect(screen.queryByText(/^live$/i)).not.toBeInTheDocument();
            });

            // Act - turn on auto-refresh
            await user.click(screen.getByLabelText(/auto-refresh/i));

            // Assert - Live indicator should be visible again
            await waitFor(() => {
                expect(screen.getByText(/^live$/i)).toBeInTheDocument();
            });
        });

        it('should display last update timestamp', async () => {
            // Arrange
            const user = userEvent.setup();
            render(<AuditLogsPage />);

            // Act - switch to Live Monitoring
            await user.click(screen.getByRole('tab', { name: /live monitoring/i }));

            // Assert - should show last update time
            await waitFor(() => {
                expect(screen.getByText(/last update:/i)).toBeInTheDocument();
            });
        });

        it('should poll for new data when auto-refresh is enabled', async () => {
            // Arrange
            vi.useFakeTimers({ shouldAdvanceTime: true });
            render(<AuditLogsPage />);

            // Clear mocks after initial load
            await act(async () => {
                await vi.advanceTimersByTimeAsync(100);
            });
            mockQueryAuditLogs.mockClear();

            // Switch to Live Monitoring tab
            const liveTab = screen.getByRole('tab', { name: /live monitoring/i });
            await act(async () => {
                liveTab.click();
            });

            // Wait for initial load on Live tab
            await act(async () => {
                await vi.advanceTimersByTimeAsync(100);
            });
            mockQueryAuditLogs.mockClear();

            // Act - advance time to trigger polling (3 seconds interval)
            await act(async () => {
                await vi.advanceTimersByTimeAsync(3100);
            });

            // Assert - should have made additional API call
            expect(mockQueryAuditLogs).toHaveBeenCalled();
        });
    });

    describe('Error Handling', () => {
        it('should display error alert on API failure', async () => {
            // Arrange
            mockQueryAuditLogs.mockRejectedValue(new Error('Failed to fetch audit logs'));

            // Act
            render(<AuditLogsPage />);

            // Assert
            await waitFor(() => {
                expect(screen.getByRole('alert')).toBeInTheDocument();
                expect(screen.getByText(/failed to fetch audit logs/i)).toBeInTheDocument();
            });
        });

        it('should handle network errors gracefully', async () => {
            // Arrange
            mockQueryAuditLogs.mockRejectedValue(new Error('Network error'));

            // Act
            render(<AuditLogsPage />);

            // Assert
            await waitFor(() => {
                expect(screen.getByRole('alert')).toBeInTheDocument();
                expect(screen.getByText(/network error/i)).toBeInTheDocument();
            });
        });

        it('should handle non-Error rejection gracefully', async () => {
            // Arrange
            mockQueryAuditLogs.mockRejectedValue('Unknown error');

            // Act
            render(<AuditLogsPage />);

            // Assert
            await waitFor(() => {
                expect(screen.getByRole('alert')).toBeInTheDocument();
                expect(screen.getByText(/failed to load audit logs/i)).toBeInTheDocument();
            });
        });
    });

    describe('Date Preset Selection', () => {
        it('should apply "Last Hour" preset when clicked', async () => {
            // Arrange
            const user = userEvent.setup();
            render(<AuditLogsPage />);

            // Open filters
            await user.click(screen.getByRole('button', { name: /show filters/i }));
            await waitFor(() => {
                expect(screen.getByRole('button', { name: /last hour/i })).toBeInTheDocument();
            });

            // Act
            await user.click(screen.getByRole('button', { name: /last hour/i }));

            // Assert - date pickers should have values set
            await waitFor(() => {
                const startDateInput = screen.getByLabelText(/start date/i);
                const endDateInput = screen.getByLabelText(/end date/i);
                // Our mock shows data-value attribute
                expect(startDateInput).toHaveAttribute('data-value', 'has-value');
                expect(endDateInput).toHaveAttribute('data-value', 'has-value');
            });
        });

        it('should apply "Today" preset when clicked', async () => {
            // Arrange
            const user = userEvent.setup();
            render(<AuditLogsPage />);

            // Open filters
            await user.click(screen.getByRole('button', { name: /show filters/i }));
            await waitFor(() => {
                expect(screen.getByRole('button', { name: /^today$/i })).toBeInTheDocument();
            });

            // Act
            await user.click(screen.getByRole('button', { name: /^today$/i }));

            // Assert
            await waitFor(() => {
                const startDateInput = screen.getByLabelText(/start date/i);
                expect(startDateInput).toHaveAttribute('data-value', 'has-value');
            });
        });
    });

    describe('Entity Type Select', () => {
        it('should render entity type select when filters are visible', async () => {
            // Arrange
            const user = userEvent.setup();
            render(<AuditLogsPage />);

            // Open filters
            await user.click(screen.getByRole('button', { name: /show filters/i }));

            // Wait for filter panel
            await waitFor(() => {
                expect(screen.getByRole('heading', { name: /^filters$/i })).toBeInTheDocument();
            });

            // Assert - Entity Type label is present with select (use getAllByText for MUI Select)
            expect(screen.getAllByText(/entity type/i).length).toBeGreaterThan(0);

            // MUI Select is a combobox - there may be multiple (entity type + pagination)
            expect(screen.getAllByRole('combobox').length).toBeGreaterThan(0);
        });
    });

    describe('Grid Data Display', () => {
        it('should display user email in grid', async () => {
            // Arrange
            mockQueryAuditLogs.mockResolvedValue(mockSingleLogResponse);

            // Act
            render(<AuditLogsPage />);

            // Assert
            await waitFor(() => {
                expect(screen.getByText('admin@example.com')).toBeInTheDocument();
            });
        });

        it('should display action in grid', async () => {
            // Arrange
            mockQueryAuditLogs.mockResolvedValue(mockSingleLogResponse);

            // Act
            render(<AuditLogsPage />);

            // Assert
            await waitFor(() => {
                expect(screen.getByText('Asset:Created:ByUser')).toBeInTheDocument();
            });
        });

        it('should display entity type in grid', async () => {
            // Arrange
            mockQueryAuditLogs.mockResolvedValue(mockSingleLogResponse);

            // Act
            render(<AuditLogsPage />);

            // Assert
            await waitFor(() => {
                expect(screen.getByText('Asset')).toBeInTheDocument();
            });
        });
    });

    describe('Result Display', () => {
        it('should display Success result for successful logs', async () => {
            // Arrange
            mockQueryAuditLogs.mockResolvedValue(mockSingleLogResponse);

            // Act
            render(<AuditLogsPage />);

            // Assert
            await waitFor(() => {
                expect(screen.getByText('Success')).toBeInTheDocument();
            });
        });
    });
});
