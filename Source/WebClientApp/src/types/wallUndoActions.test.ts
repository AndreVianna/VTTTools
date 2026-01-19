import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import type { Pole, EncounterWallSegment } from '@/types/domain';
import { SegmentType, SegmentState } from '@/types/domain';
import {
    createPlacePoleAction,
    createMovePoleAction,
    createInsertPoleAction,
    createDeletePoleAction,
    createMultiMovePoleAction,
    createMoveLineAction,
    createBreakWallAction,
} from './wallUndoActions';

// Type aliases for mock functions
type OnPolesChangeMock = Mock<(poles: Pole[]) => void>;
type GetCurrentPolesMock = Mock<() => Pole[]>;
type OnRemoveSegmentMock = Mock<(tempId: number) => void>;
type OnUpdateSegmentMock = Mock<(tempId: number, changes: { wallIndex: number; segments: EncounterWallSegment[] }) => void>;
type OnAddSegmentMock = Mock<(data: { wallIndex: number | null; name: string; segments: EncounterWallSegment[] }) => number>;

describe('wallUndoActions', () => {
    describe('createPlacePoleAction', () => {
        let mockPoles: Pole[];
        let mockOnPolesChange: OnPolesChangeMock;
        let mockGetCurrentPoles: GetCurrentPolesMock;

        beforeEach(() => {
            mockPoles = [
                { x: 0, y: 0, h: 10 },
                { x: 10, y: 0, h: 10 },
            ];
            mockOnPolesChange = vi.fn();
            mockGetCurrentPoles = vi.fn(() => mockPoles);
        });

        it('should create action with correct type and description', () => {
            const pole: Pole = { x: 5, y: 5, h: 10 };
            const action = createPlacePoleAction(
                1,
                pole,
                mockOnPolesChange,
                mockGetCurrentPoles
            );

            expect(action.type).toBe('PLACE_POLE');
            expect(action.description).toBe('Place pole at (5, 5)');
            expect(action.poleIndex).toBe(1);
            expect(action.pole).toEqual(pole);
        });

        it('should remove pole at correct index on undo', () => {
            const pole: Pole = { x: 5, y: 5, h: 10 };
            const action = createPlacePoleAction(
                1,
                pole,
                mockOnPolesChange,
                mockGetCurrentPoles
            );

            action.undo();

            expect(mockOnPolesChange).toHaveBeenCalledWith(
                [{ x: 0, y: 0, h: 10 }]
            );
        });

        it('should re-insert pole at correct index on redo', () => {
            const pole: Pole = { x: 5, y: 5, h: 10 };
            const action = createPlacePoleAction(
                1,
                pole,
                mockOnPolesChange,
                mockGetCurrentPoles
            );

            action.redo();

            expect(mockOnPolesChange).toHaveBeenCalledWith(
                [
                    { x: 0, y: 0, h: 10 },
                    { x: 5, y: 5, h: 10 },
                    { x: 10, y: 0, h: 10 },
                ]
            );
        });

        it('should preserve height property during undo/redo cycles', () => {
            const pole: Pole = { x: 5, y: 5, h: 15 };
            mockPoles = [
                { x: 0, y: 0, h: 10 },
                { x: 5, y: 5, h: 15 },
                { x: 10, y: 0, h: 10 },
            ];

            const action = createPlacePoleAction(
                1,
                pole,
                mockOnPolesChange,
                mockGetCurrentPoles
            );

            action.undo();
            const undoCall = mockOnPolesChange.mock.calls[0]?.[0] as Pole[];
            expect(undoCall).toHaveLength(2);
            expect(undoCall[0]?.h).toBe(10);
            expect(undoCall[1]?.h).toBe(10);

            mockOnPolesChange.mockClear();
            mockPoles = undoCall;

            action.redo();
            const redoCall = mockOnPolesChange.mock.calls[0]?.[0] as Pole[];
            expect(redoCall).toHaveLength(3);
            expect(redoCall[1]?.h).toBe(15);
        });

        it('should handle multiple undo/redo cycles correctly', () => {
            const pole: Pole = { x: 5, y: 5, h: 10 };
            mockPoles = [
                { x: 0, y: 0, h: 10 },
                { x: 5, y: 5, h: 10 },
                { x: 10, y: 0, h: 10 },
            ];
            const action = createPlacePoleAction(
                1,
                pole,
                mockOnPolesChange,
                mockGetCurrentPoles
            );

            action.undo();
            expect(mockOnPolesChange).toHaveBeenCalledTimes(1);
            expect((mockOnPolesChange.mock.calls[0]?.[0] as Pole[])).toHaveLength(2);
            mockPoles = mockOnPolesChange.mock.calls[0]?.[0] as Pole[];

            action.redo();
            expect(mockOnPolesChange).toHaveBeenCalledTimes(2);
            expect((mockOnPolesChange.mock.calls[1]?.[0] as Pole[])).toHaveLength(3);
            mockPoles = mockOnPolesChange.mock.calls[1]?.[0] as Pole[];

            action.undo();
            expect(mockOnPolesChange).toHaveBeenCalledTimes(3);
            expect((mockOnPolesChange.mock.calls[2]?.[0] as Pole[])).toHaveLength(2);
        });

        it('should call onSegmentsUpdate when provided', () => {
            const pole: Pole = { x: 5, y: 5, h: 10 };
            const mockOnSegmentsUpdate = vi.fn();
            const action = createPlacePoleAction(
                1,
                pole,
                mockOnPolesChange,
                mockGetCurrentPoles,
                mockOnSegmentsUpdate
            );

            action.redo();

            expect(mockOnSegmentsUpdate).toHaveBeenCalled();
        });
    });

    describe('createMovePoleAction', () => {
        let mockPoles: Pole[];
        let mockOnPolesChange: OnPolesChangeMock;
        let mockGetCurrentPoles: GetCurrentPolesMock;

        beforeEach(() => {
            mockPoles = [
                { x: 0, y: 0, h: 10 },
                { x: 10, y: 0, h: 10 },
                { x: 10, y: 10, h: 10 },
            ];
            mockOnPolesChange = vi.fn();
            mockGetCurrentPoles = vi.fn(() => mockPoles);
        });

        it('should create action with correct type and description', () => {
            const action = createMovePoleAction(
                1,
                { x: 10, y: 0 },
                { x: 15, y: 5 },
                mockOnPolesChange,
                mockGetCurrentPoles
            );

            expect(action.type).toBe('MOVE_POLE');
            expect(action.description).toBe('Move pole 1 from (10,0) to (15,5)');
            expect(action.poleIndex).toBe(1);
            expect(action.oldPosition).toEqual({ x: 10, y: 0 });
            expect(action.newPosition).toEqual({ x: 15, y: 5 });
        });

        it('should restore old position on undo', () => {
            const action = createMovePoleAction(
                1,
                { x: 10, y: 0 },
                { x: 15, y: 5 },
                mockOnPolesChange,
                mockGetCurrentPoles
            );

            action.undo();

            const updatedPoles = mockOnPolesChange.mock.calls[0]?.[0] as Pole[];
            expect(updatedPoles[1]).toEqual({ x: 10, y: 0, h: 10 });
        });

        it('should apply new position on redo', () => {
            const action = createMovePoleAction(
                1,
                { x: 10, y: 0 },
                { x: 15, y: 5 },
                mockOnPolesChange,
                mockGetCurrentPoles
            );

            action.redo();

            const updatedPoles = mockOnPolesChange.mock.calls[0]?.[0] as Pole[];
            expect(updatedPoles[1]).toEqual({ x: 15, y: 5, h: 10 });
        });

        it('should not affect height property during move', () => {
            mockPoles[1] = { ...mockPoles[1]!, h: 20 };
            const action = createMovePoleAction(
                1,
                { x: 10, y: 0 },
                { x: 15, y: 5 },
                mockOnPolesChange,
                mockGetCurrentPoles
            );

            action.undo();
            expect((mockOnPolesChange.mock.calls[0]?.[0] as Pole[])[1]?.h).toBe(20);

            action.redo();
            expect((mockOnPolesChange.mock.calls[1]?.[0] as Pole[])[1]?.h).toBe(20);
        });
    });

    describe('createInsertPoleAction', () => {
        let mockPoles: Pole[];
        let mockOnPolesChange: OnPolesChangeMock;
        let mockGetCurrentPoles: GetCurrentPolesMock;

        beforeEach(() => {
            mockPoles = [
                { x: 0, y: 0, h: 10 },
                { x: 10, y: 0, h: 10 },
                { x: 10, y: 10, h: 10 },
            ];
            mockOnPolesChange = vi.fn();
            mockGetCurrentPoles = vi.fn(() => mockPoles);
        });

        it('should create action with correct type and description', () => {
            const pole: Pole = { x: 5, y: 0, h: 10 };
            const action = createInsertPoleAction(
                1,
                pole,
                mockOnPolesChange,
                mockGetCurrentPoles
            );

            expect(action.type).toBe('INSERT_POLE');
            expect(action.description).toBe('Insert pole at line 1');
            expect(action.poleIndex).toBe(1);
            expect(action.pole).toEqual(pole);
        });

        it('should remove inserted pole on undo', () => {
            const pole: Pole = { x: 5, y: 0, h: 10 };
            mockPoles = [
                { x: 0, y: 0, h: 10 },
                { x: 5, y: 0, h: 10 },
                { x: 10, y: 0, h: 10 },
                { x: 10, y: 10, h: 10 },
            ];

            const action = createInsertPoleAction(
                1,
                pole,
                mockOnPolesChange,
                mockGetCurrentPoles
            );

            action.undo();

            expect(mockOnPolesChange).toHaveBeenCalledWith(
                [
                    { x: 0, y: 0, h: 10 },
                    { x: 10, y: 0, h: 10 },
                    { x: 10, y: 10, h: 10 },
                ]
            );
        });

        it('should re-insert pole on redo', () => {
            const pole: Pole = { x: 5, y: 0, h: 10 };
            const action = createInsertPoleAction(
                1,
                pole,
                mockOnPolesChange,
                mockGetCurrentPoles
            );

            action.redo();

            expect(mockOnPolesChange).toHaveBeenCalledWith(
                [
                    { x: 0, y: 0, h: 10 },
                    { x: 5, y: 0, h: 10 },
                    { x: 10, y: 0, h: 10 },
                    { x: 10, y: 10, h: 10 },
                ]
            );
        });

        it('should not affect surrounding poles', () => {
            const pole: Pole = { x: 5, y: 0, h: 15 };
            const action = createInsertPoleAction(
                1,
                pole,
                mockOnPolesChange,
                mockGetCurrentPoles
            );

            action.redo();
            const updatedPoles = mockOnPolesChange.mock.calls[0]?.[0] as Pole[];
            expect(updatedPoles[0]).toEqual({ x: 0, y: 0, h: 10 });
            expect(updatedPoles[2]).toEqual({ x: 10, y: 0, h: 10 });
            expect(updatedPoles[3]).toEqual({ x: 10, y: 10, h: 10 });
        });
    });

    describe('createDeletePoleAction', () => {
        let mockPoles: Pole[];
        let mockOnPolesChange: OnPolesChangeMock;
        let mockGetCurrentPoles: GetCurrentPolesMock;

        beforeEach(() => {
            mockPoles = [
                { x: 0, y: 0, h: 10 },
                { x: 10, y: 0, h: 10 },
                { x: 10, y: 10, h: 10 },
                { x: 0, y: 10, h: 10 },
            ];
            mockOnPolesChange = vi.fn();
            mockGetCurrentPoles = vi.fn(() => mockPoles);
        });

        it('should create action with correct type and description', () => {
            const action = createDeletePoleAction(
                [1],
                [{ x: 10, y: 0, h: 10 }],
                mockOnPolesChange,
                mockGetCurrentPoles
            );

            expect(action.type).toBe('DELETE_POLE');
            expect(action.description).toBe('Delete 1 pole(s)');
            expect(action.poleIndices).toEqual([1]);
            expect(action.poles).toEqual([{ x: 10, y: 0, h: 10 }]);
        });

        it('should restore single deleted pole on undo', () => {
            mockPoles = [
                { x: 0, y: 0, h: 10 },
                { x: 10, y: 10, h: 10 },
                { x: 0, y: 10, h: 10 },
            ];

            const action = createDeletePoleAction(
                [1],
                [{ x: 10, y: 0, h: 10 }],
                mockOnPolesChange,
                mockGetCurrentPoles
            );

            action.undo();

            expect(mockOnPolesChange).toHaveBeenCalledWith(
                [
                    { x: 0, y: 0, h: 10 },
                    { x: 10, y: 0, h: 10 },
                    { x: 10, y: 10, h: 10 },
                    { x: 0, y: 10, h: 10 },
                ]
            );
        });

        it('should delete single pole on redo', () => {
            const action = createDeletePoleAction(
                [1],
                [{ x: 10, y: 0, h: 10 }],
                mockOnPolesChange,
                mockGetCurrentPoles
            );

            action.redo();

            expect(mockOnPolesChange).toHaveBeenCalledWith(
                [
                    { x: 0, y: 0, h: 10 },
                    { x: 10, y: 10, h: 10 },
                    { x: 0, y: 10, h: 10 },
                ]
            );
        });

        it('should restore multiple non-consecutive poles in correct positions', () => {
            const deletedPoles = [
                { x: 1, y: 0, h: 11 },
                { x: 3, y: 0, h: 13 },
                { x: 5, y: 0, h: 14 },
            ];

            mockPoles = [
                { x: 0, y: 0, h: 10 },
                { x: 2, y: 0, h: 12 },
                { x: 4, y: 0, h: 12 },
                { x: 6, y: 0, h: 12 },
            ];

            const action = createDeletePoleAction(
                [1, 3, 5],
                deletedPoles,
                mockOnPolesChange,
                mockGetCurrentPoles
            );

            action.undo();

            const updatedPoles = mockOnPolesChange.mock.calls[0]?.[0] as Pole[];
            expect(updatedPoles).toHaveLength(7);

            const restoredIndices = updatedPoles
                .map((p: Pole, i: number) => ({ pole: p, index: i }))
                .filter(({ pole }: { pole: Pole }) =>
                    deletedPoles.some(dp => dp.x === pole.x && dp.y === pole.y && dp.h === pole.h)
                )
                .map(({ index }: { index: number }) => index);

            expect(restoredIndices).toEqual([1, 4, 6]);
        });

        it('should handle descending order correctly', () => {
            const action = createDeletePoleAction(
                [2, 1, 0],
                [
                    { x: 10, y: 10, h: 10 },
                    { x: 10, y: 0, h: 10 },
                    { x: 0, y: 0, h: 10 },
                ],
                mockOnPolesChange,
                mockGetCurrentPoles
            );

            action.redo();

            const updatedPoles = mockOnPolesChange.mock.calls[0]?.[0] as Pole[];
            expect(updatedPoles).toHaveLength(1);
            expect(updatedPoles[0]).toEqual({ x: 0, y: 10, h: 10 });
        });

        it('should preserve all pole properties during undo', () => {
            mockPoles = [
                { x: 0, y: 0, h: 10 },
            ];

            const deletedPoles = [
                { x: 10, y: 0, h: 15 },
                { x: 20, y: 5, h: 20 },
            ];

            const action = createDeletePoleAction(
                [1, 2],
                deletedPoles,
                mockOnPolesChange,
                mockGetCurrentPoles
            );

            action.undo();

            const updatedPoles = mockOnPolesChange.mock.calls[0]?.[0] as Pole[];
            expect(updatedPoles[1]?.x).toBe(10);
            expect(updatedPoles[1]?.y).toBe(0);
            expect(updatedPoles[1]?.h).toBe(15);
            expect(updatedPoles[2]?.x).toBe(20);
            expect(updatedPoles[2]?.y).toBe(5);
            expect(updatedPoles[2]?.h).toBe(20);
        });
    });

    describe('createMultiMovePoleAction', () => {
        let mockPoles: Pole[];
        let mockOnPolesChange: OnPolesChangeMock;
        let mockGetCurrentPoles: GetCurrentPolesMock;

        beforeEach(() => {
            mockPoles = [
                { x: 0, y: 0, h: 10 },
                { x: 10, y: 0, h: 10 },
                { x: 10, y: 10, h: 10 },
                { x: 0, y: 10, h: 10 },
            ];
            mockOnPolesChange = vi.fn();
            mockGetCurrentPoles = vi.fn(() => mockPoles);
        });

        it('should create action with correct type and description', () => {
            const moves = [
                { poleIndex: 0, oldPosition: { x: 0, y: 0 }, newPosition: { x: 5, y: 5 } },
                { poleIndex: 1, oldPosition: { x: 10, y: 0 }, newPosition: { x: 15, y: 5 } },
            ];

            const action = createMultiMovePoleAction(
                moves,
                mockOnPolesChange,
                mockGetCurrentPoles
            );

            expect(action.type).toBe('MULTI_MOVE_POLE');
            expect(action.description).toBe('Move 2 poles together');
            expect(action.moves).toEqual(moves);
        });

        it('should throw error when moves array is empty', () => {
            expect(() =>
                createMultiMovePoleAction(
                    [],
                    mockOnPolesChange,
                    mockGetCurrentPoles
                )
            ).toThrow('MultiMovePoleAction: moves array cannot be empty');
        });

        it('should revert all pole positions in single action on undo', () => {
            const moves = [
                { poleIndex: 0, oldPosition: { x: 0, y: 0 }, newPosition: { x: 5, y: 5 } },
                { poleIndex: 1, oldPosition: { x: 10, y: 0 }, newPosition: { x: 15, y: 5 } },
                { poleIndex: 2, oldPosition: { x: 10, y: 10 }, newPosition: { x: 15, y: 15 } },
            ];

            const action = createMultiMovePoleAction(
                moves,
                mockOnPolesChange,
                mockGetCurrentPoles
            );

            action.undo();

            expect(mockOnPolesChange).toHaveBeenCalledTimes(1);
            const updatedPoles = mockOnPolesChange.mock.calls[0]?.[0] as Pole[];
            expect(updatedPoles[0]).toEqual({ x: 0, y: 0, h: 10 });
            expect(updatedPoles[1]).toEqual({ x: 10, y: 0, h: 10 });
            expect(updatedPoles[2]).toEqual({ x: 10, y: 10, h: 10 });
        });

        it('should reapply all pole positions in single action on redo', () => {
            const moves = [
                { poleIndex: 0, oldPosition: { x: 0, y: 0 }, newPosition: { x: 5, y: 5 } },
                { poleIndex: 1, oldPosition: { x: 10, y: 0 }, newPosition: { x: 15, y: 5 } },
            ];

            const action = createMultiMovePoleAction(
                moves,
                mockOnPolesChange,
                mockGetCurrentPoles
            );

            action.redo();

            expect(mockOnPolesChange).toHaveBeenCalledTimes(1);
            const updatedPoles = mockOnPolesChange.mock.calls[0]?.[0] as Pole[];
            expect(updatedPoles[0]).toEqual({ x: 5, y: 5, h: 10 });
            expect(updatedPoles[1]).toEqual({ x: 15, y: 5, h: 10 });
        });

        it('should handle multiple undo/redo cycles correctly', () => {
            const moves = [
                { poleIndex: 0, oldPosition: { x: 0, y: 0 }, newPosition: { x: 5, y: 5 } },
                { poleIndex: 1, oldPosition: { x: 10, y: 0 }, newPosition: { x: 15, y: 5 } },
            ];

            const action = createMultiMovePoleAction(
                moves,
                mockOnPolesChange,
                mockGetCurrentPoles
            );

            action.undo();
            expect(mockOnPolesChange).toHaveBeenCalledTimes(1);

            action.redo();
            expect(mockOnPolesChange).toHaveBeenCalledTimes(2);

            action.undo();
            expect(mockOnPolesChange).toHaveBeenCalledTimes(3);
            const finalPoles = mockOnPolesChange.mock.calls[2]?.[0] as Pole[];
            expect(finalPoles[0]).toEqual({ x: 0, y: 0, h: 10 });
            expect(finalPoles[1]).toEqual({ x: 10, y: 0, h: 10 });
        });
    });

    describe('createMoveLineAction', () => {
        let mockPoles: Pole[];
        let mockOnPolesChange: OnPolesChangeMock;
        let mockGetCurrentPoles: GetCurrentPolesMock;

        beforeEach(() => {
            mockPoles = [
                { x: 0, y: 0, h: 10 },
                { x: 10, y: 0, h: 10 },
                { x: 10, y: 10, h: 10 },
            ];
            mockOnPolesChange = vi.fn();
            mockGetCurrentPoles = vi.fn(() => mockPoles);
        });

        it('should create action with correct type and description', () => {
            const action = createMoveLineAction(
                0,
                1,
                { x: 0, y: 0, h: 10 },
                { x: 10, y: 0, h: 10 },
                { x: 5, y: 5, h: 10 },
                { x: 15, y: 5, h: 10 },
                mockOnPolesChange,
                mockGetCurrentPoles
            );

            expect(action.type).toBe('MOVE_LINE');
            expect(action.description).toBe('Move line segment 0');
            expect(action.pole1Index).toBe(0);
            expect(action.pole2Index).toBe(1);
        });

        it('should throw error when pole indices are the same', () => {
            expect(() =>
                createMoveLineAction(
                    1,
                    1,
                    { x: 0, y: 0, h: 10 },
                    { x: 10, y: 0, h: 10 },
                    { x: 5, y: 5, h: 10 },
                    { x: 15, y: 5, h: 10 },
                    mockOnPolesChange,
                    mockGetCurrentPoles
                )
            ).toThrow('MoveLineAction: pole1Index and pole2Index must be different');
        });

        it('should restore both pole positions on undo', () => {
            const action = createMoveLineAction(
                0,
                1,
                { x: 0, y: 0, h: 10 },
                { x: 10, y: 0, h: 10 },
                { x: 5, y: 5, h: 10 },
                { x: 15, y: 5, h: 10 },
                mockOnPolesChange,
                mockGetCurrentPoles
            );

            action.undo();

            const updatedPoles = mockOnPolesChange.mock.calls[0]?.[0] as Pole[];
            expect(updatedPoles[0]).toMatchObject({ x: 0, y: 0 });
            expect(updatedPoles[1]).toMatchObject({ x: 10, y: 0 });
        });

        it('should apply both pole movements on redo', () => {
            const action = createMoveLineAction(
                0,
                1,
                { x: 0, y: 0, h: 10 },
                { x: 10, y: 0, h: 10 },
                { x: 5, y: 5, h: 10 },
                { x: 15, y: 5, h: 10 },
                mockOnPolesChange,
                mockGetCurrentPoles
            );

            action.redo();

            const updatedPoles = mockOnPolesChange.mock.calls[0]?.[0] as Pole[];
            expect(updatedPoles[0]).toMatchObject({ x: 5, y: 5 });
            expect(updatedPoles[1]).toMatchObject({ x: 15, y: 5 });
        });

        it('should maintain line geometry during undo/redo', () => {
            const oldPole1 = { x: 0, y: 0, h: 10 };
            const oldPole2 = { x: 10, y: 0, h: 10 };
            const newPole1 = { x: 5, y: 5, h: 10 };
            const newPole2 = { x: 15, y: 5, h: 10 };

            const action = createMoveLineAction(
                0,
                1,
                oldPole1,
                oldPole2,
                newPole1,
                newPole2,
                mockOnPolesChange,
                mockGetCurrentPoles
            );

            action.redo();
            let updatedPoles = mockOnPolesChange.mock.calls[0]?.[0] as Pole[];
            const redoDistance = Math.sqrt(
                Math.pow(updatedPoles[1]!.x - updatedPoles[0]!.x, 2) +
                Math.pow(updatedPoles[1]!.y - updatedPoles[0]!.y, 2)
            );

            action.undo();
            updatedPoles = mockOnPolesChange.mock.calls[1]?.[0] as Pole[];
            const undoDistance = Math.sqrt(
                Math.pow(updatedPoles[1]!.x - updatedPoles[0]!.x, 2) +
                Math.pow(updatedPoles[1]!.y - updatedPoles[0]!.y, 2)
            );

            expect(redoDistance).toBeCloseTo(undoDistance, 5);
        });
    });

    describe('createBreakWallAction', () => {
        let mockOnRemoveSegment: OnRemoveSegmentMock;
        let mockOnUpdateSegment: OnUpdateSegmentMock;
        let mockOnAddSegment: OnAddSegmentMock;
        let tempIdCounter: number;

        const createMockSegment = (index: number, startX: number, endX: number): EncounterWallSegment => ({
            index,
            startPole: { x: startX, y: 0, h: 10 },
            endPole: { x: endX, y: 0, h: 10 },
            type: SegmentType.Wall,
            isOpaque: true,
            state: SegmentState.Closed,
        });

        beforeEach(() => {
            tempIdCounter = 100;
            mockOnRemoveSegment = vi.fn();
            mockOnUpdateSegment = vi.fn();
            mockOnAddSegment = vi.fn(() => tempIdCounter++);
        });

        it('should create action with correct type and description', () => {
            const originalSegments: EncounterWallSegment[] = [
                createMockSegment(0, 0, 10),
                createMockSegment(1, 10, 20),
            ];

            const segment1: EncounterWallSegment[] = [createMockSegment(0, 0, 10)];
            const segment2: EncounterWallSegment[] = [createMockSegment(0, 10, 20)];

            const action = createBreakWallAction(
                1,
                1,
                originalSegments,
                4,
                2,
                3,
                segment1,
                segment2,
                'Test Wall',
                mockOnRemoveSegment,
                mockOnUpdateSegment,
                mockOnAddSegment
            );

            expect(action.type).toBe('BREAK_WALL');
            expect(action.description).toBe('Break wall into 2 segments at pole 1');
            expect(action.segmentTempId).toBe(1);
            expect(action.breakPoleIndex).toBe(1);
            expect(action.originalSegments).toEqual(originalSegments);
        });

        it('should merge segments back to original on undo', () => {
            const originalSegments: EncounterWallSegment[] = [
                createMockSegment(0, 0, 10),
                createMockSegment(1, 10, 20),
            ];

            const segment1: EncounterWallSegment[] = [createMockSegment(0, 0, 10)];
            const segment2: EncounterWallSegment[] = [createMockSegment(0, 10, 20)];

            const action = createBreakWallAction(
                1,
                1,
                originalSegments,
                4,
                2,
                3,
                segment1,
                segment2,
                'Test Wall',
                mockOnRemoveSegment,
                mockOnUpdateSegment,
                mockOnAddSegment
            );

            action.undo();

            expect(mockOnRemoveSegment).toHaveBeenCalledWith(3);
            expect(mockOnRemoveSegment).toHaveBeenCalledTimes(1);
            expect(mockOnUpdateSegment).toHaveBeenCalledWith(2, {
                wallIndex: 4,
                segments: originalSegments
            });
            expect(action.segmentTempId).toBe(2);
        });

        it('should re-break wall into two segments on redo', () => {
            const originalSegments: EncounterWallSegment[] = [
                createMockSegment(0, 0, 10),
                createMockSegment(1, 10, 20),
            ];

            const segment1: EncounterWallSegment[] = [createMockSegment(0, 0, 10)];
            const segment2: EncounterWallSegment[] = [createMockSegment(0, 10, 20)];

            const action = createBreakWallAction(
                1,
                1,
                originalSegments,
                4,
                2,
                3,
                segment1,
                segment2,
                'Test Wall',
                mockOnRemoveSegment,
                mockOnUpdateSegment,
                mockOnAddSegment
            );

            action.redo();

            expect(mockOnUpdateSegment).toHaveBeenCalledWith(1, {
                wallIndex: 4,
                segments: segment1
            });
            expect(mockOnAddSegment).toHaveBeenCalledWith({
                wallIndex: null,
                name: 'Test Wall',
                segments: segment2
            });
            expect(action.currentSegment1TempId).toBe(1);
            expect(action.currentSegment2TempId).toBe(100);
        });

        it('should handle multiple undo/redo cycles correctly', () => {
            const originalSegments: EncounterWallSegment[] = [
                createMockSegment(0, 0, 10),
                createMockSegment(1, 10, 20),
            ];

            const segment1: EncounterWallSegment[] = [createMockSegment(0, 0, 10)];
            const segment2: EncounterWallSegment[] = [createMockSegment(0, 10, 20)];

            const action = createBreakWallAction(
                1,
                1,
                originalSegments,
                4,
                2,
                3,
                segment1,
                segment2,
                'Test Wall',
                mockOnRemoveSegment,
                mockOnUpdateSegment,
                mockOnAddSegment
            );

            action.undo();
            expect(action.segmentTempId).toBe(2);

            action.redo();
            expect(action.currentSegment1TempId).toBe(2);
            expect(action.currentSegment2TempId).toBe(100);

            action.undo();
            expect(action.segmentTempId).toBe(2);

            action.redo();
            expect(action.currentSegment1TempId).toBe(2);
            expect(action.currentSegment2TempId).toBe(101);
        });

        it('should track tempIds across cycles', () => {
            const originalSegments: EncounterWallSegment[] = [createMockSegment(0, 0, 10)];
            const segment1: EncounterWallSegment[] = [createMockSegment(0, 0, 5)];
            const segment2: EncounterWallSegment[] = [createMockSegment(0, 5, 10)];

            const action = createBreakWallAction(
                1,
                1,
                originalSegments,
                4,
                2,
                3,
                segment1,
                segment2,
                'Test Wall',
                mockOnRemoveSegment,
                mockOnUpdateSegment,
                mockOnAddSegment
            );

            const initialSegment1 = action.currentSegment1TempId;
            const initialSegment2 = action.currentSegment2TempId;

            action.undo();
            action.redo();

            expect(action.currentSegment1TempId).toBe(initialSegment1);
            expect(action.currentSegment2TempId).not.toBe(initialSegment2);
            expect(action.currentSegment2TempId).toBeGreaterThan(initialSegment2);
        });
    });
});
