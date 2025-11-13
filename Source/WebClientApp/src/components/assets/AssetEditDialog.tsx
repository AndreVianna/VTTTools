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
 *
 * Supports ObjectAsset and CreatureAsset with polymorphic property editing
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
  Typography,
  useTheme,
} from '@mui/material';
import type React from 'react';
import { useMemo, useState } from 'react';
import { useDeleteAssetMutation, useUpdateAssetMutation } from '@/services/assetsApi';
import {
  type Asset,
  AssetKind,
  type CreatureAsset,
  type CreatureData,
  type ObjectAsset,
  type ObjectData,
  type UpdateAssetRequest,
} from '@/types/domain';
import { AssetBasicFields, AssetResourceManager, CreaturePropertiesForm, ObjectPropertiesForm } from './forms';

// Type guards
function isObjectAsset(asset: Asset): asset is ObjectAsset {
  return asset.kind === AssetKind.Object && 'properties' in asset;
}

function isCreatureAsset(asset: Asset): asset is CreatureAsset {
  return asset.kind === AssetKind.Creature && 'properties' in asset;
}

export interface AssetEditDialogProps {
  open: boolean;
  asset: Asset;
  onClose: () => void;
}

function createEditData(asset: Asset) {
  return {
    name: asset.name,
    description: asset.description,
    tokens: asset.tokens || [],
    portraitId: asset.portrait?.id,
    isPublic: asset.isPublic,
    isPublished: asset.isPublished,
    size: asset.size,
    isMovable: (asset as ObjectAsset).isMovable,
    isOpaque: (asset as ObjectAsset).isOpaque,
    triggerEffectId: (asset as ObjectAsset).triggerEffectId,
    statBlockId: (asset as CreatureAsset).statBlockId,
    category: (asset as CreatureAsset).category,
    tokenStyle: (asset as CreatureAsset).tokenStyle,
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

  const objectData: ObjectData = {
    isMovable: editData.isMovable,
    isOpaque: editData.isOpaque,
    triggerEffectId: editData.triggerEffectId ?? undefined,
  };
  const creatureData: CreatureData = {
    category: editData.category,
    statBlockId: editData.statBlockId ?? undefined,
    tokenStyle: editData.tokenStyle ?? undefined,
  };

  const handleSave = async () => {
    try {
      const request: UpdateAssetRequest = {
        isPublic: editData.isPublic,
        isPublished: editData.isPublished,
        description: editData.description,
        size: editData.size,
        tokens: editData.tokens.map((t) => ({
          token: {
            id: t.token.id,
            type: t.token.type,
            path: t.token.path,
            metadata: t.token.metadata,
            tags: t.token.tags,
          },
          isDefault: t.isDefault,
        })),
        portraitId: editData.portraitId,
      };

      if (editData.name.trim()) {
        request.name = editData.name;
      }

      if (asset.kind === AssetKind.Object) {
        request.objectData = {
          isMovable: editData.isMovable,
          isOpaque: editData.isOpaque,
          triggerEffectId: editData.triggerEffectId ?? undefined,
        };
      } else if (asset.kind === AssetKind.Creature) {
        request.creatureData = {
          category: editData.category,
          statBlockId: editData.statBlockId ?? undefined,
          tokenStyle: editData.tokenStyle ?? undefined,
        };
      }

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
            tokens={editData.tokens}
            onTokensChange={(tokens) => updateModifiedFields({ tokens })}
            portraitId={editData.portraitId}
            onPortraitIdChange={(portraitId) => updateModifiedFields({ portraitId })}
            size={editData.size}
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
                        <Chip label={asset.kind} color='primary' size='small' />
                      </Box>
                    </Box>
                  </Stack>
                </AccordionDetails>
              </Accordion>

              {/* Accordion 2: Properties (collapsed) */}
              <Accordion
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
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant='subtitle1' fontWeight={600}>
                      Properties
                    </Typography>
                    <Chip label='Required' size='small' color='primary' />
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 3 }}>
                  {isObjectAsset(asset) && objectData && (
                    <ObjectPropertiesForm
                      objectData={objectData}
                      onChange={(data) =>
                        updateModifiedFields({
                          isMovable: data.isMovable,
                          isOpaque: data.isOpaque,
                          triggerEffectId: data.triggerEffectId,
                        })
                      }
                    />
                  )}

                  {isCreatureAsset(asset) && creatureData && (
                    <CreaturePropertiesForm
                      creatureData={creatureData}
                      onChange={(data) =>
                        updateModifiedFields({
                          category: data.category,
                          statBlockId: data.statBlockId,
                          tokenStyle: data.tokenStyle,
                        })
                      }
                    />
                  )}
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
                  <Chip label={asset.kind} color='primary' size='small' />
                </Box>
              </Box>

              {isObjectAsset(asset) && objectData && (
                <ObjectPropertiesForm
                  objectData={objectData}
                  onChange={(data) =>
                    updateModifiedFields({
                      isMovable: data.isMovable,
                      isOpaque: data.isOpaque,
                      triggerEffectId: data.triggerEffectId,
                    })
                  }
                />
              )}

              {isCreatureAsset(asset) && creatureData && (
                <CreaturePropertiesForm
                  creatureData={creatureData}
                  onChange={(data) =>
                    updateModifiedFields({
                      category: data.category,
                      statBlockId: data.statBlockId,
                      tokenStyle: data.tokenStyle,
                    })
                  }
                />
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
