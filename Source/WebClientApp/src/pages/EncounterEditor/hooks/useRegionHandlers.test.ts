/**
 * useRegionHandlers Hook Unit Tests
 * Tests region management operations: delete, edit, select, placement, property updates
 */

import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Encounter, EncounterRegion, PlacedRegion, Point } from '@/types/domain';
import { RegionType } from '@/types/domain';
import type { StageRegion } from '@/types/stage';
import { useRegionHandlers } from './useRegionHandlers';
import type { useRegionTransaction } from '@/hooks/useRegionTransaction';
import {
    createMockEncounter,
    createMockRegion,
} from '@/tests/utils/mockFactories';

// Mock dependencies
vi.mock('@/utils/encounterEntityMapping', () => ({
    getDomIdByIndex: vi.fn().mockReturnValue('region-dom-id'),
    removeEntityMapping: vi.fn(),
}));

vi.mock('@/utils/encounterMappers', () => ({
    hydratePlacedRegions: vi.fn().mockImplementation((regions: StageRegion[], _encounterId: string): PlacedRegion[] =>
        (regions || []).map((r) => ({
            id: `region-${r.index}`,
            index: r.index,
            name: r.name,
            type: r.type,
            vertices: r.vertices,
            value: r.value,
        } as PlacedRegion)),
    ),
}));

vi.mock('@/utils/encounterStateUtils', () => ({
    filterEncounterForMergeDetection: vi.fn().mockImplementation((encounter: Encounter) => encounter),
    removeRegionOptimistic: vi.fn().mockImplementation((encounter: Encounter, _index: number) => encounter),
    syncRegionIndices: vi.fn().mockImplementation((encounter: Encounter, _tempToReal: Map<number, number>) => encounter),
    updateRegionOptimistic: vi.fn().mockImplementation((encounter: Encounter, _index: number, _updates: Partial<EncounterRegion>) => encounter),
}));

vi.mock('./useMergeRegions', () => ({
    useMergeRegions: () => ({
        executeMerge: vi.fn().mockResolvedValue(undefined),
    }),
}));

vi.mock('./useClipRegions', () => ({
    useClipRegions: () => ({
        executeClip: vi.fn().mockResolvedValue(undefined),
    }),
}));

// Mock region transaction factory
const createMockRegionTransaction = (): ReturnType<typeof useRegionTransaction> => ({
    transaction: {
        type: null,
        originalRegion: null,
        segment: null,
        isActive: false,
    },
    startTransaction: vi.fn(),
    updateSegment: vi.fn(),
    commitTransaction: vi.fn().mockResolvedValue({ success: true, regionIndex: 0 }),
    rollbackTransaction: vi.fn(),
    clearTransaction: vi.fn(),
    getActiveSegment: vi.fn().mockReturnValue(null),
});

// Create mock props factory
const createMockProps = (overrides: Partial<Parameters<typeof useRegionHandlers>[0]> = {}) => {
    const encounter = createMockEncounter({
        stage: {
            ...createMockEncounter().stage,
            regions: [createMockRegion(0), createMockRegion(1)],
        },
    });

    return {
        encounterId: 'test-encounter-id',
        encounter: encounter as Encounter,
        regionTransaction: createMockRegionTransaction(),
        gridConfig: undefined,
        selectedRegionIndex: null as number | null,
        editingRegionIndex: null as number | null,
        originalRegionVertices: null as Point[] | null,
        drawingMode: null as 'region' | 'wall' | 'bucketFill' | null,
        drawingRegionIndex: null as number | null,
        addRegion: vi.fn().mockResolvedValue(undefined),
        updateRegion: vi.fn().mockResolvedValue(undefined),
        deleteRegion: vi.fn().mockResolvedValue(undefined),
        setEncounter: vi.fn(),
        setPlacedRegions: vi.fn(),
        setSelectedRegionIndex: vi.fn(),
        setEditingRegionIndex: vi.fn(),
        setIsEditingRegionVertices: vi.fn(),
        setOriginalRegionVertices: vi.fn(),
        setDrawingRegionIndex: vi.fn(),
        setRegionPlacementMode: vi.fn(),
        setErrorMessage: vi.fn(),
        recordAction: vi.fn(),
        refetch: vi.fn().mockResolvedValue({ data: encounter }),
        ...overrides,
    };
};

