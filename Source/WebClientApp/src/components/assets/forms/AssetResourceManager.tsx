// Phase 5.6 - Asset Resource Manager Redesigned
// Single-panel image manager with keyboard shortcuts for role assignment
// Ctrl+Click=Toggle Display, Alt+Click=Toggle Token, Ctrl+Alt+Click=Toggle Both

import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    IconButton,
    Card,
    CardMedia,
    CircularProgress,
    Alert,
    Chip,
    Grid,
    useTheme
} from '@mui/material';
import {
    CloudUpload as UploadIcon,
    Close as CloseIcon,
    Videocam as TokenIcon,
    Portrait as DisplayIcon,
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon
} from '@mui/icons-material';
import { AssetResource, ResourceRole, NamedSize } from '@/types/domain';
import { useUploadFileMutation } from '@/services/mediaApi';
import { getResourceUrl } from '@/utils/assetHelpers';
import { TokenPreview } from '@/components/common/TokenPreview';
import { DisplayPreview } from '@/components/common/DisplayPreview';

export interface AssetResourceManagerProps {
    resources: AssetResource[];
    onResourcesChange: (resources: AssetResource[]) => void;
    size: NamedSize;  // Asset size for token preview grid
    readOnly?: boolean;
    entityId?: string;  // Asset ID for edit mode
}

