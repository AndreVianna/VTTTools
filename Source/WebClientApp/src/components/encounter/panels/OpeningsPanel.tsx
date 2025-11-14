import { Delete, ExpandLess, ExpandMore } from '@mui/icons-material';
import {
  Box,
  Button,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  type SelectChangeEvent,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import React, { useCallback, useState } from 'react';
import {
  OpeningOpacity,
  OpeningState,
  OpeningVisibility,
  type PlacedOpening,
} from '@/types/domain';
import { MATERIAL_OPTIONS, OPENING_PRESETS, type OpeningPreset } from './openingsPanelTypes';

export interface OpeningsPanelProps {
  encounterId: string;
  encounterOpenings: PlacedOpening[];
  selectedOpeningIndex: number | null;
  onOpeningSelect?: ((index: number) => void) | undefined;
  onOpeningDelete?: ((index: number) => void) | undefined;
  onPlaceOpening?: ((properties: OpeningPlacementProperties) => void) | undefined;
  onEditOpening?: ((index: number, updates: Partial<PlacedOpening>) => void) | undefined;
}

export interface OpeningPlacementProperties {
  type: string;
  width: number;
  height: number;
  visibility: OpeningVisibility;
  state: OpeningState;
  opacity: OpeningOpacity;
  material?: string;
  color?: string;
}

export const OpeningsPanel: React.FC<OpeningsPanelProps> = React.memo(
  ({
    encounterId: _encounterId,
    encounterOpenings,
    selectedOpeningIndex,
    onOpeningSelect,
    onOpeningDelete,
    onPlaceOpening,
    onEditOpening: _onEditOpening,
  }) => {
    const theme = useTheme();

    const [selectedPreset, setSelectedPreset] = useState<OpeningPreset | null>(
      OPENING_PRESETS[0] || null,
    );
    const [type, setType] = useState<string>('Door');
    const [width, setWidth] = useState<number>(5.0);
    const [height, setHeight] = useState<number>(8.0);
    const [visibility, setVisibility] = useState<OpeningVisibility>(OpeningVisibility.Visible);
    const [state, setState] = useState<OpeningState>(OpeningState.Closed);
    const [opacity, setOpacity] = useState<OpeningOpacity>(OpeningOpacity.Opaque);
    const [material, setMaterial] = useState<string>('Wood');
    const [customMaterial, setCustomMaterial] = useState<string>('');
    const [color, setColor] = useState<string>('#8B4513');
    const [expandedOpeningIndex, setExpandedOpeningIndex] = useState<number | null>(null);

    const handlePresetSelect = useCallback((preset: OpeningPreset) => {
      setSelectedPreset(preset);
      setType(preset.type);
      setWidth(preset.defaultWidth);
      setHeight(preset.defaultHeight);
      setVisibility(preset.defaultVisibility);
      setState(preset.defaultState);
      setOpacity(preset.defaultOpacity);
      setMaterial(preset.defaultMaterial || 'Wood');
      setColor(preset.defaultColor || '#8B4513');
    }, []);

    const handlePlaceOpening = useCallback(() => {
      onPlaceOpening?.({
        type,
        width,
        height,
        visibility,
        state,
        opacity,
        material: material === 'Custom' ? customMaterial : material,
        color,
      });
    }, [type, width, height, visibility, state, opacity, material, customMaterial, color, onPlaceOpening]);

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
      button: {
        height: '28px',
        fontSize: '10px',
        borderRadius: 0,
        textTransform: 'none' as const,
      },
    };

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, p: 1 }}>
        <Typography variant='overline' sx={compactStyles.sectionHeader}>
          Opening Type Presets
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {OPENING_PRESETS.map((preset) => {
            const Icon = preset.icon;
            const isSelected = selectedPreset?.name === preset.name;
            return (
              <Tooltip key={preset.name} title={preset.name} arrow placement='top'>
                <IconButton
                  size='small'
                  onClick={() => handlePresetSelect(preset)}
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: 0,
                    border: `2px solid ${isSelected ? theme.palette.primary.main : theme.palette.divider}`,
                    backgroundColor: isSelected ? theme.palette.action.selected : 'transparent',
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover,
                      borderColor: theme.palette.primary.main,
                    },
                  }}
                >
                  <Icon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            );
          })}
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography variant='overline' sx={compactStyles.sectionHeader}>
            Basic Properties
          </Typography>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              label='Width (ft)'
              type='number'
              value={width}
              onChange={(e) => setWidth(parseFloat(e.target.value))}
              size='small'
              sx={{ ...compactStyles.textField, flex: 1 }}
              inputProps={{ min: 0.5, max: 30, step: 0.5 }}
            />
            <TextField
              label='Height (ft)'
              type='number'
              value={height}
              onChange={(e) => setHeight(parseFloat(e.target.value))}
              size='small'
              sx={{ ...compactStyles.textField, flex: 1 }}
              inputProps={{ min: 0.5, max: 30, step: 0.5 }}
            />
          </Box>

          <FormControl fullWidth size='small'>
            <InputLabel sx={compactStyles.inputLabel}>Material</InputLabel>
            <Select
              value={material}
              label='Material'
              onChange={(e: SelectChangeEvent) => setMaterial(e.target.value)}
              sx={compactStyles.select}
            >
              {MATERIAL_OPTIONS.map((mat) => (
                <MenuItem key={mat} value={mat} sx={{ fontSize: '11px' }}>
                  {mat}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {material === 'Custom' && (
            <TextField
              label='Custom Material'
              value={customMaterial}
              onChange={(e) => setCustomMaterial(e.target.value)}
              size='small'
              sx={compactStyles.textField}
            />
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography sx={{ fontSize: '10px', flex: 1 }}>Color:</Typography>
            <input
              type='color'
              value={color}
              onChange={(e) => setColor(e.target.value)}
              style={{
                width: '48px',
                height: '28px',
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: '4px',
                cursor: 'pointer',
                padding: 0,
              }}
            />
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography variant='overline' sx={compactStyles.sectionHeader}>
            State Properties
          </Typography>

          <FormControl fullWidth size='small'>
            <InputLabel sx={compactStyles.inputLabel}>Visibility</InputLabel>
            <Select
              value={visibility}
              label='Visibility'
              onChange={(e: SelectChangeEvent<OpeningVisibility>) =>
                setVisibility(e.target.value as unknown as OpeningVisibility)
              }
              sx={compactStyles.select}
            >
              <MenuItem value={OpeningVisibility.Visible} sx={{ fontSize: '11px' }}>
                Visible
              </MenuItem>
              <MenuItem value={OpeningVisibility.Secret} sx={{ fontSize: '11px' }}>
                Secret
              </MenuItem>
              <MenuItem value={OpeningVisibility.Concealed} sx={{ fontSize: '11px' }}>
                Concealed
              </MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth size='small'>
            <InputLabel sx={compactStyles.inputLabel}>State</InputLabel>
            <Select
              value={state}
              label='State'
              onChange={(e: SelectChangeEvent<OpeningState>) =>
                setState(e.target.value as unknown as OpeningState)
              }
              sx={compactStyles.select}
            >
              <MenuItem value={OpeningState.Open} sx={{ fontSize: '11px' }}>
                Open
              </MenuItem>
              <MenuItem value={OpeningState.Closed} sx={{ fontSize: '11px' }}>
                Closed
              </MenuItem>
              <MenuItem value={OpeningState.Locked} sx={{ fontSize: '11px' }}>
                Locked
              </MenuItem>
              <MenuItem value={OpeningState.Barred} sx={{ fontSize: '11px' }}>
                Barred
              </MenuItem>
              <MenuItem value={OpeningState.Destroyed} sx={{ fontSize: '11px' }}>
                Destroyed
              </MenuItem>
              <MenuItem value={OpeningState.Jammed} sx={{ fontSize: '11px' }}>
                Jammed
              </MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth size='small'>
            <InputLabel sx={compactStyles.inputLabel}>Opacity</InputLabel>
            <Select
              value={opacity}
              label='Opacity'
              onChange={(e: SelectChangeEvent<OpeningOpacity>) =>
                setOpacity(e.target.value as unknown as OpeningOpacity)
              }
              sx={compactStyles.select}
            >
              <MenuItem value={OpeningOpacity.Opaque} sx={{ fontSize: '11px' }}>
                Opaque
              </MenuItem>
              <MenuItem value={OpeningOpacity.Translucent} sx={{ fontSize: '11px' }}>
                Translucent
              </MenuItem>
              <MenuItem value={OpeningOpacity.Transparent} sx={{ fontSize: '11px' }}>
                Transparent
              </MenuItem>
              <MenuItem value={OpeningOpacity.Ethereal} sx={{ fontSize: '11px' }}>
                Ethereal
              </MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Button variant='contained' fullWidth size='small' sx={compactStyles.button} onClick={handlePlaceOpening}>
          Place Opening
        </Button>

        <Typography variant='overline' sx={compactStyles.sectionHeader}>
          Placed Openings ({encounterOpenings.length})
        </Typography>

        <Box
          sx={{
            maxHeight: '200px',
            overflowY: 'auto',
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: '4px',
            p: 0.5,
          }}
        >
          {encounterOpenings.length === 0 ? (
            <Typography
              sx={{
                fontSize: '10px',
                color: theme.palette.text.secondary,
                textAlign: 'center',
                p: 1,
              }}
            >
              No openings placed yet
            </Typography>
          ) : (
            encounterOpenings.map((opening) => (
              <Box
                key={opening.id}
                sx={{
                  p: 0.5,
                  cursor: 'pointer',
                  backgroundColor:
                    selectedOpeningIndex === opening.index ? theme.palette.action.selected : 'transparent',
                  '&:hover': { backgroundColor: theme.palette.action.hover },
                  borderRadius: '4px',
                }}
                onClick={() => onOpeningSelect?.(opening.index)}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Typography sx={{ fontSize: '10px', fontWeight: 'bold' }}>
                    {opening.name} ({opening.type})
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <IconButton
                      size='small'
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedOpeningIndex(expandedOpeningIndex === opening.index ? null : opening.index);
                      }}
                      sx={{ padding: '2px' }}
                    >
                      {expandedOpeningIndex === opening.index ? (
                        <ExpandLess fontSize='small' />
                      ) : (
                        <ExpandMore fontSize='small' />
                      )}
                    </IconButton>
                    <IconButton
                      size='small'
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpeningDelete?.(opening.index);
                      }}
                      sx={{ padding: '2px' }}
                    >
                      <Delete fontSize='small' />
                    </IconButton>
                  </Box>
                </Box>

                {expandedOpeningIndex === opening.index && (
                  <Box
                    sx={{
                      mt: 0.5,
                      pl: 1,
                      fontSize: '9px',
                      color: theme.palette.text.secondary,
                    }}
                  >
                    <Typography sx={{ fontSize: '9px' }}>
                      Size: {opening.width}' × {opening.height}'
                    </Typography>
                    <Typography sx={{ fontSize: '9px' }}>Wall: {opening.wallIndex}</Typography>
                    <Typography sx={{ fontSize: '9px' }}>
                      Position: Poles {opening.startPoleIndex}-{opening.endPoleIndex}
                    </Typography>
                    <Typography sx={{ fontSize: '9px' }}>
                      State: {OpeningState[opening.state]}
                    </Typography>
                    <Typography sx={{ fontSize: '9px' }}>
                      Opacity: {OpeningOpacity[opening.opacity]}
                    </Typography>
                    {opening.material && (
                      <Typography sx={{ fontSize: '9px' }}>Material: {opening.material}</Typography>
                    )}
                  </Box>
                )}
              </Box>
            ))
          )}
        </Box>
      </Box>
    );
  },
);

OpeningsPanel.displayName = 'OpeningsPanel';
