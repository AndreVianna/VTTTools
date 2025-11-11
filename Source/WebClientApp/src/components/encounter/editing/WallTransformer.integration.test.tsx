// TODO: Phase 8.8 - Re-enable when Wall types are fully implemented
// import React from 'react';
// import { describe, it, expect, vi, beforeEach } from 'vitest';
// import { render, waitFor } from '@testing-library/react';
// import { Provider } from 'react-redux';
// import { configureStore } from '@reduxjs/toolkit';
// import { WallTransformer } from './WallTransformer';
// import { useWallTransaction } from '@/hooks/useWallTransaction';
// import {
//     createMovePoleAction,
//     createMultiMovePoleAction,
//     createInsertPoleAction,
//     createDeletePoleAction,
//     createMoveLineAction
// } from '@/types/wallUndoActions';
// import { encounterApi } from '@/services/encounterApi';
// import type { Pole } from '@/types/domain';
// import type { GridConfig } from '@/utils/gridCalculator';

// vi.mock('konva', () => ({
//     default: {
//         Group: vi.fn(),
//         Circle: vi.fn(),
//         Line: vi.fn(),
//         Rect: vi.fn(),
//     }
// }));

// vi.mock('react-konva', () => ({
//     Group: ({ children }: { children: React.ReactNode }) => <div data-testid="konva-group">{children}</div>,
//     Circle: () => <div data-testid="konva-circle" />,
//     Line: () => <div data-testid="konva-line" />,
//     Rect: () => <div data-testid="konva-rect" />,
// }));

// vi.mock('@/utils/structureSnapping', () => ({
//     snapToNearest: (pos: { x: number; y: number }) => pos,
//     SnapMode: {
//         Grid: 'grid',
//         HalfSnap: 'half',
//         QuarterSnap: 'quarter',
//         NoSnap: 'none',
//     },
// }));

// vi.mock('@/utils/snapUtils', () => ({
//     getSnapModeFromEvent: () => 'grid',
// }));

// vi.mock('@/utils/customCursors', () => ({
//     getCrosshairPlusCursor: () => 'crosshair',
//     getMoveCursor: () => 'move',
//     getGrabbingCursor: () => 'grabbing',
//     getPointerCursor: () => 'pointer',
// }));

// describe('WallTransformer Integration Tests - Edit Mode Actions + Real Hook', () => {
//     let mockStore: ReturnType<typeof configureStore>;

//     const defaultGridConfig: GridConfig = {
//         size: 50,
//         color: '#000000',
//         offset: { x: 0, y: 0 },
//     };

//     const initialPoles: Pole[] = [
//         { x: 0, y: 0, h: 10 },
//         { x: 100, y: 0, h: 10 },
//         { x: 100, y: 100, h: 10 },
//         { x: 0, y: 100, h: 10 },
//     ];

//     beforeEach(() => {
//         mockStore = configureStore({
//             reducer: {
//                 [encounterApi.reducerPath]: () => ({
//                     queries: {},
//                 }),
//             },
//             middleware: (getDefaultMiddleware) =>
//                 getDefaultMiddleware().concat(encounterApi.middleware),
//         });
//     });

//     interface TestWrapperProps {
//         children: (params: { wallTransaction: ReturnType<typeof useWallTransaction> }) => React.ReactNode;
//     }

//     const TestWrapper: React.FC<TestWrapperProps> = ({ children }) => {
//         const wallTransaction = useWallTransaction();

//         React.useEffect(() => {
//             wallTransaction.startTransaction('editing');
//         }, []);

//         return <>{children({ wallTransaction })}</>;
//     };

//     describe('MovePoleAction Integration', () => {
//         it('should push MovePoleAction to transaction and verify undo stack', () => {
//             let transaction: ReturnType<typeof useWallTransaction> | null = null;
//             let capturedPoles: Pole[] = [...initialPoles];

//             const testOnPolesChange = (poles: Pole[]) => {
//                 capturedPoles = [...poles];
//             };

//             const { container } = render(
//                 <Provider store={mockStore}>
//                     <TestWrapper>
//                         {({ wallTransaction }) => {
//                             transaction = wallTransaction;
//                             return (
//                                 <WallTransformer
//                                     poles={initialPoles}
//                                     onPolesChange={testOnPolesChange}
//                                     gridConfig={defaultGridConfig}
//                                     wallTransaction={wallTransaction}
//                                 />
//                             );
//                         }}
//                     </TestWrapper>
//                 </Provider>
//             );

