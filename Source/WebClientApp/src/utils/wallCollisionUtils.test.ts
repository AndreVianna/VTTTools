import { describe, it, expect } from 'vitest';
import {
    calculateDistance,
    calculatePerpendicularDistance,
    findLineIntersection,
    boundingBoxesOverlap,
    createBoundingBox,
    detectPoleOnPoleCollision,
    detectEdgeOnEdgeIntersection,
    detectPoleOnEdgeCollision,
    type BoundingBox,
} from './wallCollisionUtils';
import type { Point, EncounterWall, Pole } from '@/types/domain';
import { GridType, type GridConfig } from '@/utils/gridCalculator';
import { WallVisibility } from '@/types/domain';

const createDefaultGridConfig = (): GridConfig => ({
    type: GridType.Square,
    cellSize: { width: 50, height: 50 },
    offset: { left: 0, top: 0 },
    snap: true,
});

const createWall = (poles: Pole[], index: number = 0, isClosed: boolean = false): EncounterWall => ({
    encounterId: 'encounter1',
    index,
    name: `Wall ${index}`,
    poles,
    visibility: WallVisibility.Normal,
    isClosed,
});

const createPole = (x: number, y: number, h: number = 10): Pole => ({ x, y, h });
const createPoint = (x: number, y: number): Point => ({ x, y });

describe('calculateDistance', () => {
    it('should calculate distance between two points', () => {
        const p1 = createPoint(0, 0);
        const p2 = createPoint(3, 4);
        expect(calculateDistance(p1, p2)).toBe(5);
    });

    it('should return 0 for same point', () => {
        const p = createPoint(5, 5);
        expect(calculateDistance(p, p)).toBe(0);
    });

    it('should calculate horizontal distance', () => {
        const p1 = createPoint(0, 5);
        const p2 = createPoint(10, 5);
        expect(calculateDistance(p1, p2)).toBe(10);
    });

    it('should calculate vertical distance', () => {
        const p1 = createPoint(5, 0);
        const p2 = createPoint(5, 10);
        expect(calculateDistance(p1, p2)).toBe(10);
    });

    it('should handle negative coordinates', () => {
        const p1 = createPoint(-3, -4);
        const p2 = createPoint(0, 0);
        expect(calculateDistance(p1, p2)).toBe(5);
    });
});

describe('calculatePerpendicularDistance', () => {
    it('should calculate perpendicular distance to line segment', () => {
        const point = createPoint(5, 5);
        const lineStart = createPoint(0, 0);
        const lineEnd = createPoint(10, 0);
        expect(calculatePerpendicularDistance(point, lineStart, lineEnd)).toBe(5);
    });

    it('should return distance to nearest endpoint when projection is outside segment', () => {
        const point = createPoint(15, 5);
        const lineStart = createPoint(0, 0);
        const lineEnd = createPoint(10, 0);
        const distance = calculatePerpendicularDistance(point, lineStart, lineEnd);
        expect(distance).toBeCloseTo(Math.sqrt(25 + 25), 5);
    });

    it('should handle point on line segment', () => {
        const point = createPoint(5, 0);
        const lineStart = createPoint(0, 0);
        const lineEnd = createPoint(10, 0);
        expect(calculatePerpendicularDistance(point, lineStart, lineEnd)).toBe(0);
    });

    it('should handle zero-length line segment', () => {
        const point = createPoint(5, 5);
        const lineStart = createPoint(0, 0);
        const lineEnd = createPoint(0, 0);
        expect(calculatePerpendicularDistance(point, lineStart, lineEnd)).toBeCloseTo(
            Math.sqrt(50),
            5
        );
    });

    it('should handle vertical line segment', () => {
        const point = createPoint(5, 5);
        const lineStart = createPoint(0, 0);
        const lineEnd = createPoint(0, 10);
        expect(calculatePerpendicularDistance(point, lineStart, lineEnd)).toBe(5);
    });
});

