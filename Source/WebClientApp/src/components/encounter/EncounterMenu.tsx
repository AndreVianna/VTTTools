import {
  Box,
  CircularProgress,
  Divider,
  FormControl,
  FormControlLabel,
  InputLabel,
  Menu,
  MenuItem,
  Link as MuiLink,
  Select,
  type SelectChangeEvent,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import type React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetAdventureQuery } from '@/services/adventuresApi';
import type { Encounter } from '@/types/domain';
import type { GridConfig } from '@/utils/gridCalculator';
import { GridType } from '@/utils/gridCalculator';

export interface EncounterMenuProps {
  encounter: Encounter | undefined;
  onDescriptionChange: (description: string) => void;
  onPublishedChange: (published: boolean) => void;
  gridConfig?: GridConfig;
  onGridChange?: (grid: GridConfig) => void;
  anchorEl: HTMLElement | null;
  onClose: () => void;
}

export const EncounterMenu: React.FC<EncounterMenuProps> = ({
  encounter,
  onDescriptionChange,
  onPublishedChange,
  gridConfig,
  onGridChange,
  anchorEl,
  onClose,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();

  const { data: adventure, isLoading: isLoadingAdventure } = useGetAdventureQuery(encounter?.adventure?.id || '', {
    skip: !encounter?.adventure?.id,
  });

  const handleAdventureClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (encounter?.adventure?.id) {
      navigate(`/content-library/adventures/${encounter.adventure.id}`);
      onClose();
    }
  };

  const handleDescriptionBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const newDescription = e.target.value;
    if (encounter && newDescription !== encounter.description) {
      onDescriptionChange(newDescription);
    }
  };

  const handlePublishedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onPublishedChange(e.target.checked);
  };

  const handleGridTypeChange = (e: SelectChangeEvent<GridType>) => {
    if (!onGridChange || !gridConfig) return;
    const newType = e.target.value;

    onGridChange({
      type: newType,
      cellSize: gridConfig.cellSize ?? { width: 50, height: 50 },
      offset: gridConfig.offset ?? { left: 0, top: 0 },
      snap: gridConfig.snap ?? true,
      scale: gridConfig.scale ?? 1,
    });
  };

  const handleCellWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!onGridChange || !gridConfig) return;
    const value = parseFloat(e.target.value);
    if (Number.isNaN(value) || value < 10) return;
    onGridChange({
      type: gridConfig.type as GridType,
      cellSize: { ...gridConfig.cellSize, width: value },
      offset: gridConfig.offset,
      snap: gridConfig.snap,
      scale: gridConfig.scale,
    });
  };

  const handleCellHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!onGridChange || !gridConfig) return;
    const value = parseFloat(e.target.value);
    if (Number.isNaN(value) || value < 10) return;
    onGridChange({
      type: gridConfig.type as GridType,
      cellSize: { ...gridConfig.cellSize, height: value },
      offset: gridConfig.offset,
      snap: gridConfig.snap,
      scale: gridConfig.scale,
    });
  };

  const handleOffsetXChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!onGridChange || !gridConfig) return;
    const value = parseFloat(e.target.value);
    if (Number.isNaN(value)) return;
    onGridChange({
      type: gridConfig.type as GridType,
      cellSize: gridConfig.cellSize,
      offset: { ...gridConfig.offset, left: value },
      snap: gridConfig.snap,
      scale: gridConfig.scale,
    });
  };

  const handleOffsetYChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!onGridChange || !gridConfig) return;
    const value = parseFloat(e.target.value);
    if (Number.isNaN(value)) return;
    onGridChange({
      type: gridConfig.type as GridType,
      cellSize: gridConfig.cellSize,
      offset: { ...gridConfig.offset, top: value },
      snap: gridConfig.snap,
      scale: gridConfig.scale,
    });
  };

  const handleSnapChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!onGridChange || !gridConfig) return;
    onGridChange({
      type: gridConfig.type as GridType,
      cellSize: gridConfig.cellSize,
      offset: gridConfig.offset,
      snap: e.target.checked,
      scale: gridConfig.scale,
    });
  };

  const compactStyles = {
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

  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
      PaperProps={{
        sx: {
          minWidth: 320,
          p: 1.5,
          bgcolor: theme.palette.background.paper,
        },
      }}
    >
      <Typography
        variant='subtitle2'
        sx={{
          mb: 1.5,
          fontSize: '0.875rem',
          color: theme.palette.text.primary,
        }}
      >
        Encounter Properties
      </Typography>

      <Divider sx={{ my: 1 }} />

      <Box sx={{ mb: 2 }}>
        <Typography variant='caption' color='text.secondary' sx={{ mb: 0.5, display: 'block', fontSize: '0.75rem' }}>
          Adventure
        </Typography>
        {isLoadingAdventure ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CircularProgress size={16} />
            <Typography variant='body2' color='text.secondary'>
              Loading...
            </Typography>
          </Box>
        ) : encounter?.adventure?.id && adventure ? (
          <MuiLink
            component='button'
            variant='body2'
            onClick={handleAdventureClick}
            sx={{
              color: theme.palette.primary.main,
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline',
              },
              textAlign: 'left',
              display: 'block',
            }}
          >
            {adventure.name}
          </MuiLink>
        ) : (
          <Typography variant='body2' sx={{ color: theme.palette.text.disabled }}>
            None
          </Typography>
        )}
      </Box>

      <Box sx={{ mb: 2 }}>
        <Typography variant='caption' color='text.secondary' sx={{ mb: 0.5, display: 'block', fontSize: '0.75rem' }}>
          Description
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={3}
          defaultValue={encounter?.description || ''}
          onBlur={handleDescriptionBlur}
          placeholder='Encounter description...'
          size='small'
          sx={{
            '& .MuiInputBase-root': {
              bgcolor: theme.palette.background.default,
            },
          }}
        />
      </Box>

      <Divider sx={{ my: 1 }} />

      <FormControlLabel
        control={<Switch size='small' checked={encounter?.isPublished || false} onChange={handlePublishedChange} />}
        label={<Typography variant='body2'>Published</Typography>}
      />

      {gridConfig && onGridChange && (
        <>
          <Divider sx={{ my: 1.5 }} />

          <Box sx={{ mb: 1 }}>
            <Typography
              variant='caption'
              color='text.secondary'
              sx={{ mb: 1, display: 'block', fontSize: '0.75rem', fontWeight: 600 }}
            >
              Grid Configuration
            </Typography>

            <FormControl fullWidth size='small' sx={{ mb: 1 }}>
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

            <Box sx={{ display: 'flex', gap: 0.75, mb: 1 }}>
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

            <Box sx={{ display: 'flex', gap: 0.75, mb: 1 }}>
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
                <Switch
                  id='switch-snap-grid'
                  size='small'
                  checked={gridConfig.snap ?? false}
                  onChange={handleSnapChange}
                />
              }
              label={<Typography sx={compactStyles.toggleLabel}>Snap to Grid</Typography>}
              sx={{ margin: 0 }}
            />
          </Box>
        </>
      )}
    </Menu>
  );
};
