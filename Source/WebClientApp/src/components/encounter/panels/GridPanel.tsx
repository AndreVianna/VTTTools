import {
  Box,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  type SelectChangeEvent,
  Switch,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import type React from 'react';
import { type GridConfig, GridType } from '@/utils/gridCalculator';

export interface GridPanelProps {
  gridConfig: GridConfig;
  onGridChange?: (grid: GridConfig) => void;
}

export const GridPanel: React.FC<GridPanelProps> = ({ gridConfig, onGridChange }) => {
  const theme = useTheme();

  const compactStyles = {
    sectionHeader: {
      fontSize: '10px',
      fontWeight: 700,
      textTransform: 'uppercase' as const,
      letterSpacing: '0.5px',
      color: theme.palette.text.secondary,
      mb: 0.5,
    },
    textField: {
      '& .MuiInputBase-root': {
        height: '28px',
        fontSize: '11px',
        backgroundColor: theme.palette.background.default,
      },
      '& .MuiInputBase-input': {
        padding: '4px 8px',
        fontSize: '11px',
      },
      '& .MuiInputLabel-root': {
        fontSize: '9px',
        transform: 'translate(8px, 6px) scale(1)',
        '&.MuiInputLabel-shrink': {
          transform: 'translate(8px, -8px) scale(0.85)',
        },
      },
    },
    select: {
      height: '28px',
      fontSize: '11px',
      '& .MuiSelect-select': {
        padding: '4px 8px',
        fontSize: '11px',
      },
    },
    inputLabel: {
      fontSize: '9px',
      transform: 'translate(8px, 6px) scale(1)',
      '&.MuiInputLabel-shrink': {
        transform: 'translate(8px, -8px) scale(0.85)',
      },
    },
    toggleLabel: {
      fontSize: '10px',
    },
    menuItem: {
      fontSize: '11px',
      minHeight: '32px',
    },
  };

  const handleGridTypeChange = (e: SelectChangeEvent<number>) => {
    if (!onGridChange) return;
    const newType = Number(e.target.value) as GridType;

    onGridChange({
      type: newType,
      cellSize: gridConfig.cellSize ?? { width: 50, height: 50 },
      offset: gridConfig.offset ?? { left: 0, top: 0 },
      snap: gridConfig.snap ?? true,
    });
  };

  const handleCellWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!onGridChange) return;
    const value = parseFloat(e.target.value);
    if (Number.isNaN(value) || value < 10) return;
    onGridChange({
      type: gridConfig.type as GridType,
      cellSize: { ...gridConfig.cellSize, width: value },
      offset: gridConfig.offset,
      snap: gridConfig.snap,
    });
  };

  const handleCellHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!onGridChange) return;
    const value = parseFloat(e.target.value);
    if (Number.isNaN(value) || value < 10) return;
    onGridChange({
      type: gridConfig.type as GridType,
      cellSize: { ...gridConfig.cellSize, height: value },
      offset: gridConfig.offset,
      snap: gridConfig.snap,
    });
  };

  const handleOffsetXChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!onGridChange) return;
    const value = parseFloat(e.target.value);
    if (Number.isNaN(value)) return;
    onGridChange({
      type: gridConfig.type as GridType,
      cellSize: gridConfig.cellSize,
      offset: { ...gridConfig.offset, left: value },
      snap: gridConfig.snap,
    });
  };

  const handleOffsetYChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!onGridChange) return;
    const value = parseFloat(e.target.value);
    if (Number.isNaN(value)) return;
    onGridChange({
      type: gridConfig.type as GridType,
      cellSize: gridConfig.cellSize,
      offset: { ...gridConfig.offset, top: value },
      snap: gridConfig.snap,
    });
  };

  const handleSnapChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!onGridChange) return;
    onGridChange({
      type: gridConfig.type as GridType,
      cellSize: gridConfig.cellSize,
      offset: gridConfig.offset,
      snap: e.target.checked,
    });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <Typography variant='overline' sx={compactStyles.sectionHeader}>
        Grid Configuration
      </Typography>

      <FormControl fullWidth size='small'>
        <InputLabel id='label-grid-type' sx={compactStyles.inputLabel}>
          Type
        </InputLabel>
        <Select
          id='select-grid-type'
          labelId='label-grid-type'
          value={gridConfig.type ?? GridType.NoGrid}
          label='Type'
          onChange={handleGridTypeChange}
          sx={compactStyles.select}
        >
          <MenuItem sx={compactStyles.menuItem} value={GridType.NoGrid}>
            No Grid
          </MenuItem>
          <MenuItem sx={compactStyles.menuItem} value={GridType.Square}>
            Square
          </MenuItem>
          <MenuItem sx={compactStyles.menuItem} value={GridType.HexV}>
            Hex (V)
          </MenuItem>
          <MenuItem sx={compactStyles.menuItem} value={GridType.HexH}>
            Hex (H)
          </MenuItem>
          <MenuItem sx={compactStyles.menuItem} value={GridType.Isometric}>
            Isometric
          </MenuItem>
        </Select>
      </FormControl>

      <Box sx={{ display: 'flex', gap: 0.75 }}>
        <TextField
          id='input-cell-width'
          label='Width'
          type='number'
          value={gridConfig.cellSize.width ?? 50}
          onChange={handleCellWidthChange}
          size='small'
          fullWidth
          InputProps={{ inputProps: { min: 10, max: 200, step: 1 } }}
          sx={compactStyles.textField}
        />
        <TextField
          id='input-cell-height'
          label='Height'
          type='number'
          value={gridConfig.cellSize.height ?? 50}
          onChange={handleCellHeightChange}
          size='small'
          fullWidth
          InputProps={{ inputProps: { min: 10, max: 200, step: 1 } }}
          sx={compactStyles.textField}
        />
      </Box>

      <Box sx={{ display: 'flex', gap: 0.75 }}>
        <TextField
          id='input-offset-x'
          label='Offset X'
          type='number'
          value={gridConfig.offset.left ?? 0}
          onChange={handleOffsetXChange}
          size='small'
          fullWidth
          InputProps={{ inputProps: { step: 1 } }}
          sx={compactStyles.textField}
        />
        <TextField
          id='input-offset-y'
          label='Offset Y'
          type='number'
          value={gridConfig.offset.top ?? 0}
          onChange={handleOffsetYChange}
          size='small'
          fullWidth
          InputProps={{ inputProps: { step: 1 } }}
          sx={compactStyles.textField}
        />
      </Box>

      <FormControlLabel
        control={
          <Switch id='switch-snap-grid' size='small' checked={gridConfig.snap ?? false} onChange={handleSnapChange} />
        }
        label={<Typography sx={compactStyles.toggleLabel}>Snap to Grid</Typography>}
        sx={{ margin: 0 }}
      />
    </Box>
  );
};
