import { useCallback, useMemo, useEffect, useState } from 'react';
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
  useUpdateProfileMutation,
  authApi
} from '@/services/authApi';
import { useAppDispatch, useAppSelector } from '@/store';
import { setAuthenticated, setAuthError, logout as logoutAction, clearAuthError } from '@/store/slices/authSlice';
import { addError } from '@/store/slices/errorSlice';
import { addNotification } from '@/store/slices/uiSlice';
import { isDevelopment } from '@/config/development';

// Global flag to track if we've checked for existing session (shared across all hook instances)
let globalAuthInitialized = false;

// Map backend error codes to user-friendly messages
const mapToUserFriendlyMessage = (backendMessage: string): string => {
  // Map backend message codes to user-friendly messages
  switch (backendMessage) {
    case 'FailedLogin':
      return 'Invalid email or password.';

    case 'LockedAccount':
      return 'Your account is temporarely locked. Please try again later.';

    case 'NotAllowed':
      return 'You need to confirm your email before proceeding.';

    case 'InternalServerError':
      return 'An unexpected error has occurred. Please try again in a few minutes.';

    case 'DuplicatedUser':
      return 'Email address already registered';

    case 'NotFound':
      return 'User not found.';

    case 'Success':
      return 'Login successful.';

    case 'RegistrationSuccess':
      return 'Registration successful.';

    case 'LogoutSuccess':
      return 'Logout successful.';

    default:
      return 'An unexpected error has occurred. Please try again in a few minutes.';
  }
};

// Helper to extract error messages from ASP.NET ValidationProblem responses
// ValidationProblem structure: { errors: { "": ["msg1"], "field": ["msg2"] }, title, status }
const extractErrorMessage = (error: any, defaultMessage: string = 'Operation failed'): string => {
  let backendMessage: string | null = null;

  // Try ValidationProblem errors format first
  if (error?.data?.errors) {
    const errors = error.data.errors;
    const allErrors: string[] = [];

    // Extract all error messages from all fields
    Object.keys(errors).forEach(key => {
      const fieldErrors = errors[key];
      if (Array.isArray(fieldErrors)) {
        allErrors.push(...fieldErrors);
      }
    });

    if (allErrors.length > 0) {
      backendMessage = allErrors[0]; // Get first error message
    }
  }

  // Fallback to simple message field
  if (!backendMessage && error?.data?.message) {
    backendMessage = error.data.message;
  }

  // Fallback to simple error field (used by Conflict responses)
  if (!backendMessage && error?.data?.error) {
    backendMessage = error.data.error;
  }

  // Fallback to error string
  if (!backendMessage && error?.message) {
    backendMessage = error.message;
  }

  // Use default if nothing found
  if (!backendMessage) {
    backendMessage = defaultMessage;
  }

  // Map to user-friendly message
  return mapToUserFriendlyMessage(backendMessage);
};

