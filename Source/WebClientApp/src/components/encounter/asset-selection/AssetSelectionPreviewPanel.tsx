import React from 'react';
import {
  Box,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  useTheme,
} from '@mui/material';
import { Category as CategoryIcon, Image as ImageIcon } from '@mui/icons-material';
import { type Asset, AssetKind } from '@/types/domain';
import { useResourceUrl } from '@/hooks/useResourceUrl';
import { getDefaultAssetImage } from '@/utils/assetHelpers';

const shouldShowPortrait = (asset: Asset): boolean => {
  const kind = asset.classification.kind;
  return kind === AssetKind.Creature || kind === AssetKind.Character;
};

export interface AssetSelectionPreviewPanelProps {
  asset: Asset | null;
  selectedTokenIndex: number;
  onTokenIndexChange: (index: number) => void;
}

export const AssetSelectionPreviewPanel: React.FC<AssetSelectionPreviewPanelProps> = ({
  asset,
  selectedTokenIndex,
  onTokenIndexChange,
}) => {
  const theme = useTheme();

  const tokens = asset?.tokens ?? [];
  const currentToken = tokens[selectedTokenIndex];
  const defaultImage = asset ? getDefaultAssetImage(asset) : null;
  const displayResourceId = currentToken?.id ?? defaultImage?.id;
  const { url: tokenUrl, isLoading: isTokenLoading } = useResourceUrl(displayResourceId);
  const { url: portraitUrl, isLoading: isPortraitLoading } = useResourceUrl(asset?.portrait?.id);

  const sectionTitleSx = {
    fontWeight: 700,
    fontSize: '0.75rem',
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    color: theme.palette.text.primary,
  };

  if (!asset) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          p: 3,
          color: theme.palette.text.secondary,
        }}
      >
        <CategoryIcon sx={{ fontSize: 64, opacity: 0.3, mb: 2 }} />
        <Typography variant="body2" sx={{ textAlign: 'center' }}>
          Select an asset from the list to preview and configure placement
        </Typography>
      </Box>
    );
  }

  const sizeLabel = `${asset.tokenSize.width}x${asset.tokenSize.height}`;
  const sizeName = asset.tokenSize.width === 1 && asset.tokenSize.height === 1
    ? 'Medium'
    : asset.tokenSize.width <= 2
      ? 'Large'
      : 'Huge';

  const showPortrait = shouldShowPortrait(asset);

  const tokenWidth = asset.tokenSize.width;
  const tokenHeight = asset.tokenSize.height;
  const cellSize = 48;
  const gridCols = Math.max(3, tokenWidth + 2);
  const gridRows = Math.max(3, tokenHeight + 2);
  const gridWidth = gridCols * cellSize;
  const gridHeight = gridRows * cellSize;
  const tokenLeft = Math.floor((gridCols - tokenWidth) / 2) * cellSize;
  const tokenTop = Math.floor((gridRows - tokenHeight) / 2) * cellSize;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {/* Side-by-side layout for Portrait and Token */}
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            justifyContent: showPortrait ? 'flex-start' : 'center',
          }}
        >
          {/* Portrait Section - Only for Creatures and Characters */}
          {showPortrait && (
            <Box sx={{ display: 'flex', flexDirection: 'column', flex: '0 0 auto' }}>
              <Typography sx={{ ...sectionTitleSx, mb: 1 }}>Portrait</Typography>
              <Box
                sx={{
                  width: 140,
                  height: 140,
                  backgroundColor: theme.palette.action.hover,
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}
              >
                {isPortraitLoading ? (
                  <CircularProgress size={32} />
                ) : portraitUrl ? (
                  <Box
                    component="img"
                    src={portraitUrl}
                    alt={`${asset.name} portrait`}
                    sx={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                ) : (
                  <Box sx={{ textAlign: 'center', p: 1 }}>
                    <ImageIcon sx={{ fontSize: 40, color: theme.palette.text.disabled }} />
                    <Typography variant="caption" color="text.secondary" display="block">
                      No portrait
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          )}

          {/* Token Preview Section */}
          <Box sx={{ display: 'flex', flexDirection: 'column', flex: '0 0 auto' }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 1,
                minWidth: gridWidth,
              }}
            >
              <Typography sx={sectionTitleSx}>Token</Typography>
              {tokens.length > 1 && (
                <FormControl size="small" sx={{ minWidth: 100 }}>
                  <InputLabel sx={{ fontSize: '0.75rem' }}>View</InputLabel>
                  <Select
                    value={selectedTokenIndex}
                    onChange={(e) => onTokenIndexChange(e.target.value as number)}
                    label="View"
                    sx={{
                      fontSize: '0.75rem',
                      '& .MuiSelect-select': { py: 0.5 },
                    }}
                  >
                    {tokens.map((token, index) => (
                      <MenuItem key={token.id} value={index} sx={{ fontSize: '0.75rem' }}>
                        {token.fileName || `Token ${index + 1}`}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </Box>
            <Box
              sx={{
                width: gridWidth,
                height: gridHeight,
                borderRadius: 1,
                border: `1px solid ${theme.palette.divider}`,
                position: 'relative',
                overflow: 'hidden',
                backgroundColor: theme.palette.mode === 'dark' ? '#1a1a2e' : '#f5f0e6',
              }}
            >
              {/* Grid pattern */}
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage: `
                    linear-gradient(${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'} 1px, transparent 1px),
                    linear-gradient(90deg, ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'} 1px, transparent 1px)
                  `,
                  backgroundSize: `${cellSize}px ${cellSize}px`,
                }}
              />
              {isTokenLoading ? (
                <Box
                  sx={{
                    position: 'absolute',
                    top: tokenTop,
                    left: tokenLeft,
                    width: tokenWidth * cellSize,
                    height: tokenHeight * cellSize,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CircularProgress size={Math.min(tokenWidth, tokenHeight) * cellSize * 0.4} />
                </Box>
              ) : tokenUrl ? (
                <Box
                  component="img"
                  src={tokenUrl}
                  alt={asset.name}
                  sx={{
                    position: 'absolute',
                    top: tokenTop,
                    left: tokenLeft,
                    width: tokenWidth * cellSize,
                    height: tokenHeight * cellSize,
                    objectFit: 'contain',
                  }}
                />
              ) : (
                <Box
                  sx={{
                    position: 'absolute',
                    top: tokenTop,
                    left: tokenLeft,
                    width: tokenWidth * cellSize,
                    height: tokenHeight * cellSize,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CategoryIcon sx={{ fontSize: 48, color: theme.palette.text.disabled }} />
                </Box>
              )}
            </Box>
            <Typography
              variant="caption"
              sx={{
                textAlign: 'center',
                color: theme.palette.text.secondary,
                mt: 1,
              }}
            >
              Size: {sizeLabel} ({sizeName})
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default AssetSelectionPreviewPanel;