//             expect(container.querySelector('[data-testid="konva-group"]')).toBeTruthy();

//             const action = createMovePoleAction(
//                 0,
//                 { x: 0, y: 0 },
//                 { x: 50, y: 50 },
//                 testOnPolesChange,
//                 () => capturedPoles,
//                 () => false
//             );

//             transaction!.pushLocalAction(action);

//             expect(transaction!.transaction.localUndoStack.length).toBe(1);
//             expect(transaction!.transaction.localUndoStack[0].type).toBe('MOVE_POLE');
//             expect(transaction!.canUndoLocal()).toBe(true);
//         });

//         it('should undo pole move and restore old position', () => {
//             let transaction: ReturnType<typeof useWallTransaction> | null = null;
//             let capturedPoles: Pole[] = [...initialPoles];

//             const testOnPolesChange = (poles: Pole[]) => {
//                 capturedPoles = [...poles];
//             };

//             render(
//                 <Provider store={mockStore}>
//                     <TestWrapper>
//                         {({ wallTransaction }) => {
//                             transaction = wallTransaction;
//                             return (
//                                 <WallTransformer
//                                     poles={initialPoles}
//                                     onPolesChange={testOnPolesChange}
//                                     gridConfig={defaultGridConfig}
//                                     wallTransaction={wallTransaction}
//                                 />
//                             );
//                         }}
//                     </TestWrapper>
//                 </Provider>
//             );

//             const originalPosition = { ...initialPoles[0] };

//             const action = createMovePoleAction(
//                 0,
//                 { x: 0, y: 0 },
//                 { x: 50, y: 50 },
//                 testOnPolesChange,
//                 () => capturedPoles,
//                 () => false
//             );

//             transaction!.pushLocalAction(action);
//             action.redo();

//             expect(capturedPoles[0].x).toBe(50);
//             expect(capturedPoles[0].y).toBe(50);

//             transaction!.undoLocal();

//             expect(capturedPoles[0].x).toBe(originalPosition.x);
//             expect(capturedPoles[0].y).toBe(originalPosition.y);
//             expect(transaction!.canUndoLocal()).toBe(false);
//             expect(transaction!.canRedoLocal()).toBe(true);
//         });

//         it('should redo pole move and reapply new position', () => {
//             let transaction: ReturnType<typeof useWallTransaction> | null = null;
//             let capturedPoles: Pole[] = [...initialPoles];

//             const testOnPolesChange = (poles: Pole[]) => {
//                 capturedPoles = [...poles];
//             };

//             render(
//                 <Provider store={mockStore}>
//                     <TestWrapper>
//                         {({ wallTransaction }) => {
//                             transaction = wallTransaction;
//                             return (
//                                 <WallTransformer
//                                     poles={initialPoles}
//                                     onPolesChange={testOnPolesChange}
//                                     gridConfig={defaultGridConfig}
//                                     wallTransaction={wallTransaction}
//                                 />
//                             );
//                         }}
//                     </TestWrapper>
//                 </Provider>
//             );

//             const action = createMovePoleAction(
//                 0,
//                 { x: 0, y: 0 },
//                 { x: 50, y: 50 },
//                 testOnPolesChange,
//                 () => capturedPoles,
//                 () => false
//             );

//             transaction!.pushLocalAction(action);
//             action.redo();

//             transaction!.undoLocal();

//             transaction!.redoLocal();

//             expect(capturedPoles[0].x).toBe(50);
//             expect(capturedPoles[0].y).toBe(50);
//             expect(transaction!.canUndoLocal()).toBe(true);
//             expect(transaction!.canRedoLocal()).toBe(false);
//         });
//     });

//     describe('MultiMovePoleAction Integration', () => {
//         it('should push single composite MultiMovePoleAction', () => {
//             let transaction: ReturnType<typeof useWallTransaction> | null = null;
//             let capturedPoles: Pole[] = [...initialPoles];

//             const testOnPolesChange = (poles: Pole[]) => {
//                 capturedPoles = [...poles];
//             };

