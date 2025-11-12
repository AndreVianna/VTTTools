import { describe, expect, it } from 'vitest';
import { AssetKind, CreatureCategory, type NamedSize } from '@/types/domain';
import { type GridConfig, GridType } from './gridCalculator';
import {
  calculateAssetSize,
  checkAssetOverlap,
  getPlacementBehavior,
  type PlacementBehavior,
  snapAssetPosition,
  validatePlacement,
} from './placement';

const defaultGrid: GridConfig = {
  type: GridType.Square,
  cellSize: { width: 50, height: 50 },
  offset: { left: 0, top: 0 },
  snap: true,
};

describe('getPlacementBehavior', () => {
  it('returns default behavior when no props provided', () => {
    const behavior = getPlacementBehavior(AssetKind.Object);

    expect(behavior.canMove).toBe(true);
    expect(behavior.canRotate).toBe(true);
    expect(behavior.canResize).toBe(true);
    expect(behavior.snapMode).toBe('grid');
  });

  it('configures Object asset behavior based on properties', () => {
    const namedSize: NamedSize = {
      width: 2,
      height: 2,
      isSquare: true,
    };

    const behavior = getPlacementBehavior(AssetKind.Object, {
      size: namedSize,
      isMovable: false,
      isOpaque: true,
    });

    expect(behavior.canMove).toBe(false);
    expect(behavior.snapMode).toBe('free');
    expect(behavior.allowOverlap).toBe(false);
    expect(behavior.lockAspectRatio).toBe(true);
    expect(behavior.zIndexRange).toEqual([10, 40]);
  });

  it('configures Creature asset behavior based on properties', () => {
    const namedSize: NamedSize = {
      width: 1,
      height: 1,
      isSquare: true,
    };

    const behavior = getPlacementBehavior(AssetKind.Creature, undefined, {
      size: namedSize,
      category: CreatureCategory.Character,
    });

    expect(behavior.canMove).toBe(true);
    expect(behavior.canRotate).toBe(false);
    expect(behavior.canResize).toBe(false);
    expect(behavior.requiresGridAlignment).toBe(true);
    expect(behavior.lockAspectRatio).toBe(true);
    expect(behavior.allowElevation).toBe(false);
    expect(behavior.zIndexRange).toEqual([50, 100]);
  });

  it('returns behavior with movable object properties', () => {
    const namedSize: NamedSize = {
      width: 1,
      height: 1,
      isSquare: false,
    };

    const behavior = getPlacementBehavior(AssetKind.Object, {
      size: namedSize,
      isMovable: true,
      isOpaque: false,
    });

    expect(behavior.canMove).toBe(true);
    expect(behavior.snapMode).toBe('grid');
    expect(behavior.allowOverlap).toBe(true);
    expect(behavior.lockAspectRatio).toBe(false);
  });
});

describe('calculateAssetSize', () => {
  it('calculates size from NamedSize', () => {
    const namedSize: NamedSize = {
      width: 2,
      height: 3,
      isSquare: false,
    };

    const size = calculateAssetSize(namedSize, defaultGrid);

    expect(size).toEqual({
      width: 100,
      height: 150,
    });
  });

  it('handles null NamedSize with default cell size', () => {
    const size = calculateAssetSize(null, defaultGrid);

    expect(size).toEqual({
      width: 50,
      height: 50,
    });
  });

  it('handles undefined NamedSize with default cell size', () => {
    const size = calculateAssetSize(undefined, defaultGrid);

    expect(size).toEqual({
      width: 50,
      height: 50,
    });
  });

  it('calculates size with different grid cell dimensions', () => {
    const namedSize: NamedSize = {
      width: 1,
      height: 1,
      isSquare: true,
    };

    const customGrid: GridConfig = {
      ...defaultGrid,
      cellSize: { width: 100, height: 80 },
    };

    const size = calculateAssetSize(namedSize, customGrid);

    expect(size).toEqual({
      width: 100,
      height: 80,
    });
  });

  it('handles fractional sizes for tiny creatures', () => {
    const namedSize: NamedSize = {
      width: 0.5,
      height: 0.5,
      isSquare: true,
    };

    const size = calculateAssetSize(namedSize, defaultGrid);

    expect(size).toEqual({
      width: 25,
      height: 25,
    });
  });
});

