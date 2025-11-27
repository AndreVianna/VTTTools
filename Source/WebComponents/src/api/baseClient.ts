import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface ApiClientConfig {
    baseUrl: string;
    getAuthToken?: () => string | null;
    getUserId?: () => string | null;
    onUnauthorized?: () => void;
}

interface EnhancedError {
    status: FetchBaseQueryError['status'];
    data?: unknown;
    error?: string;
    isNetworkError?: boolean;
}

function guidToByteArray(guidString: string): Uint8Array {
    const parts = guidString.split('-');
    if (parts.length !== 5) {
        throw new Error(`Invalid GUID format: ${guidString}`);
    }

    const bytes = new Uint8Array(16);
    const data1 = parseInt(parts[0] || '0', 16);
    bytes[0] = data1 & 0xff;
    bytes[1] = (data1 >> 8) & 0xff;
    bytes[2] = (data1 >> 16) & 0xff;
    bytes[3] = (data1 >> 24) & 0xff;

    const data2 = parseInt(parts[1] || '0', 16);
    bytes[4] = data2 & 0xff;
    bytes[5] = (data2 >> 8) & 0xff;

    const data3 = parseInt(parts[2] || '0', 16);
    bytes[6] = data3 & 0xff;
    bytes[7] = (data3 >> 8) & 0xff;

    const data4 = (parts[3] || '') + (parts[4] || '');
    for (let i = 0; i < 8; i++) {
        bytes[8 + i] = parseInt(data4.substring(i * 2, i * 2 + 2), 16);
    }

    return bytes;
}

function encodeGuidToBase64Url(guidString: string): string {
    const bytes = guidToByteArray(guidString);
    const base64 = btoa(String.fromCharCode(...bytes));
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

export const createApiBaseQuery = (
    config: ApiClientConfig
): BaseQueryFn<string | FetchArgs, unknown, EnhancedError> => {
    const baseQuery = fetchBaseQuery({
        baseUrl: config.baseUrl,
        credentials: 'include',
        prepareHeaders: (headers) => {
            headers.set('X-Requested-With', 'XMLHttpRequest');

            const token = config.getAuthToken?.();
            if (token) {
                headers.set('Authorization', `Bearer ${token}`);
            }

            const userId = config.getUserId?.();
            if (userId) {
                const base64Url = encodeGuidToBase64Url(userId);
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

            if (enhancedError.status === 401 && config.onUnauthorized) {
                config.onUnauthorized();
            }

            if (enhancedError.status === 'FETCH_ERROR' || enhancedError.status === 'TIMEOUT_ERROR') {
                enhancedError.isNetworkError = true;
            }

            return { error: enhancedError };
        } catch (unexpectedError) {
            return {
                error: {
                    status: 'CUSTOM_ERROR',
                    data: { message: 'An unexpected error occurred' },
                    error: String(unexpectedError),
                } as EnhancedError,
            };
        }
    };
};

export type { EnhancedError };
