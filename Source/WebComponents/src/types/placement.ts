import type { GridConfig } from '../utils/gridCalculator';
import { snapToGrid } from '../utils/gridCalculator';
import type { AssetKind, NamedSize } from './domain';

export type SnapMode = 'grid' | 'free' | 'edge' | 'corner';

export interface PlacementBehavior {
  canMove: boolean;
  canRotate: boolean;
  canResize: boolean;
  canDelete: boolean;
  canDuplicate: boolean;
  snapMode: SnapMode;
  snapToGrid: boolean;
  requiresGridAlignment: boolean;
  allowOverlap: boolean;
  minSize: { width: number; height: number };
  maxSize: { width: number; height: number };
  lockAspectRatio: boolean;
  allowElevation: boolean;
  zIndexRange: [number, number];
}

export const getPlacementBehavior = (
  assetKind: AssetKind,
  objectData?: { size: NamedSize; isMovable: boolean; isOpaque: boolean },
  monsterOrCharacterData?: { size: NamedSize },
): PlacementBehavior => {
  const defaultBehavior: PlacementBehavior = {
    canMove: true,
    canRotate: true,
    canResize: true,
    canDelete: true,
    canDuplicate: true,
    snapMode: 'grid',
    snapToGrid: true,
    requiresGridAlignment: true,
    allowOverlap: false,
    minSize: { width: 0.125, height: 0.125 },
    maxSize: { width: 20, height: 20 },
    lockAspectRatio: false,
    allowElevation: true,
    zIndexRange: [0, 100],
  };

  if (assetKind === 'Object' && objectData) {
    const isSquare = Math.abs(objectData.size.width - objectData.size.height) < 0.001;
    return {
      ...defaultBehavior,
      canMove: objectData.isMovable,
      snapMode: objectData.isMovable ? 'grid' : 'free',
      snapToGrid: true,
      requiresGridAlignment: false,
      allowOverlap: false,
      lockAspectRatio: isSquare,
      zIndexRange: [10, 40],
    };
  }

  if ((assetKind === 'Creature' || assetKind === 'Character') && monsterOrCharacterData) {
    return {
      ...defaultBehavior,
      canMove: true,
      canRotate: false,
      canResize: false,
      snapMode: 'grid',
      snapToGrid: true,
      requiresGridAlignment: true,
      allowOverlap: false,
      lockAspectRatio: true,
      allowElevation: false,
      zIndexRange: [50, 100],
    };
  }

  return defaultBehavior;
};

export const calculateAssetSize = (
  namedSize: NamedSize | undefined,
  gridConfig: GridConfig,
): { width: number; height: number } => {
  const defaultSize = { width: 1, height: 1, isSquare: true };
  const size = namedSize || defaultSize;

  const { width, height } = size;
  const cellWidth = gridConfig.cellSize.width;
  const cellHeight = gridConfig.cellSize.height;

  return {
    width: width * cellWidth,
    height: height * cellHeight,
  };
};

export const snapAssetPosition = (
  position: { x: number; y: number },
  size: { width: number; height: number },
  behavior: PlacementBehavior,
  gridConfig: GridConfig,
): { x: number; y: number } => {
  if (!behavior.snapToGrid || behavior.snapMode === 'free') {
    return position;
  }

  const snappedCenter = snapToGrid(position, gridConfig);

  if (behavior.requiresGridAlignment) {
    const topLeft = {
      x: snappedCenter.x - size.width / 2,
      y: snappedCenter.y - size.height / 2,
    };

    const snappedTopLeft = snapToGrid(topLeft, gridConfig);

    return {
      x: snappedTopLeft.x + size.width / 2,
      y: snappedTopLeft.y + size.height / 2,
    };
  }

  return snappedCenter;
};

export const checkAssetOverlap = (
  asset1: { x: number; y: number; width: number; height: number },
  asset2: { x: number; y: number; width: number; height: number },
): boolean => {
  const tolerance = 1;

  const box1 = {
    left: asset1.x - asset1.width / 2 + tolerance,
    right: asset1.x + asset1.width / 2 - tolerance,
    top: asset1.y - asset1.height / 2 + tolerance,
    bottom: asset1.y + asset1.height / 2 - tolerance,
  };

  const box2 = {
    left: asset2.x - asset2.width / 2 + tolerance,
    right: asset2.x + asset2.width / 2 - tolerance,
    top: asset2.y - asset2.height / 2 + tolerance,
    bottom: asset2.y + asset2.height / 2 - tolerance,
  };

  return !(box1.right <= box2.left || box1.left >= box2.right || box1.bottom <= box2.top || box1.top >= box2.bottom);
};

export const validatePlacement = (
  position: { x: number; y: number },
  size: { width: number; height: number },
  behavior: PlacementBehavior,
  existingAssets: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
    allowOverlap: boolean;
  }>,
  gridConfig: GridConfig,
  skipCollisionCheck: boolean = false,
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  const cellWidth = gridConfig.cellSize.width;
  const cellHeight = gridConfig.cellSize.height;

  if (size.width < behavior.minSize.width * cellWidth) {
    errors.push(`Asset width too small (min: ${behavior.minSize.width} cells)`);
  }
  if (size.height < behavior.minSize.height * cellHeight) {
    errors.push(`Asset height too small (min: ${behavior.minSize.height} cells)`);
  }
  if (size.width > behavior.maxSize.width * cellWidth) {
    errors.push(`Asset width too large (max: ${behavior.maxSize.width} cells)`);
  }
  if (size.height > behavior.maxSize.height * cellHeight) {
    errors.push(`Asset height too large (max: ${behavior.maxSize.height} cells)`);
  }

  if (!skipCollisionCheck && !behavior.allowOverlap) {
    for (const existing of existingAssets) {
      if (
        !existing.allowOverlap &&
        checkAssetOverlap(
          {
            x: position.x,
            y: position.y,
            width: size.width,
            height: size.height,
          },
          existing,
        )
      ) {
        errors.push('Asset overlaps with existing asset');
        break;
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};
