import {
  Box,
  Divider,
  Drawer,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  type SelectChangeEvent,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import type React from 'react';
import { useCallback } from 'react';
import { PrecisionNumberInput } from '@/components/common';
import { BackgroundPanel } from '@/components/encounter/panels/BackgroundPanel';
import { type Encounter, Light, Weather } from '@/types/domain';
import type { GridConfig } from '@/utils/gridCalculator';
import { GridType } from '@/utils/gridCalculator';

export interface EncounterPropertiesDrawerProps {
  open: boolean;
  onClose: () => void;
  encounter: Encounter | null | undefined;
  onNameChange?: (name: string) => void;
  onDescriptionChange: (description: string) => void;
  onPublishedChange: (published: boolean) => void;
  onLightChange?: (light: Light) => void;
  onWeatherChange?: (weather: Weather) => void;
  onElevationChange?: (elevation: number) => void;
  gridConfig?: GridConfig;
  onGridChange?: (grid: GridConfig) => void;
  backgroundUrl?: string;
  backgroundContentType?: string;
  isUploadingBackground?: boolean;
  onBackgroundUpload?: (file: File) => void;
}

export const EncounterPropertiesDrawer: React.FC<EncounterPropertiesDrawerProps> = ({
  open,
  onClose,
  encounter,
  onNameChange,
  onDescriptionChange,
  onPublishedChange,
  onLightChange,
  onWeatherChange,
  onElevationChange,
  gridConfig,
  onGridChange,
  backgroundUrl,
  backgroundContentType,
  isUploadingBackground,
  onBackgroundUpload,
}) => {
  const theme = useTheme();

  const compactStyles = {
    sectionHeader: {
      fontSize: '10px',
      fontWeight: 700,
      textTransform: 'uppercase' as const,
      letterSpacing: '0.5px',
      color: theme.palette.text.secondary,
      mb: 0.5,
      lineHeight: 1.2,
      display: 'block',
    },
    textFieldMultiline: {
      '& .MuiInputBase-root': {
        fontSize: '11px',
        padding: '6px 8px',
        backgroundColor: theme.palette.background.default,
      },
      '& .MuiInputLabel-root': {
        fontSize: '9px',
        transform: 'translate(8px, 6px) scale(1)',
        '&.MuiInputLabel-shrink': {
          transform: 'translate(8px, -8px) scale(0.85)',
        },
      },
    },
    toggleLabel: {
      fontSize: '10px',
    },
    textField: {
      '& .MuiInputBase-root': {
        fontSize: '11px',
        backgroundColor: theme.palette.background.default,
      },
      '& .MuiInputBase-input': {
        padding: '6px 8px',
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
    menuItem: {
      fontSize: '11px',
      minHeight: '32px',
    },
  };

  const handleNameBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const newName = e.target.value.trim();
    if (encounter && newName && newName !== encounter.name && onNameChange) {
      onNameChange(newName);
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

  const handleLightChange = (e: SelectChangeEvent<number>) => {
    if (onLightChange) {
      onLightChange(Number(e.target.value) as Light);
    }
  };

  const handleWeatherChange = (e: SelectChangeEvent<string>) => {
    if (onWeatherChange) {
      onWeatherChange(e.target.value as Weather);
    }
  };

  const handleElevationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onElevationChange) {
      const value = parseFloat(e.target.value);
      if (!Number.isNaN(value)) {
        onElevationChange(value);
      }
    }
  };

  const handleGridTypeChange = (e: SelectChangeEvent<number>) => {
    if (!onGridChange || !gridConfig) return;
    const newType = Number(e.target.value) as GridType;

    onGridChange({
      type: newType,
      cellSize: gridConfig.cellSize ?? { width: 50, height: 50 },
      offset: gridConfig.offset ?? { left: 0, top: 0 },
      snap: gridConfig.snap ?? true,
      scale: gridConfig.scale ?? 1,
    });
  };

  const handleCellWidthChange = useCallback(
    (value: number) => {
      if (!onGridChange || !gridConfig) return;
      onGridChange({
        type: gridConfig.type as GridType,
        cellSize: { ...gridConfig.cellSize, width: value },
        offset: gridConfig.offset,
        snap: gridConfig.snap,
        scale: gridConfig.scale,
      });
    },
    [onGridChange, gridConfig],
  );

  const handleCellHeightChange = useCallback(
    (value: number) => {
      if (!onGridChange || !gridConfig) return;
      onGridChange({
        type: gridConfig.type as GridType,
        cellSize: { ...gridConfig.cellSize, height: value },
        offset: gridConfig.offset,
        snap: gridConfig.snap,
        scale: gridConfig.scale,
      });
    },
    [onGridChange, gridConfig],
  );

  const handleOffsetXChange = useCallback(
    (value: number) => {
      if (!onGridChange || !gridConfig) return;
      onGridChange({
        type: gridConfig.type as GridType,
        cellSize: gridConfig.cellSize,
        offset: { ...gridConfig.offset, left: value },
        snap: gridConfig.snap,
        scale: gridConfig.scale,
      });
    },
    [onGridChange, gridConfig],
  );

  const handleOffsetYChange = useCallback(
    (value: number) => {
      if (!onGridChange || !gridConfig) return;
      onGridChange({
        type: gridConfig.type as GridType,
        cellSize: gridConfig.cellSize,
        offset: { ...gridConfig.offset, top: value },
        snap: gridConfig.snap,
        scale: gridConfig.scale,
      });
    },
    [onGridChange, gridConfig],
  );

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

  return (
    <Drawer
      anchor='right'
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: { xs: '100vw', sm: 360 },
          backgroundColor: theme.palette.background.paper,
          top: 28,
          bottom: 0,
          height: 'auto',
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
          p: 2,
          height: '100%',
          overflowY: 'auto',
        }}
      >
        {/* Encounter Name and Published - Single Row */}
        <Box sx={{ display: 'flex', gap: 0.75, alignItems: 'center' }}>
          {/* Encounter Name */}
          <TextField
            id='encounter-name'
            label='Encounter Name'
            defaultValue={encounter?.name ?? ''}
            onBlur={handleNameBlur}
            fullWidth
            variant='outlined'
            placeholder='Enter encounter name...'
            size='small'
            sx={compactStyles.textField}
          />

          {/* Published Toggle */}
          <FormControlLabel
            control={
              <Switch
                id='encounter-published'
                size='small'
                checked={encounter?.isPublished ?? false}
                onChange={handlePublishedChange}
              />
            }
            label={<Typography sx={compactStyles.toggleLabel}>Published</Typography>}
            sx={{ margin: 0, flexShrink: 0 }}
          />
        </Box>

        {/* Background Image/Video */}
        <BackgroundPanel
          {...(backgroundUrl !== null && backgroundUrl !== undefined ? { backgroundUrl } : {})}
          {...(backgroundContentType !== null && backgroundContentType !== undefined ? { backgroundContentType } : {})}
          {...(isUploadingBackground !== null && isUploadingBackground !== undefined ? { isUploadingBackground } : {})}
          {...(onBackgroundUpload !== null && onBackgroundUpload !== undefined ? { onBackgroundUpload } : {})}
        />

        {/* Description */}
        <TextField
          id='encounter-description'
          label='Description'
          defaultValue={encounter?.description ?? ''}
          onBlur={handleDescriptionBlur}
          multiline
          rows={5}
          fullWidth
          variant='outlined'
          placeholder='Encounter description...'
          size='small'
          sx={compactStyles.textFieldMultiline}
        />

        {/* Light, Weather, Elevation - Single Row */}
        <Box sx={{ display: 'flex', gap: 0.75 }}>
          {/* Light */}
          <FormControl fullWidth size='small'>
            <InputLabel id='label-light' sx={compactStyles.inputLabel}>
              Light
            </InputLabel>
            <Select
              id='select-light'
              labelId='label-light'
              value={encounter?.light ?? Light.Ambient}
              label='Light'
              onChange={handleLightChange}
              sx={compactStyles.select}
            >
              <MenuItem sx={compactStyles.menuItem} value={Light.Black}>
                Black
              </MenuItem>
              <MenuItem sx={compactStyles.menuItem} value={Light.Darkness}>
                Darkness
              </MenuItem>
              <MenuItem sx={compactStyles.menuItem} value={Light.Nighttime}>
                Nighttime
              </MenuItem>
              <MenuItem sx={compactStyles.menuItem} value={Light.Dim}>
                Dim
              </MenuItem>
              <MenuItem sx={compactStyles.menuItem} value={Light.Twilight}>
                Twilight
              </MenuItem>
              <MenuItem sx={compactStyles.menuItem} value={Light.Ambient}>
                Ambient
              </MenuItem>
              <MenuItem sx={compactStyles.menuItem} value={Light.Candlelight}>
                Candlelight
              </MenuItem>
              <MenuItem sx={compactStyles.menuItem} value={Light.Torchlight}>
                Torchlight
              </MenuItem>
              <MenuItem sx={compactStyles.menuItem} value={Light.Artificial}>
                Artificial
              </MenuItem>
              <MenuItem sx={compactStyles.menuItem} value={Light.Daylight}>
                Daylight
              </MenuItem>
              <MenuItem sx={compactStyles.menuItem} value={Light.Bright}>
                Bright
              </MenuItem>
            </Select>
          </FormControl>

          {/* Weather */}
          <FormControl fullWidth size='small'>
            <InputLabel id='label-weather' sx={compactStyles.inputLabel}>
              Weather
            </InputLabel>
            <Select
              id='select-weather'
              labelId='label-weather'
              value={encounter?.weather ?? Weather.Clear}
              label='Weather'
              onChange={handleWeatherChange}
              sx={compactStyles.select}
            >
              <MenuItem sx={compactStyles.menuItem} value={Weather.Clear}>
                Clear
              </MenuItem>
              <MenuItem sx={compactStyles.menuItem} value={Weather.PartlyCloudy}>
                Partly Cloudy
              </MenuItem>
              <MenuItem sx={compactStyles.menuItem} value={Weather.Overcast}>
                Overcast
              </MenuItem>
              <MenuItem sx={compactStyles.menuItem} value={Weather.Fog}>
                Fog
              </MenuItem>
              <MenuItem sx={compactStyles.menuItem} value={Weather.LightRain}>
                Light Rain
              </MenuItem>
              <MenuItem sx={compactStyles.menuItem} value={Weather.Rain}>
                Rain
              </MenuItem>
              <MenuItem sx={compactStyles.menuItem} value={Weather.HeavyRain}>
                Heavy Rain
              </MenuItem>
              <MenuItem sx={compactStyles.menuItem} value={Weather.Rainstorm}>
                Rainstorm
              </MenuItem>
              <MenuItem sx={compactStyles.menuItem} value={Weather.Thunderstorm}>
                Thunderstorm
              </MenuItem>
              <MenuItem sx={compactStyles.menuItem} value={Weather.LightSnow}>
                Light Snow
              </MenuItem>
              <MenuItem sx={compactStyles.menuItem} value={Weather.Snow}>
                Snow
              </MenuItem>
              <MenuItem sx={compactStyles.menuItem} value={Weather.HeavySnow}>
                Heavy Snow
              </MenuItem>
              <MenuItem sx={compactStyles.menuItem} value={Weather.Snowstorm}>
                Snowstorm
              </MenuItem>
              <MenuItem sx={compactStyles.menuItem} value={Weather.Hail}>
                Hail
              </MenuItem>
              <MenuItem sx={compactStyles.menuItem} value={Weather.IceStorm}>
                Ice Storm
              </MenuItem>
              <MenuItem sx={compactStyles.menuItem} value={Weather.Breezy}>
                Breezy
              </MenuItem>
              <MenuItem sx={compactStyles.menuItem} value={Weather.Windy}>
                Windy
              </MenuItem>
              <MenuItem sx={compactStyles.menuItem} value={Weather.Hurricane}>
                Hurricane
              </MenuItem>
              <MenuItem sx={compactStyles.menuItem} value={Weather.Tornado}>
                Tornado
              </MenuItem>
              <MenuItem sx={compactStyles.menuItem} value={Weather.FireStorm}>
                Fire Storm
              </MenuItem>
            </Select>
          </FormControl>

          {/* Elevation */}
          <TextField
            id='encounter-elevation'
            label='Elevation'
            type='number'
            value={encounter?.elevation ?? 0}
            onChange={handleElevationChange}
            fullWidth
            variant='outlined'
            placeholder='0'
            size='small'
            sx={compactStyles.textField}
            InputProps={{ inputProps: { step: 0.1 } }}
          />
        </Box>

        {/* Grid Configuration */}
        {gridConfig && onGridChange && (
          <>
            <Divider sx={{ my: 1.5 }} />

            <Box sx={{ mb: 2 }}>
              <Typography sx={compactStyles.sectionHeader}>Grid Configuration</Typography>

              <FormControl fullWidth size='small' sx={{ mb: 1.5 }}>
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

              {gridConfig.type !== GridType.NoGrid && (
                <>
                  <Box sx={{ display: 'flex', gap: 0.75, mb: 1.5 }}>
                    <PrecisionNumberInput
                      id='input-cell-width'
                      label='Width'
                      value={gridConfig.cellSize.width ?? 50}
                      onChange={handleCellWidthChange}
                      min={10}
                      max={200}
                      sx={compactStyles.textField}
                    />
                    <PrecisionNumberInput
                      id='input-cell-height'
                      label='Height'
                      value={gridConfig.cellSize.height ?? 50}
                      onChange={handleCellHeightChange}
                      min={10}
                      max={200}
                      sx={compactStyles.textField}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', gap: 0.75, mb: 1.5 }}>
                    <PrecisionNumberInput
                      id='input-offset-x'
                      label='Offset X'
                      value={gridConfig.offset.left ?? 0}
                      onChange={handleOffsetXChange}
                      sx={compactStyles.textField}
                    />
                    <PrecisionNumberInput
                      id='input-offset-y'
                      label='Offset Y'
                      value={gridConfig.offset.top ?? 0}
                      onChange={handleOffsetYChange}
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
                </>
              )}
            </Box>
          </>
        )}

        {/* Display Settings - Removed: defaultDisplayName and defaultLabelPosition are now handled in localStorage */}
      </Box>
    </Drawer>
  );
};
