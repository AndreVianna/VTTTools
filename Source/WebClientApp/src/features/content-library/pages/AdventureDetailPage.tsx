import { useState, useEffect, useCallback } from 'react';
import type React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme, alpha } from '@mui/material';
import { getApiEndpoints } from '@/config/development';
import {
    Box,
    Typography,
    Button,
    IconButton,
    Grid,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormControlLabel,
    Switch,
    CircularProgress,
    Alert,
    Paper
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { SceneCard } from '../components/scenes';
import { AdventureStyle } from '../types';
import type { SaveStatus } from '../hooks';
import {
    useGetAdventureQuery,
    useGetScenesQuery,
    useUpdateAdventureMutation,
    useCreateSceneMutation,
    useCloneSceneMutation
} from '@/services/adventuresApi';
import { useUploadFileMutation } from '@/services/mediaApi';
import { useDeleteSceneMutation } from '@/services/sceneApi';
import { ConfirmDialog } from '@/components/common';

export function AdventureDetailPage() {
    const { adventureId } = useParams<{ adventureId: string }>();
    const navigate = useNavigate();
    const theme = useTheme();

    const { data: adventure, isLoading: isLoadingAdventure, error: adventureError } = useGetAdventureQuery(adventureId!);
    const { data: scenes = [], isLoading: isLoadingScenes } = useGetScenesQuery(adventureId!);
    const [updateAdventure] = useUpdateAdventureMutation();
    const [createScene] = useCreateSceneMutation();
    const [uploadFile, { isLoading: isUploading }] = useUploadFileMutation();
    const [cloneScene] = useCloneSceneMutation();
    const [deleteScene, { isLoading: isDeleting }] = useDeleteSceneMutation();

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [style, setStyle] = useState<AdventureStyle>(AdventureStyle.Generic);
    const [isOneShot, setIsOneShot] = useState(false);
    const [isPublished, setIsPublished] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [sceneToDelete, setSceneToDelete] = useState<{ id: string; name: string } | null>(null);

    useEffect(() => {
        if (adventure && !isInitialized) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setName(adventure.name);
            setDescription(adventure.description);
            setStyle(adventure.style ?? AdventureStyle.Generic);
            setIsOneShot(adventure.isOneShot ?? false);
            setIsPublished(adventure.isPublished);
            setIsInitialized(true);
        }
    }, [adventure, isInitialized]);

    const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');

    const hasUnsavedChanges = useCallback(() => {
        if (!adventure || !isInitialized) return false;
        return (
            name !== adventure.name ||
            description !== adventure.description ||
            style !== adventure.style ||
            isOneShot !== adventure.isOneShot ||
            isPublished !== adventure.isPublished
        );
    }, [adventure, isInitialized, name, description, style, isOneShot, isPublished]);

    const saveChanges = useCallback(async (overrides?: Partial<{ name: string; description: string; style: AdventureStyle; isOneShot: boolean; isPublished: boolean }>) => {
        if (!adventureId || !adventure || !isInitialized) {
            return;
        }

        const currentData = {
            name,
            description,
            style,
            isOneShot,
            isPublished,
            ...overrides
        };

        const hasChanges =
            currentData.name !== adventure.name ||
            currentData.description !== adventure.description ||
            currentData.style !== adventure.style ||
            currentData.isOneShot !== adventure.isOneShot ||
            currentData.isPublished !== adventure.isPublished;

        if (!hasChanges) {
            return;
        }

        setSaveStatus('saving');
        try {
            await updateAdventure({
                id: adventureId,
                request: currentData
            }).unwrap();
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus('idle'), 2000);
        } catch (_error) {
            setSaveStatus('error');
        }
    }, [adventureId, adventure, isInitialized, name, description, style, isOneShot, isPublished, updateAdventure]);

    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (hasUnsavedChanges()) {
                e.preventDefault();
                e.returnValue = '';
            }
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden' && hasUnsavedChanges()) {
                saveChanges();
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [hasUnsavedChanges, saveChanges]);

    const handleBack = () => {
        navigate('/content-library');
    };

    const handleBackgroundUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !adventureId) return;

        try {
            setSaveStatus('saving');
            const result = await uploadFile({
                file,
                type: 'adventure',
                resource: 'background',
                entityId: adventureId
            }).unwrap();

            await updateAdventure({
                id: adventureId,
                request: { backgroundId: result.id }
            }).unwrap();

            setSaveStatus('saved');
            setTimeout(() => setSaveStatus('idle'), 2000);
        } catch (_error) {
            setSaveStatus('error');
        }
    };

    const handleAddScene = async () => {
        if (adventureId) {
            try {
                const scene = await createScene({
                    adventureId,
                    request: {
                        name: 'New Scene',
                        description: '',
                        grid: {
                            type: 0,
                            cellSize: { width: 50, height: 50 },
                            offset: { left: 0, top: 0 },
                            snap: true
                        }
                    }
                }).unwrap();
                navigate(`/scene-editor/${scene.id}`);
            } catch (_error) {
                setSaveStatus('error');
            }
        }
    };

    const handleOpenScene = (sceneId: string) => {
        navigate(`/scene-editor/${sceneId}`);
    };

    const handleDuplicateScene = async (sceneId: string) => {
        if (!adventureId) return;

        try {
            await cloneScene({
                adventureId,
                sceneId
            }).unwrap();
        } catch (error) {
            console.error('Failed to duplicate scene:', error);
            setSaveStatus('error');
        }
    };

    const handleDeleteScene = (sceneId: string) => {
        const scene = scenes.find(s => s.id === sceneId);
        if (!scene) return;

        setSceneToDelete({ id: sceneId, name: scene.name });
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!sceneToDelete) return;

        try {
            await deleteScene(sceneToDelete.id).unwrap();

            setDeleteDialogOpen(false);
            setSceneToDelete(null);
        } catch (error) {
            console.error('Failed to delete scene:', error);
            setSaveStatus('error');
        }
    };

    const handleCancelDelete = () => {
        setDeleteDialogOpen(false);
        setSceneToDelete(null);
    };

    if (isLoadingAdventure) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (adventureError || !adventure) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error">
                    Failed to load adventure. Please try again.
                </Alert>
                <Button startIcon={<ArrowBackIcon />} onClick={handleBack} sx={{ mt: 2 }}>
                    Back to Library
                </Button>
            </Box>
        );
    }

    const getSaveIndicator = (status: SaveStatus) => {
        switch (status) {
            case 'saving':
                return (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                        <CircularProgress size={16} />
                        <Typography variant="caption">Saving...</Typography>
                    </Box>
                );
            case 'saved':
                return (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'success.main' }}>
                        <CheckCircleIcon fontSize="small" />
                        <Typography variant="caption">Saved</Typography>
                    </Box>
                );
            case 'error':
                return (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'error.main' }}>
                        <Typography variant="caption">Save failed</Typography>
                    </Box>
                );
            default:
                return null;
        }
    };

    const apiEndpoints = getApiEndpoints();
    const backgroundUrl = adventure.background
        ? `${apiEndpoints.media}/${adventure.background.id}`
        : undefined;

    return (
        <Box
            id="adventure-detail-container"
            sx={{
                minHeight: '100vh',
                backgroundImage: backgroundUrl ? `url(${backgroundUrl})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'scroll',
                bgcolor: 'background.default',
                position: 'relative',
                '&::before': backgroundUrl ? {
                    content: '""',
                    position: 'absolute',
                    inset: 0,
                    background: theme.palette.mode === 'dark'
                        ? 'linear-gradient(to bottom, rgba(0, 0, 0, 0.3) 0%, transparent 40%)'
                        : 'linear-gradient(to bottom, rgba(255, 255, 255, 0.2) 0%, transparent 40%)',
                    pointerEvents: 'none',
                    zIndex: 0
                } : {}
            }}
        >
            <Box sx={{ p: 3 }}>
                <Paper
                    elevation={3}
                    sx={{
                        p: 3,
                        backgroundColor: alpha(theme.palette.background.paper, 0.85),
                        backdropFilter: 'blur(12px)',
                        WebkitBackdropFilter: 'blur(12px)',
                        border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                        <IconButton
                            id="btn-back-to-library"
                            onClick={handleBack}
                            aria-label="Back to library"
                        >
                            <ArrowBackIcon />
                        </IconButton>
                        <Box sx={{ flex: 1 }}>
                            <TextField
                                id="input-adventure-name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                onBlur={() => saveChanges()}
                                variant="standard"
                                fullWidth
                                placeholder="Adventure Name"
                                inputProps={{
                                    style: { fontSize: '2rem', fontWeight: 500 }
                                }}
                            />
                        </Box>
                        {getSaveIndicator(saveStatus)}
                    </Box>

                    <Box sx={{ display: 'flex', gap: 3 }}>
                        {/* Left Column: Image Only */}
                        <Box sx={{ flexShrink: 0 }}>
                            {backgroundUrl ? (
                                <Box
                                    sx={{
                                        width: 384,
                                        height: 216,
                                        borderRadius: 2,
                                        overflow: 'hidden',
                                        position: 'relative',
                                        border: `1px solid ${theme.palette.divider}`,
                                        backgroundImage: `url(${backgroundUrl})`,
                                        backgroundSize: 'contain',
                                        backgroundRepeat: 'no-repeat',
                                        backgroundPosition: 'center',
                                        bgcolor: 'background.default',
                                    }}
                                >
                                    <IconButton
                                        component="label"
                                        disabled={isUploading}
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
                                            onChange={handleBackgroundUpload}
                                        />
                                    </IconButton>
                                </Box>
                            ) : (
                                <Box
                                    sx={{
                                        width: 216,
                                        height: 216,
                                        borderRadius: 2,
                                        border: `2px dashed ${theme.palette.divider}`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        bgcolor: 'action.hover',
                                        flexShrink: 0,
                                    }}
                                >
                                    <Button
                                        component="label"
                                        variant="outlined"
                                        startIcon={<PhotoCameraIcon />}
                                        disabled={isUploading}
                                    >
                                        Upload
                                        <input
                                            type="file"
                                            hidden
                                            accept="image/*"
                                            onChange={handleBackgroundUpload}
                                        />
                                    </Button>
                                </Box>
                            )}
                        </Box>

                        {/* Right Column: Style + Switches (Row 1), Description (Row 2) */}
                        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {/* Row 1: Style + Switches */}
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                <FormControl size="small" sx={{ minWidth: 200 }}>
                                    <InputLabel id="label-adventure-style">Style</InputLabel>
                                    <Select
                                        id="select-adventure-style"
                                        labelId="label-adventure-style"
                                        value={style}
                                        label="Style"
                                        onChange={(e) => {
                                            const newStyle = e.target.value as AdventureStyle;
                                            setStyle(newStyle);
                                            saveChanges({ style: newStyle });
                                        }}
                                    >
                                        <MenuItem value={AdventureStyle.Generic}>Generic</MenuItem>
                                        <MenuItem value={AdventureStyle.OpenWorld}>Open World</MenuItem>
                                        <MenuItem value={AdventureStyle.DungeonCrawl}>Dungeon Crawl</MenuItem>
                                        <MenuItem value={AdventureStyle.HackNSlash}>Hack-n-Slash</MenuItem>
                                        <MenuItem value={AdventureStyle.Survival}>Survival</MenuItem>
                                        <MenuItem value={AdventureStyle.GoalDriven}>Goal Driven</MenuItem>
                                        <MenuItem value={AdventureStyle.RandomlyGenerated}>Randomly Generated</MenuItem>
                                    </Select>
                                </FormControl>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={isOneShot}
                                            onChange={(e) => {
                                                const newValue = e.target.checked;
                                                setIsOneShot(newValue);
                                                saveChanges({ isOneShot: newValue });
                                            }}
                                            size="small"
                                        />
                                    }
                                    label="One-Shot"
                                />
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={isPublished}
                                            onChange={(e) => {
                                                const newValue = e.target.checked;
                                                setIsPublished(newValue);
                                                saveChanges({ isPublished: newValue });
                                            }}
                                            size="small"
                                        />
                                    }
                                    label="Published"
                                />
                            </Box>

                            {/* Row 2: Description */}
                            <TextField
                                id="input-adventure-description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                onBlur={() => saveChanges()}
                                multiline
                                rows={5}
                                fullWidth
                                placeholder="Adventure description..."
                                variant="outlined"
                            />
                        </Box>
                    </Box>
                </Paper>
            </Box>

            <Box sx={{ px: 3, pb: 3 }}>
                <Paper
                    elevation={2}
                    sx={{
                        p: 3,
                        backgroundColor: alpha(theme.palette.background.paper, 0.75),
                        backdropFilter: 'blur(8px)',
                        WebkitBackdropFilter: 'blur(8px)',
                    }}
                >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h5" component="h2">
                        Scenes ({scenes.length})
                    </Typography>
                    <Button
                        id="btn-add-scene"
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleAddScene}
                    >
                        Add Scene
                    </Button>
                </Box>

                {isLoadingScenes && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                        <CircularProgress />
                    </Box>
                )}

                {!isLoadingScenes && scenes.length === 0 && (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                        <Typography variant="h6" gutterBottom>
                            No scenes yet
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                            Add your first scene to this adventure
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={handleAddScene}
                        >
                            Add Scene
                        </Button>
                    </Box>
                )}

                {!isLoadingScenes && scenes.length > 0 && (
                    <Grid container spacing={3}>
                        {scenes.map((scene) => (
                            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={scene.id}>
                                <SceneCard
                                    scene={scene}
                                    onOpen={handleOpenScene}
                                    onDuplicate={handleDuplicateScene}
                                    onDelete={handleDeleteScene}
                                />
                            </Grid>
                        ))}
                    </Grid>
                )}
                </Paper>
            </Box>

            <ConfirmDialog
                open={deleteDialogOpen}
                onClose={handleCancelDelete}
                onConfirm={handleConfirmDelete}
                title="Delete Scene"
                message={`Are you sure you want to delete "${sceneToDelete?.name}"? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                severity="error"
                isLoading={isDeleting}
            />
        </Box>
    );
}
