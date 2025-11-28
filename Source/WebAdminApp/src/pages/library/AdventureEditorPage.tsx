import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControlLabel,
  IconButton,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { SaveStatusIndicator, type SaveStatus } from '@vtttools/web-components';
import { libraryService, type LibraryContentResponse, type UpdateContentRequest } from '@services/libraryService';

export function AdventureEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [adventure, setAdventure] = useState<LibraryContentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');

  const loadAdventure = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      const data = await libraryService.getAdventureById(id);
      setAdventure(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load adventure');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadAdventure();
  }, [loadAdventure]);

  useEffect(() => {
    if (adventure && !isInitialized) {
      setName(adventure.name);
      setDescription(adventure.description);
      setIsPublished(adventure.isPublished);
      setIsPublic(adventure.isPublic);
      setIsInitialized(true);
    }
  }, [adventure, isInitialized]);

  const hasUnsavedChanges = useCallback(() => {
    if (!adventure || !isInitialized) return false;
    return (
      name !== adventure.name ||
      description !== adventure.description ||
      isPublished !== adventure.isPublished ||
      isPublic !== adventure.isPublic
    );
  }, [adventure, isInitialized, name, description, isPublished, isPublic]);

  const saveChanges = useCallback(
    async (overrides?: Partial<UpdateContentRequest>) => {
      if (!id || !adventure || !isInitialized) return;

      const currentData: UpdateContentRequest = {
        name,
        description,
        isPublished,
        isPublic,
        ...overrides,
      };

      const hasChanges =
        currentData.name !== adventure.name ||
        currentData.description !== adventure.description ||
        currentData.isPublished !== adventure.isPublished ||
        currentData.isPublic !== adventure.isPublic;

      if (!hasChanges) return;

      setSaveStatus('saving');
      try {
        const updated = await libraryService.updateAdventure(id, currentData);
        setAdventure(updated);
        setSaveStatus('saved');
      } catch (err) {
        console.error('Failed to save adventure:', err);
        setSaveStatus('error');
      }
    },
    [id, adventure, isInitialized, name, description, isPublished, isPublic]
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
    navigate('/admin/library');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !adventure) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || 'Adventure not found'}
        </Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={handleBack}>
          Back to Library
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <IconButton onClick={handleBack} aria-label="Back to library">
            <ArrowBackIcon />
          </IconButton>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" component="h1">
              Edit Adventure
            </Typography>
          </Box>
          <SaveStatusIndicator status={saveStatus} />
          <Button
            variant="contained"
            startIcon={saveStatus === 'saving' ? <CircularProgress size={16} /> : <SaveIcon />}
            onClick={() => saveChanges()}
            disabled={saveStatus === 'saving' || !hasUnsavedChanges()}
          >
            Save
          </Button>
        </Box>

        <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
          <Chip
            label={adventure.ownerName || 'Unknown Owner'}
            variant="outlined"
            size="small"
          />
          <Chip
            label={`ID: ${adventure.id.slice(0, 8)}...`}
            variant="outlined"
            size="small"
          />
        </Stack>

        <Stack spacing={3}>
          <TextField
            fullWidth
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => saveChanges()}
            required
          />

          <TextField
            fullWidth
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={() => saveChanges()}
            multiline
            rows={4}
          />

          <Box sx={{ display: 'flex', gap: 3 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={isPublished}
                  onChange={(e) => {
                    const newValue = e.target.checked;
                    setIsPublished(newValue);
                    saveChanges({ isPublished: newValue });
                  }}
                />
              }
              label="Published"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={isPublic}
                  onChange={(e) => {
                    const newValue = e.target.checked;
                    setIsPublic(newValue);
                    saveChanges({ isPublic: newValue });
                  }}
                />
              }
              label="Public"
            />
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
}
