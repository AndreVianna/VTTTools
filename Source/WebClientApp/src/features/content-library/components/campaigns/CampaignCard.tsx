import { Box, Button, Typography } from '@mui/material';
import type React from 'react';
import { getApiEndpoints } from '@/config/development';
import type { Campaign } from '@/types/domain';
import { ContentType } from '../../types';
import { ContentCard, PublishedBadge } from '../shared';

const CAMPAIGN_DEFAULT_BACKGROUND = '/assets/backgrounds/campaign.png';

export interface CampaignCardProps {
  campaign: Campaign;
  onOpen: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}

export function CampaignCard({ campaign, onOpen, onDuplicate, onDelete }: CampaignCardProps) {
  const handleClone = (event: React.MouseEvent) => {
    event.stopPropagation();
    onDuplicate(campaign.id);
  };

  const handleDelete = (event: React.MouseEvent) => {
    event.stopPropagation();
    onDelete(campaign.id);
  };

  const badges = <>{campaign.isPublished && <PublishedBadge />}</>;

  const adventureCount = campaign.adventures?.length ?? 0;

  const metadata = (
    <Typography variant='body2' color='text.secondary'>
      {adventureCount} {adventureCount === 1 ? 'adventure' : 'adventures'}
    </Typography>
  );

  const actions = (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
      <Button id={`btn-clone-campaign-${campaign.id}`} size='small' variant='outlined' onClick={handleClone}>
        Clone
      </Button>
      <Button
        id={`btn-delete-campaign-${campaign.id}`}
        size='small'
        variant='outlined'
        color='error'
        onClick={handleDelete}
      >
        Delete
      </Button>
    </Box>
  );

  const apiEndpoints = getApiEndpoints();
  const backgroundUrl = campaign.background
    ? `${apiEndpoints.media}/${campaign.background.id}`
    : CAMPAIGN_DEFAULT_BACKGROUND;

  return (
    <ContentCard
      item={{
        id: campaign.id,
        type: ContentType.Campaign,
        name: campaign.name,
        isPublished: campaign.isPublished,
        thumbnailUrl: backgroundUrl,
      }}
      onClick={onOpen}
      badges={badges}
      metadata={metadata}
      actions={actions}
    />
  );
}
