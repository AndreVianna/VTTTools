import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useAutoSave, UseAutoSaveOptions } from './useAutoSave';

describe('useAutoSave', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    const createOptions = <T>(overrides: Partial<UseAutoSaveOptions<T>> = {}): UseAutoSaveOptions<T> => ({
        data: { value: 'test' } as T,
        originalData: { value: 'test' } as T,
        onSave: vi.fn().mockResolvedValue(undefined),
        ...overrides,
    });

    describe('Initial State', () => {
        it('should return idle status initially', () => {
            // Arrange
            const options = createOptions();

            // Act
            const { result } = renderHook(() => useAutoSave(options));

            // Assert
            expect(result.current).toBe('idle');
        });

        it('should not save on initial mount', () => {
            // Arrange
            const onSave = vi.fn().mockResolvedValue(undefined);
            const options = createOptions({
                data: { value: 'changed' },
                originalData: { value: 'original' },
                onSave,
            });

            // Act
            renderHook(() => useAutoSave(options));
            vi.advanceTimersByTime(5000);

            // Assert
            expect(onSave).not.toHaveBeenCalled();
        });
    });

    describe('Change Detection', () => {
        it('should not trigger save when data equals originalData', () => {
            // Arrange
            const onSave = vi.fn().mockResolvedValue(undefined);
            const sameData = { value: 'same' };
            const options = createOptions({
                data: sameData,
                originalData: sameData,
                onSave,
            });

            // Act
            const { rerender } = renderHook(
                (props) => useAutoSave(props),
                { initialProps: options }
            );
            rerender({ ...options, data: { value: 'same' } });
            vi.advanceTimersByTime(5000);

            // Assert
            expect(onSave).not.toHaveBeenCalled();
        });

        it('should trigger save when data differs from originalData', async () => {
            // Arrange
            const onSave = vi.fn().mockResolvedValue(undefined);
            const options = createOptions({
                data: { value: 'original' },
                originalData: { value: 'original' },
                onSave,
            });

            // Act
            const { rerender } = renderHook(
                (props) => useAutoSave(props),
                { initialProps: options }
            );
            rerender({ ...options, data: { value: 'changed' } });

            await act(async () => {
                vi.advanceTimersByTime(3000);
            });

            // Assert
            expect(onSave).toHaveBeenCalledWith({ value: 'changed' });
        });
    });

    describe('Debounce Behavior', () => {
        it('should wait for delay before saving (default 3000ms)', async () => {
            // Arrange
            const onSave = vi.fn().mockResolvedValue(undefined);
            const options = createOptions({
                data: { value: 'original' },
                originalData: { value: 'original' },
                onSave,
            });

            // Act
            const { rerender } = renderHook(
                (props) => useAutoSave(props),
                { initialProps: options }
            );
            rerender({ ...options, data: { value: 'changed' } });

            // Assert - not called before delay
            await act(async () => {
                vi.advanceTimersByTime(2999);
            });
            expect(onSave).not.toHaveBeenCalled();

            // Assert - called after delay
            await act(async () => {
                vi.advanceTimersByTime(1);
            });
            expect(onSave).toHaveBeenCalledTimes(1);
        });

        it('should use custom delay when provided', async () => {
            // Arrange
            const onSave = vi.fn().mockResolvedValue(undefined);
            const customDelay = 1000;
            const options = createOptions({
                data: { value: 'original' },
                originalData: { value: 'original' },
                onSave,
                delay: customDelay,
            });

            // Act
            const { rerender } = renderHook(
                (props) => useAutoSave(props),
                { initialProps: options }
            );
            rerender({ ...options, data: { value: 'changed' } });

            // Assert - not called before custom delay
            await act(async () => {
                vi.advanceTimersByTime(999);
            });
            expect(onSave).not.toHaveBeenCalled();

            // Assert - called after custom delay
            await act(async () => {
                vi.advanceTimersByTime(1);
            });
            expect(onSave).toHaveBeenCalledTimes(1);
        });

        it('should cancel pending save on unmount', async () => {
            // Arrange
            const onSave = vi.fn().mockResolvedValue(undefined);
            const options = createOptions({
                data: { value: 'original' },
                originalData: { value: 'original' },
                onSave,
            });

            // Act
            const { rerender, unmount } = renderHook(
                (props) => useAutoSave(props),
                { initialProps: options }
            );
            rerender({ ...options, data: { value: 'changed' } });

            await act(async () => {
                vi.advanceTimersByTime(1000);
            });
            unmount();

            await act(async () => {
                vi.advanceTimersByTime(5000);
            });

            // Assert
            expect(onSave).not.toHaveBeenCalled();
        });

        it('should cancel previous timer on rapid data changes', async () => {
            // Arrange
            const onSave = vi.fn().mockResolvedValue(undefined);
            const options = createOptions({
                data: { value: 'original' },
                originalData: { value: 'original' },
                onSave,
            });

            // Act
            const { rerender } = renderHook(
                (props) => useAutoSave(props),
                { initialProps: options }
            );

            // First change
            rerender({ ...options, data: { value: 'change1' } });
            await act(async () => {
                vi.advanceTimersByTime(1000);
            });

            // Second change before first save
            rerender({ ...options, data: { value: 'change2' } });
            await act(async () => {
                vi.advanceTimersByTime(1000);
            });

            // Third change before second save
            rerender({ ...options, data: { value: 'change3' } });
            await act(async () => {
                vi.advanceTimersByTime(3000);
            });

            // Assert - only the final value should be saved
            expect(onSave).toHaveBeenCalledTimes(1);
            expect(onSave).toHaveBeenCalledWith({ value: 'change3' });
        });
    });

    describe('Save Flow', () => {
        it('should set status to saving when save starts', async () => {
            // Arrange
            let resolvePromise: () => void;
            const savePromise = new Promise<void>((resolve) => {
                resolvePromise = resolve;
            });
            const onSave = vi.fn().mockReturnValue(savePromise);
            const options = createOptions({
                data: { value: 'original' },
                originalData: { value: 'original' },
                onSave,
            });

            // Act
            const { result, rerender } = renderHook(
                (props) => useAutoSave(props),
                { initialProps: options }
            );
            rerender({ ...options, data: { value: 'changed' } });

            await act(async () => {
                vi.advanceTimersByTime(3000);
            });

            // Assert
            expect(result.current).toBe('saving');

            // Cleanup
            await act(async () => {
                resolvePromise!();
            });
        });

        it('should set status to saved on success', async () => {
            // Arrange
            let resolvePromise: () => void;
            const savePromise = new Promise<void>((resolve) => {
                resolvePromise = resolve;
            });
            const onSave = vi.fn().mockReturnValue(savePromise);
            const options = createOptions({
                data: { value: 'original' },
                originalData: { value: 'original' },
                onSave,
            });

            // Act
            const { result, rerender } = renderHook(
                (props) => useAutoSave(props),
                { initialProps: options }
            );
            rerender({ ...options, data: { value: 'changed' } });

            // Advance timer to trigger save
            await act(async () => {
                vi.advanceTimersByTime(3000);
            });

            expect(result.current).toBe('saving');

            // Resolve the save promise
            await act(async () => {
                resolvePromise!();
            });

            // Assert - should be saved (before the 2s idle timer fires)
            expect(result.current).toBe('saved');
        });

        it('should return to idle after 2 seconds of saved', async () => {
            // Arrange
            let resolvePromise: () => void;
            const savePromise = new Promise<void>((resolve) => {
                resolvePromise = resolve;
            });
            const onSave = vi.fn().mockReturnValue(savePromise);
            const options = createOptions({
                data: { value: 'original' },
                originalData: { value: 'original' },
                onSave,
            });

            // Act
            const { result, rerender } = renderHook(
                (props) => useAutoSave(props),
                { initialProps: options }
            );
            rerender({ ...options, data: { value: 'changed' } });

            // Advance timer to trigger save
            await act(async () => {
                vi.advanceTimersByTime(3000);
            });

            // Resolve the save promise
            await act(async () => {
                resolvePromise!();
            });

            expect(result.current).toBe('saved');

            // Advance timer for saved->idle transition (2 seconds)
            await act(async () => {
                vi.advanceTimersByTime(2000);
            });

            // Assert
            expect(result.current).toBe('idle');
        });

        it('should call onSave with current data', async () => {
            // Arrange
            const onSave = vi.fn().mockResolvedValue(undefined);
            const changedData = { value: 'changed', nested: { prop: 123 } };
            const options = createOptions({
                data: { value: 'original', nested: { prop: 0 } },
                originalData: { value: 'original', nested: { prop: 0 } },
                onSave,
            });

            // Act
            const { rerender } = renderHook(
                (props) => useAutoSave(props),
                { initialProps: options }
            );
            rerender({ ...options, data: changedData });

            await act(async () => {
                vi.advanceTimersByTime(3000);
            });

            // Assert
            expect(onSave).toHaveBeenCalledWith(changedData);
        });
    });

    describe('Error Handling', () => {
        it('should set status to error when onSave fails', async () => {
            // Arrange
            const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            const error = new Error('Save failed');
            const onSave = vi.fn().mockRejectedValue(error);
            const options = createOptions({
                data: { value: 'original' },
                originalData: { value: 'original' },
                onSave,
            });

            // Act
            const { result, rerender } = renderHook(
                (props) => useAutoSave(props),
                { initialProps: options }
            );
            rerender({ ...options, data: { value: 'changed' } });

            // Advance timer and flush all promises including rejected ones
            await act(async () => {
                vi.advanceTimersByTime(3000);
                await vi.runAllTimersAsync();
            });

            // Assert
            expect(result.current).toBe('error');

            // Cleanup
            consoleErrorSpy.mockRestore();
        });

        it('should log error to console', async () => {
            // Arrange
            const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            const error = new Error('Save failed');
            const onSave = vi.fn().mockRejectedValue(error);
            const options = createOptions({
                data: { value: 'original' },
                originalData: { value: 'original' },
                onSave,
            });

            // Act
            const { rerender } = renderHook(
                (props) => useAutoSave(props),
                { initialProps: options }
            );
            rerender({ ...options, data: { value: 'changed' } });

            // Advance timer and flush all promises including rejected ones
            await act(async () => {
                vi.advanceTimersByTime(3000);
                await vi.runAllTimersAsync();
            });

            // Assert
            expect(consoleErrorSpy).toHaveBeenCalledWith('Auto-save failed:', error);

            // Cleanup
            consoleErrorSpy.mockRestore();
        });
    });

    describe('Enabled Flag', () => {
        it('should not save when enabled is false', async () => {
            // Arrange
            const onSave = vi.fn().mockResolvedValue(undefined);
            const options = createOptions({
                data: { value: 'original' },
                originalData: { value: 'original' },
                onSave,
                enabled: false,
            });

            // Act
            const { rerender } = renderHook(
                (props) => useAutoSave(props),
                { initialProps: options }
            );
            rerender({ ...options, data: { value: 'changed' } });

            await act(async () => {
                vi.advanceTimersByTime(5000);
            });

            // Assert
            expect(onSave).not.toHaveBeenCalled();
        });

        it('should save when enabled is true (default)', async () => {
            // Arrange
            const onSave = vi.fn().mockResolvedValue(undefined);
            const options = createOptions({
                data: { value: 'original' },
                originalData: { value: 'original' },
                onSave,
                // enabled defaults to true
            });

            // Act
            const { rerender } = renderHook(
                (props) => useAutoSave(props),
                { initialProps: options }
            );
            rerender({ ...options, data: { value: 'changed' } });

            await act(async () => {
                vi.advanceTimersByTime(3000);
            });

            // Assert
            expect(onSave).toHaveBeenCalledTimes(1);
        });

        it('should respect enabled flag changes', async () => {
            // Arrange
            const onSave = vi.fn().mockResolvedValue(undefined);
            const options = createOptions({
                data: { value: 'original' },
                originalData: { value: 'original' },
                onSave,
                enabled: false,
            });

            // Act
            const { rerender } = renderHook(
                (props) => useAutoSave(props),
                { initialProps: options }
            );

            // Change data while disabled
            rerender({ ...options, data: { value: 'changed' }, enabled: false });
            await act(async () => {
                vi.advanceTimersByTime(5000);
            });
            expect(onSave).not.toHaveBeenCalled();

            // Enable auto-save
            rerender({ ...options, data: { value: 'changed' }, enabled: true });
            await act(async () => {
                vi.advanceTimersByTime(3000);
            });

            // Assert
            expect(onSave).toHaveBeenCalledWith({ value: 'changed' });
        });
    });

    describe('Edge Cases', () => {
        it('should handle complex nested objects comparison', async () => {
            // Arrange
            const onSave = vi.fn().mockResolvedValue(undefined);
            const complexData = {
                level1: {
                    level2: {
                        value: 'nested',
                        array: [1, 2, 3],
                    },
                },
            };
            const options = createOptions({
                data: complexData,
                originalData: complexData,
                onSave,
            });

            // Act
            const { rerender } = renderHook(
                (props) => useAutoSave(props),
                { initialProps: options }
            );

            // Same structure, different reference
            rerender({
                ...options,
                data: {
                    level1: {
                        level2: {
                            value: 'nested',
                            array: [1, 2, 3],
                        },
                    },
                },
            });

            await act(async () => {
                vi.advanceTimersByTime(5000);
            });

            // Assert - should not save because JSON.stringify values are equal
            expect(onSave).not.toHaveBeenCalled();
        });

        it('should detect changes in nested array values', async () => {
            // Arrange
            const onSave = vi.fn().mockResolvedValue(undefined);
            const options = createOptions({
                data: { items: [1, 2, 3] },
                originalData: { items: [1, 2, 3] },
                onSave,
            });

            // Act
            const { rerender } = renderHook(
                (props) => useAutoSave(props),
                { initialProps: options }
            );
            rerender({ ...options, data: { items: [1, 2, 4] } });

            await act(async () => {
                vi.advanceTimersByTime(3000);
            });

            // Assert
            expect(onSave).toHaveBeenCalledWith({ items: [1, 2, 4] });
        });

        it('should handle null and undefined values', async () => {
            // Arrange
            const onSave = vi.fn().mockResolvedValue(undefined);
            const options = createOptions({
                data: { value: null as string | null },
                originalData: { value: null as string | null },
                onSave,
            });

            // Act
            const { rerender } = renderHook(
                (props) => useAutoSave(props),
                { initialProps: options }
            );
            rerender({ ...options, data: { value: 'not null' } });

            await act(async () => {
                vi.advanceTimersByTime(3000);
            });

            // Assert
            expect(onSave).toHaveBeenCalledWith({ value: 'not null' });
        });
    });
});
