/**
 * useWallHandlers Hook Unit Tests
 * Tests wall management operations: delete, edit, break, select, placement
 */

import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Encounter, EncounterWall, PlacedWall } from '@/types/domain';
import type { StageWall } from '@/types/stage';
import { SegmentType, SegmentState } from '@/types/domain';
import { useWallHandlers, type WallMutations } from './useWallHandlers';
import type { useWallTransaction } from '@/hooks/useWallTransaction';
import type { Command } from '@/utils/commands';
import {
    createMockEncounter,
    createMockWall,
} from '@/tests/utils/mockFactories';

// Import mocked modules for verification
import { segmentsToPoles } from '@/utils/wallSegmentUtils';
import { polesToSegments } from '@/utils/wallUtils';
import { removeEntityMapping } from '@/utils/encounterEntityMapping';
import { removeWallOptimistic, updateWallOptimistic } from '@/utils/encounterStateUtils';

// Mock dependencies
vi.mock('@/utils/encounterEntityMapping', () => ({
    getDomIdByIndex: vi.fn().mockReturnValue('wall-dom-id'),
    removeEntityMapping: vi.fn(),
}));

vi.mock('@/utils/encounterMappers', () => ({
    hydratePlacedWalls: vi.fn().mockImplementation((walls: StageWall[], _encounterId: string): PlacedWall[] =>
        walls.map((w) => ({
            id: `wall-${w.index}`,
            index: w.index,
            name: w.name,
            segments: w.segments,
        } as PlacedWall)),
    ),
}));

vi.mock('@/utils/encounterStateUtils', () => ({
    removeWallOptimistic: vi.fn().mockImplementation((encounter: Encounter, _wallIndex: number) => encounter),
    syncWallIndices: vi.fn().mockImplementation((encounter: Encounter, _tempToReal: Map<number, number>) => encounter),
    updateWallOptimistic: vi.fn().mockImplementation((encounter: Encounter, _wallIndex: number, _updates: Partial<EncounterWall>) => encounter),
}));

vi.mock('@/utils/wallUtils', () => ({
    polesToSegments: vi.fn().mockReturnValue([]),
}));

vi.mock('@/utils/wallSegmentUtils', () => ({
    segmentsToPoles: vi.fn().mockReturnValue([]),
}));

// Mock wall transaction factory
const createMockWallTransaction = (): ReturnType<typeof useWallTransaction> => ({
    transaction: {
        type: null,
        originalWall: null,
        segments: [],
        isActive: false,
    },
    startTransaction: vi.fn(),
    addSegment: vi.fn().mockReturnValue(-1),
    addSegments: vi.fn(),
    setAllSegments: vi.fn(),
    updateSegment: vi.fn(),
    removeSegment: vi.fn(),
    commitTransaction: vi.fn().mockResolvedValue({ success: true, segmentResults: [] }),
    rollbackTransaction: vi.fn(),
    getActiveSegments: vi.fn().mockReturnValue([]),
    pushLocalAction: vi.fn(),
    undoLocal: vi.fn(),
    redoLocal: vi.fn(),
    canUndoLocal: vi.fn().mockReturnValue(false),
    canRedoLocal: vi.fn().mockReturnValue(false),
    history: {
        push: vi.fn(),
        undo: vi.fn(),
        redo: vi.fn(),
        clear: vi.fn(),
        canUndo: false,
        canRedo: false,
        undoStackSize: 0,
        redoStackSize: 0,
    },
});

// Mock wall mutations factory
const createMockWallMutations = (): WallMutations => ({
    addWall: vi.fn().mockResolvedValue({ index: 0, name: 'New Wall', segments: [] }),
    updateWall: vi.fn().mockResolvedValue(undefined),
    deleteWall: vi.fn().mockResolvedValue(undefined),
    updateWallWithSegments: vi.fn().mockResolvedValue(undefined),
});

// Create mock props factory
const createMockProps = (overrides: Partial<Parameters<typeof useWallHandlers>[0]> = {}) => ({
    encounterId: 'test-encounter-id',
    encounter: createMockEncounter({
        stage: {
            ...createMockEncounter().stage,
            walls: [createMockWall(0), createMockWall(1)],
        },
    }) as Encounter,
    wallTransaction: createMockWallTransaction(),
    selectedWallIndex: null as number | null,
    drawingMode: null as 'wall' | 'region' | 'bucketFill' | null,
    drawingWallIndex: null as number | null,
    wallMutations: createMockWallMutations(),
    setEncounter: vi.fn(),
    setPlacedWalls: vi.fn(),
    setSelectedWallIndex: vi.fn(),
    setSelectedOpeningIndex: vi.fn(),
    setDrawingWallIndex: vi.fn(),
    setIsEditingVertices: vi.fn(),
    setOriginalWallPoles: vi.fn(),
    setPreviewWallPoles: vi.fn(),
    setActivePanel: vi.fn(),
    setErrorMessage: vi.fn(),
    execute: vi.fn(),
    refetch: vi.fn().mockResolvedValue({ data: createMockEncounter() }),
    ...overrides,
});

