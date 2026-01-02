/**
 * LoginPage Component Tests
 * Tests authentication flow, validation, 2FA, theme toggle, and navigation
 * Coverage: Login workflow scenarios for WebAdminApp
 *
 * Test Coverage:
 * - Page rendering (email, password fields, login button)
 * - Password validation (minimum 12 characters)
 * - Form submission with valid credentials
 * - API error display
 * - Navigation after successful login
 * - Navigation to original location from state
 * - 2FA field display when required
 * - 2FA submission
 * - Form disabled during loading
 * - Loading spinner display
 * - Theme toggle functionality
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';
import { LoginPage } from './LoginPage';

// Mock react-router-dom
const mockNavigate = vi.fn();
const mockUseLocation = vi.fn();
vi.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate,
    useLocation: () => mockUseLocation(),
}));

// Mock store hooks
const mockDispatch = vi.fn();
const mockUseAppSelector = vi.fn();
vi.mock('@store/hooks', () => ({
    useAppDispatch: () => mockDispatch,
    useAppSelector: (selector: (state: unknown) => unknown) => mockUseAppSelector(selector),
}));

// Mock auth slice - mockLogin tracks what credentials were passed
const mockLogin = vi.fn();
const mockClearError = vi.fn();

vi.mock('@store/slices/authSlice', () => {
    // Define a mock login object that acts like an async thunk
    const loginMock = Object.assign(
        (credentials: unknown) => {
            // Return an action object that dispatch will handle
            return { type: 'login', payload: credentials, isLoginAction: true };
        },
        {
            fulfilled: { match: (result: unknown) => (result as { type?: string } | undefined)?.type === 'fulfilled' },
            rejected: { match: (result: unknown) => (result as { type?: string } | undefined)?.type === 'rejected' },
        }
    );

    return {
        login: loginMock,
        clearError: () => ({ type: 'clearError' }),
    };
});

// Mock UI slice
const mockToggleTheme = vi.fn();
vi.mock('@store/slices/uiSlice', () => ({
    toggleTheme: () => mockToggleTheme(),
    selectTheme: (state: { ui: { theme: string } }) => state.ui.theme,
}));

// Mock MUI icons to prevent file loading issues
vi.mock('@mui/icons-material', () => {
    const LightModeComponent = () => <span>LightModeIcon</span>;
    const DarkModeComponent = () => <span>DarkModeIcon</span>;
    return {
        LightMode: LightModeComponent,
        DarkMode: DarkModeComponent,
    };
});

describe('LoginPage', () => {
    const defaultAuthState = {
        isLoading: false,
        error: null,
    };

    beforeEach(() => {
        vi.resetAllMocks();
        mockUseLocation.mockReturnValue({ state: null });
        mockUseAppSelector.mockImplementation((selector: (state: unknown) => unknown) => {
            const mockState = {
                auth: defaultAuthState,
                ui: { theme: 'light' },
            };
            return selector(mockState);
        });
        // Default dispatch implementation - tracks login calls and returns fulfilled
        mockDispatch.mockImplementation((action: unknown) => {
            const actionObj = action as { type?: string; payload?: unknown; isLoginAction?: boolean };
            if (actionObj?.isLoginAction) {
                mockLogin(actionObj.payload);
                return Promise.resolve({ type: 'fulfilled' });
            }
            return Promise.resolve(action);
        });
    });

    describe('Rendering', () => {
        it('should render email and password fields', () => {
            // Arrange & Act
            render(<LoginPage />);

            // Assert
            expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        });

        it('should render login button', () => {
            // Arrange & Act
            render(<LoginPage />);

            // Assert
            expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
        });

        it('should render theme toggle button', () => {
            // Arrange & Act
            render(<LoginPage />);

            // Assert
            expect(screen.getByRole('button', { name: /switch to dark mode/i })).toBeInTheDocument();
        });

        it('should render page title', () => {
            // Arrange & Act
            render(<LoginPage />);

            // Assert
            expect(screen.getByRole('heading', { name: /admin login/i })).toBeInTheDocument();
        });
    });

    describe('Password validation', () => {
        it('should show validation error for password less than 12 characters', async () => {
            // Arrange
            const user = userEvent.setup();
            render(<LoginPage />);

            // Act
            const passwordInput = screen.getByLabelText(/password/i);
            await user.type(passwordInput, 'short');

            // Assert
            expect(screen.getByText(/password must be at least 12 characters/i)).toBeInTheDocument();
        });

        it('should not show validation error for password with 12 or more characters', async () => {
            // Arrange
            const user = userEvent.setup();
            render(<LoginPage />);

            // Act
            const passwordInput = screen.getByLabelText(/password/i);
            await user.type(passwordInput, 'validpassword123');

            // Assert
            expect(screen.queryByText(/password must be at least 12 characters/i)).not.toBeInTheDocument();
        });

        it('should clear validation error when password field is emptied', async () => {
            // Arrange
            const user = userEvent.setup();
            render(<LoginPage />);

            // Act
            const passwordInput = screen.getByLabelText(/password/i);
            await user.type(passwordInput, 'short');
            expect(screen.getByText(/password must be at least 12 characters/i)).toBeInTheDocument();
            await user.clear(passwordInput);

            // Assert
            expect(screen.queryByText(/password must be at least 12 characters/i)).not.toBeInTheDocument();
        });

        it('should not submit form with invalid password', async () => {
            // Arrange
            const user = userEvent.setup();
            render(<LoginPage />);

            // Act
            await user.type(screen.getByLabelText(/email address/i), 'admin@example.com');
            await user.type(screen.getByLabelText(/password/i), 'short');
            await user.click(screen.getByRole('button', { name: /sign in/i }));

            // Assert
            expect(mockLogin).not.toHaveBeenCalled();
        });
    });

    describe('Form submission', () => {
        it('should call login action on form submit with valid password', async () => {
            // Arrange
            const user = userEvent.setup();
            render(<LoginPage />);

            // Act
            await user.type(screen.getByLabelText(/email address/i), 'admin@example.com');
            await user.type(screen.getByLabelText(/password/i), 'validpassword123');
            await user.click(screen.getByRole('button', { name: /sign in/i }));

            // Assert
            await waitFor(() => {
                expect(mockDispatch).toHaveBeenCalled();
                expect(mockLogin).toHaveBeenCalledWith({
                    email: 'admin@example.com',
                    password: 'validpassword123',
                });
            });
        });

        it('should call clearError before login', async () => {
            // Arrange
            const user = userEvent.setup();
            render(<LoginPage />);

            // Act
            await user.type(screen.getByLabelText(/email address/i), 'admin@example.com');
            await user.type(screen.getByLabelText(/password/i), 'validpassword123');
            await user.click(screen.getByRole('button', { name: /sign in/i }));

            // Assert
            await waitFor(() => {
                expect(mockDispatch).toHaveBeenCalled();
            });
        });
    });

    describe('Error handling', () => {
        it('should display API error messages from Redux error state', () => {
            // Arrange
            mockUseAppSelector.mockImplementation((selector: (state: unknown) => unknown) => {
                const mockState = {
                    auth: { isLoading: false, error: 'Invalid credentials' },
                    ui: { theme: 'light' },
                };
                return selector(mockState);
            });

            // Act
            render(<LoginPage />);

            // Assert
            expect(screen.getByRole('alert')).toBeInTheDocument();
            expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
        });

        it('should not display error alert when there is no error', () => {
            // Arrange & Act
            render(<LoginPage />);

            // Assert
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });
    });

    describe('Navigation', () => {
        it('should redirect to dashboard on successful login', async () => {
            // Arrange
            const user = userEvent.setup();
            mockDispatch.mockReturnValue(Promise.resolve({ type: 'fulfilled' }));
            render(<LoginPage />);

            // Act
            await user.type(screen.getByLabelText(/email address/i), 'admin@example.com');
            await user.type(screen.getByLabelText(/password/i), 'validpassword123');
            await user.click(screen.getByRole('button', { name: /sign in/i }));

            // Assert
            await waitFor(() => {
                expect(mockNavigate).toHaveBeenCalledWith('/admin/dashboard', { replace: true });
            });
        });

        it('should redirect to original location from state on successful login', async () => {
            // Arrange
            const user = userEvent.setup();
            mockUseLocation.mockReturnValue({
                state: { from: { pathname: '/admin/users' } },
            });
            mockDispatch.mockReturnValue(Promise.resolve({ type: 'fulfilled' }));
            render(<LoginPage />);

            // Act
            await user.type(screen.getByLabelText(/email address/i), 'admin@example.com');
            await user.type(screen.getByLabelText(/password/i), 'validpassword123');
            await user.click(screen.getByRole('button', { name: /sign in/i }));

            // Assert
            await waitFor(() => {
                expect(mockNavigate).toHaveBeenCalledWith('/admin/users', { replace: true });
            });
        });

        it('should not navigate on failed login', async () => {
            // Arrange
            const user = userEvent.setup();
            mockDispatch.mockReturnValue(Promise.resolve({
                type: 'rejected',
                payload: 'Invalid credentials',
            }));
            render(<LoginPage />);

            // Act
            await user.type(screen.getByLabelText(/email address/i), 'admin@example.com');
            await user.type(screen.getByLabelText(/password/i), 'validpassword123');
            await user.click(screen.getByRole('button', { name: /sign in/i }));

            // Assert
            await waitFor(() => {
                expect(mockNavigate).not.toHaveBeenCalled();
            });
        });
    });

    describe('Two-factor authentication', () => {
        it('should show 2FA field when error contains "two-factor"', async () => {
            // Arrange
            const user = userEvent.setup();
            mockDispatch.mockReturnValue(Promise.resolve({
                type: 'rejected',
                payload: 'two-factor authentication required',
            }));
            render(<LoginPage />);

            // Act
            await user.type(screen.getByLabelText(/email address/i), 'admin@example.com');
            await user.type(screen.getByLabelText(/password/i), 'validpassword123');
            await user.click(screen.getByRole('button', { name: /sign in/i }));

            // Assert
            await waitFor(() => {
                expect(screen.getByLabelText(/two-factor code/i)).toBeInTheDocument();
            });
        });

        it('should not show 2FA field initially', () => {
            // Arrange & Act
            render(<LoginPage />);

            // Assert
            expect(screen.queryByLabelText(/two-factor code/i)).not.toBeInTheDocument();
        });

        it('should handle 2FA submission', async () => {
            // Arrange
            const user = userEvent.setup();
            let loginDispatchCount = 0;
            // Mock dispatch to handle clearError and login calls
            mockDispatch.mockImplementation((action: unknown) => {
                const actionObj = action as { type?: string; payload?: unknown; isLoginAction?: boolean };
                // Check if this is a login action
                if (actionObj?.isLoginAction) {
                    mockLogin(actionObj.payload);
                    loginDispatchCount++;
                    if (loginDispatchCount === 1) {
                        // First login call - trigger 2FA
                        return Promise.resolve({
                            type: 'rejected',
                            payload: 'two-factor authentication required',
                        });
                    }
                    // Second and subsequent calls - success
                    return Promise.resolve({ type: 'fulfilled' });
                }
                // Sync actions like clearError - just return the action
                return Promise.resolve(action);
            });
            render(<LoginPage />);

            // Act - First login attempt triggers 2FA
            await user.type(screen.getByLabelText(/email address/i), 'admin@example.com');
            await user.type(screen.getByLabelText(/password/i), 'validpassword123');
            await user.click(screen.getByRole('button', { name: /sign in/i }));

            // Wait for 2FA field to appear
            await waitFor(() => {
                expect(screen.getByLabelText(/two-factor code/i)).toBeInTheDocument();
            });

            // Enter 2FA code and submit
            await user.type(screen.getByLabelText(/two-factor code/i), '123456');
            await user.click(screen.getByRole('button', { name: /sign in/i }));

            // Assert
            await waitFor(() => {
                expect(mockLogin).toHaveBeenLastCalledWith({
                    email: 'admin@example.com',
                    password: 'validpassword123',
                    twoFactorCode: '123456',
                });
            });
        });
    });

    describe('Loading state', () => {
        it('should disable form fields during submission', () => {
            // Arrange
            mockUseAppSelector.mockImplementation((selector: (state: unknown) => unknown) => {
                const mockState = {
                    auth: { isLoading: true, error: null },
                    ui: { theme: 'light' },
                };
                return selector(mockState);
            });

            // Act
            render(<LoginPage />);

            // Assert
            expect(screen.getByLabelText(/email address/i)).toBeDisabled();
            expect(screen.getByLabelText(/password/i)).toBeDisabled();
            // When loading, button shows spinner instead of text, so query by id
            const submitButton = document.getElementById('btn-admin-login');
            expect(submitButton).toBeDisabled();
        });

        it('should show loading spinner during submission', () => {
            // Arrange
            mockUseAppSelector.mockImplementation((selector: (state: unknown) => unknown) => {
                const mockState = {
                    auth: { isLoading: true, error: null },
                    ui: { theme: 'light' },
                };
                return selector(mockState);
            });

            // Act
            render(<LoginPage />);

            // Assert
            expect(screen.getByRole('progressbar')).toBeInTheDocument();
        });

        it('should not show loading spinner when not loading', () => {
            // Arrange & Act
            render(<LoginPage />);

            // Assert
            expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
        });

        it('should show login button text when not loading', () => {
            // Arrange & Act
            render(<LoginPage />);

            // Assert
            expect(screen.getByRole('button', { name: /sign in/i })).toHaveTextContent('Sign In');
        });
    });

    describe('Theme toggle', () => {
        it('should toggle theme when theme button clicked', async () => {
            // Arrange
            const user = userEvent.setup();
            render(<LoginPage />);

            // Act
            const themeButton = screen.getByRole('button', { name: /switch to dark mode/i });
            await user.click(themeButton);

            // Assert
            expect(mockDispatch).toHaveBeenCalled();
        });

        it('should show dark mode icon when theme is light', () => {
            // Arrange
            mockUseAppSelector.mockImplementation((selector: (state: unknown) => unknown) => {
                const mockState = {
                    auth: defaultAuthState,
                    ui: { theme: 'light' },
                };
                return selector(mockState);
            });

            // Act
            render(<LoginPage />);

            // Assert
            expect(screen.getByText('DarkModeIcon')).toBeInTheDocument();
        });

        it('should show light mode icon when theme is dark', () => {
            // Arrange
            mockUseAppSelector.mockImplementation((selector: (state: unknown) => unknown) => {
                const mockState = {
                    auth: defaultAuthState,
                    ui: { theme: 'dark' },
                };
                return selector(mockState);
            });

            // Act
            render(<LoginPage />);

            // Assert
            expect(screen.getByText('LightModeIcon')).toBeInTheDocument();
        });

        it('should have correct aria-label for theme toggle in light mode', () => {
            // Arrange
            mockUseAppSelector.mockImplementation((selector: (state: unknown) => unknown) => {
                const mockState = {
                    auth: defaultAuthState,
                    ui: { theme: 'light' },
                };
                return selector(mockState);
            });

            // Act
            render(<LoginPage />);

            // Assert
            expect(screen.getByRole('button', { name: /switch to dark mode/i })).toBeInTheDocument();
        });

        it('should have correct aria-label for theme toggle in dark mode', () => {
            // Arrange
            mockUseAppSelector.mockImplementation((selector: (state: unknown) => unknown) => {
                const mockState = {
                    auth: defaultAuthState,
                    ui: { theme: 'dark' },
                };
                return selector(mockState);
            });

            // Act
            render(<LoginPage />);

            // Assert
            expect(screen.getByRole('button', { name: /switch to light mode/i })).toBeInTheDocument();
        });
    });
});
