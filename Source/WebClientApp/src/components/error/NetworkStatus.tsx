import {
  SignalWifiConnectedNoInternet4 as LimitedIcon,
  WifiOff as OfflineIcon,
  Wifi as OnlineIcon,
  Refresh as RetryIcon,
} from '@mui/icons-material';
import { Alert, AlertTitle, Box, Button, Chip, CircularProgress, Snackbar, Typography } from '@mui/material';
import type React from 'react';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { addError, clearErrorsByType } from '@/store/slices/errorSlice';
import { addNotification } from '@/store/slices/uiSlice';
import { createNetworkError, retryOperation } from '@/utils/errorHandling';

interface NetworkStatusState {
  isOnline: boolean;
  isConnected: boolean;
  latency: number | null;
  lastChecked: number;
  retryCount: number;
}

/**
 * UC032 - Network Connection Error Handling
 * Global network error detection with retry mechanisms and user feedback
 */
export const NetworkStatus: React.FC = () => {
  const searchParams = new URLSearchParams(window.location.search);
  const showNetworkStatus = searchParams.has('checkNetwork');

  if (!showNetworkStatus) {
    return null;
  }

  return <NetworkStatusComponent />;
};

const NetworkStatusComponent: React.FC = () => {
  const dispatch = useDispatch();
  const [networkStatus, setNetworkStatus] = useState<NetworkStatusState>({
    isOnline: navigator.onLine,
    isConnected: true,
    latency: null,
    lastChecked: Date.now(),
    retryCount: 0,
  });
  const [showAlert, setShowAlert] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  // Check network connectivity
  const checkConnectivity = async (): Promise<{
    connected: boolean;
    latency: number | null;
  }> => {
    try {
      const start = performance.now();
      const response = await fetch('/health', {
        method: 'HEAD',
        cache: 'no-cache',
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });
      const latency = performance.now() - start;

      return {
        connected: response.ok,
        latency: Math.round(latency),
      };
    } catch (_error) {
      return {
        connected: false,
        latency: null,
      };
    }
  };

  // Handle network status change
  const updateNetworkStatus = async (isOnline: boolean, forceCheck = false) => {
    if (!isOnline) {
      // Definitely offline
      setNetworkStatus((prev) => ({
        ...prev,
        isOnline: false,
        isConnected: false,
        lastChecked: Date.now(),
      }));

      if (!showAlert) {
        setShowAlert(true);
        dispatch(
          addError({
            type: 'network',
            message: 'Network connection lost',
            userFriendlyMessage: 'You appear to be offline. Please check your internet connection.',
            retryable: true,
          }),
        );
      }
      return;
    }

    // Online according to browser, but let's verify actual connectivity
    if (forceCheck || Math.abs(Date.now() - networkStatus.lastChecked) > 30000) {
      // Check every 30s max
      const { connected, latency } = await checkConnectivity();

      setNetworkStatus((prev) => ({
        ...prev,
        isOnline: true,
        isConnected: connected,
        latency,
        lastChecked: Date.now(),
      }));

      if (!connected && !showAlert) {
        setShowAlert(true);
        dispatch(
          addError({
            type: 'network',
            message: 'Server connectivity issues',
            userFriendlyMessage: 'Cannot connect to VTT Tools servers. Please check your connection.',
            retryable: true,
          }),
        );
      } else if (connected && showAlert) {
        // Connection restored
        setShowAlert(false);
        dispatch(clearErrorsByType('network'));
        dispatch(
          addNotification({
            type: 'success',
            message: 'Connection restored successfully!',
            duration: 4000,
          }),
        );
      }
    }
  };

  // Handle online/offline events
  useEffect(() => {
    const handleOnline = () => updateNetworkStatus(true, true);
    const handleOffline = () => updateNetworkStatus(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    updateNetworkStatus(navigator.onLine, true);

    // Periodic connectivity check
    const interval = setInterval(() => {
      if (navigator.onLine) {
        updateNetworkStatus(true);
      }
    }, 60000); // Check every minute when online

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
    // updateNetworkStatus recreated on each render but uses stable refs internally
    // This effect should only run once on mount to set up event listeners
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    // Initial check
    updateNetworkStatus,
  ]);

  // Retry connection with exponential backoff
  const handleRetry = async () => {
    if (isRetrying) return;

    setIsRetrying(true);
    setNetworkStatus((prev) => ({
      ...prev,
      retryCount: prev.retryCount + 1,
    }));

    try {
      await retryOperation(
        () =>
          checkConnectivity().then((result) => {
            if (!result.connected) {
              throw createNetworkError('Server still unreachable');
            }
            return result;
          }),
        {
          maxRetries: 3,
          delay: 1000,
          exponentialBackoff: true,
          onRetry: (attempt, _error) => {
            dispatch(
              addNotification({
                type: 'info',
                message: `Reconnection attempt ${attempt} of 3...`,
                duration: 2000,
              }),
            );
          },
        },
      );

      // Success
      await updateNetworkStatus(true, true);
      setNetworkStatus((prev) => ({ ...prev, retryCount: 0 }));
    } catch (_error) {
      dispatch(
        addNotification({
          type: 'error',
          message: 'Failed to reconnect. Please check your internet connection.',
          duration: 5000,
        }),
      );
    } finally {
      setIsRetrying(false);
    }
  };

  const getStatusColor = (): 'success' | 'warning' | 'error' => {
    if (!networkStatus.isOnline || !networkStatus.isConnected) return 'error';
    if (networkStatus.latency && networkStatus.latency > 1000) return 'warning';
    return 'success';
  };

  return (
    <>
      {/* Network Status Snackbar */}
      <Snackbar
        open={showAlert}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ mt: 8 }} // Account for app bar
      >
        <Alert
          severity={getStatusColor()}
          action={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button
                color='inherit'
                size='small'
                onClick={handleRetry}
                disabled={isRetrying}
                startIcon={isRetrying ? <CircularProgress size={16} /> : <RetryIcon />}
              >
                {isRetrying ? 'Retrying...' : 'Retry'}
              </Button>
            </Box>
          }
          onClose={() => setShowAlert(false)}
        >
          <AlertTitle>Connection Issue</AlertTitle>
          {!networkStatus.isOnline
            ? 'You appear to be offline. Some features may not work properly.'
            : 'Cannot connect to VTT Tools servers. Please check your connection.'}
          {networkStatus.retryCount > 0 && (
            <Typography variant='caption' display='block' sx={{ mt: 1 }}>
              Retry attempts: {networkStatus.retryCount}
            </Typography>
          )}
        </Alert>
      </Snackbar>

      {/* Network Status Indicator (can be used in status bars) */}
      <NetworkStatusIndicator status={networkStatus} onRetry={handleRetry} isRetrying={isRetrying} />
    </>
  );
};

