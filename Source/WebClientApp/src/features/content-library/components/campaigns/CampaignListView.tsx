import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useCloneCampaignMutation,
  useCreateCampaignMutation,
  useDeleteCampaignMutation,
  useGetCampaignsQuery,
} from '@/services/campaignsApi';
import type { CampaignCard as CampaignCardType } from '@/types/domain';
import { useDebounce } from '../../hooks';
import { CampaignCard } from './CampaignCard';

const DEFAULT_CAMPAIGN_NAME = 'Untitled Campaign';
const DEFAULT_CAMPAIGN_DESCRIPTION = 'A new campaign.';

export function CampaignListView() {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState('');
  const searchQuery = useDebounce(searchInput, 500);
  const [publishedFilter, setPublishedFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const { data: campaigns = [], isLoading, error } = useGetCampaignsQuery();
  const [createCampaign] = useCreateCampaignMutation();
  const [deleteCampaign] = useDeleteCampaignMutation();
  const [cloneCampaign] = useCloneCampaignMutation();

  const filteredCampaigns = campaigns.filter((campaign) => {
    if (searchQuery && !campaign.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (publishedFilter === 'published' && !campaign.isPublished) {
      return false;
    }
    if (publishedFilter === 'draft' && campaign.isPublished) {
      return false;
    }
    return true;
  });

  const handleCreateCampaign = async () => {
    setIsCreating(true);
    try {
      const campaign = await createCampaign({
        name: DEFAULT_CAMPAIGN_NAME,
        description: DEFAULT_CAMPAIGN_DESCRIPTION,
      }).unwrap();

      navigate(`/campaigns/${campaign.id}`);
    } catch (error) {
      console.error('Failed to create campaign:', error);
      setErrorMessage('Failed to create campaign. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleOpenCampaign = (campaignId: string) => {
    navigate(`/campaigns/${campaignId}`);
  };

  const handleDuplicateCampaign = async (campaignId: string) => {
    try {
      await cloneCampaign({ id: campaignId }).unwrap();
      setSuccessMessage('Campaign duplicated successfully');
    } catch (error) {
      console.error('Failed to duplicate campaign:', error);
      setErrorMessage('Failed to duplicate campaign. Please try again.');
    }
  };

  const handleDeleteCampaign = (campaignId: string) => {
    setCampaignToDelete(campaignId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (campaignToDelete) {
      try {
        await deleteCampaign(campaignToDelete).unwrap();
        setSuccessMessage('Campaign deleted successfully');
      } catch (error) {
        console.error('Failed to delete campaign:', error);
        setErrorMessage('Failed to delete campaign. Please try again.');
      }
    }
    setDeleteDialogOpen(false);
    setCampaignToDelete(null);
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setCampaignToDelete(null);
  };

  return (
    <Box id='campaign-list-container'>
      <Box
        id='campaign-list-header'
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography id='title-campaign-list' variant='h5' component='h2'>
          Campaigns
        </Typography>
        <Button
          id='btn-create-campaign'
          variant='contained'
          startIcon={<AddIcon />}
          onClick={handleCreateCampaign}
          disabled={isCreating}
          aria-label='Create new campaign'
        >
          {isCreating ? 'Creating...' : 'New Campaign'}
        </Button>
      </Box>

      <Box id='campaign-list-filters' sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          id='input-search-campaigns'
          placeholder='Search campaigns...'
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          size='small'
          sx={{ flex: 1, minWidth: 200 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <FormControl size='small' sx={{ minWidth: 150 }}>
          <InputLabel id='label-filter-published'>Status</InputLabel>
          <Select
            id='select-filter-published'
            labelId='label-filter-published'
            value={publishedFilter}
            label='Status'
            onChange={(e) => setPublishedFilter(e.target.value as 'all' | 'published' | 'draft')}
          >
            <MenuItem value='all'>All</MenuItem>
            <MenuItem value='published'>Published</MenuItem>
            <MenuItem value='draft'>Draft</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {isLoading && (
        <Typography
          id='message-campaign-list-loading'
          variant='body1'
          color='text.secondary'
          sx={{ textAlign: 'center', py: 8 }}
        >
          Loading campaigns...
        </Typography>
      )}

      {!isLoading && filteredCampaigns.length === 0 && searchInput === '' && (
        <Box id='campaign-list-empty-state' sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant='h6' gutterBottom>
            No campaigns yet
          </Typography>
          <Typography variant='body2' color='text.secondary' paragraph>
            Create your first campaign to get started
          </Typography>
          <Button variant='contained' startIcon={<AddIcon />} onClick={handleCreateCampaign}>
            Create Campaign
          </Button>
        </Box>
      )}

      {!isLoading && filteredCampaigns.length === 0 && searchInput !== '' && (
        <Box id='campaign-list-no-results' sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant='h6' gutterBottom>
            No campaigns found
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            Try adjusting your search or filters
          </Typography>
        </Box>
      )}

      {!isLoading && filteredCampaigns.length > 0 && (
        <Grid id='campaign-list-grid' container spacing={3}>
          {filteredCampaigns.map((campaign) => {
            const cardData: CampaignCardType = {
              id: campaign.id,
              name: campaign.name,
              description: campaign.description,
              isPublished: campaign.isPublished,
              isPublic: campaign.isPublic,
              adventureCount: campaign.adventures?.length ?? 0,
              backgroundId: campaign.background?.id ?? null,
            };
            return (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={campaign.id}>
                <CampaignCard
                  campaign={cardData}
                  onOpen={handleOpenCampaign}
                  onDuplicate={handleDuplicateCampaign}
                  onDelete={handleDeleteCampaign}
                />
              </Grid>
            );
          })}
        </Grid>
      )}

      <Dialog open={deleteDialogOpen} onClose={cancelDelete} aria-labelledby='dialog-title-delete-campaign'>
        <DialogTitle id='dialog-title-delete-campaign'>Delete Campaign</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this campaign? This will also delete all adventures within it. This action
            cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button id='btn-cancel-delete' onClick={cancelDelete}>
            Cancel
          </Button>
          <Button id='btn-confirm-delete' onClick={confirmDelete} color='error' variant='contained'>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!successMessage}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSuccessMessage(null)} severity='success'>
          {successMessage}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!errorMessage}
        autoHideDuration={6000}
        onClose={() => setErrorMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setErrorMessage(null)} severity='error'>
          {errorMessage}
        </Alert>
      </Snackbar>

      {error && (
        <Alert severity='error' sx={{ mt: 2 }}>
          Failed to load campaigns. Please try again.
        </Alert>
      )}
    </Box>
  );
}
