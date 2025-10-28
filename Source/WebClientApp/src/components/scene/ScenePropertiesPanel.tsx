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
                fontSize: '0.875rem',
                fontWeight: 400
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
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: theme.palette.background.paper
                }}
            >
                <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                        xs: '1fr',
                        sm: 'auto 1fr',
                        lg: '320px auto 300px'
                    },
                    gap: 3,
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
                        gap: 1.5
                    }}>
                        <Box sx={{ mb: 0 }}>
                            <Typography
                                variant="subtitle2"
                                sx={{
                                    mb: 0.5,
                                    color: theme.palette.text.primary,
                                    fontSize: '0.875rem',
                                    fontWeight: 600
                                }}
                            >
                                Adventure
                            </Typography>
                            {scene?.adventure ? (
                                <AdventureLink adventure={scene.adventure} />
                            ) : (
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: theme.palette.text.disabled,
                                        fontSize: '0.875rem'
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
                            rows={3}
                            fullWidth
                            variant="outlined"
                            placeholder="Scene description..."
                            size="small"
                            sx={{
                                '& .MuiInputBase-root': {
                                    backgroundColor: theme.palette.background.default
                                }
                            }}
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
                                <Typography variant="body2">
                                    Published
                                </Typography>
                            }
                        />
                    </Box>

                    {/* COLUMN 3: Grid Configuration */}
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1.5,
                        gridColumn: { xs: '1', sm: '2', lg: '3' },
                        gridRow: { xs: 'auto', sm: '2', lg: '1' }
                    }}>
                        <Typography
                            variant="subtitle2"
                            sx={{
                                color: theme.palette.text.primary,
                                fontSize: '0.875rem',
                                fontWeight: 600
                            }}
                        >
                            Grid Configuration
                        </Typography>

                        {/* Grid Type Dropdown */}
                        <FormControl fullWidth size="small">
                            <InputLabel id="label-grid-type">Grid Type</InputLabel>
                            <Select
                                id="select-grid-type"
                                labelId="label-grid-type"
                                value={scene?.grid?.type ?? 'NoGrid'}
                                label="Grid Type"
                                onChange={handleGridTypeChange}
                            >
                                <MenuItem value="NoGrid">No Grid</MenuItem>
                                <MenuItem value="Square">Square</MenuItem>
                                <MenuItem value="HexV">Hex (Vertical)</MenuItem>
                                <MenuItem value="HexH">Hex (Horizontal)</MenuItem>
                                <MenuItem value="Isometric">Isometric</MenuItem>
                            </Select>
                        </FormControl>

                        {/* Cell Size (Row with W/H) */}
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <TextField
                                id="input-cell-width"
                                label="Cell Width"
                                type="number"
                                value={scene?.grid.cellSize.width ?? 50}
                                onChange={handleCellWidthChange}
                                size="small"
                                fullWidth
                                InputProps={{ inputProps: { min: 10, max: 200, step: 1 } }}
                            />
                            <TextField
                                id="input-cell-height"
                                label="Cell Height"
                                type="number"
                                value={scene?.grid.cellSize.height ?? 50}
                                onChange={handleCellHeightChange}
                                size="small"
                                fullWidth
                                InputProps={{ inputProps: { min: 10, max: 200, step: 1 } }}
                            />
                        </Box>

                        {/* Offset (Row with X/Y) */}
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <TextField
                                id="input-offset-x"
                                label="Offset X"
                                type="number"
                                value={scene?.grid.offset.left ?? 0}
                                onChange={handleOffsetXChange}
                                size="small"
                                fullWidth
                                InputProps={{ inputProps: { step: 1 } }}
                            />
                            <TextField
                                id="input-offset-y"
                                label="Offset Y"
                                type="number"
                                value={scene?.grid.offset.top ?? 0}
                                onChange={handleOffsetYChange}
                                size="small"
                                fullWidth
                                InputProps={{ inputProps: { step: 1 } }}
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
                            label={<Typography variant="body2">Snap to Grid</Typography>}
                        />
                    </Box>
                </Box>
            </Paper>
        </Collapse>
    );
};
