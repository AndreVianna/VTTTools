import type React from 'react';
import type { ErrorInfo } from 'react';
import { ErrorBoundary } from './ErrorBoundary';

export interface ErrorBoundaryFallbackProps {
  error: Error;
  retry: () => void;
  goHome: () => void;
  reportError: () => void;
}

export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ComponentType<ErrorBoundaryFallbackProps> | undefined,
  onError?: ((error: Error, errorInfo: ErrorInfo) => void) | undefined,
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...(fallback ? { fallback } : {})} {...(onError ? { onError } : {})}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}
