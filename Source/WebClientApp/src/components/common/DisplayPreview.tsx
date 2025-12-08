import { Box, useTheme } from '@mui/material';
import type React from 'react';
import { ResourceImage } from '@/components/common/ResourceImage';

export interface DisplayPreviewProps {
  resourceId: string | null | undefined;
  maxSize?: number;
  alt?: string;
}

const MAX_SIZE = 320;

export const DisplayPreview: React.FC<DisplayPreviewProps> = ({ resourceId, maxSize = MAX_SIZE, alt = 'Display' }) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        maxWidth: maxSize,
        maxHeight: maxSize,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      <ResourceImage
        resourceId={resourceId}
        alt={alt}
        objectFit='contain'
        loadingSize={40}
      />
    </Box>
  );
};
