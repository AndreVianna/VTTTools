import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
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
    SelectChangeEvent,
    TextField,
    Typography,
    useTheme
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon
} from '@mui/icons-material';
import type { SceneRegion } from '@/types/domain';
import { REGION_PRESETS, TERRAIN_VALUES, ILLUMINATION_VALUES, type RegionPreset } from './regionsPanelTypes';
import { ConfirmDialog } from '@/components/common';

export interface RegionsPanelProps {
    sceneRegions?: SceneRegion[];
    selectedRegionIndex?: number | null;
    onPresetSelect?: (preset: RegionPreset) => void;
    onPlaceRegion?: (properties: {
        name: string;
        type: string;
        value?: number;
        label?: string;
        color?: string;
    }) => void;
    onRegionSelect?: (regionIndex: number) => void;
    onRegionDelete?: (regionIndex: number) => void;
    onEditVertices?: (regionIndex: number) => void;
}

export const RegionsPanel: React.FC<RegionsPanelProps> = React.memo(({
    sceneRegions = [],
    selectedRegionIndex,
    onPresetSelect,
    onPlaceRegion,
    onRegionSelect,
    onRegionDelete,
    onEditVertices
}) => {
    const theme = useTheme();

    const [name, setName] = useState('Region 1');
    const [regionType, setRegionType] = useState<string>('Elevation');
    const [value, setValue] = useState<number>(0);
    const [label, setLabel] = useState<string>('Normal');
    const [color, setColor] = useState<string>('#ed6c02');
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [regionToDelete, setRegionToDelete] = useState<number | null>(null);
    const [filterType, setFilterType] = useState<string | null>(null);

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
        button: {
            height: '28px',
            fontSize: '10px',
            borderRadius: 0,
            textTransform: 'none' as const
        }
    };

    useEffect(() => {
        if (sceneRegions && sceneRegions.length > 0) {
            const maxIndex = Math.max(...sceneRegions.map(r => {
                const match = r.name.match(/Region (\d+)$/);
                return match ? parseInt(match[1]) : 0;
            }));
            setName(`Region ${maxIndex + 1}`);
        }
    }, [sceneRegions]);

    const handlePresetClick = (preset: RegionPreset) => {
        if (filterType === preset.type) {
            setFilterType(null);
        } else {
            setFilterType(preset.type);
        }

        setRegionType(preset.type);
        setColor(preset.color);
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
            color
        };

        if (regionType === 'Elevation') {
            properties.value = value;
        } else {
            properties.label = label;
        }

        onPlaceRegion?.(properties);
    };

    const handleTypeChange = (e: SelectChangeEvent<string>) => {
        const newType = e.target.value;
        setRegionType(newType);

        const preset = REGION_PRESETS.find(p => p.type === newType);
        if (preset) {
            setColor(preset.color);
            if (preset.defaultValue !== undefined) {
                setValue(preset.defaultValue);
            }
            if (preset.defaultLabel) {
                setLabel(preset.defaultLabel);
            }
        }
    };

    const handleDeleteClick = (regionIndex: number) => {
        setRegionToDelete(regionIndex);
        setDeleteConfirmOpen(true);
    };

    const filteredRegions = filterType
        ? sceneRegions.filter(r => r.type === filterType)
        : sceneRegions;

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Typography variant="overline" sx={compactStyles.sectionHeader}>
                Filter by Type
            </Typography>

            <Box sx={{ display: 'flex', gap: 0.5 }}>
                {REGION_PRESETS.map(preset => (
                    <Button
                        key={preset.name}
                        id={`btn-preset-${preset.type.toLowerCase()}`}
                        variant="outlined"
                        size="small"
                        onClick={() => handlePresetClick(preset)}
                        sx={{
                            ...compactStyles.button,
                            flex: 1,
                            borderColor: filterType === preset.type ? theme.palette.primary.main : theme.palette.divider,
                            backgroundColor: filterType === preset.type ? theme.palette.action.selected : 'transparent',
                            '&:hover': {
                                backgroundColor: theme.palette.action.hover,
                                borderColor: theme.palette.primary.main
                            }
                        }}
                    >
                        {preset.name}
                    </Button>
                ))}
            </Box>

            <Divider sx={{ my: 0.5 }} />

            <Typography variant="overline" sx={compactStyles.sectionHeader}>
                Region Properties
            </Typography>

            <TextField
                id="input-region-name"
                label="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                size="small"
                fullWidth
                inputProps={{ maxLength: 64 }}
                sx={compactStyles.textField}
            />

            <FormControl size="small" fullWidth>
                <InputLabel id="label-region-type" sx={compactStyles.inputLabel}>Type</InputLabel>
                <Select
                    id="select-region-type"
                    labelId="label-region-type"
                    value={regionType}
                    label="Type"
                    onChange={handleTypeChange}
                    sx={compactStyles.select}
                >
                    {REGION_PRESETS.map(preset => (
                        <MenuItem key={preset.type} value={preset.type} sx={{ fontSize: '11px', minHeight: '32px' }}>
                            {preset.type}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            {regionType === 'Elevation' ? (
                <TextField
                    id="input-region-value"
                    label="Value (feet)"
                    type="number"
                    value={value}
                    onChange={(e) => setValue(Number(e.target.value))}
                    size="small"
                    fullWidth
                    InputProps={{ inputProps: { min: -100, max: 100, step: 5 } }}
                    sx={compactStyles.textField}
                />
            ) : (
                <FormControl size="small" fullWidth>
                    <InputLabel id="label-region-label" sx={compactStyles.inputLabel}>Label</InputLabel>
                    <Select
                        id="select-region-label"
                        labelId="label-region-label"
                        value={label}
                        label="Label"
                        onChange={(e) => setLabel(e.target.value)}
                        sx={compactStyles.select}
                    >
                        {regionType === 'Terrain' && TERRAIN_VALUES.map(val => (
                            <MenuItem key={val} value={val} sx={{ fontSize: '11px', minHeight: '32px' }}>
                                {val}
                            </MenuItem>
                        ))}
                        {regionType === 'Illumination' && ILLUMINATION_VALUES.map(val => (
                            <MenuItem key={val} value={val} sx={{ fontSize: '11px', minHeight: '32px' }}>
                                {val}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            )}

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography sx={{ fontSize: '9px', color: theme.palette.text.secondary }}>
                    Color
                </Typography>
                <input
                    id="input-region-color"
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    style={{
                        width: '32px',
                        height: '32px',
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: '4px',
                        cursor: 'pointer',
                        padding: 0
                    }}
                />
            </Box>

            <Button
                id="btn-place-region"
                variant="contained"
                onClick={handlePlaceRegion}
                disabled={!name.trim()}
                sx={compactStyles.button}
            >
                Place Region
            </Button>

            <Divider sx={{ my: 0.5 }} />

            <Typography variant="overline" sx={compactStyles.sectionHeader}>
                Placed Regions ({filteredRegions.length}{filterType ? ` of ${sceneRegions.length}` : ''})
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
                {filteredRegions.length === 0 ? (
                    <ListItem>
                        <ListItemText
                            primary={
                                <Typography sx={{ fontSize: '10px', color: theme.palette.text.disabled }}>
                                    {filterType ? `No ${filterType} regions placed` : 'No regions placed'}
                                </Typography>
                            }
                        />
                    </ListItem>
                ) : (
                    filteredRegions.map((sceneRegion) => (
                        <ListItem
                            key={sceneRegion.index}
                            id={`list-item-region-${sceneRegion.index}`}
                            disablePadding
                            secondaryAction={
                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                    <IconButton
                                        id={`btn-edit-region-${sceneRegion.index}`}
                                        edge="end"
                                        size="small"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onEditVertices?.(sceneRegion.index);
                                        }}
                                        sx={{ width: 20, height: 24 }}
                                    >
                                        <EditIcon sx={{ fontSize: 14 }} />
                                    </IconButton>
                                    <IconButton
                                        id={`btn-delete-region-${sceneRegion.index}`}
                                        edge="end"
                                        size="small"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteClick(sceneRegion.index);
                                        }}
                                        sx={{ width: 20, height: 24, color: theme.palette.error.main }}
                                    >
                                        <DeleteIcon sx={{ fontSize: 14 }} />
                                    </IconButton>
                                </Box>
                            }
                        >
                            <ListItemButton
                                selected={selectedRegionIndex === sceneRegion.index}
                                onClick={() => onRegionSelect?.(sceneRegion.index)}
                                sx={{ py: 0.5, pr: 10, pl: 0.5 }}
                            >
                                <ListItemText
                                    primary={sceneRegion.name}
                                    primaryTypographyProps={{ fontSize: '10px' }}
                                    secondary={`${sceneRegion.type} - ${sceneRegion.label || sceneRegion.value || 'N/A'}`}
                                    secondaryTypographyProps={{ fontSize: '8px' }}
                                />
                            </ListItemButton>
                        </ListItem>
                    ))
                )}
            </List>

            <ConfirmDialog
                open={deleteConfirmOpen}
                title="Delete Region"
                message="Are you sure you want to delete this region? This action cannot be undone."
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
});

RegionsPanel.displayName = 'RegionsPanel';