//             render(
//                 <Provider store={mockStore}>
//                     <TestWrapper>
//                         {({ wallTransaction }) => {
//                             transaction = wallTransaction;
//                             return (
//                                 <WallTransformer
//                                     poles={initialPoles}
//                                     onPolesChange={testOnPolesChange}
//                                     gridConfig={defaultGridConfig}
//                                     wallTransaction={wallTransaction}
//                                 />
//                             );
//                         }}
//                     </TestWrapper>
//                 </Provider>
//             );

//             const moves = [
//                 { poleIndex: 0, oldPosition: { x: 0, y: 0 }, newPosition: { x: 10, y: 10 } },
//                 { poleIndex: 1, oldPosition: { x: 100, y: 0 }, newPosition: { x: 110, y: 10 } },
//                 { poleIndex: 2, oldPosition: { x: 100, y: 100 }, newPosition: { x: 110, y: 110 } },
//             ];

//             const action = createMultiMovePoleAction(
//                 moves,
//                 testOnPolesChange,
//                 () => capturedPoles,
//                 () => false
//             );

//             transaction!.pushLocalAction(action);

//             expect(transaction!.transaction.localUndoStack.length).toBe(1);
//             expect(transaction!.transaction.localUndoStack[0].type).toBe('MULTI_MOVE_POLE');
//         });

//         it('should undo multi-pole move and restore ALL 3 pole positions in one operation', () => {
//             let transaction: ReturnType<typeof useWallTransaction> | null = null;
//             let capturedPoles: Pole[] = [...initialPoles];

//             const testOnPolesChange = (poles: Pole[]) => {
//                 capturedPoles = [...poles];
//             };

//             render(
//                 <Provider store={mockStore}>
//                     <TestWrapper>
//                         {({ wallTransaction }) => {
//                             transaction = wallTransaction;
//                             return (
//                                 <WallTransformer
//                                     poles={initialPoles}
//                                     onPolesChange={testOnPolesChange}
//                                     gridConfig={defaultGridConfig}
//                                     wallTransaction={wallTransaction}
//                                 />
//                             );
//                         }}
//                     </TestWrapper>
//                 </Provider>
//             );

//             const originalPoles = [
//                 { ...initialPoles[0] },
//                 { ...initialPoles[1] },
//                 { ...initialPoles[2] },
//             ];

//             const moves = [
//                 { poleIndex: 0, oldPosition: { x: 0, y: 0 }, newPosition: { x: 10, y: 10 } },
//                 { poleIndex: 1, oldPosition: { x: 100, y: 0 }, newPosition: { x: 110, y: 10 } },
//                 { poleIndex: 2, oldPosition: { x: 100, y: 100 }, newPosition: { x: 110, y: 110 } },
//             ];

//             const action = createMultiMovePoleAction(
//                 moves,
//                 testOnPolesChange,
//                 () => capturedPoles,
//                 () => false
//             );

//             transaction!.pushLocalAction(action);
//             action.redo();

//             transaction!.undoLocal();

//             expect(capturedPoles[0]).toEqual(originalPoles[0]);
//             expect(capturedPoles[1]).toEqual(originalPoles[1]);
//             expect(capturedPoles[2]).toEqual(originalPoles[2]);
//             expect(transaction!.canUndoLocal()).toBe(false);
//             expect(transaction!.canRedoLocal()).toBe(true);
//         });

//         it('should redo multi-pole move and reapply ALL 3 pole movements in one operation', () => {
//             let transaction: ReturnType<typeof useWallTransaction> | null = null;
//             let capturedPoles: Pole[] = [...initialPoles];

//             const testOnPolesChange = (poles: Pole[]) => {
//                 capturedPoles = [...poles];
//             };

//             render(
//                 <Provider store={mockStore}>
//                     <TestWrapper>
//                         {({ wallTransaction }) => {
//                             transaction = wallTransaction;
//                             return (
//                                 <WallTransformer
//                                     poles={initialPoles}
//                                     onPolesChange={testOnPolesChange}
//                                     gridConfig={defaultGridConfig}
//                                     wallTransaction={wallTransaction}
//                                 />
//                             );
//                         }}
//                     </TestWrapper>
//                 </Provider>
//             );

//             const moves = [
//                 { poleIndex: 0, oldPosition: { x: 0, y: 0 }, newPosition: { x: 10, y: 10 } },
//                 { poleIndex: 1, oldPosition: { x: 100, y: 0 }, newPosition: { x: 110, y: 10 } },
//                 { poleIndex: 2, oldPosition: { x: 100, y: 100 }, newPosition: { x: 110, y: 110 } },
//             ];

