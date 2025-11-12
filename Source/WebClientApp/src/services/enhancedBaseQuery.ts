/**
 * Enhanced base query for RTK Query that handles development mode gracefully
 * Provides fallback responses and proper error handling
 */

import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { devUtils, isDevelopment } from '@/config/development';
import type { RootState } from '@/store';

// Enhanced error type that includes network status
interface EnhancedError {
  status: FetchBaseQueryError['status'];
  data?: unknown;
  error?: string;
  isNetworkError?: boolean;
  isCorsError?: boolean;
}

/**
 * Convert GUID string to byte array matching .NET Guid.ToByteArray() format
 * .NET uses mixed endianness:
 * - Data1 (4 bytes): little-endian
 * - Data2 (2 bytes): little-endian
 * - Data3 (2 bytes): little-endian
 * - Data4 (8 bytes): big-endian
 *
 * Exported for unit testing
 */
export function guidToByteArray(guidString: string): Uint8Array {
  const parts = guidString.split('-');

  if (parts.length !== 5) {
    throw new Error(`Invalid GUID format: ${guidString}`);
  }

  const bytes = new Uint8Array(16);

  // Data1 (4 bytes) - little endian
  const data1 = parseInt(parts[0] || '0', 16);
  bytes[0] = data1 & 0xff;
  bytes[1] = (data1 >> 8) & 0xff;
  bytes[2] = (data1 >> 16) & 0xff;
  bytes[3] = (data1 >> 24) & 0xff;

  // Data2 (2 bytes) - little endian
  const data2 = parseInt(parts[1] || '0', 16);
  bytes[4] = data2 & 0xff;
  bytes[5] = (data2 >> 8) & 0xff;

  // Data3 (2 bytes) - little endian
  const data3 = parseInt(parts[2] || '0', 16);
  bytes[6] = data3 & 0xff;
  bytes[7] = (data3 >> 8) & 0xff;

  // Data4 (8 bytes) - big endian
  const data4 = (parts[3] || '') + (parts[4] || '');
  for (let i = 0; i < 8; i++) {
    bytes[8 + i] = parseInt(data4.substring(i * 2, i * 2 + 2), 16);
  }

  return bytes;
}

/**
 * Encode GUID to base64url for x-user header
 * Base64url: base64 encoding with URL-safe characters (no padding)
 *
 * Exported for unit testing
 */
export function encodeGuidToBase64Url(guidString: string): string {
  const bytes = guidToByteArray(guidString);
  const base64 = btoa(String.fromCharCode(...bytes));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

// Create a base query with enhanced error handling
export const createEnhancedBaseQuery = (baseUrl: string): BaseQueryFn<string | FetchArgs, unknown, EnhancedError> => {
  const baseQuery = fetchBaseQuery({
    baseUrl,
    credentials: 'include',
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as RootState;

      headers.set('X-Requested-With', 'XMLHttpRequest');

      const token = state?.auth?.token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }

      const user = state?.auth?.user;
      if (user?.id) {
        const base64Url = encodeGuidToBase64Url(user.id);
        headers.set('x-user', base64Url);
      }

      return headers;
    },
  });

  return async (args, api, extraOptions) => {
    try {
      const result = await baseQuery(args, api, extraOptions);

      if (!result.error) {
        return result;
      }

      const fetchError = result.error as FetchBaseQueryError;
      const enhancedError: EnhancedError = {
        status: fetchError.status,
        data: fetchError.data,
      };

      if ('error' in fetchError) {
        enhancedError.error = String(fetchError.error);
      }

      const error = enhancedError;

      if (error.status === 401) {
        const state = api.getState() as RootState;
        if (state.auth.isAuthenticated) {
          devUtils.warn('401 Unauthorized - JWT token expired or invalid. User will be logged out.');
          api.dispatch({ type: 'auth/logout' });
        }
      }

      // Detect network errors
      if (error.status === 'FETCH_ERROR' || error.status === 'TIMEOUT_ERROR') {
        error.isNetworkError = true;
        devUtils.error('Network error detected', error);
      }

      // Detect CORS errors
      if (error.status === 'PARSING_ERROR' || (typeof error.status === 'number' && error.status === 0)) {
        error.isCorsError = true;
        devUtils.error('CORS error detected', error);
      }

      // Network/CORS errors are never recoverable for authentication
      if (error.isNetworkError || error.isCorsError) {
        devUtils.error(`API call failed: ${baseUrl}`, error);
      }

      return { error };
    } catch (unexpectedError) {
      devUtils.error('Unexpected error in base query', unexpectedError);

      return {
        error: {
          status: 'CUSTOM_ERROR',
          data: {
            message: 'An unexpected error occurred',
            isRecoverable: false,
          },
          error: String(unexpectedError),
        } as EnhancedError,
      };
    }
  };
};

// Utility function to handle API responses with fallback to mock data
export const withMockFallback = <T>(
  operation: () => Promise<T>,
  mockOperation: () => Promise<T>,
  operationName: string,
): Promise<T> => {
  return operation().catch(async (error) => {
    // TODO: Re-enable mock API fallback when mockApi is needed
    devUtils.warn(`Falling back to mock data for: ${operationName}`, error);
    return mockOperation();
  });
};

// Create query wrapper that provides better error handling
export const createSafeQuery = <TArgs, TResult>(
  queryFn: (args: TArgs) => Promise<TResult>,
  mockFn: (args: TArgs) => Promise<TResult>,
  operationName: string,
) => {
  return (args: TArgs): Promise<TResult> => {
    return withMockFallback(
      () => queryFn(args),
      () => mockFn(args),
      operationName,
    );
  };
};

// Handle RTK Query mutation errors gracefully
export const handleMutationError = (error: any, operationName: string) => {
  devUtils.error(`Mutation failed: ${operationName}`, error);

  // Extract user-friendly error message
  let message = 'An error occurred. Please try again.';

  if (error?.data?.message) {
    message = error.data.message;
  } else if (error?.error) {
    message = error.error;
  } else if (error?.message) {
    message = error.message;
  }

  // In development, show more details
  if (isDevelopment) {
    message += ` (${operationName})`;
  }

  return {
    message,
    isRecoverable: !!error?.data?.isRecoverable,
    originalError: isDevelopment ? error : undefined,
  };
};
