import React, { useState, useEffect } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { CheckCircle as CheckCircleIcon, Error as ErrorIcon } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface SaveStatusIndicatorProps {
    status: SaveStatus;
    compact?: boolean;
}

export const SaveStatusIndicator: React.FC<SaveStatusIndicatorProps> = ({
    status,
    compact = false
}) => {
    const theme = useTheme();
    const [shouldHide, setShouldHide] = useState(false);

    useEffect(() => {
        if (status === 'saved') {
            const timer = setTimeout(() => {
                setShouldHide(true);
            }, 2000);
            return () => {
                clearTimeout(timer);
                setShouldHide(false);
            };
        }
        return undefined;
    }, [status]);

    if (status === 'idle' || (status === 'saved' && shouldHide)) {
        return null;
    }

    const getContent = () => {
        switch (status) {
            case 'saving':
                return (
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            color: theme.palette.text.secondary
                        }}
                    >
                        <CircularProgress size={16} sx={{ color: 'inherit' }} />
                        <Typography variant="caption">Saving...</Typography>
                    </Box>
                );

            case 'saved':
                return (
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            color: theme.palette.success.main
                        }}
                    >
                        <CheckCircleIcon fontSize="small" />
                        <Typography variant="caption">Saved</Typography>
                    </Box>
                );

            case 'error':
                return (
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            color: theme.palette.error.main
                        }}
                    >
                        <ErrorIcon fontSize="small" />
                        <Typography variant="caption">Save failed</Typography>
                    </Box>
                );

            default:
                return null;
        }
    };

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                padding: compact ? theme.spacing(0, 1) : theme.spacing(1)
            }}
        >
            {getContent()}
        </Box>
    );
};
