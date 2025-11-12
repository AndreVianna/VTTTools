/**
 * Local undo/redo action types for region placement and editing
 *
 * Part of the transaction-scoped undo system for region editing mode.
 * Actions are pushed to the local undo stack during active transactions
 * and are cleared when the transaction is committed or rolled back.
 *
 * Lifecycle:
 * 1. User starts placement mode → transaction begins
 * 2. User adds/modifies vertices → actions pushed to undo stack
 * 3. User presses Ctrl+Z → undo() executed, action moved to redo stack
 * 4. User presses Ctrl+Y → redo() executed, action moved back to undo stack
 * 5. User commits/cancels → transaction ends, all actions cleared
 *
 * Usage:
 * Factory functions create concrete LocalAction instances with specific
 * undo/redo logic for different region operations (add, move, delete, etc.).
 */

import type { RegionSegment } from '@/hooks/useRegionTransaction';
import type { Point } from '@/types/domain';

/**
 * Base interface for local undo/redo actions
 *
 * All region editing actions must implement this interface to participate
 * in the transaction-scoped undo/redo system.
 */
export interface LocalAction {
  type: string;
  description: string;
  undo: () => void;
  redo: () => void;
}

/**
 * Action for placing a new vertex in placement mode
 *
 * Created when the user clicks to add a new vertex to the region.
 * Undo removes the vertex, redo restores it.
 * Regions are always closed polygons requiring minimum 3 vertices.
 */
export interface PlaceVertexAction extends LocalAction {
  type: 'PLACE_VERTEX';
  vertexIndex: number;
  vertex: Point;
}

/**
 * Action for moving a vertex in edit mode
 *
 * Created when the user drags a vertex to a new position.
 * Undo restores the old position, redo applies the new position.
 */
export interface MoveVertexAction extends LocalAction {
  type: 'MOVE_VERTEX';
  vertexIndex: number;
  oldVertex: Point;
  newVertex: Point;
}

/**
 * Action for inserting a vertex on a line segment in edit mode
 *
 * Created when the user Shift+clicks on a line to insert a vertex between two existing vertices.
 * Undo removes the inserted vertex, redo restores it.
 */
export interface InsertVertexAction extends LocalAction {
  type: 'INSERT_VERTEX';
  insertIndex: number;
  vertex: Point;
}

/**
 * Action for deleting a vertex in edit mode
 *
 * Created when the user deletes a vertex.
 * Undo restores the deleted vertex, redo removes it again.
 * Validates minimum 3 vertices constraint - cannot undo deletion if it would create less than 3 vertices.
 */
export interface DeleteVertexAction extends LocalAction {
  type: 'DELETE_VERTEX';
  deletedIndex: number;
  deletedVertex: Point;
}

/**
 * Action for moving multiple selected vertices together in edit mode
 *
 * Created when the user drags multiple selected vertices (Ctrl+Click selection + drag).
 * This is a composite action that tracks all vertex movements in a single operation.
 * Undo reverts ALL vertex positions in one action, redo reapplies ALL movements in one action.
 */
export interface MultiMoveVertexAction extends LocalAction {
  type: 'MULTI_MOVE_VERTEX';
  moves: Array<{
    vertexIndex: number;
    oldVertex: Point;
    newVertex: Point;
  }>;
}

/**
 * Action for moving an entire line segment in edit mode
 *
 * Created when the user drags a selected line segment (both vertex endpoints move together).
 * Both vertices move together maintaining the line geometry and relative distance.
 * Undo restores both vertex positions to their original locations,
 * redo reapplies both vertex movements.
 */
export interface MoveLineAction extends LocalAction {
  type: 'MOVE_LINE';
  lineIndex: number;
  vertex1Index: number;
  vertex2Index: number;
  oldVertex1: Point;
  oldVertex2: Point;
  newVertex1: Point;
  newVertex2: Point;
}

/**
 * Factory function to create a PlaceVertexAction
 *
 * Creates a local action for placing a new vertex in placement mode.
 * Uses closures to capture callbacks without storing them in the interface.
 *
 * @param getSegment - Function to get current segment state
 * @param setSegment - Callback to update segment with an updater function
 * @returns PlaceVertexAction with undo/redo implementations
 *
 * @example
 * const action = createPlaceVertexAction(
 *     () => transaction.segment,
 *     (updater) => setSegment(updater)
 * );
 * action.redo();
 */
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

/**
 * Factory function to create a MoveVertexAction
 *
 * Creates a local action for moving a vertex in edit mode.
 * Uses closures to capture callbacks without storing them in the interface.
 *
 * @param vertexIndex - Index of the vertex being moved
 * @param oldVertex - Original position before move
 * @param newVertex - New position after move
 * @param getSegment - Function to get current segment state
 * @param setSegment - Callback to update segment with an updater function
 * @returns MoveVertexAction with undo/redo implementations
 *
 * @example
 * const action = createMoveVertexAction(
 *     2,
 *     { x: 100, y: 100 },
 *     { x: 150, y: 150 },
 *     () => transaction.segment,
 *     (updater) => setSegment(updater)
 * );
 * action.undo();
 */
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