//             const action = createMultiMovePoleAction(
//                 moves,
//                 testOnPolesChange,
//                 () => capturedPoles,
//                 () => false
//             );

//             transaction!.pushLocalAction(action);
//             action.redo();

//             transaction!.undoLocal();

//             transaction!.redoLocal();

//             expect(capturedPoles[0].x).toBe(10);
//             expect(capturedPoles[0].y).toBe(10);
//             expect(capturedPoles[1].x).toBe(110);
//             expect(capturedPoles[1].y).toBe(10);
//             expect(capturedPoles[2].x).toBe(110);
//             expect(capturedPoles[2].y).toBe(110);
//             expect(transaction!.canUndoLocal()).toBe(true);
//             expect(transaction!.canRedoLocal()).toBe(false);
//         });
//     });

//     describe('InsertPoleAction Integration', () => {
//         it('should push InsertPoleAction to transaction', () => {
//             let transaction: ReturnType<typeof useWallTransaction> | null = null;
//             let capturedPoles: Pole[] = [...initialPoles];

//             const testOnPolesChange = (poles: Pole[]) => {
//                 capturedPoles = [...poles];
//             };

//             render(
//                 <Provider store={mockStore}>
//                     <TestWrapper>
//                         {({ wallTransaction }) => {
//                             transaction = wallTransaction;
//                             return (
//                                 <WallTransformer
//                                     poles={initialPoles}
//                                     onPolesChange={testOnPolesChange}
//                                     gridConfig={defaultGridConfig}
//                                     wallTransaction={wallTransaction}
//                                 />
//                             );
//                         }}
//                     </TestWrapper>
//                 </Provider>
//             );

//             const newPole: Pole = { x: 50, y: 0, h: 10 };

//             const action = createInsertPoleAction(
//                 1,
//                 newPole,
//                 testOnPolesChange,
//                 () => capturedPoles,
//                 () => false
//             );

//             transaction!.pushLocalAction(action);

//             expect(transaction!.transaction.localUndoStack.length).toBe(1);
//             expect(transaction!.transaction.localUndoStack[0].type).toBe('INSERT_POLE');
//             expect(transaction!.canUndoLocal()).toBe(true);
//         });

//         it('should undo pole insertion and remove inserted pole', () => {
//             let transaction: ReturnType<typeof useWallTransaction> | null = null;
//             let capturedPoles: Pole[] = [...initialPoles];

//             const testOnPolesChange = (poles: Pole[]) => {
//                 capturedPoles = [...poles];
//             };

//             render(
//                 <Provider store={mockStore}>
//                     <TestWrapper>
//                         {({ wallTransaction }) => {
//                             transaction = wallTransaction;
//                             return (
//                                 <WallTransformer
//                                     poles={initialPoles}
//                                     onPolesChange={testOnPolesChange}
//                                     gridConfig={defaultGridConfig}
//                                     wallTransaction={wallTransaction}
//                                 />
//                             );
//                         }}
//                     </TestWrapper>
//                 </Provider>
//             );

//             const originalCount = initialPoles.length;
//             const newPole: Pole = { x: 50, y: 0, h: 10 };

//             const action = createInsertPoleAction(
//                 1,
//                 newPole,
//                 testOnPolesChange,
//                 () => capturedPoles,
//                 () => false
//             );

//             transaction!.pushLocalAction(action);
//             action.redo();

//             expect(capturedPoles.length).toBe(originalCount + 1);

//             transaction!.undoLocal();

//             expect(capturedPoles.length).toBe(originalCount);
//             expect(transaction!.canUndoLocal()).toBe(false);
//             expect(transaction!.canRedoLocal()).toBe(true);
//         });

//         it('should redo pole insertion and re-insert pole at same position', () => {
//             let transaction: ReturnType<typeof useWallTransaction> | null = null;
//             let capturedPoles: Pole[] = [...initialPoles];

//             const testOnPolesChange = (poles: Pole[]) => {
//                 capturedPoles = [...poles];
//             };

//             render(
//                 <Provider store={mockStore}>
//                     <TestWrapper>
//                         {({ wallTransaction }) => {
//                             transaction = wallTransaction;
//                             return (
//                                 <WallTransformer
//                                     poles={initialPoles}
//                                     onPolesChange={testOnPolesChange}
//                                     gridConfig={defaultGridConfig}
//                                     wallTransaction={wallTransaction}
//                                 />
//                             );
//                         }}
//                     </TestWrapper>
//                 </Provider>
//             );

