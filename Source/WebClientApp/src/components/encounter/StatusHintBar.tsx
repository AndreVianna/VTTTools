import { Box, Typography, useTheme } from '@mui/material';
import type React from 'react';
import { Z_INDEX } from '@/theme/zIndex';

/**
 * StatusHintBar component
 *
 * Displays keyboard shortcuts and interaction hints for placement and edit modes.
 *
 * Theme Support: Verified in both light and dark modes
 * - Uses theme.palette.background.paper for background
 * - Uses theme.palette.text.secondary for text
 * - Border uses theme.palette.divider
 */

interface StatusHintBarProps {
  mode: 'placement' | 'edit';
  visible?: boolean;
}

export const StatusHintBar: React.FC<StatusHintBarProps> = ({ mode, visible = true }) => {
  const theme = useTheme();

  if (!visible) return null;

  const hints = {
    placement: (
      <>
        <strong>Click</strong> to place poles | <strong>Enter</strong> or <strong>double-click last pole</strong> to
        finish | <strong>Escape</strong> to cancel | <strong>Ctrl+Z</strong> to undo
      </>
    ),
    edit: (
      <>
        <strong>Click</strong> to select | <strong>Shift+Click line</strong> to insert pole | <strong>Delete</strong> to
        remove | <strong>Escape</strong> to deselect
      </>
    ),
  };

  return (
    <Box
      id='status-hint-bar'
      data-testid='status-hint-bar'
      role='complementary'
      aria-label='Keyboard shortcuts and interaction hints'
      sx={{
        position: 'fixed',
        bottom: theme.spacing(1),
        left: '50%',
        transform: 'translateX(-50%)',
        padding: theme.spacing(1, 2),
        backgroundColor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 1,
        fontSize: '0.875rem',
        color: theme.palette.text.secondary,
        pointerEvents: 'none',
        zIndex: Z_INDEX.STATUS_HINT,
        boxShadow: theme.shadows[2],
        maxWidth: '90vw',
        textAlign: 'center',
      }}
    >
      <Typography id='status-hint-text' data-testid='status-hint-text' variant='caption' component='div'>
        {hints[mode]}
      </Typography>
    </Box>
  );
};

StatusHintBar.displayName = 'StatusHintBar';
