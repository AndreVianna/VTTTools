import { useState, useRef, useEffect } from 'react';
import {
    Card,
    CardContent,
    CardActions,
    Typography,
    IconButton,
    Tooltip,
    Chip,
    Box,
    CircularProgress,
    Skeleton,
    Slider,
} from '@mui/material';
import {
    Check as ApproveIcon,
    Refresh as RegenerateIcon,
    Delete as RejectIcon,
    BrokenImage as BrokenImageIcon,
    PlayArrow as PlayIcon,
    Pause as PauseIcon,
    VolumeUp as VolumeIcon,
    AudioFile as AudioFileIcon,
    Videocam as VideoIcon,
} from '@mui/icons-material';
import type { GeneratedResource } from '@/types/resourceApproval';
import { useAuthenticatedImageUrl } from '@/hooks/useAuthenticatedImageUrl';

interface ResourceThumbnailProps {
    resource: GeneratedResource;
    onClick: () => void;
    onApprove: () => void;
    onRegenerate: () => void;
    onReject: () => void;
    isLoading: boolean;
}

function AudioPlayer({ resource }: { resource: GeneratedResource }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [isLoadingAudio, setIsLoadingAudio] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        const loadAudio = async () => {
            setIsLoadingAudio(true);
            setError(null);
            try {
                const response = await fetch(resource.imageUrl, {
                    credentials: 'include',
                    headers: { 'X-Requested-With': 'XMLHttpRequest' },
                });
                if (!response.ok) throw new Error('Failed to load audio');
                const blob = await response.blob();
                const url = URL.createObjectURL(blob);
                setAudioUrl(url);
            } catch {
                setError('Failed to load audio');
            } finally {
                setIsLoadingAudio(false);
            }
        };
        loadAudio();
        return () => {
            if (audioUrl) URL.revokeObjectURL(audioUrl);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [resource.imageUrl]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleTimeUpdate = () => {
            setProgress(audio.currentTime);
        };
        const handleLoadedMetadata = () => {
            setDuration(audio.duration);
        };
        const handleEnded = () => {
            setIsPlaying(false);
            setProgress(0);
        };

        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audio.removeEventListener('ended', handleEnded);
        };
    }, [audioUrl]);

    const togglePlay = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleSeek = (_: Event, value: number | number[]) => {
        if (!audioRef.current) return;
        const newTime = Array.isArray(value) ? value[0] : value;
        audioRef.current.currentTime = newTime;
        setProgress(newTime);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (isLoadingAudio) {
        return (
            <Box sx={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'action.hover' }}>
                <CircularProgress size={32} />
            </Box>
        );
    }

    if (error || !audioUrl) {
        return (
            <Box sx={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'action.hover' }}>
                <AudioFileIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
            </Box>
        );
    }

    return (
        <Box
            sx={{
                height: 160,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'action.hover',
                p: 2,
            }}
        >
            <audio ref={audioRef} src={audioUrl} preload="metadata" />
            <VolumeIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 1 }}>
                <IconButton size="small" onClick={togglePlay} color="primary">
                    {isPlaying ? <PauseIcon /> : <PlayIcon />}
                </IconButton>
                <Slider
                    size="small"
                    value={progress}
                    max={duration || 100}
                    onChange={handleSeek}
                    onClick={(e) => e.stopPropagation()}
                    sx={{ flex: 1 }}
                />
                <Typography variant="caption" sx={{ minWidth: 40, textAlign: 'right' }}>
                    {formatTime(progress)}
                </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary">
                {formatTime(duration)} total
            </Typography>
        </Box>
    );
}

function VideoPlayer({ resource }: { resource: GeneratedResource }) {
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [isLoadingVideo, setIsLoadingVideo] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadVideo = async () => {
            setIsLoadingVideo(true);
            setError(null);
            try {
                const response = await fetch(resource.imageUrl, {
                    credentials: 'include',
                    headers: { 'X-Requested-With': 'XMLHttpRequest' },
                });
                if (!response.ok) throw new Error('Failed to load video');
                const blob = await response.blob();
                const url = URL.createObjectURL(blob);
                setVideoUrl(url);
            } catch {
                setError('Failed to load video');
            } finally {
                setIsLoadingVideo(false);
            }
        };
        loadVideo();
        return () => {
            if (videoUrl) URL.revokeObjectURL(videoUrl);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [resource.imageUrl]);

    if (isLoadingVideo) {
        return (
            <Box sx={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'action.hover' }}>
                <CircularProgress size={32} />
            </Box>
        );
    }

    if (error || !videoUrl) {
        return (
            <Box sx={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'action.hover' }}>
                <VideoIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
            </Box>
        );
    }

    return (
        <Box sx={{ height: 160, bgcolor: 'black' }}>
            <video
                src={videoUrl}
                controls
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                onClick={(e) => e.stopPropagation()}
            />
        </Box>
    );
}

