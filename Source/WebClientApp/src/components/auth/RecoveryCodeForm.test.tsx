import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RecoveryCodeForm } from './RecoveryCodeForm';

// Mock useAuth hook
const mockVerifyRecoveryCode = vi.fn();
const mockVerifyRecoveryCodeReturnValue = { user: null, isLoading: false, error: null };

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    verifyRecoveryCode: mockVerifyRecoveryCode,
    ...mockVerifyRecoveryCodeReturnValue
  })
}));

describe('RecoveryCodeForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockVerifyRecoveryCodeReturnValue.isLoading = false;
    mockVerifyRecoveryCodeReturnValue.error = null;
  });

  // ========================================
  // Rendering and UI Structure
  // ========================================

  describe('rendering', () => {
    it('should render recovery code input field', () => {
      // Arrange & Act
      render(<RecoveryCodeForm />);

      // Assert
      expect(screen.getByLabelText(/recovery code/i)).toBeInTheDocument();
    });

    it('should render verify recovery code button', () => {
      // Arrange & Act
      render(<RecoveryCodeForm />);

      // Assert
      expect(screen.getByRole('button', { name: /verify recovery code/i })).toBeInTheDocument();
    });

    it('should render use authenticator code link', () => {
      // Arrange & Act
      render(<RecoveryCodeForm />);

      // Assert
      expect(screen.getByText(/use authenticator code instead/i)).toBeInTheDocument();
    });

    it('should render back to login link', () => {
      // Arrange & Act
      render(<RecoveryCodeForm />);

      // Assert
      expect(screen.getByText(/back to login/i)).toBeInTheDocument();
    });

    it('should display instructions text', () => {
      // Arrange & Act
      render(<RecoveryCodeForm />);

      // Assert
      expect(screen.getByText(/enter one of your saved recovery codes/i)).toBeInTheDocument();
    });

    it('should display single-use warning', () => {
      // Arrange & Act
      render(<RecoveryCodeForm />);

      // Assert
      expect(screen.getByText(/each recovery code can only be used once/i)).toBeInTheDocument();
    });
  });

  // ========================================
  // Validation - Code Format
  // ========================================

  describe('validation', () => {
    it('should show error when code is empty', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<RecoveryCodeForm />);
      const submitButton = screen.getByRole('button', { name: /verify recovery code/i });

      // Act
      await user.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/recovery code is required/i)).toBeInTheDocument();
      });
      expect(mockVerifyRecoveryCode).not.toHaveBeenCalled();
    });

    it('should show error for invalid recovery code format', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<RecoveryCodeForm />);
      const input = screen.getByLabelText(/recovery code/i);
      const submitButton = screen.getByRole('button', { name: /verify recovery code/i });

      // Act
      await user.type(input, 'ABC@#$%');
      await user.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/invalid recovery code format/i)).toBeInTheDocument();
      });
      expect(mockVerifyRecoveryCode).not.toHaveBeenCalled();
    });

    it('should accept valid recovery code format', async () => {
      // Arrange
      const user = userEvent.setup();
      mockVerifyRecoveryCode.mockResolvedValue({ success: true });
      render(<RecoveryCodeForm />);
      const input = screen.getByLabelText(/recovery code/i);
      const submitButton = screen.getByRole('button', { name: /verify recovery code/i });

      // Act
      await user.type(input, 'ABC12DEF34');
      await user.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(mockVerifyRecoveryCode).toHaveBeenCalledWith('ABC12DEF34');
      });
    });

    it('should clear validation error when user starts typing', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<RecoveryCodeForm />);
      const input = screen.getByLabelText(/recovery code/i);
      const submitButton = screen.getByRole('button', { name: /verify recovery code/i });

      // Act - Trigger validation error
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/recovery code is required/i)).toBeInTheDocument();
      });

      // Act - Start typing
      await user.type(input, 'A');

      // Assert - Error should be cleared
      await waitFor(() => {
        expect(screen.queryByText(/recovery code is required/i)).not.toBeInTheDocument();
      });
    });
  });

  // ========================================
  // Code Formatting and Normalization
  // ========================================

  describe('code formatting', () => {
    it('should convert code to uppercase automatically', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<RecoveryCodeForm />);
      const input = screen.getByLabelText(/recovery code/i) as HTMLInputElement;

      // Act
      await user.type(input, 'abc12def34');

      // Assert
      expect(input.value).toBe('ABC12DEF34');
    });

    it('should accept mixed case input and normalize to uppercase', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<RecoveryCodeForm />);
      const input = screen.getByLabelText(/recovery code/i) as HTMLInputElement;

      // Act
      await user.type(input, 'AbC12dEf34');

      // Assert
      expect(input.value).toBe('ABC12DEF34');
    });

    it('should submit normalized uppercase code', async () => {
      // Arrange
      const user = userEvent.setup();
      mockVerifyRecoveryCode.mockResolvedValue({ success: true });
      render(<RecoveryCodeForm />);
      const input = screen.getByLabelText(/recovery code/i);
      const submitButton = screen.getByRole('button', { name: /verify recovery code/i });

      // Act
      await user.type(input, 'abc12def34');
      await user.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(mockVerifyRecoveryCode).toHaveBeenCalledWith('ABC12DEF34');
      });
    });

    it('should trim spaces from code', async () => {
      // Arrange
      const user = userEvent.setup();
      mockVerifyRecoveryCode.mockResolvedValue({ success: true });
      render(<RecoveryCodeForm />);
      const input = screen.getByLabelText(/recovery code/i);
      const submitButton = screen.getByRole('button', { name: /verify recovery code/i });

      // Act
      await user.type(input, ' ABC12DEF34 ');
      await user.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(mockVerifyRecoveryCode).toHaveBeenCalledWith('ABC12DEF34');
      });
    });
  });

  // ========================================
  // Form Submission
  // ========================================

  describe('form submission', () => {
    it('should call verifyRecoveryCode with normalized code', async () => {
      // Arrange
      const user = userEvent.setup();
      mockVerifyRecoveryCode.mockResolvedValue({ success: true });
      render(<RecoveryCodeForm />);
      const input = screen.getByLabelText(/recovery code/i);
      const submitButton = screen.getByRole('button', { name: /verify recovery code/i });

      // Act
      await user.type(input, 'XYZ98WVU76');
      await user.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(mockVerifyRecoveryCode).toHaveBeenCalledWith('XYZ98WVU76');
      });
    });

    it('should not submit when code is empty', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<RecoveryCodeForm />);
      const submitButton = screen.getByRole('button', { name: /verify recovery code/i });

      // Act
      await user.click(submitButton);

      // Assert
      expect(mockVerifyRecoveryCode).not.toHaveBeenCalled();
    });

    it('should not submit with invalid format', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<RecoveryCodeForm />);
      const input = screen.getByLabelText(/recovery code/i);
      const submitButton = screen.getByRole('button', { name: /verify recovery code/i });

      // Act
      await user.type(input, '123');
      await user.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/invalid recovery code format/i)).toBeInTheDocument();
      });
      expect(mockVerifyRecoveryCode).not.toHaveBeenCalled();
    });
  });

  // ========================================
  // Loading State
  // ========================================

  describe('loading state', () => {
    it('should disable input during verification', () => {
      // Arrange
      mockVerifyRecoveryCodeReturnValue.isLoading = true;

      // Act
      render(<RecoveryCodeForm />);

      // Assert
      expect(screen.getByLabelText(/recovery code/i)).toBeDisabled();
    });

    it('should disable submit button during verification', () => {
      // Arrange
      mockVerifyRecoveryCodeReturnValue.isLoading = true;

      // Act
      render(<RecoveryCodeForm />);

      // Assert
      expect(screen.getByRole('button', { name: /verify recovery code/i })).toBeDisabled();
    });

    it('should show loading spinner in submit button', () => {
      // Arrange
      mockVerifyRecoveryCodeReturnValue.isLoading = true;

      // Act
      render(<RecoveryCodeForm />);

      // Assert
      const submitButton = screen.getByRole('button', { name: /verify recovery code/i });
      const spinner = submitButton.querySelector('svg[data-testid="circular-progress"], .MuiCircularProgress-root');
      expect(spinner).toBeInTheDocument();
    });

    it('should disable navigation links during verification', () => {
      // Arrange
      mockVerifyRecoveryCodeReturnValue.isLoading = true;

      // Act
      render(<RecoveryCodeForm />);
      const authenticatorLink = screen.getByText(/use authenticator code instead/i);
      const backButton = screen.getByRole('button', { name: /back to login/i });

      // Assert
      expect(authenticatorLink).toHaveClass('Mui-disabled');
      expect(backButton).toBeDisabled();
    });
  });

  // ========================================
  // Error Display
  // ========================================

  describe('error display', () => {
    it('should display invalid recovery code error', () => {
      // Arrange
      mockVerifyRecoveryCodeReturnValue.error = 'Invalid recovery code' as any;

      // Act
      render(<RecoveryCodeForm />);

      // Assert
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(/invalid recovery code/i)).toBeInTheDocument();
    });

    it('should display already used code error', () => {
      // Arrange
      mockVerifyRecoveryCodeReturnValue.error = 'This recovery code has already been used' as any;

      // Act
      render(<RecoveryCodeForm />);

      // Assert
      expect(screen.getByText(/this recovery code has already been used/i)).toBeInTheDocument();
    });

    it('should display rate limit error', () => {
      // Arrange
      mockVerifyRecoveryCodeReturnValue.error = 'Too many attempts. Try again in 5 minutes.' as any;

      // Act
      render(<RecoveryCodeForm />);

      // Assert
      expect(screen.getByText(/too many attempts/i)).toBeInTheDocument();
    });

    it('should display session expired error', () => {
      // Arrange
      mockVerifyRecoveryCodeReturnValue.error = 'Session expired. Please log in again.' as any;

      // Act
      render(<RecoveryCodeForm />);

      // Assert
      expect(screen.getByText(/session expired/i)).toBeInTheDocument();
    });

    it('should display connection error', () => {
      // Arrange
      mockVerifyRecoveryCodeReturnValue.error = 'Connection error. Please try again.' as any;

      // Act
      render(<RecoveryCodeForm />);

      // Assert
      expect(screen.getByText(/connection error/i)).toBeInTheDocument();
    });

    it('should display 2FA not enabled error', () => {
      // Arrange
      mockVerifyRecoveryCodeReturnValue.error = 'Two-factor authentication is not enabled.' as any;

      // Act
      render(<RecoveryCodeForm />);

      // Assert
      expect(screen.getByText(/two-factor authentication is not enabled/i)).toBeInTheDocument();
    });
  });

  // ========================================
  // Navigation
  // ========================================

  describe('navigation', () => {
    it('should call onSwitchToTwoFactor when authenticator link is clicked', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockOnSwitchToTwoFactor = vi.fn();
      render(<RecoveryCodeForm onSwitchToTwoFactor={mockOnSwitchToTwoFactor} />);

      // Act
      await user.click(screen.getByText(/use authenticator code instead/i));

      // Assert
      expect(mockOnSwitchToTwoFactor).toHaveBeenCalledTimes(1);
    });

    it('should call onBack when back to login link is clicked', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockOnBack = vi.fn();
      render(<RecoveryCodeForm onBack={mockOnBack} />);

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
    it('should have autofocus on recovery code input', () => {
      // Arrange & Act
      render(<RecoveryCodeForm />);

      // Assert
      const input = screen.getByLabelText(/recovery code/i);
      expect(document.activeElement).toBe(input);
    });

    it('should have autocomplete attribute for one-time code', () => {
      // Arrange & Act
      render(<RecoveryCodeForm />);

      // Assert
      expect(screen.getByLabelText(/recovery code/i)).toHaveAttribute('autocomplete', 'one-time-code');
    });

    it('should have proper label association', () => {
      // Arrange & Act
      render(<RecoveryCodeForm />);

      // Assert
      const input = screen.getByLabelText(/recovery code/i);
      expect(input).toHaveAttribute('id', 'recoveryCode');
      expect(input).toHaveAttribute('name', 'recoveryCode');
    });

    it('should announce validation errors to screen readers', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<RecoveryCodeForm />);
      const submitButton = screen.getByRole('button', { name: /verify recovery code/i });

      // Act
      await user.click(submitButton);

      // Assert
      await waitFor(() => {
        const errorText = screen.getByText(/recovery code is required/i);
        expect(errorText).toBeInTheDocument();
        const input = screen.getByLabelText(/recovery code/i);
        expect(input).toHaveAttribute('aria-invalid', 'true');
      });
    });

    it('should display warning alert with proper role', () => {
      // Arrange & Act
      render(<RecoveryCodeForm />);

      // Assert
      const warningAlert = screen.getByText(/each recovery code can only be used once/i).closest('[role="alert"]');
      expect(warningAlert).toBeInTheDocument();
    });
  });

  // ========================================
  // Helper Text
  // ========================================

  describe('helper text', () => {
    it('should display helper text for code entry', () => {
      // Arrange & Act
      render(<RecoveryCodeForm />);

      // Assert
      expect(screen.getByText(/enter the recovery code exactly as shown when you saved it/i)).toBeInTheDocument();
    });

    it('should display placeholder in input', () => {
      // Arrange & Act
      render(<RecoveryCodeForm />);
      const input = screen.getByLabelText(/recovery code/i);

      // Assert
      expect(input).toHaveAttribute('placeholder', 'XXXXXXXX');
    });
  });

  // ========================================
  // Edge Cases
  // ========================================

  describe('edge cases', () => {
    it('should handle network connection errors', async () => {
      // Arrange
      const user = userEvent.setup();
      mockVerifyRecoveryCode.mockRejectedValue(new Error('Connection error'));
      render(<RecoveryCodeForm />);
      const input = screen.getByLabelText(/recovery code/i);
      const submitButton = screen.getByRole('button', { name: /verify recovery code/i });

      // Act
      await user.type(input, 'ABC12DEF34');
      await user.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(mockVerifyRecoveryCode).toHaveBeenCalled();
      });
    });

    it('should preserve code input after form submission error', async () => {
      // Arrange
      const user = userEvent.setup();
      mockVerifyRecoveryCode.mockRejectedValue(new Error('Invalid code'));
      render(<RecoveryCodeForm />);
      const input = screen.getByLabelText(/recovery code/i) as HTMLInputElement;
      const submitButton = screen.getByRole('button', { name: /verify recovery code/i });

      // Act
      await user.type(input, 'ABC12DEF34');
      await user.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(input.value).toBe('ABC12DEF34');
      });
    });

    it('should handle codes with hyphens', async () => {
      // Arrange
      const user = userEvent.setup();
      mockVerifyRecoveryCode.mockResolvedValue({ success: true });
      render(<RecoveryCodeForm />);
      const input = screen.getByLabelText(/recovery code/i);
      const submitButton = screen.getByRole('button', { name: /verify recovery code/i });

      // Act
      await user.type(input, 'ABC-12-DEF-34');
      await user.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(mockVerifyRecoveryCode).toHaveBeenCalledWith('ABC-12-DEF-34');
      });
    });

    it('should handle minimum length recovery codes', async () => {
      // Arrange
      const user = userEvent.setup();
      mockVerifyRecoveryCode.mockResolvedValue({ success: true });
      render(<RecoveryCodeForm />);
      const input = screen.getByLabelText(/recovery code/i);
      const submitButton = screen.getByRole('button', { name: /verify recovery code/i });

      // Act
      await user.type(input, 'ABCD1234');
      await user.click(submitButton);

      // Assert
      await waitFor(() => {
        expect(mockVerifyRecoveryCode).toHaveBeenCalledWith('ABCD1234');
      });
    });
  });
});
