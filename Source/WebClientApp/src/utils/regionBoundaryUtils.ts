import type { PlacedOpening, PlacedWall, Point, Pole } from '@/types/domain';
import { OpeningState } from '@/types/domain';

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

function getWallSegments(wall: PlacedWall, openings: PlacedOpening[]): LineSegment[] {
  const segments: LineSegment[] = [];
  const { poles, isClosed } = wall;

  if (!isClosed) {
    return segments;
  }

  const wallOpenings = openings.filter((o) => o.wallIndex === wall.index);

  for (let i = 0; i < poles.length - 1; i++) {
    const start = poles[i];
    const end = poles[i + 1];

    const hasOpenOpening = wallOpenings.some((opening) => {
      const isPassable = opening.state === OpeningState.Open ||
                         opening.state === OpeningState.Destroyed;

      return isPassable && opening.startPoleIndex === i && opening.endPoleIndex === i + 1;
    });

    if (!hasOpenOpening) {
      segments.push({
        start: { x: start.x, y: start.y },
        end: { x: end.x, y: end.y },
      });
    }
  }

  if (isClosed && poles.length > 2) {
    const start = poles[poles.length - 1];
    const end = poles[0];

    const hasOpenOpening = wallOpenings.some((opening) => {
      const isPassable = opening.state === OpeningState.Open ||
                         opening.state === OpeningState.Destroyed;

      return isPassable &&
             ((opening.startPoleIndex === poles.length - 1 && opening.endPoleIndex === 0) ||
              (opening.startPoleIndex === 0 && opening.endPoleIndex === poles.length - 1));
    });

    if (!hasOpenOpening) {
      segments.push({
        start: { x: start.x, y: start.y },
        end: { x: end.x, y: end.y },
      });
    }
  }

  return segments;
}

function isPointEnclosed(point: Point, walls: PlacedWall[], openings: PlacedOpening[]): boolean {
  const rayDirection = { x: 1, y: 0 };
  let intersectionCount = 0;

  for (const wall of walls) {
    const segments = getWallSegments(wall, openings);

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
    const segment: LineSegment = { start, end };

    if (lineSegmentIntersectsRay(segment, point, rayDirection)) {
      intersectionCount++;
    }
  }

  return intersectionCount % 2 === 1;
}

function findBoundaryStartPoint(
  point: Point,
  walls: PlacedWall[],
  openings: PlacedOpening[]
): Point | null {
  const allSegments: LineSegment[] = [];

  for (const wall of walls) {
    const segments = getWallSegments(wall, openings);
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
  walls: PlacedWall[],
  openings: PlacedOpening[]
): Point[] {
  const visited = new Set<string>();
  const boundary: Point[] = [];
  const allSegments: LineSegment[] = [];

  for (const wall of walls) {
    const segments = getWallSegments(wall, openings);
    allSegments.push(...segments);
  }

  if (allSegments.length === 0) {
    return [];
  }

  let currentPoint = startPoint;
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

  if (arePointsEqual(boundary[0], boundary[boundary.length - 1])) {
    return boundary.slice(0, -1);
  }

  return boundary;
}

export function traceBoundary(
  clickPoint: Point,
  walls: PlacedWall[],
  openings: PlacedOpening[],
  stageSize: { width: number; height: number }
): BoundaryResult {
  if (walls.length === 0) {
    return {
      vertices: null,
      isFullStage: true,
      boundingWalls: [],
    };
  }

  const enclosed = isPointEnclosed(clickPoint, walls, openings);

  if (!enclosed) {
    return {
      vertices: null,
      isFullStage: true,
      boundingWalls: [],
    };
  }

  const nearestPoint = findBoundaryStartPoint(clickPoint, walls, openings);

  if (!nearestPoint) {
    return {
      vertices: null,
      isFullStage: true,
      boundingWalls: [],
    };
  }

  const boundaryVertices = traceBoundaryPolygon(nearestPoint, walls, openings);

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

  const relevantWalls = walls.filter((wall) =>
    wall.poles.some((pole) =>
      boundaryVertices.some((v) => arePointsEqual({ x: pole.x, y: pole.y }, v))
    )
  );

  return {
    vertices: boundaryVertices,
    isFullStage: false,
    boundingWalls: relevantWalls,
  };
}
