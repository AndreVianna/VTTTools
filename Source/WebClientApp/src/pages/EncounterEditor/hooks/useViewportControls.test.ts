/**
 * useViewportControls Hook Unit Tests
 * Tests viewport state management, zoom controls, and session storage persistence
 */

import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useViewportControls } from './useViewportControls';
import type { EncounterCanvasHandle, Viewport } from '@components/encounter';

// Mock canvas handle factory - returns ref with guaranteed non-null current
interface MockCanvasRef {
    current: {
        zoomIn: ReturnType<typeof vi.fn>;
        zoomOut: ReturnType<typeof vi.fn>;
        resetView: ReturnType<typeof vi.fn>;
        setViewport: ReturnType<typeof vi.fn>;
    };
}

const createMockCanvasRef = (): MockCanvasRef => ({
    current: {
        zoomIn: vi.fn(),
        zoomOut: vi.fn(),
        resetView: vi.fn(),
        setViewport: vi.fn(),
    },
});

const defaultViewport: Viewport = { x: 0, y: 0, scale: 1 };

describe('useViewportControls', () => {
    let sessionStorageGetSpy: ReturnType<typeof vi.spyOn>;
    let sessionStorageSetSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        // Clear sessionStorage and set up spies
        sessionStorage.clear();
        sessionStorageGetSpy = vi.spyOn(Storage.prototype, 'getItem');
        sessionStorageSetSpy = vi.spyOn(Storage.prototype, 'setItem');

        // Mock window dimensions
        Object.defineProperty(window, 'innerWidth', { value: 1920, writable: true });
        Object.defineProperty(window, 'innerHeight', { value: 1080, writable: true });
    });

    afterEach(() => {
        sessionStorageGetSpy.mockRestore();
        sessionStorageSetSpy.mockRestore();
    });

    describe('initial state', () => {
        it('should initialize with provided initialViewport', () => {
            // Arrange
            const canvasRef = createMockCanvasRef();
            const initialViewport: Viewport = { x: 100, y: 200, scale: 1.5 };

            // Act
            const { result } = renderHook(() =>
                useViewportControls({
                    initialViewport,
                    canvasRef: canvasRef as React.RefObject<EncounterCanvasHandle>,
                    encounterId: 'test-encounter',
                })
            );

            // Assert
            expect(result.current.viewport).toEqual(initialViewport);
        });

        it('should initialize cursorPosition as undefined', () => {
            // Arrange
            const canvasRef = createMockCanvasRef();

            // Act
            const { result } = renderHook(() =>
                useViewportControls({
                    initialViewport: defaultViewport,
                    canvasRef: canvasRef as React.RefObject<EncounterCanvasHandle>,
                    encounterId: 'test-encounter',
                })
            );

            // Assert
            expect(result.current.cursorPosition).toBeUndefined();
        });

        it('should restore viewport from session storage if available', () => {
            // Arrange
            const canvasRef = createMockCanvasRef();
            const storedViewport: Viewport = { x: 500, y: 600, scale: 2 };
            sessionStorage.setItem('viewport_test-encounter', JSON.stringify(storedViewport));

            // Act
            const { result } = renderHook(() =>
                useViewportControls({
                    initialViewport: defaultViewport,
                    canvasRef: canvasRef as React.RefObject<EncounterCanvasHandle>,
                    encounterId: 'test-encounter',
                })
            );

            // Assert
            expect(result.current.viewport).toEqual(storedViewport);
        });

        it('should use initialViewport when no stored viewport exists', () => {
            // Arrange
            const canvasRef = createMockCanvasRef();
            const initialViewport: Viewport = { x: 50, y: 50, scale: 1 };

            // Act
            const { result } = renderHook(() =>
                useViewportControls({
                    initialViewport,
                    canvasRef: canvasRef as React.RefObject<EncounterCanvasHandle>,
                    encounterId: 'new-encounter',
                })
            );

            // Assert - should use initialViewport, not default
            expect(result.current.viewport).toEqual(initialViewport);
        });
    });

    describe('handleViewportChange', () => {
        it('should update viewport state', () => {
            // Arrange
            const canvasRef = createMockCanvasRef();
            const { result } = renderHook(() =>
                useViewportControls({
                    initialViewport: defaultViewport,
                    canvasRef: canvasRef as React.RefObject<EncounterCanvasHandle>,
                    encounterId: 'test-encounter',
                })
            );
            const newViewport: Viewport = { x: 100, y: 100, scale: 2 };

            // Act
            act(() => {
                result.current.handleViewportChange(newViewport);
            });

            // Assert
            expect(result.current.viewport).toEqual(newViewport);
        });

        it('should persist viewport to session storage', () => {
            // Arrange
            const canvasRef = createMockCanvasRef();
            const { result } = renderHook(() =>
                useViewportControls({
                    initialViewport: defaultViewport,
                    canvasRef: canvasRef as React.RefObject<EncounterCanvasHandle>,
                    encounterId: 'test-encounter',
                })
            );
            const newViewport: Viewport = { x: 150, y: 250, scale: 1.5 };

            // Act
            act(() => {
                result.current.handleViewportChange(newViewport);
            });

            // Assert
            expect(sessionStorageSetSpy).toHaveBeenCalledWith(
                'viewport_test-encounter',
                JSON.stringify(newViewport)
            );
        });

        it('should not persist to session storage when encounterId is undefined', () => {
            // Arrange
            const canvasRef = createMockCanvasRef();
            const { result } = renderHook(() =>
                useViewportControls({
                    initialViewport: defaultViewport,
                    canvasRef: canvasRef as React.RefObject<EncounterCanvasHandle>,
                    encounterId: undefined,
                })
            );
            const newViewport: Viewport = { x: 150, y: 250, scale: 1.5 };

            // Act
            act(() => {
                result.current.handleViewportChange(newViewport);
            });

            // Assert - state updated but not stored
            expect(result.current.viewport).toEqual(newViewport);
            expect(sessionStorageSetSpy).not.toHaveBeenCalled();
        });
    });

    describe('zoom controls', () => {
        it('should call canvasRef.zoomIn when handleZoomIn is called', () => {
            // Arrange
            const canvasRef = createMockCanvasRef();
            const { result } = renderHook(() =>
                useViewportControls({
                    initialViewport: defaultViewport,
                    canvasRef: canvasRef as React.RefObject<EncounterCanvasHandle>,
                    encounterId: 'test-encounter',
                })
            );

            // Act
            act(() => {
                result.current.handleZoomIn();
            });

            // Assert
            expect(canvasRef.current.zoomIn).toHaveBeenCalledTimes(1);
        });

        it('should call canvasRef.zoomOut when handleZoomOut is called', () => {
            // Arrange
            const canvasRef = createMockCanvasRef();
            const { result } = renderHook(() =>
                useViewportControls({
                    initialViewport: defaultViewport,
                    canvasRef: canvasRef as React.RefObject<EncounterCanvasHandle>,
                    encounterId: 'test-encounter',
                })
            );

            // Act
            act(() => {
                result.current.handleZoomOut();
            });

            // Assert
            expect(canvasRef.current.zoomOut).toHaveBeenCalledTimes(1);
        });

        it('should reset viewport to centered position when handleZoomReset is called with stageSize', () => {
            // Arrange
            const canvasRef = createMockCanvasRef();
            const stageSize = { width: 800, height: 600 };
            const { result } = renderHook(() =>
                useViewportControls({
                    initialViewport: { x: 500, y: 400, scale: 2 },
                    canvasRef: canvasRef as React.RefObject<EncounterCanvasHandle>,
                    encounterId: 'test-encounter',
                    stageSize,
                })
            );

            // Act
            act(() => {
                result.current.handleZoomReset();
            });

            // Assert - viewport should be centered with scale 1
            expect(result.current.viewport.scale).toBe(1);
            expect(canvasRef.current.setViewport).toHaveBeenCalledTimes(1);
        });

        it('should call canvasRef.resetView when handleZoomReset is called without valid stageSize', () => {
            // Arrange
            const canvasRef = createMockCanvasRef();
            const { result } = renderHook(() =>
                useViewportControls({
                    initialViewport: defaultViewport,
                    canvasRef: canvasRef as React.RefObject<EncounterCanvasHandle>,
                    encounterId: 'test-encounter',
                    stageSize: undefined,
                })
            );

            // Act
            act(() => {
                result.current.handleZoomReset();
            });

            // Assert
            expect(canvasRef.current.resetView).toHaveBeenCalledTimes(1);
        });
    });

    describe('cursor position tracking', () => {
        it('should calculate canvas-relative position from mouse event', () => {
            // Arrange
            const canvasRef = createMockCanvasRef();
            const initialViewport: Viewport = { x: 100, y: 50, scale: 1 };
            const { result } = renderHook(() =>
                useViewportControls({
                    initialViewport,
                    canvasRef: canvasRef as React.RefObject<EncounterCanvasHandle>,
                    encounterId: 'test-encounter',
                })
            );

            // Create mock mouse event
            const mockEvent = {
                clientX: 300,
                clientY: 200,
            } as React.MouseEvent<HTMLDivElement>;

            // Act
            act(() => {
                result.current.handleCanvasMouseMove(mockEvent);
            });

            // Assert - position calculated as (clientX - viewport.x) / scale
            // (300 - 100) / 1 = 200, (200 - 50) / 1 = 150
            expect(result.current.cursorPosition).toEqual({ x: 200, y: 150 });
        });

        it('should account for scale when calculating cursor position', () => {
            // Arrange
            const canvasRef = createMockCanvasRef();
            const initialViewport: Viewport = { x: 0, y: 0, scale: 2 };
            const { result } = renderHook(() =>
                useViewportControls({
                    initialViewport,
                    canvasRef: canvasRef as React.RefObject<EncounterCanvasHandle>,
                    encounterId: 'test-encounter',
                })
            );

            // Create mock mouse event
            const mockEvent = {
                clientX: 400,
                clientY: 200,
            } as React.MouseEvent<HTMLDivElement>;

            // Act
            act(() => {
                result.current.handleCanvasMouseMove(mockEvent);
            });

            // Assert - position calculated with scale 2
            // (400 - 0) / 2 = 200, (200 - 0) / 2 = 100
            expect(result.current.cursorPosition).toEqual({ x: 200, y: 100 });
        });
    });

    describe('session storage error handling', () => {
        it('should handle session storage getItem errors gracefully', () => {
            // Arrange
            sessionStorageGetSpy.mockImplementation(() => {
                throw new Error('Storage quota exceeded');
            });
            const canvasRef = createMockCanvasRef();
            const initialViewport: Viewport = { x: 10, y: 20, scale: 1 };

            // Act - should not throw
            const { result } = renderHook(() =>
                useViewportControls({
                    initialViewport,
                    canvasRef: canvasRef as React.RefObject<EncounterCanvasHandle>,
                    encounterId: 'test-encounter',
                })
            );

            // Assert - falls back to initialViewport
            expect(result.current.viewport).toEqual(initialViewport);
        });

        it('should handle session storage setItem errors gracefully', () => {
            // Arrange
            sessionStorageSetSpy.mockImplementation(() => {
                throw new Error('Storage quota exceeded');
            });
            const canvasRef = createMockCanvasRef();
            const { result } = renderHook(() =>
                useViewportControls({
                    initialViewport: defaultViewport,
                    canvasRef: canvasRef as React.RefObject<EncounterCanvasHandle>,
                    encounterId: 'test-encounter',
                })
            );

            // Act - should not throw
            act(() => {
                result.current.handleViewportChange({ x: 100, y: 100, scale: 1 });
            });

            // Assert - state still updated even if storage fails
            expect(result.current.viewport).toEqual({ x: 100, y: 100, scale: 1 });
        });
    });

    describe('callback stability', () => {
        it('should return stable handleViewportChange reference', () => {
            // Arrange
            const canvasRef = createMockCanvasRef();
            const { result, rerender } = renderHook(() =>
                useViewportControls({
                    initialViewport: defaultViewport,
                    canvasRef: canvasRef as React.RefObject<EncounterCanvasHandle>,
                    encounterId: 'test-encounter',
                })
            );

            const firstRef = result.current.handleViewportChange;

            // Act
            rerender();

            // Assert
            expect(result.current.handleViewportChange).toBe(firstRef);
        });

        it('should return stable handleZoomReset reference when dependencies unchanged', () => {
            // Arrange
            const canvasRef = createMockCanvasRef();
            const stageSize = { width: 800, height: 600 };
            const { result, rerender } = renderHook(() =>
                useViewportControls({
                    initialViewport: defaultViewport,
                    canvasRef: canvasRef as React.RefObject<EncounterCanvasHandle>,
                    encounterId: 'test-encounter',
                    stageSize,
                })
            );

            const firstRef = result.current.handleZoomReset;

            // Act
            rerender();

            // Assert
            expect(result.current.handleZoomReset).toBe(firstRef);
        });
    });

    describe('background centering', () => {
        it('should auto-center viewport when backgroundSize is provided', async () => {
            // Arrange
            vi.useFakeTimers();
            const canvasRef = createMockCanvasRef();
            const backgroundSize = { width: 800, height: 600 };

            // Act
            const { result } = renderHook(() =>
                useViewportControls({
                    initialViewport: defaultViewport,
                    canvasRef: canvasRef as React.RefObject<EncounterCanvasHandle>,
                    encounterId: 'center-test',
                    backgroundSize,
                })
            );

            // Run requestAnimationFrame callbacks
            vi.runAllTimers();
            vi.useRealTimers();

            // Assert - viewport should be centered based on backgroundSize
            // Formula: x = offsetLeft + (canvasWidth - bgWidth) / 2
            // With 1920 width, LEFT_TOOLBAR_WIDTH=32, bg=800: 32 + (1888 - 800) / 2 = 32 + 544 = 576
            expect(result.current.viewport.x).toBe(576);
            // With 1080 height, HEADER+TOOLBAR=64, bg=600: 64 + (1016 - 600) / 2 = 64 + 208 = 272
            expect(result.current.viewport.y).toBe(272);
            // Verify canvas setViewport was called via RAF
            expect(canvasRef.current.setViewport).toHaveBeenCalled();
        });

        it('should not auto-center when viewport is restored from session', () => {
            // Arrange - Store a viewport before rendering
            const canvasRef = createMockCanvasRef();
            const storedViewport: Viewport = { x: 100, y: 200, scale: 1.5 };
            sessionStorage.setItem('viewport_session-restore-test', JSON.stringify(storedViewport));
            const backgroundSize = { width: 800, height: 600 };

            // Act
            const { result } = renderHook(() =>
                useViewportControls({
                    initialViewport: defaultViewport,
                    canvasRef: canvasRef as React.RefObject<EncounterCanvasHandle>,
                    encounterId: 'session-restore-test',
                    backgroundSize,
                })
            );

            // Assert - should use stored viewport, not center
            expect(result.current.viewport).toEqual(storedViewport);
        });

        it('should not auto-center when backgroundSize is zero', () => {
            // Arrange
            const canvasRef = createMockCanvasRef();
            const backgroundSize = { width: 0, height: 0 };
            const initialViewport: Viewport = { x: 50, y: 60, scale: 1 };

            // Act
            const { result } = renderHook(() =>
                useViewportControls({
                    initialViewport,
                    canvasRef: canvasRef as React.RefObject<EncounterCanvasHandle>,
                    encounterId: 'zero-size-test',
                    backgroundSize,
                })
            );

            // Assert - should use initial viewport when backgroundSize is invalid
            expect(result.current.viewport).toEqual(initialViewport);
        });

        it('should not auto-center when backgroundSize is undefined', () => {
            // Arrange
            const canvasRef = createMockCanvasRef();
            const initialViewport: Viewport = { x: 75, y: 85, scale: 1 };

            // Act
            const { result } = renderHook(() =>
                useViewportControls({
                    initialViewport,
                    canvasRef: canvasRef as React.RefObject<EncounterCanvasHandle>,
                    encounterId: 'undefined-bg-test',
                    backgroundSize: undefined,
                })
            );

            // Assert - should use initial viewport
            expect(result.current.viewport).toEqual(initialViewport);
        });
    });
});
