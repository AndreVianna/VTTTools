import {
    Close as CloseIcon,
    FolderOpen as FolderOpenIcon,
    Pause as PauseIcon,
    PhotoCamera as PhotoCameraIcon,
    PlayArrow as PlayArrowIcon,
    Videocam as VideocamIcon,
    VolumeOff as VolumeOffIcon,
    VolumeUp as VolumeUpIcon,
} from '@mui/icons-material';
import { Box, CircularProgress, IconButton, Tooltip, Typography, useTheme } from '@mui/material';
import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { BACKGROUND_PICKER_CONFIG, ResourcePickerDialog } from '@/components/resource-picker';
import type { MediaResource } from '@/types/domain';

const ENCOUNTER_DEFAULT_BACKGROUND = '/assets/backgrounds/tavern.png';
const ACCEPTED_MEDIA_TYPES = 'image/*,video/mp4,video/webm,video/ogg';

export interface BackgroundPanelProps {
    /** Custom label for the section (e.g., "DM Background" or "Player Background") */
    label?: string;
    backgroundUrl?: string;
    backgroundContentType?: string;
    isUploadingBackground?: boolean;
    onBackgroundUpload?: (file: File) => void;
    /** Called when a resource is selected from the library */
    onBackgroundSelect?: (resource: MediaResource) => void;
    /** Called when remove button is clicked to clear the background */
    onRemove?: () => void;
    /**
     * External control for video muting (for ambient sound source integration).
     * When true, video audio is muted. When undefined, internal state is used.
     */
    externalMuted?: boolean;
    /** Called when preview (play) starts, useful for mutual exclusivity with other panels */
    onPreviewStart?: () => void;
}

const isVideoContentType = (contentType?: string): boolean => {
    return contentType?.startsWith('video/') ?? false;
};

