import { Button, Box } from '@mui/material';
import type React from 'react';
import { ContentCard, PublishedBadge } from '../shared';
import { ContentType } from '../../types';
import type { Encounter } from '@/types/domain';
import { getApiEndpoints } from '@/config/development';

const ENCOUNTER_DEFAULT_BACKGROUND = '/assets/backgrounds/tavern.png';

export interface EncounterCardProps {
    encounter: Encounter;
    onOpen: (id: string) => void;
    onDuplicate: (id: string) => void;
    onDelete: (id: string) => void;
}

export function EncounterCard({ encounter, onOpen, onDuplicate, onDelete }: EncounterCardProps) {
    const handleClone = (event: React.MouseEvent) => {
        event.stopPropagation();
        onDuplicate(encounter.id);
    };

    const handleDelete = (event: React.MouseEvent) => {
        event.stopPropagation();
        onDelete(encounter.id);
    };

    const apiEndpoints = getApiEndpoints();
    const thumbnailUrl = encounter.stage.background
        ? `${apiEndpoints.media}/${encounter.stage.background.id}`
        : ENCOUNTER_DEFAULT_BACKGROUND;

    const badges = encounter.isPublished ? <PublishedBadge /> : undefined;

    const actions = (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <Button
                id={`btn-clone-encounter-${encounter.id}`}
                size="small"
                variant="outlined"
                onClick={handleClone}
            >
                Clone
            </Button>
            <Button
                id={`btn-delete-encounter-${encounter.id}`}
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
                id: encounter.id,
                type: ContentType.Adventure,
                name: encounter.name,
                isPublished: encounter.isPublished,
                thumbnailUrl
            }}
            onClick={onOpen}
            badges={badges}
            actions={actions}
        />
    );
}