//             const newPole: Pole = { x: 50, y: 0, h: 10 };

//             const action = createInsertPoleAction(
//                 1,
//                 newPole,
//                 testOnPolesChange,
//                 () => capturedPoles,
//                 () => false
//             );

//             transaction!.pushLocalAction(action);
//             action.redo();

//             transaction!.undoLocal();

//             transaction!.redoLocal();

//             expect(capturedPoles.length).toBe(initialPoles.length + 1);
//             expect(capturedPoles[1]).toEqual(newPole);
//             expect(transaction!.canUndoLocal()).toBe(true);
//             expect(transaction!.canRedoLocal()).toBe(false);
//         });
//     });

//     describe('DeletePoleAction Integration', () => {
//         it('should push DeletePoleAction to transaction', () => {
//             let transaction: ReturnType<typeof useWallTransaction> | null = null;
//             let capturedPoles: Pole[] = [...initialPoles];

//             const testOnPolesChange = (poles: Pole[]) => {
//                 capturedPoles = [...poles];
//             };

//             render(
//                 <Provider store={mockStore}>
//                     <TestWrapper>
//                         {({ wallTransaction }) => {
//                             transaction = wallTransaction;
//                             return (
//                                 <WallTransformer
//                                     poles={initialPoles}
//                                     onPolesChange={testOnPolesChange}
//                                     gridConfig={defaultGridConfig}
//                                     wallTransaction={wallTransaction}
//                                 />
//                             );
//                         }}
//                     </TestWrapper>
//                 </Provider>
//             );

//             const action = createDeletePoleAction(
//                 [1],
//                 [initialPoles[1]],
//                 testOnPolesChange,
//                 () => capturedPoles,
//                 () => false
//             );

//             transaction!.pushLocalAction(action);

//             expect(transaction!.transaction.localUndoStack.length).toBe(1);
//             expect(transaction!.transaction.localUndoStack[0].type).toBe('DELETE_POLE');
//         });

//         it('should undo pole deletion and restore deleted poles at correct indices', () => {
//             let transaction: ReturnType<typeof useWallTransaction> | null = null;
//             let capturedPoles: Pole[] = [...initialPoles];

//             const testOnPolesChange = (poles: Pole[]) => {
//                 capturedPoles = [...poles];
//             };

//             render(
//                 <Provider store={mockStore}>
//                     <TestWrapper>
//                         {({ wallTransaction }) => {
//                             transaction = wallTransaction;
//                             return (
//                                 <WallTransformer
//                                     poles={initialPoles}
//                                     onPolesChange={testOnPolesChange}
//                                     gridConfig={defaultGridConfig}
//                                     wallTransaction={wallTransaction}
//                                 />
//                             );
//                         }}
//                     </TestWrapper>
//                 </Provider>
//             );

//             const deletedPole = { ...initialPoles[1] };

//             const action = createDeletePoleAction(
//                 [1],
//                 [deletedPole],
//                 testOnPolesChange,
//                 () => capturedPoles,
//                 () => false
//             );

//             transaction!.pushLocalAction(action);
//             action.redo();

//             expect(capturedPoles.length).toBe(initialPoles.length - 1);

//             transaction!.undoLocal();

//             expect(capturedPoles.length).toBe(initialPoles.length);
//             expect(capturedPoles[1]).toEqual(deletedPole);
//             expect(transaction!.canUndoLocal()).toBe(false);
//             expect(transaction!.canRedoLocal()).toBe(true);
//         });

//         it('should handle multiple pole delete and restore correctly', () => {
//             let transaction: ReturnType<typeof useWallTransaction> | null = null;
//             let capturedPoles: Pole[] = [...initialPoles];

//             const testOnPolesChange = (poles: Pole[]) => {
//                 capturedPoles = [...poles];
//             };

//             render(
//                 <Provider store={mockStore}>
//                     <TestWrapper>
//                         {({ wallTransaction }) => {
//                             transaction = wallTransaction;
//                             return (
//                                 <WallTransformer
//                                     poles={initialPoles}
//                                     onPolesChange={testOnPolesChange}
//                                     gridConfig={defaultGridConfig}
//                                     wallTransaction={wallTransaction}
//                                 />
//                             );
//                         }}
//                     </TestWrapper>
//                 </Provider>
//             );

