import type { Point, SceneRegion } from '@/types/domain';
import type { GridConfig } from '@/utils/gridCalculator';
import polygonClipping from 'polygon-clipping';
import { snapToNearest, SnapMode } from '@/utils/structureSnapping';
import { lineLineIntersection, distanceBetweenPoints } from '@/utils/lineOfSightCalculation';
import { cleanPolygonVertices, pointsEqual } from '@/utils/polygonUtils';

interface Bounds {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
}

interface Edge {
    p1: Point;
    p2: Point;
}

interface SharedEdge {
    startIdx1: number;
    endIdx1: number;
    startIdx2: number;
    endIdx2: number;
}

export function regionsMatch(r1: SceneRegion, r2: SceneRegion): boolean {
    if (r1.type !== r2.type) return false;
    if (r1.value !== r2.value) return false;
    if (r1.label !== r2.label) return false;
    return true;
}

export function findSharedEdge(v1: Point[], v2: Point[]): SharedEdge | null {
    for (let i = 0; i < v1.length; i++) {
        const p1Start = v1[i];
        const p1End = v1[(i + 1) % v1.length];
        if (!p1Start || !p1End) continue;

        for (let j = 0; j < v2.length; j++) {
            const p2Start = v2[j];
            const p2End = v2[(j + 1) % v2.length];
            if (!p2Start || !p2End) continue;

            if (pointsEqual(p1Start, p2Start) && pointsEqual(p1End, p2End)) {
                return { startIdx1: i, endIdx1: (i + 1) % v1.length, startIdx2: j, endIdx2: (j + 1) % v2.length };
            }

            if (pointsEqual(p1Start, p2End) && pointsEqual(p1End, p2Start)) {
                return { startIdx1: i, endIdx1: (i + 1) % v1.length, startIdx2: (j + 1) % v2.length, endIdx2: j };
            }
        }
    }

    for (let i = 0; i < v1.length; i++) {
        const current = v1[i];
        const next = v1[(i + 1) % v1.length];
        if (!current || !next) continue;

        let consecutiveCount = 0;
        let firstMatchIdx = -1;

        for (let k = 0; k < v2.length; k++) {
            const testPoint = v2[k];
            if (!testPoint) continue;

            if (pointsEqual(current, testPoint)) {
                firstMatchIdx = k;
                consecutiveCount = 1;

                for (let offset = 1; offset < v1.length && consecutiveCount < v1.length; offset++) {
                    const nextV1 = v1[(i + offset) % v1.length];
                    const nextV2 = v2[(k + offset) % v2.length];
                    if (!nextV1 || !nextV2) break;

                    if (pointsEqual(nextV1, nextV2)) {
                        consecutiveCount++;
                    } else {
                        break;
                    }
                }

                if (consecutiveCount >= 2) {
                    return {
                        startIdx1: i,
                        endIdx1: (i + consecutiveCount - 1) % v1.length,
                        startIdx2: firstMatchIdx,
                        endIdx2: (firstMatchIdx + consecutiveCount - 1) % v2.length
                    };
                }
            }
        }
    }

    return null;
}

export function polygonsOverlap(v1: Point[], v2: Point[]): boolean {
    const b1 = calculatePolygonBounds(v1);
    const b2 = calculatePolygonBounds(v2);

    if (!boundsOverlap(b1, b2)) {
        return false;
    }

    try {
        const ring1 = v1.map(p => [p.x, p.y] as [number, number]);
        const ring2 = v2.map(p => [p.x, p.y] as [number, number]);
        const poly1 = [ring1];
        const poly2 = [ring2];
        const intersection = polygonClipping.intersection(poly1, poly2);
        return intersection.length > 0;
    } catch {
        return false;
    }
}

