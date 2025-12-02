import type { PlacedWall, Point } from '@/types/domain';
import { SegmentState, SegmentType } from '@/types/domain';
import { getPolesFromWall, isWallClosed } from './wallUtils';

interface LineSegment {
  start: Point;
  end: Point;
}

interface BoundaryResult {
  vertices: Point[] | null;
  isFullStage: boolean;
  boundingWalls: PlacedWall[];
}

const EPSILON = 1e-10;
const TOLERANCE = 0.01;

function arePointsEqual(p1: Point, p2: Point, tolerance = TOLERANCE): boolean {
  return Math.abs(p1.x - p2.x) < tolerance && Math.abs(p1.y - p2.y) < tolerance;
}

function normalizeAngle(angle: number): number {
  while (angle > Math.PI) angle -= 2 * Math.PI;
  while (angle < -Math.PI) angle += 2 * Math.PI;
  return angle;
}

function lineSegmentIntersectsRay(segment: LineSegment, rayOrigin: Point, rayDirection: Point): boolean {
  const { start, end } = segment;
  const dx = end.x - start.x;
  const dy = end.y - start.y;

  const det = dx * rayDirection.y - dy * rayDirection.x;

  if (Math.abs(det) < EPSILON) {
    return false;
  }

  const t = ((rayOrigin.x - start.x) * rayDirection.y - (rayOrigin.y - start.y) * rayDirection.x) / det;
  const u = ((rayOrigin.x - start.x) * dy - (rayOrigin.y - start.y) * dx) / det;

  if (t < 0 || t > 1 || u <= EPSILON) {
    return false;
  }

  if (Math.abs(t) < EPSILON) {
    return start.y < end.y;
  }

  if (Math.abs(t - 1) < EPSILON) {
    return end.y < start.y;
  }

  return true;
}

function getWallSegments(wall: PlacedWall): LineSegment[] {
  const segments: LineSegment[] = [];

  if (!isWallClosed(wall)) {
    return segments;
  }

  for (const wallSegment of wall.segments) {
    const isPassable = wallSegment.type === SegmentType.Passage ||
                      wallSegment.type === SegmentType.Opening ||
                      (wallSegment.type === SegmentType.Door && wallSegment.state === SegmentState.Open);

    if (!isPassable) {
      segments.push({
        start: { x: wallSegment.startPole.x, y: wallSegment.startPole.y },
        end: { x: wallSegment.endPole.x, y: wallSegment.endPole.y },
      });
    }
  }

  return segments;
}

function isPointEnclosed(point: Point, walls: PlacedWall[]): boolean {
  const rayDirection = { x: 1, y: 0 };
  let intersectionCount = 0;

  for (const wall of walls) {
    const segments = getWallSegments(wall);

    for (const segment of segments) {
      if (lineSegmentIntersectsRay(segment, point, rayDirection)) {
        intersectionCount++;
      }
    }
  }

  return intersectionCount % 2 === 1;
}

function isPointInPolygon(point: Point, polygon: Point[]): boolean {
  if (polygon.length < 3) return false;

  const rayDirection = { x: 1, y: 0 };
  let intersectionCount = 0;

  for (let i = 0; i < polygon.length; i++) {
    const start = polygon[i];
    const end = polygon[(i + 1) % polygon.length];
    if (!start || !end) continue;
    const segment: LineSegment = { start, end };

    if (lineSegmentIntersectsRay(segment, point, rayDirection)) {
      intersectionCount++;
    }
  }

  return intersectionCount % 2 === 1;
}

function findBoundaryStartPoint(
  point: Point,
  walls: PlacedWall[]
): Point | null {
  const allSegments: LineSegment[] = [];

  for (const wall of walls) {
    const segments = getWallSegments(wall);
    allSegments.push(...segments);
  }

  if (allSegments.length === 0) {
    return null;
  }

  let nearestPoint: Point | null = null;
  let minDistance = Infinity;

  for (const segment of allSegments) {
    const segmentStartDist = Math.sqrt(
      (segment.start.x - point.x) ** 2 + (segment.start.y - point.y) ** 2
    );
    const segmentEndDist = Math.sqrt(
      (segment.end.x - point.x) ** 2 + (segment.end.y - point.y) ** 2
    );

    if (segmentStartDist < minDistance) {
      minDistance = segmentStartDist;
      nearestPoint = { x: segment.start.x, y: segment.start.y };
    }
    if (segmentEndDist < minDistance) {
      minDistance = segmentEndDist;
      nearestPoint = { x: segment.end.x, y: segment.end.y };
    }
  }

  return nearestPoint;
}

