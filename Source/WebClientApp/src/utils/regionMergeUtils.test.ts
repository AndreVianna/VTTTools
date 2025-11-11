import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    regionsMatch,
    findSharedEdge,
    polygonsOverlap,
    findMergeableRegions,
    mergePolygons,
} from './regionMergeUtils';
import type { Point, EncounterRegion } from '@/types/domain';
import type { GridConfig } from '@/utils/gridCalculator';
import { GridType } from '@/utils/gridCalculator';

vi.mock('polygon-clipping', () => ({
    default: {
        intersection: vi.fn(),
        union: vi.fn(),
    }
}));

vi.mock('@/utils/structureSnapping', () => ({
    snapToNearest: vi.fn((point) => point),
    SnapMode: {
        Free: 0,
        HalfSnap: 1,
        QuarterSnap: 2,
    }
}));

vi.mock('@/utils/lineOfSightCalculation', () => ({
    lineLineIntersection: vi.fn(),
    distanceBetweenPoints: vi.fn((p1: Point, p2: Point) => {
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        return Math.sqrt(dx * dx + dy * dy);
    }),
}));

vi.mock('@/utils/polygonUtils', () => ({
    cleanPolygonVertices: vi.fn((vertices) => vertices),
    pointsEqual: vi.fn((p1: Point, p2: Point, tolerance = 0.001) => {
        return Math.abs(p1.x - p2.x) < tolerance && Math.abs(p1.y - p2.y) < tolerance;
    }),
}));

import polygonClipping from 'polygon-clipping';

describe('regionsMatch', () => {
    const baseRegion: EncounterRegion = {
        encounterId: 'encounter1',
        index: 0,
        name: 'Region 1',
        type: 'difficult-terrain',
        vertices: [],
        value: 2,
        label: 'Test',
        color: '#ff0000',
    };

    it('should return true when all properties match', () => {
        const r1 = baseRegion;
        const r2 = { ...baseRegion };
        expect(regionsMatch(r1, r2)).toBe(true);
    });

    it('should return false when types differ', () => {
        const r1 = baseRegion;
        const r2 = { ...baseRegion, type: 'hazard' };
        expect(regionsMatch(r1, r2)).toBe(false);
    });

    it('should return false when values differ', () => {
        const r1 = baseRegion;
        const r2 = { ...baseRegion, value: 3 };
        expect(regionsMatch(r1, r2)).toBe(false);
    });

    it('should return false when labels differ', () => {
        const r1 = baseRegion;
        const r2 = { ...baseRegion, label: 'Different' };
        expect(regionsMatch(r1, r2)).toBe(false);
    });

    it('should return true when both values are undefined', () => {
        const { value: _, ...regionWithoutValue } = baseRegion;
        const r1 = regionWithoutValue;
        const r2 = regionWithoutValue;
        expect(regionsMatch(r1, r2)).toBe(true);
    });

    it('should return true when both labels are undefined', () => {
        const { label: _, ...regionWithoutLabel } = baseRegion;
        const r1 = regionWithoutLabel;
        const r2 = regionWithoutLabel;
        expect(regionsMatch(r1, r2)).toBe(true);
    });

    it('should return false when one value is undefined and other is not', () => {
        const r1 = { ...baseRegion, value: 2 };
        const { value: _, ...r2 } = baseRegion;
        expect(regionsMatch(r1, r2)).toBe(false);
    });
});

