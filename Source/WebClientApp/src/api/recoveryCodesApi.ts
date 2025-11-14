import { createApi } from '@reduxjs/toolkit/query/react';
import { createEnhancedBaseQuery } from '@/services/enhancedBaseQuery';

export interface GenerateRecoveryCodesRequest {
  password: string;
}

export interface GenerateRecoveryCodesResponse {
  recoveryCodes: string[];
  success: boolean;
  message?: string;
}

export interface RecoveryCodesStatusResponse {
  remainingCount: number;
  success: boolean;
  message?: string;
}

export const recoveryCodesApi = createApi({
  reducerPath: 'recoveryCodesApi',
  baseQuery: createEnhancedBaseQuery('/api'),
  tagTypes: ['RecoveryCodes'],
  endpoints: (builder) => ({
    getRecoveryCodesStatus: builder.query<RecoveryCodesStatusResponse, void>({
      query: () => '/recovery-codes/status',
      providesTags: ['RecoveryCodes'],
    }),
    generateNewRecoveryCodes: builder.mutation<GenerateRecoveryCodesResponse, GenerateRecoveryCodesRequest>({
      query: (data) => ({
        url: '/recovery-codes',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['RecoveryCodes'],
    }),
  }),
});

export const { useGetRecoveryCodesStatusQuery, useGenerateNewRecoveryCodesMutation } = recoveryCodesApi;
