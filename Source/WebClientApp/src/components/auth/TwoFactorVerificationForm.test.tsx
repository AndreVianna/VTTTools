import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TwoFactorVerificationForm } from './TwoFactorVerificationForm';

// Mock useAuth hook
const mockVerifyTwoFactor = vi.fn();
let mockAuthState = { user: null, isLoading: false, error: null };

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    verifyTwoFactor: mockVerifyTwoFactor,
    get user() {
      return mockAuthState.user;
    },
    get isLoading() {
      return mockAuthState.isLoading;
    },
    get error() {
      return mockAuthState.error;
    },
  }),
}));

describe('TwoFactorVerificationForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthState = { user: null, isLoading: false, error: null };
  });

  // ========================================
  // Rendering and UI Structure
  // ========================================

  describe('rendering', () => {
    it('should render verification code input field', () => {
      // Arrange & Act
      render(<TwoFactorVerificationForm />);

      // Assert
      expect(screen.getByLabelText(/verification code/i)).toBeInTheDocument();
    });

    it('should render remember device checkbox', () => {
      // Arrange & Act
      render(<TwoFactorVerificationForm />);

      // Assert
      expect(
        screen.getByRole('checkbox', {
          name: /remember this device for 30 days/i,
        }),
      ).toBeInTheDocument();
    });

    it('should render verify code button', () => {
      // Arrange & Act
      render(<TwoFactorVerificationForm />);

      // Assert
      expect(screen.getByRole('button', { name: /verify code/i })).toBeInTheDocument();
    });

    it('should render use recovery code link', () => {
      // Arrange & Act
      render(<TwoFactorVerificationForm />);

      // Assert
      expect(screen.getByText(/use a recovery code instead/i)).toBeInTheDocument();
    });

    it('should render back to login link', () => {
      // Arrange & Act
      render(<TwoFactorVerificationForm />);

      // Assert
      expect(screen.getByText(/back to login/i)).toBeInTheDocument();
    });

    it('should display instructions text', () => {
      // Arrange & Act
      render(<TwoFactorVerificationForm />);

      // Assert
      expect(screen.getByText(/enter the 6-digit code from your authenticator app/i)).toBeInTheDocument();
    });
  });

  // ========================================
  // Validation - Code Format
  // ========================================

  describe('validation', () => {
    it('should show error when code is less than 6 digits', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<TwoFactorVerificationForm />);
      const input = screen.getByLabelText(/verification code/i);
      const submitButton = screen.getByRole('button', { name: /verify code/i });

      // Act
      await user.type(input, '12345');
      await user.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/verification code must be 6 digits/i)).toBeInTheDocument();
      });
      expect(mockVerifyTwoFactor).not.toHaveBeenCalled();
    });

    it('should show error when code contains non-numeric characters', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<TwoFactorVerificationForm />);
      const input = screen.getByLabelText(/verification code/i);
      const submitButton = screen.getByRole('button', { name: /verify code/i });

      // Act
      await user.type(input, '12a4b6');
      await user.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/verification code must be 6 digits/i)).toBeInTheDocument();
      });
      expect(mockVerifyTwoFactor).not.toHaveBeenCalled();
    });

    it('should accept valid 6-digit code', async () => {
      // Arrange
      const user = userEvent.setup();
      mockVerifyTwoFactor.mockResolvedValue({ success: true });
      render(<TwoFactorVerificationForm />);
      const input = screen.getByLabelText(/verification code/i);
      const submitButton = screen.getByRole('button', { name: /verify code/i });

      // Act
      await user.type(input, '123456');
      await user.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(mockVerifyTwoFactor).toHaveBeenCalledWith('123456', false);
      });
    });

    it('should clear validation error when user starts typing', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<TwoFactorVerificationForm />);
      const input = screen.getByLabelText(/verification code/i);
      const submitButton = screen.getByRole('button', { name: /verify code/i });

      // Act - Trigger validation error
      await user.type(input, '123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/verification code must be 6 digits/i)).toBeInTheDocument();
      });

      // Act - Start typing again
      await user.type(input, '4');

      // Assert - Error should be cleared
      await waitFor(() => {
        expect(screen.queryByText(/verification code must be 6 digits/i)).not.toBeInTheDocument();
      });
    });
  });

  // ========================================
  // Code Formatting
  // ========================================

  describe('code formatting', () => {
    it('should format code as XXX XXX for readability', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<TwoFactorVerificationForm />);
      const input = screen.getByLabelText(/verification code/i) as HTMLInputElement;

      // Act
      await user.type(input, '123456');

      // Assert
      expect(input.value).toBe('123 456');
    });

    it('should submit code without formatting spaces', async () => {
      // Arrange
      const user = userEvent.setup();
      mockVerifyTwoFactor.mockResolvedValue({ success: true });
      render(<TwoFactorVerificationForm />);
      const input = screen.getByLabelText(/verification code/i);
      const submitButton = screen.getByRole('button', { name: /verify code/i });

      // Act
      await user.type(input, '123456');
      await user.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(mockVerifyTwoFactor).toHaveBeenCalledWith('123456', false);
      });
    });

    it('should limit input to 6 digits', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<TwoFactorVerificationForm />);
      const input = screen.getByLabelText(/verification code/i) as HTMLInputElement;

      // Act
      await user.type(input, '12345678');

      // Assert
      expect(input.value).toBe('123 456');
    });
  });

  // ========================================
  // Form Submission
  // ========================================

  describe('form submission', () => {
    it('should call verifyTwoFactor with code and rememberMachine=false when checkbox unchecked', async () => {
      // Arrange
      const user = userEvent.setup();
      mockVerifyTwoFactor.mockResolvedValue({ success: true });
      render(<TwoFactorVerificationForm />);
      const input = screen.getByLabelText(/verification code/i);
      const submitButton = screen.getByRole('button', { name: /verify code/i });

      // Act
      await user.type(input, '123456');
      await user.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(mockVerifyTwoFactor).toHaveBeenCalledWith('123456', false);
      });
    });

    it('should call verifyTwoFactor with code and rememberMachine=true when checkbox checked', async () => {
      // Arrange
      const user = userEvent.setup();
      mockVerifyTwoFactor.mockResolvedValue({ success: true });
      render(<TwoFactorVerificationForm />);
      const input = screen.getByLabelText(/verification code/i);
      const checkbox = screen.getByRole('checkbox', {
        name: /remember this device for 30 days/i,
      });
      const submitButton = screen.getByRole('button', { name: /verify code/i });

      // Act
      await user.type(input, '123456');
      await user.click(checkbox);
      await user.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(mockVerifyTwoFactor).toHaveBeenCalledWith('123456', true);
      });
    });

    it('should not submit when code is empty', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<TwoFactorVerificationForm />);
      const submitButton = screen.getByRole('button', { name: /verify code/i });

      // Act
      await user.click(submitButton);

      // Assert
      expect(mockVerifyTwoFactor).not.toHaveBeenCalled();
    });
  });

  // ========================================
  // Loading State
  // ========================================

  describe('loading state', () => {
    it('should disable inputs during verification', () => {
      // Arrange
      mockAuthState.isLoading = true;

      // Act
      render(<TwoFactorVerificationForm />);

      // Assert
      expect(screen.getByLabelText(/verification code/i)).toBeDisabled();
      expect(
        screen.getByRole('checkbox', {
          name: /remember this device for 30 days/i,
        }),
      ).toBeDisabled();
    });

    it('should disable submit button during verification', () => {
      // Arrange
      mockAuthState.isLoading = true;

      // Act
      render(<TwoFactorVerificationForm />);

      // Assert
      expect(screen.getByRole('button', { name: /verify code/i })).toBeDisabled();
    });

    it('should show loading spinner in submit button', () => {
      // Arrange
      mockAuthState.isLoading = true;

      // Act
      render(<TwoFactorVerificationForm />);

      // Assert
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('should disable navigation links during verification', () => {
      // Arrange
      mockAuthState.isLoading = true;

      // Act
      render(<TwoFactorVerificationForm />);
      const recoveryLink = screen.getByText(/use a recovery code instead/i);
      const backLink = screen.getByText(/back to login/i);

      // Assert
      expect(recoveryLink).toHaveAttribute('disabled');
      expect(backLink).toHaveAttribute('disabled');
    });
  });

  // ========================================
  // Error Display
  // ========================================

  describe('error display', () => {
    it('should display error message when verification fails', () => {
      // Arrange
      mockAuthState.error = 'Invalid verification code. Please try again.' as unknown as null;

      // Act
      render(<TwoFactorVerificationForm />);

      // Assert
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(/invalid verification code/i)).toBeInTheDocument();
    });

    it('should display expired code error message', () => {
      // Arrange
      mockAuthState.error = 'Code has expired. Please enter a new code from your app.' as unknown as null;

      // Act
      render(<TwoFactorVerificationForm />);

      // Assert
      expect(screen.getByText(/code has expired/i)).toBeInTheDocument();
    });

    it('should display rate limit error message', () => {
      // Arrange
      mockAuthState.error = 'Too many attempts. Please try again in 5 minutes.' as unknown as null;

      // Act
      render(<TwoFactorVerificationForm />);

      // Assert
      expect(screen.getByText(/too many attempts/i)).toBeInTheDocument();
    });

    it('should display session expired error message', () => {
      // Arrange
      mockAuthState.error = 'Session expired. Please log in again.' as unknown as null;

      // Act
      render(<TwoFactorVerificationForm />);

      // Assert
      expect(screen.getByText(/session expired/i)).toBeInTheDocument();
    });
  });

  // ========================================
  // Navigation
  // ========================================

  describe('navigation', () => {
    it('should call onSwitchToRecovery when recovery code link is clicked', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockOnSwitchToRecovery = vi.fn();
      render(<TwoFactorVerificationForm onSwitchToRecovery={mockOnSwitchToRecovery} />);

      // Act
      await user.click(screen.getByText(/use a recovery code instead/i));

      // Assert
      expect(mockOnSwitchToRecovery).toHaveBeenCalledTimes(1);
    });

    it('should call onBack when back to login link is clicked', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockOnBack = vi.fn();
      render(<TwoFactorVerificationForm onBack={mockOnBack} />);

      // Act
      await user.click(screen.getByText(/back to login/i));

      // Assert
      expect(mockOnBack).toHaveBeenCalledTimes(1);
    });
  });

  // ========================================
  // Accessibility
  // ========================================

  describe('accessibility', () => {
    it('should have autofocus on verification code input', () => {
      // Arrange & Act
      render(<TwoFactorVerificationForm />);

      // Assert
      expect(screen.getByLabelText(/verification code/i)).toHaveAttribute('autofocus');
    });

    it('should have autocomplete attribute for one-time code', () => {
      // Arrange & Act
      render(<TwoFactorVerificationForm />);

      // Assert
      expect(screen.getByLabelText(/verification code/i)).toHaveAttribute('autocomplete', 'one-time-code');
    });

    it('should have proper label association', () => {
      // Arrange & Act
      render(<TwoFactorVerificationForm />);

      // Assert
      const input = screen.getByLabelText(/verification code/i);
      expect(input).toHaveAttribute('id', 'verificationCode');
      expect(input).toHaveAttribute('name', 'verificationCode');
    });

    it('should announce validation errors to screen readers', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<TwoFactorVerificationForm />);
      const input = screen.getByLabelText(/verification code/i);
      const submitButton = screen.getByRole('button', { name: /verify code/i });

      // Act
      await user.type(input, '123');
      await user.click(submitButton);

      // Assert
      await waitFor(() => {
        const errorText = screen.getByText(/verification code must be 6 digits/i);
        expect(errorText).toBeInTheDocument();
        // Error should be associated with input via aria-describedby
        expect(input).toHaveAttribute('aria-invalid', 'true');
      });
    });
  });

  // ========================================
  // Edge Cases
  // ========================================

  describe('edge cases', () => {
    it('should handle network connection errors', async () => {
      // Arrange
      const user = userEvent.setup();
      mockVerifyTwoFactor.mockRejectedValue(new Error('Connection error'));
      render(<TwoFactorVerificationForm />);
      const input = screen.getByLabelText(/verification code/i);
      const submitButton = screen.getByRole('button', { name: /verify code/i });

      // Act
      await user.type(input, '123456');
      await user.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(mockVerifyTwoFactor).toHaveBeenCalled();
      });
    });

    it('should handle empty code submission attempt', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<TwoFactorVerificationForm />);
      const submitButton = screen.getByRole('button', { name: /verify code/i });

      // Act
      await user.click(submitButton);

      // Assert
      expect(submitButton).toBeDisabled();
      expect(mockVerifyTwoFactor).not.toHaveBeenCalled();
    });

    it('should preserve code input after form submission error', async () => {
      // Arrange
      const user = userEvent.setup();
      mockVerifyTwoFactor.mockRejectedValue(new Error('Invalid code'));
      render(<TwoFactorVerificationForm />);
      const input = screen.getByLabelText(/verification code/i) as HTMLInputElement;
      const submitButton = screen.getByRole('button', { name: /verify code/i });

      // Act
      await user.type(input, '123456');
      await user.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(input.value).toBe('123 456');
      });
    });
  });
});
