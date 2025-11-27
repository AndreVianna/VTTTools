import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
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
import { useUpdateEncounterWallMutation } from '@/services/encounterApi';
import { type PlacedWall, type Pole, WallVisibility } from '@/types/domain';
import { WALL_PRESETS, type WallPreset } from './wallsPanelTypes';

export interface WallsPanelProps {
  encounterId?: string;
  encounterWalls?: PlacedWall[];
  selectedWallIndex?: number | null;
  isEditingVertices?: boolean;
  originalWallPoles?: Pole[] | null;
  onPresetSelect?: (preset: WallPreset) => void;
  onPlaceWall?: (properties: {
    visibility: WallVisibility;
    isClosed: boolean;
    defaultHeight: number;
    color?: string;
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

    const [visibility, setVisibility] = useState<WallVisibility>(WallVisibility.Normal);
    const [isClosed, setIsClosed] = useState(false);
    const [defaultHeight, setDefaultHeight] = useState<number>(10.0);
    const [defaultColor, setDefaultColor] = useState<string>('#808080');
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [wallToDelete, setWallToDelete] = useState<number | null>(null);
    const [expandedWalls, setExpandedWalls] = useState<Set<number>>(new Set());
    const [editedNames, setEditedNames] = useState<Map<number, string>>(new Map());
    const [editedColors, setEditedColors] = useState<Map<number, string>>(new Map());

    const [editConflictOpen, setEditConflictOpen] = useState(false);
    const [pendingAction, setPendingAction] = useState<'delete' | 'place' | null>(null);

    const [updateEncounterWall] = useUpdateEncounterWallMutation();

    const hasWallChanges = (currentWall: PlacedWall | undefined, originalPoles: Pole[] | null): boolean => {
      if (!currentWall || !originalPoles) {
        return true;
      }

      const currentPoles = currentWall.poles;

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
      setVisibility(preset.visibility);
      setIsClosed(preset.isClosed);
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
        visibility,
        isClosed,
        defaultHeight,
        color: defaultColor,
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
          visibility,
          isClosed,
          defaultHeight,
          color: defaultColor,
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
          setEditedColors((prevColors) => {
            const newMap = new Map(prevColors);
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
        color?: string;
        poles?: Pole[];
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
              const isSelected = visibility === preset.visibility;
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

          <FormControlLabel
            control={<Checkbox size='small' checked={isClosed} onChange={(e) => setIsClosed(e.target.checked)} />}
            label={<Typography sx={compactStyles.toggleLabel}>Closed (Room/Enclosure)</Typography>}
            sx={{ margin: 0, height: 32 }}
          />
        </Box>

        <Divider sx={{ my: 0.5 }} />

        <Typography variant='overline' sx={compactStyles.sectionHeader}>
          Default Values
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <input
            type='color'
            value={defaultColor}
            onChange={(e) => setDefaultColor(e.target.value)}
            style={{
              width: '32px',
              height: '32px',
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: '4px',
              cursor: 'pointer',
              padding: 0,
            }}
          />

          <TextField
            label='Height'
            type='number'
            value={defaultHeight}
            onChange={(e) => setDefaultHeight(parseFloat(e.target.value))}
            size='small'
            InputProps={{ inputProps: { min: 0.5, max: 20.0, step: 0.5 } }}
            sx={{ ...compactStyles.textField, width: 80 }}
          />
        </Box>

        <Button variant='contained' onClick={handlePlaceWall} sx={compactStyles.button}>
          Place Wall
        </Button>

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
                          secondary={`${encounterWall.poles.length} poles`}
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
                        <input
                          type='color'
                          value={editedColors.get(encounterWall.index) ?? encounterWall.color ?? '#808080'}
                          onChange={(e) => {
                            setEditedColors((prev) => {
                              const newMap = new Map(prev);
                              newMap.set(encounterWall.index, e.target.value);
                              return newMap;
                            });
                            handleWallPropertyUpdate(encounterWall.index, {
                              color: e.target.value,
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

                        <TextField
                          label='Height'
                          type='number'
                          value={encounterWall.poles.length > 0 ? (encounterWall.poles[0]?.h ?? 10) : 10}
                          onChange={(e) => {
                            const newHeight = parseFloat(e.target.value);
                            const updatedPoles = encounterWall.poles.map((pole) => ({
                              ...pole,
                              h: newHeight,
                            }));
                            handleWallPropertyUpdate(encounterWall.index, {
                              poles: updatedPoles,
                            });
                          }}
                          onKeyDown={(e) => {
                            e.stopPropagation();
                          }}
                          onClick={(e) => e.stopPropagation()}
                          size='small'
                          InputProps={{
                            inputProps: { min: 0.5, max: 20.0, step: 0.5 },
                          }}
                          sx={{ ...compactStyles.textField, width: 80 }}
                        />
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
