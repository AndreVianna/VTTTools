// TODO: Phase 8.8 - Re-enable when Wall types are fully implemented
// import { describe, it, expect, vi, beforeEach } from 'vitest';
// import type { Pole } from '@/types/domain';
// import {
//     createPlacePoleAction,
//     createMovePoleAction,
//     createInsertPoleAction,
//     createDeletePoleAction,
//     createMultiMovePoleAction,
//     createMoveLineAction,
//     createBreakWallAction,
// } from './wallUndoActions';

// describe('wallUndoActions', () => {
//     describe('createPlacePoleAction', () => {
//         let mockPoles: Pole[];
//         let mockOnPolesChange: ReturnType<typeof vi.fn>;
//         let mockGetCurrentPoles: ReturnType<typeof vi.fn>;
//         let mockGetCurrentIsClosed: ReturnType<typeof vi.fn>;

//         beforeEach(() => {
//             mockPoles = [
//                 { x: 0, y: 0, h: 10 },
//                 { x: 10, y: 0, h: 10 },
//             ];
//             mockOnPolesChange = vi.fn();
//             mockGetCurrentPoles = vi.fn(() => mockPoles);
//             mockGetCurrentIsClosed = vi.fn(() => false);
//         });

//         it('should create action with correct type and description', () => {
//             const pole: Pole = { x: 5, y: 5, h: 10 };
//             const action = createPlacePoleAction(
//                 1,
//                 pole,
//                 mockOnPolesChange,
//                 mockGetCurrentPoles,
//                 mockGetCurrentIsClosed
//             );

//             expect(action.type).toBe('PLACE_POLE');
//             expect(action.description).toBe('Place pole at (5, 5)');
//             expect(action.poleIndex).toBe(1);
//             expect(action.pole).toEqual(pole);
//         });

//         it('should remove pole at correct index on undo', () => {
//             const pole: Pole = { x: 5, y: 5, h: 10 };
//             const action = createPlacePoleAction(
//                 1,
//                 pole,
//                 mockOnPolesChange,
//                 mockGetCurrentPoles,
//                 mockGetCurrentIsClosed
//             );

//             action.undo();

//             expect(mockOnPolesChange).toHaveBeenCalledWith(
//                 [{ x: 0, y: 0, h: 10 }],
//                 false
//             );
//         });

//         it('should re-insert pole at correct index on redo', () => {
//             const pole: Pole = { x: 5, y: 5, h: 10 };
//             const action = createPlacePoleAction(
//                 1,
//                 pole,
//                 mockOnPolesChange,
//                 mockGetCurrentPoles,
//                 mockGetCurrentIsClosed
//             );

//             action.redo();

//             expect(mockOnPolesChange).toHaveBeenCalledWith(
//                 [
//                     { x: 0, y: 0, h: 10 },
//                     { x: 5, y: 5, h: 10 },
//                     { x: 10, y: 0, h: 10 },
//                 ],
//                 false
//             );
//         });

//         it('should preserve height property during undo/redo cycles', () => {
//             const pole: Pole = { x: 5, y: 5, h: 15 };
//             mockPoles = [
//                 { x: 0, y: 0, h: 10 },
//                 { x: 5, y: 5, h: 15 },
//                 { x: 10, y: 0, h: 10 },
//             ];

//             const action = createPlacePoleAction(
//                 1,
//                 pole,
//                 mockOnPolesChange,
//                 mockGetCurrentPoles,
//                 mockGetCurrentIsClosed
//             );

//             action.undo();
//             const undoCall = mockOnPolesChange.mock.calls[0][0];
//             expect(undoCall).toHaveLength(2);
//             expect(undoCall[0].h).toBe(10);
//             expect(undoCall[1].h).toBe(10);

//             mockOnPolesChange.mockClear();
//             mockPoles = undoCall;

//             action.redo();
//             const redoCall = mockOnPolesChange.mock.calls[0][0];
//             expect(redoCall).toHaveLength(3);
//             expect(redoCall[1].h).toBe(15);
//         });

//         it('should handle multiple undo/redo cycles correctly', () => {
//             const pole: Pole = { x: 5, y: 5, h: 10 };
//             mockPoles = [
//                 { x: 0, y: 0, h: 10 },
//                 { x: 5, y: 5, h: 10 },
//                 { x: 10, y: 0, h: 10 },
//             ];
//             const action = createPlacePoleAction(
//                 1,
//                 pole,
//                 mockOnPolesChange,
//                 mockGetCurrentPoles,
//                 mockGetCurrentIsClosed
//             );

//             action.undo();
//             expect(mockOnPolesChange).toHaveBeenCalledTimes(1);
//             expect(mockOnPolesChange.mock.calls[0][0]).toHaveLength(2);
//             mockPoles = mockOnPolesChange.mock.calls[0][0];

//             action.redo();
//             expect(mockOnPolesChange).toHaveBeenCalledTimes(2);
//             expect(mockOnPolesChange.mock.calls[1][0]).toHaveLength(3);
//             mockPoles = mockOnPolesChange.mock.calls[1][0];

