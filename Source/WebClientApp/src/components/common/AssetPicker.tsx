// GENERATED: 2025-10-04 by Claude Code - Asset Picker Component
// LAYER: UI (Component)

/**
 * AssetPicker Component
 * Reusable asset selection dialog with filtering by category and type
 *
 * Usage:
 * - Can filter by single category (Static/Passive/Active)
 * - Can optionally filter by specific asset types
 * - Returns selected asset via onSelect callback
 * - Shows asset preview with image, name, and description
 */

import { Close as CloseIcon, Search as SearchIcon } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
  Typography,
} from '@mui/material';
import type React from 'react';
import { useMemo, useState } from 'react';
import { useGetAssetsQuery } from '@/services/assetsApi';
import { type Asset, AssetKind, type CreatureCategory } from '@/types/domain';
import { getDefaultToken, getResourceUrl } from '@/utils/assetHelpers';

export interface AssetPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (asset: Asset) => void;

  // Filtering options
  kind?: AssetKind; // Optional: filter by Object or Creature
  creatureCategory?: CreatureCategory; // Optional: filter Characters vs Monsters (if kind=Creature)

  // UI customization
  title?: string;
  multiSelect?: boolean; // Future: allow selecting multiple assets
}

export const AssetPicker: React.FC<AssetPickerProps> = ({
  open,
  onClose,
  onSelect,
  kind,
  creatureCategory: _creatureCategory,
  title,
  multiSelect = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  // Fetch assets from API with optional kind filter
  const { data: allAssets, isLoading, error } = useGetAssetsQuery(kind ? { kind } : {});

  // Filter assets by search query
  const filteredAssets = useMemo(() => {
    if (!allAssets) return [];

    return allAssets.filter((asset) => {
      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return asset.name.toLowerCase().includes(query) || asset.description.toLowerCase().includes(query);
      }

      return true;
    });
  }, [allAssets, searchQuery]);

  // Get kind display name
  const getKindName = (assetKind: AssetKind): string => {
    switch (assetKind) {
      case AssetKind.Object:
        return 'Objects';
      case AssetKind.Creature:
        return 'Creatures';
      default:
        return 'Assets';
    }
  };

  // Get kind color
  const getKindColor = (assetKind: AssetKind): string => {
    switch (assetKind) {
      case AssetKind.Object:
        return '#9E9E9E'; // Gray
      case AssetKind.Creature:
        return '#4CAF50'; // Green
      default:
        return '#2196F3'; // Blue
    }
  };

  const handleAssetClick = (asset: Asset) => {
    if (multiSelect) {
      // Future: handle multi-select
      setSelectedAsset(asset);
    } else {
      setSelectedAsset(asset);
    }
  };

  const handleConfirm = () => {
    if (selectedAsset) {
      const asset = selectedAsset;

      // Close dialog first
      setSelectedAsset(null);
      setSearchQuery('');
      onClose();

      // Wait for MUI Dialog to fully cleanup and remove aria-hidden
      const checkAndSelect = () => {
        const root = document.getElementById('root');
        const ariaHidden = root?.getAttribute('aria-hidden');

        if (ariaHidden === 'true') {
          setTimeout(checkAndSelect, 50);
        } else {
          onSelect(asset);
        }
      };

      setTimeout(checkAndSelect, 50);
    }
  };

  const handleClose = () => {
    setSelectedAsset(null);
    setSearchQuery('');
    onClose();
  };

  const dialogTitle = title || `Select ${kind ? getKindName(kind) : 'Asset'}`;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth='md'
      fullWidth
      PaperProps={{
        sx: { height: '80vh' },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant='h6'>{dialogTitle}</Typography>
            <Chip
              label={kind ?? 'All'}
              size='small'
              sx={{
                bgcolor: getKindColor(kind ?? AssetKind.Object),
                color: 'white',
                fontWeight: 500,
              }}
            />
          </Box>
          <Button onClick={handleClose} size='small' sx={{ minWidth: 'auto', p: 0.5 }}>
            <CloseIcon />
          </Button>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {/* Search Bar */}
        <TextField
          fullWidth
          size='small'
          placeholder='Search assets...'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
          sx={{ mb: 2 }}
        />

        {/* TODO: Add CreatureCategory filter chips here when needed */}

        {/* Loading State */}
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {/* Error State */}
        {error && (
          <Alert severity='error' sx={{ mb: 2 }}>
            Failed to load assets. Please try again.
          </Alert>
        )}

        {/* Assets Grid */}
        {!isLoading &&
          !error &&
          (filteredAssets.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color='text.secondary'>No assets found matching your criteria</Typography>
            </Box>
          ) : (
            <Grid container spacing={2}>
              {filteredAssets.map((asset) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={asset.id}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      border:
                        selectedAsset?.id === asset.id
                          ? `2px solid ${getKindColor(kind ?? AssetKind.Object)}`
                          : '2px solid transparent',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 4,
                      },
                    }}
                    onClick={() => handleAssetClick(asset)}
                  >
                    {/* Asset Image */}
                    <CardMedia
                      component='img'
                      height='120'
                      image={(() => {
                        const defaultToken = getDefaultToken(asset);
                        const tokenId = defaultToken?.token.id || asset.tokens?.[0]?.token.id;
                        return tokenId
                          ? getResourceUrl(tokenId)
                          : 'https://via.placeholder.com/100/CCCCCC/FFFFFF?text=No+Image';
                      })()}
                      alt={asset.name}
                      crossOrigin='use-credentials'
                      sx={{
                        objectFit: 'contain',
                        backgroundColor: 'action.hover',
                        p: 1,
                      }}
                    />

                    {/* Asset Info */}
                    <CardContent sx={{ p: 1.5 }}>
                      <Typography variant='subtitle2' noWrap>
                        {asset.name}
                      </Typography>
                      <Typography
                        variant='caption'
                        color='text.secondary'
                        sx={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {asset.description}
                      </Typography>
                      <Chip label={asset.kind} size='small' sx={{ mt: 0.5, fontSize: '0.7rem' }} />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ))}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose} variant='outlined'>
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          variant='contained'
          disabled={!selectedAsset}
          sx={{
            bgcolor: getKindColor(kind ?? AssetKind.Object),
            '&:hover': {
              bgcolor: getKindColor(kind ?? AssetKind.Object),
              filter: 'brightness(0.9)',
            },
          }}
        >
          Select Asset
        </Button>
      </DialogActions>
    </Dialog>
  );
};
