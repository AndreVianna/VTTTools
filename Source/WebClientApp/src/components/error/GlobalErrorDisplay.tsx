import React, { useCallback, useEffect } from 'react';
import {
  Alert,
  Button,
  Box,
  Typography,
  IconButton,
  Collapse,
  Stack,
  Chip,
} from '@mui/material';
import {
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Refresh as RetryIcon,
  BugReport as ReportIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectErrors,
  selectGlobalError,
  removeError,
  markErrorRecovered,
  clearAllErrors,
  incrementRetryAttempt,
  selectCanRetry,
  VTTError,
} from '@/store/slices/errorSlice';

/**
 * Global error display system for all error types with user-friendly messaging
 * Integrates with the error handling framework for UC032-UC036
 */
export const GlobalErrorDisplay: React.FC = () => {
  const dispatch = useDispatch();
  const errors = useSelector(selectErrors);
  const globalError = useSelector(selectGlobalError);

  // Auto-dismiss non-critical errors after a delay
  useEffect(() => {
    const dismissibleErrors = errors.filter(
      error => !['system', 'authentication'].includes(error.type) &&
      Date.now() - error.timestamp > 10000 // 10 seconds
    );

    if (dismissibleErrors.length > 0) {
      const timer = setTimeout(() => {
        dismissibleErrors.forEach(error => {
          dispatch(removeError(error.id));
        });
      }, 5000); // Additional 5 seconds grace period

      return () => clearTimeout(timer);
    }

    return undefined;
  }, [errors, dispatch]);

  return (
    <>
      {/* Global Critical Error - Always visible */}
      {globalError && (
        <GlobalCriticalError
          error={globalError}
          onDismiss={() => dispatch(removeError(globalError.id))}
          onRetry={() => handleErrorRetry(globalError)}
        />
      )}

      {/* Non-critical errors stack */}
      <ErrorNotificationStack
        errors={errors.filter(e => e.id !== globalError?.id)}
        onDismiss={(errorId) => dispatch(removeError(errorId))}
        onRetry={handleErrorRetry}
        onClearAll={() => dispatch(clearAllErrors())}
      />
    </>
  );

  function handleErrorRetry(error: VTTError) {
    // Implementation would depend on error context
    console.error('Retrying error:', error);
    dispatch(incrementRetryAttempt(error.id));
    // For now, just mark as recovered after delay
    setTimeout(() => {
      dispatch(markErrorRecovered(error.id));
    }, 2000);
  }
};

/**
 * Critical error display for system-level errors
 */
interface GlobalCriticalErrorProps {
  error: VTTError;
  onDismiss: () => void;
  onRetry: () => void;
}

const GlobalCriticalError: React.FC<GlobalCriticalErrorProps> = ({
  error,
  onDismiss,
  onRetry,
}) => {
  const dispatch = useDispatch();
  const canRetry = useSelector(selectCanRetry(error.id));
  const [expanded, setExpanded] = React.useState(false);

  const handleReport = useCallback(() => {
    // In a real app, this would send error to reporting service
    const errorReport = {
      errorId: error.id,
      type: error.type,
      message: error.message,
      details: error.details,
      context: error.context,
      timestamp: error.timestamp,
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    console.error('Error Report:', errorReport);

    dispatch(addNotification({
      type: 'info',
      message: 'Error report sent. Thank you for helping improve VTT Tools!',
      duration: 4000,
    }));
  }, [error, dispatch]);

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        backgroundColor: 'error.main',
        color: 'error.contrastText',
        p: 2,
      }}
    >
      <Stack spacing={2}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" component="div">
            🚨 Critical System Error
          </Typography>

          <IconButton
            size="small"
            onClick={onDismiss}
            sx={{ color: 'inherit' }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        <Typography variant="body2">
          {error.userFriendlyMessage || error.message}
        </Typography>

        <Stack direction="row" spacing={1} alignItems="center">
          {canRetry && (
            <Button
              size="small"
              variant="contained"
              color="inherit"
              startIcon={<RetryIcon />}
              onClick={onRetry}
              sx={{ color: 'error.main' }}
            >
              Retry
            </Button>
          )}

          <Button
            size="small"
            variant="outlined"
            color="inherit"
            startIcon={<ReportIcon />}
            onClick={handleReport}
          >
            Report Issue
          </Button>

          <Button
            size="small"
            variant="text"
            color="inherit"
            endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            onClick={() => setExpanded(!expanded)}
          >
            Details
          </Button>
        </Stack>

        <Collapse in={expanded}>
          <Box
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              p: 2,
              borderRadius: 1,
              fontFamily: 'monospace',
              fontSize: '0.75rem',
            }}
          >
            <Typography variant="caption" component="pre">
              Error ID: {error.id}
              {'\n'}Type: {error.type}
              {'\n'}Timestamp: {new Date(error.timestamp).toISOString()}
              {error.context && '\n'}Context: {JSON.stringify(error.context, null, 2)}
            </Typography>
          </Box>
        </Collapse>
      </Stack>
    </Box>
  );
};

