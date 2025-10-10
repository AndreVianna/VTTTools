// Phase 5.5 - Asset Resource Manager
// Dual collapsible album component with side-by-side layout

import React, { useState } from 'react';
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
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon,
    Image as ImageIcon
} from '@mui/icons-material';
import { AssetResource, ResourceRole } from '@/types/domain';
import { useUploadFileMutation } from '@/services/mediaApi';
import { getResourceUrl } from '@/utils/assetHelpers';

export interface AssetResourceManagerProps {
    resources: AssetResource[];
    onResourcesChange: (resources: AssetResource[]) => void;
    readOnly?: boolean;
}

type ExpandedAlbum = 'token' | 'portrait' | null;

export const AssetResourceManager: React.FC<AssetResourceManagerProps> = ({
    resources,
    onResourcesChange,
    readOnly = false
}) => {
    const theme = useTheme();
    const [uploadFile, { isLoading: isUploading }] = useUploadFileMutation();
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [expandedAlbum, setExpandedAlbum] = useState<ExpandedAlbum>(null);

    // Separate resources by role
    const tokenResources = resources.filter(r => r.role === ResourceRole.Token);
    const portraitResources = resources.filter(r => r.role === ResourceRole.Portrait);
    const defaultToken = tokenResources.find(r => r.isDefault) ?? tokenResources[0];
    const defaultPortrait = portraitResources.find(r => r.isDefault) ?? portraitResources[0];

    // Toggle album (only one can be open at a time)
    const handleToggleAlbum = (album: 'token' | 'portrait') => {
        setExpandedAlbum(prev => prev === album ? null : album);
    };

    // Ctrl+Click handler to toggle default (on/off)
    const handleSetDefault = (resourceId: string, role: ResourceRole) => {
        const resource = resources.find(r => r.resourceId === resourceId);
        if (!resource || resource.role !== role) return;

        const updated = resources.map(r => ({
            ...r,
            isDefault: r.resourceId === resourceId && r.role === role ? !r.isDefault :  // TOGGLE
                       r.role === role ? false : r.isDefault  // Clear other defaults for this role
        }));
        onResourcesChange(updated);
    };

    // Upload token image
    const handleUploadToken = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploadError(null);
        try {
            const result = await uploadFile({
                file,
                metadata: {
                    fileName: file.name,
                    contentType: file.type,
                    fileSize: file.size
                }
            }).unwrap();

            const isFirst = tokenResources.length === 0;
            onResourcesChange([...resources, {
                resourceId: result.resourceId!,
                role: ResourceRole.Token,
                isDefault: false  // NOT auto-default - user must Ctrl+click
            }]);

            // Auto-expand token album after first upload
            if (isFirst) {
                setExpandedAlbum('token');
            }
        } catch (error) {
            console.error('Upload failed:', error);
            setUploadError('Failed to upload token image. Please try again.');
        }
        event.target.value = '';
    };

    // Upload portrait image
    const handleUploadPortrait = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploadError(null);
        try {
            const result = await uploadFile({
                file,
                metadata: {
                    fileName: file.name,
                    contentType: file.type,
                    fileSize: file.size
                }
            }).unwrap();

            const isFirst = portraitResources.length === 0;
            onResourcesChange([...resources, {
                resourceId: result.resourceId!,
                role: ResourceRole.Portrait,
                isDefault: false  // NOT auto-default - user must Ctrl+click
            }]);

            // Auto-expand portrait album after first upload
            if (isFirst) {
                setExpandedAlbum('portrait');
            }
        } catch (error) {
            console.error('Upload failed:', error);
            setUploadError('Failed to upload portrait image. Please try again.');
        }
        event.target.value = '';
    };

    // Remove resource (doesn't auto-reassign default)
    const handleRemoveResource = (resourceId: string) => {
        const updated = resources.filter(r => r.resourceId !== resourceId);
        onResourcesChange(updated);
    };

    // Read-only mode
    if (readOnly) {
        return (
            <Box>
                <Grid container spacing={2}>
                    {/* Token */}
                    <Grid size={3}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                            Token
                        </Typography>
                        {defaultToken ? (
                            <Card sx={{ width: '100%', maxWidth: 150 }}>
                                <CardMedia
                                    component="img"
                                    height="128"
                                    image={getResourceUrl(defaultToken.resourceId)}
                                    alt="Token"
                                    sx={{ objectFit: 'contain', bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.100' }}
                                />
                                <Chip label="Default" size="small" color="primary" sx={{ m: 0.5 }} />
                            </Card>
                        ) : (
                            <Box sx={{
                                width: '100%',
                                maxWidth: 128,
                                height: 128,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100',
                                borderRadius: 1,
                                border: '1px dashed',
                                borderColor: 'divider'
                            }}>
                                <ImageIcon sx={{ fontSize: 32, color: 'text.disabled' }} />
                            </Box>
                        )}
                    </Grid>

                    {/* Portrait */}
                    <Grid size={9}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                            Portrait
                        </Typography>
                        {defaultPortrait ? (
                            <Card sx={{ width: '100%', maxWidth: 200 }}>
                                <CardMedia
                                    component="img"
                                    height="300"
                                    image={getResourceUrl(defaultPortrait.resourceId)}
                                    alt="Portrait"
                                    sx={{ objectFit: 'contain', bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.100' }}
                                />
                                <Chip label="Default" size="small" color="secondary" sx={{ m: 0.5 }} />
                            </Card>
                        ) : (
                            <Box sx={{
                                width: '100%',
                                maxWidth: 200,
                                height: 300,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100',
                                borderRadius: 1,
                                border: '1px dashed',
                                borderColor: 'divider'
                            }}>
                                <ImageIcon sx={{ fontSize: 32, color: 'text.disabled' }} />
                            </Box>
                        )}
                    </Grid>
                </Grid>
            </Box>
        );
    }

    return (
        <Box>
            {uploadError && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setUploadError(null)}>
                    {uploadError}
                </Alert>
            )}
            {/* Side-by-side: Token and Portrait */}
            <Grid container spacing={2} sx={{ mb: 2 }}>
                {/* TOKEN SECTION (Left Side) */}
                <Grid size={3}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body2" fontWeight={600}>Token</Typography>
                        <Button
                            size="small"
                            endIcon={expandedAlbum === 'token' ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            onClick={() => handleToggleAlbum('token')}
                        >
                            Manage
                        </Button>
                    </Box>

                    {/* Show default token */}
                    {defaultToken ? (
                        <Card sx={{ width: '100%', maxWidth: 128 }}>
                            <CardMedia
                                component="img"
                                height="128"
                                image={getResourceUrl(defaultToken.resourceId)}
                                alt="Default Token"
                                sx={{ objectFit: 'contain', bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.100' }}
                            />
                            <Chip label="Default" size="small" color="primary" sx={{ m: 0.5 }} />
                        </Card>
                    ) : (
                        <Box sx={{
                            width: '100%',
                            maxWidth: 128,
                            height: 128,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100',
                            borderRadius: 1,
                            border: '2px dashed',
                            borderColor: 'divider'
                        }}>
                            <ImageIcon sx={{ fontSize: 32, color: 'text.disabled' }} />
                        </Box>
                    )}
                </Grid>

                {/* PORTRAIT SECTION (Right Side) */}
                <Grid size={9}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body2" fontWeight={600}>Portrait</Typography>
                        <Button
                            size="small"
                            endIcon={expandedAlbum === 'portrait' ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            onClick={() => handleToggleAlbum('portrait')}
                        >
                            Manage
                        </Button>
                    </Box>

                    {/* Show default portrait */}
                    {defaultPortrait ? (
                        <Card sx={{ width: '100%', maxWidth: 200 }}>
                            <CardMedia
                                component="img"
                                height="300"
                                image={getResourceUrl(defaultPortrait.resourceId)}
                                alt="Default Portrait"
                                sx={{ objectFit: 'contain', bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.100' }}
                            />
                            <Chip label="Default" size="small" color="secondary" sx={{ m: 0.5 }} />
                        </Card>
                    ) : (
                        <Box sx={{
                            width: '100%',
                            maxWidth: 200,
                            height: 300,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100',
                            borderRadius: 1,
                            border: '2px dashed',
                            borderColor: 'divider'
                        }}>
                            <ImageIcon sx={{ fontSize: 32, color: 'text.disabled' }} />
                        </Box>
                    )}
                </Grid>
            </Grid>

            {/* EXPANDED ALBUM (Full Width Below) */}
            {expandedAlbum === 'token' && (
                <Box sx={{
                    p: 2,
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider'
                }}>
                    <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
                        Token Album
                    </Typography>
                    <Box sx={{
                        display: 'flex',
                        gap: 1,
                        overflowX: 'auto',
                        pb: 1,
                        '&::-webkit-scrollbar': { height: 6 },
                        '&::-webkit-scrollbar-thumb': {
                            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
                            borderRadius: 3
                        }
                    }}>
                        {tokenResources.map((resource) => (
                            <Card
                                key={resource.resourceId}
                                onClick={(e) => {
                                    if (e.ctrlKey) {
                                        handleSetDefault(resource.resourceId, ResourceRole.Token);
                                    }
                                }}
                                sx={{
                                    minWidth: 120,
                                    maxWidth: 120,
                                    cursor: 'pointer',
                                    position: 'relative',
                                    border: resource.isDefault ? '3px solid' : '1px solid',
                                    borderColor: resource.isDefault ? 'primary.main' : 'divider',
                                    '&:hover': {
                                        boxShadow: 2
                                    }
                                }}
                            >
                                <CardMedia
                                    component="img"
                                    height="100"
                                    image={getResourceUrl(resource.resourceId)}
                                    alt="Token"
                                    sx={{ objectFit: 'contain', bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.100' }}
                                />
                                {resource.isDefault && (
                                    <Chip
                                        label="Default"
                                        size="small"
                                        color="primary"
                                        sx={{ position: 'absolute', top: 4, left: 4 }}
                                    />
                                )}
                                <IconButton
                                    size="small"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemoveResource(resource.resourceId);
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
                        ))}

                        {/* Upload Button Card */}
                        <Card
                            component="label"
                            sx={{
                                minWidth: 120,
                                maxWidth: 120,
                                height: 116,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                border: '2px dashed',
                                borderColor: 'primary.main',
                                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                                '&:hover': {
                                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
                                }
                            }}
                        >
                            {isUploading ? (
                                <CircularProgress size={24} />
                            ) : (
                                <>
                                    <UploadIcon sx={{ fontSize: 32, color: 'primary.main', mb: 0.5 }} />
                                    <Typography variant="caption" color="primary">Upload</Typography>
                                </>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                hidden
                                onChange={handleUploadToken}
                                disabled={isUploading}
                            />
                        </Card>
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                        Ctrl+Click any image to toggle default token
                    </Typography>
                </Box>
            )}

            {expandedAlbum === 'portrait' && (
                <Box sx={{
                    p: 2,
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider'
                }}>
                    <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
                        Portrait Album
                    </Typography>
                    <Box sx={{
                        display: 'flex',
                        gap: 1,
                        overflowX: 'auto',
                        pb: 1,
                        '&::-webkit-scrollbar': { height: 6 },
                        '&::-webkit-scrollbar-thumb': {
                            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
                            borderRadius: 3
                        }
                    }}>
                        {portraitResources.map((resource) => (
                            <Card
                                key={resource.resourceId}
                                onClick={(e) => {
                                    if (e.ctrlKey) {
                                        handleSetDefault(resource.resourceId, ResourceRole.Portrait);
                                    }
                                }}
                                sx={{
                                    minWidth: 120,
                                    maxWidth: 120,
                                    cursor: 'pointer',
                                    position: 'relative',
                                    border: resource.isDefault ? '3px solid' : '1px solid',
                                    borderColor: resource.isDefault ? 'secondary.main' : 'divider',
                                    '&:hover': {
                                        boxShadow: 2
                                    }
                                }}
                            >
                                <CardMedia
                                    component="img"
                                    height="100"
                                    image={getResourceUrl(resource.resourceId)}
                                    alt="Portrait"
                                    sx={{ objectFit: 'contain', bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.100' }}
                                />
                                {resource.isDefault && (
                                    <Chip
                                        label="Default"
                                        size="small"
                                        color="secondary"
                                        sx={{ position: 'absolute', top: 4, left: 4 }}
                                    />
                                )}
                                <IconButton
                                    size="small"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemoveResource(resource.resourceId);
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
                        ))}

                        {/* Upload Button Card */}
                        <Card
                            component="label"
                            sx={{
                                minWidth: 120,
                                maxWidth: 120,
                                height: 116,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                border: '2px dashed',
                                borderColor: 'secondary.main',
                                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                                '&:hover': {
                                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
                                }
                            }}
                        >
                            {isUploading ? (
                                <CircularProgress size={24} />
                            ) : (
                                <>
                                    <UploadIcon sx={{ fontSize: 32, color: 'secondary.main', mb: 0.5 }} />
                                    <Typography variant="caption" color="secondary">Upload</Typography>
                                </>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                hidden
                                onChange={handleUploadPortrait}
                                disabled={isUploading}
                            />
                        </Card>
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                        Ctrl+Click any image to toggle default portrait
                    </Typography>
                </Box>
            )}
        </Box>
    );
};
