import { store } from '@/store';
import { addError, VTTError } from '@/store/slices/errorSlice';
import { addNotification } from '@/store/slices/uiSlice';
import React from 'react';

// Error types for better categorization
export type ErrorType = VTTError['type'];

// Enhanced error interface with retry capabilities
export interface EnhancedError extends Error {
  type?: ErrorType;
  code?: string;
  context?: any;
  retryable?: boolean;
  userFriendlyMessage?: string;
}

// API Error response structure
export interface ApiErrorResponse {
  message: string;
  code?: string;
  errors?: string[];
  details?: any;
}

// Global error handler for unhandled errors
export const setupGlobalErrorHandling = () => {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);

    handleError(new Error('An unexpected error occurred'), {
      type: 'system',
      context: {
        component: 'global',
        operation: 'unhandledRejection',
        reason: event.reason
      },
      userFriendlyMessage: 'An unexpected error occurred. Please try refreshing the page.',
    });

    // Prevent default browser error reporting
    event.preventDefault();
  });

  // Handle unhandled errors
  window.addEventListener('error', (event) => {
    // Ignore errors from browser extensions (React DevTools, etc.)
    if (event.filename && (
      event.filename.includes('chrome-extension://') ||
      event.filename.includes('moz-extension://') ||
      event.filename.includes('safari-extension://')
    )) {
      return;
    }

    // Ignore React DevTools semver errors
    if (event.error?.message?.includes('not valid semver')) {
      return;
    }

    console.error('Unhandled error:', event.error);

    handleError(event.error || new Error('An unexpected error occurred'), {
      type: 'system',
      context: {
        component: 'global',
        operation: 'unhandledError',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      },
      userFriendlyMessage: 'An unexpected error occurred. Please try refreshing the page.',
    });
  });
};

// Main error handler function
export const handleError = (error: unknown, options: {
  type?: ErrorType;
  context?: any;
  showNotification?: boolean;
  userFriendlyMessage?: string;
  retryable?: boolean;
  component?: string;
  operation?: string;
} = {}) => {
  const processedError = processError(error, options);

  // Add to error store
  const errorPayload: any = {
    type: processedError.type,
    message: processedError.message,
    retryable: processedError.retryable,
    userFriendlyMessage: processedError.userFriendlyMessage,
  };

  // Only add optional fields if they have values
  if (processedError.details !== undefined) {
    errorPayload.details = processedError.details;
  }
  if (processedError.context !== undefined) {
    errorPayload.context = processedError.context;
  }

  store.dispatch(addError(errorPayload));

  // Show user notification if requested
  if (options.showNotification !== false) {
    store.dispatch(addNotification({
      type: 'error',
      message: processedError.userFriendlyMessage || processedError.message,
      duration: 8000, // Longer duration for errors
    }));
  }

  // Log to console for development
  if (process.env.NODE_ENV === 'development') {
    console.group('🚨 VTT Tools Error');
    console.error('Original error:', error);
    console.info('Processed error:', processedError);
    console.info('Context:', options.context);
    console.groupEnd();
  }

  return processedError;
};

// Process different types of errors into a consistent format
const processError = (error: unknown, options: {
  type?: ErrorType;
  context?: any;
  userFriendlyMessage?: string;
  retryable?: boolean;
  component?: string;
  operation?: string;
}): {
  type: ErrorType;
  message: string;
  details?: string;
  context?: any;
  retryable: boolean;
  userFriendlyMessage: string;
} => {
  // Handle API/fetch errors
  if (error && typeof error === 'object' && 'status' in error) {
    return processApiError(error as any, options);
  }

  // Handle Error objects
  if (error instanceof Error) {
    const result: any = {
      type: options.type || 'system',
      message: error.message,
      retryable: options.retryable ?? false,
      userFriendlyMessage: options.userFriendlyMessage || getDefaultUserMessage(options.type || 'system'),
    };

    if (error.stack) {
      result.details = error.stack;
    }

    const context = {
      ...options.context,
      component: options.component,
      operation: options.operation,
    };
    if (Object.keys(context).length > 0 && Object.values(context).some(v => v !== undefined)) {
      result.context = context;
    }

    return result;
  }

  // Handle string errors
  if (typeof error === 'string') {
    const result: any = {
      type: options.type || 'system',
      message: error,
      retryable: options.retryable ?? false,
      userFriendlyMessage: options.userFriendlyMessage || getDefaultUserMessage(options.type || 'system'),
    };

    if (options.context !== undefined && Object.keys(options.context).length > 0) {
      result.context = options.context;
    }

    return result;
  }

  // Handle unknown errors
  const result: any = {
    type: options.type || 'system',
    message: 'An unknown error occurred',
    retryable: options.retryable ?? false,
    userFriendlyMessage: options.userFriendlyMessage || 'An unexpected error occurred. Please try again.',
  };

  if (error !== null && error !== undefined) {
    result.details = JSON.stringify(error);
  }

  if (options.context !== undefined && Object.keys(options.context).length > 0) {
    result.context = options.context;
  }

  return result;
};

