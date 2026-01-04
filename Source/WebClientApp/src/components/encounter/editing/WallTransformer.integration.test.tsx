import { ThemeProvider, createTheme } from '@mui/material';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Pole } from '@/types/domain';
import { GridType, type GridConfig } from '@/utils/gridCalculator';
import {
    createDeletePoleAction,
    createInsertPoleAction,
    createMoveLineAction,
    createMovePoleAction,
    createMultiMovePoleAction,
} from '@/types/wallUndoActions';
import { WallTransformer } from './WallTransformer';

// Mock react-konva components with minimal overhead
vi.mock('react-konva', () => ({
    Group: ({ children }: { children?: React.ReactNode }) => (
        <div data-mock="konva-group" role="group">{children}</div>
    ),
    Circle: () => <div data-mock="konva-circle" role="presentation" aria-label="circle" />,
    Line: () => <div data-mock="konva-line" role="presentation" aria-label="line" />,
    Rect: () => <div data-mock="konva-rect" role="presentation" aria-label="rect" />,
}));

// Mock custom cursors
vi.mock('@/utils/customCursors', () => ({
    getCrosshairPlusCursor: () => 'crosshair',
    getMoveCursor: () => 'move',
    getGrabbingCursor: () => 'grabbing',
    getPointerCursor: () => 'pointer',
}));

// Mock snapping utilities
vi.mock('@/utils/snapping', () => ({
    SnapMode: { Free: 'free', Half: 'half', Quarter: 'quarter' },
    createDragBoundFunc: () => (pos: { x: number; y: number }) => pos,
    getSnapModeFromEvent: () => 'free',
    screenToWorld: (pos: { x: number; y: number }) => pos,
    snap: (pos: { x: number; y: number }) => pos,
}));

const darkTheme = createTheme({ palette: { mode: 'dark' } });