//             action.undo();
//             expect(mockOnPolesChange).toHaveBeenCalledTimes(3);
//             expect(mockOnPolesChange.mock.calls[2][0]).toHaveLength(2);
//         });
//     });

//     describe('createMovePoleAction', () => {
//         let mockPoles: Pole[];
//         let mockOnPolesChange: ReturnType<typeof vi.fn>;
//         let mockGetCurrentPoles: ReturnType<typeof vi.fn>;
//         let mockGetCurrentIsClosed: ReturnType<typeof vi.fn>;

//         beforeEach(() => {
//             mockPoles = [
//                 { x: 0, y: 0, h: 10 },
//                 { x: 10, y: 0, h: 10 },
//                 { x: 10, y: 10, h: 10 },
//             ];
//             mockOnPolesChange = vi.fn();
//             mockGetCurrentPoles = vi.fn(() => mockPoles);
//             mockGetCurrentIsClosed = vi.fn(() => false);
//         });

//         it('should create action with correct type and description', () => {
//             const action = createMovePoleAction(
//                 1,
//                 { x: 10, y: 0 },
//                 { x: 15, y: 5 },
//                 mockOnPolesChange,
//                 mockGetCurrentPoles,
//                 mockGetCurrentIsClosed
//             );

//             expect(action.type).toBe('MOVE_POLE');
//             expect(action.description).toBe('Move pole 1 from (10,0) to (15,5)');
//             expect(action.poleIndex).toBe(1);
//             expect(action.oldPosition).toEqual({ x: 10, y: 0 });
//             expect(action.newPosition).toEqual({ x: 15, y: 5 });
//         });

//         it('should restore old position on undo', () => {
//             const action = createMovePoleAction(
//                 1,
//                 { x: 10, y: 0 },
//                 { x: 15, y: 5 },
//                 mockOnPolesChange,
//                 mockGetCurrentPoles,
//                 mockGetCurrentIsClosed
//             );

//             action.undo();

//             const updatedPoles = mockOnPolesChange.mock.calls[0][0];
//             expect(updatedPoles[1]).toEqual({ x: 10, y: 0, h: 10 });
//         });

//         it('should apply new position on redo', () => {
//             const action = createMovePoleAction(
//                 1,
//                 { x: 10, y: 0 },
//                 { x: 15, y: 5 },
//                 mockOnPolesChange,
//                 mockGetCurrentPoles,
//                 mockGetCurrentIsClosed
//             );

//             action.redo();

//             const updatedPoles = mockOnPolesChange.mock.calls[0][0];
//             expect(updatedPoles[1]).toEqual({ x: 15, y: 5, h: 10 });
//         });

//         it('should not affect height property during move', () => {
//             mockPoles[1].h = 20;
//             const action = createMovePoleAction(
//                 1,
//                 { x: 10, y: 0 },
//                 { x: 15, y: 5 },
//                 mockOnPolesChange,
//                 mockGetCurrentPoles,
//                 mockGetCurrentIsClosed
//             );

//             action.undo();
//             expect(mockOnPolesChange.mock.calls[0][0][1].h).toBe(20);

//             action.redo();
//             expect(mockOnPolesChange.mock.calls[1][0][1].h).toBe(20);
//         });

//         it('should pass isClosed to callback', () => {
//             mockGetCurrentIsClosed.mockReturnValue(true);
//             const action = createMovePoleAction(
//                 1,
//                 { x: 10, y: 0 },
//                 { x: 15, y: 5 },
//                 mockOnPolesChange,
//                 mockGetCurrentPoles,
//                 mockGetCurrentIsClosed
//             );

//             action.undo();

//             expect(mockOnPolesChange).toHaveBeenCalledWith(
//                 expect.any(Array),
//                 true
//             );
//         });
//     });

//     describe('createInsertPoleAction', () => {
//         let mockPoles: Pole[];
//         let mockOnPolesChange: ReturnType<typeof vi.fn>;
//         let mockGetCurrentPoles: ReturnType<typeof vi.fn>;
//         let mockGetCurrentIsClosed: ReturnType<typeof vi.fn>;

//         beforeEach(() => {
//             mockPoles = [
//                 { x: 0, y: 0, h: 10 },
//                 { x: 10, y: 0, h: 10 },
//                 { x: 10, y: 10, h: 10 },
//             ];
//             mockOnPolesChange = vi.fn();
//             mockGetCurrentPoles = vi.fn(() => mockPoles);
//             mockGetCurrentIsClosed = vi.fn(() => false);
//         });

//         it('should create action with correct type and description', () => {
//             const pole: Pole = { x: 5, y: 0, h: 10 };
//             const action = createInsertPoleAction(
//                 1,
//                 pole,
//                 mockOnPolesChange,
//                 mockGetCurrentPoles,
//                 mockGetCurrentIsClosed
//             );

