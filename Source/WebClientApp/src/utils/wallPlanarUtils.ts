import type { Point } from '@/types/domain';

export interface Intersection {
  point: Point;
  segment1Index: number;
  segment2Index: number;
  t1: number;
  t2: number;
}

export interface PlanarVertex {
  id: string;
  point: Point;
  edges: PlanarEdge[];
}

export interface PlanarEdge {
  from: string;
  to: string;
  angle: number;
}

export interface Face {
  vertices: string[];
  poles: Point[];
}

export interface DecomposedPath {
  closedWalls: Point[][];
  openSegments: Point[][];
}

function calculateDistance(p1: Point, p2: Point): number {
  return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
}

function pointsEqual(p1: Point, p2: Point, tolerance: number = 5): boolean {
  return calculateDistance(p1, p2) <= tolerance;
}

export function findSegmentIntersections(poles: Point[], tolerance: number = 5): Intersection[] {
  const intersections: Intersection[] = [];

  for (let i = 0; i < poles.length - 1; i++) {
    const p1 = poles[i];
    const p2 = poles[i + 1];
    if (!p1 || !p2) continue;

    for (let j = i + 2; j < poles.length - 1; j++) {
      if (j === poles.length - 2 && i === 0) continue;

      const p3 = poles[j];
      const p4 = poles[j + 1];
      if (!p3 || !p4) continue;

      if (pointsEqual(p2, p3, tolerance)) {
        continue;
      }

      const intersection = segmentIntersection(p1, p2, p3, p4, tolerance);
      if (intersection) {
        intersections.push({
          point: intersection.point,
          segment1Index: i,
          segment2Index: j,
          t1: intersection.t1,
          t2: intersection.t2,
        });
      }
    }
  }

  return intersections;
}

interface SegmentIntersectionResult {
  point: Point;
  t1: number;
  t2: number;
}

function segmentIntersection(
  p1: Point,
  p2: Point,
  p3: Point,
  p4: Point,
  tolerance: number,
): SegmentIntersectionResult | null {
  const d1x = p2.x - p1.x;
  const d1y = p2.y - p1.y;
  const d2x = p4.x - p3.x;
  const d2y = p4.y - p3.y;

  const denominator = d1x * d2y - d1y * d2x;

  if (Math.abs(denominator) < 1e-10) {
    return null;
  }

  const dx = p3.x - p1.x;
  const dy = p3.y - p1.y;

  const t1 = (dx * d2y - dy * d2x) / denominator;
  const t2 = (dx * d1y - dy * d1x) / denominator;

  const epsilon = tolerance / Math.max(calculateDistance(p1, p2), calculateDistance(p3, p4), 1);

  if (t1 >= -epsilon && t1 <= 1 + epsilon && t2 >= -epsilon && t2 <= 1 + epsilon) {
    if (
      (Math.abs(t1) < epsilon && Math.abs(t2 - 1) < epsilon) ||
      (Math.abs(t1 - 1) < epsilon && Math.abs(t2) < epsilon) ||
      (Math.abs(t1) < epsilon && Math.abs(t2) < epsilon) ||
      (Math.abs(t1 - 1) < epsilon && Math.abs(t2 - 1) < epsilon)
    ) {
      return null;
    }

    const x = p1.x + t1 * d1x;
    const y = p1.y + t1 * d1y;

    return {
      point: { x, y },
      t1: Math.max(0, Math.min(1, t1)),
      t2: Math.max(0, Math.min(1, t2)),
    };
  }

  return null;
}