describe('findLineIntersection', () => {
    it('should find intersection of crossing lines', () => {
        const a1 = createPoint(0, 0);
        const a2 = createPoint(10, 10);
        const b1 = createPoint(0, 10);
        const b2 = createPoint(10, 0);
        const intersection = findLineIntersection(a1, a2, b1, b2);
        expect(intersection).not.toBeNull();
        expect(intersection?.x).toBeCloseTo(5, 5);
        expect(intersection?.y).toBeCloseTo(5, 5);
    });

    it('should return null for parallel lines', () => {
        const a1 = createPoint(0, 0);
        const a2 = createPoint(10, 0);
        const b1 = createPoint(0, 5);
        const b2 = createPoint(10, 5);
        expect(findLineIntersection(a1, a2, b1, b2)).toBeNull();
    });

    it('should return null for non-intersecting segments', () => {
        const a1 = createPoint(0, 0);
        const a2 = createPoint(5, 0);
        const b1 = createPoint(10, 0);
        const b2 = createPoint(15, 0);
        expect(findLineIntersection(a1, a2, b1, b2)).toBeNull();
    });

    it('should find intersection at segment endpoints', () => {
        const a1 = createPoint(0, 0);
        const a2 = createPoint(10, 0);
        const b1 = createPoint(10, 0);
        const b2 = createPoint(10, 10);
        const intersection = findLineIntersection(a1, a2, b1, b2);
        expect(intersection).not.toBeNull();
        expect(intersection?.x).toBeCloseTo(10, 5);
        expect(intersection?.y).toBeCloseTo(0, 5);
    });

    it('should return null for collinear non-overlapping segments', () => {
        const a1 = createPoint(0, 0);
        const a2 = createPoint(5, 0);
        const b1 = createPoint(6, 0);
        const b2 = createPoint(10, 0);
        expect(findLineIntersection(a1, a2, b1, b2)).toBeNull();
    });

    it('should handle vertical segments', () => {
        const a1 = createPoint(5, 0);
        const a2 = createPoint(5, 10);
        const b1 = createPoint(0, 5);
        const b2 = createPoint(10, 5);
        const intersection = findLineIntersection(a1, a2, b1, b2);
        expect(intersection).not.toBeNull();
        expect(intersection?.x).toBeCloseTo(5, 5);
        expect(intersection?.y).toBeCloseTo(5, 5);
    });
});

describe('boundingBoxesOverlap', () => {
    it('should detect overlapping boxes', () => {
        const box1: BoundingBox = { minX: 0, minY: 0, maxX: 10, maxY: 10 };
        const box2: BoundingBox = { minX: 5, minY: 5, maxX: 15, maxY: 15 };
        expect(boundingBoxesOverlap(box1, box2)).toBe(true);
    });

    it('should detect non-overlapping boxes', () => {
        const box1: BoundingBox = { minX: 0, minY: 0, maxX: 10, maxY: 10 };
        const box2: BoundingBox = { minX: 20, minY: 20, maxX: 30, maxY: 30 };
        expect(boundingBoxesOverlap(box1, box2)).toBe(false);
    });

    it('should detect touching boxes as overlapping', () => {
        const box1: BoundingBox = { minX: 0, minY: 0, maxX: 10, maxY: 10 };
        const box2: BoundingBox = { minX: 10, minY: 0, maxX: 20, maxY: 10 };
        expect(boundingBoxesOverlap(box1, box2)).toBe(true);
    });

    it('should detect contained boxes', () => {
        const box1: BoundingBox = { minX: 0, minY: 0, maxX: 20, maxY: 20 };
        const box2: BoundingBox = { minX: 5, minY: 5, maxX: 15, maxY: 15 };
        expect(boundingBoxesOverlap(box1, box2)).toBe(true);
    });

    it('should handle boxes separated horizontally', () => {
        const box1: BoundingBox = { minX: 0, minY: 0, maxX: 10, maxY: 10 };
        const box2: BoundingBox = { minX: 11, minY: 0, maxX: 20, maxY: 10 };
        expect(boundingBoxesOverlap(box1, box2)).toBe(false);
    });

    it('should handle boxes separated vertically', () => {
        const box1: BoundingBox = { minX: 0, minY: 0, maxX: 10, maxY: 10 };
        const box2: BoundingBox = { minX: 0, minY: 11, maxX: 10, maxY: 20 };
        expect(boundingBoxesOverlap(box1, box2)).toBe(false);
    });
});

