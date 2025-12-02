import type Konva from 'konva';
import type { Point } from '@/types/domain';
import type { GridConfig } from '@/utils/gridCalculator';

/**
 * Snap mode determines which grid points are valid snap targets.
 * Each mode is hierarchical (includes all points from previous modes):
 * - Free: No snapping
 * - Full: Cell center only
 * - Half: Full + cell vertices (corners) + edge midpoints
 * - Quarter: Half + quarter-edge points + quadrant centers
 * - Micro: Quarter + eighth-edge points + octant centers (openings only)
 */
export enum SnapMode {
  Free = 'free',
  Full = 'full',
  Half = 'half',
  Quarter = 'quarter',
  Micro = 'micro',
}

/**
 * Keyboard modifier state for snap calculations
 */
export interface KeyModifiers {
  altKey: boolean;
  ctrlKey: boolean;
}

/**
 * Configuration for snap behavior based on keyboard modifiers
 */
export interface SnapConfig {
  default: SnapMode;
  ctrlAlt: SnapMode;
}

/**
 * Pre-configured snap configurations for different contexts:
 * - Assets: Full (center) by default, Half with Ctrl
 * - Walls: Half by default, Quarter with Ctrl
 * - Alt key always means Free (no snap) for all contexts
 */
export const AssetSnapConfig: SnapConfig = {
  default: SnapMode.Full,
  ctrlAlt: SnapMode.Half,
};

export const WallSnapConfig: SnapConfig = {
  default: SnapMode.Half,
  ctrlAlt: SnapMode.Quarter,
};

/**
 * Resolve snap mode from keyboard modifiers and configuration.
 * Alt key always means Free (no snap) regardless of context.
 */
export function resolveSnapMode(modifiers: KeyModifiers, config: SnapConfig): SnapMode {
  if (modifiers.altKey) {
    return SnapMode.Free;
  }
  if (modifiers.ctrlKey) {
    return config.ctrlAlt;
  }
  return config.default;
}

export interface SnapTarget {
  point: Point;
  type: 'corner' | 'edge' | 'center' | 'quarter' | 'micro';
}

interface StageTransform {
  x(): number;
  y(): number;
  scaleX(): number;
}

/**
 * Convert screen coordinates to world coordinates
 */
export function screenToWorld(screenPos: Point, stage: StageTransform): Point {
  const scale = stage.scaleX();
  return {
    x: (screenPos.x - stage.x()) / scale,
    y: (screenPos.y - stage.y()) / scale,
  };
}

/**
 * Convert world coordinates to screen coordinates
 */
export function worldToScreen(worldPos: Point, stage: StageTransform): Point {
  const scale = stage.scaleX();
  return {
    x: worldPos.x * scale + stage.x(),
    y: worldPos.y * scale + stage.y(),
  };
}

/**
 * Get world position from a Konva mouse event
 */
export function getWorldPositionFromEvent(e: Konva.KonvaEventObject<MouseEvent | DragEvent>): Point | null {
  const stage = e.target.getStage();
  if (!stage) return null;

  const pointer = stage.getPointerPosition();
  if (!pointer) return null;

  return screenToWorld(pointer, stage);
}

/**
 * Determine snap mode from keyboard modifier keys using a specific config.
 * @deprecated Use resolveSnapMode with explicit config instead
 */
export function getSnapModeFromEvent(
  evt: { altKey: boolean; ctrlKey: boolean },
  defaultMode: SnapMode = SnapMode.Half,
): SnapMode {
  return resolveSnapMode(evt, { default: defaultMode, ctrlAlt: SnapMode.Quarter });
}

/**
 * Generate snap targets for a grid cell.
 * Hierarchical modes (each includes all points from previous):
 * - Free: No targets
 * - Full: Cell center only
 * - Half: Full + cell vertices (corners) + edge midpoints
 * - Quarter: Half + quarter-edge points + quadrant centers
 * - Micro: Quarter + eighth-edge points + octant centers
 */
