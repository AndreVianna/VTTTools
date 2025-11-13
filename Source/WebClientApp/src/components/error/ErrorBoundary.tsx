import { BugReport as BugReportIcon, Home as HomeIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { Alert, AlertTitle, Box, Button, Paper, Stack, Typography } from '@mui/material';
import type React from 'react';
import { Component, type ErrorInfo, type ReactNode } from 'react';
import { handleSystemError } from '@/utils/errorHandling';
import type { ErrorBoundaryFallbackProps } from './errorBoundaryUtils';

interface Props {
  children: ReactNode;
  fallback?: React.ComponentType<ErrorBoundaryFallbackProps>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
}

/**
 * UC036 - System Error Display
 * Global error boundary with user-friendly messaging and recovery options
 */
export class ErrorBoundary extends Component<Props, State> {
  private retryCount = 0;
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
      errorId: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Handle the error through our global error system
    const processedError = handleSystemError(error, {
      component: 'ErrorBoundary',
      operation: 'componentDidCatch',
      errorInfo,
      retryCount: this.retryCount,
    });

    this.setState({
      errorInfo,
      errorId: `${processedError.type}_${Date.now()}`,
    });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group('🔥 React Error Boundary');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.groupEnd();
    }
  }

  handleRetry = () => {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        errorId: null,
      });
    }
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleReportError = () => {
    if (this.state.error && this.state.errorId) {
      // In a real app, this would send the error to a reporting service
      const errorReport = {
        errorId: this.state.errorId,
        message: this.state.error.message,
        stack: this.state.error.stack,
        componentStack: this.state.errorInfo?.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        retryCount: this.retryCount,
      };

      console.error('Error Report:', errorReport);

      // Show success message
      alert('Error report sent successfully. Thank you for helping improve VTT Tools!');
    }
  };

  render() {
    if (this.state.hasError) {
      const { fallback: FallbackComponent } = this.props;

      if (FallbackComponent) {
        const { error } = this.state;
        if (!error) return null;

        return (
          <FallbackComponent
            error={error}
            retry={this.handleRetry}
            goHome={this.handleGoHome}
            reportError={this.handleReportError}
          />
        );
      }

      return (
        <DefaultErrorFallback
          error={this.state.error}
          errorId={this.state.errorId}
          retryCount={this.retryCount}
          maxRetries={this.maxRetries}
          handleRetry={this.handleRetry}
          handleGoHome={this.handleGoHome}
          handleReportError={this.handleReportError}
        />
      );
    }

    return this.props.children;
  }
}

/**
 * Default error fallback component with professional VTT Tools styling
 */
const DefaultErrorFallback: React.FC<{
  error: Error | null;
  errorId: string | null;
  retryCount: number;
  maxRetries: number;
  handleRetry: () => void;
  handleGoHome: () => void;
  handleReportError: () => void;
}> = ({ error, errorId, retryCount, maxRetries, handleRetry, handleGoHome, handleReportError }) => {
  const canRetry = retryCount < maxRetries;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'background.default',
        p: 2,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          maxWidth: 600,
          width: '100%',
          p: 4,
          textAlign: 'center',
        }}
      >
        <Alert severity='error' sx={{ mb: 3 }}>
          <AlertTitle>System Error Occurred</AlertTitle>
          Something unexpected happened in VTT Tools. Don&apos;t worry - your data is safe.
        </Alert>

        <Typography variant='h4' gutterBottom color='error' sx={{ mb: 2 }}>
          Oops! Something went wrong
        </Typography>

        <Typography variant='body1' color='text.secondary' sx={{ mb: 3 }}>
          We&apos;re sorry for the inconvenience. The VTT Tools application encountered an unexpected error. Our team
          has been notified and will investigate the issue.
        </Typography>

        {process.env.NODE_ENV === 'development' && error && (
          <Alert severity='warning' sx={{ mb: 3, textAlign: 'left' }}>
            <AlertTitle>Development Info</AlertTitle>
            <Typography variant='body2' component='pre' sx={{ fontSize: '0.75rem', mt: 1 }}>
              {error.message}
            </Typography>
          </Alert>
        )}

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent='center' sx={{ mb: 3 }}>
          {canRetry && (
            <Button variant='contained' color='primary' startIcon={<RefreshIcon />} onClick={handleRetry} size='large'>
              Try Again ({maxRetries - retryCount} attempts left)
            </Button>
          )}

          <Button variant='outlined' color='primary' startIcon={<HomeIcon />} onClick={handleGoHome} size='large'>
            Go to Home
          </Button>

          <Button
            variant='text'
            color='secondary'
            startIcon={<BugReportIcon />}
            onClick={handleReportError}
            size='large'
          >
            Report Issue
          </Button>
        </Stack>

        {errorId && (
          <Typography variant='caption' color='text.disabled'>
            Error ID: {errorId}
          </Typography>
        )}

        {!canRetry && (
          <Alert severity='warning' sx={{ mt: 2 }}>
            Multiple attempts failed. Please refresh the page or contact support if the problem persists.
          </Alert>
        )}
      </Paper>
    </Box>
  );
};

export default ErrorBoundary;
