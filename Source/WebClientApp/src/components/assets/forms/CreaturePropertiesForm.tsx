// Phase 5 Step 6 - Shared Form Component
// Creature-specific properties (size, category) - Used in both Create and Edit dialogs

import { Box, Chip, Typography } from '@mui/material';
import type React from 'react';
import { CreatureCategory, type CreatureData } from '@/types/domain';

export interface CreaturePropertiesFormProps {
  creatureData: CreatureData;
  onChange: (value: CreatureData) => void;
  readOnly?: boolean;
}

export const CreaturePropertiesForm: React.FC<CreaturePropertiesFormProps> = ({
  creatureData,
  onChange,
  readOnly = false,
}) => {
  const { category } = creatureData;
  if (readOnly) {
    return (
      <Box>
        <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 1 }}>
          Creature Category
        </Typography>
        <Chip label={category} size='small' />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant='body2' sx={{ mb: 1 }}>
        Category
      </Typography>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Chip
          label='Character'
          onClick={() => onChange({ ...creatureData, category: CreatureCategory.Character })}
          color={category === CreatureCategory.Character ? 'primary' : 'default'}
          variant={category === CreatureCategory.Character ? 'filled' : 'outlined'}
        />
        <Chip
          label='Monster'
          onClick={() => onChange({ ...creatureData, category: CreatureCategory.Monster })}
          color={category === CreatureCategory.Monster ? 'primary' : 'default'}
          variant={category === CreatureCategory.Monster ? 'filled' : 'outlined'}
        />
      </Box>
    </Box>
  );
};
