import { Chip, Typography, Button, Box } from '@mui/material';
import type React from 'react';
import { ContentCard, PublishedBadge } from '../shared';
import { AdventureStyle } from '../../types';
import type { Adventure } from '../../types';
import { getApiEndpoints } from '@/config/development';

const ADVENTURE_DEFAULT_BACKGROUND = '/assets/backgrounds/adventure.png';

export interface AdventureCardProps {
    adventure: Adventure;
    onOpen: (id: string) => void;
    onDuplicate: (id: string) => void;
    onDelete: (id: string) => void;
}

const getAdventureStyleLabel = (style: AdventureStyle): string => {
    switch (style) {
        case AdventureStyle.Generic:
            return 'Generic';
        case AdventureStyle.OpenWorld:
            return 'Open World';
        case AdventureStyle.DungeonCrawl:
            return 'Dungeon Crawl';
        case AdventureStyle.HackNSlash:
            return 'Hack-n-Slash';
        case AdventureStyle.Survival:
            return 'Survival';
        case AdventureStyle.GoalDriven:
            return 'Goal Driven';
        case AdventureStyle.RandomlyGenerated:
            return 'Randomly Generated';
        default:
            return 'Unknown';
    }
};

const getAdventureStyleColor = (style: AdventureStyle): 'primary' | 'secondary' | 'info' | 'success' | 'warning' => {
    switch (style) {
        case AdventureStyle.Generic:
            return 'primary';
        case AdventureStyle.OpenWorld:
            return 'success';
        case AdventureStyle.DungeonCrawl:
            return 'warning';
        case AdventureStyle.HackNSlash:
            return 'secondary';
        case AdventureStyle.Survival:
            return 'info';
        case AdventureStyle.GoalDriven:
            return 'primary';
        case AdventureStyle.RandomlyGenerated:
            return 'info';
        default:
            return 'primary';
    }
};

export function AdventureCard({ adventure, onOpen, onDuplicate, onDelete }: AdventureCardProps) {
    const handleClone = (event: React.MouseEvent) => {
        event.stopPropagation();
        onDuplicate(adventure.id);
    };

    const handleDelete = (event: React.MouseEvent) => {
        event.stopPropagation();
        onDelete(adventure.id);
    };

    const badges = (
        <>
            {adventure.isOneShot && (
                <Chip
                    label="One-Shot"
                    size="small"
                    color="info"
                    variant="filled"
                />
            )}
            {adventure.style != null && (
                <Chip
                    label={getAdventureStyleLabel(adventure.style)}
                    size="small"
                    color={getAdventureStyleColor(adventure.style)}
                    variant="outlined"
                />
            )}
            {adventure.isPublished && <PublishedBadge />}
        </>
    );

    const sceneCount = adventure.sceneCount ?? adventure.scenes?.length ?? 0;

    const metadata = (
        <Typography variant="body2" color="text.secondary">
            {sceneCount} {sceneCount === 1 ? 'scene' : 'scenes'}
        </Typography>
    );

    const actions = (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <Button
                id={`btn-clone-adventure-${adventure.id}`}
                size="small"
                variant="outlined"
                onClick={handleClone}
            >
                Clone
            </Button>
            <Button
                id={`btn-delete-adventure-${adventure.id}`}
                size="small"
                variant="outlined"
                color="error"
                onClick={handleDelete}
            >
                Delete
            </Button>
        </Box>
    );

    const apiEndpoints = getApiEndpoints();
    const backgroundUrl = adventure.background
        ? `${apiEndpoints.media}/${adventure.background.id}`
        : ADVENTURE_DEFAULT_BACKGROUND;

    return (
        <ContentCard
            item={{
                id: adventure.id,
                type: 'adventure',
                name: adventure.name,
                isPublished: adventure.isPublished,
                thumbnailUrl: backgroundUrl
            }}
            onClick={onOpen}
            badges={badges}
            metadata={metadata}
            actions={actions}
        />
    );
}
