import { Close as CloseIcon, CloudUpload as UploadIcon } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Grid,
  IconButton,
  Typography,
  useTheme,
} from '@mui/material';
import type React from 'react';
import { useState } from 'react';
import { DisplayPreview } from '@/components/common/DisplayPreview';
import { ResourceImage } from '@/components/common/ResourceImage';
import { TokenPreview } from '@/components/common/TokenPreview';
import { useUploadFileMutation } from '@/services/mediaApi';
import type { NamedSize } from '@/types/domain';

export interface AssetResourceManagerProps {
  portraitId?: string;
  tokenId?: string;
  onPortraitChange: (id: string | undefined) => void;
  onTokenChange: (id: string | undefined) => void;
  tokenSize?: NamedSize;
  readOnly?: boolean;
  entityId?: string;
}

export const AssetResourceManager: React.FC<AssetResourceManagerProps> = ({
  portraitId,
  tokenId,
  onPortraitChange,
  onTokenChange,
  tokenSize = { width: 1, height: 1 },
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
            <TokenPreview resourceId={imageId} size={tokenSize} />
          ) : (
            <Box
              sx={{
                width: 180,
                height: 180,
                borderRadius: 1,
                overflow: 'hidden',
                bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.100',
              }}
            >
              <ResourceImage
                resourceId={imageId}
                alt={title}
                objectFit='contain'
                loadingSize={40}
              />
            </Box>
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

  if (readOnly) {
    return (
      <Box>
        <Typography variant='subtitle2' sx={{ mb: 2 }}>
          Asset Images
        </Typography>
        <Grid container spacing={2}>
          {portraitId && (
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant='caption' color='text.secondary' sx={{ mb: 0.5, display: 'block' }}>
                Portrait
              </Typography>
              <DisplayPreview resourceId={portraitId} />
            </Grid>
          )}
          {tokenId && (
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant='caption' color='text.secondary' sx={{ mb: 0.5, display: 'block' }}>
                Token
              </Typography>
              <TokenPreview resourceId={tokenId} size={tokenSize} />
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
            'Full image for asset details and library views',
            portraitId,
            () => onPortraitChange(undefined),
            (e) => handleUpload(e, onPortraitChange),
            false,
          )}
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          {renderImageSection(
            'Token',
            'Visual representation for encounter placement',
            tokenId,
            () => onTokenChange(undefined),
            (e) => handleUpload(e, onTokenChange),
            true,
          )}
        </Grid>
      </Grid>
    </Box>
  );
};
