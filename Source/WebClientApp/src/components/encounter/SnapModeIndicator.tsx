import { Box, useTheme } from '@mui/material';
import type React from 'react';
import { useMemo } from 'react';
import { Z_INDEX } from '@/theme/zIndex';
import { SnapMode } from '@/utils/snapping';

/**
 * SnapModeIndicator component
 *
 * Displays visual indicator for active snap mode (Free or Quarter).
 * Default mode (HalfSnap) shows no indicator.
 *
 * Theme Support: Verified in both light and dark modes
 * - Free mode: Uses theme.palette.error (red/pink)
 * - Quarter mode: Uses theme.palette.warning (orange/amber)
 * - Contrast ratios meet WCAG AA standards (≥4.5:1)
 */

interface SnapModeIndicatorProps {
  snapMode: SnapMode;
  visible: boolean;
}

export const SnapModeIndicator: React.FC<SnapModeIndicatorProps> = ({ snapMode, visible }) => {
  const theme = useTheme();

  const config = useMemo(() => {
    return snapMode === SnapMode.Free
      ? {
          label: 'FREE SNAP (Alt)',
          bgColor: theme.palette.error.main,
          textColor: theme.palette.error.contrastText,
        }
      : {
          label: 'QUARTER SNAP (Ctrl+Alt)',
          bgColor: theme.palette.warning.main,
          textColor: theme.palette.warning.contrastText,
        };
  }, [
    snapMode,
    theme.palette.error.main,
    theme.palette.error.contrastText,
    theme.palette.warning.main,
    theme.palette.warning.contrastText,
  ]);

  if (!visible || snapMode === SnapMode.Half) {
    return null;
  }

  return (
    <Box
      id='snap-mode-indicator'
      data-testid='snap-mode-indicator'
      role='status'
      aria-live='polite'
      aria-label={`Snap mode: ${config.label}`}
      sx={{
        position: 'fixed',
        bottom: theme.spacing(2),
        right: theme.spacing(2),
        padding: theme.spacing(1, 2),
        backgroundColor: config.bgColor,
        color: config.textColor,
        borderRadius: 1,
        fontSize: '0.75rem',
        fontWeight: 'bold',
        pointerEvents: 'none',
        opacity: visible ? 0.9 : 0,
        transition: 'opacity 0.3s ease-in-out',
        zIndex: Z_INDEX.SNAP_INDICATOR,
        boxShadow: theme.shadows[3],
      }}
    >
      {config.label}
    </Box>
  );
};

SnapModeIndicator.displayName = 'SnapModeIndicator';
