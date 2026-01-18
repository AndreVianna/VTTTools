/**
 * LoginPage Component Tests
 * Tests mode selection based on pathname, mode switching via navigation,
 * success message display, and internal mode switching
 * Coverage: Authentication page routing and form switching
 */

import React from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LoginPage } from './LoginPage';

// Mock react-router-dom
const mockNavigate = vi.fn();
const mockUseLocation = vi.fn();
const mockUseSearchParams = vi.fn();

vi.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate,
    useLocation: () => mockUseLocation(),
    useSearchParams: () => mockUseSearchParams(),
}));

// Track callback props for testing internal mode switches
let capturedSimpleLoginFormProps: { onSwitchToRegister?: () => void; onSwitchToResetPassword?: () => void } = {};

// Mock child components with callbacks - capture props for testing
vi.mock('@/components/auth/SimpleLoginForm', () => ({
    SimpleLoginForm: vi.fn((props: { onSwitchToRegister?: () => void; onSwitchToResetPassword?: () => void }) => {
        capturedSimpleLoginFormProps = props;
        return (
            <div data-mock="SimpleLoginForm">
                <span>Login Form</span>
                <button onClick={props.onSwitchToRegister}>Switch to Register</button>
                <button onClick={props.onSwitchToResetPassword}>Switch to Reset Password</button>
            </div>
        );
    }),
}));

vi.mock('@/components/auth/SimpleRegistrationForm', () => ({
    SimpleRegistrationForm: vi.fn(({ onSwitchToLogin }: { onSwitchToLogin?: () => void }) => (
        <div data-mock="SimpleRegistrationForm">
            <span>Registration Form</span>
            <button onClick={onSwitchToLogin}>Switch to Login</button>
        </div>
    )),
}));

vi.mock('@/components/auth/PasswordResetRequestForm', () => ({
    PasswordResetRequestForm: vi.fn(({ onSwitchToLogin }: { onSwitchToLogin?: () => void }) => (
        <div data-mock="PasswordResetRequestForm">
            <span>Password Reset Request Form</span>
            <button onClick={onSwitchToLogin}>Switch to Login</button>
        </div>
    )),
}));

vi.mock('@/components/auth/PasswordResetConfirmForm', () => ({
    PasswordResetConfirmForm: vi.fn(({ onSwitchToLogin }: { onSwitchToLogin?: () => void }) => (
        <div data-mock="PasswordResetConfirmForm">
            <span>Password Reset Confirm Form</span>
            <button onClick={onSwitchToLogin}>Switch to Login</button>
        </div>
    )),
}));

vi.mock('@/components/auth/TwoFactorVerificationForm', () => ({
    TwoFactorVerificationForm: vi.fn((props: { onSwitchToRecovery?: () => void; onBack?: () => void }) => (
        <div data-mock="TwoFactorVerificationForm">
            <span>Two Factor Form</span>
            <button onClick={props.onSwitchToRecovery}>Switch to Recovery</button>
            <button onClick={props.onBack}>Back to Login</button>
        </div>
    )),
}));

vi.mock('@/components/auth/RecoveryCodeForm', () => ({
    RecoveryCodeForm: vi.fn((props: { onSwitchToTwoFactor?: () => void; onBack?: () => void }) => (
        <div data-mock="RecoveryCodeForm">
            <span>Recovery Code Form</span>
            <button onClick={props.onSwitchToTwoFactor}>Switch to 2FA</button>
            <button onClick={props.onBack}>Back to Login</button>
        </div>
    )),
}));

