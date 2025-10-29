import { describe, it, expect } from 'vitest';
import {
    distanceBetweenPoints,
    lineLineIntersection,
    castRay,
    extractOpaqueSegments,
    calculateLineOfSight,
    type Ray,
    type LineSegment
} from './lineOfSightCalculation';
import type { Point, SceneBarrier, SceneSource } from '@/types/domain';
import type { GridConfig } from '@/utils/gridCalculator';

describe('distanceBetweenPoints', () => {
    it('should calculate distance between two points', () => {
        const p1: Point = { x: 0, y: 0 };
        const p2: Point = { x: 3, y: 4 };
        expect(distanceBetweenPoints(p1, p2)).toBe(5);
    });

    it('should return 0 for same point', () => {
        const p: Point = { x: 5, y: 5 };
        expect(distanceBetweenPoints(p, p)).toBe(0);
    });

    it('should calculate distance with negative coordinates', () => {
        const p1: Point = { x: -3, y: -4 };
        const p2: Point = { x: 0, y: 0 };
        expect(distanceBetweenPoints(p1, p2)).toBe(5);
    });

    it('should calculate horizontal distance', () => {
        const p1: Point = { x: 0, y: 5 };
        const p2: Point = { x: 10, y: 5 };
        expect(distanceBetweenPoints(p1, p2)).toBe(10);
    });

    it('should calculate vertical distance', () => {
        const p1: Point = { x: 5, y: 0 };
        const p2: Point = { x: 5, y: 10 };
        expect(distanceBetweenPoints(p1, p2)).toBe(10);
    });
});

describe('lineLineIntersection', () => {
    it('should find intersection of two crossing lines', () => {
        const a1: Point = { x: 0, y: 0 };
        const a2: Point = { x: 10, y: 10 };
        const b1: Point = { x: 0, y: 10 };
        const b2: Point = { x: 10, y: 0 };

        const intersection = lineLineIntersection(a1, a2, b1, b2);
        expect(intersection).not.toBeNull();
        expect(intersection!.x).toBeCloseTo(5, 5);
        expect(intersection!.y).toBeCloseTo(5, 5);
    });

    it('should return null for parallel lines', () => {
        const a1: Point = { x: 0, y: 0 };
        const a2: Point = { x: 10, y: 0 };
        const b1: Point = { x: 0, y: 5 };
        const b2: Point = { x: 10, y: 5 };

        expect(lineLineIntersection(a1, a2, b1, b2)).toBeNull();
    });

    it('should return null when lines do not intersect within segments', () => {
        const a1: Point = { x: 0, y: 0 };
        const a2: Point = { x: 5, y: 5 };
        const b1: Point = { x: 6, y: 0 };
        const b2: Point = { x: 10, y: 5 };

        expect(lineLineIntersection(a1, a2, b1, b2)).toBeNull();
    });

    it('should find intersection at segment endpoint', () => {
        const a1: Point = { x: 0, y: 0 };
        const a2: Point = { x: 10, y: 0 };
        const b1: Point = { x: 5, y: -5 };
        const b2: Point = { x: 5, y: 0 };

        const intersection = lineLineIntersection(a1, a2, b1, b2);
        expect(intersection).not.toBeNull();
        expect(intersection!.x).toBeCloseTo(5, 5);
        expect(intersection!.y).toBeCloseTo(0, 5);
    });

    it('should handle perpendicular lines', () => {
        const a1: Point = { x: 5, y: 0 };
        const a2: Point = { x: 5, y: 10 };
        const b1: Point = { x: 0, y: 5 };
        const b2: Point = { x: 10, y: 5 };

        const intersection = lineLineIntersection(a1, a2, b1, b2);
        expect(intersection).not.toBeNull();
        expect(intersection!.x).toBeCloseTo(5, 5);
        expect(intersection!.y).toBeCloseTo(5, 5);
    });

    it('should return null for collinear lines', () => {
        const a1: Point = { x: 0, y: 0 };
        const a2: Point = { x: 10, y: 0 };
        const b1: Point = { x: 5, y: 0 };
        const b2: Point = { x: 15, y: 0 };

        expect(lineLineIntersection(a1, a2, b1, b2)).toBeNull();
    });

    it('should find intersection with diagonal lines', () => {
        const a1: Point = { x: 0, y: 0 };
        const a2: Point = { x: 10, y: 10 };
        const b1: Point = { x: 5, y: 0 };
        const b2: Point = { x: 5, y: 10 };

        const intersection = lineLineIntersection(a1, a2, b1, b2);
        expect(intersection).not.toBeNull();
        expect(intersection!.x).toBeCloseTo(5, 5);
        expect(intersection!.y).toBeCloseTo(5, 5);
    });
});