/**
 * Compact network status indicator for status bars
 */
interface NetworkStatusIndicatorProps {
  status: NetworkStatusState;
  onRetry: () => void;
  isRetrying: boolean;
  variant?: 'chip' | 'icon';
}

export const NetworkStatusIndicator: React.FC<NetworkStatusIndicatorProps> = ({
  status,
  onRetry,
  isRetrying,
  variant = 'chip',
}) => {
  const getStatusColor = (): 'success' | 'warning' | 'error' | 'default' => {
    if (!status.isOnline || !status.isConnected) return 'error';
    if (status.latency && status.latency > 1000) return 'warning';
    return 'success';
  };

  const getStatusIcon = () => {
    if (!status.isOnline) return <OfflineIcon />;
    if (!status.isConnected) return <LimitedIcon />;
    return <OnlineIcon />;
  };

  const getStatusText = () => {
    if (!status.isOnline) return 'Offline';
    if (!status.isConnected) return 'Limited connectivity';
    if (status.latency) return `Online (${status.latency}ms)`;
    return 'Online';
  };

  if (variant === 'icon') {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        {getStatusIcon()}
        {status.latency && (
          <Typography variant='caption' color='text.secondary'>
            {status.latency}ms
          </Typography>
        )}
      </Box>
    );
  }

  return (
    <Chip
      icon={getStatusIcon()}
      label={getStatusText()}
      color={getStatusColor()}
      size='small'
      onClick={!status.isOnline || !status.isConnected ? onRetry : undefined}
      disabled={isRetrying}
      sx={{
        cursor: !status.isOnline || !status.isConnected ? 'pointer' : 'default',
        '& .MuiChip-icon': {
          color: 'inherit',
        },
      }}
    />
  );
};

export default NetworkStatus;
