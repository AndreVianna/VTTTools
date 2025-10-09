// GENERATED: 2025-10-08 by Claude Code Phase 5 Step 5
// EPIC: EPIC-001 Phase 5 - Asset Library UI
// LAYER: UI (Component)

/**
 * AssetPreviewDialog Component
 * Modal dialog for viewing and editing asset details
 * Supports ObjectAsset and CreatureAsset with polymorphic property editing
 */

import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Chip,
    Stack,
    IconButton,
    Divider,
    CircularProgress,
    Alert,
    useTheme
} from '@mui/material';
import {
    Close as CloseIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Save as SaveIcon,
    Cancel as CancelIcon,
    Category as CategoryIcon
} from '@mui/icons-material';
import {
    Asset,
    AssetKind,
    CreatureCategory,
    UpdateAssetRequest
} from '@/types/domain';
import { useUpdateAssetMutation, useDeleteAssetMutation } from '@/services/assetsApi';
import {
    AssetBasicFields,
    ObjectPropertiesForm,
    CreaturePropertiesForm,
    AssetVisibilityFields,
    AssetResourceManager
} from './forms';
import { getDefaultPortraitResource, getResourceUrl } from '@/utils/assetHelpers';
import { AssetResource } from '@/types/domain';

export interface AssetPreviewDialogProps {
    open: boolean;
    asset: Asset;
    onClose: () => void;
}

