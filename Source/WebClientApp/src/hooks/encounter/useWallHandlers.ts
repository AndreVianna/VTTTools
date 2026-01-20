import type { WallBreakData } from '@components/encounter/editing/WallTransformer';
import { useCallback } from 'react';
import type { UseWallTransactionReturn } from '@/hooks/useWallTransaction';
import type { Encounter, EncounterWall, EncounterWallSegment, PlacedWall, Pole } from '@/types/domain';
import type { CreateWallRequest, UpdateWallRequest, StageWall, StageWallSegment } from '@/types/stage';
import { createBreakWallAction } from '@/types/wallUndoActions';
import type { Command } from '@/utils/commands';
import { BreakWallCommand, EditWallCommand } from '@/utils/commands/wallCommands';
import { getDomIdByIndex, removeEntityMapping } from '@/utils/encounterEntityMapping';
import { hydratePlacedWalls } from '@/utils/encounterMappers';
import { removeWallOptimistic, syncWallIndices, updateWallOptimistic } from '@/utils/encounterStateUtils';
import { polesToSegments } from '@/utils/wallUtils';
import { segmentsToPoles } from '@/utils/wallSegmentUtils';

/**
 * Extended update request that includes segments (for full wall updates)
 */
export interface UpdateWallWithSegmentsRequest extends UpdateWallRequest {
  segments?: StageWallSegment[];
}

/**
 * Wall mutation functions from Stage API (passed from useEncounterEditor)
 */
export interface WallMutations {
  addWall: (data: CreateWallRequest) => Promise<StageWall>;
  updateWall: (index: number, data: UpdateWallRequest) => Promise<void>;
  deleteWall: (index: number) => Promise<void>;
  /** Optional: Full wall update including segments (for segment-level updates) */
  updateWallWithSegments?: (index: number, data: UpdateWallWithSegmentsRequest) => Promise<void>;
}

interface UseWallHandlersProps {
  encounterId: string | undefined;
  encounter: Encounter | null;
  wallTransaction: UseWallTransactionReturn;
  selectedWallIndex: number | null;
  drawingMode: 'wall' | 'region' | 'bucketFill' | null;
  drawingWallIndex: number | null;

  // Stage API mutation functions (from useEncounterEditor)
  wallMutations: WallMutations;

  setEncounter: (encounter: Encounter) => void;
  setPlacedWalls: (walls: PlacedWall[]) => void;
  setSelectedWallIndex: (index: number | null) => void;
  setSelectedOpeningIndex: (index: number | null) => void;
  setDrawingWallIndex: (index: number | null) => void;
  setIsEditingVertices: (editing: boolean) => void;
  setOriginalWallPoles: (poles: Pole[] | null) => void;
  setPreviewWallPoles: (poles: Pole[] | null) => void;
  setActivePanel: (panel: string | null) => void;
  setErrorMessage: (message: string | null) => void;

  execute: (command: Command) => void | Promise<void>;
  refetch: () => Promise<{ data?: Encounter }>;
}

