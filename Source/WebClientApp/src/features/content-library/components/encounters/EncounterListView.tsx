import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import {
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
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { type Encounter, type EncounterCard as EncounterCardType, GridType } from '@/types/domain';
import { EncounterCard } from './EncounterCard';

export function EncounterListView() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [gridFilter, setGridFilter] = useState<GridType | 'all'>('all');
  const [publishedFilter, setPublishedFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [encounterToDelete, setEncounterToDelete] = useState<string | null>(null);

  const encounters: Encounter[] = [];
  const isLoading = false;

  const handleCreateEncounter = () => {
    navigate('/encounters/new/edit');
  };

  const handleOpenEncounter = (encounterId: string) => {
    navigate(`/encounters/${encounterId}/edit`);
  };

  const handleDuplicateEncounter = (encounterId: string) => {
    console.warn('[Not implemented] Duplicate encounter:', encounterId);
  };

  const handleDeleteEncounter = (encounterId: string) => {
    setEncounterToDelete(encounterId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (encounterToDelete) {
      console.warn('[Not implemented] Delete encounter:', encounterToDelete);
    }
    setDeleteDialogOpen(false);
    setEncounterToDelete(null);
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setEncounterToDelete(null);
  };

  const filteredEncounters = encounters.filter((encounter) => {
    const matchesSearch = encounter.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGrid = gridFilter === 'all' || encounter.stage.grid.type === gridFilter;
    const matchesPublished =
      publishedFilter === 'all' ||
      (publishedFilter === 'published' && encounter.isPublished) ||
      (publishedFilter === 'draft' && !encounter.isPublished);

    return matchesSearch && matchesGrid && matchesPublished;
  });

  return (
    <Box id='encounter-list-container'>
      <Box
        id='encounter-list-header'
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography id='title-encounter-list' variant='h5' component='h2'>
          Encounters
        </Typography>
        <Button
          id='btn-create-encounter'
          variant='contained'
          startIcon={<AddIcon />}
          onClick={handleCreateEncounter}
          aria-label='Create new encounter'
        >
          New Encounter
        </Button>
      </Box>

      <Box id='encounter-list-filters' sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          id='input-search-encounters'
          placeholder='Search encounters...'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size='small'
          sx={{ flex: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <FormControl size='small' sx={{ minWidth: 150 }}>
          <InputLabel id='label-filter-grid'>Grid Type</InputLabel>
          <Select
            id='select-filter-grid'
            labelId='label-filter-grid'
            value={gridFilter}
            label='Grid Type'
            onChange={(e) => setGridFilter(e.target.value as GridType | 'all')}
          >
            <MenuItem value='all'>All Grids</MenuItem>
            <MenuItem value={GridType.Square}>Square</MenuItem>
            <MenuItem value={GridType.HexH}>Hex-H</MenuItem>
            <MenuItem value={GridType.HexV}>Hex-V</MenuItem>
            <MenuItem value={GridType.Isometric}>Isometric</MenuItem>
            <MenuItem value={GridType.NoGrid}>No Grid</MenuItem>
          </Select>
        </FormControl>
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
          id='message-encounter-list-loading'
          variant='body1'
          color='text.secondary'
          sx={{ textAlign: 'center', py: 8 }}
        >
          Loading encounters...
        </Typography>
      )}

      {!isLoading && filteredEncounters.length === 0 && searchQuery === '' && (
        <Box id='encounter-list-empty-state' sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant='h6' gutterBottom>
            No encounters yet
          </Typography>
          <Typography variant='body2' color='text.secondary' paragraph>
            Create your first encounter to get started
          </Typography>
          <Button variant='contained' startIcon={<AddIcon />} onClick={handleCreateEncounter}>
            Create Encounter
          </Button>
        </Box>
      )}

      {!isLoading && filteredEncounters.length === 0 && searchQuery !== '' && (
        <Box id='encounter-list-no-results' sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant='h6' gutterBottom>
            No encounters found
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            Try adjusting your search or filters
          </Typography>
        </Box>
      )}

      {!isLoading && filteredEncounters.length > 0 && (
        <Grid id='encounter-list-grid' container spacing={3}>
          {filteredEncounters.map((encounter) => {
            const cardData: EncounterCardType = {
              id: encounter.id,
              name: encounter.name,
              description: encounter.description,
              isPublished: encounter.isPublished,
              isPublic: encounter.isPublic,
              backgroundId: encounter.stage.background?.id ?? null,
            };
            return (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={encounter.id}>
                <EncounterCard
                  encounter={cardData}
                  onOpen={handleOpenEncounter}
                  onDuplicate={handleDuplicateEncounter}
                  onDelete={handleDeleteEncounter}
                />
              </Grid>
            );
          })}
        </Grid>
      )}

      <Dialog open={deleteDialogOpen} onClose={cancelDelete} aria-labelledby='dialog-title-delete-encounter'>
        <DialogTitle id='dialog-title-delete-encounter'>Delete Encounter</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this encounter? This action cannot be undone.
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
    </Box>
  );
}