function getSnapTargets(cellX: number, cellY: number, gridConfig: GridConfig, mode: SnapMode): SnapTarget[] {
  const { cellSize, offset } = gridConfig;
  const targets: SnapTarget[] = [];

  const pixelX = offset.left + cellX * cellSize.width;
  const pixelY = offset.top + cellY * cellSize.height;
  const w = cellSize.width;
  const h = cellSize.height;

  if (mode === SnapMode.Free) {
    return [];
  }

  // Full: Cell center only
  targets.push({ point: { x: pixelX + w / 2, y: pixelY + h / 2 }, type: 'center' });

  if (mode === SnapMode.Full) {
    return targets;
  }

  // Half: Add corners (vertices) + edge midpoints
  // Corners
  targets.push(
    { point: { x: pixelX, y: pixelY }, type: 'corner' },
    { point: { x: pixelX + w, y: pixelY }, type: 'corner' },
    { point: { x: pixelX, y: pixelY + h }, type: 'corner' },
    { point: { x: pixelX + w, y: pixelY + h }, type: 'corner' },
  );
  // Edge midpoints (half-edge)
  targets.push(
    { point: { x: pixelX + w / 2, y: pixelY }, type: 'edge' },
    { point: { x: pixelX + w, y: pixelY + h / 2 }, type: 'edge' },
    { point: { x: pixelX + w / 2, y: pixelY + h }, type: 'edge' },
    { point: { x: pixelX, y: pixelY + h / 2 }, type: 'edge' },
  );

  if (mode === SnapMode.Half) {
    return targets;
  }

  // Quarter: Add quarter-edge points + quadrant centers
  // Quarter-edge points (1/4 and 3/4 along each edge)
  targets.push(
    // Top edge
    { point: { x: pixelX + w / 4, y: pixelY }, type: 'quarter' },
    { point: { x: pixelX + (3 * w) / 4, y: pixelY }, type: 'quarter' },
    // Right edge
    { point: { x: pixelX + w, y: pixelY + h / 4 }, type: 'quarter' },
    { point: { x: pixelX + w, y: pixelY + (3 * h) / 4 }, type: 'quarter' },
    // Bottom edge
    { point: { x: pixelX + w / 4, y: pixelY + h }, type: 'quarter' },
    { point: { x: pixelX + (3 * w) / 4, y: pixelY + h }, type: 'quarter' },
    // Left edge
    { point: { x: pixelX, y: pixelY + h / 4 }, type: 'quarter' },
    { point: { x: pixelX, y: pixelY + (3 * h) / 4 }, type: 'quarter' },
  );
  // Quadrant centers
  targets.push(
    { point: { x: pixelX + w / 4, y: pixelY + h / 4 }, type: 'quarter' },
    { point: { x: pixelX + (3 * w) / 4, y: pixelY + h / 4 }, type: 'quarter' },
    { point: { x: pixelX + w / 4, y: pixelY + (3 * h) / 4 }, type: 'quarter' },
    { point: { x: pixelX + (3 * w) / 4, y: pixelY + (3 * h) / 4 }, type: 'quarter' },
  );
  // Also add vertical/horizontal lines through quadrant centers
  targets.push(
    { point: { x: pixelX + w / 4, y: pixelY + h / 2 }, type: 'quarter' },
    { point: { x: pixelX + (3 * w) / 4, y: pixelY + h / 2 }, type: 'quarter' },
    { point: { x: pixelX + w / 2, y: pixelY + h / 4 }, type: 'quarter' },
    { point: { x: pixelX + w / 2, y: pixelY + (3 * h) / 4 }, type: 'quarter' },
  );

  if (mode === SnapMode.Quarter) {
    return targets;
  }

  // Micro: Add eighth-edge points + octant centers
  // Eighth-edge points (1/8, 3/8, 5/8, 7/8 along each edge)
  targets.push(
    // Top edge
    { point: { x: pixelX + w / 8, y: pixelY }, type: 'micro' },
    { point: { x: pixelX + (3 * w) / 8, y: pixelY }, type: 'micro' },
    { point: { x: pixelX + (5 * w) / 8, y: pixelY }, type: 'micro' },
    { point: { x: pixelX + (7 * w) / 8, y: pixelY }, type: 'micro' },
    // Right edge
    { point: { x: pixelX + w, y: pixelY + h / 8 }, type: 'micro' },
    { point: { x: pixelX + w, y: pixelY + (3 * h) / 8 }, type: 'micro' },
    { point: { x: pixelX + w, y: pixelY + (5 * h) / 8 }, type: 'micro' },
    { point: { x: pixelX + w, y: pixelY + (7 * h) / 8 }, type: 'micro' },
    // Bottom edge
    { point: { x: pixelX + w / 8, y: pixelY + h }, type: 'micro' },
    { point: { x: pixelX + (3 * w) / 8, y: pixelY + h }, type: 'micro' },
    { point: { x: pixelX + (5 * w) / 8, y: pixelY + h }, type: 'micro' },
    { point: { x: pixelX + (7 * w) / 8, y: pixelY + h }, type: 'micro' },
    // Left edge
    { point: { x: pixelX, y: pixelY + h / 8 }, type: 'micro' },
    { point: { x: pixelX, y: pixelY + (3 * h) / 8 }, type: 'micro' },
    { point: { x: pixelX, y: pixelY + (5 * h) / 8 }, type: 'micro' },
    { point: { x: pixelX, y: pixelY + (7 * h) / 8 }, type: 'micro' },
  );
  // Octant centers (8 points around the cell interior at 1/8 and 7/8 positions)
  targets.push(
    { point: { x: pixelX + w / 8, y: pixelY + h / 8 }, type: 'micro' },
    { point: { x: pixelX + (7 * w) / 8, y: pixelY + h / 8 }, type: 'micro' },
    { point: { x: pixelX + w / 8, y: pixelY + (7 * h) / 8 }, type: 'micro' },
    { point: { x: pixelX + (7 * w) / 8, y: pixelY + (7 * h) / 8 }, type: 'micro' },
  );
  // Additional micro interior points (3/8 and 5/8 grid)
  targets.push(
    { point: { x: pixelX + (3 * w) / 8, y: pixelY + h / 8 }, type: 'micro' },
    { point: { x: pixelX + (5 * w) / 8, y: pixelY + h / 8 }, type: 'micro' },
    { point: { x: pixelX + (3 * w) / 8, y: pixelY + (7 * h) / 8 }, type: 'micro' },
    { point: { x: pixelX + (5 * w) / 8, y: pixelY + (7 * h) / 8 }, type: 'micro' },
    { point: { x: pixelX + w / 8, y: pixelY + (3 * h) / 8 }, type: 'micro' },
    { point: { x: pixelX + w / 8, y: pixelY + (5 * h) / 8 }, type: 'micro' },
    { point: { x: pixelX + (7 * w) / 8, y: pixelY + (3 * h) / 8 }, type: 'micro' },
    { point: { x: pixelX + (7 * w) / 8, y: pixelY + (5 * h) / 8 }, type: 'micro' },
  );
  // Interior micro grid points (3/8 and 5/8 intersections)
  targets.push(
    { point: { x: pixelX + (3 * w) / 8, y: pixelY + (3 * h) / 8 }, type: 'micro' },
    { point: { x: pixelX + (5 * w) / 8, y: pixelY + (3 * h) / 8 }, type: 'micro' },
    { point: { x: pixelX + (3 * w) / 8, y: pixelY + (5 * h) / 8 }, type: 'micro' },
    { point: { x: pixelX + (5 * w) / 8, y: pixelY + (5 * h) / 8 }, type: 'micro' },
  );
  // Cross points at micro positions through center lines
  targets.push(
    { point: { x: pixelX + w / 8, y: pixelY + h / 2 }, type: 'micro' },
    { point: { x: pixelX + (3 * w) / 8, y: pixelY + h / 2 }, type: 'micro' },
    { point: { x: pixelX + (5 * w) / 8, y: pixelY + h / 2 }, type: 'micro' },
    { point: { x: pixelX + (7 * w) / 8, y: pixelY + h / 2 }, type: 'micro' },
    { point: { x: pixelX + w / 2, y: pixelY + h / 8 }, type: 'micro' },
    { point: { x: pixelX + w / 2, y: pixelY + (3 * h) / 8 }, type: 'micro' },
    { point: { x: pixelX + w / 2, y: pixelY + (5 * h) / 8 }, type: 'micro' },
    { point: { x: pixelX + w / 2, y: pixelY + (7 * h) / 8 }, type: 'micro' },
  );
  // Cross points at micro positions through quarter lines
  targets.push(
    { point: { x: pixelX + w / 8, y: pixelY + h / 4 }, type: 'micro' },
    { point: { x: pixelX + (3 * w) / 8, y: pixelY + h / 4 }, type: 'micro' },
    { point: { x: pixelX + (5 * w) / 8, y: pixelY + h / 4 }, type: 'micro' },
    { point: { x: pixelX + (7 * w) / 8, y: pixelY + h / 4 }, type: 'micro' },
    { point: { x: pixelX + w / 8, y: pixelY + (3 * h) / 4 }, type: 'micro' },
    { point: { x: pixelX + (3 * w) / 8, y: pixelY + (3 * h) / 4 }, type: 'micro' },
    { point: { x: pixelX + (5 * w) / 8, y: pixelY + (3 * h) / 4 }, type: 'micro' },
    { point: { x: pixelX + (7 * w) / 8, y: pixelY + (3 * h) / 4 }, type: 'micro' },
    { point: { x: pixelX + w / 4, y: pixelY + h / 8 }, type: 'micro' },
    { point: { x: pixelX + w / 4, y: pixelY + (3 * h) / 8 }, type: 'micro' },
    { point: { x: pixelX + w / 4, y: pixelY + (5 * h) / 8 }, type: 'micro' },
    { point: { x: pixelX + w / 4, y: pixelY + (7 * h) / 8 }, type: 'micro' },
    { point: { x: pixelX + (3 * w) / 4, y: pixelY + h / 8 }, type: 'micro' },
    { point: { x: pixelX + (3 * w) / 4, y: pixelY + (3 * h) / 8 }, type: 'micro' },
    { point: { x: pixelX + (3 * w) / 4, y: pixelY + (5 * h) / 8 }, type: 'micro' },
    { point: { x: pixelX + (3 * w) / 8, y: pixelY + (7 * h) / 8 }, type: 'micro' },
  );

  return targets;
}

