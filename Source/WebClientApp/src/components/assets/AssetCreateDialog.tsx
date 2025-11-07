// Phase 5 Step 6 - Asset Create Dialog
// Modal dialog for creating new assets with shared form components

import React, { useState } from 'react';
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
    Tab,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Chip,
    useTheme
} from '@mui/material';
import {
    Close as CloseIcon,
    Save as SaveIcon,
    Cancel as CancelIcon,
    ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import {
    AssetKind,
    CreatureCategory,
    CreateAssetRequest,
    NamedSize,
    ObjectData,
    CreatureData
} from '@/types/domain';
import { useCreateAssetMutation } from '@/services/assetsApi';
import {
    AssetBasicFields,
    ObjectPropertiesForm,
    CreaturePropertiesForm,
    AssetResourceManager
} from './forms';
import { AssetToken } from '@/types/domain';

export interface AssetCreateDialogProps {
    open: boolean;
    onClose: () => void;
    initialKind?: AssetKind; // Optional: Pre-select kind based on active tab in parent
    fixedKind?: AssetKind; // Optional: Lock kind (hide tabs) - used by virtual Add card
}

export const AssetCreateDialog: React.FC<AssetCreateDialogProps> = ({
    open,
    onClose,
    initialKind = AssetKind.Object,
    fixedKind
}) => {
    const theme = useTheme();

    // Kind selection - use fixedKind if provided, otherwise initialKind
    const [selectedKind, setSelectedKind] = useState<AssetKind>(fixedKind ?? initialKind);

    // Basic fields
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    // Tokens (images) - renamed from resources
    const [tokens, setTokens] = useState<AssetToken[]>([]);
    const [portraitId, setPortraitId] = useState<string | undefined>(undefined);

    // Visibility fields
    const [isPublic, setIsPublic] = useState(false);
    const [isPublished, setIsPublished] = useState(false);

    // Size moved to root level - shared between Object and Creature
    const [size, setSize] = useState<NamedSize>({ width: 1, height: 1, isSquare: true });

    // Object-specific properties
    const [objectData, setObjectData] = useState<ObjectData>({
        isMovable: true,
        isOpaque: false
    });

    // Creature-specific properties
    const [creatureData, setCreatureData] = useState<CreatureData>({
        category: CreatureCategory.Character
    });

    // RTK Query mutation
    const [createAsset, { isLoading: isSaving }] = useCreateAssetMutation();

    const handleSave = async () => {
        try {
            const request: CreateAssetRequest = {
                kind: selectedKind,
                name,
                description,
                tokens: tokens.map(t => ({ tokenId: t.tokenId, isDefault: t.isDefault })),
                portraitId,
                size: {
                    width: size.width,
                    height: size.height,
                    isSquare: size.isSquare
                },
                isPublic,
                isPublished
            };

            if (selectedKind === AssetKind.Object) {
                request.objectData = objectData;
            } else if (selectedKind === AssetKind.Creature) {
                request.creatureData = creatureData;
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
                {/* PERMANENT SECTION: Asset Images (Always Visible - Visual Identity) */}
                <Box sx={{ mb: 3 }}>
                    <AssetResourceManager
                        tokens={tokens}
                        onTokensChange={setTokens}
                        portraitId={portraitId}
                        onPortraitIdChange={setPortraitId}
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
                        mb: 2
                    }}
                >
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        sx={{
                            bgcolor: theme.palette.mode === 'dark'
                                ? 'rgba(255,255,255,0.05)'
                                : 'rgba(0,0,0,0.02)',
                            borderBottom: '1px solid',
                            borderColor: 'divider',
                            minHeight: 48,
                            '&.Mui-expanded': { minHeight: 48 }
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1 }}>
                            <Typography variant="subtitle1" fontWeight={600}>
                                Identity & Basics
                            </Typography>
                            <Chip label="Required" size="small" color="primary" />
                        </Box>
                    </AccordionSummary>
                    <AccordionDetails sx={{ p: 3 }}>
                        <Stack spacing={3}>
                            {/* Kind Selector Tabs - only show if kind is not fixed */}
                            {!fixedKind && (
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
                        borderRadius: 1
                    }}
                >
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        sx={{
                            bgcolor: theme.palette.mode === 'dark'
                                ? 'rgba(255,255,255,0.05)'
                                : 'rgba(0,0,0,0.02)',
                            borderBottom: '1px solid',
                            borderColor: 'divider',
                            minHeight: 48,
                            '&.Mui-expanded': { minHeight: 48 }
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1 }}>
                            <Typography variant="subtitle1" fontWeight={600}>
                                Properties
                            </Typography>
                            <Chip label="Required" size="small" />
                        </Box>
                    </AccordionSummary>
                    <AccordionDetails sx={{ p: 3 }}>
                        <Stack spacing={3}>
                            {/* Size field - now at root level, common to all asset types */}
                            <Box>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                                    Size (Grid Cells)
                                </Typography>
                                <Stack direction="row" spacing={2}>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="caption">Width</Typography>
                                        <input
                                            type="number"
                                            value={size.width}
                                            onChange={(e) => setSize({ ...size, width: Number(e.target.value) })}
                                            min={0.5}
                                            step={0.5}
                                            style={{ width: '100%', padding: '8px' }}
                                        />
                                    </Box>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="caption">Height</Typography>
                                        <input
                                            type="number"
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
                                <ObjectPropertiesForm
                                    objectData={objectData}
                                    onChange={setObjectData}
                                />
                            )}

                            {selectedKind === AssetKind.Creature && (
                                <CreaturePropertiesForm
                                    creatureData={creatureData}
                                    onChange={setCreatureData}
                                />
                            )}
                        </Stack>
                    </AccordionDetails>
                </Accordion>
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