export function findMergeableRegions(
    existingRegions: SceneRegion[],
    newVertices: Point[],
    type: string,
    value?: number,
    label?: string
): SceneRegion[] {
    console.log('[DEBUG findMergeableRegions] Called with:', {
        existingCount: existingRegions.length,
        newVerticesCount: newVertices.length,
        type,
        value,
        label,
        existingRegions: existingRegions.map(r => ({ index: r.index, type: r.type, value: r.value, label: r.label }))
    });

    const mergeable: SceneRegion[] = [];

    for (const region of existingRegions) {
        const normalizedRegionValue = region.value ?? undefined;
        const normalizedValue = value ?? undefined;
        const normalizedRegionLabel = region.label ?? undefined;
        const normalizedLabel = label ?? undefined;

        const typeMatch = region.type === type;
        const valueMatch = normalizedRegionValue === normalizedValue;
        const labelMatch = normalizedRegionLabel === normalizedLabel;

        console.log('[DEBUG findMergeableRegions] Checking region:', {
            index: region.index,
            type: region.type,
            value: region.value,
            label: region.label,
            typeMatch,
            valueMatch,
            labelMatch,
            normalizedRegionValue,
            normalizedValue,
            normalizedRegionLabel,
            normalizedLabel
        });

        if (!typeMatch) continue;
        if (!valueMatch) continue;
        if (!labelMatch) continue;

        const hasSharedEdge = findSharedEdge(region.vertices, newVertices) !== null;
        const overlaps = polygonsOverlap(region.vertices, newVertices);

        console.log('[DEBUG findMergeableRegions] Overlap check:', {
            regionIndex: region.index,
            hasSharedEdge,
            overlaps
        });

        if (hasSharedEdge || overlaps) {
            mergeable.push(region);
        }
    }

    console.log('[DEBUG findMergeableRegions] Found mergeable regions:', mergeable.length);
    return mergeable;
}

export function mergePolygons(verticesList: Point[][], gridConfig?: GridConfig): Point[] {
    if (verticesList.length === 0) return [];
    if (verticesList.length === 1) return verticesList[0] || [];

    try {
        const polygons = verticesList.map(vertices =>
            [vertices.map(p => [p.x, p.y] as [number, number])]
        );
        const unioned = polygonClipping.union(polygons[0]!, ...polygons.slice(1));

        if (unioned.length === 0 || !unioned[0] || !unioned[0][0]) {
            return verticesList[0] || [];
        }

        const outerRing = unioned[0][0];
        let mergedVertices: Point[] = outerRing.map(([x, y]) => ({ x: x as number, y: y as number }));

        const allEdges: Edge[] = [];
        for (const vertices of verticesList) {
            allEdges.push(...verticesToEdges(vertices));
        }

        const intersections: Point[] = [];
        for (let i = 0; i < allEdges.length; i++) {
            for (let j = i + 1; j < allEdges.length; j++) {
                const e1 = allEdges[i];
                const e2 = allEdges[j];
                if (!e1 || !e2) continue;

                const intersection = lineLineIntersection(e1.p1, e1.p2, e2.p1, e2.p2);
                if (intersection) {
                    const isVertex = verticesList.some(vertices =>
                        vertices.some(v => pointsEqual(v, intersection))
                    );
                    if (!isVertex) {
                        intersections.push(intersection);
                    }
                }
            }
        }

        if (intersections.length > 0) {
            mergedVertices = insertIntersectionVertices(mergedVertices, intersections);
        }

        const selfIntersections = findSelfIntersections(mergedVertices);
        if (selfIntersections.length > 0) {
            mergedVertices = insertIntersectionVertices(mergedVertices, selfIntersections);
        }

        if (gridConfig && intersections.length > 0) {
            const intersectionSet = new Set(intersections);
            mergedVertices = snapIntersectionPoints(mergedVertices, intersectionSet, gridConfig);
        }

        mergedVertices = deduplicateVertices(mergedVertices);

        return cleanPolygonVertices(mergedVertices, true);
    } catch (error) {
        console.error('Polygon merge failed:', error);
        return verticesList[0] || [];
    }
}

