import { useState, useCallback, useRef } from 'react';
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
    const segmentsRef = useRef<WallSegment[]>([]);

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
        // Clear ref when starting new transaction
        segmentsRef.current = [];

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
        }
    }, []);

    const addSegment = useCallback((segment: Omit<WallSegment, 'tempId'>): number => {
        let newTempId: number = -1;

        setTransaction(prev => {
            console.log('[useWallTransaction.addSegment] Current state:', {
                segmentCount: prev.segments.length,
                tempIds: prev.segments.map(s => s.tempId)
            });

            const currentNextTempId = Math.max(...prev.segments.map(s => Math.abs(s.tempId)), 0);
            newTempId = -(currentNextTempId + 1);

            console.log('[useWallTransaction.addSegment] Calculated:', {
                currentNextTempId,
                newTempId
            });

            const newState = {
                ...prev,
                segments: [
                    ...prev.segments,
                    {
                        ...segment,
                        tempId: newTempId
                    }
                ]
            };

            console.log('[useWallTransaction.addSegment] New state:', {
                segmentCount: newState.segments.length,
                tempIds: newState.segments.map(s => s.tempId)
            });

            return newState;
        });

        console.log('[useWallTransaction.addSegment] Returning tempId:', newTempId);
        return newTempId;
    }, []);

    const addSegments = useCallback((segments: Array<Omit<WallSegment, 'tempId'>>): void => {
        setTransaction(prev => {
            console.log('[useWallTransaction.addSegments] Current state:', {
                segmentCount: prev.segments.length,
                tempIds: prev.segments.map(s => s.tempId),
                addingCount: segments.length
            });

            let currentNextTempId = Math.max(...prev.segments.map(s => Math.abs(s.tempId)), 0);

            const newSegments = segments.map(segment => {
                currentNextTempId += 1;
                const newTempId = -currentNextTempId;

                console.log('[useWallTransaction.addSegments] Creating segment:', {
                    newTempId,
                    poleCount: segment.poles.length,
                    isClosed: segment.isClosed
                });

                return {
                    ...segment,
                    tempId: newTempId
                };
            });

            const newState = {
                ...prev,
                segments: [...prev.segments, ...newSegments]
            };

            console.log('[useWallTransaction.addSegments] New state:', {
                segmentCount: newState.segments.length,
                tempIds: newState.segments.map(s => s.tempId)
            });

            return newState;
        });

        console.log('[useWallTransaction.addSegments] Batch add initiated for', segments.length, 'segments');
    }, []);

    const setAllSegments = useCallback((segments: WallSegment[]): void => {
        console.log('[useWallTransaction.setAllSegments] Replacing all segments:', {
            newCount: segments.length
        });

        // Reassign tempIds to ensure uniqueness
        const segmentsWithTempIds = segments.map((segment, index) => {
            const newTempId = -(index + 1);
            console.log('[useWallTransaction.setAllSegments] Segment', index, ':', {
                tempId: newTempId,
                poleCount: segment.poles.length,
                isClosed: segment.isClosed
            });

            return {
                ...segment,
                tempId: newTempId
            };
        });

        // Update ref SYNCHRONOUSLY
        segmentsRef.current = segmentsWithTempIds;
        console.log('[useWallTransaction.setAllSegments] Updated segmentsRef:', {
            count: segmentsRef.current.length,
            tempIds: segmentsRef.current.map(s => s.tempId)
        });

        // Update state ASYNCHRONOUSLY
        setTransaction(prev => {
            const newState = {
                ...prev,
                segments: segmentsWithTempIds
            };

            console.log('[useWallTransaction.setAllSegments] New state:', {
                segmentCount: newState.segments.length,
                tempIds: newState.segments.map(s => s.tempId)
            });

            return newState;
        });
    }, []);

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
        apiHooks: ApiHooks,
        segmentsOverride?: WallSegment[]
    ): Promise<CommitResult> => {
        const { addEncounterWall, updateEncounterWall } = apiHooks;
        const results: CommitResult['segmentResults'] = [];

        // Use provided segments, ref, or state (in that order)
        let currentTransaction: WallTransaction;
        if (segmentsOverride) {
            console.log('[useWallTransaction.commitTransaction] Using provided segments:', segmentsOverride.length);
            currentTransaction = {
                ...transaction,
                segments: segmentsOverride
            };
        } else if (segmentsRef.current.length > 0) {
            // Read from ref (updated synchronously by setAllSegments)
            console.log('[useWallTransaction.commitTransaction] Reading from ref:', {
                segmentCount: segmentsRef.current.length,
                tempIds: segmentsRef.current.map(s => s.tempId)
            });
            currentTransaction = {
                ...transaction,
                segments: segmentsRef.current
            };
        } else {
            // Fallback to state
            currentTransaction = transaction;
            console.log('[useWallTransaction.commitTransaction] Reading from state:', {
                segmentCount: currentTransaction.segments.length,
                tempIds: currentTransaction.segments.map(s => s.tempId)
            });
        }

        console.log('[useWallTransaction.commitTransaction] Processing transaction:', {
            segmentCount: currentTransaction.segments.length,
            tempIds: currentTransaction.segments.map(s => s.tempId)
        });

        try {
            const segmentsToProcess = currentTransaction.segments.map(segment => {
                const cleaned = cleanWallPoles(segment.poles, segment.isClosed);
                return {
                    ...segment,
                    poles: cleaned.poles,
                    isClosed: cleaned.isClosed
                };
            });

            console.log('[useWallTransaction.commitTransaction] Segments to process:', segmentsToProcess.length);

            // Generate unique names for multiple segments
            let names: string[];
            if (segmentsToProcess.length > 1) {
                if (currentTransaction.type === 'editing' && currentTransaction.originalWall !== null) {
                    // Editing: Use broken wall naming (e.g., "Wall1.1", "Wall1.2")
                    names = generateBrokenWallNames(
                        currentTransaction.originalWall.name,
                        segmentsToProcess.length
                    );
                    console.log('[useWallTransaction.commitTransaction] Generated broken wall names:', names);
                } else {
                    // Placement: Generate sequential names based on first segment's name
                    const baseName = segmentsToProcess[0]?.name || 'Wall';
                    names = segmentsToProcess.map((_, index) => {
                        if (segmentsToProcess.length === 1) {
                            return baseName;
                        }
                        return `${baseName} ${index + 1}`;
                    });
                    console.log('[useWallTransaction.commitTransaction] Generated placement names:', names);
                }
            } else {
                // Single segment: use existing name
                names = segmentsToProcess.map(s => s.name);
            }

            for (let i = 0; i < segmentsToProcess.length; i++) {
                const segment = segmentsToProcess[i];
                const assignedName = names[i];

                console.log(`[useWallTransaction.commitTransaction] Processing segment ${i}:`, {
                    tempId: segment?.tempId,
                    wallIndex: segment?.wallIndex,
                    poleCount: segment?.poles.length,
                    isClosed: segment?.isClosed,
                    name: assignedName
                });

                try {
                    if (segment?.wallIndex !== null) {
                        console.log(`[useWallTransaction.commitTransaction] Updating wall ${segment?.wallIndex}`);
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
                        console.log(`[useWallTransaction.commitTransaction] Updated wall ${segment?.wallIndex} successfully`);
                    } else {
                        console.log(`[useWallTransaction.commitTransaction] Adding new wall`);
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
                        console.log(`[useWallTransaction.commitTransaction] Added new wall with index ${result.index}`);
                    }
                } catch (error) {
                    console.error(`[useWallTransaction.commitTransaction] Error processing segment ${i}:`, error);
                    results.push({
                        tempId: segment?.tempId || 0,
                        error: error instanceof Error ? error.message : 'Unknown error'
                    });
                }
            }

            console.log('[useWallTransaction.commitTransaction] All segments processed:', {
                totalResults: results.length,
                results: results.map(r => ({
                    tempId: r.tempId,
                    wallIndex: r.wallIndex,
                    error: r.error
                }))
            });

            const hasErrors = results.some(r => r.error !== undefined);

            if (!hasErrors) {
                setTransaction(INITIAL_TRANSACTION);
                segmentsRef.current = []; // Clear ref after successful commit
                console.log('[useWallTransaction.commitTransaction] Cleared segmentsRef after successful commit');
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
    }, [transaction]); // Need transaction for fallback path

    const rollbackTransaction = useCallback(() => {
        setTransaction(INITIAL_TRANSACTION);
        segmentsRef.current = [];
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
        canRedoLocal
    };
};