/**
 * Snap a world position to the nearest grid target
 * This is THE single snapping function for points (walls, regions, sources)
 * Always snaps to the nearest valid target - no threshold needed since
 * we always want to snap to the closest point in the current snap mode.
 */
export function snap(worldPos: Point, gridConfig: GridConfig, mode: SnapMode): Point {
  if (mode === SnapMode.Free || !gridConfig.snap) {
    return worldPos;
  }

  const { cellSize, offset } = gridConfig;
  const cellX = Math.floor((worldPos.x - offset.left) / cellSize.width);
  const cellY = Math.floor((worldPos.y - offset.top) / cellSize.height);

  // Collect targets from surrounding cells
  const targets: SnapTarget[] = [];
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      targets.push(...getSnapTargets(cellX + dx, cellY + dy, gridConfig, mode));
    }
  }

  // Find the nearest target (always snap to closest)
  let closestTarget: SnapTarget | null = null;
  let closestDistance = Number.POSITIVE_INFINITY;

  for (const target of targets) {
    const distance = Math.sqrt((target.point.x - worldPos.x) ** 2 + (target.point.y - worldPos.y) ** 2);
    if (distance < closestDistance) {
      closestDistance = distance;
      closestTarget = target;
    }
  }

  return closestTarget ? closestTarget.point : worldPos;
}

