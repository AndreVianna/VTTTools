import { ThemeProvider, createTheme } from '@mui/material';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SecuritySettings } from './SecuritySettings';

// Mock MUI icons to avoid undefined component errors
vi.mock('@mui/icons-material', () => ({
    CheckCircle: () => <span data-mock="icon-check-circle">CheckCircleIcon</span>,
    Close: () => <span data-mock="icon-close">CloseIcon</span>,
    Error: () => <span data-mock="icon-error">ErrorIcon</span>,
    Key: () => <span data-mock="icon-key">KeyIcon</span>,
    Password: () => <span data-mock="icon-password">PasswordIcon</span>,
    Security: () => <span data-mock="icon-security">SecurityIcon</span>,
}));

// Theme wrapper for MUI components
const theme = createTheme();
const renderWithTheme = (component: React.ReactElement) => {
    return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

// Mock useAuth hook
const mockUseAuth = vi.fn();
vi.mock('@/hooks/useAuth', () => ({
    useAuth: () => mockUseAuth(),
}));

// Mock useDisableTwoFactorMutation from twoFactorApi
const mockDisableTwoFactor = vi.fn();
let mockIsDisabling2FA = false;
vi.mock('@/api/twoFactorApi', () => ({
    useDisableTwoFactorMutation: () => [mockDisableTwoFactor, { isLoading: mockIsDisabling2FA }],
}));

// Mock useResetPasswordMutation from authApi
const mockResetPassword = vi.fn();
let mockIsResettingPassword = false;
vi.mock('@/services/authApi', () => ({
    useResetPasswordMutation: () => [mockResetPassword, { isLoading: mockIsResettingPassword }],
}));

// Mock error rendering utilities
vi.mock('@/utils/errorHandling', () => ({
    handleValidationError: vi.fn(),
}));

vi.mock('@/utils/renderError', () => ({
    renderAuthError: (error: unknown) => String(error),
}));

// Mock child components to avoid their dependencies
vi.mock('./TwoFactorSetupForm', () => ({
    TwoFactorSetupForm: ({ onComplete, onCancel }: { onComplete?: () => void; onCancel?: () => void }) => {
        const React = require('react');
        return React.createElement('div', { role: 'region', 'aria-label': 'Two-factor setup form' },
            React.createElement('button', { type: 'button', onClick: onComplete }, 'Complete Setup'),
            React.createElement('button', { type: 'button', onClick: onCancel }, 'Cancel Setup')
        );
    },
}));

vi.mock('./RecoveryCodesManager', () => ({
    RecoveryCodesManager: ({ onClose }: { onClose?: () => void }) => {
        const React = require('react');
        return React.createElement('div', { role: 'region', 'aria-label': 'Recovery codes manager' },
            React.createElement('button', { type: 'button', onClick: onClose }, 'Close Manager')
        );
    },
}));

describe('SecuritySettings', () => {
    const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        userName: 'testuser',
        twoFactorEnabled: false,
    };

    const mockUserWith2FA = {
        ...mockUser,
        twoFactorEnabled: true,
    };

    beforeEach(() => {
        vi.clearAllMocks();
        mockIsDisabling2FA = false;
        mockIsResettingPassword = false;
        mockUseAuth.mockReturnValue({
            user: mockUser,
            error: null,
        });
    });

    // ========================================
    // Initial Rendering
    // ========================================

    describe('rendering', () => {
        it('should display security settings title', () => {
            // Arrange & Act
            renderWithTheme(<SecuritySettings />);

            // Assert
            expect(screen.getByRole('heading', { name: /security settings/i })).toBeInTheDocument();
        });

        it('should display password management section', () => {
            // Arrange & Act
            renderWithTheme(<SecuritySettings />);

            // Assert
            expect(screen.getByText('Password')).toBeInTheDocument();
            expect(screen.getByText(/reset your account password via email/i)).toBeInTheDocument();
        });

        it('should display two-factor authentication section', () => {
            // Arrange & Act
            renderWithTheme(<SecuritySettings />);

            // Assert
            expect(screen.getByText('Two-Factor Authentication')).toBeInTheDocument();
        });

        it('should display reset password button', () => {
            // Arrange & Act
            renderWithTheme(<SecuritySettings />);

            // Assert
            expect(screen.getByRole('button', { name: /reset password/i })).toBeInTheDocument();
        });

        it('should display enable 2FA button when 2FA is disabled', () => {
            // Arrange
            mockUseAuth.mockReturnValue({
                user: mockUser,
                error: null,
            });

            // Act
            renderWithTheme(<SecuritySettings />);

            // Assert
            expect(screen.getByRole('button', { name: /enable 2fa/i })).toBeInTheDocument();
        });

        it('should display disable 2FA button when 2FA is enabled', () => {
            // Arrange
            mockUseAuth.mockReturnValue({
                user: mockUserWith2FA,
                error: null,
            });

            // Act
            renderWithTheme(<SecuritySettings />);

            // Assert
            expect(screen.getByRole('button', { name: /disable 2fa/i })).toBeInTheDocument();
        });

        it('should display recovery codes option when 2FA is enabled', () => {
            // Arrange
            mockUseAuth.mockReturnValue({
                user: mockUserWith2FA,
                error: null,
            });

            // Act
            renderWithTheme(<SecuritySettings />);

            // Assert
            expect(screen.getByText('Recovery Codes')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /manage codes/i })).toBeInTheDocument();
        });

        it('should not display recovery codes option when 2FA is disabled', () => {
            // Arrange
            mockUseAuth.mockReturnValue({
                user: mockUser,
                error: null,
            });

            // Act
            renderWithTheme(<SecuritySettings />);

            // Assert
            expect(screen.queryByText('Recovery Codes')).not.toBeInTheDocument();
        });
    });

    // ========================================
    // Loading States
    // ========================================

    describe('loading states', () => {
        it('should show loading spinner when user is not loaded', () => {
            // Arrange
            mockUseAuth.mockReturnValue({
                user: null,
                error: null,
            });

            // Act
            renderWithTheme(<SecuritySettings />);

            // Assert
            expect(screen.getByRole('progressbar')).toBeInTheDocument();
        });

        it('should show loading indicator in reset password button when resetting', () => {
            // Arrange
            mockIsResettingPassword = true;

            // Act
            renderWithTheme(<SecuritySettings />);

            // Assert
            const resetButton = screen.getByRole('button', { name: '' });
            expect(resetButton).toBeInTheDocument();
            expect(resetButton).toBeDisabled();
            expect(screen.getByRole('progressbar')).toBeInTheDocument();
        });
    });

    // ========================================
    // Error Handling
    // ========================================

    describe('error handling', () => {
        it('should display error alert when there is an auth error', () => {
            // Arrange
            mockUseAuth.mockReturnValue({
                user: mockUser,
                error: 'Authentication failed',
            });

            // Act
            renderWithTheme(<SecuritySettings />);

            // Assert
            expect(screen.getByRole('alert')).toBeInTheDocument();
            expect(screen.getByText('Authentication failed')).toBeInTheDocument();
        });
    });

    // ========================================
    // Password Reset
    // ========================================

    describe('password reset', () => {
        it('should call resetPassword when reset password button is clicked', async () => {
            // Arrange
            const user = userEvent.setup();
            mockResetPassword.mockReturnValue({ unwrap: () => Promise.resolve({ success: true }) });

            renderWithTheme(<SecuritySettings />);

            // Act
            await user.click(screen.getByRole('button', { name: /reset password/i }));

            // Assert
            await waitFor(() => {
                expect(mockResetPassword).toHaveBeenCalledWith({ email: 'test@example.com' });
            });
        });

        it('should display success message after password reset email is sent', async () => {
            // Arrange
            vi.useFakeTimers({ shouldAdvanceTime: true });
            const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
            mockResetPassword.mockReturnValue({ unwrap: () => Promise.resolve({ success: true }) });

            renderWithTheme(<SecuritySettings />);

            // Act
            await user.click(screen.getByRole('button', { name: /reset password/i }));

            // Assert
            await waitFor(() => {
                expect(screen.getByText(/password reset email sent to test@example.com/i)).toBeInTheDocument();
            });

            vi.useRealTimers();
        });

        it('should not call resetPassword when user email is missing', async () => {
            // Arrange
            const user = userEvent.setup();
            mockUseAuth.mockReturnValue({
                user: { ...mockUser, email: undefined },
                error: null,
            });

            renderWithTheme(<SecuritySettings />);

            // Act
            await user.click(screen.getByRole('button', { name: /reset password/i }));

            // Assert
            expect(mockResetPassword).not.toHaveBeenCalled();
        });
    });

    // ========================================
    // 2FA Enable Dialog
    // ========================================

    describe('enable 2FA dialog', () => {
        it('should open 2FA setup dialog when enable button is clicked', async () => {
            // Arrange
            const user = userEvent.setup();
            renderWithTheme(<SecuritySettings />);

            // Act
            await user.click(screen.getByRole('button', { name: /enable 2fa/i }));

            // Assert
            await waitFor(() => {
                expect(screen.getByRole('dialog')).toBeInTheDocument();
                expect(screen.getByRole('region', { name: /two-factor setup form/i })).toBeInTheDocument();
            });
        });

        it('should close 2FA setup dialog when onComplete is called', async () => {
            // Arrange
            const user = userEvent.setup();
            renderWithTheme(<SecuritySettings />);

            await user.click(screen.getByRole('button', { name: /enable 2fa/i }));
            await waitFor(() => {
                expect(screen.getByRole('dialog')).toBeInTheDocument();
            });

            // Act
            await user.click(screen.getByRole('button', { name: /complete setup/i }));

            // Assert
            await waitFor(() => {
                expect(screen.queryByRole('region', { name: /two-factor setup form/i })).not.toBeInTheDocument();
            });
        });

        it('should close 2FA setup dialog when onCancel is called', async () => {
            // Arrange
            const user = userEvent.setup();
            renderWithTheme(<SecuritySettings />);

            await user.click(screen.getByRole('button', { name: /enable 2fa/i }));
            await waitFor(() => {
                expect(screen.getByRole('dialog')).toBeInTheDocument();
            });

            // Act
            await user.click(screen.getByRole('button', { name: /cancel setup/i }));

            // Assert
            await waitFor(() => {
                expect(screen.queryByRole('region', { name: /two-factor setup form/i })).not.toBeInTheDocument();
            });
        });
    });

    // ========================================
    // 2FA Disable Dialog
    // ========================================

    describe('disable 2FA dialog', () => {
        beforeEach(() => {
            mockUseAuth.mockReturnValue({
                user: mockUserWith2FA,
                error: null,
            });
        });

        it('should open disable 2FA dialog when disable button is clicked', async () => {
            // Arrange
            const user = userEvent.setup();
            renderWithTheme(<SecuritySettings />);

            // Act
            await user.click(screen.getByRole('button', { name: /disable 2fa/i }));

            // Assert
            await waitFor(() => {
                expect(screen.getByRole('dialog')).toBeInTheDocument();
                expect(screen.getByText(/disable two-factor authentication/i)).toBeInTheDocument();
            });
        });

        it('should display warning in disable 2FA dialog', async () => {
            // Arrange
            const user = userEvent.setup();
            renderWithTheme(<SecuritySettings />);

            // Act
            await user.click(screen.getByRole('button', { name: /disable 2fa/i }));

            // Assert
            await waitFor(() => {
                expect(screen.getByText(/disabling two-factor authentication will make your account less secure/i)).toBeInTheDocument();
            });
        });

        it('should display password input in disable 2FA dialog', async () => {
            // Arrange
            const user = userEvent.setup();
            renderWithTheme(<SecuritySettings />);

            await user.click(screen.getByRole('button', { name: /disable 2fa/i }));

            // Assert
            await waitFor(() => {
                expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
            });
        });

        it('should show validation error when password is empty on submit', async () => {
            // Arrange
            const user = userEvent.setup();
            renderWithTheme(<SecuritySettings />);

            await user.click(screen.getByRole('button', { name: /disable 2fa/i }));
            await waitFor(() => {
                expect(screen.getByRole('dialog')).toBeInTheDocument();
            });

            // Act
            await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: /disable 2fa/i }));

            // Assert
            await waitFor(() => {
                expect(screen.getByText(/password is required to disable 2fa/i)).toBeInTheDocument();
            });
        });

        it('should call disableTwoFactor with correct password', async () => {
            // Arrange
            const user = userEvent.setup();
            mockDisableTwoFactor.mockReturnValue({ unwrap: () => Promise.resolve({ success: true }) });

            renderWithTheme(<SecuritySettings />);

            await user.click(screen.getByRole('button', { name: /disable 2fa/i }));
            await waitFor(() => {
                expect(screen.getByRole('dialog')).toBeInTheDocument();
            });

            await user.type(screen.getByLabelText(/confirm password/i), 'mypassword123');

            // Act
            await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: /disable 2fa/i }));

            // Assert
            await waitFor(() => {
                expect(mockDisableTwoFactor).toHaveBeenCalledWith({ password: 'mypassword123' });
            });
        });

        it('should close dialog after successful 2FA disable', async () => {
            // Arrange
            const user = userEvent.setup();
            mockDisableTwoFactor.mockReturnValue({ unwrap: () => Promise.resolve({ success: true }) });

            renderWithTheme(<SecuritySettings />);

            await user.click(screen.getByRole('button', { name: /disable 2fa/i }));
            await waitFor(() => {
                expect(screen.getByRole('dialog')).toBeInTheDocument();
            });

            await user.type(screen.getByLabelText(/confirm password/i), 'mypassword123');

            // Act
            await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: /disable 2fa/i }));

            // Assert
            await waitFor(() => {
                expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
            });
        });

        it('should close dialog when cancel button is clicked', async () => {
            // Arrange
            const user = userEvent.setup();
            renderWithTheme(<SecuritySettings />);

            await user.click(screen.getByRole('button', { name: /disable 2fa/i }));
            await waitFor(() => {
                expect(screen.getByRole('dialog')).toBeInTheDocument();
            });

            // Act
            await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: /cancel/i }));

            // Assert
            await waitFor(() => {
                expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
            });
        });

        it('should clear password field when dialog is closed and reopened', async () => {
            // Arrange
            const user = userEvent.setup();
            renderWithTheme(<SecuritySettings />);

            await user.click(screen.getByRole('button', { name: /disable 2fa/i }));
            await waitFor(() => {
                expect(screen.getByRole('dialog')).toBeInTheDocument();
            });

            await user.type(screen.getByLabelText(/confirm password/i), 'mypassword123');

            // Act - Close dialog
            await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: /cancel/i }));

            await waitFor(() => {
                expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
            });

            // Re-open dialog
            await user.click(screen.getByRole('button', { name: /disable 2fa/i }));

            // Assert - Password should be empty
            await waitFor(() => {
                const passwordInput = screen.getByLabelText(/confirm password/i) as HTMLInputElement;
                expect(passwordInput.value).toBe('');
            });
        });
    });

    // ========================================
    // Recovery Codes Manager Dialog
    // ========================================

    describe('recovery codes manager dialog', () => {
        beforeEach(() => {
            mockUseAuth.mockReturnValue({
                user: mockUserWith2FA,
                error: null,
            });
        });

        it('should open recovery codes manager when manage codes button is clicked', async () => {
            // Arrange
            const user = userEvent.setup();
            renderWithTheme(<SecuritySettings />);

            // Act
            await user.click(screen.getByRole('button', { name: /manage codes/i }));

            // Assert
            await waitFor(() => {
                expect(screen.getByRole('dialog')).toBeInTheDocument();
                expect(screen.getByRole('region', { name: /recovery codes manager/i })).toBeInTheDocument();
            });
        });

        it('should close recovery codes manager when onClose is called', async () => {
            // Arrange
            const user = userEvent.setup();
            renderWithTheme(<SecuritySettings />);

            await user.click(screen.getByRole('button', { name: /manage codes/i }));
            await waitFor(() => {
                expect(screen.getByRole('dialog')).toBeInTheDocument();
            });

            // Act
            await user.click(screen.getByRole('button', { name: /close manager/i }));

            // Assert
            await waitFor(() => {
                expect(screen.queryByRole('region', { name: /recovery codes manager/i })).not.toBeInTheDocument();
            });
        });
    });

    // ========================================
    // 2FA Status Indicators
    // ========================================

    describe('2FA status indicators', () => {
        it('should display protected message when 2FA is enabled', () => {
            // Arrange
            mockUseAuth.mockReturnValue({
                user: mockUserWith2FA,
                error: null,
            });

            // Act
            renderWithTheme(<SecuritySettings />);

            // Assert
            expect(screen.getByText(/your account is protected with two-factor authentication/i)).toBeInTheDocument();
        });

        it('should display add security message when 2FA is disabled', () => {
            // Arrange
            mockUseAuth.mockReturnValue({
                user: mockUser,
                error: null,
            });

            // Act
            renderWithTheme(<SecuritySettings />);

            // Assert
            expect(screen.getByText(/add an extra layer of security to your account/i)).toBeInTheDocument();
        });
    });

    // ========================================
    // Success Messages
    // ========================================

    describe('success messages', () => {
        it('should hide password reset success message after timeout', async () => {
            // Arrange
            vi.useFakeTimers({ shouldAdvanceTime: true });
            const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
            mockResetPassword.mockReturnValue({ unwrap: () => Promise.resolve({ success: true }) });

            renderWithTheme(<SecuritySettings />);

            await user.click(screen.getByRole('button', { name: /reset password/i }));

            await waitFor(() => {
                expect(screen.getByText(/password reset email sent/i)).toBeInTheDocument();
            });

            // Act - Advance time past the 5 second timeout
            vi.advanceTimersByTime(5100);

            // Assert
            await waitFor(() => {
                expect(screen.queryByText(/password reset email sent/i)).not.toBeInTheDocument();
            });

            vi.useRealTimers();
        });
    });
});
