import { renderHook, act } from '@testing-library/react';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { useDebounce } from './useDebounce';

describe('useDebounce', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('should return initial value immediately', () => {
        const { result } = renderHook(() => useDebounce('initial', 300));

        expect(result.current).toBe('initial');
    });

    it('should debounce value updates', () => {
        const { result, rerender } = renderHook(
            ({ value }) => useDebounce(value, 300),
            { initialProps: { value: 'first' } }
        );

        expect(result.current).toBe('first');

        // Change value
        rerender({ value: 'second' });

        // Value should not change immediately
        expect(result.current).toBe('first');

        // Advance time but not enough
        act(() => {
            vi.advanceTimersByTime(200);
        });
        expect(result.current).toBe('first');

        // Advance past delay
        act(() => {
            vi.advanceTimersByTime(150);
        });
        expect(result.current).toBe('second');
    });

    it('should reset timer on rapid value changes', () => {
        const { result, rerender } = renderHook(
            ({ value }) => useDebounce(value, 300),
            { initialProps: { value: 'a' } }
        );

        rerender({ value: 'b' });
        act(() => {
            vi.advanceTimersByTime(200);
        });

        rerender({ value: 'c' });
        act(() => {
            vi.advanceTimersByTime(200);
        });

        rerender({ value: 'd' });
        act(() => {
            vi.advanceTimersByTime(200);
        });

        // Still at initial value because timer keeps resetting
        expect(result.current).toBe('a');

        // Wait for full delay after last change
        act(() => {
            vi.advanceTimersByTime(150);
        });

        // Now should have latest value
        expect(result.current).toBe('d');
    });

    it('should use default delay of 300ms', () => {
        const { result, rerender } = renderHook(
            ({ value }) => useDebounce(value),
            { initialProps: { value: 'initial' } }
        );

        rerender({ value: 'updated' });

        act(() => {
            vi.advanceTimersByTime(299);
        });
        expect(result.current).toBe('initial');

        act(() => {
            vi.advanceTimersByTime(2);
        });
        expect(result.current).toBe('updated');
    });

    it('should work with custom delay', () => {
        const { result, rerender } = renderHook(
            ({ value }) => useDebounce(value, 500),
            { initialProps: { value: 'initial' } }
        );

        rerender({ value: 'updated' });

        act(() => {
            vi.advanceTimersByTime(400);
        });
        expect(result.current).toBe('initial');

        act(() => {
            vi.advanceTimersByTime(150);
        });
        expect(result.current).toBe('updated');
    });

    it('should work with object values', () => {
        const initialObj = { name: 'test', count: 0 };
        const updatedObj = { name: 'updated', count: 1 };

        const { result, rerender } = renderHook(
            ({ value }) => useDebounce(value, 300),
            { initialProps: { value: initialObj } }
        );

        expect(result.current).toBe(initialObj);

        rerender({ value: updatedObj });

        act(() => {
            vi.advanceTimersByTime(350);
        });

        expect(result.current).toBe(updatedObj);
    });

    it('should work with null values', () => {
        const { result, rerender } = renderHook(
            ({ value }) => useDebounce<string | null>(value, 300),
            { initialProps: { value: 'initial' as string | null } }
        );

        expect(result.current).toBe('initial');

        rerender({ value: null });

        act(() => {
            vi.advanceTimersByTime(350);
        });

        expect(result.current).toBeNull();
    });

    it('should work with number values', () => {
        const { result, rerender } = renderHook(
            ({ value }) => useDebounce(value, 300),
            { initialProps: { value: 0 } }
        );

        expect(result.current).toBe(0);

        rerender({ value: 42 });

        act(() => {
            vi.advanceTimersByTime(350);
        });

        expect(result.current).toBe(42);
    });

    it('should cleanup timeout on unmount', () => {
        const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');

        const { unmount, rerender } = renderHook(
            ({ value }) => useDebounce(value, 300),
            { initialProps: { value: 'initial' } }
        );

        rerender({ value: 'updated' });
        unmount();

        expect(clearTimeoutSpy).toHaveBeenCalled();
    });
});
