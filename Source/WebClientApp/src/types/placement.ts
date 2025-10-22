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
 * @param objectProps Object properties (if Object asset)
 * @param creatureProps Creature properties (if Creature asset)
 * @returns Placement behavior configuration
 */
export const getPlacementBehavior = (
    assetKind: AssetKind,
    objectProps?: { size: NamedSize; isMovable: boolean; isOpaque: boolean },
    creatureProps?: { size: NamedSize; category: CreatureCategory }
): PlacementBehavior => {
    // Default behavior for all assets
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
        minSize: { width: 0.125, height: 0.125 }, // ⅛ cell (Miniscule)
        maxSize: { width: 20, height: 20 }, // 20x20 cells (Gargantuan+)
        lockAspectRatio: false,
        allowElevation: true,
        zIndexRange: [0, 100],
    };

    // Object assets (walls, furniture, traps, etc.)
    if (assetKind === 'Object' && objectProps) {
        return {
            ...defaultBehavior,
            canMove: objectProps.isMovable,
            snapMode: objectProps.isMovable ? 'grid' : 'free',
            snapToGrid: true,
            requiresGridAlignment: false, // Objects can be placed anywhere
            allowOverlap: !objectProps.isOpaque, // Opaque objects block movement
            lockAspectRatio: objectProps.size.isSquare,
            zIndexRange: [10, 40], // Structure layer (10-30), Objects layer (30-40)
        };
    }

    // Creature assets (characters, monsters)
    if (assetKind === 'Creature' && creatureProps) {
        return {
            ...defaultBehavior,
            canMove: true,
            canRotate: false, // Creatures typically don't rotate (tokens face forward)
            canResize: false, // Creature size is fixed by stat block
            snapMode: 'grid',
            snapToGrid: true,
            requiresGridAlignment: true, // Creatures must align to grid
            allowOverlap: false, // Creatures cannot overlap
            lockAspectRatio: true, // Tokens are always square
            allowElevation: false, // Future: flying creatures
            zIndexRange: [50, 100], // Agents layer (characters and monsters)
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
    // Convert center positions to bounding boxes
    const box1 = {
        left: asset1.x - asset1.width / 2,
        right: asset1.x + asset1.width / 2,
        top: asset1.y - asset1.height / 2,
        bottom: asset1.y + asset1.height / 2,
    };

    const box2 = {
        left: asset2.x - asset2.width / 2,
        right: asset2.x + asset2.width / 2,
        top: asset2.y - asset2.height / 2,
        bottom: asset2.y + asset2.height / 2,
    };

    // Check for overlap
    return !(
        box1.right < box2.left ||
        box1.left > box2.right ||
        box1.bottom < box2.top ||
        box1.top > box2.bottom
    );
};

/**
 * Validate asset placement
 * @param position Desired position
 * @param size Asset size
 * @param behavior Placement behavior
 * @param existingAssets Existing assets on scene
 * @param gridConfig Grid configuration
 * @returns Validation result with errors
 */
export const validatePlacement = (
    position: { x: number; y: number },
    size: { width: number; height: number },
    behavior: PlacementBehavior,
    existingAssets: Array<{ x: number; y: number; width: number; height: number; allowOverlap: boolean }>,
    gridConfig: GridConfig
): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Check size constraints
    if (size.width < behavior.minSize.width * gridConfig.cellWidth) {
        errors.push(`Asset width too small (min: ${behavior.minSize.width} cells)`);
    }
    if (size.height < behavior.minSize.height * gridConfig.cellHeight) {
        errors.push(`Asset height too small (min: ${behavior.minSize.height} cells)`);
    }
    if (size.width > behavior.maxSize.width * gridConfig.cellWidth) {
        errors.push(`Asset width too large (max: ${behavior.maxSize.width} cells)`);
    }
    if (size.height > behavior.maxSize.height * gridConfig.cellHeight) {
        errors.push(`Asset height too large (max: ${behavior.maxSize.height} cells)`);
    }

    // Check overlap constraints
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
