/**
 * UserDetailModal Component Tests
 * Tests modal dialog functionality for viewing and managing user details
 * Coverage: Rendering, tabs, user information display, and admin actions
 *
 * Test Coverage:
 * - Dialog rendering (open/closed states)
 * - Loading state while fetching user
 * - User information display in Information tab
 * - Tab navigation (Information, Roles, Activity)
 * - Lock/Unlock user actions
 * - Verify email action
 * - Reset password action
 * - Close modal behavior
 * - Callback invocations
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UserDetailModal } from './UserDetailModal';
import { userService, UserDetailResponse } from '@services/userService';

// Mock userService
vi.mock('@services/userService', () => ({
    userService: {
        getUserById: vi.fn(),
        lockUser: vi.fn(),
        unlockUser: vi.fn(),
        verifyEmail: vi.fn(),
        sendPasswordReset: vi.fn(),
    },
}));

// Mock child components
vi.mock('@components/users/RoleManagement', () => ({
    RoleManagement: vi.fn(() => <div>Role Management Component</div>),
}));

vi.mock('@components/users/UserActivity', () => ({
    UserActivity: vi.fn(() => <div>User Activity Component</div>),
}));

// Mock MUI icons to simplify rendering
vi.mock('@mui/icons-material', () => ({
    Close: () => <span>CloseIcon</span>,
    Lock: () => <span>LockIcon</span>,
    LockOpen: () => <span>UnlockIcon</span>,
    VerifiedUser: () => <span>VerifiedIcon</span>,
    Password: () => <span>PasswordIcon</span>,
}));

// Helper function to create mock user data
const createMockUser = (overrides: Partial<UserDetailResponse> = {}): UserDetailResponse => ({
    id: 'user-1',
    email: 'test@example.com',
    displayName: 'Test User',
    phoneNumber: undefined,
    emailConfirmed: true,
    phoneNumberConfirmed: false,
    twoFactorEnabled: false,
    lockoutEnabled: true,
    isLockedOut: false,
    accessFailedCount: 0,
    roles: ['User'],
    createdDate: '2024-01-01T00:00:00Z',
    lastModifiedDate: '2024-01-02T00:00:00Z',
    ...overrides,
});

describe('UserDetailModal', () => {
    const mockGetUserById = userService.getUserById as ReturnType<typeof vi.fn>;
    const mockLockUser = userService.lockUser as ReturnType<typeof vi.fn>;
    const mockUnlockUser = userService.unlockUser as ReturnType<typeof vi.fn>;
    const mockVerifyEmail = userService.verifyEmail as ReturnType<typeof vi.fn>;
    const mockSendPasswordReset = userService.sendPasswordReset as ReturnType<typeof vi.fn>;

    const defaultProps = {
        open: true,
        userId: 'user-1',
        onClose: vi.fn(),
        onUserUpdated: vi.fn(),
    };

    beforeEach(() => {
        vi.resetAllMocks();

        // Default mock implementations
        mockGetUserById.mockResolvedValue(createMockUser());
        mockLockUser.mockResolvedValue({ success: true });
        mockUnlockUser.mockResolvedValue({ success: true });
        mockVerifyEmail.mockResolvedValue({ success: true, emailConfirmed: true });
        mockSendPasswordReset.mockResolvedValue({ success: true, emailSent: true });
    });

    describe('Rendering', () => {
        it('should render dialog with title when open', async () => {
            // Arrange & Act
            render(<UserDetailModal {...defaultProps} />);

            // Assert
            await waitFor(() => {
                expect(screen.getByRole('dialog')).toBeInTheDocument();
            });
            // MUI Dialog creates multiple headings, verify at least one exists
            const headings = screen.getAllByRole('heading', { name: /user details/i });
            expect(headings.length).toBeGreaterThan(0);
        });

        it('should not render dialog content when closed', () => {
            // Arrange & Act
            render(<UserDetailModal {...defaultProps} open={false} />);

            // Assert
            expect(screen.queryByRole('heading', { name: /user details/i })).not.toBeInTheDocument();
        });

        it('should show loading spinner while loading user', async () => {
            // Arrange
            let resolveGetUser: (value: UserDetailResponse) => void = () => {};
            mockGetUserById.mockImplementation(
                () =>
                    new Promise((resolve) => {
                        resolveGetUser = resolve;
                    })
            );

            // Act
            render(<UserDetailModal {...defaultProps} />);

            // Assert
            await waitFor(() => {
                expect(screen.getByRole('progressbar')).toBeInTheDocument();
            });

            // Cleanup
            resolveGetUser(createMockUser());
        });

        it('should display user information in Information tab', async () => {
            // Arrange
            const mockUser = createMockUser({
                email: 'john.doe@example.com',
                displayName: 'John Doe',
                phoneNumber: '+1234567890',
                accessFailedCount: 2,
            });
            mockGetUserById.mockResolvedValue(mockUser);

            // Act
            render(<UserDetailModal {...defaultProps} />);

            // Assert
            await waitFor(() => {
                expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
            });
            expect(screen.getByText('John Doe')).toBeInTheDocument();
            expect(screen.getByText('+1234567890')).toBeInTheDocument();
            expect(screen.getByText('2')).toBeInTheDocument(); // accessFailedCount
        });

        it('should show tabs (Information, Roles, Activity)', async () => {
            // Arrange & Act
            render(<UserDetailModal {...defaultProps} />);

            // Assert
            await waitFor(() => {
                expect(screen.getByRole('tab', { name: /information/i })).toBeInTheDocument();
            });
            expect(screen.getByRole('tab', { name: /roles/i })).toBeInTheDocument();
            expect(screen.getByRole('tab', { name: /activity/i })).toBeInTheDocument();
        });

        it('should display Active status chip for non-locked user', async () => {
            // Arrange
            mockGetUserById.mockResolvedValue(createMockUser({ isLockedOut: false }));

            // Act
            render(<UserDetailModal {...defaultProps} />);

            // Assert
            await waitFor(() => {
                expect(screen.getByText('Active')).toBeInTheDocument();
            });
        });

        it('should display Locked status chip for locked user', async () => {
            // Arrange
            mockGetUserById.mockResolvedValue(createMockUser({ isLockedOut: true }));

            // Act
            render(<UserDetailModal {...defaultProps} />);

            // Assert
            await waitFor(() => {
                expect(screen.getByText('Locked')).toBeInTheDocument();
            });
        });

        it('should show N/A for missing phone number', async () => {
            // Arrange
            mockGetUserById.mockResolvedValue(createMockUser({ phoneNumber: undefined }));

            // Act
            render(<UserDetailModal {...defaultProps} />);

            // Assert - Wait for user info to load, then check for N/A values
            await waitFor(() => {
                expect(screen.getByText('test@example.com')).toBeInTheDocument();
            });
            // Multiple N/A values may be present (phone, last login, etc.)
            const naElements = screen.getAllByText('N/A');
            expect(naElements.length).toBeGreaterThan(0);
        });
    });

    describe('Tab Navigation', () => {
        it('should switch to Roles tab when clicked', async () => {
            // Arrange
            const user = userEvent.setup();
            render(<UserDetailModal {...defaultProps} />);

            await waitFor(() => {
                expect(screen.getByRole('tab', { name: /roles/i })).toBeInTheDocument();
            });

            // Act
            const rolesTab = screen.getByRole('tab', { name: /roles/i });
            await user.click(rolesTab);

            // Assert
            await waitFor(() => {
                expect(screen.getByText('Role Management Component')).toBeInTheDocument();
            });
        });

        it('should switch to Activity tab when clicked', async () => {
            // Arrange
            const user = userEvent.setup();
            render(<UserDetailModal {...defaultProps} />);

            await waitFor(() => {
                expect(screen.getByRole('tab', { name: /activity/i })).toBeInTheDocument();
            });

            // Act
            const activityTab = screen.getByRole('tab', { name: /activity/i });
            await user.click(activityTab);

            // Assert
            await waitFor(() => {
                expect(screen.getByText('User Activity Component')).toBeInTheDocument();
            });
        });
    });

    describe('Lock/Unlock Actions', () => {
        it('should call lockUser when Lock button clicked', async () => {
            // Arrange
            const user = userEvent.setup();
            mockGetUserById.mockResolvedValue(createMockUser({ isLockedOut: false }));

            render(<UserDetailModal {...defaultProps} />);

            await waitFor(() => {
                expect(screen.getByRole('button', { name: /lock user/i })).toBeInTheDocument();
            });

            // Act
            const lockButton = screen.getByRole('button', { name: /lock user/i });
            await user.click(lockButton);

            // Assert
            await waitFor(() => {
                expect(mockLockUser).toHaveBeenCalledWith('user-1');
            });
        });

        it('should call unlockUser when Unlock button clicked for locked user', async () => {
            // Arrange
            const user = userEvent.setup();
            mockGetUserById.mockResolvedValue(createMockUser({ isLockedOut: true }));

            render(<UserDetailModal {...defaultProps} />);

            await waitFor(() => {
                expect(screen.getByRole('button', { name: /unlock user/i })).toBeInTheDocument();
            });

            // Act
            const unlockButton = screen.getByRole('button', { name: /unlock user/i });
            await user.click(unlockButton);

            // Assert
            await waitFor(() => {
                expect(mockUnlockUser).toHaveBeenCalledWith('user-1');
            });
        });

        it('should call onUserUpdated after successful lock action', async () => {
            // Arrange
            const user = userEvent.setup();
            const onUserUpdated = vi.fn();
            mockGetUserById.mockResolvedValue(createMockUser({ isLockedOut: false }));
            mockLockUser.mockResolvedValue({ success: true });

            render(<UserDetailModal {...defaultProps} onUserUpdated={onUserUpdated} />);

            await waitFor(() => {
                expect(screen.getByRole('button', { name: /lock user/i })).toBeInTheDocument();
            });

            // Act
            const lockButton = screen.getByRole('button', { name: /lock user/i });
            await user.click(lockButton);

            // Assert
            await waitFor(() => {
                expect(onUserUpdated).toHaveBeenCalled();
            });
        });

        it('should call onUserUpdated after successful unlock action', async () => {
            // Arrange
            const user = userEvent.setup();
            const onUserUpdated = vi.fn();
            mockGetUserById.mockResolvedValue(createMockUser({ isLockedOut: true }));
            mockUnlockUser.mockResolvedValue({ success: true });

            render(<UserDetailModal {...defaultProps} onUserUpdated={onUserUpdated} />);

            await waitFor(() => {
                expect(screen.getByRole('button', { name: /unlock user/i })).toBeInTheDocument();
            });

            // Act
            const unlockButton = screen.getByRole('button', { name: /unlock user/i });
            await user.click(unlockButton);

            // Assert
            await waitFor(() => {
                expect(onUserUpdated).toHaveBeenCalled();
            });
        });

        it('should reload user details after lock action', async () => {
            // Arrange
            const user = userEvent.setup();
            mockGetUserById.mockResolvedValue(createMockUser({ isLockedOut: false }));

            render(<UserDetailModal {...defaultProps} />);

            await waitFor(() => {
                expect(screen.getByRole('button', { name: /lock user/i })).toBeInTheDocument();
            });

            mockGetUserById.mockClear();

            // Act
            const lockButton = screen.getByRole('button', { name: /lock user/i });
            await user.click(lockButton);

            // Assert
            await waitFor(() => {
                expect(mockGetUserById).toHaveBeenCalledWith('user-1');
            });
        });
    });

    describe('Verify Email Action', () => {
        it('should call verifyEmail when Verify Email button clicked', async () => {
            // Arrange
            const user = userEvent.setup();
            mockGetUserById.mockResolvedValue(createMockUser({ emailConfirmed: false }));

            render(<UserDetailModal {...defaultProps} />);

            await waitFor(() => {
                expect(screen.getByRole('button', { name: /verify email/i })).toBeInTheDocument();
            });

            // Act
            const verifyButton = screen.getByRole('button', { name: /verify email/i });
            await user.click(verifyButton);

            // Assert
            await waitFor(() => {
                expect(mockVerifyEmail).toHaveBeenCalledWith('user-1');
            });
        });

        it('should not show Verify Email button when email is already confirmed', async () => {
            // Arrange
            mockGetUserById.mockResolvedValue(createMockUser({ emailConfirmed: true }));

            // Act
            render(<UserDetailModal {...defaultProps} />);

            // Assert - Wait for user data to load and render
            await waitFor(() => {
                expect(screen.getByText('test@example.com')).toBeInTheDocument();
            });
            expect(screen.queryByRole('button', { name: /verify email/i })).not.toBeInTheDocument();
        });

        it('should call onUserUpdated after successful verify email action', async () => {
            // Arrange
            const user = userEvent.setup();
            const onUserUpdated = vi.fn();
            mockGetUserById.mockResolvedValue(createMockUser({ emailConfirmed: false }));

            render(<UserDetailModal {...defaultProps} onUserUpdated={onUserUpdated} />);

            await waitFor(() => {
                expect(screen.getByRole('button', { name: /verify email/i })).toBeInTheDocument();
            });

            // Act
            const verifyButton = screen.getByRole('button', { name: /verify email/i });
            await user.click(verifyButton);

            // Assert
            await waitFor(() => {
                expect(onUserUpdated).toHaveBeenCalled();
            });
        });
    });

    describe('Reset Password Action', () => {
        it('should call sendPasswordReset when Reset Password button clicked', async () => {
            // Arrange
            const user = userEvent.setup();
            const mockUser = createMockUser({ email: 'reset@example.com' });
            mockGetUserById.mockResolvedValue(mockUser);

            render(<UserDetailModal {...defaultProps} />);

            await waitFor(() => {
                expect(screen.getByRole('button', { name: /reset password/i })).toBeInTheDocument();
            });

            // Act
            const resetButton = screen.getByRole('button', { name: /reset password/i });
            await user.click(resetButton);

            // Assert
            await waitFor(() => {
                expect(mockSendPasswordReset).toHaveBeenCalledWith('user-1', 'reset@example.com');
            });
        });
    });

    describe('Close Modal', () => {
        it('should call onClose when Close button clicked', async () => {
            // Arrange
            const user = userEvent.setup();
            const onClose = vi.fn();
            render(<UserDetailModal {...defaultProps} onClose={onClose} />);

            await waitFor(() => {
                expect(screen.getByRole('button', { name: /^close$/i })).toBeInTheDocument();
            });

            // Act
            const closeButton = screen.getByRole('button', { name: /^close$/i });
            await user.click(closeButton);

            // Assert
            expect(onClose).toHaveBeenCalled();
        });

        it('should call onClose when X icon button clicked', async () => {
            // Arrange
            const user = userEvent.setup();
            const onClose = vi.fn();
            render(<UserDetailModal {...defaultProps} onClose={onClose} />);

            // Wait for the dialog and user data to load
            await waitFor(() => {
                expect(screen.getByText('test@example.com')).toBeInTheDocument();
            });

            // Act - Find the IconButton with CloseIcon (the X button in title bar)
            const closeIconButtons = screen.getAllByRole('button').filter(
                (btn) => btn.querySelector('span')?.textContent === 'CloseIcon'
            );
            expect(closeIconButtons.length).toBeGreaterThan(0);
            if (closeIconButtons[0]) {
                await user.click(closeIconButtons[0]);
            }

            // Assert
            expect(onClose).toHaveBeenCalled();
        });

        it('should reset tab to Information when reopened', async () => {
            // Arrange
            const user = userEvent.setup();
            const { rerender } = render(<UserDetailModal {...defaultProps} />);

            await waitFor(() => {
                expect(screen.getByRole('tab', { name: /activity/i })).toBeInTheDocument();
            });

            // Switch to Activity tab
            const activityTab = screen.getByRole('tab', { name: /activity/i });
            await user.click(activityTab);

            await waitFor(() => {
                expect(screen.getByText('User Activity Component')).toBeInTheDocument();
            });

            // Close and reopen
            const closeButton = screen.getByRole('button', { name: /^close$/i });
            await user.click(closeButton);

            // Reset mock to return fresh data
            mockGetUserById.mockResolvedValue(createMockUser());

            rerender(<UserDetailModal {...defaultProps} open={false} />);
            rerender(<UserDetailModal {...defaultProps} open={true} />);

            // Assert - Information tab content should be visible
            await waitFor(() => {
                expect(screen.getByText('test@example.com')).toBeInTheDocument();
            });
        });
    });

    describe('Error Handling', () => {
        it('should display error message when user load fails', async () => {
            // Arrange
            mockGetUserById.mockRejectedValue(new Error('Network error'));

            // Act
            render(<UserDetailModal {...defaultProps} />);

            // Assert
            await waitFor(() => {
                expect(screen.getByText(/failed to load user details/i)).toBeInTheDocument();
            });
        });

        it('should not crash when lock action fails', async () => {
            // Arrange
            const user = userEvent.setup();
            mockGetUserById.mockResolvedValue(createMockUser({ isLockedOut: false }));
            mockLockUser.mockRejectedValue(new Error('Lock failed'));

            render(<UserDetailModal {...defaultProps} />);

            await waitFor(() => {
                expect(screen.getByRole('button', { name: /lock user/i })).toBeInTheDocument();
            });

            // Act
            const lockButton = screen.getByRole('button', { name: /lock user/i });
            await user.click(lockButton);

            // Assert - modal should still be visible
            await waitFor(() => {
                expect(screen.getByRole('dialog')).toBeInTheDocument();
            });
        });
    });

    describe('Null/Missing Data', () => {
        it('should not load user when userId is null', async () => {
            // Arrange & Act
            render(<UserDetailModal {...defaultProps} userId={null} />);

            // Assert
            await waitFor(() => {
                expect(screen.getByRole('dialog')).toBeInTheDocument();
            });
            expect(mockGetUserById).not.toHaveBeenCalled();
        });

        it('should display N/A for missing last login date', async () => {
            // Arrange
            mockGetUserById.mockResolvedValue(createMockUser({ lastLoginDate: undefined }));

            // Act
            render(<UserDetailModal {...defaultProps} />);

            // Assert
            await waitFor(() => {
                // There should be at least one N/A displayed (for missing dates)
                const naElements = screen.getAllByText('N/A');
                expect(naElements.length).toBeGreaterThan(0);
            });
        });
    });
});
