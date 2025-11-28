import { Box, Button } from '@mui/material';
import type React from 'react';
import type { Encounter } from '../../../../types/domain';
import { ContentType } from '../../../../types/domain';
import { ContentCard, PublishedBadge } from '../shared';

const ENCOUNTER_DEFAULT_BACKGROUND = '/assets/backgrounds/tavern.png';

export interface EncounterCardProps {
  encounter: Encounter;
  mediaBaseUrl: string;
  onOpen: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}

export function EncounterCard({ encounter, mediaBaseUrl, onOpen, onDuplicate, onDelete }: EncounterCardProps) {
  const handleClone = (event: React.MouseEvent) => {
    event.stopPropagation();
    onDuplicate(encounter.id);
  };

  const handleDelete = (event: React.MouseEvent) => {
    event.stopPropagation();
    onDelete(encounter.id);
  };

  const thumbnailUrl = encounter.stage.background
    ? `${mediaBaseUrl}/${encounter.stage.background.id}`
    : ENCOUNTER_DEFAULT_BACKGROUND;

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
        thumbnailUrl,
      }}
      onClick={onOpen}
      badges={badges}
      actions={actions}
    />
  );
}
