import { useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  useLoginMutation,
  useLogoutMutation,
  useGetCurrentUserQuery,
  useRegisterMutation,
  useResetPasswordMutation,
  useConfirmResetPasswordMutation,
  useSetupTwoFactorMutation,
  useEnableTwoFactorMutation,
  useDisableTwoFactorMutation,
  useVerifyTwoFactorMutation,
  useVerifyRecoveryCodeMutation,
  useGenerateRecoveryCodesMutation,
  useChangePasswordMutation,
  useUpdateProfileMutation
} from '@/services/authApi';
import { useAppDispatch, useAppSelector } from '@/store';
import { setAuthenticated, setAuthError, logout as logoutAction, clearAuthError } from '@/store/slices/authSlice';
import { addError } from '@/store/slices/errorSlice';
import { addNotification } from '@/store/slices/uiSlice';
import { mockApi } from '@/services/mockApi';
import { isDevelopment, MOCK_DATA, devUtils } from '@/config/development';

// Authentication hook integrating with existing WebApp Identity system
export const useAuth = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const authState = useAppSelector(state => state.auth);
  const { data: currentUser, isLoading, error, refetch } = useGetCurrentUserQuery(undefined, {
    // Handle query errors gracefully in development
    retry: (failureCount, error) => {
      if (isDevelopment && failureCount < 2) {
        devUtils.warn('getCurrentUserQuery retry attempt', failureCount);
        return true;
      }
      return false;
    },
  });

  // Use mock user in development when API is unavailable
  const effectiveUser = useMemo(() => {
    if (currentUser) {
      return currentUser;
    }

    // If we have a network error in development, use mock user
    if (isDevelopment && error && (
      (error as any)?.status === 'FETCH_ERROR' ||
      (error as any)?.data?.isRecoverable
    )) {
      devUtils.log('Using mock user due to API unavailability');
      return MOCK_DATA.user;
    }

    return authState.user;
  }, [currentUser, error, authState.user]);

  // Determine if user is authenticated
  const isAuthenticated = useMemo(() => {
    if (effectiveUser) {
      return true;
    }

    // In development, if we have persistent auth state, consider authenticated
    if (isDevelopment && authState.isAuthenticated) {
      return true;
    }

    return false;
  }, [effectiveUser, authState.isAuthenticated]);

  const [loginMutation] = useLoginMutation();
  const [logoutMutation] = useLogoutMutation();
  const [registerMutation] = useRegisterMutation();
  const [resetPasswordMutation] = useResetPasswordMutation();
  const [confirmResetPasswordMutation] = useConfirmResetPasswordMutation();
  const [setupTwoFactorMutation] = useSetupTwoFactorMutation();
  const [enableTwoFactorMutation] = useEnableTwoFactorMutation();
  const [disableTwoFactorMutation] = useDisableTwoFactorMutation();
  const [verifyTwoFactorMutation] = useVerifyTwoFactorMutation();
  const [verifyRecoveryCodeMutation] = useVerifyRecoveryCodeMutation();
  const [generateRecoveryCodesMutation] = useGenerateRecoveryCodesMutation();
  const [changePasswordMutation] = useChangePasswordMutation();
  const [updateProfileMutation] = useUpdateProfileMutation();

  // Login with existing WebApp Identity
  const login = useCallback(async (email: string, password: string, rememberMe?: boolean) => {
    dispatch(clearAuthError());

    try {
      const result = await loginMutation({ email, password, rememberMe }).unwrap();

      if (result.success) {
        // Check if 2FA is required
        if (result.requiresTwoFactor) {
          // Don't redirect yet, 2FA verification needed
          dispatch(addNotification({
            type: 'info',
            message: 'Please enter your two-factor authentication code.',
          }));
          return { ...result, requiresTwoFactor: true };
        }

        // Try to refetch user data after successful login
        try {
          const userResult = await refetch();

          if (userResult.data) {
            dispatch(setAuthenticated({ user: userResult.data }));
          } else if (isDevelopment) {
            // Use mock user in development mode
            dispatch(setAuthenticated({ user: MOCK_DATA.user }));
            devUtils.log('Using mock user for successful login in development');
          }
        } catch (refetchError) {
          if (isDevelopment) {
            // In development, continue with mock user even if refetch fails
            dispatch(setAuthenticated({ user: MOCK_DATA.user }));
            devUtils.warn('Refetch failed in development, using mock user', refetchError);
          } else {
            throw refetchError;
          }
        }

        dispatch(addNotification({
          type: 'success',
          message: 'Successfully logged in!',
        }));

        // Redirect to intended destination or dashboard
        const from = location.state?.from?.pathname || '/dashboard';
        navigate(from, { replace: true });
      }

      return result;
    } catch (error: any) {
      // In development mode, allow mock login for testing
      if (isDevelopment && (
        error.status === 'FETCH_ERROR' ||
        error.data?.isRecoverable ||
        email?.includes('@dev') ||
        email?.includes('@test')
      )) {
        devUtils.warn('Login API failed, using mock login in development', error);

        const mockResult = await mockApi.mockLogin({ email, password, rememberMe });

        dispatch(setAuthenticated({ user: MOCK_DATA.user }));
        dispatch(addNotification({
          type: 'success',
          message: 'Successfully logged in! (Development Mode)',
        }));

        // Redirect to intended destination or dashboard
        const from = location.state?.from?.pathname || '/dashboard';
        navigate(from, { replace: true });

        return mockResult;
      }

      const errorMessage = error.data?.message || 'Login failed';
      dispatch(setAuthError(errorMessage));
      dispatch(addError({
        type: 'authentication',
        message: errorMessage,
        context: {
          component: 'useAuth',
          operation: 'login',
          data: { email }
        },
        userFriendlyMessage: 'Unable to sign in. Please check your credentials and try again.',
      }));
      throw error;
    }
  }, [loginMutation, dispatch, refetch, location, navigate]);

  // Register new user with existing WebApp Identity
  const register = useCallback(async (
    email: string,
    password: string,
    confirmPassword: string,
    userName: string
  ) => {
    dispatch(clearAuthError());

    try {
      const result = await registerMutation({
        email,
        password,
        confirmPassword,
        userName
      }).unwrap();

      if (result.success) {
        dispatch(addNotification({
          type: 'success',
          message: 'Account created successfully! Please check your email for verification.',
        }));

        navigate('/login');
      }

      return result;
    } catch (error: any) {
      const errorMessage = error.data?.message || 'Registration failed';
      dispatch(setAuthError(errorMessage));
      dispatch(addError({
        type: 'authentication',
        message: errorMessage,
        context: {
          component: 'useAuth',
          operation: 'register',
          data: { email, userName }
        },
        userFriendlyMessage: 'Unable to create account. Please try again.',
      }));
      throw error;
    }
  }, [registerMutation, dispatch, navigate]);

  // Logout using existing WebApp Identity
  const logout = useCallback(async () => {
    try {
      await logoutMutation().unwrap();

      dispatch(logoutAction());
      dispatch(addNotification({
        type: 'info',
        message: 'You have been logged out.',
      }));

      navigate('/login', { replace: true });
    } catch (error: any) {
      // Even if logout API fails, clear local auth state
      dispatch(logoutAction());
      dispatch(addError({
        type: 'authentication',
        message: 'Logout request failed, but you have been signed out locally.',
        context: {
          component: 'useAuth',
          operation: 'logout',
        },
      }));

      navigate('/login', { replace: true });
    }
  }, [logoutMutation, dispatch, navigate]);

  // Request password reset
  const resetPassword = useCallback(async (email: string) => {
    dispatch(clearAuthError());

    try {
      const result = await resetPasswordMutation({ email }).unwrap();

      if (result.success) {
        dispatch(addNotification({
          type: 'success',
          message: 'Password reset instructions have been sent to your email.',
        }));
      }

      return result;
    } catch (error: any) {
      const errorMessage = error.data?.message || 'Password reset request failed';
      dispatch(setAuthError(errorMessage));
      dispatch(addError({
        type: 'authentication',
        message: errorMessage,
        context: {
          component: 'useAuth',
          operation: 'resetPassword',
          data: { email }
        },
        userFriendlyMessage: 'Unable to send password reset email. Please try again.',
      }));
      throw error;
    }
  }, [resetPasswordMutation, dispatch]);

  // Check if user can retry login (rate limiting)
  const canRetryLogin = useCallback(() => {
    const { loginAttempts, lastLoginAttempt } = authState;
    const maxAttempts = 5;
    const lockoutDuration = 15 * 60 * 1000; // 15 minutes

    if (loginAttempts < maxAttempts) {
      return true;
    }

    if (lastLoginAttempt && Date.now() - lastLoginAttempt > lockoutDuration) {
      return true;
    }

    return false;
  }, [authState]);

  // Get time remaining for lockout
  const getLockoutTimeRemaining = useCallback(() => {
    const { lastLoginAttempt } = authState;
    const lockoutDuration = 15 * 60 * 1000; // 15 minutes

    if (!lastLoginAttempt) return 0;

    const elapsed = Date.now() - lastLoginAttempt;
    return Math.max(0, lockoutDuration - elapsed);
  }, [authState]);

  // Force refresh authentication state
  const refreshAuth = useCallback(async () => {
    try {
      const userResult = await refetch();

      if (userResult.data) {
        dispatch(setAuthenticated({ user: userResult.data }));
        return userResult.data;
      } else {
        dispatch(logoutAction());
        return null;
      }
    } catch (error) {
      dispatch(logoutAction());
      return null;
    }
  }, [refetch, dispatch]);

  // Confirm password reset
  const confirmResetPassword = useCallback(async (
    email: string,
    token: string,
    newPassword: string,
    confirmPassword: string
  ) => {
    dispatch(clearAuthError());

    try {
      const result = await confirmResetPasswordMutation({
        email,
        token,
        newPassword,
        confirmPassword
      }).unwrap();

      if (result.success) {
        dispatch(addNotification({
          type: 'success',
          message: 'Password reset successfully! Please log in with your new password.',
        }));

        navigate('/login');
      }

      return result;
    } catch (error: any) {
      const errorMessage = error.data?.message || 'Password reset failed';
      dispatch(setAuthError(errorMessage));
      dispatch(addError({
        type: 'authentication',
        message: errorMessage,
        context: {
          component: 'useAuth',
          operation: 'confirmResetPassword',
          data: { email }
        },
        userFriendlyMessage: 'Unable to reset password. Please try again.',
      }));
      throw error;
    }
  }, [confirmResetPasswordMutation, dispatch, navigate]);

  // Setup Two-Factor Authentication
  const setupTwoFactor = useCallback(async () => {
    try {
      const result = await setupTwoFactorMutation().unwrap();
      return result;
    } catch (error: any) {
      const errorMessage = error.data?.message || '2FA setup failed';
      dispatch(setAuthError(errorMessage));
      dispatch(addError({
        type: 'authentication',
        message: errorMessage,
        context: {
          component: 'useAuth',
          operation: 'setupTwoFactor',
        },
        userFriendlyMessage: 'Unable to set up two-factor authentication. Please try again.',
      }));
      throw error;
    }
  }, [setupTwoFactorMutation, dispatch]);

  // Enable Two-Factor Authentication
  const enableTwoFactor = useCallback(async (code: string) => {
    try {
      const result = await enableTwoFactorMutation({ code }).unwrap();

      if (result.success) {
        dispatch(addNotification({
          type: 'success',
          message: 'Two-factor authentication enabled successfully!',
        }));

        // Refresh user data
        await refetch();
      }

      return result;
    } catch (error: any) {
      const errorMessage = error.data?.message || '2FA enable failed';
      dispatch(setAuthError(errorMessage));
      dispatch(addError({
        type: 'authentication',
        message: errorMessage,
        context: {
          component: 'useAuth',
          operation: 'enableTwoFactor',
        },
        userFriendlyMessage: 'Unable to enable two-factor authentication. Please verify the code and try again.',
      }));
      throw error;
    }
  }, [enableTwoFactorMutation, dispatch, refetch]);

  // Disable Two-Factor Authentication
  const disableTwoFactor = useCallback(async (password: string) => {
    try {
      const result = await disableTwoFactorMutation({ password }).unwrap();

      if (result.success) {
        dispatch(addNotification({
          type: 'success',
          message: 'Two-factor authentication disabled.',
        }));

        // Refresh user data
        await refetch();
      }

      return result;
    } catch (error: any) {
      const errorMessage = error.data?.message || '2FA disable failed';
      dispatch(setAuthError(errorMessage));
      dispatch(addError({
        type: 'authentication',
        message: errorMessage,
        context: {
          component: 'useAuth',
          operation: 'disableTwoFactor',
        },
        userFriendlyMessage: 'Unable to disable two-factor authentication. Please verify your password and try again.',
      }));
      throw error;
    }
  }, [disableTwoFactorMutation, dispatch, refetch]);

  // Verify Two-Factor Code (during login)
  const verifyTwoFactor = useCallback(async (code: string, rememberMachine?: boolean) => {
    try {
      const result = await verifyTwoFactorMutation({ code, rememberMachine }).unwrap();

      if (result.success) {
        // Refetch user data after successful 2FA verification
        const userResult = await refetch();

        if (userResult.data) {
          dispatch(setAuthenticated({ user: userResult.data }));
          dispatch(addNotification({
            type: 'success',
            message: 'Successfully logged in!',
          }));

          // Redirect to intended destination or dashboard
          const from = location.state?.from?.pathname || '/dashboard';
          navigate(from, { replace: true });
        }
      }

      return result;
    } catch (error: any) {
      const errorMessage = error.data?.message || '2FA verification failed';
      dispatch(setAuthError(errorMessage));
      dispatch(addError({
        type: 'authentication',
        message: errorMessage,
        context: {
          component: 'useAuth',
          operation: 'verifyTwoFactor',
        },
        userFriendlyMessage: 'Unable to verify two-factor code. Please try again.',
      }));
      throw error;
    }
  }, [verifyTwoFactorMutation, dispatch, refetch, location, navigate]);

  // Verify Recovery Code (during login)
  const verifyRecoveryCode = useCallback(async (recoveryCode: string) => {
    try {
      const result = await verifyRecoveryCodeMutation({ recoveryCode }).unwrap();

      if (result.success) {
        // Refetch user data after successful recovery code verification
        const userResult = await refetch();

        if (userResult.data) {
          dispatch(setAuthenticated({ user: userResult.data }));
          dispatch(addNotification({
            type: 'success',
            message: 'Successfully logged in!',
          }));

          // Redirect to intended destination or dashboard
          const from = location.state?.from?.pathname || '/dashboard';
          navigate(from, { replace: true });
        }
      }

      return result;
    } catch (error: any) {
      const errorMessage = error.data?.message || 'Recovery code verification failed';
      dispatch(setAuthError(errorMessage));
      dispatch(addError({
        type: 'authentication',
        message: errorMessage,
        context: {
          component: 'useAuth',
          operation: 'verifyRecoveryCode',
        },
        userFriendlyMessage: 'Unable to verify recovery code. Please try again.',
      }));
      throw error;
    }
  }, [verifyRecoveryCodeMutation, dispatch, refetch, location, navigate]);

  // Generate new recovery codes
  const generateRecoveryCodes = useCallback(async () => {
    try {
      const result = await generateRecoveryCodesMutation().unwrap();

      dispatch(addNotification({
        type: 'success',
        message: 'New recovery codes generated successfully!',
      }));

      return result;
    } catch (error: any) {
      const errorMessage = error.data?.message || 'Failed to generate recovery codes';
      dispatch(setAuthError(errorMessage));
      dispatch(addError({
        type: 'authentication',
        message: errorMessage,
        context: {
          component: 'useAuth',
          operation: 'generateRecoveryCodes',
        },
        userFriendlyMessage: 'Unable to generate new recovery codes. Please try again.',
      }));
      throw error;
    }
  }, [generateRecoveryCodesMutation, dispatch]);

  // Change password
  const changePassword = useCallback(async (
    currentPassword: string,
    newPassword: string,
    confirmPassword: string
  ) => {
    try {
      const result = await changePasswordMutation({
        currentPassword,
        newPassword,
        confirmPassword
      }).unwrap();

      if (result.success) {
        dispatch(addNotification({
          type: 'success',
          message: 'Password changed successfully!',
        }));
      }

      return result;
    } catch (error: any) {
      const errorMessage = error.data?.message || 'Password change failed';
      dispatch(setAuthError(errorMessage));
      dispatch(addError({
        type: 'authentication',
        message: errorMessage,
        context: {
          component: 'useAuth',
          operation: 'changePassword',
        },
        userFriendlyMessage: 'Unable to change password. Please try again.',
      }));
      throw error;
    }
  }, [changePasswordMutation, dispatch]);

  // Update profile
  const updateProfile = useCallback(async (updates: {
    userName?: string;
    phoneNumber?: string;
    profilePictureUrl?: string;
  }) => {
    try {
      const result = await updateProfileMutation(updates).unwrap();

      dispatch(setAuthenticated({ user: result }));
      dispatch(addNotification({
        type: 'success',
        message: 'Profile updated successfully!',
      }));

      return result;
    } catch (error: any) {
      const errorMessage = error.data?.message || 'Profile update failed';
      dispatch(setAuthError(errorMessage));
      dispatch(addError({
        type: 'authentication',
        message: errorMessage,
        context: {
          component: 'useAuth',
          operation: 'updateProfile',
        },
        userFriendlyMessage: 'Unable to update profile. Please try again.',
      }));
      throw error;
    }
  }, [updateProfileMutation, dispatch]);

  return {
    // State - using enhanced values with fallbacks
    user: effectiveUser,
    isAuthenticated,
    isLoading: isLoading || authState.isLoading,
    error: (isDevelopment && error?.data?.isRecoverable) ? null : (error || authState.error),
    loginAttempts: authState.loginAttempts,

    // Basic Actions
    login,
    logout,
    register,
    resetPassword,
    confirmResetPassword,
    refreshAuth,

    // Two-Factor Authentication
    setupTwoFactor,
    enableTwoFactor,
    disableTwoFactor,
    verifyTwoFactor,
    verifyRecoveryCode,
    generateRecoveryCodes,

    // Profile Management
    changePassword,
    updateProfile,

    // Utilities
    canRetryLogin,
    getLockoutTimeRemaining,
    clearError: () => dispatch(clearAuthError()),

    // Development utilities
    isDevelopmentMode: isDevelopment,
    isUsingMockData: isDevelopment && !!effectiveUser && effectiveUser.email?.includes('@vtttools.dev'),
  };
};