import { useState, useCallback } from 'react';
import type { SceneRegion, Point, Scene } from '@/types/domain';
import type {
    useAddSceneRegionMutation,
    useUpdateSceneRegionMutation
} from '@/services/sceneApi';
import type { GridConfig } from '@/utils/gridCalculator';
import { cleanPolygonVertices } from '@/utils/polygonUtils';
import { findMergeableRegions, mergePolygons } from '@/utils/regionMergeUtils';

export type TransactionType = 'placement' | 'editing' | null;

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
    originalRegion: SceneRegion | null;
    segment: RegionSegment | null;
    isActive: boolean;
    localUndoStack: LocalAction[];
    localRedoStack: LocalAction[];
}

export interface CommitResult {
    success: boolean;
    regionIndex?: number;
    action?: 'create' | 'edit' | 'merge';
    targetRegionIndex?: number;
    mergedVertices?: Point[];
    regionsToDelete?: number[];
    originalRegions?: SceneRegion[];
    error?: string;
}

interface ApiHooks {
    addSceneRegion: ReturnType<typeof useAddSceneRegionMutation>[0];
    updateSceneRegion: ReturnType<typeof useUpdateSceneRegionMutation>[0];
}

type LocalAction = {
    undo: () => void;
    redo: () => void;
};

const INITIAL_TRANSACTION: RegionTransaction = {
    type: null,
    originalRegion: null,
    segment: null,
    isActive: false,
    localUndoStack: [],
    localRedoStack: []
};

/**
 * Manages region placement and editing transactions for the scene editor.
 * Regions are always closed polygons requiring minimum 3 vertices.
 *
 * Provides transaction lifecycle management (start, update, commit, cancel) and
 * local undo/redo operations for vertex manipulation during active transactions.
 *
 * @returns Transaction state and mutation functions for region operations
 *
 * @example
 * const {
 *     transaction,
 *     startTransaction,
 *     addVertex,
 *     commitTransaction,
 *     undoLocal,
 *     redoLocal
 * } = useRegionTransaction();
 *
 * // Start new region placement
 * startTransaction('placement', undefined, {
 *     name: 'Danger Zone',
 *     type: 'Elevation',
 *     color: '#FF0000'
 * });
 *
 * // Add vertices (minimum 3 required for commit)
 * addVertex({ x: 100, y: 100 });
 * addVertex({ x: 200, y: 100 });
 * addVertex({ x: 150, y: 200 });
 *
 * // Commit to backend
 * const result = await commitTransaction(sceneId, {
 *     addSceneRegion,
 *     updateSceneRegion
 * });
 */
