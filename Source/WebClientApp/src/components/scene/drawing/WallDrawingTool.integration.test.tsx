import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { WallDrawingTool } from './WallDrawingTool';
import { useWallTransaction } from '@/hooks/useWallTransaction';
import { sceneApi } from '@/services/sceneApi';
import type { Pole } from '@/types/domain';
import type { GridConfig } from '@/utils/gridCalculator';

vi.mock('konva', () => ({
    default: {
        Group: vi.fn(),
        Rect: vi.fn(),
    }
}));

vi.mock('react-konva', () => ({
    Group: ({ children }: { children: React.ReactNode }) => <div data-testid="konva-group">{children}</div>,
    Rect: ({ onClick, onDblClick, onMouseMove }: { onClick?: (e: any) => void; onDblClick?: (e: any) => void; onMouseMove?: (e: any) => void }) => {
        const mockKonvaEvent = {
            target: {
                getStage: () => ({
                    getPointerPosition: () => ({ x: 100, y: 100 }),
                    x: () => 0,
                    y: () => 0,
                    scaleX: () => 1,
                }),
            },
            evt: {},
            cancelBubble: false,
        };
        return (
            <div
                data-testid="konva-rect"
                onClick={() => onClick?.(mockKonvaEvent)}
                onDoubleClick={() => onDblClick?.(mockKonvaEvent)}
                onMouseMove={() => onMouseMove?.(mockKonvaEvent)}
            />
        );
    },
}));

vi.mock('./VertexMarker', () => ({
    VertexMarker: ({ position, preview }: { position: { x: number; y: number }; preview?: boolean }) => (
        <div data-testid={preview ? 'vertex-marker-preview' : 'vertex-marker'} data-x={position.x} data-y={position.y} />
    ),
}));

vi.mock('./WallPreview', () => ({
    WallPreview: () => <div data-testid="wall-preview" />,
}));

vi.mock('@/utils/structureSnapping', () => ({
    snapToNearest: (pos: { x: number; y: number }) => pos,
}));

vi.mock('@/utils/snapUtils', () => ({
    getSnapModeFromEvent: () => 'grid',
}));

