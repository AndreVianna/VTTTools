import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

export interface EditingBlockerProps {
    isBlocked: boolean;
}

export const EditingBlocker: React.FC<EditingBlockerProps> = ({ isBlocked }) => {
    const theme = useTheme();

    if (!isBlocked) return null;

    return (
        <Box
            id="editing-blocker"
            sx={{
                position: 'fixed',
                top: 64,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: theme.palette.mode === 'dark'
                    ? 'rgba(0, 0, 0, 0.5)'
                    : 'rgba(0, 0, 0, 0.3)',
                zIndex: theme.zIndex.modal - 1,
                pointerEvents: 'all',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
            onClick={(e) => e.stopPropagation()}
        >
            <Paper
                elevation={3}
                sx={{
                    p: 3,
                    backgroundColor: theme.palette.background.paper,
                    color: theme.palette.text.primary
                }}
            >
                <Typography variant="h6" color="text.secondary">
                    Editing disabled while offline
                </Typography>
            </Paper>
        </Box>
    );
};

EditingBlocker.displayName = 'EditingBlocker';