function findSelfIntersections(vertices: Point[]): Point[] {
    const edges = verticesToEdges(vertices);
    const intersections: Point[] = [];

    for (let i = 0; i < edges.length; i++) {
        for (let j = i + 2; j < edges.length; j++) {
            if (i === 0 && j === edges.length - 1) continue;

            const e1 = edges[i];
            const e2 = edges[j];
            if (!e1 || !e2) continue;

            const intersection = lineLineIntersection(e1.p1, e1.p2, e2.p1, e2.p2);
            if (intersection) {
                const isExistingVertex = vertices.some(v => pointsEqual(v, intersection));
                if (!isExistingVertex) {
                    intersections.push(intersection);
                }
            }
        }
    }

    return intersections;
}

function insertIntersectionVertices(vertices: Point[], intersections: Point[]): Point[] {
    if (intersections.length === 0) return vertices;

    const result: Point[] = [];

    for (let i = 0; i < vertices.length; i++) {
        const current = vertices[i];
        const next = vertices[(i + 1) % vertices.length];
        if (!current || !next) continue;

        result.push(current);

        const edgeIntersections: Array<{ point: Point; distance: number }> = [];
        for (const intersection of intersections) {
            if (isPointOnSegment(intersection, current, next)) {
                const distance = distanceBetweenPoints(current, intersection);
                edgeIntersections.push({ point: intersection, distance });
            }
        }

        edgeIntersections.sort((a, b) => a.distance - b.distance);
        for (const { point } of edgeIntersections) {
            result.push(point);
        }
    }

    return result;
}

function deduplicateVertices(vertices: Point[], tolerance = 0.001): Point[] {
    if (vertices.length === 0) return [];

    const result: Point[] = [vertices[0]!];

    for (let i = 1; i < vertices.length; i++) {
        const current = vertices[i];
        if (!current) continue;

        const isDuplicate = result.some(existing => pointsEqual(existing, current, tolerance));
        if (!isDuplicate) {
            result.push(current);
        }
    }

    if (result.length >= 2) {
        const first = result[0];
        const last = result[result.length - 1];
        if (first && last && pointsEqual(first, last, tolerance)) {
            result.pop();
        }
    }

    return result;
}

function snapIntersectionPoints(vertices: Point[], intersectionSet: Set<Point>, gridConfig: GridConfig): Point[] {
    return vertices.map(vertex => {
        const isIntersection = Array.from(intersectionSet).some(p => pointsEqual(p, vertex));
        if (isIntersection) {
            return snapToNearest(vertex, gridConfig, SnapMode.HalfSnap, 10);
        }
        return vertex;
    });
}

function calculatePolygonBounds(vertices: Point[]): Bounds {
    if (vertices.length === 0) {
        return { minX: 0, maxX: 0, minY: 0, maxY: 0 };
    }

    const first = vertices[0]!;
    let minX = first.x;
    let maxX = first.x;
    let minY = first.y;
    let maxY = first.y;

    for (const vertex of vertices) {
        if (vertex.x < minX) minX = vertex.x;
        if (vertex.x > maxX) maxX = vertex.x;
        if (vertex.y < minY) minY = vertex.y;
        if (vertex.y > maxY) maxY = vertex.y;
    }

    return { minX, maxX, minY, maxY };
}

function boundsOverlap(b1: Bounds, b2: Bounds): boolean {
    return !(b1.maxX < b2.minX || b2.maxX < b1.minX || b1.maxY < b2.minY || b2.maxY < b1.minY);
}

function verticesToEdges(vertices: Point[]): Edge[] {
    const edges: Edge[] = [];
    for (let i = 0; i < vertices.length; i++) {
        const p1 = vertices[i];
        const p2 = vertices[(i + 1) % vertices.length];
        if (!p1 || !p2) continue;
        edges.push({ p1, p2 });
    }
    return edges;
}

function isPointOnSegment(p: Point, a: Point, b: Point): boolean {
    const crossProduct = Math.abs((p.y - a.y) * (b.x - a.x) - (p.x - a.x) * (b.y - a.y));
    if (crossProduct > 0.001) return false;

    const dotProduct = (p.x - a.x) * (b.x - a.x) + (p.y - a.y) * (b.y - a.y);
    const squaredLength = (b.x - a.x) * (b.x - a.x) + (b.y - a.y) * (b.y - a.y);

    if (dotProduct < -0.001 || dotProduct > squaredLength + 0.001) return false;

    return true;
}