describe('findSharedEdge', () => {
    it('should find exact match edge in same direction', () => {
        const v1: Point[] = [
            { x: 0, y: 0 },
            { x: 10, y: 0 },
            { x: 10, y: 10 },
            { x: 0, y: 10 },
        ];
        const v2: Point[] = [
            { x: 10, y: 0 },
            { x: 20, y: 0 },
            { x: 20, y: 10 },
            { x: 10, y: 10 },
        ];

        const result = findSharedEdge(v1, v2);
        expect(result).not.toBeNull();
        expect(result?.startIdx1).toBe(1);
        expect(result?.endIdx1).toBe(2);
        expect(result?.startIdx2).toBe(0);
        expect(result?.endIdx2).toBe(3);
    });

    it('should find reversed edge match', () => {
        const v1: Point[] = [
            { x: 0, y: 0 },
            { x: 10, y: 0 },
            { x: 10, y: 10 },
        ];
        const v2: Point[] = [
            { x: 10, y: 10 },
            { x: 10, y: 0 },
            { x: 20, y: 0 },
        ];

        const result = findSharedEdge(v1, v2);
        expect(result).not.toBeNull();
        expect(result?.startIdx1).toBe(1);
        expect(result?.endIdx1).toBe(2);
    });

    it('should return null when no shared edge exists', () => {
        const v1: Point[] = [
            { x: 0, y: 0 },
            { x: 10, y: 0 },
            { x: 10, y: 10 },
        ];
        const v2: Point[] = [
            { x: 20, y: 20 },
            { x: 30, y: 20 },
            { x: 30, y: 30 },
        ];

        const result = findSharedEdge(v1, v2);
        expect(result).toBeNull();
    });

    it('should find consecutive shared vertices', () => {
        const v1: Point[] = [
            { x: 0, y: 0 },
            { x: 5, y: 0 },
            { x: 10, y: 0 },
            { x: 10, y: 10 },
        ];
        const v2: Point[] = [
            { x: 10, y: 10 },
            { x: 10, y: 0 },
            { x: 5, y: 0 },
            { x: 0, y: 0 },
        ];

        const result = findSharedEdge(v1, v2);
        expect(result).not.toBeNull();
    });

    it('should handle empty arrays', () => {
        const v1: Point[] = [];
        const v2: Point[] = [{ x: 0, y: 0 }];

        const result = findSharedEdge(v1, v2);
        expect(result).toBeNull();
    });

    it('should handle single vertex polygons', () => {
        const v1: Point[] = [{ x: 0, y: 0 }];
        const v2: Point[] = [{ x: 0, y: 0 }];

        const result = findSharedEdge(v1, v2);
        expect(result).not.toBeNull();
        expect(result?.startIdx1).toBe(0);
        expect(result?.endIdx1).toBe(0);
    });

    it('should find shared edge with wrapping indices', () => {
        const v1: Point[] = [
            { x: 0, y: 0 },
            { x: 10, y: 0 },
            { x: 10, y: 10 },
        ];
        const v2: Point[] = [
            { x: 10, y: 10 },
            { x: 0, y: 0 },
            { x: 0, y: 10 },
        ];

        const result = findSharedEdge(v1, v2);
        expect(result).not.toBeNull();
    });
});

describe('polygonsOverlap', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return true when polygons overlap', () => {
        const v1: Point[] = [
            { x: 0, y: 0 },
            { x: 10, y: 0 },
            { x: 10, y: 10 },
            { x: 0, y: 10 },
        ];
        const v2: Point[] = [
            { x: 5, y: 5 },
            { x: 15, y: 5 },
            { x: 15, y: 15 },
            { x: 5, y: 15 },
        ];

        vi.mocked(polygonClipping.intersection).mockReturnValue([
            [[[6, 6], [10, 6], [10, 10], [6, 10], [6, 6]]]
        ]);

        const result = polygonsOverlap(v1, v2);
        expect(result).toBe(true);
    });

    it('should return false when polygons do not overlap', () => {
        const v1: Point[] = [
            { x: 0, y: 0 },
            { x: 10, y: 0 },
            { x: 10, y: 10 },
            { x: 0, y: 10 },
        ];
        const v2: Point[] = [
            { x: 20, y: 20 },
            { x: 30, y: 20 },
            { x: 30, y: 30 },
            { x: 20, y: 30 },
        ];

        vi.mocked(polygonClipping.intersection).mockReturnValue([]);

        const result = polygonsOverlap(v1, v2);
        expect(result).toBe(false);
    });

    it('should return false when bounds do not overlap', () => {
        const v1: Point[] = [
            { x: 0, y: 0 },
            { x: 10, y: 0 },
            { x: 10, y: 10 },
            { x: 0, y: 10 },
        ];
        const v2: Point[] = [
            { x: 20, y: 20 },
            { x: 30, y: 20 },
            { x: 30, y: 30 },
            { x: 20, y: 30 },
        ];

        const result = polygonsOverlap(v1, v2);
        expect(result).toBe(false);
        expect(polygonClipping.intersection).not.toHaveBeenCalled();
    });

    it('should return false when polygon-clipping throws error', () => {
        const v1: Point[] = [
            { x: 0, y: 0 },
            { x: 10, y: 0 },
            { x: 10, y: 10 },
        ];
        const v2: Point[] = [
            { x: 5, y: 5 },
            { x: 15, y: 5 },
            { x: 15, y: 15 },
        ];

        vi.mocked(polygonClipping.intersection).mockImplementation(() => {
            throw new Error('Invalid polygon');
        });

        const result = polygonsOverlap(v1, v2);
        expect(result).toBe(false);
    });

    it('should return false for empty vertex arrays', () => {
        const result = polygonsOverlap([], []);
        expect(result).toBe(false);
    });

    it('should handle adjacent polygons without overlap', () => {
        const v1: Point[] = [
            { x: 0, y: 0 },
            { x: 10, y: 0 },
            { x: 10, y: 10 },
            { x: 0, y: 10 },
        ];
        const v2: Point[] = [
            { x: 10, y: 0 },
            { x: 20, y: 0 },
            { x: 20, y: 10 },
            { x: 10, y: 10 },
        ];

        vi.mocked(polygonClipping.intersection).mockReturnValue([]);

        const result = polygonsOverlap(v1, v2);
        expect(result).toBe(false);
    });
});

