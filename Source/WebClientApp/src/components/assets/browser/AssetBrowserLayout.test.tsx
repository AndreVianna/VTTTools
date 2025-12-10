import { createTheme, ThemeProvider } from '@mui/material/styles';
import { render, screen } from '@testing-library/react';
import type React from 'react';
import { describe, expect, it } from 'vitest';
import { AssetBrowserLayout, type AssetBrowserLayoutProps } from './AssetBrowserLayout';

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = createTheme({ palette: { mode: 'light' } });
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};
TestWrapper.displayName = 'TestWrapper';

describe('AssetBrowserLayout', () => {
  const defaultProps: AssetBrowserLayoutProps = {
    leftSidebar: <div data-testid="left-sidebar">Left Sidebar</div>,
    mainContent: <div data-testid="main-content">Main Content</div>,
    rightSidebar: <div data-testid="right-sidebar">Right Sidebar</div>,
    rightSidebarOpen: false,
  };

  describe('rendering', () => {
    it('should render left sidebar', () => {
      render(
        <TestWrapper>
          <AssetBrowserLayout {...defaultProps} />
        </TestWrapper>,
      );

      expect(screen.getByTestId('left-sidebar')).toBeInTheDocument();
      expect(screen.getByText('Left Sidebar')).toBeInTheDocument();
    });

    it('should render main content area', () => {
      render(
        <TestWrapper>
          <AssetBrowserLayout {...defaultProps} />
        </TestWrapper>,
      );

      expect(screen.getByTestId('main-content')).toBeInTheDocument();
      expect(screen.getByText('Main Content')).toBeInTheDocument();
    });

    it('should render all three sections when right sidebar is open', () => {
      render(
        <TestWrapper>
          <AssetBrowserLayout {...defaultProps} rightSidebarOpen={true} />
        </TestWrapper>,
      );

      expect(screen.getByTestId('left-sidebar')).toBeInTheDocument();
      expect(screen.getByTestId('main-content')).toBeInTheDocument();
      expect(screen.getByTestId('right-sidebar')).toBeInTheDocument();
    });

    it('should hide right sidebar when rightSidebarOpen is false', () => {
      render(
        <TestWrapper>
          <AssetBrowserLayout {...defaultProps} rightSidebarOpen={false} />
        </TestWrapper>,
      );

      expect(screen.getByTestId('left-sidebar')).toBeInTheDocument();
      expect(screen.getByTestId('main-content')).toBeInTheDocument();
      expect(screen.queryByTestId('right-sidebar')).not.toBeInTheDocument();
    });

    it('should render without right sidebar prop', () => {
      const propsWithoutRightSidebar = {
        ...defaultProps,
        rightSidebar: undefined,
      };

      render(
        <TestWrapper>
          <AssetBrowserLayout {...propsWithoutRightSidebar} rightSidebarOpen={true} />
        </TestWrapper>,
      );

      expect(screen.getByTestId('left-sidebar')).toBeInTheDocument();
      expect(screen.getByTestId('main-content')).toBeInTheDocument();
      expect(screen.queryByTestId('right-sidebar')).not.toBeInTheDocument();
    });
  });

  describe('right sidebar states', () => {
    it('should show right sidebar when rightSidebarOpen is true', () => {
      const { rerender } = render(
        <TestWrapper>
          <AssetBrowserLayout {...defaultProps} rightSidebarOpen={false} />
        </TestWrapper>,
      );

      expect(screen.queryByTestId('right-sidebar')).not.toBeInTheDocument();

      rerender(
        <TestWrapper>
          <AssetBrowserLayout {...defaultProps} rightSidebarOpen={true} />
        </TestWrapper>,
      );

      expect(screen.getByTestId('right-sidebar')).toBeInTheDocument();
      expect(screen.getByText('Right Sidebar')).toBeInTheDocument();
    });

    it('should hide right sidebar when rightSidebarOpen changes to false', () => {
      const { rerender } = render(
        <TestWrapper>
          <AssetBrowserLayout {...defaultProps} rightSidebarOpen={true} />
        </TestWrapper>,
      );

      expect(screen.getByTestId('right-sidebar')).toBeInTheDocument();

      rerender(
        <TestWrapper>
          <AssetBrowserLayout {...defaultProps} rightSidebarOpen={false} />
        </TestWrapper>,
      );

      expect(screen.queryByTestId('right-sidebar')).not.toBeInTheDocument();
    });
  });

  describe('theme support', () => {
    it('should render correctly in dark mode', () => {
      const darkTheme = createTheme({ palette: { mode: 'dark' } });

      render(
        <ThemeProvider theme={darkTheme}>
          <AssetBrowserLayout {...defaultProps} rightSidebarOpen={true} />
        </ThemeProvider>,
      );

      expect(screen.getByTestId('left-sidebar')).toBeInTheDocument();
      expect(screen.getByTestId('main-content')).toBeInTheDocument();
      expect(screen.getByTestId('right-sidebar')).toBeInTheDocument();
    });

    it('should render correctly in light mode', () => {
      const lightTheme = createTheme({ palette: { mode: 'light' } });

      render(
        <ThemeProvider theme={lightTheme}>
          <AssetBrowserLayout {...defaultProps} rightSidebarOpen={true} />
        </ThemeProvider>,
      );

      expect(screen.getByTestId('left-sidebar')).toBeInTheDocument();
      expect(screen.getByTestId('main-content')).toBeInTheDocument();
      expect(screen.getByTestId('right-sidebar')).toBeInTheDocument();
    });
  });
});