//             const deletedPole1 = { ...initialPoles[1] };
//             const deletedPole2 = { ...initialPoles[2] };

//             const action = createDeletePoleAction(
//                 [1, 2],
//                 [deletedPole1, deletedPole2],
//                 testOnPolesChange,
//                 () => capturedPoles,
//                 () => false
//             );

//             transaction!.pushLocalAction(action);
//             action.redo();

//             expect(capturedPoles.length).toBe(initialPoles.length - 2);

//             transaction!.undoLocal();

//             expect(capturedPoles.length).toBe(initialPoles.length);
//             expect(capturedPoles[1]).toEqual(deletedPole1);
//             expect(capturedPoles[2]).toEqual(deletedPole2);
//         });
//     });

//     describe('MoveLineAction Integration', () => {
//         it('should push MoveLineAction to transaction', () => {
//             let transaction: ReturnType<typeof useWallTransaction> | null = null;
//             let capturedPoles: Pole[] = [...initialPoles];

//             const testOnPolesChange = (poles: Pole[]) => {
//                 capturedPoles = [...poles];
//             };

//             render(
//                 <Provider store={mockStore}>
//                     <TestWrapper>
//                         {({ wallTransaction }) => {
//                             transaction = wallTransaction;
//                             return (
//                                 <WallTransformer
//                                     poles={initialPoles}
//                                     onPolesChange={testOnPolesChange}
//                                     gridConfig={defaultGridConfig}
//                                     wallTransaction={wallTransaction}
//                                 />
//                             );
//                         }}
//                     </TestWrapper>
//                 </Provider>
//             );

//             const action = createMoveLineAction(
//                 0,
//                 1,
//                 { x: 0, y: 0 },
//                 { x: 100, y: 0 },
//                 { x: 10, y: 10 },
//                 { x: 110, y: 10 },
//                 testOnPolesChange,
//                 () => capturedPoles,
//                 () => false
//             );

//             transaction!.pushLocalAction(action);

//             expect(transaction!.transaction.localUndoStack.length).toBe(1);
//             expect(transaction!.transaction.localUndoStack[0].type).toBe('MOVE_LINE');
//         });

//         it('should undo line move and restore both pole positions', () => {
//             let transaction: ReturnType<typeof useWallTransaction> | null = null;
//             let capturedPoles: Pole[] = [...initialPoles];

//             const testOnPolesChange = (poles: Pole[]) => {
//                 capturedPoles = [...poles];
//             };

//             render(
//                 <Provider store={mockStore}>
//                     <TestWrapper>
//                         {({ wallTransaction }) => {
//                             transaction = wallTransaction;
//                             return (
//                                 <WallTransformer
//                                     poles={initialPoles}
//                                     onPolesChange={testOnPolesChange}
//                                     gridConfig={defaultGridConfig}
//                                     wallTransaction={wallTransaction}
//                                 />
//                             );
//                         }}
//                     </TestWrapper>
//                 </Provider>
//             );

//             const originalPole1 = { ...initialPoles[0] };
//             const originalPole2 = { ...initialPoles[1] };

//             const action = createMoveLineAction(
//                 0,
//                 1,
//                 { x: 0, y: 0 },
//                 { x: 100, y: 0 },
//                 { x: 10, y: 10 },
//                 { x: 110, y: 10 },
//                 testOnPolesChange,
//                 () => capturedPoles,
//                 () => false
//             );

//             transaction!.pushLocalAction(action);
//             action.redo();

//             transaction!.undoLocal();

//             expect(capturedPoles[0]).toEqual(originalPole1);
//             expect(capturedPoles[1]).toEqual(originalPole2);
//             expect(transaction!.canUndoLocal()).toBe(false);
//             expect(transaction!.canRedoLocal()).toBe(true);
//         });

//         it('should redo line move and reapply both pole movements', () => {
//             let transaction: ReturnType<typeof useWallTransaction> | null = null;
//             let capturedPoles: Pole[] = [...initialPoles];

//             const testOnPolesChange = (poles: Pole[]) => {
//                 capturedPoles = [...poles];
//             };

