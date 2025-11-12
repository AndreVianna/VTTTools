import type { WallBreakData } from '@components/encounter/editing/WallTransformer';
import { useCallback } from 'react';
import type { useWallTransaction, WallSegment } from '@/hooks/useWallTransaction';
import type {
  useAddEncounterWallMutation,
  useRemoveEncounterWallMutation,
  useUpdateEncounterWallMutation,
} from '@/services/encounterApi';
import type { Encounter, EncounterWall, PlacedWall, Pole } from '@/types/domain';
import { createBreakWallAction } from '@/types/wallUndoActions';
import { BreakWallCommand, EditWallCommand } from '@/utils/commands/wallCommands';
import { getDomIdByIndex, removeEntityMapping } from '@/utils/encounterEntityMapping';
import { hydratePlacedWalls } from '@/utils/encounterMappers';
import { removeWallOptimistic, syncWallIndices, updateWallOptimistic } from '@/utils/encounterStateUtils';
import { decomposeSelfIntersectingPath } from '@/utils/wallPlanarUtils';

interface UseWallHandlersProps {
  encounterId: string | undefined;
  encounter: Encounter | null;
  wallTransaction: ReturnType<typeof useWallTransaction>;
  selectedWallIndex: number | null;
  drawingMode: 'wall' | 'region' | null;
  drawingWallIndex: number | null;

  addEncounterWall: ReturnType<typeof useAddEncounterWallMutation>[0];
  updateEncounterWall: ReturnType<typeof useUpdateEncounterWallMutation>[0];
  removeEncounterWall: ReturnType<typeof useRemoveEncounterWallMutation>[0];

  setEncounter: (encounter: Encounter) => void;
  setPlacedWalls: (walls: PlacedWall[]) => void;
  setSelectedWallIndex: (index: number | null) => void;
  setDrawingWallIndex: (index: number | null) => void;
  setDrawingMode: (mode: 'wall' | 'region' | null) => void;
  setIsEditingVertices: (editing: boolean) => void;
  setOriginalWallPoles: (poles: Pole[] | null) => void;
  setActivePanel: (panel: string | null) => void;
  setErrorMessage: (message: string | null) => void;

  execute: (command: unknown) => void;
  refetch: () => Promise<{ data?: Encounter }>;
}

