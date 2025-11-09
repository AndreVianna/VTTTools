import { useCallback } from 'react';
import type { Scene, SceneRegion, Point, PlacedRegion } from '@/types/domain';
import type { GridConfig } from '@/utils/gridCalculator';
import type { RegionTransaction } from '@/hooks/useRegionTransaction';
import type {
    useAddSceneRegionMutation,
    useUpdateSceneRegionMutation,
    useRemoveSceneRegionMutation
} from '@/services/sceneApi';
import { updateRegionOptimistic, removeRegionOptimistic, syncRegionIndices } from '@/utils/sceneStateUtils';
import { createBatchCommand } from '@/utils/commands';
import { CreateRegionCommand, EditRegionCommand, DeleteRegionCommand } from '@/utils/commands/regionCommands';
import { getDomIdByIndex, removeEntityMapping } from '@/utils/sceneEntityMapping';
import { hydratePlacedRegions } from '@/utils/sceneMappers';

interface UseRegionHandlersProps {
    sceneId: string | undefined;
    scene: Scene | null;
    regionTransaction: ReturnType<typeof import('@/hooks/useRegionTransaction').useRegionTransaction>;
    gridConfig: GridConfig;
    selectedRegionIndex: number | null;
    editingRegionIndex: number | null;
    originalRegionVertices: Point[] | null;
    drawingMode: 'region' | 'wall' | null;
    drawingRegionIndex: number | null;

    addSceneRegion: ReturnType<typeof useAddSceneRegionMutation>[0];
    updateSceneRegion: ReturnType<typeof useUpdateSceneRegionMutation>[0];
    removeSceneRegion: ReturnType<typeof useRemoveSceneRegionMutation>[0];

    setScene: (scene: Scene) => void;
    setPlacedRegions: (regions: PlacedRegion[]) => void;
    setSelectedRegionIndex: (index: number | null) => void;
    setEditingRegionIndex: (index: number | null) => void;
    setIsEditingRegionVertices: (editing: boolean) => void;
    setOriginalRegionVertices: (vertices: Point[] | null) => void;
    setDrawingRegionIndex: (index: number | null) => void;
    setDrawingMode: (mode: 'region' | 'wall' | null) => void;
    setErrorMessage: (message: string | null) => void;

    execute: (command: any) => void;
    refetch: () => Promise<{ data?: Scene }>;
}

