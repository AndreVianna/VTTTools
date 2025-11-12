/// <reference types="node" />

import { Alert, AlertTitle, Slide, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import type React from 'react';
import { useEffect, useState } from 'react';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';

export const ConnectionStatusBanner: React.FC = () => {
  const { isOnline, lastSync } = useConnectionStatus();
  const [showBanner, setShowBanner] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    if (!isOnline) {
      timeout = setTimeout(() => setShowBanner(true), 2000);
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowBanner(false);
    }

    return () => clearTimeout(timeout);
  }, [isOnline]);

  if (!showBanner) return null;

  return (
    <Slide direction='down' in={showBanner} mountOnEnter unmountOnExit>
      <Alert
        id='connection-status-banner'
        severity='warning'
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: theme.zIndex.snackbar,
          borderRadius: 0,
        }}
      >
        <AlertTitle id='connection-status-title'>Connection Lost</AlertTitle>
        <Typography variant='body2' id='connection-status-message'>
          Changes are saved locally and will sync when restored.
          {lastSync && (
            <Typography component='span' variant='caption' display='block' sx={{ mt: 0.5 }}>
              Last synced: {lastSync.toLocaleTimeString()}
            </Typography>
          )}
        </Typography>
      </Alert>
    </Slide>
  );
};

ConnectionStatusBanner.displayName = 'ConnectionStatusBanner';