//             expect(action.type).toBe('INSERT_POLE');
//             expect(action.description).toBe('Insert pole at line 1');
//             expect(action.poleIndex).toBe(1);
//             expect(action.pole).toEqual(pole);
//         });

//         it('should remove inserted pole on undo', () => {
//             const pole: Pole = { x: 5, y: 0, h: 10 };
//             mockPoles = [
//                 { x: 0, y: 0, h: 10 },
//                 { x: 5, y: 0, h: 10 },
//                 { x: 10, y: 0, h: 10 },
//                 { x: 10, y: 10, h: 10 },
//             ];

//             const action = createInsertPoleAction(
//                 1,
//                 pole,
//                 mockOnPolesChange,
//                 mockGetCurrentPoles,
//                 mockGetCurrentIsClosed
//             );

//             action.undo();

//             expect(mockOnPolesChange).toHaveBeenCalledWith(
//                 [
//                     { x: 0, y: 0, h: 10 },
//                     { x: 10, y: 0, h: 10 },
//                     { x: 10, y: 10, h: 10 },
//                 ],
//                 false
//             );
//         });

//         it('should re-insert pole on redo', () => {
//             const pole: Pole = { x: 5, y: 0, h: 10 };
//             const action = createInsertPoleAction(
//                 1,
//                 pole,
//                 mockOnPolesChange,
//                 mockGetCurrentPoles,
//                 mockGetCurrentIsClosed
//             );

//             action.redo();

//             expect(mockOnPolesChange).toHaveBeenCalledWith(
//                 [
//                     { x: 0, y: 0, h: 10 },
//                     { x: 5, y: 0, h: 10 },
//                     { x: 10, y: 0, h: 10 },
//                     { x: 10, y: 10, h: 10 },
//                 ],
//                 false
//             );
//         });

//         it('should not affect surrounding poles', () => {
//             const pole: Pole = { x: 5, y: 0, h: 15 };
//             const action = createInsertPoleAction(
//                 1,
//                 pole,
//                 mockOnPolesChange,
//                 mockGetCurrentPoles,
//                 mockGetCurrentIsClosed
//             );

//             action.redo();
//             const updatedPoles = mockOnPolesChange.mock.calls[0][0];
//             expect(updatedPoles[0]).toEqual({ x: 0, y: 0, h: 10 });
//             expect(updatedPoles[2]).toEqual({ x: 10, y: 0, h: 10 });
//             expect(updatedPoles[3]).toEqual({ x: 10, y: 10, h: 10 });
//         });
//     });

//     describe('createDeletePoleAction', () => {
//         let mockPoles: Pole[];
//         let mockOnPolesChange: ReturnType<typeof vi.fn>;
//         let mockGetCurrentPoles: ReturnType<typeof vi.fn>;
//         let mockGetCurrentIsClosed: ReturnType<typeof vi.fn>;

//         beforeEach(() => {
//             mockPoles = [
//                 { x: 0, y: 0, h: 10 },
//                 { x: 10, y: 0, h: 10 },
//                 { x: 10, y: 10, h: 10 },
//                 { x: 0, y: 10, h: 10 },
//             ];
//             mockOnPolesChange = vi.fn();
//             mockGetCurrentPoles = vi.fn(() => mockPoles);
//             mockGetCurrentIsClosed = vi.fn(() => false);
//         });

//         it('should create action with correct type and description', () => {
//             const action = createDeletePoleAction(
//                 [1],
//                 [{ x: 10, y: 0, h: 10 }],
//                 mockOnPolesChange,
//                 mockGetCurrentPoles,
//                 mockGetCurrentIsClosed
//             );

//             expect(action.type).toBe('DELETE_POLE');
//             expect(action.description).toBe('Delete 1 pole(s)');
//             expect(action.poleIndices).toEqual([1]);
//             expect(action.poles).toEqual([{ x: 10, y: 0, h: 10 }]);
//         });

//         it('should restore single deleted pole on undo', () => {
//             mockPoles = [
//                 { x: 0, y: 0, h: 10 },
//                 { x: 10, y: 10, h: 10 },
//                 { x: 0, y: 10, h: 10 },
//             ];

//             const action = createDeletePoleAction(
//                 [1],
//                 [{ x: 10, y: 0, h: 10 }],
//                 mockOnPolesChange,
//                 mockGetCurrentPoles,
//                 mockGetCurrentIsClosed
//             );

//             action.undo();

//             expect(mockOnPolesChange).toHaveBeenCalledWith(
//                 [
//                     { x: 0, y: 0, h: 10 },
//                     { x: 10, y: 0, h: 10 },
//                     { x: 10, y: 10, h: 10 },
//                     { x: 0, y: 10, h: 10 },
//                 ],
//                 false
//             );
//         });

//         it('should delete single pole on redo', () => {
//             const action = createDeletePoleAction(
//                 [1],
//                 [{ x: 10, y: 0, h: 10 }],
//                 mockOnPolesChange,
//                 mockGetCurrentPoles,
//                 mockGetCurrentIsClosed
//             );