export const useWallHandlers = ({
  encounterId,
  encounter,
  wallTransaction,
  selectedWallIndex,
  drawingMode,
  drawingWallIndex,
  addEncounterWall,
  updateEncounterWall,
  removeEncounterWall,
  setEncounter,
  setPlacedWalls,
  setSelectedWallIndex,
  setDrawingWallIndex,
  setDrawingMode,
  setIsEditingVertices,
  setOriginalWallPoles,
  setActivePanel,
  setErrorMessage,
  execute,
  refetch,
}: UseWallHandlersProps) => {
  const handleWallDelete = useCallback(
    async (wallIndex: number) => {
      if (!encounterId || !encounter) {
        return;
      }

      const domId = getDomIdByIndex(encounterId, 'walls', wallIndex);

      try {
        await removeEncounterWall({ encounterId, wallIndex }).unwrap();

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
      removeEncounterWall,
      refetch,
      setEncounter,
      setSelectedWallIndex,
      setIsEditingVertices,
      setOriginalWallPoles,
      wallTransaction,
      setErrorMessage,
      selectedWallIndex,
    ],
  );

  const handleEditVertices = useCallback(
    (wallIndex: number) => {
      const wall = encounter?.walls?.find((w) => w.index === wallIndex);
      if (!wall) return;

      setOriginalWallPoles([...wall.poles]);

      wallTransaction.startTransaction('editing', wall);

      setSelectedWallIndex(wallIndex);
      setIsEditingVertices(true);
      setActivePanel(null);
    },
    [encounter, wallTransaction, setOriginalWallPoles, setSelectedWallIndex, setIsEditingVertices, setActivePanel],
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
        poles: originalWall.poles,
        isClosed: originalWall.isClosed,
        name: originalWall.name,
      });
    }

    setEncounter(cleanedEncounter);
    setSelectedWallIndex(null);
    setIsEditingVertices(false);
    setOriginalWallPoles(null);
  }, [
    encounter,
    selectedWallIndex,
    wallTransaction,
    setEncounter,
    setSelectedWallIndex,
    setIsEditingVertices,
    setOriginalWallPoles,
  ]);

  const handleFinishEditing = useCallback(async () => {
    if (!encounterId || !encounter || selectedWallIndex === null) return;

    const activeSegments = wallTransaction.getActiveSegments();
    console.log(
      '[useWallHandlers.handleFinishEditing] Active segments before processing:',
      activeSegments.map((s) => ({
        tempId: s.tempId,
        wallIndex: s.wallIndex,
        name: s.name,
        material: s.material,
        color: s.color,
        poleCount: s.poles.length,
        isClosed: s.isClosed,
      })),
    );

    const editedSegment = activeSegments[0];

    if (editedSegment && editedSegment.poles.length >= 2) {
      const TOLERANCE = 5;
      const polePoints = editedSegment.poles.map((p) => ({ x: p.x, y: p.y }));
      const { closedWalls, openSegments } = decomposeSelfIntersectingPath(polePoints, TOLERANCE);

      if (closedWalls.length > 0 || openSegments.length > 0) {
        const allSegments = [
          ...closedWalls.map((wallPoles, index) => ({
            tempId: index === 0 ? editedSegment.tempId : -(index + 1),
            wallIndex: index === 0 ? editedSegment.wallIndex : null,
            name: editedSegment.name,
            poles: wallPoles.map((p, i) => ({
              x: p.x,
              y: p.y,
              h: editedSegment.poles[i]?.h ?? 0,
            })),
            isClosed: true,
            visibility: editedSegment.visibility,
            material: editedSegment.material,
            color: editedSegment.color,
          })),
          ...openSegments.map((segmentPoles, index) => ({
            tempId: closedWalls.length === 0 && index === 0 ? editedSegment.tempId : -(closedWalls.length + index + 1),
            wallIndex: closedWalls.length === 0 && index === 0 ? editedSegment.wallIndex : null,
            name: editedSegment.name,
            poles: segmentPoles.map((p, i) => ({
              x: p.x,
              y: p.y,
              h: editedSegment.poles[i]?.h ?? 0,
            })),
            isClosed: false,
            visibility: editedSegment.visibility,
            material: editedSegment.material,
            color: editedSegment.color,
          })),
        ];

        if (
          allSegments.length > 1 ||
          (allSegments.length === 1 && allSegments[0]?.isClosed !== editedSegment.isClosed)
        ) {
          wallTransaction.setAllSegments(allSegments);
        }
      }
    }

    const updatedActiveSegments = wallTransaction.getActiveSegments();
    console.log(
      '[useWallHandlers.handleFinishEditing] Active segments after decomposition:',
      updatedActiveSegments.map((s) => ({
        tempId: s.tempId,
        wallIndex: s.wallIndex,
        name: s.name,
        material: s.material,
        color: s.color,
        poleCount: s.poles.length,
        isClosed: s.isClosed,
      })),
    );

    const finalEditedSegment = updatedActiveSegments[0];

    if (finalEditedSegment && finalEditedSegment.wallIndex === selectedWallIndex) {
      const updatedEncounter = updateWallOptimistic(encounter, selectedWallIndex, {
        poles: finalEditedSegment.poles,
        isClosed: finalEditedSegment.isClosed,
      });
      setEncounter(updatedEncounter);
      const hydratedWalls = hydratePlacedWalls(updatedEncounter.walls || [], encounterId);
      setPlacedWalls(hydratedWalls);
    }

    const result = await wallTransaction.commitTransaction(encounterId, {
      addEncounterWall,
      updateEncounterWall,
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

      const { data: updatedEncounter } = await refetch();
      if (updatedEncounter) {
        const hydratedWalls = hydratePlacedWalls(updatedEncounter.walls || [], encounterId);
        setEncounter(updatedEncounter);
        setPlacedWalls(hydratedWalls);

        if (result.segmentResults.length > 1) {
          const newWalls: EncounterWall[] = [];
          result.segmentResults.forEach((r) => {
            if (r.wallIndex !== undefined) {
              const wall = updatedEncounter.walls?.find((w) => w.index === r.wallIndex);
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
            onAdd: async (encounterId: string, wallData: Omit<EncounterWall, 'index' | 'encounterId'>) => {
              const result = await addEncounterWall({
                encounterId,
                ...wallData,
              }).unwrap();
              return result;
            },
            onUpdate: async (encounterId: string, wallIndex: number, updates: Partial<EncounterWall>) => {
              await updateEncounterWall({
                encounterId,
                wallIndex,
                ...updates,
              }).unwrap();
            },
            onRemove: async (encounterId: string, wallIndex: number) => {
              await removeEncounterWall({ encounterId, wallIndex }).unwrap();
            },
            onRefetch: async () => {
              const { data } = await refetch();
              if (data) {
                const hydratedWalls = hydratePlacedWalls(data.walls || [], encounterId);
                setEncounter(data);
                setPlacedWalls(hydratedWalls);
              }
            },
          });
          await execute(command);
        } else if (result.segmentResults[0]?.wallIndex !== undefined) {
          const segmentResult = result.segmentResults[0];
          const wallIndex = segmentResult.wallIndex ?? 0;
          const updatedWall = updatedEncounter.walls?.find((w) => w.index === wallIndex);
          if (updatedWall) {
            const command = new EditWallCommand({
              encounterId,
              wallIndex,
              oldWall: originalWall,
              newWall: updatedWall,
              onUpdate: async (encounterId, wallIndex, updates) => {
                try {
                  await updateEncounterWall({
                    encounterId,
                    wallIndex,
                    ...updates,
                  }).unwrap();
                } catch (error) {
                  console.error('Failed to update wall:', error);
                  throw error;
                }
              },
              onRefetch: async () => {
                const { data } = await refetch();
                if (data) {
                  const hydratedWalls = hydratePlacedWalls(data.walls || [], encounterId);
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
      }, 0);
    } else {
      setErrorMessage('Failed to save wall changes. Please try again.');
    }
  }, [
    encounterId,
    encounter,
    selectedWallIndex,
    wallTransaction,
    addEncounterWall,
    updateEncounterWall,
    removeEncounterWall,
    refetch,
    setEncounter,
    setPlacedWalls,
    setSelectedWallIndex,
    setIsEditingVertices,
    setOriginalWallPoles,
    setErrorMessage,
    execute,
  ]);

  const handleWallBreak = useCallback(
    async (breakData: WallBreakData) => {
      if (!encounter) return;

      const activeSegments = wallTransaction.getActiveSegments();
      const breakingSegment = activeSegments.find((s) => s.poles.length > 0);
      if (!breakingSegment) return;

      const { breakPoleIndex, newWallPoles, originalWallPoles } = breakData;

      const segment1Poles = newWallPoles.slice(0, breakPoleIndex + 1);
      const segment2Poles = newWallPoles.slice(breakPoleIndex);

      const breakAction = createBreakWallAction(
        breakingSegment.tempId,
        breakPoleIndex,
        originalWallPoles,
        breakingSegment.isClosed,
        breakingSegment.wallIndex ?? -1,
        breakingSegment.tempId,
        -1,
        segment1Poles,
        segment2Poles,
        breakingSegment.name,
        breakingSegment.visibility,
        breakingSegment.material,
        breakingSegment.color,
        (tempId: number) => wallTransaction.removeSegment(tempId),
        (tempId: number, changes: Partial<WallSegment>) => wallTransaction.updateSegment(tempId, changes),
        (segment: WallSegment) => wallTransaction.addSegment(segment),
      );

      wallTransaction.pushLocalAction(breakAction);
    },
    [encounter, wallTransaction],
  );

  const handleWallSelect = useCallback(
    (wallIndex: number | null) => {
      setSelectedWallIndex(wallIndex);
    },
    [setSelectedWallIndex],
  );

  const handleWallPlacementFinish = useCallback(async () => {
    if (!encounterId || !encounter) return;
    if (drawingMode !== 'wall' || drawingWallIndex === null) return;

    const activeSegments = wallTransaction.getActiveSegments();
    console.log(
      '[useWallHandlers.handleWallPlacementFinish] Active segments before commit:',
      activeSegments.map((s) => ({
        tempId: s.tempId,
        wallIndex: s.wallIndex,
        name: s.name,
        material: s.material,
        color: s.color,
        poleCount: s.poles.length,
        isClosed: s.isClosed,
      })),
    );

    const result = await wallTransaction.commitTransaction(encounterId, {
      addEncounterWall,
      updateEncounterWall,
    });

    if (result.success && result.segmentResults.length > 0) {
      const tempToReal = new Map<number, number>();
      result.segmentResults.forEach((r) => {
        if (r.wallIndex !== undefined) {
          tempToReal.set(r.tempId, r.wallIndex);
        }
      });

      const syncedEncounter = syncWallIndices(encounter, tempToReal);

      const hydratedWalls = hydratePlacedWalls(syncedEncounter.walls || [], encounterId);

      setEncounter(syncedEncounter);
      setPlacedWalls(hydratedWalls);
    } else {
      wallTransaction.rollbackTransaction();
      const cleanEncounter = removeWallOptimistic(encounter, -1);
      setEncounter(cleanEncounter);
      setErrorMessage('Failed to place wall. Please try again.');
    }

    setDrawingWallIndex(null);
    setDrawingMode(null);
  }, [
    encounterId,
    encounter,
    drawingMode,
    drawingWallIndex,
    wallTransaction,
    addEncounterWall,
    updateEncounterWall,
    setEncounter,
    setPlacedWalls,
    setDrawingWallIndex,
    setDrawingMode,
    setErrorMessage,
  ]);

  return {
    handleWallDelete,
    handleEditVertices,
    handleCancelEditing,
    handleFinishEditing,
    handleWallBreak,
    handleWallSelect,
    handleWallPlacementFinish,
  };
};
