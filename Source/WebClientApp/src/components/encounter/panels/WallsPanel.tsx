import React, { useState } from 'react';
import {
    Box,
    Button,
    Checkbox,
    Collapse,
    FormControl,
    FormControlLabel,
    InputLabel,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    MenuItem,
    Select,
    SelectChangeEvent,
    TextField,
    Typography,
    IconButton,
    Divider,
    Tooltip,
    useTheme
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon
} from '@mui/icons-material';
import { WallVisibility, type PlacedWall, type Pole } from '@/types/domain';
import { WALL_PRESETS, MATERIAL_OPTIONS, type WallPreset } from './wallsPanelTypes';
import { ConfirmDialog } from '@/components/common';
import { useUpdateEncounterWallMutation } from '@/services/encounterApi';

export interface WallsPanelProps {
    encounterId?: string;
    encounterWalls?: PlacedWall[];
    selectedWallIndex?: number | null;
    onPresetSelect?: (preset: WallPreset) => void;
    onPlaceWall?: (properties: {
        visibility: WallVisibility;
        isClosed: boolean;
        material?: string;
        defaultHeight: number;
        color?: string;
    }) => void;
    onWallSelect?: (wallIndex: number) => void;
    onWallDelete?: (wallIndex: number) => void;
    onEditVertices?: (wallIndex: number) => void;
}

