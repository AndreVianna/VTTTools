import { useCallback } from 'react';
import type {
  useAddEncounterRegionMutation,
  useRemoveEncounterRegionMutation,
  useUpdateEncounterRegionMutation,
} from '@/services/encounterApi';
import type { Encounter, EncounterRegion, Point } from '@/types/domain';
import type { Command } from '@/utils/commands';
import { createBatchCommand } from '@/utils/commands';
import { CreateRegionCommand, DeleteRegionCommand, EditRegionCommand } from '@/utils/commands/regionCommands';
import { removeRegionOptimistic, removeTempRegions, updateRegionOptimistic } from '@/utils/encounterStateUtils';
import type { ClipResult } from '@/utils/regionMergeUtils';

export interface UseClipRegionsParams {
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
  addEncounterRegion,
  updateEncounterRegion,
  removeEncounterRegion,
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
              onAdd: async (encounterId, regionData) => {
                const result = await addEncounterRegion({
                  encounterId,
                  ...regionData,
                }).unwrap();
                return result;
              },
              onRemove: async (encounterId, regionIndex) => {
                await removeEncounterRegion({
                  encounterId,
                  regionIndex,
                }).unwrap();
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
              onUpdate: async (encounterId, regionIndex, updates) => {
                try {
                  await updateEncounterRegion({
                    encounterId,
                    regionIndex,
                    ...updates,
                  }).unwrap();
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
              onAdd: async (encounterId, regionData) => {
                const result = await addEncounterRegion({
                  encounterId,
                  ...regionData,
                }).unwrap();
                return result;
              },
              onRemove: async (encounterId, regionIndex) => {
                await removeEncounterRegion({
                  encounterId,
                  regionIndex,
                }).unwrap();
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

        for (const { baseRegion, vertices, nameSuffix } of regionsToCreate) {
          const newRegionData = {
            name: `${baseRegion.name} ${nameSuffix}`,
            type: baseRegion.type,
            vertices,
            ...(baseRegion.value !== undefined && { value: baseRegion.value }),
            ...(baseRegion.label !== undefined && { label: baseRegion.label }),
          };

          const createdRegion = await addEncounterRegion({
            encounterId,
            ...newRegionData,
          }).unwrap();

          const fullRegion: EncounterRegion = {
            ...newRegionData,
            encounterId,
            index: createdRegion.index,
          };

          commands.push(
            new CreateRegionCommand({
              encounterId,
              region: fullRegion,
              onCreate: async (encounterId, regionData) => {
                const result = await addEncounterRegion({
                  encounterId,
                  ...regionData,
                }).unwrap();
                return result;
              },
              onRemove: async (encounterId, regionIndex) => {
                await removeEncounterRegion({
                  encounterId,
                  regionIndex,
                }).unwrap();
              },
              onRefetch: async () => {
                const { data } = await refetch();
                if (data) setEncounter(data);
              },
            }),
          );
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
      addEncounterRegion,
      updateEncounterRegion,
      removeEncounterRegion,
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
