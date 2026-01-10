import type { EncounterWall, Point } from '@/types/domain';
import { type GridConfig, GridType } from '@/utils/gridCalculator';
import { calculateDistance, detectPoleOnPoleCollision } from './wallCollisionUtils';
import { getPolesFromWall } from './wallUtils';

export interface MergePoint {
  wallIndex: number;
  poleIndex: number;
  isFirst: boolean;
}

export interface MergeResult {
  canMerge: boolean;
  targetWallIndex?: number;
  mergePoints: MergePoint[];
  mergedPoles: Point[];
  isClosed: boolean;
  wallsToDelete: number[];
}

export interface CanMergeWallsParams {
  newWallPoles: Point[];
  existingWalls: EncounterWall[];
  tolerance?: number;
}

export interface MergeWallsParams {
  newWallPoles: Point[];
  existingWalls: EncounterWall[];
  mergePoints: MergePoint[];
  tolerance?: number;
}

export function isEndpoint(poleIndex: number, wall: EncounterWall): boolean {
  const poles = getPolesFromWall(wall);
  return poleIndex === 0 || poleIndex === poles.length - 1;
}

export function getOppositeEndpoint(poleIndex: number, wallLength: number): number {
  return poleIndex === 0 ? wallLength - 1 : 0;
}

export function removeDuplicatePoles(poles: Point[], tolerance: number = 5): Point[] {
  const result: Point[] = [];

  for (const pole of poles) {
    const isDuplicate = result.some((existing) => calculateDistance(existing, pole) <= tolerance);

    if (!isDuplicate) {
      result.push(pole);
    }
  }

  return result;
}

export function canMergeWalls(params: CanMergeWallsParams): MergeResult {
  const { newWallPoles, existingWalls, tolerance = 5 } = params;

  const emptyResult: MergeResult = {
    canMerge: false,
    mergePoints: [],
    mergedPoles: [],
    isClosed: false,
    wallsToDelete: [],
  };

  if (newWallPoles.length < 2 || existingWalls.length === 0) {
    return emptyResult;
  }

  const gridConfig: GridConfig = {
    type: GridType.Square,
    cellSize: { width: 50, height: 50 },
    offset: { left: 0, top: 0 },
    snap: false,
  scale: 1,
  };

  const collisionResult = detectPoleOnPoleCollision(newWallPoles, existingWalls, gridConfig, tolerance);

  if (!collisionResult.hasCollision) {
    return emptyResult;
  }

  const endpointCollisions = collisionResult.collisions.filter((collision) => {
    const wall = existingWalls[collision.existingWallIndex];
    return !!wall && isEndpoint(collision.existingPoleIndex, wall);
  });

  if (endpointCollisions.length === 0) {
    return emptyResult;
  }

  const firstPoleCollisions = endpointCollisions.filter((c) => c.newPoleIndex === 0);
  const lastPoleCollisions = endpointCollisions.filter((c) => c.newPoleIndex === newWallPoles.length - 1);

  if (firstPoleCollisions.length === 0 && lastPoleCollisions.length === 0) {
    return emptyResult;
  }

  const mergePoints: MergePoint[] = [];
  const involvedWallIndices = new Set<number>();

  for (const collision of firstPoleCollisions) {
    const wall = existingWalls[collision.existingWallIndex];
    if (!wall) continue;

    mergePoints.push({
      wallIndex: wall.index,
      poleIndex: collision.existingPoleIndex,
      isFirst: true,
    });
    involvedWallIndices.add(wall.index);
  }

  for (const collision of lastPoleCollisions) {
    const wall = existingWalls[collision.existingWallIndex];
    if (!wall) continue;

    mergePoints.push({
      wallIndex: wall.index,
      poleIndex: collision.existingPoleIndex,
      isFirst: false,
    });
    involvedWallIndices.add(wall.index);
  }

  let isClosed = false;
  if (firstPoleCollisions.length === 1 && lastPoleCollisions.length === 1) {
    const firstWallIndex = firstPoleCollisions[0]?.existingWallIndex ?? -1;
    const lastWallIndex = lastPoleCollisions[0]?.existingWallIndex ?? -1;
    const firstWall = firstWallIndex >= 0 ? existingWalls[firstWallIndex] : undefined;
    const lastWall = lastWallIndex >= 0 ? existingWalls[lastWallIndex] : undefined;

    if (firstWall && lastWall && firstWall.index === lastWall.index) {
      const firstPoleIndex = firstPoleCollisions[0]?.existingPoleIndex;
      const lastPoleIndex = lastPoleCollisions[0]?.existingPoleIndex;

      if (firstPoleIndex !== lastPoleIndex) {
        isClosed = true;
      }
    }
  }

  const targetWallIndex = Math.min(...Array.from(involvedWallIndices));
  const wallsToDelete = Array.from(involvedWallIndices).filter((idx) => idx !== targetWallIndex);

  const mergedPoles = mergeWalls({
    newWallPoles,
    existingWalls,
    mergePoints,
    tolerance,
  });

  return {
    canMerge: true,
    targetWallIndex,
    mergePoints,
    mergedPoles,
    isClosed,
    wallsToDelete,
  };
}

