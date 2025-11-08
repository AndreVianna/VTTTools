import React from 'react';
import {
    Box,
    Drawer,
    Typography,
    TextField,
    FormControlLabel,
    Switch,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    SelectChangeEvent
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Scene, Light, Weather } from '@/types/domain';

export interface ScenePropertiesDrawerProps {
    open: boolean;
    onClose: () => void;
    scene: Scene | null | undefined;
    onNameChange?: (name: string) => void;
    onDescriptionChange: (description: string) => void;
    onPublishedChange: (published: boolean) => void;
    onLightChange?: (light: Light) => void;
    onWeatherChange?: (weather: Weather) => void;
    onElevationChange?: (elevation: number) => void;
}

export const ScenePropertiesDrawer: React.FC<ScenePropertiesDrawerProps> = ({
    open,
    onClose,
    scene,
    onNameChange,
    onDescriptionChange,
    onPublishedChange,
    onLightChange,
    onWeatherChange,
    onElevationChange
}) => {
    const theme = useTheme();

    const compactStyles = {
        sectionHeader: {
            fontSize: '10px',
            fontWeight: 700,
            textTransform: 'uppercase' as const,
            letterSpacing: '0.5px',
            color: theme.palette.text.secondary,
            mb: 0.5,
            lineHeight: 1.2,
            display: 'block'
        },
        textFieldMultiline: {
            '& .MuiInputBase-root': {
                fontSize: '11px',
                padding: '6px 8px',
                backgroundColor: theme.palette.background.default
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
        textField: {
            '& .MuiInputBase-root': {
                fontSize: '11px',
                backgroundColor: theme.palette.background.default
            },
            '& .MuiInputBase-input': {
                padding: '6px 8px',
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
        menuItem: {
            fontSize: '11px',
            minHeight: '32px'
        }
    };

    const handleNameBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const newName = e.target.value.trim();
        if (scene && newName && newName !== scene.name && onNameChange) {
            onNameChange(newName);
        }
    };

    const handleDescriptionBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const newDescription = e.target.value;
        if (scene && newDescription !== scene.description) {
            onDescriptionChange(newDescription);
        }
    };

    const handlePublishedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onPublishedChange(e.target.checked);
    };

    const handleLightChange = (e: SelectChangeEvent<number>) => {
        if (onLightChange) {
            onLightChange(Number(e.target.value) as Light);
        }
    };

    const handleWeatherChange = (e: SelectChangeEvent<string>) => {
        if (onWeatherChange) {
            onWeatherChange(e.target.value as Weather);
        }
    };

    const handleElevationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (onElevationChange) {
            const value = parseFloat(e.target.value);
            if (!isNaN(value)) {
                onElevationChange(value);
            }
        }
    };

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            sx={{
                '& .MuiDrawer-paper': {
                    width: { xs: '100vw', sm: 360 },
                    backgroundColor: theme.palette.background.paper,
                    top: 28,
                    bottom: 0,
                    height: 'auto'
                }
            }}
        >
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
                p: 2,
                height: '100%',
                overflowY: 'auto'
            }}>
                {/* Scene Name */}
                <TextField
                    id="scene-name"
                    label="Scene Name"
                    defaultValue={scene?.name ?? ''}
                    onBlur={handleNameBlur}
                    fullWidth
                    variant="outlined"
                    placeholder="Enter scene name..."
                    size="small"
                    sx={compactStyles.textField}
                />

                {/* Description */}
                <TextField
                    id="scene-description"
                    label="Description"
                    defaultValue={scene?.description ?? ''}
                    onBlur={handleDescriptionBlur}
                    multiline
                    rows={2}
                    fullWidth
                    variant="outlined"
                    placeholder="Scene description..."
                    size="small"
                    sx={compactStyles.textFieldMultiline}
                />

                {/* Published Toggle */}
                <FormControlLabel
                    control={
                        <Switch
                            id="scene-published"
                            size="small"
                            checked={scene?.isPublished ?? false}
                            onChange={handlePublishedChange}
                        />
                    }
                    label={
                        <Typography sx={compactStyles.toggleLabel}>
                            Published
                        </Typography>
                    }
                    sx={{ margin: 0 }}
                />

                {/* Light, Weather, Elevation - Single Row */}
                <Box sx={{ display: 'flex', gap: 0.75 }}>
                    {/* Light */}
                    <FormControl fullWidth size="small">
                        <InputLabel id="label-light" sx={compactStyles.inputLabel}>Light</InputLabel>
                        <Select
                            id="select-light"
                            labelId="label-light"
                            value={scene?.light ?? Light.Ambient}
                            label="Light"
                            onChange={handleLightChange}
                            sx={compactStyles.select}
                        >
                            <MenuItem sx={compactStyles.menuItem} value={Light.Black}>Black</MenuItem>
                            <MenuItem sx={compactStyles.menuItem} value={Light.Darkness}>Darkness</MenuItem>
                            <MenuItem sx={compactStyles.menuItem} value={Light.Nighttime}>Nighttime</MenuItem>
                            <MenuItem sx={compactStyles.menuItem} value={Light.Dim}>Dim</MenuItem>
                            <MenuItem sx={compactStyles.menuItem} value={Light.Twilight}>Twilight</MenuItem>
                            <MenuItem sx={compactStyles.menuItem} value={Light.Ambient}>Ambient</MenuItem>
                            <MenuItem sx={compactStyles.menuItem} value={Light.Candlelight}>Candlelight</MenuItem>
                            <MenuItem sx={compactStyles.menuItem} value={Light.Torchlight}>Torchlight</MenuItem>
                            <MenuItem sx={compactStyles.menuItem} value={Light.Artificial}>Artificial</MenuItem>
                            <MenuItem sx={compactStyles.menuItem} value={Light.Daylight}>Daylight</MenuItem>
                            <MenuItem sx={compactStyles.menuItem} value={Light.Bright}>Bright</MenuItem>
                        </Select>
                    </FormControl>

                    {/* Weather */}
                    <FormControl fullWidth size="small">
                        <InputLabel id="label-weather" sx={compactStyles.inputLabel}>Weather</InputLabel>
                        <Select
                            id="select-weather"
                            labelId="label-weather"
                            value={scene?.weather ?? Weather.Clear}
                            label="Weather"
                            onChange={handleWeatherChange}
                            sx={compactStyles.select}
                        >
                            <MenuItem sx={compactStyles.menuItem} value={Weather.Clear}>Clear</MenuItem>
                            <MenuItem sx={compactStyles.menuItem} value={Weather.PartlyCloudy}>Partly Cloudy</MenuItem>
                            <MenuItem sx={compactStyles.menuItem} value={Weather.Overcast}>Overcast</MenuItem>
                            <MenuItem sx={compactStyles.menuItem} value={Weather.Fog}>Fog</MenuItem>
                            <MenuItem sx={compactStyles.menuItem} value={Weather.LightRain}>Light Rain</MenuItem>
                            <MenuItem sx={compactStyles.menuItem} value={Weather.Rain}>Rain</MenuItem>
                            <MenuItem sx={compactStyles.menuItem} value={Weather.HeavyRain}>Heavy Rain</MenuItem>
                            <MenuItem sx={compactStyles.menuItem} value={Weather.Rainstorm}>Rainstorm</MenuItem>
                            <MenuItem sx={compactStyles.menuItem} value={Weather.Thunderstorm}>Thunderstorm</MenuItem>
                            <MenuItem sx={compactStyles.menuItem} value={Weather.LightSnow}>Light Snow</MenuItem>
                            <MenuItem sx={compactStyles.menuItem} value={Weather.Snow}>Snow</MenuItem>
                            <MenuItem sx={compactStyles.menuItem} value={Weather.HeavySnow}>Heavy Snow</MenuItem>
                            <MenuItem sx={compactStyles.menuItem} value={Weather.Snowstorm}>Snowstorm</MenuItem>
                            <MenuItem sx={compactStyles.menuItem} value={Weather.Hail}>Hail</MenuItem>
                            <MenuItem sx={compactStyles.menuItem} value={Weather.IceStorm}>Ice Storm</MenuItem>
                            <MenuItem sx={compactStyles.menuItem} value={Weather.Breezy}>Breezy</MenuItem>
                            <MenuItem sx={compactStyles.menuItem} value={Weather.Windy}>Windy</MenuItem>
                            <MenuItem sx={compactStyles.menuItem} value={Weather.Hurricane}>Hurricane</MenuItem>
                            <MenuItem sx={compactStyles.menuItem} value={Weather.Tornado}>Tornado</MenuItem>
                            <MenuItem sx={compactStyles.menuItem} value={Weather.FireStorm}>Fire Storm</MenuItem>
                        </Select>
                    </FormControl>

                    {/* Elevation */}
                    <TextField
                        id="scene-elevation"
                        label="Elevation"
                        type="number"
                        value={scene?.elevation ?? 0}
                        onChange={handleElevationChange}
                        fullWidth
                        variant="outlined"
                        placeholder="0"
                        size="small"
                        sx={compactStyles.textField}
                        InputProps={{ inputProps: { step: 0.1 } }}
                    />
                </Box>

                {/* Display Settings - Removed: defaultDisplayName and defaultLabelPosition are now handled in localStorage */}
            </Box>
        </Drawer>
    );
};
