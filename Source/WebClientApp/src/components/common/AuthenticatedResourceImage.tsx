import React from 'react';
import { Box, CircularProgress, SxProps, Theme } from '@mui/material';
import { useAuthenticatedImageUrl } from '@/hooks/useAuthenticatedImageUrl';

export interface AuthenticatedResourceImageProps {
  resourceUrl: string | null | undefined;
  alt: string;
  sx?: SxProps<Theme>;
  fallback?: React.ReactNode;
  loadingSize?: number;
}

export const AuthenticatedResourceImage: React.FC<AuthenticatedResourceImageProps> = ({
  resourceUrl,
  alt,
  sx,
  fallback = null,
  loadingSize = 24,
}) => {
  const { blobUrl, isLoading } = useAuthenticatedImageUrl(resourceUrl);

  if (!resourceUrl) {
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

  if (!blobUrl) {
    return <>{fallback}</>;
  }

  return (
    <Box
      component="img"
      src={blobUrl}
      alt={alt}
      {...(sx && { sx })}
    />
  );
};

export default AuthenticatedResourceImage;
