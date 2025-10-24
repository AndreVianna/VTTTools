import { AssetKind, CreatureCategory, type NamedSize } from '@/types/domain';
import type { GridConfig } from './gridCalculator';
import { snapToGrid } from './gridCalculator';

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

interface ObjectProps {
    size: NamedSize;
    isMovable: boolean;
    isOpaque: boolean;
}

interface CreatureProps {
    size: NamedSize;
    category: CreatureCategory;
}

export const getPlacementBehavior = (
    assetKind: AssetKind,
    objectProps?: ObjectProps,
    creatureProps?: CreatureProps
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

    if (assetKind === AssetKind.Object && objectProps !== undefined) {
        return {
            ...defaultBehavior,
            canMove: objectProps.isMovable,
            snapMode: objectProps.isMovable ? 'grid' : 'free',
            snapToGrid: true,
            requiresGridAlignment: false,
            allowOverlap: !objectProps.isOpaque,
            lockAspectRatio: objectProps.size.isSquare,
            zIndexRange: [10, 40],
        };
    }

    if (assetKind === AssetKind.Creature && creatureProps !== undefined) {
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
    namedSize: NamedSize | null | undefined,
    gridConfig: GridConfig
): { width: number; height: number } => {
    if (namedSize === null || namedSize === undefined) {
        return {
            width: gridConfig.cellSize.width,
            height: gridConfig.cellSize.height,
        };
    }

    const { width, height } = namedSize;
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
    gridConfig: GridConfig
): { x: number; y: number } => {
    if (!behavior.snapToGrid || behavior.snapMode === 'free') {
        return { ...position };
    }

    if (!behavior.requiresGridAlignment) {
        return snapToGrid(position, gridConfig);
    }

    const halfWidth = size.width / 2;
    const halfHeight = size.height / 2;

    const topLeft = {
        x: position.x - halfWidth,
        y: position.y - halfHeight,
    };

    const snappedTopLeft = snapToGrid(topLeft, gridConfig);

    return {
        x: snappedTopLeft.x + halfWidth,
        y: snappedTopLeft.y + halfHeight,
    };
};

export const checkAssetOverlap = (
    asset1: { x: number; y: number; width: number; height: number },
    asset2: { x: number; y: number; width: number; height: number }
): boolean => {
    const halfWidth1 = asset1.width / 2;
    const halfHeight1 = asset1.height / 2;
    const halfWidth2 = asset2.width / 2;
    const halfHeight2 = asset2.height / 2;

    const box1 = {
        left: asset1.x - halfWidth1,
        right: asset1.x + halfWidth1,
        top: asset1.y - halfHeight1,
        bottom: asset1.y + halfHeight1,
    };

    const box2 = {
        left: asset2.x - halfWidth2,
        right: asset2.x + halfWidth2,
        top: asset2.y - halfHeight2,
        bottom: asset2.y + halfHeight2,
    };

    return !(
        box1.right < box2.left ||
        box1.left > box2.right ||
        box1.bottom < box2.top ||
        box1.top > box2.bottom
    );
};

interface AssetPlacement {
    x: number;
    y: number;
    width: number;
    height: number;
    allowOverlap: boolean;
}

export const validatePlacement = (
    position: { x: number; y: number },
    size: { width: number; height: number },
    behavior: PlacementBehavior,
    existingAssets: AssetPlacement[],
    gridConfig: GridConfig
): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    const cellWidth = gridConfig.cellSize.width;
    const cellHeight = gridConfig.cellSize.height;

    const minWidth = behavior.minSize.width * cellWidth;
    const minHeight = behavior.minSize.height * cellHeight;
    const maxWidth = behavior.maxSize.width * cellWidth;
    const maxHeight = behavior.maxSize.height * cellHeight;

    if (size.width < minWidth) {
        errors.push(`Asset width too small (min: ${behavior.minSize.width} cells)`);
    }
    if (size.height < minHeight) {
        errors.push(`Asset height too small (min: ${behavior.minSize.height} cells)`);
    }
    if (size.width > maxWidth) {
        errors.push(`Asset width too large (max: ${behavior.maxSize.width} cells)`);
    }
    if (size.height > maxHeight) {
        errors.push(`Asset height too large (max: ${behavior.maxSize.height} cells)`);
    }

    if (!behavior.allowOverlap) {
        for (const existing of existingAssets) {
            if (!existing.allowOverlap && checkAssetOverlap(
                { x: position.x, y: position.y, width: size.width, height: size.height },
                existing
            )) {
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