describe('createBoundingBox', () => {
    it('should create bounding box from two points', () => {
        const p1 = createPoint(0, 0);
        const p2 = createPoint(10, 10);
        const box = createBoundingBox(p1, p2);
        expect(box).toEqual({ minX: 0, minY: 0, maxX: 10, maxY: 10 });
    });

    it('should handle reversed points', () => {
        const p1 = createPoint(10, 10);
        const p2 = createPoint(0, 0);
        const box = createBoundingBox(p1, p2);
        expect(box).toEqual({ minX: 0, minY: 0, maxX: 10, maxY: 10 });
    });

    it('should handle same point', () => {
        const p = createPoint(5, 5);
        const box = createBoundingBox(p, p);
        expect(box).toEqual({ minX: 5, minY: 5, maxX: 5, maxY: 5 });
    });

    it('should handle negative coordinates', () => {
        const p1 = createPoint(-10, -10);
        const p2 = createPoint(10, 10);
        const box = createBoundingBox(p1, p2);
        expect(box).toEqual({ minX: -10, minY: -10, maxX: 10, maxY: 10 });
    });
});

describe('detectPoleOnPoleCollision', () => {
    const gridConfig = createDefaultGridConfig();

    it('should detect no collision when poles are far apart', () => {
        const newPoles = [createPoint(0, 0), createPoint(10, 0)];
        const existingWalls = [
            createWall([createPole(100, 100), createPole(110, 100)], 0),
        ];

        const result = detectPoleOnPoleCollision(newPoles, existingWalls, gridConfig);
        expect(result.hasCollision).toBe(false);
        expect(result.collisions).toHaveLength(0);
    });

    it('should detect single pole collision within tolerance', () => {
        const newPoles = [createPoint(0, 0), createPoint(10, 0)];
        const existingWalls = [createWall([createPole(2, 2), createPole(20, 0)], 0)];

        const result = detectPoleOnPoleCollision(newPoles, existingWalls, gridConfig);
        expect(result.hasCollision).toBe(true);
        expect(result.collisions).toHaveLength(1);
        expect(result.collisions[0].newPoleIndex).toBe(0);
        expect(result.collisions[0].existingWallIndex).toBe(0);
        expect(result.collisions[0].existingPoleIndex).toBe(0);
        expect(result.collisions[0].distance).toBeCloseTo(Math.sqrt(8), 5);
    });

    it('should detect multiple pole collisions', () => {
        const newPoles = [createPoint(0, 0), createPoint(10, 0), createPoint(20, 0)];
        const existingWalls = [
            createWall([createPole(1, 1), createPole(11, 1), createPole(100, 100)], 0),
        ];

        const result = detectPoleOnPoleCollision(newPoles, existingWalls, gridConfig);
        expect(result.hasCollision).toBe(true);
        expect(result.collisions.length).toBeGreaterThanOrEqual(2);
    });

    it('should detect collision at exact tolerance distance', () => {
        const tolerance = 5;
        const newPoles = [createPoint(0, 0)];
        const existingWalls = [createWall([createPole(3, 4)], 0)];

        const result = detectPoleOnPoleCollision(newPoles, existingWalls, gridConfig, tolerance);
        expect(result.hasCollision).toBe(true);
        expect(result.collisions).toHaveLength(1);
        expect(result.collisions[0].distance).toBe(5);
    });

    it('should not detect collision beyond tolerance distance', () => {
        const tolerance = 5;
        const newPoles = [createPoint(0, 0)];
        const existingWalls = [createWall([createPole(4, 4)], 0)];

        const result = detectPoleOnPoleCollision(newPoles, existingWalls, gridConfig, tolerance);
        expect(result.hasCollision).toBe(false);
    });

    it('should handle empty new poles array', () => {
        const existingWalls = [createWall([createPole(0, 0)], 0)];
        const result = detectPoleOnPoleCollision([], existingWalls, gridConfig);
        expect(result.hasCollision).toBe(false);
    });

    it('should handle empty existing walls array', () => {
        const newPoles = [createPoint(0, 0)];
        const result = detectPoleOnPoleCollision(newPoles, [], gridConfig);
        expect(result.hasCollision).toBe(false);
    });

    it('should use spatial hash for large datasets', () => {
        const newPoles = [createPoint(50, 50)];
        const existingWalls: EncounterWall[] = [];

        for (let i = 0; i < 100; i++) {
            existingWalls.push(createWall([createPole(i * 20, i * 20)], i));
        }

        existingWalls.push(createWall([createPole(52, 52)], 100));

        const result = detectPoleOnPoleCollision(newPoles, existingWalls, gridConfig);
        expect(result.hasCollision).toBe(true);
        expect(result.collisions.length).toBeGreaterThanOrEqual(1);
        expect(result.collisions.some((c) => c.existingWallIndex === 100)).toBe(true);
    });

    it('should detect collisions with multiple walls', () => {
        const newPoles = [createPoint(0, 0)];
        const existingWalls = [
            createWall([createPole(2, 2)], 0),
            createWall([createPole(100, 100)], 1),
            createWall([createPole(-2, -2)], 2),
        ];

        const result = detectPoleOnPoleCollision(newPoles, existingWalls, gridConfig);
        expect(result.hasCollision).toBe(true);
        expect(result.collisions).toHaveLength(2);
    });

    it('should use custom tolerance when provided', () => {
        const tolerance = 10;
        const newPoles = [createPoint(0, 0)];
        const existingWalls = [createWall([createPole(8, 6)], 0)];

        const result = detectPoleOnPoleCollision(newPoles, existingWalls, gridConfig, tolerance);
        expect(result.hasCollision).toBe(true);
        expect(result.collisions[0].distance).toBe(10);
    });
});