export const useRegionHandlers = ({
    sceneId,
    scene,
    regionTransaction,
    gridConfig,
    selectedRegionIndex,
    editingRegionIndex,
    originalRegionVertices,
    drawingMode,
    drawingRegionIndex,
    addSceneRegion,
    updateSceneRegion,
    removeSceneRegion,
    setScene,
    setPlacedRegions,
    setSelectedRegionIndex,
    setEditingRegionIndex,
    setIsEditingRegionVertices,
    setOriginalRegionVertices,
    setDrawingRegionIndex,
    setDrawingMode,
    setErrorMessage,
    execute,
    refetch
}: UseRegionHandlersProps) => {

    const handleRegionDelete = useCallback(async (regionIndex: number) => {
        if (!sceneId || !scene) return;

        const region = scene.regions?.find(r => r.index === regionIndex);
        if (!region) return;

        const regionId = getDomIdByIndex(sceneId, 'regions', regionIndex);
        if (!regionId) return;

        try {
            await removeSceneRegion({ sceneId, regionIndex }).unwrap();

            removeEntityMapping(sceneId, 'regions', regionId);

            const { data: updatedScene } = await refetch();
            if (updatedScene) {
                setScene(updatedScene);

                const hydratedRegions = hydratePlacedRegions(updatedScene.regions, sceneId);
                setPlacedRegions(hydratedRegions);
            }

            if (selectedRegionIndex === regionIndex) {
                setSelectedRegionIndex(null);
            }
        } catch (_error) {
            console.error('[useRegionHandlers] Failed to delete region');
        }
    }, [sceneId, scene, removeSceneRegion, refetch, setScene, setPlacedRegions, selectedRegionIndex, setSelectedRegionIndex]);

    const handleCancelEditingRegion = useCallback(async () => {
        if (!scene || editingRegionIndex === null) return;

        const originalRegion = regionTransaction.transaction.originalRegion;

        regionTransaction.rollbackTransaction();

        if (originalRegion && originalRegionVertices) {
            const revertedScene = updateRegionOptimistic(scene, editingRegionIndex, {
                vertices: originalRegionVertices
            });
            setScene(revertedScene);
        }

        setEditingRegionIndex(null);
        setSelectedRegionIndex(null);
        setIsEditingRegionVertices(false);
        setOriginalRegionVertices(null);
    }, [scene, editingRegionIndex, originalRegionVertices, regionTransaction, setScene, setEditingRegionIndex, setSelectedRegionIndex, setIsEditingRegionVertices, setOriginalRegionVertices]);

    const handleFinishEditingRegion = useCallback(async () => {
        if (!sceneId || !scene || editingRegionIndex === null) return;

        // Filter out temp regions (index -1) before merge detection
        const sceneForCommit = scene ? {
            ...scene,
            regions: scene.regions?.filter(r => r.index !== -1)
        } : scene;

        const result = await regionTransaction.commitTransaction(
            sceneId,
            { addSceneRegion, updateSceneRegion },
            sceneForCommit,
            gridConfig
        );

        if (result.action === 'merge') {
            const targetRegion = scene.regions?.find(r => r.index === result.targetRegionIndex);
            if (!targetRegion) {
                setErrorMessage('Merge target region not found');
                regionTransaction.rollbackTransaction();

                if (originalRegionVertices && editingRegionIndex !== null) {
                    const revertedScene = updateRegionOptimistic(scene, editingRegionIndex, {
                        vertices: originalRegionVertices
                    });
                    setScene(revertedScene);
                }

                setEditingRegionIndex(null);
                setSelectedRegionIndex(null);
                setIsEditingRegionVertices(false);
                setOriginalRegionVertices(null);
                return;
            }

            const commands: any[] = [];

            commands.push(new EditRegionCommand({
                sceneId,
                regionIndex: result.targetRegionIndex!,
                oldRegion: targetRegion,
                newRegion: { ...targetRegion, vertices: result.mergedVertices! },
                onUpdate: async (sceneId, regionIndex, updates) => {
                    try {
                        await updateSceneRegion({ sceneId, regionIndex, ...updates }).unwrap();
                    } catch (error) {
                        console.error('Failed to update region:', error);
                        throw error;
                    }
                },
                onRefetch: async () => {
                    const { data } = await refetch();
                    if (data) setScene(data);
                }
            }));

            for (const deleteIndex of result.regionsToDelete || []) {
                const regionToDelete = scene.regions?.find(r => r.index === deleteIndex);
                if (regionToDelete) {
                    commands.push(new DeleteRegionCommand({
                        sceneId,
                        regionIndex: deleteIndex,
                        region: regionToDelete,
                        onAdd: async (sceneId, regionData) => {
                            const result = await addSceneRegion({ sceneId, ...regionData }).unwrap();
                            return result;
                        },
                        onRemove: async (sceneId, regionIndex) => {
                            await removeSceneRegion({ sceneId, regionIndex }).unwrap();
                        },
                        onRefetch: async () => {
                            const { data } = await refetch();
                            if (data) setScene(data);
                        }
                    }));
                }
            }

            const batchCommand = createBatchCommand({ commands });
            execute(batchCommand);

            let syncedScene = updateRegionOptimistic(scene, result.targetRegionIndex!, {
                vertices: result.mergedVertices!
            });
            for (const deleteIndex of result.regionsToDelete || []) {
                syncedScene = removeRegionOptimistic(syncedScene, deleteIndex);
            }
            setScene(syncedScene);

            setEditingRegionIndex(null);
            setSelectedRegionIndex(null);
            setIsEditingRegionVertices(false);
            setOriginalRegionVertices(null);
            return;
        }

        if (result.success && result.regionIndex !== undefined) {
            const updatedRegion = scene.regions?.find(r => r.index === editingRegionIndex);
            if (updatedRegion) {
                const command = new EditRegionCommand({
                    sceneId,
                    regionIndex: editingRegionIndex,
                    oldRegion: regionTransaction.transaction.originalRegion!,
                    newRegion: updatedRegion,
                    onUpdate: async (sceneId, regionIndex, updates) => {
                        try {
                            await updateSceneRegion({ sceneId, regionIndex, ...updates }).unwrap();
                        } catch (error) {
                            console.error('Failed to update region:', error);
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

            setEditingRegionIndex(null);
            setSelectedRegionIndex(null);
            setIsEditingRegionVertices(false);
            setOriginalRegionVertices(null);
        } else {
            setErrorMessage('Failed to update region. Please try again.');
            regionTransaction.rollbackTransaction();

            if (originalRegionVertices && editingRegionIndex !== null) {
                const revertedScene = updateRegionOptimistic(scene, editingRegionIndex, {
                    vertices: originalRegionVertices
                });
                setScene(revertedScene);
            }

            setEditingRegionIndex(null);
            setSelectedRegionIndex(null);
            setIsEditingRegionVertices(false);
            setOriginalRegionVertices(null);
        }
    }, [sceneId, scene, editingRegionIndex, originalRegionVertices, regionTransaction, gridConfig, addSceneRegion, updateSceneRegion, removeSceneRegion, setScene, setEditingRegionIndex, setSelectedRegionIndex, setIsEditingRegionVertices, setOriginalRegionVertices, setErrorMessage, execute, refetch]);

    const handleStructurePlacementFinish = useCallback(async () => {
        if (!sceneId || !scene) return;

        if (drawingMode !== 'region' || drawingRegionIndex === null) return;

        // Filter out temp regions (index -1) before merge detection
        const sceneForCommit = scene ? {
            ...scene,
            regions: scene.regions?.filter(r => r.index !== -1)
        } : scene;

        const result = await regionTransaction.commitTransaction(
            sceneId,
            { addSceneRegion, updateSceneRegion },
            sceneForCommit,
            gridConfig
        );

        if (result.action === 'merge') {
            const targetRegion = scene.regions?.find(r => r.index === result.targetRegionIndex);
            if (!targetRegion) {
                setErrorMessage('Merge target region not found');
                regionTransaction.rollbackTransaction();
                setDrawingRegionIndex(null);
                setDrawingMode(null);
                return;
            }

            const commands: any[] = [];

            commands.push(new EditRegionCommand({
                sceneId,
                regionIndex: result.targetRegionIndex!,
                oldRegion: targetRegion,
                newRegion: { ...targetRegion, vertices: result.mergedVertices! },
                onUpdate: async (sceneId, regionIndex, updates) => {
                    try {
                        await updateSceneRegion({ sceneId, regionIndex, ...updates }).unwrap();
                    } catch (error) {
                        console.error('Failed to update region:', error);
                        throw error;
                    }
                },
                onRefetch: async () => {
                    const { data } = await refetch();
                    if (data) setScene(data);
                }
            }));

            for (const deleteIndex of result.regionsToDelete || []) {
                const regionToDelete = scene.regions?.find(r => r.index === deleteIndex);
                if (regionToDelete) {
                    commands.push(new DeleteRegionCommand({
                        sceneId,
                        regionIndex: deleteIndex,
                        region: regionToDelete,
                        onAdd: async (sceneId, regionData) => {
                            const result = await addSceneRegion({ sceneId, ...regionData }).unwrap();
                            return result;
                        },
                        onRemove: async (sceneId, regionIndex) => {
                            await removeSceneRegion({ sceneId, regionIndex }).unwrap();
                        },
                        onRefetch: async () => {
                            const { data } = await refetch();
                            if (data) setScene(data);
                        }
                    }));
                }
            }

            const batchCommand = createBatchCommand({ commands });
            execute(batchCommand);

            let syncedScene = updateRegionOptimistic(scene, result.targetRegionIndex!, {
                vertices: result.mergedVertices!
            });
            for (const deleteIndex of result.regionsToDelete || []) {
                syncedScene = removeRegionOptimistic(syncedScene, deleteIndex);
            }
            setScene(syncedScene);

            setDrawingRegionIndex(null);
            setDrawingMode(null);
            return;
        }

        if (result.success && result.regionIndex !== undefined) {
            const tempToReal = new Map<number, number>();
            tempToReal.set(-1, result.regionIndex);

            const syncedScene = syncRegionIndices(scene, tempToReal);
            setScene(syncedScene);

            const createdRegion = syncedScene.regions?.find(r => r.index === result.regionIndex);
            if (createdRegion) {
                const command = new CreateRegionCommand({
                    sceneId,
                    region: createdRegion,
                    onCreate: async (sceneId, regionData) => {
                        try {
                            const result = await addSceneRegion({ sceneId, ...regionData }).unwrap();
                            return result;
                        } catch (error) {
                            console.error('Failed to recreate region:', error);
                            setErrorMessage('Failed to recreate region. Please try again.');
                            throw error;
                        }
                    },
                    onRemove: async (sceneId, regionIndex) => {
                        try {
                            await removeSceneRegion({ sceneId, regionIndex }).unwrap();
                        } catch (error) {
                            console.error('Failed to remove region:', error);
                            setErrorMessage('Failed to remove region. Please try again.');
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
        } else {
            regionTransaction.rollbackTransaction();
            const cleanScene = removeRegionOptimistic(scene, -1);
            setScene(cleanScene);
            setErrorMessage('Failed to place region. Please try again.');
        }

        setDrawingRegionIndex(null);
        setDrawingMode(null);
    }, [sceneId, scene, drawingMode, drawingRegionIndex, regionTransaction, gridConfig, addSceneRegion, updateSceneRegion, removeSceneRegion, setScene, setDrawingRegionIndex, setDrawingMode, setErrorMessage, execute, refetch]);

    const handlePlaceRegion = useCallback((properties: {
        name: string;
        type: string;
        value?: number;
        label?: string;
        color?: string;
    }) => {
        setDrawingMode('region');
        setDrawingRegionIndex(-1);
        setSelectedRegionIndex(null);

        regionTransaction.startTransaction('placement', undefined, properties);

        if (scene) {
            const tempRegion: SceneRegion = {
                index: -1,
                name: properties.name,
                vertices: [],
                type: properties.type,
                ...(properties.value !== undefined && { value: properties.value }),
                ...(properties.label !== undefined && { label: properties.label }),
                color: properties.color || '#808080'
            };

            const updatedScene = {
                ...scene,
                regions: [...(scene.regions || []), tempRegion]
            };
            setScene(updatedScene);
        }
    }, [scene, setDrawingMode, setDrawingRegionIndex, setSelectedRegionIndex, regionTransaction, setScene]);

    const handleRegionSelect = useCallback((regionIndex: number | null) => {
        setSelectedRegionIndex(regionIndex);
    }, [setSelectedRegionIndex]);

    const handleEditRegionVertices = useCallback((regionIndex: number) => {
        const region = scene?.regions?.find(r => r.index === regionIndex);
        if (!region) return;

        setOriginalRegionVertices([...region.vertices]);
        setEditingRegionIndex(regionIndex);
        setIsEditingRegionVertices(true);
        setSelectedRegionIndex(regionIndex);

        regionTransaction.startTransaction('editing', region);
    }, [scene, setOriginalRegionVertices, setEditingRegionIndex, setIsEditingRegionVertices, setSelectedRegionIndex, regionTransaction]);

    return {
        handleRegionDelete,
        handleCancelEditingRegion,
        handleFinishEditingRegion,
        handleStructurePlacementFinish,
        handlePlaceRegion,
        handleRegionSelect,
        handleEditRegionVertices
    };
};
