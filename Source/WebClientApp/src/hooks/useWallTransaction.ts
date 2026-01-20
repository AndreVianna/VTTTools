import { useCallback, useRef, useState } from 'react';
import { useUndoHistory } from './useUndoHistory';
import type { EncounterWall, EncounterWallSegment } from '@/types/domain';
import type { CreateWallRequest, UpdateWallRequest, StageWall } from '@/types/stage';
import type { LocalAction } from '@/types/wallUndoActions';

export type TransactionType = 'placement' | 'editing' | null;

export interface WallSegment {
  tempId: number;
  wallIndex: number | null;
  name: string;
  segments: EncounterWallSegment[];
}

export interface WallTransaction {
  type: TransactionType;
  originalWall: EncounterWall | null;
  segments: WallSegment[];
  isActive: boolean;
}

export interface CommitResult {
  success: boolean;
  segmentResults: Array<{
    tempId: number;
    wallIndex?: number;
    error?: string;
  }>;
}

/**
 * Wall mutation functions from Stage API
 */
export interface WallMutationHooks {
  addWall: (data: CreateWallRequest) => Promise<StageWall>;
  updateWall: (index: number, data: UpdateWallRequest) => Promise<void>;
  deleteWall: (index: number) => Promise<void>;
}

const INITIAL_TRANSACTION: WallTransaction = {
  type: null,
  originalWall: null,
  segments: [],
  isActive: false,
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

/**
 * Return type of the useWallTransaction hook.
 * Contains transaction state and all mutation/query functions.
 */
export type UseWallTransactionReturn = ReturnType<typeof useWallTransaction>;

export const useWallTransaction = () => {
  const [transaction, setTransaction] = useState<WallTransaction>(INITIAL_TRANSACTION);
  const segmentsRef = useRef<WallSegment[]>([]);
  const history = useUndoHistory<LocalAction>();

  const startTransaction = useCallback(
    (
      type: TransactionType,
      wall?: EncounterWall,
      placementProperties?: {
        name?: string;
      },
    ) => {
      segmentsRef.current = [];
      history.clear();

      const initialSegments = wall
        ? [
          {
            tempId: -1,
            wallIndex: wall.index,
            name: wall.name ?? '',
            segments: [...wall.segments],
          },
        ]
        : [
          {
            tempId: -1,
            wallIndex: null,
            name: placementProperties?.name || '',
            segments: [],
          },
        ];

      segmentsRef.current = initialSegments;

      setTransaction({
        type,
        originalWall: wall || null,
        segments: initialSegments,
        isActive: true,
      });
    },
    [history],
  );

  const addSegment = useCallback((segment: Omit<WallSegment, 'tempId'>): number => {
    // Calculate ID based on the ref to ensure uniqueness even in batched updates
    const currentSegments = segmentsRef.current.length > 0 ? segmentsRef.current : transaction.segments;
    const currentNextTempId = Math.max(...currentSegments.map((s) => Math.abs(s.tempId)), 0);
    const newTempId = -(currentNextTempId + 1);

    const newSegment = {
      ...segment,
      tempId: newTempId,
    };

    const newSegments = [...currentSegments, newSegment];
    segmentsRef.current = newSegments;

    setTransaction((prev) => ({
      ...prev,
      segments: newSegments,
    }));

    return newTempId;
  }, [transaction.segments]);

  const addSegments = useCallback((segments: Array<Omit<WallSegment, 'tempId'>>): void => {
    const currentSegments = segmentsRef.current.length > 0 ? segmentsRef.current : transaction.segments;
    let currentNextTempId = Math.max(...currentSegments.map((s) => Math.abs(s.tempId)), 0);

    const newSegmentsToAdd = segments.map((segment) => {
      currentNextTempId += 1;
      return {
        ...segment,
        tempId: -currentNextTempId,
      };
    });

    const newAllSegments = [...currentSegments, ...newSegmentsToAdd];
    segmentsRef.current = newAllSegments;

    setTransaction((prev) => ({
      ...prev,
      segments: newAllSegments,
    }));
  }, [transaction.segments]);

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
    const currentSegments = segmentsRef.current.length > 0 ? segmentsRef.current : transaction.segments;
    const newSegments = currentSegments.map((segment) => (segment.tempId === tempId ? { ...segment, ...changes } : segment));
    segmentsRef.current = newSegments;

    setTransaction((prev) => ({
      ...prev,
      segments: newSegments,
    }));
  }, [transaction.segments]);

  const removeSegment = useCallback((tempId: number) => {
    const currentSegments = segmentsRef.current.length > 0 ? segmentsRef.current : transaction.segments;
    const newSegments = currentSegments.filter((segment) => segment.tempId !== tempId);
    segmentsRef.current = newSegments;

    setTransaction((prev) => ({
      ...prev,
      segments: newSegments,
    }));
  }, [transaction.segments]);

  const commitTransaction = useCallback(
    async (_encounterId: string, wallMutations: WallMutationHooks, segmentsOverride?: WallSegment[]): Promise<CommitResult> => {
      const { addWall, updateWall } = wallMutations;
      const results: CommitResult['segmentResults'] = [];

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
        const segmentsToProcess = currentTransaction.segments;
        let names: string[];
        if (segmentsToProcess.length > 1) {
          if (currentTransaction.type === 'editing' && currentTransaction.originalWall !== null) {
            names = generateBrokenWallNames(currentTransaction.originalWall.name ?? '', segmentsToProcess.length);
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

          try {
            if (segment?.wallIndex !== null) {
              // Update existing wall via Stage API
              await updateWall(segment?.wallIndex || 1, {
                name: assignedName,
              });

              results.push({
                tempId: segment?.tempId || 0,
                wallIndex: segment?.wallIndex || 0,
              });
            } else {
              // Add new wall via Stage API
              const result = await addWall({
                name: assignedName || '',
                segments: segment?.segments || [],
              });

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
          segmentsRef.current = [];
          history.clear();
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
    [transaction, history],
  );

  const rollbackTransaction = useCallback(() => {
    setTransaction(INITIAL_TRANSACTION);
    segmentsRef.current = [];
    history.clear();
  }, [history]);

  const getActiveSegments = useCallback((): WallSegment[] => {
    return transaction.segments;
  }, [transaction.segments]);

  // Use history hook for undo/redo
  const pushLocalAction = history.push;
  const undoLocal = history.undo;
  const redoLocal = history.redo;
  const canUndoLocal = () => history.canUndo;
  const canRedoLocal = () => history.canRedo;

  return {
    transaction: {
      ...transaction,
      // localUndoStack and localRedoStack are now managed by the history hook
      // and are not part of the transaction state directly.
      // If consumers rely on these properties, they should be updated to use
      // canUndoLocal/canRedoLocal or the history object directly.
    },
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
    // Expose history for tests or advanced usage if needed
    history,
  };
};
