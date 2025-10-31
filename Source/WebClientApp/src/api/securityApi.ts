import { createApi } from '@reduxjs/toolkit/query/react';
import { createEnhancedBaseQuery } from '@/services/enhancedBaseQuery';

export interface SecuritySettingsResponse {
    hasTwoFactorEnabled: boolean;
    hasRecoveryCodes: boolean;
    success: boolean;
    message?: string;
}

export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export interface ChangePasswordResponse {
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
        changePassword: builder.mutation<ChangePasswordResponse, ChangePasswordRequest>({
            query: (data) => ({
                url: '/security/password',
                method: 'PUT',
                body: data,
            }),
        }),
    }),
});

export const {
    useGetSecuritySettingsQuery,
    useChangePasswordMutation,
} = securityApi;
