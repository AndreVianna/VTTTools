import { Typography, Button, Box } from '@mui/material';
import type React from 'react';
import { ContentCard, PublishedBadge } from '../shared';
import { ContentType } from '../../types';
import type { Epic } from '@/types/domain';
import { getApiEndpoints } from '@/config/development';

const EPIC_DEFAULT_BACKGROUND = '/assets/backgrounds/epic.png';

export interface EpicCardProps {
    epic: Epic;
    onOpen: (id: string) => void;
    onDuplicate: (id: string) => void;
    onDelete: (id: string) => void;
}

export function EpicCard({ epic, onOpen, onDuplicate, onDelete }: EpicCardProps) {
    const handleClone = (event: React.MouseEvent) => {
        event.stopPropagation();
        onDuplicate(epic.id);
    };

    const handleDelete = (event: React.MouseEvent) => {
        event.stopPropagation();
        onDelete(epic.id);
    };

    const badges = (
        <>
            {epic.isPublished && <PublishedBadge />}
        </>
    );

    const campaignCount = epic.campaigns?.length ?? 0;

    const metadata = (
        <Typography variant="body2" color="text.secondary">
            {campaignCount} {campaignCount === 1 ? 'campaign' : 'campaigns'}
        </Typography>
    );

    const actions = (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <Button
                id={`btn-clone-epic-${epic.id}`}
                size="small"
                variant="outlined"
                onClick={handleClone}
            >
                Clone
            </Button>
            <Button
                id={`btn-delete-epic-${epic.id}`}
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
    const backgroundUrl = epic.background
        ? `${apiEndpoints.media}/${epic.background.id}`
        : EPIC_DEFAULT_BACKGROUND;

    return (
        <ContentCard
            item={{
                id: epic.id,
                type: ContentType.Epic,
                name: epic.name,
                isPublished: epic.isPublished,
                thumbnailUrl: backgroundUrl
            }}
            onClick={onOpen}
            badges={badges}
            metadata={metadata}
            actions={actions}
        />
    );
}
