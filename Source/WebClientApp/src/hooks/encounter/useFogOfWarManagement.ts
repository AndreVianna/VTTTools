import type React from 'react';
import { useCallback, useMemo, useState } from 'react';
import { useFogOfWarPlacement } from '@/hooks/useFogOfWarPlacement';
import type { Encounter, PlacedRegion, Point, RegionType } from '@/types/domain';
import { CreateFogOfWarRegionCommand, RevealAllFogOfWarCommand } from '@/utils/commands/fogOfWarCommands';
import { toRegionType } from '@/utils/encounter';
import { hydratePlacedRegions } from '@/utils/encounterMappers';

export interface UseFogOfWarManagementProps {
    /** Current encounter ID */
    encounterId: string;
    /** Current placed regions */
    placedRegions: PlacedRegion[];
    /** Stage dimensions for full-stage fog operations */
    stageSize: { width: number; height: number };
    /** Callback to update placed regions state */
    setPlacedRegions: React.Dispatch<React.SetStateAction<PlacedRegion[]>>;
    /** Callback to update encounter state */
    setEncounter: React.Dispatch<React.SetStateAction<Encounter | null>>;
    /** Callback to set error message */
    setErrorMessage: (message: string | null) => void;
    /** RTK Query refetch function */
    refetch: () => Promise<{ data?: Encounter }>;
    /** Undo/redo execute function */
    execute: (command: unknown) => Promise<void>;
    /** RTK Query addRegion mutation */
    addRegion: (params: {
        stageId: string;
        data: {
            type: RegionType;
            name: string;
            label?: string;
            value?: number;
            vertices: Point[];
        };
    }) => { unwrap: () => Promise<{ index: number }> };
    /** RTK Query deleteRegion mutation */
    deleteRegion: (params: { stageId: string; index: number }) => { unwrap: () => Promise<void> };
}

export interface UseFogOfWarManagementReturn {
    /** Current fog mode (add or subtract) */
    fogMode: 'add' | 'subtract';
    /** Current fog drawing tool */
    fogDrawingTool: 'polygon' | 'bucketFill' | null;
    /** Current fog drawing vertices */
    fogDrawingVertices: Point[];
    /** Setter for fog drawing vertices */
    setFogDrawingVertices: React.Dispatch<React.SetStateAction<Point[]>>;
    /** Setter for fog drawing tool */
    setFogDrawingTool: React.Dispatch<React.SetStateAction<'polygon' | 'bucketFill' | null>>;
    /** Computed fog of war regions */
    fowRegions: PlacedRegion[];
    /** Handler for fog mode change */
    handleFogModeChange: (mode: 'add' | 'subtract') => void;
    /** Handler to start polygon drawing */
    handleFogDrawPolygon: () => void;
    /** Handler to start bucket fill */
    handleFogBucketFill: () => void;
    /** Handler to hide all (full stage fog) */
    handleFogHideAll: () => Promise<void>;
    /** Handler to reveal all (remove all fog) */
    handleFogRevealAll: () => Promise<void>;
    /** Handler for polygon completion from drawing tool */
    handlePolygonComplete: (vertices: Point[]) => Promise<void>;
    /** Handler for bucket fill completion */
    handleBucketFillComplete: (cellsToFill: Point[][]) => Promise<void>;
}

/**
 * Hook to manage fog of war state and operations.
 * Extracted from EncounterEditorPage for better organization.
 */