export const AssetResourceManager: React.FC<AssetResourceManagerProps> = ({
    resources,
    onResourcesChange,
    size,
    readOnly = false,
    entityId
}) => {
    const theme = useTheme();
    const [uploadFile, { isLoading: isUploading }] = useUploadFileMutation();
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [showManage, setShowManage] = useState(false);

    // Auto-expand manage panel if editing existing asset with resources
    // Initialize showManage based on entityId and resources
    useEffect(() => {
        if (entityId && resources.length > 0) {
            setShowManage(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [entityId]); // Only run when entityId changes to avoid cascading renders

    // Get first resources by role
    const firstToken = resources.find(r => (r.role & ResourceRole.Token) === ResourceRole.Token);
    const firstDisplay = resources.find(r => (r.role & ResourceRole.Display) === ResourceRole.Display);

    // Upload image (no role assigned - user sets via keyboard)
    const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploadError(null);
        try {
            const result = await uploadFile({
                file,
                ...(entityId ? { entityId } : {})  // Only include if defined
            }).unwrap();

            onResourcesChange([...resources, {
                resourceId: result.id,  // Use 'id' from new response format
                role: ResourceRole.None  // No role assigned - user sets via keyboard
            }]);

            setShowManage(true);  // Auto-expand management panel
        } catch (error: any) {
            console.error('Upload failed:', error);
            console.error('Error stringified:', JSON.stringify(error, null, 2));
            console.error('Error keys:', Object.keys(error || {}));
            console.error('Error.data:', error?.data);
            console.error('Error.status:', error?.status);
            console.error('Error.error:', error?.error);

            const errorMessage = error?.data?.detail || error?.data?.title || error?.error || error?.message || JSON.stringify(error);
            setUploadError(`Failed to upload image: ${errorMessage}`);
        }
        event.target.value = '';
    };

    // Keyboard shortcut handler for role assignment
    const handleImageClick = (event: React.MouseEvent, resourceId: string) => {
        const isCtrl = event.ctrlKey;
        const isAlt = event.altKey;

        // Prevent default behavior for all clicks with modifier keys
        if (isCtrl || isAlt) {
            event.preventDefault();
            event.stopPropagation();
        } else {
            return; // Regular click - do nothing
        }

        const updated = resources.map(r => {
            if (r.resourceId !== resourceId) return r;

            let newRole = r.role;

            if (isCtrl && isAlt) {
                // Ctrl+Alt+Click: Toggle BOTH roles (XOR both flags)
                newRole = newRole ^ (ResourceRole.Token | ResourceRole.Display);
            } else if (isCtrl) {
                // Ctrl+Click: Toggle Display role only
                newRole = newRole ^ ResourceRole.Display;
            } else if (isAlt) {
                // Alt+Click: Toggle Token role only
                newRole = newRole ^ ResourceRole.Token;
            }

            return { ...r, role: newRole };
        });

        onResourcesChange(updated);
    };

    // Remove resource
    const handleRemove = (resourceId: string) => {
        onResourcesChange(resources.filter(r => r.resourceId !== resourceId));
    };

    // Read-only mode - show token and display side-by-side
    if (readOnly) {
        return (
            <Box>
                <Typography variant="subtitle2" sx={{ mb: 2 }}>Asset Images</Typography>
                <Grid container spacing={2}>
                    <Grid size={6}>
                        <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                            Token
                        </Typography>
                        {firstToken ? (
                            <TokenPreview
                                imageUrl={getResourceUrl(firstToken.resourceId)}
                                size={size}
                            />
                        ) : (
                            <Box sx={{
                                height: 120,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1px dashed',
                                borderColor: 'divider',
                                borderRadius: 1,
                                bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100'
                            }}>
                                <Typography variant="caption" color="text.secondary">No token</Typography>
                            </Box>
                        )}
                    </Grid>
                    <Grid size={6}>
                        <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                            Display
                        </Typography>
                        {firstDisplay ? (
                            <DisplayPreview
                                imageUrl={getResourceUrl(firstDisplay.resourceId)}
                            />
                        ) : (
                            <Box sx={{
                                height: 120,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1px dashed',
                                borderColor: 'divider',
                                borderRadius: 1,
                                bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100'
                            }}>
                                <Typography variant="caption" color="text.secondary">No display</Typography>
                            </Box>
                        )}
                    </Grid>
                </Grid>
            </Box>
        );
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle2">Asset Images</Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                        component="label"
                        size="small"
                        startIcon={isUploading ? <CircularProgress size={16} /> : <UploadIcon />}
                        disabled={isUploading}
                    >
                        Upload
                        <input
                            type="file"
                            accept="image/jpeg,image/png,image/svg+xml,image/gif,image/webp,image/bmp,image/tiff"
                            hidden
                            onChange={handleUpload}
                            disabled={isUploading}
                        />
                    </Button>
                    <Button
                        size="small"
                        variant="outlined"
                        endIcon={showManage ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        onClick={() => setShowManage(!showManage)}
                    >
                        Manage
                    </Button>
                </Box>
            </Box>

            {uploadError && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setUploadError(null)}>
                    {uploadError}
                </Alert>
            )}

            {/* Current Previews (Collapsed View) */}
            {!showManage && (
                <Grid container spacing={2}>
                    <Grid size={6}>
                        <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                            Token
                        </Typography>
                        {firstToken ? (
                            <TokenPreview
                                imageUrl={getResourceUrl(firstToken.resourceId)}
                                size={size}
                                maxSize={180}
                            />
                        ) : (
                            <Box sx={{
                                height: 120,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '2px dashed',
                                borderColor: 'divider',
                                borderRadius: 1
                            }}>
                                <Typography variant="caption" color="text.secondary">No token</Typography>
                            </Box>
                        )}
                    </Grid>
                    <Grid size={6}>
                        <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                            Display Image
                        </Typography>
                        {firstDisplay ? (
                            <DisplayPreview
                                imageUrl={getResourceUrl(firstDisplay.resourceId)}
                                maxSize={180}
                            />
                        ) : (
                            <Box sx={{
                                height: 120,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '2px dashed',
                                borderColor: 'divider',
                                borderRadius: 1
                            }}>
                                <Typography variant="caption" color="text.secondary">No display</Typography>
                            </Box>
                        )}
                    </Grid>
                </Grid>
            )}

            {/* Expanded Management Panel */}
            {showManage && (
                <Box sx={{
                    p: 2,
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider'
                }}>
                    <Typography variant="body2" fontWeight={600} sx={{ display: 'inline', mb: 1 }}>
                        Image Library
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'inline', mb: 1, ml: 2 }}>
                        Set/Unset as Display: Ctrl+Click • Set/Unset as Token: Alt+Click
                    </Typography>

                    {resources.length > 0 ? (
                        <Grid container spacing={1}>
                            {resources.map((resource, _index) => {
                                const hasToken = (resource.role & ResourceRole.Token) === ResourceRole.Token;
                                const hasDisplay = (resource.role & ResourceRole.Display) === ResourceRole.Display;
                                const hasBoth = hasToken && hasDisplay;

                                return (
                                    <Grid size={{ xs: 6, sm: 4, md: 3 }} key={resource.resourceId}>
                                        <Card
                                            onClick={(e) => handleImageClick(e, resource.resourceId)}
                                            sx={{
                                                cursor: 'pointer',
                                                position: 'relative',
                                                border: '2px solid',
                                                borderColor: hasBoth ? 'success.main' : hasToken ? 'primary.main' : hasDisplay ? 'secondary.main' : 'divider',
                                                '&:hover': { boxShadow: 3 }
                                            }}
                                        >
                                            <CardMedia
                                                component="img"
                                                height="100"
                                                image={getResourceUrl(resource.resourceId)}
                                                alt="Resource"
                                                sx={{ objectFit: 'contain', bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.100' }}
                                            />

                                            {/* Role Badges */}
                                            <Box sx={{ position: 'absolute', bottom: 4, left: 4, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                                {hasToken && (
                                                    <Chip
                                                        icon={<TokenIcon sx={{ fontSize: 14 }} />}
                                                        label="Token"
                                                        size="small"
                                                        color="primary"
                                                        sx={{ height: 20 }}
                                                    />
                                                )}
                                                {hasDisplay && (
                                                    <Chip
                                                        icon={<DisplayIcon sx={{ fontSize: 14 }} />}
                                                        label="Display"
                                                        size="small"
                                                        color="secondary"
                                                        sx={{ height: 20 }}
                                                    />
                                                )}
                                            </Box>

                                            {/* Delete Button */}
                                            <IconButton
                                                size="small"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRemove(resource.resourceId);
                                                }}
                                                sx={{
                                                    position: 'absolute',
                                                    top: 4,
                                                    right: 4,
                                                    bgcolor: 'background.paper',
                                                    '&:hover': { bgcolor: 'error.main', color: 'white' }
                                                }}
                                            >
                                                <CloseIcon fontSize="small" />
                                            </IconButton>
                                        </Card>
                                    </Grid>
                                );
                            })}
                        </Grid>
                    ) : (
                        <Box sx={{
                            textAlign: 'center',
                            py: 4,
                            border: '2px dashed',
                            borderColor: 'divider',
                            borderRadius: 1
                        }}>
                            <Typography variant="body2" color="text.secondary">
                                No images uploaded yet
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Click &quote;Upload&quote; to add images
                            </Typography>
                        </Box>
                    )}
                </Box>
            )}
        </Box>
    );
};