describe('detectEdgeOnEdgeIntersection', () => {
    const gridConfig = createDefaultGridConfig();

    it('should detect no intersection when edges do not cross', () => {
        const newPoles = [createPoint(0, 0), createPoint(10, 0)];
        const existingWalls = [createWall([createPole(0, 10), createPole(10, 10)], 0)];

        const result = detectEdgeOnEdgeIntersection(newPoles, existingWalls, gridConfig);
        expect(result.hasCollision).toBe(false);
    });

    it('should detect single intersection (X-shaped cross)', () => {
        const newPoles = [createPoint(0, 5), createPoint(10, 5)];
        const existingWalls = [createWall([createPole(5, 0), createPole(5, 10)], 0)];

        const result = detectEdgeOnEdgeIntersection(newPoles, existingWalls, gridConfig);
        expect(result.hasCollision).toBe(true);
        expect(result.intersections).toHaveLength(1);
        expect(result.intersections[0].newEdgeIndex).toBe(0);
        expect(result.intersections[0].existingWallIndex).toBe(0);
        expect(result.intersections[0].existingEdgeIndex).toBe(0);
        expect(result.intersections[0].intersectionPoint.x).toBeCloseTo(5, 5);
        expect(result.intersections[0].intersectionPoint.y).toBeCloseTo(5, 5);
    });

    it('should detect multiple intersections', () => {
        const newPoles = [createPoint(0, 0), createPoint(10, 10), createPoint(20, 10)];
        const existingWalls = [
            createWall([createPole(0, 10), createPole(10, 0), createPole(20, 0)], 0),
        ];

        const result = detectEdgeOnEdgeIntersection(newPoles, existingWalls, gridConfig);
        expect(result.hasCollision).toBe(true);
        expect(result.intersections.length).toBeGreaterThan(0);
    });

    it('should not detect parallel edges as intersecting', () => {
        const newPoles = [createPoint(0, 0), createPoint(10, 0)];
        const existingWalls = [createWall([createPole(0, 5), createPole(10, 5)], 0)];

        const result = detectEdgeOnEdgeIntersection(newPoles, existingWalls, gridConfig);
        expect(result.hasCollision).toBe(false);
    });

    it('should not detect collinear edges as intersecting', () => {
        const newPoles = [createPoint(0, 0), createPoint(10, 0)];
        const existingWalls = [createWall([createPole(15, 0), createPole(25, 0)], 0)];

        const result = detectEdgeOnEdgeIntersection(newPoles, existingWalls, gridConfig);
        expect(result.hasCollision).toBe(false);
    });

    it('should use bounding box optimization', () => {
        const newPoles = [createPoint(0, 0), createPoint(10, 0)];
        const existingWalls = [createWall([createPole(100, 100), createPole(110, 110)], 0)];

        const result = detectEdgeOnEdgeIntersection(newPoles, existingWalls, gridConfig);
        expect(result.hasCollision).toBe(false);
    });

    it('should handle closed walls', () => {
        const newPoles = [createPoint(5, -5), createPoint(5, 15)];
        const existingWalls = [
            createWall(
                [createPole(0, 0), createPole(10, 0), createPole(10, 10), createPole(0, 10)],
                0,
                true
            ),
        ];

        const result = detectEdgeOnEdgeIntersection(newPoles, existingWalls, gridConfig);
        expect(result.hasCollision).toBe(true);
        expect(result.intersections.length).toBeGreaterThanOrEqual(2);
    });

    it('should not check last edge of open walls', () => {
        const newPoles = [createPoint(5, 5), createPoint(15, 5)];
        const existingWalls = [
            createWall([createPole(10, 0), createPole(10, 10), createPole(0, 10)], 0, false),
        ];

        const result = detectEdgeOnEdgeIntersection(newPoles, existingWalls, gridConfig);
        expect(result.hasCollision).toBe(true);
        expect(result.intersections.every((i) => i.existingEdgeIndex < 2)).toBe(true);
    });

    it('should handle walls with insufficient poles', () => {
        const newPoles = [createPoint(0, 0), createPoint(10, 0)];
        const existingWalls = [createWall([createPole(5, 5)], 0)];

        const result = detectEdgeOnEdgeIntersection(newPoles, existingWalls, gridConfig);
        expect(result.hasCollision).toBe(false);
    });

    it('should handle new wall with insufficient poles', () => {
        const newPoles = [createPoint(0, 0)];
        const existingWalls = [createWall([createPole(0, 0), createPole(10, 0)], 0)];

        const result = detectEdgeOnEdgeIntersection(newPoles, existingWalls, gridConfig);
        expect(result.hasCollision).toBe(false);
    });

    it('should handle empty existing walls', () => {
        const newPoles = [createPoint(0, 0), createPoint(10, 0)];
        const result = detectEdgeOnEdgeIntersection(newPoles, [], gridConfig);
        expect(result.hasCollision).toBe(false);
    });

    it('should detect intersection at grid pattern', () => {
        const newPoles = [createPoint(0, 5), createPoint(20, 5)];
        const existingWalls = [
            createWall([createPole(5, 0), createPole(5, 10)], 0),
            createWall([createPole(15, 0), createPole(15, 10)], 1),
        ];

        const result = detectEdgeOnEdgeIntersection(newPoles, existingWalls, gridConfig);
        expect(result.hasCollision).toBe(true);
        expect(result.intersections).toHaveLength(2);
    });
});

