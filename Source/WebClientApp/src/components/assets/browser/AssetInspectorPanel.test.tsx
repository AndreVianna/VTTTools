import { createTheme, ThemeProvider } from '@mui/material/styles';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AssetKind, ResourceRole, StatValueType, type Asset } from '@/types/domain';
import { AssetInspectorPanel, type AssetInspectorPanelProps } from './AssetInspectorPanel';

vi.mock('@/components/common/ResourceImage', () => ({
  ResourceImage: ({ alt, fallback }: { alt: string; fallback: React.ReactNode }) => (
    <div data-mock="resource-image" aria-label={alt}>
      {fallback}
    </div>
  ),
}));

vi.mock('./TokenCarousel', () => ({
  TokenCarousel: ({ tokens }: { tokens: unknown[] }) => (
    <div data-mock="token-carousel">Token Carousel ({tokens.length} tokens)</div>
  ),
}));

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = createTheme({ palette: { mode: 'light' } });
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};
TestWrapper.displayName = 'TestWrapper';

describe('AssetInspectorPanel', () => {
  const mockAsset: Asset = {
    id: 'asset-1',
    name: 'Goblin Warrior',
    description: 'A fierce goblin warrior',
    classification: {
      kind: AssetKind.Creature,
      category: 'Humanoid',
      type: 'Goblin',
      subtype: 'Warrior',
    },
    thumbnail: null,
    portrait: {
      id: 'portrait-1',
      role: ResourceRole.Portrait,
      path: '/portraits/goblin.png',
      contentType: 'image/png',
      fileName: 'goblin.png',
      fileSize: 2048,
      dimensions: { width: 512, height: 512 },
      duration: '0',
      name: 'Goblin Portrait',
      description: null,
      tags: [],
    },
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
        name: 'Goblin Token',
        description: null,
        tags: [],
      },
    ],
    statBlocks: {
      0: {
        HP: { key: 'HP', value: '12', type: StatValueType.Number },
        AC: { key: 'AC', value: '15', type: StatValueType.Number },
        CR: { key: 'CR', value: '1/4', type: StatValueType.Text },
        STR: { key: 'STR', value: '8', type: StatValueType.Number },
        DEX: { key: 'DEX', value: '14', type: StatValueType.Number },
        CON: { key: 'CON', value: '10', type: StatValueType.Number },
      },
    },
    tags: ['monster', 'common'],
    ownerId: 'user-1',
    isPublished: true,
    isPublic: false,
  };

  const defaultProps: AssetInspectorPanelProps = {
    asset: mockAsset,
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    onClone: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render asset name', () => {
      render(
        <TestWrapper>
          <AssetInspectorPanel {...defaultProps} />
        </TestWrapper>,
      );

      expect(screen.getByText('Goblin Warrior')).toBeInTheDocument();
    });

    it('should render portrait image', () => {
      render(
        <TestWrapper>
          <AssetInspectorPanel {...defaultProps} />
        </TestWrapper>,
      );

      expect(screen.getByLabelText('Goblin Warrior')).toBeInTheDocument();
    });

    it('should render classification path', () => {
      render(
        <TestWrapper>
          <AssetInspectorPanel {...defaultProps} />
        </TestWrapper>,
      );

      expect(screen.getByText('Creature / Humanoid / Goblin / Warrior')).toBeInTheDocument();
    });

    it('should render classification path without null values', () => {
      const assetWithoutSubtype = {
        ...mockAsset,
        classification: {
          ...mockAsset.classification,
          subtype: null,
        },
      };

      render(
        <TestWrapper>
          <AssetInspectorPanel {...defaultProps} asset={assetWithoutSubtype} />
        </TestWrapper>,
      );

      expect(screen.getByText('Creature / Humanoid / Goblin')).toBeInTheDocument();
    });

    it('should render tokens section when tokens exist', () => {
      render(
        <TestWrapper>
          <AssetInspectorPanel {...defaultProps} />
        </TestWrapper>,
      );

      expect(screen.getByText('Tokens (1)')).toBeInTheDocument();
      expect(screen.getByText(/Token Carousel/)).toBeInTheDocument();
    });

    it('should not render tokens section when no tokens', () => {
      const assetWithoutTokens = {
        ...mockAsset,
        tokens: [],
      };

      render(
        <TestWrapper>
          <AssetInspectorPanel {...defaultProps} asset={assetWithoutTokens} />
        </TestWrapper>,
      );

      expect(screen.queryByText(/Tokens/)).not.toBeInTheDocument();
      expect(screen.queryByText(/Token Carousel/)).not.toBeInTheDocument();
    });

    it('should render stats section when stats exist', () => {
      render(
        <TestWrapper>
          <AssetInspectorPanel {...defaultProps} />
        </TestWrapper>,
      );

      expect(screen.getByText('Stats')).toBeInTheDocument();
      expect(screen.getByText('HP')).toBeInTheDocument();
      expect(screen.getByText('12')).toBeInTheDocument();
      expect(screen.getByText('AC')).toBeInTheDocument();
      expect(screen.getByText('15')).toBeInTheDocument();
    });

    it('should render up to 6 stats', () => {
      render(
        <TestWrapper>
          <AssetInspectorPanel {...defaultProps} />
        </TestWrapper>,
      );

      expect(screen.getByText('HP')).toBeInTheDocument();
      expect(screen.getByText('AC')).toBeInTheDocument();
      expect(screen.getByText('CR')).toBeInTheDocument();
      expect(screen.getByText('STR')).toBeInTheDocument();
      expect(screen.getByText('DEX')).toBeInTheDocument();
      expect(screen.getByText('CON')).toBeInTheDocument();
    });

    it('should not render stats section when no stats', () => {
      const assetWithoutStats = {
        ...mockAsset,
        statBlocks: {},
      };

      render(
        <TestWrapper>
          <AssetInspectorPanel {...defaultProps} asset={assetWithoutStats} />
        </TestWrapper>,
      );

      expect(screen.queryByText('Stats')).not.toBeInTheDocument();
    });

    it('should render description when it exists and is short', () => {
      render(
        <TestWrapper>
          <AssetInspectorPanel {...defaultProps} />
        </TestWrapper>,
      );

      expect(screen.getByText('Description')).toBeInTheDocument();
      expect(screen.getByText('A fierce goblin warrior')).toBeInTheDocument();
    });

    it('should not render description when it is long', () => {
      const longDescription = 'A'.repeat(250);
      const assetWithLongDescription = {
        ...mockAsset,
        description: longDescription,
      };

      render(
        <TestWrapper>
          <AssetInspectorPanel {...defaultProps} asset={assetWithLongDescription} />
        </TestWrapper>,
      );

      expect(screen.queryByText('Description')).not.toBeInTheDocument();
    });

    it('should not render description when it is empty', () => {
      const assetWithoutDescription = {
        ...mockAsset,
        description: '',
      };

      render(
        <TestWrapper>
          <AssetInspectorPanel {...defaultProps} asset={assetWithoutDescription} />
        </TestWrapper>,
      );

      expect(screen.queryByText('Description')).not.toBeInTheDocument();
    });
  });

  describe('status chips', () => {
    it('should render Published status chip', () => {
      render(
        <TestWrapper>
          <AssetInspectorPanel {...defaultProps} />
        </TestWrapper>,
      );

      expect(screen.getByText('Published')).toBeInTheDocument();
    });

    it('should render Draft status chip when not published', () => {
      const draftAsset = {
        ...mockAsset,
        isPublished: false,
      };

      render(
        <TestWrapper>
          <AssetInspectorPanel {...defaultProps} asset={draftAsset} />
        </TestWrapper>,
      );

      expect(screen.getByText('Draft')).toBeInTheDocument();
    });

    it('should render Private status chip', () => {
      render(
        <TestWrapper>
          <AssetInspectorPanel {...defaultProps} />
        </TestWrapper>,
      );

      expect(screen.getByText('Private')).toBeInTheDocument();
    });

    it('should render Public status chip when public', () => {
      const publicAsset = {
        ...mockAsset,
        isPublic: true,
      };

      render(
        <TestWrapper>
          <AssetInspectorPanel {...defaultProps} asset={publicAsset} />
        </TestWrapper>,
      );

      expect(screen.getByText('Public')).toBeInTheDocument();
    });

    it('should render token size chip', () => {
      render(
        <TestWrapper>
          <AssetInspectorPanel {...defaultProps} />
        </TestWrapper>,
      );

      expect(screen.getByText('1x1')).toBeInTheDocument();
    });

    it('should render correct token size for larger assets', () => {
      const largeAsset = {
        ...mockAsset,
        size: { width: 4, height: 4 },
      };

      render(
        <TestWrapper>
          <AssetInspectorPanel {...defaultProps} asset={largeAsset} />
        </TestWrapper>,
      );

      expect(screen.getByText('4x4')).toBeInTheDocument();
    });
  });

  describe('action buttons', () => {
    it('should render Edit Asset button', () => {
      render(
        <TestWrapper>
          <AssetInspectorPanel {...defaultProps} />
        </TestWrapper>,
      );

      expect(screen.getByRole('button', { name: /edit asset/i })).toBeInTheDocument();
    });

    it('should render clone button when onClone is provided', () => {
      render(
        <TestWrapper>
          <AssetInspectorPanel {...defaultProps} />
        </TestWrapper>,
      );

      expect(screen.getByRole('button', { name: /clone/i })).toBeInTheDocument();
    });

    it('should not render clone button when onClone is not provided', () => {
      const { onClone: _, ...propsWithoutClone } = defaultProps;

      render(
        <TestWrapper>
          <AssetInspectorPanel {...propsWithoutClone} />
        </TestWrapper>,
      );

      expect(screen.queryByRole('button', { name: /clone/i })).not.toBeInTheDocument();
    });

    it('should render delete button', () => {
      render(
        <TestWrapper>
          <AssetInspectorPanel {...defaultProps} />
        </TestWrapper>,
      );

      expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
    });

    it('should call onEdit when Edit Asset button is clicked', async () => {
      const user = userEvent.setup();
      const onEdit = vi.fn();

      render(
        <TestWrapper>
          <AssetInspectorPanel {...defaultProps} onEdit={onEdit} />
        </TestWrapper>,
      );

      const editButton = screen.getByRole('button', { name: /edit asset/i });
      await user.click(editButton);

      expect(onEdit).toHaveBeenCalled();
    });

    it('should call onDelete when delete button is clicked', async () => {
      const user = userEvent.setup();
      const onDelete = vi.fn();

      render(
        <TestWrapper>
          <AssetInspectorPanel {...defaultProps} onDelete={onDelete} />
        </TestWrapper>,
      );

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await user.click(deleteButton);
      expect(onDelete).toHaveBeenCalled();
    });

    it('should call onClone when clone button is clicked', async () => {
      const user = userEvent.setup();
      const onClone = vi.fn();

      render(
        <TestWrapper>
          <AssetInspectorPanel {...defaultProps} onClone={onClone} />
        </TestWrapper>,
      );

      const cloneButton = screen.getByRole('button', { name: /clone/i });
      await user.click(cloneButton);
      expect(onClone).toHaveBeenCalled();
    });
  });

  describe('theme support', () => {
    it('should render correctly in dark mode', () => {
      const darkTheme = createTheme({ palette: { mode: 'dark' } });

      render(
        <ThemeProvider theme={darkTheme}>
          <AssetInspectorPanel {...defaultProps} />
        </ThemeProvider>,
      );

      expect(screen.getByText('Goblin Warrior')).toBeInTheDocument();
    });

    it('should render correctly in light mode', () => {
      const lightTheme = createTheme({ palette: { mode: 'light' } });

      render(
        <ThemeProvider theme={lightTheme}>
          <AssetInspectorPanel {...defaultProps} />
        </ThemeProvider>,
      );

      expect(screen.getByText('Goblin Warrior')).toBeInTheDocument();
    });
  });
});
