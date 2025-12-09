import type { EncounterWallSegment, PlacedWall, Point } from '@/types/domain';
import { SegmentType } from '@/types/domain';

interface LineSegment {
  start: Point;
  end: Point;
}

export interface BoundaryResult {
  vertices: Point[] | null;
  holes: Point[][];
  isFullStage: boolean;
  boundingWalls: PlacedWall[];
}

interface GridCell {
  x: number;
  y: number;
}

interface FloodFillResult {
  filled: Set<string>;
  reachedBounds: boolean;
}

// Grid cell size in pixels for flood fill discretization.
// Smaller values = more accurate boundaries but slower performance.
// 5px provides good balance for typical wall thicknesses (2-4px).
const CELL_SIZE = 5;

// Tolerance for point comparison and polygon simplification (in pixels)
const TOLERANCE = 0.5;

function isSegmentPassable(segment: EncounterWallSegment): boolean {
  const isPassagePreset = segment.type === SegmentType.Door && !segment.isOpaque;
  const isOpeningPreset = segment.type === SegmentType.Window && !segment.isOpaque;
  return isPassagePreset || isOpeningPreset;
}

function getAllBarrierSegments(walls: PlacedWall[]): LineSegment[] {
  const segments: LineSegment[] = [];

  for (const wall of walls) {
    for (const wallSegment of wall.segments) {
      if (!isSegmentPassable(wallSegment)) {
        segments.push({
          start: { x: wallSegment.startPole.x, y: wallSegment.startPole.y },
          end: { x: wallSegment.endPole.x, y: wallSegment.endPole.y },
        });
      }
    }
  }

  return segments;
}

function lineIntersectsSegment(
  p1: Point,
  p2: Point,
  seg: LineSegment
): boolean {
  const d1x = p2.x - p1.x;
  const d1y = p2.y - p1.y;
  const d2x = seg.end.x - seg.start.x;
  const d2y = seg.end.y - seg.start.y;

  const cross = d1x * d2y - d1y * d2x;

  if (Math.abs(cross) < 1e-10) {
    return false;
  }

  const dx = seg.start.x - p1.x;
  const dy = seg.start.y - p1.y;

  const t = (dx * d2y - dy * d2x) / cross;
  const u = (dx * d1y - dy * d1x) / cross;

  return t > 0.001 && t < 0.999 && u > 0.001 && u < 0.999;
}

function canMoveBetweenCells(
  from: Point,
  to: Point,
  segments: LineSegment[]
): boolean {
  for (const segment of segments) {
    if (lineIntersectsSegment(from, to, segment)) {
      return false;
    }
  }
  return true;
}

function worldToGrid(point: Point, cellSize: number): GridCell {
  return {
    x: Math.floor(point.x / cellSize),
    y: Math.floor(point.y / cellSize),
  };
}

function gridToWorld(cell: GridCell, cellSize: number): Point {
  return {
    x: cell.x * cellSize + cellSize / 2,
    y: cell.y * cellSize + cellSize / 2,
  };
}

function cellKey(cell: GridCell): string {
  return `${cell.x},${cell.y}`;
}

function parseCell(key: string): GridCell {
  const [x, y] = key.split(',').map(Number);
  return { x: x!, y: y! };
}

