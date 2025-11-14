/// <reference types="node" />

import { Alert, AlertTitle, Slide, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';

export const ConnectionStatusBanner: React.FC = () => {
  const { isOnline, lastSync } = useConnectionStatus();
  const [isOfflineDelayPassed, setIsOfflineDelayPassed] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const theme = useTheme();

  useEffect(() => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (!isOnline) {
      timeoutRef.current = setTimeout(() => {
        setIsOfflineDelayPassed(true);
      }, 2000);
    } else {
      timeoutRef.current = setTimeout(() => {
        setIsOfflineDelayPassed(false);
      }, 0);
    }

    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [isOnline]);

  const showBanner = !isOnline && isOfflineDelayPassed;

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
