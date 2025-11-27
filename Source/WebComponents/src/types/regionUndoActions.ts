import type { Point } from './domain';

export interface RegionSegment {
  regionIndex: number | null;
  name: string;
  type: string;
  vertices: Point[];
  value?: number;
  label?: string;
  color?: string;
}

export interface RegionLocalAction {
  type: string;
  description: string;
  undo: () => void;
  redo: () => void;
}

export interface PlaceVertexAction extends RegionLocalAction {
  type: 'PLACE_VERTEX';
  vertexIndex: number;
  vertex: Point;
}

export interface MoveVertexAction extends RegionLocalAction {
  type: 'MOVE_VERTEX';
  vertexIndex: number;
  oldVertex: Point;
  newVertex: Point;
}

export interface InsertVertexAction extends RegionLocalAction {
  type: 'INSERT_VERTEX';
  insertIndex: number;
  vertex: Point;
}

export interface DeleteVertexAction extends RegionLocalAction {
  type: 'DELETE_VERTEX';
  deletedIndex: number;
  deletedVertex: Point;
}

export interface MultiMoveVertexAction extends RegionLocalAction {
  type: 'MULTI_MOVE_VERTEX';
  moves: Array<{
    vertexIndex: number;
    oldVertex: Point;
    newVertex: Point;
  }>;
}

export interface RegionMoveLineAction extends RegionLocalAction {
  type: 'MOVE_LINE';
  lineIndex: number;
  vertex1Index: number;
  vertex2Index: number;
  oldVertex1: Point;
  oldVertex2: Point;
  newVertex1: Point;
  newVertex2: Point;
}

export function createPlaceVertexAction(
  _getSegment: () => RegionSegment | null,
  setSegment: (updater: (prev: RegionSegment) => RegionSegment) => void,
): PlaceVertexAction {
  const segment = _getSegment();
  if (!segment) {
    throw new Error('createPlaceVertexAction: segment is null');
  }

  const vertexIndex = segment.vertices.length - 1;
  const vertex = segment.vertices[vertexIndex];
  if (!vertex) {
    throw new Error('createPlaceVertexAction: no vertex to place');
  }

  return {
    type: 'PLACE_VERTEX',
    description: `Place vertex at (${vertex.x}, ${vertex.y})`,
    vertexIndex,
    vertex,
    undo: () => {
      setSegment((prev) => ({
        ...prev,
        vertices: prev.vertices.slice(0, -1),
      }));
    },
    redo: () => {
      setSegment((prev) => ({
        ...prev,
        vertices: [...prev.vertices, vertex],
      }));
    },
  };
}

export function createMoveVertexAction(
  vertexIndex: number,
  oldVertex: Point,
  newVertex: Point,
  _getSegment: () => RegionSegment | null,
  setSegment: (updater: (prev: RegionSegment) => RegionSegment) => void,
): MoveVertexAction {
  return {
    type: 'MOVE_VERTEX',
    description: `Move vertex ${vertexIndex} from (${oldVertex.x},${oldVertex.y}) to (${newVertex.x},${newVertex.y})`,
    vertexIndex,
    oldVertex,
    newVertex,
    undo: () => {
      setSegment((prev) => {
        const updatedVertices = [...prev.vertices];
        updatedVertices[vertexIndex] = { ...oldVertex };
        return {
          ...prev,
          vertices: updatedVertices,
        };
      });
    },
    redo: () => {
      setSegment((prev) => {
        const updatedVertices = [...prev.vertices];
        updatedVertices[vertexIndex] = { ...newVertex };
        return {
          ...prev,
          vertices: updatedVertices,
        };
      });
    },
  };
}

export function createInsertVertexAction(
  insertIndex: number,
  vertex: Point,
  _getSegment: () => RegionSegment | null,
  setSegment: (updater: (prev: RegionSegment) => RegionSegment) => void,
): InsertVertexAction {
  return {
    type: 'INSERT_VERTEX',
    description: `Insert vertex at line ${insertIndex}`,
    insertIndex,
    vertex,
    undo: () => {
      setSegment((prev) => {
        const updatedVertices = [...prev.vertices];
        updatedVertices.splice(insertIndex, 1);
        return {
          ...prev,
          vertices: updatedVertices,
        };
      });
    },
    redo: () => {
      setSegment((prev) => {
        const updatedVertices = [...prev.vertices];
        updatedVertices.splice(insertIndex, 0, vertex);
        return {
          ...prev,
          vertices: updatedVertices,
        };
      });
    },
  };
}

