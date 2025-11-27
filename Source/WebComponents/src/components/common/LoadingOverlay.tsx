import { Box, CircularProgress, Fade, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import type React from 'react';

interface LoadingOverlayProps {
  open: boolean;
  message?: string;
  backdropOpacity?: number;
  size?: number;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ open, message, backdropOpacity = 0.7, size = 40 }) => {
  const theme = useTheme();

  return (
    <Fade in={open} timeout={300}>
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: open ? 'flex' : 'none',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor:
            theme.palette.mode === 'dark'
              ? `rgba(0, 0, 0, ${backdropOpacity})`
              : `rgba(255, 255, 255, ${backdropOpacity})`,
          zIndex: 9999,
          pointerEvents: open ? 'auto' : 'none',
        }}
      >
        <CircularProgress
          size={size}
          sx={{
            color: theme.palette.primary.main,
          }}
        />

        {message && (
          <Typography
            variant='body1'
            sx={{
              mt: 2,
              color: theme.palette.text.primary,
              fontWeight: 500,
            }}
          >
            {message}
          </Typography>
        )}
      </Box>
    </Fade>
  );
};
