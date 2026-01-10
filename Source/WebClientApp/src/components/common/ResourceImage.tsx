import React from 'react';
import { Box, CircularProgress, SxProps, Theme } from '@mui/material';
import { useResourceUrl } from '@/hooks/useResourceUrl';

export interface ResourceImageProps {
  resourceId: string | null | undefined;
  alt: string;
  sx?: SxProps<Theme>;
  fallback?: React.ReactNode;
  loadingSize?: number;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
}

export const ResourceImage: React.FC<ResourceImageProps> = ({
  resourceId,
  alt,
  sx,
  fallback = null,
  loadingSize = 24,
  objectFit = 'cover',
}) => {
  const { url, isLoading, error } = useResourceUrl(resourceId);

  if (!resourceId) {
    return <>{fallback}</>;
  }

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
        }}
      >
        <CircularProgress size={loadingSize} />
      </Box>
    );
  }

  if (error || !url) {
    return <>{fallback}</>;
  }

  return (
    <Box
      component="img"
      src={url}
      alt={alt}
      sx={{
        width: '100%',
        height: '100%',
        objectFit,
        ...sx,
      }}
    />
  );
};

export default ResourceImage;