/**
 * Stack of error notifications for non-critical errors
 */
interface ErrorNotificationStackProps {
  errors: VTTError[];
  onDismiss: (errorId: string) => void;
  onRetry: (error: VTTError) => void;
  onClearAll: () => void;
}

const ErrorNotificationStack: React.FC<ErrorNotificationStackProps> = ({
  errors,
  onDismiss,
  onRetry,
  onClearAll,
}) => {
  if (errors.length === 0) {
    return null;
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 80, // Below critical error bar
        right: 16,
        zIndex: 1400,
        minWidth: 400,
        maxWidth: 500,
      }}
    >
      {errors.length > 3 && (
        <Alert
          severity="info"
          action={
            <Button color="inherit" size="small" onClick={onClearAll}>
              Clear All ({errors.length})
            </Button>
          }
          sx={{ mb: 1 }}
        >
          Multiple errors detected
        </Alert>
      )}

      <Stack spacing={1}>
        {errors.slice(0, 5).map((error) => (
          <ErrorNotificationItem
            key={error.id}
            error={error}
            onDismiss={() => onDismiss(error.id)}
            onRetry={() => onRetry(error)}
          />
        ))}

        {errors.length > 5 && (
          <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', p: 1 }}>
            ...and {errors.length - 5} more errors
          </Typography>
        )}
      </Stack>
    </Box>
  );
};

/**
 * Individual error notification item
 */
interface ErrorNotificationItemProps {
  error: VTTError;
  onDismiss: () => void;
  onRetry: () => void;
}

const ErrorNotificationItem: React.FC<ErrorNotificationItemProps> = ({
  error,
  onDismiss,
  onRetry,
}) => {
  const canRetry = useSelector(selectCanRetry(error.id));
  const [expanded, setExpanded] = React.useState(false);

  const getSeverity = (): 'error' | 'warning' | 'info' => {
    switch (error.type) {
      case 'system':
      case 'authentication':
      case 'authorization':
        return 'error';
      case 'network':
      case 'asset_loading':
      case 'encounter_save':
      case 'encounter_load':
        return 'warning';
      case 'validation':
        return 'info';
      default:
        return 'error';
    }
  };

  const getErrorTypeLabel = (): string => {
    switch (error.type) {
      case 'network': return 'Network';
      case 'validation': return 'Validation';
      case 'authentication': return 'Authentication';
      case 'authorization': return 'Authorization';
      case 'asset_loading': return 'Asset Loading';
      case 'encounter_save': return 'Encounter Save';
      case 'encounter_load': return 'Encounter Load';
      case 'system': return 'System';
      default: return 'Error';
    }
  };

  return (
    <Alert
      severity={getSeverity()}
      onClose={onDismiss}
      action={
        <Stack direction="row" spacing={1}>
          {canRetry && error.retryable && (
            <IconButton
              size="small"
              onClick={onRetry}
              sx={{ color: 'inherit' }}
            >
              <RetryIcon fontSize="small" />
            </IconButton>
          )}

          <IconButton
            size="small"
            onClick={() => setExpanded(!expanded)}
            sx={{ color: 'inherit' }}
          >
            {expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
          </IconButton>
        </Stack>
      }
      sx={{
        '& .MuiAlert-message': {
          width: '100%',
        },
      }}
    >
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <Chip
            label={getErrorTypeLabel()}
            size="small"
            color={getSeverity()}
            variant="outlined"
          />

          <Typography variant="caption" color="text.secondary">
            {new Date(error.timestamp).toLocaleTimeString()}
          </Typography>
        </Box>

        <Typography variant="body2">
          {error.userFriendlyMessage || error.message}
        </Typography>

        <Collapse in={expanded}>
          <Box sx={{ mt: 1, p: 1, backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 1 }}>
            <Typography variant="caption" component="pre" sx={{ fontSize: '0.7rem' }}>
              ID: {error.id}
              {'\n'}Message: {error.message}
              {error.context && '\n'}Context: {JSON.stringify(error.context, null, 2)}
            </Typography>
          </Box>
        </Collapse>
      </Box>
    </Alert>
  );
};

// Fix missing import
import { addNotification } from '@/store/slices/uiSlice';

export default GlobalErrorDisplay;