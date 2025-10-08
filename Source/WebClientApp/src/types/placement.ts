// PLACEHOLDER: This file will be updated in Phase 6 for token placement behavior
// Temporarily stubbed to fix build after AssetCategory removal

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

// TODO: Phase 6 - Implement getPlacementBehavior based on new ObjectProperties/CreatureProperties
export const getPlacementBehavior = (): PlacementBehavior => ({
  canMove: true,
  canRotate: true,
  canResize: true,
  canDelete: true,
  canDuplicate: true,
  snapMode: 'grid',
  snapToGrid: true,
  requiresGridAlignment: true,
  allowOverlap: false,
  minSize: { width: 25, height: 25 },
  maxSize: { width: 500, height: 500 },
  lockAspectRatio: false,
  allowElevation: true,
  zIndexRange: [0, 100],
});
