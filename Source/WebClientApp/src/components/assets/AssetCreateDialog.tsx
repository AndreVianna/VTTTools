// Phase 5 Step 6 - Asset Create Dialog
// Modal dialog for creating new assets with shared form components

import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    IconButton,
    Divider,
    Stack,
    CircularProgress,
    Tabs,
    Tab
} from '@mui/material';
import {
    Close as CloseIcon,
    Save as SaveIcon,
    Cancel as CancelIcon
} from '@mui/icons-material';
import {
    AssetKind,
    CreatureCategory,
    CreateAssetRequest
} from '@/types/domain';
import { useCreateAssetMutation } from '@/services/assetsApi';
import {
    AssetBasicFields,
    ObjectPropertiesForm,
    CreaturePropertiesForm,
    AssetVisibilityFields
} from './forms';

export interface AssetCreateDialogProps {
    open: boolean;
    onClose: () => void;
    initialKind?: AssetKind; // Optional: Pre-select kind based on active tab in parent
}

export const AssetCreateDialog: React.FC<AssetCreateDialogProps> = ({
    open,
    onClose,
    initialKind = AssetKind.Object
}) => {
    // Kind selection
    const [selectedKind, setSelectedKind] = useState<AssetKind>(initialKind);

    // Basic fields
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    // Visibility fields
    const [isPublic, setIsPublic] = useState(false);
    const [isPublished, setIsPublished] = useState(false);

    // Object-specific properties
    const [cellWidth, setCellWidth] = useState(1);
    const [cellHeight, setCellHeight] = useState(1);
    const [isMovable, setIsMovable] = useState(true);
    const [isOpaque, setIsOpaque] = useState(false);
    const [isVisible, setIsVisible] = useState(true);

    // Creature-specific properties
    const [cellSize, setCellSize] = useState(1);
    const [creatureCategory, setCreatureCategory] = useState<CreatureCategory>(CreatureCategory.Character);

    // RTK Query mutation
    const [createAsset, { isLoading: isSaving }] = useCreateAssetMutation();

    // Reset form when dialog opens
    useEffect(() => {
        if (open) {
            setSelectedKind(initialKind);
            setName('');
            setDescription('');
            setIsPublic(false);
            setIsPublished(false);
            setCellWidth(1);
            setCellHeight(1);
            setIsMovable(true);
            setIsOpaque(false);
            setIsVisible(true);
            setCellSize(1);
            setCreatureCategory(CreatureCategory.Character);
        }
    }, [open, initialKind]);

    const handleSave = async () => {
        try {
            const request: CreateAssetRequest = {
                kind: selectedKind,
                name,
                description,
                isPublic,
                isPublished
            };

            // Add kind-specific properties
            if (selectedKind === AssetKind.Object) {
                request.objectProps = {
                    cellWidth,
                    cellHeight,
                    isMovable,
                    isOpaque,
                    isVisible
                };
            } else if (selectedKind === AssetKind.Creature) {
                request.creatureProps = {
                    cellSize,
                    category: creatureCategory
                };
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
        // Name must be at least 3 characters
        if (name.trim().length < 3) return false;

        // Description must not be empty
        if (description.trim().length === 0) return false;

        // Cell dimensions must be positive
        if (selectedKind === AssetKind.Object) {
            if (cellWidth <= 0 || cellHeight <= 0) return false;
        } else if (selectedKind === AssetKind.Creature) {
            if (cellSize <= 0) return false;
        }

        return true;
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
        >
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6" component="span">
                    Create New Asset
                </Typography>
                <IconButton onClick={onClose} size="small" disabled={isSaving}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <Divider />

            <DialogContent>
                <Stack spacing={3}>
                    {/* Kind Selector Tabs */}
                    <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                            Asset Kind
                        </Typography>
                        <Tabs
                            value={selectedKind}
                            onChange={(_, newValue) => setSelectedKind(newValue)}
                            sx={{ borderBottom: 1, borderColor: 'divider' }}
                        >
                            <Tab label="Object" value={AssetKind.Object} />
                            <Tab label="Creature" value={AssetKind.Creature} />
                        </Tabs>
                    </Box>

                    {/* Basic Fields (Name & Description) */}
                    <AssetBasicFields
                        name={name}
                        description={description}
                        onNameChange={setName}
                        onDescriptionChange={setDescription}
                    />

                    {/* Kind-Specific Properties */}
                    {selectedKind === AssetKind.Object && (
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
                        />
                    )}

                    {selectedKind === AssetKind.Creature && (
                        <CreaturePropertiesForm
                            cellSize={cellSize}
                            category={creatureCategory}
                            onCellSizeChange={setCellSize}
                            onCategoryChange={setCreatureCategory}
                        />
                    )}

                    {/* Visibility Fields */}
                    <AssetVisibilityFields
                        isPublic={isPublic}
                        isPublished={isPublished}
                        onIsPublicChange={setIsPublic}
                        onIsPublishedChange={setIsPublished}
                    />
                </Stack>
            </DialogContent>

            <Divider />

            <DialogActions sx={{ px: 3, py: 2 }}>
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
                    disabled={isSaving || !isFormValid()}
                >
                    {isSaving ? 'Creating...' : 'Create Asset'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
