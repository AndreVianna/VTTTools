import { type EncounterSource, type EncounterWall, type Point, SegmentState, SegmentType } from '@/types/domain';
import type { GridConfig } from '@/utils/gridCalculator';

export interface Ray {
  origin: Point;
  angle: number;
  maxDistance: number;
}

export interface LineSegment {
  start: Point;
  end: Point;
}

export function distanceBetweenPoints(p1: Point, p2: Point): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function lineLineIntersection(a1: Point, a2: Point, b1: Point, b2: Point): Point | null {
  const dx1 = a2.x - a1.x;
  const dy1 = a2.y - a1.y;
  const dx2 = b2.x - b1.x;
  const dy2 = b2.y - b1.y;

  const determinant = dx1 * dy2 - dy1 * dx2;
  if (Math.abs(determinant) < 1e-10) {
    return null;
  }

  const t = ((b1.x - a1.x) * dy2 - (b1.y - a1.y) * dx2) / determinant;
  const u = ((b1.x - a1.x) * dy1 - (b1.y - a1.y) * dx1) / determinant;

  if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
    return {
      x: a1.x + t * dx1,
      y: a1.y + t * dy1,
    };
  }

  return null;
}

export function castRay(ray: Ray, opaqueSegments: LineSegment[]): Point {
  const rayEnd: Point = {
    x: ray.origin.x + Math.cos(ray.angle) * ray.maxDistance,
    y: ray.origin.y + Math.sin(ray.angle) * ray.maxDistance,
  };

  let closestDistance = ray.maxDistance;
  let closestIntersection: Point | null = null;

  for (const segment of opaqueSegments) {
    const intersection = lineLineIntersection(ray.origin, rayEnd, segment.start, segment.end);

    if (intersection) {
      const distance = distanceBetweenPoints(ray.origin, intersection);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIntersection = intersection;
      }
    }
  }

  return closestIntersection ?? rayEnd;
}

function isSegmentOpaque(type: SegmentType, state: SegmentState): boolean {
  switch (type) {
    case SegmentType.Wall:
      return true;
    case SegmentType.Fence:
      return false;
    case SegmentType.Door:
    case SegmentType.Window:
      return state !== SegmentState.Open;
    case SegmentType.Passage:
    case SegmentType.Opening:
      return false;
    default:
      return true;
  }
}

export function extractOpaqueSegments(encounterWalls: EncounterWall[]): LineSegment[] {
  const segments: LineSegment[] = [];

  for (const encounterWall of encounterWalls) {
    for (const wallSegment of encounterWall.segments) {
      if (isSegmentOpaque(wallSegment.type, wallSegment.state)) {
        segments.push({
          start: { x: wallSegment.startPole.x, y: wallSegment.startPole.y },
          end: { x: wallSegment.endPole.x, y: wallSegment.endPole.y },
        });
      }
    }
  }

  return segments;
}

export function calculateLineOfSight(
  source: EncounterSource,
  range: number,
  encounterWalls: EncounterWall[],
  gridConfig: GridConfig,
): Point[] {
  const rangeInPixels = range * gridConfig.cellSize.width;
  const rayCount = 72;
  const angleStep = (2 * Math.PI) / rayCount;

  const segments = extractOpaqueSegments(encounterWalls);

  const losPoints: Point[] = [];
  for (let i = 0; i < rayCount; i++) {
    const angle = i * angleStep;
    const ray: Ray = {
      origin: source.position,
      angle,
      maxDistance: rangeInPixels,
    };

    const rayEnd = castRay(ray, segments);
    losPoints.push(rayEnd);
  }

  return losPoints;
}