describe('WallDrawingTool Integration Tests - Component + Real Hook', () => {
    let mockStore: ReturnType<typeof configureStore>;
    let onPolesChangeSpy: ReturnType<typeof vi.fn>;
    let onCancelSpy: ReturnType<typeof vi.fn>;
    let onFinishSpy: ReturnType<typeof vi.fn>;

    const defaultGridConfig: GridConfig = {
        size: 50,
        color: '#000000',
        offset: { x: 0, y: 0 },
    };

    const mockScene = {
        id: 'scene-1',
        name: 'Test Scene',
        walls: [
            {
                index: 0,
                name: 'Wall 1',
                poles: [],
                isClosed: false,
                visibility: 0,
                material: 'stone',
                color: '#808080',
            },
        ],
    };

    beforeEach(() => {
        mockStore = configureStore({
            reducer: {
                [sceneApi.reducerPath]: () => ({
                    queries: {
                        'getScene("scene-1")': {
                            status: 'fulfilled',
                            data: mockScene,
                        },
                    },
                }),
            },
            middleware: (getDefaultMiddleware) =>
                getDefaultMiddleware().concat(sceneApi.middleware),
        });

        onPolesChangeSpy = vi.fn();
        onCancelSpy = vi.fn();
        onFinishSpy = vi.fn();
    });

    interface TestWrapperProps {
        children: (params: { wallTransaction: ReturnType<typeof useWallTransaction> }) => React.ReactNode;
    }

    const TestWrapper: React.FC<TestWrapperProps> = ({ children }) => {
        const wallTransaction = useWallTransaction();

        React.useEffect(() => {
            wallTransaction.startTransaction('placement');
        }, [wallTransaction]);

        return <>{children({ wallTransaction })}</>;
    };

    describe('Component Rendering with Real Hook', () => {
        it('should render component with real wallTransaction hook', () => {
            let transaction: ReturnType<typeof useWallTransaction> | null = null;

            const { container } = render(
                <Provider store={mockStore}>
                    <TestWrapper>
                        {({ wallTransaction }) => {
                            transaction = wallTransaction;
                            return (
                                <WallDrawingTool
                                    sceneId="scene-1"
                                    wallIndex={0}
                                    gridConfig={defaultGridConfig}
                                    defaultHeight={10}
                                    onCancel={onCancelSpy}
                                    onFinish={onFinishSpy}
                                    onPolesChange={onPolesChangeSpy}
                                    wallTransaction={wallTransaction}
                                />
                            );
                        }}
                    </TestWrapper>
                </Provider>
            );

            expect(container.querySelector('[data-testid="konva-group"]')).toBeTruthy();
            expect(transaction).not.toBeNull();
            expect(transaction!.transaction.isActive).toBe(true);
            expect(transaction!.transaction.type).toBe('placement');
        });

        it('should initialize real hook with empty undo/redo stacks', () => {
            let transaction: ReturnType<typeof useWallTransaction> | null = null;

            render(
                <Provider store={mockStore}>
                    <TestWrapper>
                        {({ wallTransaction }) => {
                            transaction = wallTransaction;
                            return (
                                <WallDrawingTool
                                    sceneId="scene-1"
                                    wallIndex={0}
                                    gridConfig={defaultGridConfig}
                                    defaultHeight={10}
                                    onCancel={onCancelSpy}
                                    onFinish={onFinishSpy}
                                    onPolesChange={onPolesChangeSpy}
                                    wallTransaction={wallTransaction}
                                />
                            );
                        }}
                    </TestWrapper>
                </Provider>
            );

            expect(transaction!.transaction.localUndoStack).toEqual([]);
            expect(transaction!.transaction.localRedoStack).toEqual([]);
            expect(transaction!.canUndoLocal()).toBe(false);
            expect(transaction!.canRedoLocal()).toBe(false);
        });
    });

    describe('Pole Placement with Real Hook', () => {
        it('should place pole and populate real undo stack', () => {
            let transaction: ReturnType<typeof useWallTransaction> | null = null;

            const { container } = render(
                <Provider store={mockStore}>
                    <TestWrapper>
                        {({ wallTransaction }) => {
                            transaction = wallTransaction;
                            return (
                                <WallDrawingTool
                                    sceneId="scene-1"
                                    wallIndex={0}
                                    gridConfig={defaultGridConfig}
                                    defaultHeight={10}
                                    onCancel={onCancelSpy}
                                    onFinish={onFinishSpy}
                                    onPolesChange={onPolesChangeSpy}
                                    wallTransaction={wallTransaction}
                                />
                            );
                        }}
                    </TestWrapper>
                </Provider>
            );

            const rect = container.querySelector('[data-testid="konva-rect"]') as HTMLElement;

            expect(transaction!.transaction.localUndoStack.length).toBe(0);

            act(() => {
                rect.click();
            });

            expect(transaction!.transaction.localUndoStack.length).toBe(1);
            expect(transaction!.transaction.localUndoStack[0].type).toBe('PLACE_POLE');
            expect(transaction!.canUndoLocal()).toBe(true);
        });

        it('should call onPolesChange when pole is placed', () => {
            const { container } = render(
                <Provider store={mockStore}>
                    <TestWrapper>
                        {({ wallTransaction }) => (
                            <WallDrawingTool
                                sceneId="scene-1"
                                wallIndex={0}
                                gridConfig={defaultGridConfig}
                                defaultHeight={10}
                                onCancel={onCancelSpy}
                                onFinish={onFinishSpy}
                                onPolesChange={onPolesChangeSpy}
                                wallTransaction={wallTransaction}
                            />
                        )}
                    </TestWrapper>
                </Provider>
            );

            const rect = container.querySelector('[data-testid="konva-rect"]') as HTMLElement;

            act(() => {
                rect.click();
            });

            expect(onPolesChangeSpy).toHaveBeenCalledWith(
                expect.arrayContaining([
                    expect.objectContaining({
                        x: expect.any(Number),
                        y: expect.any(Number),
                        h: 10,
                    }),
                ])
            );
        });
    });

    describe('Real Undo/Redo Integration', () => {
        it('should undo pole placement using real hook', () => {
            let transaction: ReturnType<typeof useWallTransaction> | null = null;
            let capturedPoles: Pole[] = [];

            const testOnPolesChange = (poles: Pole[]) => {
                capturedPoles = [...poles];
            };

            const { container } = render(
                <Provider store={mockStore}>
                    <TestWrapper>
                        {({ wallTransaction }) => {
                            transaction = wallTransaction;
                            return (
                                <WallDrawingTool
                                    sceneId="scene-1"
                                    wallIndex={0}
                                    gridConfig={defaultGridConfig}
                                    defaultHeight={10}
                                    onCancel={onCancelSpy}
                                    onFinish={onFinishSpy}
                                    onPolesChange={testOnPolesChange}
                                    wallTransaction={wallTransaction}
                                />
                            );
                        }}
                    </TestWrapper>
                </Provider>
            );

            const rect = container.querySelector('[data-testid="konva-rect"]') as HTMLElement;

            act(() => {
                rect.click();
            });

            expect(capturedPoles.length).toBe(1);
            expect(transaction!.canUndoLocal()).toBe(true);

            act(() => {
                transaction!.undoLocal();
            });

            expect(capturedPoles.length).toBe(0);
            expect(transaction!.canUndoLocal()).toBe(false);
            expect(transaction!.canRedoLocal()).toBe(true);
        });

        it('should redo pole placement using real hook', () => {
            let transaction: ReturnType<typeof useWallTransaction> | null = null;
            let capturedPoles: Pole[] = [];

            const testOnPolesChange = (poles: Pole[]) => {
                capturedPoles = [...poles];
            };

            const { container } = render(
                <Provider store={mockStore}>
                    <TestWrapper>
                        {({ wallTransaction }) => {
                            transaction = wallTransaction;
                            return (
                                <WallDrawingTool
                                    sceneId="scene-1"
                                    wallIndex={0}
                                    gridConfig={defaultGridConfig}
                                    defaultHeight={10}
                                    onCancel={onCancelSpy}
                                    onFinish={onFinishSpy}
                                    onPolesChange={testOnPolesChange}
                                    wallTransaction={wallTransaction}
                                />
                            );
                        }}
                    </TestWrapper>
                </Provider>
            );

            const rect = container.querySelector('[data-testid="konva-rect"]') as HTMLElement;

            act(() => {
                rect.click();
            });

            const originalPole = { ...capturedPoles[0] };

            act(() => {
                transaction!.undoLocal();
            });

            expect(capturedPoles.length).toBe(0);

            act(() => {
                transaction!.redoLocal();
            });

            expect(capturedPoles.length).toBe(1);
            expect(capturedPoles[0]).toEqual(originalPole);
            expect(transaction!.canUndoLocal()).toBe(true);
            expect(transaction!.canRedoLocal()).toBe(false);
        });

        it('should handle multiple undo operations with real hook', () => {
            let transaction: ReturnType<typeof useWallTransaction> | null = null;

            const { container } = render(
                <Provider store={mockStore}>
                    <TestWrapper>
                        {({ wallTransaction }) => {
                            transaction = wallTransaction;
                            return (
                                <WallDrawingTool
                                    sceneId="scene-1"
                                    wallIndex={0}
                                    gridConfig={defaultGridConfig}
                                    defaultHeight={10}
                                    onCancel={onCancelSpy}
                                    onFinish={onFinishSpy}
                                    onPolesChange={onPolesChangeSpy}
                                    wallTransaction={wallTransaction}
                                />
                            );
                        }}
                    </TestWrapper>
                </Provider>
            );

            const rect = container.querySelector('[data-testid="konva-rect"]') as HTMLElement;

            act(() => {
                rect.click();
            });

            act(() => {
                rect.click();
            });

            act(() => {
                rect.click();
            });

            expect(transaction!.transaction.localUndoStack.length).toBe(3);
            expect(transaction!.transaction.localRedoStack.length).toBe(0);

            act(() => {
                transaction!.undoLocal();
            });

            expect(transaction!.transaction.localUndoStack.length).toBe(2);
            expect(transaction!.transaction.localRedoStack.length).toBe(1);

            act(() => {
                transaction!.undoLocal();
            });

            expect(transaction!.transaction.localUndoStack.length).toBe(1);
            expect(transaction!.transaction.localRedoStack.length).toBe(2);

            act(() => {
                transaction!.undoLocal();
            });

            expect(transaction!.transaction.localUndoStack.length).toBe(0);
            expect(transaction!.transaction.localRedoStack.length).toBe(3);
            expect(transaction!.canUndoLocal()).toBe(false);
            expect(transaction!.canRedoLocal()).toBe(true);
        });
    });

    describe('Real Hook State Management', () => {
        it('should clear redo stack when new pole is placed after undo', () => {
            let transaction: ReturnType<typeof useWallTransaction> | null = null;

            const { container } = render(
                <Provider store={mockStore}>
                    <TestWrapper>
                        {({ wallTransaction }) => {
                            transaction = wallTransaction;
                            return (
                                <WallDrawingTool
                                    sceneId="scene-1"
                                    wallIndex={0}
                                    gridConfig={defaultGridConfig}
                                    defaultHeight={10}
                                    onCancel={onCancelSpy}
                                    onFinish={onFinishSpy}
                                    onPolesChange={onPolesChangeSpy}
                                    wallTransaction={wallTransaction}
                                />
                            );
                        }}
                    </TestWrapper>
                </Provider>
            );

            const rect = container.querySelector('[data-testid="konva-rect"]') as HTMLElement;

            act(() => {
                rect.click();
            });

            act(() => {
                transaction!.undoLocal();
            });

            expect(transaction!.canRedoLocal()).toBe(true);

            act(() => {
                rect.click();
            });

            expect(transaction!.canRedoLocal()).toBe(false);
            expect(transaction!.transaction.localRedoStack.length).toBe(0);
        });

        it('should maintain correct canUndo/canRedo state throughout lifecycle', () => {
            let transaction: ReturnType<typeof useWallTransaction> | null = null;

            const { container } = render(
                <Provider store={mockStore}>
                    <TestWrapper>
                        {({ wallTransaction }) => {
                            transaction = wallTransaction;
                            return (
                                <WallDrawingTool
                                    sceneId="scene-1"
                                    wallIndex={0}
                                    gridConfig={defaultGridConfig}
                                    defaultHeight={10}
                                    onCancel={onCancelSpy}
                                    onFinish={onFinishSpy}
                                    onPolesChange={onPolesChangeSpy}
                                    wallTransaction={wallTransaction}
                                />
                            );
                        }}
                    </TestWrapper>
                </Provider>
            );

            const rect = container.querySelector('[data-testid="konva-rect"]') as HTMLElement;

            expect(transaction!.canUndoLocal()).toBe(false);
            expect(transaction!.canRedoLocal()).toBe(false);

            act(() => {
                rect.click();
            });

            expect(transaction!.canUndoLocal()).toBe(true);
            expect(transaction!.canRedoLocal()).toBe(false);

            act(() => {
                transaction!.undoLocal();
            });

            expect(transaction!.canUndoLocal()).toBe(false);
            expect(transaction!.canRedoLocal()).toBe(true);

            act(() => {
                transaction!.redoLocal();
            });

            expect(transaction!.canUndoLocal()).toBe(true);
            expect(transaction!.canRedoLocal()).toBe(false);
        });
    });

    describe('Transaction Lifecycle', () => {
        it('should verify transaction is active after startTransaction', () => {
            let transaction: ReturnType<typeof useWallTransaction> | null = null;

            render(
                <Provider store={mockStore}>
                    <TestWrapper>
                        {({ wallTransaction }) => {
                            transaction = wallTransaction;
                            return (
                                <WallDrawingTool
                                    sceneId="scene-1"
                                    wallIndex={0}
                                    gridConfig={defaultGridConfig}
                                    defaultHeight={10}
                                    onCancel={onCancelSpy}
                                    onFinish={onFinishSpy}
                                    onPolesChange={onPolesChangeSpy}
                                    wallTransaction={wallTransaction}
                                />
                            );
                        }}
                    </TestWrapper>
                </Provider>
            );

            expect(transaction!.transaction.isActive).toBe(true);
            expect(transaction!.transaction.type).toBe('placement');
            expect(transaction!.transaction.originalWall).toBeNull();
        });

        it('should rollback transaction and clear stacks', () => {
            let transaction: ReturnType<typeof useWallTransaction> | null = null;

            const { container } = render(
                <Provider store={mockStore}>
                    <TestWrapper>
                        {({ wallTransaction }) => {
                            transaction = wallTransaction;
                            return (
                                <WallDrawingTool
                                    sceneId="scene-1"
                                    wallIndex={0}
                                    gridConfig={defaultGridConfig}
                                    defaultHeight={10}
                                    onCancel={onCancelSpy}
                                    onFinish={onFinishSpy}
                                    onPolesChange={onPolesChangeSpy}
                                    wallTransaction={wallTransaction}
                                />
                            );
                        }}
                    </TestWrapper>
                </Provider>
            );

            const rect = container.querySelector('[data-testid="konva-rect"]') as HTMLElement;

            act(() => {
                rect.click();
            });

            expect(transaction!.transaction.localUndoStack.length).toBe(1);

            act(() => {
                transaction!.rollbackTransaction();
            });

            expect(transaction!.transaction.isActive).toBe(false);
            expect(transaction!.transaction.localUndoStack.length).toBe(0);
            expect(transaction!.transaction.localRedoStack.length).toBe(0);
        });
    });
});
