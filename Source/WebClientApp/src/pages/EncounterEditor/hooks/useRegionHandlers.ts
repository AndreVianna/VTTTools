import { useCallback } from 'react';
import type {
  useAddEncounterRegionMutation,
  useRemoveEncounterRegionMutation,
  useUpdateEncounterRegionMutation,
} from '@/services/encounterApi';
import type { Encounter, EncounterRegion, PlacedRegion, Point } from '@/types/domain';
import type { Command } from '@/utils/commands';
import { CreateRegionCommand, EditRegionCommand } from '@/utils/commands/regionCommands';
import { getDomIdByIndex, removeEntityMapping } from '@/utils/encounterEntityMapping';
import { hydratePlacedRegions } from '@/utils/encounterMappers';
import {
  filterEncounterForMergeDetection,
  removeRegionOptimistic,
  syncRegionIndices,
  updateRegionOptimistic,
} from '@/utils/encounterStateUtils';
import type { GridConfig } from '@/utils/gridCalculator';
import { useClipRegions } from './useClipRegions';
import { useMergeRegions } from './useMergeRegions';

interface UseRegionHandlersProps {
  encounterId: string | undefined;
  encounter: Encounter | null;
  regionTransaction: ReturnType<typeof import('@/hooks/useRegionTransaction').useRegionTransaction>;
  gridConfig?: GridConfig;
  selectedRegionIndex: number | null;
  editingRegionIndex: number | null;
  originalRegionVertices: Point[] | null;
  drawingMode: 'region' | 'wall' | 'bucketFill' | null;
  drawingRegionIndex: number | null;

  addEncounterRegion: ReturnType<typeof useAddEncounterRegionMutation>[0];
  updateEncounterRegion: ReturnType<typeof useUpdateEncounterRegionMutation>[0];
  removeEncounterRegion: ReturnType<typeof useRemoveEncounterRegionMutation>[0];

  setEncounter: (encounter: Encounter) => void;
  setPlacedRegions: (regions: PlacedRegion[]) => void;
  setSelectedRegionIndex: (index: number | null) => void;
  setEditingRegionIndex: (index: number | null) => void;
  setIsEditingRegionVertices: (editing: boolean) => void;
  setOriginalRegionVertices: (vertices: Point[] | null) => void;
  setDrawingRegionIndex: (index: number | null) => void;
  setRegionPlacementMode: (mode: 'polygon' | 'bucketFill' | null) => void;
  setErrorMessage: (message: string | null) => void;

  recordAction: (command: Command) => void;
  refetch: () => Promise<{ data?: Encounter }>;
}

