import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProfileSettings } from './ProfileSettings';

// Mock profile API hooks
const mockGetProfileQuery = vi.fn();
const mockUpdateProfile = vi.fn();
const mockUploadAvatar = vi.fn();
const mockDeleteAvatar = vi.fn();
const mockResendEmailConfirmation = vi.fn();

vi.mock('@/api/profileApi', () => ({
    useGetProfileQuery: () => mockGetProfileQuery(),
    useUpdateProfileMutation: () => [mockUpdateProfile, { isLoading: false }],
    useUploadAvatarMutation: () => [mockUploadAvatar, { isLoading: false }],
    useDeleteAvatarMutation: () => [mockDeleteAvatar, { isLoading: false }],
}));

vi.mock('@/services/authApi', () => ({
    useResendEmailConfirmationMutation: () => [mockResendEmailConfirmation, { isLoading: false }],
}));

// Mock useAuth hook
const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
    displayName: 'Test User',
    emailConfirmed: true,
};
const mockAuthReturnValue = {
    user: mockUser,
    error: null,
};

vi.mock('@/hooks/useAuth', () => ({
    useAuth: () => mockAuthReturnValue,
}));

// Mock useAuthenticatedImageUrl hook
vi.mock('@/hooks/useAuthenticatedImageUrl', () => ({
    useAuthenticatedImageUrl: () => ({
        blobUrl: null,
        isLoading: false,
        error: null,
    }),
}));

// Mock config
vi.mock('@/config/development', () => ({
    getApiEndpoints: () => ({
        media: '/api/media',
    }),
}));

// Mock error handling utilities
vi.mock('@/utils/errorHandling', () => ({
    handleValidationError: vi.fn(),
}));

vi.mock('@/utils/renderError', () => ({
    renderAuthError: (error: unknown) => (typeof error === 'string' ? error : 'An error occurred'),
}));

// Mock useTheme
vi.mock('@mui/material/styles', () => ({
    useTheme: () => ({
        palette: {
            success: { main: '#4caf50' },
            warning: { main: '#ff9800' },
        },
    }),
}));

