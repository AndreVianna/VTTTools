// GENERATED: 2025-10-04 by Claude Code - Asset Placement Behavior Model
// LAYER: Domain (Value Objects)

/**
 * Placement Behavior Value Object
 * Encapsulates the placement rules and constraints for assets on a scene
 * Derived from AssetCategory but can be customized per placement
 */

import { AssetCategory } from './domain';

export type SnapMode = 'grid' | 'free' | 'edge' | 'corner';

export interface PlacementBehavior {
  // Movement capabilities
  canMove: boolean;
  canRotate: boolean;
  canResize: boolean;
  canDelete: boolean;
  canDuplicate: boolean;

  // Snapping behavior
  snapMode: SnapMode;
  snapToGrid: boolean;

  // Locking behavior
  requiresLocking: boolean;  // Must be explicitly locked after placement
  lockedByDefault: boolean;  // Starts locked when placed

  // Layer constraints
  allowLayerChange: boolean;
  defaultLayer: number;      // 0=background, 1=terrain, 2=objects, 3=tokens, 4=effects

  // Visual indicators
  showBoundingBox: boolean;
  showRotationHandle: boolean;
  showResizeHandles: boolean;

  // Interaction
  selectable: boolean;
  draggable: boolean;
}

/**
 * Get default placement behavior based on asset category
 */
export const getPlacementBehavior = (category: AssetCategory): PlacementBehavior => {
  switch (category) {
    case AssetCategory.Static:
      return {
        // Static assets are locked structural elements
        canMove: false,
        canRotate: false,
        canResize: true,         // Can resize during initial placement
        canDelete: true,
        canDuplicate: true,

        snapMode: 'grid',
        snapToGrid: true,

        requiresLocking: false,  // Already locked by nature
        lockedByDefault: true,

        allowLayerChange: false,
        defaultLayer: 1,         // Terrain layer

        showBoundingBox: true,
        showRotationHandle: false,
        showResizeHandles: true,

        selectable: true,
        draggable: false
      };

    case AssetCategory.Passive:
      return {
        // Passive assets are freely manipulable objects
        canMove: true,
        canRotate: true,
        canResize: true,
        canDelete: true,
        canDuplicate: true,

        snapMode: 'grid',
        snapToGrid: false,       // Optional snapping

        requiresLocking: false,
        lockedByDefault: false,

        allowLayerChange: true,
        defaultLayer: 2,         // Objects layer

        showBoundingBox: true,
        showRotationHandle: true,
        showResizeHandles: true,

        selectable: true,
        draggable: true
      };

    case AssetCategory.Active:
      return {
        // Active assets are entities with full manipulation + special behaviors
        canMove: true,
        canRotate: true,
        canResize: true,
        canDelete: true,
        canDuplicate: true,

        snapMode: 'grid',
        snapToGrid: true,        // Usually snap to grid for turn-based combat

        requiresLocking: false,
        lockedByDefault: false,

        allowLayerChange: true,
        defaultLayer: 3,         // Tokens layer

        showBoundingBox: true,
        showRotationHandle: true,
        showResizeHandles: true,

        selectable: true,
        draggable: true
      };

    default:
      // Fallback to passive behavior
      return getPlacementBehavior(AssetCategory.Passive);
  }
};

/**
 * Create a custom placement behavior by overriding defaults
 */
export const createCustomPlacementBehavior = (
  category: AssetCategory,
  overrides: Partial<PlacementBehavior>
): PlacementBehavior => {
  const defaults = getPlacementBehavior(category);
  return { ...defaults, ...overrides };
};

/**
 * Validate if an operation is allowed for a placement
 */
export const canPerformOperation = (
  behavior: PlacementBehavior,
  operation: 'move' | 'rotate' | 'resize' | 'delete' | 'duplicate' | 'changeLayer'
): boolean => {
  switch (operation) {
    case 'move':
      return behavior.canMove;
    case 'rotate':
      return behavior.canRotate;
    case 'resize':
      return behavior.canResize;
    case 'delete':
      return behavior.canDelete;
    case 'duplicate':
      return behavior.canDuplicate;
    case 'changeLayer':
      return behavior.allowLayerChange;
    default:
      return false;
  }
};
