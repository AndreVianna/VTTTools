import React, { useCallback, useRef, useState } from 'react';
import {
    ChevronLeft as ChevronLeftIcon,
    ChevronRight as ChevronRightIcon,
    Pause as PauseIcon,
    PlayArrow as PlayArrowIcon,
} from '@mui/icons-material';
import {
    Box,
    CircularProgress,
    IconButton,
    Skeleton,
    Typography,
    useTheme,
} from '@mui/material';
import { AudioPreviewPlayer } from '@/components/sounds/AudioPreviewPlayer';
import { useAuthenticatedResource } from '@/hooks/useAuthenticatedResource';
import type { ResourcePickerPreviewProps } from './types';

/**
 * Formats an ISO 8601 duration string (e.g., PT1M30S) to a human-readable format.
 */
function formatDuration(duration: string): string {
    if (!duration) return '0:00';

    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?/);
    if (!match) return duration;

    const hours = parseInt(match[1] || '0', 10);
    const minutes = parseInt(match[2] || '0', 10);
    const seconds = Math.floor(parseFloat(match[3] || '0'));

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Formats file size in bytes to a human-readable format.
 */
function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Determines if a content type is video.
 */
function isVideoContentType(contentType: string): boolean {
    return contentType.startsWith('video/');
}

/**
 * Determines if a content type is audio.
 */
function isAudioContentType(contentType: string): boolean {
    return contentType.startsWith('audio/');
}

/**
 * Determines if a content type is image.
 */
function isImageContentType(contentType: string): boolean {
    return contentType.startsWith('image/');
}

// ============================================================================
// Image Preview Component
// ============================================================================

interface ImagePreviewProps {
    resourceId: string;
    fileName: string;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ resourceId, fileName }) => {
    const theme = useTheme();
    const resourceUrl = `/api/resources/${resourceId}`;
    const { url: blobUrl, isLoading, error } = useAuthenticatedResource(resourceUrl);

    if (isLoading) {
        return (
            <Box
                sx={{
                    width: '100%',
                    height: 200,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: theme.palette.action.hover,
                    borderRadius: 1,
                }}
            >
                <CircularProgress size={32} />
            </Box>
        );
    }

    if (error || !blobUrl) {
        return (
            <Box
                sx={{
                    width: '100%',
                    height: 200,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: theme.palette.action.hover,
                    borderRadius: 1,
                }}
            >
                <Typography
                    sx={{
                        fontSize: '0.75rem',
                        color: theme.palette.text.secondary,
                    }}
                >
                    Failed to load preview
                </Typography>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                width: '100%',
                borderRadius: 1,
                overflow: 'hidden',
                backgroundColor: theme.palette.action.hover,
            }}
        >
            <Box
                component="img"
                src={blobUrl}
                alt={fileName}
                sx={{
                    width: '100%',
                    maxHeight: 200,
                    objectFit: 'contain',
                    display: 'block',
                }}
            />
        </Box>
    );
};

// ============================================================================
// Video Preview Component
// ============================================================================

interface VideoPreviewProps {
    resourceId: string;
    fileName: string;
}

const VideoPreview: React.FC<VideoPreviewProps> = ({ resourceId, fileName }) => {
    const theme = useTheme();
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const resourceUrl = `/api/resources/${resourceId}`;
    const { url: blobUrl, isLoading, error } = useAuthenticatedResource(resourceUrl);

    const handlePlayPause = useCallback(() => {
        const video = videoRef.current;
        if (!video) return;

        if (isPlaying) {
            video.pause();
        } else {
            video.play();
        }
        setIsPlaying(!isPlaying);
    }, [isPlaying]);

    const handleVideoEnded = useCallback(() => {
        setIsPlaying(false);
    }, []);

    if (isLoading) {
        return (
            <Box
                sx={{
                    width: '100%',
                    height: 200,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: theme.palette.action.hover,
                    borderRadius: 1,
                }}
            >
                <CircularProgress size={32} />
            </Box>
        );
    }

    if (error || !blobUrl) {
        return (
            <Box
                sx={{
                    width: '100%',
                    height: 200,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: theme.palette.action.hover,
                    borderRadius: 1,
                }}
            >
                <Typography
                    sx={{
                        fontSize: '0.75rem',
                        color: theme.palette.text.secondary,
                    }}
                >
                    Failed to load preview
                </Typography>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                width: '100%',
                borderRadius: 1,
                overflow: 'hidden',
                backgroundColor: theme.palette.common.black,
                position: 'relative',
            }}
        >
            <video
                ref={videoRef}
                src={blobUrl}
                onEnded={handleVideoEnded}
                style={{
                    width: '100%',
                    maxHeight: 200,
                    display: 'block',
                }}
                aria-label={`Video preview of ${fileName}`}
            />
            <IconButton
                id="btn-video-play-pause"
                onClick={handlePlayPause}
                sx={{
                    position: 'absolute',
                    bottom: 8,
                    left: 8,
                    backgroundColor: theme.palette.background.paper,
                    '&:hover': {
                        backgroundColor: theme.palette.action.hover,
                    },
                }}
                size="small"
            >
                {isPlaying ? (
                    <PauseIcon sx={{ fontSize: 20 }} />
                ) : (
                    <PlayArrowIcon sx={{ fontSize: 20 }} />
                )}
            </IconButton>
        </Box>
    );
};

// ============================================================================
// Audio Preview Component
// ============================================================================

interface AudioPreviewProps {
    resourceId: string;
}