export function createDeleteVertexAction(
  deletedIndex: number,
  deletedVertex: Point,
  _getSegment: () => RegionSegment | null,
  setSegment: (updater: (prev: RegionSegment) => RegionSegment) => void,
): DeleteVertexAction {
  return {
    type: 'DELETE_VERTEX',
    description: `Delete vertex ${deletedIndex}`,
    deletedIndex,
    deletedVertex,
    undo: () => {
      setSegment((prev) => {
        const updatedVertices = [...prev.vertices];
        updatedVertices.splice(deletedIndex, 0, deletedVertex);
        return {
          ...prev,
          vertices: updatedVertices,
        };
      });
    },
    redo: () => {
      setSegment((prev) => {
        const updatedVertices = [...prev.vertices];
        if (updatedVertices.length <= 3) {
          throw new Error('Cannot delete vertex: minimum 3 vertices required');
        }
        updatedVertices.splice(deletedIndex, 1);
        return {
          ...prev,
          vertices: updatedVertices,
        };
      });
    },
  };
}

export function createMultiMoveVertexAction(
  vertexIndices: number[],
  oldVertices: Point[],
  newVertices: Point[],
  _getSegment: () => RegionSegment | null,
  setSegment: (updater: (prev: RegionSegment) => RegionSegment) => void,
): MultiMoveVertexAction {
  if (vertexIndices.length === 0) {
    throw new Error('MultiMoveVertexAction: vertexIndices array cannot be empty');
  }

  if (vertexIndices.length !== oldVertices.length || vertexIndices.length !== newVertices.length) {
    throw new Error('MultiMoveVertexAction: vertexIndices, oldVertices, and newVertices must have the same length');
  }

  const moves = vertexIndices.map((vertexIndex, i) => {
    const oldVertex = oldVertices[i];
    const newVertex = newVertices[i];
    if (!oldVertex || !newVertex) {
      throw new Error(`MultiMoveVertexAction: vertex at index ${i} is undefined`);
    }
    return {
      vertexIndex,
      oldVertex,
      newVertex,
    };
  });

  return {
    type: 'MULTI_MOVE_VERTEX',
    description: `Move ${moves.length} vertices together`,
    moves,
    undo: () => {
      setSegment((prev) => {
        const updatedVertices = [...prev.vertices];
        for (const move of moves) {
          updatedVertices[move.vertexIndex] = { ...move.oldVertex };
        }
        return {
          ...prev,
          vertices: updatedVertices,
        };
      });
    },
    redo: () => {
      setSegment((prev) => {
        const updatedVertices = [...prev.vertices];
        for (const move of moves) {
          updatedVertices[move.vertexIndex] = { ...move.newVertex };
        }
        return {
          ...prev,
          vertices: updatedVertices,
        };
      });
    },
  };
}

export function createRegionMoveLineAction(
  lineIndex: number,
  oldVertex1: Point,
  oldVertex2: Point,
  newVertex1: Point,
  newVertex2: Point,
  _getSegment: () => RegionSegment | null,
  setSegment: (updater: (prev: RegionSegment) => RegionSegment) => void,
): RegionMoveLineAction {
  const segment = _getSegment();
  if (!segment) {
    throw new Error('createRegionMoveLineAction: segment is null');
  }

  const vertex1Index = lineIndex;
  const vertex2Index = (lineIndex + 1) % segment.vertices.length;

  if (vertex1Index === vertex2Index) {
    throw new Error('createRegionMoveLineAction: vertex1Index and vertex2Index must be different');
  }

  return {
    type: 'MOVE_LINE',
    description: `Move line segment ${lineIndex}`,
    lineIndex,
    vertex1Index,
    vertex2Index,
    oldVertex1,
    oldVertex2,
    newVertex1,
    newVertex2,
    undo: () => {
      setSegment((prev) => {
        const updatedVertices = [...prev.vertices];
        updatedVertices[vertex1Index] = { ...oldVertex1 };
        updatedVertices[vertex2Index] = { ...oldVertex2 };
        return {
          ...prev,
          vertices: updatedVertices,
        };
      });
    },
    redo: () => {
      setSegment((prev) => {
        const updatedVertices = [...prev.vertices];
        updatedVertices[vertex1Index] = { ...newVertex1 };
        updatedVertices[vertex2Index] = { ...newVertex2 };
        return {
          ...prev,
          vertices: updatedVertices,
        };
      });
    },
  };
}
