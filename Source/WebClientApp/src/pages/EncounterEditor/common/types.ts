import type { Encounter, PlacedAsset, Point, Pole } from '@/types/domain';
import type { GridConfig } from '@/utils/gridCalculator';

export type DrawingMode = 'wall' | 'region' | 'source' | null;

export interface EncounterEditorState {
    encounter: Encounter | null;
    encounterId: string | undefined;
    isEncounterReady: boolean;
    imagesLoaded: boolean;
    placedAssets: PlacedAsset[];
    gridConfig: GridConfig;
}

export interface WallEditingState {
    selectedWallIndex: number | null;
    drawingWallIndex: number | null;
    isEditingVertices: boolean;
    originalWallPoles: Pole[] | null;
    editingWallIndex: number | null;
}

export interface RegionEditingState {
    selectedRegionIndex: number | null;
    drawingRegionIndex: number | null;
    isEditingRegionVertices: boolean;
    originalRegionVertices: Point[] | null;
    editingRegionIndex: number | null;
}

export interface AssetEditingState {
    selectedAssetIds: string[];
    draggedAsset: any | null;
    contextMenuAsset: PlacedAsset | null;
    contextMenuPosition: { left: number; top: number } | null;
}

export interface CommonHandlers {
    setEncounter: (encounter: Encounter) => void;
    setErrorMessage: (message: string | null) => void;
    refetch: () => Promise<{ data?: Encounter }>;
    execute: (command: any) => void;
}