describe('findMergeableRegions', () => {
    const createRegion = (
        type: string,
        vertices: Point[],
        value?: number,
        label?: string
    ): EncounterRegion => ({
        encounterId: 'encounter1',
        index: 0,
        name: 'Region',
        type,
        vertices,
        ...(value !== undefined && { value }),
        ...(label !== undefined && { label }),
    });

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should find regions with matching type and shared edge', () => {
        const newVertices: Point[] = [
            { x: 10, y: 0 },
            { x: 20, y: 0 },
            { x: 20, y: 10 },
            { x: 10, y: 10 },
        ];

        const existingRegions: EncounterRegion[] = [
            createRegion('difficult-terrain', [
                { x: 0, y: 0 },
                { x: 10, y: 0 },
                { x: 10, y: 10 },
                { x: 0, y: 10 },
            ], 2, 'Test'),
        ];

        const result = findMergeableRegions(existingRegions, newVertices, 'difficult-terrain', 2, 'Test');
        expect(result).toHaveLength(1);
        expect(result[0]).toBe(existingRegions[0]);
    });

    it('should find regions with matching type and overlap', () => {
        const newVertices: Point[] = [
            { x: 5, y: 5 },
            { x: 15, y: 5 },
            { x: 15, y: 15 },
            { x: 5, y: 15 },
        ];

        const existingRegions: EncounterRegion[] = [
            createRegion('difficult-terrain', [
                { x: 0, y: 0 },
                { x: 10, y: 0 },
                { x: 10, y: 10 },
                { x: 0, y: 10 },
            ], 2),
        ];

        vi.mocked(polygonClipping.intersection).mockReturnValue([
            [[[6, 6], [10, 6], [10, 10], [6, 10], [6, 6]]]
        ]);

        const result = findMergeableRegions(existingRegions, newVertices, 'difficult-terrain', 2);
        expect(result).toHaveLength(1);
    });

    it('should not include regions with different type', () => {
        const newVertices: Point[] = [
            { x: 10, y: 0 },
            { x: 20, y: 0 },
            { x: 20, y: 10 },
            { x: 10, y: 10 },
        ];

        const existingRegions: EncounterRegion[] = [
            createRegion('hazard', [
                { x: 0, y: 0 },
                { x: 10, y: 0 },
                { x: 10, y: 10 },
                { x: 0, y: 10 },
            ]),
        ];

        const result = findMergeableRegions(existingRegions, newVertices, 'difficult-terrain');
        expect(result).toHaveLength(0);
    });

    it('should not include regions with different value', () => {
        const newVertices: Point[] = [
            { x: 10, y: 0 },
            { x: 20, y: 0 },
            { x: 20, y: 10 },
            { x: 10, y: 10 },
        ];

        const existingRegions: EncounterRegion[] = [
            createRegion('difficult-terrain', [
                { x: 0, y: 0 },
                { x: 10, y: 0 },
                { x: 10, y: 10 },
                { x: 0, y: 10 },
            ], 2),
        ];

        const result = findMergeableRegions(existingRegions, newVertices, 'difficult-terrain', 3);
        expect(result).toHaveLength(0);
    });

    it('should not include regions with different label', () => {
        const newVertices: Point[] = [
            { x: 10, y: 0 },
            { x: 20, y: 0 },
            { x: 20, y: 10 },
            { x: 10, y: 10 },
        ];

        const existingRegions: EncounterRegion[] = [
            createRegion('difficult-terrain', [
                { x: 0, y: 0 },
                { x: 10, y: 0 },
                { x: 10, y: 10 },
                { x: 0, y: 10 },
            ], undefined, 'Label1'),
        ];

        const result = findMergeableRegions(existingRegions, newVertices, 'difficult-terrain', undefined, 'Label2');
        expect(result).toHaveLength(0);
    });

    it('should handle undefined values as matching', () => {
        const newVertices: Point[] = [
            { x: 10, y: 0 },
            { x: 20, y: 0 },
            { x: 20, y: 10 },
            { x: 10, y: 10 },
        ];

        const existingRegions: EncounterRegion[] = [
            createRegion('difficult-terrain', [
                { x: 0, y: 0 },
                { x: 10, y: 0 },
                { x: 10, y: 10 },
                { x: 0, y: 10 },
            ]),
        ];

        const result = findMergeableRegions(existingRegions, newVertices, 'difficult-terrain');
        expect(result).toHaveLength(1);
    });

    it('should return empty array when no regions match', () => {
        const newVertices: Point[] = [
            { x: 20, y: 20 },
            { x: 30, y: 20 },
            { x: 30, y: 30 },
            { x: 20, y: 30 },
        ];

        const existingRegions: EncounterRegion[] = [
            createRegion('difficult-terrain', [
                { x: 0, y: 0 },
                { x: 10, y: 0 },
                { x: 10, y: 10 },
                { x: 0, y: 10 },
            ]),
        ];

        const result = findMergeableRegions(existingRegions, newVertices, 'difficult-terrain');
        expect(result).toHaveLength(0);
    });

    it('should find multiple mergeable regions', () => {
        const newVertices: Point[] = [
            { x: 10, y: 0 },
            { x: 20, y: 0 },
            { x: 20, y: 10 },
            { x: 10, y: 10 },
        ];

        const existingRegions: EncounterRegion[] = [
            createRegion('difficult-terrain', [
                { x: 0, y: 0 },
                { x: 10, y: 0 },
                { x: 10, y: 10 },
                { x: 0, y: 10 },
            ]),
            createRegion('difficult-terrain', [
                { x: 20, y: 0 },
                { x: 30, y: 0 },
                { x: 30, y: 10 },
                { x: 20, y: 10 },
            ]),
        ];

        const result = findMergeableRegions(existingRegions, newVertices, 'difficult-terrain');
        expect(result).toHaveLength(2);
    });
});

