// Phase 5 Step 6 - Shared Form Component
// Asset visibility and publishing status fields - Used in both Create and Edit dialogs

import { Alert, Box, Checkbox, Chip, FormControlLabel, Stack, Typography } from '@mui/material';
import type React from 'react';

export interface AssetVisibilityFieldsProps {
  isPublic: boolean;
  isPublished: boolean;
  onIsPublicChange: (value: boolean) => void;
  onIsPublishedChange: (value: boolean) => void;
  readOnly?: boolean;
  inline?: boolean; // Compact inline mode (for positioning next to Name field)
}

export const AssetVisibilityFields: React.FC<AssetVisibilityFieldsProps> = ({
  isPublic,
  isPublished,
  onIsPublicChange,
  onIsPublishedChange,
  readOnly = false,
  inline = false,
}) => {
  // Inline compact mode (for positioning next to Name field)
  if (inline && !readOnly) {
    return (
      <Box sx={{ display: 'flex', gap: 2 }}>
        <FormControlLabel
          control={<Checkbox checked={!isPublic} onChange={(e) => onIsPublicChange(!e.target.checked)} />}
          label='Private'
        />
        <FormControlLabel
          control={<Checkbox checked={!isPublished} onChange={(e) => onIsPublishedChange(!e.target.checked)} />}
          label='Draft'
        />
      </Box>
    );
  }

  if (readOnly) {
    return (
      <Box>
        <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 1 }}>
          Visibility
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Chip label={isPublic ? 'Public' : 'Private'} size='small' />
          <Chip label={isPublished ? 'Published' : 'Draft'} size='small' color={isPublished ? 'success' : 'default'} />
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 1 }}>
        Visibility
      </Typography>
      <Stack spacing={1}>
        <FormControlLabel
          control={<Checkbox checked={!isPublic} onChange={(e) => onIsPublicChange(!e.target.checked)} />}
          label='Private (only visible to you)'
        />
        <FormControlLabel
          control={<Checkbox checked={!isPublished} onChange={(e) => onIsPublishedChange(!e.target.checked)} />}
          label='Draft (not approved for use)'
        />
        {!isPublished && isPublic && (
          <Alert severity='info' sx={{ mt: 1 }}>
            Draft assets can still be shared publicly
          </Alert>
        )}
      </Stack>
    </Box>
  );
};
