import {
  Delete as DeleteIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  LightMode as LightModeIcon,
} from '@mui/icons-material';
import {
  Box,
  Button,
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
  Slider,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import React, { useMemo, useState } from 'react';
import { ConfirmDialog } from '@/components/common';
import {
  useAddEncounterLightSourceMutation,
  useUpdateEncounterLightSourceMutation,
  useRemoveEncounterLightSourceMutation,
} from '@/services/encounterApi';
import { LightSourceType, type EncounterLightSource } from '@/types/domain';

export interface LightsPanelProps {
  encounterId: string;
  lightSources: EncounterLightSource[];
  selectedSourceIndex: number | null;
  onSourceSelect: (index: number) => void;
  onPlaceLight: (properties: LightPlacementProperties) => void;
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
  [LightSourceType.Natural]: '#FF4500',
  [LightSourceType.Artificial]: '#FFFFFF',
  [LightSourceType.Supernatural]: '#9370DB',
};

const LIGHT_SOURCE_TYPE_LABELS: Record<LightSourceType, string> = {
  [LightSourceType.Natural]: 'Natural',
  [LightSourceType.Artificial]: 'Artificial',
  [LightSourceType.Supernatural]: 'Supernatural',
};

const getSuggestedLightName = (sources: EncounterLightSource[]): string => {
  if (sources.length === 0) return 'Light 1';
  const maxIndex = Math.max(
    ...sources.map((s) => {
      const match = s.name?.match(/Light (\d+)$/);
      return match?.[1] ? Number.parseInt(match[1], 10) : 0;
    }),
  );
  return `Light ${maxIndex + 1}`;
};

export const LightsPanel: React.FC<LightsPanelProps> = React.memo(
  ({
    encounterId,
    lightSources = [],
    selectedSourceIndex,
    onSourceSelect,
    onPlaceLight,
  }) => {
    const theme = useTheme();

    const [name, setName] = useState(() => getSuggestedLightName(lightSources));
    const [type, setType] = useState<LightSourceType>(LightSourceType.Artificial);
    const [isDirectional, setIsDirectional] = useState(false);
    const [direction, setDirection] = useState(0);
    const [arc, setArc] = useState(90);
    const [customColor, setCustomColor] = useState<string>('');
    const [isOn, setIsOn] = useState(true);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [sourceToDelete, setSourceToDelete] = useState<number | null>(null);
    const [expandedSources, setExpandedSources] = useState<Set<number>>(new Set());
    const [editedNames, setEditedNames] = useState<Map<number, string>>(new Map());

    const [updateEncounterLightSource] = useUpdateEncounterLightSourceMutation();
    const [removeEncounterLightSource] = useRemoveEncounterLightSourceMutation();

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
      button: {
        height: '28px',
        fontSize: '10px',
        borderRadius: 0,
        textTransform: 'none' as const,
      },
      checkbox: {
        '& .MuiFormControlLabel-label': {
          fontSize: '11px',
        },
        '& .MuiCheckbox-root': {
          padding: '4px',
        },
      },
      slider: {
        '& .MuiSlider-markLabel': {
          fontSize: '8px',
        },
      },
    };

    const handlePlaceLight = () => {
      onPlaceLight({
        name: name.trim() || undefined,
        type,
        isDirectional,
        direction: isDirectional ? direction : undefined,
        arc: isDirectional ? arc : undefined,
        color: customColor || undefined,
        isOn,
      });

      setName(getSuggestedLightName([...lightSources, { name, type } as EncounterLightSource]));
      setType(LightSourceType.Artificial);
      setIsDirectional(false);
      setDirection(0);
      setArc(90);
      setCustomColor('');
      setIsOn(true);
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
      },
    ) => {
      if (!encounterId) return;

      try {
        await updateEncounterLightSource({
          encounterId,
          sourceIndex,
          ...updates,
        }).unwrap();
      } catch (_error) {
        console.error('[LightsPanel] Failed to update light source');
      }
    };

    const handleDeleteSource = async (sourceIndex: number) => {
      if (!encounterId) return;

      try {
        await removeEncounterLightSource({
          encounterId,
          sourceIndex,
        }).unwrap();
      } catch (_error) {
        console.error('[LightsPanel] Failed to delete light source');
      }
    };

    const currentColor = customColor || DEFAULT_COLORS[type];

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Typography variant='overline' sx={compactStyles.sectionHeader}>
          New Light
        </Typography>

        <TextField
          id='input-light-name'
          label='Name (Optional)'
          value={name}
          onChange={(e) => setName(e.target.value)}
          size='small'
          fullWidth
          inputProps={{ maxLength: 64 }}
          sx={compactStyles.textField}
        />

        <FormControl size='small' fullWidth>
          <InputLabel id='light-type-label' sx={{ fontSize: '9px' }}>
            Type
          </InputLabel>
          <Select
            labelId='light-type-label'
            id='select-light-type'
            value={type}
            label='Type'
            onChange={(e) => setType(e.target.value as LightSourceType)}
            sx={{
              height: '28px',
              fontSize: '11px',
              backgroundColor: theme.palette.background.default,
            }}
          >
            {Object.entries(LIGHT_SOURCE_TYPE_LABELS).map(([value, label]) => (
              <MenuItem key={value} value={Number(value)} sx={{ fontSize: '11px' }}>
                {label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <TextField
            id='input-custom-color'
            label='Color (Optional)'
            type='color'
            value={currentColor}
            onChange={(e) => setCustomColor(e.target.value)}
            size='small'
            sx={{
              ...compactStyles.textField,
              flex: 1,
            }}
          />
          <Box
            sx={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              backgroundColor: currentColor,
              border: `1px solid ${theme.palette.divider}`,
              flexShrink: 0,
            }}
          />
        </Box>

        <FormControlLabel
          control={
            <Checkbox
              id='checkbox-is-on'
              checked={isOn}
              onChange={(e) => setIsOn(e.target.checked)}
              size='small'
            />
          }
          label='Light On'
          sx={compactStyles.checkbox}
        />

        <FormControlLabel
          control={
            <Checkbox
              id='checkbox-directional'
              checked={isDirectional}
              onChange={(e) => setIsDirectional(e.target.checked)}
              size='small'
            />
          }
          label='Directional'
          sx={compactStyles.checkbox}
        />

        {isDirectional && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, pl: 1 }}>
            <Box>
              <Typography variant='caption' sx={{ fontSize: '10px', color: theme.palette.text.secondary }}>
                Direction: {direction}°
              </Typography>
              <Slider
                id='slider-direction'
                value={direction}
                onChange={(_, value) => setDirection(value as number)}
                min={0}
                max={359}
                step={1}
                size='small'
                sx={compactStyles.slider}
                marks={[
                  { value: 0, label: '0°' },
                  { value: 90, label: '90°' },
                  { value: 180, label: '180°' },
                  { value: 270, label: '270°' },
                ]}
              />
            </Box>

            <Box>
              <Typography variant='caption' sx={{ fontSize: '10px', color: theme.palette.text.secondary }}>
                Arc: {arc}°
              </Typography>
              <Slider
                id='slider-arc'
                value={arc}
                onChange={(_, value) => setArc(value as number)}
                min={15}
                max={180}
                step={15}
                size='small'
                sx={compactStyles.slider}
                marks={[
                  { value: 15, label: '15°' },
                  { value: 90, label: '90°' },
                  { value: 180, label: '180°' },
                ]}
              />
            </Box>
          </Box>
        )}

        <Button
          id='btn-place-light'
          variant='contained'
          onClick={handlePlaceLight}
          sx={compactStyles.button}
        >
          Place Light
        </Button>

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
                              handleSourcePropertyUpdate(source.index, {
                                name: trimmedValue || undefined,
                              });
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
                              ? `${LIGHT_SOURCE_TYPE_LABELS[source.type]} | Range: ${source.range}ft | ${source.isOn ? 'On' : 'Off'} | Dir: ${source.direction}° | Arc: ${source.arc}°`
                              : `${LIGHT_SOURCE_TYPE_LABELS[source.type]} | Range: ${source.range}ft | ${source.isOn ? 'On' : 'Off'}`
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
                        Range: {source.range} feet
                      </Typography>
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
