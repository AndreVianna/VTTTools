import type { AppDispatch } from '@/store';
import { setAuthError } from '@/store/slices/authSlice';
import { addError, type VTTError } from '@/store/slices/errorSlice';

/**
 * Payload for adding an error (without id and timestamp which are auto-generated).
 */
type ErrorPayload = Omit<VTTError, 'id' | 'timestamp'>;

/**
 * Map backend error codes to user-friendly messages.
 */
const ERROR_MESSAGE_MAP: Record<string, string> = {
    FailedLogin: 'Invalid email or password.',
    LockedAccount: 'Your account is temporarily locked. Please try again later.',
    NotAllowed: 'You need to confirm your email before proceeding.',
    InternalServerError: 'An unexpected error has occurred. Please try again in a few minutes.',
    DuplicatedUser: 'Email address already registered',
    NotFound: 'User not found.',
    Success: 'Login successful.',
    RegistrationSuccess: 'Registration successful.',
    LogoutSuccess: 'Logout successful.',
};

const DEFAULT_ERROR_MESSAGE = 'An unexpected error has occurred. Please try again in a few minutes.';

/**
 * RTK Query error shape.
 */
interface RTKQueryError {
    status?: number;
    data?: {
        errors?: Record<string, string[]>;
        message?: string;
        error?: string;
    };
    message?: string;
}

/**
 * Configuration for handling an authentication error.
 */
export interface AuthErrorConfig {
    operation: string;
    defaultMessage?: string;
    userFriendlyMessage: string;
    context?: Record<string, unknown>;
}

/**
 * Result of handling an authentication error.
 */
export interface AuthErrorResult {
    errorMessage: string;
    dispatched: boolean;
}

/**
 * AuthErrorHandler provides centralized error handling for authentication operations.
 *
 * It consolidates the repeated error handling pattern:
 * 1. Extract error message from RTK Query error
 * 2. Map backend codes to user-friendly messages
 * 3. Dispatch to auth error state
 * 4. Dispatch to global error state
 *
 * @example
 * ```typescript
 * try {
 *   await loginMutation(credentials).unwrap();
 * } catch (error) {
 *   AuthErrorHandler.handle(dispatch, error, {
 *     operation: 'login',
 *     userFriendlyMessage: 'Unable to sign in. Please check your credentials.',
 *     context: { email },
 *   });
 *   throw error;
 * }
 * ```
 */
export class AuthErrorHandler {
    /**
     * Map a backend message code to a user-friendly message.
     */
    static mapToUserFriendlyMessage(backendMessage: string): string {
        return ERROR_MESSAGE_MAP[backendMessage] ?? DEFAULT_ERROR_MESSAGE;
    }

    /**
     * Check if an error is an RTK Query error.
     */
    static isRTKQueryError(error: unknown): error is RTKQueryError {
        if (typeof error !== 'object' || error === null) return false;
        const err = error as Partial<RTKQueryError>;
        return 'status' in err || 'data' in err || 'message' in err;
    }

    /**
     * Extract the error message from an RTK Query error or unknown error.
     */
    static extractErrorMessage(error: unknown, defaultMessage: string = 'Operation failed'): string {
        let backendMessage: string | null = null;

        if (!AuthErrorHandler.isRTKQueryError(error)) {
            return AuthErrorHandler.mapToUserFriendlyMessage(defaultMessage);
        }

        // Try to extract from validation errors
        if (error.data?.errors) {
            const errors = error.data.errors;
            const allErrors: string[] = [];

            for (const key of Object.keys(errors)) {
                const fieldErrors = errors[key];
                if (Array.isArray(fieldErrors)) {
                    allErrors.push(...fieldErrors);
                }
            }

            if (allErrors.length > 0) {
                backendMessage = allErrors[0] ?? null;
            }
        }

        // Try data.message
        if (!backendMessage && error.data?.message) {
            backendMessage = error.data.message;
        }

        // Try data.error
        if (!backendMessage && error.data?.error) {
            backendMessage = error.data.error;
        }

        // Try top-level message
        if (!backendMessage && error.message) {
            backendMessage = error.message;
        }

        // Fallback to default
        if (!backendMessage) {
            backendMessage = defaultMessage;
        }

        return AuthErrorHandler.mapToUserFriendlyMessage(backendMessage);
    }

    /**
     * Handle an authentication error by dispatching to Redux stores.
     *
     * @param dispatch - Redux dispatch function
     * @param error - The caught error
     * @param config - Error handling configuration
     * @returns The extracted error message and dispatch status
     */
    static handle(
        dispatch: AppDispatch,
        error: unknown,
        config: AuthErrorConfig,
    ): AuthErrorResult {
        const errorMessage = AuthErrorHandler.extractErrorMessage(
            error,
            config.defaultMessage ?? `${config.operation} failed`,
        );

        dispatch(setAuthError(errorMessage));

        const errorPayload: ErrorPayload = {
            type: 'authentication',
            message: errorMessage,
            context: {
                component: 'useAuth',
                operation: config.operation,
                ...(config.context && { data: config.context }),
            },
            userFriendlyMessage: config.userFriendlyMessage,
        };

        dispatch(addError(errorPayload));

        return {
            errorMessage,
            dispatched: true,
        };
    }

    /**
     * Handle an error without dispatching to stores.
     * Useful for extracting error messages without side effects.
     *
     * @param error - The caught error
     * @param defaultMessage - Default message if extraction fails
     * @returns The extracted error message
     */
    static extractOnly(error: unknown, defaultMessage?: string): string {
        return AuthErrorHandler.extractErrorMessage(error, defaultMessage);
    }
}
