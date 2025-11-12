import { useCallback, useRef, useState } from 'react';
import type { useAddEncounterWallMutation, useUpdateEncounterWallMutation } from '@/services/encounterApi';
import type { EncounterWall, Pole } from '@/types/domain';
import { WallVisibility } from '@/types/domain';
import type { LocalAction } from '@/types/wallUndoActions';
import { cleanWallPoles } from '@/utils/wallUtils';

export type TransactionType = 'placement' | 'editing' | null;

export interface WallSegment {
  tempId: number;
  wallIndex: number | null;
  name: string;
  poles: Pole[];
  isClosed: boolean;
  visibility: WallVisibility;
  material?: string | undefined;
  color?: string | undefined;
}

export interface WallTransaction {
  type: TransactionType;
  originalWall: EncounterWall | null;
  segments: WallSegment[];
  isActive: boolean;
  localUndoStack: LocalAction[];
  localRedoStack: LocalAction[];
}

export interface CommitResult {
  success: boolean;
  segmentResults: Array<{
    tempId: number;
    wallIndex?: number;
    error?: string;
  }>;
}

interface ApiHooks {
  addEncounterWall: ReturnType<typeof useAddEncounterWallMutation>[0];
  updateEncounterWall: ReturnType<typeof useUpdateEncounterWallMutation>[0];
}

const INITIAL_TRANSACTION: WallTransaction = {
  type: null,
  originalWall: null,
  segments: [],
  isActive: false,
  localUndoStack: [],
  localRedoStack: [],
};

function generateBrokenWallNames(originalName: string, segmentCount: number): string[] {
  const numberSuffixPattern = /^(.*?)(\d+)$/;
  const match = originalName.match(numberSuffixPattern);

  const names: string[] = [];

  if (match) {
    const [, baseName, numberStr] = match;
    const baseNumber = parseInt(numberStr || '0', 10);

    for (let i = 1; i <= segmentCount; i++) {
      names.push(`${baseName}${baseNumber}.${i}`);
    }
  } else {
    for (let i = 1; i <= segmentCount; i++) {
      names.push(`${originalName} ${i}`);
    }
  }

  return names;
}

