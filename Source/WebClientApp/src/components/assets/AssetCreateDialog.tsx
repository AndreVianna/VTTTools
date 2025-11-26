// Phase 5 Step 6 - Asset Create Dialog
// Modal dialog for creating new assets with shared form components

import {
  Cancel as CancelIcon,
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import type React from 'react';
import { useState } from 'react';
import { useCreateAssetMutation } from '@/services/assetsApi';
import {
  AssetKind,
  type CreateAssetRequest,
  type NamedSize,
} from '@/types/domain';
import { AssetBasicFields, AssetResourceManager } from './forms';

export interface AssetCreateDialogProps {
  open: boolean;
  onClose: () => void;
  initialKind?: AssetKind; // Optional: Pre-select kind based on active tab in parent
  fixedKind?: AssetKind; // Optional: Lock kind (hide tabs) - used by virtual Add card
}

export const AssetCreateDialog: React.FC<AssetCreateDialogProps> = ({
  open,
  onClose,
  initialKind = AssetKind.Character,
  fixedKind,
}) => {
  const theme = useTheme();

  // Kind selection - use fixedKind if provided, otherwise initialKind
  const [selectedKind, setSelectedKind] = useState<AssetKind>(fixedKind ?? initialKind);

  // Basic fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [isPublished, setIsPublished] = useState(false);

  // Classification fields
  const [category, setCategory] = useState('');
  const [type, setType] = useState('');
  const [subtype, setSubtype] = useState('');

  // Image IDs
  const [portraitId, setPortraitId] = useState<string | undefined>(undefined);
  const [tokenId, setTokenId] = useState<string | undefined>(undefined);

  // Token size
  const [tokenSize] = useState<NamedSize>({
    width: 1,
    height: 1,
  });

  // RTK Query mutation
  const [createAsset, { isLoading: isSaving }] = useCreateAssetMutation();

  const handleSave = async () => {
    try {
      const request: CreateAssetRequest = {
        kind: selectedKind,
        category,
        type,
        subtype: subtype.trim() || undefined,
        name,
        description,
        portraitId,
        tokenSize,
        tokenId,
      };

      await createAsset(request).unwrap();
      onClose();
    } catch (_error) {
      console.error('Failed to create asset:', _error);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  const isFormValid = () => {
    if (name.trim().length < 3) return false;
    if (!category.trim()) return false;
    if (!type.trim()) return false;
    if (tokenSize.width <= 0 || tokenSize.height <= 0) return false;
    return true;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth>
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant='h6' component='span'>
          Create New Asset
        </Typography>
        <IconButton onClick={onClose} size='small' disabled={isSaving}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <AssetResourceManager
            portraitId={portraitId}
            tokenId={tokenId}
            onPortraitChange={setPortraitId}
            onTokenChange={setTokenId}
            tokenSize={tokenSize}
            readOnly={false}
          />
        </Box>

        {/* ACCORDION SECTION 1: Identity & Basics (Default Expanded, Required) */}
        <Accordion
          defaultExpanded
          disableGutters
          sx={{
            bgcolor: 'background.paper',
            boxShadow: 'none',
            '&:before': { display: 'none' },
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            mb: 2,
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
              borderBottom: '1px solid',
              borderColor: 'divider',
              minHeight: 48,
              '&.Mui-expanded': { minHeight: 48 },
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                flexGrow: 1,
              }}
            >
              <Typography variant='subtitle1' fontWeight={600}>
                Identity & Basics
              </Typography>
              <Chip label='Required' size='small' color='primary' />
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 3 }}>
            <Stack spacing={3}>
              {/* Kind Selector Tabs - only show if kind is not fixed */}
              {!fixedKind && (
                <Box>
                  <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 1 }}>
                    Asset Kind
                  </Typography>
                  <Tabs
                    value={selectedKind}
                    onChange={(_, newValue) => setSelectedKind(newValue)}
                    sx={{ borderBottom: 1, borderColor: 'divider' }}
                  >
                    <Tab label='Character' value={AssetKind.Character} />
                    <Tab label='Creature' value={AssetKind.Creature} />
                    <Tab label='Effect' value={AssetKind.Effect} />
                    <Tab label='Object' value={AssetKind.Object} />
                  </Tabs>
                </Box>
              )}

              {/* Basic Fields (Name & Description) */}
              <AssetBasicFields
                name={name}
                description={description}
                onNameChange={setName}
                onDescriptionChange={setDescription}
                isPublic={isPublic}
                isPublished={isPublished}
                onIsPublicChange={setIsPublic}
                onIsPublishedChange={setIsPublished}
              />

              {/* Classification Fields */}
              <TextField
                label='Category'
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                fullWidth
                required
                helperText='e.g., Humanoid, Beast, Furniture'
              />
              <TextField
                label='Type'
                value={type}
                onChange={(e) => setType(e.target.value)}
                fullWidth
                required
                helperText='e.g., Goblinoid, Mammal, Container'
              />
              <TextField
                label='Subtype'
                value={subtype}
                onChange={(e) => setSubtype(e.target.value)}
                fullWidth
                helperText='Optional: e.g., Hobgoblin, Wolf'
              />
            </Stack>
          </AccordionDetails>
        </Accordion>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button startIcon={<CancelIcon />} onClick={handleCancel} disabled={isSaving}>
          Cancel
        </Button>
        <Box sx={{ flexGrow: 1 }} />
        <Button
          variant='contained'
          startIcon={isSaving ? <CircularProgress size={16} /> : <SaveIcon />}
          onClick={handleSave}
          disabled={isSaving || !isFormValid()}
        >
          {isSaving ? 'Creating...' : 'Create Asset'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
