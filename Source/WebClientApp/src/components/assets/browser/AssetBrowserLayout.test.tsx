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
    leftSidebar: <div data-mock="left-sidebar">Left Sidebar Content</div>,
    mainContent: <div data-mock="main-content">Main Content Area</div>,
    rightSidebar: <div data-mock="right-sidebar">Right Sidebar Content</div>,
    rightSidebarOpen: false,
  };

  describe('rendering', () => {
    it('should render left sidebar', () => {
      render(
        <TestWrapper>
          <AssetBrowserLayout {...defaultProps} />
        </TestWrapper>,
      );

      expect(screen.getByText('Left Sidebar Content')).toBeInTheDocument();
    });

    it('should render main content area', () => {
      render(
        <TestWrapper>
          <AssetBrowserLayout {...defaultProps} />
        </TestWrapper>,
      );

      expect(screen.getByText('Main Content Area')).toBeInTheDocument();
    });

    it('should render all three sections when right sidebar is open', () => {
      render(
        <TestWrapper>
          <AssetBrowserLayout {...defaultProps} rightSidebarOpen={true} />
        </TestWrapper>,
      );

      expect(screen.getByText('Left Sidebar Content')).toBeInTheDocument();
      expect(screen.getByText('Main Content Area')).toBeInTheDocument();
      expect(screen.getByText('Right Sidebar Content')).toBeInTheDocument();
    });

    it('should hide right sidebar when rightSidebarOpen is false', () => {
      render(
        <TestWrapper>
          <AssetBrowserLayout {...defaultProps} rightSidebarOpen={false} />
        </TestWrapper>,
      );

      expect(screen.getByText('Left Sidebar Content')).toBeInTheDocument();
      expect(screen.getByText('Main Content Area')).toBeInTheDocument();
      expect(screen.queryByText('Right Sidebar Content')).not.toBeInTheDocument();
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

      expect(screen.getByText('Left Sidebar Content')).toBeInTheDocument();
      expect(screen.getByText('Main Content Area')).toBeInTheDocument();
      expect(screen.queryByText('Right Sidebar Content')).not.toBeInTheDocument();
    });
  });

  describe('right sidebar states', () => {
    it('should show right sidebar when rightSidebarOpen is true', () => {
      const { rerender } = render(
        <TestWrapper>
          <AssetBrowserLayout {...defaultProps} rightSidebarOpen={false} />
        </TestWrapper>,
      );

      expect(screen.queryByText('Right Sidebar Content')).not.toBeInTheDocument();

      rerender(
        <TestWrapper>
          <AssetBrowserLayout {...defaultProps} rightSidebarOpen={true} />
        </TestWrapper>,
      );

      expect(screen.getByText('Right Sidebar Content')).toBeInTheDocument();
    });

    it('should hide right sidebar when rightSidebarOpen changes to false', () => {
      const { rerender } = render(
        <TestWrapper>
          <AssetBrowserLayout {...defaultProps} rightSidebarOpen={true} />
        </TestWrapper>,
      );

      expect(screen.getByText('Right Sidebar Content')).toBeInTheDocument();

      rerender(
        <TestWrapper>
          <AssetBrowserLayout {...defaultProps} rightSidebarOpen={false} />
        </TestWrapper>,
      );

      expect(screen.queryByText('Right Sidebar Content')).not.toBeInTheDocument();
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

      expect(screen.getByText('Left Sidebar Content')).toBeInTheDocument();
      expect(screen.getByText('Main Content Area')).toBeInTheDocument();
      expect(screen.getByText('Right Sidebar Content')).toBeInTheDocument();
    });

    it('should render correctly in light mode', () => {
      const lightTheme = createTheme({ palette: { mode: 'light' } });

      render(
        <ThemeProvider theme={lightTheme}>
          <AssetBrowserLayout {...defaultProps} rightSidebarOpen={true} />
        </ThemeProvider>,
      );

      expect(screen.getByText('Left Sidebar Content')).toBeInTheDocument();
      expect(screen.getByText('Main Content Area')).toBeInTheDocument();
      expect(screen.getByText('Right Sidebar Content')).toBeInTheDocument();
    });
  });
});