//             render(
//                 <Provider store={mockStore}>
//                     <TestWrapper>
//                         {({ wallTransaction }) => {
//                             transaction = wallTransaction;
//                             return (
//                                 <WallTransformer
//                                     poles={initialPoles}
//                                     onPolesChange={testOnPolesChange}
//                                     gridConfig={defaultGridConfig}
//                                     wallTransaction={wallTransaction}
//                                 />
//                             );
//                         }}
//                     </TestWrapper>
//                 </Provider>
//             );

//             const action = createMoveLineAction(
//                 0,
//                 1,
//                 { x: 0, y: 0 },
//                 { x: 100, y: 0 },
//                 { x: 10, y: 10 },
//                 { x: 110, y: 10 },
//                 testOnPolesChange,
//                 () => capturedPoles,
//                 () => false
//             );

//             transaction!.pushLocalAction(action);
//             action.redo();

//             transaction!.undoLocal();

//             transaction!.redoLocal();

//             expect(capturedPoles[0].x).toBe(10);
//             expect(capturedPoles[0].y).toBe(10);
//             expect(capturedPoles[1].x).toBe(110);
//             expect(capturedPoles[1].y).toBe(10);
//             expect(transaction!.canUndoLocal()).toBe(true);
//             expect(transaction!.canRedoLocal()).toBe(false);
//         });
//     });

//     describe('Component Rendering with Real Hook', () => {
//         it('should render component with real wallTransaction hook', () => {
//             let transaction: ReturnType<typeof useWallTransaction> | null = null;

//             const { container } = render(
//                 <Provider store={mockStore}>
//                     <TestWrapper>
//                         {({ wallTransaction }) => {
//                             transaction = wallTransaction;
//                             return (
//                                 <WallTransformer
//                                     poles={initialPoles}
//                                     onPolesChange={vi.fn()}
//                                     gridConfig={defaultGridConfig}
//                                     wallTransaction={wallTransaction}
//                                 />
//                             );
//                         }}
//                     </TestWrapper>
//                 </Provider>
//             );

//             expect(container.querySelector('[data-testid="konva-group"]')).toBeTruthy();
//             expect(transaction).not.toBeNull();
//             expect(transaction!.transaction.isActive).toBe(true);
//             expect(transaction!.transaction.type).toBe('editing');
//         });

//         it('should initialize real hook with empty undo/redo stacks', () => {
//             let transaction: ReturnType<typeof useWallTransaction> | null = null;

//             render(
//                 <Provider store={mockStore}>
//                     <TestWrapper>
//                         {({ wallTransaction }) => {
//                             transaction = wallTransaction;
//                             return (
//                                 <WallTransformer
//                                     poles={initialPoles}
//                                     onPolesChange={vi.fn()}
//                                     gridConfig={defaultGridConfig}
//                                     wallTransaction={wallTransaction}
//                                 />
//                             );
//                         }}
//                     </TestWrapper>
//                 </Provider>
//             );

//             expect(transaction!.transaction.localUndoStack).toEqual([]);
//             expect(transaction!.transaction.localRedoStack).toEqual([]);
//             expect(transaction!.canUndoLocal()).toBe(false);
//             expect(transaction!.canRedoLocal()).toBe(false);
//         });
//     });

//     describe('Real Hook State Management', () => {
//         it('should maintain correct canUndo/canRedo state throughout lifecycle', () => {
//             let transaction: ReturnType<typeof useWallTransaction> | null = null;
//             let capturedPoles: Pole[] = [...initialPoles];

//             const testOnPolesChange = (poles: Pole[]) => {
//                 capturedPoles = [...poles];
//             };

//             render(
//                 <Provider store={mockStore}>
//                     <TestWrapper>
//                         {({ wallTransaction }) => {
//                             transaction = wallTransaction;
//                             return (
//                                 <WallTransformer
//                                     poles={initialPoles}
//                                     onPolesChange={testOnPolesChange}
//                                     gridConfig={defaultGridConfig}
//                                     wallTransaction={wallTransaction}
//                                 />
//                             );
//                         }}
//                     </TestWrapper>
//                 </Provider>
//             );

//             expect(transaction!.canUndoLocal()).toBe(false);
//             expect(transaction!.canRedoLocal()).toBe(false);

//             const action = createMovePoleAction(
//                 0,
//                 { x: 0, y: 0 },
//                 { x: 50, y: 50 },
//                 testOnPolesChange,
//                 () => capturedPoles,
//                 () => false
//             );

//             transaction!.pushLocalAction(action);

//             expect(transaction!.canUndoLocal()).toBe(true);
//             expect(transaction!.canRedoLocal()).toBe(false);

