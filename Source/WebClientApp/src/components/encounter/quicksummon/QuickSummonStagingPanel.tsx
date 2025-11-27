import React from 'react';
import {
  Box,
  Checkbox,
  Divider,
  FormControlLabel,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  Category as CategoryIcon,
  Remove as RemoveIcon,
} from '@mui/icons-material';
import type { Asset } from '@/types/domain';
import type { PlacementSettings } from './types';
import { getResourceUrl } from '@/utils/assetHelpers';

export interface QuickSummonStagingPanelProps {
  asset: Asset | null;
  selectedTokenIndex: number;
  onTokenIndexChange: (index: number) => void;
  placementSettings: PlacementSettings;
  onSettingsChange: (updates: Partial<PlacementSettings>) => void;
}

export const QuickSummonStagingPanel: React.FC<QuickSummonStagingPanelProps> = ({
  asset,
  selectedTokenIndex,
  onTokenIndexChange,
  placementSettings,
  onSettingsChange,
}) => {
  const theme = useTheme();

  const tokens = asset?.tokens ?? [];
  const currentToken = tokens[selectedTokenIndex];
  const tokenUrl = currentToken ? getResourceUrl(currentToken.id) : null;

  const handleCountChange = (delta: number) => {
    const newCount = Math.max(1, Math.min(20, placementSettings.count + delta));
    onSettingsChange({ count: newCount });
  };

  const handleCountInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 1 && value <= 20) {
      onSettingsChange({ count: value });
    }
  };

  const sectionTitleSx = {
    fontWeight: 700,
    fontSize: '0.75rem',
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    color: theme.palette.text.primary,
  };

  const checkboxLabelSx = {
    fontSize: '0.875rem',
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

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {/* Token Preview Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 1.5,
        }}
      >
        <Typography sx={sectionTitleSx}>Token Preview</Typography>

        {/* View Selector */}
        {tokens.length > 0 && (
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel sx={{ fontSize: '0.8rem' }}>View</InputLabel>
            <Select
              value={selectedTokenIndex}
              onChange={(e) => onTokenIndexChange(e.target.value as number)}
              label="View"
              sx={{
                fontSize: '0.8rem',
                '& .MuiSelect-select': {
                  py: 0.75,
                },
              }}
            >
              {tokens.map((token, index) => (
                <MenuItem key={token.id} value={index} sx={{ fontSize: '0.8rem' }}>
                  {token.fileName || `Token ${index + 1}`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </Box>

      {/* Token Preview Area */}
      <Box
        sx={{
          mx: 2,
          aspectRatio: '1.4',
          backgroundColor: theme.palette.background.paper,
          borderRadius: 1,
          border: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Grid lines */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `
              linear-gradient(${theme.palette.divider} 1px, transparent 1px),
              linear-gradient(90deg, ${theme.palette.divider} 1px, transparent 1px)
            `,
            backgroundSize: '50% 50%',
            opacity: 0.3,
          }}
        />

        {tokenUrl ? (
          <Box
            component="img"
            src={tokenUrl}
            alt={asset.name}
            sx={{
              maxWidth: '60%',
              maxHeight: '60%',
              objectFit: 'contain',
              borderRadius: '50%',
              border: `3px solid ${theme.palette.primary.main}`,
              position: 'relative',
              zIndex: 1,
            }}
          />
        ) : (
          <CategoryIcon sx={{ fontSize: 80, color: theme.palette.text.disabled }} />
        )}
      </Box>

      {/* Size Info */}
      <Typography
        variant="caption"
        sx={{
          textAlign: 'center',
          color: theme.palette.text.secondary,
          mt: 1,
          mb: 2,
        }}
      >
        Size: {sizeLabel} ({sizeName})
      </Typography>

      <Divider />

      {/* Placement Settings */}
      <Box sx={{ px: 2, py: 2, flexGrow: 1, overflow: 'auto' }}>
        <Typography sx={{ ...sectionTitleSx, mb: 2 }}>Placement Settings</Typography>

        {/* Count */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography
            variant="body2"
            sx={{ color: theme.palette.text.secondary, width: 80 }}
          >
            Count
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <IconButton
              size="small"
              onClick={() => handleCountChange(-1)}
              disabled={placementSettings.count <= 1}
              sx={{
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 1,
                p: 0.5,
              }}
            >
              <RemoveIcon fontSize="small" />
            </IconButton>
            <TextField
              value={placementSettings.count}
              onChange={handleCountInputChange}
              size="small"
              type="number"
              inputProps={{
                min: 1,
                max: 20,
                style: { textAlign: 'center', width: 40 },
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  height: 32,
                  backgroundColor: theme.palette.background.default,
                },
                '& .MuiOutlinedInput-input': {
                  p: 0.5,
                  fontSize: '0.875rem',
                },
              }}
            />
            <IconButton
              size="small"
              onClick={() => handleCountChange(1)}
              disabled={placementSettings.count >= 20}
              sx={{
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 1,
                p: 0.5,
              }}
            >
              <AddIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        {/* Hidden (Invisible) */}
        <FormControlLabel
          control={
            <Checkbox
              checked={placementSettings.hidden}
              onChange={(e) => onSettingsChange({ hidden: e.target.checked })}
              size="small"
            />
          }
          label={
            <Typography sx={checkboxLabelSx}>Hidden (Invisible)</Typography>
          }
          sx={{ mb: 1, ml: 0 }}
        />

        {/* Roll HP (Random) */}
        <FormControlLabel
          control={
            <Checkbox
              checked={placementSettings.rollHp}
              onChange={(e) => {
                onSettingsChange({
                  rollHp: e.target.checked,
                  maxHp: e.target.checked ? false : placementSettings.maxHp,
                });
              }}
              size="small"
            />
          }
          label={
            <Typography sx={checkboxLabelSx}>Roll HP (Random)</Typography>
          }
          sx={{ mb: 1, ml: 0 }}
        />

        {/* Auto-Number */}
        <FormControlLabel
          control={
            <Checkbox
              checked={placementSettings.autoNumber}
              onChange={(e) => onSettingsChange({ autoNumber: e.target.checked })}
              size="small"
            />
          }
          label={
            <Typography sx={checkboxLabelSx}>Auto-Number</Typography>
          }
          sx={{ ml: 0 }}
        />
      </Box>
    </Box>
  );
};

export default QuickSummonStagingPanel;
