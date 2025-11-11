import { useCallback } from 'react';
import type { Scene, SceneWall, PlacedWall, Pole } from '@/types/domain';
import type { useWallTransaction } from '@/hooks/useWallTransaction';
import type { WallBreakData } from '@components/scene/editing/WallTransformer';
import type {
    useAddSceneWallMutation,
    useUpdateSceneWallMutation,
    useRemoveSceneWallMutation
} from '@/services/sceneApi';
import { updateWallOptimistic, removeWallOptimistic, syncWallIndices } from '@/utils/sceneStateUtils';
import { createBreakWallAction } from '@/types/wallUndoActions';
import { EditWallCommand, BreakWallCommand, MergeWallsCommand, SplitWallsCommand } from '@/utils/commands/wallCommands';
import type { MergeResult } from '@/utils/wallMergeUtils';
import type { SplitResult } from '@/utils/wallSplitUtils';
import { detectSplitPoints, splitWallAtPoints } from '@/utils/wallSplitUtils';
import {
    getIndexByDomId,
    getDomIdByIndex,
    removeEntityMapping,
    setEntityMapping
} from '@/utils/sceneEntityMapping';
import { hydratePlacedWalls } from '@/utils/sceneMappers';

interface UseWallHandlersProps {
    sceneId: string | undefined;
    scene: Scene | null;
    wallTransaction: ReturnType<typeof useWallTransaction>;
    selectedWallIndex: number | null;
    drawingMode: 'wall' | 'region' | null;
    drawingWallIndex: number | null;

    addSceneWall: ReturnType<typeof useAddSceneWallMutation>[0];
    updateSceneWall: ReturnType<typeof useUpdateSceneWallMutation>[0];
    removeSceneWall: ReturnType<typeof useRemoveSceneWallMutation>[0];

    setScene: (scene: Scene) => void;
    setPlacedWalls: (walls: PlacedWall[]) => void;
    setSelectedWallIndex: (index: number | null) => void;
    setDrawingWallIndex: (index: number | null) => void;
    setDrawingMode: (mode: 'wall' | 'region' | null) => void;
    setIsEditingVertices: (editing: boolean) => void;
    setOriginalWallPoles: (poles: Pole[] | null) => void;
    setActivePanel: (panel: string | null) => void;
    setErrorMessage: (message: string | null) => void;

    execute: (command: any) => void;
    refetch: () => Promise<{ data?: Scene }>;
}

