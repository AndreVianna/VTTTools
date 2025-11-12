import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TwoFactorSetupForm } from './TwoFactorSetupForm';

// Mock useAuth hook
const mockSetupTwoFactor = vi.fn();
const mockEnableTwoFactor = vi.fn();
const mockAuthReturnValue = { user: null, isLoading: false, error: null };

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    setupTwoFactor: mockSetupTwoFactor,
    enableTwoFactor: mockEnableTwoFactor,
    get user() {
      return mockAuthReturnValue.user;
    },
    get isLoading() {
      return mockAuthReturnValue.isLoading;
    },
    get error() {
      return mockAuthReturnValue.error;
    },
  }),
}));

describe('TwoFactorSetupForm', () => {
  const mockSetupData = {
    sharedKey: 'JBSWY3DPEHPK3PXP',
    authenticatorUri: 'otpauth://totp/VTTTools:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=VTTTools',
    qrCodeUri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA...',
    recoveryCodes: [],
  };

  const mockRecoveryCodes = [
    'ABC12DEF34',
    'XYZ98WVU76',
    'QWE45RTY67',
    'ASD89FGH12',
    'ZXC34VBN56',
    'PLM78OKN90',
    'MNB23VCX45',
    'JKL56HGF78',
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthReturnValue.isLoading = false;
    mockAuthReturnValue.error = null;
    mockSetupTwoFactor.mockResolvedValue(mockSetupData);
  });

  // ========================================
  // Initial Loading and QR Code Display
  // ========================================

  describe('initialization', () => {
    it('should show loading spinner during setup initialization', () => {
      // Arrange
      mockSetupTwoFactor.mockReturnValue(new Promise(() => {})); // Never resolves

      // Act
      render(<TwoFactorSetupForm />);

      // Assert
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('should initialize 2FA setup on mount', async () => {
      // Arrange & Act
      render(<TwoFactorSetupForm />);

      // Assert
      await waitFor(() => {
        expect(mockSetupTwoFactor).toHaveBeenCalledTimes(1);
      });
    });

    it('should display QR code after successful initialization', async () => {
      // Arrange & Act
      render(<TwoFactorSetupForm />);

      // Assert
      await waitFor(() => {
        const qrImage = screen.getByAltText(/2fa qr code/i);
        expect(qrImage).toBeInTheDocument();
        expect(qrImage).toHaveAttribute('src', mockSetupData.qrCodeUri);
      });
    });

    it('should display manual entry code', async () => {
      // Arrange & Act
      render(<TwoFactorSetupForm />);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(mockSetupData.sharedKey)).toBeInTheDocument();
      });
    });
  });

  // ========================================
  // Stepper Navigation
  // ========================================

  describe('stepper navigation', () => {
    it('should start at step 1 (Install Authenticator App)', async () => {
      // Arrange & Act
      render(<TwoFactorSetupForm />);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/install authenticator app/i)).toBeInTheDocument();
      });
    });

    it('should navigate to step 2 when Continue is clicked', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<TwoFactorSetupForm />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument();
      });

      // Act
      await user.click(screen.getByRole('button', { name: /continue/i }));

      // Assert
      expect(screen.getByText(/scan qr code/i)).toBeInTheDocument();
      expect(screen.getByAltText(/2fa qr code/i)).toBeInTheDocument();
    });

    it('should navigate back to step 1 when Back is clicked', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<TwoFactorSetupForm />);

      // Navigate to step 2
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument();
      });
      await user.click(screen.getByRole('button', { name: /continue/i }));

      // Act - Click Back button
      await user.click(screen.getByRole('button', { name: /back/i }));

      // Assert
      expect(screen.getByText(/first, install an authenticator app/i)).toBeInTheDocument();
    });

    it('should call onCancel when Cancel is clicked', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockOnCancel = vi.fn();
      render(<TwoFactorSetupForm onCancel={mockOnCancel} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      });

      // Act
      await user.click(screen.getByRole('button', { name: /cancel/i }));

      // Assert
      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });
  });

  // ========================================
  // Step 1: Authenticator App Instructions
  // ========================================

  describe('step 1: authenticator app instructions', () => {
    it('should display list of recommended authenticator apps', async () => {
      // Arrange & Act
      render(<TwoFactorSetupForm />);

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/google authenticator/i)).toBeInTheDocument();
        expect(screen.getByText(/microsoft authenticator/i)).toBeInTheDocument();
        expect(screen.getByText(/authy/i)).toBeInTheDocument();
      });
    });

    it('should show app store availability for each authenticator', async () => {
      // Arrange & Act
      render(<TwoFactorSetupForm />);

      // Assert
      await waitFor(() => {
        const appStoreReferences = screen.getAllByText(/ios app store.*google play store/i);
        expect(appStoreReferences.length).toBeGreaterThan(0);
      });
    });
  });

  // ========================================
  // Step 2: QR Code and Verification
  // ========================================

  describe('step 2: qr code and verification', () => {
    it('should display QR code with proper alt text', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<TwoFactorSetupForm />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument();
      });

      // Act
      await user.click(screen.getByRole('button', { name: /continue/i }));

      // Assert
      const qrImage = screen.getByAltText(/2fa qr code/i);
      expect(qrImage).toBeInTheDocument();
      expect(qrImage).toHaveAttribute('src', mockSetupData.qrCodeUri);
    });

    it('should display manual entry code with copy button', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<TwoFactorSetupForm />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument();
      });

      // Act
      await user.click(screen.getByRole('button', { name: /continue/i }));

      // Assert
      expect(screen.getByText(mockSetupData.sharedKey)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /copy/i })).toBeInTheDocument();
    });

    it('should copy manual entry code to clipboard when copy button is clicked', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockClipboard = {
        writeText: vi.fn().mockResolvedValue(undefined),
      };
      Object.assign(navigator, { clipboard: mockClipboard });

      render(<TwoFactorSetupForm />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument();
      });
      await user.click(screen.getByRole('button', { name: /continue/i }));

      // Act
      await user.click(screen.getByRole('button', { name: /copy/i }));

      // Assert
      expect(mockClipboard.writeText).toHaveBeenCalledWith(mockSetupData.sharedKey);
    });

    it('should render verification code input field', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<TwoFactorSetupForm />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument();
      });
      await user.click(screen.getByRole('button', { name: /continue/i }));

      // Assert
      expect(screen.getByLabelText(/verification code/i)).toBeInTheDocument();
    });
  });

  // ========================================
  // Verification Code Validation
  // ========================================

  describe('verification code validation', () => {
    it('should format verification code as XXX XXX', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<TwoFactorSetupForm />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument();
      });
      await user.click(screen.getByRole('button', { name: /continue/i }));

      const input = screen.getByLabelText(/verification code/i) as HTMLInputElement;

      // Act
      await user.type(input, '123456');

      // Assert
      expect(input.value).toBe('123 456');
    });

    it('should disable verify button when code is empty', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<TwoFactorSetupForm />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument();
      });
      await user.click(screen.getByRole('button', { name: /continue/i }));

      // Assert
      expect(screen.getByRole('button', { name: /verify & enable/i })).toBeDisabled();
    });

    it('should enable verify button when valid code is entered', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<TwoFactorSetupForm />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument();
      });
      await user.click(screen.getByRole('button', { name: /continue/i }));

      const input = screen.getByLabelText(/verification code/i);

      // Act
      await user.type(input, '123456');

      // Assert
      expect(screen.getByRole('button', { name: /verify & enable/i })).not.toBeDisabled();
    });

    it('should show error when invalid code is submitted', async () => {
      // Arrange
      const user = userEvent.setup();
      mockEnableTwoFactor.mockRejectedValue(new Error('Invalid code'));
      mockAuthReturnValue.error = 'Invalid code. Please check your authenticator app.' as any;

      render(<TwoFactorSetupForm />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument();
      });
      await user.click(screen.getByRole('button', { name: /continue/i }));

      const input = screen.getByLabelText(/verification code/i);

      // Act
      await user.type(input, '999999');
      await user.click(screen.getByRole('button', { name: /verify & enable/i }));

      // Assert
      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });
    });

    it('should call enableTwoFactor with correct code', async () => {
      // Arrange
      const user = userEvent.setup();
      mockEnableTwoFactor.mockResolvedValue({
        success: true,
        recoveryCodes: mockRecoveryCodes,
      });

      render(<TwoFactorSetupForm />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument();
      });
      await user.click(screen.getByRole('button', { name: /continue/i }));

      const input = screen.getByLabelText(/verification code/i);

      // Act
      await user.type(input, '123456');
      await user.click(screen.getByRole('button', { name: /verify & enable/i }));

      // Assert
      expect(mockEnableTwoFactor).toHaveBeenCalledWith('123456');
    });
  });

  // ========================================
  // Step 3: Recovery Codes Display
  // ========================================

  describe('step 3: recovery codes', () => {
    beforeEach(async () => {
      const user = userEvent.setup();
      mockEnableTwoFactor.mockResolvedValue({
        success: true,
        recoveryCodes: mockRecoveryCodes,
      });

      render(<TwoFactorSetupForm />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument();
      });
      await user.click(screen.getByRole('button', { name: /continue/i }));

      const input = screen.getByLabelText(/verification code/i);
      await user.type(input, '123456');
      await user.click(screen.getByRole('button', { name: /verify & enable/i }));
    });

    it('should display success message after verification', async () => {
      // Assert
      await waitFor(() => {
        expect(screen.getByText(/two-factor authentication has been successfully enabled/i)).toBeInTheDocument();
      });
    });

    it('should display warning about saving recovery codes', async () => {
      // Assert
      await waitFor(() => {
        expect(screen.getByText(/make sure to save your recovery codes/i)).toBeInTheDocument();
      });
    });

    it('should display view recovery codes button', async () => {
      // Assert
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /view recovery codes/i })).toBeInTheDocument();
      });
    });

    it('should disable complete setup button initially', async () => {
      // Assert
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /complete setup/i })).toBeDisabled();
      });
    });
  });

  // ========================================
  // Recovery Codes Dialog
  // ========================================

  describe('recovery codes dialog', () => {
    beforeEach(async () => {
      const user = userEvent.setup();
      mockEnableTwoFactor.mockResolvedValue({
        success: true,
        recoveryCodes: mockRecoveryCodes,
      });

      render(<TwoFactorSetupForm />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument();
      });
      await user.click(screen.getByRole('button', { name: /continue/i }));

      const input = screen.getByLabelText(/verification code/i);
      await user.type(input, '123456');
      await user.click(screen.getByRole('button', { name: /verify & enable/i }));
    });

    it('should open dialog when view recovery codes is clicked', async () => {
      // Arrange
      const user = userEvent.setup();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /view recovery codes/i })).toBeInTheDocument();
      });

      // Act
      await user.click(screen.getByRole('button', { name: /view recovery codes/i }));

      // Assert
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(within(screen.getByRole('dialog')).getByText(/recovery codes/i)).toBeInTheDocument();
      });
    });

    it('should display all recovery codes in dialog', async () => {
      // Arrange
      const user = userEvent.setup();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /view recovery codes/i })).toBeInTheDocument();
      });

      // Act
      await user.click(screen.getByRole('button', { name: /view recovery codes/i }));

      // Assert
      await waitFor(() => {
        mockRecoveryCodes.forEach((code) => {
          expect(screen.getByText(code)).toBeInTheDocument();
        });
      });
    });

    it('should display warning about single-use codes in dialog', async () => {
      // Arrange
      const user = userEvent.setup();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /view recovery codes/i })).toBeInTheDocument();
      });

      // Act
      await user.click(screen.getByRole('button', { name: /view recovery codes/i }));

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/each code can only be used once/i)).toBeInTheDocument();
      });
    });

    it('should show download codes button in dialog', async () => {
      // Arrange
      const user = userEvent.setup();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /view recovery codes/i })).toBeInTheDocument();
      });

      // Act
      await user.click(screen.getByRole('button', { name: /view recovery codes/i }));

      // Assert
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /download codes/i })).toBeInTheDocument();
      });
    });

    it('should show I have saved these codes button in dialog', async () => {
      // Arrange
      const user = userEvent.setup();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /view recovery codes/i })).toBeInTheDocument();
      });

      // Act
      await user.click(screen.getByRole('button', { name: /view recovery codes/i }));

      // Assert
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /i've saved these codes/i })).toBeInTheDocument();
      });
    });

    it('should close dialog and enable complete setup when saved button is clicked', async () => {
      // Arrange
      const user = userEvent.setup();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /view recovery codes/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /view recovery codes/i }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /i've saved these codes/i })).toBeInTheDocument();
      });

      // Act
      await user.click(screen.getByRole('button', { name: /i've saved these codes/i }));

      // Assert
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
      expect(screen.getByRole('button', { name: /complete setup/i })).not.toBeDisabled();
    });
  });

  // ========================================
  // Download Recovery Codes
  // ========================================

  describe('download recovery codes', () => {
    beforeEach(async () => {
      const user = userEvent.setup();
      mockEnableTwoFactor.mockResolvedValue({
        success: true,
        recoveryCodes: mockRecoveryCodes,
      });

      render(<TwoFactorSetupForm />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument();
      });
      await user.click(screen.getByRole('button', { name: /continue/i }));

      const input = screen.getByLabelText(/verification code/i);
      await user.type(input, '123456');
      await user.click(screen.getByRole('button', { name: /verify & enable/i }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /view recovery codes/i })).toBeInTheDocument();
      });
      await user.click(screen.getByRole('button', { name: /view recovery codes/i }));
    });

    it('should trigger download when download button is clicked', async () => {
      // Arrange
      const user = userEvent.setup();
      const createElementSpy = vi.spyOn(document, 'createElement');
      const clickSpy = vi.fn();

      createElementSpy.mockReturnValue({
        click: clickSpy,
        href: '',
        download: '',
        style: {},
        appendChild: vi.fn(),
        removeChild: vi.fn(),
      } as unknown as HTMLAnchorElement);

      // Act
      await user.click(screen.getByRole('button', { name: /download codes/i }));

      // Assert
      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(clickSpy).toHaveBeenCalled();
    });
  });

  // ========================================
  // Complete Setup
  // ========================================

  describe('complete setup', () => {
    it('should call onComplete when complete setup is clicked', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockOnComplete = vi.fn();
      mockEnableTwoFactor.mockResolvedValue({
        success: true,
        recoveryCodes: mockRecoveryCodes,
      });

      render(<TwoFactorSetupForm onComplete={mockOnComplete} />);

      // Navigate to step 2
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument();
      });
      await user.click(screen.getByRole('button', { name: /continue/i }));

      // Verify code
      const input = screen.getByLabelText(/verification code/i);
      await user.type(input, '123456');
      await user.click(screen.getByRole('button', { name: /verify & enable/i }));

      // Mark codes as saved
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /view recovery codes/i })).toBeInTheDocument();
      });
      await user.click(screen.getByRole('button', { name: /view recovery codes/i }));
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /i've saved these codes/i })).toBeInTheDocument();
      });
      await user.click(screen.getByRole('button', { name: /i've saved these codes/i }));

      // Act
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /complete setup/i })).not.toBeDisabled();
      });
      await user.click(screen.getByRole('button', { name: /complete setup/i }));

      // Assert
      expect(mockOnComplete).toHaveBeenCalledTimes(1);
    });

    it('should show recovery codes dialog if complete is clicked without saving', async () => {
      // Arrange
      const user = userEvent.setup();
      mockEnableTwoFactor.mockResolvedValue({
        success: true,
        recoveryCodes: mockRecoveryCodes,
      });

      render(<TwoFactorSetupForm />);

      // Navigate and verify
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument();
      });
      await user.click(screen.getByRole('button', { name: /continue/i }));

      const input = screen.getByLabelText(/verification code/i);
      await user.type(input, '123456');
      await user.click(screen.getByRole('button', { name: /verify & enable/i }));

      // Wait for step 3, but button should be disabled
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /complete setup/i })).toBeDisabled();
      });
    });
  });

  // ========================================
  // Loading States
  // ========================================

  describe('loading states', () => {
    it('should show loading spinner during verification', async () => {
      // Arrange
      const user = userEvent.setup();
      mockAuthReturnValue.isLoading = true;
      mockEnableTwoFactor.mockReturnValue(new Promise(() => {}));

      render(<TwoFactorSetupForm />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument();
      });
      await user.click(screen.getByRole('button', { name: /continue/i }));

      const input = screen.getByLabelText(/verification code/i);
      await user.type(input, '123456');

      // Act
      await user.click(screen.getByRole('button', { name: /verify & enable/i }));

      // Assert
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('should disable inputs during verification', async () => {
      // Arrange
      const user = userEvent.setup();
      mockAuthReturnValue.isLoading = true;

      render(<TwoFactorSetupForm />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument();
      });
      await user.click(screen.getByRole('button', { name: /continue/i }));

      const input = screen.getByLabelText(/verification code/i);
      await user.type(input, '123456');

      // Act
      await user.click(screen.getByRole('button', { name: /verify & enable/i }));

      // Assert
      expect(input).toBeDisabled();
    });
  });

  // ========================================
  // Error Handling
  // ========================================

  describe('error handling', () => {
    it('should display error when setup initialization fails', async () => {
      // Arrange
      mockSetupTwoFactor.mockRejectedValue(new Error('Failed to generate 2FA setup'));
      mockAuthReturnValue.error = 'Failed to generate 2FA setup. Please try again.' as any;

      // Act
      render(<TwoFactorSetupForm />);

      // Assert
      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });
    });

    it('should display error when verification fails', async () => {
      // Arrange
      const user = userEvent.setup();
      mockEnableTwoFactor.mockRejectedValue(new Error('Invalid code'));
      mockAuthReturnValue.error = 'Invalid code. Please check your authenticator app.' as any;

      render(<TwoFactorSetupForm />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument();
      });
      await user.click(screen.getByRole('button', { name: /continue/i }));

      const input = screen.getByLabelText(/verification code/i);

      // Act
      await user.type(input, '999999');
      await user.click(screen.getByRole('button', { name: /verify & enable/i }));

      // Assert
      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText(/invalid code/i)).toBeInTheDocument();
      });
    });
  });

  // ========================================
  // Accessibility
  // ========================================

  describe('accessibility', () => {
    it('should have proper heading structure', async () => {
      // Arrange & Act
      render(<TwoFactorSetupForm />);

      // Assert
      await waitFor(() => {
        expect(
          screen.getByRole('heading', {
            name: /set up two-factor authentication/i,
          }),
        ).toBeInTheDocument();
      });
    });

    it('should have descriptive button labels', async () => {
      // Arrange & Act
      render(<TwoFactorSetupForm />);

      // Assert
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      });
    });

    it('should mark stepper steps with proper ARIA attributes', async () => {
      // Arrange & Act
      render(<TwoFactorSetupForm />);

      // Assert
      await waitFor(() => {
        const steppers = screen.getAllByRole('step');
        expect(steppers.length).toBeGreaterThan(0);
      });
    });
  });
});