export const useWallHandlers = ({
  encounterId,
  encounter,
  wallTransaction,
  selectedWallIndex,
  drawingMode,
  drawingWallIndex,
  wallMutations,
  setEncounter,
  setPlacedWalls,
  setSelectedWallIndex,
  setSelectedOpeningIndex,
  setDrawingWallIndex,
  setIsEditingVertices,
  setOriginalWallPoles,
  setPreviewWallPoles,
  setActivePanel,
  setErrorMessage,
  execute,
  refetch,
}: UseWallHandlersProps) => {
  const { addWall, updateWall, deleteWall, updateWallWithSegments } = wallMutations;
  const handleWallDelete = useCallback(
    async (wallIndex: number) => {
      if (!encounterId || !encounter) {
        return;
      }

      const domId = getDomIdByIndex(encounterId, 'walls', wallIndex);

      try {
        await deleteWall(wallIndex);

        if (domId) {
          removeEntityMapping(encounterId, 'walls', domId);
        }

        const { data: updatedEncounter } = await refetch();
        if (updatedEncounter) {
          setEncounter(updatedEncounter);
        }

        if (selectedWallIndex === wallIndex) {
          setSelectedWallIndex(null);
          setIsEditingVertices(false);
          setOriginalWallPoles(null);
          setPreviewWallPoles(null);
          wallTransaction.rollbackTransaction();
        } else {
          setSelectedWallIndex(null);
        }
      } catch (error) {
        console.error('Failed to remove wall:', error);
        setErrorMessage('Failed to remove wall. Please try again.');
      }
    },
    [
      encounterId,
      encounter,
      deleteWall,
      refetch,
      setEncounter,
      setSelectedWallIndex,
      setIsEditingVertices,
      setOriginalWallPoles,
      setPreviewWallPoles,
      wallTransaction,
      setErrorMessage,
      selectedWallIndex,
    ],
  );

  const handleEditVertices = useCallback(
    (wallIndex: number) => {
      const wall = encounter?.stage.walls?.find((w) => w.index === wallIndex);
      if (!wall) return;

      const poles = segmentsToPoles(wall);
      setOriginalWallPoles([...poles]);

      wallTransaction.startTransaction('editing', wall);

      setSelectedWallIndex(wallIndex);
      setSelectedOpeningIndex(null);
      setIsEditingVertices(true);
      setActivePanel(null);
    },
    [encounter, wallTransaction, setOriginalWallPoles, setSelectedWallIndex, setSelectedOpeningIndex, setIsEditingVertices, setActivePanel],
  );

  const handleCancelEditing = useCallback(async () => {
    if (!encounter || selectedWallIndex === null) return;

    const segments = wallTransaction.getActiveSegments();
    const originalWall = wallTransaction.transaction.originalWall;

    wallTransaction.rollbackTransaction();

    let cleanedEncounter = encounter;

    segments.forEach((segment) => {
      if (segment.wallIndex === null) {
        cleanedEncounter = removeWallOptimistic(cleanedEncounter, segment.tempId);
      }
    });

    if (originalWall) {
      cleanedEncounter = updateWallOptimistic(cleanedEncounter, selectedWallIndex, {
        segments: originalWall.segments,
        name: originalWall.name,
      });
    }

    setEncounter(cleanedEncounter);
    setSelectedWallIndex(null);
    setIsEditingVertices(false);
    setOriginalWallPoles(null);
    setPreviewWallPoles(null);
  }, [
    encounter,
    selectedWallIndex,
    wallTransaction,
    setEncounter,
    setSelectedWallIndex,
    setIsEditingVertices,
    setOriginalWallPoles,
    setPreviewWallPoles,
  ]);

  const handleFinishEditing = useCallback(async () => {
    if (!encounterId || !encounter || selectedWallIndex === null) return;

    const activeSegments = wallTransaction.getActiveSegments();

    const editedSegment = activeSegments[0];

    if (editedSegment && editedSegment.segments.length >= 1) {
      const updatedEncounter = updateWallOptimistic(encounter, selectedWallIndex, {
        segments: editedSegment.segments,
      });
      setEncounter(updatedEncounter);
      const hydratedWalls = hydratePlacedWalls(updatedEncounter.stage.walls || [], encounterId);
      setPlacedWalls(hydratedWalls);
    }

    const result = await wallTransaction.commitTransaction(encounterId, wallMutations);

    if (result.success) {
      const originalWall = wallTransaction.transaction.originalWall;
      if (!originalWall) {
        setTimeout(() => {
          setSelectedWallIndex(null);
          setIsEditingVertices(false);
          setOriginalWallPoles(null);
          setPreviewWallPoles(null);
        }, 0);
        return;
      }

      const { data: updatedEncounter } = await refetch();
      if (updatedEncounter) {
        const hydratedWalls = hydratePlacedWalls(updatedEncounter.stage.walls || [], encounterId);
        setEncounter(updatedEncounter);
        setPlacedWalls(hydratedWalls);

        if (result.segmentResults.length > 1) {
          const newWalls: EncounterWall[] = [];
          result.segmentResults.forEach((r) => {
            if (r.wallIndex !== undefined) {
              const wall = updatedEncounter.stage.walls?.find((w) => w.index === r.wallIndex);
              if (wall) newWalls.push(wall);
            }
          });

          if (newWalls.length === 0) {
            console.error('Wall break succeeded but no segments found');
            setErrorMessage('Wall break failed. Please try again.');
            return;
          }

          const command = new BreakWallCommand({
            encounterId,
            originalWallIndex: selectedWallIndex,
            originalWall,
            newWalls,
            onAdd: async (_encounterId: string, wallData: Omit<EncounterWall, 'index' | 'encounterId'>) => {
              const result = await addWall({
                name: wallData.name,
                segments: wallData.segments,
              });
              // Convert StageWall to EncounterWall format for the command
              return { ...wallData, index: result.index } as EncounterWall;
            },
            onUpdate: async (_encounterId: string, wallIndex: number, updates: Partial<EncounterWall>) => {
              await updateWall(wallIndex, {
                name: updates.name,
              });
            },
            onRemove: async (_encounterId: string, wallIndex: number) => {
              await deleteWall(wallIndex);
            },
            onRefetch: async () => {
              const { data } = await refetch();
              if (data) {
                const hydratedWalls = hydratePlacedWalls(data.stage.walls || [], encounterId);
                setEncounter(data);
                setPlacedWalls(hydratedWalls);
              }
            },
          });
          await execute(command);
        } else if (result.segmentResults[0]?.wallIndex !== undefined) {
          const segmentResult = result.segmentResults[0];
          const wallIndex = segmentResult.wallIndex ?? 0;
          const updatedWall = updatedEncounter.stage.walls?.find((w) => w.index === wallIndex);
          if (updatedWall) {
            const command = new EditWallCommand({
              encounterId,
              wallIndex,
              oldWall: originalWall,
              newWall: updatedWall,
              onUpdate: async (_encounterId, wallIndex, updates) => {
                try {
                  await updateWall(wallIndex, {
                    name: updates.name,
                  });
                } catch (error) {
                  console.error('Failed to update wall:', error);
                  throw error;
                }
              },
              onRefetch: async () => {
                const { data } = await refetch();
                if (data) {
                  const hydratedWalls = hydratePlacedWalls(data.stage.walls || [], encounterId);
                  setEncounter(data);
                  setPlacedWalls(hydratedWalls);
                }
              },
            });
            await execute(command);
          }
        }
      }

      setTimeout(() => {
        setSelectedWallIndex(null);
        setIsEditingVertices(false);
        setOriginalWallPoles(null);
        setPreviewWallPoles(null);
      }, 0);
    } else {
      setErrorMessage('Failed to save wall changes. Please try again.');
    }
  }, [
    encounterId,
    encounter,
    selectedWallIndex,
    wallTransaction,
    wallMutations,
    addWall,
    updateWall,
    deleteWall,
    refetch,
    setEncounter,
    setPlacedWalls,
    setSelectedWallIndex,
    setIsEditingVertices,
    setOriginalWallPoles,
    setPreviewWallPoles,
    setErrorMessage,
    execute,
  ]);

  const handleWallBreak = useCallback(
    async (breakData: WallBreakData) => {
      if (!encounter) return;

      const activeSegments = wallTransaction.getActiveSegments();
      const breakingSegment = activeSegments.find((s) => s.segments.length > 0);
      if (!breakingSegment) return;

      const { breakPoleIndex, newWallPoles, originalWallPoles } = breakData;

      const segment1Poles = newWallPoles.slice(0, breakPoleIndex + 1);
      const segment2Poles = newWallPoles.slice(breakPoleIndex);

      const isOriginalClosed = originalWallPoles.length > 1 &&
        originalWallPoles[0]?.x === originalWallPoles[originalWallPoles.length - 1]?.x &&
        originalWallPoles[0]?.y === originalWallPoles[originalWallPoles.length - 1]?.y;

      const originalSegments = polesToSegments(originalWallPoles, isOriginalClosed);
      const segment1Segments = polesToSegments(segment1Poles, false);
      const segment2Segments = polesToSegments(segment2Poles, false);

      const newSegment1TempId = wallTransaction.addSegment({
        wallIndex: null,
        name: breakingSegment.name,
        segments: segment1Segments,
      });

      const newSegment2TempId = wallTransaction.addSegment({
        wallIndex: null,
        name: breakingSegment.name,
        segments: segment2Segments,
      });

      wallTransaction.removeSegment(breakingSegment.tempId);

      const breakAction = createBreakWallAction(
        breakingSegment.tempId,
        breakPoleIndex,
        originalSegments,
        breakingSegment.wallIndex ?? -1,
        newSegment1TempId,
        newSegment2TempId,
        segment1Segments,
        segment2Segments,
        breakingSegment.name,
        (tempId: number) => wallTransaction.removeSegment(tempId),
        (tempId: number, changes: { wallIndex: number; segments: EncounterWallSegment[] }) =>
          wallTransaction.updateSegment(tempId, changes),
        (segment: { wallIndex: number | null; name: string; segments: EncounterWallSegment[] }) =>
          wallTransaction.addSegment(segment),
      );

      wallTransaction.pushLocalAction(breakAction);
    },
    [encounter, wallTransaction],
  );

  const handleWallSelect = useCallback(
    (wallIndex: number | null) => {
      setSelectedWallIndex(wallIndex);
      setSelectedOpeningIndex(null);
    },
    [setSelectedWallIndex, setSelectedOpeningIndex],
  );

  const handleWallPlacementFinish = useCallback(async () => {
    if (!encounterId || !encounter) return;
    if (drawingMode !== 'wall' || drawingWallIndex === null) return;

    const result = await wallTransaction.commitTransaction(encounterId, wallMutations);

    if (result.success && result.segmentResults.length > 0) {
      const tempToReal = new Map<number, number>();
      result.segmentResults.forEach((r) => {
        if (r.wallIndex !== undefined) {
          tempToReal.set(r.tempId, r.wallIndex);
        }
      });

      const syncedEncounter = syncWallIndices(encounter, tempToReal);

      const hydratedWalls = hydratePlacedWalls(syncedEncounter.stage.walls || [], encounterId);

      setEncounter(syncedEncounter);
      setPlacedWalls(hydratedWalls);
    } else {
      wallTransaction.rollbackTransaction();
      const cleanEncounter = removeWallOptimistic(encounter, -1);
      setEncounter(cleanEncounter);
      setErrorMessage('Failed to place wall. Please try again.');
    }

    setDrawingWallIndex(null);
  }, [
    encounterId,
    encounter,
    drawingMode,
    drawingWallIndex,
    wallTransaction,
    wallMutations,
    setEncounter,
    setPlacedWalls,
    setDrawingWallIndex,
    setErrorMessage,
  ]);

  const handleSegmentUpdate = useCallback(
    async (wallIndex: number, segmentIndex: number, updates: Partial<EncounterWallSegment>) => {
      if (!encounterId || !encounter) return;

      const wall = encounter.stage.walls?.find((w) => w.index === wallIndex);
      if (!wall) {
        console.warn(`[useWallHandlers] Wall ${wallIndex} not found`);
        return;
      }

      if (!wall.segments || wall.segments.length === 0) {
        console.warn(`[useWallHandlers] Wall ${wallIndex} has no segments`);
        return;
      }

      const segmentExists = wall.segments.some((s) => s.index === segmentIndex);
      if (!segmentExists) {
        console.warn(`[useWallHandlers] Segment ${segmentIndex} not found in wall ${wallIndex}`);
        return;
      }

      const updatedSegments = wall.segments.map((s) =>
        s.index === segmentIndex ? { ...s, ...updates } : s,
      );

      const updatedWall = updateWallOptimistic(encounter, wallIndex, { segments: updatedSegments });
      setEncounter(updatedWall);
      const hydratedWalls = hydratePlacedWalls(updatedWall.stage.walls || [], encounterId);
      setPlacedWalls(hydratedWalls);

      try {
        if (updateWallWithSegments) {
          // Use the extended update function if available
          await updateWallWithSegments(wallIndex, {
            segments: updatedSegments as StageWallSegment[],
          });
        } else {
          // Fall back: segment updates not supported without updateWallWithSegments
          console.warn('[useWallHandlers] updateWallWithSegments not provided, segment update may be incomplete');
        }
      } catch (error) {
        console.error('Failed to update segment:', error);
        setErrorMessage('Failed to update segment. Please try again.');
        const { data: refreshedEncounter } = await refetch();
        if (refreshedEncounter) {
          setEncounter(refreshedEncounter);
          const hydratedWalls = hydratePlacedWalls(refreshedEncounter.stage.walls || [], encounterId);
          setPlacedWalls(hydratedWalls);
        }
      }
    },
    [encounterId, encounter, updateWallWithSegments, setEncounter, setPlacedWalls, setErrorMessage, refetch],
  );

  return {
    handleWallDelete,
    handleEditVertices,
    handleCancelEditing,
    handleFinishEditing,
    handleWallBreak,
    handleWallSelect,
    handleWallPlacementFinish,
    handleSegmentUpdate,
  };
};
