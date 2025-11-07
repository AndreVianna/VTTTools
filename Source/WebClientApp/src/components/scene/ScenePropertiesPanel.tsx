import React from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    FormControlLabel,
    Switch,
    Button,
    Collapse,
    CircularProgress,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    IconButton,
    SelectChangeEvent
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { PhotoCamera as PhotoCameraIcon } from '@mui/icons-material';
import { Scene } from '@/types/domain';
import { GridConfig, GridType } from '@/utils/gridCalculator';

const SCENE_DEFAULT_BACKGROUND = '/assets/backgrounds/tavern.png';

export interface ScenePropertiesPanelProps {
    open: boolean;
    scene: Scene | null | undefined;
    onDescriptionChange: (description: string) => void;
    onPublishedChange: (published: boolean) => void;
    onBackgroundUpload?: (file: File) => void;
    onGridChange?: (grid: GridConfig) => void;
    backgroundUrl?: string;
    isUploadingBackground?: boolean;
}

interface AdventureLinkProps {
    adventure: { id: string; name: string };
}

const AdventureLink: React.FC<AdventureLinkProps> = ({ adventure }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/adventures/${adventure.id}`);
    };

    return (
        <Button
            variant="text"
            onClick={handleClick}
            sx={{
                textTransform: 'none',
                justifyContent: 'flex-start',
                p: 0,
                minWidth: 'auto',
                fontSize: '11px',
                fontWeight: 400,
                height: '20px'
            }}
        >
            {adventure.name}
        </Button>
    );
};

export const ScenePropertiesPanel: React.FC<ScenePropertiesPanelProps> = ({
    open,
    scene,
    onDescriptionChange,
    onPublishedChange,
    onBackgroundUpload,
    onGridChange,
    backgroundUrl,
    isUploadingBackground
}) => {
    const theme = useTheme();
    const effectiveBackgroundUrl = backgroundUrl || SCENE_DEFAULT_BACKGROUND;

    // Ultra-compact styles
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
        menuItem: {
            fontSize: '11px',
            minHeight: '32px'
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

    const handleBackgroundFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && onBackgroundUpload) {
            onBackgroundUpload(file);
        }
    };

    const handleGridTypeChange = (e: SelectChangeEvent) => {
        if (!scene?.grid || !onGridChange) return;
        const newType = e.target.value;

        onGridChange({
            type: newType as any,
            cellSize: scene.grid.cellSize ?? { width: 50, height: 50 },
            offset: scene.grid.offset ?? { left: 0, top: 0 },
            snap: scene.grid.snap ?? true
        });
    };

    const handleCellWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!scene || !onGridChange) return;
        const value = parseFloat(e.target.value);
        if (isNaN(value) || value < 10) return;
        onGridChange({
            type: scene.grid.type as GridType,
            cellSize: { ...scene.grid.cellSize, width: value },
            offset: scene.grid.offset,
            snap: scene.grid.snap
        });
    };

    const handleCellHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!scene || !onGridChange) return;
        const value = parseFloat(e.target.value);
        if (isNaN(value) || value < 10) return;
        onGridChange({
            type: scene.grid.type as GridType,
            cellSize: { ...scene.grid.cellSize, height: value },
            offset: scene.grid.offset,
            snap: scene.grid.snap
        });
    };

    const handleOffsetXChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!scene || !onGridChange) return;
        const value = parseFloat(e.target.value);
        if (isNaN(value)) return;
        onGridChange({
            type: scene.grid.type as GridType,
            cellSize: scene.grid.cellSize,
            offset: { ...scene.grid.offset, left: value },
            snap: scene.grid.snap
        });
    };

    const handleOffsetYChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!scene || !onGridChange) return;
        const value = parseFloat(e.target.value);
        if (isNaN(value)) return;
        onGridChange({
            type: scene.grid.type as GridType,
            cellSize: scene.grid.cellSize,
            offset: { ...scene.grid.offset, top: value },
            snap: scene.grid.snap
        });
    };

    const handleSnapChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!scene || !onGridChange) return;
        onGridChange({
            type: scene.grid.type as GridType,
            cellSize: scene.grid.cellSize,
            offset: scene.grid.offset,
            snap: e.target.checked
        });
    };

    return (
        <Collapse in={open} timeout={300}>
            <Paper
                elevation={2}
                sx={{
                    mx: 2,
                    mt: 1,
                    p: 1.5,
                    borderRadius: 2,
                    backgroundColor: theme.palette.background.paper
                }}
            >
                <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                        xs: '1fr',
                        sm: 'auto 1fr',
                        lg: '320px auto 280px'
                    },
                    gap: 2,
                    maxWidth: 1600,
                    mx: 'auto',
                    width: '100%'
                }}>
                    {/* COLUMN 1: Background Image */}
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 1.5,
                            width: { xs: '100%', sm: 256, lg: 320 },
                            height: { xs: 'auto', sm: 144, lg: 180 },
                            aspectRatio: '16/9',
                            borderRadius: 2,
                            overflow: 'hidden',
                            position: 'relative',
                            border: `1px solid ${theme.palette.divider}`,
                            backgroundImage: `url(${effectiveBackgroundUrl})`,
                            backgroundSize: 'cover',
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'center',
                            bgcolor: theme.palette.background.default
                        }}
                    >
                        {isUploadingBackground && (
                            <Box
                                sx={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    bgcolor: 'rgba(0, 0, 0, 0.5)'
                                }}
                            >
                                <CircularProgress size={32} />
                            </Box>
                        )}
                        <IconButton
                            component="label"
                            disabled={isUploadingBackground}
                            sx={{
                                position: 'absolute',
                                bottom: 8,
                                right: 8,
                                bgcolor: 'rgba(0, 0, 0, 0.6)',
                                color: 'white',
                                '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.8)' },
                                '&:disabled': { bgcolor: 'rgba(0, 0, 0, 0.3)' }
                            }}
                            aria-label="Change background image"
                        >
                            <PhotoCameraIcon fontSize="small" />
                            <input
                                type="file"
                                hidden
                                accept="image/*"
                                onChange={handleBackgroundFileChange}
                            />
                        </IconButton>
                        {!backgroundUrl && (
                            <Box
                                sx={{
                                    position: 'absolute',
                                    top: 8,
                                    left: 8,
                                    bgcolor: 'rgba(0, 0, 0, 0.6)',
                                    color: 'white',
                                    px: 1,
                                    py: 0.5,
                                    borderRadius: 1,
                                    fontSize: '0.75rem'
                                }}
                            >
                                Default
                            </Box>
                        )}
                    </Box>

                    {/* COLUMN 2: Basic Metadata */}
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 0.75
                    }}>
                        <Box sx={{ mb: 0 }}>
                            <Typography
                                variant="overline"
                                sx={compactStyles.sectionHeader}
                            >
                                Adventure
                            </Typography>
                            {scene?.adventure ? (
                                <AdventureLink adventure={scene.adventure} />
                            ) : (
                                <Typography
                                    sx={{
                                        color: theme.palette.text.disabled,
                                        fontSize: '11px'
                                    }}
                                >
                                    None
                                </Typography>
                            )}
                        </Box>

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
                    </Box>

                    {/* COLUMN 3: Grid Configuration */}
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 0.75,
                        gridColumn: { xs: '1', sm: '2', lg: '3' },
                        gridRow: { xs: 'auto', sm: '2', lg: '1' }
                    }}>
                        <Typography variant="overline" sx={compactStyles.sectionHeader}>
                            Grid Configuration
                        </Typography>

                        {/* Grid Type Dropdown */}
                        <FormControl fullWidth size="small">
                            <InputLabel id="label-grid-type" sx={compactStyles.inputLabel}>Type</InputLabel>
                            <Select
                                id="select-grid-type"
                                labelId="label-grid-type"
                                value={scene?.grid?.type ?? 'NoGrid'}
                                label="Type"
                                onChange={handleGridTypeChange}
                                sx={compactStyles.select}
                            >
                                <MenuItem sx={compactStyles.menuItem} value="NoGrid">No Grid</MenuItem>
                                <MenuItem sx={compactStyles.menuItem} value="Square">Square</MenuItem>
                                <MenuItem sx={compactStyles.menuItem} value="HexV">Hex (V)</MenuItem>
                                <MenuItem sx={compactStyles.menuItem} value="HexH">Hex (H)</MenuItem>
                                <MenuItem sx={compactStyles.menuItem} value="Isometric">Isometric</MenuItem>
                            </Select>
                        </FormControl>

                        {/* Cell Size (Row with W/H) */}
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <TextField
                                id="input-cell-width"
                                label="W"
                                type="number"
                                value={scene?.grid.cellSize.width ?? 50}
                                onChange={handleCellWidthChange}
                                size="small"
                                fullWidth
                                InputProps={{ inputProps: { min: 10, max: 200, step: 1 } }}
                                sx={compactStyles.textField}
                            />
                            <TextField
                                id="input-cell-height"
                                label="H"
                                type="number"
                                value={scene?.grid.cellSize.height ?? 50}
                                onChange={handleCellHeightChange}
                                size="small"
                                fullWidth
                                InputProps={{ inputProps: { min: 10, max: 200, step: 1 } }}
                                sx={compactStyles.textField}
                            />
                        </Box>

                        {/* Offset (Row with X/Y) */}
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <TextField
                                id="input-offset-x"
                                label="X"
                                type="number"
                                value={scene?.grid.offset.left ?? 0}
                                onChange={handleOffsetXChange}
                                size="small"
                                fullWidth
                                InputProps={{ inputProps: { step: 1 } }}
                                sx={compactStyles.textField}
                            />
                            <TextField
                                id="input-offset-y"
                                label="Y"
                                type="number"
                                value={scene?.grid.offset.top ?? 0}
                                onChange={handleOffsetYChange}
                                size="small"
                                fullWidth
                                InputProps={{ inputProps: { step: 1 } }}
                                sx={compactStyles.textField}
                            />
                        </Box>

                        {/* Snap to Grid Toggle */}
                        <FormControlLabel
                            control={
                                <Switch
                                    id="switch-snap-grid"
                                    size="small"
                                    checked={scene?.grid.snap ?? false}
                                    onChange={handleSnapChange}
                                />
                            }
                            label={<Typography sx={compactStyles.toggleLabel}>Snap to Grid</Typography>}
                            sx={{ margin: 0 }}
                        />

                        {/* Display Settings - Removed: defaultDisplayName and defaultLabelPosition are now handled in localStorage */}
                    </Box>
                </Box>
            </Paper>
        </Collapse>
    );
};
