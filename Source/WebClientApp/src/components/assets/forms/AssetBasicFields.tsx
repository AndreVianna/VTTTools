// Phase 5 Step 6 - Shared Form Component
// Basic asset fields (name, description) with inline visibility - Used in both Create and Edit dialogs

import { Box, TextField, Typography } from '@mui/material';
import type React from 'react';
import { AssetVisibilityFields } from './AssetVisibilityFields';

export interface AssetBasicFieldsProps {
  name: string;
  description: string;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  isPublic: boolean;
  isPublished: boolean;
  onIsPublicChange: (value: boolean) => void;
  onIsPublishedChange: (value: boolean) => void;
  readOnly?: boolean;
}

export const AssetBasicFields: React.FC<AssetBasicFieldsProps> = ({
  name,
  description,
  onNameChange,
  onDescriptionChange,
  isPublic,
  isPublished,
  onIsPublicChange,
  onIsPublishedChange,
  readOnly = false,
}) => {
  if (readOnly) {
    return (
      <>
        <Box>
          <Typography variant='caption' color='text.secondary'>
            Name
          </Typography>
          <Typography variant='h6'>{name}</Typography>
        </Box>
        <Box>
          <Typography variant='caption' color='text.secondary'>
            Description
          </Typography>
          <Typography>{description}</Typography>
        </Box>
        <AssetVisibilityFields
          isPublic={isPublic}
          isPublished={isPublished}
          onIsPublicChange={onIsPublicChange}
          onIsPublishedChange={onIsPublishedChange}
          readOnly
        />
      </>
    );
  }

  return (
    <>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
        <TextField
          label='Name'
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          required
          helperText='Required - minimum 3 characters'
          error={name.length > 0 && name.length < 3}
          sx={{ flexGrow: 1 }}
        />
        <AssetVisibilityFields
          isPublic={isPublic}
          isPublished={isPublished}
          onIsPublicChange={onIsPublicChange}
          onIsPublishedChange={onIsPublishedChange}
          inline
        />
      </Box>
      <TextField
        label='Description'
        value={description}
        onChange={(e) => onDescriptionChange(e.target.value)}
        multiline
        rows={3}
        fullWidth
        helperText='Brief description of this asset'
      />
    </>
  );
};
