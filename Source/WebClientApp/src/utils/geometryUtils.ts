import type { Point } from '@/types/domain';

export function calculatePolygonCentroid(vertices: Point[]): Point {
  if (vertices.length === 0) {
    return { x: 0, y: 0 };
  }

  const firstVertex = vertices[0];
  if (!firstVertex) {
    return { x: 0, y: 0 };
  }

  if (vertices.length === 1) {
    return { x: firstVertex.x, y: firstVertex.y };
  }

  const sum = vertices.reduce(
    (acc, vertex) => ({
      x: acc.x + vertex.x,
      y: acc.y + vertex.y,
    }),
    { x: 0, y: 0 },
  );

  return {
    x: sum.x / vertices.length,
    y: sum.y / vertices.length,
  };
}
