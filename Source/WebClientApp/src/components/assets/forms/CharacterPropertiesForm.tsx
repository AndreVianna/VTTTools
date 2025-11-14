import { Box, Typography } from '@mui/material';
import type React from 'react';
import type { CharacterData } from '@/types/domain';

export interface CharacterPropertiesFormProps {
  characterData: CharacterData;
  onChange: (value: CharacterData) => void;
  readOnly?: boolean;
}

export const CharacterPropertiesForm: React.FC<CharacterPropertiesFormProps> = ({
  characterData: _characterData,
  onChange: _onChange,
  readOnly = false,
}) => {
  if (readOnly) {
    return (
      <Box>
        <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 1 }}>
          Character Properties
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          Player character with optional stat block and token style
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant='body2' color='text.secondary'>
        Characters are player-controlled assets. Configure stat block and token style in advanced settings.
      </Typography>
    </Box>
  );
};
