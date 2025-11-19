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
  Typography,
  useTheme,
} from '@mui/material';
import type React from 'react';
import { useState } from 'react';
import { useCreateAssetMutation } from '@/services/assetsApi';
import {
  AssetKind,
  type CharacterData,
  type CreateAssetRequest,
  type MonsterData,
  type NamedSize,
  type ObjectData,
} from '@/types/domain';
import { AssetBasicFields, AssetResourceManager, CharacterPropertiesForm, MonsterPropertiesForm, ObjectPropertiesForm } from './forms';

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

  // Image IDs for the 4 image types
  const [portraitId, setPortraitId] = useState<string | undefined>(undefined);
  const [topDownId, setTopDownId] = useState<string | undefined>(undefined);
  const [miniatureId, setMiniatureId] = useState<string | undefined>(undefined);
  const [photoId, setPhotoId] = useState<string | undefined>(undefined);

  // Visibility fields
  const [isPublic, setIsPublic] = useState(false);
  const [isPublished, setIsPublished] = useState(false);

  // Size moved to root level - shared between all asset types
  const [size, setSize] = useState<NamedSize>({
    width: 1,
    height: 1,
    isSquare: true,
  });

  // Object-specific properties
  const [objectData, setObjectData] = useState<ObjectData>({
    isMovable: true,
    isOpaque: false,
  });

  // Monster-specific properties (monsters/NPCs)
  const [monsterData, setMonsterData] = useState<MonsterData>({});

  // Character-specific properties (player characters)
  const [characterData, setCharacterData] = useState<CharacterData>({});

  // RTK Query mutation
  const [createAsset, { isLoading: isSaving }] = useCreateAssetMutation();

  const handleSave = async () => {
    try {
      const request: CreateAssetRequest = {
        kind: selectedKind,
        name,
        description,
        portraitId,
        topDownId,
        miniatureId,
        photoId,
        size,
        isPublic,
        isPublished,
      };

      if (selectedKind === AssetKind.Object) {
        request.objectData = objectData;
      } else if (selectedKind === AssetKind.Monster) {
        request.monsterData = monsterData;
      } else if (selectedKind === AssetKind.Character) {
        request.characterData = characterData;
      }

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

    if (isPublished && !isPublic) return false;

    if (size.width <= 0 || size.height <= 0) return false;

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
            assetKind={selectedKind}
            portraitId={portraitId}
            topDownId={topDownId}
            miniatureId={miniatureId}
            photoId={photoId}
            onPortraitIdChange={setPortraitId}
            onTopDownIdChange={setTopDownId}
            onMiniatureIdChange={setMiniatureId}
            onPhotoIdChange={setPhotoId}
            size={size}
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
                    <Tab label='Monster' value={AssetKind.Monster} />
                    <Tab label='Object' value={AssetKind.Object} />
                  </Tabs>
                </Box>
              )}

              {/* Basic Fields (Name, Description & Visibility) */}
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
            </Stack>
          </AccordionDetails>
        </Accordion>

        {/* ACCORDION SECTION 2: Properties (Collapsed, Required, Flexible) */}
        <Accordion
          disableGutters
          sx={{
            bgcolor: 'background.paper',
            boxShadow: 'none',
            '&:before': { display: 'none' },
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
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
                Properties
              </Typography>
              <Chip label='Required' size='small' />
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 3 }}>
            <Stack spacing={3}>
              {/* Size field - now at root level, common to all asset types */}
              <Box>
                <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 1 }}>
                  Size (Grid Cells)
                </Typography>
                <Stack direction='row' spacing={2}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant='caption'>Width</Typography>
                    <input
                      type='number'
                      value={size.width}
                      onChange={(e) => setSize({ ...size, width: Number(e.target.value) })}
                      min={0.5}
                      step={0.5}
                      style={{ width: '100%', padding: '8px' }}
                    />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant='caption'>Height</Typography>
                    <input
                      type='number'
                      value={size.height}
                      onChange={(e) => setSize({ ...size, height: Number(e.target.value) })}
                      min={0.5}
                      step={0.5}
                      style={{ width: '100%', padding: '8px' }}
                    />
                  </Box>
                </Stack>
              </Box>

              {/* Kind-Specific Properties (without size) */}
              {selectedKind === AssetKind.Object && (
                <ObjectPropertiesForm objectData={objectData} onChange={setObjectData} />
              )}

              {selectedKind === AssetKind.Monster && (
                <MonsterPropertiesForm monsterData={monsterData} onChange={setMonsterData} />
              )}

              {selectedKind === AssetKind.Character && (
                <CharacterPropertiesForm characterData={characterData} onChange={setCharacterData} />
              )}
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
