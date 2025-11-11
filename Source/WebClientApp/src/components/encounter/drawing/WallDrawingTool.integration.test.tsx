import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { WallDrawingTool } from './WallDrawingTool';
import { useWallTransaction } from '@/hooks/useWallTransaction';
import { encounterApi } from '@/services/encounterApi';
import type { Pole } from '@/types/domain';
import { GridType, type GridConfig } from '@/utils/gridCalculator';

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
    let onPolesChangeSpy: ReturnType<typeof vi.fn>;
    let onCancelSpy: ReturnType<typeof vi.fn>;
    let onFinishSpy: ReturnType<typeof vi.fn>;
    let onFinishWithMergeSpy: ReturnType<typeof vi.fn>;
    let onFinishWithSplitSpy: ReturnType<typeof vi.fn>;

    const defaultGridConfig: GridConfig = {
        type: GridType.Square,
        cellSize: { width: 50, height: 50 },
        offset: { left: 0, top: 0 },
        snap: true,
    };

    const createMockEncounter = (walls: any[] = []) => ({
        id: 'encounter-1',
        name: 'Test Encounter',
        walls,
        regions: [],
        sources: [],
    });

    const mockEncounterEmpty = createMockEncounter([
        {
            index: 0,
            name: 'Wall 0',
            poles: [],
            isClosed: false,
            visibility: 0,
            encounterId: 'encounter-1',
        },
    ]);

    beforeEach(() => {
        onPolesChangeSpy = vi.fn();
        onCancelSpy = vi.fn();
        onFinishSpy = vi.fn();
        onFinishWithMergeSpy = vi.fn();
        onFinishWithSplitSpy = vi.fn();
    });

    const createStoreWithEncounter = (encounter: any) => {
        return configureStore({
            reducer: {
                [encounterApi.reducerPath]: () => ({
                    queries: {
                        'getEncounter("encounter-1")': {
                            status: 'fulfilled',
                            data: encounter,
                        },
                    },
                }),
            },
            middleware: (getDefaultMiddleware) =>
                getDefaultMiddleware().concat(encounterApi.middleware as any),
        });
    };

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

    describe('Scenario 1: Normal Placement', () => {
        it('should place open wall with 2 poles', () => {
            const store = createStoreWithEncounter(mockEncounterEmpty);
            let capturedPoles: Pole[] = [];

            const { container } = render(
                <Provider store={store}>
                    <TestWrapper>
                        {({ wallTransaction }) => (
                            <WallDrawingTool
                                encounterId="encounter-1"
                                wallIndex={0}
                                gridConfig={defaultGridConfig}
                                defaultHeight={10}
                                onCancel={onCancelSpy}
                                onFinish={onFinishSpy}
                                onPolesChange={(poles) => { capturedPoles = poles; }}
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

            expect(capturedPoles.length).toBe(1);
            expect(capturedPoles[0]).toEqual({ x: 100, y: 100, h: 10 });

            act(() => {
                rect.click();
            });

            expect(capturedPoles.length).toBe(2);
            expect(capturedPoles[1]).toEqual({ x: 100, y: 100, h: 10 });

            act(() => {
                rect.dispatchEvent(new Event('dblclick'));
            });

            expect(onFinishSpy).toHaveBeenCalled();
        });

        it('should place open wall with 5 poles', () => {
            const store = createStoreWithEncounter(mockEncounterEmpty);
            let capturedPoles: Pole[] = [];

            const { container } = render(
                <Provider store={store}>
                    <TestWrapper>
                        {({ wallTransaction }) => (
                            <WallDrawingTool
                                encounterId="encounter-1"
                                wallIndex={0}
                                gridConfig={defaultGridConfig}
                                defaultHeight={15}
                                onCancel={onCancelSpy}
                                onFinish={onFinishSpy}
                                onPolesChange={(poles) => { capturedPoles = poles; }}
                                wallTransaction={wallTransaction}
                            />
                        )}
                    </TestWrapper>
                </Provider>
            );

            const rect = container.querySelector('[data-testid="konva-rect"]') as HTMLElement;

            for (let i = 0; i < 5; i++) {
                act(() => {
                    rect.click();
                });
            }

            expect(capturedPoles.length).toBe(5);
            capturedPoles.forEach(pole => {
                expect(pole.h).toBe(15);
            });
        });

        it('should NOT auto-close with only 2 poles when clicking near first pole', () => {
            const store = createStoreWithEncounter(mockEncounterEmpty);
            let capturedPoles: Pole[] = [];

            const { container } = render(
                <Provider store={store}>
                    <TestWrapper>
                        {({ wallTransaction }) => (
                            <WallDrawingTool
                                encounterId="encounter-1"
                                wallIndex={0}
                                gridConfig={defaultGridConfig}
                                defaultHeight={10}
                                onCancel={onCancelSpy}
                                onFinish={onFinishSpy}
                                onPolesChange={(poles) => { capturedPoles = poles; }}
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
            act(() => {
                rect.click();
            });

            expect(capturedPoles.length).toBe(2);
            expect(onFinishSpy).not.toHaveBeenCalled();
        });
    });

    describe('Component Rendering with Real Hook', () => {
        it('should render component with real wallTransaction hook', () => {
            const store = createStoreWithEncounter(mockEncounterEmpty);
            let transaction: ReturnType<typeof useWallTransaction> | null = null;

            const { container } = render(
                <Provider store={store}>
                    <TestWrapper>
                        {({ wallTransaction }) => {
                            transaction = wallTransaction;
                            return (
                                <WallDrawingTool
                                    encounterId="encounter-1"
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
            const store = createStoreWithEncounter(mockEncounterEmpty);
            let transaction: ReturnType<typeof useWallTransaction> | null = null;

            render(
                <Provider store={store}>
                    <TestWrapper>
                        {({ wallTransaction }) => {
                            transaction = wallTransaction;
                            return (
                                <WallDrawingTool
                                    encounterId="encounter-1"
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

    describe('Scenario 4: Auto-Close', () => {
        it('should auto-close when clicking near first pole with 3+ poles', () => {
            const store = createStoreWithEncounter(mockEncounterEmpty);
            let capturedPoles: Pole[] = [];
            let isClosedCalled = false;

            const mockTransaction = {
                startTransaction: vi.fn(),
                updateSegment: vi.fn((index, updates) => {
                    if (updates.isClosed) {
                        isClosedCalled = true;
                    }
                }),
                pushLocalAction: vi.fn(),
                transaction: {
                    isActive: true,
                    type: 'placement',
                    originalWall: null,
                    localUndoStack: [],
                    localRedoStack: [],
                    segments: []
                },
                canUndoLocal: () => false,
                canRedoLocal: () => false,
                undoLocal: vi.fn(),
                redoLocal: vi.fn(),
                rollbackTransaction: vi.fn(),
                commitTransaction: vi.fn(),
                getActiveSegments: vi.fn(() => []),
            };

            const { container } = render(
                <Provider store={store}>
                    <WallDrawingTool
                        encounterId="encounter-1"
                        wallIndex={0}
                        gridConfig={defaultGridConfig}
                        defaultHeight={10}
                        onCancel={onCancelSpy}
                        onFinish={onFinishSpy}
                        onPolesChange={(poles) => { capturedPoles = poles; }}
                        wallTransaction={mockTransaction as any}
                    />
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

            expect(capturedPoles.length).toBe(2);
            expect(isClosedCalled).toBe(true);
        });

        it('should NOT auto-close when clicking 11px from first pole (outside tolerance)', () => {
            const store = createStoreWithEncounter(mockEncounterEmpty);
            const customKonvaEvent = {
                target: {
                    getStage: () => ({
                        getPointerPosition: () => ({ x: 111, y: 100 }),
                        x: () => 0,
                        y: () => 0,
                        scaleX: () => 1,
                    }),
                },
                evt: {},
                cancelBubble: false,
            };

            vi.mock('react-konva', () => ({
                Group: ({ children }: { children: React.ReactNode }) => <div data-testid="konva-group">{children}</div>,
                Rect: ({ onClick }: { onClick?: (e: any) => void }) => (
                    <div
                        data-testid="konva-rect"
                        onClick={() => onClick?.(customKonvaEvent)}
                    />
                ),
            }));

            let capturedPoles: Pole[] = [];

            const { container } = render(
                <Provider store={store}>
                    <TestWrapper>
                        {({ wallTransaction }) => (
                            <WallDrawingTool
                                encounterId="encounter-1"
                                wallIndex={0}
                                gridConfig={defaultGridConfig}
                                defaultHeight={10}
                                onCancel={onCancelSpy}
                                onFinish={onFinishSpy}
                                onPolesChange={(poles) => { capturedPoles = poles; }}
                                wallTransaction={wallTransaction}
                            />
                        )}
                    </TestWrapper>
                </Provider>
            );

            const rect = container.querySelector('[data-testid="konva-rect"]') as HTMLElement;

            for (let i = 0; i < 3; i++) {
                act(() => {
                    rect.click();
                });
            }

            expect(capturedPoles.length).toBe(3);
            expect(onFinishSpy).not.toHaveBeenCalled();
        });
    });

    describe('Scenario 3: Merge Walls', () => {
        it('should detect merge when connecting to one existing wall endpoint', () => {
            const mockEncounterWithWall = createMockEncounter([
                {
                    index: 0,
                    name: 'Wall 0',
                    poles: [],
                    isClosed: false,
                    visibility: 0,
                    encounterId: 'encounter-1',
                },
                {
                    index: 1,
                    name: 'Existing Wall',
                    poles: [
                        { x: 0, y: 0, h: 10 },
                        { x: 100, y: 0, h: 10 }
                    ],
                    isClosed: false,
                    visibility: 0,
                    encounterId: 'encounter-1',
                }
            ]);

            const store = createStoreWithEncounter(mockEncounterWithWall);

            const { container } = render(
                <Provider store={store}>
                    <TestWrapper>
                        {({ wallTransaction }) => (
                            <WallDrawingTool
                                encounterId="encounter-1"
                                wallIndex={0}
                                gridConfig={defaultGridConfig}
                                defaultHeight={10}
                                onCancel={onCancelSpy}
                                onFinish={onFinishSpy}
                                onFinishWithMerge={onFinishWithMergeSpy}
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
            act(() => {
                rect.click();
            });
            act(() => {
                rect.dispatchEvent(new Event('dblclick'));
            });

            expect(onFinishWithMergeSpy).toHaveBeenCalled();
        });
    });

    describe('Scenario 6: Edge-on-Edge Split', () => {
        it('should detect split when wall crosses existing wall', () => {
            const mockEncounterWithWall = createMockEncounter([
                {
                    index: 0,
                    name: 'Wall 0',
                    poles: [],
                    isClosed: false,
                    visibility: 0,
                    encounterId: 'encounter-1',
                },
                {
                    index: 1,
                    name: 'Existing Wall',
                    poles: [
                        { x: 50, y: 0, h: 10 },
                        { x: 50, y: 100, h: 10 }
                    ],
                    isClosed: false,
                    visibility: 0,
                    encounterId: 'encounter-1',
                }
            ]);

            const store = createStoreWithEncounter(mockEncounterWithWall);

            const { container } = render(
                <Provider store={store}>
                    <TestWrapper>
                        {({ wallTransaction }) => (
                            <WallDrawingTool
                                encounterId="encounter-1"
                                wallIndex={0}
                                gridConfig={defaultGridConfig}
                                defaultHeight={10}
                                onCancel={onCancelSpy}
                                onFinish={onFinishSpy}
                                onFinishWithSplit={onFinishWithSplitSpy}
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
            act(() => {
                rect.click();
            });
            act(() => {
                rect.dispatchEvent(new Event('dblclick'));
            });

            expect(onFinishWithSplitSpy).toHaveBeenCalled();
        });
    });

    describe('Pole Placement with Real Hook', () => {
        it('should place pole and populate real undo stack', () => {
            const store = createStoreWithEncounter(mockEncounterEmpty);
            let transaction: ReturnType<typeof useWallTransaction> | null = null;

            const { container } = render(
                <Provider store={store}>
                    <TestWrapper>
                        {({ wallTransaction }) => {
                            transaction = wallTransaction;
                            return (
                                <WallDrawingTool
                                    encounterId="encounter-1"
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
            expect(transaction!.transaction.localUndoStack[0]?.type).toBe('PLACE_POLE');
            expect(transaction!.canUndoLocal()).toBe(true);
        });

        it('should call onPolesChange when pole is placed', () => {
            const store = createStoreWithEncounter(mockEncounterEmpty);

            const { container } = render(
                <Provider store={store}>
                    <TestWrapper>
                        {({ wallTransaction }) => (
                            <WallDrawingTool
                                encounterId="encounter-1"
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
            const store = createStoreWithEncounter(mockEncounterEmpty);
            let transaction: ReturnType<typeof useWallTransaction> | null = null;
            let capturedPoles: Pole[] = [];

            const testOnPolesChange = (poles: Pole[]) => {
                capturedPoles = [...poles];
            };

            const { container } = render(
                <Provider store={store}>
                    <TestWrapper>
                        {({ wallTransaction }) => {
                            transaction = wallTransaction;
                            return (
                                <WallDrawingTool
                                    encounterId="encounter-1"
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
            const store = createStoreWithEncounter(mockEncounterEmpty);
            let transaction: ReturnType<typeof useWallTransaction> | null = null;
            let capturedPoles: Pole[] = [];

            const testOnPolesChange = (poles: Pole[]) => {
                capturedPoles = [...poles];
            };

            const { container } = render(
                <Provider store={store}>
                    <TestWrapper>
                        {({ wallTransaction }) => {
                            transaction = wallTransaction;
                            return (
                                <WallDrawingTool
                                    encounterId="encounter-1"
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
            const store = createStoreWithEncounter(mockEncounterEmpty);
            let transaction: ReturnType<typeof useWallTransaction> | null = null;

            const { container } = render(
                <Provider store={store}>
                    <TestWrapper>
                        {({ wallTransaction }) => {
                            transaction = wallTransaction;
                            return (
                                <WallDrawingTool
                                    encounterId="encounter-1"
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
            const store = createStoreWithEncounter(mockEncounterEmpty);
            let transaction: ReturnType<typeof useWallTransaction> | null = null;

            const { container } = render(
                <Provider store={store}>
                    <TestWrapper>
                        {({ wallTransaction }) => {
                            transaction = wallTransaction;
                            return (
                                <WallDrawingTool
                                    encounterId="encounter-1"
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
            const store = createStoreWithEncounter(mockEncounterEmpty);
            let transaction: ReturnType<typeof useWallTransaction> | null = null;

            const { container } = render(
                <Provider store={store}>
                    <TestWrapper>
                        {({ wallTransaction }) => {
                            transaction = wallTransaction;
                            return (
                                <WallDrawingTool
                                    encounterId="encounter-1"
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
            const store = createStoreWithEncounter(mockEncounterEmpty);
            let transaction: ReturnType<typeof useWallTransaction> | null = null;

            render(
                <Provider store={store}>
                    <TestWrapper>
                        {({ wallTransaction }) => {
                            transaction = wallTransaction;
                            return (
                                <WallDrawingTool
                                    encounterId="encounter-1"
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
            const store = createStoreWithEncounter(mockEncounterEmpty);
            let transaction: ReturnType<typeof useWallTransaction> | null = null;

            const { container } = render(
                <Provider store={store}>
                    <TestWrapper>
                        {({ wallTransaction }) => {
                            transaction = wallTransaction;
                            return (
                                <WallDrawingTool
                                    encounterId="encounter-1"
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