function ImageDisplay({ resource, onClick }: { resource: GeneratedResource; onClick: () => void }) {
    const { blobUrl, isLoading: isImageLoading, error: imageError } = useAuthenticatedImageUrl(resource.imageUrl);

    if (isImageLoading) {
        return <Skeleton variant="rectangular" height={160} />;
    }

    if (imageError || !blobUrl) {
        return (
            <Box
                sx={{
                    height: 160,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'action.hover',
                }}
                onClick={onClick}
            >
                <BrokenImageIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
            </Box>
        );
    }

    return (
        <Box
            component="img"
            src={blobUrl}
            alt={`${resource.assetName}`}
            onClick={onClick}
            sx={{ width: '100%', height: 160, objectFit: 'cover', cursor: 'pointer' }}
        />
    );
}

export function ResourceThumbnail({
    resource,
    onClick,
    onApprove,
    onRegenerate,
    onReject,
    isLoading,
}: ResourceThumbnailProps) {
    const getStatusColor = (): 'default' | 'success' | 'error' | 'warning' => {
        switch (resource.status) {
            case 'approved':
                return 'success';
            case 'rejected':
                return 'error';
            case 'regenerating':
                return 'warning';
            default:
                return 'default';
        }
    };

    const isPending = resource.status === 'pending';
    const isDisabled = isLoading || !isPending;

    const renderMedia = () => {
        switch (resource.mediaType) {
            case 'audio':
                return <AudioPlayer resource={resource} />;
            case 'video':
                return <VideoPlayer resource={resource} />;
            default:
                return <ImageDisplay resource={resource} onClick={onClick} />;
        }
    };

    return (
        <Card
            id={`card-resource-${resource.resourceId}`}
            sx={{
                position: 'relative',
                cursor: resource.mediaType === 'image' ? 'pointer' : 'default',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                },
                opacity: resource.status === 'rejected' ? 0.5 : 1,
            }}
        >
            {isLoading && (
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
                        zIndex: 1,
                    }}
                >
                    <CircularProgress />
                </Box>
            )}

            <Box sx={{ position: 'relative' }}>
                {renderMedia()}
                {resource.status !== 'pending' && (
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                        }}
                    >
                        <Chip
                            label={resource.status}
                            color={getStatusColor()}
                            size="small"
                        />
                    </Box>
                )}
            </Box>

            <CardContent sx={{ py: 1 }} onClick={onClick}>
                <Typography variant="subtitle2" noWrap title={resource.assetName}>
                    {resource.assetName}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap>
                    {resource.category ?? 'Uncategorized'}
                    {resource.type && ` / ${resource.type}`}
                </Typography>
            </CardContent>

            <CardActions sx={{ justifyContent: 'center', pt: 0 }}>
                <Tooltip title="Approve">
                    <span>
                        <IconButton
                            id={`btn-approve-${resource.resourceId}`}
                            size="small"
                            color="success"
                            onClick={(e) => {
                                e.stopPropagation();
                                onApprove();
                            }}
                            disabled={isDisabled}
                        >
                            <ApproveIcon />
                        </IconButton>
                    </span>
                </Tooltip>
                <Tooltip title="Regenerate">
                    <span>
                        <IconButton
                            id={`btn-regenerate-${resource.resourceId}`}
                            size="small"
                            color="primary"
                            onClick={(e) => {
                                e.stopPropagation();
                                onRegenerate();
                            }}
                            disabled={isDisabled}
                        >
                            <RegenerateIcon />
                        </IconButton>
                    </span>
                </Tooltip>
                <Tooltip title="Reject">
                    <span>
                        <IconButton
                            id={`btn-reject-${resource.resourceId}`}
                            size="small"
                            color="error"
                            onClick={(e) => {
                                e.stopPropagation();
                                onReject();
                            }}
                            disabled={isDisabled}
                        >
                            <RejectIcon />
                        </IconButton>
                    </span>
                </Tooltip>
            </CardActions>
        </Card>
    );
}
