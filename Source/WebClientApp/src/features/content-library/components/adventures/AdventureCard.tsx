import { Chip, Typography, IconButton, Menu, MenuItem } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useState } from 'react';
import { ContentCard, PublishedBadge } from '../shared';
import { AdventureStyle } from '../../types';
import type { Adventure } from '../../types';
import { getApiEndpoints } from '@/config/development';

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
    const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        event.stopPropagation();
        setMenuAnchor(event.currentTarget);
    };

    const handleMenuClose = () => {
        setMenuAnchor(null);
    };

    const handleDuplicate = (event: React.MouseEvent) => {
        event.stopPropagation();
        handleMenuClose();
        onDuplicate(adventure.id);
    };

    const handleDelete = (event: React.MouseEvent) => {
        event.stopPropagation();
        handleMenuClose();
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
            <Chip
                label={getAdventureStyleLabel(adventure.style)}
                size="small"
                color={getAdventureStyleColor(adventure.style)}
                variant="outlined"
            />
            {adventure.isPublished && <PublishedBadge />}
        </>
    );

    const sceneCount = adventure.scenes?.length || 0;

    const metadata = (
        <Typography variant="body2" color="text.secondary">
            {sceneCount} {sceneCount === 1 ? 'scene' : 'scenes'}
        </Typography>
    );

    const actions = (
        <IconButton
            id={`btn-menu-adventure-${adventure.id}`}
            size="small"
            onClick={handleMenuOpen}
            aria-label="Adventure actions"
        >
            <MoreVertIcon />
        </IconButton>
    );

    const apiEndpoints = getApiEndpoints();
    const backgroundUrl = adventure.background
        ? `${apiEndpoints.media}/${adventure.background.id}`
        : undefined;

    return (
        <>
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
            <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={handleMenuClose}
            >
                <MenuItem id={`menu-item-duplicate-${adventure.id}`} onClick={handleDuplicate}>
                    Duplicate
                </MenuItem>
                <MenuItem id={`menu-item-delete-${adventure.id}`} onClick={handleDelete}>
                    Delete
                </MenuItem>
            </Menu>
        </>
    );
}
