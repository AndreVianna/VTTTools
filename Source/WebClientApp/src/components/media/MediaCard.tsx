import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Box, Card, CardMedia, Checkbox, Chip, Typography, useTheme } from '@mui/material';
import { PlayArrow, AudioFile } from '@mui/icons-material';
import type { MediaResource } from '@/types/domain';

export interface MediaCardProps {
    media: MediaResource;
    isSelected?: boolean;
    isMultiSelectMode?: boolean;
    isChecked?: boolean;
    onClick?: () => void;
    onDoubleClick?: () => void;
    onCheckChange?: () => void;
    size?: 'small' | 'large';
}

const CARD_SIZES = {
    small: 120,
    large: 180,
};

export const MediaCard: React.FC<MediaCardProps> = ({
    media,
    isSelected = false,
    isMultiSelectMode = false,
    isChecked = false,
    onClick,
    onDoubleClick,
    onCheckChange,
    size = 'small',
}) => {
    const theme = useTheme();
    const cardSize = CARD_SIZES[size];
    const [isHovering, setIsHovering] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    const isVideo = media.contentType.startsWith('video/');
    const isAudio = media.contentType.startsWith('audio/');

    const thumbnailUrl = media.thumbnailPath
        ? `/api/resources/${media.thumbnailPath}`
        : `/api/resources/${media.path}`;

    const videoUrl = `/api/resources/${media.path}`;

    useEffect(() => {
        if (isVideo && videoRef.current) {
            if (isHovering) {
                videoRef.current.play().catch((error) => {
                    console.warn('Video preview autoplay failed:', error);
                });
            } else {
                videoRef.current.pause();
                videoRef.current.currentTime = 0;
            }
        }
    }, [isHovering, isVideo]);

    const handleMouseEnter = useCallback(() => setIsHovering(true), []);
    const handleMouseLeave = useCallback(() => setIsHovering(false), []);

    const handleCheckboxClick = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            onCheckChange?.();
        },
        [onCheckChange]
    );

    const getMediaIcon = () => {
        if (isAudio) {
            return (
                <AudioFile
                    sx={{
                        fontSize: cardSize * 0.4,
                        color: theme.palette.text.disabled,
                    }}
                />
            );
        }
        return null;
    };

    const renderMediaContent = () => {
        if (isVideo) {
            return (
                <Box
                    sx={{
                        position: 'relative',
                        width: '100%',
                        height: '100%',
                    }}
                >
                    {!isHovering && (
                        <>
                            <CardMedia
                                component="img"
                                image={thumbnailUrl}
                                alt={media.fileName}
                                sx={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                }}
                            />
                            <Box
                                sx={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    backgroundColor: theme.palette.background.paper,
                                    borderRadius: '50%',
                                    width: cardSize * 0.3,
                                    height: cardSize * 0.3,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    opacity: 0.9,
                                }}
                            >
                                <PlayArrow
                                    sx={{
                                        fontSize: cardSize * 0.2,
                                        color: theme.palette.primary.main,
                                    }}
                                />
                            </Box>
                        </>
                    )}
                    {isHovering && (
                        <video
                            ref={videoRef}
                            src={videoUrl}
                            autoPlay
                            muted
                            loop
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                            }}
                        />
                    )}
                </Box>
            );
        }

        if (isAudio) {
            return getMediaIcon();
        }

        return (
            <CardMedia
                component="img"
                image={thumbnailUrl}
                alt={media.fileName}
                sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                }}
            />
        );
    };

    return (
        <Card
            id={`media-card-${media.id}`}
            onClick={onClick}
            onDoubleClick={onDoubleClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            sx={{
                width: cardSize,
                cursor: 'pointer',
                position: 'relative',
                border: isSelected ? `2px solid ${theme.palette.primary.main}` : '2px solid transparent',
                borderRadius: 1,
                transition: 'all 0.15s ease-in-out',
                backgroundColor: theme.palette.background.paper,
                '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: theme.shadows[4],
                },
            }}
        >
            {isMultiSelectMode && (
                <Checkbox
                    checked={isChecked}
                    onClick={handleCheckboxClick}
                    size="small"
                    sx={{
                        position: 'absolute',
                        top: 2,
                        left: 2,
                        zIndex: 2,
                        padding: 0.25,
                        backgroundColor: theme.palette.background.paper,
                        borderRadius: 0.5,
                        '&:hover': {
                            backgroundColor: theme.palette.background.paper,
                        },
                    }}
                />
            )}

            {media.resourceType && (
                <Chip
                    label={media.resourceType}
                    size="small"
                    sx={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        zIndex: 2,
                        height: 18,
                        fontSize: '0.65rem',
                        backgroundColor: theme.palette.background.paper,
                        opacity: 0.9,
                    }}
                />
            )}

            <Box
                sx={{
                    width: cardSize,
                    height: cardSize,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: theme.palette.action.hover,
                    overflow: 'hidden',
                }}
            >
                {renderMediaContent()}
            </Box>

            <Box sx={{ p: 0.75 }}>
                <Typography
                    variant="body2"
                    sx={{
                        fontWeight: 500,
                        fontSize: size === 'small' ? '0.7rem' : '0.8rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                    }}
                >
                    {media.fileName}
                </Typography>
            </Box>
        </Card>
    );
};

export default MediaCard;
