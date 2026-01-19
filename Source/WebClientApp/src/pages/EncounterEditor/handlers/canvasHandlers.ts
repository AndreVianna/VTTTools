import type { Dispatch, RefObject, SetStateAction } from 'react';
import type { EncounterCanvasHandle } from '@/components/encounter';
import type { WallTransaction } from '@/hooks/useWallTransaction';
import type { RegionTransaction } from '@/hooks/useRegionTransaction';

export interface CanvasHandlerDeps {
    encounterId: string | undefined;
    stageSize: { width: number; height: number };
    canvasRef: RefObject<EncounterCanvasHandle | null>;
    updateStageSettings: (settings: { zoomLevel?: number; panning?: { x: number; y: number } }) => Promise<void>;
    refetch: () => Promise<void>;
    setIsStartingViewLoading: Dispatch<SetStateAction<boolean>>;
    assetManagement: {
        handleAssetSelected: (ids: string[]) => void;
    };
    wallTransaction: WallTransaction;
    regionTransaction: RegionTransaction;
    setSelectedWallIndex: (index: number | null) => void;
    setSelectedRegionIndex: (index: number | null) => void;
    setSelectedLightSourceIndex: (index: number | null) => void;
    setSelectedSoundSourceIndex: (index: number | null) => void;
    setIsEditingVertices: Dispatch<SetStateAction<boolean>>;
    setPreviewWallPoles: (poles: null) => void;
    setIsEditingRegionVertices: Dispatch<SetStateAction<boolean>>;
    setEditingRegionIndex: Dispatch<SetStateAction<number | null>>;
    navigate: (path: string) => void;
}

// Constants for layout offsets (matches useViewportControls)
const HEADER_HEIGHT = 28;
const TOP_TOOLBAR_HEIGHT = 36;
const LEFT_TOOLBAR_WIDTH = 32;

export const createCanvasHandlers = (deps: CanvasHandlerDeps) => ({
    /**
     * Navigate to Game Session page to preview the encounter.
     */
    handlePreviewClick: () => {
        const { encounterId, navigate } = deps;
        // Don't allow preview for unsaved new encounters
        if (encounterId && encounterId !== 'new') {
            navigate(`/encounters/${encounterId}/play`);
        }
    },

    /**
     * Save current viewport as starting view for Preview.
     */
    handleSaveStartingView: async () => {
        const { encounterId, canvasRef, stageSize, updateStageSettings, refetch, setIsStartingViewLoading } = deps;
        if (!encounterId) return;

        const viewport = canvasRef.current?.getViewport();
        if (!viewport) return;

        setIsStartingViewLoading(true);
        try {
            // Calculate centered position
            const canvasWidth = window.innerWidth - LEFT_TOOLBAR_WIDTH;
            const canvasHeight = window.innerHeight - (HEADER_HEIGHT + TOP_TOOLBAR_HEIGHT);
            const centeredX = LEFT_TOOLBAR_WIDTH + (canvasWidth - stageSize.width) / 2;
            const centeredY = HEADER_HEIGHT + TOP_TOOLBAR_HEIGHT + (canvasHeight - stageSize.height) / 2;

            // Store offset from center
            const offsetX = viewport.x - centeredX;
            const offsetY = viewport.y - centeredY;

            await updateStageSettings({
                zoomLevel: viewport.scale,
                panning: { x: offsetX, y: offsetY },
            });
            await refetch();
        } catch (error: unknown) {
            console.error('Failed to save starting view:', error);
        } finally {
            setIsStartingViewLoading(false);
        }
    },

    /**
     * Clear saved starting view (resets to centered).
     */
    handleClearStartingView: async () => {
        const { encounterId, updateStageSettings, refetch, setIsStartingViewLoading } = deps;
        if (!encounterId) return;

        setIsStartingViewLoading(true);
        try {
            await updateStageSettings({
                zoomLevel: 1,
                panning: { x: 0, y: 0 },
            });
            await refetch();
        } catch (error: unknown) {
            console.error('Failed to clear starting view:', error);
        } finally {
            setIsStartingViewLoading(false);
        }
    },

    /**
     * Handle click on canvas (deselect all).
     */
    handleCanvasClick: () => {
        const {
            assetManagement,
            wallTransaction,
            regionTransaction,
            setSelectedWallIndex,
            setSelectedRegionIndex,
            setSelectedLightSourceIndex,
            setSelectedSoundSourceIndex,
            setIsEditingVertices,
            setPreviewWallPoles,
            setIsEditingRegionVertices,
            setEditingRegionIndex,
        } = deps;

        assetManagement.handleAssetSelected([]);
        setSelectedWallIndex(null);
        setSelectedRegionIndex(null);
        setSelectedLightSourceIndex(null);
        setSelectedSoundSourceIndex(null);
        if (wallTransaction.transaction.isActive) {
            wallTransaction.rollbackTransaction();
        }
        setIsEditingVertices(false);
        setPreviewWallPoles(null);
        if (regionTransaction.transaction.isActive) {
            regionTransaction.rollbackTransaction();
        }
        setIsEditingRegionVertices(false);
        setEditingRegionIndex(null);
    },
});