function floodFill(
  startPoint: Point,
  segments: LineSegment[],
  bounds: { minX: number; minY: number; maxX: number; maxY: number },
  cellSize: number
): FloodFillResult {
  const filled = new Set<string>();
  const startCell = worldToGrid(startPoint, cellSize);
  const queue: GridCell[] = [startCell];

  const minCellX = Math.floor(bounds.minX / cellSize);
  const maxCellX = Math.ceil(bounds.maxX / cellSize);
  const minCellY = Math.floor(bounds.minY / cellSize);
  const maxCellY = Math.ceil(bounds.maxY / cellSize);

  let reachedBounds = false;

  const maxCells = (maxCellX - minCellX + 1) * (maxCellY - minCellY + 1);
  let iterations = 0;

  while (queue.length > 0 && iterations < maxCells) {
    iterations++;
    const current = queue.shift()!;
    const key = cellKey(current);

    if (filled.has(key)) continue;

    if (current.x <= minCellX || current.x >= maxCellX ||
        current.y <= minCellY || current.y >= maxCellY) {
      reachedBounds = true;
      continue;
    }

    filled.add(key);

    const currentCenter = gridToWorld(current, cellSize);

    const neighbors: GridCell[] = [
      { x: current.x + 1, y: current.y },
      { x: current.x - 1, y: current.y },
      { x: current.x, y: current.y + 1 },
      { x: current.x, y: current.y - 1 },
    ];

    for (const neighbor of neighbors) {
      const neighborKey = cellKey(neighbor);
      if (filled.has(neighborKey)) continue;

      const neighborCenter = gridToWorld(neighbor, cellSize);

      if (canMoveBetweenCells(currentCenter, neighborCenter, segments)) {
        queue.push(neighbor);
      }
    }
  }

  return { filled, reachedBounds };
}

function findUnfilledRegions(
  filled: Set<string>,
  bounds: { minX: number; minY: number; maxX: number; maxY: number },
  segments: LineSegment[],
  cellSize: number
): Set<string>[] {
  const minCellX = Math.floor(bounds.minX / cellSize);
  const maxCellX = Math.ceil(bounds.maxX / cellSize);
  const minCellY = Math.floor(bounds.minY / cellSize);
  const maxCellY = Math.ceil(bounds.maxY / cellSize);

  const visited = new Set<string>();
  const regions: Set<string>[] = [];

  for (let x = minCellX + 1; x < maxCellX; x++) {
    for (let y = minCellY + 1; y < maxCellY; y++) {
      const key = cellKey({ x, y });

      if (filled.has(key) || visited.has(key)) continue;

      const region = new Set<string>();
      const queue: GridCell[] = [{ x, y }];
      let touchesBounds = false;

      while (queue.length > 0) {
        const current = queue.shift()!;
        const currentKey = cellKey(current);

        if (visited.has(currentKey) || filled.has(currentKey)) continue;

        if (current.x <= minCellX || current.x >= maxCellX ||
            current.y <= minCellY || current.y >= maxCellY) {
          touchesBounds = true;
          continue;
        }

        visited.add(currentKey);
        region.add(currentKey);

        const currentCenter = gridToWorld(current, cellSize);

        const neighbors: GridCell[] = [
          { x: current.x + 1, y: current.y },
          { x: current.x - 1, y: current.y },
          { x: current.x, y: current.y + 1 },
          { x: current.x, y: current.y - 1 },
        ];

        for (const neighbor of neighbors) {
          const neighborKey = cellKey(neighbor);
          if (visited.has(neighborKey) || filled.has(neighborKey)) continue;

          const neighborCenter = gridToWorld(neighbor, cellSize);

          if (canMoveBetweenCells(currentCenter, neighborCenter, segments)) {
            queue.push(neighbor);
          }
        }
      }

      if (region.size > 0 && !touchesBounds) {
        regions.push(region);
      }
    }
  }

  return regions;
}

