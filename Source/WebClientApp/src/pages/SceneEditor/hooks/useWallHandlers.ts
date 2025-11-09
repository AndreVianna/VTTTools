import { useCallback } from 'react';
import type { Scene, SceneWall, Pole } from '@/types/domain';
import type { useWallTransaction } from '@/hooks/useWallTransaction';
import type { WallBreakData } from '@components/scene/editing/WallTransformer';
import type {
    useAddSceneWallMutation,
    useUpdateSceneWallMutation,
    useRemoveSceneWallMutation
} from '@/services/sceneApi';
import { updateWallOptimistic, removeWallOptimistic, syncWallIndices } from '@/utils/sceneStateUtils';
import { createBreakWallAction } from '@/types/wallUndoActions';
import { CreateWallCommand, EditWallCommand, BreakWallCommand } from '@/utils/commands/wallCommands';
import {
    getIndexByDomId,
    removeEntityMapping,
    setEntityMapping
} from '@/utils/sceneEntityMapping';

interface UseWallHandlersProps {
    sceneId: string | undefined;
    scene: Scene | null;
    wallTransaction: ReturnType<typeof useWallTransaction>;
    selectedWallIndex: number | null;

    addSceneWall: ReturnType<typeof useAddSceneWallMutation>[0];
    updateSceneWall: ReturnType<typeof useUpdateSceneWallMutation>[0];
    removeSceneWall: ReturnType<typeof useRemoveSceneWallMutation>[0];

    setScene: (scene: Scene) => void;
    setSelectedWallIndex: (index: number | null) => void;
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
    addSceneWall,
    updateSceneWall,
    removeSceneWall,
    setScene,
    setSelectedWallIndex,
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

        const wall = scene.walls?.find(w => w.index === wallIndex);
        if (!wall) return;

        const wallId = wall.id;

        try {
            await removeSceneWall({ sceneId, wallIndex }).unwrap();

            removeEntityMapping(sceneId, 'walls', wallId);

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
                setSelectedWallIndex(null);
                setIsEditingVertices(false);
                setOriginalWallPoles(null);
                return;
            }

            const { data: updatedScene } = await refetch();
            if (updatedScene) {
                setScene(updatedScene);

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
                            if (data) setScene(data);
                        }
                    });
                    execute(command);
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
                                if (data) setScene(data);
                            }
                        });
                        execute(command);
                    }
                }
            }

            setSelectedWallIndex(null);
            setIsEditingVertices(false);
            setOriginalWallPoles(null);
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

    return {
        handleWallDelete,
        handleEditVertices,
        handleCancelEditing,
        handleFinishEditing,
        handleWallBreak,
        handleWallSelect
    };
};
