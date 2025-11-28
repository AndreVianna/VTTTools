import { Box, Button, Typography } from '@mui/material';
import type React from 'react';
import type { World } from '../../../../types/domain';
import { ContentType } from '../../../../types/domain';
import { ContentCard, PublishedBadge } from '../shared';

const WORLD_DEFAULT_BACKGROUND = '/assets/backgrounds/world.png';

export interface WorldCardProps {
  world: World;
  mediaBaseUrl: string;
  onOpen: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}

export function WorldCard({ world, mediaBaseUrl, onOpen, onDuplicate, onDelete }: WorldCardProps) {
  const handleClone = (event: React.MouseEvent) => {
    event.stopPropagation();
    onDuplicate(world.id);
  };

  const handleDelete = (event: React.MouseEvent) => {
    event.stopPropagation();
    onDelete(world.id);
  };

  const badges = <>{world.isPublished && <PublishedBadge />}</>;

  const campaignCount = world.campaigns?.length ?? 0;

  const metadata = (
    <Typography variant='body2' color='text.secondary'>
      {campaignCount} {campaignCount === 1 ? 'campaign' : 'campaigns'}
    </Typography>
  );

  const actions = (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
      <Button id={`btn-clone-world-${world.id}`} size='small' variant='outlined' onClick={handleClone}>
        Clone
      </Button>
      <Button id={`btn-delete-world-${world.id}`} size='small' variant='outlined' color='error' onClick={handleDelete}>
        Delete
      </Button>
    </Box>
  );

  const backgroundUrl = world.background ? `${mediaBaseUrl}/${world.background.id}` : WORLD_DEFAULT_BACKGROUND;

  return (
    <ContentCard
      item={{
        id: world.id,
        type: ContentType.World,
        name: world.name,
        isPublished: world.isPublished,
        thumbnailUrl: backgroundUrl,
      }}
      onClick={onOpen}
      badges={badges}
      metadata={metadata}
      actions={actions}
    />
  );
}