export const AssetPreviewDialog: React.FC<AssetPreviewDialogProps> = ({
    open,
    asset,
    onClose
}) => {
    const theme = useTheme();
    const [editMode, setEditMode] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

    // Editable fields
    const [name, setName] = useState(asset.name);
    const [description, setDescription] = useState(asset.description);
    const [resources, setResources] = useState<AssetResource[]>([]);
    const [isPublic, setIsPublic] = useState(asset.isPublic);
    const [isPublished, setIsPublished] = useState(asset.isPublished);

    // Object-specific properties
    const [cellWidth, setCellWidth] = useState(
        asset.kind === AssetKind.Object && 'objectProps' in asset ? asset.objectProps.cellWidth : 1
    );
    const [cellHeight, setCellHeight] = useState(
        asset.kind === AssetKind.Object && 'objectProps' in asset ? asset.objectProps.cellHeight : 1
    );
    const [isMovable, setIsMovable] = useState(
        asset.kind === AssetKind.Object && 'objectProps' in asset ? asset.objectProps.isMovable : true
    );
    const [isOpaque, setIsOpaque] = useState(
        asset.kind === AssetKind.Object && 'objectProps' in asset ? asset.objectProps.isOpaque : false
    );
    const [isVisible, setIsVisible] = useState(
        asset.kind === AssetKind.Object && 'objectProps' in asset ? asset.objectProps.isVisible : true
    );

    // Creature-specific properties
    const [cellSize, setCellSize] = useState(
        asset.kind === AssetKind.Creature && 'creatureProps' in asset ? asset.creatureProps.cellSize : 1
    );
    const [creatureCategory, setCreatureCategory] = useState<CreatureCategory>(
        asset.kind === AssetKind.Creature && 'creatureProps' in asset
            ? asset.creatureProps.category
            : CreatureCategory.Character
    );

    // RTK Query mutations
    const [updateAsset, { isLoading: isSaving }] = useUpdateAssetMutation();
    const [deleteAsset, { isLoading: isDeleting }] = useDeleteAssetMutation();

    // Reset form when asset changes
    useEffect(() => {
        setName(asset.name);
        setDescription(asset.description);
        setResources([...asset.resources]); // Clone the array
        setIsPublic(asset.isPublic);
        setIsPublished(asset.isPublished);

        // Reset object-specific properties
        if (asset.kind === AssetKind.Object && 'objectProps' in asset) {
            setCellWidth(asset.objectProps.cellWidth);
            setCellHeight(asset.objectProps.cellHeight);
            setIsMovable(asset.objectProps.isMovable);
            setIsOpaque(asset.objectProps.isOpaque);
            setIsVisible(asset.objectProps.isVisible);
        }

        // Reset creature-specific properties
        if (asset.kind === AssetKind.Creature && 'creatureProps' in asset) {
            setCellSize(asset.creatureProps.cellSize);
            setCreatureCategory(asset.creatureProps.category);
        }

        setEditMode(false);
        setDeleteConfirmOpen(false);
    }, [asset]);

    const handleSave = async () => {
        try {
            const request: UpdateAssetRequest = {
                name,
                description,
                resources,
                isPublic,
                isPublished
            };

            // Add kind-specific properties
            if (asset.kind === AssetKind.Object) {
                request.objectProps = {
                    cellWidth,
                    cellHeight,
                    isMovable,
                    isOpaque,
                    isVisible
                };
            } else if (asset.kind === AssetKind.Creature) {
                request.creatureProps = {
                    cellSize,
                    category: creatureCategory
                };
            }

            await updateAsset({ id: asset.id, request }).unwrap();
            setEditMode(false);
            onClose();
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
        // Reset to original values
        setName(asset.name);
        setDescription(asset.description);
        setIsPublic(asset.isPublic);
        setIsPublished(asset.isPublished);
        setEditMode(false);
    };

    return (
        <>
            <Dialog
                open={open && !deleteConfirmOpen}
                onClose={onClose}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CategoryIcon />
                        <Typography variant="h6" component="span">
                            {editMode ? 'Edit Asset' : 'Asset Details'}
                        </Typography>
                    </Box>
                    <IconButton onClick={onClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <Divider />

                <DialogContent>
                    {/* Asset Image Preview */}
                    <Box
                        sx={{
                            width: '100%',
                            height: 200,
                            bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.200',
                            borderRadius: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mb: 3
                        }}
                    >
                        {(() => {
                            const portraitResource = getDefaultPortraitResource(asset);
                            return portraitResource ? (
                                <img
                                    src={getResourceUrl(portraitResource.resourceId)}
                                    alt={asset.name}
                                    style={{
                                        maxWidth: '100%',
                                        maxHeight: '100%',
                                        objectFit: 'contain'
                                    }}
                                />
                            ) : (
                                <CategoryIcon sx={{ fontSize: 64, color: 'text.disabled' }} />
                            );
                        })()}
                    </Box>

                    <Stack spacing={2}>
                        {/* Resource Manager - TOP PRIORITY */}
                        <AssetResourceManager
                            resources={resources}
                            onResourcesChange={setResources}
                            readOnly={!editMode}
                        />

                        {/* Basic Fields (Name & Description) */}
                        <AssetBasicFields
                            name={name}
                            description={description}
                            onNameChange={setName}
                            onDescriptionChange={setDescription}
                            readOnly={!editMode}
                        />

                        {/* Kind (Read-only) */}
                        <Box>
                            <Typography variant="caption" color="text.secondary">Kind</Typography>
                            <Box sx={{ mt: 0.5 }}>
                                <Chip label={asset.kind} color="primary" size="small" />
                            </Box>
                        </Box>

                        {/* Object-specific Properties */}
                        {asset.kind === AssetKind.Object && 'objectProps' in asset && (
                            <ObjectPropertiesForm
                                cellWidth={cellWidth}
                                cellHeight={cellHeight}
                                isMovable={isMovable}
                                isOpaque={isOpaque}
                                isVisible={isVisible}
                                onCellWidthChange={setCellWidth}
                                onCellHeightChange={setCellHeight}
                                onIsMovableChange={setIsMovable}
                                onIsOpaqueChange={setIsOpaque}
                                onIsVisibleChange={setIsVisible}
                                readOnly={!editMode}
                            />
                        )}

                        {/* Creature-specific Properties */}
                        {asset.kind === AssetKind.Creature && 'creatureProps' in asset && (
                            <CreaturePropertiesForm
                                cellSize={cellSize}
                                category={creatureCategory}
                                onCellSizeChange={setCellSize}
                                onCategoryChange={setCreatureCategory}
                                readOnly={!editMode}
                            />
                        )}

                        {/* Visibility Fields */}
                        <AssetVisibilityFields
                            isPublic={isPublic}
                            isPublished={isPublished}
                            onIsPublicChange={setIsPublic}
                            onIsPublishedChange={setIsPublished}
                            readOnly={!editMode}
                        />

                        {/* Metadata */}
                        {!editMode && (
                            <Box>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                    Metadata
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Created: {new Date(asset.createdAt).toLocaleDateString()}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Updated: {new Date(asset.updatedAt).toLocaleDateString()}
                                </Typography>
                            </Box>
                        )}
                    </Stack>
                </DialogContent>

                <Divider />

                <DialogActions sx={{ px: 3, py: 2 }}>
                    {!editMode ? (
                        <>
                            <Button
                                startIcon={<DeleteIcon />}
                                color="error"
                                onClick={() => setDeleteConfirmOpen(true)}
                            >
                                Delete
                            </Button>
                            <Box sx={{ flexGrow: 1 }} />
                            <Button onClick={onClose}>
                                Close
                            </Button>
                            <Button
                                variant="contained"
                                startIcon={<EditIcon />}
                                onClick={() => setEditMode(true)}
                            >
                                Edit
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                startIcon={<CancelIcon />}
                                onClick={handleCancel}
                                disabled={isSaving}
                            >
                                Cancel
                            </Button>
                            <Box sx={{ flexGrow: 1 }} />
                            <Button
                                variant="contained"
                                startIcon={isSaving ? <CircularProgress size={16} /> : <SaveIcon />}
                                onClick={handleSave}
                                disabled={isSaving || !name.trim()}
                            >
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </>
                    )}
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteConfirmOpen}
                onClose={() => setDeleteConfirmOpen(false)}
                maxWidth="xs"
            >
                <DialogTitle>Delete Asset?</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete &quot;{asset.name}&quot;? This action cannot be undone.
                    </Typography>
                    {asset.isPublished && (
                        <Alert severity="warning" sx={{ mt: 2 }}>
                            This asset is published and may be in use in scenes.
                        </Alert>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteConfirmOpen(false)} disabled={isDeleting}>
                        Cancel
                    </Button>
                    <Button
                        color="error"
                        variant="contained"
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