describe('detectPoleOnEdgeCollision', () => {
    const gridConfig = createDefaultGridConfig();

    it('should detect pole near edge middle', () => {
        const poles = [createPoint(5, 3)];
        const existingWalls = [createWall([createPole(0, 0), createPole(10, 0)], 0)];

        const result = detectPoleOnEdgeCollision(poles, existingWalls, gridConfig);
        expect(result.hasCollision).toBe(true);
        expect(result.collisions).toHaveLength(1);
        expect(result.collisions[0].poleIndex).toBe(0);
        expect(result.collisions[0].existingWallIndex).toBe(0);
        expect(result.collisions[0].existingEdgeIndex).toBe(0);
        expect(result.collisions[0].distance).toBe(3);
        expect(result.collisions[0].projectionPoint.x).toBeCloseTo(5, 5);
        expect(result.collisions[0].projectionPoint.y).toBeCloseTo(0, 5);
    });

    it('should not detect pole at edge endpoint (should use pole-on-pole)', () => {
        const poles = [createPoint(0.1, 0.1)];
        const existingWalls = [createWall([createPole(0, 0), createPole(10, 0)], 0)];

        const result = detectPoleOnEdgeCollision(poles, existingWalls, gridConfig);
        expect(result.hasCollision).toBe(false);
    });

    it('should not detect pole outside segment bounds', () => {
        const poles = [createPoint(15, 3)];
        const existingWalls = [createWall([createPole(0, 0), createPole(10, 0)], 0)];

        const result = detectPoleOnEdgeCollision(poles, existingWalls, gridConfig);
        expect(result.hasCollision).toBe(false);
    });

    it('should detect multiple poles on same edge', () => {
        const poles = [createPoint(3, 3), createPoint(7, 3)];
        const existingWalls = [createWall([createPole(0, 0), createPole(10, 0)], 0)];

        const result = detectPoleOnEdgeCollision(poles, existingWalls, gridConfig);
        expect(result.hasCollision).toBe(true);
        expect(result.collisions).toHaveLength(2);
    });

    it('should use custom tolerance', () => {
        const tolerance = 10;
        const poles = [createPoint(5, 8)];
        const existingWalls = [createWall([createPole(0, 0), createPole(10, 0)], 0)];

        const result = detectPoleOnEdgeCollision(poles, existingWalls, gridConfig, tolerance);
        expect(result.hasCollision).toBe(true);
        expect(result.collisions[0].distance).toBe(8);
    });

    it('should not detect collision beyond tolerance', () => {
        const tolerance = 5;
        const poles = [createPoint(5, 7)];
        const existingWalls = [createWall([createPole(0, 0), createPole(10, 0)], 0)];

        const result = detectPoleOnEdgeCollision(poles, existingWalls, gridConfig, tolerance);
        expect(result.hasCollision).toBe(false);
    });

    it('should handle empty poles array', () => {
        const existingWalls = [createWall([createPole(0, 0), createPole(10, 0)], 0)];
        const result = detectPoleOnEdgeCollision([], existingWalls, gridConfig);
        expect(result.hasCollision).toBe(false);
    });

    it('should handle empty existing walls array', () => {
        const poles = [createPoint(5, 5)];
        const result = detectPoleOnEdgeCollision(poles, [], gridConfig);
        expect(result.hasCollision).toBe(false);
    });

    it('should handle walls with insufficient poles', () => {
        const poles = [createPoint(5, 5)];
        const existingWalls = [createWall([createPole(0, 0)], 0)];

        const result = detectPoleOnEdgeCollision(poles, existingWalls, gridConfig);
        expect(result.hasCollision).toBe(false);
    });

    it('should handle closed walls', () => {
        const poles = [createPoint(5, 3)];
        const existingWalls = [
            createWall(
                [createPole(0, 0), createPole(10, 0), createPole(10, 10), createPole(0, 10)],
                0,
                true
            ),
        ];

        const result = detectPoleOnEdgeCollision(poles, existingWalls, gridConfig);
        expect(result.hasCollision).toBe(true);
    });

    it('should not check last edge of open walls', () => {
        const poles = [createPoint(5, 13)];
        const existingWalls = [
            createWall([createPole(0, 0), createPole(10, 0), createPole(10, 10)], 0, false),
        ];

        const result = detectPoleOnEdgeCollision(poles, existingWalls, gridConfig);
        expect(result.hasCollision).toBe(false);
    });

    it('should handle vertical edges', () => {
        const poles = [createPoint(3, 5)];
        const existingWalls = [createWall([createPole(0, 0), createPole(0, 10)], 0)];

        const result = detectPoleOnEdgeCollision(poles, existingWalls, gridConfig);
        expect(result.hasCollision).toBe(true);
        expect(result.collisions[0].distance).toBe(3);
        expect(result.collisions[0].projectionPoint.x).toBeCloseTo(0, 5);
        expect(result.collisions[0].projectionPoint.y).toBeCloseTo(5, 5);
    });

    it('should handle diagonal edges', () => {
        const poles = [createPoint(5, 5)];
        const existingWalls = [createWall([createPole(0, 0), createPole(10, 10)], 0)];

        const result = detectPoleOnEdgeCollision(poles, existingWalls, gridConfig);
        expect(result.hasCollision).toBe(true);
    });

    it('should handle zero-length edges gracefully', () => {
        const poles = [createPoint(5, 5)];
        const existingWalls = [createWall([createPole(0, 0), createPole(0, 0)], 0)];

        const result = detectPoleOnEdgeCollision(poles, existingWalls, gridConfig);
        expect(result.hasCollision).toBe(false);
    });
});

