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
import { CampaignCard } from '../components/campaigns';
import type { SaveStatus } from '../hooks';
import {
    useGetEpicQuery,
    useGetCampaignsQuery,
    useUpdateEpicMutation,
    useCreateCampaignMutation,
    useCloneCampaignMutation,
    useRemoveCampaignMutation
} from '@/services/epicsApi';
import { useUploadFileMutation } from '@/services/mediaApi';
import { ConfirmDialog } from '@/components/common';

const EPIC_DEFAULT_BACKGROUND = '/assets/backgrounds/epic.png';

export function EpicDetailPage() {
    const { epicId } = useParams<{ epicId: string }>();
    const navigate = useNavigate();
    const theme = useTheme();

    const { data: epic, isLoading: isLoadingEpic, error: epicError } = useGetEpicQuery(epicId!);
    const { data: campaigns = [], isLoading: isLoadingCampaigns } = useGetCampaignsQuery(epicId!);
    const [updateEpic] = useUpdateEpicMutation();
    const [createCampaign] = useCreateCampaignMutation();
    const [uploadFile, { isLoading: isUploading }] = useUploadFileMutation();
    const [cloneCampaign] = useCloneCampaignMutation();
    const [removeCampaign, { isLoading: isDeleting }] = useRemoveCampaignMutation();

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isPublished, setIsPublished] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [campaignToDelete, setCampaignToDelete] = useState<{ id: string; name: string } | null>(null);

    useEffect(() => {
        if (epic && !isInitialized) {
            queueMicrotask(() => {
                setName(epic.name);
                setDescription(epic.description);
                setIsPublished(epic.isPublished);
                setIsInitialized(true);
            });
        }
    }, [epic, isInitialized]);

    const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');

    const hasUnsavedChanges = useCallback(() => {
        if (!epic || !isInitialized) return false;
        return (
            name !== epic.name ||
            description !== epic.description ||
            isPublished !== epic.isPublished
        );
    }, [epic, isInitialized, name, description, isPublished]);

    const saveChanges = useCallback(async (overrides?: Partial<{ name: string; description: string; isPublished: boolean }>) => {
        if (!epicId || !epic || !isInitialized) {
            return;
        }

        const currentData = {
            name,
            description,
            isPublished,
            ...overrides
        };

        const hasChanges =
            currentData.name !== epic.name ||
            currentData.description !== epic.description ||
            currentData.isPublished !== epic.isPublished;

        if (!hasChanges) {
            return;
        }

        setSaveStatus('saving');
        try {
            await updateEpic({
                id: epicId,
                request: currentData
            }).unwrap();
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus('idle'), 2000);
        } catch (error) {
            console.error('Failed to save epic changes:', error);
            setSaveStatus('error');
        }
    }, [epicId, epic, isInitialized, name, description, isPublished, updateEpic]);

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
        navigate('/content-library/epics');
    };

    const handleBackgroundUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !epicId) return;

        try {
            setSaveStatus('saving');
            const result = await uploadFile({
                file,
                type: 'epic',
                resource: 'background',
                entityId: epicId
            }).unwrap();

            await updateEpic({
                id: epicId,
                request: { backgroundId: result.id }
            }).unwrap();

            setSaveStatus('saved');
            setTimeout(() => setSaveStatus('idle'), 2000);
        } catch (error) {
            console.error('Failed to upload epic background:', error);
            setSaveStatus('error');
        }
    };

    const handleAddCampaign = async () => {
        if (epicId) {
            try {
                const campaign = await createCampaign({
                    epicId,
                    request: {
                        name: 'New Campaign',
                        description: ''
                    }
                }).unwrap();
                navigate(`/campaigns/${campaign.id}`);
            } catch (error) {
                console.error('Failed to create campaign:', error);
                setSaveStatus('error');
            }
        }
    };

    const handleOpenCampaign = (campaignId: string) => {
        navigate(`/campaigns/${campaignId}`);
    };

    const handleDuplicateCampaign = async (campaignId: string) => {
        if (!epicId) return;

        try {
            await cloneCampaign({
                epicId,
                campaignId
            }).unwrap();
        } catch (error) {
            console.error('Failed to duplicate campaign:', error);
            setSaveStatus('error');
        }
    };

    const handleDeleteCampaign = (campaignId: string) => {
        const campaign = campaigns.find(c => c.id === campaignId);
        if (!campaign) return;

        setCampaignToDelete({ id: campaignId, name: campaign.name });
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!campaignToDelete || !epicId) return;

        try {
            await removeCampaign({
                epicId,
                campaignId: campaignToDelete.id
            }).unwrap();

            setDeleteDialogOpen(false);
            setCampaignToDelete(null);
        } catch (error) {
            console.error('Failed to delete campaign:', error);
            setSaveStatus('error');
        }
    };

    const handleCancelDelete = () => {
        setDeleteDialogOpen(false);
        setCampaignToDelete(null);
    };

    if (isLoadingEpic) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (epicError || !epic) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error">
                    Failed to load epic. Please try again.
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
    const backgroundUrl = epic.background
        ? `${apiEndpoints.media}/${epic.background.id}`
        : EPIC_DEFAULT_BACKGROUND;

    return (
        <Box
            id="epic-detail-container"
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
                                id="input-epic-name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                onBlur={() => saveChanges()}
                                variant="standard"
                                fullWidth
                                placeholder="Epic Name"
                                inputProps={{
                                    style: { fontSize: '2rem', fontWeight: 500 }
                                }}
                            />
                        </Box>
                        {getSaveIndicator(saveStatus)}
                    </Box>

                    <Box sx={{ display: 'flex', gap: 3 }}>
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

                        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
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

                            <TextField
                                id="input-epic-description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                onBlur={() => saveChanges()}
                                multiline
                                rows={5}
                                fullWidth
                                placeholder="Epic description..."
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
                            Campaigns ({campaigns.length})
                        </Typography>
                        <Button
                            id="btn-add-campaign"
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={handleAddCampaign}
                        >
                            Add Campaign
                        </Button>
                    </Box>

                    {isLoadingCampaigns && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                            <CircularProgress />
                        </Box>
                    )}

                    {!isLoadingCampaigns && campaigns.length === 0 && (
                        <Box sx={{ textAlign: 'center', py: 8 }}>
                            <Typography variant="h6" gutterBottom>
                                No campaigns yet
                            </Typography>
                            <Typography variant="body2" color="text.secondary" paragraph>
                                Add your first campaign to this epic
                            </Typography>
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={handleAddCampaign}
                            >
                                Add Campaign
                            </Button>
                        </Box>
                    )}

                    {!isLoadingCampaigns && campaigns.length > 0 && (
                        <Grid container spacing={3}>
                            {campaigns.map((campaign) => (
                                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={campaign.id}>
                                    <CampaignCard
                                        campaign={campaign}
                                        onOpen={handleOpenCampaign}
                                        onDuplicate={handleDuplicateCampaign}
                                        onDelete={handleDeleteCampaign}
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
                title="Delete Campaign"
                message={`Are you sure you want to delete "${campaignToDelete?.name}"? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                severity="error"
                isLoading={isDeleting}
            />
        </Box>
    );
}
