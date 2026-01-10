import React from 'react';
import { Box, IconButton, useTheme } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import type { MediaResource } from '@/types/domain';
import { ResourceImage } from '@/components/common/ResourceImage';

export interface TokenCarouselProps {
  tokens: MediaResource[];
  selectedIndex?: number;
  onSelect?: (index: number) => void;
  size?: 'small' | 'medium';
  showNavigation?: boolean;
}

const TOKEN_SIZES = {
  small: 48,
  medium: 64,
};

export const TokenCarousel: React.FC<TokenCarouselProps> = ({
  tokens,
  selectedIndex,
  onSelect,
  size = 'medium',
  showNavigation = true,
}) => {
  const theme = useTheme();
  const tokenSize = TOKEN_SIZES[size];
  const containerRef = React.useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!containerRef.current) return;
    const scrollAmount = tokenSize + 8;
    containerRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  if (tokens.length === 0) {
    return (
      <Box
        sx={{
          height: tokenSize,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: theme.palette.text.secondary,
          fontSize: '0.75rem',
        }}
      >
        No tokens
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      {showNavigation && tokens.length > 3 && (
        <IconButton size="small" onClick={() => scroll('left')} sx={{ p: 0.25 }}>
          <ChevronLeft fontSize="small" />
        </IconButton>
      )}

      <Box
        ref={containerRef}
        sx={{
          display: 'flex',
          gap: 1,
          overflowX: 'auto',
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
          flexGrow: 1,
          py: 0.5,
        }}
      >
        {tokens.map((token, index) => (
          <Box
            key={token.id}
            onClick={() => onSelect?.(index)}
            sx={{
              width: tokenSize,
              height: tokenSize,
              flexShrink: 0,
              borderRadius: 1,
              overflow: 'hidden',
              cursor: onSelect ? 'pointer' : 'default',
              border:
                selectedIndex === index
                  ? `2px solid ${theme.palette.primary.main}`
                  : `2px solid transparent`,
              transition: 'all 0.15s ease-in-out',
              '&:hover': onSelect
                ? {
                    transform: 'scale(1.05)',
                    boxShadow: theme.shadows[2],
                  }
                : undefined,
              position: 'relative',
              backgroundColor: theme.palette.action.hover,
              backgroundImage: `
                linear-gradient(45deg, ${theme.palette.action.disabledBackground} 25%, transparent 25%),
                linear-gradient(-45deg, ${theme.palette.action.disabledBackground} 25%, transparent 25%),
                linear-gradient(45deg, transparent 75%, ${theme.palette.action.disabledBackground} 75%),
                linear-gradient(-45deg, transparent 75%, ${theme.palette.action.disabledBackground} 75%)
              `,
              backgroundSize: '8px 8px',
              backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px',
            }}
          >
            <ResourceImage
              resourceId={token.id}
              alt={token.fileName}
              objectFit="contain"
              loadingSize={tokenSize * 0.4}
              sx={{ position: 'relative', zIndex: 1 }}
            />
          </Box>
        ))}
      </Box>

      {showNavigation && tokens.length > 3 && (
        <IconButton size="small" onClick={() => scroll('right')} sx={{ p: 0.25 }}>
          <ChevronRight fontSize="small" />
        </IconButton>
      )}
    </Box>
  );
};

export default TokenCarousel;