function extractBoundaryFromCells(
  cells: Set<string>,
  cellSize: number,
  clockwise: boolean = true
): Point[] {
  if (cells.size === 0) return [];

  const cellSet = cells;
  const edgeCells: GridCell[] = [];

  for (const key of cells) {
    const cell = parseCell(key);
    const neighbors = [
      cellKey({ x: cell.x + 1, y: cell.y }),
      cellKey({ x: cell.x - 1, y: cell.y }),
      cellKey({ x: cell.x, y: cell.y + 1 }),
      cellKey({ x: cell.x, y: cell.y - 1 }),
    ];
    if (neighbors.some(n => !cellSet.has(n))) {
      edgeCells.push(cell);
    }
  }

  if (edgeCells.length === 0) return [];

  const boundaryEdges: Array<{ start: Point; end: Point }> = [];

  for (const cell of edgeCells) {
    const left = cell.x * cellSize;
    const right = (cell.x + 1) * cellSize;
    const top = cell.y * cellSize;
    const bottom = (cell.y + 1) * cellSize;

    if (!cellSet.has(cellKey({ x: cell.x - 1, y: cell.y }))) {
      if (clockwise) {
        boundaryEdges.push({ start: { x: left, y: bottom }, end: { x: left, y: top } });
      } else {
        boundaryEdges.push({ start: { x: left, y: top }, end: { x: left, y: bottom } });
      }
    }
    if (!cellSet.has(cellKey({ x: cell.x + 1, y: cell.y }))) {
      if (clockwise) {
        boundaryEdges.push({ start: { x: right, y: top }, end: { x: right, y: bottom } });
      } else {
        boundaryEdges.push({ start: { x: right, y: bottom }, end: { x: right, y: top } });
      }
    }
    if (!cellSet.has(cellKey({ x: cell.x, y: cell.y - 1 }))) {
      if (clockwise) {
        boundaryEdges.push({ start: { x: left, y: top }, end: { x: right, y: top } });
      } else {
        boundaryEdges.push({ start: { x: right, y: top }, end: { x: left, y: top } });
      }
    }
    if (!cellSet.has(cellKey({ x: cell.x, y: cell.y + 1 }))) {
      if (clockwise) {
        boundaryEdges.push({ start: { x: right, y: bottom }, end: { x: left, y: bottom } });
      } else {
        boundaryEdges.push({ start: { x: left, y: bottom }, end: { x: right, y: bottom } });
      }
    }
  }

  if (boundaryEdges.length === 0) return [];

  const polygon = buildPolygonFromEdges(boundaryEdges);
  return simplifyPolygon(polygon, TOLERANCE);
}

function buildPolygonFromEdges(edges: Array<{ start: Point; end: Point }>): Point[] {
  if (edges.length === 0) return [];

  const polygon: Point[] = [];
  const usedEdges = new Set<number>();
  let currentEdge = edges[0]!;
  usedEdges.add(0);
  polygon.push(currentEdge.start);

  const maxIterations = edges.length * 2;
  let iterations = 0;

  while (iterations < maxIterations) {
    iterations++;
    polygon.push(currentEdge.end);

    let foundNext = false;
    for (let i = 0; i < edges.length; i++) {
      if (usedEdges.has(i)) continue;

      const edge = edges[i]!;
      if (pointsClose(edge.start, currentEdge.end)) {
        currentEdge = edge;
        usedEdges.add(i);
        foundNext = true;
        break;
      }
    }

    if (!foundNext) break;

    if (pointsClose(currentEdge.end, polygon[0]!)) {
      break;
    }
  }

  return polygon;
}

function pointsClose(p1: Point, p2: Point): boolean {
  return Math.abs(p1.x - p2.x) < TOLERANCE && Math.abs(p1.y - p2.y) < TOLERANCE;
}

function simplifyPolygon(polygon: Point[], tolerance: number): Point[] {
  if (polygon.length < 3) return polygon;

  const simplified: Point[] = [];

  for (let i = 0; i < polygon.length; i++) {
    const prev = polygon[(i - 1 + polygon.length) % polygon.length]!;
    const curr = polygon[i]!;
    const next = polygon[(i + 1) % polygon.length]!;

    const dx1 = curr.x - prev.x;
    const dy1 = curr.y - prev.y;
    const dx2 = next.x - curr.x;
    const dy2 = next.y - curr.y;

    const cross = Math.abs(dx1 * dy2 - dy1 * dx2);

    if (cross > tolerance) {
      simplified.push(curr);
    }
  }

  return simplified.length >= 3 ? simplified : polygon;
}

function computeBounds(
  walls: PlacedWall[],
  stageSize: { width: number; height: number }
): { minX: number; minY: number; maxX: number; maxY: number } {
  let minX = 0;
  let minY = 0;
  let maxX = stageSize.width;
  let maxY = stageSize.height;

  for (const wall of walls) {
    for (const segment of wall.segments) {
      minX = Math.min(minX, segment.startPole.x, segment.endPole.x);
      minY = Math.min(minY, segment.startPole.y, segment.endPole.y);
      maxX = Math.max(maxX, segment.startPole.x, segment.endPole.x);
      maxY = Math.max(maxY, segment.startPole.y, segment.endPole.y);
    }
  }

  const padding = CELL_SIZE * 5;
  return {
    minX: minX - padding,
    minY: minY - padding,
    maxX: maxX + padding,
    maxY: maxY + padding,
  };
}

