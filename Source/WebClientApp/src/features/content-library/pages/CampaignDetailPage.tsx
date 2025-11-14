import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import {
  Alert,
  alpha,
  Box,
  Button,
  CircularProgress,
  FormControlLabel,
  Grid,
  IconButton,
  Paper,
  Switch,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ConfirmDialog } from '@/components/common';
import { getApiEndpoints } from '@/config/development';
import {
  useCloneAdventureMutation,
  useCreateAdventureMutation,
  useGetAdventuresQuery,
  useGetCampaignQuery,
  useRemoveAdventureMutation,
  useUpdateCampaignMutation,
} from '@/services/campaignsApi';
import { useUploadFileMutation } from '@/services/mediaApi';
import { AdventureStyle } from '@/types/domain';
import { AdventureCard } from '../components/adventures';
import type { SaveStatus } from '../hooks';

const CAMPAIGN_DEFAULT_BACKGROUND = '/assets/backgrounds/campaign.png';

export function CampaignDetailPage() {
  const { campaignId } = useParams<{ campaignId: string }>();
  const navigate = useNavigate();
  const theme = useTheme();

  const { data: campaign, isLoading: isLoadingCampaign, error: campaignError } = useGetCampaignQuery(campaignId ?? '');
  const { data: adventures = [], isLoading: isLoadingAdventures } = useGetAdventuresQuery(campaignId ?? '');
  const [updateCampaign] = useUpdateCampaignMutation();
  const [createAdventure] = useCreateAdventureMutation();
  const [uploadFile, { isLoading: isUploading }] = useUploadFileMutation();
  const [cloneAdventure] = useCloneAdventureMutation();
  const [removeAdventure, { isLoading: isDeleting }] = useRemoveAdventureMutation();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [adventureToDelete, setAdventureToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  useEffect(() => {
    if (campaign && !isInitialized) {
      queueMicrotask(() => {
        setName(campaign.name);
        setDescription(campaign.description);
        setIsPublished(campaign.isPublished);
        setIsInitialized(true);
      });
    }
  }, [campaign, isInitialized]);

  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');

  const hasUnsavedChanges = useCallback(() => {
    if (!campaign || !isInitialized) return false;
    return name !== campaign.name || description !== campaign.description || isPublished !== campaign.isPublished;
  }, [campaign, isInitialized, name, description, isPublished]);

  const saveChanges = useCallback(
    async (
      overrides?: Partial<{
        name: string;
        description: string;
        isPublished: boolean;
      }>,
    ) => {
      if (!campaignId || !campaign || !isInitialized) {
        return;
      }

      const currentData = {
        name,
        description,
        isPublished,
        ...overrides,
      };

      const hasChanges =
        currentData.name !== campaign.name ||
        currentData.description !== campaign.description ||
        currentData.isPublished !== campaign.isPublished;

      if (!hasChanges) {
        return;
      }

      setSaveStatus('saving');
      try {
        await updateCampaign({
          id: campaignId,
          request: currentData,
        }).unwrap();
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch (error) {
        console.error('Failed to save campaign changes:', error);
        setSaveStatus('error');
      }
    },
    [campaignId, campaign, isInitialized, name, description, isPublished, updateCampaign],
  );

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
    navigate('/content-library/campaigns');
  };

  const handleBackgroundUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !campaignId) return;

    try {
      setSaveStatus('saving');
      const result = await uploadFile({
        file,
        type: 'campaign',
        resource: 'background',
        entityId: campaignId,
      }).unwrap();

      await updateCampaign({
        id: campaignId,
        request: { backgroundId: result.id },
      }).unwrap();

      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Failed to upload campaign background:', error);
      setSaveStatus('error');
    }
  };

  const handleAddAdventure = async () => {
    if (campaignId) {
      try {
        const adventure = await createAdventure({
          campaignId,
          request: {
            name: 'New Adventure',
            description: '',
            style: AdventureStyle.Generic,
          },
        }).unwrap();
        navigate(`/adventures/${adventure.id}`);
      } catch (error) {
        console.error('Failed to create adventure:', error);
        setSaveStatus('error');
      }
    }
  };

  const handleOpenAdventure = (adventureId: string) => {
    navigate(`/adventures/${adventureId}`);
  };

  const handleDuplicateAdventure = async (adventureId: string) => {
    if (!campaignId) return;

    try {
      await cloneAdventure({
        campaignId,
        adventureId,
      }).unwrap();
    } catch (error) {
      console.error('Failed to duplicate adventure:', error);
      setSaveStatus('error');
    }
  };

  const handleDeleteAdventure = (adventureId: string) => {
    const adventure = adventures.find((a) => a.id === adventureId);
    if (!adventure) return;

    setAdventureToDelete({ id: adventureId, name: adventure.name });
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!adventureToDelete || !campaignId) return;

    try {
      await removeAdventure({
        campaignId,
        adventureId: adventureToDelete.id,
      }).unwrap();

      setDeleteDialogOpen(false);
      setAdventureToDelete(null);
    } catch (error) {
      console.error('Failed to delete adventure:', error);
      setSaveStatus('error');
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setAdventureToDelete(null);
  };

  if (isLoadingCampaign) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (campaignError || !campaign) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity='error'>Failed to load campaign. Please try again.</Alert>
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
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              color: 'text.secondary',
            }}
          >
            <CircularProgress size={16} />
            <Typography variant='caption'>Saving...</Typography>
          </Box>
        );
      case 'saved':
        return (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              color: 'success.main',
            }}
          >
            <CheckCircleIcon fontSize='small' />
            <Typography variant='caption'>Saved</Typography>
          </Box>
        );
      case 'error':
        return (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              color: 'error.main',
            }}
          >
            <Typography variant='caption'>Save failed</Typography>
          </Box>
        );
      default:
        return null;
    }
  };

  const apiEndpoints = getApiEndpoints();
  const backgroundUrl = campaign.background
    ? `${apiEndpoints.media}/${campaign.background.id}`
    : CAMPAIGN_DEFAULT_BACKGROUND;

  return (
    <Box
      id='campaign-detail-container'
      sx={{
        minHeight: '100vh',
        backgroundImage: backgroundUrl ? `url(${backgroundUrl})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'scroll',
        bgcolor: 'background.default',
        position: 'relative',
        '&::before': backgroundUrl
          ? {
              content: '""',
              position: 'absolute',
              inset: 0,
              background:
                theme.palette.mode === 'dark'
                  ? 'linear-gradient(to bottom, rgba(0, 0, 0, 0.3) 0%, transparent 40%)'
                  : 'linear-gradient(to bottom, rgba(255, 255, 255, 0.2) 0%, transparent 40%)',
              pointerEvents: 'none',
              zIndex: 0,
            }
          : {},
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
            <IconButton id='btn-back-to-library' onClick={handleBack} aria-label='Back to library'>
              <ArrowBackIcon />
            </IconButton>
            <Box sx={{ flex: 1 }}>
              <TextField
                id='input-campaign-name'
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => saveChanges()}
                variant='standard'
                fullWidth
                placeholder='Campaign Name'
                inputProps={{
                  style: { fontSize: '2rem', fontWeight: 500 },
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
                    component='label'
                    disabled={isUploading}
                    sx={{
                      position: 'absolute',
                      bottom: 8,
                      right: 8,
                      bgcolor: 'rgba(0, 0, 0, 0.6)',
                      color: 'white',
                      '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.8)' },
                      '&:disabled': { bgcolor: 'rgba(0, 0, 0, 0.3)' },
                    }}
                    aria-label='Change background image'
                  >
                    <PhotoCameraIcon fontSize='small' />
                    <input type='file' hidden accept='image/*' onChange={handleBackgroundUpload} />
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
                  <Button component='label' variant='outlined' startIcon={<PhotoCameraIcon />} disabled={isUploading}>
                    Upload
                    <input type='file' hidden accept='image/*' onChange={handleBackgroundUpload} />
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
                      size='small'
                    />
                  }
                  label='Published'
                />
              </Box>

              <TextField
                id='input-campaign-description'
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={() => saveChanges()}
                multiline
                rows={5}
                fullWidth
                placeholder='Campaign description...'
                variant='outlined'
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
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 3,
            }}
          >
            <Typography variant='h5' component='h2'>
              Adventures ({adventures.length})
            </Typography>
            <Button id='btn-add-adventure' variant='contained' startIcon={<AddIcon />} onClick={handleAddAdventure}>
              Add Adventure
            </Button>
          </Box>

          {isLoadingAdventures && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          )}

          {!isLoadingAdventures && adventures.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant='h6' gutterBottom>
                No adventures yet
              </Typography>
              <Typography variant='body2' color='text.secondary' paragraph>
                Add your first adventure to this campaign
              </Typography>
              <Button variant='contained' startIcon={<AddIcon />} onClick={handleAddAdventure}>
                Add Adventure
              </Button>
            </Box>
          )}

          {!isLoadingAdventures && adventures.length > 0 && (
            <Grid container spacing={3}>
              {adventures.map((adventure) => (
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={adventure.id}>
                  <AdventureCard
                    adventure={adventure}
                    onOpen={handleOpenAdventure}
                    onDuplicate={handleDuplicateAdventure}
                    onDelete={handleDeleteAdventure}
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
        title='Delete Adventure'
        message={`Are you sure you want to delete "${adventureToDelete?.name}"? This action cannot be undone.`}
        confirmText='Delete'
        cancelText='Cancel'
        severity='error'
        isLoading={isDeleting}
      />
    </Box>
  );
}
