import {
  Clear as ClearIcon,
  Pets as MonstersIcon,
  Cloud as FogOfWarIcon,
  GridOn as GridIcon,
  ViewInAr as ObjectsIcon,
  Person as CharactersIcon,
  Redo as RedoIcon,
  Layers as RegionsIcon,
  LightMode as LightsIcon,
  VolumeUp as SoundsIcon,
  Undo as UndoIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  BorderAll as WallsIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  ZoomOutMap as ZoomResetIcon,
} from '@mui/icons-material';
import { Box, Collapse, IconButton, Tooltip, useTheme } from '@mui/material';
import type React from 'react';
import { useState } from 'react';

export type LayerVisibilityType =
  | 'regions'
  | 'walls'
  | 'objects'
  | 'monsters'
  | 'characters'
  | 'lights'
  | 'sounds'
  | 'fogOfWar';

export interface TopToolBarProps {
  onUndoClick?: () => void;
  onRedoClick?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onZoomReset?: () => void;
  onGridToggle?: () => void;
  onClearSelection?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  /** Whether the encounter has a grid configured (not NoGrid) */
  hasGrid?: boolean;
  gridVisible?: boolean;
  layerVisibility?: Record<LayerVisibilityType, boolean>;
  onLayerVisibilityToggle?: (layer: LayerVisibilityType) => void;
  onShowAllLayers?: () => void;
  onHideAllLayers?: () => void;
}

export const TopToolBar: React.FC<TopToolBarProps> = ({
  onUndoClick,
  onRedoClick,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onGridToggle,
  onClearSelection,
  canUndo = false,
  canRedo = false,
  hasGrid = false,
  gridVisible = true,
  layerVisibility,
  onLayerVisibilityToggle,
  onShowAllLayers,
  onHideAllLayers,
}) => {
  const theme = useTheme();
  const [expanded] = useState(true);

  const visibilityLayers: Array<{
    key: LayerVisibilityType;
    icon: typeof RegionsIcon;
    label: string;
  }> = [
    { key: 'walls', icon: WallsIcon, label: 'Walls & Openings' },
    { key: 'regions', icon: RegionsIcon, label: 'Regions' },
    { key: 'objects', icon: ObjectsIcon, label: 'Objects' },
    { key: 'monsters', icon: MonstersIcon, label: 'Monsters' },
    { key: 'characters', icon: CharactersIcon, label: 'Characters' },
    { key: 'lights', icon: LightsIcon, label: 'Lights' },
    { key: 'sounds', icon: SoundsIcon, label: 'Sounds' },
    { key: 'fogOfWar', icon: FogOfWarIcon, label: 'Fog of War' },
  ];

  return (
    <Box
      sx={{
        position: 'absolute',
        left: 0,
        top: 0,
        right: 0,
        zIndex: 998,
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
            gap: 0.5,
          }}
        >
          {/* Visibility Controls */}
          {layerVisibility && onLayerVisibilityToggle && (
            <>
              <Tooltip title='Show All'>
                <IconButton
                  size='small'
                  onClick={onShowAllLayers}
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: 1,
                  }}
                >
                  <VisibilityIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>

              {hasGrid && (
                <Tooltip title='Toggle Grid'>
                  <IconButton
                    size='small'
                    onClick={onGridToggle}
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: 1,
                      opacity: gridVisible ? 1 : 0.4,
                      backgroundColor: gridVisible ? theme.palette.action.selected : 'transparent',
                      '&:hover': {
                        backgroundColor: gridVisible ? theme.palette.action.hover : theme.palette.action.hover,
                      },
                    }}
                  >
                    <GridIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
              )}

              {visibilityLayers.map(({ key, icon: Icon, label }) => {
                const isVisible = layerVisibility[key] ?? true;
                return (
                  <Tooltip key={key} title={`${label} ${isVisible ? 'Visible' : 'Hidden'}`}>
                    <IconButton
                      size='small'
                      onClick={() => onLayerVisibilityToggle(key)}
                      sx={{
                        width: 28,
                        height: 28,
                        borderRadius: 1,
                        opacity: isVisible ? 1 : 0.4,
                        backgroundColor: isVisible ? theme.palette.action.selected : 'transparent',
                        '&:hover': {
                          backgroundColor: isVisible ? theme.palette.action.hover : theme.palette.action.hover,
                        },
                      }}
                    >
                      <Icon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                );
              })}

              <Tooltip title='Hide All'>
                <IconButton
                  size='small'
                  onClick={onHideAllLayers}
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: 1,
                  }}
                >
                  <VisibilityOffIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>

              <Box
                sx={{
                  width: 1,
                  height: 20,
                  backgroundColor: theme.palette.divider,
                  mx: 0.5,
                }}
              />
            </>
          )}

          <Tooltip title='Undo'>
            <span>
              <IconButton size='small' onClick={onUndoClick} disabled={!canUndo} sx={{ width: 28, height: 28 }}>
                <UndoIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title='Redo'>
            <span>
              <IconButton size='small' onClick={onRedoClick} disabled={!canRedo} sx={{ width: 28, height: 28 }}>
                <RedoIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </span>
          </Tooltip>

          <Box
            sx={{
              width: 1,
              height: 20,
              backgroundColor: theme.palette.divider,
            }}
          />

          <Tooltip title='Zoom In'>
            <IconButton size='small' onClick={onZoomIn} sx={{ width: 28, height: 28 }}>
              <ZoomInIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>

          <Tooltip title='Zoom Out'>
            <IconButton size='small' onClick={onZoomOut} sx={{ width: 28, height: 28 }}>
              <ZoomOutIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>

          <Tooltip title='Reset Zoom'>
            <IconButton size='small' onClick={onZoomReset} sx={{ width: 28, height: 28 }}>
              <ZoomResetIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>

          <Box
            sx={{
              width: 1,
              height: 20,
              backgroundColor: theme.palette.divider,
            }}
          />

          <Tooltip title='Clear Selection (X)'>
            <IconButton size='small' onClick={onClearSelection} sx={{ width: 28, height: 28 }}>
              <ClearIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Collapse>
    </Box>
  );
};
