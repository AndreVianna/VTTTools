import React, { useState, useCallback } from 'react';
import {
    Box,
    Button,
    Checkbox,
    FormControlLabel,
    IconButton,
    Slider,
    TextField,
    Tooltip,
    Typography,
    useTheme
} from '@mui/material';
import { ExpandLess, ExpandMore, Delete } from '@mui/icons-material';
import { SOURCE_PRESETS, type SourcePreset } from './sourcesPanelTypes';
import type { SceneSource } from '@/types/domain';

export interface SourcesPanelProps {
    sceneId: string;
    sceneSources: SceneSource[];
    selectedSourceIndex: number | null;
    onSourceSelect: (index: number) => void;
    onSourceDelete: (index: number) => void;
    onPlaceSource: (properties: SourcePlacementProperties) => void;
    onEditSource?: (index: number, updates: Partial<SceneSource>) => void;
}

export interface SourcePlacementProperties {
    type: string;
    isDirectional: boolean;
    direction: number;
    spread: number;
    hasGradient: boolean;
    color: string;
}

export const SourcesPanel: React.FC<SourcesPanelProps> = React.memo(({
    sceneId: _sceneId,
    sceneSources,
    selectedSourceIndex,
    onSourceSelect,
    onSourceDelete,
    onPlaceSource,
    onEditSource: _onEditSource
}) => {
    const theme = useTheme();

    const [selectedPreset, setSelectedPreset] = useState<SourcePreset | null>(SOURCE_PRESETS[0] || null);
    const [type, setType] = useState<string>('light');
    const [isDirectional, setIsDirectional] = useState<boolean>(false);
    const [direction, setDirection] = useState<number>(0);
    const [spread, setSpread] = useState<number>(45);
    const [hasGradient, setHasGradient] = useState<boolean>(true);
    const [color, setColor] = useState<string>('#FFD93D');
    const [expandedSourceIndex, setExpandedSourceIndex] = useState<number | null>(null);

    const handlePresetSelect = useCallback((preset: SourcePreset) => {
        setSelectedPreset(preset);
        setType(preset.type);
        setIsDirectional(preset.isDirectional);
        setDirection(preset.defaultDirection);
        setSpread(preset.defaultSpread);
        setHasGradient(preset.defaultHasGradient);
        setColor(preset.defaultColor);
    }, []);

    const handlePlaceSource = useCallback(() => {
        onPlaceSource({
            type,
            isDirectional,
            direction,
            spread,
            hasGradient,
            color
        });
    }, [type, isDirectional, direction, spread, hasGradient, color, onPlaceSource]);

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
        toggleLabel: {
            fontSize: '10px'
        },
        button: {
            height: '28px',
            fontSize: '10px',
            borderRadius: 0,
            textTransform: 'none' as const
        },
        slider: {
            height: 4,
            '& .MuiSlider-thumb': {
                width: 12,
                height: 12
            },
            '& .MuiSlider-markLabel': {
                fontSize: '8px'
            }
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, p: 1 }}>
            <Typography variant="overline" sx={compactStyles.sectionHeader}>
                Source Type Presets
            </Typography>

            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {SOURCE_PRESETS.map((preset) => {
                    const Icon = preset.icon;
                    const isSelected = selectedPreset?.name === preset.name;
                    return (
                        <Tooltip key={preset.name} title={preset.name} arrow placement="top">
                            <IconButton
                                size="small"
                                onClick={() => handlePresetSelect(preset)}
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

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="overline" sx={compactStyles.sectionHeader}>
                    Basic Properties
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TextField
                        label="Type"
                        value={type}
                        disabled
                        size="small"
                        sx={{ ...compactStyles.textField, flex: 1 }}
                    />
                    <input
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

                <FormControlLabel
                    control={
                        <Checkbox
                            size="small"
                            checked={hasGradient}
                            onChange={(e) => setHasGradient(e.target.checked)}
                        />
                    }
                    label={<Typography sx={compactStyles.toggleLabel}>Gradient Falloff</Typography>}
                    sx={{ margin: 0 }}
                />

                <FormControlLabel
                    control={
                        <Checkbox
                            size="small"
                            checked={isDirectional}
                            onChange={(e) => setIsDirectional(e.target.checked)}
                        />
                    }
                    label={<Typography sx={compactStyles.toggleLabel}>Directional</Typography>}
                    sx={{ margin: 0 }}
                />
            </Box>

            {isDirectional && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography variant="overline" sx={compactStyles.sectionHeader}>
                        Directional Properties
                    </Typography>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography sx={{ fontSize: '9px', color: theme.palette.text.secondary }}>
                            Direction: {direction}°
                        </Typography>
                        <Slider
                            value={direction}
                            onChange={(_, value) => setDirection(value as number)}
                            min={0}
                            max={359}
                            step={1}
                            size="small"
                            sx={compactStyles.slider}
                        />
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography sx={{ fontSize: '9px', color: theme.palette.text.secondary }}>
                            Spread: {spread}°
                        </Typography>
                        <Slider
                            value={spread}
                            onChange={(_, value) => setSpread(value as number)}
                            min={15}
                            max={180}
                            step={5}
                            size="small"
                            sx={compactStyles.slider}
                        />
                    </Box>
                </Box>
            )}

            <Button
                variant="contained"
                fullWidth
                size="small"
                sx={compactStyles.button}
                onClick={handlePlaceSource}
            >
                Place Source
            </Button>

            <Typography variant="overline" sx={compactStyles.sectionHeader}>
                Placed Sources ({sceneSources.length})
            </Typography>

            <Box sx={{ maxHeight: '200px', overflowY: 'auto', border: `1px solid ${theme.palette.divider}`, borderRadius: '4px', p: 0.5 }}>
                {sceneSources.length === 0 ? (
                    <Typography sx={{ fontSize: '10px', color: theme.palette.text.secondary, textAlign: 'center', p: 1 }}>
                        No sources placed yet
                    </Typography>
                ) : (
                    sceneSources.map((source) => (
                        <Box
                            key={source.index}
                            sx={{
                                p: 0.5,
                                cursor: 'pointer',
                                backgroundColor: selectedSourceIndex === source.index ? theme.palette.action.selected : 'transparent',
                                '&:hover': { backgroundColor: theme.palette.action.hover },
                                borderRadius: '4px'
                            }}
                            onClick={() => onSourceSelect(source.index)}
                        >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography sx={{ fontSize: '10px', fontWeight: 'bold' }}>
                                    {source.name} ({source.type})
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                    <IconButton
                                        size="small"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setExpandedSourceIndex(expandedSourceIndex === source.index ? null : source.index);
                                        }}
                                        sx={{ padding: '2px' }}
                                    >
                                        {expandedSourceIndex === source.index ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
                                    </IconButton>
                                    <IconButton
                                        size="small"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onSourceDelete(source.index);
                                        }}
                                        sx={{ padding: '2px' }}
                                    >
                                        <Delete fontSize="small" />
                                    </IconButton>
                                </Box>
                            </Box>

                            {expandedSourceIndex === source.index && (
                                <Box sx={{ mt: 0.5, pl: 1, fontSize: '9px', color: theme.palette.text.secondary }}>
                                    <Typography sx={{ fontSize: '9px' }}>Range: {source.range}ft</Typography>
                                    <Typography sx={{ fontSize: '9px' }}>Intensity: {source.intensity}%</Typography>
                                    {source.isDirectional && (
                                        <>
                                            <Typography sx={{ fontSize: '9px' }}>Direction: {source.direction}°</Typography>
                                            <Typography sx={{ fontSize: '9px' }}>Spread: {source.spread}°</Typography>
                                        </>
                                    )}
                                </Box>
                            )}
                        </Box>
                    ))
                )}
            </Box>
        </Box>
    );
});

SourcesPanel.displayName = 'SourcesPanel';