describe('castRay', () => {
    it('should return ray endpoint when no barriers', () => {
        const ray: Ray = {
            origin: { x: 0, y: 0 },
            angle: 0,
            maxDistance: 100
        };

        const result = castRay(ray, []);
        expect(result.x).toBeCloseTo(100, 5);
        expect(result.y).toBeCloseTo(0, 5);
    });

    it('should return intersection point when ray hits barrier', () => {
        const ray: Ray = {
            origin: { x: 0, y: 0 },
            angle: 0,
            maxDistance: 100
        };

        const segment: LineSegment = {
            start: { x: 50, y: -10 },
            end: { x: 50, y: 10 }
        };

        const result = castRay(ray, [segment]);
        expect(result.x).toBeCloseTo(50, 5);
        expect(result.y).toBeCloseTo(0, 5);
    });

    it('should find closest intersection with multiple barriers', () => {
        const ray: Ray = {
            origin: { x: 0, y: 0 },
            angle: 0,
            maxDistance: 100
        };

        const segments: LineSegment[] = [
            { start: { x: 80, y: -10 }, end: { x: 80, y: 10 } },
            { start: { x: 30, y: -10 }, end: { x: 30, y: 10 } },
            { start: { x: 60, y: -10 }, end: { x: 60, y: 10 } }
        ];

        const result = castRay(ray, segments);
        expect(result.x).toBeCloseTo(30, 5);
        expect(result.y).toBeCloseTo(0, 5);
    });

    it('should handle diagonal ray', () => {
        const ray: Ray = {
            origin: { x: 0, y: 0 },
            angle: Math.PI / 4,
            maxDistance: 100
        };

        const segment: LineSegment = {
            start: { x: 0, y: 50 },
            end: { x: 100, y: 50 }
        };

        const result = castRay(ray, [segment]);
        expect(result.x).toBeCloseTo(50, 5);
        expect(result.y).toBeCloseTo(50, 5);
    });

    it('should return ray endpoint when barrier is behind origin', () => {
        const ray: Ray = {
            origin: { x: 0, y: 0 },
            angle: 0,
            maxDistance: 100
        };

        const segment: LineSegment = {
            start: { x: -50, y: -10 },
            end: { x: -50, y: 10 }
        };

        const result = castRay(ray, [segment]);
        expect(result.x).toBeCloseTo(100, 5);
        expect(result.y).toBeCloseTo(0, 5);
    });

    it('should handle ray with 180 degree angle', () => {
        const ray: Ray = {
            origin: { x: 100, y: 0 },
            angle: Math.PI,
            maxDistance: 100
        };

        const segment: LineSegment = {
            start: { x: 50, y: -10 },
            end: { x: 50, y: 10 }
        };

        const result = castRay(ray, [segment]);
        expect(result.x).toBeCloseTo(50, 5);
        expect(result.y).toBeCloseTo(0, 5);
    });
});

describe('extractOpaqueSegments', () => {
    it('should extract segments from single barrier', () => {
        const barriers: SceneBarrier[] = [
            {
                id: '1',
                sceneId: 'scene-1',
                barrierId: 'barrier-1',
                vertices: [
                    { x: 0, y: 0 },
                    { x: 10, y: 0 },
                    { x: 10, y: 10 }
                ]
            }
        ];

        const segments = extractOpaqueSegments(barriers);
        expect(segments).toHaveLength(2);
        expect(segments[0]).toEqual({
            start: { x: 0, y: 0 },
            end: { x: 10, y: 0 }
        });
        expect(segments[1]).toEqual({
            start: { x: 10, y: 0 },
            end: { x: 10, y: 10 }
        });
    });

    it('should return empty array for no barriers', () => {
        const segments = extractOpaqueSegments([]);
        expect(segments).toHaveLength(0);
    });

    it('should extract segments from multiple barriers', () => {
        const barriers: SceneBarrier[] = [
            {
                id: '1',
                sceneId: 'scene-1',
                barrierId: 'barrier-1',
                vertices: [
                    { x: 0, y: 0 },
                    { x: 10, y: 0 }
                ]
            },
            {
                id: '2',
                sceneId: 'scene-1',
                barrierId: 'barrier-2',
                vertices: [
                    { x: 20, y: 0 },
                    { x: 30, y: 0 },
                    { x: 30, y: 10 }
                ]
            }
        ];

        const segments = extractOpaqueSegments(barriers);
        expect(segments).toHaveLength(3);
    });

    it('should handle barrier with single vertex', () => {
        const barriers: SceneBarrier[] = [
            {
                id: '1',
                sceneId: 'scene-1',
                barrierId: 'barrier-1',
                vertices: [{ x: 0, y: 0 }]
            }
        ];

        const segments = extractOpaqueSegments(barriers);
        expect(segments).toHaveLength(0);
    });

    it('should handle barrier with two vertices', () => {
        const barriers: SceneBarrier[] = [
            {
                id: '1',
                sceneId: 'scene-1',
                barrierId: 'barrier-1',
                vertices: [
                    { x: 0, y: 0 },
                    { x: 10, y: 10 }
                ]
            }
        ];

        const segments = extractOpaqueSegments(barriers);
        expect(segments).toHaveLength(1);
        expect(segments[0]).toEqual({
            start: { x: 0, y: 0 },
            end: { x: 10, y: 10 }
        });
    });
});

