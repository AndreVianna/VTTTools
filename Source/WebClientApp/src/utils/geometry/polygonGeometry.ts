import type { Point } from '@/types/domain';

/**
 * Represents a rectangle with position and dimensions.
 */
export interface Rect {
    x: number;
    y: number;
    width: number;
    height: number;
}

/**
 * Projects a point onto a line segment (not infinite line).
 * Returns closest point on segment to the given point.
 *
 * @param point - The point to project
 * @param lineStart - Start of line segment
 * @param lineEnd - End of line segment
 * @returns Projected point on line segment
 * @throws Error if inputs are invalid
 */
export function projectPointToLineSegment(
    point: { x: number; y: number },
    lineStart: { x: number; y: number },
    lineEnd: { x: number; y: number },
): { x: number; y: number } {
    if (
        !point ||
        typeof point.x !== 'number' ||
        typeof point.y !== 'number' ||
        !Number.isFinite(point.x) ||
        !Number.isFinite(point.y)
    ) {
        throw new Error('projectPointToLineSegment: Invalid point object');
    }
    if (
        !lineStart ||
        typeof lineStart.x !== 'number' ||
        typeof lineStart.y !== 'number' ||
        !Number.isFinite(lineStart.x) ||
        !Number.isFinite(lineStart.y)
    ) {
        throw new Error('projectPointToLineSegment: Invalid lineStart object');
    }
    if (
        !lineEnd ||
        typeof lineEnd.x !== 'number' ||
        typeof lineEnd.y !== 'number' ||
        !Number.isFinite(lineEnd.x) ||
        !Number.isFinite(lineEnd.y)
    ) {
        throw new Error('projectPointToLineSegment: Invalid lineEnd object');
    }

    const dx = lineEnd.x - lineStart.x;
    const dy = lineEnd.y - lineStart.y;

    const lengthSquared = dx * dx + dy * dy;
    if (lengthSquared < Number.EPSILON) {
        return { x: lineStart.x, y: lineStart.y };
    }

    const t = Math.max(0, Math.min(1, ((point.x - lineStart.x) * dx + (point.y - lineStart.y) * dy) / lengthSquared));

    return {
        x: lineStart.x + t * dx,
        y: lineStart.y + t * dy,
    };
}

/**
 * Determines if a point is inside a polygon using ray casting algorithm.
 *
 * @param point - The point to test
 * @param vertices - The polygon vertices
 * @returns true if point is inside the polygon
 */
export function isPointInPolygon(point: Point, vertices: Point[]): boolean {
    if (vertices.length < 3) return false;
    let inside = false;
    for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
        const vi = vertices[i];
        const vj = vertices[j];
        if (!vi || !vj) continue;
        const xi = vi.x, yi = vi.y;
        const xj = vj.x, yj = vj.y;
        if (((yi > point.y) !== (yj > point.y)) &&
            (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi)) {
            inside = !inside;
        }
    }
    return inside;
}

/**
 * Determines if a point is inside a rectangle.
 *
 * @param point - The point to test
 * @param rect - The rectangle to test against
 * @returns true if point is inside the rectangle
 */
export function isPointInRect(
    point: { x: number; y: number },
    rect: Rect,
): boolean {
    return point.x >= rect.x && point.x <= rect.x + rect.width && point.y >= rect.y && point.y <= rect.y + rect.height;
}

/**
 * Creates a normalized rectangle from two corner points.
 * Handles cases where start point is to the right or below the end point.
 *
 * @param start - First corner point
 * @param end - Second corner point
 * @returns Normalized rectangle with positive width and height
 */
export function getMarqueeRect(
    start: { x: number; y: number },
    end: { x: number; y: number },
): Rect {
    const x = Math.min(start.x, end.x);
    const y = Math.min(start.y, end.y);
    const width = Math.abs(end.x - start.x);
    const height = Math.abs(end.y - start.y);
    return { x, y, width, height };
}