//             action.redo();

//             expect(mockOnPolesChange).toHaveBeenCalledWith(
//                 [
//                     { x: 0, y: 0, h: 10 },
//                     { x: 10, y: 10, h: 10 },
//                     { x: 0, y: 10, h: 10 },
//                 ],
//                 false
//             );
//         });

//         it('should restore multiple non-consecutive poles in correct positions', () => {
//             const deletedPoles = [
//                 { x: 1, y: 0, h: 11 },
//                 { x: 3, y: 0, h: 13 },
//                 { x: 5, y: 0, h: 14 },
//             ];

//             mockPoles = [
//                 { x: 0, y: 0, h: 10 },
//                 { x: 2, y: 0, h: 12 },
//                 { x: 4, y: 0, h: 12 },
//                 { x: 6, y: 0, h: 12 },
//             ];

//             const action = createDeletePoleAction(
//                 [1, 3, 5],
//                 deletedPoles,
//                 mockOnPolesChange,
//                 mockGetCurrentPoles,
//                 mockGetCurrentIsClosed
//             );

//             action.undo();

//             const updatedPoles = mockOnPolesChange.mock.calls[0][0];
//             expect(updatedPoles).toHaveLength(7);

//             const restoredIndices = updatedPoles
//                 .map((p, i) => ({ pole: p, index: i }))
//                 .filter(({ pole }) =>
//                     deletedPoles.some(dp => dp.x === pole.x && dp.y === pole.y && dp.h === pole.h)
//                 )
//                 .map(({ index }) => index);

//             expect(restoredIndices).toEqual([1, 4, 6]);
//         });

//         it('should restore multiple consecutive poles in correct positions', () => {
//             const deletedPoles = [
//                 { x: 3, y: 0, h: 11 },
//                 { x: 4, y: 0, h: 12 },
//                 { x: 5, y: 0, h: 13 },
//             ];

//             mockPoles = [
//                 { x: 0, y: 0, h: 10 },
//                 { x: 1, y: 0, h: 10 },
//                 { x: 2, y: 0, h: 10 },
//                 { x: 6, y: 0, h: 10 },
//             ];

//             const action = createDeletePoleAction(
//                 [3, 4, 5],
//                 deletedPoles,
//                 mockOnPolesChange,
//                 mockGetCurrentPoles,
//                 mockGetCurrentIsClosed
//             );

//             action.undo();

//             const updatedPoles = mockOnPolesChange.mock.calls[0][0];
//             expect(updatedPoles).toHaveLength(7);

//             const restoredIndices = updatedPoles
//                 .map((p, i) => ({ pole: p, index: i }))
//                 .filter(({ pole }) =>
//                     deletedPoles.some(dp => dp.x === pole.x && dp.y === pole.y && dp.h === pole.h)
//                 )
//                 .map(({ index }) => index);

//             expect(restoredIndices).toEqual([3, 5, 6]);
//         });

//         it('should handle descending order correctly', () => {
//             const action = createDeletePoleAction(
//                 [2, 1, 0],
//                 [
//                     { x: 10, y: 10, h: 10 },
//                     { x: 10, y: 0, h: 10 },
//                     { x: 0, y: 0, h: 10 },
//                 ],
//                 mockOnPolesChange,
//                 mockGetCurrentPoles,
//                 mockGetCurrentIsClosed
//             );

//             action.redo();

//             const updatedPoles = mockOnPolesChange.mock.calls[0][0];
//             expect(updatedPoles).toHaveLength(1);
//             expect(updatedPoles[0]).toEqual({ x: 0, y: 10, h: 10 });
//         });

//         it('should preserve all pole properties during undo', () => {
//             mockPoles = [
//                 { x: 0, y: 0, h: 10 },
//             ];

//             const deletedPoles = [
//                 { x: 10, y: 0, h: 15 },
//                 { x: 20, y: 5, h: 20 },
//             ];

//             const action = createDeletePoleAction(
//                 [1, 2],
//                 deletedPoles,
//                 mockOnPolesChange,
//                 mockGetCurrentPoles,
//                 mockGetCurrentIsClosed
//             );

//             action.undo();

//             const updatedPoles = mockOnPolesChange.mock.calls[0][0];
//             expect(updatedPoles[1].x).toBe(10);
//             expect(updatedPoles[1].y).toBe(0);
//             expect(updatedPoles[1].h).toBe(15);
//             expect(updatedPoles[2].x).toBe(20);
//             expect(updatedPoles[2].y).toBe(5);
//             expect(updatedPoles[2].h).toBe(20);
//         });
//     });

//     describe('createMultiMovePoleAction', () => {
//         let mockPoles: Pole[];
//         let mockOnPolesChange: ReturnType<typeof vi.fn>;
//         let mockGetCurrentPoles: ReturnType<typeof vi.fn>;
//         let mockGetCurrentIsClosed: ReturnType<typeof vi.fn>;

