import { renderHook, act } from '@testing-library/react';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { UnitSystem } from '@/types/units';
import { useUnitSystem } from './useUnitSystem';

const STORAGE_KEY = 'vtttools.unitSystem';

describe('useUnitSystem', () => {
    const originalLocalStorage = window.localStorage;
    let mockStorage: Record<string, string>;

    beforeEach(() => {
        mockStorage = {};

        Object.defineProperty(window, 'localStorage', {
            value: {
                getItem: vi.fn((key: string) => mockStorage[key] ?? null),
                setItem: vi.fn((key: string, value: string) => {
                    mockStorage[key] = value;
                }),
                removeItem: vi.fn((key: string) => {
                    delete mockStorage[key];
                }),
                clear: vi.fn(() => {
                    mockStorage = {};
                }),
                key: vi.fn(),
                length: 0,
            },
            writable: true,
        });
    });

    afterEach(() => {
        Object.defineProperty(window, 'localStorage', {
            value: originalLocalStorage,
            writable: true,
        });
    });

    describe('initial state', () => {
        it('should default to Imperial when localStorage is empty', () => {
            const { result } = renderHook(() => useUnitSystem());

            const [unitSystem] = result.current;
            expect(unitSystem).toBe(UnitSystem.Imperial);
        });

        it('should load Imperial from localStorage', () => {
            mockStorage[STORAGE_KEY] = '0';

            const { result } = renderHook(() => useUnitSystem());

            const [unitSystem] = result.current;
            expect(unitSystem).toBe(UnitSystem.Imperial);
        });

        it('should load Metric from localStorage', () => {
            mockStorage[STORAGE_KEY] = '1';

            const { result } = renderHook(() => useUnitSystem());

            const [unitSystem] = result.current;
            expect(unitSystem).toBe(UnitSystem.Metric);
        });

        it('should default to Imperial for invalid localStorage value', () => {
            mockStorage[STORAGE_KEY] = 'invalid';

            const { result } = renderHook(() => useUnitSystem());

            const [unitSystem] = result.current;
            expect(unitSystem).toBe(UnitSystem.Imperial);
        });

        it('should default to Imperial for out-of-range numeric value', () => {
            mockStorage[STORAGE_KEY] = '99';

            const { result } = renderHook(() => useUnitSystem());

            const [unitSystem] = result.current;
            expect(unitSystem).toBe(UnitSystem.Imperial);
        });
    });

    describe('setUnitSystem', () => {
        it('should update state when setting to Metric', () => {
            const { result } = renderHook(() => useUnitSystem());

            act(() => {
                const [, setUnitSystem] = result.current;
                setUnitSystem(UnitSystem.Metric);
            });

            const [unitSystem] = result.current;
            expect(unitSystem).toBe(UnitSystem.Metric);
        });

        it('should update state when setting to Imperial', () => {
            mockStorage[STORAGE_KEY] = '1';

            const { result } = renderHook(() => useUnitSystem());

            act(() => {
                const [, setUnitSystem] = result.current;
                setUnitSystem(UnitSystem.Imperial);
            });

            const [unitSystem] = result.current;
            expect(unitSystem).toBe(UnitSystem.Imperial);
        });

        it('should persist Metric to localStorage', () => {
            const { result } = renderHook(() => useUnitSystem());

            act(() => {
                const [, setUnitSystem] = result.current;
                setUnitSystem(UnitSystem.Metric);
            });

            expect(localStorage.setItem).toHaveBeenCalledWith(STORAGE_KEY, '1');
            expect(mockStorage[STORAGE_KEY]).toBe('1');
        });

        it('should persist Imperial to localStorage', () => {
            mockStorage[STORAGE_KEY] = '1';

            const { result } = renderHook(() => useUnitSystem());

            act(() => {
                const [, setUnitSystem] = result.current;
                setUnitSystem(UnitSystem.Imperial);
            });

            expect(localStorage.setItem).toHaveBeenCalledWith(STORAGE_KEY, '0');
            expect(mockStorage[STORAGE_KEY]).toBe('0');
        });
    });

    describe('function stability', () => {
        it('should return stable setUnitSystem function', () => {
            const { result, rerender } = renderHook(() => useUnitSystem());

            const [, setUnitSystem1] = result.current;
            rerender();
            const [, setUnitSystem2] = result.current;

            expect(setUnitSystem1).toBe(setUnitSystem2);
        });

        it('should return tuple with correct types', () => {
            const { result } = renderHook(() => useUnitSystem());

            const [unitSystem, setUnitSystem] = result.current;

            expect(typeof unitSystem).toBe('number');
            expect(typeof setUnitSystem).toBe('function');
        });
    });

    describe('multiple hook instances', () => {
        it('should initialize with same value from localStorage', () => {
            mockStorage[STORAGE_KEY] = '1';

            const { result: result1 } = renderHook(() => useUnitSystem());
            const { result: result2 } = renderHook(() => useUnitSystem());

            const [unitSystem1] = result1.current;
            const [unitSystem2] = result2.current;

            expect(unitSystem1).toBe(UnitSystem.Metric);
            expect(unitSystem2).toBe(UnitSystem.Metric);
        });
    });
});
