import { createTheme, ThemeProvider } from '@mui/material/styles';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { AssetStudioLayout } from './AssetStudioLayout';

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = createTheme({ palette: { mode: 'light' } });
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};
TestWrapper.displayName = 'TestWrapper';

describe('AssetStudioLayout', () => {
  const mockVisualPanel = <div data-mock="visual-panel">Mock Visual Panel</div>;
  const mockDataPanel = <div data-mock="data-panel">Mock Data Panel</div>;
  const mockMetadataPanel = <div data-mock="metadata-panel">Mock Metadata Panel</div>;
  const mockToolbar = <div data-mock="toolbar">Mock Toolbar</div>;

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

      expect(screen.getByText('Mock Visual Panel')).toBeInTheDocument();
      expect(screen.getByText('Mock Data Panel')).toBeInTheDocument();
      expect(screen.getByText('Mock Metadata Panel')).toBeInTheDocument();
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

      expect(screen.getByText('Mock Toolbar')).toBeInTheDocument();
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

      expect(screen.queryByText('Mock Toolbar')).not.toBeInTheDocument();
    });

    it('should render panels in correct order (visual, data, metadata)', () => {
      render(
        <TestWrapper>
          <AssetStudioLayout
            visualPanel={mockVisualPanel}
            dataPanel={mockDataPanel}
            metadataPanel={mockMetadataPanel}
          />
        </TestWrapper>,
      );

      const studioRegion = screen.getByRole('region', { name: /asset studio/i });
      const panelTexts = ['Mock Visual Panel', 'Mock Data Panel', 'Mock Metadata Panel'];
      const panelElements = panelTexts.map(text => screen.getByText(text));

      // Verify order by checking each panel appears within the studio region
      panelElements.forEach(panel => {
        expect(studioRegion).toContainElement(panel);
      });

      // Verify order by checking DOM positions
      const visualPos = panelElements[0]?.compareDocumentPosition(panelElements[1]!);
      const dataPos = panelElements[1]?.compareDocumentPosition(panelElements[2]!);
      expect(visualPos! & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
      expect(dataPos! & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });
  });

  describe('layout structure', () => {
    it('should have flexbox layout with column direction', () => {
      render(
        <TestWrapper>
          <AssetStudioLayout
            visualPanel={mockVisualPanel}
            dataPanel={mockDataPanel}
            metadataPanel={mockMetadataPanel}
          />
        </TestWrapper>,
      );

      const rootBox = screen.getByRole('region', { name: /asset studio/i });
      const styles = window.getComputedStyle(rootBox);
      expect(styles.display).toBe('flex');
      expect(styles.flexDirection).toBe('column');
    });

    it('should set height to 100%', () => {
      render(
        <TestWrapper>
          <AssetStudioLayout
            visualPanel={mockVisualPanel}
            dataPanel={mockDataPanel}
            metadataPanel={mockMetadataPanel}
          />
        </TestWrapper>,
      );

      const rootBox = screen.getByRole('region', { name: /asset studio/i });
      const styles = window.getComputedStyle(rootBox);
      expect(styles.height).toBe('100%');
    });
  });

  describe('responsive panel sizing', () => {
    it('should render visual panel with correct width constraints', () => {
      render(
        <TestWrapper>
          <AssetStudioLayout
            visualPanel={mockVisualPanel}
            dataPanel={mockDataPanel}
            metadataPanel={mockMetadataPanel}
          />
        </TestWrapper>,
      );

      const visualPanelContainer = screen.getByText('Mock Visual Panel').parentElement as HTMLElement;
      const styles = window.getComputedStyle(visualPanelContainer);
      expect(styles.width).toBe('30%');
      expect(styles.minWidth).toBe('280px');
      expect(styles.maxWidth).toBe('400px');
    });

    it('should render metadata panel with correct width constraints', () => {
      render(
        <TestWrapper>
          <AssetStudioLayout
            visualPanel={mockVisualPanel}
            dataPanel={mockDataPanel}
            metadataPanel={mockMetadataPanel}
          />
        </TestWrapper>,
      );

      const metadataPanelContainer = screen.getByText('Mock Metadata Panel').parentElement as HTMLElement;
      const styles = window.getComputedStyle(metadataPanelContainer);
      expect(styles.width).toBe('30%');
      expect(styles.minWidth).toBe('280px');
      expect(styles.maxWidth).toBe('400px');
    });

    it('should render data panel with flex grow', () => {
      render(
        <TestWrapper>
          <AssetStudioLayout
            visualPanel={mockVisualPanel}
            dataPanel={mockDataPanel}
            metadataPanel={mockMetadataPanel}
          />
        </TestWrapper>,
      );

      const dataPanelContainer = screen.getByText('Mock Data Panel').parentElement as HTMLElement;
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

      expect(screen.getByText('Mock Visual Panel')).toBeInTheDocument();
      expect(screen.getByText('Mock Data Panel')).toBeInTheDocument();
      expect(screen.getByText('Mock Metadata Panel')).toBeInTheDocument();
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

      expect(screen.getByText('Mock Visual Panel')).toBeInTheDocument();
      expect(screen.getByText('Mock Data Panel')).toBeInTheDocument();
      expect(screen.getByText('Mock Metadata Panel')).toBeInTheDocument();
    });
  });

  describe('overflow handling', () => {
    it('should set overflow auto on panel containers', () => {
      render(
        <TestWrapper>
          <AssetStudioLayout
            visualPanel={mockVisualPanel}
            dataPanel={mockDataPanel}
            metadataPanel={mockMetadataPanel}
          />
        </TestWrapper>,
      );

      const visualPanelContainer = screen.getByText('Mock Visual Panel').parentElement as HTMLElement;
      const dataPanelContainer = screen.getByText('Mock Data Panel').parentElement as HTMLElement;
      const metadataPanelContainer = screen.getByText('Mock Metadata Panel').parentElement as HTMLElement;

      expect(window.getComputedStyle(visualPanelContainer).overflow).toBe('auto');
      expect(window.getComputedStyle(dataPanelContainer).overflow).toBe('auto');
      expect(window.getComputedStyle(metadataPanelContainer).overflow).toBe('auto');
    });
  });
});
