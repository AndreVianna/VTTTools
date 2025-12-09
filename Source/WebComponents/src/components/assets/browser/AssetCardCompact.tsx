import React, { useState, useEffect, useCallback } from 'react';
import { Box, Card, CardMedia, Checkbox, Chip, Typography, useTheme } from '@mui/material';
import { Category as CategoryIcon } from '@mui/icons-material';
import type { Asset } from '../../../types/domain';
import { getDefaultAssetImage, getResourceUrl } from '../../../utils/assetHelpers';

export interface AssetCardCompactProps {
  asset: Asset;
  isSelected: boolean;
  isMultiSelectMode?: boolean;
  isChecked?: boolean;
  onClick: () => void;
  onDoubleClick: () => void;
  onCheckChange?: (checked: boolean) => void;
  size: 'small' | 'large';
}

const CARD_SIZES = {
  small: 120,
  large: 180,
};

const TOKEN_CYCLE_INTERVAL = 1000;

export const AssetCardCompact: React.FC<AssetCardCompactProps> = ({
  asset,
  isSelected,
  isMultiSelectMode = false,
  isChecked = false,
  onClick,
  onDoubleClick,
  onCheckChange,
  size,
}) => {
  const theme = useTheme();
  const cardSize = CARD_SIZES[size];
  const [currentTokenIndex, setCurrentTokenIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  const tokens = asset.tokens;
  const hasMultipleTokens = tokens.length > 1;

  useEffect(() => {
    if (!isHovering || !hasMultipleTokens) {
      return;
    }

    const interval = setInterval(() => {
      setCurrentTokenIndex((prev) => (prev + 1) % tokens.length);
    }, TOKEN_CYCLE_INTERVAL);

    return () => clearInterval(interval);
  }, [isHovering, hasMultipleTokens, tokens.length]);

  const handleMouseEnter = useCallback(() => setIsHovering(true), []);
  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
    setCurrentTokenIndex(0);
  }, []);

  const handleCheckboxClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onCheckChange?.(!isChecked);
    },
    [isChecked, onCheckChange]
  );

  const displayImage = isHovering && hasMultipleTokens ? tokens[currentTokenIndex] : getDefaultAssetImage(asset);

  const imageUrl = displayImage ? getResourceUrl(displayImage.id) : null;

  const statBadge = asset.statBlocks[0]?.['CR']?.value || asset.statBlocks[0]?.['HP']?.value;

  return (
    <Card
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      sx={{
        width: cardSize,
        cursor: 'pointer',
        position: 'relative',
        border: isSelected ? `2px solid ${theme.palette.primary.main}` : '2px solid transparent',
        borderRadius: 1,
        transition: 'all 0.15s ease-in-out',
        backgroundColor: theme.palette.background.paper,
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows[4],
        },
      }}
    >
      {isMultiSelectMode && (
        <Checkbox
          checked={isChecked}
          onClick={handleCheckboxClick}
          size="small"
          sx={{
            position: 'absolute',
            top: 2,
            left: 2,
            zIndex: 2,
            padding: 0.25,
            backgroundColor: theme.palette.background.paper,
            borderRadius: 0.5,
            '&:hover': {
              backgroundColor: theme.palette.background.paper,
            },
          }}
        />
      )}

      {hasMultipleTokens && (
        <Chip
          label={tokens.length}
          size="small"
          sx={{
            position: 'absolute',
            top: 4,
            right: 4,
            zIndex: 2,
            height: 18,
            fontSize: '0.65rem',
            backgroundColor: theme.palette.background.paper,
            opacity: 0.9,
          }}
        />
      )}

      <Box
        sx={{
          width: cardSize,
          height: cardSize,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.palette.action.hover,
          overflow: 'hidden',
        }}
      >
        {imageUrl ? (
          <CardMedia
            component="img"
            image={imageUrl}
            alt={asset.name}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : (
          <CategoryIcon
            sx={{
              fontSize: cardSize * 0.4,
              color: theme.palette.text.disabled,
            }}
          />
        )}
      </Box>

      <Box sx={{ p: 0.75 }}>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 500,
            fontSize: size === 'small' ? '0.7rem' : '0.8rem',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {asset.name}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 0.25 }}>
          <Typography
            variant="caption"
            sx={{
              color: theme.palette.text.secondary,
              fontSize: size === 'small' ? '0.6rem' : '0.7rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: '60%',
            }}
          >
            {asset.classification.type || asset.classification.category}
          </Typography>
          {statBadge && (
            <Chip
              label={statBadge}
              size="small"
              sx={{
                height: 16,
                fontSize: '0.6rem',
                '& .MuiChip-label': {
                  px: 0.5,
                },
              }}
            />
          )}
        </Box>
      </Box>
    </Card>
  );
};

export default AssetCardCompact;
