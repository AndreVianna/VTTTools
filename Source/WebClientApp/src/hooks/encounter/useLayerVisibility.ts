import type { Dispatch, SetStateAction } from 'react';
import { useCallback, useState } from 'react';
import type { LayerVisibilityType } from '@/components/encounter';
import { GridType } from '@/utils/gridCalculator';

export interface LayerVisibilityState {
    regions: boolean;
    walls: boolean;
    objects: boolean;
    monsters: boolean;
    characters: boolean;
    lights: boolean;
    sounds: boolean;
    fogOfWar: boolean;
}

const DEFAULT_VISIBILITY: LayerVisibilityState = {
    regions: true,
    walls: true,
    objects: true,
    monsters: true,
    characters: true,
    lights: true,
    sounds: true,
    fogOfWar: true,
};

export interface UseLayerVisibilityProps {
    /** Callback to update grid config when showing/hiding all layers */
    onGridTypeChange?: (type: GridType) => void;
    /** Current grid type for determining toggle behavior */
    currentGridType?: GridType;
}

export interface UseLayerVisibilityReturn {
    /** Current visibility state for each layer */
    scopeVisibility: LayerVisibilityState;
    /** Toggle visibility of a specific layer */
    handleLayerVisibilityToggle: (layer: LayerVisibilityType) => void;
    /** Show all layers and enable grid */
    handleShowAllLayers: () => void;
    /** Hide all layers and disable grid */
    handleHideAllLayers: () => void;
    /** Set visibility state directly */
    setScopeVisibility: Dispatch<SetStateAction<LayerVisibilityState>>;
}

/**
 * Hook to manage layer visibility state and handlers.
 * Extracted from EncounterEditorPage for reusability and cleaner code organization.
 */
export function useLayerVisibility({
    onGridTypeChange,
    currentGridType,
}: UseLayerVisibilityProps = {}): UseLayerVisibilityReturn {
    const [scopeVisibility, setScopeVisibility] = useState<LayerVisibilityState>(DEFAULT_VISIBILITY);

    const handleLayerVisibilityToggle = useCallback((layer: LayerVisibilityType) => {
        setScopeVisibility((prev) => ({
            ...prev,
            [layer]: !prev[layer],
        }));
    }, []);

    const handleShowAllLayers = useCallback(() => {
        setScopeVisibility({
            regions: true,
            walls: true,
            objects: true,
            monsters: true,
            characters: true,
            lights: true,
            sounds: true,
            fogOfWar: true,
        });
        if (onGridTypeChange && currentGridType === GridType.NoGrid) {
            onGridTypeChange(GridType.Square);
        }
    }, [onGridTypeChange, currentGridType]);

    const handleHideAllLayers = useCallback(() => {
        setScopeVisibility({
            regions: false,
            walls: false,
            objects: false,
            monsters: false,
            characters: false,
            lights: false,
            sounds: false,
            fogOfWar: false,
        });
        if (onGridTypeChange) {
            onGridTypeChange(GridType.NoGrid);
        }
    }, [onGridTypeChange]);

    return {
        scopeVisibility,
        handleLayerVisibilityToggle,
        handleShowAllLayers,
        handleHideAllLayers,
        setScopeVisibility,
    };
}
