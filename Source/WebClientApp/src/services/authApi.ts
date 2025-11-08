import { createApi } from '@reduxjs/toolkit/query/react';
import type {
  User,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  TwoFactorSetupResponse,
  TwoFactorVerificationRequest,
  TwoFactorRecoveryRequest,
  ExternalLoginInfo,
  ExternalLoginCallbackRequest,
  LinkExternalLoginRequest,
  ChangePasswordRequest,
  UpdateProfileRequest
} from '@/types/domain';
import { createEnhancedBaseQuery } from './enhancedBaseQuery';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: createEnhancedBaseQuery('/api/auth'),
  tagTypes: ['User'],
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['User'],
    }),

    logout: builder.mutation<void, void>({
      query: () => ({
        url: '/logout',
        method: 'POST',
      }),
      invalidatesTags: ['User'],
    }),

    getCurrentUser: builder.query<User, void>({
      query: () => '/me',
      providesTags: ['User'],
      transformResponse: (response: any) => {
        if (response?.User || response?.user) {
          return response.User || response.user;
        }
        return response;
      },
      transformErrorResponse: (response, _meta, _arg) => {
        return response;
      },
    }),

    register: builder.mutation<RegisterResponse, RegisterRequest>({
      query: (registrationData) => ({
        url: '/register',
        method: 'POST',
        body: registrationData,
      }),
    }),

    resetPassword: builder.mutation<{ success: boolean }, ForgotPasswordRequest>({
      query: (data) => ({
        url: '/password/forgot',
        method: 'POST',
        body: data,
      }),
    }),

    confirmResetPassword: builder.mutation<{ success: boolean }, ResetPasswordRequest>({
      query: (data) => ({
        url: '/password/reset',
        method: 'PUT',
        body: data,
      }),
    }),

    externalLogin: builder.mutation<{ loginUrl: string }, { provider: string; returnUrl?: string }>({
      query: ({ provider, returnUrl }) => ({
        url: '/external-login',
        method: 'POST',
        body: { provider, returnUrl },
      }),
    }),

    refreshAuth: builder.mutation<User, void>({
      query: () => ({
        url: '/refresh',
        method: 'POST',
      }),
      invalidatesTags: ['User'],
    }),

    setupTwoFactor: builder.mutation<TwoFactorSetupResponse, void>({
      query: () => ({
        url: '/two-factor/setup',
        method: 'POST',
      }),
      invalidatesTags: ['User'],
    }),

    enableTwoFactor: builder.mutation<{ success: boolean; recoveryCodes: string[] }, { code: string }>({
      query: (data) => ({
        url: '/two-factor/enable',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),

    disableTwoFactor: builder.mutation<{ success: boolean }, { password: string }>({
      query: (data) => ({
        url: '/two-factor/disable',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),

    verifyTwoFactor: builder.mutation<LoginResponse, TwoFactorVerificationRequest>({
      query: (data) => ({
        url: '/two-factor/verify',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),

    verifyRecoveryCode: builder.mutation<LoginResponse, TwoFactorRecoveryRequest>({
      query: (data) => ({
        url: '/two-factor/recovery',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),

    generateRecoveryCodes: builder.mutation<{ recoveryCodes: string[] }, void>({
      query: () => ({
        url: '/two-factor/recovery-codes',
        method: 'POST',
      }),
    }),

    getExternalProviders: builder.query<ExternalLoginInfo[], void>({
      query: () => '/external-providers',
    }),

    externalLoginCallback: builder.mutation<LoginResponse, ExternalLoginCallbackRequest>({
      query: (data) => ({
        url: '/external-login/callback',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),

    linkExternalLogin: builder.mutation<{ success: boolean }, LinkExternalLoginRequest>({
      query: (data) => ({
        url: '/external-login/link',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),

    unlinkExternalLogin: builder.mutation<{ success: boolean }, { provider: string }>({
      query: (data) => ({
        url: '/external-login/unlink',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),

    changePassword: builder.mutation<{ success: boolean }, ChangePasswordRequest>({
      query: (data) => ({
        url: '/change-password',
        method: 'POST',
        body: data,
      }),
    }),

    updateProfile: builder.mutation<User, UpdateProfileRequest>({
      query: (data) => ({
        url: '/profile',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),

    confirmEmail: builder.mutation<{ success: boolean }, { userId: string; token: string }>({
      query: (data) => ({
        url: '/confirm-email',
        method: 'POST',
        body: data,
      }),
    }),

    resendEmailConfirmation: builder.mutation<{ success: boolean }, { email: string }>({
      query: (data) => ({
        url: '/resend-confirmation-email',
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useGetCurrentUserQuery,
  useRegisterMutation,
  useResetPasswordMutation,
  useConfirmResetPasswordMutation,
  useExternalLoginMutation,
  useRefreshAuthMutation,
  useSetupTwoFactorMutation,
  useEnableTwoFactorMutation,
  useDisableTwoFactorMutation,
  useVerifyTwoFactorMutation,
  useVerifyRecoveryCodeMutation,
  useGenerateRecoveryCodesMutation,
  useGetExternalProvidersQuery,
  useExternalLoginCallbackMutation,
  useLinkExternalLoginMutation,
  useUnlinkExternalLoginMutation,
  useChangePasswordMutation,
  useUpdateProfileMutation,
  useConfirmEmailMutation,
  useResendEmailConfirmationMutation,
} = authApi;