// Process API errors with proper typing and error mapping
const processApiError = (error: {
  status?: number;
  data?: ApiErrorResponse;
  message?: string;
}, options: {
  type?: ErrorType;
  context?: any;
  userFriendlyMessage?: string;
  retryable?: boolean;
}): {
  type: ErrorType;
  message: string;
  details?: string;
  context?: any;
  retryable: boolean;
  userFriendlyMessage: string;
} => {
  const status = error.status;
  const data = error.data;

  // Determine error type based on HTTP status
  let type: ErrorType = options.type || 'network';
  let retryable = options.retryable ?? true;
  let userFriendlyMessage = options.userFriendlyMessage;

  if (status) {
    switch (status) {
      case 400:
        type = 'validation';
        retryable = false;
        userFriendlyMessage = userFriendlyMessage || 'Invalid request. Please check your input and try again.';
        break;
      case 401:
        type = 'authentication';
        retryable = false;
        userFriendlyMessage = userFriendlyMessage || 'Authentication required. Please log in and try again.';
        break;
      case 403:
        type = 'authorization';
        retryable = false;
        userFriendlyMessage = userFriendlyMessage || 'You don\'t have permission to perform this action.';
        break;
      case 404:
        type = 'network';
        retryable = false;
        userFriendlyMessage = userFriendlyMessage || 'The requested resource was not found.';
        break;
      case 429:
        type = 'network';
        retryable = true;
        userFriendlyMessage = userFriendlyMessage || 'Too many requests. Please wait a moment and try again.';
        break;
      case 500:
      case 502:
      case 503:
      case 504:
        type = 'system';
        retryable = true;
        userFriendlyMessage = userFriendlyMessage || 'Server error. Please try again in a few moments.';
        break;
      default:
        type = 'network';
        break;
    }
  }

  const result: any = {
    type,
    message: data?.message || error.message || `HTTP ${status} Error`,
    retryable,
    userFriendlyMessage: userFriendlyMessage || getDefaultUserMessage(type),
  };

  if (data?.details) {
    result.details = JSON.stringify(data.details);
  }

  const context: any = {
    ...options.context,
  };
  if (status !== undefined) {
    context.httpStatus = status;
  }
  if (data?.errors) {
    context.apiErrors = data.errors;
  }

  if (Object.keys(context).length > 0 && Object.values(context).some(v => v !== undefined)) {
    result.context = context;
  }

  return result;
};

// Get default user-friendly messages for error types
const getDefaultUserMessage = (type: ErrorType): string => {
  switch (type) {
    case 'network':
      return 'Network connection error. Please check your internet connection and try again.';
    case 'validation':
      return 'Invalid input. Please check your information and try again.';
    case 'authentication':
      return 'Authentication required. Please log in and try again.';
    case 'authorization':
      return 'You don\'t have permission to perform this action.';
    case 'asset_loading':
      return 'Failed to load asset. Please try again.';
    case 'encounter_save':
      return 'Failed to save encounter. Please try again.';
    case 'encounter_load':
      return 'Failed to load encounter. Please try again.';
    case 'system':
      return 'A system error occurred. Please try again or contact support if the problem persists.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
};

// Retry mechanism for retryable errors
export const retryOperation = async <T>(
  operation: () => Promise<T>,
  options: {
    maxRetries?: number;
    delay?: number;
    exponentialBackoff?: boolean;
    onRetry?: (attempt: number, error: unknown) => void;
  } = {}
): Promise<T> => {
  const {
    maxRetries = 3,
    delay = 1000,
    exponentialBackoff = true,
    onRetry
  } = options;

  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (attempt === maxRetries) {
        break; // Don't retry on last attempt
      }

      // Check if error is retryable
      const processedError = processError(error, {});
      if (!processedError.retryable) {
        break; // Don't retry non-retryable errors
      }

      onRetry?.(attempt + 1, error);

      // Calculate delay with optional exponential backoff
      const currentDelay = exponentialBackoff
        ? delay * Math.pow(2, attempt)
        : delay;

      await new Promise(resolve => setTimeout(resolve, currentDelay));
    }
  }

  throw lastError;
};

// Error boundary helper for React components
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>
) => {
  const WrappedComponent = (props: P) => {
    // This would typically use React Error Boundary
    // For now, just return the component
    return React.createElement(Component, props);
  };

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name || 'Component'})`;

  return WrappedComponent;
};

// Validation error helper
export const createValidationError = (
  field: string,
  message: string,
  context?: any
): EnhancedError => {
  const error = new Error(`Validation error: ${field} - ${message}`) as EnhancedError;
  error.type = 'validation';
  error.code = 'VALIDATION_ERROR';
  error.context = { field, ...context };
  error.retryable = false;
  error.userFriendlyMessage = message;
  return error;
};

// Network error helper
export const createNetworkError = (
  message: string,
  context?: any
): EnhancedError => {
  const error = new Error(message) as EnhancedError;
  error.type = 'network';
  error.code = 'NETWORK_ERROR';
  error.context = context;
  error.retryable = true;
  error.userFriendlyMessage = 'Network connection error. Please check your internet connection and try again.';
  return error;
};

// Export commonly used error handlers
export const handleApiError = (error: unknown, context?: any) =>
  handleError(error, { type: 'network', context, showNotification: true });

export const handleValidationError = (error: unknown, context?: any) =>
  handleError(error, { type: 'validation', context, showNotification: true, retryable: false });

export const handleSystemError = (error: unknown, context?: any) =>
  handleError(error, { type: 'system', context, showNotification: true });

export const handleAssetLoadingError = (error: unknown, context?: any) =>
  handleError(error, {
    type: 'asset_loading',
    context,
    showNotification: true,
    userFriendlyMessage: 'Failed to load asset. Please try again.'
  });

export const handleEncounterError = (error: unknown, operation: 'save' | 'load', context?: any) =>
  handleError(error, {
    type: operation === 'save' ? 'encounter_save' : 'encounter_load',
    context: { ...context, operation },
    showNotification: true,
    userFriendlyMessage: `Failed to ${operation} encounter. Please try again.`
  });