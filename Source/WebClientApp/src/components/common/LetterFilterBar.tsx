import React from 'react';
import { Box, Chip, useTheme } from '@mui/material';
import { ALPHABET_LETTERS } from '@/hooks/useLetterFilter';

export interface LetterFilterBarProps {
  selectedLetter: string | null;
  onLetterChange: (letter: string | null) => void;
  availableLetters: Set<string>;
  compact?: boolean;
}

export const LetterFilterBar: React.FC<LetterFilterBarProps> = ({
  selectedLetter,
  onLetterChange,
  availableLetters,
  compact = false,
}) => {
  const theme = useTheme();

  const handleLetterClick = (letter: string) => {
    if (selectedLetter === letter) {
      onLetterChange(null);
    } else {
      onLetterChange(letter);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: compact ? 0.25 : 0.5,
        p: compact ? 0.5 : 1,
        borderBottom: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper,
      }}
    >
      {ALPHABET_LETTERS.map((letter) => {
        const isAvailable = availableLetters.has(letter);
        const isSelected = selectedLetter === letter;

        return (
          <Chip
            key={letter}
            label={letter}
            size="small"
            variant={isSelected ? 'filled' : 'outlined'}
            color={isSelected ? 'primary' : 'default'}
            onClick={() => isAvailable && handleLetterClick(letter)}
            disabled={!isAvailable}
            sx={{
              height: compact ? 24 : 28,
              minWidth: compact ? 28 : 32,
              fontSize: compact ? '0.7rem' : '0.75rem',
              fontWeight: isSelected ? 600 : 400,
              cursor: isAvailable ? 'pointer' : 'default',
              opacity: isAvailable ? 1 : 0.4,
              '& .MuiChip-label': {
                px: compact ? 0.5 : 1,
              },
            }}
          />
        );
      })}
    </Box>
  );
};

export default LetterFilterBar;
