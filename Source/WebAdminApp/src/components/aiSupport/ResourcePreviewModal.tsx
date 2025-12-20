import { useState, useCallback, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    Chip,
    Stack,
    IconButton,
    CircularProgress,
    Skeleton,
    TextField,
    Grid,
} from '@mui/material';
import { Close as CloseIcon, BrokenImage as BrokenImageIcon } from '@mui/icons-material';
import type { GeneratedResource } from '@/types/resourceApproval';
import { useAuthenticatedImageUrl } from '@/hooks/useAuthenticatedImageUrl';
import { resourcesAdminService } from '@/services/resourcesAdminService';

interface ResourcePreviewModalProps {
    resource: GeneratedResource | null;
    open: boolean;
    onClose: () => void;
    onApprove: () => void;
    onRegenerate: () => void;
    onReject: () => void;
    onResourceUpdated: (resource: GeneratedResource) => void;
    isLoading: boolean;
}

export function ResourcePreviewModal({
    resource,
    open,
    onClose,
    onApprove,
    onRegenerate,
    onReject,
    onResourceUpdated,
    isLoading,
}: ResourcePreviewModalProps) {
    const { blobUrl, isLoading: isImageLoading, error: imageError } = useAuthenticatedImageUrl(resource?.imageUrl);

    const [editedKind, setEditedKind] = useState(resource?.kind ?? '');
    const [editedCategory, setEditedCategory] = useState(resource?.category ?? '');
    const [editedType, setEditedType] = useState(resource?.type ?? '');
    const [editedSubtype, setEditedSubtype] = useState(resource?.subtype ?? '');
    const [editedDescription, setEditedDescription] = useState(resource?.description ?? '');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (resource) {
            setEditedKind(resource.kind);
            setEditedCategory(resource.category ?? '');
            setEditedType(resource.type ?? '');
            setEditedSubtype(resource.subtype ?? '');
            setEditedDescription(resource.description ?? '');
        }
    }, [resource]);

    const handleFieldBlur = useCallback(async (
        field: 'kind' | 'category' | 'type' | 'subtype' | 'description',
        value: string
    ) => {
        if (!resource) return;

        const originalValue = field === 'description'
            ? resource.description ?? ''
            : field === 'kind'
                ? resource.kind
                : field === 'category'
                    ? resource.category ?? ''
                    : field === 'type'
                        ? resource.type ?? ''
                        : resource.subtype ?? '';

        if (value === originalValue) return;

        setIsSaving(true);
        try {
            if (field === 'description') {
                await resourcesAdminService.updateResource(resource.resourceId, {
                    description: value || null,
                });
                onResourceUpdated({ ...resource, description: value || undefined });
            } else {
                const classification = {
                    kind: field === 'kind' ? value : resource.kind,
                    category: field === 'category' ? value : resource.category ?? '',
                    type: field === 'type' ? value : resource.type ?? '',
                    subtype: field === 'subtype' ? (value || null) : (resource.subtype ?? null),
                };
                await resourcesAdminService.updateResource(resource.resourceId, { classification });
                onResourceUpdated({
                    ...resource,
                    kind: classification.kind,
                    category: classification.category || undefined,
                    type: classification.type || undefined,
                    subtype: classification.subtype ?? undefined,
                });
            }
        } catch {
            // Revert on error
            if (field === 'kind') setEditedKind(resource.kind);
            else if (field === 'category') setEditedCategory(resource.category ?? '');
            else if (field === 'type') setEditedType(resource.type ?? '');
            else if (field === 'subtype') setEditedSubtype(resource.subtype ?? '');
            else setEditedDescription(resource.description ?? '');
        } finally {
            setIsSaving(false);
        }
    }, [resource, onResourceUpdated]);

    if (!resource) return null;

    const isPending = resource.status === 'pending';
    const isDisabled = isLoading || isSaving || !isPending;

    const getGenerationTypeColor = (): 'primary' | 'secondary' => {
        return resource.generationType === 'Portrait' ? 'primary' : 'secondary';
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            id="modal-resource-preview"
        >
            <DialogTitle>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="h6">{resource.assetName}</Typography>
                        <Chip
                            label={resource.generationType}
                            color={getGenerationTypeColor()}
                            size="small"
                        />
                    </Stack>
                    <IconButton
                        id="btn-close-preview"
                        onClick={onClose}
                        size="small"
                        aria-label="Close"
                    >
                        <CloseIcon />
                    </IconButton>
                </Stack>
            </DialogTitle>

            <DialogContent dividers>
                <Box
                    sx={{
                        position: 'relative',
                        display: 'flex',
                        justifyContent: 'center',
                        mb: 3,
                    }}
                >
                    {(isLoading || isImageLoading) && (
                        <Box
                            sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: 'rgba(0, 0, 0, 0.5)',
                                zIndex: 1,
                                borderRadius: 1,
                            }}
                        >
                            <CircularProgress />
                        </Box>
                    )}
                    {isImageLoading ? (
                        <Skeleton variant="rectangular" width={400} height={400} sx={{ borderRadius: 1 }} />
                    ) : imageError || !blobUrl ? (
                        <Box
                            sx={{
                                width: 400,
                                height: 400,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: 'action.hover',
                                borderRadius: 1,
                            }}
                        >
                            <BrokenImageIcon sx={{ fontSize: 64, color: 'text.disabled' }} />
                        </Box>
                    ) : (
                        <Box
                            component="img"
                            src={blobUrl}
                            alt={`${resource.assetName} ${resource.generationType}`}
                            sx={{
                                maxWidth: '100%',
                                maxHeight: 350,
                                objectFit: 'contain',
                                borderRadius: 1,
                                boxShadow: 2,
                            }}
                        />
                    )}
                </Box>

                <Stack spacing={2}>
                    <Box>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Classification
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 6, sm: 3 }}>
                                <TextField
                                    id="input-kind"
                                    label="Kind"
                                    value={editedKind}
                                    onChange={(e) => setEditedKind(e.target.value)}
                                    onBlur={() => handleFieldBlur('kind', editedKind)}
                                    size="small"
                                    disabled={isSaving}
                                    fullWidth
                                />
                            </Grid>
                            <Grid size={{ xs: 6, sm: 3 }}>
                                <TextField
                                    id="input-category"
                                    label="Category"
                                    value={editedCategory}
                                    onChange={(e) => setEditedCategory(e.target.value)}
                                    onBlur={() => handleFieldBlur('category', editedCategory)}
                                    size="small"
                                    disabled={isSaving}
                                    fullWidth
                                />
                            </Grid>
                            <Grid size={{ xs: 6, sm: 3 }}>
                                <TextField
                                    id="input-type"
                                    label="Type"
                                    value={editedType}
                                    onChange={(e) => setEditedType(e.target.value)}
                                    onBlur={() => handleFieldBlur('type', editedType)}
                                    size="small"
                                    disabled={isSaving}
                                    fullWidth
                                />
                            </Grid>
                            <Grid size={{ xs: 6, sm: 3 }}>
                                <TextField
                                    id="input-subtype"
                                    label="Subtype"
                                    value={editedSubtype}
                                    onChange={(e) => setEditedSubtype(e.target.value)}
                                    onBlur={() => handleFieldBlur('subtype', editedSubtype)}
                                    size="small"
                                    disabled={isSaving}
                                    fullWidth
                                />
                            </Grid>
                        </Grid>
                    </Box>

                    <Box>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Description
                        </Typography>
                        <TextField
                            id="input-description"
                            value={editedDescription}
                            onChange={(e) => setEditedDescription(e.target.value)}
                            onBlur={() => handleFieldBlur('description', editedDescription)}
                            multiline
                            rows={3}
                            fullWidth
                            size="small"
                            disabled={isSaving}
                            placeholder="Enter description..."
                        />
                    </Box>

                    {resource.tags.length > 0 && (
                        <Box>
                            <Typography variant="subtitle2" color="text.secondary">
                                Tags
                            </Typography>
                            <Stack direction="row" spacing={0.5} flexWrap="wrap" mt={0.5}>
                                {resource.tags.map((tag, index) => (
                                    <Chip key={index} label={tag} size="small" variant="outlined" />
                                ))}
                            </Stack>
                        </Box>
                    )}
                </Stack>
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button
                    id="btn-modal-reject"
                    onClick={onReject}
                    color="error"
                    disabled={isDisabled}
                >
                    Reject
                </Button>
                <Button
                    id="btn-modal-regenerate"
                    onClick={onRegenerate}
                    color="primary"
                    variant="outlined"
                    disabled={isDisabled}
                >
                    Regenerate
                </Button>
                <Button
                    id="btn-modal-approve"
                    onClick={onApprove}
                    color="success"
                    variant="contained"
                    disabled={isDisabled}
                >
                    Approve
                </Button>
            </DialogActions>
        </Dialog>
    );
}
