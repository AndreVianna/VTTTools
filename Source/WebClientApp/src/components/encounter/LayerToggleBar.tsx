import {
  Wallpaper as BackgroundIcon,
  Group as MonstersIcon,
  GridOn as GridIcon,
  ViewInAr as ObjectsIcon,
  Layers as OverlaysIcon,
  Restore as ResetIcon,
  BorderStyle as StructuresIcon,
} from '@mui/icons-material';
import { Box, IconButton, Tooltip, useTheme } from '@mui/material';
import type React from 'react';

export interface LayerVisibility {
  background: boolean;
  grid: boolean;
  structures: boolean;
  objects: boolean;
  monsters: boolean;
  overlays: boolean;
}

export interface LayerToggleBarProps {
  visible: boolean;
  layers: LayerVisibility;
  onLayerToggle: (layer: keyof LayerVisibility) => void;
  onResetLayers: () => void;
}

export const LayerToggleBar: React.FC<LayerToggleBarProps> = ({ visible, layers, onLayerToggle, onResetLayers }) => {
  const theme = useTheme();

  if (!visible) return null;

  const layerConfigs = [
    {
      key: 'background' as keyof LayerVisibility,
      icon: BackgroundIcon,
      label: 'Background',
    },
    { key: 'grid' as keyof LayerVisibility, icon: GridIcon, label: 'Grid' },
    {
      key: 'structures' as keyof LayerVisibility,
      icon: StructuresIcon,
      label: 'Structures',
    },
    {
      key: 'objects' as keyof LayerVisibility,
      icon: ObjectsIcon,
      label: 'Objects',
    },
    {
      key: 'monsters' as keyof LayerVisibility,
      icon: MonstersIcon,
      label: 'Monsters',
    },
    {
      key: 'overlays' as keyof LayerVisibility,
      icon: OverlaysIcon,
      label: 'Overlays',
    },
  ];

  return (
    <Box
      sx={{
        position: 'absolute',
        left: 32,
        top: 36,
        height: 32,
        backgroundColor: theme.palette.background.paper,
        borderTop: `1px solid ${theme.palette.divider}`,
        borderBottom: `1px solid ${theme.palette.divider}`,
        borderRight: `1px solid ${theme.palette.divider}`,
        display: 'flex',
        alignItems: 'center',
        gap: 0,
        zIndex: 1001,
        boxShadow: 2,
      }}
    >
      {layerConfigs.map(({ key, icon: Icon, label }) => (
        <Tooltip key={key} title={label} placement='bottom'>
          <IconButton
            size='small'
            onClick={() => onLayerToggle(key)}
            sx={{
              width: 32,
              height: 32,
              borderRadius: 0,
              backgroundColor: layers[key] ? theme.palette.action.selected : 'transparent',
              opacity: layers[key] ? 1 : 0.5,
              '&:hover': {
                backgroundColor: theme.palette.action.hover,
              },
            }}
          >
            <Icon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
      ))}

      <Box
        sx={{
          width: 1,
          height: 20,
          backgroundColor: theme.palette.divider,
          mx: 0.25,
        }}
      />

      <Tooltip title='Reset All Layers' placement='bottom'>
        <IconButton
          size='small'
          onClick={onResetLayers}
          sx={{
            width: 32,
            height: 32,
            borderRadius: 0,
            '&:hover': {
              backgroundColor: theme.palette.action.hover,
            },
          }}
        >
          <ResetIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Tooltip>
    </Box>
  );
};
