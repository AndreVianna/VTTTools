// GENERATED: 2025-10-19 by Claude Code Phase 6
// EPIC: EPIC-001 Phase 6 - Encounter Editor Tokens, Undo/Redo, Offline
// LAYER: UI (Hook)

/**
 * useAssetDrag Hook
 * Manages drag-and-drop state for assets from the asset library to the encounter canvas
 * ACCEPTANCE_CRITERION: AC-01 - Token placement from asset library functional
 */

import { useState, useCallback } from 'react';
import type { Asset } from '@/types/domain';

export interface UseAssetDragReturn {
    draggedAsset: Asset | null;
    startDrag: (asset: Asset) => void;
    endDrag: () => void;
}

/**
 * Custom hook for managing asset drag state
 * Used to coordinate drag operations between asset library and encounter canvas
 */
export const useAssetDrag = (): UseAssetDragReturn => {
    const [draggedAsset, setDraggedAsset] = useState<Asset | null>(null);

    const startDrag = useCallback((asset: Asset) => {
        setDraggedAsset(asset);
    }, []);

    const endDrag = useCallback(() => {
        setDraggedAsset(null);
    }, []);

    return { draggedAsset, startDrag, endDrag };
};
