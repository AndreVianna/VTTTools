import { ThemeProvider, createTheme } from '@mui/material';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SimpleRegistrationForm } from './SimpleRegistrationForm';

// Mock useAuth hook
const mockRegister = vi.fn();
const mockClearError = vi.fn();
let mockAuthState = { isLoading: false, error: null as string | null };

vi.mock('@/hooks/useAuth', () => ({
    useAuth: () => ({
        register: mockRegister,
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

// Helpers to get input fields by their IDs (avoids ambiguity with toggle button aria-label)
const getPasswordInput = (container: HTMLElement) => container.querySelector('#password') as HTMLInputElement;
const getEmailInput = (container: HTMLElement) => container.querySelector('#email') as HTMLInputElement;
const getNameInput = (container: HTMLElement) => container.querySelector('#name') as HTMLInputElement;

describe('SimpleRegistrationForm', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockAuthState = { isLoading: false, error: null };
    });

    // ========================================
    // Rendering and UI Structure
    // ========================================

    describe('rendering', () => {
        it('should render page title "Start Your Journey"', () => {
            // Arrange & Act
            renderWithTheme(<SimpleRegistrationForm />);

            // Assert
            expect(screen.getByRole('heading', { name: /start your journey/i })).toBeInTheDocument();
        });

        it('should render email input field', () => {
            // Arrange & Act
            renderWithTheme(<SimpleRegistrationForm />);

            // Assert
            expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
        });

        it('should render name input field', () => {
            // Arrange & Act
            const { container } = renderWithTheme(<SimpleRegistrationForm />);

            // Assert
            expect(getNameInput(container)).toBeInTheDocument();
        });

        it('should render password input field', () => {
            // Arrange & Act
            const { container } = renderWithTheme(<SimpleRegistrationForm />);

            // Assert
            expect(getPasswordInput(container)).toBeInTheDocument();
        });

        it('should render "Create My Account" submit button', () => {
            // Arrange & Act
            renderWithTheme(<SimpleRegistrationForm />);

            // Assert
            expect(screen.getByRole('button', { name: /create my account/i })).toBeInTheDocument();
        });

        it('should render "Sign in here" link when onSwitchToLogin is provided', () => {
            // Arrange
            const mockOnSwitchToLogin = vi.fn();

            // Act
            renderWithTheme(<SimpleRegistrationForm onSwitchToLogin={mockOnSwitchToLogin} />);

            // Assert
            expect(screen.getByText(/sign in here/i)).toBeInTheDocument();
        });
    });

    // ========================================
    // Password Visibility Toggle
    // ========================================

    describe('password visibility', () => {
        it('should toggle password visibility when clicking visibility icon', async () => {
            // Arrange
            const user = userEvent.setup();
            const { container } = renderWithTheme(<SimpleRegistrationForm />);
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
    // Form Validation - Email
    // ========================================

    describe('email validation', () => {
        it('should show "Email is required" error when email is empty on submit', async () => {
            // Arrange
            const user = userEvent.setup();
            const { container } = renderWithTheme(<SimpleRegistrationForm />);
            const nameInput = getNameInput(container);
            const passwordInput = getPasswordInput(container);
            const submitButton = screen.getByRole('button', { name: /create my account/i });

            // Act
            await user.type(nameInput, 'John Smith');
            await user.type(passwordInput, 'password123');
            await user.click(submitButton);

            // Assert
            await waitFor(() => {
                expect(screen.getByText(/email is required/i)).toBeInTheDocument();
            });
            expect(mockRegister).not.toHaveBeenCalled();
        });

        it('should show "Invalid email address" error for invalid email format', async () => {
            // Arrange
            const user = userEvent.setup();
            const { container } = renderWithTheme(<SimpleRegistrationForm />);
            const emailInput = getEmailInput(container);
            const nameInput = getNameInput(container);
            const passwordInput = getPasswordInput(container);
            const submitButton = screen.getByRole('button', { name: /create my account/i });

            // Act
            await user.type(emailInput, 'invalid-email');
            await user.type(nameInput, 'John Smith');
            await user.type(passwordInput, 'password123');
            await user.click(submitButton);

            // Assert
            await waitFor(() => {
                expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
            });
            expect(mockRegister).not.toHaveBeenCalled();
        });

        it('should clear email validation error when user starts typing', async () => {
            // Arrange
            const user = userEvent.setup();
            const { container } = renderWithTheme(<SimpleRegistrationForm />);
            const emailInput = getEmailInput(container);
            const submitButton = screen.getByRole('button', { name: /create my account/i });

            // Act - Submit to trigger validation error
            await user.click(submitButton);

            // Assert - Error is shown
            await waitFor(() => {
                expect(screen.getByText(/email is required/i)).toBeInTheDocument();
            });

            // Act - Start typing to clear error
            await user.type(emailInput, 't');

            // Assert - Error is cleared
            await waitFor(() => {
                expect(screen.queryByText(/email is required/i)).not.toBeInTheDocument();
            });
        });
    });

    // ========================================
    // Form Validation - Name
    // ========================================

    describe('name validation', () => {
        it('should show "Name is required" error when name is empty on submit', async () => {
            // Arrange
            const user = userEvent.setup();
            const { container } = renderWithTheme(<SimpleRegistrationForm />);
            const emailInput = getEmailInput(container);
            const passwordInput = getPasswordInput(container);
            const submitButton = screen.getByRole('button', { name: /create my account/i });

            // Act
            await user.type(emailInput, 'test@example.com');
            await user.type(passwordInput, 'password123');
            await user.click(submitButton);

            // Assert
            await waitFor(() => {
                expect(screen.getByText(/name is required/i)).toBeInTheDocument();
            });
            expect(mockRegister).not.toHaveBeenCalled();
        });

        it('should show error when name is less than 3 characters', async () => {
            // Arrange
            const user = userEvent.setup();
            const { container } = renderWithTheme(<SimpleRegistrationForm />);
            const emailInput = getEmailInput(container);
            const nameInput = getNameInput(container);
            const passwordInput = getPasswordInput(container);
            const submitButton = screen.getByRole('button', { name: /create my account/i });

            // Act
            await user.type(emailInput, 'test@example.com');
            await user.type(nameInput, 'AB');
            await user.type(passwordInput, 'password123');
            await user.click(submitButton);

            // Assert
            await waitFor(() => {
                expect(screen.getByText(/name must be at least 3 characters/i)).toBeInTheDocument();
            });
            expect(mockRegister).not.toHaveBeenCalled();
        });

        it('should show error when name exceeds 50 characters', async () => {
            // Arrange
            const user = userEvent.setup();
            const { container } = renderWithTheme(<SimpleRegistrationForm />);
            const emailInput = getEmailInput(container);
            const nameInput = getNameInput(container);
            const passwordInput = getPasswordInput(container);
            const submitButton = screen.getByRole('button', { name: /create my account/i });
            const longName = 'A'.repeat(51);

            // Act
            await user.type(emailInput, 'test@example.com');
            await user.type(nameInput, longName);
            await user.type(passwordInput, 'password123');
            await user.click(submitButton);

            // Assert
            await waitFor(() => {
                expect(screen.getByText(/name cannot exceed 50 characters/i)).toBeInTheDocument();
            });
            expect(mockRegister).not.toHaveBeenCalled();
        });
    });

    // ========================================
    // Form Validation - Password
    // ========================================

    describe('password validation', () => {
        it('should show "Password is required" error when password is empty on submit', async () => {
            // Arrange
            const user = userEvent.setup();
            const { container } = renderWithTheme(<SimpleRegistrationForm />);
            const emailInput = getEmailInput(container);
            const nameInput = getNameInput(container);
            const submitButton = screen.getByRole('button', { name: /create my account/i });

            // Act
            await user.type(emailInput, 'test@example.com');
            await user.type(nameInput, 'John Smith');
            await user.click(submitButton);

            // Assert
            await waitFor(() => {
                expect(screen.getByText(/password is required/i)).toBeInTheDocument();
            });
            expect(mockRegister).not.toHaveBeenCalled();
        });

        it('should show error when password is less than 6 characters', async () => {
            // Arrange
            const user = userEvent.setup();
            const { container } = renderWithTheme(<SimpleRegistrationForm />);
            const emailInput = getEmailInput(container);
            const nameInput = getNameInput(container);
            const passwordInput = getPasswordInput(container);
            const submitButton = screen.getByRole('button', { name: /create my account/i });

            // Act
            await user.type(emailInput, 'test@example.com');
            await user.type(nameInput, 'John Smith');
            await user.type(passwordInput, '12345');
            await user.click(submitButton);

            // Assert
            await waitFor(() => {
                expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument();
            });
            expect(mockRegister).not.toHaveBeenCalled();
        });
    });

    // ========================================
    // Form Submission
    // ========================================

    describe('form submission', () => {
        it('should call register with email, password, confirmPassword, and name on valid submit', async () => {
            // Arrange
            const user = userEvent.setup();
            mockRegister.mockResolvedValue({ success: true });
            const { container } = renderWithTheme(<SimpleRegistrationForm />);
            const emailInput = getEmailInput(container);
            const nameInput = getNameInput(container);
            const passwordInput = getPasswordInput(container);
            const submitButton = screen.getByRole('button', { name: /create my account/i });

            // Act
            await user.type(emailInput, 'test@example.com');
            await user.type(nameInput, 'John Smith');
            await user.type(passwordInput, 'password123');
            await user.click(submitButton);

            // Assert
            await waitFor(() => {
                expect(mockRegister).toHaveBeenCalledWith(
                    'test@example.com',
                    'password123',
                    'password123', // confirmPassword equals password
                    'John Smith',
                );
            });
        });

        it('should not submit form when validation fails', async () => {
            // Arrange
            const user = userEvent.setup();
            renderWithTheme(<SimpleRegistrationForm />);
            const submitButton = screen.getByRole('button', { name: /create my account/i });

            // Act - Submit with empty form
            await user.click(submitButton);

            // Assert
            expect(mockRegister).not.toHaveBeenCalled();
        });
    });

    // ========================================
    // Loading State
    // ========================================

    describe('loading state', () => {
        it('should disable all inputs when isLoading is true', () => {
            // Arrange
            mockAuthState.isLoading = true;

            // Act
            const { container } = renderWithTheme(<SimpleRegistrationForm />);

            // Assert
            expect(getEmailInput(container)).toBeDisabled();
            expect(getNameInput(container)).toBeDisabled();
            expect(getPasswordInput(container)).toBeDisabled();
        });

        it('should disable submit button and show loading spinner when isLoading is true', () => {
            // Arrange
            mockAuthState.isLoading = true;

            // Act
            renderWithTheme(<SimpleRegistrationForm />);

            // Assert
            const submitButton = screen.getByRole('button', { name: '' });
            expect(submitButton).toBeDisabled();
            expect(screen.getByRole('progressbar')).toBeInTheDocument();
        });
    });

    // ========================================
    // Error Handling
    // ========================================

    describe('error handling', () => {
        it('should display API error message after submit attempt', async () => {
            // Arrange
            const user = userEvent.setup();
            mockAuthState.error = 'Email address already registered';
            const { container } = renderWithTheme(<SimpleRegistrationForm />);
            const emailInput = getEmailInput(container);
            const nameInput = getNameInput(container);
            const passwordInput = getPasswordInput(container);
            const submitButton = screen.getByRole('button', { name: /create my account/i });

            // Act - Need to trigger hasAttemptedSubmit to show error
            await user.type(emailInput, 'test@example.com');
            await user.type(nameInput, 'John Smith');
            await user.type(passwordInput, 'password123');
            await user.click(submitButton);

            // Assert
            await waitFor(() => {
                expect(screen.getByRole('alert')).toBeInTheDocument();
                expect(screen.getByText(/email address already registered/i)).toBeInTheDocument();
            });
        });

        it('should display fallback error message when error is object without message', async () => {
            // Arrange
            const user = userEvent.setup();
            mockAuthState.error = {} as string; // Simulating an error object without message
            const { container } = renderWithTheme(<SimpleRegistrationForm />);
            const emailInput = getEmailInput(container);
            const nameInput = getNameInput(container);
            const passwordInput = getPasswordInput(container);
            const submitButton = screen.getByRole('button', { name: /create my account/i });

            // Act
            await user.type(emailInput, 'test@example.com');
            await user.type(nameInput, 'John Smith');
            await user.type(passwordInput, 'password123');
            await user.click(submitButton);

            // Assert
            await waitFor(() => {
                expect(screen.getByRole('alert')).toBeInTheDocument();
                expect(screen.getByText(/registration failed. please try again/i)).toBeInTheDocument();
            });
        });
    });

    // ========================================
    // Link Callbacks
    // ========================================

    describe('link callbacks', () => {
        it('should call onSwitchToLogin when "Sign in here" is clicked', async () => {
            // Arrange
            const user = userEvent.setup();
            const mockOnSwitchToLogin = vi.fn();
            renderWithTheme(<SimpleRegistrationForm onSwitchToLogin={mockOnSwitchToLogin} />);

            // Act
            await user.click(screen.getByText(/sign in here/i));

            // Assert
            expect(mockOnSwitchToLogin).toHaveBeenCalledTimes(1);
        });
    });

    // ========================================
    // clearError on Mount
    // ========================================

    describe('clearError on mount', () => {
        it('should call clearError when component mounts', () => {
            // Arrange & Act
            renderWithTheme(<SimpleRegistrationForm />);

            // Assert
            expect(mockClearError).toHaveBeenCalledTimes(1);
        });
    });

    // ========================================
    // Field Blur Validation
    // ========================================

    describe('blur validation', () => {
        it('should validate email field on blur', async () => {
            // Arrange
            const user = userEvent.setup();
            const { container } = renderWithTheme(<SimpleRegistrationForm />);
            const emailInput = getEmailInput(container);
            const nameInput = getNameInput(container);

            // Act - Type invalid email and blur
            await user.type(emailInput, 'invalid');
            await user.click(nameInput); // Click away to trigger blur

            // Assert
            await waitFor(() => {
                expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
            });
        });

        it('should validate name field on blur', async () => {
            // Arrange
            const user = userEvent.setup();
            const { container } = renderWithTheme(<SimpleRegistrationForm />);
            const emailInput = getEmailInput(container);
            const nameInput = getNameInput(container);

            // Act - Type short name and blur
            await user.type(nameInput, 'AB');
            await user.click(emailInput); // Click away to trigger blur

            // Assert
            await waitFor(() => {
                expect(screen.getByText(/name must be at least 3 characters/i)).toBeInTheDocument();
            });
        });

        it('should validate password field on blur', async () => {
            // Arrange
            const user = userEvent.setup();
            const { container } = renderWithTheme(<SimpleRegistrationForm />);
            const emailInput = getEmailInput(container);
            const passwordInput = getPasswordInput(container);

            // Act - Type short password and blur
            await user.type(passwordInput, '123');
            await user.click(emailInput); // Click away to trigger blur

            // Assert
            await waitFor(() => {
                expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument();
            });
        });
    });

    // ========================================
    // Accessibility
    // ========================================

    describe('accessibility', () => {
        it('should have email field marked as required', () => {
            // Arrange & Act
            const { container } = renderWithTheme(<SimpleRegistrationForm />);

            // Assert
            expect(getEmailInput(container)).toHaveAttribute('required');
        });

        it('should have name field marked as required', () => {
            // Arrange & Act
            const { container } = renderWithTheme(<SimpleRegistrationForm />);

            // Assert
            expect(getNameInput(container)).toHaveAttribute('required');
        });

        it('should have password field marked as required', () => {
            // Arrange & Act
            const { container } = renderWithTheme(<SimpleRegistrationForm />);

            // Assert
            expect(getPasswordInput(container)).toHaveAttribute('required');
        });

        it('should have proper autocomplete attributes', () => {
            // Arrange & Act
            const { container } = renderWithTheme(<SimpleRegistrationForm />);

            // Assert
            expect(getEmailInput(container)).toHaveAttribute('autocomplete', 'email');
            expect(getNameInput(container)).toHaveAttribute('autocomplete', 'name');
            expect(getPasswordInput(container)).toHaveAttribute('autocomplete', 'new-password');
        });

        it('should have email field receive focus by default', async () => {
            // Arrange & Act
            const { container } = renderWithTheme(<SimpleRegistrationForm />);

            // Assert - MUI TextField autoFocus prop focuses element via JavaScript
            await waitFor(() => {
                expect(getEmailInput(container)).toHaveFocus();
            });
        });
    });
});
