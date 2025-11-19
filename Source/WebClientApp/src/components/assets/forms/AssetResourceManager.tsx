import { Close as CloseIcon, CloudUpload as UploadIcon } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Card,
  CardMedia,
  Chip,
  CircularProgress,
  Grid,
  IconButton,
  Typography,
  useTheme,
} from '@mui/material';
import type React from 'react';
import { useState } from 'react';
import { DisplayPreview } from '@/components/common/DisplayPreview';
import { TokenPreview } from '@/components/common/TokenPreview';
import { useUploadFileMutation } from '@/services/mediaApi';
import { AssetKind, type NamedSize } from '@/types/domain';
import { getResourceUrl } from '@/utils/assetHelpers';

export interface AssetResourceManagerProps {
  assetKind: AssetKind;
  portraitId?: string | undefined;
  topDownId?: string | undefined;
  miniatureId?: string | undefined;
  photoId?: string | undefined;
  onPortraitIdChange: (portraitId: string | undefined) => void;
  onTopDownIdChange: (topDownId: string | undefined) => void;
  onMiniatureIdChange: (miniatureId: string | undefined) => void;
  onPhotoIdChange: (photoId: string | undefined) => void;
  size: NamedSize;
  readOnly?: boolean;
  entityId?: string | undefined;
}

export const AssetResourceManager: React.FC<AssetResourceManagerProps> = ({
  assetKind,
  portraitId,
  topDownId,
  miniatureId,
  photoId,
  onPortraitIdChange,
  onTopDownIdChange,
  onMiniatureIdChange,
  onPhotoIdChange,
  size,
  readOnly = false,
  entityId,
}) => {
  const theme = useTheme();
  const [uploadFile, { isLoading: isUploading }] = useUploadFileMutation();
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>, onChange: (id: string) => void) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    try {
      const result = await uploadFile({
        file,
        ...(entityId ? { entityId } : {}),
      }).unwrap();

      onChange(result.id);
    } catch (error: unknown) {
      const errorMessage =
        (error as { data?: { detail?: string; title?: string }; error?: string; message?: string })?.data?.detail ||
        (error as { data?: { detail?: string; title?: string }; error?: string; message?: string })?.data?.title ||
        (error as { data?: { detail?: string; title?: string }; error?: string; message?: string })?.error ||
        (error as { message?: string })?.message ||
        JSON.stringify(error);
      setUploadError(`Failed to upload image: ${errorMessage}`);
    }
    event.target.value = '';
  };

  const renderImageSection = (
    title: string,
    description: string,
    imageId: string | undefined,
    onRemove: () => void,
    onUpload: (event: React.ChangeEvent<HTMLInputElement>) => void,
    useTokenPreview: boolean = false,
    isDefault: boolean = false,
  ) => (
    <Box
      sx={{
        p: 2,
        bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
        borderRadius: 1,
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Typography variant='subtitle2'>{title}</Typography>
          {isDefault && <Chip label='Default' size='small' color='primary' />}
          <Typography variant='caption' color='text.secondary' sx={{ width: '100%' }}>
            {description}
          </Typography>
        </Box>
        {!readOnly && (
          <Button
            component='label'
            size='small'
            startIcon={isUploading ? <CircularProgress size={16} /> : <UploadIcon />}
            disabled={isUploading}
          >
            Upload
            <input
              type='file'
              accept='image/jpeg,image/png,image/svg+xml,image/gif,image/webp,image/bmp,image/tiff'
              hidden
              onChange={onUpload}
              disabled={isUploading}
            />
          </Button>
        )}
      </Box>

      {imageId ? (
        <Box sx={{ position: 'relative', display: 'inline-block' }}>
          {useTokenPreview ? (
            <TokenPreview imageUrl={getResourceUrl(imageId)} size={size} />
          ) : (
            <Card sx={{ width: 180 }}>
              <CardMedia
                component='img'
                height='180'
                image={getResourceUrl(imageId)}
                alt={title}
                crossOrigin='use-credentials'
                sx={{
                  objectFit: 'contain',
                  bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.100',
                }}
              />
            </Card>
          )}
          {!readOnly && (
            <IconButton
              size='small'
              onClick={onRemove}
              sx={{
                position: 'absolute',
                top: 4,
                right: 4,
                bgcolor: 'background.paper',
                '&:hover': { bgcolor: 'error.main', color: 'white' },
              }}
            >
              <CloseIcon fontSize='small' />
            </IconButton>
          )}
        </Box>
      ) : (
        <Box
          sx={{
            textAlign: 'center',
            py: 4,
            border: '2px dashed',
            borderColor: 'divider',
            borderRadius: 1,
          }}
        >
          <Typography variant='body2' color='text.secondary'>
            No image uploaded yet
          </Typography>
        </Box>
      )}
    </Box>
  );

  const isObject = assetKind === AssetKind.Object;

  if (readOnly) {
    return (
      <Box>
        <Typography variant='subtitle2' sx={{ mb: 2 }}>
          Asset Images
        </Typography>
        <Grid container spacing={2}>
          {topDownId && (
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Typography variant='caption' color='text.secondary'>
                  Top-Down
                </Typography>
                <Chip label='Default' size='small' color='primary' />
              </Box>
              <TokenPreview imageUrl={getResourceUrl(topDownId)} size={size} />
            </Grid>
          )}
          {portraitId && (
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant='caption' color='text.secondary' sx={{ mb: 0.5, display: 'block' }}>
                Portrait
              </Typography>
              <DisplayPreview imageUrl={getResourceUrl(portraitId)} />
            </Grid>
          )}
          {miniatureId && (
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant='caption' color='text.secondary' sx={{ mb: 0.5, display: 'block' }}>
                Miniature
              </Typography>
              <TokenPreview imageUrl={getResourceUrl(miniatureId)} size={size} />
            </Grid>
          )}
          {!isObject && photoId && (
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant='caption' color='text.secondary' sx={{ mb: 0.5, display: 'block' }}>
                Photo
              </Typography>
              <DisplayPreview imageUrl={getResourceUrl(photoId)} />
            </Grid>
          )}
        </Grid>
      </Box>
    );
  }

  return (
    <Box>
      {uploadError && (
        <Alert severity='error' sx={{ mb: 2 }} onClose={() => setUploadError(null)}>
          {uploadError}
        </Alert>
      )}

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          {renderImageSection(
            'Portrait',
            'Full image for asset details and stat blocks',
            portraitId,
            () => onPortraitIdChange(undefined),
            (e) => handleUpload(e, onPortraitIdChange),
            false,
            false,
          )}
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          {renderImageSection(
            'Top-Down View',
            'Bird\'s eye view for square/hex grids',
            topDownId,
            () => onTopDownIdChange(undefined),
            (e) => handleUpload(e, onTopDownIdChange),
            true,
            true,
          )}
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          {renderImageSection(
            'Miniature View',
            'Isometric view for isometric maps',
            miniatureId,
            () => onMiniatureIdChange(undefined),
            (e) => handleUpload(e, onMiniatureIdChange),
            true,
            false,
          )}
        </Grid>

        {!isObject && (
          <Grid size={{ xs: 12, md: 6 }}>
            {renderImageSection(
              'Photo',
              '3/4 face view with frame (creatures only)',
              photoId,
              () => onPhotoIdChange(undefined),
              (e) => handleUpload(e, onPhotoIdChange),
              false,
              false,
            )}
          </Grid>
        )}
      </Grid>
    </Box>
  );
};