//             transaction!.undoLocal();

//             expect(transaction!.canUndoLocal()).toBe(false);
//             expect(transaction!.canRedoLocal()).toBe(true);

//             transaction!.redoLocal();

//             expect(transaction!.canUndoLocal()).toBe(true);
//             expect(transaction!.canRedoLocal()).toBe(false);
//         });

//         it('should clear redo stack when new action is performed after undo', () => {
//             let transaction: ReturnType<typeof useWallTransaction> | null = null;
//             let capturedPoles: Pole[] = [...initialPoles];

//             const testOnPolesChange = (poles: Pole[]) => {
//                 capturedPoles = [...poles];
//             };

//             render(
//                 <Provider store={mockStore}>
//                     <TestWrapper>
//                         {({ wallTransaction }) => {
//                             transaction = wallTransaction;
//                             return (
//                                 <WallTransformer
//                                     poles={initialPoles}
//                                     onPolesChange={testOnPolesChange}
//                                     gridConfig={defaultGridConfig}
//                                     wallTransaction={wallTransaction}
//                                 />
//                             );
//                         }}
//                     </TestWrapper>
//                 </Provider>
//             );

//             const action1 = createMovePoleAction(
//                 0,
//                 { x: 0, y: 0 },
//                 { x: 50, y: 50 },
//                 testOnPolesChange,
//                 () => capturedPoles,
//                 () => false
//             );

//             transaction!.pushLocalAction(action1);

//             transaction!.undoLocal();

//             expect(transaction!.canRedoLocal()).toBe(true);

//             const action2 = createMovePoleAction(
//                 1,
//                 { x: 100, y: 0 },
//                 { x: 150, y: 50 },
//                 testOnPolesChange,
//                 () => capturedPoles,
//                 () => false
//             );

//             transaction!.pushLocalAction(action2);

//             expect(transaction!.canRedoLocal()).toBe(false);
//             expect(transaction!.transaction.localRedoStack.length).toBe(0);
//         });

//         it('should handle multiple undo operations with real hook', () => {
//             let transaction: ReturnType<typeof useWallTransaction> | null = null;
//             let capturedPoles: Pole[] = [...initialPoles];

//             const testOnPolesChange = (poles: Pole[]) => {
//                 capturedPoles = [...poles];
//             };

//             render(
//                 <Provider store={mockStore}>
//                     <TestWrapper>
//                         {({ wallTransaction }) => {
//                             transaction = wallTransaction;
//                             return (
//                                 <WallTransformer
//                                     poles={initialPoles}
//                                     onPolesChange={testOnPolesChange}
//                                     gridConfig={defaultGridConfig}
//                                     wallTransaction={wallTransaction}
//                                 />
//                             );
//                         }}
//                     </TestWrapper>
//                 </Provider>
//             );

//             const action1 = createMovePoleAction(0, { x: 0, y: 0 }, { x: 10, y: 10 }, testOnPolesChange, () => capturedPoles, () => false);
//             const action2 = createMovePoleAction(1, { x: 100, y: 0 }, { x: 110, y: 10 }, testOnPolesChange, () => capturedPoles, () => false);
//             const action3 = createMovePoleAction(2, { x: 100, y: 100 }, { x: 110, y: 110 }, testOnPolesChange, () => capturedPoles, () => false);

//             transaction!.pushLocalAction(action1);
//             transaction!.pushLocalAction(action2);
//             transaction!.pushLocalAction(action3);

//             expect(transaction!.transaction.localUndoStack.length).toBe(3);
//             expect(transaction!.transaction.localRedoStack.length).toBe(0);

//             transaction!.undoLocal();

//             expect(transaction!.transaction.localUndoStack.length).toBe(2);
//             expect(transaction!.transaction.localRedoStack.length).toBe(1);

//             transaction!.undoLocal();

//             expect(transaction!.transaction.localUndoStack.length).toBe(1);
//             expect(transaction!.transaction.localRedoStack.length).toBe(2);

//             transaction!.undoLocal();

//             expect(transaction!.transaction.localUndoStack.length).toBe(0);
//             expect(transaction!.transaction.localRedoStack.length).toBe(3);
//             expect(transaction!.canUndoLocal()).toBe(false);
//             expect(transaction!.canRedoLocal()).toBe(true);
//         });
//     });
// });
