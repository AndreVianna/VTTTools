import { AudioFile, MusicNote } from '@mui/icons-material';
import { Box, Checkbox, List, ListItem, Typography, useTheme } from '@mui/material';
import React from 'react';

import { AudioPreviewPlayer } from '@/components/sounds/AudioPreviewPlayer';
import { type MediaResource, ResourceType } from '@/types/domain';

interface MediaListProps {
    items: MediaResource[];
    selectedId?: string | null;
    selectedIds?: string[];
    isMultiSelectMode?: boolean;
    onItemClick?: (media: MediaResource) => void;
    onItemDoubleClick?: (media: MediaResource) => void;
    onCheckChange?: (id: string) => void;
}

const parseDuration = (iso: string): string => {
    const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?/);
    if (!match) return '0:00';
    const hours = parseInt(match[1] || '0', 10);
    const minutes = parseInt(match[2] || '0', 10);
    const seconds = Math.floor(parseFloat(match[3] || '0'));
    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const MediaList: React.FC<MediaListProps> = ({
    items,
    selectedId,
    selectedIds = [],
    isMultiSelectMode = false,
    onItemClick,
    onItemDoubleClick,
    onCheckChange,
}) => {
    const theme = useTheme();

    const isSelected = (id: string): boolean => {
        if (isMultiSelectMode) {
            return selectedIds.includes(id);
        }
        return selectedId === id;
    };

    const handleItemClick = (media: MediaResource) => {
        if (onItemClick) {
            onItemClick(media);
        }
    };

    const handleItemDoubleClick = (media: MediaResource) => {
        if (onItemDoubleClick) {
            onItemDoubleClick(media);
        }
    };

    const handleCheckboxChange = (id: string) => {
        if (onCheckChange) {
            onCheckChange(id);
        }
    };

    return (
        <List
            sx={{
                width: '100%',
                backgroundColor: theme.palette.background.paper,
            }}
        >
            {items.map((media, index) => {
                const selected = isSelected(media.id);
                const isEvenRow = index % 2 === 0;

                return (
                    <ListItem
                        id={`media-list-item-${media.id}`}
                        key={media.id}
                        onClick={() => handleItemClick(media)}
                        onDoubleClick={() => handleItemDoubleClick(media)}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            px: 2,
                            py: 1.5,
                            backgroundColor: selected
                                ? theme.palette.action.selected
                                : isEvenRow
                                    ? theme.palette.background.default
                                    : theme.palette.background.paper,
                            cursor: 'pointer',
                            transition: 'background-color 0.2s',
                            '&:hover': {
                                backgroundColor: selected
                                    ? theme.palette.action.selected
                                    : theme.palette.action.hover,
                            },
                        }}
                    >
                        {isMultiSelectMode && (
                            <Checkbox
                                checked={selectedIds.includes(media.id)}
                                onChange={() => handleCheckboxChange(media.id)}
                                onClick={(e) => e.stopPropagation()}
                                sx={{
                                    color: theme.palette.primary.main,
                                    '&.Mui-checked': {
                                        color: theme.palette.primary.main,
                                    },
                                }}
                            />
                        )}

                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 40,
                                height: 40,
                                borderRadius: 1,
                                backgroundColor: theme.palette.action.hover,
                            }}
                        >
                            {media.resourceType === ResourceType.AmbientSound ? (
                                <MusicNote
                                    sx={{
                                        fontSize: 24,
                                        color: theme.palette.primary.main,
                                    }}
                                />
                            ) : (
                                <AudioFile
                                    sx={{
                                        fontSize: 24,
                                        color: theme.palette.primary.main,
                                    }}
                                />
                            )}
                        </Box>

                        <Box
                            sx={{
                                flex: 1,
                                minWidth: 0,
                            }}
                        >
                            <Typography
                                variant='body2'
                                sx={{
                                    fontWeight: 500,
                                    color: theme.palette.text.primary,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                {media.fileName}
                            </Typography>
                        </Box>

                        <Typography
                            variant='body2'
                            sx={{
                                minWidth: 60,
                                textAlign: 'right',
                                color: theme.palette.text.secondary,
                            }}
                        >
                            {parseDuration(media.duration)}
                        </Typography>

                        <Typography
                            variant='body2'
                            sx={{
                                minWidth: 80,
                                textAlign: 'right',
                                color: theme.palette.text.secondary,
                            }}
                        >
                            {formatFileSize(media.fileLength)}
                        </Typography>

                        <Box
                            sx={{
                                minWidth: 300,
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <AudioPreviewPlayer resourceId={media.id} compact />
                        </Box>
                    </ListItem>
                );
            })}
        </List>
    );
};

export default MediaList;