// Authentication hook integrating with existing WebApp Identity system
export const useAuth = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const authState = useAppSelector(state => state.auth);

  // Local state to track if initial auth check is complete
  const [initComplete, setInitComplete] = useState(globalAuthInitialized);

  // IMPORTANT: Only fetch current user if:
  // 1. We haven't initialized yet (checking for existing session), OR
  // 2. Redux confirms we're authenticated
  // This prevents cached user data from showing after logout
  const { data: currentUser, isLoading, error, refetch } = useGetCurrentUserQuery(undefined, {
    skip: globalAuthInitialized && !authState.isAuthenticated,  // Skip after init unless authenticated
  });

  // Initialize authentication state from server session cookie (runs once globally)
  useEffect(() => {
    if (!globalAuthInitialized && !isLoading) {
      // Query has completed (success or failure)
      if (currentUser && !authState.isAuthenticated) {
        // Found existing session - restore it
        dispatch(setAuthenticated({ user: currentUser }));
      }
      // Mark as initialized (both global and local state)
      globalAuthInitialized = true;
      setInitComplete(true);
    }
  }, [isLoading, currentUser, authState.isAuthenticated, dispatch]);

  // CRITICAL: Redux state is the PRIMARY source of truth for authentication
  // Use cached/mock user data ONLY if Redux confirms we're authenticated
  const effectiveUser = useMemo(() => {
    // If Redux says not authenticated, always return null (ignore cache)
    if (!authState.isAuthenticated) {
      return null;
    }

    // Redux says authenticated - prefer API data over Redux user
    if (currentUser) {
      return currentUser;
    }

    // Fallback to Redux stored user
    return authState.user;
  }, [authState.isAuthenticated, authState.user, currentUser]);

  // IMPORTANT: Redux auth state is the ONLY source of truth for isAuthenticated
  // This prevents flickering and state inconsistencies
  const isAuthenticated = authState.isAuthenticated;

  const [loginMutation, { isLoading: isLoggingIn }] = useLoginMutation();
  const [logoutMutation, { isLoading: isLoggingOut }] = useLogoutMutation();
  const [registerMutation, { isLoading: isRegistering }] = useRegisterMutation();
  const [resetPasswordMutation, { isLoading: isResettingPassword }] = useResetPasswordMutation();
  const [confirmResetPasswordMutation, { isLoading: isConfirmingReset }] = useConfirmResetPasswordMutation();
  const [setupTwoFactorMutation, { isLoading: isSettingUpTwoFactor }] = useSetupTwoFactorMutation();
  const [enableTwoFactorMutation, { isLoading: isEnablingTwoFactor }] = useEnableTwoFactorMutation();
  const [disableTwoFactorMutation, { isLoading: isDisablingTwoFactor }] = useDisableTwoFactorMutation();
  const [verifyTwoFactorMutation, { isLoading: isVerifyingTwoFactor }] = useVerifyTwoFactorMutation();
  const [verifyRecoveryCodeMutation, { isLoading: isVerifyingRecoveryCode }] = useVerifyRecoveryCodeMutation();
  const [generateRecoveryCodesMutation, { isLoading: isGeneratingRecoveryCodes }] = useGenerateRecoveryCodesMutation();
  const [changePasswordMutation, { isLoading: isChangingPassword }] = useChangePasswordMutation();
  const [updateProfileMutation, { isLoading: isUpdatingProfile }] = useUpdateProfileMutation();

  // Stable clearError function to prevent unnecessary re-renders
  const clearErrorCallback = useCallback(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  // Login with existing WebApp Identity
  const login = useCallback(async (email: string, password: string, rememberMe?: boolean) => {
    dispatch(clearAuthError());

    try {
      const result = await loginMutation({ email, password, rememberMe: rememberMe ?? false }).unwrap();

      if (result.success) {
        // Check if 2FA is required
        if (result.requiresTwoFactor) {
          dispatch(addNotification({
            type: 'info',
            message: 'Please enter your two-factor authentication code.',
          }));
          return { ...result, requiresTwoFactor: true };
        }

        // Use user data from login response
        if (result.user) {
          dispatch(setAuthenticated({ user: result.user }));
        } else {
          throw new Error('Login succeeded but user data was not returned');
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
      const errorMessage = extractErrorMessage(error, 'Login failed');
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
  }, [loginMutation, dispatch, location, navigate]);

  // Register new user with existing WebApp Identity
  const register = useCallback(async (
    email: string,
    password: string,
    confirmPassword: string,
    displayName: string
  ) => {
    dispatch(clearAuthError());

    try {
      const result = await registerMutation({
        email,
        password,
        confirmPassword,
        name: displayName,  // User's full name (e.g., "Andre Vianna")
        displayName: displayName.split(' ')[0]  // First word of name as display name (e.g., "Andre")
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
      console.error('useAuth.register caught error:', error);
      console.error('Error details - status:', error?.status, 'data:', error?.data);

      const errorMessage = extractErrorMessage(error, 'Registration failed');
      dispatch(setAuthError(errorMessage));
      dispatch(addError({
        type: 'authentication',
        message: errorMessage,
        context: {
          component: 'useAuth',
          operation: 'register',
          data: { email, displayName }
        },
        userFriendlyMessage: 'Unable to create account. Please try again.',
      }));
      throw error;
    }
  }, [registerMutation, dispatch, navigate]);

  const logout = useCallback(async () => {
    try {
      dispatch(logoutAction());
      dispatch(authApi.util.resetApiState());
      await logoutMutation().unwrap();
      globalAuthInitialized = false;
      setInitComplete(false);

      dispatch(addNotification({
        type: 'info',
        message: 'You have been logged out.',
      }));

      navigate('/', { replace: true });
    } catch (_error) {
      globalAuthInitialized = false;  // Still reset for next login attempt
      setInitComplete(false);

      dispatch(addError({
        type: 'authentication',
        message: 'Logout request failed, but you have been signed out locally.',
        context: {
          component: 'useAuth',
          operation: 'logout',
        },
      }));

      navigate('/', { replace: true });
    }
  }, [logoutMutation, dispatch, navigate]);

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
      const errorMessage = extractErrorMessage(error, 'Password reset request failed');
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
    } catch (_error) {
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
      const errorMessage = extractErrorMessage(error, 'Password reset failed');
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
      const errorMessage = extractErrorMessage(error, '2FA setup failed');
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
      const errorMessage = extractErrorMessage(error, '2FA enable failed');
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
      const errorMessage = extractErrorMessage(error, '2FA disable failed');
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
      const result = await verifyTwoFactorMutation({ code, rememberMachine: rememberMachine ?? false }).unwrap();

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
      const errorMessage = extractErrorMessage(error, '2FA verification failed');
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
      const errorMessage = extractErrorMessage(error, 'Recovery code verification failed');
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
      const errorMessage = extractErrorMessage(error, 'Failed to generate recovery codes');
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
      const errorMessage = extractErrorMessage(error, 'Password change failed');
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
      const errorMessage = extractErrorMessage(error, 'Profile update failed');
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
    isLoading: isLoading || authState.isLoading || isLoggingIn || isRegistering || isResettingPassword || isConfirmingReset || isLoggingOut || isSettingUpTwoFactor || isEnablingTwoFactor || isDisablingTwoFactor || isVerifyingTwoFactor || isVerifyingRecoveryCode || isGeneratingRecoveryCodes || isChangingPassword || isUpdatingProfile,
    isInitializing: !initComplete,  // True until initial auth check completes
    error: authState.error || error,
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
    clearError: clearErrorCallback,

    // Development utilities
    isDevelopmentMode: isDevelopment,
  };
};