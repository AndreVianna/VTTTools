import { useState, useCallback } from 'react';
import type { Scene, SceneWall, PlacedAsset } from '@/types/domain';

interface UseContextMenusProps {
    scene: Scene | null;
}

export const useContextMenus = ({ scene }: UseContextMenusProps) => {
    const [contextMenuPosition, setContextMenuPosition] = useState<{ left: number; top: number } | null>(null);
    const [contextMenuAsset, setContextMenuAsset] = useState<PlacedAsset | null>(null);
    const [wallContextMenuPosition, setWallContextMenuPosition] = useState<{ left: number; top: number } | null>(null);
    const [contextMenuWall, setContextMenuWall] = useState<SceneWall | null>(null);

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
        const sceneWall = scene?.walls?.find(sw => sw.index === wallIndex);

        if (sceneWall) {
            setWallContextMenuPosition({ left: position.x, top: position.y });
            setContextMenuWall(sceneWall);
        }
    }, [scene]);

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