export const useWallTransaction = () => {
  const [transaction, setTransaction] = useState<WallTransaction>(INITIAL_TRANSACTION);
  const segmentsRef = useRef<WallSegment[]>([]);

  const startTransaction = useCallback(
    (
      type: TransactionType,
      wall?: EncounterWall,
      placementProperties?: {
        name?: string;
        visibility?: WallVisibility;
        isClosed?: boolean;
        material?: string | undefined;
        color?: string | undefined;
      },
    ) => {
      // Clear ref when starting new transaction
      segmentsRef.current = [];

      if (wall) {
        setTransaction({
          type,
          originalWall: wall,
          segments: [
            {
              tempId: 0,
              wallIndex: wall.index,
              name: wall.name,
              poles: [...wall.poles],
              isClosed: wall.isClosed,
              visibility: wall.visibility,
              material: wall.material || undefined,
              color: wall.color || undefined,
            },
          ],
          isActive: true,
          localUndoStack: [],
          localRedoStack: [],
        });
      } else {
        setTransaction({
          type,
          originalWall: null,
          segments: [
            {
              tempId: -1,
              wallIndex: null,
              name: placementProperties?.name || '',
              poles: [],
              visibility: placementProperties?.visibility ?? WallVisibility.Normal,
              isClosed: placementProperties?.isClosed ?? false,
              material: placementProperties?.material,
              color: placementProperties?.color || '#808080',
            },
          ],
          isActive: true,
          localUndoStack: [],
          localRedoStack: [],
        });
      }
    },
    [],
  );

  const addSegment = useCallback((segment: Omit<WallSegment, 'tempId'>): number => {
    let newTempId: number = -1;

    setTransaction((prev) => {
      const currentNextTempId = Math.max(...prev.segments.map((s) => Math.abs(s.tempId)), 0);
      newTempId = -(currentNextTempId + 1);
      const newState = {
        ...prev,
        segments: [
          ...prev.segments,
          {
            ...segment,
            tempId: newTempId,
          },
        ],
      };
      return newState;
    });
    return newTempId;
  }, []);

  const addSegments = useCallback((segments: Array<Omit<WallSegment, 'tempId'>>): void => {
    setTransaction((prev) => {
      let currentNextTempId = Math.max(...prev.segments.map((s) => Math.abs(s.tempId)), 0);
      const newSegments = segments.map((segment) => {
        currentNextTempId += 1;
        const newTempId = -currentNextTempId;
        return {
          ...segment,
          tempId: newTempId,
        };
      });

      const newState = {
        ...prev,
        segments: [...prev.segments, ...newSegments],
      };
      return newState;
    });
  }, []);

  const setAllSegments = useCallback((segments: WallSegment[]): void => {
    const segmentsWithTempIds = segments.map((segment, index) => {
      const newTempId = -(index + 1);
      return {
        ...segment,
        tempId: newTempId,
      };
    });
    segmentsRef.current = segmentsWithTempIds;
    setTransaction((prev) => {
      const newState = {
        ...prev,
        segments: segmentsWithTempIds,
      };
      return newState;
    });
  }, []);

  const updateSegment = useCallback((tempId: number, changes: Partial<WallSegment>) => {
    setTransaction((prev) => ({
      ...prev,
      segments: prev.segments.map((segment) => (segment.tempId === tempId ? { ...segment, ...changes } : segment)),
    }));
  }, []);

  const removeSegment = useCallback((tempId: number) => {
    setTransaction((prev) => ({
      ...prev,
      segments: prev.segments.filter((segment) => segment.tempId !== tempId),
    }));
  }, []);

  const commitTransaction = useCallback(
    async (encounterId: string, apiHooks: ApiHooks, segmentsOverride?: WallSegment[]): Promise<CommitResult> => {
      const { addEncounterWall, updateEncounterWall } = apiHooks;
      const results: CommitResult['segmentResults'] = [];

      // Use provided segments, ref, or state (in that order)
      let currentTransaction: WallTransaction;
      if (segmentsOverride) {
        currentTransaction = {
          ...transaction,
          segments: segmentsOverride,
        };
      } else if (segmentsRef.current.length > 0) {
        currentTransaction = {
          ...transaction,
          segments: segmentsRef.current,
        };
      } else {
        currentTransaction = transaction;
      }
      try {
        const segmentsToProcess = currentTransaction.segments.map((segment) => {
          const cleaned = cleanWallPoles(segment.poles, segment.isClosed);
          return {
            ...segment,
            poles: cleaned.poles,
            isClosed: cleaned.isClosed,
          };
        });
        let names: string[];
        if (segmentsToProcess.length > 1) {
          if (currentTransaction.type === 'editing' && currentTransaction.originalWall !== null) {
            names = generateBrokenWallNames(currentTransaction.originalWall.name, segmentsToProcess.length);
          } else {
            const baseName = segmentsToProcess[0]?.name || 'Wall';
            const baseNameMatch = baseName.match(/^(.*?)\s*(\d+)$/);

            if (baseNameMatch) {
              const [, prefix, numberStr] = baseNameMatch;
              const baseNumber = parseInt(numberStr || '1', 10);
              names = segmentsToProcess.map((_, index) => `${prefix?.trim()} ${baseNumber + index}`);
            } else {
              names = segmentsToProcess.map((_, index) => `${baseName} ${index + 1}`);
            }
          }
        } else {
          names = segmentsToProcess.map((s) => s.name);
        }

        for (let i = 0; i < segmentsToProcess.length; i++) {
          const segment = segmentsToProcess[i];
          const assignedName = names[i];

          console.log('[useWallTransaction.commitTransaction] Segment:', {
            tempId: segment?.tempId,
            wallIndex: segment?.wallIndex,
            name: assignedName,
            material: segment?.material,
            color: segment?.color,
            isClosed: segment?.isClosed,
            poleCount: segment?.poles?.length,
          });

          try {
            if (segment?.wallIndex !== null) {
              const updatePayload = {
                encounterId,
                wallIndex: segment?.wallIndex || 1,
                name: assignedName,
                poles: segment?.poles,
                visibility: segment?.visibility,
                isClosed: segment?.isClosed || false,
                material: segment?.material || undefined,
                color: segment?.color || undefined,
              };

              console.log('[useWallTransaction.commitTransaction] UPDATE API payload:', updatePayload);

              await updateEncounterWall(updatePayload).unwrap();

              results.push({
                tempId: segment?.tempId || 0,
                wallIndex: segment?.wallIndex || 0,
              });
            } else {
              const addPayload = {
                encounterId,
                name: assignedName || '',
                poles: segment?.poles || [],
                visibility: segment?.visibility || WallVisibility.Normal,
                isClosed: segment?.isClosed || false,
                material: segment?.material || undefined,
                color: segment?.color || undefined,
              };

              console.log('[useWallTransaction.commitTransaction] ADD API payload:', addPayload);

              const result = await addEncounterWall(addPayload).unwrap();

              results.push({
                tempId: segment.tempId,
                wallIndex: result.index,
              });
            }
          } catch (error) {
            console.error(`[useWallTransaction.commitTransaction] Error processing segment ${i}:`, error);
            results.push({
              tempId: segment?.tempId || 0,
              error: error instanceof Error ? error.message : 'Unknown error',
            });
          }
        }
        const hasErrors = results.some((r) => r.error !== undefined);
        if (!hasErrors) {
          setTransaction(INITIAL_TRANSACTION);
          segmentsRef.current = []; // Clear ref after successful commit
        }

        return {
          success: !hasErrors,
          segmentResults: results,
        };
      } catch (error) {
        return {
          success: false,
          segmentResults: [
            {
              tempId: -1,
              error: error instanceof Error ? error.message : 'Transaction commit failed',
            },
          ],
        };
      }
    },
    [transaction],
  ); // Need transaction for fallback path

  const rollbackTransaction = useCallback(() => {
    setTransaction(INITIAL_TRANSACTION);
    segmentsRef.current = [];
  }, []);

  const getActiveSegments = useCallback((): WallSegment[] => {
    return transaction.segments;
  }, [transaction.segments]);

  const pushLocalAction = useCallback((action: LocalAction) => {
    setTransaction((prev) => ({
      ...prev,
      localUndoStack: [...prev.localUndoStack, action],
      localRedoStack: [],
    }));
  }, []);

  const undoLocal = useCallback((onSyncEncounter?: (segments: WallSegment[]) => void) => {
    setTransaction((prev) => {
      if (prev.localUndoStack.length === 0) {
        return prev;
      }

      const action = prev.localUndoStack[prev.localUndoStack.length - 1];
      if (!action) {
        return prev;
      }

      action.undo();

      const newState = {
        ...prev,
        localUndoStack: prev.localUndoStack.slice(0, -1),
        localRedoStack: [...prev.localRedoStack, action],
      };

      if (onSyncEncounter) {
        onSyncEncounter(newState.segments);
      }

      return newState;
    });
  }, []);

  const redoLocal = useCallback((onSyncEncounter?: (segments: WallSegment[]) => void) => {
    setTransaction((prev) => {
      if (prev.localRedoStack.length === 0) {
        return prev;
      }

      const action = prev.localRedoStack[prev.localRedoStack.length - 1];
      if (!action) {
        return prev;
      }

      action.redo();

      const newState = {
        ...prev,
        localRedoStack: prev.localRedoStack.slice(0, -1),
        localUndoStack: [...prev.localUndoStack, action],
      };

      if (onSyncEncounter) {
        onSyncEncounter(newState.segments);
      }

      return newState;
    });
  }, []);

  const canUndoLocal = useCallback((): boolean => {
    return transaction.localUndoStack.length > 0;
  }, [transaction.localUndoStack]);

  const canRedoLocal = useCallback((): boolean => {
    return transaction.localRedoStack.length > 0;
  }, [transaction.localRedoStack]);

  return {
    transaction,
    startTransaction,
    addSegment,
    addSegments,
    setAllSegments,
    updateSegment,
    removeSegment,
    commitTransaction,
    rollbackTransaction,
    getActiveSegments,
    pushLocalAction,
    undoLocal,
    redoLocal,
    canUndoLocal,
    canRedoLocal,
  };
};
