// GENERATED: 2025-10-11 by Claude Code Phase 6
// EPIC: EPIC-001 Phase 6 - Scene Editor Tokens, Undo/Redo, Offline
// LAYER: UI (Types)

/**
 * Placement behavior types for token and asset management in scene editor
 * Defines how different asset types can be manipulated on the canvas
 */

import type { AssetKind, CreatureCategory, NamedSize } from './domain';
import type { GridConfig } from '@/utils/gridCalculator';
import { snapToGrid } from '@/utils/gridCalculator';

/**
 * Snap mode for asset placement
 */
export type SnapMode = 'grid' | 'free' | 'edge' | 'corner';

/**
 * Placement behavior configuration for assets
 * Determines interaction capabilities based on asset kind and properties
 */
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

/**
 * Get placement behavior for an asset based on its kind and properties
 * @param assetKind Asset kind (Object | Creature)
 * @param objectData Object data (if Object asset)
 * @param creatureData Creature data (if Creature asset)
 * @returns Placement behavior configuration
 */
export const getPlacementBehavior = (
    assetKind: AssetKind,
    objectData?: { size: NamedSize; isMovable: boolean; isOpaque: boolean },
    creatureData?: { size: NamedSize; category: CreatureCategory }
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
        return {
            ...defaultBehavior,
            canMove: objectData.isMovable,
            snapMode: objectData.isMovable ? 'grid' : 'free',
            snapToGrid: true,
            requiresGridAlignment: false,
            allowOverlap: false,
            lockAspectRatio: objectData.size.isSquare,
            zIndexRange: [10, 40],
        };
    }

    if (assetKind === 'Creature' && creatureData) {
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

/**
 * Calculate grid-aligned size for an asset based on NamedSize
 * @param namedSize Asset size from domain model
 * @param gridConfig Current grid configuration
 * @returns Pixel dimensions for canvas rendering
 */
export const calculateAssetSize = (
    namedSize: NamedSize | undefined,
    gridConfig: GridConfig
): { width: number; height: number } => {
    // Default to 1x1 grid cell if size is not defined
    const defaultSize = { width: 1, height: 1, isSquare: true };
    const size = namedSize || defaultSize;

    const { width, height } = size;
    const { cellWidth, cellHeight } = gridConfig;

    return {
        width: width * cellWidth,
        height: height * cellHeight,
    };
};

/**
 * Snap asset position to grid based on placement behavior
 * @param position Desired position (center point)
 * @param size Asset size in pixels
 * @param behavior Placement behavior
 * @param gridConfig Grid configuration
 * @returns Snapped position (center point)
 */
export const snapAssetPosition = (
    position: { x: number; y: number },
    size: { width: number; height: number },
    behavior: PlacementBehavior,
    gridConfig: GridConfig
): { x: number; y: number } => {
    if (!behavior.snapToGrid || behavior.snapMode === 'free') {
        return position;
    }

    // Snap center point to grid
    const snappedCenter = snapToGrid(position, gridConfig);

    // If requires grid alignment, ensure asset occupies exact grid cells
    if (behavior.requiresGridAlignment) {
        // Calculate top-left from center
        const topLeft = {
            x: snappedCenter.x - size.width / 2,
            y: snappedCenter.y - size.height / 2,
        };

        // Snap top-left to grid
        const snappedTopLeft = snapToGrid(topLeft, gridConfig);

        // Calculate new center from snapped top-left
        return {
            x: snappedTopLeft.x + size.width / 2,
            y: snappedTopLeft.y + size.height / 2,
        };
    }

    return snappedCenter;
};

/**
 * Check if two assets overlap
 * @param asset1 First asset position and size
 * @param asset2 Second asset position and size
 * @returns True if assets overlap
 */
export const checkAssetOverlap = (
    asset1: { x: number; y: number; width: number; height: number },
    asset2: { x: number; y: number; width: number; height: number }
): boolean => {
    // Add 1px tolerance to prevent edge-touching from triggering overlap
    const tolerance = 1;

    // Convert center positions to bounding boxes (with tolerance)
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

    // Check for overlap
    return !(
        box1.right <= box2.left ||
        box1.left >= box2.right ||
        box1.bottom <= box2.top ||
        box1.top >= box2.bottom
    );
};

/**
 * Validate asset placement
 * @param position Desired position
 * @param size Asset size
 * @param behavior Placement behavior
 * @param existingAssets Existing assets on scene
 * @param gridConfig Grid configuration
 * @param skipCollisionCheck If true, bypass overlap validation (Shift-click override)
 * @returns Validation result with errors
 */
export const validatePlacement = (
    position: { x: number; y: number },
    size: { width: number; height: number },
    behavior: PlacementBehavior,
    existingAssets: Array<{ x: number; y: number; width: number; height: number; allowOverlap: boolean }>,
    gridConfig: GridConfig,
    skipCollisionCheck: boolean = false
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

    // Check overlap constraints (skip if Shift-click override)
    if (!skipCollisionCheck && !behavior.allowOverlap) {
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