describe('useRegionHandlers', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('handleRegionDelete', () => {
        it('should call deleteRegion with correct index', async () => {
            // Arrange
            const props = createMockProps();
            const { result } = renderHook(() => useRegionHandlers(props));

            // Act
            await act(async () => {
                await result.current.handleRegionDelete(0);
            });

            // Assert
            expect(props.deleteRegion).toHaveBeenCalledWith(0);
        });

        it('should refetch encounter after successful delete', async () => {
            // Arrange
            const props = createMockProps();
            const { result } = renderHook(() => useRegionHandlers(props));

            // Act
            await act(async () => {
                await result.current.handleRegionDelete(0);
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
            const { result } = renderHook(() => useRegionHandlers(props));

            // Act
            await act(async () => {
                await result.current.handleRegionDelete(0);
            });

            // Assert
            expect(props.setEncounter).toHaveBeenCalledWith(updatedEncounter);
        });

        it('should clear selection when deleting selected region', async () => {
            // Arrange
            const props = createMockProps({ selectedRegionIndex: 0 });
            const { result } = renderHook(() => useRegionHandlers(props));

            // Act
            await act(async () => {
                await result.current.handleRegionDelete(0);
            });

            // Assert
            expect(props.setSelectedRegionIndex).toHaveBeenCalledWith(null);
        });

        it('should not delete when encounterId is missing', async () => {
            // Arrange
            const props = createMockProps({ encounterId: undefined });
            const { result } = renderHook(() => useRegionHandlers(props));

            // Act
            await act(async () => {
                await result.current.handleRegionDelete(0);
            });

            // Assert
            expect(props.deleteRegion).not.toHaveBeenCalled();
        });

        it('should not delete when encounter is missing', async () => {
            // Arrange
            const props = createMockProps({ encounter: null });
            const { result } = renderHook(() => useRegionHandlers(props));

            // Act
            await act(async () => {
                await result.current.handleRegionDelete(0);
            });

            // Assert
            expect(props.deleteRegion).not.toHaveBeenCalled();
        });

        it('should not delete when region not found', async () => {
            // Arrange
            const encounter = createMockEncounter({
                stage: { ...createMockEncounter().stage, regions: [] },
            });
            const props = createMockProps({ encounter });
            const { result } = renderHook(() => useRegionHandlers(props));

            // Act
            await act(async () => {
                await result.current.handleRegionDelete(0);
            });

            // Assert
            expect(props.deleteRegion).not.toHaveBeenCalled();
        });
    });

    describe('handleRegionSelect', () => {
        it('should set selected region index', () => {
            // Arrange
            const props = createMockProps();
            const { result } = renderHook(() => useRegionHandlers(props));

            // Act
            act(() => {
                result.current.handleRegionSelect(1);
            });

            // Assert
            expect(props.setSelectedRegionIndex).toHaveBeenCalledWith(1);
        });

        it('should allow selecting null to clear selection', () => {
            // Arrange
            const props = createMockProps();
            const { result } = renderHook(() => useRegionHandlers(props));

            // Act
            act(() => {
                result.current.handleRegionSelect(null);
            });

            // Assert
            expect(props.setSelectedRegionIndex).toHaveBeenCalledWith(null);
        });
    });

    describe('handleEditRegionVertices', () => {
        it('should start transaction in editing mode', () => {
            // Arrange
            const regionTransaction = createMockRegionTransaction();
            const props = createMockProps({ regionTransaction });
            const { result } = renderHook(() => useRegionHandlers(props));

            // Act
            act(() => {
                result.current.handleEditRegionVertices(0);
            });

            // Assert
            expect(regionTransaction.startTransaction).toHaveBeenCalledWith(
                'editing',
                expect.objectContaining({ index: 0 }),
            );
        });

        it('should set editing region index', () => {
            // Arrange
            const props = createMockProps();
            const { result } = renderHook(() => useRegionHandlers(props));

            // Act
            act(() => {
                result.current.handleEditRegionVertices(0);
            });

            // Assert
            expect(props.setEditingRegionIndex).toHaveBeenCalledWith(0);
        });

        it('should set selected region index', () => {
            // Arrange
            const props = createMockProps();
            const { result } = renderHook(() => useRegionHandlers(props));

            // Act
            act(() => {
                result.current.handleEditRegionVertices(0);
            });

            // Assert
            expect(props.setSelectedRegionIndex).toHaveBeenCalledWith(0);
        });

        it('should enable vertex editing mode', () => {
            // Arrange
            const props = createMockProps();
            const { result } = renderHook(() => useRegionHandlers(props));

            // Act
            act(() => {
                result.current.handleEditRegionVertices(0);
            });

            // Assert
            expect(props.setIsEditingRegionVertices).toHaveBeenCalledWith(true);
        });

        it('should store original vertices', () => {
            // Arrange
            const props = createMockProps();
            const { result } = renderHook(() => useRegionHandlers(props));

            // Act
            act(() => {
                result.current.handleEditRegionVertices(0);
            });

            // Assert
            expect(props.setOriginalRegionVertices).toHaveBeenCalled();
        });

        it('should not start editing when region not found', () => {
            // Arrange
            const encounter = createMockEncounter({
                stage: { ...createMockEncounter().stage, regions: [] },
            });
            const regionTransaction = createMockRegionTransaction();
            const props = createMockProps({ encounter, regionTransaction });
            const { result } = renderHook(() => useRegionHandlers(props));

            // Act
            act(() => {
                result.current.handleEditRegionVertices(0);
            });

            // Assert
            expect(regionTransaction.startTransaction).not.toHaveBeenCalled();
        });
    });

    describe('handleCancelEditingRegion', () => {
        it('should rollback transaction', async () => {
            // Arrange
            const regionTransaction = createMockRegionTransaction();
            const props = createMockProps({
                editingRegionIndex: 0,
                regionTransaction,
            });
            const { result } = renderHook(() => useRegionHandlers(props));

            // Act
            await act(async () => {
                await result.current.handleCancelEditingRegion();
            });

            // Assert
            expect(regionTransaction.rollbackTransaction).toHaveBeenCalled();
        });

        it('should clear editing state', async () => {
            // Arrange
            const props = createMockProps({ editingRegionIndex: 0 });
            const { result } = renderHook(() => useRegionHandlers(props));

            // Act
            await act(async () => {
                await result.current.handleCancelEditingRegion();
            });

            // Assert
            expect(props.setEditingRegionIndex).toHaveBeenCalledWith(null);
            expect(props.setSelectedRegionIndex).toHaveBeenCalledWith(null);
            expect(props.setIsEditingRegionVertices).toHaveBeenCalledWith(false);
            expect(props.setOriginalRegionVertices).toHaveBeenCalledWith(null);
        });

        it('should not cancel when encounter is missing', async () => {
            // Arrange
            const regionTransaction = createMockRegionTransaction();
            const props = createMockProps({
                encounter: null,
                regionTransaction,
            });
            const { result } = renderHook(() => useRegionHandlers(props));

            // Act
            await act(async () => {
                await result.current.handleCancelEditingRegion();
            });

            // Assert
            expect(regionTransaction.rollbackTransaction).not.toHaveBeenCalled();
        });

        it('should not cancel when no region is being edited', async () => {
            // Arrange
            const regionTransaction = createMockRegionTransaction();
            const props = createMockProps({
                editingRegionIndex: null,
                regionTransaction,
            });
            const { result } = renderHook(() => useRegionHandlers(props));

            // Act
            await act(async () => {
                await result.current.handleCancelEditingRegion();
            });

            // Assert
            expect(regionTransaction.rollbackTransaction).not.toHaveBeenCalled();
        });
    });

    describe('handlePlaceRegion', () => {
        it('should start transaction in placement mode', () => {
            // Arrange
            const regionTransaction = createMockRegionTransaction();
            const props = createMockProps({ regionTransaction });
            const { result } = renderHook(() => useRegionHandlers(props));

            // Act
            act(() => {
                result.current.handlePlaceRegion({
                    name: 'New Region',
                    type: RegionType.Terrain,
                    value: 5,
                });
            });

            // Assert
            expect(regionTransaction.startTransaction).toHaveBeenCalledWith(
                'placement',
                undefined,
                expect.objectContaining({
                    name: 'New Region',
                    type: RegionType.Terrain,
                    value: 5,
                }),
            );
        });

        it('should set drawing region index to -1 for temp region', () => {
            // Arrange
            const props = createMockProps();
            const { result } = renderHook(() => useRegionHandlers(props));

            // Act
            act(() => {
                result.current.handlePlaceRegion({
                    name: 'New Region',
                    type: RegionType.Terrain,
                });
            });

            // Assert
            expect(props.setDrawingRegionIndex).toHaveBeenCalledWith(-1);
        });

        it('should set region placement mode to polygon', () => {
            // Arrange
            const props = createMockProps();
            const { result } = renderHook(() => useRegionHandlers(props));

            // Act
            act(() => {
                result.current.handlePlaceRegion({
                    name: 'New Region',
                    type: RegionType.Terrain,
                });
            });

            // Assert
            expect(props.setRegionPlacementMode).toHaveBeenCalledWith('polygon');
        });

        it('should clear editing state before placing', () => {
            // Arrange
            const props = createMockProps();
            const { result } = renderHook(() => useRegionHandlers(props));

            // Act
            act(() => {
                result.current.handlePlaceRegion({
                    name: 'New Region',
                    type: RegionType.Terrain,
                });
            });

            // Assert
            expect(props.setEditingRegionIndex).toHaveBeenCalledWith(null);
            expect(props.setIsEditingRegionVertices).toHaveBeenCalledWith(false);
            expect(props.setOriginalRegionVertices).toHaveBeenCalledWith(null);
            expect(props.setSelectedRegionIndex).toHaveBeenCalledWith(null);
        });

        it('should add temp region to encounter', () => {
            // Arrange
            const props = createMockProps();
            const { result } = renderHook(() => useRegionHandlers(props));

            // Act
            act(() => {
                result.current.handlePlaceRegion({
                    name: 'New Region',
                    type: RegionType.Terrain,
                });
            });

            // Assert
            expect(props.setEncounter).toHaveBeenCalled();
        });
    });

    describe('handleBucketFillRegion', () => {
        it('should start transaction in placement mode', () => {
            // Arrange
            const regionTransaction = createMockRegionTransaction();
            const props = createMockProps({ regionTransaction });
            const { result } = renderHook(() => useRegionHandlers(props));

            // Act
            act(() => {
                result.current.handleBucketFillRegion({
                    name: 'Fill Region',
                    type: RegionType.Difficult,
                    value: 2,
                });
            });

            // Assert
            expect(regionTransaction.startTransaction).toHaveBeenCalledWith(
                'placement',
                undefined,
                expect.objectContaining({
                    name: 'Fill Region',
                    type: RegionType.Difficult,
                    value: 2,
                }),
            );
        });

        it('should set region placement mode to bucketFill', () => {
            // Arrange
            const props = createMockProps();
            const { result } = renderHook(() => useRegionHandlers(props));

            // Act
            act(() => {
                result.current.handleBucketFillRegion({
                    name: 'Fill Region',
                    type: RegionType.Terrain,
                });
            });

            // Assert
            expect(props.setRegionPlacementMode).toHaveBeenCalledWith('bucketFill');
        });

        it('should set drawing region index to -1 for temp region', () => {
            // Arrange
            const props = createMockProps();
            const { result } = renderHook(() => useRegionHandlers(props));

            // Act
            act(() => {
                result.current.handleBucketFillRegion({
                    name: 'Fill Region',
                    type: RegionType.Terrain,
                });
            });

            // Assert
            expect(props.setDrawingRegionIndex).toHaveBeenCalledWith(-1);
        });
    });

    describe('handleBucketFillFinish', () => {
        it('should call addRegion with vertices', async () => {
            // Arrange
            const regionTransaction = createMockRegionTransaction();
            regionTransaction.transaction.segment = {
                name: 'Fill Region',
                type: RegionType.Terrain,
                vertices: [],
                value: 5,
            };
            const props = createMockProps({
                drawingRegionIndex: -1,
                regionTransaction,
            });
            const { result } = renderHook(() => useRegionHandlers(props));

            const vertices: Point[] = [
                { x: 0, y: 0 },
                { x: 100, y: 0 },
                { x: 100, y: 100 },
                { x: 0, y: 100 },
            ];

            // Act
            await act(async () => {
                await result.current.handleBucketFillFinish(vertices);
            });

            // Assert
            expect(props.addRegion).toHaveBeenCalledWith(expect.objectContaining({
                name: 'Fill Region',
                vertices,
            }));
        });

        it('should refetch after adding region', async () => {
            // Arrange
            const regionTransaction = createMockRegionTransaction();
            regionTransaction.transaction.segment = {
                name: 'Fill Region',
                type: RegionType.Terrain,
                vertices: [],
            };
            const props = createMockProps({
                drawingRegionIndex: -1,
                regionTransaction,
            });
            const { result } = renderHook(() => useRegionHandlers(props));

            // Act
            await act(async () => {
                await result.current.handleBucketFillFinish([{ x: 0, y: 0 }]);
            });

            // Assert
            expect(props.refetch).toHaveBeenCalled();
        });

        it('should clear drawing index after completion', async () => {
            // Arrange
            const regionTransaction = createMockRegionTransaction();
            regionTransaction.transaction.segment = {
                name: 'Fill Region',
                type: RegionType.Terrain,
                vertices: [],
            };
            const props = createMockProps({
                drawingRegionIndex: -1,
                regionTransaction,
            });
            const { result } = renderHook(() => useRegionHandlers(props));

            // Act
            await act(async () => {
                await result.current.handleBucketFillFinish([{ x: 0, y: 0 }]);
            });

            // Assert
            expect(props.setDrawingRegionIndex).toHaveBeenCalledWith(null);
        });

        it('should show error when segment is missing', async () => {
            // Arrange
            const regionTransaction = createMockRegionTransaction();
            regionTransaction.transaction.segment = null;
            const props = createMockProps({
                drawingRegionIndex: -1,
                regionTransaction,
            });
            const { result } = renderHook(() => useRegionHandlers(props));

            // Act
            await act(async () => {
                await result.current.handleBucketFillFinish([{ x: 0, y: 0 }]);
            });

            // Assert
            expect(props.setErrorMessage).toHaveBeenCalledWith('No region properties found');
        });

        it('should not proceed when encounterId is missing', async () => {
            // Arrange
            const props = createMockProps({ encounterId: undefined });
            const { result } = renderHook(() => useRegionHandlers(props));

            // Act
            await act(async () => {
                await result.current.handleBucketFillFinish([{ x: 0, y: 0 }]);
            });

            // Assert
            expect(props.addRegion).not.toHaveBeenCalled();
        });

        it('should not proceed when drawingRegionIndex is null', async () => {
            // Arrange
            const props = createMockProps({ drawingRegionIndex: null });
            const { result } = renderHook(() => useRegionHandlers(props));

            // Act
            await act(async () => {
                await result.current.handleBucketFillFinish([{ x: 0, y: 0 }]);
            });

            // Assert
            expect(props.addRegion).not.toHaveBeenCalled();
        });
    });

    describe('handleRegionPropertyUpdate', () => {
        it('should call updateRegion with correct parameters', async () => {
            // Arrange
            const props = createMockProps();
            const { result } = renderHook(() => useRegionHandlers(props));

            // Act
            await act(async () => {
                await result.current.handleRegionPropertyUpdate(0, { name: 'Updated Name' });
            });

            // Assert
            expect(props.updateRegion).toHaveBeenCalledWith(0, expect.objectContaining({
                name: 'Updated Name',
            }));
        });

        it('should apply optimistic update to encounter', async () => {
            // Arrange
            const props = createMockProps();
            const { result } = renderHook(() => useRegionHandlers(props));

            // Act
            await act(async () => {
                await result.current.handleRegionPropertyUpdate(0, { name: 'Updated Name' });
            });

            // Assert
            expect(props.setEncounter).toHaveBeenCalled();
        });

        it('should refetch on update failure', async () => {
            // Arrange
            const props = createMockProps({
                updateRegion: vi.fn().mockRejectedValue(new Error('Update failed')),
            });
            const { result } = renderHook(() => useRegionHandlers(props));

            // Act
            await act(async () => {
                await result.current.handleRegionPropertyUpdate(0, { name: 'Updated' });
            });

            // Assert
            expect(props.refetch).toHaveBeenCalled();
        });

        it('should not update when encounterId is missing', async () => {
            // Arrange
            const props = createMockProps({ encounterId: undefined });
            const { result } = renderHook(() => useRegionHandlers(props));

            // Act
            await act(async () => {
                await result.current.handleRegionPropertyUpdate(0, { name: 'Updated' });
            });

            // Assert
            expect(props.updateRegion).not.toHaveBeenCalled();
        });

        it('should not update when region not found', async () => {
            // Arrange
            const encounter = createMockEncounter({
                stage: { ...createMockEncounter().stage, regions: [] },
            });
            const props = createMockProps({ encounter });
            const { result } = renderHook(() => useRegionHandlers(props));

            // Act
            await act(async () => {
                await result.current.handleRegionPropertyUpdate(0, { name: 'Updated' });
            });

            // Assert
            expect(props.updateRegion).not.toHaveBeenCalled();
        });
    });

    describe('handleStructurePlacementFinish', () => {
        it('should commit transaction when in region drawing mode', async () => {
            // Arrange
            const regionTransaction = createMockRegionTransaction();
            regionTransaction.commitTransaction = vi.fn().mockResolvedValue({
                success: true,
                regionIndex: 0,
            });
            const props = createMockProps({
                drawingMode: 'region',
                drawingRegionIndex: -1,
                regionTransaction,
            });
            const { result } = renderHook(() => useRegionHandlers(props));

            // Act
            await act(async () => {
                await result.current.handleStructurePlacementFinish();
            });

            // Assert
            expect(regionTransaction.commitTransaction).toHaveBeenCalled();
        });

        it('should clear drawing index after successful placement', async () => {
            // Arrange
            const regionTransaction = createMockRegionTransaction();
            regionTransaction.commitTransaction = vi.fn().mockResolvedValue({
                success: true,
                regionIndex: 0,
            });
            const props = createMockProps({
                drawingMode: 'region',
                drawingRegionIndex: -1,
                regionTransaction,
            });
            const { result } = renderHook(() => useRegionHandlers(props));

            // Act
            await act(async () => {
                await result.current.handleStructurePlacementFinish();
            });

            // Assert
            expect(props.setDrawingRegionIndex).toHaveBeenCalledWith(null);
        });

        it('should show error on placement failure', async () => {
            // Arrange
            const regionTransaction = createMockRegionTransaction();
            regionTransaction.commitTransaction = vi.fn().mockResolvedValue({
                success: false,
            });
            const props = createMockProps({
                drawingMode: 'region',
                drawingRegionIndex: -1,
                regionTransaction,
            });
            const { result } = renderHook(() => useRegionHandlers(props));

            // Act
            await act(async () => {
                await result.current.handleStructurePlacementFinish();
            });

            // Assert
            expect(props.setErrorMessage).toHaveBeenCalledWith('Failed to place region. Please try again.');
        });

        it('should not finish when not in region or bucketFill mode', async () => {
            // Arrange
            const regionTransaction = createMockRegionTransaction();
            const props = createMockProps({
                drawingMode: 'wall',
                drawingRegionIndex: -1,
                regionTransaction,
            });
            const { result } = renderHook(() => useRegionHandlers(props));

            // Act
            await act(async () => {
                await result.current.handleStructurePlacementFinish();
            });

            // Assert
            expect(regionTransaction.commitTransaction).not.toHaveBeenCalled();
        });

        it('should not finish when drawingRegionIndex is null', async () => {
            // Arrange
            const regionTransaction = createMockRegionTransaction();
            const props = createMockProps({
                drawingMode: 'region',
                drawingRegionIndex: null,
                regionTransaction,
            });
            const { result } = renderHook(() => useRegionHandlers(props));

            // Act
            await act(async () => {
                await result.current.handleStructurePlacementFinish();
            });

            // Assert
            expect(regionTransaction.commitTransaction).not.toHaveBeenCalled();
        });
    });

    describe('handleFinishEditingRegion', () => {
        it('should not finish when encounterId is missing', async () => {
            // Arrange
            const regionTransaction = createMockRegionTransaction();
            const props = createMockProps({
                encounterId: undefined,
                editingRegionIndex: 0,
                regionTransaction,
            });
            const { result } = renderHook(() => useRegionHandlers(props));

            // Act
            await act(async () => {
                await result.current.handleFinishEditingRegion();
            });

            // Assert
            expect(regionTransaction.commitTransaction).not.toHaveBeenCalled();
        });

        it('should not finish when encounter is missing', async () => {
            // Arrange
            const regionTransaction = createMockRegionTransaction();
            const props = createMockProps({
                encounter: null,
                editingRegionIndex: 0,
                regionTransaction,
            });
            const { result } = renderHook(() => useRegionHandlers(props));

            // Act
            await act(async () => {
                await result.current.handleFinishEditingRegion();
            });

            // Assert
            expect(regionTransaction.commitTransaction).not.toHaveBeenCalled();
        });

        it('should not finish when no region is being edited', async () => {
            // Arrange
            const regionTransaction = createMockRegionTransaction();
            const props = createMockProps({
                editingRegionIndex: null,
                regionTransaction,
            });
            const { result } = renderHook(() => useRegionHandlers(props));

            // Act
            await act(async () => {
                await result.current.handleFinishEditingRegion();
            });

            // Assert
            expect(regionTransaction.commitTransaction).not.toHaveBeenCalled();
        });

        it('should commit transaction when finishing edit', async () => {
            // Arrange
            const regionTransaction = createMockRegionTransaction();
            regionTransaction.commitTransaction = vi.fn().mockResolvedValue({
                success: true,
                regionIndex: 0,
            });
            regionTransaction.transaction.originalRegion = {
                index: 0,
                name: 'Region 0',
                type: RegionType.Terrain,
                vertices: [],
            };
            regionTransaction.transaction.segment = {
                name: 'Region 0',
                type: RegionType.Terrain,
                vertices: [{ x: 0, y: 0 }],
            };
            const props = createMockProps({
                editingRegionIndex: 0,
                regionTransaction,
            });
            const { result } = renderHook(() => useRegionHandlers(props));

            // Act
            await act(async () => {
                await result.current.handleFinishEditingRegion();
            });

            // Assert
            expect(regionTransaction.commitTransaction).toHaveBeenCalled();
        });

        it('should create EditRegionCommand on successful commit', async () => {
            // Arrange
            const regionTransaction = createMockRegionTransaction();
            regionTransaction.commitTransaction = vi.fn().mockResolvedValue({
                success: true,
                regionIndex: 0,
            });
            regionTransaction.transaction.originalRegion = {
                index: 0,
                name: 'Region 0',
                type: RegionType.Terrain,
                vertices: [{ x: 0, y: 0 }],
            };
            regionTransaction.transaction.segment = {
                name: 'Updated Region',
                type: RegionType.Terrain,
                vertices: [{ x: 0, y: 0 }, { x: 100, y: 0 }],
            };
            const props = createMockProps({
                editingRegionIndex: 0,
                regionTransaction,
            });
            const { result } = renderHook(() => useRegionHandlers(props));

            // Act
            await act(async () => {
                await result.current.handleFinishEditingRegion();
            });

            // Assert
            expect(props.recordAction).toHaveBeenCalled();
        });

        it('should clear editing state after successful commit', async () => {
            // Arrange
            const regionTransaction = createMockRegionTransaction();
            regionTransaction.commitTransaction = vi.fn().mockResolvedValue({
                success: true,
                regionIndex: 0,
            });
            regionTransaction.transaction.segment = {
                name: 'Region 0',
                type: RegionType.Terrain,
                vertices: [{ x: 0, y: 0 }],
            };
            const props = createMockProps({
                editingRegionIndex: 0,
                regionTransaction,
            });
            const { result } = renderHook(() => useRegionHandlers(props));

            // Act
            await act(async () => {
                await result.current.handleFinishEditingRegion();
            });

            // Assert
            expect(regionTransaction.clearTransaction).toHaveBeenCalled();
            expect(props.setEditingRegionIndex).toHaveBeenCalledWith(null);
            expect(props.setSelectedRegionIndex).toHaveBeenCalledWith(null);
            expect(props.setIsEditingRegionVertices).toHaveBeenCalledWith(false);
            expect(props.setOriginalRegionVertices).toHaveBeenCalledWith(null);
        });

        it('should show error on commit failure', async () => {
            // Arrange
            const regionTransaction = createMockRegionTransaction();
            regionTransaction.commitTransaction = vi.fn().mockResolvedValue({
                success: false,
            });
            const props = createMockProps({
                editingRegionIndex: 0,
                regionTransaction,
            });
            const { result } = renderHook(() => useRegionHandlers(props));

            // Act
            await act(async () => {
                await result.current.handleFinishEditingRegion();
            });

            // Assert
            expect(props.setErrorMessage).toHaveBeenCalledWith('Failed to update region. Please try again.');
            expect(regionTransaction.rollbackTransaction).toHaveBeenCalled();
        });

        it('should revert to original vertices on commit failure', async () => {
            // Arrange
            const originalVertices = [{ x: 0, y: 0 }, { x: 50, y: 50 }];
            const regionTransaction = createMockRegionTransaction();
            regionTransaction.commitTransaction = vi.fn().mockResolvedValue({
                success: false,
            });
            const props = createMockProps({
                editingRegionIndex: 0,
                originalRegionVertices: originalVertices,
                regionTransaction,
            });
            const { result } = renderHook(() => useRegionHandlers(props));

            // Act
            await act(async () => {
                await result.current.handleFinishEditingRegion();
            });

            // Assert
            expect(props.setEncounter).toHaveBeenCalled();
        });

        it('should apply optimistic update on successful commit with segment', async () => {
            // Arrange
            const regionTransaction = createMockRegionTransaction();
            regionTransaction.commitTransaction = vi.fn().mockResolvedValue({
                success: true,
                regionIndex: 0,
            });
            regionTransaction.transaction.segment = {
                name: 'Updated Region',
                type: RegionType.Terrain,
                vertices: [{ x: 0, y: 0 }, { x: 100, y: 100 }],
                value: 5,
            };
            const props = createMockProps({
                editingRegionIndex: 0,
                regionTransaction,
            });
            const { result } = renderHook(() => useRegionHandlers(props));

            // Act
            await act(async () => {
                await result.current.handleFinishEditingRegion();
            });

            // Assert
            expect(props.setEncounter).toHaveBeenCalled();
            expect(props.setPlacedRegions).toHaveBeenCalled();
        });
    });

    describe('handleSwitchToRegion', () => {
        it('should not switch when encounterId is missing', async () => {
            // Arrange
            const regionTransaction = createMockRegionTransaction();
            const props = createMockProps({
                encounterId: undefined,
                regionTransaction,
            });
            const { result } = renderHook(() => useRegionHandlers(props));

            // Act
            await act(async () => {
                await result.current.handleSwitchToRegion(1);
            });

            // Assert
            expect(props.refetch).not.toHaveBeenCalled();
        });

        it('should not switch when encounter is missing', async () => {
            // Arrange
            const regionTransaction = createMockRegionTransaction();
            const props = createMockProps({
                encounter: null,
                regionTransaction,
            });
            const { result } = renderHook(() => useRegionHandlers(props));

            // Act
            await act(async () => {
                await result.current.handleSwitchToRegion(1);
            });

            // Assert
            expect(props.refetch).not.toHaveBeenCalled();
        });

        it('should commit active transaction before switching', async () => {
            // Arrange
            const regionTransaction = createMockRegionTransaction();
            regionTransaction.transaction.isActive = true;
            regionTransaction.commitTransaction = vi.fn().mockResolvedValue({
                success: true,
                regionIndex: 0,
            });
            const props = createMockProps({
                editingRegionIndex: 0,
                regionTransaction,
            });
            const { result } = renderHook(() => useRegionHandlers(props));

            // Act
            await act(async () => {
                await result.current.handleSwitchToRegion(1);
            });

            // Assert
            expect(regionTransaction.commitTransaction).toHaveBeenCalled();
        });

        it('should clear current editing state before switching', async () => {
            // Arrange
            const regionTransaction = createMockRegionTransaction();
            const props = createMockProps({ regionTransaction });
            const { result } = renderHook(() => useRegionHandlers(props));

            // Act
            await act(async () => {
                await result.current.handleSwitchToRegion(1);
            });

            // Assert
            expect(props.setEditingRegionIndex).toHaveBeenCalledWith(null);
            expect(props.setSelectedRegionIndex).toHaveBeenCalledWith(null);
            expect(props.setIsEditingRegionVertices).toHaveBeenCalledWith(false);
            expect(props.setOriginalRegionVertices).toHaveBeenCalledWith(null);
        });

        it('should refetch encounter when switching', async () => {
            // Arrange
            const regionTransaction = createMockRegionTransaction();
            const props = createMockProps({ regionTransaction });
            const { result } = renderHook(() => useRegionHandlers(props));

            // Act
            await act(async () => {
                await result.current.handleSwitchToRegion(0);
            });

            // Assert
            expect(props.refetch).toHaveBeenCalled();
        });

        it('should start new editing transaction for target region', async () => {
            // Arrange
            const encounter = createMockEncounter({
                stage: {
                    ...createMockEncounter().stage,
                    regions: [createMockRegion(0), createMockRegion(1)],
                },
            });
            const regionTransaction = createMockRegionTransaction();
            const props = createMockProps({
                encounter,
                regionTransaction,
                refetch: vi.fn().mockResolvedValue({ data: encounter }),
            });
            const { result } = renderHook(() => useRegionHandlers(props));

            // Act
            await act(async () => {
                await result.current.handleSwitchToRegion(1);
            });

            // Assert
            expect(regionTransaction.startTransaction).toHaveBeenCalledWith(
                'editing',
                expect.objectContaining({ index: 1 }),
            );
        });

        it('should set new editing state for target region', async () => {
            // Arrange
            const encounter = createMockEncounter({
                stage: {
                    ...createMockEncounter().stage,
                    regions: [createMockRegion(0), createMockRegion(1)],
                },
            });
            const regionTransaction = createMockRegionTransaction();
            const props = createMockProps({
                encounter,
                regionTransaction,
                refetch: vi.fn().mockResolvedValue({ data: encounter }),
            });
            const { result } = renderHook(() => useRegionHandlers(props));

            // Act
            await act(async () => {
                await result.current.handleSwitchToRegion(1);
            });

            // Assert
            expect(props.setEditingRegionIndex).toHaveBeenCalledWith(1);
            expect(props.setSelectedRegionIndex).toHaveBeenCalledWith(1);
            expect(props.setIsEditingRegionVertices).toHaveBeenCalledWith(true);
        });

        it('should not start editing when target region not found', async () => {
            // Arrange
            const encounter = createMockEncounter({
                stage: {
                    ...createMockEncounter().stage,
                    regions: [createMockRegion(0)], // Only region 0 exists
                },
            });
            const regionTransaction = createMockRegionTransaction();
            const props = createMockProps({
                encounter,
                regionTransaction,
                refetch: vi.fn().mockResolvedValue({ data: encounter }),
            });
            const { result } = renderHook(() => useRegionHandlers(props));

            // Act
            await act(async () => {
                await result.current.handleSwitchToRegion(99); // Non-existent region
            });

            // Assert
            expect(regionTransaction.startTransaction).not.toHaveBeenCalled();
        });

        it('should not start editing when refetch returns no data', async () => {
            // Arrange
            const regionTransaction = createMockRegionTransaction();
            const props = createMockProps({
                regionTransaction,
                refetch: vi.fn().mockResolvedValue({ data: undefined }),
            });
            const { result } = renderHook(() => useRegionHandlers(props));

            // Act
            await act(async () => {
                await result.current.handleSwitchToRegion(1);
            });

            // Assert
            expect(regionTransaction.startTransaction).not.toHaveBeenCalled();
        });
    });

    // ============================================
    // C1: Finish Editing Merge/Clip Tests (~6 tests)
    // ============================================

    describe('handleFinishEditingRegion - merge/clip error paths', () => {
        it('should show error message when merge action cannot find originalTargetRegion', async () => {
            // Arrange
            const regionTransaction = createMockRegionTransaction();
            regionTransaction.commitTransaction = vi.fn().mockResolvedValue({
                success: false,
                action: 'merge',
                targetRegionIndex: 99, // Non-existent index
                originalRegions: [{ index: 0, name: 'Region 0', vertices: [] }], // Does not contain index 99
                mergedVertices: [{ x: 0, y: 0 }],
                regionsToDelete: [],
            });
            const props = createMockProps({
                editingRegionIndex: 0,
                regionTransaction,
            });
            const { result } = renderHook(() => useRegionHandlers(props));

            // Act
            await act(async () => {
                await result.current.handleFinishEditingRegion();
            });

            // Assert
            expect(props.setErrorMessage).toHaveBeenCalledWith('Original target region not found');
            expect(regionTransaction.rollbackTransaction).toHaveBeenCalled();
        });

        it('should use transaction.originalRegion when editing the target region in merge', async () => {
            // Arrange
            const originalRegion = {
                index: 0,
                name: 'Original Region',
                type: RegionType.Terrain,
                vertices: [{ x: 0, y: 0 }],
            };
            const regionTransaction = createMockRegionTransaction();
            regionTransaction.transaction.originalRegion = originalRegion;
            regionTransaction.commitTransaction = vi.fn().mockResolvedValue({
                success: false,
                action: 'merge',
                targetRegionIndex: 0, // Same as editingRegionIndex
                originalRegions: [], // Empty, so we need transaction.originalRegion
                mergedVertices: [{ x: 0, y: 0 }, { x: 100, y: 100 }],
                regionsToDelete: [],
            });
            const props = createMockProps({
                editingRegionIndex: 0,
                regionTransaction,
            });
            const { result } = renderHook(() => useRegionHandlers(props));

            // Act
            await act(async () => {
                await result.current.handleFinishEditingRegion();
            });

            // Assert - should not show error because it falls back to transaction.originalRegion
            expect(props.setErrorMessage).not.toHaveBeenCalledWith('Original target region not found');
        });

        it('should show error message when clip action has null segment', async () => {
            // Arrange
            const regionTransaction = createMockRegionTransaction();
            regionTransaction.transaction.segment = null; // No segment
            regionTransaction.commitTransaction = vi.fn().mockResolvedValue({
                success: false,
                action: 'clip',
                clipResults: [{ regionIndex: 1, clippedVertices: [[{ x: 0, y: 0 }]] }],
            });
            const props = createMockProps({
                editingRegionIndex: 0,
                regionTransaction,
            });
            const { result } = renderHook(() => useRegionHandlers(props));

            // Act
            await act(async () => {
                await result.current.handleFinishEditingRegion();
            });

            // Assert
            expect(props.setErrorMessage).toHaveBeenCalledWith('No segment found for clip operation');
            expect(regionTransaction.rollbackTransaction).toHaveBeenCalled();
        });

        it('should handle updateRegion failure in clip onSuccess callback', async () => {
            // Arrange
            const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            const regionTransaction = createMockRegionTransaction();
            regionTransaction.transaction.originalRegion = {
                index: 0,
                name: 'Original',
                type: RegionType.Terrain,
                vertices: [{ x: 0, y: 0 }],
            };
            regionTransaction.transaction.segment = {
                name: 'Edited Region',
                type: RegionType.Terrain,
                vertices: [{ x: 0, y: 0 }, { x: 100, y: 100 }],
            };
            regionTransaction.commitTransaction = vi.fn().mockResolvedValue({
                success: false,
                action: 'clip',
                clipResults: [{ regionIndex: 1, clippedVertices: [[{ x: 0, y: 0 }]] }],
            });

            // Mock executeClip to call onSuccess immediately
            const mockExecuteClip = vi.fn().mockImplementation(async ({ onSuccess }) => {
                if (onSuccess) await onSuccess();
            });
            vi.mocked(await import('./useClipRegions')).useClipRegions = () => ({
                executeClip: mockExecuteClip,
            });

            const props = createMockProps({
                editingRegionIndex: 0,
                regionTransaction,
                updateRegion: vi.fn().mockRejectedValue(new Error('Update failed')),
            });
            const { result } = renderHook(() => useRegionHandlers(props));

            // Act
            await act(async () => {
                await result.current.handleFinishEditingRegion();
            });

            // Assert - error should be caught and logged
            expect(consoleErrorSpy).toHaveBeenCalled();
            consoleErrorSpy.mockRestore();
        });

        it('should handle nullClip action with empty clipResults but valid segment', async () => {
            // Arrange
            const regionTransaction = createMockRegionTransaction();
            regionTransaction.transaction.segment = {
                name: 'Test Region',
                type: RegionType.Terrain,
                vertices: [{ x: 0, y: 0 }],
            };
            regionTransaction.commitTransaction = vi.fn().mockResolvedValue({
                success: false,
                action: 'nullClip',
                clipResults: [], // Empty clipResults
            });
            const props = createMockProps({
                editingRegionIndex: 0,
                regionTransaction,
            });
            const { result } = renderHook(() => useRegionHandlers(props));

            // Act
            await act(async () => {
                await result.current.handleFinishEditingRegion();
            });

            // Assert - should clear state since no clip operations to perform
            expect(regionTransaction.clearTransaction).toHaveBeenCalled();
            expect(props.setEditingRegionIndex).toHaveBeenCalledWith(null);
        });

        it('should clear state when nullClip has no clip operations to perform', async () => {
            // Arrange
            const regionTransaction = createMockRegionTransaction();
            regionTransaction.transaction.segment = null; // No segment
            regionTransaction.commitTransaction = vi.fn().mockResolvedValue({
                success: false,
                action: 'nullClip',
                clipResults: null, // No clipResults either
            });
            const props = createMockProps({
                editingRegionIndex: 0,
                regionTransaction,
            });
            const { result } = renderHook(() => useRegionHandlers(props));

            // Act
            await act(async () => {
                await result.current.handleFinishEditingRegion();
            });

            // Assert
            expect(regionTransaction.clearTransaction).toHaveBeenCalled();
            expect(props.setEditingRegionIndex).toHaveBeenCalledWith(null);
            expect(props.setSelectedRegionIndex).toHaveBeenCalledWith(null);
            expect(props.setIsEditingRegionVertices).toHaveBeenCalledWith(false);
            expect(props.setOriginalRegionVertices).toHaveBeenCalledWith(null);
        });
    });

    // ============================================
    // C2: Structure Placement Tests (~6 tests)
    // ============================================

    describe('handleStructurePlacementFinish - error paths', () => {
        it('should show error when merge action cannot find originalTargetRegion', async () => {
            // Arrange
            const regionTransaction = createMockRegionTransaction();
            regionTransaction.commitTransaction = vi.fn().mockResolvedValue({
                success: false,
                action: 'merge',
                targetRegionIndex: 99, // Non-existent
                originalRegions: [{ index: 0, name: 'Region 0', vertices: [] }],
                mergedVertices: [{ x: 0, y: 0 }],
                regionsToDelete: [],
            });
            const props = createMockProps({
                drawingMode: 'region',
                drawingRegionIndex: -1,
                regionTransaction,
            });
            const { result } = renderHook(() => useRegionHandlers(props));

            // Act
            await act(async () => {
                await result.current.handleStructurePlacementFinish();
            });

            // Assert
            expect(props.setErrorMessage).toHaveBeenCalledWith('Original target region not found');
            expect(regionTransaction.rollbackTransaction).toHaveBeenCalled();
            expect(props.setDrawingRegionIndex).toHaveBeenCalledWith(null);
        });

        it('should handle addRegion failure in clip onSuccess callback', async () => {
            // Arrange
            const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            const regionTransaction = createMockRegionTransaction();
            regionTransaction.transaction.segment = {
                name: 'New Region',
                type: RegionType.Terrain,
                vertices: [{ x: 0, y: 0 }, { x: 100, y: 100 }],
            };
            regionTransaction.commitTransaction = vi.fn().mockResolvedValue({
                success: false,
                action: 'clip',
                clipResults: [{ regionIndex: 0, clippedVertices: [[{ x: 0, y: 0 }]] }],
            });

            // Mock executeClip to call onSuccess
            const mockExecuteClip = vi.fn().mockImplementation(async ({ onSuccess }) => {
                if (onSuccess) await onSuccess();
            });
            vi.mocked(await import('./useClipRegions')).useClipRegions = () => ({
                executeClip: mockExecuteClip,
            });

            const props = createMockProps({
                drawingMode: 'region',
                drawingRegionIndex: -1,
                regionTransaction,
                addRegion: vi.fn().mockRejectedValue(new Error('Add region failed')),
            });
            const { result } = renderHook(() => useRegionHandlers(props));

            // Act
            await act(async () => {
                await result.current.handleStructurePlacementFinish();
            });

            // Assert
            expect(consoleErrorSpy).toHaveBeenCalled();
            consoleErrorSpy.mockRestore();
        });

        it('should handle region not found after refetch in clip action', async () => {
            // Arrange
            const regionTransaction = createMockRegionTransaction();
            regionTransaction.transaction.segment = {
                name: 'New Region',
                type: RegionType.Terrain,
                vertices: [{ x: 0, y: 0 }, { x: 100, y: 100 }],
            };
            regionTransaction.commitTransaction = vi.fn().mockResolvedValue({
                success: false,
                action: 'clip',
                clipResults: [{ regionIndex: 0, clippedVertices: [[{ x: 0, y: 0 }]] }],
            });

            // Refetch returns encounter without the expected region
            const encounterWithoutRegion = createMockEncounter({
                stage: { ...createMockEncounter().stage, regions: [] },
            });

            const mockExecuteClip = vi.fn().mockImplementation(async ({ onSuccess }) => {
                if (onSuccess) await onSuccess();
            });
            vi.mocked(await import('./useClipRegions')).useClipRegions = () => ({
                executeClip: mockExecuteClip,
            });

            const props = createMockProps({
                drawingMode: 'region',
                drawingRegionIndex: -1,
                regionTransaction,
                refetch: vi.fn().mockResolvedValue({ data: encounterWithoutRegion }),
            });
            const { result } = renderHook(() => useRegionHandlers(props));

            // Act
            await act(async () => {
                await result.current.handleStructurePlacementFinish();
            });

            // Assert - should still set encounter even if region not found
            expect(props.setEncounter).toHaveBeenCalled();
        });

        it('should remove temp region in nullClip action with empty clipResults', async () => {
            // Arrange
            const regionTransaction = createMockRegionTransaction();
            regionTransaction.transaction.segment = null;
            regionTransaction.commitTransaction = vi.fn().mockResolvedValue({
                success: false,
                action: 'nullClip',
                clipResults: [], // Empty
            });
            const props = createMockProps({
                drawingMode: 'region',
                drawingRegionIndex: -1,
                regionTransaction,
            });
            const { result } = renderHook(() => useRegionHandlers(props));

            // Act
            await act(async () => {
                await result.current.handleStructurePlacementFinish();
            });

            // Assert - temp region at index -1 should be removed
            expect(props.setEncounter).toHaveBeenCalled();
            expect(regionTransaction.clearTransaction).toHaveBeenCalled();
            expect(props.setDrawingRegionIndex).toHaveBeenCalledWith(null);
        });

        it('should handle addRegion failure in success action onCreate callback', async () => {
            // Arrange
            const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            const regionTransaction = createMockRegionTransaction();
            regionTransaction.commitTransaction = vi.fn().mockResolvedValue({
                success: true,
                regionIndex: 0,
            });
            const props = createMockProps({
                drawingMode: 'region',
                drawingRegionIndex: -1,
                regionTransaction,
                // addRegion fails on second call (in onCreate)
                addRegion: vi.fn()
                    .mockResolvedValueOnce(undefined) // First call succeeds
                    .mockRejectedValueOnce(new Error('Recreate failed')), // onCreate fails
            });
            const { result } = renderHook(() => useRegionHandlers(props));

            // Act
            await act(async () => {
                await result.current.handleStructurePlacementFinish();
            });

            // Assert - command should still be recorded
            expect(props.recordAction).toHaveBeenCalled();
            consoleErrorSpy.mockRestore();
        });

        it('should handle missing createdRegion.index in success action', async () => {
            // Arrange
            const regionTransaction = createMockRegionTransaction();
            regionTransaction.commitTransaction = vi.fn().mockResolvedValue({
                success: true,
                regionIndex: 99, // Index that won't be found in synced encounter
            });
            const props = createMockProps({
                drawingMode: 'region',
                drawingRegionIndex: -1,
                regionTransaction,
            });
            const { result } = renderHook(() => useRegionHandlers(props));

            // Act
            await act(async () => {
                await result.current.handleStructurePlacementFinish();
            });

            // Assert - should still clear transaction and drawing index
            expect(regionTransaction.clearTransaction).toHaveBeenCalled();
            expect(props.setDrawingRegionIndex).toHaveBeenCalledWith(null);
            // recordAction should not be called if region not found
            expect(props.recordAction).not.toHaveBeenCalled();
        });
    });

    // ============================================
    // C3: Bucket Fill Error Tests (~4 tests)
    // ============================================

    describe('handleBucketFillFinish - error paths', () => {
        it('should handle addRegion network failure in bucket fill', async () => {
            // Arrange
            const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            const regionTransaction = createMockRegionTransaction();
            regionTransaction.transaction.segment = {
                name: 'Fill Region',
                type: RegionType.Terrain,
                vertices: [],
            };
            const props = createMockProps({
                drawingRegionIndex: -1,
                regionTransaction,
                addRegion: vi.fn().mockRejectedValue(new Error('Network error')),
            });
            const { result } = renderHook(() => useRegionHandlers(props));

            // Act
            await act(async () => {
                await result.current.handleBucketFillFinish([{ x: 0, y: 0 }]);
            });

            // Assert
            expect(props.setErrorMessage).toHaveBeenCalledWith('Failed to process bucket fill. Please try again.');
            expect(props.setDrawingRegionIndex).toHaveBeenCalledWith(null);
            consoleErrorSpy.mockRestore();
        });

        it('should handle refetch returning no data after bucket fill', async () => {
            // Arrange
            const regionTransaction = createMockRegionTransaction();
            regionTransaction.transaction.segment = {
                name: 'Fill Region',
                type: RegionType.Terrain,
                vertices: [],
            };
            const props = createMockProps({
                drawingRegionIndex: -1,
                regionTransaction,
                refetch: vi.fn().mockResolvedValue({ data: undefined }),
            });
            const { result } = renderHook(() => useRegionHandlers(props));

            // Act
            await act(async () => {
                await result.current.handleBucketFillFinish([{ x: 0, y: 0 }]);
            });

            // Assert
            expect(props.setErrorMessage).toHaveBeenCalledWith('Failed to refresh encounter. Please reload.');
            expect(props.setDrawingRegionIndex).toHaveBeenCalledWith(null);
        });

        it('should handle created region not found after refetch', async () => {
            // Arrange
            const regionTransaction = createMockRegionTransaction();
            regionTransaction.transaction.segment = {
                name: 'Fill Region',
                type: RegionType.Terrain,
                vertices: [],
            };
            // Return encounter without matching region
            const encounterWithoutMatch = createMockEncounter({
                stage: {
                    ...createMockEncounter().stage,
                    regions: [createMockRegion(0, { name: 'Different Name' })],
                },
            });
            const props = createMockProps({
                drawingRegionIndex: -1,
                regionTransaction,
                refetch: vi.fn().mockResolvedValue({ data: encounterWithoutMatch }),
            });
            const { result } = renderHook(() => useRegionHandlers(props));

            // Act
            await act(async () => {
                await result.current.handleBucketFillFinish([{ x: 0, y: 0 }]);
            });

            // Assert - should still set encounter but not record action
            expect(props.setEncounter).toHaveBeenCalledWith(encounterWithoutMatch);
            expect(props.recordAction).not.toHaveBeenCalled();
        });

        it('should handle onCreate callback failure in bucket fill', async () => {
            // Arrange
            const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            const regionTransaction = createMockRegionTransaction();
            regionTransaction.transaction.segment = {
                name: 'Fill Region',
                type: RegionType.Terrain,
                vertices: [],
            };
            // Return encounter with matching region
            const encounterWithRegion = createMockEncounter({
                stage: {
                    ...createMockEncounter().stage,
                    regions: [createMockRegion(0, { name: 'Fill Region', vertices: [{ x: 0, y: 0 }] })],
                },
            });
            const props = createMockProps({
                drawingRegionIndex: -1,
                regionTransaction,
                refetch: vi.fn().mockResolvedValue({ data: encounterWithRegion }),
                // addRegion fails on second call (in onCreate callback)
                addRegion: vi.fn()
                    .mockResolvedValueOnce(undefined)
                    .mockRejectedValueOnce(new Error('Recreate failed')),
            });
            const { result } = renderHook(() => useRegionHandlers(props));

            // Act
            await act(async () => {
                await result.current.handleBucketFillFinish([{ x: 0, y: 0 }]);
            });

            // Assert - command is recorded with callbacks that may fail later
            expect(props.recordAction).toHaveBeenCalled();
            consoleErrorSpy.mockRestore();
        });
    });

    // ============================================
    // C4: Exception Handling Tests (~5 tests)
    // ============================================

    describe('exception handling', () => {
        it('should catch and log updateRegion error in clip onSuccess', async () => {
            // Arrange
            const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            const regionTransaction = createMockRegionTransaction();
            regionTransaction.transaction.originalRegion = {
                index: 0,
                name: 'Original',
                type: RegionType.Terrain,
                vertices: [{ x: 0, y: 0 }],
            };
            regionTransaction.transaction.segment = {
                name: 'Edited',
                type: RegionType.Terrain,
                vertices: [{ x: 0, y: 0 }, { x: 100, y: 100 }],
            };
            regionTransaction.commitTransaction = vi.fn().mockResolvedValue({
                action: 'clip',
                clipResults: [{ regionIndex: 1, clippedVertices: [[{ x: 50, y: 50 }]] }],
            });

            const mockExecuteClip = vi.fn().mockImplementation(async ({ onSuccess }) => {
                if (onSuccess) await onSuccess();
            });
            vi.mocked(await import('./useClipRegions')).useClipRegions = () => ({
                executeClip: mockExecuteClip,
            });

            const props = createMockProps({
                editingRegionIndex: 0,
                regionTransaction,
                updateRegion: vi.fn().mockRejectedValue(new Error('Update failed')),
            });
            const { result } = renderHook(() => useRegionHandlers(props));

            // Act
            await act(async () => {
                await result.current.handleFinishEditingRegion();
            });

            // Assert
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                'Failed to update edited region after clip:',
                expect.any(Error),
            );
            consoleErrorSpy.mockRestore();
        });

        it('should catch and log addRegion error in structure placement clip', async () => {
            // Arrange
            const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            const regionTransaction = createMockRegionTransaction();
            regionTransaction.transaction.segment = {
                name: 'New Region',
                type: RegionType.Terrain,
                vertices: [{ x: 0, y: 0 }],
            };
            regionTransaction.commitTransaction = vi.fn().mockResolvedValue({
                action: 'clip',
                clipResults: [{ regionIndex: 0, clippedVertices: [[{ x: 0, y: 0 }]] }],
            });

            const mockExecuteClip = vi.fn().mockImplementation(async ({ onSuccess }) => {
                if (onSuccess) await onSuccess();
            });
            vi.mocked(await import('./useClipRegions')).useClipRegions = () => ({
                executeClip: mockExecuteClip,
            });

            const props = createMockProps({
                drawingMode: 'region',
                drawingRegionIndex: -1,
                regionTransaction,
                addRegion: vi.fn().mockRejectedValue(new Error('Add failed')),
            });
            const { result } = renderHook(() => useRegionHandlers(props));

            // Act
            await act(async () => {
                await result.current.handleStructurePlacementFinish();
            });

            // Assert
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                'Failed to create new region after clip:',
                expect.any(Error),
            );
            consoleErrorSpy.mockRestore();
        });

        it('should catch outer exception in handleStructurePlacementFinish', async () => {
            // Arrange
            const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            const regionTransaction = createMockRegionTransaction();
            regionTransaction.commitTransaction = vi.fn().mockRejectedValue(new Error('Commit explosion'));
            const props = createMockProps({
                drawingMode: 'region',
                drawingRegionIndex: -1,
                regionTransaction,
            });
            const { result } = renderHook(() => useRegionHandlers(props));

            // Act
            await act(async () => {
                await result.current.handleStructurePlacementFinish();
            });

            // Assert
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                'Failed to process region placement:',
                expect.any(Error),
            );
            consoleErrorSpy.mockRestore();
        });

        it('should set error message when outer exception is caught', async () => {
            // Arrange
            vi.spyOn(console, 'error').mockImplementation(() => {});
            const regionTransaction = createMockRegionTransaction();
            regionTransaction.commitTransaction = vi.fn().mockRejectedValue(new Error('Unexpected error'));
            const props = createMockProps({
                drawingMode: 'region',
                drawingRegionIndex: -1,
                regionTransaction,
            });
            const { result } = renderHook(() => useRegionHandlers(props));

            // Act
            await act(async () => {
                await result.current.handleStructurePlacementFinish();
            });

            // Assert
            expect(props.setErrorMessage).toHaveBeenCalledWith('Failed to process region placement. Please try again.');
        });

        it('should clear drawing state when exception occurs', async () => {
            // Arrange
            vi.spyOn(console, 'error').mockImplementation(() => {});
            const regionTransaction = createMockRegionTransaction();
            regionTransaction.commitTransaction = vi.fn().mockRejectedValue(new Error('Fatal error'));
            const props = createMockProps({
                drawingMode: 'region',
                drawingRegionIndex: -1,
                regionTransaction,
            });
            const { result } = renderHook(() => useRegionHandlers(props));

            // Act
            await act(async () => {
                await result.current.handleStructurePlacementFinish();
            });

            // Assert
            expect(props.setDrawingRegionIndex).toHaveBeenCalledWith(null);
        });
    });

    describe('callback stability', () => {
        it('should return stable handleRegionSelect reference when deps unchanged', () => {
            // Arrange - use stable props reference
            const stableProps = createMockProps();
            const { result, rerender } = renderHook(
                ({ props }) => useRegionHandlers(props),
                { initialProps: { props: stableProps } },
            );
            const firstRef = result.current.handleRegionSelect;

            // Act - rerender with same props
            rerender({ props: stableProps });

            // Assert
            expect(result.current.handleRegionSelect).toBe(firstRef);
        });

        it('should return stable handlePlaceRegion reference when deps unchanged', () => {
            // Arrange - use stable props reference
            const stableProps = createMockProps();
            const { result, rerender } = renderHook(
                ({ props }) => useRegionHandlers(props),
                { initialProps: { props: stableProps } },
            );
            const firstRef = result.current.handlePlaceRegion;

            // Act - rerender with same props
            rerender({ props: stableProps });

            // Assert
            expect(result.current.handlePlaceRegion).toBe(firstRef);
        });

        it('should return stable handleBucketFillRegion reference when deps unchanged', () => {
            // Arrange - use stable props reference
            const stableProps = createMockProps();
            const { result, rerender } = renderHook(
                ({ props }) => useRegionHandlers(props),
                { initialProps: { props: stableProps } },
            );
            const firstRef = result.current.handleBucketFillRegion;

            // Act - rerender with same props
            rerender({ props: stableProps });

            // Assert
            expect(result.current.handleBucketFillRegion).toBe(firstRef);
        });
    });
});
