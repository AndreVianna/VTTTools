import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RecoveryCodesManager } from './RecoveryCodesManager';

// Mock useAuth hook
const mockGenerateRecoveryCodes = vi.fn<() => Promise<unknown>>();
let mockAuthError: string | null | undefined = null;

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    generateRecoveryCodes: mockGenerateRecoveryCodes,
    user: null,
    isLoading: false,
    error: mockAuthError,
  }),
}));

describe('RecoveryCodesManager', () => {
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
    mockAuthError = null;
  });

  // ========================================
  // Initial Rendering
  // ========================================

  describe('rendering', () => {
    it('should display page title', () => {
      // Arrange & Act
      render(<RecoveryCodesManager />);

      // Assert
      expect(screen.getByRole('heading', { name: /recovery codes management/i })).toBeInTheDocument();
    });

    it('should display description text', () => {
      // Arrange & Act
      render(<RecoveryCodesManager />);

      // Assert
      expect(screen.getByText(/recovery codes are used to access your account/i)).toBeInTheDocument();
    });

    it('should display security warning', () => {
      // Arrange & Act
      render(<RecoveryCodesManager />);

      // Assert
      expect(screen.getByText(/each recovery code can only be used once/i)).toBeInTheDocument();
    });

    it('should display when to generate new codes information', () => {
      // Arrange & Act
      render(<RecoveryCodesManager />);

      // Assert
      expect(screen.getByText(/when to generate new codes/i)).toBeInTheDocument();
    });

    it('should display generate new recovery codes button', () => {
      // Arrange & Act
      render(<RecoveryCodesManager />);

      // Assert
      expect(screen.getByRole('button', { name: /generate new recovery codes/i })).toBeInTheDocument();
    });

    it('should display close button when onClose is provided', () => {
      // Arrange
      const mockOnClose = vi.fn<() => void>();

      // Act
      render(<RecoveryCodesManager onClose={mockOnClose} />);

      // Assert
      expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
    });
  });

  // ========================================
  // Generate New Codes - Confirmation Dialog
  // ========================================

  describe('generate new codes confirmation', () => {
    it('should open confirmation dialog when generate button is clicked', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<RecoveryCodesManager />);

      // Act
      await user.click(screen.getByRole('button', { name: /generate new recovery codes/i }));

      // Assert
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(within(screen.getByRole('dialog')).getByText(/generate new recovery codes\?/i)).toBeInTheDocument();
      });
    });

    it('should display warning in confirmation dialog', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<RecoveryCodesManager />);

      // Act
      await user.click(screen.getByRole('button', { name: /generate new recovery codes/i }));

      // Assert
      await waitFor(() => {
        expect(
          screen.getByText(/generating new recovery codes will invalidate all of your existing/i),
        ).toBeInTheDocument();
      });
    });

    it('should display cannot be undone message', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<RecoveryCodesManager />);

      // Act
      await user.click(screen.getByRole('button', { name: /generate new recovery codes/i }));

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/this action cannot be undone/i)).toBeInTheDocument();
      });
    });

    it('should show cancel and generate buttons in dialog', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<RecoveryCodesManager />);

      // Act
      await user.click(screen.getByRole('button', { name: /generate new recovery codes/i }));

      // Assert
      await waitFor(() => {
        const dialog = screen.getByRole('dialog');
        expect(within(dialog).getByRole('button', { name: /cancel/i })).toBeInTheDocument();
        expect(within(dialog).getByRole('button', { name: /generate new codes/i })).toBeInTheDocument();
      });
    });

    it('should close dialog when cancel is clicked', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<RecoveryCodesManager />);

      await user.click(screen.getByRole('button', { name: /generate new recovery codes/i }));

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Act
      await user.click(
        within(screen.getByRole('dialog')).getByRole('button', {
          name: /cancel/i,
        }),
      );

      // Assert
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });
  });

  // ========================================
  // Generate New Codes - Execution
  // ========================================

  describe('generate new codes execution', () => {
    it('should call generateRecoveryCodes when confirmed', async () => {
      // Arrange
      const user = userEvent.setup();
      mockGenerateRecoveryCodes.mockResolvedValue({
        recoveryCodes: mockRecoveryCodes,
      });
      render(<RecoveryCodesManager />);

      await user.click(screen.getByRole('button', { name: /generate new recovery codes/i }));

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Act
      await user.click(
        within(screen.getByRole('dialog')).getByRole('button', {
          name: /generate new codes/i,
        }),
      );

      // Assert
      await waitFor(() => {
        expect(mockGenerateRecoveryCodes).toHaveBeenCalledTimes(1);
      });
    });

    it('should display success message after generation', async () => {
      // Arrange
      const user = userEvent.setup();
      mockGenerateRecoveryCodes.mockResolvedValue({
        recoveryCodes: mockRecoveryCodes,
      });
      render(<RecoveryCodesManager />);

      await user.click(screen.getByRole('button', { name: /generate new recovery codes/i }));
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Act
      await user.click(
        within(screen.getByRole('dialog')).getByRole('button', {
          name: /generate new codes/i,
        }),
      );

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/new recovery codes have been generated successfully/i)).toBeInTheDocument();
      });
    });

    it('should display all generated recovery codes', async () => {
      // Arrange
      const user = userEvent.setup();
      mockGenerateRecoveryCodes.mockResolvedValue({
        recoveryCodes: mockRecoveryCodes,
      });
      render(<RecoveryCodesManager />);

      await user.click(screen.getByRole('button', { name: /generate new recovery codes/i }));
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Act
      await user.click(
        within(screen.getByRole('dialog')).getByRole('button', {
          name: /generate new codes/i,
        }),
      );

      // Assert
      await waitFor(() => {
        mockRecoveryCodes.forEach((code) => {
          expect(screen.getByText(code)).toBeInTheDocument();
        });
      });
    });

    it('should display warning about old codes being invalidated', async () => {
      // Arrange
      const user = userEvent.setup();
      mockGenerateRecoveryCodes.mockResolvedValue({
        recoveryCodes: mockRecoveryCodes,
      });
      render(<RecoveryCodesManager />);

      await user.click(screen.getByRole('button', { name: /generate new recovery codes/i }));
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Act
      await user.click(
        within(screen.getByRole('dialog')).getByRole('button', {
          name: /generate new codes/i,
        }),
      );

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/your old recovery codes are no longer valid/i)).toBeInTheDocument();
      });
    });

    it('should close confirmation dialog after successful generation', async () => {
      // Arrange
      const user = userEvent.setup();
      mockGenerateRecoveryCodes.mockResolvedValue({
        recoveryCodes: mockRecoveryCodes,
      });
      render(<RecoveryCodesManager />);

      await user.click(screen.getByRole('button', { name: /generate new recovery codes/i }));
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Act
      await user.click(
        within(screen.getByRole('dialog')).getByRole('button', {
          name: /generate new codes/i,
        }),
      );

      // Assert
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });
  });

  // ========================================
  // Download Recovery Codes
  // ========================================

  describe('download recovery codes', () => {
    it('should show download button after codes are generated', async () => {
      // Arrange
      const user = userEvent.setup();
      mockGenerateRecoveryCodes.mockResolvedValue({
        recoveryCodes: mockRecoveryCodes,
      });
      render(<RecoveryCodesManager />);

      await user.click(screen.getByRole('button', { name: /generate new recovery codes/i }));
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
      await user.click(
        within(screen.getByRole('dialog')).getByRole('button', {
          name: /generate new codes/i,
        }),
      );

      // Assert
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /download codes/i })).toBeInTheDocument();
      });
    });

    it('should trigger download when download button is clicked', async () => {
      // Arrange
      const user = userEvent.setup();
      mockGenerateRecoveryCodes.mockResolvedValue({
        recoveryCodes: mockRecoveryCodes,
      });
      const createElementSpy = vi.spyOn(document, 'createElement');
      const clickSpy = vi.fn<() => void>();

      createElementSpy.mockReturnValue({
        click: clickSpy,
        href: '',
        download: '',
        style: {},
      } as unknown as HTMLAnchorElement);

      render(<RecoveryCodesManager />);

      await user.click(screen.getByRole('button', { name: /generate new recovery codes/i }));
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
      await user.click(
        within(screen.getByRole('dialog')).getByRole('button', {
          name: /generate new codes/i,
        }),
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /download codes/i })).toBeInTheDocument();
      });

      // Act
      await user.click(screen.getByRole('button', { name: /download codes/i }));

      // Assert
      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(clickSpy).toHaveBeenCalled();
    });

    it('should create text file with proper format', async () => {
      // Arrange
      const user = userEvent.setup();
      mockGenerateRecoveryCodes.mockResolvedValue({
        recoveryCodes: mockRecoveryCodes,
      });
      const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');

      vi.spyOn(document, 'createElement').mockImplementation((tag) => {
        if (tag === 'a') {
          return {
            click: vi.fn<() => void>(),
            href: '',
            download: '',
            style: {},
          } as unknown as HTMLAnchorElement;
        }
        return document.createElement(tag);
      });

      render(<RecoveryCodesManager />);

      await user.click(screen.getByRole('button', { name: /generate new recovery codes/i }));
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
      await user.click(
        within(screen.getByRole('dialog')).getByRole('button', {
          name: /generate new codes/i,
        }),
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /download codes/i })).toBeInTheDocument();
      });

      // Act
      await user.click(screen.getByRole('button', { name: /download codes/i }));

      // Assert
      expect(createObjectURLSpy).toHaveBeenCalled();
    });
  });

  // ========================================
  // Loading States
  // ========================================

  describe('loading states', () => {
    it('should disable generate button during generation', async () => {
      // Arrange
      const user = userEvent.setup();
      mockGenerateRecoveryCodes.mockReturnValue(new Promise(() => {})); // Never resolves

      render(<RecoveryCodesManager />);

      await user.click(screen.getByRole('button', { name: /generate new recovery codes/i }));
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Act
      await user.click(
        within(screen.getByRole('dialog')).getByRole('button', {
          name: /generate new codes/i,
        }),
      );

      // Assert
      await waitFor(() => {
        expect(
          within(screen.getByRole('dialog')).getByRole('button', {
            name: /generate new codes/i,
          }),
        ).toBeDisabled();
      });
    });

    it('should show loading spinner during generation', async () => {
      // Arrange
      const user = userEvent.setup();
      mockGenerateRecoveryCodes.mockReturnValue(new Promise(() => {}));

      render(<RecoveryCodesManager />);

      await user.click(screen.getByRole('button', { name: /generate new recovery codes/i }));
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Act
      await user.click(
        within(screen.getByRole('dialog')).getByRole('button', {
          name: /generate new codes/i,
        }),
      );

      // Assert
      await waitFor(() => {
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
      });
    });

    it('should disable main generate button during generation', async () => {
      // Arrange
      const user = userEvent.setup();
      mockGenerateRecoveryCodes.mockReturnValue(new Promise(() => {}));

      render(<RecoveryCodesManager />);

      const mainButton = screen.getByRole('button', {
        name: /generate new recovery codes/i,
      });
      await user.click(mainButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Act
      await user.click(
        within(screen.getByRole('dialog')).getByRole('button', {
          name: /generate new codes/i,
        }),
      );

      // Assert
      await waitFor(() => {
        expect(mainButton).toBeDisabled();
      });
    });
  });

  // ========================================
  // Error Handling
  // ========================================

  describe('error handling', () => {
    it('should display error when generation fails', async () => {
      // Arrange
      const user = userEvent.setup();
      mockGenerateRecoveryCodes.mockRejectedValue(new Error('Failed to generate codes'));
      mockAuthError = 'Failed to generate codes. Please try again.';

      render(<RecoveryCodesManager />);

      await user.click(screen.getByRole('button', { name: /generate new recovery codes/i }));
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Act
      await user.click(
        within(screen.getByRole('dialog')).getByRole('button', {
          name: /generate new codes/i,
        }),
      );

      // Assert
      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText(/failed to generate codes/i)).toBeInTheDocument();
      });
    });

    it('should keep dialog open on error', async () => {
      // Arrange
      const user = userEvent.setup();
      mockGenerateRecoveryCodes.mockRejectedValue(new Error('Network error'));
      mockAuthError = 'Connection error. Please try again.';

      render(<RecoveryCodesManager />);

      await user.click(screen.getByRole('button', { name: /generate new recovery codes/i }));
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Act
      await user.click(
        within(screen.getByRole('dialog')).getByRole('button', {
          name: /generate new codes/i,
        }),
      );

      // Assert
      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should allow retry after error', async () => {
      // Arrange
      const user = userEvent.setup();
      mockGenerateRecoveryCodes
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({ recoveryCodes: mockRecoveryCodes });

      render(<RecoveryCodesManager />);

      await user.click(screen.getByRole('button', { name: /generate new recovery codes/i }));
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // First attempt fails
      await user.click(
        within(screen.getByRole('dialog')).getByRole('button', {
          name: /generate new codes/i,
        }),
      );
      await waitFor(() => {
        expect(mockGenerateRecoveryCodes).toHaveBeenCalledTimes(1);
      });

      // Act - Retry
      await user.click(
        within(screen.getByRole('dialog')).getByRole('button', {
          name: /generate new codes/i,
        }),
      );

      // Assert
      await waitFor(() => {
        expect(mockGenerateRecoveryCodes).toHaveBeenCalledTimes(2);
      });
    });
  });

  // ========================================
  // Close Functionality
  // ========================================

  describe('close functionality', () => {
    it('should call onClose when close button is clicked', async () => {
      // Arrange
      const user = userEvent.setup();
      const mockOnClose = vi.fn<() => void>();
      render(<RecoveryCodesManager onClose={mockOnClose} />);

      // Act
      await user.click(screen.getByRole('button', { name: /close/i }));

      // Assert
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  // ========================================
  // Information Display
  // ========================================

  describe('information display', () => {
    it('should display recovery codes in grid layout', async () => {
      // Arrange
      const user = userEvent.setup();
      mockGenerateRecoveryCodes.mockResolvedValue({
        recoveryCodes: mockRecoveryCodes,
      });
      render(<RecoveryCodesManager />);

      await user.click(screen.getByRole('button', { name: /generate new recovery codes/i }));
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Act
      await user.click(
        within(screen.getByRole('dialog')).getByRole('button', {
          name: /generate new codes/i,
        }),
      );

      // Assert
      await waitFor(() => {
        const codes = screen.getAllByText(/^[A-Z0-9]+$/);
        expect(codes.length).toBe(mockRecoveryCodes.length);
      });
    });

    it('should use monospace font for recovery codes', async () => {
      // Arrange
      const user = userEvent.setup();
      mockGenerateRecoveryCodes.mockResolvedValue({
        recoveryCodes: mockRecoveryCodes,
      });
      render(<RecoveryCodesManager />);

      await user.click(screen.getByRole('button', { name: /generate new recovery codes/i }));
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Act
      await user.click(
        within(screen.getByRole('dialog')).getByRole('button', {
          name: /generate new codes/i,
        }),
      );

      // Assert
      await waitFor(() => {
        const firstCode = mockRecoveryCodes[0];
        if (firstCode) {
          const codeElement = screen.getByText(firstCode);
          expect(codeElement).toHaveStyle({ fontFamily: 'monospace' });
        }
      });
    });
  });

  // ========================================
  // Accessibility
  // ========================================

  describe('accessibility', () => {
    it('should have proper heading structure', () => {
      // Arrange & Act
      render(<RecoveryCodesManager />);

      // Assert
      expect(screen.getByRole('heading', { name: /recovery codes management/i })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /recovery codes/i })).toBeInTheDocument();
    });

    it('should have descriptive button labels', () => {
      // Arrange & Act
      render(<RecoveryCodesManager />);

      // Assert
      expect(screen.getByRole('button', { name: /generate new recovery codes/i })).toBeInTheDocument();
    });

    it('should use alert role for warnings', () => {
      // Arrange & Act
      render(<RecoveryCodesManager />);

      // Assert
      const warningAlert = screen.getByText(/important security information/i).closest('[role="alert"]');
      expect(warningAlert).toBeInTheDocument();
    });

    it('should announce errors to screen readers', async () => {
      // Arrange
      const user = userEvent.setup();
      mockGenerateRecoveryCodes.mockRejectedValue(new Error('Failed'));
      mockAuthError = 'Failed to generate codes. Please try again.';

      render(<RecoveryCodesManager />);

      await user.click(screen.getByRole('button', { name: /generate new recovery codes/i }));
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Act
      await user.click(
        within(screen.getByRole('dialog')).getByRole('button', {
          name: /generate new codes/i,
        }),
      );

      // Assert
      await waitFor(() => {
        const errorAlert = screen.getByRole('alert');
        expect(errorAlert).toBeInTheDocument();
      });
    });

    it('should have close button with accessible label in dialog', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<RecoveryCodesManager />);

      // Act
      await user.click(screen.getByRole('button', { name: /generate new recovery codes/i }));

      // Assert
      await waitFor(() => {
        const closeButton = within(screen.getByRole('dialog')).getByRole('button', { name: /close/i });
        expect(closeButton).toBeInTheDocument();
      });
    });
  });

  // ========================================
  // Edge Cases
  // ========================================

  describe('edge cases', () => {
    it('should handle empty recovery codes array', async () => {
      // Arrange
      const user = userEvent.setup();
      mockGenerateRecoveryCodes.mockResolvedValue({ recoveryCodes: [] });

      render(<RecoveryCodesManager />);

      await user.click(screen.getByRole('button', { name: /generate new recovery codes/i }));
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Act
      await user.click(
        within(screen.getByRole('dialog')).getByRole('button', {
          name: /generate new codes/i,
        }),
      );

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/new recovery codes have been generated successfully/i)).toBeInTheDocument();
      });
    });

    it('should handle rapid clicks on generate button', async () => {
      // Arrange
      const user = userEvent.setup();
      mockGenerateRecoveryCodes.mockResolvedValue({
        recoveryCodes: mockRecoveryCodes,
      });

      render(<RecoveryCodesManager />);

      await user.click(screen.getByRole('button', { name: /generate new recovery codes/i }));
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      const generateButton = within(screen.getByRole('dialog')).getByRole('button', { name: /generate new codes/i });

      // Act - Click multiple times rapidly
      await user.click(generateButton);
      await user.click(generateButton);
      await user.click(generateButton);

      // Assert - Should only call once
      await waitFor(() => {
        expect(mockGenerateRecoveryCodes).toHaveBeenCalledTimes(1);
      });
    });
  });
});
