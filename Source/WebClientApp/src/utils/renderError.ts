/**
 * Utility to safely render error messages in React components
 * Ensures objects are not rendered as React children
 */

export const renderError = (error: unknown, fallbackMessage = 'An error occurred. Please try again.'): string => {
  if (!error) return '';

  if (typeof error === 'string') {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'object' && error !== null) {
    // Handle RTK Query errors
    if ('data' in error && typeof (error as any).data === 'object') {
      const errorData = (error as any).data;
      if (errorData?.message && typeof errorData.message === 'string') {
        return errorData.message;
      }
    }

    // Handle other error objects with message property
    if ('message' in error && typeof (error as any).message === 'string') {
      return (error as any).message;
    }
  }

  return fallbackMessage;
};

export const renderAuthError = (error: unknown): string => {
  return renderError(error, 'Authentication error. Please try again.');
};