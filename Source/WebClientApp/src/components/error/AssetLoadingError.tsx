import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  Skeleton,
  IconButton,
  Tooltip,
  Stack,
  Chip,
} from '@mui/material';
import {
  BrokenImage as BrokenImageIcon,
  Refresh as RefreshIcon,
  CloudOff as CloudOffIcon,
  ErrorOutline as ErrorIcon,
  Image as ImageIcon,
  Movie as VideoIcon,
  AudioFile as AudioIcon,
  InsertDriveFile as FileIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { handleAssetLoadingError, retryOperation } from '@/utils/errorHandling';

/**
 * UC034 - Asset Loading Failure Handling
 * Asset loading error detection, fallback displays, and retry mechanisms
 */

export interface AssetErrorProps {
  assetId?: string;
  assetType: 'image' | 'video' | 'audio' | 'model' | 'unknown';
  assetUrl?: string;
  assetName?: string;
  onRetry?: () => Promise<void>;
  onFallback?: () => void;
  showRetry?: boolean;
  showFallback?: boolean;
  maxRetries?: number;
  children?: React.ReactNode;
}

/**
 * Main asset loading error component with retry and fallback functionality
 */
export const AssetLoadingError: React.FC<AssetErrorProps> = ({
  assetId,
  assetType,
  assetUrl,
  assetName,
  onRetry,
  onFallback,
  showRetry = true,
  showFallback = true,
  maxRetries = 3,
  children,
}) => {
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [lastError, setLastError] = useState<string>('');

  const canRetry = showRetry && retryCount < maxRetries && onRetry;

  const handleRetry = async () => {
    if (!onRetry || isRetrying) return;

    setIsRetrying(true);
    setRetryCount(prev => prev + 1);

    try {
      await retryOperation(onRetry, {
        maxRetries: 1, // Single retry per button click
        delay: 1000,
        exponentialBackoff: false,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load asset';
      setLastError(errorMessage);

      handleAssetLoadingError(error, {
        assetId,
        assetType,
        assetUrl,
        assetName,
        retryCount: retryCount + 1,
      });
    } finally {
      setIsRetrying(false);
    }
  };

  const getAssetIcon = () => {
    switch (assetType) {
      case 'image': return <ImageIcon sx={{ fontSize: 48 }} />;
      case 'video': return <VideoIcon sx={{ fontSize: 48 }} />;
      case 'audio': return <AudioIcon sx={{ fontSize: 48 }} />;
      case 'model': return <FileIcon sx={{ fontSize: 48 }} />;
      default: return <BrokenImageIcon sx={{ fontSize: 48 }} />;
    }
  };

  const getErrorTitle = () => {
    switch (assetType) {
      case 'image': return 'Image failed to load';
      case 'video': return 'Video failed to load';
      case 'audio': return 'Audio failed to load';
      case 'model': return '3D model failed to load';
      default: return 'Asset failed to load';
    }
  };

  return (
    <Card
      variant="outlined"
      sx={{
        borderColor: 'error.main',
        backgroundColor: 'error.light',
        color: 'error.contrastText',
        minHeight: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <CardContent sx={{ textAlign: 'center', p: 3 }}>
        <Box
          sx={{
            color: 'error.main',
            mb: 2,
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          {getAssetIcon()}
        </Box>

        <Typography variant="h6" gutterBottom color="error">
          {getErrorTitle()}
        </Typography>

        {assetName && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Asset: {assetName}
          </Typography>
        )}

        {lastError && (
          <Alert severity="warning" size="small" sx={{ mb: 2, textAlign: 'left' }}>
            <Typography variant="caption">
              {lastError}
            </Typography>
          </Alert>
        )}

        <Stack spacing={1} alignItems="center">
          {canRetry && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<RefreshIcon />}
              onClick={handleRetry}
              disabled={isRetrying}
              size="small"
            >
              {isRetrying ? 'Retrying...' : `Retry (${maxRetries - retryCount} left)`}
            </Button>
          )}

          {showFallback && (
            <Button
              variant="outlined"
              color="secondary"
              onClick={onFallback}
              size="small"
            >
              Use Fallback
            </Button>
          )}

          {retryCount >= maxRetries && (
            <Chip
              label="Max retries reached"
              color="error"
              size="small"
              icon={<WarningIcon />}
            />
          )}
        </Stack>

        {children}
      </CardContent>
    </Card>
  );
};

/**
 * Specialized image loading error component
 */
export const ImageLoadingError: React.FC<Omit<AssetErrorProps, 'assetType'> & {
  width?: number | string;
  height?: number | string;
  alt?: string;
}> = ({ width = '100%', height = 200, alt, ...props }) => {
  return (
    <Box
      sx={{
        width,
        height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '2px dashed',
        borderColor: 'error.main',
        borderRadius: 2,
        backgroundColor: 'error.light',
        color: 'error.contrastText',
      }}
    >
      <AssetLoadingError
        {...props}
        assetType="image"
      >
        {alt && (
          <Typography variant="caption" sx={{ mt: 1 }}>
            Alt: {alt}
          </Typography>
        )}
      </AssetLoadingError>
    </Box>
  );
};

/**
 * Asset loading skeleton with error handling
 */
interface AssetSkeletonProps {
  isLoading: boolean;
  hasError: boolean;
  width?: number | string;
  height?: number | string;
  variant?: 'rectangular' | 'circular' | 'text';
  errorProps?: AssetErrorProps;
}

export const AssetSkeleton: React.FC<AssetSkeletonProps> = ({
  isLoading,
  hasError,
  width = '100%',
  height = 200,
  variant = 'rectangular',
  errorProps,
  children,
}) => {
  if (isLoading) {
    return (
      <Skeleton
        variant={variant}
        width={width}
        height={height}
        animation="wave"
      />
    );
  }

  if (hasError && errorProps) {
    return <AssetLoadingError {...errorProps} />;
  }

  return <>{children}</>;
};

/**
 * Enhanced image component with loading states and error handling
 */
interface SafeImageProps {
  src: string;
  alt: string;
  assetId?: string;
  assetName?: string;
  fallbackSrc?: string;
  onError?: (error: Event) => void;
  onLoad?: () => void;
  maxRetries?: number;
  width?: number | string;
  height?: number | string;
  [key: string]: any; // For other img props
}

export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt,
  assetId,
  assetName,
  fallbackSrc,
  onError,
  onLoad,
  maxRetries = 3,
  width,
  height,
  ...imgProps
}) => {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    setCurrentSrc(src);
    setHasError(false);
    setRetryCount(0);
    setIsLoading(true);
  }, [src]);

  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    setIsLoading(false);
    setHasError(true);

    onError?.(event.nativeEvent);

    handleAssetLoadingError(new Error('Image failed to load'), {
      assetId,
      assetType: 'image',
      assetUrl: currentSrc,
      assetName: assetName || alt,
      retryCount,
    });
  };

  const handleImageLoad = () => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.();
  };

  const handleRetry = async () => {
    setRetryCount(prev => prev + 1);
    setIsLoading(true);
    setHasError(false);

    // Force reload by adding timestamp
    const separator = currentSrc.includes('?') ? '&' : '?';
    setCurrentSrc(`${currentSrc}${separator}t=${Date.now()}`);
  };

  const handleFallback = () => {
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setHasError(false);
      setIsLoading(true);
      setRetryCount(0);
    }
  };

  return (
    <AssetSkeleton
      isLoading={isLoading}
      hasError={hasError}
      width={width}
      height={height}
      variant="rectangular"
      errorProps={{
        assetId,
        assetType: 'image',
        assetUrl: currentSrc,
        assetName: assetName || alt,
        onRetry: handleRetry,
        onFallback: fallbackSrc ? handleFallback : undefined,
        maxRetries,
        showFallback: Boolean(fallbackSrc),
      }}
    >
      <img
        {...imgProps}
        src={currentSrc}
        alt={alt}
        onError={handleImageError}
        onLoad={handleImageLoad}
        style={{
          width,
          height,
          objectFit: 'cover',
          display: hasError ? 'none' : 'block',
          ...imgProps.style,
        }}
      />
    </AssetSkeleton>
  );
};

/**
 * Asset grid with error handling for multiple assets
 */
interface AssetGridErrorProps {
  assets: Array<{
    id: string;
    url: string;
    name: string;
    type: AssetErrorProps['assetType'];
  }>;
  failedAssets: string[];
  onRetryAsset: (assetId: string) => Promise<void>;
  onRemoveAsset?: (assetId: string) => void;
}

export const AssetGridError: React.FC<AssetGridErrorProps> = ({
  assets,
  failedAssets,
  onRetryAsset,
  onRemoveAsset,
}) => {
  const failedCount = failedAssets.length;
  const totalCount = assets.length;

  if (failedCount === 0) {
    return null;
  }

  return (
    <Alert
      severity="warning"
      sx={{ mb: 2 }}
      action={
        <Button
          color="inherit"
          size="small"
          onClick={() => {
            failedAssets.forEach(id => onRetryAsset(id));
          }}
        >
          Retry All ({failedCount})
        </Button>
      }
    >
      <AlertTitle>Asset Loading Issues</AlertTitle>
      <Typography variant="body2">
        {failedCount} of {totalCount} assets failed to load.
        You can retry individual assets or use the "Retry All" button.
      </Typography>
    </Alert>
  );
};

export default AssetLoadingError;