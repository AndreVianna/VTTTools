import { ThemeProvider, createTheme } from '@mui/material';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SimpleLoginForm } from './SimpleLoginForm';

// Mock useAuth hook
const mockLogin = vi.fn();
const mockClearError = vi.fn();
let mockAuthState = { isLoading: false, error: null as string | null };

vi.mock('@/hooks/useAuth', () => ({
    useAuth: () => ({
        login: mockLogin,
        clearError: mockClearError,
        get isLoading() {
            return mockAuthState.isLoading;
        },
        get error() {
            return mockAuthState.error;
        },
    }),
}));

// Theme wrapper for MUI components
const theme = createTheme();
const renderWithTheme = (component: React.ReactElement) => {
    return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

// Helper to get password input by label (avoids ambiguity with toggle button aria-label)
const getPasswordInput = (container: HTMLElement) => {
    // MUI TextField with id='password' creates input with that id and associates it with the label
    const passwordField = container.querySelector('#password') as HTMLInputElement;
    return passwordField;
};

describe('SimpleLoginForm', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockAuthState = { isLoading: false, error: null };
    });

    // ========================================
    // Rendering and UI Structure
    // ========================================

    describe('rendering', () => {
        it('should render email input field', () => {
            // Arrange & Act
            renderWithTheme(<SimpleLoginForm />);

            // Assert
            expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
        });

        it('should render password input field', () => {
            // Arrange & Act
            const { container } = renderWithTheme(<SimpleLoginForm />);

            // Assert
            expect(getPasswordInput(container)).toBeInTheDocument();
        });

        it('should render "Remember me" checkbox', () => {
            // Arrange & Act
            renderWithTheme(<SimpleLoginForm />);

            // Assert
            expect(screen.getByRole('checkbox', { name: /remember me for 30 days/i })).toBeInTheDocument();
        });

        it('should render "Sign In to VTT Tools" button', () => {
            // Arrange & Act
            renderWithTheme(<SimpleLoginForm />);

            // Assert
            expect(screen.getByRole('button', { name: /sign in to vtt tools/i })).toBeInTheDocument();
        });

        it('should render "Forgot password?" link when onSwitchToResetPassword is provided', () => {
            // Arrange
            const mockOnSwitchToResetPassword = vi.fn();

            // Act
            renderWithTheme(<SimpleLoginForm onSwitchToResetPassword={mockOnSwitchToResetPassword} />);

            // Assert
            expect(screen.getByText(/forgot password\?/i)).toBeInTheDocument();
        });

        it('should render "Create your account" link when onSwitchToRegister is provided', () => {
            // Arrange
            const mockOnSwitchToRegister = vi.fn();

            // Act
            renderWithTheme(<SimpleLoginForm onSwitchToRegister={mockOnSwitchToRegister} />);

            // Assert
            expect(screen.getByText(/create your account/i)).toBeInTheDocument();
        });
    });

    // ========================================
    // Password Visibility Toggle
    // ========================================

    describe('password visibility', () => {
        it('should toggle password visibility when clicking visibility icon', async () => {
            // Arrange
            const user = userEvent.setup();
            const { container } = renderWithTheme(<SimpleLoginForm />);
            const passwordInput = getPasswordInput(container);
            const toggleButton = screen.getByRole('button', { name: /toggle password visibility/i });

            // Assert - Initially password type
            expect(passwordInput).toHaveAttribute('type', 'password');

            // Act - Click to show password
            await user.click(toggleButton);

            // Assert - Now text type
            expect(passwordInput).toHaveAttribute('type', 'text');

            // Act - Click again to hide password
            await user.click(toggleButton);

            // Assert - Back to password type
            expect(passwordInput).toHaveAttribute('type', 'password');
        });
    });

    // ========================================
    // Form Validation
    // ========================================

    describe('form validation', () => {
        it('should show "Email is required" error when email is empty on submit', async () => {
            // Arrange
            const user = userEvent.setup();
            const { container } = renderWithTheme(<SimpleLoginForm />);
            const passwordInput = getPasswordInput(container);
            const submitButton = screen.getByRole('button', { name: /sign in to vtt tools/i });

            // Act
            await user.type(passwordInput, 'password123');
            await user.click(submitButton);

            // Assert
            await waitFor(() => {
                expect(screen.getByRole('alert')).toBeInTheDocument();
            });
            // Validation error appears in alert
            expect(screen.getByRole('alert')).toHaveTextContent(/email is required/i);
            expect(mockLogin).not.toHaveBeenCalled();
        });

        it('should show "Invalid email address" error for invalid email format', async () => {
            // Arrange
            const user = userEvent.setup();
            const { container } = renderWithTheme(<SimpleLoginForm />);
            const emailInput = screen.getByLabelText(/email address/i);
            const passwordInput = getPasswordInput(container);
            const submitButton = screen.getByRole('button', { name: /sign in to vtt tools/i });

            // Act
            await user.type(emailInput, 'invalid-email');
            await user.type(passwordInput, 'password123');
            await user.click(submitButton);

            // Assert
            await waitFor(() => {
                expect(screen.getByRole('alert')).toBeInTheDocument();
            });
            // Validation error appears in alert
            expect(screen.getByRole('alert')).toHaveTextContent(/invalid email address/i);
            expect(mockLogin).not.toHaveBeenCalled();
        });

        it('should show "Password is required" error when password is empty on submit', async () => {
            // Arrange
            const user = userEvent.setup();
            renderWithTheme(<SimpleLoginForm />);
            const emailInput = screen.getByLabelText(/email address/i);
            const submitButton = screen.getByRole('button', { name: /sign in to vtt tools/i });

            // Act
            await user.type(emailInput, 'test@example.com');
            await user.click(submitButton);

            // Assert
            await waitFor(() => {
                expect(screen.getByRole('alert')).toBeInTheDocument();
            });
            // Validation error appears in alert
            expect(screen.getByRole('alert')).toHaveTextContent(/password is required/i);
            expect(mockLogin).not.toHaveBeenCalled();
        });
    });

    // ========================================
    // Form Submission
    // ========================================

    describe('form submission', () => {
        it('should call login with email, password, and rememberMe on valid submit', async () => {
            // Arrange
            const user = userEvent.setup();
            mockLogin.mockResolvedValue({ success: true });
            const { container } = renderWithTheme(<SimpleLoginForm />);
            const emailInput = screen.getByLabelText(/email address/i);
            const passwordInput = getPasswordInput(container);
            const rememberMeCheckbox = screen.getByRole('checkbox', { name: /remember me for 30 days/i });
            const submitButton = screen.getByRole('button', { name: /sign in to vtt tools/i });

            // Act
            await user.type(emailInput, 'test@example.com');
            await user.type(passwordInput, 'password123');
            await user.click(rememberMeCheckbox);
            await user.click(submitButton);

            // Assert
            await waitFor(() => {
                expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123', true);
            });
        });

        it('should clear password field on login failure', async () => {
            // Arrange
            const user = userEvent.setup();
            mockLogin.mockRejectedValue(new Error('Login failed'));
            const { container } = renderWithTheme(<SimpleLoginForm />);
            const emailInput = screen.getByLabelText(/email address/i);
            const passwordInput = getPasswordInput(container);
            const submitButton = screen.getByRole('button', { name: /sign in to vtt tools/i });

            // Act
            await user.type(emailInput, 'test@example.com');
            await user.type(passwordInput, 'password123');
            await user.click(submitButton);

            // Assert
            await waitFor(() => {
                expect(passwordInput.value).toBe('');
            });
        });
    });

    // ========================================
    // Loading State
    // ========================================

    describe('loading state', () => {
        it('should disable inputs and show loading spinner when isLoading is true', () => {
            // Arrange
            mockAuthState.isLoading = true;

            // Act
            const { container } = renderWithTheme(<SimpleLoginForm />);

            // Assert
            expect(screen.getByLabelText(/email address/i)).toBeDisabled();
            expect(getPasswordInput(container)).toBeDisabled();
            expect(screen.getByRole('checkbox', { name: /remember me for 30 days/i })).toBeDisabled();
            // The submit button shows spinner instead of text when loading
            const submitButton = screen.getByRole('button', { name: '' });
            expect(submitButton).toBeDisabled();
            expect(screen.getByRole('progressbar')).toBeInTheDocument();
        });
    });

    // ========================================
    // Error Handling
    // ========================================

    describe('error handling', () => {
        it('should display API error message', async () => {
            // Arrange
            const user = userEvent.setup();
            mockAuthState.error = 'Invalid email or password';
            const { container } = renderWithTheme(<SimpleLoginForm />);
            const emailInput = screen.getByLabelText(/email address/i);
            const passwordInput = getPasswordInput(container);
            const submitButton = screen.getByRole('button', { name: /sign in to vtt tools/i });

            // Act - Need to trigger hasAttemptedSubmit to show error
            await user.type(emailInput, 'test@example.com');
            await user.type(passwordInput, 'password123');
            await user.click(submitButton);

            // Assert
            await waitFor(() => {
                expect(screen.getByRole('alert')).toBeInTheDocument();
                expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
            });
        });
    });

    // ========================================
    // Link Callbacks
    // ========================================

    describe('link callbacks', () => {
        it('should call onSwitchToRegister when "Create your account" is clicked', async () => {
            // Arrange
            const user = userEvent.setup();
            const mockOnSwitchToRegister = vi.fn();
            renderWithTheme(<SimpleLoginForm onSwitchToRegister={mockOnSwitchToRegister} />);

            // Act
            await user.click(screen.getByText(/create your account/i));

            // Assert
            expect(mockOnSwitchToRegister).toHaveBeenCalledTimes(1);
        });

        it('should call onSwitchToResetPassword when "Forgot password?" is clicked', async () => {
            // Arrange
            const user = userEvent.setup();
            const mockOnSwitchToResetPassword = vi.fn();
            renderWithTheme(<SimpleLoginForm onSwitchToResetPassword={mockOnSwitchToResetPassword} />);

            // Act
            await user.click(screen.getByText(/forgot password\?/i));

            // Assert
            expect(mockOnSwitchToResetPassword).toHaveBeenCalledTimes(1);
        });
    });

    // ========================================
    // clearError on Mount
    // ========================================

    describe('clearError on mount', () => {
        it('should call clearError when component mounts', () => {
            // Arrange & Act
            renderWithTheme(<SimpleLoginForm />);

            // Assert
            expect(mockClearError).toHaveBeenCalledTimes(1);
        });
    });
});
