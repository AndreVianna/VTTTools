import {
  Delete as DeleteIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  AddCircle as AddCircleIcon,
} from '@mui/icons-material';
import {
  Box,
  Checkbox,
  Collapse,
  Divider,
  FormControl,
  FormControlLabel,
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
import {
  useUpdateLightMutation,
  useDeleteLightMutation,
} from '@/services/stageApi';
import { LightSourceType, type EncounterLightSource } from '@/types/domain';

export interface LightsPanelProps {
  encounterId: string;
  lightSources: EncounterLightSource[];
  selectedSourceIndex: number | null;
  onSourceSelect: (index: number) => void;
  onPlaceLight: (properties: LightPlacementProperties) => void;
  gridScale?: number;
}

export interface LightPlacementProperties {
  name?: string;
  type: LightSourceType;
  isDirectional: boolean;
  direction?: number;
  arc?: number;
  color?: string;
  isOn?: boolean;
}

const DEFAULT_COLORS: Record<LightSourceType, string> = {
  [LightSourceType.Natural]: '#FF9900',
  [LightSourceType.Artificial]: '#FFFFFF',
  [LightSourceType.Supernatural]: '#9370DB',
};

const LIGHT_SOURCE_TYPE_LABELS: Record<LightSourceType, string> = {
  [LightSourceType.Natural]: 'Natural',
  [LightSourceType.Artificial]: 'Artificial',
  [LightSourceType.Supernatural]: 'Supernatural',
};

const DIRECTIONAL_OPTIONS = [
  { value: false, label: 'Spot' },
  { value: true, label: 'Beam' },
];

export const LightsPanel: React.FC<LightsPanelProps> = React.memo(
  ({
    encounterId,
    lightSources = [],
    selectedSourceIndex,
    onSourceSelect,
    onPlaceLight,
    gridScale = 5,
  }) => {
    const theme = useTheme();

    const [type, setType] = useState<LightSourceType>(LightSourceType.Natural);
    const [isDirectional, setIsDirectional] = useState(false);
    const [customColor, setCustomColor] = useState<string>('');
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [sourceToDelete, setSourceToDelete] = useState<number | null>(null);
    const [expandedSources, setExpandedSources] = useState<Set<number>>(new Set());
    const [editedNames, setEditedNames] = useState<Map<number, string>>(new Map());
    const [editedRanges, setEditedRanges] = useState<Map<number, string>>(new Map());

    const [updateLight] = useUpdateLightMutation();
    const [deleteLight] = useDeleteLightMutation();

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
      checkbox: {
        '& .MuiFormControlLabel-label': {
          fontSize: '11px',
        },
        '& .MuiCheckbox-root': {
          padding: '4px',
        },
      },
    };

    const handlePlaceLight = () => {
      onPlaceLight({
        type,
        isDirectional,
        ...(customColor && { color: customColor }),
        isOn: true,
      });
    };

    const handleDeleteClick = (sourceIndex: number) => {
      setSourceToDelete(sourceIndex);
      setDeleteConfirmOpen(true);
    };

    const toggleSourceExpanded = (sourceIndex: number) => {
      setExpandedSources((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(sourceIndex)) {
          newSet.delete(sourceIndex);
          setEditedNames((prevNames) => {
            const newMap = new Map(prevNames);
            newMap.delete(sourceIndex);
            return newMap;
          });
          setEditedRanges((prevRanges) => {
            const newMap = new Map(prevRanges);
            newMap.delete(sourceIndex);
            return newMap;
          });
        } else {
          newSet.add(sourceIndex);
        }
        return newSet;
      });
    };

    const handleSourcePropertyUpdate = async (
      sourceIndex: number,
      updates: {
        name?: string;
        isOn?: boolean;
        range?: number;
      },
    ) => {
      if (!encounterId) return;

      try {
        await updateLight({
          stageId: encounterId,
          index: sourceIndex,
          data: updates,
        }).unwrap();
      } catch (_error) {
        console.error('[LightsPanel] Failed to update light source');
      }
    };

    const handleDeleteSource = async (sourceIndex: number) => {
      if (!encounterId) return;

      try {
        await deleteLight({
          stageId: encounterId,
          index: sourceIndex,
        }).unwrap();
      } catch (_error) {
        console.error('[LightsPanel] Failed to delete light source');
      }
    };

    const currentColor = customColor || DEFAULT_COLORS[type];

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Typography variant='overline' sx={compactStyles.sectionHeader}>
          New Light Source
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <FormControl size='small' sx={{ flex: 1 }}>
            <InputLabel id='label-light-type' sx={compactStyles.inputLabel}>
              Type
            </InputLabel>
            <Select
              labelId='label-light-type'
              value={type}
              label='Type'
              onChange={(e) => setType(e.target.value as LightSourceType)}
              sx={compactStyles.select}
            >
              {Object.entries(LIGHT_SOURCE_TYPE_LABELS).map(([value, label]) => (
                <MenuItem key={value} value={Number(value)} sx={{ fontSize: '11px', minHeight: '32px' }}>
                  {label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size='small' sx={{ minWidth: 70, maxWidth: 70 }}>
            <InputLabel id='label-light-directional' sx={compactStyles.inputLabel}>
              Mode
            </InputLabel>
            <Select
              labelId='label-light-directional'
              value={isDirectional ? 'true' : 'false'}
              label='Mode'
              onChange={(e) => setIsDirectional(e.target.value === 'true')}
              sx={compactStyles.select}
            >
              {DIRECTIONAL_OPTIONS.map((option) => (
                <MenuItem key={String(option.value)} value={String(option.value)} sx={{ fontSize: '11px', minHeight: '32px' }}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <input
            type='color'
            value={currentColor}
            onChange={(e) => setCustomColor(e.target.value)}
            style={{
              width: 28,
              height: 28,
              padding: 0,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 4,
              cursor: 'pointer',
              flexShrink: 0,
            }}
          />
          <Tooltip title='Place a Light Source' arrow>
            <IconButton
              id='btn-place-light'
              onClick={handlePlaceLight}
              sx={{
                width: 28,
                height: 28,
                borderRadius: 0,
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                flexShrink: 0,
                '&:hover': {
                  backgroundColor: theme.palette.primary.dark,
                },
              }}
            >
              <AddCircleIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        </Box>

        <Divider sx={{ my: 0.5 }} />

        <Typography variant='overline' sx={compactStyles.sectionHeader}>
          Placed Lights ({lightSources.length})
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
          {lightSources.length === 0 ? (
            <ListItem>
              <ListItemText
                primary={
                  <Typography
                    sx={{
                      fontSize: '10px',
                      color: theme.palette.text.disabled,
                    }}
                  >
                    No lights placed
                  </Typography>
                }
              />
            </ListItem>
          ) : (
            lightSources.map((source) => {
              const isExpanded = expandedSources.has(source.index);
              const sourceColor = source.color || DEFAULT_COLORS[source.type];

              return (
                <React.Fragment key={source.index}>
                  <ListItem
                    id={`list-item-source-${source.index}`}
                    disablePadding
                    secondaryAction={
                      <IconButton
                        id={`btn-delete-source-${source.index}`}
                        edge='end'
                        size='small'
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(source.index);
                        }}
                        sx={{
                          width: 20,
                          height: 24,
                          color: theme.palette.error.main,
                        }}
                      >
                        <DeleteIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    }
                  >
                    <ListItemButton
                      selected={selectedSourceIndex === source.index}
                      onClick={() => onSourceSelect(source.index)}
                      sx={{ py: 0.5, pr: 6, pl: 0.5 }}
                    >
                      <IconButton
                        size='small'
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSourceExpanded(source.index);
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
                          borderRadius: '50%',
                          backgroundColor: sourceColor,
                          border: `1px solid ${theme.palette.divider}`,
                          mr: 1,
                          flexShrink: 0,
                          opacity: source.isOn ? 1 : 0.3,
                        }}
                      />

                      {isExpanded ? (
                        <TextField
                          value={editedNames.get(source.index) ?? source.name ?? ''}
                          onChange={(e) => {
                            setEditedNames((prev) => {
                              const newMap = new Map(prev);
                              newMap.set(source.index, e.target.value);
                              return newMap;
                            });
                          }}
                          onBlur={(e) => {
                            e.stopPropagation();
                            const trimmedValue = e.target.value.trim();
                            if (trimmedValue.length <= 64 && trimmedValue !== (source.name ?? '')) {
                              handleSourcePropertyUpdate(
                                source.index,
                                trimmedValue ? { name: trimmedValue } : {},
                              );
                            }
                            setEditedNames((prev) => {
                              const newMap = new Map(prev);
                              newMap.delete(source.index);
                              return newMap;
                            });
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
                          primary={source.name || `Light #${source.index}`}
                          primaryTypographyProps={{ fontSize: '10px' }}
                          secondary={
                            source.direction !== undefined && source.arc !== undefined
                              ? `${LIGHT_SOURCE_TYPE_LABELS[source.type]} | Beam | ${source.isOn ? 'On' : 'Off'}`
                              : `${LIGHT_SOURCE_TYPE_LABELS[source.type]} | Spot | ${source.isOn ? 'On' : 'Off'}`
                          }
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
                        gap: 0.5,
                      }}
                    >
                      <Typography variant='caption' sx={{ fontSize: '9px', color: theme.palette.text.secondary }}>
                        Type: {LIGHT_SOURCE_TYPE_LABELS[source.type]}
                      </Typography>
                      <Typography variant='caption' sx={{ fontSize: '9px', color: theme.palette.text.secondary }}>
                        Mode: {source.direction !== undefined ? 'Beam' : 'Spot'}
                      </Typography>
                      {(() => {
                        const rangeDisplayValue = editedRanges.get(source.index) ?? String(source.range * gridScale);
                        const parsedValue = parseFloat(rangeDisplayValue);
                        const isValidRange = !isNaN(parsedValue) && parsedValue >= 0;
                        return (
                          <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant='caption' sx={{ fontSize: '9px', color: theme.palette.text.secondary, minWidth: 40 }}>
                                Range:
                              </Typography>
                              <TextField
                                type='number'
                                value={rangeDisplayValue}
                                onChange={(e) => {
                                  setEditedRanges((prev) => {
                                    const newMap = new Map(prev);
                                    newMap.set(source.index, e.target.value);
                                    return newMap;
                                  });
                                }}
                                onBlur={() => {
                                  if (isValidRange) {
                                    const newRange = parsedValue / gridScale;
                                    if (newRange !== source.range) {
                                      handleSourcePropertyUpdate(source.index, { range: newRange });
                                    }
                                  }
                                  setEditedRanges((prev) => {
                                    const newMap = new Map(prev);
                                    newMap.delete(source.index);
                                    return newMap;
                                  });
                                }}
                                onClick={(e) => e.stopPropagation()}
                                onKeyDown={(e) => {
                                  e.stopPropagation();
                                  if (e.key === 'Enter') {
                                    (e.target as HTMLInputElement).blur();
                                  } else if (e.key === 'Escape') {
                                    setEditedRanges((prev) => {
                                      const newMap = new Map(prev);
                                      newMap.delete(source.index);
                                      return newMap;
                                    });
                                    (e.target as HTMLInputElement).blur();
                                  }
                                }}
                                error={!isValidRange}
                                size='small'
                                inputProps={{ min: 0, step: gridScale }}
                                sx={{ ...compactStyles.textField, width: 70 }}
                              />
                              <Typography variant='caption' sx={{ fontSize: '9px', color: theme.palette.text.secondary }}>
                                ft
                              </Typography>
                            </Box>
                            {!isValidRange && (
                              <Typography variant='caption' sx={{ fontSize: '8px', color: theme.palette.error.main, mt: 0.25, display: 'block' }}>
                                Invalid range (cannot be negative)
                              </Typography>
                            )}
                          </Box>
                        );
                      })()}
                      {source.color && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Typography variant='caption' sx={{ fontSize: '9px', color: theme.palette.text.secondary }}>
                            Color:
                          </Typography>
                          <Box
                            sx={{
                              width: 12,
                              height: 12,
                              borderRadius: '50%',
                              backgroundColor: source.color,
                              border: `1px solid ${theme.palette.divider}`,
                            }}
                          />
                          <Typography variant='caption' sx={{ fontSize: '9px', color: theme.palette.text.secondary }}>
                            {source.color}
                          </Typography>
                        </Box>
                      )}
                      {source.direction !== undefined && source.arc !== undefined && (
                        <>
                          <Typography variant='caption' sx={{ fontSize: '9px', color: theme.palette.text.secondary }}>
                            Direction: {source.direction}°
                          </Typography>
                          <Typography variant='caption' sx={{ fontSize: '9px', color: theme.palette.text.secondary }}>
                            Arc: {source.arc}°
                          </Typography>
                        </>
                      )}
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={source.isOn}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleSourcePropertyUpdate(source.index, { isOn: e.target.checked });
                            }}
                            size='small'
                          />
                        }
                        label='Light On'
                        sx={compactStyles.checkbox}
                      />
                    </Box>
                  </Collapse>
                </React.Fragment>
              );
            })
          )}
        </List>

        <ConfirmDialog
          open={deleteConfirmOpen}
          title='Delete Light'
          message='Are you sure you want to delete this light? This action cannot be undone.'
          onConfirm={() => {
            if (sourceToDelete !== null) {
              handleDeleteSource(sourceToDelete);
            }
            setDeleteConfirmOpen(false);
            setSourceToDelete(null);
          }}
          onClose={() => {
            setDeleteConfirmOpen(false);
            setSourceToDelete(null);
          }}
        />
      </Box>
    );
  },
);

LightsPanel.displayName = 'LightsPanel';
