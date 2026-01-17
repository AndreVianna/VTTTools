import { describe, expect, it, vi } from 'vitest';
import { AuthErrorHandler } from './AuthErrorHandler';

describe('AuthErrorHandler', () => {
    describe('mapToUserFriendlyMessage', () => {
        it('should map known error codes to friendly messages', () => {
            expect(AuthErrorHandler.mapToUserFriendlyMessage('FailedLogin')).toBe('Invalid email or password.');
            expect(AuthErrorHandler.mapToUserFriendlyMessage('LockedAccount')).toBe(
                'Your account is temporarily locked. Please try again later.',
            );
            expect(AuthErrorHandler.mapToUserFriendlyMessage('NotAllowed')).toBe(
                'You need to confirm your email before proceeding.',
            );
            expect(AuthErrorHandler.mapToUserFriendlyMessage('DuplicatedUser')).toBe('Email address already registered');
        });

        it('should return default message for unknown codes', () => {
            expect(AuthErrorHandler.mapToUserFriendlyMessage('UnknownCode')).toBe(
                'An unexpected error has occurred. Please try again in a few minutes.',
            );
        });
    });

    describe('isRTKQueryError', () => {
        it('should return true for RTK Query errors', () => {
            expect(AuthErrorHandler.isRTKQueryError({ status: 401 })).toBe(true);
            expect(AuthErrorHandler.isRTKQueryError({ data: { message: 'error' } })).toBe(true);
            expect(AuthErrorHandler.isRTKQueryError({ message: 'error' })).toBe(true);
        });

        it('should return false for non-RTK Query errors', () => {
            expect(AuthErrorHandler.isRTKQueryError(null)).toBe(false);
            expect(AuthErrorHandler.isRTKQueryError(undefined)).toBe(false);
            expect(AuthErrorHandler.isRTKQueryError('string error')).toBe(false);
            expect(AuthErrorHandler.isRTKQueryError(123)).toBe(false);
        });
    });

    describe('extractErrorMessage', () => {
        it('should extract message from data.errors', () => {
            const error = {
                status: 400,
                data: {
                    errors: {
                        email: ['FailedLogin'],
                    },
                },
            };
            expect(AuthErrorHandler.extractErrorMessage(error)).toBe('Invalid email or password.');
        });

        it('should extract message from data.message', () => {
            const error = {
                status: 400,
                data: {
                    message: 'LockedAccount',
                },
            };
            expect(AuthErrorHandler.extractErrorMessage(error)).toBe(
                'Your account is temporarily locked. Please try again later.',
            );
        });

        it('should extract message from data.error', () => {
            const error = {
                status: 400,
                data: {
                    error: 'NotFound',
                },
            };
            expect(AuthErrorHandler.extractErrorMessage(error)).toBe('User not found.');
        });

        it('should extract message from top-level message', () => {
            const error = {
                message: 'DuplicatedUser',
            };
            expect(AuthErrorHandler.extractErrorMessage(error)).toBe('Email address already registered');
        });

        it('should use default message for non-RTK errors', () => {
            expect(AuthErrorHandler.extractErrorMessage('string error')).toBe(
                'An unexpected error has occurred. Please try again in a few minutes.',
            );
        });

        it('should use provided default message', () => {
            expect(AuthErrorHandler.extractErrorMessage('string error', 'Custom default')).toBe(
                'An unexpected error has occurred. Please try again in a few minutes.',
            );
        });
    });

    describe('handle', () => {
        it('should dispatch errors and return result', () => {
            const mockDispatch = vi.fn();
            const error = { data: { message: 'FailedLogin' } };

            const result = AuthErrorHandler.handle(mockDispatch, error, {
                operation: 'login',
                userFriendlyMessage: 'Unable to sign in.',
                context: { email: 'test@example.com' },
            });

            expect(result.errorMessage).toBe('Invalid email or password.');
            expect(result.dispatched).toBe(true);
            expect(mockDispatch).toHaveBeenCalledTimes(2);
        });

        it('should include context in error payload', () => {
            const mockDispatch = vi.fn();
            const error = { data: { message: 'FailedLogin' } };

            AuthErrorHandler.handle(mockDispatch, error, {
                operation: 'login',
                userFriendlyMessage: 'Unable to sign in.',
                context: { email: 'test@example.com' },
            });

            const addErrorCall = mockDispatch.mock.calls[1];
            expect(addErrorCall).toBeDefined();
            const payload = addErrorCall?.[0]?.payload;
            expect(payload?.context?.data?.email).toBe('test@example.com');
        });
    });

    describe('extractOnly', () => {
        it('should extract message without dispatching', () => {
            const error = { data: { message: 'FailedLogin' } };
            const result = AuthErrorHandler.extractOnly(error);
            expect(result).toBe('Invalid email or password.');
        });
    });
});
