import React from 'react';
import { Box, useTheme } from '@mui/material';

const LEFT_SIDEBAR_WIDTH = 250;
const RIGHT_SIDEBAR_WIDTH = 300;

export interface AssetBrowserLayoutProps {
  leftSidebar: React.ReactNode;
  mainContent: React.ReactNode;
  rightSidebar?: React.ReactNode;
  rightSidebarOpen: boolean;
}

export const AssetBrowserLayout: React.FC<AssetBrowserLayoutProps> = ({
  leftSidebar,
  mainContent,
  rightSidebar,
  rightSidebarOpen,
}) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'flex',
        height: 'calc(100vh - 64px)',
        overflow: 'hidden',
        backgroundColor: theme.palette.background.default,
      }}
    >
      {/* Left Sidebar - Facet/Taxonomy */}
      <Box
        sx={{
          width: LEFT_SIDEBAR_WIDTH,
          flexShrink: 0,
          borderRight: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.paper,
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {leftSidebar}
      </Box>

      {/* Main Content - Results Area */}
      <Box
        sx={{
          flexGrow: 1,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
        }}
      >
        {mainContent}
      </Box>

      {/* Right Sidebar - Inspector Panel */}
      <Box
        sx={{
          width: rightSidebarOpen ? RIGHT_SIDEBAR_WIDTH : 0,
          flexShrink: 0,
          borderLeft: rightSidebarOpen ? `1px solid ${theme.palette.divider}` : 'none',
          backgroundColor: theme.palette.background.paper,
          overflow: rightSidebarOpen ? 'auto' : 'hidden',
          transition: theme.transitions.create(['width', 'border-left'], {
            duration: theme.transitions.duration.shorter,
          }),
        }}
      >
        {rightSidebarOpen && rightSidebar}
      </Box>
    </Box>
  );
};

export default AssetBrowserLayout;
