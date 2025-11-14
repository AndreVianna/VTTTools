import { Box, Card, CardActions, CardContent, CardMedia, Chip, Typography } from '@mui/material';
import type React from 'react';
import type { ContentItemSummary } from '../../types';

export interface ContentCardProps {
  item: ContentItemSummary;
  onClick: (id: string) => void;
  actions?: React.ReactNode;
  badges?: React.ReactNode;
  metadata?: React.ReactNode;
}

export function ContentCard({ item, onClick, actions, badges, metadata }: ContentCardProps) {
  const handleClick = () => {
    onClick(item.id);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <Card
      id={`card-${item.type}-${item.id}`}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
        '&:focus-visible': {
          outline: '2px solid',
          outlineColor: 'primary.main',
          outlineOffset: '2px',
        },
      }}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role='button'
      aria-label={`Open ${item.name}`}
    >
      {item.thumbnailUrl && (
        <CardMedia
          id={`thumbnail-${item.id}`}
          component='img'
          height='140'
          image={item.thumbnailUrl}
          alt={`${item.name} thumbnail`}
          sx={{ objectFit: 'cover' }}
        />
      )}
      {!item.thumbnailUrl && (
        <Box
          id={`placeholder-${item.id}`}
          sx={{
            height: 140,
            backgroundColor: 'action.hover',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography variant='h3' color='text.disabled'>
            🗺️
          </Typography>
        </Box>
      )}
      <CardContent id={`content-${item.id}`} sx={{ flexGrow: 1, pb: 1 }}>
        <Typography id={`title-${item.id}`} variant='h6' component='h3' gutterBottom noWrap title={item.name}>
          {item.name}
        </Typography>
        {metadata && <Box sx={{ mt: 1 }}>{metadata}</Box>}
        {badges && <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 1 }}>{badges}</Box>}
      </CardContent>
      {actions && <CardActions sx={{ pt: 0, px: 2, pb: 2 }}>{actions}</CardActions>}
    </Card>
  );
}

export function PublishedBadge() {
  return <Chip label='Published' size='small' color='success' variant='outlined' />;
}