describe('Performance benchmarks', () => {
    const gridConfig = createDefaultGridConfig();

    it('should handle large dataset efficiently with spatial hash', () => {
        const newPoles: Point[] = [];
        for (let i = 0; i < 100; i++) {
            newPoles.push(createPoint(i * 10, i * 10));
        }

        const existingWalls: EncounterWall[] = [];
        for (let i = 0; i < 200; i++) {
            const poles = [createPole(i * 5, i * 5), createPole(i * 5 + 10, i * 5)];
            existingWalls.push(createWall(poles, i));
        }

        const startTime = performance.now();
        const result = detectPoleOnPoleCollision(newPoles, existingWalls, gridConfig);
        const endTime = performance.now();

        expect(endTime - startTime).toBeLessThan(100);
        expect(result).toBeDefined();
    });

    it('should handle grid pattern edge intersections efficiently', () => {
        const newPoles: Point[] = [];
        for (let i = 0; i < 20; i++) {
            newPoles.push(createPoint(i * 10, 0));
        }

        const existingWalls: EncounterWall[] = [];
        for (let i = 0; i < 20; i++) {
            const poles = [createPole(0, i * 10), createPole(200, i * 10)];
            existingWalls.push(createWall(poles, i));
        }

        const startTime = performance.now();
        const result = detectEdgeOnEdgeIntersection(newPoles, existingWalls, gridConfig);
        const endTime = performance.now();

        expect(endTime - startTime).toBeLessThan(50);
        expect(result).toBeDefined();
    });

    it('should compare brute force vs spatial hash performance', () => {
        const newPoles = [createPoint(5000, 5000)];

        const smallDataset: EncounterWall[] = [];
        for (let i = 0; i < 30; i++) {
            smallDataset.push(createWall([createPole(i * 10, i * 10)], i));
        }

        const largeDataset: EncounterWall[] = [];
        for (let i = 0; i < 100; i++) {
            largeDataset.push(createWall([createPole(i * 10, i * 10)], i));
        }

        const startSmall = performance.now();
        detectPoleOnPoleCollision(newPoles, smallDataset, gridConfig);
        const timeSmall = performance.now() - startSmall;

        const startLarge = performance.now();
        detectPoleOnPoleCollision(newPoles, largeDataset, gridConfig);
        const timeLarge = performance.now() - startLarge;

        expect(timeLarge).toBeLessThan(timeSmall * 10);
    });
});
