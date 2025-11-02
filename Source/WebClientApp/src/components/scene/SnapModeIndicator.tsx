import React from 'react';
import { Box, useTheme } from '@mui/material';
import { SnapMode } from '@/utils/structureSnapping';

interface SnapModeIndicatorProps {
    snapMode: SnapMode;
    visible: boolean;
}

export const SnapModeIndicator: React.FC<SnapModeIndicatorProps> = ({ snapMode, visible }) => {
    const theme = useTheme();

    if (!visible || snapMode === SnapMode.HalfSnap) {
        return null;
    }

    const config = snapMode === SnapMode.Free
        ? {
            label: 'FREE SNAP (Alt)',
            bgColor: theme.palette.error.main,
            textColor: theme.palette.error.contrastText
          }
        : {
            label: 'QUARTER SNAP (Ctrl+Alt)',
            bgColor: theme.palette.warning.main,
            textColor: theme.palette.warning.contrastText
          };

    return (
        <Box
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
                zIndex: 1000,
                boxShadow: theme.shadows[3]
            }}
        >
            {config.label}
        </Box>
    );
};

SnapModeIndicator.displayName = 'SnapModeIndicator';
