import { describe, expect, it } from 'vitest';
import { getMarqueeRect, isPointInPolygon, isPointInRect, projectPointToLineSegment } from './polygonGeometry';

describe('projectPointToLineSegment', () => {
    it('should project point onto middle of segment', () => {
        const result = projectPointToLineSegment(
            { x: 5, y: 5 },
            { x: 0, y: 0 },
            { x: 10, y: 0 },
        );
        expect(result.x).toBeCloseTo(5);
        expect(result.y).toBeCloseTo(0);
    });

    it('should return start point when point projects before segment', () => {
        const result = projectPointToLineSegment(
            { x: -5, y: 5 },
            { x: 0, y: 0 },
            { x: 10, y: 0 },
        );
        expect(result.x).toBeCloseTo(0);
        expect(result.y).toBeCloseTo(0);
    });

    it('should return end point when point projects after segment', () => {
        const result = projectPointToLineSegment(
            { x: 15, y: 5 },
            { x: 0, y: 0 },
            { x: 10, y: 0 },
        );
        expect(result.x).toBeCloseTo(10);
        expect(result.y).toBeCloseTo(0);
    });

    it('should handle zero-length segment', () => {
        const result = projectPointToLineSegment(
            { x: 5, y: 5 },
            { x: 3, y: 3 },
            { x: 3, y: 3 },
        );
        expect(result.x).toBeCloseTo(3);
        expect(result.y).toBeCloseTo(3);
    });

    it('should throw on invalid point', () => {
        expect(() => projectPointToLineSegment(
            null as unknown as { x: number; y: number },
            { x: 0, y: 0 },
            { x: 10, y: 0 },
        )).toThrow('Invalid point object');
    });

    it('should throw on invalid lineStart', () => {
        expect(() => projectPointToLineSegment(
            { x: 5, y: 5 },
            { x: NaN, y: 0 },
            { x: 10, y: 0 },
        )).toThrow('Invalid lineStart object');
    });

    it('should throw on invalid lineEnd', () => {
        expect(() => projectPointToLineSegment(
            { x: 5, y: 5 },
            { x: 0, y: 0 },
            undefined as unknown as { x: number; y: number },
        )).toThrow('Invalid lineEnd object');
    });
});

describe('isPointInPolygon', () => {
    const square = [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
        { x: 0, y: 10 },
    ];

    it('should return true for point inside polygon', () => {
        expect(isPointInPolygon({ x: 5, y: 5 }, square)).toBe(true);
    });

    it('should return false for point outside polygon', () => {
        expect(isPointInPolygon({ x: 15, y: 5 }, square)).toBe(false);
    });

    it('should return false for polygon with less than 3 vertices', () => {
        expect(isPointInPolygon({ x: 5, y: 5 }, [{ x: 0, y: 0 }, { x: 10, y: 0 }])).toBe(false);
    });

    it('should handle concave polygon', () => {
        const concave = [
            { x: 0, y: 0 },
            { x: 10, y: 0 },
            { x: 10, y: 10 },
            { x: 5, y: 5 },
            { x: 0, y: 10 },
        ];
        expect(isPointInPolygon({ x: 2, y: 5 }, concave)).toBe(true);
        expect(isPointInPolygon({ x: 8, y: 5 }, concave)).toBe(true);
    });
});

describe('isPointInRect', () => {
    const rect = { x: 0, y: 0, width: 10, height: 10 };

    it('should return true for point inside rect', () => {
        expect(isPointInRect({ x: 5, y: 5 }, rect)).toBe(true);
    });

    it('should return true for point on edge', () => {
        expect(isPointInRect({ x: 0, y: 5 }, rect)).toBe(true);
        expect(isPointInRect({ x: 10, y: 5 }, rect)).toBe(true);
    });

    it('should return false for point outside rect', () => {
        expect(isPointInRect({ x: 15, y: 5 }, rect)).toBe(false);
        expect(isPointInRect({ x: -1, y: 5 }, rect)).toBe(false);
    });
});

describe('getMarqueeRect', () => {
    it('should create rect from top-left to bottom-right', () => {
        const rect = getMarqueeRect({ x: 0, y: 0 }, { x: 10, y: 10 });
        expect(rect).toEqual({ x: 0, y: 0, width: 10, height: 10 });
    });

    it('should normalize rect when start is bottom-right', () => {
        const rect = getMarqueeRect({ x: 10, y: 10 }, { x: 0, y: 0 });
        expect(rect).toEqual({ x: 0, y: 0, width: 10, height: 10 });
    });

    it('should handle negative coordinates', () => {
        const rect = getMarqueeRect({ x: -5, y: -5 }, { x: 5, y: 5 });
        expect(rect).toEqual({ x: -5, y: -5, width: 10, height: 10 });
    });
});
