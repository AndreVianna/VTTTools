import type { Point, EncounterWall } from '@/types/domain';
import { calculateDistance, detectPoleOnPoleCollision } from './wallCollisionUtils';
import { GridType, type GridConfig } from '@/utils/gridCalculator';

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
    return poleIndex === 0 || poleIndex === wall.poles.length - 1;
}

export function getOppositeEndpoint(poleIndex: number, wallLength: number): number {
    return poleIndex === 0 ? wallLength - 1 : 0;
}

export function removeDuplicatePoles(poles: Point[], tolerance: number = 5): Point[] {
    const result: Point[] = [];

    for (const pole of poles) {
        const isDuplicate = result.some(existing =>
            calculateDistance(existing, pole) <= tolerance
        );

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
        wallsToDelete: []
    };

    if (newWallPoles.length < 2 || existingWalls.length === 0) {
        return emptyResult;
    }

    const gridConfig: GridConfig = {
        type: GridType.Square,
        cellSize: { width: 50, height: 50 },
        offset: { left: 0, top: 0 },
        snap: false
    };

    const collisionResult = detectPoleOnPoleCollision(
        newWallPoles,
        existingWalls,
        gridConfig,
        tolerance
    );

    if (!collisionResult.hasCollision) {
        return emptyResult;
    }

    const endpointCollisions = collisionResult.collisions.filter(collision => {
        const wall = existingWalls[collision.existingWallIndex];
        return wall && isEndpoint(collision.existingPoleIndex, wall);
    });

    if (endpointCollisions.length === 0) {
        return emptyResult;
    }

    const firstPoleCollisions = endpointCollisions.filter(c => c.newPoleIndex === 0);
    const lastPoleCollisions = endpointCollisions.filter(
        c => c.newPoleIndex === newWallPoles.length - 1
    );

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
            isFirst: true
        });
        involvedWallIndices.add(wall.index);
    }

    for (const collision of lastPoleCollisions) {
        const wall = existingWalls[collision.existingWallIndex];
        if (!wall) continue;

        mergePoints.push({
            wallIndex: wall.index,
            poleIndex: collision.existingPoleIndex,
            isFirst: false
        });
        involvedWallIndices.add(wall.index);
    }

    let isClosed = false;
    if (firstPoleCollisions.length === 1 && lastPoleCollisions.length === 1) {
        const firstWall = existingWalls[firstPoleCollisions[0]!.existingWallIndex];
        const lastWall = existingWalls[lastPoleCollisions[0]!.existingWallIndex];

        if (firstWall && lastWall && firstWall.index === lastWall.index) {
            const firstPoleIndex = firstPoleCollisions[0]!.existingPoleIndex;
            const lastPoleIndex = lastPoleCollisions[0]!.existingPoleIndex;

            if (firstPoleIndex !== lastPoleIndex) {
                isClosed = true;
            }
        }
    }

    const targetWallIndex = Math.min(...Array.from(involvedWallIndices));
    const wallsToDelete = Array.from(involvedWallIndices).filter(idx => idx !== targetWallIndex);

    const mergedPoles = mergeWalls({
        newWallPoles,
        existingWalls,
        mergePoints,
        tolerance
    });

    return {
        canMerge: true,
        targetWallIndex,
        mergePoints,
        mergedPoles,
        isClosed,
        wallsToDelete
    };
}

export function mergeWalls(params: MergeWallsParams): Point[] {
    const { newWallPoles, existingWalls, mergePoints, tolerance = 5 } = params;

    if (mergePoints.length === 0) {
        return newWallPoles;
    }

    const mergePointsByWall = new Map<number, MergePoint[]>();
    for (const point of mergePoints) {
        if (!mergePointsByWall.has(point.wallIndex)) {
            mergePointsByWall.set(point.wallIndex, []);
        }
        mergePointsByWall.get(point.wallIndex)!.push(point);
    }

    const hasFirstMerge = mergePoints.some(p => p.isFirst);
    const hasLastMerge = mergePoints.some(p => !p.isFirst);

    if (mergePoints.length === 2 && hasFirstMerge && hasLastMerge) {
        const firstMerge = mergePoints.find(p => p.isFirst)!;
        const lastMerge = mergePoints.find(p => !p.isFirst)!;

        if (firstMerge.wallIndex === lastMerge.wallIndex) {
            const existingWall = existingWalls[firstMerge.wallIndex];
            if (!existingWall) {
                return newWallPoles;
            }

            const existingPoles = existingWall.poles.map(pole => ({ x: pole.x, y: pole.y }));

            const startIndex = Math.min(firstMerge.poleIndex, lastMerge.poleIndex);
            const endIndex = Math.max(firstMerge.poleIndex, lastMerge.poleIndex);

            const segmentPoles = existingPoles.slice(startIndex, endIndex + 1);

            const newWallMiddle = newWallPoles.slice(1, newWallPoles.length - 1);

            let orderedPoles: Point[];
            if (firstMerge.poleIndex < lastMerge.poleIndex) {
                orderedPoles = [...segmentPoles, ...newWallMiddle];
            } else {
                orderedPoles = [...segmentPoles.reverse(), ...newWallMiddle];
            }

            return removeDuplicatePoles(orderedPoles, tolerance);
        }
    }

    const targetWallIndex = Math.min(...mergePoints.map(p => p.wallIndex));
    const targetWall = existingWalls.find(w => w.index === targetWallIndex);

    if (!targetWall) {
        return newWallPoles;
    }

    const result: Point[] = [];
    const targetWallPoles = targetWall.poles.map(pole => ({ x: pole.x, y: pole.y }));

    const targetMergePoints = mergePoints.filter(p => p.wallIndex === targetWallIndex);

    if (targetMergePoints.length === 0) {
        result.push(...targetWallPoles);
    } else {
        const targetMerge = targetMergePoints[0];

        if (targetMerge!.poleIndex === 0) {
            const newWallReversed = [...newWallPoles].reverse();
            result.push(...newWallReversed.slice(1));
            result.push(...targetWallPoles);
        } else {
            result.push(...targetWallPoles);
            result.push(...newWallPoles.slice(1));
        }
    }

    for (const [wallIndex, points] of mergePointsByWall.entries()) {
        if (wallIndex === targetWallIndex) {
            continue;
        }

        const wall = existingWalls.find(w => w.index === wallIndex);
        if (!wall) {
            continue;
        }

        const wallPoles = wall.poles.map(pole => ({ x: pole.x, y: pole.y }));
        const mergePoint = points[0];

        if (mergePoint!.poleIndex === 0) {
            result.push(...wallPoles.slice(1));
        } else {
            result.push(...wallPoles.slice(0, wallPoles.length - 1).reverse());
        }
    }

    return removeDuplicatePoles(result, tolerance);
}