export const useWallHandlers = ({
    sceneId,
    scene,
    wallTransaction,
    selectedWallIndex,
    drawingMode,
    drawingWallIndex,
    addSceneWall,
    updateSceneWall,
    removeSceneWall,
    setScene,
    setPlacedWalls,
    setSelectedWallIndex,
    setDrawingWallIndex,
    setDrawingMode,
    setIsEditingVertices,
    setOriginalWallPoles,
    setActivePanel,
    setErrorMessage,
    execute,
    refetch
}: UseWallHandlersProps) => {

    const handleWallDelete = useCallback(async (wallIndex: number) => {
        if (!sceneId || !scene) {
            return;
        }

        const domId = getDomIdByIndex(sceneId, 'walls', wallIndex);

        try {
            await removeSceneWall({ sceneId, wallIndex }).unwrap();

            if (domId) {
                removeEntityMapping(sceneId, 'walls', domId);
            }

            const { data: updatedScene } = await refetch();
            if (updatedScene) {
                setScene(updatedScene);
            }

            setSelectedWallIndex(null);
        } catch (error) {
            console.error('Failed to remove wall:', error);
            setErrorMessage('Failed to remove wall. Please try again.');
        }
    }, [sceneId, scene, removeSceneWall, refetch, setScene, setSelectedWallIndex, setErrorMessage]);

    const handleEditVertices = useCallback((wallIndex: number) => {
        const wall = scene?.walls?.find(w => w.index === wallIndex);
        if (!wall) return;

        setOriginalWallPoles([...wall.poles]);

        wallTransaction.startTransaction('editing', wall);

        setSelectedWallIndex(wallIndex);
        setIsEditingVertices(true);
        setActivePanel(null);
    }, [scene, wallTransaction, setOriginalWallPoles, setSelectedWallIndex, setIsEditingVertices, setActivePanel]);

    const handleCancelEditing = useCallback(async () => {
        if (!scene || selectedWallIndex === null) return;

        const segments = wallTransaction.getActiveSegments();
        const originalWall = wallTransaction.transaction.originalWall;

        wallTransaction.rollbackTransaction();

        let cleanedScene = scene;

        segments.forEach(segment => {
            if (segment.wallIndex === null) {
                cleanedScene = removeWallOptimistic(cleanedScene, segment.tempId);
            }
        });

        if (originalWall) {
            cleanedScene = updateWallOptimistic(cleanedScene, selectedWallIndex, {
                poles: originalWall.poles,
                isClosed: originalWall.isClosed,
                name: originalWall.name
            });
        }

        setScene(cleanedScene);
        setSelectedWallIndex(null);
        setIsEditingVertices(false);
        setOriginalWallPoles(null);
    }, [scene, selectedWallIndex, wallTransaction, setScene, setSelectedWallIndex, setIsEditingVertices, setOriginalWallPoles]);

    const handleFinishEditing = useCallback(async () => {
        if (!sceneId || !scene || selectedWallIndex === null) return;

        const result = await wallTransaction.commitTransaction(sceneId, {
            addSceneWall,
            updateSceneWall
        });

        if (result.success) {
            const originalWall = wallTransaction.transaction.originalWall;
            if (!originalWall) {
                setTimeout(() => {
                    setSelectedWallIndex(null);
                    setIsEditingVertices(false);
                    setOriginalWallPoles(null);
                }, 0);
                return;
            }

            const { data: updatedScene } = await refetch();
            if (updatedScene) {
                const hydratedWalls = hydratePlacedWalls(updatedScene.walls || [], sceneId);
                setScene(updatedScene);
                setPlacedWalls(hydratedWalls);

                if (result.segmentResults.length === 1) {
                    const updatedWallIndex = result.segmentResults[0]?.wallIndex;
                    if (updatedWallIndex !== undefined) {
                        const editedWall = updatedScene.walls?.find(w => w.index === updatedWallIndex);
                        if (editedWall) {
                            const otherWalls = (updatedScene.walls || []).filter(w => w.index !== updatedWallIndex);
                            const splitResult = detectSplitPoints({
                                newWallPoles: editedWall.poles,
                                existingWalls: otherWalls,
                                tolerance: 5
                            });

                            try {
                                if (splitResult.needsSplit) {
                                    console.log('[useWallHandlers] Edit caused split:', {
                                        scenario: 'Editing (9.2/9.3)',
                                        splitCount: splitResult.splits.length,
                                        affectedWalls: splitResult.affectedWallIndices
                                    });

                                    const affectedWalls: Array<{
                                        wallIndex: number;
                                        originalWall: SceneWall;
                                        segments: SceneWall[];
                                    }> = [];

                                    for (const wallIndex of splitResult.affectedWallIndices) {
                                        const wall = otherWalls.find(w => w.index === wallIndex);
                                        if (!wall) continue;

                                        const segments = splitWallAtPoints({
                                            wall,
                                            wallIndex,
                                            splitPoints: splitResult.splits
                                        });

                                        if (segments.length > 0) {
                                            affectedWalls.push({ wallIndex, originalWall: wall, segments });
                                        }
                                    }

                                    if (affectedWalls.length > 0) {
                                        const command = new SplitWallsCommand({
                                            sceneId,
                                            newWall: editedWall,
                                            affectedWalls,
                                            onUpdate: async (sceneId, wallIndex, updates) => {
                                                await updateSceneWall({ sceneId, wallIndex, ...updates }).unwrap();
                                            },
                                            onAdd: async (sceneId, wallData) => {
                                                const result = await addSceneWall({ sceneId, ...wallData }).unwrap();
                                                return result;
                                            },
                                            onRemove: async (sceneId, wallIndex) => {
                                                await removeSceneWall({ sceneId, wallIndex }).unwrap();
                                            },
                                            onRefetch: async () => {
                                                const { data } = await refetch();
                                                if (data) {
                                                    const hydratedWalls = hydratePlacedWalls(data.walls || [], sceneId);
                                                    setScene(data);
                                                    setPlacedWalls(hydratedWalls);
                                                }
                                            }
                                        });

                                        await execute(command);
                                        console.log('[useWallHandlers] Edit split completed with undo/redo support');

                                        setTimeout(() => {
                                            setSelectedWallIndex(null);
                                            setIsEditingVertices(false);
                                            setOriginalWallPoles(null);
                                        }, 0);
                                        return;
                                    }
                                }
                            } catch (error) {
                                console.error('[useWallHandlers] Edit split failed:', error);
                                setErrorMessage('Failed to split walls after edit. Please try again.');

                                const { data: freshScene } = await refetch();
                                if (freshScene) {
                                    const hydratedWalls = hydratePlacedWalls(freshScene.walls || [], sceneId);
                                    setScene(freshScene);
                                    setPlacedWalls(hydratedWalls);
                                }
                            }
                        }
                    }
                }

                if (result.segmentResults.length > 1) {
                    const newWalls: SceneWall[] = [];
                    result.segmentResults.forEach(r => {
                        if (r.wallIndex !== undefined) {
                            const wall = updatedScene.walls?.find(w => w.index === r.wallIndex);
                            if (wall) newWalls.push(wall);
                        }
                    });

                    if (newWalls.length === 0) {
                        console.error('Wall break succeeded but no segments found');
                        setErrorMessage('Wall break failed. Please try again.');
                        return;
                    }

                    const command = new BreakWallCommand({
                        sceneId,
                        originalWall,
                        newWalls,
                        onMerge: async (sceneId, wallData) => {
                            try {
                                const result = await addSceneWall({ sceneId, ...wallData }).unwrap();
                                return result;
                            } catch (error) {
                                console.error('Failed to merge walls:', error);
                                throw error;
                            }
                        },
                        onBreak: async (sceneId, wallIndex, segment1Data, segment2Data) => {
                            try {
                                await removeSceneWall({ sceneId, wallIndex }).unwrap();
                                const seg1 = await addSceneWall({ sceneId, ...segment1Data }).unwrap();
                                const seg2 = await addSceneWall({ sceneId, ...segment2Data }).unwrap();
                                return { segment1: seg1, segment2: seg2 };
                            } catch (error) {
                                console.error('Failed to break wall:', error);
                                throw error;
                            }
                        },
                        onRefetch: async () => {
                            const { data } = await refetch();
                            if (data) {
                                const hydratedWalls = hydratePlacedWalls(data.walls || [], sceneId);
                                setScene(data);
                                setPlacedWalls(hydratedWalls);
                            }
                        }
                    });
                    await execute(command);
                } else if (result.segmentResults[0]?.wallIndex !== undefined) {
                    const updatedWall = updatedScene.walls?.find(w => w.index === result.segmentResults[0].wallIndex);
                    if (updatedWall) {
                        const command = new EditWallCommand({
                            sceneId,
                            wallIndex: result.segmentResults[0].wallIndex,
                            oldWall: originalWall,
                            newWall: updatedWall,
                            onUpdate: async (sceneId, wallIndex, updates) => {
                                try {
                                    await updateSceneWall({ sceneId, wallIndex, ...updates }).unwrap();
                                } catch (error) {
                                    console.error('Failed to update wall:', error);
                                    throw error;
                                }
                            },
                            onRefetch: async () => {
                                const { data } = await refetch();
                                if (data) {
                                    const hydratedWalls = hydratePlacedWalls(data.walls || [], sceneId);
                                    setScene(data);
                                    setPlacedWalls(hydratedWalls);
                                }
                            }
                        });
                        await execute(command);
                    }
                }
            }

            setTimeout(() => {
                setSelectedWallIndex(null);
                setIsEditingVertices(false);
                setOriginalWallPoles(null);
            }, 0);
        } else {
            setErrorMessage('Failed to save wall changes. Please try again.');
        }
    }, [sceneId, scene, selectedWallIndex, wallTransaction, addSceneWall, updateSceneWall, removeSceneWall, refetch, setScene, setSelectedWallIndex, setIsEditingVertices, setOriginalWallPoles, setErrorMessage, execute]);

    const handleWallBreak = useCallback(async (breakData: WallBreakData) => {
        if (!scene) return;

        const breakAction = createBreakWallAction(
            breakData,
            (segments) => {
                wallTransaction.updateSegments(segments);
            }
        );

        wallTransaction.pushLocalAction(breakAction);
    }, [scene, wallTransaction]);

    const handleWallSelect = useCallback((wallIndex: number | null) => {
        setSelectedWallIndex(wallIndex);
    }, [setSelectedWallIndex]);

    const handleWallPlacementFinish = useCallback(async () => {
        if (!sceneId || !scene) return;
        if (drawingMode !== 'wall' || drawingWallIndex === null) return;

        const result = await wallTransaction.commitTransaction(sceneId, {
            addSceneWall,
            updateSceneWall
        });

        if (result.success && result.segmentResults.length > 0) {
            const tempToReal = new Map<number, number>();
            result.segmentResults.forEach(r => {
                if (r.wallIndex !== undefined) {
                    tempToReal.set(r.tempId, r.wallIndex);
                }
            });

            const syncedScene = syncWallIndices(scene, tempToReal);

            const hydratedWalls = hydratePlacedWalls(syncedScene.walls || [], sceneId);

            setScene(syncedScene);
            setPlacedWalls(hydratedWalls);
        } else {
            wallTransaction.rollbackTransaction();
            const cleanScene = removeWallOptimistic(scene, -1);
            setScene(cleanScene);
            setErrorMessage('Failed to place wall. Please try again.');
        }

        setDrawingWallIndex(null);
        setDrawingMode(null);
    }, [sceneId, scene, drawingMode, drawingWallIndex, wallTransaction, addSceneWall, updateSceneWall, setScene, setPlacedWalls, setDrawingWallIndex, setDrawingMode, setErrorMessage]);

    const handleWallPlacementFinishWithMerge = useCallback(async (mergeResult: MergeResult) => {
        if (!sceneId || !scene) return;
        if (drawingMode !== 'wall' || drawingWallIndex === null) return;

        console.log('[useWallHandlers] Processing merge:', {
            scenario: mergeResult.isClosed ? 'Scenario 5 (closed)' : 'Scenario 3 (merge)',
            targetWallIndex: mergeResult.targetWallIndex,
            wallsToDelete: mergeResult.wallsToDelete
        });

        try {
            if (mergeResult.targetWallIndex === undefined) {
                setErrorMessage('Merge failed: No target wall');
                return;
            }

            const targetWall = scene.walls?.find(w => w.index === mergeResult.targetWallIndex);
            if (!targetWall) {
                setErrorMessage('Merge failed: Target wall not found');
                return;
            }

            const mergedWall: SceneWall = {
                ...targetWall,
                poles: mergeResult.mergedPoles,
                isClosed: mergeResult.isClosed
            };

            const originalWalls: SceneWall[] = [];
            for (const mergePoint of mergeResult.mergePoints) {
                const wall = scene.walls?.find(w => w.index === mergePoint.wallIndex);
                if (wall && !originalWalls.some(w => w.index === wall.index)) {
                    originalWalls.push(wall);
                }
            }
            if (!originalWalls.some(w => w.index === mergeResult.targetWallIndex)) {
                originalWalls.push(targetWall);
            }

            const command = new MergeWallsCommand({
                sceneId,
                targetWallIndex: mergeResult.targetWallIndex,
                mergedWall,
                originalWalls,
                wallsToDelete: mergeResult.wallsToDelete,
                onUpdate: async (sceneId, wallIndex, updates) => {
                    await updateSceneWall({ sceneId, wallIndex, ...updates }).unwrap();
                },
                onAdd: async (sceneId, wallData) => {
                    const result = await addSceneWall({ sceneId, ...wallData }).unwrap();
                    return result;
                },
                onRemove: async (sceneId, wallIndex) => {
                    await removeSceneWall({ sceneId, wallIndex }).unwrap();
                },
                onRefetch: async () => {
                    const { data } = await refetch();
                    if (data) {
                        setScene(data);
                        const hydratedWalls = hydratePlacedWalls(data.walls || [], sceneId);
                        setPlacedWalls(hydratedWalls);
                    }
                }
            });

            await execute(command);

            console.log('[useWallHandlers] Merge completed successfully with undo/redo support');

        } catch (error) {
            console.error('[useWallHandlers] Merge failed:', error);
            setErrorMessage('Failed to merge walls. Please try again.');
            wallTransaction.rollbackTransaction();

            const { data: freshScene } = await refetch();
            if (freshScene) {
                setScene(freshScene);
                const hydratedWalls = hydratePlacedWalls(freshScene.walls || [], sceneId);
                setPlacedWalls(hydratedWalls);
            }
        }

        setDrawingWallIndex(null);
        setDrawingMode(null);
    }, [sceneId, scene, drawingMode, drawingWallIndex, wallTransaction, updateSceneWall, removeSceneWall, refetch, setScene, setPlacedWalls, setDrawingWallIndex, setDrawingMode, setErrorMessage]);

    const handleWallPlacementFinishWithSplit = useCallback(async (splitResult: SplitResult) => {
        if (!sceneId || !scene) return;
        if (drawingMode !== 'wall' || drawingWallIndex === null) return;

        console.log('[useWallHandlers] Processing split:', {
            splitCount: splitResult.splits.length,
            affectedWalls: splitResult.affectedWallIndices
        });

        try {
            const newWallResult = await wallTransaction.commitTransaction(sceneId, {
                addSceneWall,
                updateSceneWall
            });

            if (!newWallResult.success) {
                setErrorMessage('Failed to place new wall. Please try again.');
                return;
            }

            const newWallIndex = newWallResult.segmentResults[0]?.wallIndex;
            if (newWallIndex === undefined) {
                setErrorMessage('Failed to get new wall index.');
                return;
            }

            const { data: sceneWithNewWall } = await refetch();
            if (!sceneWithNewWall) {
                setErrorMessage('Failed to refetch scene after new wall placement.');
                return;
            }

            const newWall = sceneWithNewWall.walls?.find(w => w.index === newWallIndex);
            if (!newWall) {
                setErrorMessage('Failed to find new wall in scene.');
                return;
            }

            const affectedWalls: Array<{
                wallIndex: number;
                originalWall: SceneWall;
                segments: SceneWall[];
            }> = [];

            for (const wallIndex of splitResult.affectedWallIndices) {
                const originalWall = scene.walls?.find(w => w.index === wallIndex);
                if (!originalWall) {
                    console.warn(`[useWallHandlers] Wall ${wallIndex} not found for splitting`);
                    continue;
                }

                const segments = splitWallAtPoints({
                    wall: originalWall,
                    wallIndex,
                    splitPoints: splitResult.splits
                });

                if (segments.length === 0) {
                    console.warn(`[useWallHandlers] No segments created for wall ${wallIndex}`);
                    continue;
                }

                affectedWalls.push({ wallIndex, originalWall, segments });
            }

            if (affectedWalls.length === 0) {
                console.warn('[useWallHandlers] No walls to split');
                return;
            }

            const command = new SplitWallsCommand({
                sceneId,
                newWall,
                affectedWalls,
                onUpdate: async (sceneId, wallIndex, updates) => {
                    await updateSceneWall({ sceneId, wallIndex, ...updates }).unwrap();
                },
                onAdd: async (sceneId, wallData) => {
                    const result = await addSceneWall({ sceneId, ...wallData }).unwrap();
                    return result;
                },
                onRemove: async (sceneId, wallIndex) => {
                    await removeSceneWall({ sceneId, wallIndex }).unwrap();
                },
                onRefetch: async () => {
                    const { data } = await refetch();
                    if (data) {
                        setScene(data);
                        const hydratedWalls = hydratePlacedWalls(data.walls || [], sceneId);
                        setPlacedWalls(hydratedWalls);
                    }
                }
            });

            await execute(command);

            console.log('[useWallHandlers] Split completed successfully with undo/redo support');

        } catch (error) {
            console.error('[useWallHandlers] Split failed:', error);
            setErrorMessage('Failed to split walls. Please try again.');
            wallTransaction.rollbackTransaction();

            const { data: freshScene } = await refetch();
            if (freshScene) {
                setScene(freshScene);
                const hydratedWalls = hydratePlacedWalls(freshScene.walls || [], sceneId);
                setPlacedWalls(hydratedWalls);
            }
        }

        setDrawingWallIndex(null);
        setDrawingMode(null);
    }, [sceneId, scene, drawingMode, drawingWallIndex, wallTransaction, addSceneWall, updateSceneWall, removeSceneWall, refetch, execute, setScene, setPlacedWalls, setDrawingWallIndex, setDrawingMode, setErrorMessage]);

    return {
        handleWallDelete,
        handleEditVertices,
        handleCancelEditing,
        handleFinishEditing,
        handleWallBreak,
        handleWallSelect,
        handleWallPlacementFinish,
        handleWallPlacementFinishWithMerge,
        handleWallPlacementFinishWithSplit
    };
};
