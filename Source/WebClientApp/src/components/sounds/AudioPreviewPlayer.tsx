import {
    Pause as PauseIcon,
    PlayArrow as PlayArrowIcon,
    VolumeUp as VolumeUpIcon,
} from '@mui/icons-material';
import { Box, CircularProgress, IconButton, Slider, Typography, useTheme } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import { useAuthenticatedResource } from '@/hooks/useAuthenticatedResource';

export interface AudioPreviewPlayerProps {
    resourceId: string;
    compact?: boolean;
    onError?: (error: string) => void;
}

export const AudioPreviewPlayer: React.FC<AudioPreviewPlayerProps> = ({
    resourceId,
    compact = false,
    onError,
}) => {
    const theme = useTheme();
    const audioRef = useRef<HTMLAudioElement>(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isAudioLoading, setIsAudioLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const audioResourceUrl = `/api/resources/${resourceId}`;
    const { url: audioBlobUrl, isLoading: isResourceLoading, error: resourceError } = useAuthenticatedResource(audioResourceUrl);

    const prevResourceIdRef = useRef(resourceId);

    useEffect(() => {
        // Reset audio state when resource changes
        if (prevResourceIdRef.current !== resourceId) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setIsAudioLoading(true);
             
            setError(null);
             
            setCurrentTime(0);
             
            setDuration(0);
             
            setIsPlaying(false);
            prevResourceIdRef.current = resourceId;
        }
    }, [resourceId]);

    const prevErrorRef = useRef(resourceError);

    useEffect(() => {
        // Handle resource loading errors
        if (resourceError && resourceError !== prevErrorRef.current) {
            const errorMessage = resourceError.message || 'Failed to load audio file';
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setError(errorMessage);
            if (onError) {
                onError(errorMessage);
            }
            prevErrorRef.current = resourceError;
        }
    }, [resourceError, onError]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleLoadedMetadata = () => {
            setDuration(audio.duration);
            setIsAudioLoading(false);
        };

        const handleTimeUpdate = () => {
            setCurrentTime(audio.currentTime);
        };

        const handleEnded = () => {
            setIsPlaying(false);
            setCurrentTime(0);
        };

        const handleError = () => {
            const errorMessage = 'Failed to load audio file';
            setError(errorMessage);
            setIsAudioLoading(false);
            if (onError) {
                onError(errorMessage);
            }
        };

        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('error', handleError);

        return () => {
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('error', handleError);
        };
    }, [audioBlobUrl, onError]);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, [volume]);

    const handlePlayPause = () => {
        const audio = audioRef.current;
        if (!audio) return;

        if (isPlaying) {
            audio.pause();
        } else {
            audio.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleSeek = (_event: Event, newValue: number | number[]) => {
        const audio = audioRef.current;
        if (!audio) return;

        const seekTime = Array.isArray(newValue) ? (newValue[0] ?? 0) : newValue;
        audio.currentTime = seekTime;
        setCurrentTime(seekTime);
    };

    const handleVolumeChange = (_event: Event, newValue: number | number[]) => {
        const newVolume = Array.isArray(newValue) ? (newValue[0] ?? 0) : newValue;
        setVolume(newVolume);
    };

    const formatTime = (seconds: number): string => {
        if (!isFinite(seconds)) return '0:00';
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    };

    const compactStyles = {
        fontSize: compact ? '10px' : '12px',
        height: compact ? 32 : 'auto',
    };

    if (error) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: compactStyles.height,
                    px: 1,
                }}
            >
                <Typography
                    sx={{
                        fontSize: compactStyles.fontSize,
                        color: theme.palette.error.main,
                    }}
                >
                    {error}
                </Typography>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: compact ? 0 : 1,
            }}
        >
            {audioBlobUrl && <audio ref={audioRef} src={audioBlobUrl} preload='metadata' />}

            {(isResourceLoading || isAudioLoading) ? (
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: compactStyles.height,
                    }}
                >
                    <CircularProgress size={compact ? 16 : 24} />
                </Box>
            ) : (
                <>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            height: compactStyles.height,
                        }}
                    >
                        <IconButton
                            onClick={handlePlayPause}
                            size={compact ? 'small' : 'medium'}
                            sx={{
                                width: compact ? 24 : 40,
                                height: compact ? 24 : 40,
                                color: theme.palette.primary.main,
                                '&:hover': {
                                    backgroundColor: theme.palette.action.hover,
                                },
                            }}
                        >
                            {isPlaying ? (
                                <PauseIcon sx={{ fontSize: compact ? 16 : 24 }} />
                            ) : (
                                <PlayArrowIcon sx={{ fontSize: compact ? 16 : 24 }} />
                            )}
                        </IconButton>

                        <Slider
                            value={currentTime}
                            max={duration}
                            onChange={handleSeek}
                            sx={{
                                flex: 1,
                                color: theme.palette.primary.main,
                                height: compact ? 3 : 4,
                                '& .MuiSlider-thumb': {
                                    width: compact ? 8 : 12,
                                    height: compact ? 8 : 12,
                                },
                                '& .MuiSlider-track': {
                                    border: 'none',
                                },
                            }}
                        />

                        <Typography
                            sx={{
                                fontSize: compactStyles.fontSize,
                                color: theme.palette.text.secondary,
                                minWidth: compact ? 60 : 80,
                                textAlign: 'right',
                            }}
                        >
                            {formatTime(currentTime)} / {formatTime(duration)}
                        </Typography>
                    </Box>

                    {!compact && (
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                pl: 1,
                            }}
                        >
                            <VolumeUpIcon
                                sx={{
                                    fontSize: 20,
                                    color: theme.palette.text.secondary,
                                }}
                            />
                            <Slider
                                value={volume}
                                min={0}
                                max={1}
                                step={0.01}
                                onChange={handleVolumeChange}
                                sx={{
                                    flex: 1,
                                    color: theme.palette.primary.main,
                                    height: 4,
                                    '& .MuiSlider-thumb': {
                                        width: 12,
                                        height: 12,
                                    },
                                    '& .MuiSlider-track': {
                                        border: 'none',
                                    },
                                }}
                            />
                            <Typography
                                sx={{
                                    fontSize: '11px',
                                    color: theme.palette.text.secondary,
                                    minWidth: 40,
                                    textAlign: 'right',
                                }}
                            >
                                {Math.round(volume * 100)}%
                            </Typography>
                        </Box>
                    )}
                </>
            )}
        </Box>
    );
};