export function buildPlanarSubdivision(
  poles: Point[],
  intersections: Intersection[],
  tolerance: number = 5,
): Map<string, PlanarVertex> {
  const vertices = new Map<string, PlanarVertex>();

  const getOrCreateVertex = (point: Point): PlanarVertex => {
    for (const vertex of vertices.values()) {
      if (pointsEqual(vertex.point, point, tolerance)) {
        return vertex;
      }
    }

    const id = `V${vertices.size}`;
    const vertex: PlanarVertex = {
      id,
      point: { x: point.x, y: point.y },
      edges: [],
    };
    vertices.set(id, vertex);
    return vertex;
  };

  const segmentPoints = new Map<number, Point[]>();
  for (let i = 0; i < poles.length; i++) {
    const pole = poles[i];
    if (!pole) continue;
    segmentPoints.set(i, [pole]);
  }

  for (const intersection of intersections) {
    const seg1Points = segmentPoints.get(intersection.segment1Index) || [];
    const seg2Points = segmentPoints.get(intersection.segment2Index) || [];

    let alreadyExists1 = false;
    let alreadyExists2 = false;

    for (const p of seg1Points) {
      if (pointsEqual(p, intersection.point, tolerance)) {
        alreadyExists1 = true;
        break;
      }
    }

    for (const p of seg2Points) {
      if (pointsEqual(p, intersection.point, tolerance)) {
        alreadyExists2 = true;
        break;
      }
    }

    if (!alreadyExists1) {
      seg1Points.push(intersection.point);
    }
    if (!alreadyExists2) {
      seg2Points.push(intersection.point);
    }

    segmentPoints.set(intersection.segment1Index, seg1Points);
    segmentPoints.set(intersection.segment2Index, seg2Points);
  }

  for (let i = 0; i < poles.length - 1; i++) {
    const startPole = poles[i];
    const endPole = poles[i + 1];
    if (!startPole || !endPole) continue;

    const points = segmentPoints.get(i) || [startPole];
    if (!points.some((p) => pointsEqual(p, endPole, tolerance))) {
      points.push(endPole);
    }

    points.sort((a, b) => {
      const distA = calculateDistance(startPole, a);
      const distB = calculateDistance(startPole, b);
      return distA - distB;
    });

    for (let j = 0; j < points.length - 1; j++) {
      const p1 = points[j];
      const p2 = points[j + 1];
      if (!p1 || !p2) continue;

      const v1 = getOrCreateVertex(p1);
      const v2 = getOrCreateVertex(p2);

      const angle12 = Math.atan2(v2.point.y - v1.point.y, v2.point.x - v1.point.x);
      const angle21 = Math.atan2(v1.point.y - v2.point.y, v1.point.x - v2.point.x);

      const existingEdge1 = v1.edges.find((e) => e.to === v2.id && Math.abs(e.angle - angle12) < 1e-6);
      const existingEdge2 = v2.edges.find((e) => e.to === v1.id && Math.abs(e.angle - angle21) < 1e-6);

      if (!existingEdge1) {
        v1.edges.push({ from: v1.id, to: v2.id, angle: angle12 });
      }
      if (!existingEdge2) {
        v2.edges.push({ from: v2.id, to: v1.id, angle: angle21 });
      }
    }
  }

  for (const vertex of vertices.values()) {
    vertex.edges.sort((a, b) => a.angle - b.angle);
  }

  return vertices;
}

export function extractFaces(vertices: Map<string, PlanarVertex>, tolerance: number = 5): Face[] {
  const usedEdges = new Set<string>();
  const faces: Face[] = [];

  const edgeKey = (from: string, to: string) => `${from}->${to}`;

  for (const startVertex of vertices.values()) {
    for (const startEdge of startVertex.edges) {
      const key = edgeKey(startEdge.from, startEdge.to);
      if (usedEdges.has(key)) continue;

      const face = extractFace(vertices, startEdge.from, startEdge.to, usedEdges);

      if (face && face.length >= 3) {
        const poles = face.map((vertexId) => {
          const vertex = vertices.get(vertexId);
          return vertex ? vertex.point : { x: 0, y: 0 };
        });

        const area = calculatePolygonArea(poles);
        if (Math.abs(area) > tolerance * tolerance * 0.1) {
          faces.push({ vertices: face, poles });
        }
      }
    }
  }

  const uniqueFaces = deduplicateFaces(faces);

  return uniqueFaces;
}

function extractFace(
  vertices: Map<string, PlanarVertex>,
  startVertexId: string,
  nextVertexId: string,
  usedEdges: Set<string>,
): string[] | null {
  const face: string[] = [startVertexId];
  let currentVertexId = nextVertexId;
  let previousVertexId = startVertexId;

  const maxIterations = vertices.size * 2;
  let iterations = 0;

  while (currentVertexId !== startVertexId && iterations < maxIterations) {
    iterations++;
    face.push(currentVertexId);

    const currentVertex = vertices.get(currentVertexId);
    if (!currentVertex) break;

    const incomingAngle = Math.atan2(
      currentVertex.point.y - (vertices.get(previousVertexId)?.point.y || 0),
      currentVertex.point.x - (vertices.get(previousVertexId)?.point.x || 0),
    );

    let nextEdge: PlanarEdge | null = null;
    let minAngleDiff = Infinity;

    for (const edge of currentVertex.edges) {
      if (edge.to === previousVertexId) continue;

      let angleDiff = edge.angle - incomingAngle;
      if (angleDiff <= 0) angleDiff += 2 * Math.PI;

      if (angleDiff < minAngleDiff) {
        minAngleDiff = angleDiff;
        nextEdge = edge;
      }
    }

    if (!nextEdge) break;

    usedEdges.add(`${currentVertexId}->${nextEdge.to}`);

    previousVertexId = currentVertexId;
    currentVertexId = nextEdge.to;
  }

  if (currentVertexId === startVertexId && face.length >= 3) {
    return face;
  }

  return null;
}

