import { describe, it, expect } from 'vitest';
import { calculatePolygonCentroid } from './geometryUtils';
import type { Point } from '@/types/domain';

describe('calculatePolygonCentroid', () => {
    it('should return origin for empty array', () => {
        const result = calculatePolygonCentroid([]);
        expect(result).toEqual({ x: 0, y: 0 });
    });

    it('should return same point for single vertex', () => {
        const vertices: Point[] = [{ x: 10, y: 20 }];
        const result = calculatePolygonCentroid(vertices);
        expect(result).toEqual({ x: 10, y: 20 });
    });

    it('should calculate centroid for triangle', () => {
        const vertices: Point[] = [
            { x: 0, y: 0 },
            { x: 6, y: 0 },
            { x: 3, y: 6 },
        ];
        const result = calculatePolygonCentroid(vertices);
        expect(result).toEqual({ x: 3, y: 2 });
    });

    it('should calculate centroid for square', () => {
        const vertices: Point[] = [
            { x: 0, y: 0 },
            { x: 4, y: 0 },
            { x: 4, y: 4 },
            { x: 0, y: 4 },
        ];
        const result = calculatePolygonCentroid(vertices);
        expect(result).toEqual({ x: 2, y: 2 });
    });

    it('should handle irregular polygon', () => {
        const vertices: Point[] = [
            { x: 1, y: 1 },
            { x: 5, y: 2 },
            { x: 6, y: 6 },
            { x: 2, y: 5 },
        ];
        const result = calculatePolygonCentroid(vertices);
        expect(result.x).toBeCloseTo(3.5, 5);
        expect(result.y).toBeCloseTo(3.5, 5);
    });

    it('should not mutate input array', () => {
        const vertices: Point[] = [
            { x: 1, y: 2 },
            { x: 3, y: 4 },
        ];
        const original = [...vertices];
        calculatePolygonCentroid(vertices);
        expect(vertices).toEqual(original);
    });
});
