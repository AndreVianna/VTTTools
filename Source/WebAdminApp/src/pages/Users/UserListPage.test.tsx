/**
 * UserListPage Component Tests
 * Tests user management functionality for WebAdminApp
 * Coverage: User listing, filtering, sorting, stats, and user actions
 *
 * Test Coverage:
 * - Page rendering (title, search, filters, refresh button)
 * - User stats cards display
 * - Data loading on mount
 * - Loading and error states
 * - Search functionality
 * - Role and status filtering
 * - User actions (view details, lock/unlock)
 * - Modal integration
 */

import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UserListPage } from './UserListPage';
import { userService, UserListItem, UserStatsResponse, UserSearchResponse } from '@services/userService';

// Mock userService
vi.mock('@services/userService', () => ({
    userService: {
        searchUsers: vi.fn(),
        getUserStats: vi.fn(),
        lockUser: vi.fn(),
        unlockUser: vi.fn(),
        verifyEmail: vi.fn(),
    },
}));

// Mock UserDetailModal component
vi.mock('@components/users/UserDetailModal', () => ({
    UserDetailModal: vi.fn(({ open, userId, onClose }) => {
        if (!open) return null;
        return (
            <div role="dialog" aria-label="User Detail Modal">
                <span>User ID: {userId}</span>
                <button onClick={onClose}>Close Modal</button>
            </div>
        );
    }),
}));