//         beforeEach(() => {
//             mockPoles = [
//                 { x: 0, y: 0, h: 10 },
//                 { x: 10, y: 0, h: 10 },
//                 { x: 10, y: 10, h: 10 },
//                 { x: 0, y: 10, h: 10 },
//             ];
//             mockOnPolesChange = vi.fn();
//             mockGetCurrentPoles = vi.fn(() => mockPoles);
//             mockGetCurrentIsClosed = vi.fn(() => false);
//         });

//         it('should create action with correct type and description', () => {
//             const moves = [
//                 { poleIndex: 0, oldPosition: { x: 0, y: 0 }, newPosition: { x: 5, y: 5 } },
//                 { poleIndex: 1, oldPosition: { x: 10, y: 0 }, newPosition: { x: 15, y: 5 } },
//             ];

//             const action = createMultiMovePoleAction(
//                 moves,
//                 mockOnPolesChange,
//                 mockGetCurrentPoles,
//                 mockGetCurrentIsClosed
//             );

//             expect(action.type).toBe('MULTI_MOVE_POLE');
//             expect(action.description).toBe('Move 2 poles together');
//             expect(action.moves).toEqual(moves);
//         });

//         it('should throw error when moves array is empty', () => {
//             expect(() =>
//                 createMultiMovePoleAction(
//                     [],
//                     mockOnPolesChange,
//                     mockGetCurrentPoles,
//                     mockGetCurrentIsClosed
//                 )
//             ).toThrow('MultiMovePoleAction: moves array cannot be empty');
//         });

//         it('should revert all pole positions in single action on undo', () => {
//             const moves = [
//                 { poleIndex: 0, oldPosition: { x: 0, y: 0 }, newPosition: { x: 5, y: 5 } },
//                 { poleIndex: 1, oldPosition: { x: 10, y: 0 }, newPosition: { x: 15, y: 5 } },
//                 { poleIndex: 2, oldPosition: { x: 10, y: 10 }, newPosition: { x: 15, y: 15 } },
//             ];

//             const action = createMultiMovePoleAction(
//                 moves,
//                 mockOnPolesChange,
//                 mockGetCurrentPoles,
//                 mockGetCurrentIsClosed
//             );

//             action.undo();

//             expect(mockOnPolesChange).toHaveBeenCalledTimes(1);
//             const updatedPoles = mockOnPolesChange.mock.calls[0][0];
//             expect(updatedPoles[0]).toEqual({ x: 0, y: 0, h: 10 });
//             expect(updatedPoles[1]).toEqual({ x: 10, y: 0, h: 10 });
//             expect(updatedPoles[2]).toEqual({ x: 10, y: 10, h: 10 });
//         });

//         it('should reapply all pole positions in single action on redo', () => {
//             const moves = [
//                 { poleIndex: 0, oldPosition: { x: 0, y: 0 }, newPosition: { x: 5, y: 5 } },
//                 { poleIndex: 1, oldPosition: { x: 10, y: 0 }, newPosition: { x: 15, y: 5 } },
//             ];

//             const action = createMultiMovePoleAction(
//                 moves,
//                 mockOnPolesChange,
//                 mockGetCurrentPoles,
//                 mockGetCurrentIsClosed
//             );

//             action.redo();

//             expect(mockOnPolesChange).toHaveBeenCalledTimes(1);
//             const updatedPoles = mockOnPolesChange.mock.calls[0][0];
//             expect(updatedPoles[0]).toEqual({ x: 5, y: 5, h: 10 });
//             expect(updatedPoles[1]).toEqual({ x: 15, y: 5, h: 10 });
//         });

//         it('should handle multiple undo/redo cycles correctly', () => {
//             const moves = [
//                 { poleIndex: 0, oldPosition: { x: 0, y: 0 }, newPosition: { x: 5, y: 5 } },
//                 { poleIndex: 1, oldPosition: { x: 10, y: 0 }, newPosition: { x: 15, y: 5 } },
//             ];

//             const action = createMultiMovePoleAction(
//                 moves,
//                 mockOnPolesChange,
//                 mockGetCurrentPoles,
//                 mockGetCurrentIsClosed
//             );

//             action.undo();
//             expect(mockOnPolesChange).toHaveBeenCalledTimes(1);

//             action.redo();
//             expect(mockOnPolesChange).toHaveBeenCalledTimes(2);

//             action.undo();
//             expect(mockOnPolesChange).toHaveBeenCalledTimes(3);
//             const finalPoles = mockOnPolesChange.mock.calls[2][0];
//             expect(finalPoles[0]).toEqual({ x: 0, y: 0, h: 10 });
//             expect(finalPoles[1]).toEqual({ x: 10, y: 0, h: 10 });
//         });
//     });

//     describe('createMoveLineAction', () => {
//         let mockPoles: Pole[];
//         let mockOnPolesChange: ReturnType<typeof vi.fn>;
//         let mockGetCurrentPoles: ReturnType<typeof vi.fn>;
//         let mockGetCurrentIsClosed: ReturnType<typeof vi.fn>;