describe('snapAssetPosition', () => {
  const defaultBehavior: PlacementBehavior = {
    canMove: true,
    canRotate: true,
    canResize: true,
    canDelete: true,
    canDuplicate: true,
    snapMode: 'grid',
    snapToGrid: true,
    requiresGridAlignment: false,
    allowOverlap: false,
    minSize: { width: 0.125, height: 0.125 },
    maxSize: { width: 20, height: 20 },
    lockAspectRatio: false,
    allowElevation: true,
    zIndexRange: [0, 100],
  };

  it('returns original position when snapToGrid is false', () => {
    const position = { x: 123, y: 456 };
    const size = { width: 50, height: 50 };
    const behavior = { ...defaultBehavior, snapToGrid: false };

    const snapped = snapAssetPosition(position, size, behavior, defaultGrid);

    expect(snapped).toEqual(position);
    expect(snapped).not.toBe(position);
  });

  it('returns original position when snapMode is free', () => {
    const position = { x: 123, y: 456 };
    const size = { width: 50, height: 50 };
    const behavior = { ...defaultBehavior, snapMode: 'free' as const };

    const snapped = snapAssetPosition(position, size, behavior, defaultGrid);

    expect(snapped).toEqual(position);
  });

  it('snaps center point to grid when alignment not required', () => {
    const position = { x: 123, y: 456 };
    const size = { width: 50, height: 50 };

    const snapped = snapAssetPosition(position, size, defaultBehavior, defaultGrid);

    expect(snapped).toEqual({ x: 100, y: 450 });
  });

  it('snaps top-left to grid when alignment required', () => {
    const position = { x: 123, y: 456 };
    const size = { width: 50, height: 50 };
    const behavior = { ...defaultBehavior, requiresGridAlignment: true };

    const snapped = snapAssetPosition(position, size, behavior, defaultGrid);

    expect(snapped).toEqual({ x: 125, y: 475 });
  });

  it('handles non-square assets with grid alignment', () => {
    const position = { x: 175, y: 285 };
    const size = { width: 100, height: 150 };
    const behavior = { ...defaultBehavior, requiresGridAlignment: true };

    const snapped = snapAssetPosition(position, size, behavior, defaultGrid);

    expect(snapped.x).toBe(200);
    expect(snapped.y).toBe(275);
  });

  it('creates new object without mutating input', () => {
    const position = { x: 123, y: 456 };
    const originalPosition = { ...position };
    const size = { width: 50, height: 50 };

    snapAssetPosition(position, size, defaultBehavior, defaultGrid);

    expect(position).toEqual(originalPosition);
  });
});

describe('checkAssetOverlap', () => {
  it('detects overlapping assets', () => {
    const asset1 = { x: 100, y: 100, width: 50, height: 50 };
    const asset2 = { x: 120, y: 120, width: 50, height: 50 };

    const overlaps = checkAssetOverlap(asset1, asset2);

    expect(overlaps).toBe(true);
  });

  it('detects non-overlapping assets horizontally separated', () => {
    const asset1 = { x: 100, y: 100, width: 50, height: 50 };
    const asset2 = { x: 200, y: 100, width: 50, height: 50 };

    const overlaps = checkAssetOverlap(asset1, asset2);

    expect(overlaps).toBe(false);
  });

  it('detects non-overlapping assets vertically separated', () => {
    const asset1 = { x: 100, y: 100, width: 50, height: 50 };
    const asset2 = { x: 100, y: 200, width: 50, height: 50 };

    const overlaps = checkAssetOverlap(asset1, asset2);

    expect(overlaps).toBe(false);
  });

  it('detects edge-touching assets as overlapping', () => {
    const asset1 = { x: 100, y: 100, width: 50, height: 50 };
    const asset2 = { x: 150, y: 100, width: 50, height: 50 };

    const overlaps = checkAssetOverlap(asset1, asset2);

    expect(overlaps).toBe(true);
  });

  it('handles different sized assets without overlap', () => {
    const asset1 = { x: 100, y: 100, width: 100, height: 100 };
    const asset2 = { x: 180, y: 180, width: 50, height: 50 };

    const overlaps = checkAssetOverlap(asset1, asset2);

    expect(overlaps).toBe(false);
  });

  it('detects complete containment as overlap', () => {
    const asset1 = { x: 100, y: 100, width: 200, height: 200 };
    const asset2 = { x: 100, y: 100, width: 50, height: 50 };

    const overlaps = checkAssetOverlap(asset1, asset2);

    expect(overlaps).toBe(true);
  });
});

