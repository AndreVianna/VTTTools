/**
 * Enhanced base query for RTK Query that handles development mode gracefully
 * Provides fallback responses and proper error handling
 */

import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
// import { mockApi, shouldUseMockApi } from './mockApi'; // removed (unused)
import { devUtils, isDevelopment } from '@/config/development';

// Enhanced error type that includes network status
interface EnhancedError extends FetchBaseQueryError {
  isNetworkError?: boolean;
  isCorsError?: boolean;
}

// Create a base query with enhanced error handling
export const createEnhancedBaseQuery = (baseUrl: string): BaseQueryFn<
  string | FetchArgs,
  unknown,
  EnhancedError
> => {
  const baseQuery = fetchBaseQuery({
    baseUrl,
    credentials: 'include',
    prepareHeaders: (headers, { getState, endpoint }) => {
      // Don't set Content-Type - let fetchBaseQuery handle it automatically
      // fetchBaseQuery will set application/json for objects, multipart/form-data for FormData
      headers.set('X-Requested-With', 'XMLHttpRequest');

      // Add x-user header for microservice authentication
      const state = getState() as any;
      const user = state?.auth?.user;

      if (isDevelopment) {
        console.log('🔐 Auth Debug - User from state:', user?.id);
      }

      if (user?.id) {
        // Convert GUID string to bytes matching .NET Guid.ToByteArray() format
        // .NET uses mixed endianness: first 3 components little-endian, last 2 big-endian
        const parts = user.id.split('-');
        const bytes = new Uint8Array(16);

        // Data1 (4 bytes) - little endian
        const data1 = parseInt(parts[0], 16);
        bytes[0] = data1 & 0xFF;
        bytes[1] = (data1 >> 8) & 0xFF;
        bytes[2] = (data1 >> 16) & 0xFF;
        bytes[3] = (data1 >> 24) & 0xFF;

        // Data2 (2 bytes) - little endian
        const data2 = parseInt(parts[1], 16);
        bytes[4] = data2 & 0xFF;
        bytes[5] = (data2 >> 8) & 0xFF;

        // Data3 (2 bytes) - little endian
        const data3 = parseInt(parts[2], 16);
        bytes[6] = data3 & 0xFF;
        bytes[7] = (data3 >> 8) & 0xFF;

        // Data4 (8 bytes) - big endian
        const data4 = parts[3] + parts[4];
        for (let i = 0; i < 8; i++) {
          bytes[8 + i] = parseInt(data4.substr(i * 2, 2), 16);
        }

        // Convert to base64URL (base64 with URL-safe characters)
        const base64 = btoa(String.fromCharCode(...bytes));
        const base64Url = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

        headers.set('x-user', base64Url);

        if (isDevelopment) {
          console.log('🔐 Auth Debug - x-user header:', base64Url);
        }
      } else if (isDevelopment) {
        console.warn('⚠️ No user ID found in state for x-user header');
      }

      return headers;
    },
  });

  return async (args, api, extraOptions) => {
    try {
      const result = await baseQuery(args, api, extraOptions);

      // If request succeeded, return as normal
      if (!result.error) {
        return result;
      }

      // Handle error cases
      const error = result.error as EnhancedError;

      // Detect network errors
      if (error.status === 'FETCH_ERROR' || error.status === 'TIMEOUT_ERROR') {
        error.isNetworkError = true;
        devUtils.error('Network error detected', error);
      }

      // Detect CORS errors
      if (error.status === 'PARSING_ERROR' ||
          (typeof error.status === 'number' && error.status === 0)) {
        error.isCorsError = true;
        devUtils.error('CORS error detected', error);
      }

      // In development mode with network issues, don't fail completely
      if (isDevelopment && (error.isNetworkError || error.isCorsError)) {
        devUtils.warn(`API call failed, continuing in development mode: ${baseUrl}`);

        // Return a recoverable error that components can handle
        return {
          error: {
            ...error,
            data: {
              message: 'Service temporarily unavailable in development mode',
              isRecoverable: true
            }
          }
        };
      }

      return result;
    } catch (unexpectedError) {
      devUtils.error('Unexpected error in base query', unexpectedError);

      return {
        error: {
          status: 'CUSTOM_ERROR',
          data: {
            message: 'An unexpected error occurred',
            isRecoverable: isDevelopment
          },
          error: String(unexpectedError)
        }
      };
    }
  };
};

// Utility function to handle API responses with fallback to mock data
export const withMockFallback = <T>(
  operation: () => Promise<T>,
  mockOperation: () => Promise<T>,
  operationName: string
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
  operationName: string
) => {
  return (args: TArgs): Promise<TResult> => {
    return withMockFallback(
      () => queryFn(args),
      () => mockFn(args),
      operationName
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
    isRecoverable: error?.data?.isRecoverable || isDevelopment,
    originalError: isDevelopment ? error : undefined
  };
};