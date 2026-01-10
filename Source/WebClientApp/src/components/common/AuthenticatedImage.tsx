import React from 'react';
import { Box, CircularProgress, useTheme } from '@mui/material';
import { BrokenImage as BrokenImageIcon } from '@mui/icons-material';
import { useAuthenticatedResourceCached } from '@/hooks/useAuthenticatedResource';

export interface AuthenticatedImageProps {
    resourceId?: string | null;
    resourcePath?: string | null;
    alt: string;
    width?: number | string;
    height?: number | string;
    objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
    fallback?: React.ReactNode;
    showLoading?: boolean;
    sx?: Record<string, unknown>;
}

export const AuthenticatedImage: React.FC<AuthenticatedImageProps> = ({
    resourceId,
    resourcePath,
    alt,
    width = '100%',
    height = '100%',
    objectFit = 'cover',
    fallback,
    showLoading = true,
    sx,
}) => {
    const theme = useTheme();

    const path = resourcePath ?? (resourceId ? resourceId : null);
    const { url, isLoading, error } = useAuthenticatedResourceCached(path);

    if (isLoading && showLoading) {
        return (
            <Box
                sx={{
                    width,
                    height,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: theme.palette.action.hover,
                    ...sx,
                }}
            >
                <CircularProgress size={24} />
            </Box>
        );
    }

    if (error || !url) {
        if (fallback) {
            return <>{fallback}</>;
        }
        return (
            <Box
                sx={{
                    width,
                    height,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: theme.palette.action.hover,
                    ...sx,
                }}
            >
                <BrokenImageIcon sx={{ color: theme.palette.text.disabled }} />
            </Box>
        );
    }

    return (
        <Box
            component="img"
            src={url}
            alt={alt}
            sx={{
                width,
                height,
                objectFit,
                ...sx,
            }}
        />
    );
};

export default AuthenticatedImage;