/**
 * Factory function to create an InsertVertexAction
 *
 * Creates a local action for inserting a vertex on a line segment in edit mode.
 * Uses closures to capture callbacks without storing them in the interface.
 *
 * @param insertIndex - Index where the vertex was inserted
 * @param vertex - The vertex that was inserted
 * @param getSegment - Function to get current segment state
 * @param setSegment - Callback to update segment with an updater function
 * @returns InsertVertexAction with undo/redo implementations
 *
 * @example
 * const action = createInsertVertexAction(
 *     2,
 *     { x: 125, y: 125 },
 *     () => transaction.segment,
 *     (updater) => setSegment(updater)
 * );
 * action.redo();
 */
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

/**
 * Factory function to create a DeleteVertexAction
 *
 * Creates a local action for deleting a vertex in edit mode.
 * Uses closures to capture callbacks without storing them in the interface.
 * Validates minimum 3 vertices constraint.
 *
 * @param deletedIndex - Index of vertex that was deleted
 * @param deletedVertex - The vertex that was deleted
 * @param getSegment - Function to get current segment state
 * @param setSegment - Callback to update segment with an updater function
 * @returns DeleteVertexAction with undo/redo implementations
 *
 * @example
 * const action = createDeleteVertexAction(
 *     2,
 *     { x: 125, y: 125 },
 *     () => transaction.segment,
 *     (updater) => setSegment(updater)
 * );
 * action.undo();
 */
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

/**
 * Factory function to create a MultiMoveVertexAction
 *
 * Creates a composite local action for moving multiple selected vertices together in edit mode.
 * This is used when the user drags multiple selected vertices (Ctrl+Click selection + drag).
 * All vertex movements are tracked as a single composite action - one undo reverts ALL vertices,
 * one redo reapplies ALL movements.
 *
 * Uses closures to capture callbacks without storing them in the interface.
 *
 * @param vertexIndices - Indices of vertices being moved
 * @param oldVertices - Original positions before move
 * @param newVertices - New positions after move
 * @param getSegment - Function to get current segment state
 * @param setSegment - Callback to update segment with an updater function
 * @returns MultiMoveVertexAction with undo/redo implementations
 *
 * @example
 * const action = createMultiMoveVertexAction(
 *     [0, 2, 4],
 *     [{ x: 100, y: 100 }, { x: 200, y: 200 }, { x: 300, y: 300 }],
 *     [{ x: 110, y: 110 }, { x: 210, y: 210 }, { x: 310, y: 310 }],
 *     () => transaction.segment,
 *     (updater) => setSegment(updater)
 * );
 * action.redo();
 */
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

/**
 * Factory function to create a MoveLineAction
 *
 * Creates a local action for moving an entire line segment in edit mode.
 * This is used when the user drags a selected line segment - both vertex endpoints
 * move together maintaining the line geometry and relative distance.
 *
 * Uses closures to capture callbacks without storing them in the interface.
 *
 * @param lineIndex - Index of the line segment being moved
 * @param oldVertex1 - Original position of first vertex before move
 * @param oldVertex2 - Original position of second vertex before move
 * @param newVertex1 - New position of first vertex after move
 * @param newVertex2 - New position of second vertex after move
 * @param getSegment - Function to get current segment state
 * @param setSegment - Callback to update segment with an updater function
 * @returns MoveLineAction with undo/redo implementations
 *
 * @example
 * const action = createMoveLineAction(
 *     2,
 *     { x: 100, y: 100 },
 *     { x: 200, y: 100 },
 *     { x: 110, y: 110 },
 *     { x: 210, y: 110 },
 *     () => transaction.segment,
 *     (updater) => setSegment(updater)
 * );
 * action.undo();
 */
export function createMoveLineAction(
  lineIndex: number,
  oldVertex1: Point,
  oldVertex2: Point,
  newVertex1: Point,
  newVertex2: Point,
  _getSegment: () => RegionSegment | null,
  setSegment: (updater: (prev: RegionSegment) => RegionSegment) => void,
): MoveLineAction {
  const segment = _getSegment();
  if (!segment) {
    throw new Error('createMoveLineAction: segment is null');
  }

  const vertex1Index = lineIndex;
  const vertex2Index = (lineIndex + 1) % segment.vertices.length;

  if (vertex1Index === vertex2Index) {
    throw new Error('createMoveLineAction: vertex1Index and vertex2Index must be different');
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
