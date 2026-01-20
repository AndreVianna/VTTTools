import { createTheme, ThemeProvider } from '@mui/material/styles';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AssetKind, ResourceRole, StatValueType, type Asset } from '@/types/domain';
import { AssetTableView, type AssetTableViewProps } from './AssetTableView';

vi.mock('@mui/x-data-grid/esm/index.css', () => ({}));

vi.mock('@/components/common/ResourceImage', () => ({
  ResourceImage: ({ alt, fallback }: { alt: string; fallback: React.ReactNode }) => (
    <div data-mock="resource-image" role="img" aria-label={alt}>
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

describe('AssetTableView', () => {
  const mockAsset1: Asset = {
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
    tokens: [],
    statBlocks: {
      0: {
        HP: { key: 'HP', value: '12', type: StatValueType.Number },
        AC: { key: 'AC', value: '15', type: StatValueType.Number },
        CR: { key: 'CR', value: '1/4', type: StatValueType.Text },
      },
    },
    tags: ['monster', 'common'],
    ownerId: 'user-1',
    isPublished: true,
    isPublic: false,
  };

  const mockAsset2: Asset = {
    id: 'asset-2',
    name: 'Ancient Dragon',
    description: 'A powerful dragon',
    classification: {
      kind: AssetKind.Creature,
      category: 'Dragon',
      type: 'Red Dragon',
      subtype: null,
    },
    thumbnail: null,
    portrait: null,
    size: { width: 4, height: 4 },
    tokens: [
      {
        id: 'token-1',
        role: ResourceRole.Token,
        path: '/tokens/dragon.png',
        contentType: 'image/png',
        fileName: 'dragon.png',
        fileSize: 1024,
        dimensions: { width: 256, height: 256 },
        duration: '0',
        name: 'dragon.png',
        description: null,
        tags: [],
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
        name: 'dragon2.png',
        description: null,
        tags: [],
      },
    ],
    statBlocks: {
      0: {
        CR: { key: 'CR', value: '20', type: StatValueType.Text },
      },
    },
    tags: [],
    ownerId: 'user-1',
    isPublished: true,
    isPublic: true,
  };

  const mockAsset3: Asset = {
    id: 'asset-3',
    name: 'Magic Sword',
    description: 'A magical weapon',
    classification: {
      kind: AssetKind.Object,
      category: 'Weapon',
      type: 'Sword',
      subtype: null,
    },
    thumbnail: null,
    portrait: null,
    size: { width: 1, height: 1 },
    tokens: [],
    statBlocks: {},
    tags: ['magic', 'weapon'],
    ownerId: 'user-1',
    isPublished: false,
    isPublic: false,
  };

  type OnSelectionChangeFn = (ids: string[]) => void;
  type OnRowClickFn = (asset: Asset) => void;
  type OnRowDoubleClickFn = (asset: Asset) => void;

  const defaultProps: AssetTableViewProps = {
    assets: [mockAsset1, mockAsset2, mockAsset3],
    selectedIds: [],
    onSelectionChange: vi.fn<OnSelectionChangeFn>(),
    onRowClick: vi.fn<OnRowClickFn>(),
    onRowDoubleClick: vi.fn<OnRowDoubleClickFn>(),
    isLoading: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render table with assets', () => {
      render(
        <TestWrapper>
          <AssetTableView {...defaultProps} />
        </TestWrapper>,
      );

      expect(screen.getByText('Goblin Warrior')).toBeInTheDocument();
      expect(screen.getByText('Ancient Dragon')).toBeInTheDocument();
      expect(screen.getByText('Magic Sword')).toBeInTheDocument();
    });

    it('should render column headers', () => {
      render(
        <TestWrapper>
          <AssetTableView {...defaultProps} />
        </TestWrapper>,
      );

      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Classification')).toBeInTheDocument();
      expect(screen.getByText('Stats')).toBeInTheDocument();
      expect(screen.getByText('Tokens')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
    });

    it('should render classification with type', () => {
      render(
        <TestWrapper>
          <AssetTableView {...defaultProps} />
        </TestWrapper>,
      );

      expect(screen.getByText('Humanoid / Goblin')).toBeInTheDocument();
      expect(screen.getByText('Dragon / Red Dragon')).toBeInTheDocument();
    });

    it('should render classification with category only when type is empty', () => {
      const assetWithoutType: Asset = {
        ...mockAsset1,
        classification: {
          kind: AssetKind.Object,
          category: 'Miscellaneous',
          type: '',
          subtype: null,
        },
      };

      render(
        <TestWrapper>
          <AssetTableView {...defaultProps} assets={[assetWithoutType]} />
        </TestWrapper>,
      );

      expect(screen.getByText('Miscellaneous')).toBeInTheDocument();
    });

    it('should display CR badge when available', () => {
      render(
        <TestWrapper>
          <AssetTableView {...defaultProps} />
        </TestWrapper>,
      );

      expect(screen.getByText('CR 1/4')).toBeInTheDocument();
      expect(screen.getByText('CR 20')).toBeInTheDocument();
    });

    it('should display HP and AC when no CR is available', () => {
      const assetWithoutCR: Asset = {
        ...mockAsset1,
        statBlocks: {
          0: {
            HP: { key: 'HP', value: '50', type: StatValueType.Number },
            AC: { key: 'AC', value: '18', type: StatValueType.Number },
          },
        },
      };

      render(
        <TestWrapper>
          <AssetTableView {...defaultProps} assets={[assetWithoutCR]} />
        </TestWrapper>,
      );

      expect(screen.getByText('HP:50 | AC:18')).toBeInTheDocument();
    });

    it('should display token count', () => {
      render(
        <TestWrapper>
          <AssetTableView {...defaultProps} />
        </TestWrapper>,
      );

      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('should render Published status chip', () => {
      render(
        <TestWrapper>
          <AssetTableView {...defaultProps} />
        </TestWrapper>,
      );

      const publishedChips = screen.getAllByText('Published');
      expect(publishedChips.length).toBeGreaterThan(0);
    });

    it('should render Public status chip', () => {
      render(
        <TestWrapper>
          <AssetTableView {...defaultProps} />
        </TestWrapper>,
      );

      expect(screen.getByText('Public')).toBeInTheDocument();
    });

    it('should render Draft status chip', () => {
      render(
        <TestWrapper>
          <AssetTableView {...defaultProps} />
        </TestWrapper>,
      );

      expect(screen.getByText('Draft')).toBeInTheDocument();
    });

    it('should render loading state', () => {
      render(
        <TestWrapper>
          <AssetTableView {...defaultProps} isLoading={true} />
        </TestWrapper>,
      );

      const grid = screen.getByRole('grid');
      expect(grid).toBeInTheDocument();
    });

    it('should render empty state when no assets', () => {
      render(
        <TestWrapper>
          <AssetTableView {...defaultProps} assets={[]} />
        </TestWrapper>,
      );

      expect(screen.getByRole('grid')).toBeInTheDocument();
    });
  });

  describe('selection interactions', () => {
    it('should display checkboxes for row selection', () => {
      render(
        <TestWrapper>
          <AssetTableView {...defaultProps} />
        </TestWrapper>,
      );

      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes.length).toBeGreaterThan(0);
    });

    it('should call onSelectionChange when row checkbox is clicked', async () => {
      const user = userEvent.setup();
      const onSelectionChange = vi.fn<OnSelectionChangeFn>();

      render(
        <TestWrapper>
          <AssetTableView {...defaultProps} onSelectionChange={onSelectionChange} />
        </TestWrapper>,
      );

      const checkboxes = screen.getAllByRole('checkbox');
      const firstRowCheckbox = checkboxes[1]!;

      await user.click(firstRowCheckbox);

      expect(onSelectionChange).toHaveBeenCalled();
    });

    it('should reflect selected state', () => {
      render(
        <TestWrapper>
          <AssetTableView {...defaultProps} selectedIds={['asset-1', 'asset-2']} />
        </TestWrapper>,
      );

      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes.length).toBeGreaterThan(2);
    });
  });

  describe('row interactions', () => {
    it('should call onRowClick when row is clicked', async () => {
      const user = userEvent.setup();
      const onRowClick = vi.fn<OnRowClickFn>();

      render(
        <TestWrapper>
          <AssetTableView {...defaultProps} onRowClick={onRowClick} />
        </TestWrapper>,
      );

      const goblinRow = screen.getByText('Goblin Warrior').closest('.MuiDataGrid-row');
      if (goblinRow) {
        await user.click(goblinRow);
        expect(onRowClick).toHaveBeenCalledWith(mockAsset1);
      }
    });

    it('should call onRowDoubleClick when row is double-clicked', async () => {
      const user = userEvent.setup();
      const onRowDoubleClick = vi.fn<OnRowDoubleClickFn>();

      render(
        <TestWrapper>
          <AssetTableView {...defaultProps} onRowDoubleClick={onRowDoubleClick} />
        </TestWrapper>,
      );

      const dragonRow = screen.getByText('Ancient Dragon').closest('.MuiDataGrid-row');
      if (dragonRow) {
        await user.dblClick(dragonRow);
        expect(onRowDoubleClick).toHaveBeenCalledWith(mockAsset2);
      }
    });
  });

  describe('asset display details', () => {
    it('should not display stats when statBlocks is empty', () => {
      const assetWithoutStats: Asset = {
        ...mockAsset3,
        statBlocks: {},
      };

      render(
        <TestWrapper>
          <AssetTableView {...defaultProps} assets={[assetWithoutStats]} />
        </TestWrapper>,
      );

      expect(screen.queryByText(/CR/)).not.toBeInTheDocument();
      expect(screen.queryByText(/HP:/)).not.toBeInTheDocument();
    });

    it('should display only HP when AC is not available', () => {
      const assetWithHPOnly: Asset = {
        ...mockAsset1,
        statBlocks: {
          0: {
            HP: { key: 'HP', value: '25', type: StatValueType.Number },
          },
        },
      };

      render(
        <TestWrapper>
          <AssetTableView {...defaultProps} assets={[assetWithHPOnly]} />
        </TestWrapper>,
      );

      expect(screen.getByText('HP:25')).toBeInTheDocument();
    });

    it('should display only AC when HP is not available', () => {
      const assetWithACOnly: Asset = {
        ...mockAsset1,
        statBlocks: {
          0: {
            AC: { key: 'AC', value: '16', type: StatValueType.Number },
          },
        },
      };

      render(
        <TestWrapper>
          <AssetTableView {...defaultProps} assets={[assetWithACOnly]} />
        </TestWrapper>,
      );

      expect(screen.getByText('AC:16')).toBeInTheDocument();
    });
  });

  describe('theme support', () => {
    it('should render correctly in dark mode', () => {
      const darkTheme = createTheme({ palette: { mode: 'dark' } });

      render(
        <ThemeProvider theme={darkTheme}>
          <AssetTableView {...defaultProps} />
        </ThemeProvider>,
      );

      expect(screen.getByText('Goblin Warrior')).toBeInTheDocument();
    });

    it('should render correctly in light mode', () => {
      const lightTheme = createTheme({ palette: { mode: 'light' } });

      render(
        <ThemeProvider theme={lightTheme}>
          <AssetTableView {...defaultProps} />
        </ThemeProvider>,
      );

      expect(screen.getByText('Goblin Warrior')).toBeInTheDocument();
    });
  });
});
