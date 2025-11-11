import { useCallback } from 'react';
import type { Encounter, EncounterRegion, Point } from '@/types/domain';
import type {
    useAddEncounterRegionMutation,
    useUpdateEncounterRegionMutation,
    useRemoveEncounterRegionMutation
} from '@/services/encounterApi';
import { updateRegionOptimistic, removeRegionOptimistic, removeTempRegions } from '@/utils/encounterStateUtils';
import { createBatchCommand } from '@/utils/commands';
import { EditRegionCommand, DeleteRegionCommand } from '@/utils/commands/regionCommands';
import type { Command } from '@/utils/commands';

export interface UseMergeRegionsParams {
    encounterId: string | undefined;
    encounter: Encounter | null;
    addEncounterRegion: ReturnType<typeof useAddEncounterRegionMutation>[0];
    updateEncounterRegion: ReturnType<typeof useUpdateEncounterRegionMutation>[0];
    removeEncounterRegion: ReturnType<typeof useRemoveEncounterRegionMutation>[0];
    setEncounter: (encounter: Encounter) => void;
    setErrorMessage: (message: string | null) => void;
    recordAction: (command: Command) => void;
    refetch: () => Promise<{ data?: Encounter }>;
}

export interface ExecuteMergeParams {
    targetRegionIndex: number;
    originalTargetRegion: EncounterRegion;
    mergedVertices: Point[];
    regionsToDelete: number[];
    editingRegionIndex?: number | null;
    originalEditedRegion?: EncounterRegion | null;
    onSuccess: () => void;
    onError: () => void;
}

export interface UseMergeRegionsResult {
    executeMerge: (params: ExecuteMergeParams) => Promise<void>;
}

export const useMergeRegions = ({
    encounterId,
    encounter,
    addEncounterRegion,
    updateEncounterRegion,
    removeEncounterRegion,
    setEncounter,
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
        if (!encounterId || !encounter) return;

        const targetRegion = encounter.regions?.find(r => r.index === targetRegionIndex);
        if (!targetRegion) {
            setErrorMessage('Merge target region not found');
            onError();
            return;
        }

        const commands: Command[] = [];

        commands.push(new EditRegionCommand({
            encounterId,
            regionIndex: targetRegionIndex,
            oldRegion: originalTargetRegion,
            newRegion: { ...targetRegion, vertices: mergedVertices },
            onUpdate: async (encounterId, regionIndex, updates) => {
                try {
                    await updateEncounterRegion({ encounterId, regionIndex, ...updates }).unwrap();
                } catch (error) {
                    console.error('Failed to update region:', error);
                    throw error;
                }
            },
            onRefetch: async () => {
                const { data } = await refetch();
                if (data) setEncounter(data);
            }
        }));

        for (const deleteIndex of regionsToDelete) {
            let regionToDelete = encounter.regions?.find(r => r.index === deleteIndex);

            if (editingRegionIndex !== null &&
                editingRegionIndex !== undefined &&
                deleteIndex === editingRegionIndex &&
                originalEditedRegion) {
                regionToDelete = originalEditedRegion;
            }

            if (regionToDelete) {
                commands.push(new DeleteRegionCommand({
                    encounterId,
                    regionIndex: deleteIndex,
                    region: regionToDelete,
                    onAdd: async (encounterId, regionData) => {
                        const result = await addEncounterRegion({ encounterId, ...regionData }).unwrap();
                        return result;
                    },
                    onRemove: async (encounterId, regionIndex) => {
                        await removeEncounterRegion({ encounterId, regionIndex }).unwrap();
                    },
                    onRefetch: async () => {
                        const { data } = await refetch();
                        if (data) setEncounter(data);
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

        let syncedEncounter = updateRegionOptimistic(encounter, targetRegionIndex, {
            vertices: mergedVertices
        });

        for (const deleteIndex of regionsToDelete) {
            syncedEncounter = removeRegionOptimistic(syncedEncounter, deleteIndex);
        }

        syncedEncounter = removeTempRegions(syncedEncounter);

        setEncounter(syncedEncounter);
        onSuccess();
    }, [encounterId, encounter, addEncounterRegion, updateEncounterRegion, removeEncounterRegion, setEncounter, setErrorMessage, recordAction, refetch]);

    return {
        executeMerge
    };
};
