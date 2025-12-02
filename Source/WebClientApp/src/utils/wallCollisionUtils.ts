import type { EncounterWall, Point } from '@/types/domain';
import type { GridConfig } from '@/utils/gridCalculator';
import { getPolesFromWall, isWallClosed } from './wallUtils';

export interface CollisionConfig {
  tolerance?: number;
  useSpatialHash?: boolean;
}

export interface PoleCollision {
  newPoleIndex: number;
  existingWallIndex: number;
  existingPoleIndex: number;
  distance: number;
}
export interface PoleCollisionResult {
  hasCollision: boolean;
  collisions: PoleCollision[];
}

export interface EdgeCollision {
  newEdgeIndex: number;
  existingWallIndex: number;
  existingEdgeIndex: number;
  intersectionPoint: Point;
}

export interface EdgeCollisionResult {
  hasCollision: boolean;
  intersections: EdgeCollision[];
}

export interface PoleOnEdgeCollision {
  poleIndex: number;
  existingWallIndex: number;
  existingEdgeIndex: number;
  distance: number;
  projectionPoint: Point;
}
export interface PoleOnEdgeCollisionResult {
  hasCollision: boolean;
  collisions: PoleOnEdgeCollision[];
}

export interface BoundingBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export function calculateDistance(p1: Point, p2: Point): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function calculatePerpendicularDistance(point: Point, lineStart: Point, lineEnd: Point): number {
  const lineLength = calculateDistance(lineStart, lineEnd);
  if (lineLength === 0) {
    return calculateDistance(point, lineStart);
  }

  const t = Math.max(
    0,
    Math.min(
      1,
      ((point.x - lineStart.x) * (lineEnd.x - lineStart.x) + (point.y - lineStart.y) * (lineEnd.y - lineStart.y)) /
        (lineLength * lineLength),
    ),
  );

  const projectionX = lineStart.x + t * (lineEnd.x - lineStart.x);
  const projectionY = lineStart.y + t * (lineEnd.y - lineStart.y);

  return calculateDistance(point, { x: projectionX, y: projectionY });
}

export function findLineIntersection(a1: Point, a2: Point, b1: Point, b2: Point): Point | null {
  const denom = (a1.x - a2.x) * (b1.y - b2.y) - (a1.y - a2.y) * (b1.x - b2.x);

  if (Math.abs(denom) < 1e-10) {
    return null;
  }

  const t = ((a1.x - b1.x) * (b1.y - b2.y) - (a1.y - b1.y) * (b1.x - b2.x)) / denom;
  const u = -((a1.x - a2.x) * (a1.y - b1.y) - (a1.y - a2.y) * (a1.x - b1.x)) / denom;

  if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
    return {
      x: a1.x + t * (a2.x - a1.x),
      y: a1.y + t * (a2.y - a1.y),
    };
  }

  return null;
}

export function boundingBoxesOverlap(box1: BoundingBox, box2: BoundingBox): boolean {
  return !(box1.maxX < box2.minX || box1.minX > box2.maxX || box1.maxY < box2.minY || box1.minY > box2.maxY);
}

export function createBoundingBox(p1: Point, p2: Point): BoundingBox {
  return {
    minX: Math.min(p1.x, p2.x),
    minY: Math.min(p1.y, p2.y),
    maxX: Math.max(p1.x, p2.x),
    maxY: Math.max(p1.y, p2.y),
  };
}

interface SpatialHashCell {
  wallIndex: number;
  poleIndex: number;
  pole: Point;
}

interface SpatialHash {
  cellSize: number;
  cells: Map<string, SpatialHashCell[]>;
}

function createSpatialHash(walls: EncounterWall[], cellSize: number): SpatialHash {
  const hash: SpatialHash = {
    cellSize,
    cells: new Map(),
  };

  walls.forEach((wall, wallIndex) => {
    const poles = getPolesFromWall(wall);
    poles.forEach((pole, poleIndex) => {
      const cellX = Math.floor(pole.x / cellSize);
      const cellY = Math.floor(pole.y / cellSize);
      const key = `${cellX},${cellY}`;

      if (!hash.cells.has(key)) {
        hash.cells.set(key, []);
      }

      hash.cells.get(key)?.push({ wallIndex, poleIndex, pole });
    });
  });

  return hash;
}

function querySpatialHash(hash: SpatialHash, point: Point, tolerance: number): SpatialHashCell[] {
  const results: SpatialHashCell[] = [];
  const cellX = Math.floor(point.x / hash.cellSize);
  const cellY = Math.floor(point.y / hash.cellSize);
  const cellRadius = Math.ceil(tolerance / hash.cellSize);

  for (let dx = -cellRadius; dx <= cellRadius; dx++) {
    for (let dy = -cellRadius; dy <= cellRadius; dy++) {
      const key = `${cellX + dx},${cellY + dy}`;
      const cells = hash.cells.get(key);
      if (cells) {
        results.push(...cells);
      }
    }
  }

  return results;
}