describe('WallTransformer Integration Tests', () => {
    const defaultGridConfig: GridConfig = {
        type: GridType.Square,
        cellSize: { width: 50, height: 50 },
        offset: { left: 0, top: 0 },
        snap: true,
        scale: 5.0,
    };

    const initialPoles: Pole[] = [
        { x: 0, y: 0, h: 10 },
        { x: 100, y: 0, h: 10 },
        { x: 100, y: 100, h: 10 },
        { x: 0, y: 100, h: 10 },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Component Rendering', () => {
        it('should render component with poles', () => {
            const { container } = render(
                <ThemeProvider theme={darkTheme}>
                    <WallTransformer
                        poles={initialPoles}
                        onPolesChange={vi.fn()}
                        gridConfig={defaultGridConfig}
                    />
                </ThemeProvider>
            );

            expect(container.querySelector('[data-mock="konva-group"]')).toBeTruthy();
        });

        it('should render poles as circles', () => {
            render(
                <ThemeProvider theme={darkTheme}>
                    <WallTransformer
                        poles={initialPoles}
                        onPolesChange={vi.fn()}
                        gridConfig={defaultGridConfig}
                    />
                </ThemeProvider>
            );

            const circles = screen.getAllByRole('presentation', { name: 'circle' });
            expect(circles.length).toBeGreaterThan(0);
        });

        it('should render lines between poles', () => {
            render(
                <ThemeProvider theme={darkTheme}>
                    <WallTransformer
                        poles={initialPoles}
                        onPolesChange={vi.fn()}
                        gridConfig={defaultGridConfig}
                    />
                </ThemeProvider>
            );

            const lines = screen.getAllByRole('presentation', { name: 'line' });
            expect(lines.length).toBeGreaterThan(0);
        });

        it('should render closed wall with closing segment', () => {
            render(
                <ThemeProvider theme={darkTheme}>
                    <WallTransformer
                        poles={initialPoles}
                        isClosed={true}
                        onPolesChange={vi.fn()}
                        gridConfig={defaultGridConfig}
                    />
                </ThemeProvider>
            );

            const lines = screen.getAllByRole('presentation', { name: 'line' });
            expect(lines.length).toBeGreaterThan(0);
        });

        it('should render with enableBackgroundRect disabled', () => {
            render(
                <ThemeProvider theme={darkTheme}>
                    <WallTransformer
                        poles={initialPoles}
                        onPolesChange={vi.fn()}
                        gridConfig={defaultGridConfig}
                        enableBackgroundRect={false}
                    />
                </ThemeProvider>
            );

            const rects = screen.queryAllByRole('presentation', { name: 'rect' });
            expect(rects.length).toBe(0);
        });

        it('should render with enableBackgroundRect enabled', () => {
            render(
                <ThemeProvider theme={darkTheme}>
                    <WallTransformer
                        poles={initialPoles}
                        onPolesChange={vi.fn()}
                        gridConfig={defaultGridConfig}
                        enableBackgroundRect={true}
                    />
                </ThemeProvider>
            );

            const rects = screen.getAllByRole('presentation', { name: 'rect' });
            expect(rects.length).toBeGreaterThan(0);
        });

        it('should accept onClearSelections callback', () => {
            const onClearSelections = vi.fn();

            render(
                <ThemeProvider theme={darkTheme}>
                    <WallTransformer
                        poles={initialPoles}
                        onPolesChange={vi.fn()}
                        gridConfig={defaultGridConfig}
                        onClearSelections={onClearSelections}
                    />
                </ThemeProvider>
            );

            expect(screen.getAllByRole('group').length).toBeGreaterThan(0);
        });
    });

    describe('MovePoleAction Unit Tests', () => {
        it('should create MovePoleAction with correct properties', () => {
            let capturedPoles: Pole[] = [...initialPoles];
            const testOnPolesChange = (poles: Pole[]) => {
                capturedPoles = [...poles];
            };

            const action = createMovePoleAction(
                0,
                { x: 0, y: 0 },
                { x: 50, y: 50 },
                testOnPolesChange,
                () => capturedPoles,
                undefined,
                10
            );

            expect(action.type).toBe('MOVE_POLE');
            expect(action.undo).toBeDefined();
            expect(action.redo).toBeDefined();
        });

        it('should execute redo and update pole position', () => {
            let capturedPoles: Pole[] = [...initialPoles];
            const testOnPolesChange = (poles: Pole[]) => {
                capturedPoles = [...poles];
            };

            const action = createMovePoleAction(
                0,
                { x: 0, y: 0 },
                { x: 50, y: 50 },
                testOnPolesChange,
                () => capturedPoles,
                undefined,
                10
            );

            action.redo();

            expect(capturedPoles[0]?.x).toBe(50);
            expect(capturedPoles[0]?.y).toBe(50);
        });

        it('should execute undo and restore original position', () => {
            let capturedPoles: Pole[] = [...initialPoles];
            const testOnPolesChange = (poles: Pole[]) => {
                capturedPoles = [...poles];
            };

            const action = createMovePoleAction(
                0,
                { x: 0, y: 0 },
                { x: 50, y: 50 },
                testOnPolesChange,
                () => capturedPoles,
                undefined,
                10
            );

            action.redo();
            action.undo();

            expect(capturedPoles[0]?.x).toBe(0);
            expect(capturedPoles[0]?.y).toBe(0);
        });
    });

    describe('MultiMovePoleAction Unit Tests', () => {
        it('should create MultiMovePoleAction with correct properties', () => {
            let capturedPoles: Pole[] = [...initialPoles];
            const testOnPolesChange = (poles: Pole[]) => {
                capturedPoles = [...poles];
            };

            const moves = [
                { poleIndex: 0, oldPosition: { x: 0, y: 0 }, newPosition: { x: 10, y: 10 } },
                { poleIndex: 1, oldPosition: { x: 100, y: 0 }, newPosition: { x: 110, y: 10 } },
            ];

            const action = createMultiMovePoleAction(
                moves,
                testOnPolesChange,
                () => capturedPoles,
                undefined,
                10
            );

            expect(action.type).toBe('MULTI_MOVE_POLE');
        });

        it('should move multiple poles on redo', () => {
            let capturedPoles: Pole[] = [...initialPoles];
            const testOnPolesChange = (poles: Pole[]) => {
                capturedPoles = [...poles];
            };

            const moves = [
                { poleIndex: 0, oldPosition: { x: 0, y: 0 }, newPosition: { x: 10, y: 10 } },
                { poleIndex: 1, oldPosition: { x: 100, y: 0 }, newPosition: { x: 110, y: 10 } },
            ];

            const action = createMultiMovePoleAction(
                moves,
                testOnPolesChange,
                () => capturedPoles,
                undefined,
                10
            );

            action.redo();

            expect(capturedPoles[0]?.x).toBe(10);
            expect(capturedPoles[0]?.y).toBe(10);
            expect(capturedPoles[1]?.x).toBe(110);
            expect(capturedPoles[1]?.y).toBe(10);
        });

        it('should restore all poles on undo', () => {
            let capturedPoles: Pole[] = [...initialPoles];
            const testOnPolesChange = (poles: Pole[]) => {
                capturedPoles = [...poles];
            };

            const moves = [
                { poleIndex: 0, oldPosition: { x: 0, y: 0 }, newPosition: { x: 10, y: 10 } },
                { poleIndex: 1, oldPosition: { x: 100, y: 0 }, newPosition: { x: 110, y: 10 } },
            ];

            const action = createMultiMovePoleAction(
                moves,
                testOnPolesChange,
                () => capturedPoles,
                undefined,
                10
            );

            action.redo();
            action.undo();

            expect(capturedPoles[0]?.x).toBe(0);
            expect(capturedPoles[0]?.y).toBe(0);
            expect(capturedPoles[1]?.x).toBe(100);
            expect(capturedPoles[1]?.y).toBe(0);
        });
    });

    describe('InsertPoleAction Unit Tests', () => {
        it('should create InsertPoleAction with correct properties', () => {
            let capturedPoles: Pole[] = [...initialPoles];
            const testOnPolesChange = (poles: Pole[]) => {
                capturedPoles = [...poles];
            };

            const newPole: Pole = { x: 50, y: 0, h: 10 };

            const action = createInsertPoleAction(
                1,
                newPole,
                testOnPolesChange,
                () => capturedPoles,
                undefined,
                10
            );

            expect(action.type).toBe('INSERT_POLE');
        });

        it('should insert pole at correct index on redo', () => {
            let capturedPoles: Pole[] = [...initialPoles];
            const testOnPolesChange = (poles: Pole[]) => {
                capturedPoles = [...poles];
            };
            const originalCount = initialPoles.length;
            const newPole: Pole = { x: 50, y: 0, h: 10 };

            const action = createInsertPoleAction(
                1,
                newPole,
                testOnPolesChange,
                () => capturedPoles,
                undefined,
                10
            );

            action.redo();

            expect(capturedPoles.length).toBe(originalCount + 1);
            expect(capturedPoles[1]).toEqual(newPole);
        });

        it('should remove inserted pole on undo', () => {
            let capturedPoles: Pole[] = [...initialPoles];
            const testOnPolesChange = (poles: Pole[]) => {
                capturedPoles = [...poles];
            };
            const originalCount = initialPoles.length;
            const newPole: Pole = { x: 50, y: 0, h: 10 };

            const action = createInsertPoleAction(
                1,
                newPole,
                testOnPolesChange,
                () => capturedPoles,
                undefined,
                10
            );

            action.redo();
            action.undo();

            expect(capturedPoles.length).toBe(originalCount);
        });
    });

    describe('DeletePoleAction Unit Tests', () => {
        it('should create DeletePoleAction with correct properties', () => {
            let capturedPoles: Pole[] = [...initialPoles];
            const testOnPolesChange = (poles: Pole[]) => {
                capturedPoles = [...poles];
            };

            const action = createDeletePoleAction(
                [1],
                [initialPoles[1] as Pole],
                testOnPolesChange,
                () => capturedPoles,
                undefined,
                10
            );

            expect(action.type).toBe('DELETE_POLE');
        });

        it('should delete pole on redo', () => {
            let capturedPoles: Pole[] = [...initialPoles];
            const testOnPolesChange = (poles: Pole[]) => {
                capturedPoles = [...poles];
            };
            const originalCount = initialPoles.length;
            const deletedPole = { ...initialPoles[1] } as Pole;

            const action = createDeletePoleAction(
                [1],
                [deletedPole],
                testOnPolesChange,
                () => capturedPoles,
                undefined,
                10
            );

            action.redo();

            expect(capturedPoles.length).toBe(originalCount - 1);
        });

        it('should restore deleted pole on undo', () => {
            let capturedPoles: Pole[] = [...initialPoles];
            const testOnPolesChange = (poles: Pole[]) => {
                capturedPoles = [...poles];
            };
            const originalCount = initialPoles.length;
            const deletedPole = { ...initialPoles[1] } as Pole;

            const action = createDeletePoleAction(
                [1],
                [deletedPole],
                testOnPolesChange,
                () => capturedPoles,
                undefined,
                10
            );

            action.redo();
            action.undo();

            expect(capturedPoles.length).toBe(originalCount);
            expect(capturedPoles[1]).toEqual(deletedPole);
        });

        it('should handle multiple pole delete', () => {
            let capturedPoles: Pole[] = [...initialPoles];
            const testOnPolesChange = (poles: Pole[]) => {
                capturedPoles = [...poles];
            };
            const originalCount = initialPoles.length;
            const deletedPole1 = { ...initialPoles[1] } as Pole;
            const deletedPole2 = { ...initialPoles[2] } as Pole;

            const action = createDeletePoleAction(
                [1, 2],
                [deletedPole1, deletedPole2],
                testOnPolesChange,
                () => capturedPoles,
                undefined,
                10
            );

            action.redo();

            expect(capturedPoles.length).toBe(originalCount - 2);

            action.undo();

            expect(capturedPoles.length).toBe(originalCount);
        });
    });

    describe('MoveLineAction Unit Tests', () => {
        it('should create MoveLineAction with correct properties', () => {
            let capturedPoles: Pole[] = [...initialPoles];
            const testOnPolesChange = (poles: Pole[]) => {
                capturedPoles = [...poles];
            };

            const action = createMoveLineAction(
                0,
                1,
                { x: 0, y: 0, h: 10 },
                { x: 100, y: 0, h: 10 },
                { x: 10, y: 10, h: 10 },
                { x: 110, y: 10, h: 10 },
                testOnPolesChange,
                () => capturedPoles,
                undefined,
                10
            );

            expect(action.type).toBe('MOVE_LINE');
        });

        it('should move both poles on redo', () => {
            let capturedPoles: Pole[] = [...initialPoles];
            const testOnPolesChange = (poles: Pole[]) => {
                capturedPoles = [...poles];
            };

            const action = createMoveLineAction(
                0,
                1,
                { x: 0, y: 0, h: 10 },
                { x: 100, y: 0, h: 10 },
                { x: 10, y: 10, h: 10 },
                { x: 110, y: 10, h: 10 },
                testOnPolesChange,
                () => capturedPoles,
                undefined,
                10
            );

            action.redo();

            expect(capturedPoles[0]?.x).toBe(10);
            expect(capturedPoles[0]?.y).toBe(10);
            expect(capturedPoles[1]?.x).toBe(110);
            expect(capturedPoles[1]?.y).toBe(10);
        });

        it('should restore both poles on undo', () => {
            let capturedPoles: Pole[] = [...initialPoles];
            const testOnPolesChange = (poles: Pole[]) => {
                capturedPoles = [...poles];
            };
            const originalPole1 = { ...initialPoles[0] } as Pole;
            const originalPole2 = { ...initialPoles[1] } as Pole;

            const action = createMoveLineAction(
                0,
                1,
                { x: 0, y: 0, h: 10 },
                { x: 100, y: 0, h: 10 },
                { x: 10, y: 10, h: 10 },
                { x: 110, y: 10, h: 10 },
                testOnPolesChange,
                () => capturedPoles,
                undefined,
                10
            );

            action.redo();
            action.undo();

            expect(capturedPoles[0]?.x).toBe(originalPole1.x);
            expect(capturedPoles[0]?.y).toBe(originalPole1.y);
            expect(capturedPoles[1]?.x).toBe(originalPole2.x);
            expect(capturedPoles[1]?.y).toBe(originalPole2.y);
        });
    });

    describe('Props Validation', () => {
        it('should render with minimal required props', () => {
            render(
                <ThemeProvider theme={darkTheme}>
                    <WallTransformer
                        poles={initialPoles}
                        onPolesChange={vi.fn()}
                    />
                </ThemeProvider>
            );

            expect(screen.getAllByRole('group').length).toBeGreaterThan(0);
        });

        it('should render with empty poles array', () => {
            render(
                <ThemeProvider theme={darkTheme}>
                    <WallTransformer
                        poles={[]}
                        onPolesChange={vi.fn()}
                        gridConfig={defaultGridConfig}
                    />
                </ThemeProvider>
            );

            expect(screen.getAllByRole('group').length).toBeGreaterThan(0);
        });

        it('should render with single pole', () => {
            render(
                <ThemeProvider theme={darkTheme}>
                    <WallTransformer
                        poles={[{ x: 50, y: 50, h: 10 }]}
                        onPolesChange={vi.fn()}
                        gridConfig={defaultGridConfig}
                    />
                </ThemeProvider>
            );

            expect(screen.getAllByRole('group').length).toBeGreaterThan(0);
        });

        it('should handle poles with different heights', () => {
            const polesWithHeights: Pole[] = [
                { x: 0, y: 0, h: 5 },
                { x: 100, y: 0, h: 10 },
                { x: 100, y: 100, h: 15 },
            ];

            render(
                <ThemeProvider theme={darkTheme}>
                    <WallTransformer
                        poles={polesWithHeights}
                        onPolesChange={vi.fn()}
                        gridConfig={defaultGridConfig}
                    />
                </ThemeProvider>
            );

            expect(screen.getAllByRole('group').length).toBeGreaterThan(0);
        });
    });

    describe('Grid Configuration', () => {
        it('should render with hex grid type', () => {
            const hexGridConfig: GridConfig = {
                type: GridType.HexV,
                cellSize: { width: 60, height: 52 },
                offset: { left: 0, top: 0 },
                snap: true,
                scale: 5.0,
            };

            render(
                <ThemeProvider theme={darkTheme}>
                    <WallTransformer
                        poles={initialPoles}
                        onPolesChange={vi.fn()}
                        gridConfig={hexGridConfig}
                    />
                </ThemeProvider>
            );

            expect(screen.getAllByRole('group').length).toBeGreaterThan(0);
        });

        it('should render with no snap', () => {
            const noSnapGridConfig: GridConfig = {
                type: GridType.Square,
                cellSize: { width: 50, height: 50 },
                offset: { left: 0, top: 0 },
                snap: false,
                scale: 5.0,
            };

            render(
                <ThemeProvider theme={darkTheme}>
                    <WallTransformer
                        poles={initialPoles}
                        onPolesChange={vi.fn()}
                        gridConfig={noSnapGridConfig}
                    />
                </ThemeProvider>
            );

            expect(screen.getAllByRole('group').length).toBeGreaterThan(0);
        });

        it('should render with custom offset', () => {
            const offsetGridConfig: GridConfig = {
                type: GridType.Square,
                cellSize: { width: 50, height: 50 },
                offset: { left: 25, top: 25 },
                snap: true,
                scale: 5.0,
            };

            render(
                <ThemeProvider theme={darkTheme}>
                    <WallTransformer
                        poles={initialPoles}
                        onPolesChange={vi.fn()}
                        gridConfig={offsetGridConfig}
                    />
                </ThemeProvider>
            );

            expect(screen.getAllByRole('group').length).toBeGreaterThan(0);
        });

        it('should render with different scale', () => {
            const scaledGridConfig: GridConfig = {
                type: GridType.Square,
                cellSize: { width: 50, height: 50 },
                offset: { left: 0, top: 0 },
                snap: true,
                scale: 10.0,
            };

            render(
                <ThemeProvider theme={darkTheme}>
                    <WallTransformer
                        poles={initialPoles}
                        onPolesChange={vi.fn()}
                        gridConfig={scaledGridConfig}
                    />
                </ThemeProvider>
            );

            expect(screen.getAllByRole('group').length).toBeGreaterThan(0);
        });
    });
});
