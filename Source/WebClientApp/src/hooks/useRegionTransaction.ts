import { useCallback, useState } from 'react';
import type { useAddEncounterRegionMutation, useUpdateEncounterRegionMutation } from '@/services/encounterApi';
import type { Encounter, EncounterRegion, Point } from '@/types/domain';
import type { LocalAction } from '@/types/regionUndoActions';
import { cleanPolygonVertices } from '@/utils/polygonUtils';
import {
  type ClipResult,
  computeClipResults,
  findClippableRegions,
  findMergeableRegions,
  findRegionsForNullClip,
  isNullRegion,
  mergePolygons,
} from '@/utils/regionMergeUtils';
import { useUndoHistory } from './useUndoHistory';

export type TransactionType = 'placement' | 'editing' | 'modification' | null;

/**
 * Represents a region segment being placed or edited in a transaction.
 * Contains temporary state and vertex data for the active region operation.
 */
export interface RegionSegment {
  tempId: number;
  regionIndex: number | null;
  name: string;
  vertices: Point[];
  type: string;
  value?: number;
  label?: string;
  color?: string;
}

/**
 * Transaction state for region placement and editing operations.
 * Manages the lifecycle of a region operation with local undo/redo support.
 */
export interface RegionTransaction {
  type: TransactionType;
  originalRegion: EncounterRegion | null;
  segment: RegionSegment | null;
  isActive: boolean;
}

export interface CommitResult {
  success: boolean;
  regionIndex?: number;
  action?: 'create' | 'edit' | 'merge' | 'clip' | 'nullClip';
  targetRegionIndex?: number;
  mergedVertices?: Point[];
  regionsToDelete?: number[];
  originalRegions?: EncounterRegion[];
  clipResults?: ClipResult[];
  error?: string;
}

interface ApiHooks {
  addEncounterRegion: ReturnType<typeof useAddEncounterRegionMutation>[0];
  updateEncounterRegion: ReturnType<typeof useUpdateEncounterRegionMutation>[0];
}

const INITIAL_TRANSACTION: RegionTransaction = {
  type: null,
  originalRegion: null,
  segment: null,
  isActive: false,
};

/**
 * Manages region placement and editing transactions for the encounter editor.
 * Regions are always closed polygons requiring minimum 3 vertices.
 *
 * Provides transaction lifecycle management (start, update, commit, cancel) and
 * local undo/redo operations for vertex manipulation during active transactions.
 *
 * @returns Transaction state and mutation functions for region operations
 */
