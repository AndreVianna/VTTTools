import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useSessionState } from './useSessionState';

describe('useSessionState', () => {
    const mockSessionStorage: Record<string, string> = {};

    beforeEach(() => {
        // Clear mock storage
        Object.keys(mockSessionStorage).forEach((key) => delete mockSessionStorage[key]);

        // Mock sessionStorage
        vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => mockSessionStorage[key] ?? null);
        vi.spyOn(Storage.prototype, 'setItem').mockImplementation((key, value) => {
            mockSessionStorage[key] = value;
        });
        vi.spyOn(Storage.prototype, 'removeItem').mockImplementation((key) => {
            delete mockSessionStorage[key];
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('initialization', () => {
        it('should return default value when sessionStorage is empty', () => {
            // Act
            const { result } = renderHook(() =>
                useSessionState({
                    key: 'testKey',
                    defaultValue: 'defaultValue',
                    encounterId: undefined,
                }),
            );

            // Assert
            expect(result.current[0]).toBe('defaultValue');
        });

        it('should return stored value when sessionStorage has data', () => {
            // Arrange
            mockSessionStorage['testKey'] = JSON.stringify('storedValue');

            // Act
            const { result } = renderHook(() =>
                useSessionState({
                    key: 'testKey',
                    defaultValue: 'defaultValue',
                    encounterId: undefined,
                }),
            );

            // Assert
            expect(result.current[0]).toBe('storedValue');
        });

        it('should use encounter-scoped key when encounterId is provided', () => {
            // Arrange
            mockSessionStorage['testKey_encounter123'] = JSON.stringify('scopedValue');

            // Act
            const { result } = renderHook(() =>
                useSessionState({
                    key: 'testKey',
                    defaultValue: 'defaultValue',
                    encounterId: 'encounter123',
                }),
            );

            // Assert
            expect(result.current[0]).toBe('scopedValue');
        });

        it('should return default value on JSON parse error', () => {
            // Arrange
            mockSessionStorage['testKey'] = 'invalid-json{';

            // Act
            const { result } = renderHook(() =>
                useSessionState({
                    key: 'testKey',
                    defaultValue: 'defaultValue',
                    encounterId: undefined,
                }),
            );

            // Assert
            expect(result.current[0]).toBe('defaultValue');
        });
    });

    describe('setValue', () => {
        it('should update state and sessionStorage with direct value', () => {
            // Arrange
            const { result } = renderHook(() =>
                useSessionState({
                    key: 'testKey',
                    defaultValue: 'initial',
                    encounterId: undefined,
                }),
            );

            // Act
            act(() => {
                result.current[1]('newValue');
            });

            // Assert
            expect(result.current[0]).toBe('newValue');
            expect(mockSessionStorage['testKey']).toBe(JSON.stringify('newValue'));
        });

        it('should update state with function updater', () => {
            // Arrange
            const { result } = renderHook(() =>
                useSessionState({
                    key: 'counter',
                    defaultValue: 0,
                    encounterId: undefined,
                }),
            );

            // Act
            act(() => {
                result.current[1]((prev) => prev + 1);
            });

            // Assert
            expect(result.current[0]).toBe(1);
            expect(mockSessionStorage['counter']).toBe(JSON.stringify(1));
        });

        it('should handle complex objects', () => {
            // Arrange
            const initialObject = { name: 'test', count: 0 };
            const { result } = renderHook(() =>
                useSessionState({
                    key: 'objectKey',
                    defaultValue: initialObject,
                    encounterId: undefined,
                }),
            );

            // Act
            act(() => {
                result.current[1]({ name: 'updated', count: 5 });
            });

            // Assert
            expect(result.current[0]).toEqual({ name: 'updated', count: 5 });
        });

        it('should handle null values', () => {
            // Arrange
            const { result } = renderHook(() =>
                useSessionState<string | null>({
                    key: 'nullableKey',
                    defaultValue: 'initial',
                    encounterId: undefined,
                }),
            );

            // Act
            act(() => {
                result.current[1](null);
            });

            // Assert
            expect(result.current[0]).toBeNull();
            expect(mockSessionStorage['nullableKey']).toBe('null');
        });

        it('should warn on sessionStorage error', () => {
            // Arrange
            const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
            vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
                throw new Error('Storage full');
            });

            const { result } = renderHook(() =>
                useSessionState({
                    key: 'testKey',
                    defaultValue: 'initial',
                    encounterId: undefined,
                }),
            );

            // Act
            act(() => {
                result.current[1]('newValue');
            });

            // Assert
            expect(consoleSpy).toHaveBeenCalledWith('Failed to store testKey in sessionStorage');
            consoleSpy.mockRestore();
        });
    });

    describe('storage key changes', () => {
        it('should reload value when encounterId changes', () => {
            // Arrange
            mockSessionStorage['testKey_enc1'] = JSON.stringify('value1');
            mockSessionStorage['testKey_enc2'] = JSON.stringify('value2');

            const { result, rerender } = renderHook(
                ({ encounterId }) =>
                    useSessionState({
                        key: 'testKey',
                        defaultValue: 'default',
                        encounterId,
                    }),
                { initialProps: { encounterId: 'enc1' } },
            );

            expect(result.current[0]).toBe('value1');

            // Act
            rerender({ encounterId: 'enc2' });

            // Assert
            expect(result.current[0]).toBe('value2');
        });

        it('should return default when switching to encounter without stored value', () => {
            // Arrange
            mockSessionStorage['testKey_enc1'] = JSON.stringify('value1');

            const { result, rerender } = renderHook(
                ({ encounterId }) =>
                    useSessionState({
                        key: 'testKey',
                        defaultValue: 'default',
                        encounterId,
                    }),
                { initialProps: { encounterId: 'enc1' } },
            );

            expect(result.current[0]).toBe('value1');

            // Act
            rerender({ encounterId: 'enc2' });

            // Assert
            expect(result.current[0]).toBe('default');
        });
    });

    describe('global vs scoped keys', () => {
        it('should use global key when encounterId is undefined', () => {
            // Arrange
            mockSessionStorage['globalKey'] = JSON.stringify('globalValue');

            // Act
            const { result } = renderHook(() =>
                useSessionState({
                    key: 'globalKey',
                    defaultValue: 'default',
                    encounterId: undefined,
                }),
            );

            // Assert
            expect(result.current[0]).toBe('globalValue');
        });

        it('should not read global key when encounterId is provided', () => {
            // Arrange
            mockSessionStorage['testKey'] = JSON.stringify('globalValue');
            mockSessionStorage['testKey_enc1'] = JSON.stringify('scopedValue');

            // Act
            const { result } = renderHook(() =>
                useSessionState({
                    key: 'testKey',
                    defaultValue: 'default',
                    encounterId: 'enc1',
                }),
            );

            // Assert
            expect(result.current[0]).toBe('scopedValue');
        });
    });
});
