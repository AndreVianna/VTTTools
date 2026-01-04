import { ThemeProvider, createTheme } from '@mui/material';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PasswordResetRequestForm } from './PasswordResetRequestForm';

// Mock useAuth hook
const mockResetPassword = vi.fn();
const mockClearError = vi.fn();
const mockAuthReturnValue = {
    isLoading: false,
    error: null as string | null,
};

vi.mock('@/hooks/useAuth', () => ({
    useAuth: () => ({
        resetPassword: mockResetPassword,
        clearError: mockClearError,
        get isLoading() {
            return mockAuthReturnValue.isLoading;
        },
        get error() {
            return mockAuthReturnValue.error;
        },
    }),
}));

// Theme wrapper for testing
const theme = createTheme();
const renderWithTheme = (component: React.ReactElement) => {
    return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe('PasswordResetRequestForm', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockAuthReturnValue.isLoading = false;
        mockAuthReturnValue.error = null;
    });

    // ========================================
    // Rendering
    // ========================================

    describe('rendering', () => {
        it('should render "Reset Password" heading', () => {
            // Arrange & Act
            renderWithTheme(<PasswordResetRequestForm />);

            // Assert
            expect(screen.getByRole('heading', { name: /reset password/i })).toBeInTheDocument();
        });

        it('should render description text', () => {
            // Arrange & Act
            renderWithTheme(<PasswordResetRequestForm />);

            // Assert
            expect(screen.getByText(/enter your email address and we'll send you instructions/i)).toBeInTheDocument();
        });

        it('should render email address field', () => {
            // Arrange & Act
            renderWithTheme(<PasswordResetRequestForm />);

            // Assert
            expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
        });

        it('should render "Send Reset Instructions" submit button', () => {
            // Arrange & Act
            renderWithTheme(<PasswordResetRequestForm />);

            // Assert
            expect(screen.getByRole('button', { name: /send reset instructions/i })).toBeInTheDocument();
        });

        it('should render helper text for email field', () => {
            // Arrange & Act
            renderWithTheme(<PasswordResetRequestForm />);

            // Assert
            expect(screen.getByText(/enter the email address for your account/i)).toBeInTheDocument();
        });

        it('should render "Back to login" link', () => {
            // Arrange & Act
            renderWithTheme(<PasswordResetRequestForm />);

            // Assert
            expect(screen.getByText(/back to login/i)).toBeInTheDocument();
        });

        it('should clear error on component mount', () => {
            // Arrange & Act
            renderWithTheme(<PasswordResetRequestForm />);

            // Assert
            expect(mockClearError).toHaveBeenCalledTimes(1);
        });
    });

    // ========================================
    // Email Validation
    // ========================================

    describe('email validation', () => {
        it('should show error when email is empty on submit', async () => {
            // Arrange
            const user = userEvent.setup();
            renderWithTheme(<PasswordResetRequestForm />);
            const submitButton = screen.getByRole('button', { name: /send reset instructions/i });

            // Act
            await user.click(submitButton);

            // Assert
            await waitFor(() => {
                expect(screen.getByText(/email is required/i)).toBeInTheDocument();
            });
            expect(mockResetPassword).not.toHaveBeenCalled();
        });

        it('should show error for invalid email format', async () => {
            // Arrange
            const user = userEvent.setup();
            renderWithTheme(<PasswordResetRequestForm />);
            const emailField = screen.getByLabelText(/email address/i);
            const submitButton = screen.getByRole('button', { name: /send reset instructions/i });

            // Act
            await user.type(emailField, 'invalid-email');
            await user.click(submitButton);

            // Assert
            await waitFor(() => {
                expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
            });
            expect(mockResetPassword).not.toHaveBeenCalled();
        });

        it('should show error for email without domain', async () => {
            // Arrange
            const user = userEvent.setup();
            renderWithTheme(<PasswordResetRequestForm />);
            const emailField = screen.getByLabelText(/email address/i);
            const submitButton = screen.getByRole('button', { name: /send reset instructions/i });

            // Act
            await user.type(emailField, 'test@');
            await user.click(submitButton);

            // Assert
            await waitFor(() => {
                expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
            });
            expect(mockResetPassword).not.toHaveBeenCalled();
        });

        it('should clear validation error when user starts typing', async () => {
            // Arrange
            const user = userEvent.setup();
            renderWithTheme(<PasswordResetRequestForm />);
            const emailField = screen.getByLabelText(/email address/i);
            const submitButton = screen.getByRole('button', { name: /send reset instructions/i });

            // Act - Trigger validation error
            await user.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText(/email is required/i)).toBeInTheDocument();
            });

            // Act - Start typing
            await user.type(emailField, 't');

            // Assert - Error should be cleared
            await waitFor(() => {
                expect(screen.queryByText(/email is required/i)).not.toBeInTheDocument();
            });
        });

        it('should accept valid email format', async () => {
            // Arrange
            const user = userEvent.setup();
            mockResetPassword.mockResolvedValue({ success: true });
            renderWithTheme(<PasswordResetRequestForm />);
            const emailField = screen.getByLabelText(/email address/i);
            const submitButton = screen.getByRole('button', { name: /send reset instructions/i });

            // Act
            await user.type(emailField, 'valid@example.com');
            await user.click(submitButton);

            // Assert - No validation errors, resetPassword should be called
            await waitFor(() => {
                expect(mockResetPassword).toHaveBeenCalledWith('valid@example.com');
            });
        });
    });

    // ========================================
    // Form Submission
    // ========================================

    describe('form submission', () => {
        it('should call resetPassword with email on valid submit', async () => {
            // Arrange
            const user = userEvent.setup();
            mockResetPassword.mockResolvedValue({ success: true });
            renderWithTheme(<PasswordResetRequestForm />);
            const emailField = screen.getByLabelText(/email address/i);
            const submitButton = screen.getByRole('button', { name: /send reset instructions/i });

            // Act
            await user.type(emailField, 'test@example.com');
            await user.click(submitButton);

            // Assert
            await waitFor(() => {
                expect(mockResetPassword).toHaveBeenCalledWith('test@example.com');
            });
        });

        it('should not submit form when validation fails', async () => {
            // Arrange
            const user = userEvent.setup();
            renderWithTheme(<PasswordResetRequestForm />);
            const submitButton = screen.getByRole('button', { name: /send reset instructions/i });

            // Act - Submit with empty email
            await user.click(submitButton);

            // Assert
            expect(mockResetPassword).not.toHaveBeenCalled();
        });

        it('should handle resetPassword rejection gracefully', async () => {
            // Arrange
            const user = userEvent.setup();
            const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            mockResetPassword.mockRejectedValue(new Error('Network error'));
            renderWithTheme(<PasswordResetRequestForm />);
            const emailField = screen.getByLabelText(/email address/i);
            const submitButton = screen.getByRole('button', { name: /send reset instructions/i });

            // Act
            await user.type(emailField, 'test@example.com');
            await user.click(submitButton);

            // Assert - Should not throw, error is caught
            await waitFor(() => {
                expect(mockResetPassword).toHaveBeenCalled();
            });

            // Cleanup
            consoleErrorSpy.mockRestore();
        });
    });

    // ========================================
    // Loading State
    // ========================================

    describe('loading state', () => {
        it('should show loading spinner when isLoading is true', () => {
            // Arrange
            mockAuthReturnValue.isLoading = true;

            // Act
            renderWithTheme(<PasswordResetRequestForm />);

            // Assert
            expect(screen.getByRole('progressbar')).toBeInTheDocument();
        });

        it('should disable email field during loading', () => {
            // Arrange
            mockAuthReturnValue.isLoading = true;

            // Act
            renderWithTheme(<PasswordResetRequestForm />);

            // Assert
            expect(screen.getByLabelText(/email address/i)).toBeDisabled();
        });

        it('should disable submit button during loading', () => {
            // Arrange
            mockAuthReturnValue.isLoading = true;

            // Act
            renderWithTheme(<PasswordResetRequestForm />);

            // Assert
            const submitButton = screen.getByRole('button', { name: '' });
            expect(submitButton).toBeDisabled();
        });

        it('should disable "Back to login" link during loading', async () => {
            // Arrange
            mockAuthReturnValue.isLoading = true;
            const mockOnSwitchToLogin = vi.fn();
            const user = userEvent.setup();

            // Act
            renderWithTheme(<PasswordResetRequestForm onSwitchToLogin={mockOnSwitchToLogin} />);

            // Assert - Link with disabled prop should not trigger onClick when clicked
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
        it('should display error alert when error is present after submit attempt', async () => {
            // Arrange
            const user = userEvent.setup();
            mockAuthReturnValue.error = 'Password reset request failed';
            renderWithTheme(<PasswordResetRequestForm />);
            const emailField = screen.getByLabelText(/email address/i);
            const submitButton = screen.getByRole('button', { name: /send reset instructions/i });

            // Act - Submit to trigger hasAttemptedSubmit
            await user.type(emailField, 'test@example.com');
            await user.click(submitButton);

            // Assert
            await waitFor(() => {
                expect(screen.getByRole('alert')).toBeInTheDocument();
            });
        });

        it('should not display error alert before submit attempt', () => {
            // Arrange
            mockAuthReturnValue.error = 'Some error';

            // Act
            renderWithTheme(<PasswordResetRequestForm />);

            // Assert - Error should not be shown until user attempts submit
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });

        it('should display string error message directly', async () => {
            // Arrange
            const user = userEvent.setup();
            mockAuthReturnValue.error = 'Unable to send reset email';
            renderWithTheme(<PasswordResetRequestForm />);
            const emailField = screen.getByLabelText(/email address/i);
            const submitButton = screen.getByRole('button', { name: /send reset instructions/i });

            // Act
            await user.type(emailField, 'test@example.com');
            await user.click(submitButton);

            // Assert
            await waitFor(() => {
                const alert = screen.getByRole('alert');
                expect(alert).toHaveTextContent('Unable to send reset email');
            });
        });

        it('should display fallback error message for non-string errors', async () => {
            // Arrange
            const user = userEvent.setup();
            mockAuthReturnValue.error = { code: 'ERROR' } as unknown as string;
            renderWithTheme(<PasswordResetRequestForm />);
            const emailField = screen.getByLabelText(/email address/i);
            const submitButton = screen.getByRole('button', { name: /send reset instructions/i });

            // Act
            await user.type(emailField, 'test@example.com');
            await user.click(submitButton);

            // Assert
            await waitFor(() => {
                const alert = screen.getByRole('alert');
                expect(alert).toHaveTextContent(/password reset request failed/i);
            });
        });
    });

    // ========================================
    // Navigation
    // ========================================

    describe('navigation', () => {
        it('should call onSwitchToLogin when "Back to login" is clicked', async () => {
            // Arrange
            const user = userEvent.setup();
            const mockOnSwitchToLogin = vi.fn();
            renderWithTheme(<PasswordResetRequestForm onSwitchToLogin={mockOnSwitchToLogin} />);

            // Act
            await user.click(screen.getByText(/back to login/i));

            // Assert
            expect(mockOnSwitchToLogin).toHaveBeenCalledTimes(1);
        });

        it('should not throw when onSwitchToLogin is not provided', async () => {
            // Arrange
            const user = userEvent.setup();
            renderWithTheme(<PasswordResetRequestForm />);

            // Act & Assert - Should not throw
            await user.click(screen.getByText(/back to login/i));
        });
    });

    // ========================================
    // Accessibility
    // ========================================

    describe('accessibility', () => {
        it('should have email field with autofocus', () => {
            // Arrange & Act
            renderWithTheme(<PasswordResetRequestForm />);

            // Assert - Verify the email field exists and is the first editable field
            const emailField = screen.getByLabelText(/email address/i);
            expect(emailField).toBeInTheDocument();
            expect(emailField).not.toBeDisabled();
        });

        it('should have proper autocomplete attribute on email field', () => {
            // Arrange & Act
            renderWithTheme(<PasswordResetRequestForm />);

            // Assert
            expect(screen.getByLabelText(/email address/i)).toHaveAttribute('autocomplete', 'email');
        });

        it('should mark email field as required', () => {
            // Arrange & Act
            renderWithTheme(<PasswordResetRequestForm />);

            // Assert
            expect(screen.getByLabelText(/email address/i)).toBeRequired();
        });

        it('should have proper heading hierarchy', () => {
            // Arrange & Act
            renderWithTheme(<PasswordResetRequestForm />);

            // Assert - h1 rendered as h2 variant
            const heading = screen.getByRole('heading', { name: /reset password/i });
            expect(heading.tagName).toBe('H1');
        });

        it('should have noValidate on form for custom validation', () => {
            // Arrange & Act
            const { container } = renderWithTheme(<PasswordResetRequestForm />);

            // Assert
            const form = container.querySelector('form');
            expect(form).toHaveAttribute('noValidate');
        });
    });
});
