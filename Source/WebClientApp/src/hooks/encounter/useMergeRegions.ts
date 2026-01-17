import { useCallback } from 'react';
import { type Encounter, type EncounterRegion, type Point, RegionType } from '@/types/domain';
import type { CreateRegionRequest, UpdateRegionRequest } from '@/types/stage';
import type { Command } from '@/utils/commands';
import { createBatchCommand } from '@/utils/commands';
import { DeleteRegionCommand, EditRegionCommand } from '@/utils/commands/regionCommands';
import { toRegionType } from '@/utils/encounter';
import { removeRegionOptimistic, removeTempRegions, updateRegionOptimistic } from '@/utils/encounterStateUtils';

/**
 * Helper to convert Partial<EncounterRegion> to UpdateRegionRequest.
 */
const toUpdateRequest = (updates: Partial<EncounterRegion>): UpdateRegionRequest => ({
  ...(updates.name !== undefined && { name: updates.name }),
  ...(updates.type !== undefined && { type: toRegionType(updates.type) }),
  ...(updates.vertices !== undefined && { vertices: updates.vertices }),
  ...(updates.value !== undefined && { value: updates.value }),
});

/**
 * Params for the useMergeRegions hook.
 * Region mutations are now passed from useEncounterEditor which routes them to the Stage API.
 */
export interface UseMergeRegionsParams {
  encounterId: string | undefined;
  encounter: Encounter | null;
  // Stage API mutation functions (passed from useEncounterEditor)
  addRegion: (data: CreateRegionRequest) => Promise<void>;
  updateRegion: (index: number, data: UpdateRegionRequest) => Promise<void>;
  deleteRegion: (index: number) => Promise<void>;
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
  addRegion,
  updateRegion,
  deleteRegion,
  setEncounter,
  setErrorMessage,
  recordAction,
  refetch,
}: UseMergeRegionsParams): UseMergeRegionsResult => {
  const executeMerge = useCallback(
    async ({
      targetRegionIndex,
      originalTargetRegion,
      mergedVertices,
      regionsToDelete,
      editingRegionIndex,
      originalEditedRegion,
      onSuccess,
      onError,
    }: ExecuteMergeParams) => {
      if (!encounterId || !encounter) return;

      const targetRegion = encounter.stage.regions?.find((r) => r.index === targetRegionIndex);
      if (!targetRegion) {
        setErrorMessage('Merge target region not found');
        onError();
        return;
      }

      const commands: Command[] = [];

      commands.push(
        new EditRegionCommand({
          encounterId,
          regionIndex: targetRegionIndex,
          oldRegion: originalTargetRegion,
          newRegion: { ...targetRegion, vertices: mergedVertices },
          onUpdate: async (_encounterId, regionIndex, updates) => {
            try {
              await updateRegion(regionIndex, toUpdateRequest(updates));
            } catch (error) {
              console.error('Failed to update region:', error);
              throw error;
            }
          },
          onRefetch: async () => {
            const { data } = await refetch();
            if (data) setEncounter(data);
          },
        }),
      );

      for (const deleteIndex of regionsToDelete) {
        let regionToDelete = encounter.stage.regions?.find((r) => r.index === deleteIndex);

        if (
          editingRegionIndex !== null &&
          editingRegionIndex !== undefined &&
          deleteIndex === editingRegionIndex &&
          originalEditedRegion
        ) {
          regionToDelete = originalEditedRegion;
        }

        if (regionToDelete) {
          commands.push(
            new DeleteRegionCommand({
              encounterId,
              regionIndex: deleteIndex,
              region: {
                encounterId,
                index: regionToDelete.index,
                name: regionToDelete.name,
                type: String(regionToDelete.type),
                vertices: regionToDelete.vertices,
                ...(regionToDelete.value !== undefined && { value: regionToDelete.value }),
              },
              onAdd: async (_encounterId, regionData) => {
                await addRegion({
                  name: regionData.name,
                  type: toRegionType(regionData.type),
                  vertices: regionData.vertices,
                  ...(regionData.value !== undefined && { value: regionData.value }),
                });
                return { index: deleteIndex };
              },
              onRemove: async (_encounterId, regionIndex) => {
                await deleteRegion(regionIndex);
              },
              onRefetch: async () => {
                const { data } = await refetch();
                if (data) setEncounter(data);
              },
            }),
          );
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
        vertices: mergedVertices,
      });

      for (const deleteIndex of regionsToDelete) {
        syncedEncounter = removeRegionOptimistic(syncedEncounter, deleteIndex);
      }

      syncedEncounter = removeTempRegions(syncedEncounter);

      setEncounter(syncedEncounter);
      onSuccess();
    },
    [
      encounterId,
      encounter,
      addRegion,
      updateRegion,
      deleteRegion,
      setEncounter,
      setErrorMessage,
      recordAction,
      refetch,
    ],
  );

  return {
    executeMerge,
  };
};