//         beforeEach(() => {
//             mockPoles = [
//                 { x: 0, y: 0, h: 10 },
//                 { x: 10, y: 0, h: 10 },
//                 { x: 10, y: 10, h: 10 },
//             ];
//             mockOnPolesChange = vi.fn();
//             mockGetCurrentPoles = vi.fn(() => mockPoles);
//             mockGetCurrentIsClosed = vi.fn(() => false);
//         });

//         it('should create action with correct type and description', () => {
//             const action = createMoveLineAction(
//                 0,
//                 1,
//                 { x: 0, y: 0 },
//                 { x: 10, y: 0 },
//                 { x: 5, y: 5 },
//                 { x: 15, y: 5 },
//                 mockOnPolesChange,
//                 mockGetCurrentPoles,
//                 mockGetCurrentIsClosed
//             );

//             expect(action.type).toBe('MOVE_LINE');
//             expect(action.description).toBe('Move line segment 0');
//             expect(action.pole1Index).toBe(0);
//             expect(action.pole2Index).toBe(1);
//         });

//         it('should throw error when pole indices are the same', () => {
//             expect(() =>
//                 createMoveLineAction(
//                     1,
//                     1,
//                     { x: 0, y: 0 },
//                     { x: 10, y: 0 },
//                     { x: 5, y: 5 },
//                     { x: 15, y: 5 },
//                     mockOnPolesChange,
//                     mockGetCurrentPoles,
//                     mockGetCurrentIsClosed
//                 )
//             ).toThrow('MoveLineAction: pole1Index and pole2Index must be different');
//         });

//         it('should restore both pole positions on undo', () => {
//             const action = createMoveLineAction(
//                 0,
//                 1,
//                 { x: 0, y: 0 },
//                 { x: 10, y: 0 },
//                 { x: 5, y: 5 },
//                 { x: 15, y: 5 },
//                 mockOnPolesChange,
//                 mockGetCurrentPoles,
//                 mockGetCurrentIsClosed
//             );

//             action.undo();

//             const updatedPoles = mockOnPolesChange.mock.calls[0][0];
//             expect(updatedPoles[0]).toEqual({ x: 0, y: 0, h: 10 });
//             expect(updatedPoles[1]).toEqual({ x: 10, y: 0, h: 10 });
//         });

//         it('should apply both pole movements on redo', () => {
//             const action = createMoveLineAction(
//                 0,
//                 1,
//                 { x: 0, y: 0 },
//                 { x: 10, y: 0 },
//                 { x: 5, y: 5 },
//                 { x: 15, y: 5 },
//                 mockOnPolesChange,
//                 mockGetCurrentPoles,
//                 mockGetCurrentIsClosed
//             );

//             action.redo();

//             const updatedPoles = mockOnPolesChange.mock.calls[0][0];
//             expect(updatedPoles[0]).toEqual({ x: 5, y: 5, h: 10 });
//             expect(updatedPoles[1]).toEqual({ x: 15, y: 5, h: 10 });
//         });

//         it('should maintain line geometry during undo/redo', () => {
//             const oldPole1 = { x: 0, y: 0 };
//             const oldPole2 = { x: 10, y: 0 };
//             const newPole1 = { x: 5, y: 5 };
//             const newPole2 = { x: 15, y: 5 };

//             const action = createMoveLineAction(
//                 0,
//                 1,
//                 oldPole1,
//                 oldPole2,
//                 newPole1,
//                 newPole2,
//                 mockOnPolesChange,
//                 mockGetCurrentPoles,
//                 mockGetCurrentIsClosed
//             );

//             action.redo();
//             let updatedPoles = mockOnPolesChange.mock.calls[0][0];
//             const redoDistance = Math.sqrt(
//                 Math.pow(updatedPoles[1].x - updatedPoles[0].x, 2) +
//                 Math.pow(updatedPoles[1].y - updatedPoles[0].y, 2)
//             );

//             action.undo();
//             updatedPoles = mockOnPolesChange.mock.calls[1][0];
//             const undoDistance = Math.sqrt(
//                 Math.pow(updatedPoles[1].x - updatedPoles[0].x, 2) +
//                 Math.pow(updatedPoles[1].y - updatedPoles[0].y, 2)
//             );

//             expect(redoDistance).toBeCloseTo(undoDistance, 5);
//         });
//     });

//     describe('createBreakWallAction', () => {
//         let mockOnRemoveSegment: ReturnType<typeof vi.fn>;
//         let mockOnUpdateSegment: ReturnType<typeof vi.fn>;
//         let mockOnAddSegment: ReturnType<typeof vi.fn>;
//         let tempIdCounter: number;

//         beforeEach(() => {
//             tempIdCounter = 100;
//             mockOnRemoveSegment = vi.fn();
//             mockOnUpdateSegment = vi.fn();
//             mockOnAddSegment = vi.fn(() => tempIdCounter++);
//         });