export const useRegionTransaction = () => {
    const [transaction, setTransaction] = useState<RegionTransaction>(INITIAL_TRANSACTION);
    const [_nextTempId, setNextTempId] = useState<number>(0);

    const startTransaction = useCallback((
        type: TransactionType,
        region?: SceneRegion,
        placementProperties?: {
            name?: string;
            type?: string;
            value?: number;
            label?: string;
            color?: string;
        }
    ) => {
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
                    ...(region.color !== undefined && { color: region.color })
                },
                isActive: true,
                localUndoStack: [],
                localRedoStack: []
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
                    ...(placementProperties?.value !== undefined && { value: placementProperties.value }),
                    ...(placementProperties?.label !== undefined && { label: placementProperties.label }),
                    color: placementProperties?.color || '#808080'
                },
                isActive: true,
                localUndoStack: [],
                localRedoStack: []
            });
            setNextTempId(0);
        }
    }, []);

    const addVertex = useCallback((vertex: Point) => {
        setTransaction(prev => {
            if (!prev.segment) {
                return prev;
            }

            return {
                ...prev,
                segment: {
                    ...prev.segment,
                    vertices: [...prev.segment.vertices, vertex]
                }
            };
        });
    }, []);

    const updateVertices = useCallback((vertices: Point[]) => {
        setTransaction(prev => {
            if (!prev.segment) {
                return prev;
            }

            return {
                ...prev,
                segment: {
                    ...prev.segment,
                    vertices
                }
            };
        });
    }, []);

    const updateSegmentProperties = useCallback((changes: Partial<Omit<RegionSegment, 'tempId' | 'regionIndex'>>) => {
        setTransaction(prev => {
            if (!prev.segment) {
                return prev;
            }

            return {
                ...prev,
                segment: {
                    ...prev.segment,
                    ...changes
                }
            };
        });
    }, []);

    const commitTransaction = useCallback(async (
        sceneId: string,
        apiHooks: ApiHooks,
        currentScene?: Scene,
        gridConfig?: GridConfig
    ): Promise<CommitResult> => {
        const { addSceneRegion, updateSceneRegion } = apiHooks;

        console.log('commitTransaction called with:', { sceneId, hasSegment: !!transaction.segment, segmentVertices: transaction.segment?.vertices?.length });
        try {
            if (!transaction.segment) {
                return {
                    success: false,
                    error: 'No segment to commit'
                };
            }

            const segment = transaction.segment;

            if (currentScene?.regions) {
                console.log('Checking for mergeable regions, currentScene.regions count:', currentScene.regions.length);
                const mergeableRegions = findMergeableRegions(
                    currentScene.regions,
                    segment.vertices,
                    segment.type,
                    segment.value,
                    segment.label
                );

                console.log('findMergeableRegions found:', mergeableRegions.length, 'regions', mergeableRegions);
                if (mergeableRegions.length > 0) {
                    const sortedRegions = [...mergeableRegions].sort((a, b) => a.index - b.index);
                    const targetRegion = sortedRegions[0];
                    if (!targetRegion) {
                        return {
                            success: false,
                            error: 'Merge target region not found'
                        };
                    }

                    const allVertices = [
                        segment.vertices,
                        ...mergeableRegions.map(r => r.vertices)
                    ];
                    const mergedVertices = mergePolygons(allVertices, gridConfig);

                    const regionsToDelete: number[] = [];
                    sortedRegions.slice(1).forEach(r => regionsToDelete.push(r.index));

                    if (segment.regionIndex !== null && segment.regionIndex !== targetRegion.index) {
                        regionsToDelete.push(segment.regionIndex);
                    }

                    console.log('Returning merge action for targetRegion:', targetRegion.index);
                    return {
                        success: true,
                        action: 'merge',
                        targetRegionIndex: targetRegion.index,
                        mergedVertices,
                        regionsToDelete,
                        originalRegions: mergeableRegions
                    };
                }
            }

            const cleanedVertices = cleanPolygonVertices(segment.vertices, true);

            console.log('No merge detected, proceeding to create/edit. Cleaned vertices:', cleanedVertices.length);
            if (cleanedVertices.length < 3) {
                return {
                    success: false,
                    error: 'Region requires minimum 3 vertices'
                };
            }

            if (segment.regionIndex !== null) {
                console.log('Segment has regionIndex (EDIT mode):', segment.regionIndex);
                const updateData: {
                    sceneId: string;
                    regionIndex: number;
                    name: string;
                    vertices: Point[];
                    type: string;
                    value?: number;
                    label?: string;
                    color?: string;
                } = {
                    sceneId,
                    regionIndex: segment.regionIndex,
                    name: segment.name,
                    vertices: cleanedVertices,
                    type: segment.type,
                    ...(segment.value !== undefined && { value: segment.value }),
                    ...(segment.label !== undefined && { label: segment.label }),
                    ...(segment.color !== undefined && { color: segment.color })
                };
                await updateSceneRegion(updateData).unwrap();

                setTransaction(INITIAL_TRANSACTION);
                setNextTempId(0);

                return {
                    success: true,
                    action: 'edit',
                    regionIndex: segment.regionIndex
                };
            } else {
                console.log('Segment has NO regionIndex (CREATE mode), will call addSceneRegion');
                const addData: {
                    sceneId: string;
                    name: string;
                    vertices: Point[];
                    type: string;
                    value?: number;
                    label?: string;
                    color?: string;
                } = {
                    sceneId,
                    name: segment.name,
                    vertices: cleanedVertices,
                    type: segment.type,
                    ...(segment.value !== undefined && { value: segment.value }),
                    ...(segment.label !== undefined && { label: segment.label }),
                    ...(segment.color !== undefined && { color: segment.color })
                };
                console.log('About to call addSceneRegion with:', addData);
                const result = await addSceneRegion(addData).unwrap();
                console.log('addSceneRegion result:', result);

                setTransaction(INITIAL_TRANSACTION);
                setNextTempId(0);

                return {
                    success: true,
                    action: 'create',
                    regionIndex: result.index
                };
            }
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Transaction commit failed'
            };
        }
    }, [transaction]);

    const rollbackTransaction = useCallback(() => {
        setTransaction(INITIAL_TRANSACTION);
        setNextTempId(0);
    }, []);

    const getActiveSegment = useCallback((): RegionSegment | null => {
        return transaction.segment;
    }, [transaction.segment]);

    const pushLocalAction = useCallback((action: LocalAction) => {
        setTransaction(prev => ({
            ...prev,
            localUndoStack: [...prev.localUndoStack, action],
            localRedoStack: []
        }));
    }, []);

    const undoLocal = useCallback((onSyncScene?: (segment: RegionSegment | null) => void) => {
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

            if (onSyncScene) {
                onSyncScene(newState.segment);
            }

            return newState;
        });
    }, []);

    const redoLocal = useCallback((onSyncScene?: (segment: RegionSegment | null) => void) => {
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

            if (onSyncScene) {
                onSyncScene(newState.segment);
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

    const clearLocalStacks = useCallback(() => {
        setTransaction(prev => ({
            ...prev,
            localUndoStack: [],
            localRedoStack: []
        }));
    }, []);

    return {
        transaction,
        startTransaction,
        addVertex,
        updateVertices,
        updateSegmentProperties,
        commitTransaction,
        rollbackTransaction,
        getActiveSegment,
        pushLocalAction,
        undoLocal,
        redoLocal,
        canUndoLocal,
        canRedoLocal,
        clearLocalStacks
    };
};