function traceBoundaryPolygon(
  startPoint: Point,
  walls: PlacedWall[]
): Point[] {
  const visited = new Set<string>();
  const boundary: Point[] = [];
  const allSegments: LineSegment[] = [];

  for (const wall of walls) {
    const segments = getWallSegments(wall);
    allSegments.push(...segments);
  }

  if (allSegments.length === 0) {
    return [];
  }

  let currentPoint: Point = startPoint;
  const pointKey = (p: Point) => `${Math.round(p.x / TOLERANCE)},${Math.round(p.y / TOLERANCE)}`;

  const maxIterations = allSegments.length * 3;
  let iterations = 0;
  let previousPoint: Point | null = null;

  while (iterations < maxIterations) {
    iterations++;
    const key = pointKey(currentPoint);

    if (visited.has(key) && boundary.length > 2) {
      break;
    }

    visited.add(key);
    boundary.push({ ...currentPoint });

    let nextPoint: Point | null = null;
    let bestAngle = -Infinity;

    for (const segment of allSegments) {
      let candidatePoint: Point | null = null;
      let directionAngle: number;

      if (arePointsEqual(segment.start, currentPoint)) {
        candidatePoint = segment.end;
        directionAngle = Math.atan2(segment.end.y - currentPoint.y, segment.end.x - currentPoint.x);
      } else if (arePointsEqual(segment.end, currentPoint)) {
        candidatePoint = segment.start;
        directionAngle = Math.atan2(segment.start.y - currentPoint.y, segment.start.x - currentPoint.x);
      } else {
        continue;
      }

      if (previousPoint && arePointsEqual(candidatePoint, previousPoint)) {
        continue;
      }

      if (previousPoint) {
        const previousAngle = Math.atan2(
          currentPoint.y - previousPoint.y,
          currentPoint.x - previousPoint.x
        );
        let relativeAngle = normalizeAngle(directionAngle - previousAngle);

        if (relativeAngle < 0) {
          relativeAngle += 2 * Math.PI;
        }

        if (nextPoint === null || relativeAngle > bestAngle) {
          bestAngle = relativeAngle;
          nextPoint = candidatePoint;
        }
      } else {
        if (nextPoint === null) {
          nextPoint = candidatePoint;
          bestAngle = directionAngle;
        } else {
          if (directionAngle > bestAngle) {
            bestAngle = directionAngle;
            nextPoint = candidatePoint;
          }
        }
      }
    }

    if (!nextPoint) {
      break;
    }

    if (arePointsEqual(nextPoint, startPoint) && boundary.length > 2) {
      break;
    }

    previousPoint = currentPoint;
    currentPoint = nextPoint;
  }

  if (boundary.length < 3) {
    return [];
  }

  const firstPoint = boundary[0];
  const lastPoint = boundary[boundary.length - 1];
  if (firstPoint && lastPoint && arePointsEqual(firstPoint, lastPoint)) {
    return boundary.slice(0, -1);
  }

  return boundary;
}

export function traceBoundary(
  clickPoint: Point,
  walls: PlacedWall[],
  _stageSize: { width: number; height: number }
): BoundaryResult {
  if (walls.length === 0) {
    return {
      vertices: null,
      isFullStage: true,
      boundingWalls: [],
    };
  }

  const enclosed = isPointEnclosed(clickPoint, walls);

  if (!enclosed) {
    return {
      vertices: null,
      isFullStage: true,
      boundingWalls: [],
    };
  }

  const nearestPoint = findBoundaryStartPoint(clickPoint, walls);

  if (!nearestPoint) {
    return {
      vertices: null,
      isFullStage: true,
      boundingWalls: [],
    };
  }

  const boundaryVertices = traceBoundaryPolygon(nearestPoint, walls);

  if (boundaryVertices.length < 3) {
    return {
      vertices: null,
      isFullStage: true,
      boundingWalls: [],
    };
  }

  if (!isPointInPolygon(clickPoint, boundaryVertices)) {
    return {
      vertices: null,
      isFullStage: false,
      boundingWalls: [],
    };
  }

  const poles = walls.flatMap(_wall => getPolesFromWall(_wall));
  const relevantWalls = walls.filter((_wall) =>
    poles.some((pole) =>
      boundaryVertices.some((v) => arePointsEqual({ x: pole.x, y: pole.y }, v))
    )
  );

  return {
    vertices: boundaryVertices,
    isFullStage: false,
    boundingWalls: relevantWalls,
  };
}
