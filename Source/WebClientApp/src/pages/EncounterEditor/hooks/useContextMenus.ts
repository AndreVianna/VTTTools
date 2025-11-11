import { useState, useCallback } from 'react';
import type { Encounter, EncounterWall, PlacedAsset } from '@/types/domain';

interface UseContextMenusProps {
    encounter: Encounter | null;
}

export const useContextMenus = ({ encounter }: UseContextMenusProps) => {
    const [contextMenuPosition, setContextMenuPosition] = useState<{ left: number; top: number } | null>(null);
    const [contextMenuAsset, setContextMenuAsset] = useState<PlacedAsset | null>(null);
    const [wallContextMenuPosition, setWallContextMenuPosition] = useState<{ left: number; top: number } | null>(null);
    const [contextMenuWall, setContextMenuWall] = useState<EncounterWall | null>(null);

    const handleAssetContextMenu = useCallback((
        asset: PlacedAsset,
        position: { x: number; y: number }
    ) => {
        setContextMenuPosition({ left: position.x, top: position.y });
        setContextMenuAsset(asset);
    }, []);

    const handleContextMenuClose = useCallback(() => {
        setContextMenuPosition(null);
        setContextMenuAsset(null);
    }, []);

    const handleWallContextMenu = useCallback((
        wallIndex: number,
        position: { x: number; y: number }
    ) => {
        const encounterWall = encounter?.walls?.find(sw => sw.index === wallIndex);

        if (encounterWall) {
            setWallContextMenuPosition({ left: position.x, top: position.y });
            setContextMenuWall(encounterWall);
        }
    }, [encounter]);

    const handleWallContextMenuClose = useCallback(() => {
        setWallContextMenuPosition(null);
        setContextMenuWall(null);
    }, []);

    return {
        assetContextMenu: {
            position: contextMenuPosition,
            asset: contextMenuAsset,
            handleOpen: handleAssetContextMenu,
            handleClose: handleContextMenuClose
        },
        wallContextMenu: {
            position: wallContextMenuPosition,
            wall: contextMenuWall,
            handleOpen: handleWallContextMenu,
            handleClose: handleWallContextMenuClose
        }
    };
};
