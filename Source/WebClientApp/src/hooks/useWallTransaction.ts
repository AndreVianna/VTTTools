import { useState, useCallback } from 'react';
import type { EncounterWall, Pole } from '@/types/domain';
import { WallVisibility } from '@/types/domain';
import { cleanWallPoles } from '@/utils/wallUtils';
import type { LocalAction } from '@/types/wallUndoActions';
import type {
    useAddEncounterWallMutation,
    useUpdateEncounterWallMutation
} from '@/services/encounterApi';

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
    localRedoStack: []
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
    const [nextTempId, setNextTempId] = useState<number>(0);

    const startTransaction = useCallback((
        type: TransactionType,
        wall?: EncounterWall,
        placementProperties?: {
            name?: string;
            visibility?: WallVisibility;
            isClosed?: boolean;
            material?: string | undefined;
            color?: string | undefined;
        }
    ) => {
        if (wall) {
            setTransaction({
                type,
                originalWall: wall,
                segments: [{
                    tempId: 0,
                    wallIndex: wall.index,
                    name: wall.name,
                    poles: [...wall.poles],
                    isClosed: wall.isClosed,
                    visibility: wall.visibility,
                    material: wall.material || undefined,
                    color: wall.color || undefined
                }],
                isActive: true,
                localUndoStack: [],
                localRedoStack: []
            });
            setNextTempId(1);
        } else {
            setTransaction({
                type,
                originalWall: null,
                segments: [{
                    tempId: -1,
                    wallIndex: null,
                    name: placementProperties?.name || '',
                    poles: [],
                    visibility: placementProperties?.visibility ?? WallVisibility.Normal,
                    isClosed: placementProperties?.isClosed ?? false,
                    material: placementProperties?.material,
                    color: placementProperties?.color || '#808080'
                }],
                isActive: true,
                localUndoStack: [],
                localRedoStack: []
            });
            setNextTempId(0);
        }
    }, []);

    const addSegment = useCallback((segment: Omit<WallSegment, 'tempId'>): number => {
        const newTempId = -(nextTempId + 1);

        setTransaction(prev => ({
            ...prev,
            segments: [
                ...prev.segments,
                {
                    ...segment,
                    tempId: newTempId
                }
            ]
        }));

        setNextTempId(Math.abs(newTempId));
        return newTempId;
    }, [nextTempId]);

    const updateSegment = useCallback((tempId: number, changes: Partial<WallSegment>) => {
        setTransaction(prev => ({
            ...prev,
            segments: prev.segments.map(segment =>
                segment.tempId === tempId
                    ? { ...segment, ...changes }
                    : segment
            )
        }));
    }, []);

    const removeSegment = useCallback((tempId: number) => {
        setTransaction(prev => ({
            ...prev,
            segments: prev.segments.filter(segment => segment.tempId !== tempId)
        }));
    }, []);

    const commitTransaction = useCallback(async (
        encounterId: string,
        apiHooks: ApiHooks
    ): Promise<CommitResult> => {
        const { addEncounterWall, updateEncounterWall } = apiHooks;
        const results: CommitResult['segmentResults'] = [];

        try {
            const segmentsToProcess = transaction.segments.map(segment => {
                const cleaned = cleanWallPoles(segment.poles, segment.isClosed);
                return {
                    ...segment,
                    poles: cleaned.poles,
                    isClosed: cleaned.isClosed
                };
            });

            const needsNaming = transaction.type === 'editing' &&
                                transaction.originalWall !== null &&
                                segmentsToProcess.length > 1;

            const names = needsNaming
                ? generateBrokenWallNames(
                    transaction.originalWall!.name,
                    segmentsToProcess.length
                  )
                : segmentsToProcess.map(s => s.name);

            for (let i = 0; i < segmentsToProcess.length; i++) {
                const segment = segmentsToProcess[i];
                const assignedName = names[i];

                try {
                    if (segment?.wallIndex !== null) {
                        await updateEncounterWall({
                            encounterId,
                            wallIndex: segment?.wallIndex || 1,
                            name: assignedName,
                            poles: segment?.poles,
                            visibility: segment?.visibility,
                            isClosed: segment?.isClosed || false,
                            material: segment?.material || undefined,
                            color: segment?.color || undefined
                        }).unwrap();

                        results.push({
                            tempId: segment?.tempId || 0,
                            wallIndex: segment?.wallIndex || 0
                        });
                    } else {
                        const result = await addEncounterWall({
                            encounterId,
                            name: assignedName || '',
                            poles: segment?.poles || [],
                            visibility: segment?.visibility || WallVisibility.Normal,
                            isClosed: segment?.isClosed || false,
                            material: segment?.material || undefined,
                            color: segment?.color || undefined
                        }).unwrap();

                        results.push({
                            tempId: segment.tempId,
                            wallIndex: result.index
                        });
                    }
                } catch (error) {
                    results.push({
                        tempId: segment?.tempId || 0,
                        error: error instanceof Error ? error.message : 'Unknown error'
                    });
                }
            }

            const hasErrors = results.some(r => r.error !== undefined);

            if (!hasErrors) {
                setTransaction(INITIAL_TRANSACTION);
                setNextTempId(0);
            }

            return {
                success: !hasErrors,
                segmentResults: results
            };
        } catch (error) {
            return {
                success: false,
                segmentResults: [{
                    tempId: -1,
                    error: error instanceof Error ? error.message : 'Transaction commit failed'
                }]
            };
        }
    }, [transaction]);

    const rollbackTransaction = useCallback(() => {
        setTransaction(INITIAL_TRANSACTION);
        setNextTempId(0);
    }, []);

    const getActiveSegments = useCallback((): WallSegment[] => {
        return transaction.segments;
    }, [transaction.segments]);

    const pushLocalAction = useCallback((action: LocalAction) => {
        setTransaction(prev => ({
            ...prev,
            localUndoStack: [...prev.localUndoStack, action],
            localRedoStack: []
        }));
    }, []);

    const undoLocal = useCallback((onSyncEncounter?: (segments: WallSegment[]) => void) => {
        setTransaction(prev => {
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
                localRedoStack: [...prev.localRedoStack, action]
            };

            if (onSyncEncounter) {
                onSyncEncounter(newState.segments);
            }

            return newState;
        });
    }, []);

    const redoLocal = useCallback((onSyncEncounter?: (segments: WallSegment[]) => void) => {
        setTransaction(prev => {
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
                localUndoStack: [...prev.localUndoStack, action]
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
        updateSegment,
        removeSegment,
        commitTransaction,
        rollbackTransaction,
        getActiveSegments,
        pushLocalAction,
        undoLocal,
        redoLocal,
        canUndoLocal,
        canRedoLocal
    };
};
