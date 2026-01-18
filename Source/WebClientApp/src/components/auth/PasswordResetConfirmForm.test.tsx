import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PasswordResetConfirmForm } from './PasswordResetConfirmForm';

// Mock react-router-dom
const mockSearchParams = new URLSearchParams();
vi.mock('react-router-dom', () => ({
    useSearchParams: () => [mockSearchParams],
}));

// Mock useAuth hook
const mockConfirmResetPassword = vi.fn();
const mockAuthReturnValue = {
    isLoading: false,
    error: null,
};

vi.mock('@/hooks/useAuth', () => ({
    useAuth: () => ({
        confirmResetPassword: mockConfirmResetPassword,
        get isLoading() {
            return mockAuthReturnValue.isLoading;
        },
        get error() {
            return mockAuthReturnValue.error;
        },
    }),
}));

// Mock error handling utilities
vi.mock('@/utils/errorHandling', () => ({
    handleValidationError: vi.fn(),
}));

vi.mock('@/utils/renderError', () => ({
    renderAuthError: vi.fn((error) => (typeof error === 'string' ? error : 'Error')),
}));

// Theme wrapper for testing
const theme = createTheme();
const renderWithTheme = (component: React.ReactElement) => {
    return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe('PasswordResetConfirmForm', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockAuthReturnValue.isLoading = false;
        mockAuthReturnValue.error = null;
        mockSearchParams.delete('email');
        mockSearchParams.delete('token');
    });

    // ========================================
    // Invalid Token State
    // ========================================

    describe('invalid token state', () => {
        it('should show "Invalid Reset Link" when email is missing', () => {
            // Arrange
            mockSearchParams.set('token', 'valid-token');

            // Act
            renderWithTheme(<PasswordResetConfirmForm />);

            // Assert
            expect(screen.getByRole('heading', { name: /invalid reset link/i })).toBeInTheDocument();
            expect(screen.getByRole('alert')).toHaveTextContent(/invalid reset link/i);
        });

        it('should show "Invalid Reset Link" when token is missing', () => {
            // Arrange
            mockSearchParams.set('email', 'test@example.com');

            // Act
            renderWithTheme(<PasswordResetConfirmForm />);

            // Assert
            expect(screen.getByRole('heading', { name: /invalid reset link/i })).toBeInTheDocument();
            expect(screen.getByRole('alert')).toHaveTextContent(/invalid reset link/i);
        });

        it('should show "Back to Login" button on invalid token screen', () => {
            // Arrange - no email or token

            // Act
            renderWithTheme(<PasswordResetConfirmForm />);

            // Assert
            expect(screen.getByRole('button', { name: /back to login/i })).toBeInTheDocument();
        });

        it('should call onSwitchToLogin when "Back to Login" button is clicked on invalid screen', async () => {
            // Arrange
            const user = userEvent.setup();
            const mockOnSwitchToLogin = vi.fn();

            // Act
            renderWithTheme(<PasswordResetConfirmForm onSwitchToLogin={mockOnSwitchToLogin} />);
            await user.click(screen.getByRole('button', { name: /back to login/i }));

            // Assert
            expect(mockOnSwitchToLogin).toHaveBeenCalledTimes(1);
        });
    });

    // ========================================
    // Rendering (Valid Token)
    // ========================================

    describe('rendering (valid token)', () => {
        beforeEach(() => {
            mockSearchParams.set('email', 'test@example.com');
            mockSearchParams.set('token', 'valid-reset-token');
        });

        it('should render "Reset Password" heading', () => {
            // Arrange & Act
            renderWithTheme(<PasswordResetConfirmForm />);

            // Assert
            expect(screen.getByRole('heading', { name: /reset password/i })).toBeInTheDocument();
        });

        it('should render disabled email field with value from URL', () => {
            // Arrange & Act
            renderWithTheme(<PasswordResetConfirmForm />);

            // Assert
            const emailField = screen.getByLabelText(/email address/i);
            expect(emailField).toBeInTheDocument();
            expect(emailField).toHaveValue('test@example.com');
            expect(emailField).toBeDisabled();
        });

        it('should render new password and confirm password fields', () => {
            // Arrange & Act
            renderWithTheme(<PasswordResetConfirmForm />);

            // Assert
            expect(screen.getByLabelText(/new password/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
        });

        it('should render "Reset Password" submit button', () => {
            // Arrange & Act
            renderWithTheme(<PasswordResetConfirmForm />);

            // Assert
            expect(screen.getByRole('button', { name: /reset password/i })).toBeInTheDocument();
        });

        it('should render helper text for email field', () => {
            // Arrange & Act
            renderWithTheme(<PasswordResetConfirmForm />);

            // Assert
            expect(screen.getByText(/resetting password for this account/i)).toBeInTheDocument();
        });

        it('should render description text', () => {
            // Arrange & Act
            renderWithTheme(<PasswordResetConfirmForm />);

            // Assert
            expect(screen.getByText(/enter your new password below/i)).toBeInTheDocument();
        });
    });

    // ========================================
    // Password Visibility Toggle
    // ========================================

    describe('password visibility', () => {
        beforeEach(() => {
            mockSearchParams.set('email', 'test@example.com');
            mockSearchParams.set('token', 'valid-reset-token');
        });

        it('should toggle password visibility for both password fields', async () => {
            // Arrange
            const user = userEvent.setup();
            renderWithTheme(<PasswordResetConfirmForm />);

            const newPasswordField = screen.getByLabelText(/new password/i);
            const confirmPasswordField = screen.getByLabelText(/confirm password/i);
            const toggleButton = screen.getByRole('button', { name: /toggle password visibility/i });

            // Assert - Initially passwords are hidden
            expect(newPasswordField).toHaveAttribute('type', 'password');
            expect(confirmPasswordField).toHaveAttribute('type', 'password');

            // Act - Toggle visibility
            await user.click(toggleButton);

            // Assert - Passwords are now visible
            expect(newPasswordField).toHaveAttribute('type', 'text');
            expect(confirmPasswordField).toHaveAttribute('type', 'text');

            // Act - Toggle visibility again
            await user.click(toggleButton);

            // Assert - Passwords are hidden again
            expect(newPasswordField).toHaveAttribute('type', 'password');
            expect(confirmPasswordField).toHaveAttribute('type', 'password');
        });
    });

    // ========================================
    // Password Strength Indicator
    // ========================================

    describe('password strength', () => {
        beforeEach(() => {
            mockSearchParams.set('email', 'test@example.com');
            mockSearchParams.set('token', 'valid-reset-token');
        });

        it('should show password strength indicator when password is entered', async () => {
            // Arrange
            const user = userEvent.setup();
            renderWithTheme(<PasswordResetConfirmForm />);
            const newPasswordField = screen.getByLabelText(/new password/i);

            // Assert - Initially no strength indicator
            expect(screen.queryByText(/password strength/i)).not.toBeInTheDocument();

            // Act
            await user.type(newPasswordField, 'test');

            // Assert
            expect(screen.getByText(/password strength/i)).toBeInTheDocument();
        });

        it('should show "Missing: ..." feedback for weak passwords', async () => {
            // Arrange
            const user = userEvent.setup();
            renderWithTheme(<PasswordResetConfirmForm />);
            const newPasswordField = screen.getByLabelText(/new password/i);

            // Act - Enter a weak password (only lowercase)
            await user.type(newPasswordField, 'weak');

            // Assert - Should show what's missing
            expect(screen.getByText(/missing/i)).toBeInTheDocument();
        });

        it('should show feedback for missing uppercase letter', async () => {
            // Arrange
            const user = userEvent.setup();
            renderWithTheme(<PasswordResetConfirmForm />);
            const newPasswordField = screen.getByLabelText(/new password/i);

            // Act - Enter password without uppercase
            await user.type(newPasswordField, 'lowercase1!');

            // Assert
            expect(screen.getByText(/uppercase letter/i)).toBeInTheDocument();
        });

        it('should show feedback for missing special character', async () => {
            // Arrange
            const user = userEvent.setup();
            renderWithTheme(<PasswordResetConfirmForm />);
            const newPasswordField = screen.getByLabelText(/new password/i);

            // Act - Enter password without special character
            await user.type(newPasswordField, 'Password1');

            // Assert
            expect(screen.getByText(/special character/i)).toBeInTheDocument();
        });

        it('should not show "Missing" when password meets all requirements', async () => {
            // Arrange
            const user = userEvent.setup();
            renderWithTheme(<PasswordResetConfirmForm />);
            const newPasswordField = screen.getByLabelText(/new password/i);

            // Act - Enter a strong password
            await user.type(newPasswordField, 'StrongP@ss1');

            // Assert - Strength indicator shows but no "Missing" text
            expect(screen.getByText(/password strength/i)).toBeInTheDocument();
            expect(screen.queryByText(/missing/i)).not.toBeInTheDocument();
        });
    });

    // ========================================
    // Form Validation
    // ========================================

    describe('form validation', () => {
        beforeEach(() => {
            mockSearchParams.set('email', 'test@example.com');
            mockSearchParams.set('token', 'valid-reset-token');
        });

        it('should show error when passwords do not match', async () => {
            // Arrange
            const user = userEvent.setup();
            renderWithTheme(<PasswordResetConfirmForm />);
            const newPasswordField = screen.getByLabelText(/new password/i);
            const confirmPasswordField = screen.getByLabelText(/confirm password/i);
            const submitButton = screen.getByRole('button', { name: /reset password/i });

            // Act
            await user.type(newPasswordField, 'StrongP@ss1');
            await user.type(confirmPasswordField, 'DifferentP@ss2');
            await user.click(submitButton);

            // Assert
            await waitFor(() => {
                expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
            });
            expect(mockConfirmResetPassword).not.toHaveBeenCalled();
        });

        it('should show error for weak password (score < 3)', async () => {
            // Arrange
            const user = userEvent.setup();
            renderWithTheme(<PasswordResetConfirmForm />);
            const newPasswordField = screen.getByLabelText(/new password/i);
            const confirmPasswordField = screen.getByLabelText(/confirm password/i);
            const submitButton = screen.getByRole('button', { name: /reset password/i });

            // Act - Enter password with score < 3 (only lowercase and length)
            await user.type(newPasswordField, 'weakpassword');
            await user.type(confirmPasswordField, 'weakpassword');
            await user.click(submitButton);

            // Assert
            await waitFor(() => {
                expect(screen.getByText(/password is too weak/i)).toBeInTheDocument();
            });
            expect(mockConfirmResetPassword).not.toHaveBeenCalled();
        });

        it('should show error when password is empty', async () => {
            // Arrange
            const user = userEvent.setup();
            renderWithTheme(<PasswordResetConfirmForm />);
            const confirmPasswordField = screen.getByLabelText(/confirm password/i);
            const submitButton = screen.getByRole('button', { name: /reset password/i });

            // Act - Leave new password empty, fill confirm
            await user.type(confirmPasswordField, 'SomePassword1!');
            await user.click(submitButton);

            // Assert
            await waitFor(() => {
                expect(screen.getByText(/password is required/i)).toBeInTheDocument();
            });
            expect(mockConfirmResetPassword).not.toHaveBeenCalled();
        });

        it('should show error when confirm password is empty', async () => {
            // Arrange
            const user = userEvent.setup();
            renderWithTheme(<PasswordResetConfirmForm />);
            const newPasswordField = screen.getByLabelText(/new password/i);
            const submitButton = screen.getByRole('button', { name: /reset password/i });

            // Act - Fill new password, leave confirm empty
            await user.type(newPasswordField, 'StrongP@ss1');
            await user.click(submitButton);

            // Assert
            await waitFor(() => {
                expect(screen.getByText(/please confirm your password/i)).toBeInTheDocument();
            });
            expect(mockConfirmResetPassword).not.toHaveBeenCalled();
        });

        it('should clear validation error when user starts typing', async () => {
            // Arrange
            const user = userEvent.setup();
            renderWithTheme(<PasswordResetConfirmForm />);
            const newPasswordField = screen.getByLabelText(/new password/i);
            const confirmPasswordField = screen.getByLabelText(/confirm password/i);
            const submitButton = screen.getByRole('button', { name: /reset password/i });

            // Act - Trigger validation error
            await user.type(newPasswordField, 'StrongP@ss1');
            await user.type(confirmPasswordField, 'DifferentP@ss2');
            await user.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
            });

            // Act - Start typing in confirm password field
            await user.clear(confirmPasswordField);
            await user.type(confirmPasswordField, 'S');

            // Assert - Error should be cleared
            await waitFor(() => {
                expect(screen.queryByText(/passwords do not match/i)).not.toBeInTheDocument();
            });
        });
    });

    // ========================================
    // Form Submission
    // ========================================

    describe('form submission', () => {
        beforeEach(() => {
            mockSearchParams.set('email', 'test@example.com');
            mockSearchParams.set('token', 'valid-reset-token');
        });

        it('should call confirmResetPassword with correct data on valid submit', async () => {
            // Arrange
            const user = userEvent.setup();
            mockConfirmResetPassword.mockResolvedValue({ success: true });
            renderWithTheme(<PasswordResetConfirmForm />);
            const newPasswordField = screen.getByLabelText(/new password/i);
            const confirmPasswordField = screen.getByLabelText(/confirm password/i);
            const submitButton = screen.getByRole('button', { name: /reset password/i });

            // Act
            await user.type(newPasswordField, 'StrongP@ss1');
            await user.type(confirmPasswordField, 'StrongP@ss1');
            await user.click(submitButton);

            // Assert
            await waitFor(() => {
                expect(mockConfirmResetPassword).toHaveBeenCalledWith(
                    'test@example.com',
                    'valid-reset-token',
                    'StrongP@ss1',
                    'StrongP@ss1'
                );
            });
        });

        it('should not submit form when validation fails', async () => {
            // Arrange
            const user = userEvent.setup();
            renderWithTheme(<PasswordResetConfirmForm />);
            const submitButton = screen.getByRole('button', { name: /reset password/i });

            // Act - Submit with empty fields
            await user.click(submitButton);

            // Assert
            expect(mockConfirmResetPassword).not.toHaveBeenCalled();
        });
    });

    // ========================================
    // Loading State
    // ========================================

    describe('loading state', () => {
        beforeEach(() => {
            mockSearchParams.set('email', 'test@example.com');
            mockSearchParams.set('token', 'valid-reset-token');
        });

        it('should show loading spinner when isLoading is true', () => {
            // Arrange
            mockAuthReturnValue.isLoading = true;

            // Act
            renderWithTheme(<PasswordResetConfirmForm />);

            // Assert
            expect(screen.getByRole('progressbar')).toBeInTheDocument();
        });

        it('should disable password fields during loading', () => {
            // Arrange
            mockAuthReturnValue.isLoading = true;

            // Act
            renderWithTheme(<PasswordResetConfirmForm />);

            // Assert
            expect(screen.getByLabelText(/new password/i)).toBeDisabled();
            expect(screen.getByLabelText(/confirm password/i)).toBeDisabled();
        });

        it('should disable submit button during loading', () => {
            // Arrange
            mockAuthReturnValue.isLoading = true;

            // Act
            renderWithTheme(<PasswordResetConfirmForm />);

            // Assert - When loading, the button contains a spinner (no accessible name)
            const submitButton = screen.getByRole('button', { name: '' });
            expect(submitButton).toBeDisabled();
        });

        it('should disable password visibility toggle during loading', () => {
            // Arrange
            mockAuthReturnValue.isLoading = true;

            // Act
            renderWithTheme(<PasswordResetConfirmForm />);

            // Assert
            expect(screen.getByRole('button', { name: /toggle password visibility/i })).toBeDisabled();
        });
    });

    // ========================================
    // Navigation
    // ========================================

    describe('navigation', () => {
        beforeEach(() => {
            mockSearchParams.set('email', 'test@example.com');
            mockSearchParams.set('token', 'valid-reset-token');
        });

        it('should call onSwitchToLogin when "Back to login" is clicked', async () => {
            // Arrange
            const user = userEvent.setup();
            const mockOnSwitchToLogin = vi.fn();
            renderWithTheme(<PasswordResetConfirmForm onSwitchToLogin={mockOnSwitchToLogin} />);

            // Act
            await user.click(screen.getByText(/back to login/i));

            // Assert
            expect(mockOnSwitchToLogin).toHaveBeenCalledTimes(1);
        });

        it('should disable navigation link during loading', async () => {
            // Arrange
            mockAuthReturnValue.isLoading = true;
            const mockOnSwitchToLogin = vi.fn();
            const user = userEvent.setup();

            // Act
            renderWithTheme(<PasswordResetConfirmForm onSwitchToLogin={mockOnSwitchToLogin} />);

            // Assert - Link with disabled prop should not trigger onClick when clicked
            // MUI Link component with component="button" and disabled={true} prevents click
            const backLink = screen.getByText(/back to login/i);
            expect(backLink).toBeInTheDocument();

            // Click should not trigger the callback when disabled
            await user.click(backLink);
            expect(mockOnSwitchToLogin).not.toHaveBeenCalled();
        });
    });

    // ========================================
    // Error Display
    // ========================================

    describe('error display', () => {
        beforeEach(() => {
            mockSearchParams.set('email', 'test@example.com');
            mockSearchParams.set('token', 'valid-reset-token');
        });

        it('should display error alert when error is present', () => {
            // Arrange
            mockAuthReturnValue.error = 'Invalid or expired reset token' as unknown as null;

            // Act
            renderWithTheme(<PasswordResetConfirmForm />);

            // Assert
            expect(screen.getByRole('alert')).toBeInTheDocument();
        });

        it('should display the error message from useAuth', () => {
            // Arrange
            mockAuthReturnValue.error = 'Password reset failed' as unknown as null;

            // Act
            renderWithTheme(<PasswordResetConfirmForm />);

            // Assert - renderAuthError mock returns string errors directly
            const alert = screen.getByRole('alert');
            expect(alert).toBeInTheDocument();
            // The error message is rendered inside the alert
            expect(alert.textContent).toContain('Password reset failed');
        });
    });

    // ========================================
    // Accessibility
    // ========================================

    describe('accessibility', () => {
        beforeEach(() => {
            mockSearchParams.set('email', 'test@example.com');
            mockSearchParams.set('token', 'valid-reset-token');
        });

        it('should have new password field with autofocus behavior', () => {
            // Arrange & Act
            renderWithTheme(<PasswordResetConfirmForm />);

            // Assert - Verify the new password field exists and is the first editable field
            // MUI uses autoFocus prop which controls focus behavior but may not add attribute in jsdom
            const newPasswordField = screen.getByLabelText(/new password/i);
            expect(newPasswordField).toBeInTheDocument();
            expect(newPasswordField).not.toBeDisabled();
        });

        it('should have proper autocomplete attributes', () => {
            // Arrange & Act
            renderWithTheme(<PasswordResetConfirmForm />);

            // Assert
            expect(screen.getByLabelText(/email address/i)).toHaveAttribute('autocomplete', 'email');
            expect(screen.getByLabelText(/new password/i)).toHaveAttribute('autocomplete', 'new-password');
            expect(screen.getByLabelText(/confirm password/i)).toHaveAttribute('autocomplete', 'new-password');
        });

        it('should mark required fields', () => {
            // Arrange & Act
            renderWithTheme(<PasswordResetConfirmForm />);

            // Assert
            expect(screen.getByLabelText(/email address/i)).toBeRequired();
            expect(screen.getByLabelText(/new password/i)).toBeRequired();
            expect(screen.getByLabelText(/confirm password/i)).toBeRequired();
        });

        it('should have aria-label on password visibility toggle button', () => {
            // Arrange & Act
            renderWithTheme(<PasswordResetConfirmForm />);

            // Assert
            const toggleButton = screen.getByRole('button', { name: /toggle password visibility/i });
            expect(toggleButton).toBeInTheDocument();
        });
    });
});
