import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  FormatColorFill as BucketFillIcon,
  Polyline as PolygonIcon,
} from '@mui/icons-material';
import {
  Box,
  Button,
  ButtonGroup,
  Collapse,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  MenuItem,
  Select,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import React, { useState } from 'react';
import { ConfirmDialog } from '@/components/common';
import { useUpdateEncounterRegionMutation } from '@/services/encounterApi';
import type { PlacedRegion } from '@/types/domain';
import { ILLUMINATION_VALUES, REGION_PRESETS, type RegionPreset, TERRAIN_VALUES } from './regionsPanelTypes';

export interface RegionsPanelProps {
  encounterId?: string;
  encounterRegions?: PlacedRegion[];
  selectedRegionIndex?: number | null;
  placementMode?: 'polygon' | 'bucketFill' | null;
  onPresetSelect?: (preset: RegionPreset) => void;
  onPlaceRegion?: (properties: { name: string; type: string; value?: number; label?: string; color?: string }) => void;
  onBucketFillRegion?: (properties: { name: string; type: string; value?: number; label?: string; color?: string }) => void;
  onRegionSelect?: (regionIndex: number) => void;
  onRegionDelete?: (regionIndex: number) => void;
  onEditVertices?: (regionIndex: number) => void;
}

const getSuggestedRegionName = (regions: PlacedRegion[]): string => {
  if (regions.length === 0) return 'Region 1';
  const maxIndex = Math.max(
    ...regions.map((r) => {
      const match = r.name.match(/Region (\d+)$/);
      return match?.[1] ? Number.parseInt(match[1], 10) : 0;
    }),
  );
  return `Region ${maxIndex + 1}`;
};

const isValidHexColor = (color: string): boolean => {
  return /^#[0-9A-F]{6}$/i.test(color);
};

export const RegionsPanel: React.FC<RegionsPanelProps> = React.memo(
  ({
    encounterId,
    encounterRegions = [],
    selectedRegionIndex,
    placementMode,
    onPresetSelect,
    onPlaceRegion,
    onBucketFillRegion,
    onRegionSelect,
    onRegionDelete,
    onEditVertices,
  }) => {
    const theme = useTheme();

    const [name, setName] = useState(() => getSuggestedRegionName(encounterRegions));
    const [regionType, setRegionType] = useState<string>('Elevation');
    const [value, setValue] = useState<number>(0);
    const [label, setLabel] = useState<string>('Normal');
    const [color, setColor] = useState<string>('#ed6c02');
    const [selectedRegionType, setSelectedRegionType] = useState<string>('Elevation');
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [regionToDelete, setRegionToDelete] = useState<number | null>(null);
    const [expandedRegions, setExpandedRegions] = useState<Set<number>>(new Set());
    const [editedNames, setEditedNames] = useState<Map<number, string>>(new Map());
    const [editedColors, setEditedColors] = useState<Map<number, string>>(new Map());
    const [editedTypes, setEditedTypes] = useState<Map<number, string>>(new Map());
    const [editedValues, setEditedValues] = useState<Map<number, number>>(new Map());
    const [editedLabels, setEditedLabels] = useState<Map<number, string>>(new Map());

    const [updateEncounterRegion] = useUpdateEncounterRegionMutation();

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
      button: {
        height: '28px',
        fontSize: '10px',
        borderRadius: 0,
        textTransform: 'none' as const,
      },
    };

    const handlePresetClick = (preset: RegionPreset) => {
      setRegionType(preset.type);
      setColor(preset.color);
      setSelectedRegionType(preset.type);
      if (preset.defaultValue !== undefined) {
        setValue(preset.defaultValue);
      }
      if (preset.defaultLabel) {
        setLabel(preset.defaultLabel);
      }
      onPresetSelect?.(preset);
    };

    const handlePlaceRegion = () => {
      const properties: {
        name: string;
        type: string;
        value?: number;
        label?: string;
        color?: string;
      } = {
        name,
        type: regionType,
        color,
      };

      if (regionType === 'Elevation') {
        properties.value = value;
      } else {
        properties.label = label;
      }

      onPlaceRegion?.(properties);

      setName(getSuggestedRegionName([...encounterRegions, { name } as PlacedRegion]));
    };

    const handleBucketFillRegion = () => {
      const properties: {
        name: string;
        type: string;
        value?: number;
        label?: string;
        color?: string;
      } = {
        name,
        type: regionType,
        color,
      };

      if (regionType === 'Elevation') {
        properties.value = value;
      } else {
        properties.label = label;
      }

      onBucketFillRegion?.(properties);

      setName(getSuggestedRegionName([...encounterRegions, { name } as PlacedRegion]));
    };

    const handleDeleteClick = (regionIndex: number) => {
      setRegionToDelete(regionIndex);
      setDeleteConfirmOpen(true);
    };

    const toggleRegionExpanded = (regionIndex: number) => {
      setExpandedRegions((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(regionIndex)) {
          newSet.delete(regionIndex);
          setEditedNames((prevNames) => {
            const newMap = new Map(prevNames);
            newMap.delete(regionIndex);
            return newMap;
          });
          setEditedColors((prevColors) => {
            const newMap = new Map(prevColors);
            newMap.delete(regionIndex);
            return newMap;
          });
          setEditedTypes((prevTypes) => {
            const newMap = new Map(prevTypes);
            newMap.delete(regionIndex);
            return newMap;
          });
          setEditedValues((prevValues) => {
            const newMap = new Map(prevValues);
            newMap.delete(regionIndex);
            return newMap;
          });
          setEditedLabels((prevLabels) => {
            const newMap = new Map(prevLabels);
            newMap.delete(regionIndex);
            return newMap;
          });
        } else {
          newSet.add(regionIndex);
        }
        return newSet;
      });
    };

    const handleRegionPropertyUpdate = async (
      regionIndex: number,
      updates: {
        name?: string;
        type?: string;
        value?: number;
        label?: string;
        color?: string;
      },
    ) => {
      if (!encounterId) return;

      try {
        await updateEncounterRegion({
          encounterId,
          regionIndex,
          ...updates,
        }).unwrap();
      } catch (_error) {
        console.error('[RegionsPanel] Failed to update region');
      }
    };

    const filteredRegions = encounterRegions.filter((region) => region.type === selectedRegionType);

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Typography variant='overline' sx={compactStyles.sectionHeader}>
          Region Type Presets
        </Typography>

        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {REGION_PRESETS.map((preset) => (
            <Button
              key={preset.name}
              id={`btn-preset-${preset.type.toLowerCase()}`}
              variant='outlined'
              size='small'
              onClick={() => handlePresetClick(preset)}
              sx={{
                ...compactStyles.button,
                flex: 1,
                borderColor: regionType === preset.type ? theme.palette.primary.main : theme.palette.divider,
                backgroundColor: regionType === preset.type ? theme.palette.action.selected : 'transparent',
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                  borderColor: theme.palette.primary.main,
                },
              }}
            >
              {preset.name}
            </Button>
          ))}
        </Box>

        <Divider sx={{ my: 0.5 }} />

        <Typography variant='overline' sx={compactStyles.sectionHeader}>
          Default Values
        </Typography>

        <TextField
          id='input-region-name'
          label='Name'
          value={name}
          onChange={(e) => setName(e.target.value)}
          size='small'
          fullWidth
          inputProps={{ maxLength: 64 }}
          sx={compactStyles.textField}
        />

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
          {regionType === 'Elevation' ? (
            <TextField
              id='input-region-value'
              label='Value (feet)'
              type='number'
              value={value}
              onChange={(e) => setValue(Number(e.target.value))}
              size='small'
              sx={{ ...compactStyles.textField, flex: 1 }}
              InputProps={{ inputProps: { min: -100, max: 100, step: 5 } }}
            />
          ) : (
            <FormControl size='small' sx={{ flex: 1 }}>
              <InputLabel id='label-region-label' sx={compactStyles.inputLabel}>
                Label
              </InputLabel>
              <Select
                id='select-region-label'
                labelId='label-region-label'
                value={label}
                label='Label'
                onChange={(e) => setLabel(e.target.value)}
                sx={compactStyles.select}
              >
                {regionType === 'Terrain' &&
                  TERRAIN_VALUES.map((val) => (
                    <MenuItem key={val} value={val} sx={{ fontSize: '11px', minHeight: '32px' }}>
                      {val}
                    </MenuItem>
                  ))}
                {regionType === 'Illumination' &&
                  ILLUMINATION_VALUES.map((val) => (
                    <MenuItem key={val} value={val} sx={{ fontSize: '11px', minHeight: '32px' }}>
                      {val}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
            <Typography sx={{ fontSize: '9px', color: theme.palette.text.secondary }}>Color</Typography>
            <input
              id='input-region-color'
              type='color'
              value={color}
              onChange={(e) => setColor(e.target.value)}
              style={{
                width: '32px',
                height: '32px',
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: '4px',
                cursor: 'pointer',
                padding: 0,
              }}
            />
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant='caption' sx={{ fontSize: '11px', fontWeight: 500 }}>
            Place a Region:
          </Typography>
          <ButtonGroup variant='contained' sx={{ height: '28px' }}>
            <Tooltip title='Place a Polygon' arrow>
              <Button
                id='btn-place-region-polygon'
                onClick={handlePlaceRegion}
                disabled={!name.trim()}
                sx={{
                  ...compactStyles.button,
                  minWidth: '40px',
                  backgroundColor: placementMode === 'polygon' ? theme.palette.primary.dark : undefined,
                  '&:hover': {
                    backgroundColor: placementMode === 'polygon' ? theme.palette.primary.dark : undefined,
                  },
                }}
              >
                <PolygonIcon sx={{ fontSize: '14px' }} />
              </Button>
            </Tooltip>
            <Tooltip title='Fill an Area' arrow>
              <Button
                id='btn-place-region-bucket'
                onClick={handleBucketFillRegion}
                disabled={!name.trim()}
                sx={{
                  ...compactStyles.button,
                  minWidth: '40px',
                  backgroundColor: placementMode === 'bucketFill' ? theme.palette.primary.dark : undefined,
                  '&:hover': {
                    backgroundColor: placementMode === 'bucketFill' ? theme.palette.primary.dark : undefined,
                  },
                }}
              >
                <BucketFillIcon sx={{ fontSize: '14px' }} />
              </Button>
            </Tooltip>
          </ButtonGroup>
        </Box>

        <Divider sx={{ my: 0.5 }} />

        <Typography variant='overline' sx={compactStyles.sectionHeader}>
          Placed {selectedRegionType} Regions ({filteredRegions.length})
        </Typography>

        <List
          sx={{
            maxHeight: 200,
            overflowY: 'auto',
            py: 0,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 1,
          }}
        >
          {filteredRegions.length === 0 ? (
            <ListItem>
              <ListItemText
                primary={
                  <Typography
                    sx={{
                      fontSize: '10px',
                      color: theme.palette.text.disabled,
                    }}
                  >
                    No {selectedRegionType.toLowerCase()} regions placed
                  </Typography>
                }
              />
            </ListItem>
          ) : (
            filteredRegions.map((encounterRegion) => {
              const isExpanded = expandedRegions.has(encounterRegion.index);

              return (
                <React.Fragment key={encounterRegion.id}>
                  <ListItem
                    id={`list-item-region-${encounterRegion.index}`}
                    disablePadding
                    secondaryAction={
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <IconButton
                          id={`btn-edit-region-${encounterRegion.index}`}
                          edge='end'
                          size='small'
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditVertices?.(encounterRegion.index);
                          }}
                          sx={{ width: 20, height: 24 }}
                        >
                          <EditIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                        <IconButton
                          id={`btn-delete-region-${encounterRegion.index}`}
                          edge='end'
                          size='small'
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(encounterRegion.index);
                          }}
                          sx={{
                            width: 20,
                            height: 24,
                            color: theme.palette.error.main,
                          }}
                        >
                          <DeleteIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                      </Box>
                    }
                  >
                    <ListItemButton
                      selected={selectedRegionIndex === encounterRegion.index}
                      onClick={() => onRegionSelect?.(encounterRegion.index)}
                      sx={{ py: 0.5, pr: 10, pl: 0.5 }}
                    >
                      <IconButton
                        size='small'
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleRegionExpanded(encounterRegion.index);
                        }}
                        sx={{ width: 24, height: 24, mr: 0.5 }}
                      >
                        {isExpanded ? (
                          <ExpandLessIcon sx={{ fontSize: 14 }} />
                        ) : (
                          <ExpandMoreIcon sx={{ fontSize: 14 }} />
                        )}
                      </IconButton>

                      {isExpanded ? (
                        <TextField
                          value={editedNames.get(encounterRegion.index) ?? encounterRegion.name}
                          onChange={(e) => {
                            setEditedNames((prev) => {
                              const newMap = new Map(prev);
                              newMap.set(encounterRegion.index, e.target.value);
                              return newMap;
                            });
                          }}
                          onBlur={(e) => {
                            e.stopPropagation();
                            const trimmedValue = e.target.value.trim();
                            if (
                              trimmedValue.length > 0 &&
                              trimmedValue.length <= 64 &&
                              trimmedValue !== encounterRegion.name
                            ) {
                              handleRegionPropertyUpdate(encounterRegion.index, { name: trimmedValue });
                            } else {
                              setEditedNames((prev) => {
                                const newMap = new Map(prev);
                                newMap.delete(encounterRegion.index);
                                return newMap;
                              });
                            }
                          }}
                          onKeyDown={(e) => {
                            e.stopPropagation();
                          }}
                          onClick={(e) => e.stopPropagation()}
                          size='small'
                          fullWidth
                          inputProps={{ maxLength: 64 }}
                          sx={{
                            ...compactStyles.textField,
                            mr: 2,
                          }}
                        />
                      ) : (
                        <ListItemText
                          primary={encounterRegion.name}
                          primaryTypographyProps={{ fontSize: '10px' }}
                          secondary={`${encounterRegion.type} - ${encounterRegion.label || encounterRegion.value || 'N/A'}`}
                          secondaryTypographyProps={{ fontSize: '8px' }}
                        />
                      )}
                    </ListItemButton>
                  </ListItem>

                  <Collapse in={isExpanded} timeout='auto' unmountOnExit>
                    <Box
                      sx={{
                        px: 1,
                        py: 1,
                        backgroundColor: theme.palette.background.default,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <FormControl size='small' sx={{ flex: 1 }} onClick={(e) => e.stopPropagation()}>
                          <InputLabel id={`label-type-${encounterRegion.index}`} sx={compactStyles.inputLabel}>
                            Type
                          </InputLabel>
                          <Select
                            labelId={`label-type-${encounterRegion.index}`}
                            value={editedTypes.get(encounterRegion.index) ?? encounterRegion.type}
                            label='Type'
                            onChange={(e) => {
                              const newType = e.target.value;
                              setEditedTypes((prev) => new Map(prev).set(encounterRegion.index, newType));

                              const updates: {
                                type: string;
                                value?: number;
                                label?: string;
                              } = { type: newType };

                              if (newType === 'Elevation') {
                                updates.value = 0;
                              } else {
                                updates.label = 'Normal';
                              }

                              handleRegionPropertyUpdate(encounterRegion.index, updates);
                            }}
                            onKeyDown={(e) => {
                              e.stopPropagation();
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                            sx={compactStyles.select}
                          >
                            <MenuItem value='Elevation' sx={{ fontSize: '11px', minHeight: '32px' }}>
                              Elevation
                            </MenuItem>
                            <MenuItem value='Terrain' sx={{ fontSize: '11px', minHeight: '32px' }}>
                              Terrain
                            </MenuItem>
                            <MenuItem value='Illumination' sx={{ fontSize: '11px', minHeight: '32px' }}>
                              Illumination
                            </MenuItem>
                          </Select>
                        </FormControl>

                        <input
                          type='color'
                          value={editedColors.get(encounterRegion.index) ?? encounterRegion.color ?? '#ed6c02'}
                          onChange={(e) => {
                            const newColor = e.target.value;
                            if (!isValidHexColor(newColor)) return;

                            setEditedColors((prev) => {
                              const newMap = new Map(prev);
                              newMap.set(encounterRegion.index, newColor);
                              return newMap;
                            });
                            handleRegionPropertyUpdate(encounterRegion.index, {
                              color: newColor,
                            });
                          }}
                          onKeyDown={(e) => {
                            e.stopPropagation();
                          }}
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            width: '32px',
                            height: '32px',
                            border: `1px solid ${theme.palette.divider}`,
                            borderRadius: '4px',
                            cursor: 'pointer',
                            padding: 0,
                          }}
                        />
                      </Box>

                      {(editedTypes.get(encounterRegion.index) ?? encounterRegion.type) === 'Elevation' ? (
                        <TextField
                          label='Value (feet)'
                          type='number'
                          value={editedValues.get(encounterRegion.index) ?? encounterRegion.value ?? 0}
                          onChange={(e) => {
                            const newValue = Number(e.target.value);
                            setEditedValues((prev) => {
                              const newMap = new Map(prev);
                              newMap.set(encounterRegion.index, newValue);
                              return newMap;
                            });
                          }}
                          onBlur={(e) => {
                            handleRegionPropertyUpdate(encounterRegion.index, {
                              value: Number(e.target.value),
                            });
                          }}
                          onKeyDown={(e) => {
                            e.stopPropagation();
                          }}
                          onClick={(e) => e.stopPropagation()}
                          size='small'
                          fullWidth
                          InputProps={{
                            inputProps: { min: -100, max: 100, step: 5 },
                          }}
                          sx={compactStyles.textField}
                        />
                      ) : (
                        <FormControl size='small' fullWidth onClick={(e) => e.stopPropagation()}>
                          <InputLabel id={`label-region-label-${encounterRegion.index}`} sx={compactStyles.inputLabel}>
                            Label
                          </InputLabel>
                          <Select
                            labelId={`label-region-label-${encounterRegion.index}`}
                            value={editedLabels.get(encounterRegion.index) ?? encounterRegion.label ?? 'Normal'}
                            label='Label'
                            onChange={(e) => {
                              const newLabel = e.target.value;
                              setEditedLabels((prev) => {
                                const newMap = new Map(prev);
                                newMap.set(encounterRegion.index, newLabel);
                                return newMap;
                              });
                              handleRegionPropertyUpdate(encounterRegion.index, {
                                label: newLabel,
                              });
                            }}
                            onKeyDown={(e) => {
                              e.stopPropagation();
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                            sx={compactStyles.select}
                          >
                            {(editedTypes.get(encounterRegion.index) ?? encounterRegion.type) === 'Terrain' &&
                              TERRAIN_VALUES.map((val) => (
                                <MenuItem key={val} value={val} sx={{ fontSize: '11px', minHeight: '32px' }}>
                                  {val}
                                </MenuItem>
                              ))}
                            {(editedTypes.get(encounterRegion.index) ?? encounterRegion.type) === 'Illumination' &&
                              ILLUMINATION_VALUES.map((val) => (
                                <MenuItem key={val} value={val} sx={{ fontSize: '11px', minHeight: '32px' }}>
                                  {val}
                                </MenuItem>
                              ))}
                          </Select>
                        </FormControl>
                      )}
                    </Box>
                  </Collapse>
                </React.Fragment>
              );
            })
          )}
        </List>

        <ConfirmDialog
          open={deleteConfirmOpen}
          title='Delete Region'
          message='Are you sure you want to delete this region? This action cannot be undone.'
          onConfirm={() => {
            if (regionToDelete !== null) {
              onRegionDelete?.(regionToDelete);
            }
            setDeleteConfirmOpen(false);
            setRegionToDelete(null);
          }}
          onClose={() => {
            setDeleteConfirmOpen(false);
            setRegionToDelete(null);
          }}
        />
      </Box>
    );
  },
);

RegionsPanel.displayName = 'RegionsPanel';