describe('validatePlacement', () => {
  const defaultBehavior: PlacementBehavior = {
    canMove: true,
    canRotate: true,
    canResize: true,
    canDelete: true,
    canDuplicate: true,
    snapMode: 'grid',
    snapToGrid: true,
    requiresGridAlignment: false,
    allowOverlap: false,
    minSize: { width: 0.5, height: 0.5 },
    maxSize: { width: 10, height: 10 },
    lockAspectRatio: false,
    allowElevation: true,
    zIndexRange: [0, 100],
  };

  it('validates size within constraints', () => {
    const position = { x: 100, y: 100 };
    const size = { width: 100, height: 100 };

    const result = validatePlacement(position, size, defaultBehavior, [], defaultGrid);

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('rejects size below minimum', () => {
    const position = { x: 100, y: 100 };
    const size = { width: 10, height: 10 };

    const result = validatePlacement(position, size, defaultBehavior, [], defaultGrid);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Asset width too small (min: 0.5 cells)');
    expect(result.errors).toContain('Asset height too small (min: 0.5 cells)');
  });

  it('rejects size above maximum', () => {
    const position = { x: 100, y: 100 };
    const size = { width: 600, height: 700 };

    const result = validatePlacement(position, size, defaultBehavior, [], defaultGrid);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Asset width too large (max: 10 cells)');
    expect(result.errors).toContain('Asset height too large (max: 10 cells)');
  });

  it('detects overlap when not allowed', () => {
    const position = { x: 100, y: 100 };
    const size = { width: 50, height: 50 };
    const existingAssets = [{ x: 120, y: 120, width: 50, height: 50, allowOverlap: false }];

    const result = validatePlacement(position, size, defaultBehavior, existingAssets, defaultGrid);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Asset overlaps with existing asset');
  });

  it('allows overlap when behavior permits', () => {
    const position = { x: 100, y: 100 };
    const size = { width: 50, height: 50 };
    const behavior = { ...defaultBehavior, allowOverlap: true };
    const existingAssets = [{ x: 120, y: 120, width: 50, height: 50, allowOverlap: false }];

    const result = validatePlacement(position, size, behavior, existingAssets, defaultGrid);

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('ignores overlap with assets that allow overlap', () => {
    const position = { x: 100, y: 100 };
    const size = { width: 50, height: 50 };
    const existingAssets = [{ x: 120, y: 120, width: 50, height: 50, allowOverlap: true }];

    const result = validatePlacement(position, size, defaultBehavior, existingAssets, defaultGrid);

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('validates placement with no existing assets', () => {
    const position = { x: 100, y: 100 };
    const size = { width: 100, height: 100 };

    const result = validatePlacement(position, size, defaultBehavior, [], defaultGrid);

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('returns all validation errors when multiple constraints violated', () => {
    const position = { x: 100, y: 100 };
    const size = { width: 10, height: 700 };
    const existingAssets = [{ x: 100, y: 100, width: 50, height: 50, allowOverlap: false }];

    const result = validatePlacement(position, size, defaultBehavior, existingAssets, defaultGrid);

    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(1);
  });
});
