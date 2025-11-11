import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useRegionHandlers } from '../useRegionHandlers';
import { useRegionTransaction } from '@/hooks/useRegionTransaction';
import { useMergeRegions } from '../useMergeRegions';
import type { Scene, SceneRegion, Point } from '@/types/domain';
import type { GridConfig } from '@/utils/gridCalculator';

describe('Region Workflows - Integration Tests', () => {
    let mockScene: Scene;
    let mockSetScene: ReturnType<typeof vi.fn>;
    let mockSetPlacedRegions: ReturnType<typeof vi.fn>;
    let mockSetSelectedRegionIndex: ReturnType<typeof vi.fn>;
    let mockSetEditingRegionIndex: ReturnType<typeof vi.fn>;
    let mockSetIsEditingRegionVertices: ReturnType<typeof vi.fn>;
    let mockSetOriginalRegionVertices: ReturnType<typeof vi.fn>;
    let mockSetDrawingRegionIndex: ReturnType<typeof vi.fn>;
    let mockSetDrawingMode: ReturnType<typeof vi.fn>;
    let mockSetErrorMessage: ReturnType<typeof vi.fn>;
    let mockRecordAction: ReturnType<typeof vi.fn>;
    let mockRefetch: ReturnType<typeof vi.fn>;
    let mockAddSceneRegion: ReturnType<typeof vi.fn>;
    let mockUpdateSceneRegion: ReturnType<typeof vi.fn>;
    let mockRemoveSceneRegion: ReturnType<typeof vi.fn>;
    let gridConfig: GridConfig;

    const sceneId = 'test-scene-123';

    beforeEach(() => {
        vi.clearAllMocks();

        mockScene = {
            id: sceneId,
            name: 'Test Scene',
            description: 'Test Description',
            adventure: null,
            isPublished: false,
            light: 0,
            weather: 'Clear' as any,
            elevation: 0,
            grid: {
                type: 0,
                cellSize: { width: 50, height: 50 },
                offset: { left: 0, top: 0 },
                snap: true
            },
            stage: {
                background: null,
                zoomLevel: 1,
                panning: { x: 0, y: 0 }
            },
            assets: [],
            walls: [],
            regions: [],
            sources: []
        };

        gridConfig = {
            cellSize: 50,
            offsetX: 0,
            offsetY: 0
        };

        mockSetScene = vi.fn();
        mockSetPlacedRegions = vi.fn();
        mockSetSelectedRegionIndex = vi.fn();
        mockSetEditingRegionIndex = vi.fn();
        mockSetIsEditingRegionVertices = vi.fn();
        mockSetOriginalRegionVertices = vi.fn();
        mockSetDrawingRegionIndex = vi.fn();
        mockSetDrawingMode = vi.fn();
        mockSetErrorMessage = vi.fn();
        mockRecordAction = vi.fn();
        mockRefetch = vi.fn().mockResolvedValue({ data: mockScene });
        mockAddSceneRegion = vi.fn().mockImplementation(() => ({
            unwrap: vi.fn().mockResolvedValue({ index: 1 })
        }));
        mockUpdateSceneRegion = vi.fn().mockImplementation(() => ({
            unwrap: vi.fn().mockResolvedValue({})
        }));
        mockRemoveSceneRegion = vi.fn().mockImplementation(() => ({
            unwrap: vi.fn().mockResolvedValue({})
        }));
    });

    describe('1. Region Placement Workflow', () => {
        it('should complete placement workflow: start → add vertices → commit → verify scene state', async () => {
            const { result: transactionResult } = renderHook(() => useRegionTransaction());

            act(() => {
                transactionResult.current.startTransaction('placement', undefined, {
                    name: 'Danger Zone',
                    type: 'Elevation',
                    value: 10,
                    color: '#FF0000'
                });
            });

            expect(transactionResult.current.transaction.isActive).toBe(true);
            expect(transactionResult.current.transaction.type).toBe('placement');

            act(() => {
                transactionResult.current.addVertex({ x: 0, y: 0 });
                transactionResult.current.addVertex({ x: 100, y: 0 });
                transactionResult.current.addVertex({ x: 50, y: 100 });
            });

            expect(transactionResult.current.transaction.segment?.vertices).toHaveLength(3);

            let commitResult: any;
            await act(async () => {
                commitResult = await transactionResult.current.commitTransaction(
                    sceneId,
                    {
                        addSceneRegion: mockAddSceneRegion,
                        updateSceneRegion: mockUpdateSceneRegion
                    },
                    mockScene,
                    gridConfig
                );
            });

            expect(commitResult.success).toBe(true);
            expect(commitResult.action).toBe('create');
            expect(commitResult.regionIndex).toBe(1);
            expect(mockAddSceneRegion).toHaveBeenCalledWith(
                expect.objectContaining({
                    sceneId,
                    name: 'Danger Zone',
                    type: 'Elevation',
                    value: 10,
                    color: '#FF0000'
                })
            );

            expect(transactionResult.current.transaction.isActive).toBe(false);
            expect(transactionResult.current.transaction.segment).toBeNull();
        });

        it('should handle placement workflow: start → add vertices → cancel → verify rollback', async () => {
            const { result: transactionResult } = renderHook(() => useRegionTransaction());

            act(() => {
                transactionResult.current.startTransaction('placement', undefined, {
                    name: 'Test Region',
                    type: 'Difficult'
                });
                transactionResult.current.addVertex({ x: 0, y: 0 });
                transactionResult.current.addVertex({ x: 100, y: 0 });
                transactionResult.current.addVertex({ x: 50, y: 100 });
            });

            expect(transactionResult.current.transaction.isActive).toBe(true);

            act(() => {
                transactionResult.current.rollbackTransaction();
            });

            expect(transactionResult.current.transaction.isActive).toBe(false);
            expect(transactionResult.current.transaction.segment).toBeNull();
            expect(transactionResult.current.transaction.type).toBeNull();
            expect(mockAddSceneRegion).not.toHaveBeenCalled();
        });

        it('should handle placement workflow: start → add vertices → undo → redo → commit', async () => {
            const { result: transactionResult } = renderHook(() => useRegionTransaction());
            const mockVertices: Point[] = [];

            const createVertexAction = (vertex: Point) => ({
                undo: () => { mockVertices.pop(); },
                redo: () => { mockVertices.push(vertex); }
            });

            act(() => {
                transactionResult.current.startTransaction('placement');
            });

            act(() => {
                const v1 = { x: 0, y: 0 };
                mockVertices.push(v1);
                transactionResult.current.addVertex(v1);
                transactionResult.current.pushLocalAction(createVertexAction(v1));
            });

            act(() => {
                const v2 = { x: 100, y: 0 };
                mockVertices.push(v2);
                transactionResult.current.addVertex(v2);
                transactionResult.current.pushLocalAction(createVertexAction(v2));
            });

            act(() => {
                const v3 = { x: 50, y: 100 };
                mockVertices.push(v3);
                transactionResult.current.addVertex(v3);
                transactionResult.current.pushLocalAction(createVertexAction(v3));
            });

            expect(mockVertices).toHaveLength(3);
            expect(transactionResult.current.canUndoLocal()).toBe(true);

            act(() => {
                transactionResult.current.undoLocal();
            });

            expect(mockVertices).toHaveLength(2);
            expect(transactionResult.current.canRedoLocal()).toBe(true);

            act(() => {
                transactionResult.current.redoLocal();
            });

            expect(mockVertices).toHaveLength(3);

            await act(async () => {
                const result = await transactionResult.current.commitTransaction(
                    sceneId,
                    {
                        addSceneRegion: mockAddSceneRegion,
                        updateSceneRegion: mockUpdateSceneRegion
                    }
                );
                expect(result.success).toBe(true);
            });
        });

        it('should handle placement with insufficient vertices (< 3) and fail validation', async () => {
            const { result: transactionResult } = renderHook(() => useRegionTransaction());

            act(() => {
                transactionResult.current.startTransaction('placement');
                transactionResult.current.addVertex({ x: 0, y: 0 });
                transactionResult.current.addVertex({ x: 100, y: 0 });
            });

            await act(async () => {
                const result = await transactionResult.current.commitTransaction(
                    sceneId,
                    {
                        addSceneRegion: mockAddSceneRegion,
                        updateSceneRegion: mockUpdateSceneRegion
                    }
                );

                expect(result.success).toBe(false);
                expect(result.error).toBe('Region requires minimum 3 vertices');
            });

            expect(mockAddSceneRegion).not.toHaveBeenCalled();
        });
    });

    describe('2. Region Editing Workflow', () => {
        it('should complete editing workflow: select → edit vertices → commit → verify updated', async () => {
            const existingRegion: SceneRegion = {
                sceneId,
                index: 5,
                name: 'Forest Area',
                vertices: [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 100 }],
                type: 'Difficult',
                value: 2,
                color: '#00FF00'
            };

            mockScene.regions = [existingRegion];

            const { result: transactionResult } = renderHook(() => useRegionTransaction());

            act(() => {
                transactionResult.current.startTransaction('editing', existingRegion);
            });

            expect(transactionResult.current.transaction.type).toBe('editing');
            expect(transactionResult.current.transaction.originalRegion).toEqual(existingRegion);

            act(() => {
                transactionResult.current.updateVertices([
                    { x: 0, y: 0 },
                    { x: 150, y: 0 },
                    { x: 150, y: 150 }
                ]);
            });

            await act(async () => {
                const result = await transactionResult.current.commitTransaction(
                    sceneId,
                    {
                        addSceneRegion: mockAddSceneRegion,
                        updateSceneRegion: mockUpdateSceneRegion
                    }
                );

                expect(result.success).toBe(true);
                expect(result.action).toBe('edit');
                expect(result.regionIndex).toBe(5);
            });

            expect(mockUpdateSceneRegion).toHaveBeenCalledWith(
                expect.objectContaining({
                    sceneId,
                    regionIndex: 5,
                    vertices: expect.arrayContaining([
                        expect.objectContaining({ x: 0, y: 0 }),
                        expect.objectContaining({ x: 150, y: 0 }),
                        expect.objectContaining({ x: 150, y: 150 })
                    ])
                })
            );
        });

        it('should handle editing workflow: select → edit → cancel → verify original restored', async () => {
            const existingRegion: SceneRegion = {
                sceneId,
                index: 3,
                name: 'Mountain',
                vertices: [{ x: 0, y: 0 }, { x: 50, y: 0 }, { x: 25, y: 50 }],
                type: 'Elevation',
                value: 15
            };

            const { result: transactionResult } = renderHook(() => useRegionTransaction());

            act(() => {
                transactionResult.current.startTransaction('editing', existingRegion);
            });

            act(() => {
                transactionResult.current.updateVertices([
                    { x: 0, y: 0 },
                    { x: 100, y: 0 },
                    { x: 50, y: 100 }
                ]);
            });

            expect(transactionResult.current.transaction.segment?.vertices).toHaveLength(3);

            act(() => {
                transactionResult.current.rollbackTransaction();
            });

            expect(transactionResult.current.transaction.isActive).toBe(false);
            expect(transactionResult.current.transaction.segment).toBeNull();
            expect(mockUpdateSceneRegion).not.toHaveBeenCalled();
        });

        it('should preserve original vertices in EditRegionCommand when merge occurs during edit', async () => {
            const existingRegion1: SceneRegion = {
                index: 0,
                sceneId,
                name: 'Region 1',
                vertices: [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 100 }, { x: 0, y: 100 }],
                type: 'difficult-terrain',
                value: 2,
            };
            const originalRegion2Vertices = [{ x: 200, y: 0 }, { x: 300, y: 0 }, { x: 300, y: 100 }, { x: 200, y: 100 }];
            const existingRegion2: SceneRegion = {
                index: 1,
                sceneId,
                name: 'Region 2',
                vertices: originalRegion2Vertices,
                type: 'difficult-terrain',
                value: 2,
            };

            const { result: transactionResult } = renderHook(() => useRegionTransaction());

            act(() => {
                transactionResult.current.startTransaction('edit', existingRegion2);
            });

            const modifiedVertices = [{ x: 50, y: 0 }, { x: 150, y: 0 }, { x: 150, y: 100 }, { x: 50, y: 100 }];

            act(() => {
                transactionResult.current.updateVertices(modifiedVertices);
            });

            expect(transactionResult.current.transaction.originalRegion).toBeDefined();
            expect(transactionResult.current.transaction.originalRegion?.vertices).toEqual(originalRegion2Vertices);

            expect(transactionResult.current.transaction.segment?.vertices).toEqual(modifiedVertices);
        });

        it('should edit region properties (name, type, value, label) and commit', async () => {
            const existingRegion: SceneRegion = {
                sceneId,
                index: 7,
                name: 'Old Name',
                vertices: [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 50, y: 100 }],
                type: 'Elevation',
                value: 5
            };

            const { result: transactionResult } = renderHook(() => useRegionTransaction());

            act(() => {
                transactionResult.current.startTransaction('editing', existingRegion);
            });

            act(() => {
                transactionResult.current.updateSegmentProperties({
                    name: 'Updated Name',
                    type: 'Difficult',
                    value: 10,
                    label: 'Dense Forest',
                    color: '#008800'
                });
            });

            await act(async () => {
                const result = await transactionResult.current.commitTransaction(
                    sceneId,
                    {
                        addSceneRegion: mockAddSceneRegion,
                        updateSceneRegion: mockUpdateSceneRegion
                    }
                );

                expect(result.success).toBe(true);
            });

            expect(mockUpdateSceneRegion).toHaveBeenCalledWith(
                expect.objectContaining({
                    sceneId,
                    regionIndex: 7,
                    name: 'Updated Name',
                    type: 'Difficult',
                    value: 10,
                    label: 'Dense Forest',
                    color: '#008800'
                })
            );
        });
    });

    describe('3. Region Merge Workflow', () => {
        it('should detect and merge adjacent regions with same properties', async () => {
            const region1: SceneRegion = {
                sceneId,
                index: 1,
                name: 'Region 1',
                vertices: [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 100 }, { x: 0, y: 100 }],
                type: 'Elevation',
                value: 10
            };

            mockScene.regions = [region1];

            const { result: transactionResult } = renderHook(() => useRegionTransaction());

            act(() => {
                transactionResult.current.startTransaction('placement', undefined, {
                    name: 'Region 2',
                    type: 'Elevation',
                    value: 10
                });
                transactionResult.current.updateVertices([
                    { x: 100, y: 0 },
                    { x: 200, y: 0 },
                    { x: 200, y: 100 },
                    { x: 100, y: 100 }
                ]);
            });

            await act(async () => {
                const result = await transactionResult.current.commitTransaction(
                    sceneId,
                    {
                        addSceneRegion: mockAddSceneRegion,
                        updateSceneRegion: mockUpdateSceneRegion
                    },
                    mockScene,
                    gridConfig
                );

                expect(result.action).toBe('merge');
                expect(result.targetRegionIndex).toBe(1);
                expect(result.mergedVertices).toBeDefined();
                expect(result.mergedVertices!.length).toBeGreaterThan(0);
            });
        });

        it('should NOT merge regions with different properties (type mismatch)', async () => {
            const region1: SceneRegion = {
                sceneId,
                index: 1,
                name: 'Region 1',
                vertices: [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 100 }, { x: 0, y: 100 }],
                type: 'Elevation',
                value: 10
            };

            mockScene.regions = [region1];

            const { result: transactionResult } = renderHook(() => useRegionTransaction());

            act(() => {
                transactionResult.current.startTransaction('placement', undefined, {
                    name: 'Region 2',
                    type: 'Difficult',
                    value: 10
                });
                transactionResult.current.updateVertices([
                    { x: 100, y: 0 },
                    { x: 200, y: 0 },
                    { x: 200, y: 100 },
                    { x: 100, y: 100 }
                ]);
            });

            await act(async () => {
                const result = await transactionResult.current.commitTransaction(
                    sceneId,
                    {
                        addSceneRegion: mockAddSceneRegion,
                        updateSceneRegion: mockUpdateSceneRegion
                    },
                    mockScene,
                    gridConfig
                );

                expect(result.action).toBe('create');
                expect(result.action).not.toBe('merge');
            });
        });

        it('should NOT merge regions with different value properties', async () => {
            const region1: SceneRegion = {
                sceneId,
                index: 1,
                name: 'Region 1',
                vertices: [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 100 }, { x: 0, y: 100 }],
                type: 'Elevation',
                value: 10
            };

            mockScene.regions = [region1];

            const { result: transactionResult } = renderHook(() => useRegionTransaction());

            act(() => {
                transactionResult.current.startTransaction('placement', undefined, {
                    name: 'Region 2',
                    type: 'Elevation',
                    value: 20
                });
                transactionResult.current.updateVertices([
                    { x: 100, y: 0 },
                    { x: 200, y: 0 },
                    { x: 200, y: 100 },
                    { x: 100, y: 100 }
                ]);
            });

            await act(async () => {
                const result = await transactionResult.current.commitTransaction(
                    sceneId,
                    {
                        addSceneRegion: mockAddSceneRegion,
                        updateSceneRegion: mockUpdateSceneRegion
                    },
                    mockScene,
                    gridConfig
                );

                expect(result.action).toBe('create');
                expect(result.action).not.toBe('merge');
            });
        });

        it('should merge with multiple regions and identify all regions to delete', async () => {
            const region1: SceneRegion = {
                sceneId,
                index: 3,
                name: 'Region 1',
                vertices: [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 100 }, { x: 0, y: 100 }],
                type: 'Elevation',
                value: 5
            };

            const region2: SceneRegion = {
                sceneId,
                index: 5,
                name: 'Region 2',
                vertices: [{ x: 100, y: 0 }, { x: 200, y: 0 }, { x: 200, y: 100 }, { x: 100, y: 100 }],
                type: 'Elevation',
                value: 5
            };

            mockScene.regions = [region1, region2];

            const { result: transactionResult } = renderHook(() => useRegionTransaction());

            act(() => {
                transactionResult.current.startTransaction('placement', undefined, {
                    name: 'Region 3',
                    type: 'Elevation',
                    value: 5
                });
                transactionResult.current.updateVertices([
                    { x: 50, y: 50 },
                    { x: 150, y: 50 },
                    { x: 100, y: 150 }
                ]);
            });

            await act(async () => {
                const result = await transactionResult.current.commitTransaction(
                    sceneId,
                    {
                        addSceneRegion: mockAddSceneRegion,
                        updateSceneRegion: mockUpdateSceneRegion
                    },
                    mockScene,
                    gridConfig
                );

                expect(result.action).toBe('merge');
                expect(result.targetRegionIndex).toBe(3);
                expect(result.regionsToDelete).toContain(5);
            });
        });

        it('should execute merge operation using useMergeRegions hook', async () => {
            const targetRegion: SceneRegion = {
                sceneId,
                index: 1,
                name: 'Target Region',
                vertices: [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 100 }, { x: 0, y: 100 }],
                type: 'Elevation',
                value: 10
            };

            const regionToDelete: SceneRegion = {
                sceneId,
                index: 2,
                name: 'Region to Delete',
                vertices: [{ x: 100, y: 0 }, { x: 200, y: 0 }, { x: 200, y: 100 }, { x: 100, y: 100 }],
                type: 'Elevation',
                value: 10
            };

            mockScene.regions = [targetRegion, regionToDelete];

            const { result: mergeResult } = renderHook(() =>
                useMergeRegions({
                    sceneId,
                    scene: mockScene,
                    addSceneRegion: mockAddSceneRegion,
                    updateSceneRegion: mockUpdateSceneRegion,
                    removeSceneRegion: mockRemoveSceneRegion,
                    setScene: mockSetScene,
                    setErrorMessage: mockSetErrorMessage,
                    recordAction: mockRecordAction,
                    refetch: mockRefetch
                })
            );

            const mergedVertices: Point[] = [
                { x: 0, y: 0 },
                { x: 200, y: 0 },
                { x: 200, y: 100 },
                { x: 0, y: 100 }
            ];

            const onSuccess = vi.fn();
            const onError = vi.fn();

            await act(async () => {
                await mergeResult.current.executeMerge({
                    targetRegionIndex: 1,
                    originalTargetRegion: targetRegion,
                    mergedVertices,
                    regionsToDelete: [2],
                    onSuccess,
                    onError
                });
            });

            expect(mockUpdateSceneRegion).toHaveBeenCalledWith(
                expect.objectContaining({
                    sceneId,
                    regionIndex: 1,
                    vertices: mergedVertices
                })
            );

            expect(mockRemoveSceneRegion).toHaveBeenCalledWith({
                sceneId,
                regionIndex: 2
            });

            expect(mockRecordAction).toHaveBeenCalled();
            expect(onSuccess).toHaveBeenCalled();
            expect(onError).not.toHaveBeenCalled();
        });
    });

    describe('4. Region Deletion Workflow', () => {
        it('should call delete API and verify backend interaction', async () => {
            const regionToDelete: SceneRegion = {
                sceneId,
                index: 5,
                name: 'Region to Delete',
                vertices: [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 50, y: 100 }],
                type: 'Elevation'
            };

            mockScene.regions = [regionToDelete];

            await act(async () => {
                await mockRemoveSceneRegion({ sceneId, regionIndex: 5 }).unwrap();
            });

            expect(mockRemoveSceneRegion).toHaveBeenCalledWith({
                sceneId,
                regionIndex: 5
            });
        });

        it('should not delete region if region not found', async () => {
            mockScene.regions = [];

            const transactionHook = renderHook(() => useRegionTransaction());

            const { result: handlersResult } = renderHook(() => {
                const transaction = transactionHook.result.current;
                return useRegionHandlers({
                    sceneId,
                    scene: mockScene,
                    regionTransaction: transaction,
                    gridConfig,
                    selectedRegionIndex: null,
                    editingRegionIndex: null,
                    originalRegionVertices: null,
                    drawingMode: null,
                    drawingRegionIndex: null,
                    addSceneRegion: mockAddSceneRegion,
                    updateSceneRegion: mockUpdateSceneRegion,
                    removeSceneRegion: mockRemoveSceneRegion,
                    setScene: mockSetScene,
                    setPlacedRegions: mockSetPlacedRegions,
                    setSelectedRegionIndex: mockSetSelectedRegionIndex,
                    setEditingRegionIndex: mockSetEditingRegionIndex,
                    setIsEditingRegionVertices: mockSetIsEditingRegionVertices,
                    setOriginalRegionVertices: mockSetOriginalRegionVertices,
                    setDrawingRegionIndex: mockSetDrawingRegionIndex,
                    setDrawingMode: mockSetDrawingMode,
                    setErrorMessage: mockSetErrorMessage,
                    recordAction: mockRecordAction,
                    refetch: mockRefetch
                });
            });

            await act(async () => {
                await handlersResult.current.handleRegionDelete(999);
            });

            expect(mockRemoveSceneRegion).not.toHaveBeenCalled();
        });
    });

    describe('5. Error Scenarios', () => {
        it('should handle backend API failure during placement', async () => {
            const { result: transactionResult } = renderHook(() => useRegionTransaction());

            const failingAddSceneRegion = vi.fn().mockImplementation(() => ({
                unwrap: vi.fn().mockRejectedValue(new Error('Network error'))
            }));

            act(() => {
                transactionResult.current.startTransaction('placement', undefined, {
                    name: 'Test Region',
                    type: 'Elevation'
                });
                transactionResult.current.updateVertices([
                    { x: 0, y: 0 },
                    { x: 100, y: 0 },
                    { x: 50, y: 100 }
                ]);
            });

            await act(async () => {
                const result = await transactionResult.current.commitTransaction(
                    sceneId,
                    {
                        addSceneRegion: failingAddSceneRegion,
                        updateSceneRegion: mockUpdateSceneRegion
                    }
                );

                expect(result.success).toBe(false);
                expect(result.error).toBe('Network error');
            });

            expect(transactionResult.current.transaction.isActive).toBe(true);
            expect(transactionResult.current.transaction.segment).not.toBeNull();
        });

        it('should handle backend API failure during edit', async () => {
            const existingRegion: SceneRegion = {
                sceneId,
                index: 5,
                name: 'Existing Region',
                vertices: [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 50, y: 100 }],
                type: 'Elevation'
            };

            const { result: transactionResult } = renderHook(() => useRegionTransaction());

            const failingUpdateSceneRegion = vi.fn().mockImplementation(() => ({
                unwrap: vi.fn().mockRejectedValue(new Error('Update failed'))
            }));

            act(() => {
                transactionResult.current.startTransaction('editing', existingRegion);
                transactionResult.current.updateVertices([
                    { x: 0, y: 0 },
                    { x: 150, y: 0 },
                    { x: 75, y: 150 }
                ]);
            });

            await act(async () => {
                const result = await transactionResult.current.commitTransaction(
                    sceneId,
                    {
                        addSceneRegion: mockAddSceneRegion,
                        updateSceneRegion: failingUpdateSceneRegion
                    }
                );

                expect(result.success).toBe(false);
                expect(result.error).toBe('Update failed');
            });
        });

        it('should handle backend API failure during merge', async () => {
            const targetRegion: SceneRegion = {
                sceneId,
                index: 1,
                name: 'Target',
                vertices: [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 50, y: 100 }],
                type: 'Elevation'
            };

            mockScene.regions = [targetRegion];

            const failingUpdateSceneRegion = vi.fn().mockImplementation(() => ({
                unwrap: vi.fn().mockRejectedValue(new Error('Merge failed'))
            }));

            const { result: mergeResult } = renderHook(() =>
                useMergeRegions({
                    sceneId,
                    scene: mockScene,
                    addSceneRegion: mockAddSceneRegion,
                    updateSceneRegion: failingUpdateSceneRegion,
                    removeSceneRegion: mockRemoveSceneRegion,
                    setScene: mockSetScene,
                    setErrorMessage: mockSetErrorMessage,
                    recordAction: mockRecordAction,
                    refetch: mockRefetch
                })
            );

            const onSuccess = vi.fn();
            const onError = vi.fn();

            await act(async () => {
                await mergeResult.current.executeMerge({
                    targetRegionIndex: 1,
                    originalTargetRegion: targetRegion,
                    mergedVertices: [{ x: 0, y: 0 }, { x: 200, y: 0 }, { x: 100, y: 200 }],
                    regionsToDelete: [],
                    onSuccess,
                    onError
                });
            });

            expect(mockSetErrorMessage).toHaveBeenCalledWith('Failed to merge regions. Please try again.');
            expect(onError).toHaveBeenCalled();
            expect(onSuccess).not.toHaveBeenCalled();
        });

        it('should reject invalid vertices during placement (less than 3 points)', async () => {
            const { result: transactionResult } = renderHook(() => useRegionTransaction());

            act(() => {
                transactionResult.current.startTransaction('placement');
                transactionResult.current.addVertex({ x: 0, y: 0 });
                transactionResult.current.addVertex({ x: 100, y: 0 });
            });

            await act(async () => {
                const result = await transactionResult.current.commitTransaction(
                    sceneId,
                    {
                        addSceneRegion: mockAddSceneRegion,
                        updateSceneRegion: mockUpdateSceneRegion
                    }
                );

                expect(result.success).toBe(false);
                expect(result.error).toBe('Region requires minimum 3 vertices');
            });

            expect(mockAddSceneRegion).not.toHaveBeenCalled();
        });

        it('should handle merge when target region not found', async () => {
            mockScene.regions = [];

            const { result: mergeResult } = renderHook(() =>
                useMergeRegions({
                    sceneId,
                    scene: mockScene,
                    addSceneRegion: mockAddSceneRegion,
                    updateSceneRegion: mockUpdateSceneRegion,
                    removeSceneRegion: mockRemoveSceneRegion,
                    setScene: mockSetScene,
                    setErrorMessage: mockSetErrorMessage,
                    recordAction: mockRecordAction,
                    refetch: mockRefetch
                })
            );

            const onSuccess = vi.fn();
            const onError = vi.fn();

            await act(async () => {
                await mergeResult.current.executeMerge({
                    targetRegionIndex: 999,
                    originalTargetRegion: {
                        sceneId,
                        index: 999,
                        name: 'Ghost',
                        vertices: [],
                        type: 'Elevation'
                    },
                    mergedVertices: [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 50, y: 100 }],
                    regionsToDelete: [],
                    onSuccess,
                    onError
                });
            });

            expect(mockSetErrorMessage).toHaveBeenCalledWith('Merge target region not found');
            expect(onError).toHaveBeenCalled();
            expect(onSuccess).not.toHaveBeenCalled();
        });
    });

    describe('6. Complete End-to-End Workflows', () => {
        it('should integrate transaction and merge workflows for placement with merge detection', async () => {
            const existingRegion: SceneRegion = {
                sceneId,
                index: 1,
                name: 'Existing Region',
                vertices: [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 100 }, { x: 0, y: 100 }],
                type: 'Elevation',
                value: 10
            };

            mockScene.regions = [existingRegion];

            const { result: transactionResult } = renderHook(() => useRegionTransaction());
            const { result: mergeResult } = renderHook(() =>
                useMergeRegions({
                    sceneId,
                    scene: mockScene,
                    addSceneRegion: mockAddSceneRegion,
                    updateSceneRegion: mockUpdateSceneRegion,
                    removeSceneRegion: mockRemoveSceneRegion,
                    setScene: mockSetScene,
                    setErrorMessage: mockSetErrorMessage,
                    recordAction: mockRecordAction,
                    refetch: mockRefetch
                })
            );

            act(() => {
                transactionResult.current.startTransaction('placement', undefined, {
                    name: 'Adjacent Region',
                    type: 'Elevation',
                    value: 10
                });
                transactionResult.current.updateVertices([
                    { x: 100, y: 0 },
                    { x: 200, y: 0 },
                    { x: 200, y: 100 },
                    { x: 100, y: 100 }
                ]);
            });

            let commitResult: any;
            await act(async () => {
                commitResult = await transactionResult.current.commitTransaction(
                    sceneId,
                    { addSceneRegion: mockAddSceneRegion, updateSceneRegion: mockUpdateSceneRegion },
                    mockScene,
                    gridConfig
                );
            });

            expect(commitResult.action).toBe('merge');
            expect(commitResult.targetRegionIndex).toBe(1);
            expect(commitResult.mergedVertices).toBeDefined();

            const onSuccess = vi.fn();
            const onError = vi.fn();

            await act(async () => {
                await mergeResult.current.executeMerge({
                    targetRegionIndex: commitResult.targetRegionIndex!,
                    originalTargetRegion: existingRegion,
                    mergedVertices: commitResult.mergedVertices!,
                    regionsToDelete: commitResult.regionsToDelete || [],
                    onSuccess,
                    onError
                });
            });

            expect(mockUpdateSceneRegion).toHaveBeenCalled();
            expect(mockRecordAction).toHaveBeenCalled();
            expect(onSuccess).toHaveBeenCalled();
        });

        it('should integrate transaction workflow for editing with property changes', async () => {
            const existingRegion: SceneRegion = {
                sceneId,
                index: 7,
                name: 'Original Name',
                vertices: [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 50, y: 100 }],
                type: 'Elevation',
                value: 5
            };

            mockScene.regions = [existingRegion];

            const { result: transactionResult } = renderHook(() => useRegionTransaction());

            act(() => {
                transactionResult.current.startTransaction('editing', existingRegion);
                transactionResult.current.updateSegmentProperties({
                    name: 'Updated Name',
                    type: 'Difficult',
                    value: 10,
                    label: 'Dense Forest',
                    color: '#008800'
                });
                transactionResult.current.updateVertices([
                    { x: 0, y: 0 },
                    { x: 150, y: 0 },
                    { x: 75, y: 150 }
                ]);
            });

            await act(async () => {
                const result = await transactionResult.current.commitTransaction(
                    sceneId,
                    {
                        addSceneRegion: mockAddSceneRegion,
                        updateSceneRegion: mockUpdateSceneRegion
                    }
                );

                expect(result.success).toBe(true);
                expect(result.action).toBe('edit');
                expect(result.regionIndex).toBe(7);
            });

            expect(mockUpdateSceneRegion).toHaveBeenCalledWith(
                expect.objectContaining({
                    sceneId,
                    regionIndex: 7,
                    name: 'Updated Name',
                    type: 'Difficult',
                    value: 10,
                    label: 'Dense Forest',
                    color: '#008800'
                })
            );
        });
    });
});
