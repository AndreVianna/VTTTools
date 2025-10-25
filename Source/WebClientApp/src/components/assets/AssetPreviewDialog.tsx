// GENERATED: 2025-10-08 by Claude Code Phase 5 Step 5
// EPIC: EPIC-001 Phase 5 - Asset Library UI
// LAYER: UI (Component)

/**
 * AssetPreviewDialog Component
 * Modal dialog for viewing and editing asset details
 * Supports ObjectAsset and CreatureAsset with polymorphic property editing
 */

import React, { useState, useEffect, useRef } from 'react';
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
    useTheme,
    Accordion,
    AccordionSummary,
    AccordionDetails
} from '@mui/material';
import {
    Close as CloseIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Save as SaveIcon,
    Cancel as CancelIcon,
    Category as CategoryIcon,
    ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import {
    Asset,
    AssetKind,
    CreatureCategory,
    UpdateAssetRequest,
    NamedSize,
    ObjectAsset,
    CreatureAsset
} from '@/types/domain';
import { useUpdateAssetMutation, useDeleteAssetMutation } from '@/services/assetsApi';
import {
    AssetBasicFields,
    ObjectPropertiesForm,
    CreaturePropertiesForm,
    AssetResourceManager
} from './forms';
import { AssetResource } from '@/types/domain';

// Type guards
function isObjectAsset(asset: Asset): asset is ObjectAsset {
    return asset.kind === AssetKind.Object && 'properties' in asset;
}

function isCreatureAsset(asset: Asset): asset is CreatureAsset {
    return asset.kind === AssetKind.Creature && 'properties' in asset;
}

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
    const [resources, setResources] = useState<AssetResource[]>(asset.resources);
    const [isPublic, setIsPublic] = useState(asset.isPublic);
    const [isPublished, setIsPublished] = useState(asset.isPublished);

    // Size state (shared by both Object and Creature)
    const [size, setSize] = useState<NamedSize>(() => {
        if (isObjectAsset(asset)) {
            return asset.properties.size;
        } else if (isCreatureAsset(asset)) {
            return asset.properties.size;
        }
        return { width: 1, height: 1, isSquare: true };
    });

    // Object-specific properties
    const [isMovable, setIsMovable] = useState(
        isObjectAsset(asset) ? asset.properties.isMovable : true
    );
    const [isOpaque, setIsOpaque] = useState(
        isObjectAsset(asset) ? asset.properties.isOpaque : false
    );

    // Creature-specific properties
    const [creatureCategory, setCreatureCategory] = useState<CreatureCategory>(
        isCreatureAsset(asset)
            ? asset.properties.category
            : CreatureCategory.Character
    );

    // RTK Query mutations
    const [updateAsset, { isLoading: isSaving }] = useUpdateAssetMutation();
    const [deleteAsset, { isLoading: isDeleting }] = useDeleteAssetMutation();

    // Track previous asset ID to detect asset switches
    const prevAssetIdRef = useRef<string | null>(null);

    // Reset state only when dialog opens or when switching to a different asset
    // Do NOT reset when asset updates due to save operation (asset.updatedAt changes)
    useEffect(() => {
        const isDifferentAsset = prevAssetIdRef.current !== asset.id;

        if (open && (isDifferentAsset || prevAssetIdRef.current === null)) {
             
            setName(asset.name);
             
            setDescription(asset.description);
             
            setResources(asset.resources);
             
            setIsPublic(asset.isPublic);
             
            setIsPublished(asset.isPublished);
             
            setEditMode(false);

            // Reset size and kind-specific props
            if (isObjectAsset(asset)) {
                 
                setSize(asset.properties.size);
                 
                setIsMovable(asset.properties.isMovable);
                 
                setIsOpaque(asset.properties.isOpaque);
            } else if (isCreatureAsset(asset)) {
                 
                setSize(asset.properties.size);
                 
                setCreatureCategory(asset.properties.category);
            }

            prevAssetIdRef.current = asset.id;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, asset.id]);

    const handleSave = async () => {
        try {
            const request: UpdateAssetRequest = {
                isPublic,
                isPublished
            };

            if (name.trim()) {
                request.name = name;
            }

            request.description = description;
            request.resources = resources.map(r => ({ resourceId: r.resourceId, role: r.role }));

            if (asset.kind === AssetKind.Object) {
                request.objectProps = {
                    size,
                    isMovable,
                    isOpaque
                };
            } else if (asset.kind === AssetKind.Creature) {
                request.creatureProps = {
                    size,
                    category: creatureCategory
                };
            }

            console.log('[AssetPreviewDialog] handleSave - Sending request:', {
                assetId: asset.id,
                request,
                currentSize: size
            });

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
        // Reset to original values
        setName(asset.name);
        setDescription(asset.description);
        setResources(asset.resources);
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
                    {/* Resource Manager - Always visible at top */}
                    <AssetResourceManager
                        resources={resources}
                        onResourcesChange={setResources}
                        size={size}
                        readOnly={!editMode}
                        entityId={asset.id}
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
                                    mt: 2
                                }}
                            >
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                    sx={{
                                        bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                                        borderBottom: '1px solid',
                                        borderColor: 'divider',
                                        minHeight: 48,
                                        '&.Mui-expanded': { minHeight: 48 }
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography variant="subtitle1" fontWeight={600}>Identity & Basics</Typography>
                                        <Chip label="Required" size="small" color="primary" />
                                    </Box>
                                </AccordionSummary>
                                <AccordionDetails sx={{ p: 3 }}>
                                    <Stack spacing={2}>
                                        <AssetBasicFields
                                            name={name}
                                            description={description}
                                            onNameChange={setName}
                                            onDescriptionChange={setDescription}
                                            isPublic={isPublic}
                                            isPublished={isPublished}
                                            onIsPublicChange={setIsPublic}
                                            onIsPublishedChange={setIsPublished}
                                            readOnly={false}
                                        />
                                        {/* Kind (Read-only) */}
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">Kind</Typography>
                                            <Box sx={{ mt: 0.5 }}>
                                                <Chip label={asset.kind} color="primary" size="small" />
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
                                    mb: 2
                                }}
                            >
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                    sx={{
                                        bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                                        borderBottom: '1px solid',
                                        borderColor: 'divider',
                                        minHeight: 48,
                                        '&.Mui-expanded': { minHeight: 48 }
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography variant="subtitle1" fontWeight={600}>Properties</Typography>
                                        <Chip label="Required" size="small" color="primary" />
                                    </Box>
                                </AccordionSummary>
                                <AccordionDetails sx={{ p: 3 }}>
                                    {(() => {
                                        console.log('[AssetPreviewDialog] Properties accordion expanded - Asset check:', {
                                            assetKind: asset.kind,
                                            isObjectAsset: isObjectAsset(asset),
                                            isCreatureAsset: isCreatureAsset(asset),
                                            hasProperties: 'properties' in asset,
                                            asset
                                        });
                                        return null;
                                    })()}

                                    {/* Object-specific Properties */}
                                    {isObjectAsset(asset) && (
                                        <ObjectPropertiesForm
                                            size={size}
                                            isMovable={isMovable}
                                            isOpaque={isOpaque}
                                            onSizeChange={setSize}
                                            onIsMovableChange={setIsMovable}
                                            onIsOpaqueChange={setIsOpaque}
                                            readOnly={false}
                                        />
                                    )}

                                    {/* Creature-specific Properties */}
                                    {isCreatureAsset(asset) && (
                                        <CreaturePropertiesForm
                                            size={size}
                                            category={creatureCategory}
                                            onSizeChange={setSize}
                                            onCategoryChange={setCreatureCategory}
                                            readOnly={false}
                                        />
                                    )}
                                </AccordionDetails>
                            </Accordion>
                        </>
                    ) : (
                        <Stack spacing={2} sx={{ mt: 2 }}>
                            {/* View mode: Keep flat layout - no accordions */}
                            <AssetBasicFields
                                name={name}
                                description={description}
                                onNameChange={setName}
                                onDescriptionChange={setDescription}
                                isPublic={isPublic}
                                isPublished={isPublished}
                                onIsPublicChange={setIsPublic}
                                onIsPublishedChange={setIsPublished}
                                readOnly={true}
                            />

                            {/* Kind (Read-only) */}
                            <Box>
                                <Typography variant="caption" color="text.secondary">Kind</Typography>
                                <Box sx={{ mt: 0.5 }}>
                                    <Chip label={asset.kind} color="primary" size="small" />
                                </Box>
                            </Box>

                            {/* Object-specific Properties */}
                            {isObjectAsset(asset) && (
                                <ObjectPropertiesForm
                                    size={size}
                                    isMovable={isMovable}
                                    isOpaque={isOpaque}
                                    onSizeChange={setSize}
                                    onIsMovableChange={setIsMovable}
                                    onIsOpaqueChange={setIsOpaque}
                                    readOnly={true}
                                />
                            )}

                            {/* Creature-specific Properties */}
                            {isCreatureAsset(asset) && (
                                <CreaturePropertiesForm
                                    size={size}
                                    category={creatureCategory}
                                    onSizeChange={setSize}
                                    onCategoryChange={setCreatureCategory}
                                    readOnly={true}
                                />
                            )}

                            {/* Metadata */}
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
                        </Stack>
                    )}
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
