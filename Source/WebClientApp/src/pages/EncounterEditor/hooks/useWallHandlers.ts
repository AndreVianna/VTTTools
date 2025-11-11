import { useCallback } from 'react';
import type { Encounter, EncounterWall, PlacedWall, Pole } from '@/types/domain';
import type { useWallTransaction } from '@/hooks/useWallTransaction';
import type { WallBreakData } from '@components/encounter/editing/WallTransformer';
import type {
    useAddEncounterWallMutation,
    useUpdateEncounterWallMutation,
    useRemoveEncounterWallMutation
} from '@/services/encounterApi';
import { updateWallOptimistic, removeWallOptimistic, syncWallIndices } from '@/utils/encounterStateUtils';
import { createBreakWallAction } from '@/types/wallUndoActions';
import { EditWallCommand, BreakWallCommand, MergeWallsCommand, SplitWallsCommand } from '@/utils/commands/wallCommands';
import type { MergeResult } from '@/utils/wallMergeUtils';
import type { SplitResult } from '@/utils/wallSplitUtils';
import { detectSplitPoints, splitWallAtPoints } from '@/utils/wallSplitUtils';
import {
    getDomIdByIndex,
    removeEntityMapping
} from '@/utils/encounterEntityMapping';
import { hydratePlacedWalls } from '@/utils/encounterMappers';

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

    execute: (command: any) => void;
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
    refetch
}: UseWallHandlersProps) => {

    const handleWallDelete = useCallback(async (wallIndex: number) => {
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

            setSelectedWallIndex(null);
        } catch (error) {
            console.error('Failed to remove wall:', error);
            setErrorMessage('Failed to remove wall. Please try again.');
        }
    }, [encounterId, encounter, removeEncounterWall, refetch, setEncounter, setSelectedWallIndex, setErrorMessage]);

    const handleEditVertices = useCallback((wallIndex: number) => {
        const wall = encounter?.walls?.find(w => w.index === wallIndex);
        if (!wall) return;

        setOriginalWallPoles([...wall.poles]);

        wallTransaction.startTransaction('editing', wall);

        setSelectedWallIndex(wallIndex);
        setIsEditingVertices(true);
        setActivePanel(null);
    }, [encounter, wallTransaction, setOriginalWallPoles, setSelectedWallIndex, setIsEditingVertices, setActivePanel]);

    const handleCancelEditing = useCallback(async () => {
        if (!encounter || selectedWallIndex === null) return;

        const segments = wallTransaction.getActiveSegments();
        const originalWall = wallTransaction.transaction.originalWall;

        wallTransaction.rollbackTransaction();

        let cleanedEncounter = encounter;

        segments.forEach(segment => {
            if (segment.wallIndex === null) {
                cleanedEncounter = removeWallOptimistic(cleanedEncounter, segment.tempId);
            }
        });

        if (originalWall) {
            cleanedEncounter = updateWallOptimistic(cleanedEncounter, selectedWallIndex, {
                poles: originalWall.poles,
                isClosed: originalWall.isClosed,
                name: originalWall.name
            });
        }

        setEncounter(cleanedEncounter);
        setSelectedWallIndex(null);
        setIsEditingVertices(false);
        setOriginalWallPoles(null);
    }, [encounter, selectedWallIndex, wallTransaction, setEncounter, setSelectedWallIndex, setIsEditingVertices, setOriginalWallPoles]);

    const handleFinishEditing = useCallback(async () => {
        if (!encounterId || !encounter || selectedWallIndex === null) return;

        const activeSegments = wallTransaction.getActiveSegments();
        const editedSegment = activeSegments[0];

        if (editedSegment && editedSegment.wallIndex === selectedWallIndex) {
            const updatedEncounter = updateWallOptimistic(encounter, selectedWallIndex, {
                poles: editedSegment.poles,
                isClosed: editedSegment.isClosed
            });
            setEncounter(updatedEncounter);
            const hydratedWalls = hydratePlacedWalls(updatedEncounter.walls || [], encounterId);
            setPlacedWalls(hydratedWalls);
        }

        const result = await wallTransaction.commitTransaction(encounterId, {
            addEncounterWall,
            updateEncounterWall
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

                if (result.segmentResults.length === 1) {
                    const updatedWallIndex = result.segmentResults[0]?.wallIndex;
                    if (updatedWallIndex !== undefined) {
                        const editedWall = updatedEncounter.walls?.find(w => w.index === updatedWallIndex);
                        if (editedWall) {
                            const otherWalls = (updatedEncounter.walls || []).filter(w => w.index !== updatedWallIndex);
                            const splitResult = detectSplitPoints({
                                newWallPoles: editedWall.poles,
                                existingWalls: otherWalls,
                                tolerance: 5
                            });

                            try {
                                if (splitResult.needsSplit) {
                                    const affectedWalls: Array<{
                                        wallIndex: number;
                                        originalWall: EncounterWall;
                                        segments: EncounterWall[];
                                    }> = [];

                                    for (const wallIndex of splitResult.affectedWallIndices) {
                                        const wall = otherWalls.find(w => w.index === wallIndex);
                                        if (!wall) continue;

                                        const segments = splitWallAtPoints({
                                            wall,
                                            wallIndex,
                                            splitPoints: splitResult.splits
                                        });

                                        if (segments.length > 0) {
                                            affectedWalls.push({ wallIndex, originalWall: wall, segments });
                                        }
                                    }

                                    if (affectedWalls.length > 0) {
                                        const command = new SplitWallsCommand({
                                            encounterId,
                                            newWall: editedWall,
                                            affectedWalls,
                                            onUpdate: async (encounterId, wallIndex, updates) => {
                                                await updateEncounterWall({ encounterId, wallIndex, ...updates }).unwrap();
                                            },
                                            onAdd: async (encounterId, wallData) => {
                                                const result = await addEncounterWall({ encounterId, ...wallData }).unwrap();
                                                return result;
                                            },
                                            onRemove: async (encounterId, wallIndex) => {
                                                await removeEncounterWall({ encounterId, wallIndex }).unwrap();
                                            },
                                            onRefetch: async () => {
                                                const { data } = await refetch();
                                                if (data) {
                                                    const hydratedWalls = hydratePlacedWalls(data.walls || [], encounterId);
                                                    setEncounter(data);
                                                    setPlacedWalls(hydratedWalls);
                                                }
                                            }
                                        });

                                        await execute(command);

                                        setTimeout(() => {
                                            setSelectedWallIndex(null);
                                            setIsEditingVertices(false);
                                            setOriginalWallPoles(null);
                                        }, 0);
                                        return;
                                    }
                                }
                            } catch (error) {
                                console.error('[useWallHandlers] Edit split failed:', error);
                                setErrorMessage('Failed to split walls after edit. Please try again.');

                                const { data: freshEncounter } = await refetch();
                                if (freshEncounter) {
                                    const hydratedWalls = hydratePlacedWalls(freshEncounter.walls || [], encounterId);
                                    setEncounter(freshEncounter);
                                    setPlacedWalls(hydratedWalls);
                                }
                            }
                        }
                    }
                }

                if (result.segmentResults.length > 1) {
                    const newWalls: EncounterWall[] = [];
                    result.segmentResults.forEach(r => {
                        if (r.wallIndex !== undefined) {
                            const wall = updatedEncounter.walls?.find(w => w.index === r.wallIndex);
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
                            const result = await addEncounterWall({ encounterId, ...wallData }).unwrap();
                            return result;
                        },
                        onUpdate: async (encounterId: string, wallIndex: number, updates: Partial<EncounterWall>) => {
                            await updateEncounterWall({ encounterId, wallIndex, ...updates }).unwrap();
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
                        }
                    });
                    await execute(command);
                } else if (result.segmentResults[0]?.wallIndex !== undefined) {
                    const segmentResult = result.segmentResults[0]!;
                    const wallIndex = segmentResult.wallIndex!;
                    const updatedWall = updatedEncounter.walls?.find(w => w.index === wallIndex);
                    if (updatedWall) {
                        const command = new EditWallCommand({
                            encounterId,
                            wallIndex,
                            oldWall: originalWall,
                            newWall: updatedWall,
                            onUpdate: async (encounterId, wallIndex, updates) => {
                                try {
                                    await updateEncounterWall({ encounterId, wallIndex, ...updates }).unwrap();
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
                            }
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
    }, [encounterId, encounter, selectedWallIndex, wallTransaction, addEncounterWall, updateEncounterWall, removeEncounterWall, refetch, setEncounter, setPlacedWalls, setSelectedWallIndex, setIsEditingVertices, setOriginalWallPoles, setErrorMessage, execute]);

    const handleWallBreak = useCallback(async (breakData: WallBreakData) => {
        if (!encounter) return;

        const activeSegments = wallTransaction.getActiveSegments();
        const breakingSegment = activeSegments.find(s => s.poles.length > 0);
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
            (tempId: number, changes: any) => wallTransaction.updateSegment(tempId, changes),
            (segment: any) => wallTransaction.addSegment(segment)
        );

        wallTransaction.pushLocalAction(breakAction);
    }, [encounter, wallTransaction]);

    const handleWallSelect = useCallback((wallIndex: number | null) => {
        setSelectedWallIndex(wallIndex);
    }, [setSelectedWallIndex]);

    const handleWallPlacementFinish = useCallback(async () => {
        if (!encounterId || !encounter) return;
        if (drawingMode !== 'wall' || drawingWallIndex === null) return;

        const result = await wallTransaction.commitTransaction(encounterId, {
            addEncounterWall,
            updateEncounterWall
        });

        if (result.success && result.segmentResults.length > 0) {
            const tempToReal = new Map<number, number>();
            result.segmentResults.forEach(r => {
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
    }, [encounterId, encounter, drawingMode, drawingWallIndex, wallTransaction, addEncounterWall, updateEncounterWall, setEncounter, setPlacedWalls, setDrawingWallIndex, setDrawingMode, setErrorMessage]);

    const handleWallPlacementFinishWithMerge = useCallback(async (mergeResult: MergeResult) => {
        if (!encounterId || !encounter) return;
        if (drawingMode !== 'wall' || drawingWallIndex === null) return;

        try {
            if (mergeResult.targetWallIndex === undefined) {
                setErrorMessage('Merge failed: No target wall');
                return;
            }

            const targetWall = encounter.walls?.find(w => w.index === mergeResult.targetWallIndex);
            if (!targetWall) {
                setErrorMessage('Merge failed: Target wall not found');
                return;
            }

            const mergedPoles: Pole[] = mergeResult.mergedPoles.map((point, index) => ({
                x: point.x,
                y: point.y,
                h: targetWall.poles[index]?.h ?? 0
            }));

            const mergedWall: EncounterWall = {
                ...targetWall,
                poles: mergedPoles,
                isClosed: mergeResult.isClosed
            };

            const originalWalls: EncounterWall[] = [];
            for (const mergePoint of mergeResult.mergePoints) {
                const wall = encounter.walls?.find(w => w.index === mergePoint.wallIndex);
                if (wall && !originalWalls.some(w => w.index === wall.index)) {
                    originalWalls.push(wall);
                }
            }
            if (!originalWalls.some(w => w.index === mergeResult.targetWallIndex)) {
                originalWalls.push(targetWall);
            }

            const command = new MergeWallsCommand({
                encounterId,
                targetWallIndex: mergeResult.targetWallIndex,
                mergedWall,
                originalWalls,
                wallsToDelete: mergeResult.wallsToDelete,
                onUpdate: async (encounterId, wallIndex, updates) => {
                    await updateEncounterWall({ encounterId, wallIndex, ...updates }).unwrap();
                },
                onAdd: async (encounterId, wallData) => {
                    const result = await addEncounterWall({ encounterId, ...wallData }).unwrap();
                    return result;
                },
                onRemove: async (encounterId, wallIndex) => {
                    await removeEncounterWall({ encounterId, wallIndex }).unwrap();
                },
                onRefetch: async () => {
                    const { data } = await refetch();
                    if (data) {
                        setEncounter(data);
                        const hydratedWalls = hydratePlacedWalls(data.walls || [], encounterId);
                        setPlacedWalls(hydratedWalls);
                    }
                }
            });

            await execute(command);

        } catch (error) {
            console.error('[useWallHandlers] Merge failed:', error);
            setErrorMessage('Failed to merge walls. Please try again.');
            wallTransaction.rollbackTransaction();

            const { data: freshEncounter } = await refetch();
            if (freshEncounter) {
                setEncounter(freshEncounter);
                const hydratedWalls = hydratePlacedWalls(freshEncounter.walls || [], encounterId);
                setPlacedWalls(hydratedWalls);
            }
        }

        setDrawingWallIndex(null);
        setDrawingMode(null);
    }, [encounterId, encounter, drawingMode, drawingWallIndex, wallTransaction, addEncounterWall, updateEncounterWall, removeEncounterWall, refetch, setEncounter, setPlacedWalls, setDrawingWallIndex, setDrawingMode, setErrorMessage, execute]);

    const handleWallPlacementFinishWithSplit = useCallback(async (splitResult: SplitResult) => {
        if (!encounterId || !encounter) return;
        if (drawingMode !== 'wall' || drawingWallIndex === null) return;

        try {
            const newWallResult = await wallTransaction.commitTransaction(encounterId, {
                addEncounterWall,
                updateEncounterWall
            });

            if (!newWallResult.success) {
                setErrorMessage('Failed to place new wall. Please try again.');
                return;
            }

            const newWallIndex = newWallResult.segmentResults[0]?.wallIndex;
            if (newWallIndex === undefined) {
                setErrorMessage('Failed to get new wall index.');
                return;
            }

            const { data: encounterWithNewWall } = await refetch();
            if (!encounterWithNewWall) {
                setErrorMessage('Failed to refetch encounter after new wall placement.');
                return;
            }

            const newWall = encounterWithNewWall.walls?.find(w => w.index === newWallIndex);
            if (!newWall) {
                setErrorMessage('Failed to find new wall in encounter.');
                return;
            }

            const affectedWalls: Array<{
                wallIndex: number;
                originalWall: EncounterWall;
                segments: EncounterWall[];
            }> = [];

            for (const wallIndex of splitResult.affectedWallIndices) {
                const originalWall = encounter.walls?.find(w => w.index === wallIndex);
                if (!originalWall) {
                    console.warn(`[useWallHandlers] Wall ${wallIndex} not found for splitting`);
                    continue;
                }

                const segments = splitWallAtPoints({
                    wall: originalWall,
                    wallIndex,
                    splitPoints: splitResult.splits
                });

                if (segments.length === 0) {
                    console.warn(`[useWallHandlers] No segments created for wall ${wallIndex}`);
                    continue;
                }

                affectedWalls.push({ wallIndex, originalWall, segments });
            }

            if (affectedWalls.length === 0) {
                console.warn('[useWallHandlers] No walls to split');
                return;
            }

            const command = new SplitWallsCommand({
                encounterId,
                newWall,
                affectedWalls,
                onUpdate: async (encounterId, wallIndex, updates) => {
                    await updateEncounterWall({ encounterId, wallIndex, ...updates }).unwrap();
                },
                onAdd: async (encounterId, wallData) => {
                    const result = await addEncounterWall({ encounterId, ...wallData }).unwrap();
                    return result;
                },
                onRemove: async (encounterId, wallIndex) => {
                    await removeEncounterWall({ encounterId, wallIndex }).unwrap();
                },
                onRefetch: async () => {
                    const { data } = await refetch();
                    if (data) {
                        setEncounter(data);
                        const hydratedWalls = hydratePlacedWalls(data.walls || [], encounterId);
                        setPlacedWalls(hydratedWalls);
                    }
                }
            });

            await execute(command);

        } catch (error) {
            console.error('[useWallHandlers] Split failed:', error);
            setErrorMessage('Failed to split walls. Please try again.');
            wallTransaction.rollbackTransaction();

            const { data: freshEncounter } = await refetch();
            if (freshEncounter) {
                setEncounter(freshEncounter);
                const hydratedWalls = hydratePlacedWalls(freshEncounter.walls || [], encounterId);
                setPlacedWalls(hydratedWalls);
            }
        }

        setDrawingWallIndex(null);
        setDrawingMode(null);
    }, [encounterId, encounter, drawingMode, drawingWallIndex, wallTransaction, addEncounterWall, updateEncounterWall, removeEncounterWall, refetch, execute, setEncounter, setPlacedWalls, setDrawingWallIndex, setDrawingMode, setErrorMessage]);

    return {
        handleWallDelete,
        handleEditVertices,
        handleCancelEditing,
        handleFinishEditing,
        handleWallBreak,
        handleWallSelect,
        handleWallPlacementFinish,
        handleWallPlacementFinishWithMerge,
        handleWallPlacementFinishWithSplit
    };
};
