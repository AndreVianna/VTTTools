import React, { useState } from 'react';
import { Box, IconButton, Tooltip, ButtonGroup, Collapse, useTheme } from '@mui/material';
import {
  BorderStyle as WallIcon,
  Polyline as RegionIcon,
  Lightbulb as LightIcon,
  Undo as UndoIcon,
  Redo as RedoIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  ZoomOutMap as ZoomResetIcon,
  GridOn as GridIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import type { DrawingMode } from './StructureToolbar';

export interface TopToolBarProps {
  drawingMode?: DrawingMode;
  onDrawingModeChange?: (mode: DrawingMode) => void;
  onUndoClick?: () => void;
  onRedoClick?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onZoomReset?: () => void;
  onGridToggle?: () => void;
  onClearSelection?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  gridVisible?: boolean;
}

export const TopToolBar: React.FC<TopToolBarProps> = ({
  drawingMode,
  onDrawingModeChange,
  onUndoClick,
  onRedoClick,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onGridToggle,
  onClearSelection,
  canUndo = false,
  canRedo = false,
  gridVisible = true
}) => {
  const theme = useTheme();
  const [expanded] = useState(true);

  return (
    <Box
      sx={{
        position: 'absolute',
        left: 0,
        top: 0,
        right: 0,
        zIndex: 998
      }}
    >
      <Collapse in={expanded}>
        <Box
          sx={{
            height: 36,
            backgroundColor: theme.palette.background.paper,
            borderBottom: `1px solid ${theme.palette.divider}`,
            display: 'flex',
            alignItems: 'center',
            px: 1,
            gap: 1
          }}
        >
          <ButtonGroup variant="contained" size="small" sx={{ height: 28 }}>
            <Tooltip title="Wall (W)">
              <IconButton
                size="small"
                onClick={() => onDrawingModeChange?.('Wall')}
                sx={{
                  width: 28,
                  height: 28,
                  backgroundColor: drawingMode === 'Wall' ? theme.palette.primary.main : theme.palette.action.hover,
                  color: drawingMode === 'Wall' ? theme.palette.primary.contrastText : theme.palette.text.primary,
                  '&:hover': {
                    backgroundColor: drawingMode === 'Wall' ? theme.palette.primary.dark : theme.palette.action.selected
                  }
                }}
              >
                <WallIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>

            <Tooltip title="Region (R)">
              <IconButton
                size="small"
                onClick={() => onDrawingModeChange?.('region')}
                sx={{
                  width: 28,
                  height: 28,
                  backgroundColor: drawingMode === 'region' ? theme.palette.primary.main : theme.palette.action.hover,
                  color: drawingMode === 'region' ? theme.palette.primary.contrastText : theme.palette.text.primary,
                  '&:hover': {
                    backgroundColor: drawingMode === 'region' ? theme.palette.primary.dark : theme.palette.action.selected
                  }
                }}
              >
                <RegionIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>

            <Tooltip title="Light Source (L)">
              <IconButton
                size="small"
                onClick={() => onDrawingModeChange?.('source')}
                sx={{
                  width: 28,
                  height: 28,
                  backgroundColor: drawingMode === 'source' ? theme.palette.primary.main : theme.palette.action.hover,
                  color: drawingMode === 'source' ? theme.palette.primary.contrastText : theme.palette.text.primary,
                  '&:hover': {
                    backgroundColor: drawingMode === 'source' ? theme.palette.primary.dark : theme.palette.action.selected
                  }
                }}
              >
                <LightIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          </ButtonGroup>

          <Box sx={{ width: 1, height: 20, backgroundColor: theme.palette.divider }} />

          <Tooltip title="Undo">
            <span>
              <IconButton
                size="small"
                onClick={onUndoClick}
                disabled={!canUndo}
                sx={{ width: 28, height: 28 }}
              >
                <UndoIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title="Redo">
            <span>
              <IconButton
                size="small"
                onClick={onRedoClick}
                disabled={!canRedo}
                sx={{ width: 28, height: 28 }}
              >
                <RedoIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </span>
          </Tooltip>

          <Box sx={{ width: 1, height: 20, backgroundColor: theme.palette.divider }} />

          <Tooltip title="Zoom In">
            <IconButton
              size="small"
              onClick={onZoomIn}
              sx={{ width: 28, height: 28 }}
            >
              <ZoomInIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Zoom Out">
            <IconButton
              size="small"
              onClick={onZoomOut}
              sx={{ width: 28, height: 28 }}
            >
              <ZoomOutIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Reset Zoom">
            <IconButton
              size="small"
              onClick={onZoomReset}
              sx={{ width: 28, height: 28 }}
            >
              <ZoomResetIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>

          <Box sx={{ width: 1, height: 20, backgroundColor: theme.palette.divider }} />

          <Tooltip title="Toggle Grid">
            <IconButton
              size="small"
              onClick={onGridToggle}
              sx={{
                width: 28,
                height: 28,
                backgroundColor: gridVisible ? theme.palette.action.selected : 'transparent'
              }}
            >
              <GridIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Clear Selection (X)">
            <IconButton
              size="small"
              onClick={onClearSelection}
              sx={{ width: 28, height: 28 }}
            >
              <ClearIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Collapse>
    </Box>
  );
};
