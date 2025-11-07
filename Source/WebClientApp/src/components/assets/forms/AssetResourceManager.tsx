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
    CheckCircle as DefaultIcon
} from '@mui/icons-material';
import { AssetToken, NamedSize, ResourceType } from '@/types/domain';
import { useUploadFileMutation } from '@/services/mediaApi';
import { getResourceUrl } from '@/utils/assetHelpers';
import { TokenPreview } from '@/components/common/TokenPreview';
import { DisplayPreview } from '@/components/common/DisplayPreview';

export interface AssetResourceManagerProps {
    tokens: AssetToken[];
    onTokensChange: (tokens: AssetToken[]) => void;
    portraitId?: string | undefined;
    onPortraitIdChange: (portraitId: string | undefined) => void;
    size: NamedSize;
    readOnly?: boolean;
    entityId?: string | undefined;
}

export const AssetResourceManager: React.FC<AssetResourceManagerProps> = ({
    tokens,
    onTokensChange,
    portraitId,
    onPortraitIdChange,
    size,
    readOnly = false,
    entityId
}) => {
    const theme = useTheme();
    const [uploadFile, { isLoading: isUploading }] = useUploadFileMutation();
    const [uploadError, setUploadError] = useState<string | null>(null);

    const defaultToken = tokens.find(t => t.isDefault);

    const handleUploadToken = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        const contentType = file?.type;
        const fileName = file?.name;
        const fileLength = file?.size;
        if (!file) return;

        setUploadError(null);
        try {
            const result = await uploadFile({
                file,
                ...(entityId ? { entityId } : {})
            }).unwrap();

            const isFirstToken = tokens.length === 0;
            const newToken: AssetToken = {
                token: { 
                    id: result.id,
                    type: ResourceType.Image,
                    path: '',
                    metadata: {
                        contentType: contentType ?? '',
                        fileName: fileName ?? '',
                        fileLength: fileLength ?? 0,
                        imageSize: { width: 0, height: 0 },
                        duration: '0:00:00.0000000',
                    },
                    tags: [],
                },
                isDefault: isFirstToken
            };

            onTokensChange([...tokens, newToken]);
        } catch (error: any) {
            const errorMessage = error?.data?.detail || error?.data?.title || error?.error || error?.message || JSON.stringify(error);
            setUploadError(`Failed to upload token: ${errorMessage}`);
        }
        event.target.value = '';
    };

    const handleUploadPortrait = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploadError(null);
        try {
            const result = await uploadFile({
                file,
                ...(entityId ? { entityId } : {})
            }).unwrap();

            onPortraitIdChange(result.id);
        } catch (error: any) {
            const errorMessage = error?.data?.detail || error?.data?.title || error?.error || error?.message || JSON.stringify(error);
            setUploadError(`Failed to upload portrait: ${errorMessage}`);
        }
        event.target.value = '';
    };

    const handleSetDefaultToken = (tokenId: string) => {
        const updated = tokens.map(t => ({
            ...t,
            isDefault: t.token.id === tokenId
        }));
        onTokensChange(updated);
    };

    const handleRemoveToken = (tokenId: string) => {
        const updated = tokens.filter(t => t.token.id !== tokenId);

        if (updated.length > 0) {
            const hadDefault = tokens.find(t => t.token.id === tokenId)?.isDefault;
            if (hadDefault && updated[0]) {
                updated[0].isDefault = true;
            }
        }

        onTokensChange(updated);
    };

    const handleRemovePortrait = () => {
        onPortraitIdChange(undefined);
    };

    if (readOnly) {
        return (
            <Box>
                <Typography variant="subtitle2" sx={{ mb: 2 }}>Asset Images</Typography>
                <Grid container spacing={2}>
                    <Grid size={6}>
                        <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                            Default Token
                        </Typography>
                        {defaultToken ? (
                            <TokenPreview
                                imageUrl={getResourceUrl(defaultToken.token.id)}
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
                            Portrait
                        </Typography>
                        {portraitId ? (
                            <DisplayPreview
                                imageUrl={getResourceUrl(portraitId)}
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
                                <Typography variant="caption" color="text.secondary">No portrait</Typography>
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

            <Box sx={{
                p: 2,
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'divider',
                mb: 2
            }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle2">Tokens (Battle Map)</Typography>
                    <Button
                        component="label"
                        size="small"
                        startIcon={isUploading ? <CircularProgress size={16} /> : <UploadIcon />}
                        disabled={isUploading}
                    >
                        Upload Token
                        <input
                            type="file"
                            accept="image/jpeg,image/png,image/svg+xml,image/gif,image/webp,image/bmp,image/tiff"
                            hidden
                            onChange={handleUploadToken}
                            disabled={isUploading}
                        />
                    </Button>
                </Box>

                {tokens.length > 0 ? (
                    <Grid container spacing={1}>
                        {tokens.map((token) => (
                            <Grid size={{ xs: 6, sm: 4, md: 3 }} key={token.token.id}>
                                <Card
                                    sx={{
                                        position: 'relative',
                                        border: '2px solid',
                                        borderColor: token.isDefault ? 'primary.main' : 'divider'
                                    }}
                                >
                                    <CardMedia
                                        component="img"
                                        height="100"
                                        image={getResourceUrl(token.token.id)}
                                        alt="Token"
                                        sx={{ objectFit: 'contain', bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.100' }}
                                    />

                                    {token.isDefault && (
                                        <Chip
                                            icon={<DefaultIcon sx={{ fontSize: 14 }} />}
                                            label="Default"
                                            size="small"
                                            color="primary"
                                            sx={{ position: 'absolute', bottom: 4, left: 4, height: 20 }}
                                        />
                                    )}

                                    <Box sx={{ position: 'absolute', top: 4, right: 4, display: 'flex', gap: 0.5 }}>
                                        {!token.isDefault && (
                                            <IconButton
                                                size="small"
                                                onClick={() => handleSetDefaultToken(token.token.id)}
                                                sx={{
                                                    bgcolor: 'background.paper',
                                                    '&:hover': { bgcolor: 'primary.main', color: 'white' }
                                                }}
                                                title="Set as default"
                                            >
                                                <DefaultIcon fontSize="small" />
                                            </IconButton>
                                        )}
                                        <IconButton
                                            size="small"
                                            onClick={() => handleRemoveToken(token.token.id)}
                                            sx={{
                                                bgcolor: 'background.paper',
                                                '&:hover': { bgcolor: 'error.main', color: 'white' }
                                            }}
                                        >
                                            <CloseIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                </Card>
                            </Grid>
                        ))}
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
                            No tokens uploaded yet
                        </Typography>
                    </Box>
                )}
            </Box>

            <Box sx={{
                p: 2,
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'divider'
            }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle2">Portrait (Character Sheet)</Typography>
                    <Button
                        component="label"
                        size="small"
                        startIcon={isUploading ? <CircularProgress size={16} /> : <UploadIcon />}
                        disabled={isUploading}
                    >
                        Upload Portrait
                        <input
                            type="file"
                            accept="image/jpeg,image/png,image/svg+xml,image/gif,image/webp,image/bmp,image/tiff"
                            hidden
                            onChange={handleUploadPortrait}
                            disabled={isUploading}
                        />
                    </Button>
                </Box>

                {portraitId ? (
                    <Box sx={{ position: 'relative', display: 'inline-block' }}>
                        <Card sx={{ width: 180 }}>
                            <CardMedia
                                component="img"
                                height="180"
                                image={getResourceUrl(portraitId)}
                                alt="Portrait"
                                sx={{ objectFit: 'contain', bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.100' }}
                            />
                        </Card>
                        <IconButton
                            size="small"
                            onClick={handleRemovePortrait}
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
                    </Box>
                ) : (
                    <Box sx={{
                        textAlign: 'center',
                        py: 4,
                        border: '2px dashed',
                        borderColor: 'divider',
                        borderRadius: 1
                    }}>
                        <Typography variant="body2" color="text.secondary">
                            No portrait uploaded yet
                        </Typography>
                    </Box>
                )}
            </Box>
        </Box>
    );
};
