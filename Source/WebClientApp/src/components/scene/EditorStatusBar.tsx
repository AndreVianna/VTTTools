import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';

export interface EditorStatusBarProps {
  cursorPosition?: { x: number; y: number };
  totalAssets?: number;
  selectedCount?: number;
  zoomPercentage?: number;
  activeTool?: string;
  gridSnapEnabled?: boolean;
}

export const EditorStatusBar: React.FC<EditorStatusBarProps> = ({
  cursorPosition,
  totalAssets = 0,
  selectedCount = 0,
  zoomPercentage = 100,
  activeTool,
  gridSnapEnabled
}) => {
  const theme = useTheme();

  return (
    <Box
      component="footer"
      sx={{
        height: 20,
        backgroundColor: theme.palette.background.paper,
        borderTop: `1px solid ${theme.palette.divider}`,
        display: 'flex',
        alignItems: 'center',
        px: 1,
        gap: 2,
        flexShrink: 0
      }}
    >
      {cursorPosition && (
        <Typography
          variant="caption"
          sx={{
            fontSize: 9,
            color: theme.palette.text.secondary,
            fontFamily: 'monospace'
          }}
        >
          ({cursorPosition.x}, {cursorPosition.y})
        </Typography>
      )}

      <Typography
        variant="caption"
        sx={{
          fontSize: 9,
          color: theme.palette.text.secondary
        }}
      >
        Assets: {totalAssets}
      </Typography>

      {selectedCount > 0 && (
        <Typography
          variant="caption"
          sx={{
            fontSize: 9,
            color: theme.palette.text.secondary
          }}
        >
          Selected: {selectedCount}
        </Typography>
      )}

      <Box sx={{ flexGrow: 1 }} />

      {activeTool && (
        <Typography
          variant="caption"
          sx={{
            fontSize: 9,
            color: theme.palette.text.secondary
          }}
        >
          Tool: {activeTool}
        </Typography>
      )}

      {gridSnapEnabled !== undefined && (
        <Typography
          variant="caption"
          sx={{
            fontSize: 9,
            color: theme.palette.text.secondary
          }}
        >
          Snap: {gridSnapEnabled ? 'ON' : 'OFF'}
        </Typography>
      )}

      <Typography
        variant="caption"
        sx={{
          fontSize: 9,
          color: theme.palette.text.secondary,
          fontFamily: 'monospace'
        }}
      >
        {Math.round(zoomPercentage)}%
      </Typography>
    </Box>
  );
};
