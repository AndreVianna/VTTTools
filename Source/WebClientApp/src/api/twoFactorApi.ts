import { createApi } from '@reduxjs/toolkit/query/react';
import { createEnhancedBaseQuery } from '@/services/enhancedBaseQuery';

export interface TwoFactorSetupResponse {
  sharedKey: string;
  authenticatorUri: string;
  success: boolean;
  message?: string;
}

export interface VerifySetupRequest {
  code: string;
}

export interface TwoFactorVerifyResponse {
  recoveryCodes: string[];
  success: boolean;
  message?: string;
}

export interface DisableTwoFactorRequest {
  password: string;
}

export interface DisableTwoFactorResponse {
  success: boolean;
  message?: string;
}

export const twoFactorApi = createApi({
  reducerPath: 'twoFactorApi',
  baseQuery: createEnhancedBaseQuery('/api'),
  tagTypes: ['TwoFactor', 'SecuritySettings', 'Profile'],
  endpoints: (builder) => ({
    initiateSetup: builder.mutation<TwoFactorSetupResponse, void>({
      query: () => ({
        url: '/two-factor/setup',
        method: 'POST',
      }),
      invalidatesTags: ['TwoFactor'],
    }),
    verifySetup: builder.mutation<TwoFactorVerifyResponse, VerifySetupRequest>({
      query: (data) => ({
        url: '/two-factor/setup',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['TwoFactor', 'SecuritySettings', 'Profile'],
    }),
    disableTwoFactor: builder.mutation<DisableTwoFactorResponse, DisableTwoFactorRequest>({
      query: (data) => ({
        url: '/two-factor',
        method: 'DELETE',
        body: data,
      }),
      invalidatesTags: ['SecuritySettings', 'Profile', 'TwoFactor'],
    }),
  }),
});

export const { useInitiateSetupMutation, useVerifySetupMutation, useDisableTwoFactorMutation } = twoFactorApi;
