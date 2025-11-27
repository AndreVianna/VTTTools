import { Box, useTheme } from '@mui/material';
import type React from 'react';
import type { NamedSize } from '../../types/domain';

export interface TokenPreviewProps {
  imageUrl: string;
  size: NamedSize;
  maxSize?: number;
}

const CELL_SIZE = 64;
const MAX_SIZE = 320;

export const TokenPreview: React.FC<TokenPreviewProps> = ({ imageUrl, size, maxSize = MAX_SIZE }) => {
  const theme = useTheme();

  const actualWidth = size.width * CELL_SIZE;
  const actualHeight = size.height * CELL_SIZE;

  const maxDimension = Math.max(actualWidth, actualHeight);
  const scaleFactor = maxDimension > maxSize ? maxSize / maxDimension : 1;

  const displayWidth = actualWidth * scaleFactor;
  const displayHeight = actualHeight * scaleFactor;
  const scaledCellSize = CELL_SIZE * scaleFactor;

  const padding = scaledCellSize * 0.5;
  const containerWidth = displayWidth + padding * 2;
  const containerHeight = displayHeight + padding * 2;

  const gridPattern = `
        linear-gradient(to right, ${theme.palette.divider} 1px, transparent 1px),
        linear-gradient(to bottom, ${theme.palette.divider} 1px, transparent 1px)
    `;

  return (
    <Box
      sx={{
        width: containerWidth,
        height: containerHeight,
        position: 'relative',
        background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
        backgroundImage: gridPattern,
        backgroundSize: `${scaledCellSize}px ${scaledCellSize}px`,
        backgroundPosition: `${padding}px ${padding}px`,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Box
        component='img'
        src={imageUrl}
        alt='Token'
        crossOrigin='use-credentials'
        sx={{
          width: displayWidth,
          height: displayHeight,
          objectFit: 'contain',
          position: 'absolute',
          top: padding,
          left: padding,
        }}
      />

      <Box
        sx={{
          position: 'absolute',
          bottom: 4,
          right: 4,
          bgcolor: 'background.paper',
          px: 0.5,
          py: 0.25,
          borderRadius: 0.5,
          fontSize: '0.625rem',
          color: 'text.secondary',
          opacity: 0.8,
        }}
      >
        {size.width}×{size.height}
        {scaleFactor < 1 && ` (${Math.round(scaleFactor * 100)}%)`}
      </Box>
    </Box>
  );
};