//         it('should create action with correct type and description', () => {
//             const originalPoles: Pole[] = [
//                 { x: 0, y: 0, h: 10 },
//                 { x: 10, y: 0, h: 10 },
//                 { x: 10, y: 10, h: 10 },
//             ];

//             const segment1Poles: Pole[] = [
//                 { x: 0, y: 0, h: 10 },
//                 { x: 10, y: 0, h: 10 },
//             ];

//             const segment2Poles: Pole[] = [
//                 { x: 10, y: 0, h: 10 },
//                 { x: 10, y: 10, h: 10 },
//             ];

//             const action = createBreakWallAction(
//                 1,
//                 1,
//                 originalPoles,
//                 false,
//                 4,
//                 2,
//                 3,
//                 segment1Poles,
//                 segment2Poles,
//                 'Test Wall',
//                 0,
//                 'stone',
//                 '#808080',
//                 mockOnRemoveSegment,
//                 mockOnUpdateSegment,
//                 mockOnAddSegment
//             );

//             expect(action.type).toBe('BREAK_WALL');
//             expect(action.description).toBe('Break wall into 2 segments at pole 1');
//             expect(action.segmentTempId).toBe(1);
//             expect(action.breakPoleIndex).toBe(1);
//             expect(action.originalPoles).toEqual(originalPoles);
//             expect(action.originalIsClosed).toBe(false);
//         });

//         it('should merge segments back to original on undo', () => {
//             const originalPoles: Pole[] = [
//                 { x: 0, y: 0, h: 10 },
//                 { x: 10, y: 0, h: 10 },
//                 { x: 10, y: 10, h: 10 },
//             ];

//             const segment1Poles: Pole[] = [
//                 { x: 0, y: 0, h: 10 },
//                 { x: 10, y: 0, h: 10 },
//             ];

//             const segment2Poles: Pole[] = [
//                 { x: 10, y: 0, h: 10 },
//                 { x: 10, y: 10, h: 10 },
//             ];

//             const action = createBreakWallAction(
//                 1,
//                 1,
//                 originalPoles,
//                 false,
//                 4,
//                 2,
//                 3,
//                 segment1Poles,
//                 segment2Poles,
//                 'Test Wall',
//                 0,
//                 'stone',
//                 '#808080',
//                 mockOnRemoveSegment,
//                 mockOnUpdateSegment,
//                 mockOnAddSegment
//             );

//             action.undo();

//             expect(mockOnRemoveSegment).toHaveBeenCalledWith(3);
//             expect(mockOnRemoveSegment).toHaveBeenCalledTimes(1);
//             expect(mockOnUpdateSegment).toHaveBeenCalledWith(2, {
//                 wallIndex: 4,
//                 poles: originalPoles,
//                 isClosed: false
//             });
//             expect(action.segmentTempId).toBe(2);
//         });

//         it('should re-break wall into two segments on redo', () => {
//             const originalPoles: Pole[] = [
//                 { x: 0, y: 0, h: 10 },
//                 { x: 10, y: 0, h: 10 },
//                 { x: 10, y: 10, h: 10 },
//             ];

//             const segment1Poles: Pole[] = [
//                 { x: 0, y: 0, h: 10 },
//                 { x: 10, y: 0, h: 10 },
//             ];

//             const segment2Poles: Pole[] = [
//                 { x: 10, y: 0, h: 10 },
//                 { x: 10, y: 10, h: 10 },
//             ];

//             const action = createBreakWallAction(
//                 1,
//                 1,
//                 originalPoles,
//                 false,
//                 4,
//                 2,
//                 3,
//                 segment1Poles,
//                 segment2Poles,
//                 'Test Wall',
//                 0,
//                 'stone',
//                 '#808080',
//                 mockOnRemoveSegment,
//                 mockOnUpdateSegment,
//                 mockOnAddSegment
//             );

//             action.redo();

//             expect(mockOnUpdateSegment).toHaveBeenCalledWith(1, {
//                 wallIndex: 4,
//                 poles: segment1Poles,
//                 isClosed: false
//             });
//             expect(mockOnAddSegment).toHaveBeenCalledWith({
//                 wallIndex: null,
//                 name: 'Test Wall',
//                 poles: segment2Poles,
//                 isClosed: false,
//                 visibility: 0,
//                 material: 'stone',
//                 color: '#808080'
//             });
//             expect(action.currentSegment1TempId).toBe(1);
//             expect(action.currentSegment2TempId).toBe(100);
//         });

//         it('should handle multiple undo/redo cycles correctly', () => {
//             const originalPoles: Pole[] = [
//                 { x: 0, y: 0, h: 10 },
//                 { x: 10, y: 0, h: 10 },
//                 { x: 10, y: 10, h: 10 },
//             ];

//             const segment1Poles: Pole[] = [
//                 { x: 0, y: 0, h: 10 },
//                 { x: 10, y: 0, h: 10 },
//             ];

