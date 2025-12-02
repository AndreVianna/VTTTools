import { useCallback, useMemo, useState } from 'react';
import type { Encounter, PlacedAsset } from '@/types/domain';

interface UseContextMenusProps {
  encounter: Encounter | null;
}

export const useContextMenus = ({ encounter }: UseContextMenusProps) => {
  const [contextMenuPosition, setContextMenuPosition] = useState<{
    left: number;
    top: number;
  } | null>(null);
  const [contextMenuAsset, setContextMenuAsset] = useState<PlacedAsset | null>(null);
  const [wallContextMenuPosition, setWallContextMenuPosition] = useState<{
    left: number;
    top: number;
  } | null>(null);
  const [contextMenuWallIndex, setContextMenuWallIndex] = useState<number | null>(null);
  const [contextMenuSegmentIndex, setContextMenuSegmentIndex] = useState<number | null>(null);
  const [regionContextMenuPosition, setRegionContextMenuPosition] = useState<{
    left: number;
    top: number;
  } | null>(null);
  const [contextMenuRegionIndex, setContextMenuRegionIndex] = useState<number | null>(null);

  const contextMenuWall = useMemo(() => {
    if (contextMenuWallIndex === null) return null;
    return encounter?.walls?.find((w) => w.index === contextMenuWallIndex) ?? null;
  }, [encounter, contextMenuWallIndex]);

  const contextMenuRegion = useMemo(() => {
    if (contextMenuRegionIndex === null) return null;
    return encounter?.regions?.find((r) => r.index === contextMenuRegionIndex) ?? null;
  }, [encounter, contextMenuRegionIndex]);

  const handleAssetContextMenu = useCallback((asset: PlacedAsset, position: { x: number; y: number }) => {
    setContextMenuPosition({ left: position.x, top: position.y });
    setContextMenuAsset(asset);
  }, []);

  const handleContextMenuClose = useCallback(() => {
    setContextMenuPosition(null);
    setContextMenuAsset(null);
  }, []);

  const handleWallContextMenu = useCallback(
    (wallIndex: number, segmentIndex: number, position: { x: number; y: number }) => {
      const encounterWall = encounter?.walls?.find((sw) => sw.index === wallIndex);

      if (encounterWall) {
        setWallContextMenuPosition({ left: position.x, top: position.y });
        setContextMenuWallIndex(wallIndex);
        setContextMenuSegmentIndex(segmentIndex);
      }
    },
    [encounter],
  );

  const handleWallContextMenuClose = useCallback(() => {
    setWallContextMenuPosition(null);
    setContextMenuWallIndex(null);
    setContextMenuSegmentIndex(null);
  }, []);

  const handleRegionContextMenu = useCallback(
    (regionIndex: number, position: { x: number; y: number }) => {
      const encounterRegion = encounter?.regions?.find((r) => r.index === regionIndex);

      if (encounterRegion) {
        setRegionContextMenuPosition({ left: position.x, top: position.y });
        setContextMenuRegionIndex(regionIndex);
      }
    },
    [encounter],
  );

  const handleRegionContextMenuClose = useCallback(() => {
    setRegionContextMenuPosition(null);
    setContextMenuRegionIndex(null);
  }, []);

  return {
    assetContextMenu: {
      position: contextMenuPosition,
      asset: contextMenuAsset,
      handleOpen: handleAssetContextMenu,
      handleClose: handleContextMenuClose,
    },
    wallContextMenu: {
      position: wallContextMenuPosition,
      wall: contextMenuWall,
      segmentIndex: contextMenuSegmentIndex,
      handleOpen: handleWallContextMenu,
      handleClose: handleWallContextMenuClose,
    },
    regionContextMenu: {
      position: regionContextMenuPosition,
      region: contextMenuRegion,
      handleOpen: handleRegionContextMenu,
      handleClose: handleRegionContextMenuClose,
    },
  };
};
