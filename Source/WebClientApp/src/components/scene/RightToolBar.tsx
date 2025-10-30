import React, { useState } from 'react';
import { Box, IconButton, Drawer, Tooltip, useTheme } from '@mui/material';
import {
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  Visibility as VisibilityIcon,
  Tune as SettingsIcon
} from '@mui/icons-material';

export interface RightToolBarProps {
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onLayersClick?: () => void;
  onSettingsClick?: () => void;
  zoomPercentage?: number;
}

export const RightToolBar: React.FC<RightToolBarProps> = ({
  onZoomIn,
  onZoomOut,
  onLayersClick,
  onSettingsClick,
  _zoomPercentage = 100
}) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);
  const [activePanel, setActivePanel] = useState<'layers' | 'settings' | null>(null);

  const handleToolClick = (panel: 'layers' | 'settings', callback?: () => void) => {
    if (activePanel === panel && expanded) {
      setExpanded(false);
      setActivePanel(null);
    } else {
      setExpanded(true);
      setActivePanel(panel);
      callback?.();
    }
  };

  return (
    <>
      <Box
        sx={{
          position: 'absolute',
          right: 0,
          top: 36,
          bottom: 0,
          width: 32,
          backgroundColor: theme.palette.background.paper,
          borderLeft: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          flexDirection: 'column',
          gap: 0.25,
          py: 0.5,
          zIndex: 1000
        }}
      >
        <Tooltip title="Zoom In" placement="left">
          <IconButton
            size="small"
            onClick={onZoomIn}
            sx={{
              width: 28,
              height: 28,
              borderRadius: 0,
              mx: 'auto',
              '&:hover': {
                backgroundColor: theme.palette.action.hover
              }
            }}
          >
            <ZoomInIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Zoom Out" placement="left">
          <IconButton
            size="small"
            onClick={onZoomOut}
            sx={{
              width: 28,
              height: 28,
              borderRadius: 0,
              mx: 'auto',
              '&:hover': {
                backgroundColor: theme.palette.action.hover
              }
            }}
          >
            <ZoomOutIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>

        <Box sx={{ height: 1, backgroundColor: theme.palette.divider, my: 0.5 }} />

        <Tooltip title="Layers" placement="left">
          <IconButton
            size="small"
            onClick={() => handleToolClick('layers', onLayersClick)}
            sx={{
              width: 28,
              height: 28,
              borderRadius: 0,
              mx: 'auto',
              backgroundColor: activePanel === 'layers' ? theme.palette.action.selected : 'transparent',
              '&:hover': {
                backgroundColor: theme.palette.action.hover
              }
            }}
          >
            <VisibilityIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Settings" placement="left">
          <IconButton
            size="small"
            onClick={() => handleToolClick('settings', onSettingsClick)}
            sx={{
              width: 28,
              height: 28,
              borderRadius: 0,
              mx: 'auto',
              backgroundColor: activePanel === 'settings' ? theme.palette.action.selected : 'transparent',
              '&:hover': {
                backgroundColor: theme.palette.action.hover
              }
            }}
          >
            <SettingsIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
      </Box>

      <Drawer
        variant="persistent"
        anchor="right"
        open={expanded}
        sx={{
          '& .MuiDrawer-paper': {
            width: 280,
            right: 32,
            top: 64,
            bottom: 20,
            boxSizing: 'border-box',
            backgroundColor: theme.palette.background.paper,
            borderLeft: `1px solid ${theme.palette.divider}`,
            zIndex: 999
          }
        }}
      >
        <Box sx={{ p: 1 }}>
          {activePanel === 'layers' && (
            <Box>Layers Panel Content</Box>
          )}
          {activePanel === 'settings' && (
            <Box>Settings Panel Content</Box>
          )}
        </Box>
      </Drawer>
    </>
  );
};