const AudioPreview: React.FC<AudioPreviewProps> = ({ resourceId }) => {
    return <AudioPreviewPlayer resourceId={resourceId} />;
};

// ============================================================================
// Metadata Row Component
// ============================================================================

interface MetadataRowProps {
    label: string;
    value: string;
}

const MetadataRow: React.FC<MetadataRowProps> = ({ label, value }) => {
    const theme = useTheme();

    return (
        <Box>
            <Typography
                variant="caption"
                sx={{
                    color: theme.palette.text.secondary,
                    fontSize: '0.65rem',
                    fontWeight: 600,
                }}
            >
                {label}
            </Typography>
            <Typography
                sx={{
                    fontSize: '0.75rem',
                    wordBreak: 'break-all',
                }}
            >
                {value}
            </Typography>
        </Box>
    );
};

// ============================================================================
// Main Preview Component
// ============================================================================

export const ResourcePickerPreview: React.FC<ResourcePickerPreviewProps> = ({
    resource,
    isCollapsed = false,
    onToggleCollapse,
}) => {
    const theme = useTheme();
    const showCollapseControls = onToggleCollapse !== undefined;

    const panelBackgroundColor =
        theme.palette.mode === 'dark'
            ? 'rgba(0,0,0,0.2)'
            : theme.palette.grey[50];

    // Collapsed state
    if (isCollapsed && showCollapseControls) {
        return (
            <Box
                sx={{
                    width: 32,
                    borderLeft: `1px solid ${theme.palette.divider}`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    py: 1,
                    backgroundColor: panelBackgroundColor,
                }}
            >
                <IconButton
                    id="btn-expand-preview"
                    onClick={onToggleCollapse}
                    size="small"
                    sx={{ mb: 1 }}
                >
                    <ChevronLeftIcon sx={{ fontSize: 18 }} />
                </IconButton>
                <Typography
                    variant="caption"
                    sx={{
                        writingMode: 'vertical-rl',
                        textOrientation: 'mixed',
                        transform: 'rotate(180deg)',
                        color: theme.palette.text.secondary,
                        fontWeight: 600,
                        fontSize: '0.65rem',
                    }}
                >
                    PREVIEW
                </Typography>
            </Box>
        );
    }

    if (!resource) {
        return (
            <Box
                sx={{
                    width: 280,
                    borderLeft: `1px solid ${theme.palette.divider}`,
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: panelBackgroundColor,
                }}
            >
                {/* Header with collapse button */}
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        mb: 2,
                    }}
                >
                    <Typography
                        variant="caption"
                        sx={{
                            color: theme.palette.text.secondary,
                            fontWeight: 600,
                        }}
                    >
                        PREVIEW
                    </Typography>
                    {showCollapseControls && (
                        <IconButton
                            id="btn-collapse-preview"
                            onClick={onToggleCollapse}
                            size="small"
                            sx={{ p: 0.5 }}
                        >
                            <ChevronRightIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                    )}
                </Box>
                <Box
                    sx={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Typography
                        sx={{
                            color: theme.palette.text.secondary,
                            fontSize: '0.875rem',
                        }}
                    >
                        Select a resource to preview
                    </Typography>
                </Box>
            </Box>
        );
    }

    const isVideo = isVideoContentType(resource.contentType);
    const isAudio = isAudioContentType(resource.contentType);
    const isImage = isImageContentType(resource.contentType);
    const hasDimensions = resource.dimensions?.width > 0 && resource.dimensions?.height > 0;
    const hasDuration = resource.duration && resource.duration !== 'PT0S';

    return (
        <Box
            id="preview-panel"
            sx={{
                width: 280,
                borderLeft: `1px solid ${theme.palette.divider}`,
                p: 2,
                overflow: 'auto',
                backgroundColor: panelBackgroundColor,
            }}
        >
            {/* Header with collapse button */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 2,
                }}
            >
                <Typography
                    variant="caption"
                    sx={{
                        color: theme.palette.text.secondary,
                        fontWeight: 600,
                    }}
                >
                    PREVIEW
                </Typography>
                {showCollapseControls && (
                    <IconButton
                        id="btn-collapse-preview"
                        onClick={onToggleCollapse}
                        size="small"
                        sx={{ p: 0.5 }}
                    >
                        <ChevronRightIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                )}
            </Box>

            {/* Preview Content */}
            <Box sx={{ mb: 3 }}>
                {isImage && (
                    <ImagePreview
                        resourceId={resource.id}
                        fileName={resource.fileName}
                    />
                )}
                {isVideo && (
                    <VideoPreview
                        resourceId={resource.id}
                        fileName={resource.fileName}
                    />
                )}
                {isAudio && <AudioPreview resourceId={resource.id} />}
                {!isImage && !isVideo && !isAudio && (
                    <Skeleton variant="rectangular" width="100%" height={100} />
                )}
            </Box>

            {/* Metadata */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <MetadataRow label="FILE NAME" value={resource.fileName} />

                {hasDimensions && (
                    <MetadataRow
                        label="DIMENSIONS"
                        value={`${resource.dimensions.width} x ${resource.dimensions.height}`}
                    />
                )}

                {hasDuration && (
                    <MetadataRow
                        label="DURATION"
                        value={formatDuration(resource.duration)}
                    />
                )}

                <MetadataRow
                    label="FILE SIZE"
                    value={formatFileSize(resource.fileSize)}
                />

                <MetadataRow label="CONTENT TYPE" value={resource.contentType} />
            </Box>
        </Box>
    );
};
