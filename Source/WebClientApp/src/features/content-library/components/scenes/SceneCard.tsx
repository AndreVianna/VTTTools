import { Chip, Typography, IconButton, Menu, MenuItem } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useState } from 'react';
import type React from 'react';
import { ContentCard, PublishedBadge } from '../shared';
import { GridType } from '@/utils/gridCalculator';
import type { Scene } from '@/types/domain';

export interface SceneCardProps {
    scene: Scene;
    onOpen: (id: string) => void;
    onDuplicate: (id: string) => void;
    onDelete: (id: string) => void;
}

const getGridTypeLabel = (gridType: GridType): string => {
    switch (gridType) {
        case GridType.Square:
            return 'Square';
        case GridType.HexH:
            return 'Hex-H';
        case GridType.HexV:
            return 'Hex-V';
        case GridType.Isometric:
            return 'Isometric';
        case GridType.NoGrid:
            return 'No Grid';
        default:
            return 'Unknown';
    }
};

export function SceneCard({ scene, onOpen, onDuplicate, onDelete }: SceneCardProps) {
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
        onDuplicate(scene.id);
    };

    const handleDelete = (event: React.MouseEvent) => {
        event.stopPropagation();
        handleMenuClose();
        onDelete(scene.id);
    };

    const badges = (
        <>
            <Chip
                label={getGridTypeLabel(scene.grid.type)}
                size="small"
                variant="outlined"
            />
            {scene.isPublished && <PublishedBadge />}
        </>
    );

    const metadata = (
        <Typography variant="body2" color="text.secondary">
            {scene.assets.length} {scene.assets.length === 1 ? 'asset' : 'assets'}
        </Typography>
    );

    const actions = (
        <IconButton
            id={`btn-menu-scene-${scene.id}`}
            size="small"
            onClick={handleMenuOpen}
            aria-label="Scene actions"
        >
            <MoreVertIcon />
        </IconButton>
    );

    return (
        <>
            <ContentCard
                item={{
                    id: scene.id,
                    type: 'scene',
                    name: scene.name,
                    isPublished: scene.isPublished
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
                <MenuItem id={`menu-item-duplicate-${scene.id}`} onClick={handleDuplicate}>
                    Duplicate
                </MenuItem>
                <MenuItem id={`menu-item-delete-${scene.id}`} onClick={handleDelete}>
                    Delete
                </MenuItem>
            </Menu>
        </>
    );
}