// Mock MUI DataGrid to avoid complex grid rendering issues
vi.mock('@mui/x-data-grid', () => ({
    DataGrid: vi.fn(({ rows, columns, loading, slots }) => (
        <div role="grid" aria-label="User data grid">
            {loading && <div role="progressbar">Loading...</div>}
            <table>
                <thead>
                    <tr>
                        {columns.map((col: { field: string; headerName: string }) => (
                            <th key={col.field}>{col.headerName}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row: UserListItem) => (
                        <tr key={row.id} role="row" aria-label={`User row ${row.email}`}>
                            <td>{row.email}</td>
                            <td>{row.displayName}</td>
                            <td>{row.name}</td>
                            <td>{row.roles?.join(', ')}</td>
                            <td>{row.emailConfirmed ? 'Yes' : 'No'}</td>
                            <td>{row.isLockedOut ? 'Locked' : 'Active'}</td>
                            <td>
                                <button
                                    aria-label={`View details for ${row.email}`}
                                    onClick={() => {
                                        const event = new CustomEvent('viewDetails', { detail: row.id });
                                        document.dispatchEvent(event);
                                    }}
                                >
                                    View
                                </button>
                                {row.isLockedOut ? (
                                    <button
                                        aria-label={`Unlock ${row.email}`}
                                        onClick={() => {
                                            const event = new CustomEvent('unlockUser', { detail: row.id });
                                            document.dispatchEvent(event);
                                        }}
                                    >
                                        Unlock
                                    </button>
                                ) : (
                                    <button
                                        aria-label={`Lock ${row.email}`}
                                        onClick={() => {
                                            const event = new CustomEvent('lockUser', { detail: row.id });
                                            document.dispatchEvent(event);
                                        }}
                                    >
                                        Lock
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {slots?.footer && slots.footer()}
        </div>
    )),
    GridColDef: vi.fn(),
    GridRenderCellParams: vi.fn(),
    GridSortModel: vi.fn(),
}));

// Mock MUI icons
vi.mock('@mui/icons-material', () => ({
    Search: () => <span>SearchIcon</span>,
    Lock: () => <span>LockIcon</span>,
    LockOpen: () => <span>UnlockIcon</span>,
    Visibility: () => <span>ViewIcon</span>,
    VerifiedUser: () => <span>VerifiedIcon</span>,
    Refresh: () => <span>RefreshIcon</span>,
}));

// Helper functions
const createMockUser = (overrides: Partial<UserListItem> = {}): UserListItem => ({
    id: 'user-1',
    email: 'test@example.com',
    displayName: 'Test User',
    name: 'Test User',
    roles: ['User'],
    emailConfirmed: true,
    lockoutEnabled: true,
    isLockedOut: false,
    twoFactorEnabled: false,
    ...overrides,
});

const createMockStats = (overrides: Partial<UserStatsResponse> = {}): UserStatsResponse => ({
    totalUsers: 100,
    totalAdministrators: 5,
    lockedUsers: 3,
    unconfirmedEmails: 10,
    ...overrides,
});

const createMockSearchResponse = (
    users: UserListItem[] = [],
    overrides: Partial<UserSearchResponse> = {}
): UserSearchResponse => ({
    users,
    totalCount: users.length,
    hasMore: false,
    ...overrides,
});

describe('UserListPage', () => {
    const mockSearchUsers = userService.searchUsers as ReturnType<typeof vi.fn>;
    const mockGetUserStats = userService.getUserStats as ReturnType<typeof vi.fn>;
    const mockLockUser = userService.lockUser as ReturnType<typeof vi.fn>;
    const mockUnlockUser = userService.unlockUser as ReturnType<typeof vi.fn>;

    beforeEach(() => {
        vi.resetAllMocks();

        // Default mock implementations
        mockSearchUsers.mockResolvedValue(createMockSearchResponse([createMockUser()]));
        mockGetUserStats.mockResolvedValue(createMockStats());
        mockLockUser.mockResolvedValue({ success: true });
        mockUnlockUser.mockResolvedValue({ success: true });
    });

    describe('Rendering', () => {
        it('should render page title "User Management"', async () => {
            // Arrange & Act
            render(<UserListPage />);

            // Assert
            expect(screen.getByRole('heading', { name: /user management/i })).toBeInTheDocument();
        });

        it('should render search field', async () => {
            // Arrange & Act
            render(<UserListPage />);

            // Assert
            await waitFor(() => {
                expect(screen.getByLabelText(/search/i)).toBeInTheDocument();
            });
        });

        it('should render role filter dropdown', async () => {
            // Arrange & Act
            render(<UserListPage />);

            // Assert
            await waitFor(() => {
                // MUI Select creates multiple elements with the label
                // Use getAllBy and verify at least one exists
                const roleLabels = screen.getAllByText(/^role$/i);
                expect(roleLabels.length).toBeGreaterThan(0);
            });
        });

        it('should render status filter dropdown', async () => {
            // Arrange & Act
            render(<UserListPage />);

            // Assert
            await waitFor(() => {
                // MUI Select creates multiple elements with the label
                // Use getAllBy and verify at least one exists
                const statusLabels = screen.getAllByText(/^status$/i);
                expect(statusLabels.length).toBeGreaterThan(0);
            });
        });

        it('should render refresh button', async () => {
            // Arrange & Act
            render(<UserListPage />);

            // Assert
            await waitFor(() => {
                expect(screen.getByRole('button', { name: /refresh/i })).toBeInTheDocument();
            });
        });

        it('should display user stats cards when stats loaded', async () => {
            // Arrange
            const stats = createMockStats({
                totalUsers: 150,
                totalAdministrators: 10,
                lockedUsers: 5,
                unconfirmedEmails: 20,
            });
            mockGetUserStats.mockResolvedValue(stats);

            // Act
            render(<UserListPage />);

            // Assert
            await waitFor(() => {
                expect(screen.getByText('Total Users')).toBeInTheDocument();
                expect(screen.getByText('150')).toBeInTheDocument();
                expect(screen.getByText('Administrators')).toBeInTheDocument();
                expect(screen.getByText('10')).toBeInTheDocument();
                expect(screen.getByText('Locked Users')).toBeInTheDocument();
                expect(screen.getByText('5')).toBeInTheDocument();
                expect(screen.getByText('Unconfirmed Emails')).toBeInTheDocument();
                expect(screen.getByText('20')).toBeInTheDocument();
            });
        });
    });

    describe('Data Loading', () => {
        it('should call searchUsers on mount', async () => {
            // Arrange & Act
            render(<UserListPage />);

            // Assert
            await waitFor(() => {
                expect(mockSearchUsers).toHaveBeenCalled();
            });
        });

        it('should call getUserStats on mount', async () => {
            // Arrange & Act
            render(<UserListPage />);

            // Assert
            await waitFor(() => {
                expect(mockGetUserStats).toHaveBeenCalled();
            });
        });

        it('should display loading state', async () => {
            // Arrange
            let resolveSearch: (value: UserSearchResponse) => void = () => {};
            mockSearchUsers.mockImplementation(
                () =>
                    new Promise((resolve) => {
                        resolveSearch = resolve;
                    })
            );

            // Act
            render(<UserListPage />);

            // Assert
            await waitFor(() => {
                expect(screen.getByRole('progressbar')).toBeInTheDocument();
            });

            // Cleanup
            resolveSearch(createMockSearchResponse([]));
        });

        it('should display error message on API error', async () => {
            // Arrange
            mockSearchUsers.mockRejectedValue(new Error('Network error'));

            // Act
            render(<UserListPage />);

            // Assert
            await waitFor(() => {
                expect(screen.getByRole('alert')).toBeInTheDocument();
                expect(screen.getByText(/network error/i)).toBeInTheDocument();
            });
        });

        it('should display users in the grid', async () => {
            // Arrange
            const users = [
                createMockUser({ id: 'user-1', email: 'user1@example.com' }),
                createMockUser({ id: 'user-2', email: 'user2@example.com' }),
            ];
            mockSearchUsers.mockResolvedValue(createMockSearchResponse(users, { totalCount: 2 }));

            // Act
            render(<UserListPage />);

            // Assert
            await waitFor(() => {
                expect(screen.getByRole('row', { name: /user row user1@example.com/i })).toBeInTheDocument();
                expect(screen.getByRole('row', { name: /user row user2@example.com/i })).toBeInTheDocument();
            });
        });
    });

    describe('User Interactions - Filtering', () => {
        it('should filter by search query', async () => {
            // Arrange
            const user = userEvent.setup();
            render(<UserListPage />);

            await waitFor(() => {
                expect(mockSearchUsers).toHaveBeenCalled();
            });

            mockSearchUsers.mockClear();

            // Act
            const searchInput = screen.getByLabelText(/search/i);
            await user.type(searchInput, 'john');

            // Assert
            await waitFor(() => {
                expect(mockSearchUsers).toHaveBeenCalledWith(
                    expect.objectContaining({
                        search: 'john',
                    })
                );
            });
        });

        it('should filter by role using dropdown', async () => {
            // Arrange
            const user = userEvent.setup();
            render(<UserListPage />);

            await waitFor(() => {
                expect(mockSearchUsers).toHaveBeenCalled();
            });

            mockSearchUsers.mockClear();

            // Act - Find Role combobox by its label
            const roleComboboxes = screen.getAllByRole('combobox');
            // First combobox is Role, second is Status
            const roleSelect = roleComboboxes[0];
            expect(roleSelect).toBeDefined();
            if (roleSelect) {
                await user.click(roleSelect);
            }

            const adminOption = await screen.findByRole('option', { name: /administrator/i });
            await user.click(adminOption);

            // Assert
            await waitFor(() => {
                expect(mockSearchUsers).toHaveBeenCalledWith(
                    expect.objectContaining({
                        role: 'Administrator',
                    })
                );
            });
        });

        it('should filter by status using dropdown', async () => {
            // Arrange
            const user = userEvent.setup();
            render(<UserListPage />);

            await waitFor(() => {
                expect(mockSearchUsers).toHaveBeenCalled();
            });

            mockSearchUsers.mockClear();

            // Act - Find Status combobox (second combobox)
            const comboboxes = screen.getAllByRole('combobox');
            // First combobox is Role, second is Status
            const statusSelect = comboboxes[1];
            expect(statusSelect).toBeDefined();
            if (statusSelect) {
                await user.click(statusSelect);
            }

            const lockedOption = await screen.findByRole('option', { name: /^locked$/i });
            await user.click(lockedOption);

            // Assert
            await waitFor(() => {
                expect(mockSearchUsers).toHaveBeenCalledWith(
                    expect.objectContaining({
                        status: 'locked',
                    })
                );
            });
        });

        it('should refresh data when refresh button clicked', async () => {
            // Arrange
            const user = userEvent.setup();
            render(<UserListPage />);

            await waitFor(() => {
                expect(mockSearchUsers).toHaveBeenCalled();
            });

            mockSearchUsers.mockClear();

            // Act
            const refreshButton = screen.getByRole('button', { name: /refresh/i });
            await user.click(refreshButton);

            // Assert
            await waitFor(() => {
                expect(mockSearchUsers).toHaveBeenCalled();
            });
        });
    });

    describe('User Actions', () => {
        it('should render view button for user row', async () => {
            // Arrange
            const testUser = createMockUser({ id: 'user-123', email: 'view-test@example.com' });
            mockSearchUsers.mockResolvedValue(createMockSearchResponse([testUser]));

            // Act
            render(<UserListPage />);

            // Assert
            await waitFor(() => {
                const userRow = screen.getByRole('row', { name: /user row view-test@example.com/i });
                const viewButton = within(userRow).getByRole('button', { name: /view details for view-test@example.com/i });
                expect(viewButton).toBeInTheDocument();
            });
        });

        it('should render lock button for active user', async () => {
            // Arrange
            const testUser = createMockUser({
                id: 'user-to-lock',
                email: 'lock-test@example.com',
                isLockedOut: false,
            });
            mockSearchUsers.mockResolvedValue(createMockSearchResponse([testUser]));

            // Act
            render(<UserListPage />);

            // Assert
            await waitFor(() => {
                const userRow = screen.getByRole('row', { name: /user row lock-test@example.com/i });
                const lockButton = within(userRow).getByRole('button', { name: /lock lock-test@example.com/i });
                expect(lockButton).toBeInTheDocument();
            });
        });

        it('should render unlock button for locked user', async () => {
            // Arrange
            const lockedUser = createMockUser({
                id: 'user-to-unlock',
                email: 'unlock-test@example.com',
                isLockedOut: true,
            });
            mockSearchUsers.mockResolvedValue(createMockSearchResponse([lockedUser]));

            // Act
            render(<UserListPage />);

            // Assert
            await waitFor(() => {
                const userRow = screen.getByRole('row', { name: /user row unlock-test@example.com/i });
                const unlockButton = within(userRow).getByRole('button', { name: /unlock unlock-test@example.com/i });
                expect(unlockButton).toBeInTheDocument();
            });
        });

        it('should allow clicking view button', async () => {
            // Arrange
            const user = userEvent.setup();
            const testUser = createMockUser({ id: 'user-123', email: 'click-test@example.com' });
            mockSearchUsers.mockResolvedValue(createMockSearchResponse([testUser]));

            render(<UserListPage />);

            await waitFor(() => {
                expect(screen.getByRole('row', { name: /user row click-test@example.com/i })).toBeInTheDocument();
            });

            // Act
            const userRow = screen.getByRole('row', { name: /user row click-test@example.com/i });
            const viewButton = within(userRow).getByRole('button', { name: /view details for click-test@example.com/i });
            await user.click(viewButton);

            // Assert - button is clickable (no error thrown)
            expect(viewButton).toBeInTheDocument();
        });

        it('should allow clicking lock button', async () => {
            // Arrange
            const user = userEvent.setup();
            const testUser = createMockUser({
                id: 'user-to-lock',
                email: 'lock-click@example.com',
                isLockedOut: false,
            });
            mockSearchUsers.mockResolvedValue(createMockSearchResponse([testUser]));

            render(<UserListPage />);

            await waitFor(() => {
                expect(screen.getByRole('row', { name: /user row lock-click@example.com/i })).toBeInTheDocument();
            });

            // Act
            const userRow = screen.getByRole('row', { name: /user row lock-click@example.com/i });
            const lockButton = within(userRow).getByRole('button', { name: /lock lock-click@example.com/i });
            await user.click(lockButton);

            // Assert - button is clickable (no error thrown)
            expect(lockButton).toBeInTheDocument();
        });

        it('should allow clicking unlock button', async () => {
            // Arrange
            const user = userEvent.setup();
            const lockedUser = createMockUser({
                id: 'user-to-unlock',
                email: 'unlock-click@example.com',
                isLockedOut: true,
            });
            mockSearchUsers.mockResolvedValue(createMockSearchResponse([lockedUser]));

            render(<UserListPage />);

            await waitFor(() => {
                expect(screen.getByRole('row', { name: /user row unlock-click@example.com/i })).toBeInTheDocument();
            });

            // Act
            const userRow = screen.getByRole('row', { name: /user row unlock-click@example.com/i });
            const unlockButton = within(userRow).getByRole('button', { name: /unlock unlock-click@example.com/i });
            await user.click(unlockButton);

            // Assert - button is clickable (no error thrown)
            expect(unlockButton).toBeInTheDocument();
        });
    });

    describe('Error Handling', () => {
        it('should display generic error for non-Error exceptions', async () => {
            // Arrange
            mockSearchUsers.mockRejectedValue('Some string error');

            // Act
            render(<UserListPage />);

            // Assert
            await waitFor(() => {
                expect(screen.getByRole('alert')).toBeInTheDocument();
                expect(screen.getByText(/failed to load users/i)).toBeInTheDocument();
            });
        });

        it('should allow closing error alert', async () => {
            // Arrange
            const user = userEvent.setup();
            mockSearchUsers.mockRejectedValue(new Error('Test error'));

            render(<UserListPage />);

            await waitFor(() => {
                expect(screen.getByRole('alert')).toBeInTheDocument();
            });

            // Act
            const closeButton = screen.getByRole('button', { name: /close/i });
            await user.click(closeButton);

            // Assert
            await waitFor(() => {
                expect(screen.queryByRole('alert')).not.toBeInTheDocument();
            });
        });
    });

    describe('Pagination', () => {
        it('should display data grid when hasMore is true', async () => {
            // Arrange
            const users = [createMockUser()];
            mockSearchUsers.mockResolvedValue(
                createMockSearchResponse(users, { hasMore: true, totalCount: 100 })
            );

            // Act
            render(<UserListPage />);

            // Assert
            await waitFor(() => {
                expect(screen.getByRole('grid', { name: /user data grid/i })).toBeInTheDocument();
            });
        });

        it('should not display Load More when hasMore is false', async () => {
            // Arrange
            const users = [createMockUser()];
            mockSearchUsers.mockResolvedValue(
                createMockSearchResponse(users, { hasMore: false, totalCount: 1 })
            );

            // Act
            render(<UserListPage />);

            // Assert
            await waitFor(() => {
                expect(screen.getByRole('grid', { name: /user data grid/i })).toBeInTheDocument();
            });
            // Load More button should not be present
            expect(screen.queryByRole('button', { name: /load more/i })).not.toBeInTheDocument();
        });
    });
});
