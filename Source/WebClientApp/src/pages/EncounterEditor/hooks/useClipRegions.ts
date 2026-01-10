import { useCallback } from 'react';
import { type Encounter, type EncounterRegion, type Point, RegionType } from '@/types/domain';
import type { CreateRegionRequest, UpdateRegionRequest } from '@/types/stage';
import type { Command } from '@/utils/commands';
import { createBatchCommand } from '@/utils/commands';
import { CreateRegionCommand, DeleteRegionCommand, EditRegionCommand } from '@/utils/commands/regionCommands';
import { removeRegionOptimistic, removeTempRegions, updateRegionOptimistic } from '@/utils/encounterStateUtils';
import type { ClipResult } from '@/utils/regionMergeUtils';

/**
 * Helper to convert a string type to RegionType.
 */
const toRegionType = (type: string): RegionType => {
  if (Object.values(RegionType).includes(type as RegionType)) {
    return type as RegionType;
  }
  return RegionType.Terrain;
};

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
 * Params for the useClipRegions hook.
 * Region mutations are now passed from useEncounterEditor which routes them to the Stage API.
 */
export interface UseClipRegionsParams {
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

export interface ExecuteClipParams {
  clipResults: ClipResult[];
  clipperVertices: Point[];
  onSuccess: () => void;
  onError: () => void;
}

export interface UseClipRegionsResult {
  executeClip: (params: ExecuteClipParams) => Promise<void>;
}

export const useClipRegions = ({
  encounterId,
  encounter,
  addRegion,
  updateRegion,
  deleteRegion,
  setEncounter,
  setErrorMessage,
  recordAction,
  refetch,
}: UseClipRegionsParams): UseClipRegionsResult => {
  const executeClip = useCallback(
    async ({ clipResults, onSuccess, onError }: ExecuteClipParams) => {
      if (!encounterId || !encounter) return;

      const commands: Command[] = [];
      const regionsToDelete: number[] = [];
      const regionsToUpdate: Array<{ index: number; vertices: Point[] }> = [];
      const regionsToCreate: Array<{
        baseRegion: EncounterRegion;
        vertices: Point[];
        nameSuffix: string;
      }> = [];

      for (const clipResult of clipResults) {
        const { regionIndex, originalRegion, resultPolygons } = clipResult;

        if (resultPolygons.length === 0) {
          regionsToDelete.push(regionIndex);

          commands.push(
            new DeleteRegionCommand({
              encounterId,
              regionIndex,
              region: originalRegion,
              onAdd: async (_encounterId, regionData) => {
                await addRegion({
                  name: regionData.name,
                  type: toRegionType(regionData.type),
                  vertices: regionData.vertices,
                  ...(regionData.value !== undefined && { value: regionData.value }),
                });
                return { index: regionIndex };
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
        } else if (resultPolygons.length === 1) {
          const newVertices = resultPolygons[0];
          if (!newVertices) continue;

          regionsToUpdate.push({ index: regionIndex, vertices: newVertices });

          commands.push(
            new EditRegionCommand({
              encounterId,
              regionIndex,
              oldRegion: originalRegion,
              newRegion: { ...originalRegion, vertices: newVertices },
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
        } else {
          regionsToDelete.push(regionIndex);

          commands.push(
            new DeleteRegionCommand({
              encounterId,
              regionIndex,
              region: originalRegion,
              onAdd: async (_encounterId, regionData) => {
                await addRegion({
                  name: regionData.name,
                  type: toRegionType(regionData.type),
                  vertices: regionData.vertices,
                  ...(regionData.value !== undefined && { value: regionData.value }),
                });
                return { index: regionIndex };
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

          const suffixes = 'abcdefghijklmnopqrstuvwxyz';
          for (let i = 0; i < resultPolygons.length; i++) {
            const vertices = resultPolygons[i];
            if (!vertices || vertices.length < 3) continue;

            const suffix = suffixes[i] || `${i + 1}`;
            regionsToCreate.push({
              baseRegion: originalRegion,
              vertices,
              nameSuffix: suffix,
            });
          }
        }
      }

      try {
        for (const cmd of commands) {
          await cmd.execute();
        }

        // Track created region indices for undo/redo
        let createdRegionCount = 0;

        for (const { baseRegion, vertices, nameSuffix } of regionsToCreate) {
          const newRegionData: CreateRegionRequest = {
            name: `${baseRegion.name} ${nameSuffix}`,
            type: toRegionType(baseRegion.type),
            vertices,
            ...(baseRegion.value !== undefined && { value: baseRegion.value }),
          };

          await addRegion(newRegionData);
          createdRegionCount++;

          // Refetch to get the created region index
          const { data: refreshedEncounter } = await refetch();
          if (refreshedEncounter) {
            // Find the newly created region by matching properties
            const createdRegion = refreshedEncounter.stage.regions?.find(
              (r) => r.name === newRegionData.name && r.vertices.length === vertices.length
            );

            if (createdRegion) {
              const fullRegion: EncounterRegion = {
                encounterId,
                index: createdRegion.index,
                name: newRegionData.name ?? '',
                type: String(newRegionData.type),
                vertices: newRegionData.vertices,
                ...(newRegionData.value !== undefined && { value: newRegionData.value }),
              };

              commands.push(
                new CreateRegionCommand({
                  encounterId,
                  region: fullRegion,
                  onCreate: async (_encounterId, regionData) => {
                    await addRegion({
                      name: regionData.name,
                      type: toRegionType(regionData.type),
                      vertices: regionData.vertices,
                      ...(regionData.value !== undefined && { value: regionData.value }),
                    });
                    return { index: createdRegion.index };
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
        }

        const batchCommand = createBatchCommand({ commands });
        recordAction(batchCommand);
      } catch (error) {
        console.error('Failed to execute clip commands:', error);
        setErrorMessage('Failed to clip regions. Please try again.');
        onError();
        return;
      }

      let syncedEncounter = { ...encounter };

      for (const { index, vertices } of regionsToUpdate) {
        syncedEncounter = updateRegionOptimistic(syncedEncounter, index, { vertices });
      }

      for (const deleteIndex of regionsToDelete) {
        syncedEncounter = removeRegionOptimistic(syncedEncounter, deleteIndex);
      }

      syncedEncounter = removeTempRegions(syncedEncounter);

      const { data: refreshedData } = await refetch();
      if (refreshedData) {
        setEncounter(refreshedData);
      } else {
        setEncounter(syncedEncounter);
      }

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
    executeClip,
  };
};
