import { createApi } from '@reduxjs/toolkit/query/react';
import { createEnhancedBaseQuery } from '@/services/enhancedBaseQuery';

export interface SecuritySettingsResponse {
    hasTwoFactorEnabled: boolean;
    hasRecoveryCodes: boolean;
    success: boolean;
    message?: string;
}

export const securityApi = createApi({
    reducerPath: 'securityApi',
    baseQuery: createEnhancedBaseQuery('/api'),
    tagTypes: ['SecuritySettings'],
    endpoints: (builder) => ({
        getSecuritySettings: builder.query<SecuritySettingsResponse, void>({
            query: () => '/security',
            providesTags: ['SecuritySettings'],
        }),
    }),
});

export const {
    useGetSecuritySettingsQuery,
} = securityApi;