export const WallsPanel: React.FC<WallsPanelProps> = React.memo(({
    encounterId,
    encounterWalls = [],
    selectedWallIndex,
    onPresetSelect,
    onPlaceWall,
    onWallSelect,
    onWallDelete,
    onEditVertices
}) => {
    const theme = useTheme();

    const [visibility, setVisibility] = useState<WallVisibility>(WallVisibility.Normal);
    const [isClosed, setIsClosed] = useState(false);
    const [material, setMaterial] = useState<string>('Stone');
    const [customMaterial, setCustomMaterial] = useState<string>('');
    const [defaultHeight, setDefaultHeight] = useState<number>(10.0);
    const [defaultColor, setDefaultColor] = useState<string>('#808080');
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [wallToDelete, setWallToDelete] = useState<number | null>(null);
    const [expandedWalls, setExpandedWalls] = useState<Set<number>>(new Set());
    const [editedNames, setEditedNames] = useState<Map<number, string>>(new Map());
    const [editedColors, setEditedColors] = useState<Map<number, string>>(new Map());
    const [editedMaterials, setEditedMaterials] = useState<Map<number, string>>(new Map());
    const [editedCustomMaterials, setEditedCustomMaterials] = useState<Map<number, string>>(new Map());

    const [updateEncounterWall] = useUpdateEncounterWallMutation();

    const compactStyles = {
        sectionHeader: {
            fontSize: '10px',
            fontWeight: 700,
            textTransform: 'uppercase' as const,
            letterSpacing: '0.5px',
            color: theme.palette.text.secondary,
            mb: 0.5
        },
        textField: {
            '& .MuiInputBase-root': {
                height: '28px',
                fontSize: '11px',
                backgroundColor: theme.palette.background.default
            },
            '& .MuiInputBase-input': {
                padding: '4px 8px',
                fontSize: '11px'
            },
            '& .MuiInputLabel-root': {
                fontSize: '9px',
                transform: 'translate(8px, 6px) scale(1)',
                '&.MuiInputLabel-shrink': {
                    transform: 'translate(8px, -8px) scale(0.85)'
                }
            }
        },
        select: {
            height: '28px',
            fontSize: '11px',
            '& .MuiSelect-select': {
                padding: '4px 8px',
                fontSize: '11px'
            }
        },
        inputLabel: {
            fontSize: '9px',
            transform: 'translate(8px, 6px) scale(1)',
            '&.MuiInputLabel-shrink': {
                transform: 'translate(8px, -8px) scale(0.85)'
            }
        },
        toggleLabel: {
            fontSize: '10px'
        },
        button: {
            height: '28px',
            fontSize: '10px',
            borderRadius: 0,
            textTransform: 'none' as const
        }
    };

    const handlePresetClick = (preset: WallPreset) => {
        setVisibility(preset.visibility);
        setIsClosed(preset.isClosed);
        if (preset.material) {
            setMaterial(preset.material);
        }
        onPresetSelect?.(preset);
    };

    const handlePlaceWall = () => {
        onPlaceWall?.({
            visibility,
            isClosed,
            material: material === 'Custom' ? customMaterial : material,
            defaultHeight,
            color: defaultColor
        });
    };

    const handleMaterialChange = (e: SelectChangeEvent<string>) => {
        setMaterial(e.target.value);
    };

    const toggleWallExpanded = (wallIndex: number) => {
        setExpandedWalls(prev => {
            const newSet = new Set(prev);
            if (newSet.has(wallIndex)) {
                newSet.delete(wallIndex);
                setEditedNames(prevNames => {
                    const newMap = new Map(prevNames);
                    newMap.delete(wallIndex);
                    return newMap;
                });
                setEditedColors(prevColors => {
                    const newMap = new Map(prevColors);
                    newMap.delete(wallIndex);
                    return newMap;
                });
                setEditedMaterials(prevMaterials => {
                    const newMap = new Map(prevMaterials);
                    newMap.delete(wallIndex);
                    return newMap;
                });
                setEditedCustomMaterials(prevCustom => {
                    const newMap = new Map(prevCustom);
                    newMap.delete(wallIndex);
                    return newMap;
                });
            } else {
                newSet.add(wallIndex);
            }
            return newSet;
        });
    };

    const handleWallPropertyUpdate = async (wallIndex: number, updates: {
        name?: string;
        material?: string;
        color?: string;
        poles?: Pole[];
    }) => {
        if (!encounterId) return;

        try {
            await updateEncounterWall({
                encounterId,
                wallIndex,
                ...updates
            }).unwrap();
        } catch (error) {
            console.error('[WallsPanel] Failed to update wall:', error);
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Typography variant="overline" sx={compactStyles.sectionHeader}>
                Wall Type Presets
            </Typography>

            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    {WALL_PRESETS.map((preset) => {
                        const Icon = preset.icon;
                        const isSelected = visibility === preset.visibility;
                        return (
                            <Tooltip key={preset.name} title={preset.name} arrow placement="top">
                                <IconButton
                                    onClick={() => handlePresetClick(preset)}
                                    size="small"
                                    sx={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: 0,
                                        border: `2px solid ${isSelected ? theme.palette.primary.main : theme.palette.divider}`,
                                        backgroundColor: isSelected ? theme.palette.action.selected : 'transparent',
                                        '&:hover': {
                                            backgroundColor: theme.palette.action.hover,
                                            borderColor: theme.palette.primary.main
                                        }
                                    }}
                                >
                                    <Icon sx={{ fontSize: 18 }} />
                                </IconButton>
                            </Tooltip>
                        );
                    })}
                </Box>

                <FormControlLabel
                    control={
                        <Checkbox
                            size="small"
                            checked={isClosed}
                            onChange={(e) => setIsClosed(e.target.checked)}
                        />
                    }
                    label={<Typography sx={compactStyles.toggleLabel}>Closed (Room/Enclosure)</Typography>}
                    sx={{ margin: 0, height: 32 }}
                />
            </Box>

            <Divider sx={{ my: 0.5 }} />

            <Typography variant="overline" sx={compactStyles.sectionHeader}>
                Default Values
            </Typography>

            {/* Material + Color + Pole Height */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FormControl size="small" sx={{ flex: 2 }}>
                    <InputLabel id="label-material" sx={compactStyles.inputLabel}>Material</InputLabel>
                    <Select
                        labelId="label-material"
                        value={material}
                        label="Material"
                        onChange={handleMaterialChange}
                        sx={compactStyles.select}
                    >
                        {MATERIAL_OPTIONS.map((mat) => (
                            <MenuItem key={mat} value={mat} sx={{ fontSize: '11px', minHeight: '32px' }}>
                                {mat}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <input
                    type="color"
                    value={defaultColor}
                    onChange={(e) => setDefaultColor(e.target.value)}
                    style={{
                        width: '32px',
                        height: '32px',
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: '4px',
                        cursor: 'pointer',
                        padding: 0
                    }}
                />

                <TextField
                    label="Height"
                    type="number"
                    value={defaultHeight}
                    onChange={(e) => setDefaultHeight(parseFloat(e.target.value))}
                    size="small"
                    InputProps={{ inputProps: { min: 0.5, max: 20.0, step: 0.5 } }}
                    sx={{ ...compactStyles.textField, width: 50 }}
                />
            </Box>

            {material === 'Custom' && (
                <TextField
                    label="Custom Material"
                    value={customMaterial}
                    onChange={(e) => setCustomMaterial(e.target.value)}
                    size="small"
                    fullWidth
                    inputProps={{ maxLength: 64 }}
                    sx={compactStyles.textField}
                />
            )}

            <Button
                variant="contained"
                onClick={handlePlaceWall}
                sx={compactStyles.button}
            >
                Place Wall
            </Button>

            <Divider sx={{ my: 0.5 }} />

            <Typography variant="overline" sx={compactStyles.sectionHeader}>
                Placed Walls ({encounterWalls.length})
            </Typography>

            <List
                sx={{
                    maxHeight: 200,
                    overflowY: 'auto',
                    py: 0,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 1
                }}
            >
                {encounterWalls.length === 0 ? (
                    <ListItem>
                        <ListItemText
                            primary={
                                <Typography sx={{ fontSize: '10px', color: theme.palette.text.disabled }}>
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
                                                edge="end"
                                                size="small"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onEditVertices?.(encounterWall.index);
                                                }}
                                                sx={{ width: 20, height: 24 }}
                                            >
                                                <EditIcon sx={{ fontSize: 14 }} />
                                            </IconButton>
                                            <IconButton
                                                edge="end"
                                                size="small"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setWallToDelete(encounterWall.index);
                                                    setDeleteConfirmOpen(true);
                                                }}
                                                sx={{ width: 20, height: 24, color: theme.palette.error.main }}
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
                                            size="small"
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
                                                    setEditedNames(prev => {
                                                        const newMap = new Map(prev);
                                                        newMap.set(encounterWall.index, e.target.value);
                                                        return newMap;
                                                    });
                                                }}
                                                onBlur={(e) => {
                                                    handleWallPropertyUpdate(encounterWall.index, {
                                                        name: e.target.value
                                                    });
                                                }}
                                                onKeyDown={(e) => {
                                                    e.stopPropagation();
                                                }}
                                                onClick={(e) => e.stopPropagation()}
                                                size="small"
                                                fullWidth
                                                sx={{
                                                    ...compactStyles.textField,
                                                    mr: 2
                                                }}
                                            />
                                        ) : (
                                            <ListItemText
                                                primary={encounterWall.name}
                                                primaryTypographyProps={{ fontSize: '10px' }}
                                                secondary={`${encounterWall.material || 'Unknown'} - ${encounterWall.poles.length} poles`}
                                                secondaryTypographyProps={{ fontSize: '8px' }}
                                            />
                                        )}
                                    </ListItemButton>
                                </ListItem>

                                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                                    <Box sx={{
                                        px: 1,
                                        py: 1,
                                        backgroundColor: theme.palette.background.default,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 1
                                    }}>
                                        {/* Material + Color + Pole Height */}
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <FormControl size="small" sx={{ flex: 2 }} onClick={(e) => e.stopPropagation()}>
                                                <InputLabel id={`label-material-${encounterWall.index}`} sx={compactStyles.inputLabel}>
                                                    Material
                                                </InputLabel>
                                                <Select
                                                    labelId={`label-material-${encounterWall.index}`}
                                                    value={(() => {
                                                        const edited = editedMaterials.get(encounterWall.index);
                                                        if (edited !== undefined) return edited;
                                                        const current = encounterWall.material ?? 'Stone';
                                                        return MATERIAL_OPTIONS.includes(current) ? current : 'Custom';
                                                    })()}
                                                    label="Material"
                                                    onChange={(e) => {
                                                        const newValue = e.target.value;
                                                        setEditedMaterials(prev => {
                                                            const newMap = new Map(prev);
                                                            newMap.set(encounterWall.index, newValue);
                                                            return newMap;
                                                        });
                                                        if (newValue !== 'Custom') {
                                                            handleWallPropertyUpdate(encounterWall.index, {
                                                                material: newValue
                                                            });
                                                        }
                                                    }}
                                                    onKeyDown={(e) => {
                                                        e.stopPropagation();
                                                    }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                    }}
                                                    sx={compactStyles.select}
                                                >
                                                    {MATERIAL_OPTIONS.map((mat) => (
                                                        <MenuItem key={mat} value={mat} sx={{ fontSize: '11px', minHeight: '32px' }}>
                                                            {mat}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>

                                            <input
                                                type="color"
                                                value={editedColors.get(encounterWall.index) ?? encounterWall.color ?? '#808080'}
                                                onChange={(e) => {
                                                    setEditedColors(prev => {
                                                        const newMap = new Map(prev);
                                                        newMap.set(encounterWall.index, e.target.value);
                                                        return newMap;
                                                    });
                                                    handleWallPropertyUpdate(encounterWall.index, {
                                                        color: e.target.value
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
                                                    padding: 0
                                                }}
                                            />

                                            <TextField
                                                label="Height"
                                                type="number"
                                                value={encounterWall.poles.length > 0 ? (encounterWall.poles[0]?.h ?? 10) : 10}
                                                onChange={(e) => {
                                                    const newHeight = parseFloat(e.target.value);
                                                    const updatedPoles = encounterWall.poles.map(pole => ({
                                                        ...pole,
                                                        h: newHeight
                                                    }));
                                                    handleWallPropertyUpdate(encounterWall.index, {
                                                        poles: updatedPoles
                                                    } as any);
                                                }}
                                                onKeyDown={(e) => {
                                                    e.stopPropagation();
                                                }}
                                                onClick={(e) => e.stopPropagation()}
                                                size="small"
                                                InputProps={{ inputProps: { min: 0.5, max: 20.0, step: 0.5 } }}
                                                sx={{ ...compactStyles.textField, width: 50 }}
                                            />
                                        </Box>

                                        {(() => {
                                            const materialType = editedMaterials.get(encounterWall.index);
                                            const currentMaterial = encounterWall.material ?? 'Stone';
                                            const isCustomMode = materialType === 'Custom' ||
                                                (materialType === undefined && !MATERIAL_OPTIONS.includes(currentMaterial));
                                            return isCustomMode;
                                        })() && (
                                            <TextField
                                                label="Custom Material"
                                                value={(() => {
                                                    const customValue = editedCustomMaterials.get(encounterWall.index);
                                                    if (customValue !== undefined) return customValue;
                                                    const current = encounterWall.material ?? '';
                                                    return MATERIAL_OPTIONS.includes(current) ? '' : current;
                                                })()}
                                                onChange={(e) => {
                                                    const newValue = e.target.value;
                                                    setEditedCustomMaterials(prev => {
                                                        const newMap = new Map(prev);
                                                        newMap.set(encounterWall.index, newValue);
                                                        return newMap;
                                                    });
                                                }}
                                                onBlur={(e) => {
                                                    if (e.target.value.trim()) {
                                                        handleWallPropertyUpdate(encounterWall.index, {
                                                            material: e.target.value
                                                        });
                                                    }
                                                }}
                                                onKeyDown={(e) => {
                                                    e.stopPropagation();
                                                }}
                                                onClick={(e) => e.stopPropagation()}
                                                size="small"
                                                fullWidth
                                                inputProps={{ maxLength: 64 }}
                                                sx={compactStyles.textField}
                                            />
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
                title="Delete Wall"
                message="Are you sure you want to delete this wall? This action cannot be undone."
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
});

WallsPanel.displayName = 'WallsPanel';
