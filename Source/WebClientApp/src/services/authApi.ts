import { createApi } from '@reduxjs/toolkit/query/react';
import type {
  ChangePasswordRequest,
  ExternalLoginCallbackRequest,
  ExternalLoginInfo,
  ForgotPasswordRequest,
  LinkExternalLoginRequest,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  ResetPasswordRequest,
  TwoFactorRecoveryRequest,
  TwoFactorSetupResponse,
  TwoFactorVerificationRequest,
  UpdateProfileRequest,
  User,
} from '@/types/domain';
import { createEnhancedBaseQuery } from './enhancedBaseQuery';

// Authentication API using existing WebApp ASP.NET Core Identity
export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: createEnhancedBaseQuery('/api/auth'),
  tagTypes: ['User'],
  endpoints: (builder) => ({
    // Login using existing Identity endpoints
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['User'],
    }),

    // Logout using existing Identity endpoints
    logout: builder.mutation<void, void>({
      query: () => ({
        url: '/logout',
        method: 'POST',
      }),
      invalidatesTags: ['User'],
    }),

    // Get current authenticated user
    getCurrentUser: builder.query<User, void>({
      query: () => '/me',
      providesTags: ['User'],
      transformResponse: (response: unknown): User => {
        const resp = response as { User?: User; user?: User } | User;
        if (resp && typeof resp === 'object' && ('User' in resp || 'user' in resp)) {
          const user = (resp as { User?: User; user?: User }).User || (resp as { User?: User; user?: User }).user;
          if (user) {
            return user;
          }
        }
        if (resp && typeof resp === 'object' && 'id' in resp) {
          return resp as User;
        }
        throw new Error('Invalid user response format');
      },
      transformErrorResponse: (response, _meta, _arg) => {
        return response;
      },
    }),

    // Register new user using existing Identity
    register: builder.mutation<RegisterResponse, RegisterRequest>({
      query: (registrationData) => ({
        url: '/register',
        method: 'POST',
        body: registrationData,
      }),
    }),

    // Password reset using existing Identity
    resetPassword: builder.mutation<{ success: boolean }, ForgotPasswordRequest>({
      query: (data) => ({
        url: '/password/forgot',
        method: 'POST',
        body: data,
      }),
    }),

    // Confirm password reset
    confirmResetPassword: builder.mutation<{ success: boolean }, ResetPasswordRequest>({
      query: (data) => ({
        url: '/password/reset',
        method: 'PUT',
        body: data,
      }),
    }),

    // External login providers (Google, Microsoft, GitHub)
    externalLogin: builder.mutation<{ loginUrl: string }, { provider: string; returnUrl?: string }>({
      query: ({ provider, returnUrl }) => ({
        url: '/external-login',
        method: 'POST',
        body: { provider, returnUrl },
      }),
    }),

    // Refresh authentication status
    refreshAuth: builder.mutation<User, void>({
      query: () => ({
        url: '/refresh',
        method: 'POST',
      }),
      invalidatesTags: ['User'],
    }),

    // Two-Factor Authentication Setup
    setupTwoFactor: builder.mutation<TwoFactorSetupResponse, void>({
      query: () => ({
        url: '/two-factor/setup',
        method: 'POST',
      }),
      invalidatesTags: ['User'],
    }),

    // Enable Two-Factor Authentication
    enableTwoFactor: builder.mutation<{ success: boolean; recoveryCodes: string[] }, { code: string }>({
      query: (data) => ({
        url: '/two-factor/enable',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),

    // Disable Two-Factor Authentication
    disableTwoFactor: builder.mutation<{ success: boolean }, { password: string }>({
      query: (data) => ({
        url: '/two-factor/disable',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),

    // Two-Factor Login Verification
    verifyTwoFactor: builder.mutation<LoginResponse, TwoFactorVerificationRequest>({
      query: (data) => ({
        url: '/two-factor/verify',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),

    // Two-Factor Recovery Code Login
    verifyRecoveryCode: builder.mutation<LoginResponse, TwoFactorRecoveryRequest>({
      query: (data) => ({
        url: '/two-factor/recovery',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),

    // Generate new recovery codes
    generateRecoveryCodes: builder.mutation<{ recoveryCodes: string[] }, void>({
      query: () => ({
        url: '/two-factor/recovery-codes',
        method: 'POST',
      }),
    }),

    // Get available external login providers
    getExternalProviders: builder.query<ExternalLoginInfo[], void>({
      query: () => '/external-providers',
    }),

    // Handle external login callback
    externalLoginCallback: builder.mutation<LoginResponse, ExternalLoginCallbackRequest>({
      query: (data) => ({
        url: '/external-login/callback',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),

    // Link external login to existing account
    linkExternalLogin: builder.mutation<{ success: boolean }, LinkExternalLoginRequest>({
      query: (data) => ({
        url: '/external-login/link',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),

    // Unlink external login
    unlinkExternalLogin: builder.mutation<{ success: boolean }, { provider: string }>({
      query: (data) => ({
        url: '/external-login/unlink',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),

    // Change password
    changePassword: builder.mutation<{ success: boolean }, ChangePasswordRequest>({
      query: (data) => ({
        url: '/change-password',
        method: 'POST',
        body: data,
      }),
    }),

    // Update profile
    updateProfile: builder.mutation<User, UpdateProfileRequest>({
      query: (data) => ({
        url: '/profile',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),

    // Email confirmation
    confirmEmail: builder.mutation<{ success: boolean }, { userId: string; token: string }>({
      query: (data) => ({
        url: '/confirm-email',
        method: 'POST',
        body: data,
      }),
    }),

    // Resend email confirmation
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
