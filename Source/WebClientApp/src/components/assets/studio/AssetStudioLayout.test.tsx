import { createTheme, ThemeProvider } from '@mui/material/styles';
import { render, screen } from '@testing-library/react';
import type React from 'react';
import { describe, expect, it } from 'vitest';
import { AssetStudioLayout } from './AssetStudioLayout';

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = createTheme({ palette: { mode: 'light' } });
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};
TestWrapper.displayName = 'TestWrapper';

describe('AssetStudioLayout', () => {
  const mockVisualPanel = <div data-testid="visual-panel">Visual Panel</div>;
  const mockDataPanel = <div data-testid="data-panel">Data Panel</div>;
  const mockMetadataPanel = <div data-testid="metadata-panel">Metadata Panel</div>;
  const mockToolbar = <div data-testid="toolbar">Toolbar</div>;

  describe('rendering', () => {
    it('should render all three panels', () => {
      render(
        <TestWrapper>
          <AssetStudioLayout
            visualPanel={mockVisualPanel}
            dataPanel={mockDataPanel}
            metadataPanel={mockMetadataPanel}
          />
        </TestWrapper>,
      );

      expect(screen.getByTestId('visual-panel')).toBeInTheDocument();
      expect(screen.getByTestId('data-panel')).toBeInTheDocument();
      expect(screen.getByTestId('metadata-panel')).toBeInTheDocument();
    });

    it('should render toolbar when provided', () => {
      render(
        <TestWrapper>
          <AssetStudioLayout
            visualPanel={mockVisualPanel}
            dataPanel={mockDataPanel}
            metadataPanel={mockMetadataPanel}
            toolbar={mockToolbar}
          />
        </TestWrapper>,
      );

      expect(screen.getByTestId('toolbar')).toBeInTheDocument();
    });

    it('should not render toolbar when not provided', () => {
      render(
        <TestWrapper>
          <AssetStudioLayout
            visualPanel={mockVisualPanel}
            dataPanel={mockDataPanel}
            metadataPanel={mockMetadataPanel}
          />
        </TestWrapper>,
      );

      expect(screen.queryByTestId('toolbar')).not.toBeInTheDocument();
    });

    it('should render panels in correct order (visual, data, metadata)', () => {
      const { container } = render(
        <TestWrapper>
          <AssetStudioLayout
            visualPanel={mockVisualPanel}
            dataPanel={mockDataPanel}
            metadataPanel={mockMetadataPanel}
          />
        </TestWrapper>,
      );

      const panels = container.querySelectorAll('[data-testid]');
      expect(panels[0]).toHaveAttribute('data-testid', 'visual-panel');
      expect(panels[1]).toHaveAttribute('data-testid', 'data-panel');
      expect(panels[2]).toHaveAttribute('data-testid', 'metadata-panel');
    });
  });

  describe('layout structure', () => {
    it('should have flexbox layout with column direction', () => {
      const { container } = render(
        <TestWrapper>
          <AssetStudioLayout
            visualPanel={mockVisualPanel}
            dataPanel={mockDataPanel}
            metadataPanel={mockMetadataPanel}
          />
        </TestWrapper>,
      );

      const rootBox = container.firstChild as HTMLElement;
      const styles = window.getComputedStyle(rootBox);
      expect(styles.display).toBe('flex');
      expect(styles.flexDirection).toBe('column');
    });

    it('should set height to 100%', () => {
      const { container } = render(
        <TestWrapper>
          <AssetStudioLayout
            visualPanel={mockVisualPanel}
            dataPanel={mockDataPanel}
            metadataPanel={mockMetadataPanel}
          />
        </TestWrapper>,
      );

      const rootBox = container.firstChild as HTMLElement;
      const styles = window.getComputedStyle(rootBox);
      expect(styles.height).toBe('100%');
    });
  });

  describe('responsive panel sizing', () => {
    it('should render visual panel with correct width constraints', () => {
      const { container } = render(
        <TestWrapper>
          <AssetStudioLayout
            visualPanel={mockVisualPanel}
            dataPanel={mockDataPanel}
            metadataPanel={mockMetadataPanel}
          />
        </TestWrapper>,
      );

      const visualPanelContainer = screen.getByTestId('visual-panel').parentElement as HTMLElement;
      const styles = window.getComputedStyle(visualPanelContainer);
      expect(styles.width).toBe('30%');
      expect(styles.minWidth).toBe('280px');
      expect(styles.maxWidth).toBe('400px');
    });

    it('should render metadata panel with correct width constraints', () => {
      const { container } = render(
        <TestWrapper>
          <AssetStudioLayout
            visualPanel={mockVisualPanel}
            dataPanel={mockDataPanel}
            metadataPanel={mockMetadataPanel}
          />
        </TestWrapper>,
      );

      const metadataPanelContainer = screen.getByTestId('metadata-panel').parentElement as HTMLElement;
      const styles = window.getComputedStyle(metadataPanelContainer);
      expect(styles.width).toBe('30%');
      expect(styles.minWidth).toBe('280px');
      expect(styles.maxWidth).toBe('400px');
    });

    it('should render data panel with flex grow', () => {
      const { container } = render(
        <TestWrapper>
          <AssetStudioLayout
            visualPanel={mockVisualPanel}
            dataPanel={mockDataPanel}
            metadataPanel={mockMetadataPanel}
          />
        </TestWrapper>,
      );

      const dataPanelContainer = screen.getByTestId('data-panel').parentElement as HTMLElement;
      const styles = window.getComputedStyle(dataPanelContainer);
      expect(styles.flexGrow).toBe('1');
      expect(styles.minWidth).toBe('400px');
    });
  });

  describe('theme support', () => {
    it('should render correctly in dark mode', () => {
      const darkTheme = createTheme({ palette: { mode: 'dark' } });

      render(
        <ThemeProvider theme={darkTheme}>
          <AssetStudioLayout
            visualPanel={mockVisualPanel}
            dataPanel={mockDataPanel}
            metadataPanel={mockMetadataPanel}
          />
        </ThemeProvider>,
      );

      expect(screen.getByTestId('visual-panel')).toBeInTheDocument();
      expect(screen.getByTestId('data-panel')).toBeInTheDocument();
      expect(screen.getByTestId('metadata-panel')).toBeInTheDocument();
    });

    it('should render correctly in light mode', () => {
      const lightTheme = createTheme({ palette: { mode: 'light' } });

      render(
        <ThemeProvider theme={lightTheme}>
          <AssetStudioLayout
            visualPanel={mockVisualPanel}
            dataPanel={mockDataPanel}
            metadataPanel={mockMetadataPanel}
          />
        </ThemeProvider>,
      );

      expect(screen.getByTestId('visual-panel')).toBeInTheDocument();
      expect(screen.getByTestId('data-panel')).toBeInTheDocument();
      expect(screen.getByTestId('metadata-panel')).toBeInTheDocument();
    });
  });

  describe('overflow handling', () => {
    it('should set overflow auto on panel containers', () => {
      const { container } = render(
        <TestWrapper>
          <AssetStudioLayout
            visualPanel={mockVisualPanel}
            dataPanel={mockDataPanel}
            metadataPanel={mockMetadataPanel}
          />
        </TestWrapper>,
      );

      const visualPanelContainer = screen.getByTestId('visual-panel').parentElement as HTMLElement;
      const dataPanelContainer = screen.getByTestId('data-panel').parentElement as HTMLElement;
      const metadataPanelContainer = screen.getByTestId('metadata-panel').parentElement as HTMLElement;

      expect(window.getComputedStyle(visualPanelContainer).overflow).toBe('auto');
      expect(window.getComputedStyle(dataPanelContainer).overflow).toBe('auto');
      expect(window.getComputedStyle(metadataPanelContainer).overflow).toBe('auto');
    });
  });
});