describe('LoginPage', () => {
    const renderWithTheme = (component: React.ReactElement) => {
        const theme = createTheme({ palette: { mode: 'light' } });
        return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
    };

    const setupLocation = (pathname: string, state: object | null = null) => {
        mockUseLocation.mockReturnValue({
            pathname,
            state,
            search: '',
            hash: '',
            key: 'default',
        });
        mockUseSearchParams.mockReturnValue([new URLSearchParams(), vi.fn()]);
    };

    beforeEach(() => {
        vi.clearAllMocks();
        // Reset captured props
        capturedSimpleLoginFormProps = {};
        // Default location setup
        setupLocation('/login');
        // Reset window.history.replaceState mock
        vi.spyOn(window.history, 'replaceState').mockImplementation(() => {});
    });

    // ========================================
    // Mode Selection Based on Pathname
    // ========================================

    describe('mode selection based on pathname', () => {
        it('should render SimpleLoginForm when pathname is /login', () => {
            // Arrange
            setupLocation('/login');

            // Act
            renderWithTheme(<LoginPage />);

            // Assert
            expect(screen.getByText('Login Form')).toBeInTheDocument();
            expect(screen.queryByText('Registration Form')).not.toBeInTheDocument();
            expect(screen.queryByText('Password Reset Confirm Form')).not.toBeInTheDocument();
        });

        it('should render SimpleRegistrationForm when pathname is /register', () => {
            // Arrange
            setupLocation('/register');

            // Act
            renderWithTheme(<LoginPage />);

            // Assert
            expect(screen.getByText('Registration Form')).toBeInTheDocument();
            expect(screen.queryByText('Login Form')).not.toBeInTheDocument();
            expect(screen.queryByText('Password Reset Confirm Form')).not.toBeInTheDocument();
        });

        it('should render PasswordResetConfirmForm when pathname is /reset-password', () => {
            // Arrange
            setupLocation('/reset-password');

            // Act
            renderWithTheme(<LoginPage />);

            // Assert
            expect(screen.getByText('Password Reset Confirm Form')).toBeInTheDocument();
            expect(screen.queryByText('Login Form')).not.toBeInTheDocument();
            expect(screen.queryByText('Registration Form')).not.toBeInTheDocument();
        });
    });

    // ========================================
    // Mode Switching via Navigation
    // ========================================

    describe('mode switching via navigation', () => {
        it('should navigate to /register when onSwitchToRegister is called', async () => {
            // Arrange
            const user = userEvent.setup();
            setupLocation('/login');
            renderWithTheme(<LoginPage />);

            // Act
            await user.click(screen.getByRole('button', { name: /switch to register/i }));

            // Assert
            expect(mockNavigate).toHaveBeenCalledWith('/register');
        });

        it('should navigate to /login when onSwitchToLogin is called from registration', async () => {
            // Arrange
            const user = userEvent.setup();
            setupLocation('/register');
            renderWithTheme(<LoginPage />);

            // Act
            await user.click(screen.getByRole('button', { name: /switch to login/i }));

            // Assert
            expect(mockNavigate).toHaveBeenCalledWith('/login');
        });

        it('should navigate to /forgot-password when onSwitchToResetPassword is called', async () => {
            // Arrange
            const user = userEvent.setup();
            setupLocation('/login');
            renderWithTheme(<LoginPage />);

            // Act
            await user.click(screen.getByRole('button', { name: /switch to reset password/i }));

            // Assert
            expect(mockNavigate).toHaveBeenCalledWith('/forgot-password');
        });

        it('should navigate to /login when onSwitchToLogin is called from password reset confirm', async () => {
            // Arrange
            const user = userEvent.setup();
            setupLocation('/reset-password');
            renderWithTheme(<LoginPage />);

            // Act
            await user.click(screen.getByRole('button', { name: /switch to login/i }));

            // Assert
            expect(mockNavigate).toHaveBeenCalledWith('/login');
        });
    });

    // ========================================
    // Success Message Handling
    // ========================================

    describe('success message handling', () => {
        it('should display success message from location.state', () => {
            // Arrange
            setupLocation('/login', { successMessage: 'Registration successful!' });

            // Act
            renderWithTheme(<LoginPage />);

            // Assert
            expect(screen.getByRole('alert')).toBeInTheDocument();
            expect(screen.getByText('Registration successful!')).toBeInTheDocument();
        });

        it('should clear success message on close', async () => {
            // Arrange
            const user = userEvent.setup();
            setupLocation('/login', { successMessage: 'Password reset successful!' });
            renderWithTheme(<LoginPage />);

            // Act
            const closeButton = screen.getByRole('button', { name: /close/i });
            await user.click(closeButton);

            // Assert
            await waitFor(() => {
                expect(screen.queryByText('Password reset successful!')).not.toBeInTheDocument();
            });
        });

        it('should call window.history.replaceState when success message is present', () => {
            // Arrange
            setupLocation('/login', { successMessage: 'Email confirmed!' });

            // Act
            renderWithTheme(<LoginPage />);

            // Assert
            expect(window.history.replaceState).toHaveBeenCalledWith({}, document.title);
        });

        it('should not display alert when no success message in state', () => {
            // Arrange
            setupLocation('/login', null);

            // Act
            renderWithTheme(<LoginPage />);

            // Assert
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });
    });

    // ========================================
    // Internal Mode Switching (No Navigation)
    // ========================================

    describe('internal mode switching', () => {
        it('should pass onSwitchToRegister callback to SimpleLoginForm', () => {
            // Arrange
            setupLocation('/login');

            // Act
            renderWithTheme(<LoginPage />);

            // Assert - Callback should be defined
            expect(capturedSimpleLoginFormProps.onSwitchToRegister).toBeDefined();
            expect(typeof capturedSimpleLoginFormProps.onSwitchToRegister).toBe('function');
        });

        it('should pass onSwitchToResetPassword callback to SimpleLoginForm', () => {
            // Arrange
            setupLocation('/login');

            // Act
            renderWithTheme(<LoginPage />);

            // Assert - Callback should be defined
            expect(capturedSimpleLoginFormProps.onSwitchToResetPassword).toBeDefined();
            expect(typeof capturedSimpleLoginFormProps.onSwitchToResetPassword).toBe('function');
        });
    });

    // ========================================
    // Pathname Change Effect
    // ========================================

    describe('pathname change effect', () => {
        it('should update mode when pathname changes from /login to /register', () => {
            // Arrange
            setupLocation('/login');
            const { rerender } = renderWithTheme(<LoginPage />);
            expect(screen.getByText('Login Form')).toBeInTheDocument();

            // Act - Simulate pathname change
            setupLocation('/register');
            rerender(
                <ThemeProvider theme={createTheme({ palette: { mode: 'light' } })}>
                    <LoginPage />
                </ThemeProvider>
            );

            // Assert
            expect(screen.getByText('Registration Form')).toBeInTheDocument();
            expect(screen.queryByText('Login Form')).not.toBeInTheDocument();
        });

        it('should update mode when pathname changes from /register to /reset-password', () => {
            // Arrange
            setupLocation('/register');
            const { rerender } = renderWithTheme(<LoginPage />);
            expect(screen.getByText('Registration Form')).toBeInTheDocument();

            // Act - Simulate pathname change
            setupLocation('/reset-password');
            rerender(
                <ThemeProvider theme={createTheme({ palette: { mode: 'light' } })}>
                    <LoginPage />
                </ThemeProvider>
            );

            // Assert
            expect(screen.getByText('Password Reset Confirm Form')).toBeInTheDocument();
            expect(screen.queryByText('Registration Form')).not.toBeInTheDocument();
        });
    });

    // ========================================
    // Default Behavior
    // ========================================

    describe('default behavior', () => {
        it('should default to login mode for unknown pathname', () => {
            // Arrange
            setupLocation('/unknown-path');

            // Act
            renderWithTheme(<LoginPage />);

            // Assert - Should show login form as default
            expect(screen.getByText('Login Form')).toBeInTheDocument();
        });

        it('should render without success message initially', () => {
            // Arrange
            setupLocation('/login');

            // Act
            renderWithTheme(<LoginPage />);

            // Assert
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });
    });
});
