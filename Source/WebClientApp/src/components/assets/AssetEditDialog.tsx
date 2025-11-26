// GENERATED: 2025-10-08 by Claude Code Phase 5 Step 5
// WORLD: EPIC-001 Phase 5 - Asset Library UI
// LAYER: UI (Component)

/**
 * AssetEditDialog - Multi-modal dialog for viewing, editing, and deleting assets
 *
 * Modes:
 * - View Mode (default): Read-only display of asset details with metadata
 * - Edit Mode: Editable forms for updating asset properties
 * - Delete Mode: Confirmation dialog for asset deletion
 */

import {
  Cancel as CancelIcon,
  Category as CategoryIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  ExpandMore as ExpandMoreIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
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
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import type React from 'react';
import { useMemo, useState } from 'react';
import { useDeleteAssetMutation, useUpdateAssetMutation } from '@/services/assetsApi';
import {
  type Asset,
  type UpdateAssetRequest,
} from '@/types/domain';
import { AssetBasicFields, AssetResourceManager } from './forms';

export interface AssetEditDialogProps {
  open: boolean;
  asset: Asset;
  onClose: () => void;
}

function createEditData(asset: Asset) {
  return {
    name: asset.name,
    description: asset.description,
    category: asset.classification.category,
    type: asset.classification.type,
    subtype: asset.classification.subtype || '',
    portraitId: asset.portrait?.id,
    tokenId: asset.tokens[0]?.id,
    isPublic: asset.isPublic,
    isPublished: asset.isPublished,
    tokenSize: asset.tokenSize,
  };
}

export const AssetEditDialog: React.FC<AssetEditDialogProps> = ({ open, asset, onClose }) => {
  const theme = useTheme();
  const [editMode, setEditMode] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [modifiedFieldsByAssetId, setModifiedFieldsByAssetId] = useState<
    Record<string, Partial<ReturnType<typeof createEditData>>>
  >({});

  const [updateAsset, { isLoading: isSaving }] = useUpdateAssetMutation();
  const [deleteAsset, { isLoading: isDeleting }] = useDeleteAssetMutation();

  const modifiedFields = useMemo(() => modifiedFieldsByAssetId[asset.id] || {}, [modifiedFieldsByAssetId, asset.id]);

  const updateModifiedFields = (updates: Partial<ReturnType<typeof createEditData>>) => {
    setModifiedFieldsByAssetId((prev) => ({
      ...prev,
      [asset.id]: { ...modifiedFields, ...updates },
    }));
  };

  const editData = { ...createEditData(asset), ...modifiedFields };

  const handleSave = async () => {
    try {
      const request: UpdateAssetRequest = {
        name: editData.name.trim() || undefined,
        description: editData.description,
        category: editData.category,
        type: editData.type,
        subtype: editData.subtype.trim() || null,
        portraitId: editData.portraitId,
        tokenSize: editData.tokenSize,
        isPublic: editData.isPublic,
        isPublished: editData.isPublished,
      };

      await updateAsset({ id: asset.id, request }).unwrap();
      setEditMode(false);
    } catch (_error) {
      console.error('Failed to update asset:', _error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteAsset(asset.id).unwrap();
      onClose();
    } catch (_error) {
      console.error('Failed to delete asset:', _error);
    }
  };

  const handleCancel = () => {
    setModifiedFieldsByAssetId((prev) => {
      const updated = { ...prev };
      delete updated[asset.id];
      return updated;
    });
    setEditMode(false);
  };

  return (
    <>
      <Dialog open={open && !deleteConfirmOpen} onClose={onClose} maxWidth='md' fullWidth>
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CategoryIcon />
            <Typography variant='h6' component='span'>
              {editMode ? 'Edit Asset' : 'Asset Details'}
            </Typography>
          </Box>
          <IconButton onClick={onClose} size='small'>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <Divider />

        <DialogContent>
          <AssetResourceManager
            entityId={asset.id}
            portraitId={editData.portraitId}
            tokenId={editData.tokenId}
            onPortraitChange={(portraitId) => updateModifiedFields({ portraitId })}
            onTokenChange={(tokenId) => updateModifiedFields({ tokenId })}
            tokenSize={editData.tokenSize}
            readOnly={!editMode}
          />

          {editMode ? (
            <>
              {/* Accordion 1: Identity & Basics (default expanded) */}
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
                  mt: 2,
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
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant='subtitle1' fontWeight={600}>
                      Identity & Basics
                    </Typography>
                    <Chip label='Required' size='small' color='primary' />
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 3 }}>
                  <Stack spacing={2}>
                    <AssetBasicFields
                      name={editData.name}
                      description={editData.description}
                      onNameChange={(name) => updateModifiedFields({ name })}
                      onDescriptionChange={(description) => updateModifiedFields({ description })}
                      isPublic={editData.isPublic}
                      isPublished={editData.isPublished}
                      onIsPublicChange={(isPublic) => updateModifiedFields({ isPublic })}
                      onIsPublishedChange={(isPublished) => updateModifiedFields({ isPublished })}
                      readOnly={false}
                    />

                    {/* Kind (Read-only) */}
                    <Box>
                      <Typography variant='caption' color='text.secondary'>
                        Kind
                      </Typography>
                      <Box sx={{ mt: 0.5 }}>
                        <Chip label={asset.classification.kind} color='primary' size='small' />
                      </Box>
                    </Box>

                    {/* Classification Fields */}
                    <TextField
                      label='Category'
                      value={editData.category}
                      onChange={(e) => updateModifiedFields({ category: e.target.value })}
                      fullWidth
                      required
                    />
                    <TextField
                      label='Type'
                      value={editData.type}
                      onChange={(e) => updateModifiedFields({ type: e.target.value })}
                      fullWidth
                      required
                    />
                    <TextField
                      label='Subtype'
                      value={editData.subtype}
                      onChange={(e) => updateModifiedFields({ subtype: e.target.value })}
                      fullWidth
                    />
                  </Stack>
                </AccordionDetails>
              </Accordion>
            </>
          ) : (
            <Stack spacing={2} sx={{ mt: 2 }}>
              <AssetBasicFields
                name={editData.name}
                description={editData.description}
                onNameChange={(name) => updateModifiedFields({ name })}
                onDescriptionChange={(description) => updateModifiedFields({ description })}
                isPublic={editData.isPublic}
                isPublished={editData.isPublished}
                onIsPublicChange={(isPublic) => updateModifiedFields({ isPublic })}
                onIsPublishedChange={(isPublished) => updateModifiedFields({ isPublished })}
                readOnly={true}
              />

              {/* Kind (Read-only) */}
              <Box>
                <Typography variant='caption' color='text.secondary'>
                  Kind
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  <Chip label={asset.classification.kind} color='primary' size='small' />
                </Box>
              </Box>

              {/* Classification (Read-only) */}
              <Box>
                <Typography variant='caption' color='text.secondary'>
                  Category
                </Typography>
                <Typography variant='body2'>{asset.classification.category}</Typography>
              </Box>
              <Box>
                <Typography variant='caption' color='text.secondary'>
                  Type
                </Typography>
                <Typography variant='body2'>{asset.classification.type}</Typography>
              </Box>
              {asset.classification.subtype && (
                <Box>
                  <Typography variant='caption' color='text.secondary'>
                    Subtype
                  </Typography>
                  <Typography variant='body2'>{asset.classification.subtype}</Typography>
                </Box>
              )}

              {/* Metadata */}
              <Box>
                <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 0.5 }}>
                  Metadata
                </Typography>
              </Box>
            </Stack>
          )}
        </DialogContent>

        <Divider />

        <DialogActions sx={{ px: 3, py: 2 }}>
          {!editMode ? (
            <>
              <Button startIcon={<DeleteIcon />} color='error' onClick={() => setDeleteConfirmOpen(true)}>
                Delete
              </Button>
              <Box sx={{ flexGrow: 1 }} />
              <Button onClick={onClose}>Close</Button>
              <Button variant='contained' startIcon={<EditIcon />} onClick={() => setEditMode(true)}>
                Edit
              </Button>
            </>
          ) : (
            <>
              <Button startIcon={<CancelIcon />} onClick={handleCancel} disabled={isSaving}>
                Cancel
              </Button>
              <Box sx={{ flexGrow: 1 }} />
              <Button
                variant='contained'
                startIcon={isSaving ? <CircularProgress size={16} /> : <SaveIcon />}
                onClick={handleSave}
                disabled={isSaving || !editData.name.trim()}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)} maxWidth='xs'>
        <DialogTitle>Delete Asset?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete &quot;{asset.name}&quot;? This action cannot be undone.
          </Typography>
          {asset.isPublished && (
            <Alert severity='warning' sx={{ mt: 2 }}>
              This asset is published and may be in use in encounters.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            color='error'
            variant='contained'
            onClick={handleDelete}
            disabled={isDeleting}
            startIcon={isDeleting ? <CircularProgress size={16} /> : <DeleteIcon />}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
