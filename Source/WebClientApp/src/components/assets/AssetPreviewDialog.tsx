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
    TextField,
    Typography,
    Box,
    Chip,
    Stack,
    IconButton,
    Divider,
    FormControlLabel,
    Checkbox,
    Alert,
    CircularProgress,
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
    ObjectAsset,
    CreatureAsset,
    UpdateAssetRequest
} from '@/types/domain';
import { useUpdateAssetMutation, useDeleteAssetMutation } from '@/services/assetsApi';

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
        setIsPublic(asset.isPublic);
        setIsPublished(asset.isPublished);
        setEditMode(false);
        setDeleteConfirmOpen(false);
    }, [asset]);

    const handleSave = async () => {
        try {
            const request: UpdateAssetRequest = {
                name,
                description,
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
        } catch (error) {
            console.error('Failed to update asset:', error);
        }
    };

    const handleDelete = async () => {
        try {
            await deleteAsset(asset.id).unwrap();
            onClose();
        } catch (error) {
            console.error('Failed to delete asset:', error);
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
                        <Typography variant="h6">
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
                        {asset.resource ? (
                            <img
                                src={`https://localhost:7174/api/resources/${asset.resource.id}`}
                                alt={asset.name}
                                style={{
                                    maxWidth: '100%',
                                    maxHeight: '100%',
                                    objectFit: 'contain'
                                }}
                            />
                        ) : (
                            <CategoryIcon sx={{ fontSize: 64, color: 'text.disabled' }} />
                        )}
                    </Box>

                    <Stack spacing={2}>
                        {/* Name */}
                        {editMode ? (
                            <TextField
                                label="Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                fullWidth
                                required
                            />
                        ) : (
                            <Box>
                                <Typography variant="caption" color="text.secondary">Name</Typography>
                                <Typography variant="h6">{asset.name}</Typography>
                            </Box>
                        )}

                        {/* Description */}
                        {editMode ? (
                            <TextField
                                label="Description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                multiline
                                rows={3}
                                fullWidth
                            />
                        ) : (
                            <Box>
                                <Typography variant="caption" color="text.secondary">Description</Typography>
                                <Typography>{asset.description}</Typography>
                            </Box>
                        )}

                        {/* Kind (Read-only) */}
                        <Box>
                            <Typography variant="caption" color="text.secondary">Kind</Typography>
                            <Box sx={{ mt: 0.5 }}>
                                <Chip label={asset.kind} color="primary" size="small" />
                            </Box>
                        </Box>

                        {/* Object-specific Properties */}
                        {asset.kind === AssetKind.Object && 'objectProps' in asset && (
                            <Box>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                                    Object Properties
                                </Typography>
                                {editMode ? (
                                    <Stack spacing={2}>
                                        <Box sx={{ display: 'flex', gap: 2 }}>
                                            <TextField
                                                label="Cell Width"
                                                type="number"
                                                value={cellWidth}
                                                onChange={(e) => setCellWidth(parseInt(e.target.value) || 1)}
                                                inputProps={{ min: 1 }}
                                                size="small"
                                            />
                                            <TextField
                                                label="Cell Height"
                                                type="number"
                                                value={cellHeight}
                                                onChange={(e) => setCellHeight(parseInt(e.target.value) || 1)}
                                                inputProps={{ min: 1 }}
                                                size="small"
                                            />
                                        </Box>
                                        <FormControlLabel
                                            control={<Checkbox checked={isMovable} onChange={(e) => setIsMovable(e.target.checked)} />}
                                            label="Movable"
                                        />
                                        <FormControlLabel
                                            control={<Checkbox checked={isOpaque} onChange={(e) => setIsOpaque(e.target.checked)} />}
                                            label="Opaque (blocks vision)"
                                        />
                                        <FormControlLabel
                                            control={<Checkbox checked={isVisible} onChange={(e) => setIsVisible(e.target.checked)} />}
                                            label="Visible to players"
                                        />
                                    </Stack>
                                ) : (
                                    <Stack spacing={1}>
                                        <Typography variant="body2">Size: {asset.objectProps.cellWidth}x{asset.objectProps.cellHeight} cells</Typography>
                                        <Typography variant="body2">Movable: {asset.objectProps.isMovable ? 'Yes' : 'No'}</Typography>
                                        <Typography variant="body2">Opaque: {asset.objectProps.isOpaque ? 'Yes' : 'No'}</Typography>
                                        <Typography variant="body2">Visible: {asset.objectProps.isVisible ? 'Yes' : 'No'}</Typography>
                                    </Stack>
                                )}
                            </Box>
                        )}

                        {/* Creature-specific Properties */}
                        {asset.kind === AssetKind.Creature && 'creatureProps' in asset && (
                            <Box>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                                    Creature Properties
                                </Typography>
                                {editMode ? (
                                    <Stack spacing={2}>
                                        <TextField
                                            label="Cell Size"
                                            type="number"
                                            value={cellSize}
                                            onChange={(e) => setCellSize(parseInt(e.target.value) || 1)}
                                            inputProps={{ min: 1 }}
                                            size="small"
                                            fullWidth
                                        />
                                        <Box>
                                            <Typography variant="body2" sx={{ mb: 1 }}>Category</Typography>
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                <Chip
                                                    label="Character"
                                                    onClick={() => setCreatureCategory(CreatureCategory.Character)}
                                                    color={creatureCategory === CreatureCategory.Character ? 'primary' : 'default'}
                                                    variant={creatureCategory === CreatureCategory.Character ? 'filled' : 'outlined'}
                                                />
                                                <Chip
                                                    label="Monster"
                                                    onClick={() => setCreatureCategory(CreatureCategory.Monster)}
                                                    color={creatureCategory === CreatureCategory.Monster ? 'primary' : 'default'}
                                                    variant={creatureCategory === CreatureCategory.Monster ? 'filled' : 'outlined'}
                                                />
                                            </Box>
                                        </Box>
                                    </Stack>
                                ) : (
                                    <Stack spacing={1}>
                                        <Typography variant="body2">Size: {asset.creatureProps.cellSize}x{asset.creatureProps.cellSize} cells</Typography>
                                        <Box>
                                            <Chip label={asset.creatureProps.category} size="small" />
                                        </Box>
                                    </Stack>
                                )}
                            </Box>
                        )}

                        {/* Publishing Status */}
                        <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                                Visibility
                            </Typography>
                            {editMode ? (
                                <Stack spacing={1}>
                                    <FormControlLabel
                                        control={<Checkbox checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />}
                                        label="Public (visible to all users)"
                                    />
                                    <FormControlLabel
                                        control={<Checkbox checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} />}
                                        label="Published (approved for use)"
                                    />
                                    {isPublished && !isPublic && (
                                        <Alert severity="warning" sx={{ mt: 1 }}>
                                            Published assets must be public
                                        </Alert>
                                    )}
                                </Stack>
                            ) : (
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Chip label={asset.isPublic ? 'Public' : 'Private'} size="small" />
                                    {asset.isPublished && <Chip label="Published" color="success" size="small" />}
                                </Box>
                            )}
                        </Box>

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
                        Are you sure you want to delete "{asset.name}"? This action cannot be undone.
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
