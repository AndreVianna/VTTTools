import {
  Delete as DeleteIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  FolderOpen as BrowseIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import {
  Box,
  Button,
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
import { AudioPreviewPlayer, SoundPickerDialog } from '@/components/sounds';
import {
  useUpdateEncounterSoundSourceMutation,
  useRemoveEncounterSoundSourceMutation,
} from '@/services/encounterApi';
import { useGetMediaResourceQuery } from '@/services/mediaApi';
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

const formatDuration = (duration: string): string => {
  if (!duration) return '0:00';
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?/);
  if (!match) return duration;
  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = Math.floor(parseFloat(match[3] || '0'));
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const SoundResourceInfo: React.FC<{ resourceId: string }> = ({ resourceId }) => {
  const theme = useTheme();
  const { data: resource } = useGetMediaResourceQuery(resourceId);

  if (!resource) {
    return <Typography sx={{ fontSize: '9px', color: theme.palette.text.secondary }}>Loading...</Typography>;
  }

  return (
    <Typography sx={{ fontSize: '9px', color: theme.palette.text.secondary }}>
      {resource.fileName} ({formatDuration(resource.duration)})
    </Typography>
  );
};

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
    const [soundPickerOpen, setSoundPickerOpen] = useState(false);
    const [soundPickerSourceIndex, setSoundPickerSourceIndex] = useState<number | null>(null);
    const [newSoundPickerOpen, setNewSoundPickerOpen] = useState(false);

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

    const handleBrowseSoundsForNew = () => {
      setNewSoundPickerOpen(true);
    };

    const handleNewSoundSelected = (resourceId: string) => {
      setNewSoundPickerOpen(false);
      onPlaceSound({
        resourceId,
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

    const handleBrowseSound = (sourceIndex: number) => {
      setSoundPickerSourceIndex(sourceIndex);
      setSoundPickerOpen(true);
    };

    const handleSoundSelected = async (resourceId: string) => {
      if (soundPickerSourceIndex !== null && encounterId) {
        try {
          await updateEncounterSoundSource({
            encounterId,
            sourceIndex: soundPickerSourceIndex,
            resourceId,
          }).unwrap();
        } catch (_error) {
          console.error('[SoundsPanel] Failed to set sound resource');
        }
      }
      setSoundPickerOpen(false);
      setSoundPickerSourceIndex(null);
    };

    const handleClearSound = async (sourceIndex: number) => {
      if (!encounterId) return;
      try {
        await updateEncounterSoundSource({
          encounterId,
          sourceIndex,
          resourceId: null,
        }).unwrap();
      } catch (_error) {
        console.error('[SoundsPanel] Failed to clear sound resource');
      }
    };

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Typography variant='overline' sx={compactStyles.sectionHeader}>
          Add Sound Source
        </Typography>

        <Tooltip title='Select from Library (or upload new)' arrow>
          <Button
            variant='contained'
            onClick={handleBrowseSoundsForNew}
            startIcon={<BrowseIcon />}
            fullWidth
            sx={{
              height: '28px',
              fontSize: '11px',
              textTransform: 'none',
              fontWeight: 500,
            }}
          >
            Browse Sounds
          </Button>
        </Tooltip>

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
                          primary={source.name || `Sound #${source.index}`}
                          primaryTypographyProps={{ fontSize: '10px' }}
                          secondary={
                            `Range: ${source.range}ft | ${source.isPlaying ? 'Playing' : 'Paused'}${source.resource?.id ? ` | Has Sound` : ''}`
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
                      <Typography variant='caption' sx={{ fontSize: '9px', color: theme.palette.text.secondary, fontWeight: 600 }}>
                        Range
                      </Typography>
                      <Typography variant='caption' sx={{ fontSize: '9px', color: theme.palette.text.secondary, mb: 1 }}>
                        {source.range} feet
                      </Typography>

                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Typography variant='caption' sx={{ fontSize: '9px', color: theme.palette.text.secondary, fontWeight: 600 }}>
                          Sound Resource
                        </Typography>

                        {source.resource?.id ? (
                          <>
                            <SoundResourceInfo resourceId={source.resource.id} />

                            <AudioPreviewPlayer resourceId={source.resource.id} compact />

                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                              <Button
                                size='small'
                                variant='outlined'
                                startIcon={<BrowseIcon sx={{ fontSize: 12 }} />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleBrowseSound(source.index);
                                }}
                                sx={{ fontSize: '9px', py: 0.25, flex: 1 }}
                              >
                                Change
                              </Button>
                              <Button
                                size='small'
                                variant='outlined'
                                color='error'
                                startIcon={<ClearIcon sx={{ fontSize: 12 }} />}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleClearSound(source.index);
                                }}
                                sx={{ fontSize: '9px', py: 0.25 }}
                              >
                                Clear
                              </Button>
                            </Box>
                          </>
                        ) : (
                          <>
                            <Typography sx={{ fontSize: '9px', color: theme.palette.text.disabled }}>
                              No sound assigned
                            </Typography>
                            <Button
                              size='small'
                              variant='outlined'
                              fullWidth
                              startIcon={<BrowseIcon sx={{ fontSize: 12 }} />}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleBrowseSound(source.index);
                              }}
                              sx={{ fontSize: '9px', py: 0.25 }}
                            >
                              Browse / Upload
                            </Button>
                          </>
                        )}
                      </Box>

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

        <SoundPickerDialog
          open={soundPickerOpen}
          onClose={() => {
            setSoundPickerOpen(false);
            setSoundPickerSourceIndex(null);
          }}
          onSelect={handleSoundSelected}
          {...(soundPickerSourceIndex !== null &&
            soundSources.find((s) => s.index === soundPickerSourceIndex)?.resource?.id && {
              currentResourceId: soundSources.find((s) => s.index === soundPickerSourceIndex)!
                .resource!.id,
            })}
        />

        <SoundPickerDialog
          open={newSoundPickerOpen}
          onClose={() => setNewSoundPickerOpen(false)}
          onSelect={handleNewSoundSelected}
        />

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
