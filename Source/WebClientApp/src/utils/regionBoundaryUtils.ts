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

function arePointsEqual(p1: Point, p2: Point, tolerance = EPSILON): boolean {
  return Math.abs(p1.x - p2.x) < tolerance && Math.abs(p1.y - p2.y) < tolerance;
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

  return t >= 0 && t <= 1 && u > EPSILON;
}

function getWallSegments(wall: PlacedWall, openings: PlacedOpening[]): LineSegment[] {
  const segments: LineSegment[] = [];
  const { poles } = wall;

  if (poles.length < 2) {
    return segments;
  }

  const wallOpenings = openings.filter((o) => o.wallIndex === wall.index);

  for (let i = 0; i < poles.length - 1; i++) {
    const start = poles[i];
    const end = poles[i + 1];

    const hasBlockingOpening = wallOpenings.some((opening) => {
      const isBlocking = opening.state === OpeningState.Closed ||
                         opening.state === OpeningState.Locked ||
                         opening.state === OpeningState.Barred;

      return !isBlocking && opening.startPoleIndex <= i && opening.endPoleIndex >= i + 1;
    });

    if (!hasBlockingOpening) {
      segments.push({
        start: { x: start.x, y: start.y },
        end: { x: end.x, y: end.y },
      });
    }
  }

  if (wall.isClosed && poles.length > 2) {
    const start = poles[poles.length - 1];
    const end = poles[0];

    const hasBlockingOpening = wallOpenings.some((opening) => {
      const isBlocking = opening.state === OpeningState.Closed ||
                         opening.state === OpeningState.Locked ||
                         opening.state === OpeningState.Barred;

      return !isBlocking &&
             ((opening.startPoleIndex === poles.length - 1 && opening.endPoleIndex === 0) ||
              (opening.startPoleIndex === 0 && opening.endPoleIndex === poles.length - 1));
    });

    if (!hasBlockingOpening) {
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

function findNearestWallPoint(point: Point, walls: PlacedWall[]): Point | null {
  let nearestPoint: Point | null = null;
  let minDistance = Infinity;

  for (const wall of walls) {
    for (const pole of wall.poles) {
      const distance = Math.sqrt((pole.x - point.x) ** 2 + (pole.y - point.y) ** 2);
      if (distance < minDistance) {
        minDistance = distance;
        nearestPoint = { x: pole.x, y: pole.y };
      }
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
  const allSegments: Array<{ wall: PlacedWall; segment: LineSegment; poleIndex: number }> = [];

  for (const wall of walls) {
    const segments = getWallSegments(wall, openings);
    segments.forEach((segment, idx) => {
      allSegments.push({ wall, segment, poleIndex: idx });
    });
  }

  let currentPoint = startPoint;
  const pointKey = (p: Point) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`;

  const maxIterations = allSegments.length * 2;
  let iterations = 0;

  while (iterations < maxIterations) {
    iterations++;
    const key = pointKey(currentPoint);

    if (visited.has(key) && boundary.length > 2) {
      break;
    }

    visited.add(key);
    boundary.push({ ...currentPoint });

    let nextPoint: Point | null = null;
    let minAngle = Infinity;
    const currentIndex = boundary.length - 2;
    const previousPoint = currentIndex >= 0 ? boundary[currentIndex] : null;

    for (const { segment } of allSegments) {
      if (arePointsEqual(segment.start, currentPoint, 0.1)) {
        const angle = previousPoint
          ? Math.atan2(segment.end.y - currentPoint.y, segment.end.x - currentPoint.x) -
            Math.atan2(currentPoint.y - previousPoint.y, currentPoint.x - previousPoint.x)
          : 0;

        if (nextPoint === null || angle < minAngle) {
          minAngle = angle;
          nextPoint = segment.end;
        }
      } else if (arePointsEqual(segment.end, currentPoint, 0.1)) {
        const angle = previousPoint
          ? Math.atan2(segment.start.y - currentPoint.y, segment.start.x - currentPoint.x) -
            Math.atan2(currentPoint.y - previousPoint.y, currentPoint.x - previousPoint.x)
          : 0;

        if (nextPoint === null || angle < minAngle) {
          minAngle = angle;
          nextPoint = segment.start;
        }
      }
    }

    if (!nextPoint || arePointsEqual(nextPoint, startPoint, 0.1)) {
      break;
    }

    currentPoint = nextPoint;
  }

  if (boundary.length >= 3) {
    return boundary;
  }

  return [];
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

  const nearestPoint = findNearestWallPoint(clickPoint, walls);

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

  const relevantWalls = walls.filter((wall) =>
    wall.poles.some((pole) =>
      boundaryVertices.some((v) => arePointsEqual({ x: pole.x, y: pole.y }, v, 0.1))
    )
  );

  return {
    vertices: boundaryVertices,
    isFullStage: false,
    boundingWalls: relevantWalls,
  };
}
