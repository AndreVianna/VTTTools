// GENERATED: 2025-10-08 by Claude Code Phase 5 Step 5
// EPIC: EPIC-001 Phase 5 - Asset Library UI
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
    UpdateAssetRequest,
    NamedSize,
    ObjectAsset,
    CreatureAsset,
    AssetToken,
    ObjectData,
    CreatureData
} from '@/types/domain';
import { useUpdateAssetMutation, useDeleteAssetMutation } from '@/services/assetsApi';
import {
    AssetBasicFields,
    ObjectPropertiesForm,
    CreaturePropertiesForm,
    AssetResourceManager
} from './forms';

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

export const AssetEditDialog: React.FC<AssetEditDialogProps> = ({
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
    const [tokens, setTokens] = useState<AssetToken[]>(asset.tokens || []);
    const [portraitId, setPortraitId] = useState<string | undefined>(asset.portrait?.id);
    const [isPublic, setIsPublic] = useState(asset.isPublic);
    const [isPublished, setIsPublished] = useState(asset.isPublished);
    const [isMovable, setIsMovable] = useState((asset as ObjectAsset).isMovable);
    const [isOpaque, setIsOpaque] = useState((asset as ObjectAsset).isOpaque);
    const [triggerEffectId, setTriggerEffectId] = useState((asset as ObjectAsset).triggerEffectId);
    const [statBlockId, setStatBlockId] = useState((asset as CreatureAsset).statBlockId);
    const [category, setCategory] = useState((asset as CreatureAsset).category);
    const [tokenStyle, setTokenStyle] = useState((asset as CreatureAsset).tokenStyle);
    // Size state (at root level in new schema)
    const [size, setSize] = useState<NamedSize>(asset.size);

    // RTK Query mutations
    const [updateAsset, { isLoading: isSaving }] = useUpdateAssetMutation();
    const [deleteAsset, { isLoading: isDeleting }] = useDeleteAssetMutation();

    // Track previous asset ID to detect asset switches
    const prevAssetIdRef = useRef<string | null>(null);

    const objectData: ObjectData = {
        isMovable: isMovable,
        isOpaque: isOpaque,
        triggerEffectId: triggerEffectId ?? undefined,
    };
    const creatureData: CreatureData = {
        category: category,
        statBlockId: statBlockId ?? undefined,
        tokenStyle: tokenStyle ?? undefined,
    };

    const setObjectData = (data: ObjectData) => {
        setIsMovable(data.isMovable);
        setIsOpaque(data.isOpaque);
        setTriggerEffectId(data.triggerEffectId ?? undefined);
    };
    const setCreatureData = (data: CreatureData) => {
        setCategory(data.category);
        setStatBlockId(data.statBlockId ?? undefined);
        setTokenStyle(data.tokenStyle ?? undefined);
    };

    // Reset state only when dialog opens or when switching to a different asset
    // Do NOT reset when asset updates due to save operation (asset.updatedAt changes)
    useEffect(() => {
        const isDifferentAsset = prevAssetIdRef.current !== asset.id;

        if (open && (isDifferentAsset || prevAssetIdRef.current === null)) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setName(asset.name);
            setDescription(asset.description);
            setTokens(asset.tokens || []);
            setPortraitId(asset.portrait?.id);
            setIsPublic(asset.isPublic);
            setIsPublished(asset.isPublished);
            setSize(asset.size);
            setEditMode(false);

            if (isObjectAsset(asset)) {
                setObjectData(objectData);
            } else if (isCreatureAsset(asset)) {
                setCreatureData(creatureData);
            }

            prevAssetIdRef.current = asset.id;
        }
    }, [open, asset.id, asset, objectData, creatureData]);

    const handleSave = async () => {
        try {
            const request: UpdateAssetRequest = {
                isPublic,
                isPublished,
                description,
                size,
                tokens: tokens.map(t => ({ token: { 
                    id: t.token.id,
                    type: t.token.type,
                    path: t.token.path,
                    metadata: t.token.metadata,
                    tags: t.token.tags
                }, isDefault: t.isDefault })),
                portraitId
            };

            if (name.trim()) {
                request.name = name;
            }

            if (asset.kind === AssetKind.Object) {
                const object = asset as ObjectAsset;
                request.objectData = {
                    isMovable: object.isMovable,
                    isOpaque: object.isOpaque,
                    triggerEffectId: object.triggerEffectId ?? undefined,
                };
            } else if (asset.kind === AssetKind.Creature) {
                const creature = asset as CreatureAsset;
                request.creatureData = {
                    category: creature.category,
                    statBlockId: creature.statBlockId ?? undefined,
                    tokenStyle: creature.tokenStyle ?? undefined,
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
        setName(asset.name);
        setDescription(asset.description);
        setTokens(asset.tokens || []);
        setPortraitId(asset.portrait?.id);
        setIsPublic(asset.isPublic);
        setIsPublished(asset.isPublished);
        setSize(asset.size);
        
        if (isObjectAsset(asset)) {
            setObjectData(objectData);
        } else if (isCreatureAsset(asset)) {
            setCreatureData(creatureData);
        }

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
                    <AssetResourceManager
                        entityId={asset.id}
                        tokens={tokens}
                        onTokensChange={setTokens}
                        portraitId={portraitId}
                        onPortraitIdChange={setPortraitId}
                        size={size}
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
                                    {isObjectAsset(asset) && objectData && (
                                        <ObjectPropertiesForm
                                            objectData={objectData}
                                            onChange={setObjectData}
                                        />
                                    )}

                                    {isCreatureAsset(asset) && creatureData && (
                                        <CreaturePropertiesForm
                                            creatureData={creatureData}
                                            onChange={setCreatureData}
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

                            {isObjectAsset(asset) && objectData && (
                                <ObjectPropertiesForm
                                    objectData={objectData}
                                    onChange={setObjectData}
                                />
                            )}

                            {isCreatureAsset(asset) && creatureData && (
                                <CreaturePropertiesForm
                                    creatureData={creatureData}
                                    onChange={setCreatureData}
                                />
                            )}

                            {/* Metadata */}
                            <Box>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
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
