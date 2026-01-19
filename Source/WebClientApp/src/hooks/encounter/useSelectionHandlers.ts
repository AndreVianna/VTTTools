import type React from 'react';
import { useCallback } from 'react';
import type { SelectionCategory } from '@components/encounter';
import { AssetKind, type PlacedAsset, type PlacedWall, type PlacedRegion, type PlacedLightSource, type PlacedSoundSource } from '@/types/domain';

export interface UseSelectionHandlersProps {
    /** Asset management handlers */
    assetManagement: {
        placedAssets: PlacedAsset[];
        handleAssetSelected: (assetIds: string[]) => void;
    };
    /** Placed walls */
    placedWalls: PlacedWall[];
    /** Placed regions */
    placedRegions: PlacedRegion[];
    /** Placed light sources */
    placedLightSources: PlacedLightSource[];
    /** Placed sound sources */
    placedSoundSources: PlacedSoundSource[];
    /** Setter for selected wall indices */
    setSelectedWallIndices: React.Dispatch<React.SetStateAction<number[]>>;
    /** Setter for selected region indices */
    setSelectedRegionIndices: React.Dispatch<React.SetStateAction<number[]>>;
    /** Setter for selected light source indices */
    setSelectedLightSourceIndices: React.Dispatch<React.SetStateAction<number[]>>;
    /** Setter for selected sound source indices */
    setSelectedSoundSourceIndices: React.Dispatch<React.SetStateAction<number[]>>;
}

export interface UseSelectionHandlersReturn {
    /** Clear all selections */
    handleClearSelection: () => void;
    /** Select all items by category */
    handleSelectAllByCategory: (category: SelectionCategory) => void;
}

/**
 * Hook to manage selection handlers for the encounter editor.
 * Handles clearing selections and selecting all items by category.
 */
export function useSelectionHandlers({
    assetManagement,
    placedWalls,
    placedRegions,
    placedLightSources,
    placedSoundSources,
    setSelectedWallIndices,
    setSelectedRegionIndices,
    setSelectedLightSourceIndices,
    setSelectedSoundSourceIndices,
}: UseSelectionHandlersProps): UseSelectionHandlersReturn {
    const handleClearSelection = useCallback(() => {
        assetManagement.handleAssetSelected([]);
        setSelectedWallIndices([]);
        setSelectedRegionIndices([]);
        setSelectedLightSourceIndices([]);
        setSelectedSoundSourceIndices([]);
    }, [assetManagement, setSelectedWallIndices, setSelectedRegionIndices, setSelectedLightSourceIndices, setSelectedSoundSourceIndices]);

    const handleSelectAllByCategory = useCallback((category: SelectionCategory) => {
        // Clear all selections first
        assetManagement.handleAssetSelected([]);
        setSelectedWallIndices([]);
        setSelectedRegionIndices([]);
        setSelectedLightSourceIndices([]);
        setSelectedSoundSourceIndices([]);

        if (category === 'all') {
            assetManagement.handleAssetSelected(assetManagement.placedAssets.map((a) => a.id));
            setSelectedWallIndices(placedWalls.map((_, i) => i));
            setSelectedRegionIndices(placedRegions.map((_, i) => i));
            setSelectedLightSourceIndices(placedLightSources.map((s) => s.index));
            setSelectedSoundSourceIndices(placedSoundSources.map((s) => s.index));
        } else if (category === 'walls') {
            setSelectedWallIndices(placedWalls.map((_, i) => i));
        } else if (category === 'regions') {
            setSelectedRegionIndices(placedRegions.map((_, i) => i));
        } else if (category === 'objects') {
            const objects = assetManagement.placedAssets.filter((a) => a.asset.classification.kind === AssetKind.Object);
            assetManagement.handleAssetSelected(objects.map((a) => a.id));
        } else if (category === 'monsters') {
            const monsters = assetManagement.placedAssets.filter((a) => a.asset.classification.kind === AssetKind.Creature);
            assetManagement.handleAssetSelected(monsters.map((a) => a.id));
        } else if (category === 'characters') {
            const characters = assetManagement.placedAssets.filter((a) => a.asset.classification.kind === AssetKind.Character);
            assetManagement.handleAssetSelected(characters.map((a) => a.id));
        } else if (category === 'lights') {
            setSelectedLightSourceIndices(placedLightSources.map((s) => s.index));
        } else if (category === 'sounds') {
            setSelectedSoundSourceIndices(placedSoundSources.map((s) => s.index));
        }
    }, [assetManagement, placedWalls, placedRegions, placedLightSources, placedSoundSources, setSelectedWallIndices, setSelectedRegionIndices, setSelectedLightSourceIndices, setSelectedSoundSourceIndices]);

    return {
        handleClearSelection,
        handleSelectAllByCategory,
    };
}