function calculatePolygonArea(poles: Point[]): number {
  if (poles.length < 3) return 0;

  let area = 0;
  for (let i = 0; i < poles.length; i++) {
    const p1 = poles[i];
    const p2 = poles[(i + 1) % poles.length];
    if (!p1 || !p2) continue;
    area += p1.x * p2.y - p2.x * p1.y;
  }

  return area / 2;
}

function deduplicateFaces(faces: Face[]): Face[] {
  const unique: Face[] = [];

  for (const face of faces) {
    let isDuplicate = false;

    for (const existing of unique) {
      if (facesEqual(face, existing)) {
        isDuplicate = true;
        break;
      }
    }

    if (!isDuplicate) {
      unique.push(face);
    }
  }

  return unique;
}

function facesEqual(face1: Face, face2: Face): boolean {
  if (face1.vertices.length !== face2.vertices.length) {
    return false;
  }

  const set1 = new Set(face1.vertices);
  const set2 = new Set(face2.vertices);

  if (set1.size !== set2.size) return false;

  for (const v of set1) {
    if (!set2.has(v)) return false;
  }

  return true;
}

export function decomposeSelfIntersectingPath(poles: Point[], tolerance: number = 5): DecomposedPath {
  if (poles.length < 2) {
    return { closedWalls: [], openSegments: [] };
  }

  const loops = findLoopsInPath(poles, tolerance);

  if (loops.length === 0) {
    const firstPole = poles[0];
    const lastPole = poles[poles.length - 1];

    if (firstPole && lastPole && pointsEqual(firstPole, lastPole, tolerance)) {
      return { closedWalls: [poles], openSegments: [] };
    }

    return { closedWalls: [], openSegments: [poles] };
  }

  const intersections = findSegmentIntersections(poles, tolerance);
  const loopInteriorIndices = new Set<number>();
  const closedSegments: Point[][] = [];

  for (const loop of loops) {
    if (loop.fromIndex < 0 || loop.toIndex >= poles.length || loop.fromIndex >= loop.toIndex) {
      console.warn(`[decomposeSelfIntersectingPath] Invalid loop indices:`, loop);
      continue;
    }

    const loopPoles = poles.slice(loop.fromIndex, loop.toIndex);

    if (loopPoles.length >= 3) {
      closedSegments.push(loopPoles);

      for (let i = loop.fromIndex + 1; i <= loop.toIndex; i++) {
        loopInteriorIndices.add(i);
      }
    }
  }

  const openPathPoles: Point[] = [];
  for (let i = 0; i < poles.length; i++) {
    if (!loopInteriorIndices.has(i)) {
      const pole = poles[i];
      if (pole) {
        openPathPoles.push(pole);
      }
    }
  }

  const openSegments: Point[][] = openPathPoles.length >= 2 ? [openPathPoles] : [];
  let closedWalls = closedSegments;

  if (closedSegments.length > 0 && intersections.length > 0) {
    try {
      const vertices = buildPlanarSubdivision(poles, intersections, tolerance);
      const faces = extractFaces(vertices, tolerance);

      if (faces.length > 0) {
        closedWalls = faces.filter((face) => face.poles.length >= 3).map((face) => face.poles);
      }
    } catch (error) {
      console.warn(`[decomposeSelfIntersectingPath] Planar subdivision failed, using simple loops:`, error);
      closedWalls = closedSegments;
    }
  }

  return { closedWalls, openSegments };
}

interface Loop {
  fromIndex: number;
  toIndex: number;
}

function findLoopsInPath(poles: Point[], tolerance: number): Loop[] {
  const loops: Loop[] = [];

  // Need at least 4 poles to form a loop: A->B->C->A (indices 0,1,2,3 where 0==3)
  if (poles.length < 4) {
    return loops;
  }

  for (let i = 0; i < poles.length; i++) {
    const currentPole = poles[i];
    if (!currentPole) continue;

    // Look for matching poles at least 2 positions ahead
    // (to ensure we have at least A->B->C->A pattern)
    for (let j = i + 2; j < poles.length; j++) {
      const laterPole = poles[j];
      if (!laterPole) continue;

      if (pointsEqual(currentPole, laterPole, tolerance)) {
        // Validate: loop must have at least 3 unique poles (A->B->C->A has poles A,B,C)
        // slice(i, j) gives us A,B,C (excluding the duplicate A at j)
        if (j - i >= 2) {
          loops.push({ fromIndex: i, toIndex: j });
        }
      }
    }
  }

  return loops;
}
