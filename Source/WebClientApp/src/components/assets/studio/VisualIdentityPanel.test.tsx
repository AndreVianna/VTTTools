import { createTheme, ThemeProvider } from '@mui/material/styles';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { VisualIdentityPanel } from './VisualIdentityPanel';
import { ResourceRole, type MediaResource } from '@/types/domain';

vi.mock('@/components/common/ResourceImage', () => ({
  ResourceImage: ({ resourceId, alt }: { resourceId: string; alt: string }) => (
    <img data-mock={`resource-image-${resourceId}`} alt={alt} src={`/resources/${resourceId}`} />
  ),
}));

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = createTheme({ palette: { mode: 'light' } });
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};
TestWrapper.displayName = 'TestWrapper';

describe('VisualIdentityPanel', () => {
  const mockPortrait: MediaResource = {
    id: 'portrait-123',
    role: ResourceRole.Portrait,
    path: '/path/to/portrait.png',
    contentType: 'image/png',
    fileName: 'portrait.png',
    fileSize: 1024,
    dimensions: { width: 512, height: 512 },
    duration: '',
  };

  const mockTokens: MediaResource[] = [
    {
      id: 'token-1',
      role: ResourceRole.Token,
      path: '/path/to/token1.png',
      contentType: 'image/png',
      fileName: 'token1.png',
      fileSize: 512,
      dimensions: { width: 256, height: 256 },
      duration: '',
    },
    {
      id: 'token-2',
      role: ResourceRole.Token,
      path: '/path/to/token2.png',
      contentType: 'image/png',
      fileName: 'token2.png',
      fileSize: 512,
      dimensions: { width: 256, height: 256 },
      duration: '',
    },
  ];

  let mockOnPortraitChange: ReturnType<typeof vi.fn>;
  let mockOnTokensChange: ReturnType<typeof vi.fn>;
  let mockOnSelectPortrait: ReturnType<typeof vi.fn>;
  let mockOnSelectToken: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnPortraitChange = vi.fn();
    mockOnTokensChange = vi.fn();
    mockOnSelectPortrait = vi.fn();
    mockOnSelectToken = vi.fn();
  });

  describe('rendering', () => {
    it('should render Portrait section header', () => {
      render(
        <TestWrapper>
          <VisualIdentityPanel
            portrait={null}
            tokens={[]}
            onPortraitChange={mockOnPortraitChange}
            onTokensChange={mockOnTokensChange}
            onSelectPortrait={mockOnSelectPortrait}
            onSelectToken={mockOnSelectToken}
          />
        </TestWrapper>,
      );

      expect(screen.getByText('Portrait')).toBeInTheDocument();
    });

    it('should render Tokens section header with count', () => {
      render(
        <TestWrapper>
          <VisualIdentityPanel
            portrait={null}
            tokens={mockTokens}
            onPortraitChange={mockOnPortraitChange}
            onTokensChange={mockOnTokensChange}
            onSelectPortrait={mockOnSelectPortrait}
            onSelectToken={mockOnSelectToken}
          />
        </TestWrapper>,
      );

      expect(screen.getByText('Tokens (2)')).toBeInTheDocument();
    });

    it('should render Add Token button', () => {
      render(
        <TestWrapper>
          <VisualIdentityPanel
            portrait={null}
            tokens={[]}
            onPortraitChange={mockOnPortraitChange}
            onTokensChange={mockOnTokensChange}
            onSelectPortrait={mockOnSelectPortrait}
            onSelectToken={mockOnSelectToken}
          />
        </TestWrapper>,
      );

      const addTokenButton = screen.getByRole('button', { name: '' });
      expect(addTokenButton).toBeInTheDocument();
    });
  });

  describe('portrait display', () => {
    it('should show placeholder when no portrait is set', () => {
      render(
        <TestWrapper>
          <VisualIdentityPanel
            portrait={null}
            tokens={[]}
            onPortraitChange={mockOnPortraitChange}
            onTokensChange={mockOnTokensChange}
            onSelectPortrait={mockOnSelectPortrait}
            onSelectToken={mockOnSelectToken}
          />
        </TestWrapper>,
      );

      expect(screen.getByText('Click to add portrait')).toBeInTheDocument();
    });

    it('should render portrait image when portrait is set', () => {
      render(
        <TestWrapper>
          <VisualIdentityPanel
            portrait={mockPortrait}
            tokens={[]}
            onPortraitChange={mockOnPortraitChange}
            onTokensChange={mockOnTokensChange}
            onSelectPortrait={mockOnSelectPortrait}
            onSelectToken={mockOnSelectToken}
          />
        </TestWrapper>,
      );

      expect(screen.getByAltText('Portrait')).toBeInTheDocument();
      expect(screen.getByAltText('Portrait')).toBeInTheDocument();
    });

    it('should show Remove Portrait button when portrait is set', () => {
      render(
        <TestWrapper>
          <VisualIdentityPanel
            portrait={mockPortrait}
            tokens={[]}
            onPortraitChange={mockOnPortraitChange}
            onTokensChange={mockOnTokensChange}
            onSelectPortrait={mockOnSelectPortrait}
            onSelectToken={mockOnSelectToken}
          />
        </TestWrapper>,
      );

      expect(screen.getByRole('button', { name: /remove portrait/i })).toBeInTheDocument();
    });

    it('should not show Remove Portrait button when no portrait is set', () => {
      render(
        <TestWrapper>
          <VisualIdentityPanel
            portrait={null}
            tokens={[]}
            onPortraitChange={mockOnPortraitChange}
            onTokensChange={mockOnTokensChange}
            onSelectPortrait={mockOnSelectPortrait}
            onSelectToken={mockOnSelectToken}
          />
        </TestWrapper>,
      );

      expect(screen.queryByRole('button', { name: /remove portrait/i })).not.toBeInTheDocument();
    });
  });

  describe('portrait interactions', () => {
    it('should call onSelectPortrait when portrait placeholder is clicked', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <VisualIdentityPanel
            portrait={null}
            tokens={[]}
            onPortraitChange={mockOnPortraitChange}
            onTokensChange={mockOnTokensChange}
            onSelectPortrait={mockOnSelectPortrait}
            onSelectToken={mockOnSelectToken}
          />
        </TestWrapper>,
      );

      const placeholder = screen.getByText('Click to add portrait').parentElement?.parentElement;
      if (placeholder) {
        await user.click(placeholder);
        expect(mockOnSelectPortrait).toHaveBeenCalled();
      }
    });

    it('should call onSelectPortrait when existing portrait is clicked', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <VisualIdentityPanel
            portrait={mockPortrait}
            tokens={[]}
            onPortraitChange={mockOnPortraitChange}
            onTokensChange={mockOnTokensChange}
            onSelectPortrait={mockOnSelectPortrait}
            onSelectToken={mockOnSelectToken}
          />
        </TestWrapper>,
      );

      const portraitContainer = screen.getByAltText('Portrait').parentElement?.parentElement;
      if (portraitContainer) {
        await user.click(portraitContainer);
        expect(mockOnSelectPortrait).toHaveBeenCalled();
      }
    });

    it('should call onPortraitChange with null when Remove Portrait button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <VisualIdentityPanel
            portrait={mockPortrait}
            tokens={[]}
            onPortraitChange={mockOnPortraitChange}
            onTokensChange={mockOnTokensChange}
            onSelectPortrait={mockOnSelectPortrait}
            onSelectToken={mockOnSelectToken}
          />
        </TestWrapper>,
      );

      const removeButton = screen.getByRole('button', { name: /remove portrait/i });
      await user.click(removeButton);

      expect(mockOnPortraitChange).toHaveBeenCalledWith(null);
    });
  });

  describe('tokens display', () => {
    it('should render all token images', () => {
      render(
        <TestWrapper>
          <VisualIdentityPanel
            portrait={null}
            tokens={mockTokens}
            onPortraitChange={mockOnPortraitChange}
            onTokensChange={mockOnTokensChange}
            onSelectPortrait={mockOnSelectPortrait}
            onSelectToken={mockOnSelectToken}
          />
        </TestWrapper>,
      );

      expect(screen.getByAltText('Token 1')).toBeInTheDocument();
      expect(screen.getByAltText('Token 2')).toBeInTheDocument();
    });

    it('should render token images with correct alt text', () => {
      render(
        <TestWrapper>
          <VisualIdentityPanel
            portrait={null}
            tokens={mockTokens}
            onPortraitChange={mockOnPortraitChange}
            onTokensChange={mockOnTokensChange}
            onSelectPortrait={mockOnSelectPortrait}
            onSelectToken={mockOnSelectToken}
          />
        </TestWrapper>,
      );

      expect(screen.getByAltText('Token 1')).toBeInTheDocument();
      expect(screen.getByAltText('Token 2')).toBeInTheDocument();
    });

    it('should render remove button for each token', () => {
      render(
        <TestWrapper>
          <VisualIdentityPanel
            portrait={null}
            tokens={mockTokens}
            onPortraitChange={mockOnPortraitChange}
            onTokensChange={mockOnTokensChange}
            onSelectPortrait={mockOnSelectPortrait}
            onSelectToken={mockOnSelectToken}
          />
        </TestWrapper>,
      );

      const removeButtons = screen.getAllByRole('button', { name: /remove token/i });
      expect(removeButtons).toHaveLength(2);
    });

    it('should display empty tokens list correctly', () => {
      render(
        <TestWrapper>
          <VisualIdentityPanel
            portrait={null}
            tokens={[]}
            onPortraitChange={mockOnPortraitChange}
            onTokensChange={mockOnTokensChange}
            onSelectPortrait={mockOnSelectPortrait}
            onSelectToken={mockOnSelectToken}
          />
        </TestWrapper>,
      );

      expect(screen.getByText('Tokens (0)')).toBeInTheDocument();
    });
  });

  describe('token interactions', () => {
    it('should call onSelectToken when Add Token button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <VisualIdentityPanel
            portrait={null}
            tokens={[]}
            onPortraitChange={mockOnPortraitChange}
            onTokensChange={mockOnTokensChange}
            onSelectPortrait={mockOnSelectPortrait}
            onSelectToken={mockOnSelectToken}
          />
        </TestWrapper>,
      );

      const addButton = screen.getByRole('button', { name: '' });
      await user.click(addButton);

      expect(mockOnSelectToken).toHaveBeenCalled();
    });

    it('should call onTokensChange when token is removed', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <VisualIdentityPanel
            portrait={null}
            tokens={mockTokens}
            onPortraitChange={mockOnPortraitChange}
            onTokensChange={mockOnTokensChange}
            onSelectPortrait={mockOnSelectPortrait}
            onSelectToken={mockOnSelectToken}
          />
        </TestWrapper>,
      );

      const removeButtons = screen.getAllByRole('button', { name: /remove token/i });
      await user.click(removeButtons[0]!);

      expect(mockOnTokensChange).toHaveBeenCalledWith([mockTokens[1]]);
    });

    it('should remove correct token when multiple tokens exist', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <VisualIdentityPanel
            portrait={null}
            tokens={mockTokens}
            onPortraitChange={mockOnPortraitChange}
            onTokensChange={mockOnTokensChange}
            onSelectPortrait={mockOnSelectPortrait}
            onSelectToken={mockOnSelectToken}
          />
        </TestWrapper>,
      );

      const removeButtons = screen.getAllByRole('button', { name: /remove token/i });
      await user.click(removeButtons[1]!);

      expect(mockOnTokensChange).toHaveBeenCalledWith([mockTokens[0]]);
    });

    it('should call onTokensChange with empty array when last token is removed', async () => {
      const user = userEvent.setup();

      const singleToken = [mockTokens[0]!];

      render(
        <TestWrapper>
          <VisualIdentityPanel
            portrait={null}
            tokens={singleToken}
            onPortraitChange={mockOnPortraitChange}
            onTokensChange={mockOnTokensChange}
            onSelectPortrait={mockOnSelectPortrait}
            onSelectToken={mockOnSelectToken}
          />
        </TestWrapper>,
      );

      const removeButton = screen.getByRole('button', { name: /remove token/i });
      await user.click(removeButton);

      expect(mockOnTokensChange).toHaveBeenCalledWith([]);
    });
  });

  describe('theme support', () => {
    it('should render correctly in dark mode', () => {
      const darkTheme = createTheme({ palette: { mode: 'dark' } });

      render(
        <ThemeProvider theme={darkTheme}>
          <VisualIdentityPanel
            portrait={mockPortrait}
            tokens={mockTokens}
            onPortraitChange={mockOnPortraitChange}
            onTokensChange={mockOnTokensChange}
            onSelectPortrait={mockOnSelectPortrait}
            onSelectToken={mockOnSelectToken}
          />
        </ThemeProvider>,
      );

      expect(screen.getByText('Portrait')).toBeInTheDocument();
      expect(screen.getByText('Tokens (2)')).toBeInTheDocument();
    });

    it('should render correctly in light mode', () => {
      const lightTheme = createTheme({ palette: { mode: 'light' } });

      render(
        <ThemeProvider theme={lightTheme}>
          <VisualIdentityPanel
            portrait={mockPortrait}
            tokens={mockTokens}
            onPortraitChange={mockOnPortraitChange}
            onTokensChange={mockOnTokensChange}
            onSelectPortrait={mockOnSelectPortrait}
            onSelectToken={mockOnSelectToken}
          />
        </ThemeProvider>,
      );

      expect(screen.getByText('Portrait')).toBeInTheDocument();
      expect(screen.getByText('Tokens (2)')).toBeInTheDocument();
    });
  });

  describe('layout', () => {
    it('should render tokens in grid layout', () => {
      render(
        <TestWrapper>
          <VisualIdentityPanel
            portrait={null}
            tokens={mockTokens}
            onPortraitChange={mockOnPortraitChange}
            onTokensChange={mockOnTokensChange}
            onSelectPortrait={mockOnSelectPortrait}
            onSelectToken={mockOnSelectToken}
          />
        </TestWrapper>,
      );

      const tokenGridContainer = screen.getByAltText('Token 1').parentElement?.parentElement;
      if (tokenGridContainer) {
        const styles = window.getComputedStyle(tokenGridContainer);
        expect(styles.display).toBe('grid');
      }
    });

    it('should maintain aspect ratio for portrait', () => {
      render(
        <TestWrapper>
          <VisualIdentityPanel
            portrait={null}
            tokens={[]}
            onPortraitChange={mockOnPortraitChange}
            onTokensChange={mockOnTokensChange}
            onSelectPortrait={mockOnSelectPortrait}
            onSelectToken={mockOnSelectToken}
          />
        </TestWrapper>,
      );

      const portraitBox = screen.getByText('Click to add portrait').parentElement?.parentElement;
      if (portraitBox) {
        const styles = window.getComputedStyle(portraitBox);
        expect(styles.aspectRatio).toBe('1');
      }
    });
  });

  describe('accessibility', () => {
    it('should have accessible tooltip for remove token buttons', () => {
      render(
        <TestWrapper>
          <VisualIdentityPanel
            portrait={null}
            tokens={mockTokens}
            onPortraitChange={mockOnPortraitChange}
            onTokensChange={mockOnTokensChange}
            onSelectPortrait={mockOnSelectPortrait}
            onSelectToken={mockOnSelectToken}
          />
        </TestWrapper>,
      );

      const removeButtons = screen.getAllByRole('button', { name: /remove token/i });
      expect(removeButtons).toHaveLength(2);
    });

    it('should have accessible button for Remove Portrait', () => {
      render(
        <TestWrapper>
          <VisualIdentityPanel
            portrait={mockPortrait}
            tokens={[]}
            onPortraitChange={mockOnPortraitChange}
            onTokensChange={mockOnTokensChange}
            onSelectPortrait={mockOnSelectPortrait}
            onSelectToken={mockOnSelectToken}
          />
        </TestWrapper>,
      );

      const removeButton = screen.getByRole('button', { name: /remove portrait/i });
      expect(removeButton).toBeInTheDocument();
    });
  });
});
