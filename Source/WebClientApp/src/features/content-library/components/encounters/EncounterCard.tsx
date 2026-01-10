import { Box, Button } from '@mui/material';
import type React from 'react';
import { getApiEndpoints } from '@/config/development';
import type { EncounterCard as EncounterCardType } from '@/types/domain';
import { ContentType } from '../../types';
import { ContentCard, PublishedBadge } from '../shared';

const ENCOUNTER_DEFAULT_BACKGROUND = '/assets/backgrounds/tavern.png';

export interface EncounterCardProps {
  encounter: EncounterCardType;
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

  const resourceUrl = encounter.backgroundId
    ? `${apiEndpoints.media}/${encounter.backgroundId}/thumbnail`
    : null;

  const badges = encounter.isPublished ? <PublishedBadge /> : undefined;

  const actions = (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
      <Button id={`btn-clone-encounter-${encounter.id}`} size='small' variant='outlined' onClick={handleClone}>
        Clone
      </Button>
      <Button
        id={`btn-delete-encounter-${encounter.id}`}
        size='small'
        variant='outlined'
        color='error'
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
        thumbnailUrl: ENCOUNTER_DEFAULT_BACKGROUND,
        resourceUrl,
      }}
      onClick={onOpen}
      badges={badges}
      actions={actions}
      showNameOverlay
    />
  );
}