describe('calculateLineOfSight', () => {
    const gridConfig: GridConfig = {
        cellSize: { width: 50, height: 50 },
        offset: { left: 0, top: 0 },
        gridType: 0,
        snap: true
    };

    it('should generate 72 rays', () => {
        const source: SceneSource = {
            id: '1',
            sceneId: 'scene-1',
            sourceId: 'source-1',
            position: { x: 100, y: 100 },
            range: 5,
            intensity: 1.0,
            isGradient: true
        };

        const result = calculateLineOfSight(source, source.range, [], gridConfig);
        expect(result).toHaveLength(72);
    });

    it('should create full circle when no barriers', () => {
        const source: SceneSource = {
            id: '1',
            sceneId: 'scene-1',
            sourceId: 'source-1',
            position: { x: 100, y: 100 },
            range: 5,
            intensity: 1.0,
            isGradient: true
        };

        const result = calculateLineOfSight(source, source.range, [], gridConfig);

        const distances = result.map(p => distanceBetweenPoints(source.position, p));
        const expectedDistance = source.range * gridConfig.cellSize.width;

        distances.forEach(d => {
            expect(d).toBeCloseTo(expectedDistance, 1);
        });
    });

    it('should truncate rays at opaque barrier', () => {
        const source: SceneSource = {
            id: '1',
            sceneId: 'scene-1',
            sourceId: 'source-1',
            position: { x: 100, y: 100 },
            range: 10,
            intensity: 1.0,
            isGradient: true
        };

        const barriers: SceneBarrier[] = [
            {
                id: '1',
                sceneId: 'scene-1',
                barrierId: 'barrier-1',
                vertices: [
                    { x: 200, y: 50 },
                    { x: 200, y: 150 }
                ]
            }
        ];

        const result = calculateLineOfSight(source, source.range, barriers, gridConfig);

        const eastRays = result.filter(p => p.x > source.position.x && Math.abs(p.y - source.position.y) < 50);
        const blockedRays = eastRays.filter(p => Math.abs(p.x - 200) < 5);

        expect(blockedRays.length).toBeGreaterThan(0);
    });

    it('should use range parameter from source', () => {
        const source: SceneSource = {
            id: '1',
            sceneId: 'scene-1',
            sourceId: 'source-1',
            position: { x: 100, y: 100 },
            range: 3,
            intensity: 1.0,
            isGradient: true
        };

        const result = calculateLineOfSight(source, source.range, [], gridConfig);

        const distances = result.map(p => distanceBetweenPoints(source.position, p));
        const expectedDistance = 3 * gridConfig.cellSize.width;

        distances.forEach(d => {
            expect(d).toBeCloseTo(expectedDistance, 1);
        });
    });

    it('should handle multiple barriers', () => {
        const source: SceneSource = {
            id: '1',
            sceneId: 'scene-1',
            sourceId: 'source-1',
            position: { x: 100, y: 100 },
            range: 10,
            intensity: 1.0,
            isGradient: true
        };

        const barriers: SceneBarrier[] = [
            {
                id: '1',
                sceneId: 'scene-1',
                barrierId: 'barrier-1',
                vertices: [
                    { x: 200, y: 50 },
                    { x: 200, y: 150 }
                ]
            },
            {
                id: '2',
                sceneId: 'scene-1',
                barrierId: 'barrier-2',
                vertices: [
                    { x: 50, y: 0 },
                    { x: 150, y: 0 }
                ]
            }
        ];

        const result = calculateLineOfSight(source, source.range, barriers, gridConfig);
        expect(result).toHaveLength(72);

        const allAtMaxRange = result.every(p => {
            const distance = distanceBetweenPoints(source.position, p);
            const maxDistance = source.range * gridConfig.cellSize.width;
            return Math.abs(distance - maxDistance) < 1;
        });

        expect(allAtMaxRange).toBe(false);
    });

    it('should handle source at grid origin', () => {
        const source: SceneSource = {
            id: '1',
            sceneId: 'scene-1',
            sourceId: 'source-1',
            position: { x: 0, y: 0 },
            range: 5,
            intensity: 1.0,
            isGradient: true
        };

        const result = calculateLineOfSight(source, source.range, [], gridConfig);
        expect(result).toHaveLength(72);

        result.forEach(p => {
            const distance = distanceBetweenPoints(source.position, p);
            const expectedDistance = source.range * gridConfig.cellSize.width;
            expect(distance).toBeCloseTo(expectedDistance, 1);
        });
    });

    it('should handle zero range', () => {
        const source: SceneSource = {
            id: '1',
            sceneId: 'scene-1',
            sourceId: 'source-1',
            position: { x: 100, y: 100 },
            range: 0,
            intensity: 1.0,
            isGradient: true
        };

        const result = calculateLineOfSight(source, source.range, [], gridConfig);
        expect(result).toHaveLength(72);

        result.forEach(p => {
            expect(p.x).toBeCloseTo(source.position.x, 5);
            expect(p.y).toBeCloseTo(source.position.y, 5);
        });
    });
});
