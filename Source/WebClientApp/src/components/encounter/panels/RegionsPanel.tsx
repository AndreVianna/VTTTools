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
import React, { useMemo, useState } from 'react';
import { ConfirmDialog } from '@/components/common';
import { useUpdateEncounterRegionMutation } from '@/services/encounterApi';
import type { PlacedRegion } from '@/types/domain';
import { getRegionColor, getRegionFillOpacity, sortRegions } from '@/utils/regionColorUtils';
import {
  getRegionDisplayLabel,
  getValidValuesForType,
  getDefaultValueForType,
} from '@/utils/regionLabelUtils';
import { REGION_PRESETS, type RegionPreset } from './regionsPanelTypes';

export interface RegionsPanelProps {
  encounterId?: string;
  encounterRegions?: PlacedRegion[];
  selectedRegionIndex?: number | null;
  placementMode?: 'polygon' | 'bucketFill' | null;
  onPresetSelect?: (preset: RegionPreset) => void;
  onPlaceRegion?: (properties: { name: string; type: string; value: number }) => void;
  onBucketFillRegion?: (properties: { name: string; type: string; value: number }) => void;
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

export const RegionsPanel: React.FC<RegionsPanelProps> = React.memo(
  ({
    encounterId,
    encounterRegions = [],
    selectedRegionIndex,
    onPresetSelect,
    onPlaceRegion,
    onBucketFillRegion,
    onRegionSelect,
    onRegionDelete,
    onEditVertices,
  }) => {
    const theme = useTheme();

    const [regionType, setRegionType] = useState<string>('Elevation');
    const [value, setValue] = useState<number>(0);
    const [selectedRegionType, setSelectedRegionType] = useState<string>('Elevation');
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [regionToDelete, setRegionToDelete] = useState<number | null>(null);
    const [expandedRegions, setExpandedRegions] = useState<Set<number>>(new Set());
    const [editedNames, setEditedNames] = useState<Map<number, string>>(new Map());
    const [editedTypes, setEditedTypes] = useState<Map<number, string>>(new Map());
    const [editedValues, setEditedValues] = useState<Map<number, number>>(new Map());

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
      setSelectedRegionType(preset.type);
      setValue(preset.defaultValue);
      onPresetSelect?.(preset);
    };

    const handlePlaceRegion = () => {
      const name = getSuggestedRegionName(encounterRegions);
      onPlaceRegion?.({
        name,
        type: regionType,
        value,
      });
    };

    const handleBucketFillRegion = () => {
      const name = getSuggestedRegionName(encounterRegions);
      onBucketFillRegion?.({
        name,
        type: regionType,
        value,
      });
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

    const filteredAndSortedRegions = useMemo(() => {
      const filtered = encounterRegions.filter((region) => region.type === selectedRegionType);
      return sortRegions(filtered);
    }, [encounterRegions, selectedRegionType]);

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
          New Region
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
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
              <InputLabel id='label-region-value' sx={compactStyles.inputLabel}>
                Value
              </InputLabel>
              <Select
                id='select-region-value'
                labelId='label-region-value'
                value={value}
                label='Value'
                onChange={(e) => setValue(Number(e.target.value))}
                sx={compactStyles.select}
              >
                {getValidValuesForType(regionType).map(({ value: val, label: lbl }) => (
                  <MenuItem key={val} value={val} sx={{ fontSize: '11px', minHeight: '32px' }}>
                    {lbl}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          <Tooltip title='Place a Polygon Region' arrow>
            <IconButton
              id='btn-place-region-polygon'
              onClick={handlePlaceRegion}
              sx={{
                width: 28,
                height: 28,
                borderRadius: 0,
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                '&:hover': {
                  backgroundColor: theme.palette.primary.dark,
                },
              }}
            >
              <PolygonIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title='Fill an Area' arrow>
            <IconButton
              id='btn-place-region-bucket'
              onClick={handleBucketFillRegion}
              sx={{
                width: 28,
                height: 28,
                borderRadius: 0,
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                '&:hover': {
                  backgroundColor: theme.palette.primary.dark,
                },
              }}
            >
              <BucketFillIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        </Box>

        <Divider sx={{ my: 0.5 }} />

        <Typography variant='overline' sx={compactStyles.sectionHeader}>
          Placed {selectedRegionType} Regions ({filteredAndSortedRegions.length})
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
          {filteredAndSortedRegions.length === 0 ? (
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
            filteredAndSortedRegions.map((encounterRegion) => {
              const isExpanded = expandedRegions.has(encounterRegion.index);
              const regionColor = getRegionColor(encounterRegion, encounterRegions);
              const regionOpacity = getRegionFillOpacity(encounterRegion);

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

                      <Box
                        sx={{
                          width: 16,
                          height: 16,
                          borderRadius: '2px',
                          backgroundColor: regionColor === 'transparent' ? 'transparent' : regionColor,
                          opacity: regionOpacity,
                          border: `1px solid ${regionColor === 'transparent' ? theme.palette.grey[500] : regionColor}`,
                          mr: 1,
                          flexShrink: 0,
                        }}
                      />

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
                          secondary={`${encounterRegion.type} - ${getRegionDisplayLabel(encounterRegion)}`}
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
                      <FormControl size='small' fullWidth onClick={(e) => e.stopPropagation()}>
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

                            const newValue = getDefaultValueForType(newType);
                            setEditedValues((prev) => new Map(prev).set(encounterRegion.index, newValue));

                            handleRegionPropertyUpdate(encounterRegion.index, {
                              type: newType,
                              value: newValue,
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
                          <InputLabel id={`label-region-value-${encounterRegion.index}`} sx={compactStyles.inputLabel}>
                            Value
                          </InputLabel>
                          <Select
                            labelId={`label-region-value-${encounterRegion.index}`}
                            value={editedValues.get(encounterRegion.index) ?? encounterRegion.value ?? 0}
                            label='Value'
                            onChange={(e) => {
                              const newValue = Number(e.target.value);
                              setEditedValues((prev) => new Map(prev).set(encounterRegion.index, newValue));
                              handleRegionPropertyUpdate(encounterRegion.index, {
                                value: newValue,
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
                            {getValidValuesForType(
                              editedTypes.get(encounterRegion.index) ?? encounterRegion.type,
                            ).map(({ value: val, label: lbl }) => (
                              <MenuItem key={val} value={val} sx={{ fontSize: '11px', minHeight: '32px' }}>
                                {lbl}
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
