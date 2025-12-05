import {
  Cancel as CancelIcon,
  Lightbulb as LightIcon,
  Map as RegionIcon,
  Fence as WallIcon,
} from '@mui/icons-material';
import { Box, Button, ButtonGroup, Tooltip, useTheme } from '@mui/material';
import type React from 'react';
import { useEffect } from 'react';

export type DrawingMode = 'wall' | 'region' | 'light' | 'sound' | 'bucketFill' | null;

export interface StructureToolbarProps {
  drawingMode: DrawingMode;
  onModeChange: (mode: DrawingMode) => void;
  disabled?: boolean;
}

export const StructureToolbar: React.FC<StructureToolbarProps> = ({ drawingMode, onModeChange, disabled = false }) => {
  const theme = useTheme();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (disabled) return;

      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        onModeChange('wall');
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        onModeChange('region');
      } else if (e.key === 'l' || e.key === 'L') {
        e.preventDefault();
        onModeChange('light');
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onModeChange(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [disabled, onModeChange]);

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1,
        padding: theme.spacing(1),
        bgcolor: theme.palette.background.paper,
        borderRadius: 1,
        boxShadow: 1,
      }}
    >
      <ButtonGroup variant='contained' size='small' disabled={disabled}>
        <Tooltip title='Draw Wall (W)' placement='bottom'>
          <Button
            onClick={() => onModeChange('wall')}
            color={drawingMode === 'wall' ? 'primary' : 'inherit'}
            aria-label='Draw Wall'
          >
            <WallIcon />
          </Button>
        </Tooltip>
        <Tooltip title='Draw Region (R)' placement='bottom'>
          <Button
            onClick={() => onModeChange('region')}
            color={drawingMode === 'region' ? 'primary' : 'inherit'}
            aria-label='Draw Region'
          >
            <RegionIcon />
          </Button>
        </Tooltip>
        <Tooltip title='Place Light Source (L)' placement='bottom'>
          <Button
            onClick={() => onModeChange('light')}
            color={drawingMode === 'light' ? 'primary' : 'inherit'}
            aria-label='Place Light Source'
          >
            <LightIcon />
          </Button>
        </Tooltip>
        <Tooltip title='Cancel (Esc)' placement='bottom'>
          <Button onClick={() => onModeChange(null)} disabled={drawingMode === null} aria-label='Cancel'>
            <CancelIcon />
          </Button>
        </Tooltip>
      </ButtonGroup>
    </Box>
  );
};

StructureToolbar.displayName = 'StructureToolbar';
