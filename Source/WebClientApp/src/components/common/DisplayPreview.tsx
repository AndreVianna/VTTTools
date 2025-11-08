// DisplayPreview Component
// Renders asset display image with proportional scaling (no grid background)
// Scales to fit within maxSize while maintaining aspect ratio

import React from 'react';
import { Box, useTheme } from '@mui/material';

export interface DisplayPreviewProps {
    imageUrl: string;
    maxSize?: number;  // Maximum dimension on longest side (default: 320px)
    alt?: string;
}

const MAX_SIZE = 320;  // Maximum render size

export const DisplayPreview: React.FC<DisplayPreviewProps> = ({
    imageUrl,
    maxSize = MAX_SIZE,
    alt = 'Display'
}) => {
    const theme = useTheme();

    return (
        <Box
            sx={{
                maxWidth: maxSize,
                maxHeight: maxSize,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
            }}
        >
            <Box
                component="img"
                src={imageUrl}
                alt={alt}
                crossOrigin="use-credentials"
                sx={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain'
                }}
            />
        </Box>
    );
};