interface GraphNode {
  id: string;
  wallIndex: number;
  isStart: boolean;
  point: Point;
  edges: Map<string, Point[]>;
}

export function mergeWalls(params: MergeWallsParams): Point[] {
  const { newWallPoles, existingWalls, mergePoints, tolerance = 5 } = params;

  if (mergePoints.length === 0) {
    return newWallPoles;
  }

  const nodes = new Map<string, GraphNode>();

  const getNode = (wallIndex: number, isStart: boolean, point: Point): GraphNode => {
    const id = `W${wallIndex}_${isStart ? 'START' : 'END'}`;
    if (!nodes.has(id)) {
      nodes.set(id, {
        id,
        wallIndex,
        isStart,
        point,
        edges: new Map(),
      });
    }
    const node = nodes.get(id);
    if (!node) {
      throw new Error(`Node ${id} should exist after setting`);
    }
    return node;
  };

  const involvedWallIndices = new Set(mergePoints.map((mp) => mp.wallIndex));
  const involvedWalls = existingWalls.filter((w) => involvedWallIndices.has(w.index));

  const firstPole = newWallPoles[0];
  const lastPole = newWallPoles[newWallPoles.length - 1];
  if (!firstPole || !lastPole) {
    return newWallPoles;
  }

  const newWallStart = getNode(-1, true, firstPole);
  const newWallEnd = getNode(-1, false, lastPole);
  newWallStart.edges.set(newWallEnd.id, newWallPoles);
  newWallEnd.edges.set(newWallStart.id, [...newWallPoles].reverse());

  for (const wall of involvedWalls) {
    const wallPoles = getPolesFromWall(wall).map((p) => ({ x: p.x, y: p.y }));
    const firstWallPole = wallPoles[0];
    const lastWallPole = wallPoles[wallPoles.length - 1];
    if (!firstWallPole || !lastWallPole) continue;

    const startNode = getNode(wall.index, true, firstWallPole);
    const endNode = getNode(wall.index, false, lastWallPole);

    startNode.edges.set(endNode.id, wallPoles);
    endNode.edges.set(startNode.id, [...wallPoles].reverse());
  }

  for (const mp of mergePoints) {
    const wall = existingWalls.find((w) => w.index === mp.wallIndex);
    if (!wall) continue;

    const wallPoles = getPolesFromWall(wall).map((p) => ({ x: p.x, y: p.y }));
    const targetPole = mp.poleIndex === 0 ? wallPoles[0] : wallPoles[wallPoles.length - 1];
    if (!targetPole) continue;

    const existingNode = getNode(mp.wallIndex, mp.poleIndex === 0, targetPole);
    const newNode = mp.isFirst ? newWallStart : newWallEnd;

    existingNode.edges.set(newNode.id, []);
    newNode.edges.set(existingNode.id, []);
  }

  const leafNodes = Array.from(nodes.values()).filter((n) => n.edges.size === 1);

  if (leafNodes.length === 0) {
    return traversePath(nodes, newWallStart.id, new Set(), tolerance);
  } else if (leafNodes.length >= 2) {
    const startNodeId = leafNodes[0]?.id ?? newWallStart.id;
    return traversePath(nodes, startNodeId, new Set(), tolerance);
  } else {
    return newWallPoles;
  }
}

function traversePath(
  nodes: Map<string, GraphNode>,
  currentId: string,
  visited: Set<string>,
  tolerance: number,
): Point[] {
  const current = nodes.get(currentId);
  if (!current) return [];

  visited.add(currentId);
  const result: Point[] = [];

  for (const [neighborId, poles] of current.edges) {
    if (visited.has(neighborId)) continue;

    result.push(...poles);

    const remaining = traversePath(nodes, neighborId, visited, tolerance);
    result.push(...remaining);

    return removeDuplicatePoles(result, tolerance);
  }

  return result;
}