describe('ProfileSettings', () => {
    const mockProfileData = {
        name: 'Test User',
        displayName: 'TestUser',
        phoneNumber: '+1 555-123-4567',
        avatarId: undefined,
        success: true,
    };

    beforeEach(() => {
        vi.clearAllMocks();

        // Reset mock return values
        mockAuthReturnValue.user = mockUser;
        mockAuthReturnValue.error = null;

        // Default profile query setup
        mockGetProfileQuery.mockReturnValue({
            data: mockProfileData,
            isLoading: false,
            error: null,
        });

        // Default mutation setups
        mockUpdateProfile.mockReturnValue({ unwrap: vi.fn().mockResolvedValue({ success: true }) });
        mockUploadAvatar.mockReturnValue({ unwrap: vi.fn().mockResolvedValue({ success: true, avatarId: 'new-avatar-id' }) });
        mockDeleteAvatar.mockReturnValue({ unwrap: vi.fn().mockResolvedValue({ success: true }) });
        mockResendEmailConfirmation.mockReturnValue({ unwrap: vi.fn().mockResolvedValue({ success: true }) });
    });

    // ========================================
    // Loading States
    // ========================================

    describe('loading states', () => {
        it('should show loading spinner when profile is loading', () => {
            // Arrange
            mockGetProfileQuery.mockReturnValue({
                data: undefined,
                isLoading: true,
                error: null,
            });

            // Act
            render(<ProfileSettings />);

            // Assert
            expect(screen.getByRole('progressbar')).toBeInTheDocument();
        });

        it('should show loading spinner when user is not available', () => {
            // Arrange
            mockAuthReturnValue.user = null;
            mockGetProfileQuery.mockReturnValue({
                data: mockProfileData,
                isLoading: false,
                error: null,
            });

            // Act
            render(<ProfileSettings />);

            // Assert
            expect(screen.getByRole('progressbar')).toBeInTheDocument();
        });
    });

    // ========================================
    // Component Rendering
    // ========================================

    describe('component rendering', () => {
        it('should render profile settings heading', async () => {
            // Arrange & Act
            render(<ProfileSettings />);

            // Assert
            expect(screen.getByRole('heading', { name: /profile settings/i })).toBeInTheDocument();
        });

        it('should render edit profile button when not editing', async () => {
            // Arrange & Act
            render(<ProfileSettings />);

            // Assert
            expect(screen.getByRole('button', { name: /edit profile/i })).toBeInTheDocument();
        });

        it('should render email field with current user email', async () => {
            // Arrange & Act
            render(<ProfileSettings />);

            // Assert
            const emailField = screen.getByLabelText(/email address/i);
            expect(emailField).toBeInTheDocument();
            expect(emailField).toHaveValue('test@example.com');
            expect(emailField).toBeDisabled();
        });

        it('should render full name field with profile data', async () => {
            // Arrange & Act
            render(<ProfileSettings />);

            // Assert
            const nameField = screen.getByLabelText(/full name/i);
            expect(nameField).toBeInTheDocument();
            expect(nameField).toHaveValue('Test User');
        });

        it('should render display name field with profile data', async () => {
            // Arrange & Act
            render(<ProfileSettings />);

            // Assert
            const displayNameField = screen.getByLabelText(/display name/i);
            expect(displayNameField).toBeInTheDocument();
            expect(displayNameField).toHaveValue('TestUser');
        });

        it('should render phone number field with profile data', async () => {
            // Arrange & Act
            render(<ProfileSettings />);

            // Assert
            const phoneField = screen.getByLabelText(/phone number/i);
            expect(phoneField).toBeInTheDocument();
            expect(phoneField).toHaveValue('+1 555-123-4567');
        });

        it('should render avatar with user initials when no avatar image', async () => {
            // Arrange & Act
            render(<ProfileSettings />);

            // Assert
            const avatar = screen.getByText('T'); // First character of displayName
            expect(avatar).toBeInTheDocument();
        });
    });

    // ========================================
    // Email Verification Status
    // ========================================

    describe('email verification status', () => {
        it('should show verified icon when email is confirmed', async () => {
            // Arrange
            mockAuthReturnValue.user = { ...mockUser, emailConfirmed: true };

            // Act
            render(<ProfileSettings />);

            // Assert
            expect(screen.getByLabelText(/email verified/i)).toBeInTheDocument();
        });

        it('should show warning icon and resend button when email is not confirmed', async () => {
            // Arrange
            mockAuthReturnValue.user = { ...mockUser, emailConfirmed: false };

            // Act
            render(<ProfileSettings />);

            // Assert
            expect(screen.getByLabelText(/email not verified/i)).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /resend confirmation email/i })).toBeInTheDocument();
        });

        it('should call resendEmailConfirmation when resend button is clicked', async () => {
            // Arrange
            const user = userEvent.setup();
            mockAuthReturnValue.user = { ...mockUser, emailConfirmed: false };
            const mockUnwrap = vi.fn().mockResolvedValue({ success: true });
            mockResendEmailConfirmation.mockReturnValue({ unwrap: mockUnwrap });

            render(<ProfileSettings />);

            // Act
            await user.click(screen.getByRole('button', { name: /resend confirmation email/i }));

            // Assert
            await waitFor(() => {
                expect(mockResendEmailConfirmation).toHaveBeenCalled();
                expect(mockUnwrap).toHaveBeenCalled();
            });
        });

        it('should show success message after resending confirmation email', async () => {
            // Arrange
            const user = userEvent.setup();
            mockAuthReturnValue.user = { ...mockUser, emailConfirmed: false };
            const mockUnwrap = vi.fn().mockResolvedValue({ success: true });
            mockResendEmailConfirmation.mockReturnValue({ unwrap: mockUnwrap });

            render(<ProfileSettings />);

            // Act
            await user.click(screen.getByRole('button', { name: /resend confirmation email/i }));

            // Assert
            await waitFor(() => {
                expect(screen.getByText(/confirmation email sent/i)).toBeInTheDocument();
            });
        });
    });

    // ========================================
    // Edit Mode
    // ========================================

    describe('edit mode', () => {
        it('should enable editing when edit profile button is clicked', async () => {
            // Arrange
            const user = userEvent.setup();
            render(<ProfileSettings />);

            // Act
            await user.click(screen.getByRole('button', { name: /edit profile/i }));

            // Assert
            expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
            expect(screen.queryByRole('button', { name: /edit profile/i })).not.toBeInTheDocument();
        });

        it('should enable form fields when in edit mode', async () => {
            // Arrange
            const user = userEvent.setup();
            render(<ProfileSettings />);

            // Act
            await user.click(screen.getByRole('button', { name: /edit profile/i }));

            // Assert
            expect(screen.getByLabelText(/full name/i)).not.toBeDisabled();
            expect(screen.getByLabelText(/display name/i)).not.toBeDisabled();
            expect(screen.getByLabelText(/phone number/i)).not.toBeDisabled();
            // Email should always be disabled
            expect(screen.getByLabelText(/email address/i)).toBeDisabled();
        });

        it('should allow editing name field in edit mode', async () => {
            // Arrange
            const user = userEvent.setup();
            render(<ProfileSettings />);
            await user.click(screen.getByRole('button', { name: /edit profile/i }));

            const nameField = screen.getByLabelText(/full name/i);

            // Act
            await user.clear(nameField);
            await user.type(nameField, 'New Name');

            // Assert
            expect(nameField).toHaveValue('New Name');
        });

        it('should reset form and exit edit mode when cancel is clicked', async () => {
            // Arrange
            const user = userEvent.setup();
            render(<ProfileSettings />);
            await user.click(screen.getByRole('button', { name: /edit profile/i }));

            const nameField = screen.getByLabelText(/full name/i);
            await user.clear(nameField);
            await user.type(nameField, 'Changed Name');

            // Act
            await user.click(screen.getByRole('button', { name: /cancel/i }));

            // Assert
            expect(screen.getByLabelText(/full name/i)).toHaveValue('Test User');
            expect(screen.getByRole('button', { name: /edit profile/i })).toBeInTheDocument();
        });
    });

    // ========================================
    // Form Validation
    // ========================================

    describe('form validation', () => {
        it('should show error when name is empty', async () => {
            // Arrange
            const user = userEvent.setup();
            render(<ProfileSettings />);
            await user.click(screen.getByRole('button', { name: /edit profile/i }));

            const nameField = screen.getByLabelText(/full name/i);

            // Act
            await user.clear(nameField);
            await user.click(screen.getByRole('button', { name: /save changes/i }));

            // Assert
            await waitFor(() => {
                expect(screen.getByText(/name is required/i)).toBeInTheDocument();
            });
        });

        it('should show error when name is too short', async () => {
            // Arrange
            const user = userEvent.setup();
            render(<ProfileSettings />);
            await user.click(screen.getByRole('button', { name: /edit profile/i }));

            const nameField = screen.getByLabelText(/full name/i);

            // Act
            await user.clear(nameField);
            await user.type(nameField, 'AB');
            await user.click(screen.getByRole('button', { name: /save changes/i }));

            // Assert
            await waitFor(() => {
                expect(screen.getByText(/name must be at least 3 characters/i)).toBeInTheDocument();
            });
        });

        it('should show error when display name is empty', async () => {
            // Arrange
            const user = userEvent.setup();
            render(<ProfileSettings />);
            await user.click(screen.getByRole('button', { name: /edit profile/i }));

            const displayNameField = screen.getByLabelText(/display name/i);

            // Act
            await user.clear(displayNameField);
            await user.click(screen.getByRole('button', { name: /save changes/i }));

            // Assert
            await waitFor(() => {
                expect(screen.getByText(/display name is required/i)).toBeInTheDocument();
            });
        });

        it('should show error when phone number format is invalid', async () => {
            // Arrange
            const user = userEvent.setup();
            render(<ProfileSettings />);
            await user.click(screen.getByRole('button', { name: /edit profile/i }));

            const phoneField = screen.getByLabelText(/phone number/i);

            // Act
            await user.clear(phoneField);
            await user.type(phoneField, 'invalid-phone');
            await user.click(screen.getByRole('button', { name: /save changes/i }));

            // Assert
            await waitFor(() => {
                expect(screen.getByText(/invalid phone number format/i)).toBeInTheDocument();
            });
        });

        it('should clear validation error when field is edited', async () => {
            // Arrange
            const user = userEvent.setup();
            render(<ProfileSettings />);
            await user.click(screen.getByRole('button', { name: /edit profile/i }));

            const nameField = screen.getByLabelText(/full name/i);
            await user.clear(nameField);
            await user.click(screen.getByRole('button', { name: /save changes/i }));

            await waitFor(() => {
                expect(screen.getByText(/name is required/i)).toBeInTheDocument();
            });

            // Act
            await user.type(nameField, 'Valid Name');

            // Assert
            await waitFor(() => {
                expect(screen.queryByText(/name is required/i)).not.toBeInTheDocument();
            });
        });
    });

    // ========================================
    // Save Profile
    // ========================================

    describe('save profile', () => {
        it('should call updateProfile when save is clicked with valid data', async () => {
            // Arrange
            const user = userEvent.setup();
            const mockUnwrap = vi.fn().mockResolvedValue({ success: true });
            mockUpdateProfile.mockReturnValue({ unwrap: mockUnwrap });

            render(<ProfileSettings />);
            await user.click(screen.getByRole('button', { name: /edit profile/i }));

            const nameField = screen.getByLabelText(/full name/i);
            await user.clear(nameField);
            await user.type(nameField, 'Updated Name');

            // Act
            await user.click(screen.getByRole('button', { name: /save changes/i }));

            // Assert
            await waitFor(() => {
                expect(mockUpdateProfile).toHaveBeenCalled();
                expect(mockUnwrap).toHaveBeenCalled();
            });
        });

        it('should exit edit mode after successful save', async () => {
            // Arrange
            const user = userEvent.setup();
            const mockUnwrap = vi.fn().mockResolvedValue({ success: true });
            mockUpdateProfile.mockReturnValue({ unwrap: mockUnwrap });

            render(<ProfileSettings />);
            await user.click(screen.getByRole('button', { name: /edit profile/i }));

            const nameField = screen.getByLabelText(/full name/i);
            await user.clear(nameField);
            await user.type(nameField, 'Updated Name');

            // Act
            await user.click(screen.getByRole('button', { name: /save changes/i }));

            // Assert
            await waitFor(() => {
                expect(screen.getByRole('button', { name: /edit profile/i })).toBeInTheDocument();
            });
        });

        it('should show error when save fails', async () => {
            // Arrange
            const user = userEvent.setup();
            const mockUnwrap = vi.fn().mockRejectedValue({ data: { message: 'Failed to update profile' } });
            mockUpdateProfile.mockReturnValue({ unwrap: mockUnwrap });

            render(<ProfileSettings />);
            await user.click(screen.getByRole('button', { name: /edit profile/i }));

            const nameField = screen.getByLabelText(/full name/i);
            await user.clear(nameField);
            await user.type(nameField, 'Updated Name');

            // Act
            await user.click(screen.getByRole('button', { name: /save changes/i }));

            // Assert
            await waitFor(() => {
                expect(screen.getByRole('alert')).toBeInTheDocument();
                expect(screen.getByText(/failed to update profile/i)).toBeInTheDocument();
            });
        });
    });

    // ========================================
    // Avatar Upload
    // ========================================

    describe('avatar upload', () => {
        it('should show upload button when in edit mode', async () => {
            // Arrange
            const user = userEvent.setup();
            const { container } = render(<ProfileSettings />);

            // Act
            await user.click(screen.getByRole('button', { name: /edit profile/i }));

            // Assert
            const fileInput = container.querySelector('input[type="file"]');
            expect(fileInput).toBeInTheDocument();
        });

        it('should show error when non-image file is selected', async () => {
            // Arrange
            const user = userEvent.setup();
            const { container } = render(<ProfileSettings />);
            await user.click(screen.getByRole('button', { name: /edit profile/i }));

            const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
            const textFile = new File(['content'], 'test.txt', { type: 'text/plain' });

            // Act - Use fireEvent.change to bypass accept attribute filtering in browser
            fireEvent.change(fileInput, { target: { files: [textFile] } });

            // Assert
            await waitFor(() => {
                expect(screen.getByText(/please select a valid image file/i)).toBeInTheDocument();
            });
        });

        it('should show error when image file is too large', async () => {
            // Arrange
            const user = userEvent.setup();
            const { container } = render(<ProfileSettings />);
            await user.click(screen.getByRole('button', { name: /edit profile/i }));

            const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
            // Create a file larger than 5MB
            const largeContent = new Array(6 * 1024 * 1024).fill('a').join('');
            const largeFile = new File([largeContent], 'large.jpg', { type: 'image/jpeg' });

            // Act - Use fireEvent.change for consistency with file validation tests
            fireEvent.change(fileInput, { target: { files: [largeFile] } });

            // Assert
            await waitFor(() => {
                expect(screen.getByText(/image size must be less than 5mb/i)).toBeInTheDocument();
            });
        });

        it('should call uploadAvatar when valid image is selected', async () => {
            // Arrange
            const user = userEvent.setup();
            const mockUnwrap = vi.fn().mockResolvedValue({ success: true, avatarId: 'new-avatar-id' });
            mockUploadAvatar.mockReturnValue({ unwrap: mockUnwrap });

            const { container } = render(<ProfileSettings />);
            await user.click(screen.getByRole('button', { name: /edit profile/i }));

            const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
            const imageFile = new File(['image content'], 'avatar.jpg', { type: 'image/jpeg' });

            // Act
            await user.upload(fileInput, imageFile);

            // Assert
            await waitFor(() => {
                expect(mockUploadAvatar).toHaveBeenCalled();
                expect(mockUnwrap).toHaveBeenCalled();
            });
        });
    });

    // ========================================
    // Avatar Delete
    // ========================================

    describe('avatar delete', () => {
        it('should show remove avatar button when avatar exists in edit mode', async () => {
            // Arrange
            const user = userEvent.setup();
            mockGetProfileQuery.mockReturnValue({
                data: { ...mockProfileData, avatarId: 'existing-avatar-id' },
                isLoading: false,
                error: null,
            });

            render(<ProfileSettings />);

            // Act
            await user.click(screen.getByRole('button', { name: /edit profile/i }));

            // Assert
            expect(screen.getByRole('button', { name: /remove avatar/i })).toBeInTheDocument();
        });

        it('should call deleteAvatar when remove button is clicked', async () => {
            // Arrange
            const user = userEvent.setup();
            const mockUnwrap = vi.fn().mockResolvedValue({ success: true });
            mockDeleteAvatar.mockReturnValue({ unwrap: mockUnwrap });
            mockGetProfileQuery.mockReturnValue({
                data: { ...mockProfileData, avatarId: 'existing-avatar-id' },
                isLoading: false,
                error: null,
            });

            render(<ProfileSettings />);
            await user.click(screen.getByRole('button', { name: /edit profile/i }));

            // Act
            await user.click(screen.getByRole('button', { name: /remove avatar/i }));

            // Assert
            await waitFor(() => {
                expect(mockDeleteAvatar).toHaveBeenCalled();
                expect(mockUnwrap).toHaveBeenCalled();
            });
        });
    });

    // ========================================
    // Error Handling
    // ========================================

    describe('error handling', () => {
        it('should display auth error when present', async () => {
            // Arrange
            mockAuthReturnValue.error = 'Authentication error occurred';
            (mockAuthReturnValue as unknown as { error: string }).error = 'Authentication error occurred';

            // Act
            render(<ProfileSettings />);

            // Assert
            expect(screen.getByRole('alert')).toBeInTheDocument();
        });

        it('should display profile error when present', async () => {
            // Arrange
            mockGetProfileQuery.mockReturnValue({
                data: mockProfileData,
                isLoading: false,
                error: { status: 500, data: { message: 'Server error' } },
            });

            // Act
            render(<ProfileSettings />);

            // Assert
            expect(screen.getByRole('alert')).toBeInTheDocument();
        });

        it('should show error when avatar delete fails', async () => {
            // Arrange
            const user = userEvent.setup();
            const mockUnwrap = vi.fn().mockRejectedValue({ data: { message: 'Failed to delete avatar' } });
            mockDeleteAvatar.mockReturnValue({ unwrap: mockUnwrap });
            mockGetProfileQuery.mockReturnValue({
                data: { ...mockProfileData, avatarId: 'existing-avatar-id' },
                isLoading: false,
                error: null,
            });

            render(<ProfileSettings />);
            await user.click(screen.getByRole('button', { name: /edit profile/i }));

            // Act
            await user.click(screen.getByRole('button', { name: /remove avatar/i }));

            // Assert
            await waitFor(() => {
                expect(screen.getByRole('alert')).toBeInTheDocument();
                expect(screen.getByText(/failed to delete avatar/i)).toBeInTheDocument();
            });
        });
    });
});
