/**
 * useKeyboardState Hook Unit Tests
 * Tests keyboard modifier state tracking and snap mode resolution
 */

import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useKeyboardState } from './useKeyboardState';
import { GridType, type GridConfig } from '@/utils/gridCalculator';
import { SnapMode } from '@/utils/snapping';

// Mock grid configuration factory
const createMockGridConfig = (overrides: Partial<GridConfig> = {}): GridConfig => ({
    type: GridType.Square,
    cellSize: { width: 50, height: 50 },
    offset: { left: 0, top: 0 },
    snap: true,
    scale: 1,
    ...overrides,
});

describe('useKeyboardState', () => {
    let addEventListenerSpy: ReturnType<typeof vi.spyOn>;
    let removeEventListenerSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        addEventListenerSpy = vi.spyOn(window, 'addEventListener');
        removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
    });

    afterEach(() => {
        addEventListenerSpy.mockRestore();
        removeEventListenerSpy.mockRestore();
    });

    describe('initial state', () => {
        it('should initialize with all modifiers set to false', () => {
            // Arrange & Act
            const { result } = renderHook(() =>
                useKeyboardState({ gridConfig: createMockGridConfig() })
            );

            // Assert
            expect(result.current.isAltPressed).toBe(false);
            expect(result.current.isCtrlPressed).toBe(false);
            expect(result.current.isShiftPressed).toBe(false);
        });

        it('should return modifiers object with altKey and ctrlKey', () => {
            // Arrange & Act
            const { result } = renderHook(() =>
                useKeyboardState({ gridConfig: createMockGridConfig() })
            );

            // Assert
            expect(result.current.modifiers).toEqual({
                altKey: false,
                ctrlKey: false,
            });
        });

        it('should register keyboard event listeners on mount', () => {
            // Arrange & Act
            renderHook(() =>
                useKeyboardState({ gridConfig: createMockGridConfig() })
            );

            // Assert
            expect(addEventListenerSpy).toHaveBeenCalledWith(
                'keydown',
                expect.any(Function),
                { capture: true }
            );
            expect(addEventListenerSpy).toHaveBeenCalledWith(
                'keyup',
                expect.any(Function),
                { capture: true }
            );
            expect(addEventListenerSpy).toHaveBeenCalledWith(
                'blur',
                expect.any(Function)
            );
        });
    });

    describe('modifier key tracking', () => {
        it('should track Alt key press and release', () => {
            // Arrange
            const { result } = renderHook(() =>
                useKeyboardState({ gridConfig: createMockGridConfig() })
            );

            // Act - Press Alt
            act(() => {
                window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Alt' }));
            });

            // Assert - Alt is pressed
            expect(result.current.isAltPressed).toBe(true);
            expect(result.current.modifiers.altKey).toBe(true);

            // Act - Release Alt
            act(() => {
                window.dispatchEvent(new KeyboardEvent('keyup', { key: 'Alt' }));
            });

            // Assert - Alt is released
            expect(result.current.isAltPressed).toBe(false);
            expect(result.current.modifiers.altKey).toBe(false);
        });

        it('should track Control key press and release', () => {
            // Arrange
            const { result } = renderHook(() =>
                useKeyboardState({ gridConfig: createMockGridConfig() })
            );

            // Act - Press Control
            act(() => {
                window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Control' }));
            });

            // Assert - Ctrl is pressed
            expect(result.current.isCtrlPressed).toBe(true);
            expect(result.current.modifiers.ctrlKey).toBe(true);

            // Act - Release Control
            act(() => {
                window.dispatchEvent(new KeyboardEvent('keyup', { key: 'Control' }));
            });

            // Assert - Ctrl is released
            expect(result.current.isCtrlPressed).toBe(false);
            expect(result.current.modifiers.ctrlKey).toBe(false);
        });

        it('should track Shift key press and release', () => {
            // Arrange
            const { result } = renderHook(() =>
                useKeyboardState({ gridConfig: createMockGridConfig() })
            );

            // Act - Press Shift
            act(() => {
                window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Shift' }));
            });

            // Assert - Shift is pressed
            expect(result.current.isShiftPressed).toBe(true);

            // Act - Release Shift
            act(() => {
                window.dispatchEvent(new KeyboardEvent('keyup', { key: 'Shift' }));
            });

            // Assert - Shift is released
            expect(result.current.isShiftPressed).toBe(false);
        });

        it('should track multiple modifiers simultaneously', () => {
            // Arrange
            const { result } = renderHook(() =>
                useKeyboardState({ gridConfig: createMockGridConfig() })
            );

            // Act - Press Ctrl + Alt
            act(() => {
                window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Control' }));
                window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Alt' }));
            });

            // Assert - Both are pressed
            expect(result.current.isCtrlPressed).toBe(true);
            expect(result.current.isAltPressed).toBe(true);

            // Act - Release only Ctrl
            act(() => {
                window.dispatchEvent(new KeyboardEvent('keyup', { key: 'Control' }));
            });

            // Assert - Only Alt remains pressed
            expect(result.current.isCtrlPressed).toBe(false);
            expect(result.current.isAltPressed).toBe(true);
        });

        it('should reset all modifiers on window blur', () => {
            // Arrange
            const { result } = renderHook(() =>
                useKeyboardState({ gridConfig: createMockGridConfig() })
            );

            // Set modifiers
            act(() => {
                window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Control' }));
                window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Alt' }));
                window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Shift' }));
            });

            // Verify they're set
            expect(result.current.isCtrlPressed).toBe(true);
            expect(result.current.isAltPressed).toBe(true);
            expect(result.current.isShiftPressed).toBe(true);

            // Act - Blur window
            act(() => {
                window.dispatchEvent(new Event('blur'));
            });

            // Assert - All reset
            expect(result.current.isCtrlPressed).toBe(false);
            expect(result.current.isAltPressed).toBe(false);
            expect(result.current.isShiftPressed).toBe(false);
        });
    });

    describe('snap mode resolution', () => {
        it('should return Free snap mode when grid snap is enabled but no modifiers pressed', () => {
            // Arrange & Act
            const { result } = renderHook(() =>
                useKeyboardState({ gridConfig: createMockGridConfig({ snap: true }) })
            );

            // Assert - Default is Free (no snap) when no modifiers are pressed
            // Snap is only active when Ctrl or Alt is pressed
            expect(result.current.assetSnapMode).toBe(SnapMode.Free);
            expect(result.current.wallSnapMode).toBe(SnapMode.Free);
        });

        it('should return Free snap mode when grid snap is disabled', () => {
            // Arrange & Act
            const { result } = renderHook(() =>
                useKeyboardState({ gridConfig: createMockGridConfig({ snap: false }) })
            );

            // Assert - Free when snap disabled
            expect(result.current.assetSnapMode).toBe(SnapMode.Free);
            expect(result.current.wallSnapMode).toBe(SnapMode.Free);
        });

        it('should enable Full snap mode for assets when Ctrl is pressed', () => {
            // Arrange
            const { result } = renderHook(() =>
                useKeyboardState({ gridConfig: createMockGridConfig({ snap: true }) })
            );

            // Initial state - Free
            expect(result.current.assetSnapMode).toBe(SnapMode.Free);

            // Act - Press Ctrl
            act(() => {
                window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Control' }));
            });

            // Assert - Asset snap mode is Full when Ctrl pressed
            expect(result.current.assetSnapMode).toBe(SnapMode.Full);
        });

        it('should enable Half snap mode for assets when Alt is pressed', () => {
            // Arrange
            const { result } = renderHook(() =>
                useKeyboardState({ gridConfig: createMockGridConfig({ snap: true }) })
            );

            // Act - Press Alt
            act(() => {
                window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Alt' }));
            });

            // Assert - Asset snap mode is Half when Alt pressed
            expect(result.current.assetSnapMode).toBe(SnapMode.Half);
        });

        it('should enable Half snap mode for walls when Ctrl is pressed', () => {
            // Arrange
            const { result } = renderHook(() =>
                useKeyboardState({ gridConfig: createMockGridConfig({ snap: true }) })
            );

            // Act - Press Ctrl
            act(() => {
                window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Control' }));
            });

            // Assert - Wall snap mode is Half when Ctrl pressed
            expect(result.current.wallSnapMode).toBe(SnapMode.Half);
        });

        it('should enable Quarter snap mode for walls when Alt is pressed', () => {
            // Arrange
            const { result } = renderHook(() =>
                useKeyboardState({ gridConfig: createMockGridConfig({ snap: true }) })
            );

            // Act - Press Alt
            act(() => {
                window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Alt' }));
            });

            // Assert - Wall snap mode is Quarter when Alt pressed
            expect(result.current.wallSnapMode).toBe(SnapMode.Quarter);
        });
    });

    describe('callback handlers', () => {
        it('should call onEscapeKey when Escape is pressed', () => {
            // Arrange
            const onEscapeKey = vi.fn();
            renderHook(() =>
                useKeyboardState({
                    gridConfig: createMockGridConfig(),
                    onEscapeKey,
                })
            );

            // Act
            act(() => {
                window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
            });

            // Assert
            expect(onEscapeKey).toHaveBeenCalledTimes(1);
        });

        it('should call onEnterKey when Enter is pressed', () => {
            // Arrange
            const onEnterKey = vi.fn();
            renderHook(() =>
                useKeyboardState({
                    gridConfig: createMockGridConfig(),
                    onEnterKey,
                })
            );

            // Act
            act(() => {
                window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
            });

            // Assert
            expect(onEnterKey).toHaveBeenCalledTimes(1);
        });

        it('should not call callbacks when target is input element', () => {
            // Arrange
            const onEscapeKey = vi.fn();
            const onEnterKey = vi.fn();
            renderHook(() =>
                useKeyboardState({
                    gridConfig: createMockGridConfig(),
                    onEscapeKey,
                    onEnterKey,
                })
            );

            // Act - Simulate keydown on input element
            const inputElement = document.createElement('input');
            document.body.appendChild(inputElement);
            act(() => {
                const event = new KeyboardEvent('keydown', { key: 'Escape' });
                Object.defineProperty(event, 'target', { value: inputElement });
                window.dispatchEvent(event);
            });

            // Assert - Callback not called when target is input
            expect(onEscapeKey).not.toHaveBeenCalled();

            // Cleanup
            document.body.removeChild(inputElement);
        });

        it('should not call callbacks when target is textarea element', () => {
            // Arrange
            const onEnterKey = vi.fn();
            renderHook(() =>
                useKeyboardState({
                    gridConfig: createMockGridConfig(),
                    onEnterKey,
                })
            );

            // Act - Simulate keydown on textarea element
            const textareaElement = document.createElement('textarea');
            document.body.appendChild(textareaElement);
            act(() => {
                const event = new KeyboardEvent('keydown', { key: 'Enter' });
                Object.defineProperty(event, 'target', { value: textareaElement });
                window.dispatchEvent(event);
            });

            // Assert - Callback not called when target is textarea
            expect(onEnterKey).not.toHaveBeenCalled();

            // Cleanup
            document.body.removeChild(textareaElement);
        });
    });

    describe('cleanup', () => {
        it('should remove event listeners on unmount', () => {
            // Arrange & Act
            const { unmount } = renderHook(() =>
                useKeyboardState({ gridConfig: createMockGridConfig() })
            );

            // Unmount
            unmount();

            // Assert
            expect(removeEventListenerSpy).toHaveBeenCalledWith(
                'keydown',
                expect.any(Function),
                { capture: true }
            );
            expect(removeEventListenerSpy).toHaveBeenCalledWith(
                'keyup',
                expect.any(Function),
                { capture: true }
            );
            expect(removeEventListenerSpy).toHaveBeenCalledWith(
                'blur',
                expect.any(Function)
            );
        });
    });

    describe('callback stability', () => {
        it('should update handlers when callbacks change', () => {
            // Arrange
            const onEscapeKey1 = vi.fn();
            const onEscapeKey2 = vi.fn();

            const { rerender } = renderHook(
                ({ onEscapeKey }) =>
                    useKeyboardState({
                        gridConfig: createMockGridConfig(),
                        onEscapeKey,
                    }),
                { initialProps: { onEscapeKey: onEscapeKey1 } }
            );

            // Update callback
            rerender({ onEscapeKey: onEscapeKey2 });

            // Act
            act(() => {
                window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
            });

            // Assert - New callback is called
            expect(onEscapeKey1).not.toHaveBeenCalled();
            expect(onEscapeKey2).toHaveBeenCalledTimes(1);
        });
    });

    describe('gridConfig changes', () => {
        it('should update snap modes when gridConfig.snap changes', () => {
            // Arrange - Start with snap enabled
            const { result, rerender } = renderHook(
                ({ gridConfig }) => useKeyboardState({ gridConfig }),
                { initialProps: { gridConfig: createMockGridConfig({ snap: true }) } }
            );

            // Press Ctrl to enable snapping
            act(() => {
                window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Control' }));
            });

            // Assert - Snap mode is Full when Ctrl pressed with snap enabled
            expect(result.current.assetSnapMode).toBe(SnapMode.Full);

            // Act - Disable grid snap
            rerender({ gridConfig: createMockGridConfig({ snap: false }) });

            // Assert - Snap mode becomes Free when grid snap is disabled
            expect(result.current.assetSnapMode).toBe(SnapMode.Free);
            expect(result.current.wallSnapMode).toBe(SnapMode.Free);
        });

        it('should reflect new grid type when gridConfig changes', () => {
            // Arrange
            const { result, rerender } = renderHook(
                ({ gridConfig }) => useKeyboardState({ gridConfig }),
                { initialProps: { gridConfig: createMockGridConfig({ type: GridType.Square }) } }
            );

            // Initial state
            expect(result.current.assetSnapMode).toBe(SnapMode.Free);

            // Act - Change grid type (snap modes should still work)
            rerender({ gridConfig: createMockGridConfig({ type: GridType.HexH, snap: true }) });

            // Press Ctrl
            act(() => {
                window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Control' }));
            });

            // Assert - Snap mode works with new config
            expect(result.current.assetSnapMode).toBe(SnapMode.Full);
        });
    });
});
