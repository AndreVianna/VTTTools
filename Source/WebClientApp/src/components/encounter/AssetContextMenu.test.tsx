import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mockMonsterAsset } from '@/test-utils/assetMocks';
import { LabelPosition, LabelVisibility, type PlacedAsset } from '../../types/domain';
import { AssetContextMenu } from './AssetContextMenu';

describe('AssetContextMenu', () => {
  // Arrange: Create mock asset for tests
  const mockAsset: PlacedAsset = {
    id: '123',
    assetId: 'asset-123',
    asset: mockMonsterAsset({ id: 'asset-123', name: 'Test Asset' }),
    position: { x: 100, y: 100 },
    size: { width: 50, height: 50 },
    rotation: 0,
    layer: 'agents',
    index: 0,
    number: 1,
    name: 'Test Asset',
    isHidden: false,
    isLocked: false,
    labelVisibility: LabelVisibility.Default,
    labelPosition: LabelPosition.Default,
  };

  const defaultProps = {
    anchorPosition: { left: 100, top: 100 },
    open: true,
    onClose: vi.fn(),
    asset: mockAsset,
    onRename: vi.fn(),
    onUpdateDisplay: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Menu Rendering', () => {
    it('should render menu items when open', () => {
      // Arrange
      render(<AssetContextMenu {...defaultProps} />);

      // Assert
      expect(screen.getByRole('menuitem', { name: /rename/i })).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: /display label/i })).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: /label position/i })).toBeInTheDocument();
    });

    it('should not render menu items when closed', () => {
      // Arrange
      render(<AssetContextMenu {...defaultProps} open={false} />);

      // Assert
      expect(screen.queryByRole('menuitem', { name: /rename/i })).not.toBeInTheDocument();
    });

    it('should not render when asset is null', () => {
      // Arrange
      render(<AssetContextMenu {...defaultProps} asset={null} />);

      // Assert
      expect(screen.queryByRole('menuitem')).not.toBeInTheDocument();
    });
  });

  describe('Rename Functionality', () => {
    it('should show rename input when rename menu item is clicked', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<AssetContextMenu {...defaultProps} />);

      // Act
      await user.click(screen.getByRole('menuitem', { name: /rename/i }));

      // Assert
      expect(screen.getByPlaceholderText('Asset name')).toBeInTheDocument();
    });

    it('should pre-populate rename input with current asset name', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<AssetContextMenu {...defaultProps} />);

      // Act
      await user.click(screen.getByRole('menuitem', { name: /rename/i }));

      // Assert
      const input = screen.getByPlaceholderText('Asset name');
      expect(input).toHaveValue('Test Asset');
    });

    it('should validate and show error when name is empty', async () => {
      // Arrange
      const user = userEvent.setup();
      const onRename = vi.fn();
      render(<AssetContextMenu {...defaultProps} onRename={onRename} />);

      // Act
      await user.click(screen.getByRole('menuitem', { name: /rename/i }));
      const input = screen.getByPlaceholderText('Asset name');
      await user.clear(input);
      await user.tab();

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/cannot be empty/i)).toBeInTheDocument();
      });
      expect(onRename).not.toHaveBeenCalled();
    });

    it('should limit input to 128 characters via maxLength attribute', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<AssetContextMenu {...defaultProps} />);

      // Act
      await user.click(screen.getByRole('menuitem', { name: /rename/i }));
      const input = screen.getByPlaceholderText('Asset name');

      // Assert - input has maxLength attribute to prevent exceeding 128 chars
      expect(input).toHaveAttribute('maxLength', '128');
    });

    it('should call onRename and onClose when valid name is submitted on blur', async () => {
      // Arrange
      const user = userEvent.setup();
      const onRename = vi.fn().mockResolvedValue(undefined);
      const onClose = vi.fn();
      render(<AssetContextMenu {...defaultProps} onRename={onRename} onClose={onClose} />);

      // Act
      await user.click(screen.getByRole('menuitem', { name: /rename/i }));
      const input = screen.getByPlaceholderText('Asset name');
      await user.clear(input);
      await user.type(input, 'New Name');
      await user.tab();

      // Assert
      await waitFor(() => {
        expect(onRename).toHaveBeenCalledWith('123', 'New Name');
      });
      expect(onClose).toHaveBeenCalled();
    });

    it('should call onRename when Enter key is pressed', async () => {
      // Arrange
      const user = userEvent.setup();
      const onRename = vi.fn().mockResolvedValue(undefined);
      const onClose = vi.fn();
      render(<AssetContextMenu {...defaultProps} onRename={onRename} onClose={onClose} />);

      // Act
      await user.click(screen.getByRole('menuitem', { name: /rename/i }));
      const input = screen.getByPlaceholderText('Asset name');
      await user.clear(input);
      await user.type(input, 'Keyboard Name{Enter}');

      // Assert
      await waitFor(() => {
        expect(onRename).toHaveBeenCalledWith('123', 'Keyboard Name');
      });
    });

    it('should cancel rename when Escape key is pressed', async () => {
      // Arrange
      const user = userEvent.setup();
      const onRename = vi.fn();
      render(<AssetContextMenu {...defaultProps} onRename={onRename} />);

      // Act
      await user.click(screen.getByRole('menuitem', { name: /rename/i }));
      const input = screen.getByPlaceholderText('Asset name');
      await user.type(input, '{Escape}');

      // Assert
      expect(screen.queryByPlaceholderText('Asset name')).not.toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: /rename/i })).toBeInTheDocument();
      expect(onRename).not.toHaveBeenCalled();
    });

    it('should show error when rename API call fails', async () => {
      // Arrange
      const user = userEvent.setup();
      const onRename = vi.fn().mockRejectedValue(new Error('API Error'));
      render(<AssetContextMenu {...defaultProps} onRename={onRename} />);

      // Act
      await user.click(screen.getByRole('menuitem', { name: /rename/i }));
      const input = screen.getByPlaceholderText('Asset name');
      await user.clear(input);
      await user.type(input, 'New Name');
      await user.tab();

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/failed to rename/i)).toBeInTheDocument();
      });
    });
  });

  describe('Display Label Submenu', () => {
    it('should show display label options when submenu is clicked', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<AssetContextMenu {...defaultProps} />);

      // Act
      await user.click(screen.getByRole('menuitem', { name: /display label/i }));

      // Assert
      expect(screen.getByRole('menuitem', { name: /always/i })).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: /onhover/i })).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: /never/i })).toBeInTheDocument();
    });

    it('should show checkmark for current label visibility setting', async () => {
      // Arrange
      const user = userEvent.setup();
      const assetWithAlwaysLabel: PlacedAsset = {
        ...mockAsset,
        labelVisibility: LabelVisibility.Always,
      };
      render(<AssetContextMenu {...defaultProps} asset={assetWithAlwaysLabel} />);

      // Act
      await user.click(screen.getByRole('menuitem', { name: /display label/i }));

      // Assert
      const alwaysItem = screen.getByRole('menuitem', { name: /always/i });
      expect(alwaysItem.querySelector('svg')).toBeInTheDocument();
    });

    it('should call onUpdateDisplay when display label option is selected', async () => {
      // Arrange
      const user = userEvent.setup();
      const onUpdateDisplay = vi.fn().mockResolvedValue(undefined);
      const onClose = vi.fn();
      render(<AssetContextMenu {...defaultProps} onUpdateDisplay={onUpdateDisplay} onClose={onClose} />);

      // Act
      await user.click(screen.getByRole('menuitem', { name: /display label/i }));
      await user.click(screen.getByRole('menuitem', { name: /always/i }));

      // Assert
      await waitFor(() => {
        expect(onUpdateDisplay).toHaveBeenCalledWith('123', LabelVisibility.Always, undefined);
      });
      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('Label Position Submenu', () => {
    it('should show label position options when submenu is clicked', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<AssetContextMenu {...defaultProps} />);

      // Act
      await user.click(screen.getByRole('menuitem', { name: /label position/i }));

      // Assert
      expect(screen.getByRole('menuitem', { name: /top/i })).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: /middle/i })).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: /bottom/i })).toBeInTheDocument();
    });

    it('should show checkmark for current label position setting', async () => {
      // Arrange
      const user = userEvent.setup();
      const assetWithTopLabel: PlacedAsset = {
        ...mockAsset,
        labelPosition: LabelPosition.Top,
      };
      render(<AssetContextMenu {...defaultProps} asset={assetWithTopLabel} />);

      // Act
      await user.click(screen.getByRole('menuitem', { name: /label position/i }));

      // Assert
      const topItem = screen.getByRole('menuitem', { name: /top/i });
      expect(topItem.querySelector('svg')).toBeInTheDocument();
    });

    it('should call onUpdateDisplay when label position option is selected', async () => {
      // Arrange
      const user = userEvent.setup();
      const onUpdateDisplay = vi.fn().mockResolvedValue(undefined);
      const onClose = vi.fn();
      render(<AssetContextMenu {...defaultProps} onUpdateDisplay={onUpdateDisplay} onClose={onClose} />);

      // Act
      await user.click(screen.getByRole('menuitem', { name: /label position/i }));
      await user.click(screen.getByRole('menuitem', { name: /top/i }));

      // Assert
      await waitFor(() => {
        expect(onUpdateDisplay).toHaveBeenCalledWith('123', undefined, LabelPosition.Top);
      });
      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('Menu Close Behavior', () => {
    it('should call onClose when escape key is pressed', async () => {
      // Arrange
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(<AssetContextMenu {...defaultProps} onClose={onClose} />);

      // Act - press Escape on the menu
      await user.keyboard('{Escape}');

      // Assert
      await waitFor(() => {
        expect(onClose).toHaveBeenCalled();
      });
    });

    it('should close submenu when escape is pressed after opening display label submenu', async () => {
      // Arrange
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(<AssetContextMenu {...defaultProps} onClose={onClose} />);

      // Act
      await user.click(screen.getByRole('menuitem', { name: /display label/i }));
      // Verify submenu is open
      expect(screen.getByRole('menuitem', { name: /always/i })).toBeInTheDocument();
      await user.keyboard('{Escape}');

      // Assert - onClose is called when submenu closes
      await waitFor(() => {
        expect(onClose).toHaveBeenCalled();
      });
    });
  });
});