export function useFogOfWarManagement({
    encounterId,
    placedRegions,
    stageSize,
    setPlacedRegions,
    setEncounter,
    setErrorMessage,
    refetch,
    execute,
    addRegion,
    deleteRegion,
}: UseFogOfWarManagementProps): UseFogOfWarManagementReturn {
    // State
    const [fogMode, setFogMode] = useState<'add' | 'subtract'>('add');
    const [fogDrawingTool, setFogDrawingTool] = useState<'polygon' | 'bucketFill' | null>(null);
    const [fogDrawingVertices, setFogDrawingVertices] = useState<Point[]>([]);

    // Computed
    const fowRegions = useMemo(() => {
        return placedRegions?.filter((r) => r.type === 'FogOfWar') || [];
    }, [placedRegions]);

    // Use the fog of war placement hook
    const { handlePolygonComplete, handleBucketFillComplete } = useFogOfWarPlacement({
        encounterId: encounterId || '',
        existingRegions: placedRegions || [],
        mode: fogMode,
        onRegionCreated: async (region) => {
            try {
                const command = new CreateFogOfWarRegionCommand({
                    encounterId: encounterId || '',
                    region,
                    onAdd: async (encId, regionData) => {
                        const result = await addRegion({
                            stageId: encId,
                            data: {
                                type: toRegionType(regionData.type),
                                name: regionData.name,
                                ...(regionData.label !== undefined && { label: regionData.label }),
                                ...(regionData.value !== undefined && { value: regionData.value }),
                                vertices: regionData.vertices,
                            },
                        }).unwrap();
                        return result;
                    },
                    onRemove: async (encId, regionIndex) => {
                        await deleteRegion({
                            stageId: encId,
                            index: regionIndex,
                        }).unwrap();
                    },
                    onRefetch: async () => {
                        const { data } = await refetch();
                        if (data) {
                            setEncounter(data);
                            const hydratedRegions = hydratePlacedRegions(data.stage.regions || [], encounterId || '');
                            setPlacedRegions(hydratedRegions);
                        }
                    },
                });

                await execute(command);
                setFogDrawingTool(null);
            } catch (error) {
                console.error('Failed to create FoW region:', error);
                setErrorMessage('Failed to create fog region. Please try again.');
            }
        },
        onRegionsDeleted: async (regionIndices) => {
            try {
                for (const regionIndex of regionIndices) {
                    await deleteRegion({
                        stageId: encounterId || '',
                        index: regionIndex,
                    }).unwrap();
                }
                const { data } = await refetch();
                if (data) {
                    setEncounter(data);
                    const hydratedRegions = hydratePlacedRegions(data.stage.regions || [], encounterId || '');
                    setPlacedRegions(hydratedRegions);
                }
            } catch (error) {
                console.error('Failed to delete old FoW regions:', error);
                setErrorMessage('Failed to merge fog regions. Please try again.');
            }
        },
    });

    // Handlers
    const handleFogModeChange = useCallback((mode: 'add' | 'subtract') => {
        setFogMode(mode);
    }, []);

    const handleFogDrawPolygon = useCallback(() => {
        setFogDrawingTool('polygon');
    }, []);

    const handleFogBucketFill = useCallback(() => {
        setFogDrawingTool('bucketFill');
    }, []);

    const handleFogHideAll = useCallback(async () => {
        try {
            if (fogMode !== 'add') {
                setFogMode('add');
                return;
            }

            const fullStageVertices: Point[] = [
                { x: 0, y: 0 },
                { x: stageSize.width, y: 0 },
                { x: stageSize.width, y: stageSize.height },
                { x: 0, y: stageSize.height },
            ];

            await handlePolygonComplete(fullStageVertices);
        } catch (error) {
            console.error('Failed to hide all areas:', error);
            setErrorMessage('Failed to hide all areas. Please try again.');
        }
    }, [fogMode, stageSize, handlePolygonComplete, setErrorMessage]);

    const handleFogRevealAll = useCallback(async () => {
        try {
            const fowRegionsToReveal = (placedRegions || [])
                .filter((region) => region.type === 'FogOfWar')
                .map((pr) => ({
                    encounterId: pr.encounterId,
                    index: pr.index,
                    name: pr.name,
                    type: pr.type,
                    vertices: pr.vertices,
                    ...(pr.value !== undefined && { value: pr.value }),
                    ...(pr.label !== undefined && { label: pr.label }),
                }));

            if (fowRegionsToReveal.length === 0) {
                return;
            }

            const command = new RevealAllFogOfWarCommand({
                encounterId: encounterId || '',
                fogRegions: fowRegionsToReveal,
                onAdd: async (encId, regionData) => {
                    const result = await addRegion({
                        stageId: encId,
                        data: {
                            type: toRegionType(regionData.type),
                            name: regionData.name,
                            ...(regionData.label !== undefined && { label: regionData.label }),
                            ...(regionData.value !== undefined && { value: regionData.value }),
                            vertices: regionData.vertices,
                        },
                    }).unwrap();
                    return result;
                },
                onRemove: async (encId, regionIndex) => {
                    await deleteRegion({
                        stageId: encId,
                        index: regionIndex,
                    }).unwrap();
                },
                onRefetch: async () => {
                    const { data } = await refetch();
                    if (data) {
                        setEncounter(data);
                        const hydratedRegions = hydratePlacedRegions(data.stage.regions || [], encounterId || '');
                        setPlacedRegions(hydratedRegions);
                    }
                },
            });

            await execute(command);
        } catch (error) {
            console.error('Failed to reveal all areas:', error);
            setErrorMessage('Failed to reveal all areas. Please try again.');
        }
    }, [placedRegions, encounterId, addRegion, deleteRegion, refetch, execute, setEncounter, setPlacedRegions, setErrorMessage]);

    return {
        fogMode,
        fogDrawingTool,
        fogDrawingVertices,
        setFogDrawingVertices,
        setFogDrawingTool,
        fowRegions,
        handleFogModeChange,
        handleFogDrawPolygon,
        handleFogBucketFill,
        handleFogHideAll,
        handleFogRevealAll,
        handlePolygonComplete,
        handleBucketFillComplete,
    };
}
