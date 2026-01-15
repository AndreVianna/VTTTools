import React, { useCallback, useEffect, useRef } from 'react';
import {
    AudioFile as AudioFileIcon,
    Videocam as VideoIcon,
} from '@mui/icons-material';
import {
    Box,
    Card,
    CardContent,
    CircularProgress,
    Skeleton,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography,
    useTheme,
} from '@mui/material';
import { useAuthenticatedImageUrl } from '@/hooks/useAuthenticatedImageUrl';
import type { MediaResource } from '@/types/domain';
import type { ResourcePickerGridProps } from './types';

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
// Grid Card Component
// ============================================================================

interface ResourceGridCardProps {
    resource: MediaResource;
    isSelected: boolean;
    onSelect: (resource: MediaResource) => void;
}

const ResourceGridCard: React.FC<ResourceGridCardProps> = ({
    resource,
    isSelected,
    onSelect,
}) => {
    const theme = useTheme();
    // Use thumbnail endpoint for both images and videos - it has fallback logic:
    // - For images: returns the actual image
    // - For videos: returns generated thumbnail or error placeholder
    const thumbnailUrl = `/api/resources/${resource.id}/thumbnail`;
    const { blobUrl, isLoading: isImageLoading } = useAuthenticatedImageUrl(
        isImageContentType(resource.contentType) || isVideoContentType(resource.contentType)
            ? thumbnailUrl
            : null
    );

    const handleClick = useCallback(() => {
        onSelect(resource);
    }, [onSelect, resource]);

    const isVideo = isVideoContentType(resource.contentType);
    const isAudio = isAudioContentType(resource.contentType);

    return (
        <Card
            onClick={handleClick}
            sx={{
                width: 140,
                height: 140,
                cursor: 'pointer',
                position: 'relative',
                border: `2px solid ${
                    isSelected ? theme.palette.primary.main : 'transparent'
                }`,
                backgroundColor: isSelected
                    ? theme.palette.action.selected
                    : theme.palette.background.paper,
                transition: 'all 0.2s',
                '&:hover': {
                    backgroundColor: theme.palette.action.hover,
                    borderColor: theme.palette.primary.light,
                },
            }}
        >
            <CardContent
                sx={{
                    p: 1,
                    '&:last-child': { pb: 1 },
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                }}
            >
                {/* Thumbnail Area */}
                <Box
                    sx={{
                        width: '100%',
                        height: 80,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 1,
                        position: 'relative',
                        backgroundColor: theme.palette.action.hover,
                        borderRadius: 1,
                        overflow: 'hidden',
                    }}
                >
                    {isAudio ? (
                        <AudioFileIcon
                            sx={{
                                fontSize: 40,
                                color: theme.palette.primary.main,
                            }}
                        />
                    ) : isImageLoading ? (
                        <Skeleton variant="rectangular" width="100%" height="100%" />
                    ) : blobUrl ? (
                        <Box
                            component="img"
                            src={blobUrl}
                            alt={resource.fileName}
                            sx={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                            }}
                        />
                    ) : (
                        <Typography
                            sx={{
                                fontSize: '0.65rem',
                                color: theme.palette.text.secondary,
                            }}
                        >
                            No preview
                        </Typography>
                    )}

                    {/* Video Badge */}
                    {isVideo && (
                        <Box
                            sx={{
                                position: 'absolute',
                                top: 4,
                                right: 4,
                                backgroundColor: theme.palette.primary.main,
                                color: theme.palette.primary.contrastText,
                                borderRadius: 0.5,
                                px: 0.5,
                                py: 0.25,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.25,
                            }}
                        >
                            <VideoIcon sx={{ fontSize: 12 }} />
                            <Typography sx={{ fontSize: '0.6rem', fontWeight: 600 }}>
                                VIDEO
                            </Typography>
                        </Box>
                    )}
                </Box>

                {/* Filename */}
                <Typography
                    sx={{
                        fontSize: '0.7rem',
                        fontWeight: 500,
                        textAlign: 'center',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        width: '100%',
                    }}
                    title={resource.fileName}
                >
                    {resource.fileName}
                </Typography>

                {/* Audio Duration */}
                {isAudio && resource.duration && (
                    <Typography
                        sx={{
                            fontSize: '0.6rem',
                            color: theme.palette.text.secondary,
                        }}
                    >
                        {formatDuration(resource.duration)}
                    </Typography>
                )}
            </CardContent>
        </Card>
    );
};

// ============================================================================
// List Row Component (for audio)
// ============================================================================

interface ResourceListRowProps {
    resource: MediaResource;
    isSelected: boolean;
    onSelect: (resource: MediaResource) => void;
}

