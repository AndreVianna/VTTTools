import type React from 'react';
import { useCallback } from 'react';
import type { SaveStatus } from '@/components/common';
import type { Encounter, UpdateEncounterRequest } from '@/types/domain';
import { GridType, type GridConfig } from '@/utils/gridCalculator';

export interface SaveChangesOverrides {
    name?: string;
    description?: string;
    isPublished?: boolean;
    grid?: {
        type: GridType;
        cellSize: { width: number; height: number };
        offset: { left: number; top: number };
        snap?: boolean;
        scale?: number;
    };
}

export interface UseSaveChangesProps {
    /** Current encounter ID */
    encounterId: string | undefined;
    /** Current encounter data */
    encounter: Encounter | null;
    /** Whether the editor has been initialized */
    isInitialized: boolean;
    /** Current grid configuration */
    gridConfig: GridConfig;
    /** RTK Query patchEncounter mutation */
    patchEncounter: (params: { id: string; request: UpdateEncounterRequest }) => {
        unwrap: () => Promise<Encounter | undefined>;
    };
    /** Refetch encounter data */
    refetch: () => Promise<void>;
    /** Set the save status indicator */
    setSaveStatus: (status: SaveStatus) => void;
    /** Update encounter state */
    setEncounter: React.Dispatch<React.SetStateAction<Encounter | null>>;
}

export interface UseSaveChangesReturn {
    /** Save changes to the encounter */
    saveChanges: (overrides?: SaveChangesOverrides) => Promise<void>;
}

/**
 * Hook to manage saving encounter changes.
 * Handles change detection, payload building, and API calls.
 */
export function useSaveChanges({
    encounterId,
    encounter,
    isInitialized,
    gridConfig,
    patchEncounter,
    refetch,
    setSaveStatus,
    setEncounter,
}: UseSaveChangesProps): UseSaveChangesReturn {
    const saveChanges = useCallback(
        async (overrides?: SaveChangesOverrides) => {
            if (!encounterId || !encounter || !isInitialized) {
                return;
            }

            const currentData = {
                name: encounter.name,
                description: encounter.description,
                isPublished: encounter.isPublished,
                grid: {
                    type: gridConfig.type,
                    cellSize: gridConfig.cellSize,
                    offset: gridConfig.offset,
                    scale: gridConfig.scale,
                },
                ...overrides,
            };

            const existingGridType =
                typeof encounter.stage.grid.type === 'string'
                    ? GridType[encounter.stage.grid.type as keyof typeof GridType]
                    : encounter.stage.grid.type;

            const existingGrid = {
                type: existingGridType,
                cellSize: encounter.stage.grid.cellSize,
                offset: encounter.stage.grid.offset,
                scale: encounter.stage.grid.scale,
            };

            const hasChanges =
                currentData.name !== encounter.name ||
                currentData.description !== encounter.description ||
                currentData.isPublished !== encounter.isPublished ||
                JSON.stringify(currentData.grid) !== JSON.stringify(existingGrid);

            if (!hasChanges) {
                return;
            }

            setSaveStatus('saving');

            const requestPayload: Record<string, unknown> = {};

            if (currentData.name !== encounter.name) {
                requestPayload.name = currentData.name;
            }
            if (currentData.description !== encounter.description) {
                requestPayload.description = currentData.description;
            }
            if (currentData.isPublished !== encounter.isPublished) {
                requestPayload.isPublished = currentData.isPublished;
            }
            if (
                overrides?.grid ||
                JSON.stringify(currentData.grid) !== JSON.stringify(existingGrid)
            ) {
                requestPayload.grid = currentData.grid;
            }

            try {
                const result = await patchEncounter({
                    id: encounterId,
                    request: requestPayload as UpdateEncounterRequest,
                }).unwrap();

                if (result) {
                    setEncounter(result);
                } else {
                    await refetch();
                }

                setSaveStatus('saved');
            } catch (error) {
                console.error('Failed to save encounter:', error);
                setSaveStatus('error');
            }
        },
        [encounterId, encounter, isInitialized, gridConfig, patchEncounter, refetch, setSaveStatus, setEncounter],
    );

    return { saveChanges };
}
