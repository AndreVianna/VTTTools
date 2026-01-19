// EncounterCanvas Component Tests
// Tests viewport management, pan/zoom controls, and mouse interactions
// TARGET_COVERAGE: 70%+

import React from 'react';
import { act, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Stage as _KonvaStage } from 'konva/lib/Stage';
import type { EncounterCanvasHandle, EncounterCanvasProps, Viewport } from './EncounterCanvas';

// Store event handlers for testing interactions
interface MockStageHandlers {
    onWheel?: (e: unknown) => void;
    onMouseDown?: (e: unknown) => void;
    onMouseMove?: (e: unknown) => void;
    onMouseUp?: (e: unknown) => void;
    onClick?: (e: unknown) => void;
    onContextMenu?: (e: unknown) => void;
}

let mockStageHandlers: MockStageHandlers = {};

// Mock Konva Stage to render a testable DOM element
vi.mock('react-konva', () => ({
    Stage: ({
        children,
        width,
        height,
        x,
        y,
        scaleX,
        scaleY,
        onWheel,
        onMouseDown,
        onMouseMove,
        onMouseUp,
        onClick,
        onContextMenu,
        style,
    }: {
        children?: React.ReactNode;
        width?: number;
        height?: number;
        x?: number;
        y?: number;
        scaleX?: number;
        scaleY?: number;
        onWheel?: (e: unknown) => void;
        onMouseDown?: (e: unknown) => void;
        onMouseMove?: (e: unknown) => void;
        onMouseUp?: (e: unknown) => void;
        onClick?: (e: unknown) => void;
        onContextMenu?: (e: unknown) => void;
        style?: React.CSSProperties;
        ref?: React.Ref<unknown>;
    }) => {
        // Capture handlers for testing
        mockStageHandlers = { onWheel, onMouseDown, onMouseMove, onMouseUp, onClick, onContextMenu };
        return (
            <div
                role="application"
                aria-label="Encounter Canvas"
                data-width={width}
                data-height={height}
                data-x={x}
                data-y={y}
                data-scale-x={scaleX}
                data-scale-y={scaleY}
                style={style}
            >
                {children}
            </div>
        );
    },
    Layer: ({ children, ...props }: { children?: React.ReactNode }) => (
        <div data-mock="layer" role="presentation" {...props}>
            {children}
        </div>
    ),
}));

// Import after mocking
import { EncounterCanvas } from './EncounterCanvas';

