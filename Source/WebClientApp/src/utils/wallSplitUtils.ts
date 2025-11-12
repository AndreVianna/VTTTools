import type { EncounterWall, Point } from '@/types/domain';
import type { GridConfig } from '@/utils/gridCalculator';
import { GridType } from '@/utils/gridCalculator';
import { calculateDistance, detectEdgeOnEdgeIntersection, detectPoleOnEdgeCollision } from './wallCollisionUtils';

export interface SplitPoint {
  wallIndex: number;
  edgeIndex: number;
  splitPosition: Point;
  splitType: 'intersection' | 'pole-on-edge';
}

export interface SplitResult {
  needsSplit: boolean;
  splits: SplitPoint[];
  affectedWallIndices: number[];
}

export function detectSplitPoints(params: {
  newWallPoles: Point[];
  existingWalls: EncounterWall[];
  tolerance?: number;
}): SplitResult {
  const { newWallPoles, existingWalls, tolerance = 5 } = params;
  const splits: SplitPoint[] = [];
  const affectedWallIndices = new Set<number>();

  const gridConfig: GridConfig = {
    type: GridType.NoGrid,
    cellSize: { width: 50, height: 50 },
    offset: { left: 0, top: 0 },
    snap: false,
  };

  const edgeIntersections = detectEdgeOnEdgeIntersection(newWallPoles, existingWalls, gridConfig);

  edgeIntersections.intersections.forEach((intersection) => {
    const existingWall = existingWalls[intersection.existingWallIndex];
    if (!existingWall) return;

    const isNearExistingPole = existingWall.poles.some((pole) => {
      const dist = calculateDistance(intersection.intersectionPoint, pole);
      return dist <= tolerance;
    });

    if (!isNearExistingPole) {
      splits.push({
        wallIndex: intersection.existingWallIndex,
        edgeIndex: intersection.existingEdgeIndex,
        splitPosition: intersection.intersectionPoint,
        splitType: 'intersection',
      });
      affectedWallIndices.add(intersection.existingWallIndex);
    }
  });

  const poleCollisions = detectPoleOnEdgeCollision(newWallPoles, existingWalls, gridConfig, tolerance);

  poleCollisions.collisions.forEach((collision) => {
    const existingWall = existingWalls[collision.existingWallIndex];
    if (!existingWall) return;

    const isNearExistingPole = existingWall.poles.some((pole) => {
      const dist = calculateDistance(collision.projectionPoint, pole);
      return dist <= tolerance;
    });

    if (!isNearExistingPole) {
      const isDuplicate = splits.some(
        (existing) =>
          existing.wallIndex === collision.existingWallIndex &&
          existing.edgeIndex === collision.existingEdgeIndex &&
          calculateDistance(existing.splitPosition, collision.projectionPoint) <= tolerance,
      );

      if (!isDuplicate) {
        splits.push({
          wallIndex: collision.existingWallIndex,
          edgeIndex: collision.existingEdgeIndex,
          splitPosition: collision.projectionPoint,
          splitType: 'pole-on-edge',
        });
        affectedWallIndices.add(collision.existingWallIndex);
      }
    }
  });

  return {
    needsSplit: splits.length > 0,
    splits,
    affectedWallIndices: Array.from(affectedWallIndices).sort((a, b) => a - b),
  };
}

export function splitWallAtPoints(params: {
  wall: EncounterWall;
  splitPoints: SplitPoint[];
  wallIndex: number;
}): EncounterWall[] {
  const { wall, splitPoints, wallIndex } = params;

  if (wall.poles.length < 2) {
    return [];
  }

  if (splitPoints.length === 0) {
    return [wall];
  }

  const wallSplits = splitPoints.filter((sp) => sp.wallIndex === wallIndex);

  if (wallSplits.length === 0) {
    return [wall];
  }

  const sortedSplits = sortSplitPoints(wallSplits, wall);

  const segments: EncounterWall[] = [];
  let currentSegmentPoles: typeof wall.poles = [];
  let poleIndex = 0;
  let splitIndex = 0;

  while (poleIndex < wall.poles.length) {
    const currentPole = wall.poles[poleIndex];
    if (!currentPole) break;

    currentSegmentPoles.push({ ...currentPole });

    const nextPoleIndex = (poleIndex + 1) % wall.poles.length;
    const isLastEdge = poleIndex === wall.poles.length - 1;

    if (isLastEdge && !wall.isClosed) {
      poleIndex++;
      continue;
    }

    while (splitIndex < sortedSplits.length && sortedSplits[splitIndex]?.edgeIndex === poleIndex) {
      const split = sortedSplits[splitIndex]!;
      const nextPole = wall.poles[nextPoleIndex];
      if (!nextPole) break;

      const edgeLength = calculateDistance(currentPole, nextPole);
      const distanceToSplit = calculateDistanceAlongEdge(split.splitPosition, currentPole, nextPole);
      const t = edgeLength > 0 ? distanceToSplit / edgeLength : 0;

      const interpolatedH = currentPole.h + t * (nextPole.h - currentPole.h);

      currentSegmentPoles.push({
        x: split.splitPosition.x,
        y: split.splitPosition.y,
        h: interpolatedH,
      });

      if (currentSegmentPoles.length >= 2) {
        segments.push(createSegment(wall, currentSegmentPoles, segments.length + 1));
      }

      currentSegmentPoles = [
        {
          x: split.splitPosition.x,
          y: split.splitPosition.y,
          h: interpolatedH,
        },
      ];

      splitIndex++;
    }

    poleIndex++;
  }

  if (currentSegmentPoles.length >= 2) {
    segments.push(createSegment(wall, currentSegmentPoles, segments.length + 1));
  }

  return segments.length > 0 ? segments : [wall];
}

function createSegment(
  originalWall: EncounterWall,
  poles: typeof originalWall.poles,
  segmentNumber: number,
): EncounterWall {
  const baseName = originalWall.name.replace(/\s*\(\d+\)$/, '');
  return {
    ...originalWall,
    name: `${baseName} (${segmentNumber})`,
    poles: poles.map((p) => ({ ...p })),
    isClosed: false,
  };
}

export function calculateDistanceAlongEdge(point: Point, edgeStart: Point, edgeEnd: Point): number {
  const edgeLength = calculateDistance(edgeStart, edgeEnd);
  if (edgeLength === 0) {
    return 0;
  }

  const t =
    ((point.x - edgeStart.x) * (edgeEnd.x - edgeStart.x) + (point.y - edgeStart.y) * (edgeEnd.y - edgeStart.y)) /
    (edgeLength * edgeLength);

  const clampedT = Math.max(0, Math.min(1, t));
  return clampedT * edgeLength;
}

export function sortSplitPoints(splitPoints: SplitPoint[], wall: EncounterWall): SplitPoint[] {
  return [...splitPoints].sort((a, b) => {
    if (a.edgeIndex !== b.edgeIndex) {
      return a.edgeIndex - b.edgeIndex;
    }

    const edgeStart = wall.poles[a.edgeIndex];
    const edgeEnd = wall.poles[(a.edgeIndex + 1) % wall.poles.length];
    if (!edgeStart || !edgeEnd) return 0;

    const distA = calculateDistanceAlongEdge(a.splitPosition, edgeStart, edgeEnd);
    const distB = calculateDistanceAlongEdge(b.splitPosition, edgeStart, edgeEnd);
    return distA - distB;
  });
}
