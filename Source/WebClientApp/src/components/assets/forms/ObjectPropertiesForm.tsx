// Phase 5 Step 6 - Shared Form Component
// Object-specific properties (size, movable/opaque/visible) - Used in both Create and Edit dialogs

import { Box, Checkbox, FormControlLabel, Stack, Typography } from '@mui/material';
import type React from 'react';
import type { ObjectData } from '@/types/domain';

export interface ObjectPropertiesFormProps {
  objectData: ObjectData;
  onChange: (value: ObjectData) => void;
  readOnly?: boolean;
}

export const ObjectPropertiesForm: React.FC<ObjectPropertiesFormProps> = ({
  objectData,
  onChange,
  readOnly = false,
}) => {
  const { isMovable, isOpaque } = objectData;
  if (readOnly) {
    return (
      <Box>
        <Stack spacing={1}>
          <Typography variant='body2'>Movable: {isMovable ? 'Yes' : 'No'}</Typography>
          <Typography variant='body2'>Opaque: {isOpaque ? 'Yes' : 'No'}</Typography>
        </Stack>
      </Box>
    );
  }

  return (
    <Box>
      <Stack spacing={2}>
        <FormControlLabel
          control={
            <Checkbox checked={isMovable} onChange={(e) => onChange({ ...objectData, isMovable: e.target.checked })} />
          }
          label='Movable'
        />
        <FormControlLabel
          control={
            <Checkbox checked={isOpaque} onChange={(e) => onChange({ ...objectData, isOpaque: e.target.checked })} />
          }
          label='Opaque (blocks vision)'
        />
      </Stack>
    </Box>
  );
};
