import { type EncounterLightSource, type EncounterWall, type Point, SegmentState, SegmentType } from '@/types/domain';
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

function isSegmentOpaque(segment: { type: SegmentType; state: SegmentState; isOpaque: boolean }): boolean {
  if (segment.type === SegmentType.Door || segment.type === SegmentType.Window) {
    return segment.isOpaque && segment.state === SegmentState.Closed;
  }
  return segment.isOpaque;
}

export function extractOpaqueSegments(encounterWalls: EncounterWall[]): LineSegment[] {
  const segments: LineSegment[] = [];

  for (const encounterWall of encounterWalls) {
    for (const wallSegment of encounterWall.segments) {
      if (isSegmentOpaque(wallSegment)) {
        segments.push({
          start: { x: wallSegment.startPole.x, y: wallSegment.startPole.y },
          end: { x: wallSegment.endPole.x, y: wallSegment.endPole.y },
        });
      }
    }
  }

  return segments;
}

/**
 * Collect all unique wall vertices (endpoints) from segments.
 * These are used for precise shadow casting.
 */
function collectWallVertices(segments: LineSegment[]): Point[] {
  const vertexMap = new Map<string, Point>();

  for (const segment of segments) {
    const startKey = `${segment.start.x},${segment.start.y}`;
    const endKey = `${segment.end.x},${segment.end.y}`;
    vertexMap.set(startKey, segment.start);
    vertexMap.set(endKey, segment.end);
  }

  return Array.from(vertexMap.values());
}

/**
 * Calculate angle from source to a target point.
 */
function angleToPoint(source: Point, target: Point): number {
  return Math.atan2(target.y - source.y, target.x - source.x);
}

/**
 * Normalize angle to [0, 2π) range.
 */
function normalizeAngle(angle: number): number {
  while (angle < 0) angle += 2 * Math.PI;
  while (angle >= 2 * Math.PI) angle -= 2 * Math.PI;
  return angle;
}

/**
 * Check if an angle is within a directional arc.
 */
function isAngleInArc(angle: number, startAngle: number, endAngle: number): boolean {
  const normAngle = normalizeAngle(angle);
  const normStart = normalizeAngle(startAngle);
  const normEnd = normalizeAngle(endAngle);

  if (normStart <= normEnd) {
    return normAngle >= normStart && normAngle <= normEnd;
  }
  // Arc crosses 0
  return normAngle >= normStart || normAngle <= normEnd;
}

export function calculateLineOfSight(
  source: EncounterLightSource,
  range: number,
  encounterWalls: EncounterWall[],
  gridConfig: GridConfig,
): Point[] {
  const rangeInPixels = range * gridConfig.cellSize.width;
  const segments = extractOpaqueSegments(encounterWalls);
  const vertices = collectWallVertices(segments);

  const isDirectional = source.direction != null && source.arc != null;

  // Small angle offset for casting rays just past wall corners
  const EPSILON = 0.0001;

  // Collect all angles to cast rays
  const angles: number[] = [];

  if (isDirectional) {
    const directionRadians = (source.direction! * Math.PI) / 180;
    const halfArcRadians = ((source.arc! / 2) * Math.PI) / 180;

    const startAngle = directionRadians - halfArcRadians;
    const endAngle = directionRadians + halfArcRadians;

    // Add fixed interval rays within the arc
    const rayCount = Math.max(12, Math.ceil((source.arc! / 360) * 72));
    const angleStep = (endAngle - startAngle) / Math.max(1, rayCount - 1);

    for (let i = 0; i < rayCount; i++) {
      angles.push(startAngle + i * angleStep);
    }

    // Add rays toward wall vertices within the arc (with slight offsets)
    for (const vertex of vertices) {
      const dist = distanceBetweenPoints(source.position, vertex);
      if (dist > rangeInPixels || dist < 1) continue;

      const angle = angleToPoint(source.position, vertex);
      if (isAngleInArc(angle, startAngle, endAngle)) {
        angles.push(angle - EPSILON);
        angles.push(angle);
        angles.push(angle + EPSILON);
      }
    }

    // Sort angles and remove duplicates
    angles.sort((a, b) => a - b);
    const uniqueAngles = angles.filter((angle, i) =>
      i === 0 || Math.abs(angle - angles[i - 1]!) > EPSILON / 2
    );

    const losPoints: Point[] = [];
    losPoints.push(source.position);

    for (const angle of uniqueAngles) {
      const ray: Ray = {
        origin: source.position,
        angle,
        maxDistance: rangeInPixels,
      };
      losPoints.push(castRay(ray, segments));
    }

    losPoints.push(source.position);
    return losPoints;
  }

  // Non-directional (360°) light source

  // Add fixed interval rays (base coverage)
  const rayCount = 72;
  const angleStep = (2 * Math.PI) / rayCount;

  for (let i = 0; i < rayCount; i++) {
    angles.push(i * angleStep);
  }

  // Add rays toward wall vertices (with slight offsets for corner precision)
  for (const vertex of vertices) {
    const dist = distanceBetweenPoints(source.position, vertex);
    if (dist > rangeInPixels || dist < 1) continue;

    const angle = angleToPoint(source.position, vertex);
    angles.push(angle - EPSILON);
    angles.push(angle);
    angles.push(angle + EPSILON);
  }

  // Sort angles and remove near-duplicates
  angles.sort((a, b) => normalizeAngle(a) - normalizeAngle(b));
  const uniqueAngles = angles.filter((angle, i) =>
    i === 0 || Math.abs(normalizeAngle(angle) - normalizeAngle(angles[i - 1]!)) > EPSILON / 2
  );

  const losPoints: Point[] = [];
  for (const angle of uniqueAngles) {
    const ray: Ray = {
      origin: source.position,
      angle,
      maxDistance: rangeInPixels,
    };
    losPoints.push(castRay(ray, segments));
  }

  return losPoints;
}