describe('mergePolygons', () => {
    const gridConfig: GridConfig = {
        type: GridType.Square,
        cellSize: { width: 50, height: 50 },
        offset: { left: 0, top: 0 },
        snap: true,
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return empty array for empty input', () => {
        const result = mergePolygons([]);
        expect(result).toEqual([]);
    });

    it('should return same vertices for single polygon', () => {
        const vertices: Point[] = [
            { x: 0, y: 0 },
            { x: 10, y: 0 },
            { x: 10, y: 10 },
            { x: 0, y: 10 },
        ];

        const result = mergePolygons([vertices]);
        expect(result).toEqual(vertices);
    });

    it('should merge two adjacent rectangles', () => {
        const v1: Point[] = [
            { x: 0, y: 0 },
            { x: 10, y: 0 },
            { x: 10, y: 10 },
            { x: 0, y: 10 },
        ];
        const v2: Point[] = [
            { x: 10, y: 0 },
            { x: 20, y: 0 },
            { x: 20, y: 10 },
            { x: 10, y: 10 },
        ];

        vi.mocked(polygonClipping.union).mockReturnValue([
            [[[0, 0], [20, 0], [20, 10], [0, 10]]]
        ]);

        const result = mergePolygons([v1, v2]);
        expect(result).toHaveLength(4);
        expect(result[0]).toEqual({ x: 0, y: 0 });
        expect(result[1]).toEqual({ x: 20, y: 0 });
    });

    it('should handle polygon-clipping error gracefully', () => {
        const v1: Point[] = [
            { x: 0, y: 0 },
            { x: 10, y: 0 },
            { x: 10, y: 10 },
        ];
        const v2: Point[] = [
            { x: 10, y: 0 },
            { x: 20, y: 0 },
            { x: 20, y: 10 },
        ];

        vi.mocked(polygonClipping.union).mockImplementation(() => {
            throw new Error('Invalid polygon');
        });

        const result = mergePolygons([v1, v2]);
        expect(result).toEqual(v1);
    });

    it('should handle empty union result', () => {
        const v1: Point[] = [
            { x: 0, y: 0 },
            { x: 10, y: 0 },
            { x: 10, y: 10 },
        ];

        vi.mocked(polygonClipping.union).mockReturnValue([]);

        const result = mergePolygons([v1, v1]);
        expect(result).toEqual(v1);
    });

    it('should merge multiple polygons', () => {
        const v1: Point[] = [
            { x: 0, y: 0 },
            { x: 10, y: 0 },
            { x: 10, y: 10 },
            { x: 0, y: 10 },
        ];
        const v2: Point[] = [
            { x: 10, y: 0 },
            { x: 20, y: 0 },
            { x: 20, y: 10 },
            { x: 10, y: 10 },
        ];
        const v3: Point[] = [
            { x: 20, y: 0 },
            { x: 30, y: 0 },
            { x: 30, y: 10 },
            { x: 20, y: 10 },
        ];

        vi.mocked(polygonClipping.union).mockReturnValue([
            [[[0, 0], [30, 0], [30, 10], [0, 10]]]
        ]);

        const result = mergePolygons([v1, v2, v3]);
        expect(result).toHaveLength(4);
    });

    it('should apply grid snapping when gridConfig provided with intersections', async () => {
        const v1: Point[] = [
            { x: 0, y: 0 },
            { x: 10, y: 0 },
            { x: 10, y: 10 },
            { x: 0, y: 10 },
        ];
        const v2: Point[] = [
            { x: 5, y: 5 },
            { x: 15, y: 5 },
            { x: 15, y: 15 },
            { x: 5, y: 15 },
        ];

        vi.mocked(polygonClipping.union).mockReturnValue([
            [[[0, 0], [10, 0], [15, 5], [15, 15], [5, 15], [0, 10], [0, 0]]]
        ]);

        const lineLineIntersection = await import('@/utils/lineOfSightCalculation');
        vi.mocked(lineLineIntersection.lineLineIntersection).mockReturnValue({ x: 10, y: 5 });

        const result = mergePolygons([v1, v2], gridConfig);
        expect(result).toBeDefined();
    });

    it('should handle self-intersecting polygons', () => {
        const vertices: Point[] = [
            { x: 0, y: 0 },
            { x: 10, y: 10 },
            { x: 10, y: 0 },
            { x: 0, y: 10 },
        ];

        vi.mocked(polygonClipping.union).mockReturnValue([
            [[[0, 0], [10, 10], [10, 0], [0, 10], [0, 0]]]
        ]);

        const result = mergePolygons([vertices]);
        expect(result).toBeDefined();
    });

    it('should not apply grid snapping when no gridConfig provided', () => {
        const v1: Point[] = [
            { x: 0, y: 0 },
            { x: 10, y: 0 },
            { x: 10, y: 10 },
        ];

        vi.mocked(polygonClipping.union).mockReturnValue([
            [[[0, 0], [10, 0], [10, 10]]]
        ]);

        const result = mergePolygons([v1]);
        expect(result).toHaveLength(3);
    });

    it('should handle malformed union result with missing outer ring', () => {
        const v1: Point[] = [
            { x: 0, y: 0 },
            { x: 10, y: 0 },
            { x: 10, y: 10 },
        ];

        vi.mocked(polygonClipping.union).mockReturnValue([[]]);

        const result = mergePolygons([v1, v1]);
        expect(result).toEqual(v1);
    });

    it('should handle union result with null outer ring', () => {
        const v1: Point[] = [
            { x: 0, y: 0 },
            { x: 10, y: 0 },
            { x: 10, y: 10 },
        ];

        vi.mocked(polygonClipping.union).mockReturnValue([[null as any]]);

        const result = mergePolygons([v1, v1]);
        expect(result).toEqual(v1);
    });
});