//             const segment2Poles: Pole[] = [
//                 { x: 10, y: 0, h: 10 },
//                 { x: 10, y: 10, h: 10 },
//             ];

//             const action = createBreakWallAction(
//                 1,
//                 1,
//                 originalPoles,
//                 false,
//                 4,
//                 2,
//                 3,
//                 segment1Poles,
//                 segment2Poles,
//                 'Test Wall',
//                 0,
//                 'stone',
//                 '#808080',
//                 mockOnRemoveSegment,
//                 mockOnUpdateSegment,
//                 mockOnAddSegment
//             );

//             action.undo();
//             expect(action.segmentTempId).toBe(2);

//             action.redo();
//             expect(action.currentSegment1TempId).toBe(2);
//             expect(action.currentSegment2TempId).toBe(100);

//             action.undo();
//             expect(action.segmentTempId).toBe(2);

//             action.redo();
//             expect(action.currentSegment1TempId).toBe(2);
//             expect(action.currentSegment2TempId).toBe(101);
//         });

//         it('should track tempIds across cycles', () => {
//             const originalPoles: Pole[] = [
//                 { x: 0, y: 0, h: 10 },
//                 { x: 10, y: 0, h: 10 },
//             ];

//             const segment1Poles: Pole[] = [{ x: 0, y: 0, h: 10 }];
//             const segment2Poles: Pole[] = [{ x: 10, y: 0, h: 10 }];

//             const action = createBreakWallAction(
//                 1,
//                 1,
//                 originalPoles,
//                 false,
//                 4,
//                 2,
//                 3,
//                 segment1Poles,
//                 segment2Poles,
//                 'Test Wall',
//                 0,
//                 'stone',
//                 '#808080',
//                 mockOnRemoveSegment,
//                 mockOnUpdateSegment,
//                 mockOnAddSegment
//             );

//             const initialSegment1 = action.currentSegment1TempId;
//             const initialSegment2 = action.currentSegment2TempId;

//             action.undo();
//             action.redo();

//             expect(action.currentSegment1TempId).toBe(initialSegment1);
//             expect(action.currentSegment2TempId).not.toBe(initialSegment2);
//             expect(action.currentSegment2TempId).toBeGreaterThan(initialSegment2);
//         });

//         it('should preserve originalIsClosed during undo', () => {
//             const originalPoles: Pole[] = [
//                 { x: 0, y: 0, h: 10 },
//                 { x: 10, y: 0, h: 10 },
//                 { x: 10, y: 10, h: 10 },
//             ];

//             const segment1Poles: Pole[] = [
//                 { x: 0, y: 0, h: 10 },
//                 { x: 10, y: 0, h: 10 },
//             ];

//             const segment2Poles: Pole[] = [
//                 { x: 10, y: 0, h: 10 },
//                 { x: 10, y: 10, h: 10 },
//             ];

//             const action = createBreakWallAction(
//                 1,
//                 1,
//                 originalPoles,
//                 true,
//                 4,
//                 2,
//                 3,
//                 segment1Poles,
//                 segment2Poles,
//                 'Test Wall',
//                 0,
//                 'stone',
//                 '#808080',
//                 mockOnRemoveSegment,
//                 mockOnUpdateSegment,
//                 mockOnAddSegment
//             );

//             action.undo();

//             expect(mockOnUpdateSegment).toHaveBeenCalledWith(2, {
//                 wallIndex: 4,
//                 poles: originalPoles,
//                 isClosed: true
//             });
//         });

//         it('should create both segments with isClosed=false after redo', () => {
//             const originalPoles: Pole[] = [
//                 { x: 0, y: 0, h: 10 },
//                 { x: 10, y: 0, h: 10 },
//                 { x: 10, y: 10, h: 10 },
//             ];

//             const segment1Poles: Pole[] = [
//                 { x: 0, y: 0, h: 10 },
//                 { x: 10, y: 0, h: 10 },
//             ];

//             const segment2Poles: Pole[] = [
//                 { x: 10, y: 0, h: 10 },
//                 { x: 10, y: 10, h: 10 },
//             ];

//             const action = createBreakWallAction(
//                 1,
//                 1,
//                 originalPoles,
//                 true,
//                 4,
//                 2,
//                 3,
//                 segment1Poles,
//                 segment2Poles,
//                 'Test Wall',
//                 0,
//                 'stone',
//                 '#808080',
//                 mockOnRemoveSegment,
//                 mockOnUpdateSegment,
//                 mockOnAddSegment
//             );

//             action.redo();

//             expect(mockOnUpdateSegment).toHaveBeenCalledWith(1, {
//                 wallIndex: 4,
//                 poles: segment1Poles,
//                 isClosed: false
//             });
//             expect(mockOnAddSegment).toHaveBeenCalledWith({
//                 wallIndex: null,
//                 name: 'Test Wall',
//                 poles: segment2Poles,
//                 isClosed: false,
//                 visibility: 0,
//                 material: 'stone',
//                 color: '#808080'
//             });
//         });
//     });
// });
