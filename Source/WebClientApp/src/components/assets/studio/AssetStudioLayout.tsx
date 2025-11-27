import React from 'react';
import { Box, useTheme } from '@mui/material';

export interface AssetStudioLayoutProps {
  visualPanel: React.ReactNode;
  dataPanel: React.ReactNode;
  metadataPanel: React.ReactNode;
  toolbar?: React.ReactNode;
}

export const AssetStudioLayout: React.FC<AssetStudioLayoutProps> = ({
  visualPanel,
  dataPanel,
  metadataPanel,
  toolbar,
}) => {
  const theme = useTheme();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {toolbar && (
        <Box
          sx={{
            borderBottom: `1px solid ${theme.palette.divider}`,
            flexShrink: 0,
          }}
        >
          {toolbar}
        </Box>
      )}

      <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
        {/* Visual Identity Panel - 30% */}
        <Box
          sx={{
            width: '30%',
            minWidth: 280,
            maxWidth: 400,
            borderRight: `1px solid ${theme.palette.divider}`,
            overflow: 'auto',
            backgroundColor: theme.palette.background.paper,
          }}
        >
          {visualPanel}
        </Box>

        {/* Data & Stats Panel - 40% */}
        <Box
          sx={{
            flexGrow: 1,
            minWidth: 400,
            overflow: 'auto',
            backgroundColor: theme.palette.background.default,
          }}
        >
          {dataPanel}
        </Box>

        {/* Metadata Panel - 30% */}
        <Box
          sx={{
            width: '30%',
            minWidth: 280,
            maxWidth: 400,
            borderLeft: `1px solid ${theme.palette.divider}`,
            overflow: 'auto',
            backgroundColor: theme.palette.background.paper,
          }}
        >
          {metadataPanel}
        </Box>
      </Box>
    </Box>
  );
};

export default AssetStudioLayout;
