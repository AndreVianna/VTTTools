import { useEffect, useRef } from 'react';
import type { InteractionScope } from '@utils/scopeFiltering';
import type { Pole } from '@/types/domain';
import type { WallTransaction } from '@/hooks/useWallTransaction';
import type { RegionTransaction } from '@/hooks/useRegionTransaction';

export interface UseScopeChangeHandlerProps {
    /** Current active scope */
    activeScope: InteractionScope;
    /** Asset management handlers */
    assetManagement: {
        handleAssetSelected: (assetIds: string[]) => void;
    };
    /** Setter for selected wall index */
    setSelectedWallIndex: (value: number | null) => void;
    /** Setter for selected region index */
    setSelectedRegionIndex: (value: number | null) => void;
    /** Setter for selected light source index */
    setSelectedLightSourceIndex: (value: number | null) => void;
    /** Setter for selected sound source index */
    setSelectedSoundSourceIndex: (value: number | null) => void;
    /** Setter for editing vertices state */
    setIsEditingVertices: (value: boolean) => void;
    /** Setter for preview wall poles */
    setPreviewWallPoles: (value: Pole[] | null) => void;
    /** Wall transaction hook */
    wallTransaction: WallTransaction;
    /** Region transaction hook */
    regionTransaction: RegionTransaction;
    /** Setter for editing region vertices state */
    setIsEditingRegionVertices: (value: boolean) => void;
    /** Setter for editing region index */
    setEditingRegionIndex: (value: number | null) => void;
}

/**
 * Hook to handle scope changes.
 * Clears all selections and cancels active editing when the scope changes.
 */
export function useScopeChangeHandler({
    activeScope,
    assetManagement,
    setSelectedWallIndex,
    setSelectedRegionIndex,
    setSelectedLightSourceIndex,
    setSelectedSoundSourceIndex,
    setIsEditingVertices,
    setPreviewWallPoles,
    wallTransaction,
    regionTransaction,
    setIsEditingRegionVertices,
    setEditingRegionIndex,
}: UseScopeChangeHandlerProps): void {
    const prevActiveScopeRef = useRef<InteractionScope>(null);

    useEffect(() => {
        if (prevActiveScopeRef.current !== activeScope) {
            assetManagement.handleAssetSelected([]);
            setSelectedWallIndex(null);
            setSelectedRegionIndex(null);
            setSelectedLightSourceIndex(null);
            setSelectedSoundSourceIndex(null);
            setIsEditingVertices(false);
            setPreviewWallPoles(null);
            if (wallTransaction.transaction.isActive) {
                wallTransaction.rollbackTransaction();
            }
            if (regionTransaction.transaction.isActive) {
                regionTransaction.rollbackTransaction();
            }
            setIsEditingRegionVertices(false);
            setEditingRegionIndex(null);
        }
        prevActiveScopeRef.current = activeScope;
    }, [
        activeScope,
        assetManagement,
        setPreviewWallPoles,
        setSelectedLightSourceIndex,
        setSelectedRegionIndex,
        setSelectedSoundSourceIndex,
        setSelectedWallIndex,
        wallTransaction,
        regionTransaction,
        setIsEditingVertices,
        setIsEditingRegionVertices,
        setEditingRegionIndex,
    ]);
}