export const BackgroundPanel: React.FC<BackgroundPanelProps> = ({
    label,
    backgroundUrl,
    backgroundContentType,
    isUploadingBackground,
    onBackgroundUpload,
    onBackgroundSelect,
    onRemove,
    externalMuted,
    onPreviewStart,
}) => {
    const theme = useTheme();
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [internalMuted, setInternalMuted] = useState(true);
    const [pickerOpen, setPickerOpen] = useState(false);

    // Use external muted control if provided, otherwise use internal state
    const isMuted = externalMuted !== undefined ? externalMuted : internalMuted;

    const effectiveBackgroundUrl = backgroundUrl || ENCOUNTER_DEFAULT_BACKGROUND;
    const isVideo = isVideoContentType(backgroundContentType);

    // Sync video muted state with external control
    useEffect(() => {
        if (videoRef.current && externalMuted !== undefined) {
            videoRef.current.muted = externalMuted;
        }
    }, [externalMuted]);

    const handleBackgroundFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && onBackgroundUpload) {
            onBackgroundUpload(file);
        }
        e.target.value = '';
    };

    const togglePlayPause = useCallback(() => {
        if (!videoRef.current) return;
        if (isPlaying) {
            videoRef.current.pause();
        } else {
            onPreviewStart?.();
            videoRef.current.play();
        }
        setIsPlaying(!isPlaying);
    }, [isPlaying, onPreviewStart]);

    const toggleMute = useCallback(() => {
        if (!videoRef.current) return;
        // Only toggle internal muted state if not externally controlled
        if (externalMuted === undefined) {
            videoRef.current.muted = !internalMuted;
            setInternalMuted(!internalMuted);
        }
    }, [externalMuted, internalMuted]);

    const handleVideoEnded = useCallback(() => {
        setIsPlaying(false);
    }, []);

    const handleResourceSelect = useCallback(
        (resource: MediaResource) => {
            onBackgroundSelect?.(resource);
            setPickerOpen(false);
        },
        [onBackgroundSelect]
    );

    const getStatusLabel = () => {
        if (isVideo && backgroundUrl) {
            return 'VIDEO';
        }
        if (!backgroundUrl) {
            return 'DEFAULT';
        }
        return null;
    };

    const statusLabel = getStatusLabel();

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Typography
                variant='overline'
                sx={{
                    fontSize: '10px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    color: theme.palette.text.secondary,
                    mb: 0,
                }}
            >
                {label ?? `Background ${isVideo ? 'Video' : 'Image'}`}
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
                    bgcolor: theme.palette.background.default,
                    ...(!isVideo && {
                        backgroundImage: `url(${effectiveBackgroundUrl})`,
                        backgroundSize: 'cover',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'center',
                    }),
                }}
            >
                {/* Video element */}
                {isVideo && backgroundUrl && (
                    <video
                        ref={videoRef}
                        src={backgroundUrl}
                        muted={isMuted}
                        loop
                        playsInline
                        onEnded={handleVideoEnded}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                        }}
                    />
                )}

                {/* Upload loading overlay */}
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
                            bgcolor: 'rgba(0, 0, 0, 0.5)',
                        }}
                    >
                        <CircularProgress size={24} />
                    </Box>
                )}

                {/* Control buttons */}
                <Box
                    sx={{
                        position: 'absolute',
                        bottom: 6,
                        right: 6,
                        display: 'flex',
                        gap: 0.5,
                    }}
                >
                    {/* Video controls */}
                    {isVideo && backgroundUrl && (
                        <>
                            <Tooltip title={isPlaying ? 'Pause' : 'Play'}>
                                <IconButton
                                    onClick={togglePlayPause}
                                    size='small'
                                    sx={{
                                        bgcolor: 'rgba(0, 0, 0, 0.6)',
                                        color: 'white',
                                        width: 28,
                                        height: 28,
                                        '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.8)' },
                                    }}
                                >
                                    {isPlaying ? <PauseIcon sx={{ fontSize: 16 }} /> : <PlayArrowIcon sx={{ fontSize: 16 }} />}
                                </IconButton>
                            </Tooltip>
                            {/* Only show mute toggle when not externally controlled */}
                            {externalMuted === undefined && (
                                <Tooltip title={isMuted ? 'Unmute' : 'Mute'}>
                                    <IconButton
                                        onClick={toggleMute}
                                        size='small'
                                        sx={{
                                            bgcolor: 'rgba(0, 0, 0, 0.6)',
                                            color: 'white',
                                            width: 28,
                                            height: 28,
                                            '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.8)' },
                                        }}
                                    >
                                        {isMuted ? <VolumeOffIcon sx={{ fontSize: 16 }} /> : <VolumeUpIcon sx={{ fontSize: 16 }} />}
                                    </IconButton>
                                </Tooltip>
                            )}
                        </>
                    )}
                    {/* Browse library button */}
                    {onBackgroundSelect && (
                        <Tooltip title='Browse library'>
                            <IconButton
                                onClick={() => setPickerOpen(true)}
                                disabled={isUploadingBackground ?? false}
                                size='small'
                                sx={{
                                    bgcolor: 'rgba(0, 0, 0, 0.6)',
                                    color: 'white',
                                    width: 28,
                                    height: 28,
                                    '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.8)' },
                                    '&:disabled': { bgcolor: 'rgba(0, 0, 0, 0.3)' },
                                }}
                                aria-label='Browse library'
                            >
                                <FolderOpenIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                        </Tooltip>
                    )}
                    {/* Change background button - always enabled (allows queued uploads) */}
                    <Tooltip title='Upload background'>
                        <IconButton
                            component='label'
                            disabled={isUploadingBackground ?? false}
                            sx={{
                                bgcolor: 'rgba(0, 0, 0, 0.6)',
                                color: 'white',
                                width: 28,
                                height: 28,
                                '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.8)' },
                                '&:disabled': { bgcolor: 'rgba(0, 0, 0, 0.3)' },
                            }}
                            aria-label='Upload background'
                        >
                            {isVideo ? <VideocamIcon sx={{ fontSize: 16 }} /> : <PhotoCameraIcon sx={{ fontSize: 16 }} />}
                            <input type='file' hidden accept={ACCEPTED_MEDIA_TYPES} onChange={handleBackgroundFileChange} />
                        </IconButton>
                    </Tooltip>
                    {/* Remove background button - only show when a custom background is set */}
                    {backgroundUrl && onRemove && (
                        <Tooltip title='Remove background'>
                            <IconButton
                                onClick={onRemove}
                                disabled={isUploadingBackground ?? false}
                                size='small'
                                sx={{
                                    bgcolor: 'rgba(0, 0, 0, 0.6)',
                                    color: 'white',
                                    width: 28,
                                    height: 28,
                                    '&:hover': { bgcolor: 'rgba(220, 53, 69, 0.8)' },
                                    '&:disabled': { bgcolor: 'rgba(0, 0, 0, 0.3)' },
                                }}
                                aria-label='Remove background'
                            >
                                <CloseIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                        </Tooltip>
                    )}
                </Box>

                {/* Status badge */}
                {statusLabel && (
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
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                        }}
                    >
                        {isVideo && <VideocamIcon sx={{ fontSize: 10 }} />}
                        {statusLabel}
                    </Box>
                )}
            </Box>

            {/* Resource Picker Dialog */}
            <ResourcePickerDialog
                open={pickerOpen}
                onClose={() => setPickerOpen(false)}
                onSelect={handleResourceSelect}
                config={BACKGROUND_PICKER_CONFIG}
            />
        </Box>
    );
};
