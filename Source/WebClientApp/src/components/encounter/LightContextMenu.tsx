import {
    Box,
    Button,
    Checkbox,
    FormControl,
    FormControlLabel,
    Menu,
    MenuItem,
    Select,
    type SelectChangeEvent,
    Slider,
    TextField,
    Typography,
    useTheme,
} from '@mui/material';
import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { LightSourceType, type EncounterLightSource } from '@/types/domain';

export interface LightContextMenuProps {
    anchorPosition: { left: number; top: number } | null;
    open: boolean;
    onClose: () => void;
    lightSource: EncounterLightSource | null;
    onLightSourceUpdate?: (sourceIndex: number, updates: Partial<EncounterLightSource>) => void;
    onLightSourceDelete?: (sourceIndex: number) => void;
}

const LIGHT_SOURCE_TYPE_LABELS: Record<LightSourceType, string> = {
    [LightSourceType.Natural]: 'Natural',
    [LightSourceType.Artificial]: 'Artificial',
    [LightSourceType.Supernatural]: 'Supernatural',
};

export const LightContextMenu: React.FC<LightContextMenuProps> = ({
    anchorPosition,
    open,
    onClose,
    lightSource,
    onLightSourceUpdate,
    onLightSourceDelete,
}) => {
    const theme = useTheme();
    const menuRef = useRef<HTMLDivElement>(null);

    const [nameValue, setNameValue] = useState('');
    const [rangeValue, setRangeValue] = useState(6);
    const [isDirectional, setIsDirectional] = useState(false);
    const [directionValue, setDirectionValue] = useState(0);
    const [arcValue, setArcValue] = useState(90);
    const [typeValue, setTypeValue] = useState(LightSourceType.Artificial);
    const [colorValue, setColorValue] = useState('');
    const [isOnValue, setIsOnValue] = useState(true);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleClickOutside = useCallback(
        (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose();
            }
        },
        [onClose],
    );

    useEffect(() => {
        if (open) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }
        return undefined;
    }, [open, handleClickOutside]);

    const sourceIndex = lightSource?.index;

    useEffect(() => {
        // Sync form state when context menu opens or light source changes
        if (open && lightSource) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setNameValue(lightSource.name || '');
             
            setRangeValue(lightSource.range);
            const shouldBeDirectional = lightSource.direction !== undefined;
             
            setIsDirectional(shouldBeDirectional);
             
            setDirectionValue(lightSource.direction ?? 0);
             
            setArcValue(lightSource.arc ?? 90);
             
            setTypeValue(lightSource.type);
             
            setColorValue(lightSource.color || '');
             
            setIsOnValue(lightSource.isOn);
             
            setShowDeleteConfirm(false);
        }
    }, [open, lightSource, sourceIndex]);

    if (!lightSource) return null;

    const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setNameValue(event.target.value);
    };

    const handleNameBlur = () => {
        if (onLightSourceUpdate && nameValue !== (lightSource.name || '')) {
            const trimmed = nameValue.trim();
            if (trimmed) {
                onLightSourceUpdate(lightSource.index, { name: trimmed });
            } else if (lightSource.name) {
                onLightSourceUpdate(lightSource.index, { name: undefined });
            }
        } else {
            setNameValue(lightSource.name || '');
        }
    };

    const handleNameKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            (event.target as HTMLInputElement).blur();
        } else if (event.key === 'Escape') {
            setNameValue(lightSource.name || '');
            (event.target as HTMLInputElement).blur();
        }
    };

    const handleTypeChange = (event: SelectChangeEvent<LightSourceType>) => {
        const newType = event.target.value;
        setTypeValue(newType);
        if (onLightSourceUpdate) {
            onLightSourceUpdate(lightSource.index, { type: newType });
        }
    };

    const handleRangeChange = (_: Event, value: number | number[]) => {
        setRangeValue(value as number);
    };

    const handleRangeChangeCommitted = (_: Event | React.SyntheticEvent, value: number | number[]) => {
        if (onLightSourceUpdate && value !== lightSource.range) {
            onLightSourceUpdate(lightSource.index, { range: value as number });
        }
    };

    const handleColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setColorValue(event.target.value);
    };

    const handleColorBlur = () => {
        if (onLightSourceUpdate && colorValue !== (lightSource.color || '')) {
            const trimmed = colorValue.trim();
            if (trimmed) {
                onLightSourceUpdate(lightSource.index, { color: trimmed });
            } else if (lightSource.color) {
                onLightSourceUpdate(lightSource.index, { color: undefined });
            }
        } else {
            setColorValue(lightSource.color || '');
        }
    };

    const handleColorKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            (event.target as HTMLInputElement).blur();
        } else if (event.key === 'Escape') {
            setColorValue(lightSource.color || '');
            (event.target as HTMLInputElement).blur();
        }
    };

    const handleIsOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const checked = event.target.checked;
        setIsOnValue(checked);
        if (onLightSourceUpdate) {
            onLightSourceUpdate(lightSource.index, { isOn: checked });
        }
    };

    const handleDirectionalChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const checked = event.target.checked;
        setIsDirectional(checked);
        if (onLightSourceUpdate) {
            if (checked) {
                onLightSourceUpdate(lightSource.index, {
                    direction: directionValue,
                    arc: arcValue,
                });
            } else if (lightSource.direction !== undefined || lightSource.arc !== undefined) {
                const updates: Partial<EncounterLightSource> = {};
                if (lightSource.direction !== undefined) updates.direction = undefined;
                if (lightSource.arc !== undefined) updates.arc = undefined;
                onLightSourceUpdate(lightSource.index, updates);
            }
        }
    };

    const handleDirectionChange = (_: Event, value: number | number[]) => {
        setDirectionValue(value as number);
    };

    const handleDirectionChangeCommitted = (_: Event | React.SyntheticEvent, value: number | number[]) => {
        if (onLightSourceUpdate && isDirectional) {
            onLightSourceUpdate(lightSource.index, { direction: value as number });
        }
    };

    const handleArcChange = (_: Event, value: number | number[]) => {
        setArcValue(value as number);
    };

    const handleArcChangeCommitted = (_: Event | React.SyntheticEvent, value: number | number[]) => {
        if (onLightSourceUpdate && isDirectional) {
            onLightSourceUpdate(lightSource.index, { arc: value as number });
        }
    };

    const handleDeleteClick = () => {
        setShowDeleteConfirm(true);
    };

    const handleDeleteConfirm = () => {
        if (onLightSourceDelete) {
            onLightSourceDelete(lightSource.index);
        }
        onClose();
    };

    const handleDeleteCancel = () => {
        setShowDeleteConfirm(false);
    };

    const compactTextFieldStyle = {
        '& .MuiInputBase-root': {
            height: '28px',
            fontSize: '11px',
            backgroundColor: theme.palette.background.default,
        },
        '& .MuiInputBase-input': {
            padding: '4px 8px',
            fontSize: '11px',
        },
    };

    const compactSelectStyle = {
        height: '28px',
        fontSize: '11px',
        minWidth: 100,
        '& .MuiSelect-select': {
            padding: '4px 28px 4px 8px',
            fontSize: '11px',
        },
    };

    const compactSliderStyle = {
        '& .MuiSlider-markLabel': {
            fontSize: '8px',
        },
    };

    const compactCheckboxStyle = {
        '& .MuiFormControlLabel-label': {
            fontSize: '11px',
        },
        '& .MuiCheckbox-root': {
            padding: '4px',
        },
    };

    return (
        <Menu
            anchorReference="anchorPosition"
            {...(anchorPosition && { anchorPosition })}
            open={open}
            onClose={onClose}
            transformOrigin={{ vertical: 'top', horizontal: 'left' }}
            slotProps={{
                backdrop: {
                    invisible: true,
                    sx: { pointerEvents: 'none' },
                },
                paper: {
                    ref: menuRef,
                    sx: { pointerEvents: 'auto', minWidth: 220 },
                },
                root: {
                    sx: { pointerEvents: 'none' },
                },
            }}
        >
            <Box sx={{ px: 2, py: 1 }}>
                <Typography variant="subtitle2" sx={{ fontSize: '11px', fontWeight: 600, mb: 1 }}>
                    Light Source
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography sx={{ fontSize: '10px', minWidth: 50 }}>Name:</Typography>
                        <TextField
                            value={nameValue}
                            onChange={handleNameChange}
                            onBlur={handleNameBlur}
                            onKeyDown={handleNameKeyDown}
                            size="small"
                            placeholder="Optional"
                            inputProps={{ maxLength: 64 }}
                            sx={{ ...compactTextFieldStyle, flex: 1 }}
                        />
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography sx={{ fontSize: '10px', minWidth: 50 }}>Type:</Typography>
                        <FormControl size="small">
                            <Select<LightSourceType> value={typeValue} onChange={handleTypeChange} sx={compactSelectStyle}>
                                {Object.entries(LIGHT_SOURCE_TYPE_LABELS).map(([value, label]) => (
                                    <MenuItem key={value} value={value as LightSourceType} sx={{ fontSize: '11px' }}>
                                        {label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>

                    <Box>
                        <Typography sx={{ fontSize: '10px', color: theme.palette.text.secondary, mb: 0.5 }}>
                            Range: {rangeValue} ft
                        </Typography>
                        <Slider
                            value={rangeValue}
                            onChange={handleRangeChange}
                            onChangeCommitted={handleRangeChangeCommitted}
                            min={0.5}
                            max={50}
                            step={0.5}
                            size="small"
                            sx={compactSliderStyle}
                            marks={[
                                { value: 0.5, label: '0.5' },
                                { value: 10, label: '10' },
                                { value: 25, label: '25' },
                                { value: 50, label: '50' },
                            ]}
                        />
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography sx={{ fontSize: '10px', minWidth: 50 }}>Color:</Typography>
                        <TextField
                            value={colorValue}
                            onChange={handleColorChange}
                            onBlur={handleColorBlur}
                            onKeyDown={handleColorKeyDown}
                            size="small"
                            placeholder="#FFFFFF"
                            inputProps={{ maxLength: 16 }}
                            sx={{ ...compactTextFieldStyle, flex: 1 }}
                        />
                    </Box>

                    <FormControlLabel
                        control={<Checkbox checked={isOnValue} onChange={handleIsOnChange} size="small" />}
                        label="Light On"
                        sx={compactCheckboxStyle}
                    />

                    <FormControlLabel
                        control={
                            <Checkbox checked={isDirectional} onChange={handleDirectionalChange} size="small" />
                        }
                        label="Directional"
                        sx={compactCheckboxStyle}
                    />

                    {isDirectional && (
                        <Box sx={{ pl: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Box>
                                <Typography sx={{ fontSize: '10px', color: theme.palette.text.secondary }}>
                                    Direction: {directionValue}°
                                </Typography>
                                <Slider
                                    value={directionValue}
                                    onChange={handleDirectionChange}
                                    onChangeCommitted={handleDirectionChangeCommitted}
                                    min={0}
                                    max={359}
                                    step={1}
                                    size="small"
                                    sx={compactSliderStyle}
                                    marks={[
                                        { value: 0, label: '0°' },
                                        { value: 90, label: '90°' },
                                        { value: 180, label: '180°' },
                                        { value: 270, label: '270°' },
                                    ]}
                                />
                            </Box>

                            <Box>
                                <Typography sx={{ fontSize: '10px', color: theme.palette.text.secondary }}>
                                    Arc: {arcValue}°
                                </Typography>
                                <Slider
                                    value={arcValue}
                                    onChange={handleArcChange}
                                    onChangeCommitted={handleArcChangeCommitted}
                                    min={15}
                                    max={180}
                                    step={15}
                                    size="small"
                                    sx={compactSliderStyle}
                                    marks={[
                                        { value: 15, label: '15°' },
                                        { value: 90, label: '90°' },
                                        { value: 180, label: '180°' },
                                    ]}
                                />
                            </Box>
                        </Box>
                    )}

                    {!showDeleteConfirm ? (
                        <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            onClick={handleDeleteClick}
                            sx={{
                                height: '28px',
                                fontSize: '10px',
                                textTransform: 'none',
                                mt: 0.5,
                            }}
                        >
                            Delete Light
                        </Button>
                    ) : (
                        <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                            <Button
                                variant="contained"
                                color="error"
                                size="small"
                                onClick={handleDeleteConfirm}
                                sx={{
                                    height: '28px',
                                    fontSize: '10px',
                                    textTransform: 'none',
                                    flex: 1,
                                }}
                            >
                                Confirm
                            </Button>
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={handleDeleteCancel}
                                sx={{
                                    height: '28px',
                                    fontSize: '10px',
                                    textTransform: 'none',
                                    flex: 1,
                                }}
                            >
                                Cancel
                            </Button>
                        </Box>
                    )}
                </Box>
            </Box>
        </Menu>
    );
};
