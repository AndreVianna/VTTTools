import type React from 'react';
import type { Encounter, EncounterWall, Point, Pole, SegmentState, SegmentType } from '@/types/domain';
import type { WallTransaction } from '@/hooks/useWallTransaction';
import type { RegionTransaction } from '@/hooks/useRegionTransaction';
import { polesToSegments, isWallClosed } from '@/utils/wallUtils';
import { addWallOptimistic, removeWallOptimistic, removeRegionOptimistic, updateWallOptimistic, updateRegionOptimistic } from '@/utils/encounterStateUtils';

export interface StructureHandlerDeps {
    encounterId: string | undefined;
    encounter: Encounter | null;
    wallTransaction: WallTransaction;
    regionTransaction: RegionTransaction;
    setEncounter: React.Dispatch<React.SetStateAction<Encounter | null>>;
    setDrawingWallIndex: React.Dispatch<React.SetStateAction<number | null>>;
    setDrawingWallDefaultHeight: React.Dispatch<React.SetStateAction<number>>;
    setDrawingWallSegmentType: React.Dispatch<React.SetStateAction<SegmentType>>;
    setDrawingWallIsOpaque: React.Dispatch<React.SetStateAction<boolean>>;
    setDrawingWallState: React.Dispatch<React.SetStateAction<SegmentState>>;
    setDrawingRegionIndex: React.Dispatch<React.SetStateAction<number | null>>;
    setErrorMessage: (message: string | null) => void;
    activePanel: string | null;
    regionHandlers: {
        handleStructurePlacementFinish: () => Promise<void>;
    };
    wallHandlers: {
        handleWallPlacementFinish: () => Promise<void>;
    };
}

export interface WallPlacementProperties {
    type: SegmentType;
    isOpaque: boolean;
    state: SegmentState;
    defaultHeight: number;
}