export function detectPoleOnPoleCollision(
  newWallPoles: Point[],
  existingWalls: EncounterWall[],
  _gridConfig: GridConfig,
  tolerance: number = 5,
): PoleCollisionResult {
  const collisions: PoleCollisionResult['collisions'] = [];

  if (newWallPoles.length === 0 || existingWalls.length === 0) {
    return { hasCollision: false, collisions };
  }

  const useSpatialHash = existingWalls.length >= 50;

  if (useSpatialHash) {
    const hash = createSpatialHash(existingWalls, tolerance * 2);

    newWallPoles.forEach((newPole, newPoleIndex) => {
      const candidates = querySpatialHash(hash, newPole, tolerance);

      candidates.forEach(({ wallIndex, poleIndex, pole }) => {
        const distance = calculateDistance(newPole, pole);
        if (distance <= tolerance) {
          collisions.push({
            newPoleIndex,
            existingWallIndex: wallIndex,
            existingPoleIndex: poleIndex,
            distance,
          });
        }
      });
    });
  } else {
    newWallPoles.forEach((newPole, newPoleIndex) => {
      existingWalls.forEach((wall, wallIndex) => {
        const poles = getPolesFromWall(wall);
        poles.forEach((existingPole, poleIndex) => {
          const distance = calculateDistance(newPole, existingPole);
          if (distance <= tolerance) {
            collisions.push({
              newPoleIndex,
              existingWallIndex: wallIndex,
              existingPoleIndex: poleIndex,
              distance,
            });
          }
        });
      });
    });
  }

  return {
    hasCollision: collisions.length > 0,
    collisions,
  };
}

export function detectEdgeOnEdgeIntersection(
  newWallPoles: Point[],
  existingWalls: EncounterWall[],
  _gridConfig: GridConfig,
): EdgeCollisionResult {
  const intersections: EdgeCollisionResult['intersections'] = [];

  if (newWallPoles.length < 2 || existingWalls.length === 0) {
    return { hasCollision: false, intersections };
  }

  for (let i = 0; i < newWallPoles.length - 1; i++) {
    const newEdgeStart = newWallPoles[i];
    const newEdgeEnd = newWallPoles[i + 1];
    if (!newEdgeStart || !newEdgeEnd) continue;

    const newEdgeBox = createBoundingBox(newEdgeStart, newEdgeEnd);

    existingWalls.forEach((wall, wallIndex) => {
      const poles = getPolesFromWall(wall);
      if (poles.length < 2) {
        return;
      }

      for (let j = 0; j < poles.length; j++) {
        const existingEdgeStart = poles[j];
        const existingEdgeEnd = poles[(j + 1) % poles.length];
        if (!existingEdgeStart || !existingEdgeEnd) continue;

        if (j === poles.length - 1 && !isWallClosed(wall)) {
          break;
        }

        const existingEdgeBox = createBoundingBox(existingEdgeStart, existingEdgeEnd);

        if (!boundingBoxesOverlap(newEdgeBox, existingEdgeBox)) {
          continue;
        }

        const intersection = findLineIntersection(newEdgeStart, newEdgeEnd, existingEdgeStart, existingEdgeEnd);

        if (intersection) {
          intersections.push({
            newEdgeIndex: i,
            existingWallIndex: wallIndex,
            existingEdgeIndex: j,
            intersectionPoint: intersection,
          });
        }
      }
    });
  }

  return {
    hasCollision: intersections.length > 0,
    intersections,
  };
}

export function detectPoleOnEdgeCollision(
  poles: Point[],
  existingWalls: EncounterWall[],
  _gridConfig: GridConfig,
  tolerance: number = 5,
): PoleOnEdgeCollisionResult {
  const collisions: PoleOnEdgeCollisionResult['collisions'] = [];

  if (poles.length === 0 || existingWalls.length === 0) {
    return { hasCollision: false, collisions };
  }

  poles.forEach((pole, poleIndex) => {
    existingWalls.forEach((wall, wallIndex) => {
      const wallPoles = getPolesFromWall(wall);
      if (wallPoles.length < 2) {
        return;
      }

      for (let j = 0; j < wallPoles.length; j++) {
        const edgeStart = wallPoles[j];
        const edgeEnd = wallPoles[(j + 1) % wallPoles.length];
        if (!edgeStart || !edgeEnd) continue;

        if (j === wallPoles.length - 1 && !isWallClosed(wall)) {
          break;
        }

        const lineLength = calculateDistance(edgeStart, edgeEnd);
        if (lineLength === 0) {
          continue;
        }

        const rawT =
          ((pole.x - edgeStart.x) * (edgeEnd.x - edgeStart.x) + (pole.y - edgeStart.y) * (edgeEnd.y - edgeStart.y)) /
          (lineLength * lineLength);

        const endpointThreshold = 0.05;
        if (rawT < endpointThreshold || rawT > 1 - endpointThreshold) {
          continue;
        }

        const distance = calculatePerpendicularDistance(pole, edgeStart, edgeEnd);

        if (distance <= tolerance) {
          const projectionX = edgeStart.x + rawT * (edgeEnd.x - edgeStart.x);
          const projectionY = edgeStart.y + rawT * (edgeEnd.y - edgeStart.y);

          collisions.push({
            poleIndex,
            existingWallIndex: wallIndex,
            existingEdgeIndex: j,
            distance,
            projectionPoint: { x: projectionX, y: projectionY },
          });
        }
      }
    });
  });

  return {
    hasCollision: collisions.length > 0,
    collisions,
  };
}
