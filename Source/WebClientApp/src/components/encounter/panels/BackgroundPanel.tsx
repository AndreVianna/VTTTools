import React from 'react';
import { Box, IconButton, CircularProgress, Typography, useTheme } from '@mui/material';
import { PhotoCamera as PhotoCameraIcon } from '@mui/icons-material';

const ENCOUNTER_DEFAULT_BACKGROUND = '/assets/backgrounds/tavern.png';

export interface BackgroundPanelProps {
    backgroundUrl?: string;
    isUploadingBackground?: boolean;
    onBackgroundUpload?: (file: File) => void;
}

export const BackgroundPanel: React.FC<BackgroundPanelProps> = ({
    backgroundUrl,
    isUploadingBackground,
    onBackgroundUpload
}) => {
    const theme = useTheme();
    const effectiveBackgroundUrl = backgroundUrl || ENCOUNTER_DEFAULT_BACKGROUND;

    const handleBackgroundFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && onBackgroundUpload) {
            onBackgroundUpload(file);
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Typography
                variant="overline"
                sx={{
                    fontSize: '10px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    color: theme.palette.text.secondary,
                    mb: 0
                }}
            >
                Background Image
            </Typography>

            <Box
                sx={{
                    width: '100%',
                    height: 140,
                    aspectRatio: '16/9',
                    borderRadius: 1,
                    overflow: 'hidden',
                    position: 'relative',
                    border: `1px solid ${theme.palette.divider}`,
                    backgroundImage: `url(${effectiveBackgroundUrl})`,
                    backgroundSize: 'cover',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                    bgcolor: theme.palette.background.default
                }}
            >
                {isUploadingBackground && (
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: 'rgba(0, 0, 0, 0.5)'
                        }}
                    >
                        <CircularProgress size={24} />
                    </Box>
                )}
                <IconButton
                    component="label"
                    disabled={isUploadingBackground ?? false}
                    sx={{
                        position: 'absolute',
                        bottom: 6,
                        right: 6,
                        bgcolor: 'rgba(0, 0, 0, 0.6)',
                        color: 'white',
                        width: 28,
                        height: 28,
                        '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.8)' },
                        '&:disabled': { bgcolor: 'rgba(0, 0, 0, 0.3)' }
                    }}
                    aria-label="Change background image"
                >
                    <PhotoCameraIcon sx={{ fontSize: 16 }} />
                    <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={handleBackgroundFileChange}
                    />
                </IconButton>
                {!backgroundUrl && (
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 6,
                            left: 6,
                            bgcolor: 'rgba(0, 0, 0, 0.6)',
                            color: 'white',
                            px: 0.75,
                            py: 0.25,
                            borderRadius: 0.5,
                            fontSize: '9px',
                            fontWeight: 600
                        }}
                    >
                        DEFAULT
                    </Box>
                )}
            </Box>
        </Box>
    );
};