describe('useWallHandlers', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('handleWallDelete', () => {
        it('should call deleteWall mutation with correct index', async () => {
            // Arrange
            const props = createMockProps();
            const { result } = renderHook(() => useWallHandlers(props));

            // Act
            await act(async () => {
                await result.current.handleWallDelete(0);
            });

            // Assert
            expect(props.wallMutations.deleteWall).toHaveBeenCalledWith(0);
        });

        it('should refetch encounter after successful delete', async () => {
            // Arrange
            const props = createMockProps();
            const { result } = renderHook(() => useWallHandlers(props));

            // Act
            await act(async () => {
                await result.current.handleWallDelete(0);
            });

            // Assert
            expect(props.refetch).toHaveBeenCalled();
        });

        it('should update encounter state after refetch', async () => {
            // Arrange
            const updatedEncounter = createMockEncounter({ name: 'Updated' });
            const props = createMockProps({
                refetch: vi.fn().mockResolvedValue({ data: updatedEncounter }),
            });
            const { result } = renderHook(() => useWallHandlers(props));

            // Act
            await act(async () => {
                await result.current.handleWallDelete(0);
            });

            // Assert
            expect(props.setEncounter).toHaveBeenCalledWith(updatedEncounter);
        });

        it('should clear selection when deleting selected wall', async () => {
            // Arrange
            const props = createMockProps({ selectedWallIndex: 0 });
            const { result } = renderHook(() => useWallHandlers(props));

            // Act
            await act(async () => {
                await result.current.handleWallDelete(0);
            });

            // Assert
            expect(props.setSelectedWallIndex).toHaveBeenCalledWith(null);
            expect(props.setIsEditingVertices).toHaveBeenCalledWith(false);
            expect(props.setOriginalWallPoles).toHaveBeenCalledWith(null);
            expect(props.setPreviewWallPoles).toHaveBeenCalledWith(null);
        });

        it('should rollback transaction when deleting selected wall', async () => {
            // Arrange
            const wallTransaction = createMockWallTransaction();
            const props = createMockProps({
                selectedWallIndex: 0,
                wallTransaction,
            });
            const { result } = renderHook(() => useWallHandlers(props));

            // Act
            await act(async () => {
                await result.current.handleWallDelete(0);
            });

            // Assert
            expect(wallTransaction.rollbackTransaction).toHaveBeenCalled();
        });

        it('should set error message when delete fails', async () => {
            // Arrange
            const props = createMockProps({
                wallMutations: {
                    ...createMockWallMutations(),
                    deleteWall: vi.fn().mockRejectedValue(new Error('Delete failed')),
                },
            });
            const { result } = renderHook(() => useWallHandlers(props));

            // Act
            await act(async () => {
                await result.current.handleWallDelete(0);
            });

            // Assert
            expect(props.setErrorMessage).toHaveBeenCalledWith('Failed to remove wall. Please try again.');
        });

        it('should not delete when encounterId is missing', async () => {
            // Arrange
            const props = createMockProps({ encounterId: undefined });
            const { result } = renderHook(() => useWallHandlers(props));

            // Act
            await act(async () => {
                await result.current.handleWallDelete(0);
            });

            // Assert
            expect(props.wallMutations.deleteWall).not.toHaveBeenCalled();
        });

        it('should not delete when encounter is missing', async () => {
            // Arrange
            const props = createMockProps({ encounter: null });
            const { result } = renderHook(() => useWallHandlers(props));

            // Act
            await act(async () => {
                await result.current.handleWallDelete(0);
            });

            // Assert
            expect(props.wallMutations.deleteWall).not.toHaveBeenCalled();
        });

        it('should NOT rollback transaction when deleting a non-selected wall', async () => {
            // Arrange
            const wallTransaction = createMockWallTransaction();
            const props = createMockProps({
                selectedWallIndex: 1, // Selected wall is index 1
                wallTransaction,
            });
            const { result } = renderHook(() => useWallHandlers(props));

            // Act - delete wall at index 0, which is NOT the selected wall
            await act(async () => {
                await result.current.handleWallDelete(0);
            });

            // Assert
            expect(wallTransaction.rollbackTransaction).not.toHaveBeenCalled();
        });

        it('should call removeEntityMapping with correct parameters after successful delete', async () => {
            // Arrange
            const props = createMockProps();
            const { result } = renderHook(() => useWallHandlers(props));

            // Act
            await act(async () => {
                await result.current.handleWallDelete(0);
            });

            // Assert
            expect(removeEntityMapping).toHaveBeenCalledWith('test-encounter-id', 'walls', 'wall-dom-id');
        });
    });

    describe('handleEditVertices', () => {
        it('should start transaction in editing mode', () => {
            // Arrange
            const wallTransaction = createMockWallTransaction();
            const encounter = createMockEncounter({
                stage: {
                    ...createMockEncounter().stage,
                    walls: [createMockWall(0)],
                },
            });
            const props = createMockProps({
                encounter,
                wallTransaction,
            });
            const { result } = renderHook(() => useWallHandlers(props));

            // Act
            act(() => {
                result.current.handleEditVertices(0);
            });

            // Assert
            expect(wallTransaction.startTransaction).toHaveBeenCalledWith(
                'editing',
                expect.objectContaining({ index: 0 }),
            );
        });

        it('should set selected wall index', () => {
            // Arrange
            const encounter = createMockEncounter({
                stage: {
                    ...createMockEncounter().stage,
                    walls: [createMockWall(0)],
                },
            });
            const props = createMockProps({ encounter });
            const { result } = renderHook(() => useWallHandlers(props));

            // Act
            act(() => {
                result.current.handleEditVertices(0);
            });

            // Assert
            expect(props.setSelectedWallIndex).toHaveBeenCalledWith(0);
        });

        it('should clear opening selection when editing vertices', () => {
            // Arrange
            const encounter = createMockEncounter({
                stage: {
                    ...createMockEncounter().stage,
                    walls: [createMockWall(0)],
                },
            });
            const props = createMockProps({ encounter });
            const { result } = renderHook(() => useWallHandlers(props));

            // Act
            act(() => {
                result.current.handleEditVertices(0);
            });

            // Assert
            expect(props.setSelectedOpeningIndex).toHaveBeenCalledWith(null);
        });

        it('should set editing vertices mode to true', () => {
            // Arrange
            const encounter = createMockEncounter({
                stage: {
                    ...createMockEncounter().stage,
                    walls: [createMockWall(0)],
                },
            });
            const props = createMockProps({ encounter });
            const { result } = renderHook(() => useWallHandlers(props));

            // Act
            act(() => {
                result.current.handleEditVertices(0);
            });

            // Assert
            expect(props.setIsEditingVertices).toHaveBeenCalledWith(true);
        });

        it('should close active panel when editing vertices', () => {
            // Arrange
            const encounter = createMockEncounter({
                stage: {
                    ...createMockEncounter().stage,
                    walls: [createMockWall(0)],
                },
            });
            const props = createMockProps({ encounter });
            const { result } = renderHook(() => useWallHandlers(props));

            // Act
            act(() => {
                result.current.handleEditVertices(0);
            });

            // Assert
            expect(props.setActivePanel).toHaveBeenCalledWith(null);
        });

        it('should not start editing when wall not found', () => {
            // Arrange
            const encounter = createMockEncounter({
                stage: {
                    ...createMockEncounter().stage,
                    walls: [],
                },
            });
            const wallTransaction = createMockWallTransaction();
            const props = createMockProps({
                encounter,
                wallTransaction,
            });
            const { result } = renderHook(() => useWallHandlers(props));

            // Act
            act(() => {
                result.current.handleEditVertices(0);
            });

            // Assert
            expect(wallTransaction.startTransaction).not.toHaveBeenCalled();
        });

        it('should call segmentsToPoles with wall data', () => {
            // Arrange
            const mockPoles = [{ x: 0, y: 0, h: 10 }, { x: 100, y: 0, h: 10 }];
            vi.mocked(segmentsToPoles).mockReturnValue(mockPoles);
            const wall = createMockWall(0);
            const encounter = createMockEncounter({
                stage: {
                    ...createMockEncounter().stage,
                    walls: [wall],
                },
            });
            const props = createMockProps({ encounter });
            const { result } = renderHook(() => useWallHandlers(props));

            // Act
            act(() => {
                result.current.handleEditVertices(0);
            });

            // Assert
            expect(segmentsToPoles).toHaveBeenCalledWith(wall);
        });

        it('should store converted poles in originalWallPoles state', () => {
            // Arrange
            const mockPoles = [{ x: 0, y: 0, h: 10 }, { x: 100, y: 0, h: 10 }];
            vi.mocked(segmentsToPoles).mockReturnValue(mockPoles);
            const encounter = createMockEncounter({
                stage: {
                    ...createMockEncounter().stage,
                    walls: [createMockWall(0)],
                },
            });
            const props = createMockProps({ encounter });
            const { result } = renderHook(() => useWallHandlers(props));

            // Act
            act(() => {
                result.current.handleEditVertices(0);
            });

            // Assert
            expect(props.setOriginalWallPoles).toHaveBeenCalledWith(mockPoles);
        });

        it('should handle wall with empty segments array', () => {
            // Arrange
            vi.mocked(segmentsToPoles).mockReturnValue([]);
            const encounter = createMockEncounter({
                stage: {
                    ...createMockEncounter().stage,
                    walls: [{
                        index: 0,
                        name: 'Empty Wall',
                        segments: [],
                    }],
                },
            });
            const wallTransaction = createMockWallTransaction();
            const props = createMockProps({
                encounter,
                wallTransaction,
            });
            const { result } = renderHook(() => useWallHandlers(props));

            // Act - should not crash
            act(() => {
                result.current.handleEditVertices(0);
            });

            // Assert
            expect(wallTransaction.startTransaction).toHaveBeenCalled();
            expect(props.setOriginalWallPoles).toHaveBeenCalledWith([]);
        });
    });

    describe('handleCancelEditing', () => {
        it('should rollback transaction', async () => {
            // Arrange
            const wallTransaction = createMockWallTransaction();
            const props = createMockProps({
                selectedWallIndex: 0,
                wallTransaction,
            });
            const { result } = renderHook(() => useWallHandlers(props));

            // Act
            await act(async () => {
                await result.current.handleCancelEditing();
            });

            // Assert
            expect(wallTransaction.rollbackTransaction).toHaveBeenCalled();
        });

        it('should clear selection state', async () => {
            // Arrange
            const props = createMockProps({ selectedWallIndex: 0 });
            const { result } = renderHook(() => useWallHandlers(props));

            // Act
            await act(async () => {
                await result.current.handleCancelEditing();
            });

            // Assert
            expect(props.setSelectedWallIndex).toHaveBeenCalledWith(null);
            expect(props.setIsEditingVertices).toHaveBeenCalledWith(false);
            expect(props.setOriginalWallPoles).toHaveBeenCalledWith(null);
            expect(props.setPreviewWallPoles).toHaveBeenCalledWith(null);
        });

        it('should not cancel when encounter is missing', async () => {
            // Arrange
            const wallTransaction = createMockWallTransaction();
            const props = createMockProps({
                encounter: null,
                wallTransaction,
            });
            const { result } = renderHook(() => useWallHandlers(props));

            // Act
            await act(async () => {
                await result.current.handleCancelEditing();
            });

            // Assert
            expect(wallTransaction.rollbackTransaction).not.toHaveBeenCalled();
        });

        it('should not cancel when no wall is selected', async () => {
            // Arrange
            const wallTransaction = createMockWallTransaction();
            const props = createMockProps({
                selectedWallIndex: null,
                wallTransaction,
            });
            const { result } = renderHook(() => useWallHandlers(props));

            // Act
            await act(async () => {
                await result.current.handleCancelEditing();
            });

            // Assert
            expect(wallTransaction.rollbackTransaction).not.toHaveBeenCalled();
        });

        it('should call removeWallOptimistic for temp walls (wallIndex === null)', async () => {
            // Arrange
            const wallTransaction = createMockWallTransaction();
            wallTransaction.getActiveSegments = vi.fn().mockReturnValue([{
                tempId: -1,
                wallIndex: null, // Temp wall
                name: 'Temp Wall',
                segments: [],
            }]);
            const props = createMockProps({
                selectedWallIndex: 0,
                wallTransaction,
            });
            const { result } = renderHook(() => useWallHandlers(props));

            // Act
            await act(async () => {
                await result.current.handleCancelEditing();
            });

            // Assert
            expect(removeWallOptimistic).toHaveBeenCalledWith(props.encounter, -1);
        });

        it('should restore original wall when transaction.originalWall exists', async () => {
            // Arrange
            const originalWall = {
                index: 0,
                name: 'Original Wall',
                segments: [{ index: 0, startPole: { x: 0, y: 0, h: 10 }, endPole: { x: 100, y: 0, h: 10 }, type: SegmentType.Wall, isOpaque: true, state: SegmentState.Closed }],
            };
            const wallTransaction = createMockWallTransaction();
            wallTransaction.getActiveSegments = vi.fn().mockReturnValue([]);
            wallTransaction.transaction.originalWall = originalWall;
            const props = createMockProps({
                selectedWallIndex: 0,
                wallTransaction,
            });
            const { result } = renderHook(() => useWallHandlers(props));

            // Act
            await act(async () => {
                await result.current.handleCancelEditing();
            });

            // Assert
            expect(updateWallOptimistic).toHaveBeenCalledWith(
                props.encounter,
                0,
                { segments: originalWall.segments, name: originalWall.name },
            );
        });

        it('should NOT call updateWallOptimistic when originalWall is null', async () => {
            // Arrange
            vi.mocked(updateWallOptimistic).mockClear();
            const wallTransaction = createMockWallTransaction();
            wallTransaction.getActiveSegments = vi.fn().mockReturnValue([]);
            wallTransaction.transaction.originalWall = null;
            const props = createMockProps({
                selectedWallIndex: 0,
                wallTransaction,
            });
            const { result } = renderHook(() => useWallHandlers(props));

            // Act
            await act(async () => {
                await result.current.handleCancelEditing();
            });

            // Assert
            expect(updateWallOptimistic).not.toHaveBeenCalled();
        });

        it('should handle multiple active segments during cancel', async () => {
            // Arrange
            const wallTransaction = createMockWallTransaction();
            wallTransaction.getActiveSegments = vi.fn().mockReturnValue([
                { tempId: -1, wallIndex: null, name: 'Temp Wall 1', segments: [] },
                { tempId: -2, wallIndex: null, name: 'Temp Wall 2', segments: [] },
                { tempId: -3, wallIndex: 0, name: 'Real Wall', segments: [] }, // Not temp, has wallIndex
            ]);
            const props = createMockProps({
                selectedWallIndex: 0,
                wallTransaction,
            });
            const { result } = renderHook(() => useWallHandlers(props));

            // Act
            await act(async () => {
                await result.current.handleCancelEditing();
            });

            // Assert - Should only call removeWallOptimistic for temp walls (wallIndex === null)
            expect(removeWallOptimistic).toHaveBeenCalledWith(expect.anything(), -1);
            expect(removeWallOptimistic).toHaveBeenCalledWith(expect.anything(), -2);
            // Should not try to remove the real wall segment (wallIndex: 0)
            expect(removeWallOptimistic).toHaveBeenCalledTimes(2);
        });
    });

    describe('handleWallSelect', () => {
        it('should set selected wall index', () => {
            // Arrange
            const props = createMockProps();
            const { result } = renderHook(() => useWallHandlers(props));

            // Act
            act(() => {
                result.current.handleWallSelect(1);
            });

            // Assert
            expect(props.setSelectedWallIndex).toHaveBeenCalledWith(1);
        });

        it('should clear opening selection when selecting wall', () => {
            // Arrange
            const props = createMockProps();
            const { result } = renderHook(() => useWallHandlers(props));

            // Act
            act(() => {
                result.current.handleWallSelect(0);
            });

            // Assert
            expect(props.setSelectedOpeningIndex).toHaveBeenCalledWith(null);
        });

        it('should allow selecting null to clear selection', () => {
            // Arrange
            const props = createMockProps();
            const { result } = renderHook(() => useWallHandlers(props));

            // Act
            act(() => {
                result.current.handleWallSelect(null);
            });

            // Assert
            expect(props.setSelectedWallIndex).toHaveBeenCalledWith(null);
        });
    });

    describe('handleWallPlacementFinish', () => {
        it('should commit transaction when placement mode is active', async () => {
            // Arrange
            const wallTransaction = createMockWallTransaction();
            wallTransaction.commitTransaction = vi.fn().mockResolvedValue({
                success: true,
                segmentResults: [{ tempId: -1, wallIndex: 0 }],
            });
            const props = createMockProps({
                drawingMode: 'wall',
                drawingWallIndex: 0,
                wallTransaction,
            });
            const { result } = renderHook(() => useWallHandlers(props));

            // Act
            await act(async () => {
                await result.current.handleWallPlacementFinish();
            });

            // Assert
            expect(wallTransaction.commitTransaction).toHaveBeenCalled();
        });

        it('should clear drawing wall index after placement', async () => {
            // Arrange
            const wallTransaction = createMockWallTransaction();
            wallTransaction.commitTransaction = vi.fn().mockResolvedValue({
                success: true,
                segmentResults: [{ tempId: -1, wallIndex: 0 }],
            });
            const props = createMockProps({
                drawingMode: 'wall',
                drawingWallIndex: 0,
                wallTransaction,
            });
            const { result } = renderHook(() => useWallHandlers(props));

            // Act
            await act(async () => {
                await result.current.handleWallPlacementFinish();
            });

            // Assert
            expect(props.setDrawingWallIndex).toHaveBeenCalledWith(null);
        });

        it('should rollback and show error on commit failure', async () => {
            // Arrange
            const wallTransaction = createMockWallTransaction();
            wallTransaction.commitTransaction = vi.fn().mockResolvedValue({
                success: false,
                segmentResults: [],
            });
            const props = createMockProps({
                drawingMode: 'wall',
                drawingWallIndex: 0,
                wallTransaction,
            });
            const { result } = renderHook(() => useWallHandlers(props));

            // Act
            await act(async () => {
                await result.current.handleWallPlacementFinish();
            });

            // Assert
            expect(wallTransaction.rollbackTransaction).toHaveBeenCalled();
            expect(props.setErrorMessage).toHaveBeenCalledWith('Failed to place wall. Please try again.');
        });

        it('should not finish when not in wall drawing mode', async () => {
            // Arrange
            const wallTransaction = createMockWallTransaction();
            const props = createMockProps({
                drawingMode: 'region',
                drawingWallIndex: 0,
                wallTransaction,
            });
            const { result } = renderHook(() => useWallHandlers(props));

            // Act
            await act(async () => {
                await result.current.handleWallPlacementFinish();
            });

            // Assert
            expect(wallTransaction.commitTransaction).not.toHaveBeenCalled();
        });

        it('should not finish when drawingWallIndex is null', async () => {
            // Arrange
            const wallTransaction = createMockWallTransaction();
            const props = createMockProps({
                drawingMode: 'wall',
                drawingWallIndex: null,
                wallTransaction,
            });
            const { result } = renderHook(() => useWallHandlers(props));

            // Act
            await act(async () => {
                await result.current.handleWallPlacementFinish();
            });

            // Assert
            expect(wallTransaction.commitTransaction).not.toHaveBeenCalled();
        });

        it('should not finish when encounterId is missing', async () => {
            // Arrange
            const wallTransaction = createMockWallTransaction();
            const props = createMockProps({
                encounterId: undefined,
                drawingMode: 'wall',
                drawingWallIndex: 0,
                wallTransaction,
            });
            const { result } = renderHook(() => useWallHandlers(props));

            // Act
            await act(async () => {
                await result.current.handleWallPlacementFinish();
            });

            // Assert
            expect(wallTransaction.commitTransaction).not.toHaveBeenCalled();
        });
    });

    describe('handleSegmentUpdate', () => {
        it('should update segment with optimistic update', async () => {
            // Arrange
            const encounter = createMockEncounter({
                stage: {
                    ...createMockEncounter().stage,
                    walls: [{
                        index: 0,
                        name: 'Wall 0',
                        segments: [{
                            index: 0,
                            startPole: { x: 0, y: 0, h: 10 },
                            endPole: { x: 100, y: 0, h: 10 },
                            type: SegmentType.Wall,
                            isOpaque: true,
                            state: SegmentState.Closed,
                        }],
                    }],
                },
            });
            const props = createMockProps({ encounter });
            const { result } = renderHook(() => useWallHandlers(props));

            // Act
            await act(async () => {
                await result.current.handleSegmentUpdate(0, 0, { isOpaque: false });
            });

            // Assert
            expect(props.setEncounter).toHaveBeenCalled();
            expect(props.setPlacedWalls).toHaveBeenCalled();
        });

        it('should call updateWallWithSegments when available', async () => {
            // Arrange
            const encounter = createMockEncounter({
                stage: {
                    ...createMockEncounter().stage,
                    walls: [{
                        index: 0,
                        name: 'Wall 0',
                        segments: [{
                            index: 0,
                            startPole: { x: 0, y: 0, h: 10 },
                            endPole: { x: 100, y: 0, h: 10 },
                            type: SegmentType.Wall,
                            isOpaque: true,
                            state: SegmentState.Closed,
                        }],
                    }],
                },
            });
            const wallMutations = createMockWallMutations();
            const props = createMockProps({
                encounter,
                wallMutations,
            });
            const { result } = renderHook(() => useWallHandlers(props));

            // Act
            await act(async () => {
                await result.current.handleSegmentUpdate(0, 0, { isOpaque: false });
            });

            // Assert
            expect(wallMutations.updateWallWithSegments).toHaveBeenCalled();
        });

        it('should not update when wall not found', async () => {
            // Arrange
            const encounter = createMockEncounter({
                stage: {
                    ...createMockEncounter().stage,
                    walls: [],
                },
            });
            const props = createMockProps({ encounter });
            const { result } = renderHook(() => useWallHandlers(props));

            // Act
            await act(async () => {
                await result.current.handleSegmentUpdate(0, 0, { isOpaque: false });
            });

            // Assert
            expect(props.setEncounter).not.toHaveBeenCalled();
        });

        it('should not update when segment not found', async () => {
            // Arrange
            const encounter = createMockEncounter({
                stage: {
                    ...createMockEncounter().stage,
                    walls: [{
                        index: 0,
                        name: 'Wall 0',
                        segments: [{
                            index: 0,
                            startPole: { x: 0, y: 0, h: 10 },
                            endPole: { x: 100, y: 0, h: 10 },
                            type: SegmentType.Wall,
                            isOpaque: true,
                            state: SegmentState.Closed,
                        }],
                    }],
                },
            });
            const props = createMockProps({ encounter });
            const { result } = renderHook(() => useWallHandlers(props));

            // Act
            await act(async () => {
                await result.current.handleSegmentUpdate(0, 99, { isOpaque: false }); // Invalid segment index
            });

            // Assert
            expect(props.wallMutations.updateWallWithSegments).not.toHaveBeenCalled();
        });

        it('should refetch and show error on update failure', async () => {
            // Arrange
            const encounter = createMockEncounter({
                stage: {
                    ...createMockEncounter().stage,
                    walls: [{
                        index: 0,
                        name: 'Wall 0',
                        segments: [{
                            index: 0,
                            startPole: { x: 0, y: 0, h: 10 },
                            endPole: { x: 100, y: 0, h: 10 },
                            type: SegmentType.Wall,
                            isOpaque: true,
                            state: SegmentState.Closed,
                        }],
                    }],
                },
            });
            const wallMutations = createMockWallMutations();
            wallMutations.updateWallWithSegments = vi.fn().mockRejectedValue(new Error('Update failed'));
            const props = createMockProps({
                encounter,
                wallMutations,
            });
            const { result } = renderHook(() => useWallHandlers(props));

            // Act
            await act(async () => {
                await result.current.handleSegmentUpdate(0, 0, { isOpaque: false });
            });

            // Assert
            expect(props.setErrorMessage).toHaveBeenCalledWith('Failed to update segment. Please try again.');
            expect(props.refetch).toHaveBeenCalled();
        });

        it('should not update when encounterId is missing', async () => {
            // Arrange
            const props = createMockProps({ encounterId: undefined });
            const { result } = renderHook(() => useWallHandlers(props));

            // Act
            await act(async () => {
                await result.current.handleSegmentUpdate(0, 0, { isOpaque: false });
            });

            // Assert
            expect(props.setEncounter).not.toHaveBeenCalled();
        });
    });

    describe('handleWallBreak', () => {
        it('should add break action to transaction', async () => {
            // Arrange
            const wallTransaction = createMockWallTransaction();
            wallTransaction.getActiveSegments = vi.fn().mockReturnValue([{
                tempId: -1,
                wallIndex: 0,
                name: 'Wall 0',
                segments: [{
                    index: 0,
                    startPole: { x: 0, y: 0, h: 10 },
                    endPole: { x: 100, y: 0, h: 10 },
                    type: SegmentType.Wall,
                    isOpaque: true,
                    state: SegmentState.Closed,
                }],
            }]);
            const props = createMockProps({ wallTransaction });
            const { result } = renderHook(() => useWallHandlers(props));

            // Act
            await act(async () => {
                await result.current.handleWallBreak({
                    breakPoleIndex: 1,
                    newWallPoles: [
                        { x: 0, y: 0, h: 10 },
                        { x: 50, y: 0, h: 10 },
                        { x: 100, y: 0, h: 10 },
                    ],
                    originalWallPoles: [
                        { x: 0, y: 0, h: 10 },
                        { x: 100, y: 0, h: 10 },
                    ],
                });
            });

            // Assert
            expect(wallTransaction.addSegment).toHaveBeenCalledTimes(2);
            expect(wallTransaction.removeSegment).toHaveBeenCalledWith(-1);
            expect(wallTransaction.pushLocalAction).toHaveBeenCalled();
        });

        it('should not break when no active segments', async () => {
            // Arrange
            const wallTransaction = createMockWallTransaction();
            wallTransaction.getActiveSegments = vi.fn().mockReturnValue([]);
            const props = createMockProps({ wallTransaction });
            const { result } = renderHook(() => useWallHandlers(props));

            // Act
            await act(async () => {
                await result.current.handleWallBreak({
                    breakPoleIndex: 1,
                    newWallPoles: [{ x: 0, y: 0, h: 10 }],
                    originalWallPoles: [{ x: 0, y: 0, h: 10 }],
                });
            });

            // Assert
            expect(wallTransaction.addSegment).not.toHaveBeenCalled();
        });

        it('should not break when encounter is missing', async () => {
            // Arrange
            const wallTransaction = createMockWallTransaction();
            const props = createMockProps({
                encounter: null,
                wallTransaction,
            });
            const { result } = renderHook(() => useWallHandlers(props));

            // Act
            await act(async () => {
                await result.current.handleWallBreak({
                    breakPoleIndex: 1,
                    newWallPoles: [{ x: 0, y: 0, h: 10 }],
                    originalWallPoles: [{ x: 0, y: 0, h: 10 }],
                });
            });

            // Assert
            expect(wallTransaction.addSegment).not.toHaveBeenCalled();
        });

        it('should detect closed wall when first and last poles match', async () => {
            // Arrange
            const wallTransaction = createMockWallTransaction();
            wallTransaction.getActiveSegments = vi.fn().mockReturnValue([{
                tempId: -1,
                wallIndex: 0,
                name: 'Wall 0',
                segments: [{ index: 0 }],
            }]);
            const props = createMockProps({ wallTransaction });
            const { result } = renderHook(() => useWallHandlers(props));

            // Act - original poles form a closed shape (first equals last)
            await act(async () => {
                await result.current.handleWallBreak({
                    breakPoleIndex: 1,
                    newWallPoles: [
                        { x: 0, y: 0, h: 10 },
                        { x: 100, y: 0, h: 10 },
                        { x: 100, y: 100, h: 10 },
                    ],
                    originalWallPoles: [
                        { x: 0, y: 0, h: 10 },
                        { x: 100, y: 0, h: 10 },
                        { x: 100, y: 100, h: 10 },
                        { x: 0, y: 0, h: 10 }, // Same as first - closed wall
                    ],
                });
            });

            // Assert - polesToSegments should have been called with isOriginalClosed=true
            expect(polesToSegments).toHaveBeenCalledWith(
                expect.any(Array),
                true, // isOriginalClosed
            );
        });

        it('should detect open wall when first and last poles differ', async () => {
            // Arrange
            const wallTransaction = createMockWallTransaction();
            wallTransaction.getActiveSegments = vi.fn().mockReturnValue([{
                tempId: -1,
                wallIndex: 0,
                name: 'Wall 0',
                segments: [{ index: 0 }],
            }]);
            const props = createMockProps({ wallTransaction });
            const { result } = renderHook(() => useWallHandlers(props));

            // Act - original poles form an open shape (first differs from last)
            await act(async () => {
                await result.current.handleWallBreak({
                    breakPoleIndex: 1,
                    newWallPoles: [
                        { x: 0, y: 0, h: 10 },
                        { x: 50, y: 0, h: 10 },
                        { x: 100, y: 0, h: 10 },
                    ],
                    originalWallPoles: [
                        { x: 0, y: 0, h: 10 },
                        { x: 100, y: 0, h: 10 }, // Different from first - open wall
                    ],
                });
            });

            // Assert - polesToSegments should have been called with isOriginalClosed=false
            expect(polesToSegments).toHaveBeenCalledWith(
                expect.any(Array),
                false, // isOriginalClosed
            );
        });

        it('should handle break at boundary indices (first or last pole)', async () => {
            // Arrange
            const wallTransaction = createMockWallTransaction();
            wallTransaction.getActiveSegments = vi.fn().mockReturnValue([{
                tempId: -1,
                wallIndex: 0,
                name: 'Wall 0',
                segments: [{ index: 0 }],
            }]);
            const props = createMockProps({ wallTransaction });
            const { result } = renderHook(() => useWallHandlers(props));

            // Act - break at index 0 (first pole)
            await act(async () => {
                await result.current.handleWallBreak({
                    breakPoleIndex: 0,
                    newWallPoles: [
                        { x: 0, y: 0, h: 10 },
                        { x: 50, y: 0, h: 10 },
                        { x: 100, y: 0, h: 10 },
                    ],
                    originalWallPoles: [
                        { x: 0, y: 0, h: 10 },
                        { x: 100, y: 0, h: 10 },
                    ],
                });
            });

            // Assert - should still add segments and push action even for boundary break
            expect(wallTransaction.addSegment).toHaveBeenCalled();
            expect(wallTransaction.pushLocalAction).toHaveBeenCalled();
        });
    });

    describe('handleFinishEditing', () => {
        it('should not finish when encounterId is missing', async () => {
            // Arrange
            const wallTransaction = createMockWallTransaction();
            const props = createMockProps({
                encounterId: undefined,
                selectedWallIndex: 0,
                wallTransaction,
            });
            const { result } = renderHook(() => useWallHandlers(props));

            // Act
            await act(async () => {
                await result.current.handleFinishEditing();
            });

            // Assert
            expect(wallTransaction.commitTransaction).not.toHaveBeenCalled();
        });

        it('should not finish when encounter is missing', async () => {
            // Arrange
            const wallTransaction = createMockWallTransaction();
            const props = createMockProps({
                encounter: null,
                selectedWallIndex: 0,
                wallTransaction,
            });
            const { result } = renderHook(() => useWallHandlers(props));

            // Act
            await act(async () => {
                await result.current.handleFinishEditing();
            });

            // Assert
            expect(wallTransaction.commitTransaction).not.toHaveBeenCalled();
        });

        it('should not finish when no wall is selected', async () => {
            // Arrange
            const wallTransaction = createMockWallTransaction();
            const props = createMockProps({
                selectedWallIndex: null,
                wallTransaction,
            });
            const { result } = renderHook(() => useWallHandlers(props));

            // Act
            await act(async () => {
                await result.current.handleFinishEditing();
            });

            // Assert
            expect(wallTransaction.commitTransaction).not.toHaveBeenCalled();
        });

        it('should commit transaction when finishing edit', async () => {
            // Arrange
            const wallTransaction = createMockWallTransaction();
            wallTransaction.commitTransaction = vi.fn().mockResolvedValue({
                success: true,
                segmentResults: [{ tempId: -1, wallIndex: 0 }],
            });
            wallTransaction.transaction.originalWall = {
                index: 0,
                name: 'Wall 0',
                segments: [],
            };
            const props = createMockProps({
                selectedWallIndex: 0,
                wallTransaction,
            });
            const { result } = renderHook(() => useWallHandlers(props));

            // Act
            await act(async () => {
                await result.current.handleFinishEditing();
            });

            // Assert
            expect(wallTransaction.commitTransaction).toHaveBeenCalled();
        });

        it('should refetch encounter after successful commit', async () => {
            // Arrange
            const wallTransaction = createMockWallTransaction();
            wallTransaction.commitTransaction = vi.fn().mockResolvedValue({
                success: true,
                segmentResults: [{ tempId: -1, wallIndex: 0 }],
            });
            wallTransaction.transaction.originalWall = {
                index: 0,
                name: 'Wall 0',
                segments: [],
            };
            const props = createMockProps({
                selectedWallIndex: 0,
                wallTransaction,
            });
            const { result } = renderHook(() => useWallHandlers(props));

            // Act
            await act(async () => {
                await result.current.handleFinishEditing();
            });

            // Assert
            expect(props.refetch).toHaveBeenCalled();
        });

        it('should clear selection state after successful commit without original wall', async () => {
            // Arrange
            const wallTransaction = createMockWallTransaction();
            wallTransaction.commitTransaction = vi.fn().mockResolvedValue({
                success: true,
                segmentResults: [],
            });
            wallTransaction.transaction.originalWall = null;
            const props = createMockProps({
                selectedWallIndex: 0,
                wallTransaction,
            });
            const { result } = renderHook(() => useWallHandlers(props));

            // Act
            await act(async () => {
                await result.current.handleFinishEditing();
            });

            // Wait for setTimeout to execute
            await act(async () => {
                await new Promise((resolve) => setTimeout(resolve, 10));
            });

            // Assert
            expect(props.setSelectedWallIndex).toHaveBeenCalledWith(null);
            expect(props.setIsEditingVertices).toHaveBeenCalledWith(false);
        });

        it('should execute EditWallCommand for single segment edit', async () => {
            // Arrange
            const encounter = createMockEncounter({
                stage: {
                    ...createMockEncounter().stage,
                    walls: [createMockWall(0)],
                },
            });
            const wallTransaction = createMockWallTransaction();
            wallTransaction.commitTransaction = vi.fn().mockResolvedValue({
                success: true,
                segmentResults: [{ tempId: -1, wallIndex: 0 }],
            });
            wallTransaction.transaction.originalWall = {
                index: 0,
                name: 'Wall 0',
                segments: [],
            };
            const props = createMockProps({
                encounter,
                selectedWallIndex: 0,
                wallTransaction,
                refetch: vi.fn().mockResolvedValue({ data: encounter }),
            });
            const { result } = renderHook(() => useWallHandlers(props));

            // Act
            await act(async () => {
                await result.current.handleFinishEditing();
            });

            // Assert - execute should be called with EditWallCommand
            expect(props.execute).toHaveBeenCalled();
        });

        it('should execute BreakWallCommand for multiple segment results', async () => {
            // Arrange
            const encounter = createMockEncounter({
                stage: {
                    ...createMockEncounter().stage,
                    walls: [createMockWall(0), createMockWall(1)],
                },
            });
            const wallTransaction = createMockWallTransaction();
            wallTransaction.commitTransaction = vi.fn().mockResolvedValue({
                success: true,
                segmentResults: [
                    { tempId: -1, wallIndex: 0 },
                    { tempId: -2, wallIndex: 1 },
                ],
            });
            wallTransaction.transaction.originalWall = {
                index: 0,
                name: 'Wall 0',
                segments: [],
            };
            const props = createMockProps({
                encounter,
                selectedWallIndex: 0,
                wallTransaction,
                refetch: vi.fn().mockResolvedValue({ data: encounter }),
            });
            const { result } = renderHook(() => useWallHandlers(props));

            // Act
            await act(async () => {
                await result.current.handleFinishEditing();
            });

            // Assert - execute should be called with BreakWallCommand
            expect(props.execute).toHaveBeenCalled();
        });

        it('should show error when wall break succeeds but no segments found', async () => {
            // Arrange
            const encounter = createMockEncounter({
                stage: {
                    ...createMockEncounter().stage,
                    walls: [], // No walls to find
                },
            });
            const wallTransaction = createMockWallTransaction();
            wallTransaction.commitTransaction = vi.fn().mockResolvedValue({
                success: true,
                segmentResults: [
                    { tempId: -1, wallIndex: 0 },
                    { tempId: -2, wallIndex: 1 },
                ],
            });
            wallTransaction.transaction.originalWall = {
                index: 0,
                name: 'Wall 0',
                segments: [],
            };
            const props = createMockProps({
                encounter,
                selectedWallIndex: 0,
                wallTransaction,
                refetch: vi.fn().mockResolvedValue({ data: encounter }),
            });
            const { result } = renderHook(() => useWallHandlers(props));

            // Act
            await act(async () => {
                await result.current.handleFinishEditing();
            });

            // Assert
            expect(props.setErrorMessage).toHaveBeenCalledWith('Wall break failed. Please try again.');
        });

        it('should show error on commit failure', async () => {
            // Arrange
            const wallTransaction = createMockWallTransaction();
            wallTransaction.commitTransaction = vi.fn().mockResolvedValue({
                success: false,
                segmentResults: [],
            });
            const props = createMockProps({
                selectedWallIndex: 0,
                wallTransaction,
            });
            const { result } = renderHook(() => useWallHandlers(props));

            // Act
            await act(async () => {
                await result.current.handleFinishEditing();
            });

            // Assert
            expect(props.setErrorMessage).toHaveBeenCalledWith('Failed to save wall changes. Please try again.');
        });

        it('should apply optimistic update when active segment has segments', async () => {
            // Arrange
            const wallTransaction = createMockWallTransaction();
            wallTransaction.getActiveSegments = vi.fn().mockReturnValue([{
                tempId: -1,
                wallIndex: 0,
                name: 'Wall 0',
                segments: [{ index: 0 }], // Has segments
            }]);
            wallTransaction.commitTransaction = vi.fn().mockResolvedValue({
                success: true,
                segmentResults: [{ tempId: -1, wallIndex: 0 }],
            });
            wallTransaction.transaction.originalWall = {
                index: 0,
                name: 'Wall 0',
                segments: [],
            };
            const props = createMockProps({
                selectedWallIndex: 0,
                wallTransaction,
            });
            const { result } = renderHook(() => useWallHandlers(props));

            // Act
            await act(async () => {
                await result.current.handleFinishEditing();
            });

            // Assert - optimistic update should be applied
            expect(props.setEncounter).toHaveBeenCalled();
            expect(props.setPlacedWalls).toHaveBeenCalled();
        });

        it('should handle addWall failure in BreakWallCommand.onAdd callback', async () => {
            // Arrange
            const encounter = createMockEncounter({
                stage: {
                    ...createMockEncounter().stage,
                    walls: [createMockWall(0), createMockWall(1)],
                },
            });
            const wallTransaction = createMockWallTransaction();
            wallTransaction.commitTransaction = vi.fn().mockResolvedValue({
                success: true,
                segmentResults: [
                    { tempId: -1, wallIndex: 0 },
                    { tempId: -2, wallIndex: 1 },
                ],
            });
            wallTransaction.transaction.originalWall = {
                index: 0,
                name: 'Wall 0',
                segments: [],
            };
            const wallMutations = createMockWallMutations();
            // Make addWall reject to simulate failure
            wallMutations.addWall = vi.fn().mockRejectedValue(new Error('Add wall failed'));
            let capturedCommand: Command | null = null;
            const props = createMockProps({
                encounter,
                selectedWallIndex: 0,
                wallTransaction,
                wallMutations,
                refetch: vi.fn().mockResolvedValue({ data: encounter }),
                execute: vi.fn().mockImplementation((cmd: Command) => {
                    capturedCommand = cmd;
                }),
            });
            const { result } = renderHook(() => useWallHandlers(props));

            // Act
            await act(async () => {
                await result.current.handleFinishEditing();
            });

            // Assert - execute should have been called with BreakWallCommand
            expect(props.execute).toHaveBeenCalled();
            expect(capturedCommand).not.toBeNull();
        });

        it('should handle updateWall failure in BreakWallCommand.onUpdate callback', async () => {
            // Arrange
            const encounter = createMockEncounter({
                stage: {
                    ...createMockEncounter().stage,
                    walls: [createMockWall(0), createMockWall(1)],
                },
            });
            const wallTransaction = createMockWallTransaction();
            wallTransaction.commitTransaction = vi.fn().mockResolvedValue({
                success: true,
                segmentResults: [
                    { tempId: -1, wallIndex: 0 },
                    { tempId: -2, wallIndex: 1 },
                ],
            });
            wallTransaction.transaction.originalWall = {
                index: 0,
                name: 'Wall 0',
                segments: [],
            };
            const wallMutations = createMockWallMutations();
            // Make updateWall reject to simulate failure
            wallMutations.updateWall = vi.fn().mockRejectedValue(new Error('Update wall failed'));
            let capturedCommand: Command | null = null;
            const props = createMockProps({
                encounter,
                selectedWallIndex: 0,
                wallTransaction,
                wallMutations,
                refetch: vi.fn().mockResolvedValue({ data: encounter }),
                execute: vi.fn().mockImplementation((cmd: Command) => {
                    capturedCommand = cmd;
                }),
            });
            const { result } = renderHook(() => useWallHandlers(props));

            // Act
            await act(async () => {
                await result.current.handleFinishEditing();
            });

            // Assert - execute should have been called
            expect(props.execute).toHaveBeenCalled();
            expect(capturedCommand).not.toBeNull();
        });

        it('should handle updateWall failure in EditWallCommand.onUpdate callback', async () => {
            // Arrange
            const encounter = createMockEncounter({
                stage: {
                    ...createMockEncounter().stage,
                    walls: [createMockWall(0)],
                },
            });
            const wallTransaction = createMockWallTransaction();
            wallTransaction.commitTransaction = vi.fn().mockResolvedValue({
                success: true,
                segmentResults: [{ tempId: -1, wallIndex: 0 }],
            });
            wallTransaction.transaction.originalWall = {
                index: 0,
                name: 'Wall 0',
                segments: [],
            };
            const wallMutations = createMockWallMutations();
            // Make updateWall reject to simulate failure
            wallMutations.updateWall = vi.fn().mockRejectedValue(new Error('Update wall failed'));
            let capturedCommand: Command | null = null;
            const props = createMockProps({
                encounter,
                selectedWallIndex: 0,
                wallTransaction,
                wallMutations,
                refetch: vi.fn().mockResolvedValue({ data: encounter }),
                execute: vi.fn().mockImplementation((cmd: Command) => {
                    capturedCommand = cmd;
                }),
            });
            const { result } = renderHook(() => useWallHandlers(props));

            // Act
            await act(async () => {
                await result.current.handleFinishEditing();
            });

            // Assert - execute should have been called with EditWallCommand
            expect(props.execute).toHaveBeenCalled();
            expect(capturedCommand).not.toBeNull();
        });
    });

    describe('callback stability', () => {
        it('should return stable handleWallDelete reference when deps unchanged', () => {
            // Arrange - use stable props reference
            const stableProps = createMockProps();
            const { result, rerender } = renderHook(
                ({ props }) => useWallHandlers(props),
                { initialProps: { props: stableProps } },
            );
            const firstRef = result.current.handleWallDelete;

            // Act - rerender with same props
            rerender({ props: stableProps });

            // Assert
            expect(result.current.handleWallDelete).toBe(firstRef);
        });

        it('should return stable handleWallSelect reference when deps unchanged', () => {
            // Arrange - use stable props reference
            const stableProps = createMockProps();
            const { result, rerender } = renderHook(
                ({ props }) => useWallHandlers(props),
                { initialProps: { props: stableProps } },
            );
            const firstRef = result.current.handleWallSelect;

            // Act - rerender with same props
            rerender({ props: stableProps });

            // Assert
            expect(result.current.handleWallSelect).toBe(firstRef);
        });

        it('should return stable handleEditVertices reference when deps unchanged', () => {
            // Arrange - use stable props reference
            const stableProps = createMockProps();
            const { result, rerender } = renderHook(
                ({ props }) => useWallHandlers(props),
                { initialProps: { props: stableProps } },
            );
            const firstRef = result.current.handleEditVertices;

            // Act - rerender with same props
            rerender({ props: stableProps });

            // Assert
            expect(result.current.handleEditVertices).toBe(firstRef);
        });
    });
});
