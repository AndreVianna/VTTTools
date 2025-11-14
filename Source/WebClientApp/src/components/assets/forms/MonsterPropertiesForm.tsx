import { Box, Typography } from '@mui/material';
import type React from 'react';
import type { MonsterData } from '@/types/domain';

export interface MonsterPropertiesFormProps {
  monsterData: MonsterData;
  onChange: (value: MonsterData) => void;
  readOnly?: boolean;
}

export const MonsterPropertiesForm: React.FC<MonsterPropertiesFormProps> = ({
  monsterData: _monsterData,
  onChange: _onChange,
  readOnly = false,
}) => {
  if (readOnly) {
    return (
      <Box>
        <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 1 }}>
          Monster Properties
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          Monster or NPC with optional stat block and token style
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant='body2' color='text.secondary'>
        Monsters are monsters and NPCs. Configure stat block and token style in advanced settings.
      </Typography>
    </Box>
  );
};