export const useRegionHandlers = ({
  encounterId,
  encounter,
  regionTransaction,
  gridConfig: _gridConfig,
  selectedRegionIndex,
  editingRegionIndex,
  originalRegionVertices,
  drawingMode,
  drawingRegionIndex,
  addEncounterRegion,
  updateEncounterRegion,
  removeEncounterRegion,
  setEncounter,
  setPlacedRegions,
  setSelectedRegionIndex,
  setEditingRegionIndex,
  setIsEditingRegionVertices,
  setOriginalRegionVertices,
  setDrawingRegionIndex,
  setRegionPlacementMode,
  setErrorMessage,
  recordAction,
  refetch,
}: UseRegionHandlersProps) => {
  const { executeMerge } = useMergeRegions({
    encounterId,
    encounter,
    addEncounterRegion,
    updateEncounterRegion,
    removeEncounterRegion,
    setEncounter,
    setErrorMessage,
    recordAction,
    refetch,
  });

  const { executeClip } = useClipRegions({
    encounterId,
    encounter,
    addEncounterRegion,
    updateEncounterRegion,
    removeEncounterRegion,
    setEncounter,
    setErrorMessage,
    recordAction,
    refetch,
  });

  const handleRegionDelete = useCallback(
    async (regionIndex: number) => {
      if (!encounterId || !encounter) return;

      const region = encounter.regions?.find((r) => r.index === regionIndex);
      if (!region) return;

      const regionId = getDomIdByIndex(encounterId, 'regions', regionIndex);
      if (!regionId) return;

      try {
        await removeEncounterRegion({ encounterId, regionIndex }).unwrap();

        removeEntityMapping(encounterId, 'regions', regionId);

        const { data: updatedEncounter } = await refetch();
        if (updatedEncounter) {
          setEncounter(updatedEncounter);

          const hydratedRegions = hydratePlacedRegions(updatedEncounter.regions, encounterId);
          setPlacedRegions(hydratedRegions);
        }

        if (selectedRegionIndex === regionIndex) {
          setSelectedRegionIndex(null);
        }
      } catch (_error) {
        console.error('[useRegionHandlers] Failed to delete region');
      }
    },
    [
      encounterId,
      encounter,
      removeEncounterRegion,
      refetch,
      setEncounter,
      setPlacedRegions,
      selectedRegionIndex,
      setSelectedRegionIndex,
    ],
  );

  const handleCancelEditingRegion = useCallback(async () => {
    if (!encounter || editingRegionIndex === null) return;

    const originalRegion = regionTransaction.transaction.originalRegion;

    regionTransaction.rollbackTransaction();

    if (originalRegion && originalRegionVertices) {
      const revertedEncounter = updateRegionOptimistic(encounter, editingRegionIndex, {
        vertices: originalRegionVertices,
      });
      setEncounter(revertedEncounter);
    }

    setEditingRegionIndex(null);
    setSelectedRegionIndex(null);
    setIsEditingRegionVertices(false);
    setOriginalRegionVertices(null);
  }, [
    encounter,
    editingRegionIndex,
    originalRegionVertices,
    regionTransaction,
    setEncounter,
    setEditingRegionIndex,
    setSelectedRegionIndex,
    setIsEditingRegionVertices,
    setOriginalRegionVertices,
  ]);

  const handleFinishEditingRegion = useCallback(async () => {
    if (!encounterId || !encounter || editingRegionIndex === null) return;

    const encounterForCommit = filterEncounterForMergeDetection(encounter, {
      excludeRegionIndex: editingRegionIndex,
    });

    const result = await regionTransaction.commitTransaction(
      encounterId,
      { addEncounterRegion, updateEncounterRegion },
      encounterForCommit || undefined,
    );

    if (result.action === 'merge') {
      let originalTargetRegion = result.originalRegions?.find((r) => r.index === result.targetRegionIndex);

      if (editingRegionIndex !== null && result.targetRegionIndex === editingRegionIndex) {
        originalTargetRegion = regionTransaction.transaction.originalRegion ?? originalTargetRegion;
      }

      if (!originalTargetRegion) {
        setErrorMessage('Original target region not found');
        regionTransaction.rollbackTransaction();
        setEditingRegionIndex(null);
        setSelectedRegionIndex(null);
        setIsEditingRegionVertices(false);
        setOriginalRegionVertices(null);
        return;
      }

      await executeMerge({
        targetRegionIndex: result.targetRegionIndex ?? 0,
        originalTargetRegion,
        mergedVertices: result.mergedVertices ?? [],
        regionsToDelete: result.regionsToDelete || [],
        editingRegionIndex,
        originalEditedRegion: regionTransaction.transaction.originalRegion,
        onSuccess: () => {
          regionTransaction.clearTransaction();
          setEditingRegionIndex(null);
          setSelectedRegionIndex(null);
          setIsEditingRegionVertices(false);
          setOriginalRegionVertices(null);
        },
        onError: () => {
          regionTransaction.rollbackTransaction();
          setEditingRegionIndex(null);
          setSelectedRegionIndex(null);
          setIsEditingRegionVertices(false);
          setOriginalRegionVertices(null);
        },
      });
      return;
    }

    if (result.action === 'clip' && result.clipResults) {
      const segment = regionTransaction.transaction.segment;
      if (!segment) {
        setErrorMessage('No segment found for clip operation');
        regionTransaction.rollbackTransaction();
        setEditingRegionIndex(null);
        setSelectedRegionIndex(null);
        setIsEditingRegionVertices(false);
        setOriginalRegionVertices(null);
        return;
      }

      await executeClip({
        clipResults: result.clipResults,
        clipperVertices: segment.vertices,
        onSuccess: async () => {
          const originalRegion = regionTransaction.transaction.originalRegion;
          if (originalRegion && segment) {
            const newRegion: EncounterRegion = {
              encounterId: encounter?.id,
              index: editingRegionIndex,
              name: segment.name,
              vertices: segment.vertices,
              type: segment.type,
              ...(segment.value !== undefined && { value: segment.value }),
              ...(segment.label !== undefined && { label: segment.label }),
              ...(segment.color !== undefined && { color: segment.color }),
            };

            try {
              await updateEncounterRegion({
                encounterId,
                regionIndex: editingRegionIndex,
                name: segment.name,
                vertices: segment.vertices,
                type: segment.type,
                ...(segment.value !== undefined && { value: segment.value }),
                ...(segment.label !== undefined && { label: segment.label }),
                ...(segment.color !== undefined && { color: segment.color }),
              }).unwrap();

              const command = new EditRegionCommand({
                encounterId,
                regionIndex: editingRegionIndex,
                oldRegion: originalRegion,
                newRegion: newRegion,
                onUpdate: async (encounterId, regionIndex, updates) => {
                  await updateEncounterRegion({
                    encounterId,
                    regionIndex,
                    ...updates,
                  }).unwrap();
                },
                onRefetch: async () => {
                  const { data } = await refetch();
                  if (data) setEncounter(data);
                },
              });
              recordAction(command);
            } catch (error) {
              console.error('Failed to update edited region after clip:', error);
            }
          }

          regionTransaction.clearTransaction();
          setEditingRegionIndex(null);
          setSelectedRegionIndex(null);
          setIsEditingRegionVertices(false);
          setOriginalRegionVertices(null);
        },
        onError: () => {
          regionTransaction.rollbackTransaction();
          if (originalRegionVertices && editingRegionIndex !== null) {
            const revertedEncounter = updateRegionOptimistic(encounter, editingRegionIndex, {
              vertices: originalRegionVertices,
            });
            setEncounter(revertedEncounter);
          }
          setEditingRegionIndex(null);
          setSelectedRegionIndex(null);
          setIsEditingRegionVertices(false);
          setOriginalRegionVertices(null);
        },
      });
      return;
    }

    if (result.action === 'nullClip') {
      const segment = regionTransaction.transaction.segment;
      if (result.clipResults && result.clipResults.length > 0 && segment) {
        await executeClip({
          clipResults: result.clipResults,
          clipperVertices: segment.vertices,
          onSuccess: () => {
            regionTransaction.clearTransaction();
            setEditingRegionIndex(null);
            setSelectedRegionIndex(null);
            setIsEditingRegionVertices(false);
            setOriginalRegionVertices(null);
          },
          onError: () => {
            regionTransaction.rollbackTransaction();
            if (originalRegionVertices && editingRegionIndex !== null) {
              const revertedEncounter = updateRegionOptimistic(encounter, editingRegionIndex, {
                vertices: originalRegionVertices,
              });
              setEncounter(revertedEncounter);
            }
            setEditingRegionIndex(null);
            setSelectedRegionIndex(null);
            setIsEditingRegionVertices(false);
            setOriginalRegionVertices(null);
          },
        });
      } else {
        regionTransaction.clearTransaction();
        setEditingRegionIndex(null);
        setSelectedRegionIndex(null);
        setIsEditingRegionVertices(false);
        setOriginalRegionVertices(null);
      }
      return;
    }

    if (result.success && result.regionIndex !== undefined) {
      const originalRegion = regionTransaction.transaction.originalRegion;
      const segment = regionTransaction.transaction.segment;

      if (originalRegion && segment) {
        const newRegion: EncounterRegion = {
          encounterId: encounter?.id,
          index: editingRegionIndex,
          name: segment.name,
          vertices: segment.vertices,
          type: segment.type,
          ...(segment.value !== undefined && { value: segment.value }),
          ...(segment.label !== undefined && { label: segment.label }),
          ...(segment.color !== undefined && { color: segment.color }),
        };

        const command = new EditRegionCommand({
          encounterId,
          regionIndex: editingRegionIndex,
          oldRegion: originalRegion,
          newRegion: newRegion,
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
        });

        recordAction(command);
      }

      // Update encounter state with the edited vertices before hiding the transformer
      // This prevents a flash of the old region while waiting for the API cache to update
      if (segment && editingRegionIndex !== null && encounterId) {
        const updatedEncounter = updateRegionOptimistic(encounter, editingRegionIndex, {
          vertices: segment.vertices,
          name: segment.name,
          type: segment.type,
          ...(segment.value !== undefined && { value: segment.value }),
          ...(segment.label !== undefined && { label: segment.label }),
        });
        setEncounter(updatedEncounter);

        const hydratedRegions = hydratePlacedRegions(updatedEncounter.regions, encounterId);
        setPlacedRegions(hydratedRegions);
      }

      regionTransaction.clearTransaction();

      setEditingRegionIndex(null);
      setSelectedRegionIndex(null);
      setIsEditingRegionVertices(false);
      setOriginalRegionVertices(null);
    } else {
      setErrorMessage('Failed to update region. Please try again.');
      regionTransaction.rollbackTransaction();

      if (originalRegionVertices && editingRegionIndex !== null) {
        const revertedEncounter = updateRegionOptimistic(encounter, editingRegionIndex, {
          vertices: originalRegionVertices,
        });
        setEncounter(revertedEncounter);
      }

      setEditingRegionIndex(null);
      setSelectedRegionIndex(null);
      setIsEditingRegionVertices(false);
      setOriginalRegionVertices(null);
    }
  }, [
    encounterId,
    encounter,
    editingRegionIndex,
    originalRegionVertices,
    regionTransaction,
    addEncounterRegion,
    updateEncounterRegion,
    setEncounter,
    setPlacedRegions,
    setEditingRegionIndex,
    setSelectedRegionIndex,
    setIsEditingRegionVertices,
    setOriginalRegionVertices,
    setErrorMessage,
    executeClip,
    executeMerge,
    recordAction,
    refetch,
  ]);

  const handleStructurePlacementFinish = useCallback(async () => {
    try {
      if (!encounterId || !encounter) return;

      if ((drawingMode !== 'region' && drawingMode !== 'bucketFill') || drawingRegionIndex === null) return;

      const encounterForCommit = filterEncounterForMergeDetection(encounter);

      const result = await regionTransaction.commitTransaction(
        encounterId,
        { addEncounterRegion, updateEncounterRegion },
        encounterForCommit || undefined,
      );

      if (result.action === 'merge') {
        const originalTargetRegion = result.originalRegions?.find((r) => r.index === result.targetRegionIndex);
        if (!originalTargetRegion) {
          setErrorMessage('Original target region not found');
          regionTransaction.rollbackTransaction();
          setDrawingRegionIndex(null);
          return;
        }

        await executeMerge({
          targetRegionIndex: result.targetRegionIndex ?? 0,
          originalTargetRegion,
          mergedVertices: result.mergedVertices ?? [],
          regionsToDelete: result.regionsToDelete || [],
          editingRegionIndex: null,
          originalEditedRegion: null,
          onSuccess: () => {
            regionTransaction.clearTransaction();
            setDrawingRegionIndex(null);
          },
          onError: () => {
            regionTransaction.rollbackTransaction();
            setDrawingRegionIndex(null);
          },
        });
        return;
      }

      if (result.action === 'clip' && result.clipResults) {
        const segment = regionTransaction.transaction.segment;
        if (!segment) {
          setErrorMessage('No segment found for clip operation');
          regionTransaction.rollbackTransaction();
          setDrawingRegionIndex(null);
          return;
        }

        await executeClip({
          clipResults: result.clipResults,
          clipperVertices: segment.vertices,
          onSuccess: async () => {
            const newRegionData = {
              encounterId,
              name: segment.name,
              type: segment.type,
              vertices: segment.vertices,
              ...(segment.value !== undefined && { value: segment.value }),
              ...(segment.label !== undefined && { label: segment.label }),
              ...(segment.color !== undefined && { color: segment.color }),
            };

            try {
              const createdResult = await addEncounterRegion(newRegionData).unwrap();

              const command = new CreateRegionCommand({
                encounterId,
                region: {
                  ...newRegionData,
                  index: createdResult.index,
                },
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
              });
              recordAction(command);
            } catch (error) {
              console.error('Failed to create new region after clip:', error);
            }

            regionTransaction.clearTransaction();
            setDrawingRegionIndex(null);
          },
          onError: () => {
            regionTransaction.rollbackTransaction();
            const cleanEncounter = removeRegionOptimistic(encounter, -1);
            setEncounter(cleanEncounter);
            setDrawingRegionIndex(null);
          },
        });
        return;
      }

      if (result.action === 'nullClip') {
        const segment = regionTransaction.transaction.segment;

        const cleanEncounter = removeRegionOptimistic(encounter, -1);
        setEncounter(cleanEncounter);

        if (result.clipResults && result.clipResults.length > 0 && segment) {
          await executeClip({
            clipResults: result.clipResults,
            clipperVertices: segment.vertices,
            onSuccess: () => {
              regionTransaction.clearTransaction();
              setDrawingRegionIndex(null);
            },
            onError: () => {
              regionTransaction.rollbackTransaction();
              setDrawingRegionIndex(null);
            },
          });
        } else {
          regionTransaction.clearTransaction();
          setDrawingRegionIndex(null);
        }
        return;
      }

      if (result.success && result.regionIndex !== undefined) {
        const tempToReal = new Map<number, number>();
        tempToReal.set(-1, result.regionIndex);

        const syncedEncounter = syncRegionIndices(encounter, tempToReal);
        setEncounter(syncedEncounter);

        const createdRegion = syncedEncounter.regions?.find((r) => r.index === result.regionIndex);
        if (createdRegion) {
          const command = new CreateRegionCommand({
            encounterId,
            region: createdRegion,
            onCreate: async (encounterId, regionData) => {
              try {
                const result = await addEncounterRegion({
                  encounterId,
                  ...regionData,
                }).unwrap();
                return result;
              } catch (error) {
                console.error('Failed to recreate region:', error);
                setErrorMessage('Failed to recreate region. Please try again.');
                throw error;
              }
            },
            onRemove: async (encounterId, regionIndex) => {
              try {
                await removeEncounterRegion({
                  encounterId,
                  regionIndex,
                }).unwrap();
              } catch (error) {
                console.error('Failed to remove region:', error);
                setErrorMessage('Failed to remove region. Please try again.');
                throw error;
              }
            },
            onRefetch: async () => {
              const { data } = await refetch();
              if (data) setEncounter(data);
            },
          });
          recordAction(command);
        }

        regionTransaction.clearTransaction();
      } else {
        regionTransaction.rollbackTransaction();
        const cleanEncounter = removeRegionOptimistic(encounter, -1);
        setEncounter(cleanEncounter);
        setErrorMessage('Failed to place region. Please try again.');
      }

      setDrawingRegionIndex(null);
    } catch (error) {
      console.error('Failed to process region placement:', error);
      setErrorMessage('Failed to process region placement. Please try again.');
      setDrawingRegionIndex(null);
    }
  }, [
    encounterId,
    encounter,
    drawingMode,
    drawingRegionIndex,
    regionTransaction,
    addEncounterRegion,
    updateEncounterRegion,
    removeEncounterRegion,
    setEncounter,
    setDrawingRegionIndex,
    setErrorMessage,
    executeClip,
    executeMerge,
    recordAction,
    refetch,
  ]);

  const handlePlaceRegion = useCallback(
    (properties: { name: string; type: string; value?: number; label?: string; color?: string }) => {
      setEditingRegionIndex(null);
      setIsEditingRegionVertices(false);
      setOriginalRegionVertices(null);
      setDrawingRegionIndex(-1);
      setSelectedRegionIndex(null);
      setRegionPlacementMode('polygon');

      regionTransaction.startTransaction('placement', undefined, properties);

      if (encounter) {
        const tempRegion: EncounterRegion = {
          encounterId: encounter.id,
          index: -1,
          name: properties.name,
          vertices: [],
          type: properties.type,
          ...(properties.value !== undefined && { value: properties.value }),
          ...(properties.label !== undefined && { label: properties.label }),
          color: properties.color || '#808080',
        };

        const updatedEncounter = {
          ...encounter,
          regions: [...(encounter.regions || []), tempRegion],
        };
        setEncounter(updatedEncounter);
      }
    },
    [
      encounter,
      setEditingRegionIndex,
      setIsEditingRegionVertices,
      setOriginalRegionVertices,
      setDrawingRegionIndex,
      setSelectedRegionIndex,
      setRegionPlacementMode,
      regionTransaction,
      setEncounter,
    ],
  );

  const handleBucketFillRegion = useCallback(
    (properties: { name: string; type: string; value?: number; label?: string; color?: string }) => {
      setEditingRegionIndex(null);
      setIsEditingRegionVertices(false);
      setOriginalRegionVertices(null);
      setDrawingRegionIndex(-1);
      setSelectedRegionIndex(null);
      setRegionPlacementMode('bucketFill');

      regionTransaction.startTransaction('placement', undefined, properties);

      if (encounter) {
        const tempRegion: EncounterRegion = {
          encounterId: encounter.id,
          index: -1,
          name: properties.name,
          vertices: [],
          type: properties.type,
          ...(properties.value !== undefined && { value: properties.value }),
          ...(properties.label !== undefined && { label: properties.label }),
          color: properties.color || '#808080',
        };

        const updatedEncounter = {
          ...encounter,
          regions: [...(encounter.regions || []), tempRegion],
        };
        setEncounter(updatedEncounter);
      }
    },
    [
      encounter,
      setEditingRegionIndex,
      setIsEditingRegionVertices,
      setOriginalRegionVertices,
      setDrawingRegionIndex,
      setSelectedRegionIndex,
      setRegionPlacementMode,
      regionTransaction,
      setEncounter,
    ],
  );

  const handleBucketFillFinish = useCallback(
    async (vertices: Point[]) => {
      try {
        if (!encounterId || !encounter) return;

        if (drawingRegionIndex === null) return;

        const segment = regionTransaction.transaction.segment;
        if (!segment) {
          setErrorMessage('No region properties found');
          return;
        }

        const result = await addEncounterRegion({
          encounterId,
          name: segment.name,
          type: segment.type,
          vertices: vertices,
          ...(segment.value !== undefined && { value: segment.value }),
          ...(segment.label !== undefined && { label: segment.label }),
          ...(segment.color !== undefined && { color: segment.color }),
        }).unwrap();

        const { data: updatedEncounter } = await refetch();
        if (updatedEncounter) {
          setEncounter(updatedEncounter);

          const createdRegion = updatedEncounter.regions?.find((r) => r.index === result.index);
          if (createdRegion) {
            const command = new CreateRegionCommand({
              encounterId,
              region: createdRegion,
              onCreate: async (encounterId, regionData) => {
                try {
                  const result = await addEncounterRegion({
                    encounterId,
                    ...regionData,
                  }).unwrap();
                  return result;
                } catch (error) {
                  console.error('Failed to recreate region:', error);
                  setErrorMessage('Failed to recreate region. Please try again.');
                  throw error;
                }
              },
              onRemove: async (encounterId, regionIndex) => {
                try {
                  await removeEncounterRegion({
                    encounterId,
                    regionIndex,
                  }).unwrap();
                } catch (error) {
                  console.error('Failed to remove region:', error);
                  setErrorMessage('Failed to remove region. Please try again.');
                  throw error;
                }
              },
              onRefetch: async () => {
                const { data } = await refetch();
                if (data) setEncounter(data);
              },
            });
            recordAction(command);
          }

          regionTransaction.clearTransaction();
        } else {
          setErrorMessage('Failed to refresh encounter. Please reload.');
        }

        setDrawingRegionIndex(null);
      } catch (error) {
        console.error('[useRegionHandlers] Failed to process bucket fill:', error);
        setErrorMessage('Failed to process bucket fill. Please try again.');
        setDrawingRegionIndex(null);
      }
    },
    [
      encounterId,
      encounter,
      drawingRegionIndex,
      regionTransaction,
      addEncounterRegion,
      removeEncounterRegion,
      setEncounter,
      setDrawingRegionIndex,
      setErrorMessage,
      recordAction,
      refetch,
    ],
  );

  const handleRegionSelect = useCallback(
    (regionIndex: number | null) => {
      setSelectedRegionIndex(regionIndex);
    },
    [setSelectedRegionIndex],
  );

  const handleEditRegionVertices = useCallback(
    (regionIndex: number) => {
      const region = encounter?.regions?.find((r) => r.index === regionIndex);
      if (!region) {
        return;
      }

      setDrawingRegionIndex(null);
      setOriginalRegionVertices([...region.vertices]);
      setEditingRegionIndex(regionIndex);
      setIsEditingRegionVertices(true);
      setSelectedRegionIndex(regionIndex);

      regionTransaction.startTransaction('editing', region);
    },
    [
      encounter,
      setDrawingRegionIndex,
      setOriginalRegionVertices,
      setEditingRegionIndex,
      setIsEditingRegionVertices,
      setSelectedRegionIndex,
      regionTransaction,
    ],
  );

  const handleRegionPropertyUpdate = useCallback(
    async (regionIndex: number, updates: Partial<EncounterRegion>) => {
      if (!encounterId || !encounter) return;

      const region = encounter.regions?.find((r) => r.index === regionIndex);
      if (!region) return;

      try {
        const updatedEncounter = updateRegionOptimistic(encounter, regionIndex, updates);
        setEncounter(updatedEncounter);

        await updateEncounterRegion({
          encounterId,
          regionIndex,
          ...updates,
        }).unwrap();
      } catch (error) {
        console.error('[useRegionHandlers] Failed to update region:', error);
        await refetch();
      }
    },
    [encounterId, encounter, setEncounter, updateEncounterRegion, refetch],
  );

  const handleSwitchToRegion = useCallback(
    async (newRegionIndex: number) => {
      if (!encounterId || !encounter) return;

      if (regionTransaction.transaction.isActive) {
        const encounterForCommit = filterEncounterForMergeDetection(encounter,
          editingRegionIndex !== null && editingRegionIndex !== undefined
            ? { excludeRegionIndex: editingRegionIndex }
            : {}
        );

        await regionTransaction.commitTransaction(
          encounterId,
          { addEncounterRegion, updateEncounterRegion },
          encounterForCommit || undefined,
        );
      }

      setEditingRegionIndex(null);
      setSelectedRegionIndex(null);
      setIsEditingRegionVertices(false);
      setOriginalRegionVertices(null);

      const { data: refreshedEncounter } = await refetch();
      if (!refreshedEncounter) return;

      const newRegion = refreshedEncounter.regions?.find((r) => r.index === newRegionIndex);
      if (!newRegion) return;

      setDrawingRegionIndex(null);
      setOriginalRegionVertices([...newRegion.vertices]);
      setEditingRegionIndex(newRegionIndex);
      setIsEditingRegionVertices(true);
      setSelectedRegionIndex(newRegionIndex);

      regionTransaction.startTransaction('editing', newRegion);
    },
    [
      encounterId,
      encounter,
      editingRegionIndex,
      regionTransaction,
      addEncounterRegion,
      updateEncounterRegion,
      refetch,
      setDrawingRegionIndex,
      setOriginalRegionVertices,
      setEditingRegionIndex,
      setIsEditingRegionVertices,
      setSelectedRegionIndex,
    ],
  );

  return {
    handleRegionDelete,
    handleCancelEditingRegion,
    handleFinishEditingRegion,
    handleStructurePlacementFinish,
    handlePlaceRegion,
    handleBucketFillRegion,
    handleBucketFillFinish,
    handleRegionSelect,
    handleEditRegionVertices,
    handleRegionPropertyUpdate,
    handleSwitchToRegion,
  };
};