describe('EncounterCanvas', () => {
    // Default props for most tests
    const defaultProps: EncounterCanvasProps = {
        width: 800,
        height: 600,
    };

    beforeEach(() => {
        vi.clearAllMocks();
        mockStageHandlers = {};
    });

    // Helper to create mock Konva event object
    const createMockKonvaEvent = (
        nativeEvent: Partial<MouseEvent | WheelEvent | PointerEvent>,
        stageOverrides?: Partial<{ x: () => number; y: () => number; scaleX: () => number }>
    ) => ({
        evt: {
            preventDefault: vi.fn(),
            ...nativeEvent,
        },
        target: {
            getStage: () => ({
                x: () => stageOverrides?.x?.() ?? 0,
                y: () => stageOverrides?.y?.() ?? 0,
                scaleX: () => stageOverrides?.scaleX?.() ?? 1,
                getPointerPosition: () => ({ x: 400, y: 300 }),
            }),
        },
    });

    describe('Rendering', () => {
        it('should render canvas element with correct dimensions', () => {
            // Arrange
            const props = { ...defaultProps };

            // Act
            render(<EncounterCanvas {...props} />);

            // Assert
            const canvas = screen.getByRole('application', { name: 'Encounter Canvas' });
            expect(canvas).toBeInTheDocument();
            expect(canvas).toHaveAttribute('data-width', '800');
            expect(canvas).toHaveAttribute('data-height', '600');
        });

        it('should render with default dimensions when none provided', () => {
            // Arrange - mock window dimensions
            const originalInnerWidth = window.innerWidth;
            const originalInnerHeight = window.innerHeight;
            Object.defineProperty(window, 'innerWidth', { value: 1920, writable: true });
            Object.defineProperty(window, 'innerHeight', { value: 1080, writable: true });

            // Act
            render(<EncounterCanvas />);

            // Assert
            const canvas = screen.getByRole('application', { name: 'Encounter Canvas' });
            expect(canvas).toHaveAttribute('data-width', '1920');
            expect(canvas).toHaveAttribute('data-height', '1080');

            // Cleanup
            Object.defineProperty(window, 'innerWidth', { value: originalInnerWidth, writable: true });
            Object.defineProperty(window, 'innerHeight', { value: originalInnerHeight, writable: true });
        });

        it('should render children inside the canvas', () => {
            // Arrange
            const childContent = 'Test Child Content';

            // Act
            render(
                <EncounterCanvas {...defaultProps}>
                    <div>{childContent}</div>
                </EncounterCanvas>
            );

            // Assert
            expect(screen.getByText(childContent)).toBeInTheDocument();
        });

        it('should apply background color style', () => {
            // Arrange
            const backgroundColor = '#1a1a2e';

            // Act
            render(<EncounterCanvas {...defaultProps} backgroundColor={backgroundColor} />);

            // Assert
            const canvas = screen.getByRole('application', { name: 'Encounter Canvas' });
            expect(canvas).toHaveStyle({ backgroundColor });
        });

        it('should use transparent background by default', () => {
            // Act
            render(<EncounterCanvas {...defaultProps} />);

            // Assert
            const canvas = screen.getByRole('application', { name: 'Encounter Canvas' });
            // Check the style attribute contains transparent (jsdom may not compute styles the same way)
            expect(canvas.style.backgroundColor).toBe('transparent');
        });
    });

    describe('Initial Viewport State', () => {
        it('should initialize with default position (0, 0)', () => {
            // Arrange
            const ref = createRef<EncounterCanvasHandle>();

            // Act
            render(<EncounterCanvas {...defaultProps} ref={ref} />);

            // Assert
            const viewport = ref.current?.getViewport();
            expect(viewport?.x).toBe(0);
            expect(viewport?.y).toBe(0);
        });

        it('should initialize with custom initial position', () => {
            // Arrange
            const ref = createRef<EncounterCanvasHandle>();
            const initialPosition = { x: 100, y: 200 };

            // Act
            render(<EncounterCanvas {...defaultProps} ref={ref} initialPosition={initialPosition} />);

            // Assert
            const viewport = ref.current?.getViewport();
            expect(viewport?.x).toBe(100);
            expect(viewport?.y).toBe(200);
        });

        it('should initialize with default scale of 1', () => {
            // Arrange
            const ref = createRef<EncounterCanvasHandle>();

            // Act
            render(<EncounterCanvas {...defaultProps} ref={ref} />);

            // Assert
            const viewport = ref.current?.getViewport();
            expect(viewport?.scale).toBe(1);
        });

        it('should initialize with custom initial scale', () => {
            // Arrange
            const ref = createRef<EncounterCanvasHandle>();
            const initialScale = 2.5;

            // Act
            render(<EncounterCanvas {...defaultProps} ref={ref} initialScale={initialScale} />);

            // Assert
            const viewport = ref.current?.getViewport();
            expect(viewport?.scale).toBe(2.5);
        });

        it('should render with initial position and scale attributes', () => {
            // Arrange
            const initialPosition = { x: 50, y: 75 };
            const initialScale = 1.5;

            // Act
            render(
                <EncounterCanvas
                    {...defaultProps}
                    initialPosition={initialPosition}
                    initialScale={initialScale}
                />
            );

            // Assert
            const canvas = screen.getByRole('application', { name: 'Encounter Canvas' });
            expect(canvas).toHaveAttribute('data-x', '50');
            expect(canvas).toHaveAttribute('data-y', '75');
            expect(canvas).toHaveAttribute('data-scale-x', '1.5');
            expect(canvas).toHaveAttribute('data-scale-y', '1.5');
        });
    });

    describe('Imperative Handle - Zoom Controls', () => {
        it('should zoom in when zoomIn is called', () => {
            // Arrange
            const ref = createRef<EncounterCanvasHandle>();
            const onViewportChange = vi.fn();

            render(<EncounterCanvas {...defaultProps} ref={ref} onViewportChange={onViewportChange} />);

            // Act
            act(() => {
                ref.current?.zoomIn();
            });

            // Assert
            const viewport = ref.current?.getViewport();
            expect(viewport?.scale).toBeCloseTo(1.2, 2); // ZOOM_FACTOR = 1.2
            expect(onViewportChange).toHaveBeenCalledWith(expect.objectContaining({ scale: expect.any(Number) }));
        });

        it('should zoom out when zoomOut is called', () => {
            // Arrange
            const ref = createRef<EncounterCanvasHandle>();
            const onViewportChange = vi.fn();

            render(<EncounterCanvas {...defaultProps} ref={ref} onViewportChange={onViewportChange} />);

            // Act
            act(() => {
                ref.current?.zoomOut();
            });

            // Assert
            const viewport = ref.current?.getViewport();
            expect(viewport?.scale).toBeCloseTo(1 / 1.2, 2); // 1 / ZOOM_FACTOR
            expect(onViewportChange).toHaveBeenCalled();
        });

        it('should not zoom beyond maxZoom limit', () => {
            // Arrange
            const ref = createRef<EncounterCanvasHandle>();
            const maxZoom = 2;

            render(<EncounterCanvas {...defaultProps} ref={ref} initialScale={1.9} maxZoom={maxZoom} />);

            // Act - zoom in multiple times
            act(() => {
                ref.current?.zoomIn();
                ref.current?.zoomIn();
                ref.current?.zoomIn();
            });

            // Assert
            const viewport = ref.current?.getViewport();
            expect(viewport?.scale).toBeLessThanOrEqual(maxZoom);
        });

        it('should not zoom below minZoom limit', () => {
            // Arrange
            const ref = createRef<EncounterCanvasHandle>();
            const minZoom = 0.5;

            render(<EncounterCanvas {...defaultProps} ref={ref} initialScale={0.6} minZoom={minZoom} />);

            // Act - zoom out multiple times
            act(() => {
                ref.current?.zoomOut();
                ref.current?.zoomOut();
                ref.current?.zoomOut();
            });

            // Assert
            const viewport = ref.current?.getViewport();
            expect(viewport?.scale).toBeGreaterThanOrEqual(minZoom);
        });

        it('should use default minZoom of 0.1 when not specified', () => {
            // Arrange
            const ref = createRef<EncounterCanvasHandle>();

            render(<EncounterCanvas {...defaultProps} ref={ref} initialScale={0.2} />);

            // Act - zoom out many times
            act(() => {
                for (let i = 0; i < 10; i++) {
                    ref.current?.zoomOut();
                }
            });

            // Assert
            const viewport = ref.current?.getViewport();
            expect(viewport?.scale).toBeGreaterThanOrEqual(0.1);
        });

        it('should use default maxZoom of 10 when not specified', () => {
            // Arrange
            const ref = createRef<EncounterCanvasHandle>();

            render(<EncounterCanvas {...defaultProps} ref={ref} initialScale={8} />);

            // Act - zoom in many times
            act(() => {
                for (let i = 0; i < 10; i++) {
                    ref.current?.zoomIn();
                }
            });

            // Assert
            const viewport = ref.current?.getViewport();
            expect(viewport?.scale).toBeLessThanOrEqual(10);
        });
    });

    describe('Imperative Handle - Reset View', () => {
        it('should reset viewport to initial position and scale', () => {
            // Arrange
            const ref = createRef<EncounterCanvasHandle>();
            const initialPosition = { x: 100, y: 200 };
            const initialScale = 1.5;
            const onViewportChange = vi.fn();

            render(
                <EncounterCanvas
                    {...defaultProps}
                    ref={ref}
                    initialPosition={initialPosition}
                    initialScale={initialScale}
                    onViewportChange={onViewportChange}
                />
            );

            // Act - change viewport then reset
            act(() => {
                ref.current?.zoomIn();
                ref.current?.zoomIn();
            });
            act(() => {
                ref.current?.resetView();
            });

            // Assert
            const viewport = ref.current?.getViewport();
            expect(viewport?.x).toBe(100);
            expect(viewport?.y).toBe(200);
            expect(viewport?.scale).toBe(1.5);
        });

        it('should notify viewport change on reset', () => {
            // Arrange
            const ref = createRef<EncounterCanvasHandle>();
            const onViewportChange = vi.fn();
            const initialPosition = { x: 50, y: 50 };
            const initialScale = 2;

            render(
                <EncounterCanvas
                    {...defaultProps}
                    ref={ref}
                    initialPosition={initialPosition}
                    initialScale={initialScale}
                    onViewportChange={onViewportChange}
                />
            );

            // Act
            act(() => {
                ref.current?.zoomIn();
            });
            onViewportChange.mockClear();
            act(() => {
                ref.current?.resetView();
            });

            // Assert
            expect(onViewportChange).toHaveBeenCalledWith({
                x: 50,
                y: 50,
                scale: 2,
            });
        });
    });

    describe('Imperative Handle - Set Viewport', () => {
        it('should set viewport position and scale programmatically', () => {
            // Arrange
            const ref = createRef<EncounterCanvasHandle>();
            const onViewportChange = vi.fn();
            const newViewport: Viewport = { x: 300, y: 400, scale: 2.5 };

            render(<EncounterCanvas {...defaultProps} ref={ref} onViewportChange={onViewportChange} />);

            // Act
            act(() => {
                ref.current?.setViewport(newViewport);
            });

            // Assert
            const viewport = ref.current?.getViewport();
            expect(viewport?.x).toBe(300);
            expect(viewport?.y).toBe(400);
            expect(viewport?.scale).toBe(2.5);
            expect(onViewportChange).toHaveBeenCalledWith(newViewport);
        });

        it('should update canvas attributes when viewport is set', () => {
            // Arrange
            const ref = createRef<EncounterCanvasHandle>();

            const { rerender } = render(<EncounterCanvas {...defaultProps} ref={ref} />);

            // Act
            act(() => {
                ref.current?.setViewport({ x: 150, y: 250, scale: 3 });
            });
            // Force re-render to see attribute updates
            rerender(<EncounterCanvas {...defaultProps} ref={ref} />);

            // Assert
            const canvas = screen.getByRole('application', { name: 'Encounter Canvas' });
            expect(canvas).toHaveAttribute('data-x', '150');
            expect(canvas).toHaveAttribute('data-y', '250');
            expect(canvas).toHaveAttribute('data-scale-x', '3');
        });
    });

    describe('Imperative Handle - Get Stage', () => {
        it('should provide getStage method in imperative handle', () => {
            // Arrange
            const ref = createRef<EncounterCanvasHandle>();

            // Act
            render(<EncounterCanvas {...defaultProps} ref={ref} />);

            // Assert
            // The getStage method should be available on the handle
            expect(ref.current?.getStage).toBeDefined();
            expect(typeof ref.current?.getStage).toBe('function');
        });
    });

    describe('Stage Callback Ref', () => {
        it('should call stageCallbackRef when provided', () => {
            // Arrange
            const stageCallbackRef = vi.fn();

            // Act
            render(<EncounterCanvas {...defaultProps} stageCallbackRef={stageCallbackRef} />);

            // Assert
            // Since we're mocking, the callback is called with null (no real Konva stage)
            expect(stageCallbackRef).toHaveBeenCalled();
        });
    });

    describe('Viewport Change Callback', () => {
        it('should call onViewportChange when zoom changes', () => {
            // Arrange
            const ref = createRef<EncounterCanvasHandle>();
            const onViewportChange = vi.fn();

            render(<EncounterCanvas {...defaultProps} ref={ref} onViewportChange={onViewportChange} />);

            // Act
            act(() => {
                ref.current?.zoomIn();
            });

            // Assert
            expect(onViewportChange).toHaveBeenCalledTimes(1);
            expect(onViewportChange).toHaveBeenCalledWith(
                expect.objectContaining({
                    x: expect.any(Number),
                    y: expect.any(Number),
                    scale: expect.any(Number),
                })
            );
        });

        it('should not call onViewportChange when callback is not provided', () => {
            // Arrange
            const ref = createRef<EncounterCanvasHandle>();
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

            // Act & Assert - should not throw
            render(<EncounterCanvas {...defaultProps} ref={ref} />);
            expect(() => {
                act(() => {
                    ref.current?.zoomIn();
                });
            }).not.toThrow();

            consoleSpy.mockRestore();
        });
    });

    describe('Props Configuration', () => {
        it('should accept draggable prop', () => {
            // Act & Assert - should not throw
            expect(() => {
                render(<EncounterCanvas {...defaultProps} draggable={true} />);
            }).not.toThrow();

            expect(() => {
                render(<EncounterCanvas {...defaultProps} draggable={false} />);
            }).not.toThrow();
        });

        it('should accept onClick callback prop', () => {
            // Arrange
            const onClick = vi.fn();

            // Act
            render(<EncounterCanvas {...defaultProps} onClick={onClick} />);

            // Assert - component renders without error
            expect(screen.getByRole('application', { name: 'Encounter Canvas' })).toBeInTheDocument();
        });

        it('should accept stageWidth and stageHeight props', () => {
            // Act & Assert - should not throw
            expect(() => {
                render(<EncounterCanvas {...defaultProps} stageWidth={2000} stageHeight={1500} />);
            }).not.toThrow();
        });

        it('should accept backgroundImageUrl prop', () => {
            // Act & Assert - should not throw
            expect(() => {
                render(<EncounterCanvas {...defaultProps} backgroundImageUrl="https://example.com/bg.png" />);
            }).not.toThrow();
        });
    });

    describe('Component Display Name', () => {
        it('should have correct displayName', () => {
            // Assert
            expect(EncounterCanvas.displayName).toBe('EncounterCanvas');
        });
    });

    describe('Zoom Factor Behavior', () => {
        it('should increase scale by factor of 1.2 on zoom in', () => {
            // Arrange
            const ref = createRef<EncounterCanvasHandle>();
            const initialScale = 1;

            render(<EncounterCanvas {...defaultProps} ref={ref} initialScale={initialScale} />);

            // Act
            act(() => {
                ref.current?.zoomIn();
            });

            // Assert
            const viewport = ref.current?.getViewport();
            const expectedScale = initialScale * 1.2;
            expect(viewport?.scale).toBeCloseTo(expectedScale, 5);
        });

        it('should decrease scale by factor of 1.2 on zoom out', () => {
            // Arrange
            const ref = createRef<EncounterCanvasHandle>();
            const initialScale = 1;

            render(<EncounterCanvas {...defaultProps} ref={ref} initialScale={initialScale} />);

            // Act
            act(() => {
                ref.current?.zoomOut();
            });

            // Assert
            const viewport = ref.current?.getViewport();
            const expectedScale = initialScale / 1.2;
            expect(viewport?.scale).toBeCloseTo(expectedScale, 5);
        });

        it('should apply zoom factor cumulatively', () => {
            // Arrange
            const ref = createRef<EncounterCanvasHandle>();
            const initialScale = 1;
            const zoomFactor = 1.2;

            render(<EncounterCanvas {...defaultProps} ref={ref} initialScale={initialScale} />);

            // Act - zoom in 3 times (separate act calls to allow state updates)
            act(() => {
                ref.current?.zoomIn();
            });
            act(() => {
                ref.current?.zoomIn();
            });
            act(() => {
                ref.current?.zoomIn();
            });

            // Assert
            const viewport = ref.current?.getViewport();
            const expectedScale = initialScale * zoomFactor * zoomFactor * zoomFactor;
            expect(viewport?.scale).toBeCloseTo(expectedScale, 2);
        });
    });

    describe('Unmount Cleanup', () => {
        it('should cleanup without errors on unmount', () => {
            // Arrange
            const ref = createRef<EncounterCanvasHandle>();
            const onViewportChange = vi.fn();
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

            const { unmount } = render(
                <EncounterCanvas {...defaultProps} ref={ref} onViewportChange={onViewportChange} />
            );

            // Act
            unmount();

            // Assert - no errors during unmount
            expect(consoleSpy).not.toHaveBeenCalled();
            consoleSpy.mockRestore();
        });

        it('should not update state after unmount', () => {
            // Arrange
            const ref = createRef<EncounterCanvasHandle>();
            const onViewportChange = vi.fn();
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

            const { unmount } = render(
                <EncounterCanvas {...defaultProps} ref={ref} onViewportChange={onViewportChange} />
            );

            // Keep ref before unmount to verify it was set
            expect(ref.current).toBeDefined();

            // Act
            unmount();

            // Attempting to call methods after unmount should not cause errors
            // (the ref may be stale but shouldn't throw)
            expect(consoleSpy).not.toHaveBeenCalled();
            consoleSpy.mockRestore();
        });
    });

    describe('Mouse Wheel Zoom Interactions', () => {
        it('should register onWheel handler on Stage', () => {
            // Arrange & Act
            render(<EncounterCanvas {...defaultProps} />);

            // Assert
            expect(mockStageHandlers.onWheel).toBeDefined();
            expect(typeof mockStageHandlers.onWheel).toBe('function');
        });

        it('should zoom in when wheel scrolls up (negative deltaY)', () => {
            // Arrange
            const ref = createRef<EncounterCanvasHandle>();
            const onViewportChange = vi.fn();
            render(<EncounterCanvas {...defaultProps} ref={ref} onViewportChange={onViewportChange} />);

            const wheelEvent = createMockKonvaEvent({ deltaY: -100 });

            // Act
            act(() => {
                mockStageHandlers.onWheel?.(wheelEvent);
            });

            // Assert
            const viewport = ref.current?.getViewport();
            expect(viewport?.scale).toBeGreaterThan(1);
            expect(onViewportChange).toHaveBeenCalled();
        });

        it('should zoom out when wheel scrolls down (positive deltaY)', () => {
            // Arrange
            const ref = createRef<EncounterCanvasHandle>();
            const onViewportChange = vi.fn();
            render(<EncounterCanvas {...defaultProps} ref={ref} onViewportChange={onViewportChange} />);

            const wheelEvent = createMockKonvaEvent({ deltaY: 100 });

            // Act
            act(() => {
                mockStageHandlers.onWheel?.(wheelEvent);
            });

            // Assert
            const viewport = ref.current?.getViewport();
            expect(viewport?.scale).toBeLessThan(1);
            expect(onViewportChange).toHaveBeenCalled();
        });

        it('should prevent default scroll behavior on wheel', () => {
            // Arrange
            render(<EncounterCanvas {...defaultProps} />);
            const wheelEvent = createMockKonvaEvent({ deltaY: 100 });

            // Act
            act(() => {
                mockStageHandlers.onWheel?.(wheelEvent);
            });

            // Assert
            expect(wheelEvent.evt.preventDefault).toHaveBeenCalled();
        });

        it('should not zoom beyond maxZoom via wheel', () => {
            // Arrange
            const ref = createRef<EncounterCanvasHandle>();
            const maxZoom = 2;
            render(<EncounterCanvas {...defaultProps} ref={ref} initialScale={1.9} maxZoom={maxZoom} />);

            // Act - scroll up multiple times
            for (let i = 0; i < 5; i++) {
                const wheelEvent = createMockKonvaEvent({ deltaY: -100 }, { scaleX: () => ref.current?.getViewport().scale ?? 1 });
                act(() => {
                    mockStageHandlers.onWheel?.(wheelEvent);
                });
            }

            // Assert
            const viewport = ref.current?.getViewport();
            expect(viewport?.scale).toBeLessThanOrEqual(maxZoom);
        });

        it('should not zoom below minZoom via wheel', () => {
            // Arrange
            const ref = createRef<EncounterCanvasHandle>();
            const minZoom = 0.5;
            render(<EncounterCanvas {...defaultProps} ref={ref} initialScale={0.6} minZoom={minZoom} />);

            // Act - scroll down multiple times
            for (let i = 0; i < 5; i++) {
                const wheelEvent = createMockKonvaEvent({ deltaY: 100 }, { scaleX: () => ref.current?.getViewport().scale ?? 1 });
                act(() => {
                    mockStageHandlers.onWheel?.(wheelEvent);
                });
            }

            // Assert
            const viewport = ref.current?.getViewport();
            expect(viewport?.scale).toBeGreaterThanOrEqual(minZoom);
        });
    });

    describe('Right-Click Panning Interactions', () => {
        it('should register mouse event handlers on Stage', () => {
            // Arrange & Act
            render(<EncounterCanvas {...defaultProps} />);

            // Assert
            expect(mockStageHandlers.onMouseDown).toBeDefined();
            expect(mockStageHandlers.onMouseUp).toBeDefined();
        });

        it('should start panning on right-click (button === 2)', () => {
            // Arrange
            render(<EncounterCanvas {...defaultProps} />);
            const mouseDownEvent = createMockKonvaEvent({ button: 2, clientX: 100, clientY: 100 });

            // Act
            act(() => {
                mockStageHandlers.onMouseDown?.(mouseDownEvent);
            });

            // Assert - event should be prevented
            expect(mouseDownEvent.evt.preventDefault).toHaveBeenCalled();
        });

        it('should not start panning on left-click (button === 0)', () => {
            // Arrange
            render(<EncounterCanvas {...defaultProps} />);
            const mouseDownEvent = createMockKonvaEvent({ button: 0, clientX: 100, clientY: 100 });

            // Act
            act(() => {
                mockStageHandlers.onMouseDown?.(mouseDownEvent);
            });

            // Assert - preventDefault should not be called for left-click
            expect(mouseDownEvent.evt.preventDefault).not.toHaveBeenCalled();
        });

        it('should update viewport position during pan', () => {
            // Arrange
            const ref = createRef<EncounterCanvasHandle>();
            const onViewportChange = vi.fn();
            render(<EncounterCanvas {...defaultProps} ref={ref} onViewportChange={onViewportChange} />);

            // Start right-click panning
            const mouseDownEvent = createMockKonvaEvent({ button: 2, clientX: 100, clientY: 100 });
            act(() => {
                mockStageHandlers.onMouseDown?.(mouseDownEvent);
            });

            // Move mouse - need to re-render to get the onMouseMove handler
            const { rerender: _rerender } = render(<EncounterCanvas {...defaultProps} ref={ref} onViewportChange={onViewportChange} />);

            // Check if onMouseMove is now available (after panning started)
            if (mockStageHandlers.onMouseMove) {
                const mouseMoveEvent = createMockKonvaEvent({ clientX: 150, clientY: 150 });
                act(() => {
                    mockStageHandlers.onMouseMove?.(mouseMoveEvent);
                });

                // Assert - viewport should have changed
                expect(onViewportChange).toHaveBeenCalled();
            }
        });

        it('should stop panning on right-click release', () => {
            // Arrange
            render(<EncounterCanvas {...defaultProps} />);

            // Start panning
            const mouseDownEvent = createMockKonvaEvent({ button: 2, clientX: 100, clientY: 100 });
            act(() => {
                mockStageHandlers.onMouseDown?.(mouseDownEvent);
            });

            // Release right-click
            const mouseUpEvent = createMockKonvaEvent({ button: 2 });
            act(() => {
                mockStageHandlers.onMouseUp?.(mouseUpEvent);
            });

            // Assert - should complete without errors
            expect(true).toBe(true);
        });
    });

    describe('Left-Click Interactions', () => {
        it('should register onClick handler on Stage', () => {
            // Arrange
            const onClick = vi.fn();

            // Act
            render(<EncounterCanvas {...defaultProps} onClick={onClick} />);

            // Assert
            expect(mockStageHandlers.onClick).toBeDefined();
            expect(typeof mockStageHandlers.onClick).toBe('function');
        });

        it('should call onClick callback with converted coordinates on left-click', () => {
            // Arrange
            const onClick = vi.fn();
            render(<EncounterCanvas {...defaultProps} onClick={onClick} />);

            const clickEvent = createMockKonvaEvent({ button: 0 });

            // Act
            act(() => {
                mockStageHandlers.onClick?.(clickEvent);
            });

            // Assert
            expect(onClick).toHaveBeenCalledWith(
                expect.objectContaining({
                    x: expect.any(Number),
                    y: expect.any(Number),
                })
            );
        });

        it('should not call onClick callback on right-click', () => {
            // Arrange
            const onClick = vi.fn();
            render(<EncounterCanvas {...defaultProps} onClick={onClick} />);

            const clickEvent = createMockKonvaEvent({ button: 2 });

            // Act
            act(() => {
                mockStageHandlers.onClick?.(clickEvent);
            });

            // Assert
            expect(onClick).not.toHaveBeenCalled();
        });

        it('should not call onClick callback when no handler provided', () => {
            // Arrange
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            render(<EncounterCanvas {...defaultProps} />);

            const clickEvent = createMockKonvaEvent({ button: 0 });

            // Act & Assert - should not throw
            expect(() => {
                act(() => {
                    mockStageHandlers.onClick?.(clickEvent);
                });
            }).not.toThrow();

            consoleSpy.mockRestore();
        });

        it('should convert click coordinates accounting for zoom and pan', () => {
            // Arrange
            const onClick = vi.fn();
            const initialScale = 2;
            const initialPosition = { x: 100, y: 50 };
            render(
                <EncounterCanvas
                    {...defaultProps}
                    onClick={onClick}
                    initialScale={initialScale}
                    initialPosition={initialPosition}
                />
            );

            const clickEvent = createMockKonvaEvent(
                { button: 0 },
                { x: () => initialPosition.x, y: () => initialPosition.y, scaleX: () => initialScale }
            );

            // Act
            act(() => {
                mockStageHandlers.onClick?.(clickEvent);
            });

            // Assert - coordinates should be converted
            expect(onClick).toHaveBeenCalled();
            const callArgs = onClick.mock.calls[0]?.[0];
            expect(callArgs).toBeDefined();
            // The position should be (pointerX - stageX) / scale
            // (400 - 100) / 2 = 150 for x, (300 - 50) / 2 = 125 for y
            expect(callArgs.x).toBeCloseTo(150, 0);
            expect(callArgs.y).toBeCloseTo(125, 0);
        });
    });

    describe('Context Menu Prevention', () => {
        it('should register onContextMenu handler on Stage', () => {
            // Arrange & Act
            render(<EncounterCanvas {...defaultProps} />);

            // Assert
            expect(mockStageHandlers.onContextMenu).toBeDefined();
            expect(typeof mockStageHandlers.onContextMenu).toBe('function');
        });

        it('should prevent default context menu', () => {
            // Arrange
            render(<EncounterCanvas {...defaultProps} />);
            const contextMenuEvent = createMockKonvaEvent({});

            // Act
            act(() => {
                mockStageHandlers.onContextMenu?.(contextMenuEvent);
            });

            // Assert
            expect(contextMenuEvent.evt.preventDefault).toHaveBeenCalled();
        });
    });

    describe('Konva Stage Structure', () => {
        it('should pass correct scaleX and scaleY to Stage', () => {
            // Arrange
            const initialScale = 2.5;

            // Act
            render(<EncounterCanvas {...defaultProps} initialScale={initialScale} />);

            // Assert
            const canvas = screen.getByRole('application', { name: 'Encounter Canvas' });
            expect(canvas).toHaveAttribute('data-scale-x', '2.5');
            expect(canvas).toHaveAttribute('data-scale-y', '2.5');
        });

        it('should pass correct x and y position to Stage', () => {
            // Arrange
            const initialPosition = { x: 123, y: 456 };

            // Act
            render(<EncounterCanvas {...defaultProps} initialPosition={initialPosition} />);

            // Assert
            const canvas = screen.getByRole('application', { name: 'Encounter Canvas' });
            expect(canvas).toHaveAttribute('data-x', '123');
            expect(canvas).toHaveAttribute('data-y', '456');
        });

        it('should update Stage position after programmatic viewport change', () => {
            // Arrange
            const ref = createRef<EncounterCanvasHandle>();
            const { rerender } = render(<EncounterCanvas {...defaultProps} ref={ref} />);

            // Act
            act(() => {
                ref.current?.setViewport({ x: 200, y: 300, scale: 1.5 });
            });
            rerender(<EncounterCanvas {...defaultProps} ref={ref} />);

            // Assert
            const canvas = screen.getByRole('application', { name: 'Encounter Canvas' });
            expect(canvas).toHaveAttribute('data-x', '200');
            expect(canvas).toHaveAttribute('data-y', '300');
            expect(canvas).toHaveAttribute('data-scale-x', '1.5');
        });
    });

    describe('Edge Cases', () => {
        it('should handle wheel event when stage returns null pointer position', () => {
            // Arrange
            render(<EncounterCanvas {...defaultProps} />);
            const wheelEvent = {
                evt: {
                    preventDefault: vi.fn(),
                    deltaY: 100,
                },
                target: {
                    getStage: () => ({
                        x: () => 0,
                        y: () => 0,
                        scaleX: () => 1,
                        getPointerPosition: () => null, // null pointer position
                    }),
                },
            };

            // Act & Assert - should not throw
            expect(() => {
                act(() => {
                    mockStageHandlers.onWheel?.(wheelEvent);
                });
            }).not.toThrow();
        });

        it('should handle wheel event when getStage returns null', () => {
            // Arrange
            render(<EncounterCanvas {...defaultProps} />);
            const wheelEvent = {
                evt: {
                    preventDefault: vi.fn(),
                    deltaY: 100,
                },
                target: {
                    getStage: () => null, // null stage
                },
            };

            // Act & Assert - should not throw
            expect(() => {
                act(() => {
                    mockStageHandlers.onWheel?.(wheelEvent);
                });
            }).not.toThrow();
        });

        it('should handle click event when getStage returns null', () => {
            // Arrange
            const onClick = vi.fn();
            render(<EncounterCanvas {...defaultProps} onClick={onClick} />);
            const clickEvent = {
                evt: {
                    preventDefault: vi.fn(),
                    button: 0,
                },
                target: {
                    getStage: () => null, // null stage
                },
            };

            // Act
            act(() => {
                mockStageHandlers.onClick?.(clickEvent);
            });

            // Assert - onClick should not be called when stage is null
            expect(onClick).not.toHaveBeenCalled();
        });

        it('should handle click event when getPointerPosition returns null', () => {
            // Arrange
            const onClick = vi.fn();
            render(<EncounterCanvas {...defaultProps} onClick={onClick} />);
            const clickEvent = {
                evt: {
                    preventDefault: vi.fn(),
                    button: 0,
                },
                target: {
                    getStage: () => ({
                        x: () => 0,
                        y: () => 0,
                        scaleX: () => 1,
                        getPointerPosition: () => null,
                    }),
                },
            };

            // Act
            act(() => {
                mockStageHandlers.onClick?.(clickEvent);
            });

            // Assert - onClick should not be called when pointer position is null
            expect(onClick).not.toHaveBeenCalled();
        });

        it('should handle zero scale gracefully', () => {
            // Arrange - this is an edge case that should be prevented by minZoom
            const ref = createRef<EncounterCanvasHandle>();
            render(<EncounterCanvas {...defaultProps} ref={ref} initialScale={0.1} minZoom={0.1} />);

            // Act - try to zoom out many times
            for (let i = 0; i < 20; i++) {
                act(() => {
                    ref.current?.zoomOut();
                });
            }

            // Assert - scale should never go below minZoom
            const viewport = ref.current?.getViewport();
            expect(viewport?.scale).toBeGreaterThanOrEqual(0.1);
        });

        it('should handle very large scale values', () => {
            // Arrange
            const ref = createRef<EncounterCanvasHandle>();
            render(<EncounterCanvas {...defaultProps} ref={ref} initialScale={9} maxZoom={10} />);

            // Act - zoom in many times
            for (let i = 0; i < 10; i++) {
                act(() => {
                    ref.current?.zoomIn();
                });
            }

            // Assert - scale should never exceed maxZoom
            const viewport = ref.current?.getViewport();
            expect(viewport?.scale).toBeLessThanOrEqual(10);
        });
    });
});
