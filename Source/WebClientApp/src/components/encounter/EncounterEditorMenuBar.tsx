// GENERATED: 2025-10-04 by Claude Code - Encounter Editor Redesign
// LAYER: UI (Component)

/**
 * EncounterEditorMenuBar Component
 * Top menu bar with hierarchical dropdown menus
 * - Stage: Background (Upload), Grid (Type, Size, Offsets, Snap)
 * - Structures: (Coming soon)
 * - Assets: (Coming soon)
 *
 * Modifier Key Controls for Grid Size/Offset Adjustments:
 * - Default (no modifier): ±10
 * - Shift: ±1
 * - Ctrl: ±0.1
 * - Ctrl+Shift: ±0.01
 *
 * All changes apply immediately (no save button)
 */

import { AssetPicker } from '@components/common';
import {
  ExpandMore as ExpandMoreIcon,
  Redo as RedoIcon,
  RestartAlt as RestartAltIcon,
  Undo as UndoIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
} from '@mui/icons-material';
import { Box, Button, IconButton, Menu, Paper, Typography } from '@mui/material';
import type React from 'react';
import { useState } from 'react';
import { useUndoRedoContext } from '@/hooks/useUndoRedo';
import { type Asset, AssetKind } from '@/types/domain';

export interface EncounterEditorMenuBarProps {
  zoomPercentage: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset?: () => void;
  onAssetSelect: (asset: Asset) => void;
  viewport: { x: number; y: number };
}

