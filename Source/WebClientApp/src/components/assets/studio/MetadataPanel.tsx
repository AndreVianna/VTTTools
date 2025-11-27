import React from 'react';
import {
  Box,
  Checkbox,
  Divider,
  FormControlLabel,
  Slider,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { BreadcrumbTaxonomyInput } from './BreadcrumbTaxonomyInput';
import type { AssetClassification, NamedSize } from '@/types/domain';

export interface MetadataPanelProps {
  name: string;
  description: string;
  classification: AssetClassification;
  tokenSize: NamedSize;
  isPublic: boolean;
  isPublished: boolean;
  onNameChange: (name: string) => void;
  onDescriptionChange: (description: string) => void;
  onClassificationChange: (classification: AssetClassification) => void;
  onTokenSizeChange: (size: NamedSize) => void;
  onIsPublicChange: (isPublic: boolean) => void;
}

const TOKEN_SIZES = [
  { value: 0.5, label: 'Tiny' },
  { value: 1, label: 'Small/Medium' },
  { value: 2, label: 'Large' },
  { value: 3, label: 'Huge' },
  { value: 4, label: 'Gargantuan' },
];

export const MetadataPanel: React.FC<MetadataPanelProps> = ({
  name,
  description,
  classification,
  tokenSize,
  isPublic,
  onNameChange,
  onDescriptionChange,
  onClassificationChange,
  onTokenSizeChange,
  onIsPublicChange,
}) => {
  const theme = useTheme();

  const handleTokenSizeChange = (_: Event, value: number | number[]) => {
    const size = value as number;
    onTokenSizeChange({ width: size, height: size });
  };

  return (
    <Box sx={{ p: 2 }}>
      {/* Name */}
      <TextField
        label="Name"
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
        fullWidth
        size="small"
        sx={{ mb: 2 }}
      />

      {/* Classification */}
      <Box sx={{ mb: 2 }}>
        <BreadcrumbTaxonomyInput
          classification={classification}
          onChange={onClassificationChange}
        />
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Token Size */}
      <Typography
        variant="subtitle2"
        sx={{
          fontWeight: 600,
          mb: 1,
          color: theme.palette.text.secondary,
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        }}
      >
        Token Size ({tokenSize.width}x{tokenSize.height})
      </Typography>

      <Box sx={{ px: 1, mb: 2 }}>
        <Slider
          value={tokenSize.width}
          onChange={handleTokenSizeChange}
          step={null}
          marks={TOKEN_SIZES.map((s) => ({ value: s.value, label: s.label }))}
          min={0.5}
          max={4}
          valueLabelDisplay="auto"
          valueLabelFormat={(v) => `${v}x${v}`}
          size="small"
        />
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Description */}
      <TextField
        label="Description"
        value={description}
        onChange={(e) => onDescriptionChange(e.target.value)}
        fullWidth
        multiline
        rows={4}
        size="small"
        sx={{ mb: 2 }}
      />

      <Divider sx={{ my: 2 }} />

      {/* Visibility */}
      <Typography
        variant="subtitle2"
        sx={{
          fontWeight: 600,
          mb: 1,
          color: theme.palette.text.secondary,
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        }}
      >
        Visibility
      </Typography>

      <FormControlLabel
        control={
          <Checkbox
            checked={isPublic}
            onChange={(e) => onIsPublicChange(e.target.checked)}
            size="small"
          />
        }
        label={
          <Box>
            <Typography variant="body2">Public</Typography>
            <Typography variant="caption" color="text.secondary">
              Allow other users to see this asset when published
            </Typography>
          </Box>
        }
      />
    </Box>
  );
};

export default MetadataPanel;
