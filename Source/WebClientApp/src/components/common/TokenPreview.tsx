// TokenPreview Component
// Renders asset token image with reference grid background
// Grid shows token size in cells (Size property × 64px per cell)

import { Box, useTheme } from '@mui/material';
import type React from 'react';
import type { NamedSize } from '@/types/domain';

export interface TokenPreviewProps {
  imageUrl: string;
  size: NamedSize; // Asset size from properties
  maxSize?: number; // Maximum dimension (default: 320px)
}

const CELL_SIZE = 64; // Base cell size in pixels
const MAX_SIZE = 320; // Maximum render size

export const TokenPreview: React.FC<TokenPreviewProps> = ({ imageUrl, size, maxSize = MAX_SIZE }) => {
  const theme = useTheme();

  // Calculate actual token dimensions (Size × 64px)
  const actualWidth = size.width * CELL_SIZE;
  const actualHeight = size.height * CELL_SIZE;

  // Calculate scale factor if exceeds max size
  const maxDimension = Math.max(actualWidth, actualHeight);
  const scaleFactor = maxDimension > maxSize ? maxSize / maxDimension : 1;

  // Scaled dimensions
  const displayWidth = actualWidth * scaleFactor;
  const displayHeight = actualHeight * scaleFactor;
  const scaledCellSize = CELL_SIZE * scaleFactor;

  // Add padding to show partial cells around token (0.5 cells on each side)
  const padding = scaledCellSize * 0.5;
  const containerWidth = displayWidth + padding * 2;
  const containerHeight = displayHeight + padding * 2;

  // Create grid pattern
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
      {/* Token Image */}
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

      {/* Size indicator (optional - shows actual cell dimensions) */}
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