export const createStructureHandlers = (deps: StructureHandlerDeps) => ({
    /**
     * Handle wall vertices change during editing.
     */
    handleVerticesChange: async (wallIndex: number, newPoles: Pole[], newIsClosed?: boolean) => {
        const { wallTransaction, encounter, setEncounter } = deps;

        if (!wallTransaction.transaction.isActive) {
            console.warn('[handleVerticesChange] No active transaction');
            return;
        }

        if (newPoles.length < 2) {
            console.warn('[handleVerticesChange] Wall must have at least 2 poles');
            return;
        }

        const segments = wallTransaction.getActiveSegments();
        const segment = segments.find((s) => s.wallIndex === wallIndex || s.tempId === wallIndex);

        if (!segment) {
            console.warn(`[handleVerticesChange] Segment not found for wallIndex ${wallIndex}`);
            return;
        }

        const wall = encounter?.stage.walls?.find((w) => w.index === wallIndex);
        const effectiveIsClosed = newIsClosed !== undefined ? newIsClosed : (wall ? isWallClosed(wall as EncounterWall) : false);
        const newSegments = polesToSegments(newPoles, effectiveIsClosed);

        wallTransaction.updateSegment(segment.tempId, {
            segments: newSegments,
        });

        setEncounter((prev) => {
            if (!prev) return prev;

            const wall = prev.stage.walls?.find((w) => w.index === wallIndex);
            if (!wall) return prev;

            return updateWallOptimistic(prev, wallIndex, {
                segments: newSegments,
            });
        });
    },

    /**
     * Handle pole insertion (placeholder - currently empty).
     */
    handlePoleInserted: (_wallIndex: number, _insertedAtIndex: number) => {
        // Placeholder for future implementation
    },

    /**
     * Handle pole deletion (placeholder - currently empty).
     */
    handlePoleDeleted: (_wallIndex: number, _deletedIndices: number[]) => {
        // Placeholder for future implementation
    },

    /**
     * Handle region vertices change during editing.
     */
    handleRegionVerticesChange: async (regionIndex: number, newVertices: Point[]) => {
        const { encounter, regionTransaction, setEncounter } = deps;
        if (!encounter) return;

        if (!regionTransaction.transaction.isActive) {
            console.warn('[handleRegionVerticesChange] No active transaction');
            return;
        }

        if (newVertices.length < 3) {
            console.warn('[handleRegionVerticesChange] Region must have at least 3 vertices');
            return;
        }

        const region = encounter.stage.regions?.find((r) => r.index === regionIndex);
        if (!region) return;

        const segment = regionTransaction.transaction.segment;
        if (!segment) {
            console.warn(`[handleRegionVerticesChange] Segment not found for regionIndex ${regionIndex}`);
            return;
        }

        regionTransaction.updateVertices(newVertices);

        const updatedEncounter = updateRegionOptimistic(encounter, regionIndex, {
            vertices: newVertices,
        });
        setEncounter(updatedEncounter);
    },

    /**
     * Cancel region placement and clean up.
     */
    handleRegionPlacementCancel: async () => {
        const { encounter, regionTransaction, setEncounter, setDrawingRegionIndex } = deps;
        if (!encounter) return;

        regionTransaction.rollbackTransaction();

        const cleanEncounter = removeRegionOptimistic(encounter, -1);
        setEncounter(cleanEncounter);

        setDrawingRegionIndex(null);
    },

    /**
     * Finish structure placement (wall or region).
     */
    handleStructurePlacementFinish: async () => {
        const { activePanel, regionHandlers, wallHandlers, setErrorMessage } = deps;
        try {
            if (activePanel === 'regions') {
                await regionHandlers.handleStructurePlacementFinish();
            } else if (activePanel === 'walls') {
                await wallHandlers.handleWallPlacementFinish();
            } else {
                console.warn('[EncounterEditorPage] activePanel is not regions or walls:', activePanel);
            }
        } catch (error) {
            console.error('Failed to finish structure placement:', error);
            setErrorMessage('Failed to complete structure placement. Please try again.');
        }
    },

    /**
     * Cancel structure placement (wall).
     */
    handleStructurePlacementCancel: async () => {
        const { encounter, wallTransaction, setEncounter, setDrawingWallIndex } = deps;
        if (!encounter) return;

        wallTransaction.rollbackTransaction();

        const cleanEncounter = removeWallOptimistic(encounter, -1);
        setEncounter(cleanEncounter);

        setDrawingWallIndex(null);
    },

    /**
     * Start placing a new wall.
     */
    handlePlaceWall: async (properties: WallPlacementProperties) => {
        const {
            encounterId,
            encounter,
            wallTransaction,
            setEncounter,
            setDrawingWallIndex,
            setDrawingWallDefaultHeight,
            setDrawingWallSegmentType,
            setDrawingWallIsOpaque,
            setDrawingWallState,
        } = deps;

        if (!encounterId || !encounter) return;

        const existingWalls = encounter.stage.walls || [];

        const wallNumbers = existingWalls
            .map((w) => {
                if (!w.name) return null;
                const match = w.name.match(/^Wall (\d+)$/);
                return match?.[1] ? parseInt(match[1], 10) : null;
            })
            .filter((n): n is number => n !== null);

        const nextNumber = wallNumbers.length > 0 ? Math.max(...wallNumbers) + 1 : 1;
        const wallName = `Wall ${nextNumber}`;

        wallTransaction.startTransaction('placement', undefined, {
            name: wallName,
        });

        const tempWall: EncounterWall = {
            index: -1,
            name: wallName,
            segments: [],
        };

        const updatedEncounter = addWallOptimistic(encounter, tempWall);
        setEncounter(updatedEncounter);

        setDrawingWallIndex(-1);
        setDrawingWallDefaultHeight(properties.defaultHeight);
        setDrawingWallSegmentType(properties.type);
        setDrawingWallIsOpaque(properties.isOpaque);
        setDrawingWallState(properties.state);
    },
});
