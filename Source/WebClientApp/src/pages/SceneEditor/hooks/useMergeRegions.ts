import { useCallback } from 'react';
import type { Scene, SceneRegion, Point } from '@/types/domain';
import type {
    useAddSceneRegionMutation,
    useUpdateSceneRegionMutation,
    useRemoveSceneRegionMutation
} from '@/services/sceneApi';
import { updateRegionOptimistic, removeRegionOptimistic, removeTempRegions } from '@/utils/sceneStateUtils';
import { createBatchCommand } from '@/utils/commands';
import { EditRegionCommand, DeleteRegionCommand } from '@/utils/commands/regionCommands';
import type { Command } from '@/utils/commands';

export interface UseMergeRegionsParams {
    sceneId: string | undefined;
    scene: Scene | null;
    addSceneRegion: ReturnType<typeof useAddSceneRegionMutation>[0];
    updateSceneRegion: ReturnType<typeof useUpdateSceneRegionMutation>[0];
    removeSceneRegion: ReturnType<typeof useRemoveSceneRegionMutation>[0];
    setScene: (scene: Scene) => void;
    setErrorMessage: (message: string | null) => void;
    recordAction: (command: Command) => void;
    refetch: () => Promise<{ data?: Scene }>;
}

export interface ExecuteMergeParams {
    targetRegionIndex: number;
    originalTargetRegion: SceneRegion;
    mergedVertices: Point[];
    regionsToDelete: number[];
    editingRegionIndex?: number | null;
    originalEditedRegion?: SceneRegion | null;
    onSuccess: () => void;
    onError: () => void;
}

export interface UseMergeRegionsResult {
    executeMerge: (params: ExecuteMergeParams) => Promise<void>;
}

export const useMergeRegions = ({
    sceneId,
    scene,
    addSceneRegion,
    updateSceneRegion,
    removeSceneRegion,
    setScene,
    setErrorMessage,
    recordAction,
    refetch
}: UseMergeRegionsParams): UseMergeRegionsResult => {

    const executeMerge = useCallback(async ({
        targetRegionIndex,
        originalTargetRegion,
        mergedVertices,
        regionsToDelete,
        editingRegionIndex,
        originalEditedRegion,
        onSuccess,
        onError
    }: ExecuteMergeParams) => {
        if (!sceneId || !scene) return;

        const targetRegion = scene.regions?.find(r => r.index === targetRegionIndex);
        if (!targetRegion) {
            setErrorMessage('Merge target region not found');
            onError();
            return;
        }

        const commands: Command[] = [];

        commands.push(new EditRegionCommand({
            sceneId,
            regionIndex: targetRegionIndex,
            oldRegion: originalTargetRegion,
            newRegion: { ...targetRegion, vertices: mergedVertices },
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

        for (const deleteIndex of regionsToDelete) {
            let regionToDelete = scene.regions?.find(r => r.index === deleteIndex);

            if (editingRegionIndex !== null &&
                editingRegionIndex !== undefined &&
                deleteIndex === editingRegionIndex &&
                originalEditedRegion) {
                regionToDelete = originalEditedRegion;
            }

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

        try {
            for (const cmd of commands) {
                await cmd.execute();
            }
            const batchCommand = createBatchCommand({ commands });
            recordAction(batchCommand);
        } catch (error) {
            console.error('Failed to execute merge commands:', error);
            setErrorMessage('Failed to merge regions. Please try again.');
            onError();
            return;
        }

        let syncedScene = updateRegionOptimistic(scene, targetRegionIndex, {
            vertices: mergedVertices
        });

        for (const deleteIndex of regionsToDelete) {
            syncedScene = removeRegionOptimistic(syncedScene, deleteIndex);
        }

        syncedScene = removeTempRegions(syncedScene);

        setScene(syncedScene);
        onSuccess();
    }, [sceneId, scene, addSceneRegion, updateSceneRegion, removeSceneRegion, setScene, setErrorMessage, recordAction, refetch]);

    return {
        executeMerge
    };
};
