import { Box, CircularProgress, Grid, useTheme } from '@mui/material';
import React, { useEffect, useRef } from 'react';

import type { MediaResource } from '@/types/domain';

import { MediaCard } from './MediaCard';

export interface MediaGridProps {
    items: MediaResource[];
    selectedId?: string | null;
    selectedIds?: string[];
    isMultiSelectMode?: boolean;
    viewMode: 'grid-large' | 'grid-small';
    onItemClick?: (media: MediaResource) => void;
    onItemDoubleClick?: (media: MediaResource) => void;
    onCheckChange?: (id: string) => void;
    onLoadMore?: () => void;
    hasMore?: boolean;
    isLoading?: boolean;
}

export const MediaGrid: React.FC<MediaGridProps> = ({
    items,
    selectedId,
    selectedIds = [],
    isMultiSelectMode = false,
    viewMode,
    onItemClick,
    onItemDoubleClick,
    onCheckChange,
    onLoadMore,
    hasMore = false,
    isLoading = false,
}) => {
    const theme = useTheme();
    const sentinelRef = useRef<HTMLDivElement>(null);

    const cardSize = viewMode === 'grid-large' ? 'large' : 'small';

    useEffect(() => {
        if (!sentinelRef.current || !onLoadMore) {
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];
                if (entry?.isIntersecting && hasMore && !isLoading) {
                    onLoadMore();
                }
            },
            {
                root: null,
                rootMargin: '100px',
                threshold: 0.1,
            }
        );

        observer.observe(sentinelRef.current);

        return () => {
            observer.disconnect();
        };
    }, [onLoadMore, hasMore, isLoading]);

    const handleItemClick = (media: MediaResource) => {
        onItemClick?.(media);
    };

    const handleItemDoubleClick = (media: MediaResource) => {
        onItemDoubleClick?.(media);
    };

    const handleCheckChange = (id: string) => {
        onCheckChange?.(id);
    };

    return (
        <Box
            sx={{
                width: '100%',
                height: '100%',
                overflow: 'auto',
                padding: theme.spacing(2),
                backgroundColor: theme.palette.background.default,
            }}
        >
            <Grid
                id="media-grid-container"
                container
                spacing={2}
                sx={{
                    margin: 0,
                    width: '100%',
                }}
            >
                {items.map((media) => {
                    if (!media) return null;
                    const isSelected = selectedId === media.id;
                    const isChecked = selectedIds.includes(media.id);

                    return (
                        <Grid key={media.id}>
                            <MediaCard
                                media={media}
                                isSelected={isSelected}
                                isMultiSelectMode={isMultiSelectMode}
                                isChecked={isChecked}
                                onClick={() => handleItemClick(media)}
                                onDoubleClick={() => handleItemDoubleClick(media)}
                                onCheckChange={() => handleCheckChange(media.id)}
                                size={cardSize}
                            />
                        </Grid>
                    );
                })}
            </Grid>

            {hasMore && (
                <Box
                    ref={sentinelRef}
                    sx={{
                        height: 20,
                        margin: theme.spacing(2, 0),
                    }}
                />
            )}

            {isLoading && (
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        padding: theme.spacing(3),
                    }}
                >
                    <CircularProgress size={40} />
                </Box>
            )}
        </Box>
    );
};

export default MediaGrid;