export const EncounterEditorMenuBar: React.FC<EncounterEditorMenuBarProps> = ({
  zoomPercentage,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onAssetSelect,
  viewport,
}) => {
  const { canUndo, canRedo, undo, redo } = useUndoRedoContext();
  const [structuresMenuAnchor, setStructuresMenuAnchor] = useState<null | HTMLElement>(null);
  const [objectsMenuAnchor, setObjectsMenuAnchor] = useState<null | HTMLElement>(null);
  const [creaturesMenuAnchor, setCreaturesMenuAnchor] = useState<null | HTMLElement>(null);

  // Asset picker state
  const [assetPickerOpen, setAssetPickerOpen] = useState(false);
  const [pickerKind, setPickerKind] = useState<AssetKind | undefined>(undefined);

  const handleStructuresMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setStructuresMenuAnchor(event.currentTarget);
  };

  const handleStructuresMenuClose = () => {
    setStructuresMenuAnchor(null);
  };

  const handleObjectsMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setObjectsMenuAnchor(event.currentTarget);
  };

  const handleObjectsMenuClose = () => {
    setObjectsMenuAnchor(null);
  };

  const handleCreaturesMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setCreaturesMenuAnchor(event.currentTarget);
  };

  const handleCreaturesMenuClose = () => {
    setCreaturesMenuAnchor(null);
  };

  // Asset picker handlers
  const handleOpenAssetPicker = (kind?: AssetKind) => {
    setPickerKind(kind);
    setAssetPickerOpen(true);
    // Close all menus
    handleStructuresMenuClose();
    handleObjectsMenuClose();
    handleCreaturesMenuClose();
  };

  const handleAssetSelected = (asset: Asset) => {
    setAssetPickerOpen(false);
    onAssetSelect(asset);
  };

  return (
    <Paper elevation={1} sx={{ p: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
      {/* Structures Menu - Static Assets (walls, doors, terrain) */}
      <Button
        onClick={handleStructuresMenuOpen}
        endIcon={<ExpandMoreIcon />}
        sx={{ textTransform: 'none', minWidth: 'auto', px: 1 }}
        size='small'
      >
        Structures
      </Button>
      <Menu
        anchorEl={structuresMenuAnchor}
        open={Boolean(structuresMenuAnchor)}
        onClose={handleStructuresMenuClose}
        PaperProps={{
          sx: { minWidth: 200, p: 1.5 },
        }}
      >
        <Typography variant='subtitle2' sx={{ mb: 1, fontSize: '0.875rem' }}>
          Static Assets
        </Typography>
        <Typography variant='caption' color='text.secondary' sx={{ fontSize: '0.75rem', display: 'block', mb: 1 }}>
          Structural elements (locked in place)
        </Typography>
        <Button fullWidth variant='outlined' size='small' onClick={() => handleOpenAssetPicker(AssetKind.Object)}>
          Browse Structures
        </Button>
      </Menu>

      {/* Objects Menu - Passive Assets (furniture, items) */}
      <Button
        onClick={handleObjectsMenuOpen}
        endIcon={<ExpandMoreIcon />}
        sx={{ textTransform: 'none', minWidth: 'auto', px: 1 }}
        size='small'
      >
        Objects
      </Button>
      <Menu
        anchorEl={objectsMenuAnchor}
        open={Boolean(objectsMenuAnchor)}
        onClose={handleObjectsMenuClose}
        PaperProps={{
          sx: { minWidth: 200, p: 1.5 },
        }}
      >
        <Typography variant='subtitle2' sx={{ mb: 1, fontSize: '0.875rem' }}>
          Passive Assets
        </Typography>
        <Typography variant='caption' color='text.secondary' sx={{ fontSize: '0.75rem', display: 'block', mb: 1 }}>
          Manipulable objects (furniture, items)
        </Typography>
        <Button fullWidth variant='outlined' size='small' onClick={() => handleOpenAssetPicker(AssetKind.Object)}>
          Browse Objects
        </Button>
      </Menu>

      {/* Creatures Menu - Active Assets (characters, NPCs, monsters) */}
      <Button
        onClick={handleCreaturesMenuOpen}
        endIcon={<ExpandMoreIcon />}
        sx={{ textTransform: 'none', minWidth: 'auto', px: 1 }}
        size='small'
      >
        Creatures
      </Button>
      <Menu
        anchorEl={creaturesMenuAnchor}
        open={Boolean(creaturesMenuAnchor)}
        onClose={handleCreaturesMenuClose}
        PaperProps={{
          sx: { minWidth: 200, p: 1.5 },
        }}
      >
        <Typography variant='subtitle2' sx={{ mb: 1, fontSize: '0.875rem' }}>
          Active Assets
        </Typography>
        <Typography variant='caption' color='text.secondary' sx={{ fontSize: '0.75rem', display: 'block', mb: 1 }}>
          Interactive creatures (characters, NPCs, monsters)
        </Typography>
        <Button fullWidth variant='outlined' size='small' onClick={() => handleOpenAssetPicker(AssetKind.Creature)}>
          Browse Creatures
        </Button>
      </Menu>

      {/* Asset Picker Dialog */}
      <AssetPicker
        open={assetPickerOpen}
        onClose={() => setAssetPickerOpen(false)}
        onSelect={handleAssetSelected}
        {...(pickerKind !== undefined ? { kind: pickerKind } : {})}
      />

      <Box sx={{ flexGrow: 1 }} />

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Typography
          variant='body2'
          sx={{
            color: 'text.secondary',
            fontFamily: 'monospace',
            textAlign: 'center',
            userSelect: 'none',
          }}
        >
          ({Math.round(-viewport.x)}, {Math.round(-viewport.y)})
        </Typography>

        <IconButton onClick={onZoomOut} size='small' title='Zoom Out'>
          <ZoomOutIcon fontSize='small' />
        </IconButton>

        <Typography
          variant='body2'
          sx={{
            textAlign: 'center',
            userSelect: 'none',
          }}
        >
          {Math.round(zoomPercentage)}%
        </Typography>

        <IconButton onClick={onZoomIn} size='small' title='Zoom In'>
          <ZoomInIcon fontSize='small' />
        </IconButton>

        <IconButton
          onClick={onZoomReset}
          size='small'
          title='Reset View'
          sx={{
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            },
          }}
        >
          <RestartAltIcon fontSize='small' />
        </IconButton>

        <IconButton onClick={undo} disabled={!canUndo} size='small' title='Undo (Ctrl+Z)'>
          <UndoIcon fontSize='small' />
        </IconButton>

        <IconButton onClick={redo} disabled={!canRedo} size='small' title='Redo (Ctrl+Y)'>
          <RedoIcon fontSize='small' />
        </IconButton>
      </Box>
    </Paper>
  );
};