/**
 * Snap a world position from a mouse event
 * Combines coordinate conversion and snapping in one call
 */
export function snapFromEvent(
  e: Konva.KonvaEventObject<MouseEvent>,
  gridConfig: GridConfig,
  defaultMode?: SnapMode,
): Point | null {
  const worldPos = getWorldPositionFromEvent(e);
  if (!worldPos) return null;

  const mode = getSnapModeFromEvent(e.evt, defaultMode);
  return snap(worldPos, gridConfig, mode);
}

/**
 * Create a dragBoundFunc for Konva draggable nodes
 * Handles screen↔world coordinate conversion and snapping
 */
export function createDragBoundFunc(
  gridConfig: GridConfig,
  getSnapMode: () => SnapMode,
  isSnapEnabled: () => boolean,
): (this: Konva.Node, pos: Point) => Point {
  return function (this: Konva.Node, pos: Point): Point {
    if (!isSnapEnabled()) {
      return pos;
    }

    const mode = getSnapMode();
    if (mode === SnapMode.Free) {
      return pos;
    }

    const stage = this.getStage();
    if (!stage) {
      return pos;
    }

    // Convert screen position to world coordinates
    const worldPos = screenToWorld(pos, stage);

    // Snap in world coordinates
    const snapped = snap(worldPos, gridConfig, mode);

    // Convert back to screen coordinates
    return worldToScreen(snapped, stage);
  };
}
