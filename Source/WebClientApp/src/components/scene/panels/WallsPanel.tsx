import React, { useState } from 'react';
import {
    Box,
    Button,
    Checkbox,
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
    Delete as DeleteIcon
} from '@mui/icons-material';
import { WallVisibility, type SceneWall } from '@/types/domain';
import { WALL_PRESETS, MATERIAL_OPTIONS, type WallPreset } from './wallsPanelTypes';
import { ConfirmDialog } from '@/components/common';

export interface WallsPanelProps {
    sceneWalls?: SceneWall[];
    selectedWallIndex?: number | null;
    onPresetSelect?: (preset: WallPreset) => void;
    onPlaceWall?: (properties: {
        visibility: WallVisibility;
        isClosed: boolean;
        material?: string;
        defaultHeight: number;
    }) => void;
    onWallSelect?: (wallIndex: number) => void;
    onWallDelete?: (wallIndex: number) => void;
    onEditVertices?: (wallIndex: number) => void;
}

export const WallsPanel: React.FC<WallsPanelProps> = React.memo(({
    sceneWalls = [],
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
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [wallToDelete, setWallToDelete] = useState<number | null>(null);

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
        console.log('[WallsPanel] Place Wall clicked', { visibility, isClosed, material, defaultHeight });
        onPlaceWall?.({
            visibility,
            isClosed,
            material: material === 'Custom' ? customMaterial : material,
            defaultHeight
        });
    };

    const handleMaterialChange = (e: SelectChangeEvent<string>) => {
        setMaterial(e.target.value);
    };

    const selectedSceneWall = selectedWallIndex !== null && selectedWallIndex !== undefined
        ? sceneWalls.find(sw => sw.index === selectedWallIndex)
        : null;

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Typography variant="overline" sx={compactStyles.sectionHeader}>
                Wall Type Presets
            </Typography>

            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-start' }}>
                {WALL_PRESETS.map((preset) => {
                    const Icon = preset.icon;
                    return (
                        <Tooltip key={preset.name} title={preset.name} arrow placement="top">
                            <IconButton
                                onClick={() => handlePresetClick(preset)}
                                size="small"
                                sx={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: 0,
                                    border: `1px solid ${theme.palette.divider}`,
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

            <Divider sx={{ my: 0.5 }} />

            <Typography variant="overline" sx={compactStyles.sectionHeader}>
                Wall Properties
            </Typography>

            <FormControlLabel
                control={
                    <Checkbox
                        size="small"
                        checked={isClosed}
                        onChange={(e) => setIsClosed(e.target.checked)}
                    />
                }
                label={<Typography sx={compactStyles.toggleLabel}>Closed (Room/Enclosure)</Typography>}
                sx={{ margin: 0, height: 24 }}
            />

            <FormControl fullWidth size="small">
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

            <TextField
                label="Default Height (feet)"
                type="number"
                value={defaultHeight}
                onChange={(e) => setDefaultHeight(parseFloat(e.target.value))}
                size="small"
                fullWidth
                InputProps={{ inputProps: { min: 0.5, max: 20.0, step: 0.5 } }}
                sx={compactStyles.textField}
            />

            <Button
                variant="contained"
                onClick={handlePlaceWall}
                sx={compactStyles.button}
            >
                Place Wall
            </Button>

            <Divider sx={{ my: 0.5 }} />

            <Typography variant="overline" sx={compactStyles.sectionHeader}>
                Placed Walls ({sceneWalls.length})
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
                {sceneWalls.length === 0 ? (
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
                    sceneWalls.map((sceneWall) => {
                        return (
                            <ListItem
                                key={sceneWall.index}
                                disablePadding
                                secondaryAction={
                                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                                        <IconButton
                                            edge="end"
                                            size="small"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onWallSelect?.(sceneWall.index);
                                            }}
                                            sx={{ width: 24, height: 24 }}
                                        >
                                            <EditIcon sx={{ fontSize: 14 }} />
                                        </IconButton>
                                        <IconButton
                                            edge="end"
                                            size="small"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setWallToDelete(sceneWall.index);
                                                setDeleteConfirmOpen(true);
                                            }}
                                            sx={{ width: 24, height: 24, color: theme.palette.error.main }}
                                        >
                                            <DeleteIcon sx={{ fontSize: 14 }} />
                                        </IconButton>
                                    </Box>
                                }
                            >
                                <ListItemButton
                                    selected={selectedWallIndex === sceneWall.index}
                                    onClick={() => onWallSelect?.(sceneWall.index)}
                                    sx={{ py: 0.5, pr: 10 }}
                                >
                                    <ListItemText
                                        primary={sceneWall.name}
                                        primaryTypographyProps={{ fontSize: '10px' }}
                                        secondary={`${sceneWall.material || 'Unknown'} - ${sceneWall.poles.length} poles`}
                                        secondaryTypographyProps={{ fontSize: '8px' }}
                                    />
                                </ListItemButton>
                            </ListItem>
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
                onCancel={() => {
                    setDeleteConfirmOpen(false);
                    setWallToDelete(null);
                }}
            />
        </Box>
    );
});
