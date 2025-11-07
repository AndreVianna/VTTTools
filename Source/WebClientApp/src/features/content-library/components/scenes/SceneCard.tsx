import { Button, Box } from '@mui/material';
import type React from 'react';
import { ContentCard, PublishedBadge } from '../shared';
import { ContentType } from '../../types';
import type { Scene } from '@/types/domain';
import { getApiEndpoints } from '@/config/development';

const SCENE_DEFAULT_BACKGROUND = '/assets/backgrounds/tavern.png';

export interface SceneCardProps {
    scene: Scene;
    onOpen: (id: string) => void;
    onDuplicate: (id: string) => void;
    onDelete: (id: string) => void;
}

export function SceneCard({ scene, onOpen, onDuplicate, onDelete }: SceneCardProps) {
    const handleClone = (event: React.MouseEvent) => {
        event.stopPropagation();
        onDuplicate(scene.id);
    };

    const handleDelete = (event: React.MouseEvent) => {
        event.stopPropagation();
        onDelete(scene.id);
    };

    const apiEndpoints = getApiEndpoints();
    const thumbnailUrl = scene.stage.background
        ? `${apiEndpoints.media}/${scene.stage.background.id}`
        : SCENE_DEFAULT_BACKGROUND;

    const badges = scene.isPublished ? <PublishedBadge /> : undefined;

    const actions = (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <Button
                id={`btn-clone-scene-${scene.id}`}
                size="small"
                variant="outlined"
                onClick={handleClone}
            >
                Clone
            </Button>
            <Button
                id={`btn-delete-scene-${scene.id}`}
                size="small"
                variant="outlined"
                color="error"
                onClick={handleDelete}
            >
                Delete
            </Button>
        </Box>
    );

    return (
        <ContentCard
            item={{
                id: scene.id,
                type: ContentType.Adventure,
                name: scene.name,
                isPublished: scene.isPublished,
                thumbnailUrl
            }}
            onClick={onOpen}
            badges={badges}
            actions={actions}
        />
    );
}
