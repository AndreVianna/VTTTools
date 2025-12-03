import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  Polyline as PolylineIcon,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Collapse,
  Divider,
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
import { useUpdateEncounterWallMutation } from '@/services/encounterApi';
import { type PlacedWall, type Pole, SegmentState, SegmentType } from '@/types/domain';
import { SegmentRow } from './SegmentRow';
import { WALL_PRESETS, type WallPreset } from './wallsPanelTypes';

export interface WallsPanelProps {
  encounterId?: string;
  encounterWalls?: PlacedWall[];
  selectedWallIndex?: number | null;
  isEditingVertices?: boolean;
  originalWallPoles?: Pole[] | null;
  onPresetSelect?: (preset: WallPreset) => void;
  onPlaceWall?: (properties: {
    segmentType: SegmentType;
    defaultHeight: number;
  }) => void;
  onWallSelect?: (wallIndex: number) => void;
  onWallDelete?: (wallIndex: number) => void;
  onEditVertices?: (wallIndex: number) => void;
  onCancelEditing?: () => void;
}

export const WallsPanel: React.FC<WallsPanelProps> = React.memo(
  ({
    encounterId,
    encounterWalls = [],
    selectedWallIndex,
    isEditingVertices = false,
    originalWallPoles = null,
    onPresetSelect,
    onPlaceWall,
    onWallSelect,
    onWallDelete,
    onEditVertices,
    onCancelEditing,
  }) => {
    const theme = useTheme();

    const [segmentType, setSegmentType] = useState<SegmentType>(SegmentType.Wall);
    const [defaultHeight, setDefaultHeight] = useState<number>(10.0);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [wallToDelete, setWallToDelete] = useState<number | null>(null);
    const [expandedWalls, setExpandedWalls] = useState<Set<number>>(new Set());
    const [editedNames, setEditedNames] = useState<Map<number, string>>(new Map());

    const [editConflictOpen, setEditConflictOpen] = useState(false);
    const [pendingAction, setPendingAction] = useState<'delete' | 'place' | null>(null);

    const [updateEncounterWall] = useUpdateEncounterWallMutation();

    const hasWallChanges = (currentWall: PlacedWall | undefined, originalPoles: Pole[] | null): boolean => {
      if (!currentWall || !originalPoles) {
        return true;
      }

      const currentPoles: Pole[] = [];
      for (const segment of currentWall.segments) {
        if (currentPoles.length === 0 || currentPoles[currentPoles.length - 1]?.x !== segment.startPole.x || currentPoles[currentPoles.length - 1]?.y !== segment.startPole.y) {
          currentPoles.push(segment.startPole);
        }
        currentPoles.push(segment.endPole);
      }

      if (currentPoles.length !== originalPoles.length) {
        return true;
      }

      return currentPoles.some((pole, index) => {
        const original = originalPoles[index];
        return !original || pole.x !== original.x || pole.y !== original.y || pole.h !== original.h;
      });
    };

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

    const handlePresetClick = (preset: WallPreset) => {
      setSegmentType(preset.segmentType);
      onPresetSelect?.(preset);
    };

    const handlePlaceWall = () => {
      if (isEditingVertices) {
        const currentWall = encounterWalls.find((w) => w.index === selectedWallIndex);
        const hasChanges = hasWallChanges(currentWall, originalWallPoles);

        if (!hasChanges) {
          onCancelEditing?.();
        } else {
          setPendingAction('place');
          setEditConflictOpen(true);
          return;
        }
      }

      onPlaceWall?.({
        segmentType,
        defaultHeight,
      });
    };

    const handleDeleteWall = (wallIndex: number) => {
      if (isEditingVertices) {
        if (wallIndex === selectedWallIndex) {
          onCancelEditing?.();
          setWallToDelete(wallIndex);
          setDeleteConfirmOpen(true);
          return;
        }

        const currentWall = encounterWalls.find((w) => w.index === selectedWallIndex);
        const hasChanges = hasWallChanges(currentWall, originalWallPoles);

        if (!hasChanges) {
          onCancelEditing?.();
        } else {
          setWallToDelete(wallIndex);
          setPendingAction('delete');
          setEditConflictOpen(true);
          return;
        }
      }

      setWallToDelete(wallIndex);
      setDeleteConfirmOpen(true);
    };

    const handleEditConflictConfirm = () => {
      onCancelEditing?.();
      setEditConflictOpen(false);

      if (pendingAction === 'delete' && wallToDelete !== null) {
        setDeleteConfirmOpen(true);
      } else if (pendingAction === 'place') {
        onPlaceWall?.({
          segmentType,
          defaultHeight,
        });
      }

      setPendingAction(null);
    };

    const handleEditConflictCancel = () => {
      setEditConflictOpen(false);
      setPendingAction(null);
      setWallToDelete(null);
    };

    const toggleWallExpanded = (wallIndex: number) => {
      setExpandedWalls((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(wallIndex)) {
          newSet.delete(wallIndex);
          setEditedNames((prevNames) => {
            const newMap = new Map(prevNames);
            newMap.delete(wallIndex);
            return newMap;
          });
        } else {
          newSet.add(wallIndex);
        }
        return newSet;
      });
    };

    const handleWallPropertyUpdate = async (
      wallIndex: number,
      updates: {
        name?: string;
        segments?: typeof encounterWalls[0]['segments'];
      },
    ) => {
      if (!encounterId) return;

      try {
        await updateEncounterWall({
          encounterId,
          wallIndex,
          ...updates,
        }).unwrap();
      } catch (error) {
        console.error('[WallsPanel] Failed to update wall:', error);
      }
    };

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Typography variant='overline' sx={compactStyles.sectionHeader}>
          Wall Type Presets
        </Typography>

        <Box
          sx={{
            display: 'flex',
            gap: 1,
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box sx={{ display: 'flex', gap: 1 }}>
            {WALL_PRESETS.map((preset) => {
              const Icon = preset.icon;
              const isSelected = segmentType === preset.segmentType;
              return (
                <Tooltip key={preset.name} title={preset.name} arrow placement='top'>
                  <IconButton
                    onClick={() => handlePresetClick(preset)}
                    size='small'
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
        </Box>

        <Divider sx={{ my: 0.5 }} />

        <Typography variant='overline' sx={compactStyles.sectionHeader}>
          New Wall
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TextField
            label='Height'
            type='number'
            value={defaultHeight}
            onChange={(e) => setDefaultHeight(parseFloat(e.target.value))}
            size='small'
            InputProps={{ inputProps: { min: 0.5, max: 20.0, step: 0.5 } }}
            sx={{ ...compactStyles.textField, flex: 1 }}
          />
          <Tooltip title='Place a Wall' arrow>
            <IconButton
              onClick={handlePlaceWall}
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
              <PolylineIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        </Box>

        <Divider sx={{ my: 0.5 }} />

        <Typography variant='overline' sx={compactStyles.sectionHeader}>
          Placed Walls ({encounterWalls.length})
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
          {encounterWalls.length === 0 ? (
            <ListItem>
              <ListItemText
                primary={
                  <Typography
                    sx={{
                      fontSize: '10px',
                      color: theme.palette.text.disabled,
                    }}
                  >
                    No walls placed
                  </Typography>
                }
              />
            </ListItem>
          ) : (
            encounterWalls.map((encounterWall) => {
              const isExpanded = expandedWalls.has(encounterWall.index);

              return (
                <React.Fragment key={encounterWall.index}>
                  <ListItem
                    disablePadding
                    secondaryAction={
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <IconButton
                          edge='end'
                          size='small'
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditVertices?.(encounterWall.index);
                          }}
                          sx={{ width: 20, height: 24 }}
                        >
                          <EditIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                        <IconButton
                          edge='end'
                          size='small'
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteWall(encounterWall.index);
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
                      selected={selectedWallIndex === encounterWall.index}
                      onClick={() => onWallSelect?.(encounterWall.index)}
                      sx={{ py: 0.5, pr: 10, pl: 0.5 }}
                    >
                      <IconButton
                        size='small'
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWallExpanded(encounterWall.index);
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
                          value={editedNames.get(encounterWall.index) ?? encounterWall.name}
                          onChange={(e) => {
                            setEditedNames((prev) => {
                              const newMap = new Map(prev);
                              newMap.set(encounterWall.index, e.target.value);
                              return newMap;
                            });
                          }}
                          onBlur={(e) => {
                            handleWallPropertyUpdate(encounterWall.index, {
                              name: e.target.value,
                            });
                          }}
                          onKeyDown={(e) => {
                            e.stopPropagation();
                          }}
                          onClick={(e) => e.stopPropagation()}
                          size='small'
                          fullWidth
                          sx={{
                            ...compactStyles.textField,
                            mr: 2,
                          }}
                        />
                      ) : (
                        <ListItemText
                          primary={encounterWall.name}
                          primaryTypographyProps={{ fontSize: '10px' }}
                          secondary={`${encounterWall.segments.length} segments`}
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
                      <Typography
                        sx={{
                          fontSize: '9px',
                          fontWeight: 600,
                          color: theme.palette.text.secondary,
                          textTransform: 'uppercase',
                        }}
                      >
                        Segments
                      </Typography>
                      <Box
                        sx={{
                          border: `1px solid ${theme.palette.divider}`,
                          borderRadius: 0.5,
                          backgroundColor: theme.palette.background.paper,
                        }}
                      >
                        {encounterWall.segments.map((segment) => (
                          <SegmentRow
                            key={segment.index}
                            segment={segment}
                            onTypeChange={(segmentIndex, newType, newState) => {
                              const updatedSegments = encounterWall.segments.map((s) =>
                                s.index === segmentIndex ? { ...s, type: newType, state: newState } : s,
                              );
                              handleWallPropertyUpdate(encounterWall.index, {
                                segments: updatedSegments,
                              });
                            }}
                            onStateChange={(segmentIndex, newState) => {
                              const updatedSegments = encounterWall.segments.map((s) =>
                                s.index === segmentIndex ? { ...s, state: newState as SegmentState } : s,
                              );
                              handleWallPropertyUpdate(encounterWall.index, {
                                segments: updatedSegments,
                              });
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  </Collapse>
                </React.Fragment>
              );
            })
          )}
        </List>

        <ConfirmDialog
          open={editConflictOpen}
          title='Unsaved Edits'
          message='You have unsaved edits. Canceling will discard all changes. Continue?'
          confirmText='Discard Changes'
          cancelText='Keep Editing'
          severity='warning'
          onConfirm={handleEditConflictConfirm}
          onClose={handleEditConflictCancel}
        />

        <ConfirmDialog
          open={deleteConfirmOpen}
          title='Delete Wall'
          message='Are you sure you want to delete this wall? This action cannot be undone.'
          onConfirm={() => {
            if (wallToDelete !== null) {
              onWallDelete?.(wallToDelete);
            }
            setDeleteConfirmOpen(false);
            setWallToDelete(null);
          }}
          onClose={() => {
            setDeleteConfirmOpen(false);
            setWallToDelete(null);
          }}
        />
      </Box>
    );
  },
);

WallsPanel.displayName = 'WallsPanel';