const ResourceListRow: React.FC<ResourceListRowProps> = ({
    resource,
    isSelected,
    onSelect,
}) => {
    const theme = useTheme();

    const handleClick = useCallback(() => {
        onSelect(resource);
    }, [onSelect, resource]);

    return (
        <TableRow
            onClick={handleClick}
            selected={isSelected}
            hover
            sx={{
                cursor: 'pointer',
                '&.Mui-selected': {
                    backgroundColor: theme.palette.action.selected,
                },
                '&.Mui-selected:hover': {
                    backgroundColor: theme.palette.action.selected,
                },
            }}
        >
            <TableCell sx={{ py: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AudioFileIcon
                        sx={{
                            fontSize: 20,
                            color: theme.palette.primary.main,
                        }}
                    />
                    <Typography
                        sx={{
                            fontSize: '0.8rem',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: 300,
                        }}
                        title={resource.fileName}
                    >
                        {resource.fileName}
                    </Typography>
                </Box>
            </TableCell>
            <TableCell sx={{ py: 1 }}>
                <Typography sx={{ fontSize: '0.8rem' }}>
                    {formatDuration(resource.duration)}
                </Typography>
            </TableCell>
            <TableCell sx={{ py: 1 }}>
                <Typography sx={{ fontSize: '0.8rem' }}>
                    {formatFileSize(resource.fileSize)}
                </Typography>
            </TableCell>
        </TableRow>
    );
};

// ============================================================================
// Main Grid Component
// ============================================================================

export const ResourcePickerGrid: React.FC<ResourcePickerGridProps> = ({
    resources,
    isLoading,
    selectedResourceId,
    onSelect,
    viewMode,
    contentTypeHint,
    hasMore,
    onLoadMore,
    isLoadingMore,
}) => {
    const theme = useTheme();
    const sentinelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!hasMore || !onLoadMore || isLoadingMore) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0]?.isIntersecting) {
                    onLoadMore();
                }
            },
            {
                threshold: 0.1,
                rootMargin: '100px', // Pre-load before sentinel is visible
            }
        );

        const sentinel = sentinelRef.current;
        if (sentinel) {
            observer.observe(sentinel);
        }

        return () => {
            observer.disconnect();
        };
    }, [hasMore, onLoadMore, isLoadingMore]);

    // Loading State
    if (isLoading) {
        return (
            <Box
                sx={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    // Empty State
    if (resources.length === 0) {
        return (
            <Box
                sx={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                }}
            >
                <Typography
                    sx={{
                        color: theme.palette.text.secondary,
                        fontSize: '0.875rem',
                    }}
                >
                    No resources found
                </Typography>
            </Box>
        );
    }

    // List View (for audio or when explicitly set)
    if (viewMode === 'list' || contentTypeHint === 'audio') {
        return (
            <Box
                sx={{
                    flex: 1,
                    p: 2,
                    overflow: 'auto',
                }}
            >
                <Table size="small" stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell
                                sx={{
                                    fontWeight: 600,
                                    fontSize: '0.75rem',
                                    color: theme.palette.text.secondary,
                                    backgroundColor: theme.palette.background.paper,
                                }}
                            >
                                FILE NAME
                            </TableCell>
                            <TableCell
                                sx={{
                                    fontWeight: 600,
                                    fontSize: '0.75rem',
                                    color: theme.palette.text.secondary,
                                    backgroundColor: theme.palette.background.paper,
                                    width: 80,
                                }}
                            >
                                DURATION
                            </TableCell>
                            <TableCell
                                sx={{
                                    fontWeight: 600,
                                    fontSize: '0.75rem',
                                    color: theme.palette.text.secondary,
                                    backgroundColor: theme.palette.background.paper,
                                    width: 80,
                                }}
                            >
                                SIZE
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {resources.map((resource) => (
                            <ResourceListRow
                                key={resource.id}
                                resource={resource}
                                isSelected={selectedResourceId === resource.id}
                                onSelect={onSelect}
                            />
                        ))}
                        {/* Infinite scroll sentinel for list view */}
                        {hasMore && (
                            <TableRow>
                                <TableCell colSpan={3} sx={{ border: 'none', p: 0 }}>
                                    <Box
                                        ref={sentinelRef}
                                        sx={{
                                            width: '100%',
                                            height: 40,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        {isLoadingMore && <CircularProgress size={24} />}
                                    </Box>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Box>
        );
    }

    // Grid View (for images/videos)
    return (
        <Box
            sx={{
                flex: 1,
                p: 2,
                overflow: 'auto',
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 2,
                    alignContent: 'flex-start',
                }}
            >
                {resources.map((resource) => (
                    <ResourceGridCard
                        key={resource.id}
                        resource={resource}
                        isSelected={selectedResourceId === resource.id}
                        onSelect={onSelect}
                    />
                ))}
            </Box>
            {/* Infinite scroll sentinel for grid view */}
            {hasMore && (
                <Box
                    ref={sentinelRef}
                    sx={{
                        width: '100%',
                        height: 40,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    {isLoadingMore && <CircularProgress size={24} />}
                </Box>
            )}
        </Box>
    );
};
