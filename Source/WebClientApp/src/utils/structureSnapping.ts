import type { Point } from '@/types/domain';
import type { GridConfig } from '@/utils/gridCalculator';

export enum SnapMode {
  HalfSnap = 'half',
  QuarterSnap = 'quarter',
  Free = 'free',
}

export interface SnapTarget {
  point: Point;
  type: 'corner' | 'edge' | 'center' | 'quarter';
}

export function getSnapTargets(cellX: number, cellY: number, gridConfig: GridConfig, mode: SnapMode): SnapTarget[] {
  const { cellSize, offset } = gridConfig;
  const targets: SnapTarget[] = [];

  const pixelX = offset.left + cellX * cellSize.width;
  const pixelY = offset.top + cellY * cellSize.height;

  if (mode === SnapMode.Free) {
    return [];
  }

  targets.push(
    { point: { x: pixelX, y: pixelY }, type: 'corner' },
    { point: { x: pixelX + cellSize.width, y: pixelY }, type: 'corner' },
    { point: { x: pixelX, y: pixelY + cellSize.height }, type: 'corner' },
    {
      point: { x: pixelX + cellSize.width, y: pixelY + cellSize.height },
      type: 'corner',
    },
  );

  if (mode === SnapMode.HalfSnap || mode === SnapMode.QuarterSnap) {
    targets.push(
      { point: { x: pixelX + cellSize.width / 2, y: pixelY }, type: 'edge' },
      {
        point: { x: pixelX + cellSize.width, y: pixelY + cellSize.height / 2 },
        type: 'edge',
      },
      {
        point: { x: pixelX + cellSize.width / 2, y: pixelY + cellSize.height },
        type: 'edge',
      },
      { point: { x: pixelX, y: pixelY + cellSize.height / 2 }, type: 'edge' },
      {
        point: {
          x: pixelX + cellSize.width / 2,
          y: pixelY + cellSize.height / 2,
        },
        type: 'center',
      },
    );
  }

  if (mode === SnapMode.QuarterSnap) {
    const quarterW = cellSize.width / 4;
    const quarterH = cellSize.height / 4;
    for (let i = 1; i < 4; i++) {
      for (let j = 1; j < 4; j++) {
        if (i !== 2 || j !== 2) {
          targets.push({
            point: { x: pixelX + i * quarterW, y: pixelY + j * quarterH },
            type: 'quarter',
          });
        }
      }
    }
  }

  return targets;
}

export function snapToNearest(
  mousePos: Point,
  gridConfig: GridConfig,
  mode: SnapMode,
  snapThreshold: number = 10,
): Point {
  if (mode === SnapMode.Free) {
    return mousePos;
  }

  const { cellSize, offset } = gridConfig;
  const cellX = Math.floor((mousePos.x - offset.left) / cellSize.width);
  const cellY = Math.floor((mousePos.y - offset.top) / cellSize.height);

  const targets: SnapTarget[] = [];
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      targets.push(...getSnapTargets(cellX + dx, cellY + dy, gridConfig, mode));
    }
  }

  let closestTarget: SnapTarget | null = null;
  let closestDistance = snapThreshold;

  for (const target of targets) {
    const distance = Math.sqrt((target.point.x - mousePos.x) ** 2 + (target.point.y - mousePos.y) ** 2);
    if (distance < closestDistance) {
      closestDistance = distance;
      closestTarget = target;
    }
  }

  return closestTarget ? closestTarget.point : mousePos;
}
