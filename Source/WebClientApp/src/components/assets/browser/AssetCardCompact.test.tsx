import { createTheme, ThemeProvider } from '@mui/material/styles';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AssetKind, ResourceRole, StatValueType, type Asset } from '@/types/domain';
import { AssetCardCompact, type AssetCardCompactProps } from './AssetCardCompact';

vi.mock('@/components/common/ResourceImage', () => ({
  ResourceImage: ({ alt, fallback }: { alt: string; fallback: React.ReactNode }) => (
    <div data-testid="resource-image" aria-label={alt}>
      {fallback}
    </div>
  ),
}));

vi.mock('@/utils/assetHelpers', () => ({
  getDefaultAssetImage: (asset: Asset) => asset.tokens[0] ?? asset.portrait ?? null,
}));

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = createTheme({ palette: { mode: 'light' } });
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};
TestWrapper.displayName = 'TestWrapper';

describe('AssetCardCompact', () => {
  const mockAsset: Asset = {
    id: 'asset-1',
    name: 'Goblin Warrior',
    description: 'A fierce goblin',
    classification: {
      kind: AssetKind.Creature,
      category: 'Humanoid',
      type: 'Goblin',
      subtype: null,
    },
    thumbnail: null,
    portrait: null,
    size: { width: 1, height: 1 },
    tokens: [
      {
        id: 'token-1',
        role: ResourceRole.Token,
        path: '/tokens/goblin.png',
        contentType: 'image/png',
        fileName: 'goblin.png',
        fileSize: 1024,
        dimensions: { width: 128, height: 128 },
        duration: '0',
      },
    ],
    statBlocks: {
      0: {
        HP: { key: 'HP', value: '12', type: StatValueType.Number },
        CR: { key: 'CR', value: '1/4', type: StatValueType.Text },
      },
    },
    tags: ['monster'],
    ownerId: 'user-1',
    isPublished: true,
    isPublic: false,
  };

  const multiTokenAsset: Asset = {
    ...mockAsset,
    id: 'asset-2',
    name: 'Dragon',
    tokens: [
      {
        id: 'token-1',
        role: ResourceRole.Token,
        path: '/tokens/dragon1.png',
        contentType: 'image/png',
        fileName: 'dragon1.png',
        fileSize: 1024,
        dimensions: { width: 256, height: 256 },
        duration: '0',
      },
      {
        id: 'token-2',
        role: ResourceRole.Token,
        path: '/tokens/dragon2.png',
        contentType: 'image/png',
        fileName: 'dragon2.png',
        fileSize: 1024,
        dimensions: { width: 256, height: 256 },
        duration: '0',
      },
      {
        id: 'token-3',
        role: ResourceRole.Token,
        path: '/tokens/dragon3.png',
        contentType: 'image/png',
        fileName: 'dragon3.png',
        fileSize: 1024,
        dimensions: { width: 256, height: 256 },
        duration: '0',
      },
    ],
  };

  const defaultProps: AssetCardCompactProps = {
    asset: mockAsset,
    isSelected: false,
    isMultiSelectMode: false,
    isChecked: false,
    onClick: vi.fn(),
    onDoubleClick: vi.fn(),
    onCheckChange: vi.fn(),
    size: 'small',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('rendering', () => {
    it('should render asset name', () => {
      render(
        <TestWrapper>
          <AssetCardCompact {...defaultProps} />
        </TestWrapper>,
      );

      expect(screen.getByText('Goblin Warrior')).toBeInTheDocument();
    });

    it('should render classification type', () => {
      render(
        <TestWrapper>
          <AssetCardCompact {...defaultProps} />
        </TestWrapper>,
      );

      expect(screen.getByText('Goblin')).toBeInTheDocument();
    });

    it('should render classification category when type is not available', () => {
      const assetWithoutType = {
        ...mockAsset,
        classification: {
          ...mockAsset.classification,
          type: '',
        },
      };

      render(
        <TestWrapper>
          <AssetCardCompact {...defaultProps} asset={assetWithoutType} />
        </TestWrapper>,
      );

      expect(screen.getByText('Humanoid')).toBeInTheDocument();
    });

    it('should display CR stat badge when available', () => {
      render(
        <TestWrapper>
          <AssetCardCompact {...defaultProps} />
        </TestWrapper>,
      );

      expect(screen.getByText('1/4')).toBeInTheDocument();
    });

    it('should display HP stat badge when CR is not available', () => {
      const assetWithHPOnly = {
        ...mockAsset,
        statBlocks: {
          0: {
            HP: { key: 'HP', value: '50', type: StatValueType.Number },
          },
        },
      };

      render(
        <TestWrapper>
          <AssetCardCompact {...defaultProps} asset={assetWithHPOnly} />
        </TestWrapper>,
      );

      expect(screen.getByText('50')).toBeInTheDocument();
    });

    it('should not display stat badge when no stats available', () => {
      const assetWithoutStats = {
        ...mockAsset,
        statBlocks: {},
      };

      render(
        <TestWrapper>
          <AssetCardCompact {...defaultProps} asset={assetWithoutStats} />
        </TestWrapper>,
      );

      const chips = screen.queryAllByRole('button');
      const statChips = chips.filter((chip) => chip.textContent?.match(/^\d+$/));
      expect(statChips.length).toBe(0);
    });

    it('should render small size card', () => {
      render(
        <TestWrapper>
          <AssetCardCompact {...defaultProps} size="small" />
        </TestWrapper>,
      );

      expect(screen.getByText('Goblin Warrior')).toBeInTheDocument();
    });

    it('should render large size card', () => {
      render(
        <TestWrapper>
          <AssetCardCompact {...defaultProps} size="large" />
        </TestWrapper>,
      );

      expect(screen.getByText('Goblin Warrior')).toBeInTheDocument();
    });

    it('should show token count badge when multiple tokens exist', () => {
      render(
        <TestWrapper>
          <AssetCardCompact {...defaultProps} asset={multiTokenAsset} />
        </TestWrapper>,
      );

      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('should not show token count badge when only one token exists', () => {
      render(
        <TestWrapper>
          <AssetCardCompact {...defaultProps} />
        </TestWrapper>,
      );

      const badges = screen.queryAllByText('1');
      expect(badges.length).toBe(0);
    });
  });

  describe('selection states', () => {
    it('should show selected state', () => {
      const { container } = render(
        <TestWrapper>
          <AssetCardCompact {...defaultProps} isSelected={true} />
        </TestWrapper>,
      );

      const card = container.querySelector('.MuiCard-root');
      expect(card).toBeInTheDocument();
    });

    it('should not show selected state by default', () => {
      const { container } = render(
        <TestWrapper>
          <AssetCardCompact {...defaultProps} isSelected={false} />
        </TestWrapper>,
      );

      const card = container.querySelector('.MuiCard-root');
      expect(card).toBeInTheDocument();
    });

    it('should show checkbox in multi-select mode', () => {
      render(
        <TestWrapper>
          <AssetCardCompact {...defaultProps} isMultiSelectMode={true} />
        </TestWrapper>,
      );

      expect(screen.getByRole('checkbox')).toBeInTheDocument();
    });

    it('should hide checkbox when not in multi-select mode', () => {
      render(
        <TestWrapper>
          <AssetCardCompact {...defaultProps} isMultiSelectMode={false} />
        </TestWrapper>,
      );

      expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    });

    it('should show checked checkbox when isChecked is true', () => {
      render(
        <TestWrapper>
          <AssetCardCompact {...defaultProps} isMultiSelectMode={true} isChecked={true} />
        </TestWrapper>,
      );

      const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
      expect(checkbox.checked).toBe(true);
    });

    it('should show unchecked checkbox when isChecked is false', () => {
      render(
        <TestWrapper>
          <AssetCardCompact {...defaultProps} isMultiSelectMode={true} isChecked={false} />
        </TestWrapper>,
      );

      const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
      expect(checkbox.checked).toBe(false);
    });
  });

  describe('interactions', () => {
    it('should call onClick when card is clicked', async () => {
      const user = userEvent.setup({ delay: null });
      const onClick = vi.fn();

      render(
        <TestWrapper>
          <AssetCardCompact {...defaultProps} onClick={onClick} />
        </TestWrapper>,
      );

      const card = screen.getByText('Goblin Warrior').closest('.MuiCard-root');
      if (card) {
        await user.click(card);
        expect(onClick).toHaveBeenCalled();
      }
    });

    it('should call onDoubleClick when card is double-clicked', async () => {
      const user = userEvent.setup({ delay: null });
      const onDoubleClick = vi.fn();

      render(
        <TestWrapper>
          <AssetCardCompact {...defaultProps} onDoubleClick={onDoubleClick} />
        </TestWrapper>,
      );

      const card = screen.getByText('Goblin Warrior').closest('.MuiCard-root');
      if (card) {
        await user.dblClick(card);
        expect(onDoubleClick).toHaveBeenCalled();
      }
    });

    it('should call onCheckChange when checkbox is clicked', async () => {
      const user = userEvent.setup({ delay: null });
      const onCheckChange = vi.fn();

      render(
        <TestWrapper>
          <AssetCardCompact {...defaultProps} isMultiSelectMode={true} onCheckChange={onCheckChange} />
        </TestWrapper>,
      );

      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);

      expect(onCheckChange).toHaveBeenCalledWith(true);
    });

    it('should toggle checkbox state on click', async () => {
      const user = userEvent.setup({ delay: null });
      const onCheckChange = vi.fn();

      render(
        <TestWrapper>
          <AssetCardCompact {...defaultProps} isMultiSelectMode={true} isChecked={true} onCheckChange={onCheckChange} />
        </TestWrapper>,
      );

      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);

      expect(onCheckChange).toHaveBeenCalledWith(false);
    });
  });

  describe('token cycling on hover', () => {
    it('should cycle through tokens on hover when multiple tokens exist', async () => {
      render(
        <TestWrapper>
          <AssetCardCompact {...defaultProps} asset={multiTokenAsset} />
        </TestWrapper>,
      );

      const card = screen.getByText('Dragon').closest('.MuiCard-root');
      if (card) {
        await act(async () => {
          userEvent.hover(card);
          vi.advanceTimersByTime(1000);
        });
      }
    });

    it('should reset to first token when mouse leaves', async () => {
      render(
        <TestWrapper>
          <AssetCardCompact {...defaultProps} asset={multiTokenAsset} />
        </TestWrapper>,
      );

      const card = screen.getByText('Dragon').closest('.MuiCard-root');
      if (card) {
        await act(async () => {
          userEvent.hover(card);
          vi.advanceTimersByTime(2000);
          userEvent.unhover(card);
        });
      }
    });

    it('should not cycle tokens when only one token exists', async () => {
      render(
        <TestWrapper>
          <AssetCardCompact {...defaultProps} />
        </TestWrapper>,
      );

      const card = screen.getByText('Goblin Warrior').closest('.MuiCard-root');
      if (card) {
        await act(async () => {
          userEvent.hover(card);
          vi.advanceTimersByTime(2000);
        });
      }
    });
  });

  describe('theme support', () => {
    it('should render correctly in dark mode', () => {
      const darkTheme = createTheme({ palette: { mode: 'dark' } });

      render(
        <ThemeProvider theme={darkTheme}>
          <AssetCardCompact {...defaultProps} />
        </ThemeProvider>,
      );

      expect(screen.getByText('Goblin Warrior')).toBeInTheDocument();
    });

    it('should render correctly in light mode', () => {
      const lightTheme = createTheme({ palette: { mode: 'light' } });

      render(
        <ThemeProvider theme={lightTheme}>
          <AssetCardCompact {...defaultProps} />
        </ThemeProvider>,
      );

      expect(screen.getByText('Goblin Warrior')).toBeInTheDocument();
    });
  });
});
