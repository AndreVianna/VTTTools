import {
  Delete as DeleteIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  VolumeUp as VolumeUpIcon,
} from '@mui/icons-material';
import {
  Box,
  Checkbox,
  Collapse,
  Divider,
  FormControlLabel,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import React, { useState } from 'react';
import { ConfirmDialog } from '@/components/common';
import {
  useUpdateEncounterSoundSourceMutation,
  useRemoveEncounterSoundSourceMutation,
} from '@/services/encounterApi';
import { type EncounterSoundSource } from '@/types/domain';

export interface SoundsPanelProps {
  encounterId: string;
  soundSources: EncounterSoundSource[];
  selectedSourceIndex: number | null;
  onSourceSelect: (index: number) => void;
  onPlaceSound: (properties: SoundPlacementProperties) => void;
}

export interface SoundPlacementProperties {
  name?: string;
  resourceId?: string;
  isPlaying?: boolean;
}

export const SoundsPanel: React.FC<SoundsPanelProps> = React.memo(
  ({
    encounterId,
    soundSources = [],
    selectedSourceIndex,
    onSourceSelect,
    onPlaceSound,
  }) => {
    const theme = useTheme();

    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [sourceToDelete, setSourceToDelete] = useState<number | null>(null);
    const [expandedSources, setExpandedSources] = useState<Set<number>>(new Set());
    const [editedNames, setEditedNames] = useState<Map<number, string>>(new Map());

    const [updateEncounterSoundSource] = useUpdateEncounterSoundSourceMutation();
    const [removeEncounterSoundSource] = useRemoveEncounterSoundSourceMutation();

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
      checkbox: {
        '& .MuiFormControlLabel-label': {
          fontSize: '11px',
        },
        '& .MuiCheckbox-root': {
          padding: '4px',
        },
      },
    };

    const handlePlaceSound = () => {
      onPlaceSound({
        isPlaying: false,
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
        isPlaying?: boolean;
      },
    ) => {
      if (!encounterId) return;

      try {
        await updateEncounterSoundSource({
          encounterId,
          sourceIndex,
          ...updates,
        }).unwrap();
      } catch (_error) {
        console.error('[SoundsPanel] Failed to update sound source');
      }
    };

    const handleDeleteSource = async (sourceIndex: number) => {
      if (!encounterId) return;

      try {
        await removeEncounterSoundSource({
          encounterId,
          sourceIndex,
        }).unwrap();
      } catch (_error) {
        console.error('[SoundsPanel] Failed to delete sound source');
      }
    };

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Typography variant='overline' sx={compactStyles.sectionHeader}>
          New Sound Source
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title='Place a Sound Source' arrow>
            <IconButton
              id='btn-place-sound'
              onClick={handlePlaceSound}
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
              <VolumeUpIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        </Box>

        <Divider sx={{ my: 0.5 }} />

        <Typography variant='overline' sx={compactStyles.sectionHeader}>
          Placed Sounds ({soundSources.length})
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
          {soundSources.length === 0 ? (
            <ListItem>
              <ListItemText
                primary={
                  <Typography
                    sx={{
                      fontSize: '10px',
                      color: theme.palette.text.disabled,
                    }}
                  >
                    No sounds placed
                  </Typography>
                }
              />
            </ListItem>
          ) : (
            soundSources.map((source) => {
              const isExpanded = expandedSources.has(source.index);

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
                          backgroundColor: '#4169E1',
                          border: `1px solid ${theme.palette.divider}`,
                          mr: 1,
                          flexShrink: 0,
                          opacity: source.isPlaying ? 1 : 0.3,
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
                          primary={source.name || `Sound #${source.index}`}
                          primaryTypographyProps={{ fontSize: '10px' }}
                          secondary={
                            `Range: ${source.range}ft | ${source.isPlaying ? 'Playing' : 'Paused'}${source.resourceId ? ` | Resource: ${source.resourceId}` : ''}`
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
                        Range: {source.range} feet
                      </Typography>
                      {source.resourceId && (
                        <Typography variant='caption' sx={{ fontSize: '9px', color: theme.palette.text.secondary }}>
                          Resource ID: {source.resourceId}
                        </Typography>
                      )}
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={source.isPlaying}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleSourcePropertyUpdate(source.index, { isPlaying: e.target.checked });
                            }}
                            size='small'
                          />
                        }
                        label='Playing'
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
          title='Delete Sound'
          message='Are you sure you want to delete this sound? This action cannot be undone.'
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

SoundsPanel.displayName = 'SoundsPanel';