export const useRegionTransaction = () => {
  const [transaction, setTransaction] = useState<RegionTransaction>(INITIAL_TRANSACTION);
  const [_nextTempId, setNextTempId] = useState<number>(0);
  const history = useUndoHistory<LocalAction>();

  const startTransaction = useCallback(
    (
      type: TransactionType,
      region?: EncounterRegion,
      placementProperties?: {
        name?: string;
        type?: string;
        value?: number;
        label?: string;
        color?: string;
      },
    ) => {
      history.clear();
      if (region) {
        setTransaction({
          type,
          originalRegion: region,
          segment: {
            tempId: 0,
            regionIndex: region.index,
            name: region.name,
            vertices: [...region.vertices],
            type: region.type,
            ...(region.value !== undefined && { value: region.value }),
            ...(region.label !== undefined && { label: region.label }),
            ...(region.color !== undefined && { color: region.color }),
          },
          isActive: true,
        });
        setNextTempId(1);
      } else {
        setTransaction({
          type,
          originalRegion: null,
          segment: {
            tempId: -1,
            regionIndex: null,
            name: placementProperties?.name || '',
            vertices: [],
            type: placementProperties?.type || 'custom',
            ...(placementProperties?.value !== undefined && {
              value: placementProperties.value,
            }),
            ...(placementProperties?.label !== undefined && {
              label: placementProperties.label,
            }),
            color: placementProperties?.color || '#808080',
          },
          isActive: true,
        });
        setNextTempId(0);
      }
    },
    [history],
  );

  const addVertex = useCallback((vertex: Point) => {
    setTransaction((prev) => {
      if (!prev.segment) {
        return prev;
      }

      return {
        ...prev,
        segment: {
          ...prev.segment,
          vertices: [...prev.segment.vertices, vertex],
        },
      };
    });
  }, []);

  const updateVertices = useCallback((vertices: Point[]) => {
    setTransaction((prev) => {
      if (!prev.segment) {
        return prev;
      }

      return {
        ...prev,
        segment: {
          ...prev.segment,
          vertices,
        },
      };
    });
  }, []);

  const updateSegmentProperties = useCallback((changes: Partial<Omit<RegionSegment, 'tempId' | 'regionIndex'>>) => {
    setTransaction((prev) => {
      if (!prev.segment) {
        return prev;
      }

      return {
        ...prev,
        segment: {
          ...prev.segment,
          ...changes,
        },
      };
    });
  }, []);

  const detectRegionMerge = useCallback(
    (encounter: Encounter, segment: RegionSegment): CommitResult | null => {
      const mergeableRegions = findMergeableRegions(
        encounter.regions,
        segment.vertices,
        segment.type,
        segment.value,
        segment.label,
      );

      if (mergeableRegions.length === 0) {
        return null;
      }

      const sortedRegions = [...mergeableRegions].sort((a, b) => a.index - b.index);
      const targetRegion = sortedRegions[0];

      if (!targetRegion) {
        return {
          success: false,
          error: 'Merge target region not found',
        };
      }

      const allVertices = [segment.vertices, ...mergeableRegions.map((r) => r.vertices)];
      const mergedVertices = mergePolygons(allVertices);

      const regionsToDelete: number[] = [];
      for (const r of sortedRegions.slice(1)) {
        regionsToDelete.push(r.index);
      }

      if (segment.regionIndex !== null && segment.regionIndex !== targetRegion.index) {
        regionsToDelete.push(segment.regionIndex);
      }

      return {
        success: true,
        action: 'merge',
        targetRegionIndex: targetRegion.index,
        mergedVertices,
        regionsToDelete,
        originalRegions: mergeableRegions,
      };
    },
    [],
  );

  const detectRegionClip = useCallback(
    (encounter: Encounter, segment: RegionSegment): CommitResult | null => {
      const clippableRegions = findClippableRegions(
        encounter.regions,
        segment.vertices,
        segment.type,
        segment.value,
        segment.label,
      );

      if (clippableRegions.length === 0) {
        return null;
      }

      const clipResults = computeClipResults(clippableRegions, segment.vertices);

      return {
        success: true,
        action: 'clip',
        clipResults,
        originalRegions: clippableRegions,
      };
    },
    [],
  );

  const detectNullRegionClip = useCallback(
    (encounter: Encounter, segment: RegionSegment): CommitResult | null => {
      if (!isNullRegion(segment.type, segment.label)) {
        return null;
      }

      const regionsToClip = findRegionsForNullClip(encounter.regions, segment.vertices, segment.type);

      if (regionsToClip.length === 0) {
        return {
          success: true,
          action: 'nullClip',
          clipResults: [],
          originalRegions: [],
        };
      }

      const clipResults = computeClipResults(regionsToClip, segment.vertices);

      return {
        success: true,
        action: 'nullClip',
        clipResults,
        originalRegions: regionsToClip,
      };
    },
    [],
  );

  const validateSegmentVertices = useCallback(
    (vertices: Point[]): { valid: boolean; cleanedVertices?: Point[]; error?: string } => {
      const cleanedVertices = cleanPolygonVertices(vertices, true);

      if (cleanedVertices.length < 3) {
        return {
          valid: false,
          error: 'Region requires minimum 3 vertices',
        };
      }

      return {
        valid: true,
        cleanedVertices,
      };
    },
    [],
  );

  const persistRegionToBackend = useCallback(
    async (
      encounterId: string,
      segment: RegionSegment,
      cleanedVertices: Point[],
      apiHooks: ApiHooks,
    ): Promise<CommitResult> => {
      const { addEncounterRegion, updateEncounterRegion } = apiHooks;

      if (segment.regionIndex !== null) {
        const updateData = {
          encounterId,
          regionIndex: segment.regionIndex,
          name: segment.name,
          vertices: cleanedVertices,
          type: segment.type,
          ...(segment.value !== undefined && { value: segment.value }),
          ...(segment.label !== undefined && { label: segment.label }),
          ...(segment.color !== undefined && { color: segment.color }),
        };
        await updateEncounterRegion(updateData).unwrap();

        return {
          success: true,
          action: 'edit',
          regionIndex: segment.regionIndex,
        };
      }

      const addData = {
        encounterId,
        name: segment.name,
        vertices: cleanedVertices,
        type: segment.type,
        ...(segment.value !== undefined && { value: segment.value }),
        ...(segment.label !== undefined && { label: segment.label }),
        ...(segment.color !== undefined && { color: segment.color }),
      };
      const result = await addEncounterRegion(addData).unwrap();

      return {
        success: true,
        action: 'create',
        regionIndex: result.index,
      };
    },
    [],
  );

  const clearTransactionState = useCallback(() => {
    setTransaction(INITIAL_TRANSACTION);
    setNextTempId(0);
    history.clear();
  }, [history]);

  const commitTransaction = useCallback(
    async (
      encounterId: string,
      apiHooks: ApiHooks,
      currentEncounter?: Encounter,
    ): Promise<CommitResult> => {
      try {
        if (!transaction.segment) {
          return {
            success: false,
            error: 'No segment to commit',
          };
        }

        const segment = transaction.segment;

        if (currentEncounter?.regions) {
          const nullClipResult = detectNullRegionClip(currentEncounter, segment);
          if (nullClipResult) {
            return nullClipResult;
          }

          const mergeResult = detectRegionMerge(currentEncounter, segment);
          if (mergeResult) {
            return mergeResult;
          }

          const clipResult = detectRegionClip(currentEncounter, segment);
          if (clipResult) {
            return clipResult;
          }
        }

        if (isNullRegion(segment.type, segment.label)) {
          clearTransactionState();
          return {
            success: true,
            action: 'nullClip',
            clipResults: [],
            originalRegions: [],
          };
        }

        const validation = validateSegmentVertices(segment.vertices);
        if (!validation.valid || !validation.cleanedVertices) {
          return {
            success: false,
            error: validation.error || 'Invalid vertices',
          };
        }

        const result = await persistRegionToBackend(encounterId, segment, validation.cleanedVertices, apiHooks);

        clearTransactionState();
        return result;
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Transaction commit failed',
        };
      }
    },
    [transaction, detectNullRegionClip, detectRegionMerge, detectRegionClip, validateSegmentVertices, persistRegionToBackend, clearTransactionState],
  );

  const rollbackTransaction = useCallback(() => {
    setTransaction(INITIAL_TRANSACTION);
    setNextTempId(0);
    history.clear();
  }, [history]);

  const clearTransaction = useCallback(() => {
    setTransaction(INITIAL_TRANSACTION);
    setNextTempId(0);
    history.clear();
  }, [history]);

  const getActiveSegment = useCallback((): RegionSegment | null => {
    return transaction.segment;
  }, [transaction.segment]);

  const pushLocalAction = useCallback((action: LocalAction) => {
    history.push(action);
  }, [history]);

  // Wrapper for consistency with previous API, though onSyncEncounter is now ignored
  // as state updates are handled by the history hook logic implicitly via re-renders.
  const undoLocal = useCallback((_onSyncEncounter?: (segment: RegionSegment | null) => void) => {
    history.undo();
  }, [history]);

  const redoLocal = useCallback((_onSyncEncounter?: (segment: RegionSegment | null) => void) => {
    history.redo();
  }, [history]);

  const canUndoLocal = useCallback((): boolean => {
    return history.canUndo;
  }, [history.canUndo]);

  const canRedoLocal = useCallback((): boolean => {
    return history.canRedo;
  }, [history.canRedo]);

  const clearLocalStacks = useCallback(() => {
    history.clear();
  }, [history]);

  return {
    transaction: {
      ...transaction,
      // Stack properties removed as they are now managed by history hook
    },
    startTransaction,
    addVertex,
    updateVertices,
    updateSegmentProperties,
    commitTransaction,
    rollbackTransaction,
    clearTransaction,
    getActiveSegment,
    pushLocalAction,
    undoLocal,
    redoLocal,
    canUndoLocal,
    canRedoLocal,
    clearLocalStacks,
    history,
  };
};
