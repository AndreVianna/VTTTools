import type { Point } from '@/types/domain';

/**
 * Checks if two points are equal (same x and y coordinates).
 *
 * @param p1 - First point
 * @param p2 - Second point
 * @returns true if points have identical x and y values
 */
export function pointsEqual(p1: Point, p2: Point, tolerance = 0.001): boolean {
  return Math.abs(p1.x - p2.x) < tolerance && Math.abs(p1.y - p2.y) < tolerance;
}

/**
 * Removes adjacent duplicate vertices from a polygon.
 * Handles both open and closed polygons correctly.
 *
 * @param vertices - Array of points
 * @param isClosed - Whether polygon is closed
 * @returns Cleaned array with no adjacent duplicates
 *
 * @example
 * // Remove duplicate adjacent points
 * cleanPolygonVertices([{x:0,y:0}, {x:0,y:0}, {x:10,y:10}], false)
 * // Returns: [{x:0,y:0}, {x:10,y:10}]
 *
 * @example
 * // Remove duplicate first/last in closed polygon
 * cleanPolygonVertices([{x:0,y:0}, {x:10,y:0}, {x:0,y:0}], true)
 * // Returns: [{x:0,y:0}, {x:10,y:0}]
 */
export function cleanPolygonVertices(vertices: Point[], isClosed: boolean): Point[] {
  if (vertices.length === 0) {
    return [];
  }

  const cleaned = [...vertices];

  for (let i = cleaned.length - 1; i > 0; i--) {
    const current = cleaned[i];
    const previous = cleaned[i - 1];

    if (current && previous && pointsEqual(current, previous)) {
      cleaned.splice(i, 1);
    }
  }

  if (isClosed && cleaned.length >= 2) {
    const first = cleaned[0];
    const last = cleaned[cleaned.length - 1];

    if (first && last && pointsEqual(first, last)) {
      cleaned.splice(cleaned.length - 1, 1);
    }
  }

  return cleaned;
}

/**
 * Validates that a polygon has the minimum required vertices.
 *
 * @param vertices - Array of points
 * @param isClosed - Whether polygon must form closed shape
 * @returns true if valid, false otherwise
 *
 * @example
 * // Closed polygon needs at least 3 vertices (triangle)
 * validateMinimumVertices([{x:0,y:0}, {x:10,y:0}], true)
 * // Returns: false
 *
 * @example
 * // Open polygon needs at least 2 vertices (line segment)
 * validateMinimumVertices([{x:0,y:0}, {x:10,y:0}], false)
 * // Returns: true
 */
export function validateMinimumVertices(vertices: Point[], isClosed: boolean): boolean {
  const minimumRequired = isClosed ? 3 : 2;
  return vertices.length >= minimumRequired;
}

/**
 * Ensures the polygon vertices array doesn't have duplicate first/last vertex.
 * Konva's `closed` prop handles closing, so we shouldn't duplicate the vertex.
 *
 * @param vertices - Array of points
 * @returns Vertices with last removed if it equals first
 *
 * @example
 * // Remove duplicate closing vertex
 * ensurePolygonNotClosed([{x:0,y:0}, {x:10,y:0}, {x:10,y:10}, {x:0,y:0}])
 * // Returns: [{x:0,y:0}, {x:10,y:0}, {x:10,y:10}]
 *
 * @example
 * // No duplicate closing vertex - return as-is
 * ensurePolygonNotClosed([{x:0,y:0}, {x:10,y:0}, {x:10,y:10}])
 * // Returns: [{x:0,y:0}, {x:10,y:0}, {x:10,y:10}]
 */
export function ensurePolygonNotClosed(vertices: Point[]): Point[] {
  if (vertices.length < 2) {
    return vertices;
  }

  const first = vertices[0];
  const last = vertices[vertices.length - 1];

  if (first && last && pointsEqual(first, last)) {
    return vertices.slice(0, -1);
  }

  return vertices;
}