function findRelevantWalls(
  filledCells: Set<string>,
  walls: PlacedWall[],
  cellSize: number
): PlacedWall[] {
  const relevantWalls: PlacedWall[] = [];

  for (const wall of walls) {
    let isRelevant = false;

    for (const segment of wall.segments) {
      if (isSegmentPassable(segment)) continue;

      const start = segment.startPole;
      const end = segment.endPole;

      const steps = Math.ceil(
        Math.sqrt((end.x - start.x) ** 2 + (end.y - start.y) ** 2) / (cellSize / 2)
      );

      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const point = {
          x: start.x + (end.x - start.x) * t,
          y: start.y + (end.y - start.y) * t,
        };

        const cell = worldToGrid(point, cellSize);
        const neighbors = [
          cellKey(cell),
          cellKey({ x: cell.x + 1, y: cell.y }),
          cellKey({ x: cell.x - 1, y: cell.y }),
          cellKey({ x: cell.x, y: cell.y + 1 }),
          cellKey({ x: cell.x, y: cell.y - 1 }),
        ];

        const hasFilledNeighbor = neighbors.some(n => filledCells.has(n));
        const hasUnfilledNeighbor = neighbors.some(n => !filledCells.has(n));

        if (hasFilledNeighbor && hasUnfilledNeighbor) {
          isRelevant = true;
          break;
        }
      }

      if (isRelevant) break;
    }

    if (isRelevant) {
      relevantWalls.push(wall);
    }
  }

  return relevantWalls;
}

export function traceBoundary(
  clickPoint: Point,
  walls: PlacedWall[],
  stageSize: { width: number; height: number }
): BoundaryResult {
  if (walls.length === 0) {
    return {
      vertices: null,
      holes: [],
      isFullStage: true,
      boundingWalls: [],
    };
  }

  const segments = getAllBarrierSegments(walls);

  if (segments.length === 0) {
    return {
      vertices: null,
      holes: [],
      isFullStage: true,
      boundingWalls: [],
    };
  }

  const bounds = computeBounds(walls, stageSize);
  const { filled, reachedBounds } = floodFill(clickPoint, segments, bounds, CELL_SIZE);

  if (filled.size === 0) {
    return {
      vertices: null,
      holes: [],
      isFullStage: false,
      boundingWalls: [],
    };
  }

  const holeRegions = findUnfilledRegions(filled, bounds, segments, CELL_SIZE);
  const holes: Point[][] = [];
  for (const holeRegion of holeRegions) {
    const holeBoundary = extractBoundaryFromCells(holeRegion, CELL_SIZE, false);
    if (holeBoundary.length >= 3) {
      holes.push(holeBoundary);
    }
  }

  if (reachedBounds) {
    const stageBoundary: Point[] = [
      { x: 0, y: 0 },
      { x: stageSize.width, y: 0 },
      { x: stageSize.width, y: stageSize.height },
      { x: 0, y: stageSize.height },
    ];

    const relevantWalls = findRelevantWalls(filled, walls, CELL_SIZE);

    return {
      vertices: stageBoundary,
      holes,
      isFullStage: false,
      boundingWalls: relevantWalls,
    };
  }

  const boundaryVertices = extractBoundaryFromCells(filled, CELL_SIZE, true);

  if (boundaryVertices.length < 3) {
    return {
      vertices: null,
      holes: [],
      isFullStage: true,
      boundingWalls: [],
    };
  }

  const relevantWalls = findRelevantWalls(filled, walls, CELL_SIZE);

  return {
    vertices: boundaryVertices,
    holes,
    isFullStage: false,
    boundingWalls: relevantWalls,
  };
}
