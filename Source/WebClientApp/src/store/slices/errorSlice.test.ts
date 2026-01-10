/**
 * errorSlice Unit Tests
 * Tests Redux error slice reducers and selectors
 * Coverage: Error State Management scenarios
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import errorReducer, {
    addError,
    clearAllErrors,
    clearErrorsByType,
    clearOldErrors,
    clearRetryAttempts,
    type ErrorState,
    incrementRetryAttempt,
    markErrorRecovered,
    markErrorReported,
    removeError,
    selectCanRetry,
    selectErrorReportingEnabled,
    selectErrors,
    selectErrorsByType,
    selectGlobalError,
    selectNetworkErrors,
    selectRetryAttempts,
    selectSystemErrors,
    selectUserErrorsVisible,
    selectValidationErrors,
    setErrorReportingEnabled,
    setGlobalError,
    setUserErrorsVisible,
    type VTTError,
} from './errorSlice';

describe('errorSlice', () => {
    const initialState: ErrorState = {
        errors: [],
        globalError: null,
        networkErrors: [],
        validationErrors: [],
        systemErrors: [],
        retryAttempts: {},
        maxRetryAttempts: 3,
        reportedErrors: [],
        userErrorsVisible: false,
        errorReportingEnabled: true,
    };

    const createMockError = (overrides: Partial<VTTError> = {}): VTTError => ({
        id: 'test-error-1',
        type: 'network',
        message: 'Test error message',
        timestamp: 1735905600000, // 2026-01-03T12:00:00
        ...overrides,
    });

    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-01-03T12:00:00'));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe('initial state', () => {
        it('should return initial state when no action provided', () => {
            // Arrange & Act
            const result = errorReducer(undefined, { type: 'unknown' });

            // Assert
            expect(result).toEqual(initialState);
        });
    });

    describe('addError', () => {
        it('should add error with generated id and timestamp', () => {
            // Arrange
            const previousState = { ...initialState };
            const errorPayload = {
                type: 'network' as const,
                message: 'Connection failed',
            };

            // Act
            const result = errorReducer(previousState, addError(errorPayload));

            // Assert
            expect(result.errors).toHaveLength(1);
            expect(result.errors[0]).toMatchObject({
                type: 'network',
                message: 'Connection failed',
            });
            expect(result.errors[0]?.id).toBeDefined();
            expect(result.errors[0]?.timestamp).toBe(Date.now());
        });

        it('should categorize network error correctly', () => {
            // Arrange
            const previousState = { ...initialState };
            const errorPayload = {
                type: 'network' as const,
                message: 'Network error',
            };

            // Act
            const result = errorReducer(previousState, addError(errorPayload));

            // Assert
            expect(result.networkErrors).toHaveLength(1);
            expect(result.validationErrors).toHaveLength(0);
            expect(result.systemErrors).toHaveLength(0);
        });

        it('should categorize validation error correctly', () => {
            // Arrange
            const previousState = { ...initialState };
            const errorPayload = {
                type: 'validation' as const,
                message: 'Invalid input',
            };

            // Act
            const result = errorReducer(previousState, addError(errorPayload));

            // Assert
            expect(result.validationErrors).toHaveLength(1);
            expect(result.networkErrors).toHaveLength(0);
            expect(result.systemErrors).toHaveLength(0);
        });

        it('should categorize system error correctly', () => {
            // Arrange
            const previousState = { ...initialState };
            const errorPayload = {
                type: 'system' as const,
                message: 'System error',
            };

            // Act
            const result = errorReducer(previousState, addError(errorPayload));

            // Assert
            expect(result.systemErrors).toHaveLength(1);
            expect(result.networkErrors).toHaveLength(0);
            expect(result.validationErrors).toHaveLength(0);
        });

        it('should categorize asset_loading error as system error', () => {
            // Arrange
            const previousState = { ...initialState };
            const errorPayload = {
                type: 'asset_loading' as const,
                message: 'Asset load failed',
            };

            // Act
            const result = errorReducer(previousState, addError(errorPayload));

            // Assert
            expect(result.systemErrors).toHaveLength(1);
        });

        it('should categorize encounter_save error as system error', () => {
            // Arrange
            const previousState = { ...initialState };
            const errorPayload = {
                type: 'encounter_save' as const,
                message: 'Save failed',
            };

            // Act
            const result = errorReducer(previousState, addError(errorPayload));

            // Assert
            expect(result.systemErrors).toHaveLength(1);
        });

        it('should categorize encounter_load error as system error', () => {
            // Arrange
            const previousState = { ...initialState };
            const errorPayload = {
                type: 'encounter_load' as const,
                message: 'Load failed',
            };

            // Act
            const result = errorReducer(previousState, addError(errorPayload));

            // Assert
            expect(result.systemErrors).toHaveLength(1);
        });

        it('should set global error for system errors', () => {
            // Arrange
            const previousState = { ...initialState };
            const errorPayload = {
                type: 'system' as const,
                message: 'Critical system error',
            };

            // Act
            const result = errorReducer(previousState, addError(errorPayload));

            // Assert
            expect(result.globalError).not.toBeNull();
            expect(result.globalError?.type).toBe('system');
        });

        it('should set global error for authentication errors', () => {
            // Arrange
            const previousState = { ...initialState };
            const errorPayload = {
                type: 'authentication' as const,
                message: 'Session expired',
            };

            // Act
            const result = errorReducer(previousState, addError(errorPayload));

            // Assert
            expect(result.globalError).not.toBeNull();
            expect(result.globalError?.type).toBe('authentication');
        });

        it('should not set global error for network errors', () => {
            // Arrange
            const previousState = { ...initialState };
            const errorPayload = {
                type: 'network' as const,
                message: 'Connection error',
            };

            // Act
            const result = errorReducer(previousState, addError(errorPayload));

            // Assert
            expect(result.globalError).toBeNull();
        });

        it('should preserve optional error properties', () => {
            // Arrange
            const previousState = { ...initialState };
            const errorPayload = {
                type: 'network' as const,
                message: 'Connection error',
                details: 'Server returned 500',
                context: {
                    component: 'AssetLoader',
                    operation: 'fetchAsset',
                },
                retryable: true,
                userFriendlyMessage: 'Please check your connection',
            };

            // Act
            const result = errorReducer(previousState, addError(errorPayload));

            // Assert
            expect(result.errors[0]?.details).toBe('Server returned 500');
            expect(result.errors[0]?.context?.component).toBe('AssetLoader');
            expect(result.errors[0]?.retryable).toBe(true);
            expect(result.errors[0]?.userFriendlyMessage).toBe('Please check your connection');
        });
    });

    describe('removeError', () => {
        it('should remove error from errors array', () => {
            // Arrange
            const mockError = createMockError();
            const previousState = {
                ...initialState,
                errors: [mockError],
                networkErrors: [mockError],
            };

            // Act
            const result = errorReducer(previousState, removeError('test-error-1'));

            // Assert
            expect(result.errors).toHaveLength(0);
        });

        it('should remove error from categorized arrays', () => {
            // Arrange
            const networkError = createMockError({ type: 'network' });
            const previousState = {
                ...initialState,
                errors: [networkError],
                networkErrors: [networkError],
            };

            // Act
            const result = errorReducer(previousState, removeError('test-error-1'));

            // Assert
            expect(result.networkErrors).toHaveLength(0);
        });

        it('should clear global error when removed', () => {
            // Arrange
            const systemError = createMockError({ id: 'global-error', type: 'system' });
            const previousState = {
                ...initialState,
                errors: [systemError],
                systemErrors: [systemError],
                globalError: systemError,
            };

            // Act
            const result = errorReducer(previousState, removeError('global-error'));

            // Assert
            expect(result.globalError).toBeNull();
        });

        it('should clean up retry attempts when error removed', () => {
            // Arrange
            const mockError = createMockError();
            const previousState = {
                ...initialState,
                errors: [mockError],
                networkErrors: [mockError],
                retryAttempts: { 'test-error-1': 2 },
            };

            // Act
            const result = errorReducer(previousState, removeError('test-error-1'));

            // Assert
            expect(result.retryAttempts['test-error-1']).toBeUndefined();
        });

        it('should not affect other errors when removing one', () => {
            // Arrange
            const error1 = createMockError({ id: 'error-1' });
            const error2 = createMockError({ id: 'error-2' });
            const previousState = {
                ...initialState,
                errors: [error1, error2],
                networkErrors: [error1, error2],
            };

            // Act
            const result = errorReducer(previousState, removeError('error-1'));

            // Assert
            expect(result.errors).toHaveLength(1);
            expect(result.errors[0]?.id).toBe('error-2');
        });
    });

    describe('markErrorRecovered', () => {
        it('should mark error as recovered', () => {
            // Arrange
            const mockError = createMockError();
            const previousState = {
                ...initialState,
                errors: [mockError],
            };

            // Act
            const result = errorReducer(previousState, markErrorRecovered('test-error-1'));

            // Assert
            expect(result.errors[0]?.recovered).toBe(true);
        });

        it('should clear global error when marked as recovered', () => {
            // Arrange
            const systemError = createMockError({ id: 'system-error', type: 'system' });
            const previousState = {
                ...initialState,
                errors: [systemError],
                globalError: systemError,
            };

            // Act
            const result = errorReducer(previousState, markErrorRecovered('system-error'));

            // Assert
            expect(result.globalError).toBeNull();
        });

        it('should not affect non-matching errors', () => {
            // Arrange
            const mockError = createMockError({ id: 'other-error' });
            const previousState = {
                ...initialState,
                errors: [mockError],
            };

            // Act
            const result = errorReducer(previousState, markErrorRecovered('non-existent'));

            // Assert
            expect(result.errors[0]?.recovered).toBeUndefined();
        });
    });

    describe('clearAllErrors', () => {
        it('should clear all error arrays', () => {
            // Arrange
            const networkError = createMockError({ id: 'net-1', type: 'network' });
            const validationError = createMockError({ id: 'val-1', type: 'validation' });
            const systemError = createMockError({ id: 'sys-1', type: 'system' });
            const previousState = {
                ...initialState,
                errors: [networkError, validationError, systemError],
                networkErrors: [networkError],
                validationErrors: [validationError],
                systemErrors: [systemError],
                globalError: systemError,
                retryAttempts: { 'net-1': 2 },
            };

            // Act
            const result = errorReducer(previousState, clearAllErrors());

            // Assert
            expect(result.errors).toHaveLength(0);
            expect(result.networkErrors).toHaveLength(0);
            expect(result.validationErrors).toHaveLength(0);
            expect(result.systemErrors).toHaveLength(0);
            expect(result.globalError).toBeNull();
            expect(result.retryAttempts).toEqual({});
        });
    });

    describe('clearErrorsByType', () => {
        it('should clear only network errors', () => {
            // Arrange
            const networkError = createMockError({ id: 'net-1', type: 'network' });
            const validationError = createMockError({ id: 'val-1', type: 'validation' });
            const previousState = {
                ...initialState,
                errors: [networkError, validationError],
                networkErrors: [networkError],
                validationErrors: [validationError],
            };

            // Act
            const result = errorReducer(previousState, clearErrorsByType('network'));

            // Assert
            expect(result.errors).toHaveLength(1);
            expect(result.networkErrors).toHaveLength(0);
            expect(result.validationErrors).toHaveLength(1);
        });

        it('should clear only validation errors', () => {
            // Arrange
            const networkError = createMockError({ id: 'net-1', type: 'network' });
            const validationError = createMockError({ id: 'val-1', type: 'validation' });
            const previousState = {
                ...initialState,
                errors: [networkError, validationError],
                networkErrors: [networkError],
                validationErrors: [validationError],
            };

            // Act
            const result = errorReducer(previousState, clearErrorsByType('validation'));

            // Assert
            expect(result.errors).toHaveLength(1);
            expect(result.networkErrors).toHaveLength(1);
            expect(result.validationErrors).toHaveLength(0);
        });

        it('should clear system errors of specific type', () => {
            // Arrange
            const assetError = createMockError({ id: 'asset-1', type: 'asset_loading' });
            const encounterError = createMockError({ id: 'encounter-1', type: 'encounter_save' });
            const previousState = {
                ...initialState,
                errors: [assetError, encounterError],
                systemErrors: [assetError, encounterError],
            };

            // Act
            const result = errorReducer(previousState, clearErrorsByType('asset_loading'));

            // Assert
            expect(result.errors).toHaveLength(1);
            expect(result.systemErrors).toHaveLength(1);
            expect(result.systemErrors[0]?.type).toBe('encounter_save');
        });

        it('should clear global error when type matches', () => {
            // Arrange
            const systemError = createMockError({ id: 'sys-1', type: 'system' });
            const previousState = {
                ...initialState,
                errors: [systemError],
                systemErrors: [systemError],
                globalError: systemError,
            };

            // Act
            const result = errorReducer(previousState, clearErrorsByType('system'));

            // Assert
            expect(result.globalError).toBeNull();
        });
    });

    describe('incrementRetryAttempt', () => {
        it('should increment retry attempts for new error', () => {
            // Arrange
            const previousState = { ...initialState };

            // Act
            const result = errorReducer(previousState, incrementRetryAttempt('error-1'));

            // Assert
            expect(result.retryAttempts['error-1']).toBe(1);
        });

        it('should increment existing retry attempts', () => {
            // Arrange
            const previousState = {
                ...initialState,
                retryAttempts: { 'error-1': 2 },
            };

            // Act
            const result = errorReducer(previousState, incrementRetryAttempt('error-1'));

            // Assert
            expect(result.retryAttempts['error-1']).toBe(3);
        });
    });

    describe('clearRetryAttempts', () => {
        it('should clear retry attempts for specific error', () => {
            // Arrange
            const previousState = {
                ...initialState,
                retryAttempts: { 'error-1': 3, 'error-2': 1 },
            };

            // Act
            const result = errorReducer(previousState, clearRetryAttempts('error-1'));

            // Assert
            expect(result.retryAttempts['error-1']).toBeUndefined();
            expect(result.retryAttempts['error-2']).toBe(1);
        });
    });

    describe('markErrorReported', () => {
        it('should mark error as reported', () => {
            // Arrange
            const previousState = { ...initialState };

            // Act
            const result = errorReducer(previousState, markErrorReported('error-1'));

            // Assert
            expect(result.reportedErrors).toContain('error-1');
        });

        it('should not duplicate reported error ids', () => {
            // Arrange
            const previousState = {
                ...initialState,
                reportedErrors: ['error-1'],
            };

            // Act
            const result = errorReducer(previousState, markErrorReported('error-1'));

            // Assert
            expect(result.reportedErrors).toHaveLength(1);
        });
    });

    describe('setUserErrorsVisible', () => {
        it('should set user errors visible to true', () => {
            // Arrange
            const previousState = { ...initialState };

            // Act
            const result = errorReducer(previousState, setUserErrorsVisible(true));

            // Assert
            expect(result.userErrorsVisible).toBe(true);
        });

        it('should set user errors visible to false', () => {
            // Arrange
            const previousState = {
                ...initialState,
                userErrorsVisible: true,
            };

            // Act
            const result = errorReducer(previousState, setUserErrorsVisible(false));

            // Assert
            expect(result.userErrorsVisible).toBe(false);
        });
    });

    describe('setErrorReportingEnabled', () => {
        it('should enable error reporting', () => {
            // Arrange
            const previousState = {
                ...initialState,
                errorReportingEnabled: false,
            };

            // Act
            const result = errorReducer(previousState, setErrorReportingEnabled(true));

            // Assert
            expect(result.errorReportingEnabled).toBe(true);
        });

        it('should disable error reporting', () => {
            // Arrange
            const previousState = { ...initialState };

            // Act
            const result = errorReducer(previousState, setErrorReportingEnabled(false));

            // Assert
            expect(result.errorReportingEnabled).toBe(false);
        });
    });

    describe('setGlobalError', () => {
        it('should set global error manually', () => {
            // Arrange
            const previousState = { ...initialState };
            const error = createMockError({ type: 'system' });

            // Act
            const result = errorReducer(previousState, setGlobalError(error));

            // Assert
            expect(result.globalError).toEqual(error);
        });

        it('should clear global error when null is passed', () => {
            // Arrange
            const error = createMockError({ type: 'system' });
            const previousState = {
                ...initialState,
                globalError: error,
            };

            // Act
            const result = errorReducer(previousState, setGlobalError(null));

            // Assert
            expect(result.globalError).toBeNull();
        });
    });

    describe('clearOldErrors', () => {
        it('should clear errors older than max age', () => {
            // Arrange
            const oldError = createMockError({
                id: 'old-error',
                timestamp: Date.now() - 60000, // 1 minute ago
            });
            const newError = createMockError({
                id: 'new-error',
                timestamp: Date.now() - 10000, // 10 seconds ago
            });
            const previousState = {
                ...initialState,
                errors: [oldError, newError],
                networkErrors: [oldError, newError],
                retryAttempts: { 'old-error': 2, 'new-error': 1 },
            };

            // Act - clear errors older than 30 seconds
            const result = errorReducer(previousState, clearOldErrors(30000));

            // Assert
            expect(result.errors).toHaveLength(1);
            expect(result.errors[0]?.id).toBe('new-error');
            expect(result.networkErrors).toHaveLength(1);
        });

        it('should clear retry attempts for removed errors', () => {
            // Arrange
            const oldError = createMockError({
                id: 'old-error',
                timestamp: Date.now() - 60000,
            });
            const previousState = {
                ...initialState,
                errors: [oldError],
                networkErrors: [oldError],
                retryAttempts: { 'old-error': 2 },
            };

            // Act
            const result = errorReducer(previousState, clearOldErrors(30000));

            // Assert
            expect(result.retryAttempts['old-error']).toBeUndefined();
        });

        it('should preserve retry attempts for remaining errors', () => {
            // Arrange
            const newError = createMockError({
                id: 'new-error',
                timestamp: Date.now() - 10000,
            });
            const previousState = {
                ...initialState,
                errors: [newError],
                networkErrors: [newError],
                retryAttempts: { 'new-error': 1 },
            };

            // Act
            const result = errorReducer(previousState, clearOldErrors(30000));

            // Assert
            expect(result.retryAttempts['new-error']).toBe(1);
        });

        it('should clear errors from all categorized arrays', () => {
            // Arrange
            const oldNetworkError = createMockError({
                id: 'old-net',
                type: 'network',
                timestamp: Date.now() - 60000,
            });
            const oldValidationError = createMockError({
                id: 'old-val',
                type: 'validation',
                timestamp: Date.now() - 60000,
            });
            const oldSystemError = createMockError({
                id: 'old-sys',
                type: 'system',
                timestamp: Date.now() - 60000,
            });
            const previousState = {
                ...initialState,
                errors: [oldNetworkError, oldValidationError, oldSystemError],
                networkErrors: [oldNetworkError],
                validationErrors: [oldValidationError],
                systemErrors: [oldSystemError],
            };

            // Act
            const result = errorReducer(previousState, clearOldErrors(30000));

            // Assert
            expect(result.errors).toHaveLength(0);
            expect(result.networkErrors).toHaveLength(0);
            expect(result.validationErrors).toHaveLength(0);
            expect(result.systemErrors).toHaveLength(0);
        });
    });

    describe('selectors', () => {
        const createMockState = (errorState: Partial<ErrorState> = {}) => ({
            error: { ...initialState, ...errorState },
        });

        it('should select all errors', () => {
            // Arrange
            const errors = [createMockError()];
            const state = createMockState({ errors });

            // Act
            const result = selectErrors(state);

            // Assert
            expect(result).toEqual(errors);
        });

        it('should select global error', () => {
            // Arrange
            const globalError = createMockError({ type: 'system' });
            const state = createMockState({ globalError });

            // Act
            const result = selectGlobalError(state);

            // Assert
            expect(result).toEqual(globalError);
        });

        it('should select errors by type', () => {
            // Arrange
            const networkError = createMockError({ type: 'network' });
            const validationError = createMockError({ id: 'val-1', type: 'validation' });
            const state = createMockState({ errors: [networkError, validationError] });

            // Act
            const result = selectErrorsByType('network')(state);

            // Assert
            expect(result).toHaveLength(1);
            expect(result[0]?.type).toBe('network');
        });

        it('should select network errors', () => {
            // Arrange
            const networkErrors = [createMockError({ type: 'network' })];
            const state = createMockState({ networkErrors });

            // Act
            const result = selectNetworkErrors(state);

            // Assert
            expect(result).toEqual(networkErrors);
        });

        it('should select validation errors', () => {
            // Arrange
            const validationErrors = [createMockError({ type: 'validation' })];
            const state = createMockState({ validationErrors });

            // Act
            const result = selectValidationErrors(state);

            // Assert
            expect(result).toEqual(validationErrors);
        });

        it('should select system errors', () => {
            // Arrange
            const systemErrors = [createMockError({ type: 'system' })];
            const state = createMockState({ systemErrors });

            // Act
            const result = selectSystemErrors(state);

            // Assert
            expect(result).toEqual(systemErrors);
        });

        it('should select retry attempts for error', () => {
            // Arrange
            const state = createMockState({ retryAttempts: { 'error-1': 2 } });

            // Act
            const result = selectRetryAttempts('error-1')(state);

            // Assert
            expect(result).toBe(2);
        });

        it('should return 0 for non-existent retry attempts', () => {
            // Arrange
            const state = createMockState({});

            // Act
            const result = selectRetryAttempts('non-existent')(state);

            // Assert
            expect(result).toBe(0);
        });

        it('should return true for canRetry when under max attempts', () => {
            // Arrange
            const state = createMockState({ retryAttempts: { 'error-1': 2 } });

            // Act
            const result = selectCanRetry('error-1')(state);

            // Assert
            expect(result).toBe(true);
        });

        it('should return false for canRetry when at max attempts', () => {
            // Arrange
            const state = createMockState({ retryAttempts: { 'error-1': 3 } });

            // Act
            const result = selectCanRetry('error-1')(state);

            // Assert
            expect(result).toBe(false);
        });

        it('should return true for canRetry when no attempts made', () => {
            // Arrange
            const state = createMockState({});

            // Act
            const result = selectCanRetry('error-1')(state);

            // Assert
            expect(result).toBe(true);
        });

        it('should select user errors visible', () => {
            // Arrange
            const state = createMockState({ userErrorsVisible: true });

            // Act
            const result = selectUserErrorsVisible(state);

            // Assert
            expect(result).toBe(true);
        });

        it('should select error reporting enabled', () => {
            // Arrange
            const state = createMockState({ errorReportingEnabled: false });

            // Act
            const result = selectErrorReportingEnabled(state);

            // Assert
            expect(result).toBe(false);
        });
    });

    describe('BDD Coverage: Error categorization', () => {
        it('should not categorize authorization errors into any special array', () => {
            // Arrange
            const previousState = { ...initialState };
            const errorPayload = {
                type: 'authorization' as const,
                message: 'Access denied',
            };

            // Act
            const result = errorReducer(previousState, addError(errorPayload));

            // Assert
            expect(result.errors).toHaveLength(1);
            expect(result.networkErrors).toHaveLength(0);
            expect(result.validationErrors).toHaveLength(0);
            expect(result.systemErrors).toHaveLength(0);
        });

        it('should not set global error for validation errors', () => {
            // Arrange
            const previousState = { ...initialState };
            const errorPayload = {
                type: 'validation' as const,
                message: 'Invalid field',
            };

            // Act
            const result = errorReducer(previousState, addError(errorPayload));

            // Assert
            expect(result.globalError).toBeNull();
        });
    });

    describe('BDD Coverage: Retry mechanism', () => {
        it('should track multiple retry attempts correctly', () => {
            // Arrange
            let state = { ...initialState };

            // Act
            state = errorReducer(state, incrementRetryAttempt('error-1'));
            state = errorReducer(state, incrementRetryAttempt('error-1'));
            state = errorReducer(state, incrementRetryAttempt('error-1'));

            // Assert
            expect(state.retryAttempts['error-1']).toBe(3);
            expect(selectCanRetry('error-1')({ error: state })).toBe(false);
        });

        it('should allow retry after clearing attempts', () => {
            // Arrange
            const previousState = {
                ...initialState,
                retryAttempts: { 'error-1': 3 },
            };

            // Act
            const result = errorReducer(previousState, clearRetryAttempts('error-1'));

            // Assert
            expect(selectCanRetry('error-1')({ error: result })).toBe(true);
        });
    });

    describe('BDD Coverage: Error reporting', () => {
        it('should track reported errors independently', () => {
            // Arrange
            let state = { ...initialState };

            // Act
            state = errorReducer(state, markErrorReported('error-1'));
            state = errorReducer(state, markErrorReported('error-2'));

            // Assert
            expect(state.reportedErrors).toContain('error-1');
            expect(state.reportedErrors).toContain('error-2');
            expect(state.reportedErrors).toHaveLength(2);
        });
    });
});
