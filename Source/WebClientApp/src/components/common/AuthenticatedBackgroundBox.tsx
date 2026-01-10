import React from 'react';
import { Box, CircularProgress, type BoxProps } from '@mui/material';
import { useAuthenticatedImageUrl } from '@/hooks/useAuthenticatedImageUrl';

export interface AuthenticatedBackgroundBoxProps extends Omit<BoxProps, 'sx'> {
    resourceUrl: string | null | undefined;
    fallbackUrl?: string;
    backgroundSize?: 'cover' | 'contain' | 'auto';
    backgroundPosition?: string;
    backgroundAttachment?: 'scroll' | 'fixed' | 'local';
    showLoading?: boolean;
    sx?: BoxProps['sx'];
    overlayContent?: React.ReactNode;
}

export const AuthenticatedBackgroundBox: React.FC<AuthenticatedBackgroundBoxProps> = ({
    resourceUrl,
    fallbackUrl,
    backgroundSize = 'cover',
    backgroundPosition = 'center',
    backgroundAttachment = 'scroll',
    showLoading = false,
    sx,
    overlayContent,
    children,
    ...boxProps
}) => {
    const { blobUrl, isLoading } = useAuthenticatedImageUrl(resourceUrl);

    const effectiveUrl = blobUrl || fallbackUrl;

    return (
        <Box
            {...boxProps}
            sx={{
                position: 'relative',
                backgroundImage: effectiveUrl ? `url(${effectiveUrl})` : 'none',
                backgroundSize,
                backgroundPosition,
                backgroundAttachment,
                backgroundRepeat: 'no-repeat',
                ...sx,
            }}
        >
            {isLoading && showLoading && (
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        zIndex: 1,
                    }}
                >
                    <CircularProgress size={24} />
                </Box>
            )}
            {overlayContent}
            {children}
        </Box>
    );
};

export default AuthenticatedBackgroundBox;
