/**
 * Local undo/redo action types for wall placement and editing
 *
 * Part of the transaction-scoped undo system for wall editing mode.
 * Actions are pushed to the local undo stack during active transactions
 * and are cleared when the transaction is committed or rolled back.
 *
 * Lifecycle:
 * 1. User starts placement mode → transaction begins
 * 2. User adds/modifies walls → actions pushed to undo stack
 * 3. User presses Ctrl+Z → undo() executed, action moved to redo stack
 * 4. User presses Ctrl+Y → redo() executed, action moved back to undo stack
 * 5. User commits/cancels → transaction ends, all actions cleared
 *
 * Usage:
 * Factory functions create concrete LocalAction instances with specific
 * undo/redo logic for different wall operations (add, move, delete, etc.).
 */

import type { Pole, WallVisibility } from '@/types/domain';

/**
 * Base interface for local undo/redo actions
 *
 * All wall editing actions must implement this interface to participate
 * in the transaction-scoped undo/redo system.
 */
export interface LocalAction {
  type: string;
  description: string;
  undo: () => void;
  redo: () => void;
}

/**
 * Action for placing a new pole in placement mode
 *
 * Created when the user clicks to add a new pole to the wall.
 * Undo removes the pole, redo restores it.
 */
export interface PlacePoleAction extends LocalAction {
  type: 'PLACE_POLE';
  poleIndex: number;
  pole: Pole;
}

/**
 * Action for moving a pole in edit mode
 *
 * Created when the user drags a pole to a new position.
 * Undo restores the old position, redo applies the new position.
 */
export interface MovePoleAction extends LocalAction {
  type: 'MOVE_POLE';
  poleIndex: number;
  oldPosition: { x: number; y: number };
  newPosition: { x: number; y: number };
}

/**
 * Action for inserting a pole on a line segment in edit mode
 *
 * Created when the user Shift+clicks on a line to insert a pole between two existing poles.
 * Undo removes the inserted pole, redo restores it.
 */
export interface InsertPoleAction extends LocalAction {
  type: 'INSERT_POLE';
  poleIndex: number;
  pole: Pole;
}

/**
 * Action for deleting one or more poles in edit mode
 *
 * Created when the user deletes selected pole(s).
 * Undo restores the deleted poles, redo removes them again.
 */
export interface DeletePoleAction extends LocalAction {
  type: 'DELETE_POLE';
  poleIndices: number[];
  poles: Pole[];
}

/**
 * Action for moving multiple selected poles together in edit mode
 *
 * Created when the user drags multiple selected poles (Ctrl+Click selection + drag).
 * This is a composite action that tracks all pole movements in a single operation.
 * Undo reverts ALL pole positions in one action, redo reapplies ALL movements in one action.
 */
export interface MultiMovePoleAction extends LocalAction {
  type: 'MULTI_MOVE_POLE';
  moves: Array<{
    poleIndex: number;
    oldPosition: { x: number; y: number };
    newPosition: { x: number; y: number };
  }>;
}

/**
 * Action for moving an entire line segment in edit mode
 *
 * Created when the user drags a selected line segment (both pole endpoints move together).
 * Both poles move together maintaining the line geometry and relative distance.
 * Undo restores both pole positions to their original locations,
 * redo reapplies both pole movements.
 */
export interface MoveLineAction extends LocalAction {
  type: 'MOVE_LINE';
  pole1Index: number;
  pole2Index: number;
  oldPole1: { x: number; y: number };
  oldPole2: { x: number; y: number };
  newPole1: { x: number; y: number };
  newPole2: { x: number; y: number };
}

/**
 * Action for breaking a wall segment into two segments in edit mode
 *
 * This is the MOST COMPLEX wall action - created when the user presses Alt+Delete
 * to break a wall segment at a specific pole, splitting it into two separate segments.
 *
 * Breaking a wall:
 * - Takes one wall segment with N poles
 * - Splits it at breakPoleIndex into two new segments
 * - First segment: poles[0...breakPoleIndex]
 * - Second segment: poles[breakPoleIndex...N-1]
 * - Both new segments are open (isClosed = false)
 *
 * Data storage:
 * - originalPoles: Complete pole array BEFORE the break
 * - originalIsClosed: Wall closure state BEFORE the break
 * - segment1Poles/segment2Poles: Resulting pole arrays AFTER the break
 * - segmentTempId: The original segment that was broken (mutable - updated during redo)
 * - currentSegment1TempId/currentSegment2TempId: Current tempIds of resulting segments (mutable)
 * - originalSegment1TempId/originalSegment2TempId: Original tempIds for reference
 *
 * Undo operation:
 * - Removes both new segments (currentSegment1TempId, currentSegment2TempId)
 * - Re-adds the original segment with originalPoles and originalIsClosed
 * - Updates segmentTempId with the new tempId from onAddSegment
 * - Effectively merges the two segments back into one
 *
 * Redo operation:
 * - Removes the merged segment (segmentTempId)
 * - Re-creates both segments with segment1Poles and segment2Poles
 * - Updates currentSegment1TempId and currentSegment2TempId with new tempIds from onAddSegment
 * - Re-applies the wall break
 *
 * Implementation notes:
 * - Requires callbacks to transaction methods (addSegment, removeSegment)
 * - Callbacks are provided by factory function, not stored in this interface
 * - This interface stores only the DATA needed for undo/redo operations
 * - Factory function creates the concrete LocalAction with undo/redo logic
 * - TempIds are mutable to track dynamic IDs across undo/redo cycles
 */
export interface BreakWallAction extends LocalAction {
  type: 'BREAK_WALL';
  segmentTempId: number;
  breakPoleIndex: number;
  originalPoles: Pole[];
  originalIsClosed: boolean;
  currentSegment1TempId: number;
  currentSegment2TempId: number;
  originalSegment1TempId: number;
  originalSegment2TempId: number;
  segment1Poles: Pole[];
  segment2Poles: Pole[];
}

/**
 * Factory function to create a PlacePoleAction
 *
 * Creates a local action for placing a new pole in placement mode.
 * Uses closures to capture callbacks without storing them in the interface.
 *
 * @param poleIndex - Index where the pole was placed
 * @param pole - The pole that was placed
 * @param onPolesChange - Callback to update poles
 * @param getCurrentPoles - Function to get current poles state
 * @param getCurrentIsClosed - Function to get current isClosed state
 * @returns PlacePoleAction with undo/redo implementations
 */
export function createPlacePoleAction(
  poleIndex: number,
  pole: Pole,
  onPolesChange: (poles: Pole[], isClosed?: boolean) => void,
  getCurrentPoles: () => Pole[],
  getCurrentIsClosed: () => boolean,
): PlacePoleAction {
  return {
    type: 'PLACE_POLE',
    description: `Place pole at (${pole.x}, ${pole.y})`,
    poleIndex,
    pole,
    undo: () => {
      const currentPoles = getCurrentPoles();
      const updatedPoles = [...currentPoles];
      updatedPoles.splice(poleIndex, 1);
      onPolesChange(updatedPoles, getCurrentIsClosed());
    },
    redo: () => {
      const currentPoles = getCurrentPoles();
      const updatedPoles = [...currentPoles];
      updatedPoles.splice(poleIndex, 0, pole);
      onPolesChange(updatedPoles, getCurrentIsClosed());
    },
  };
}

/**
 * Factory function to create a MovePoleAction
 *
 * Creates a local action for moving a pole in edit mode.
 * Uses closures to capture callbacks without storing them in the interface.
 *
 * @param poleIndex - Index of the pole being moved
 * @param oldPosition - Original position before move
 * @param newPosition - New position after move
 * @param onPolesChange - Callback to update poles
 * @param getCurrentPoles - Function to get current poles state
 * @param getCurrentIsClosed - Function to get current isClosed state
 * @returns MovePoleAction with undo/redo implementations
 */
export function createMovePoleAction(
  poleIndex: number,
  oldPosition: { x: number; y: number },
  newPosition: { x: number; y: number },
  onPolesChange: (poles: Pole[], isClosed?: boolean) => void,
  getCurrentPoles: () => Pole[],
  getCurrentIsClosed: () => boolean,
): MovePoleAction {
  return {
    type: 'MOVE_POLE',
    description: `Move pole ${poleIndex} from (${oldPosition.x},${oldPosition.y}) to (${newPosition.x},${newPosition.y})`,
    poleIndex,
    oldPosition,
    newPosition,
    undo: () => {
      const currentPoles = getCurrentPoles();
      const updatedPoles = [...currentPoles];
      updatedPoles[poleIndex] = {
        ...oldPosition,
        h: updatedPoles[poleIndex]?.h ?? 0,
      };
      onPolesChange(updatedPoles, getCurrentIsClosed());
    },
    redo: () => {
      const currentPoles = getCurrentPoles();
      const updatedPoles = [...currentPoles];
      updatedPoles[poleIndex] = {
        ...newPosition,
        h: updatedPoles[poleIndex]?.h ?? 0,
      };
      onPolesChange(updatedPoles, getCurrentIsClosed());
    },
  };
}

/**
 * Factory function to create an InsertPoleAction
 *
 * Creates a local action for inserting a pole on a line segment in edit mode.
 * Uses closures to capture callbacks without storing them in the interface.
 *
 * @param poleIndex - Index where the pole was inserted
 * @param pole - The pole that was inserted
 * @param onPolesChange - Callback to update poles
 * @param getCurrentPoles - Function to get current poles state
 * @param getCurrentIsClosed - Function to get current isClosed state
 * @returns InsertPoleAction with undo/redo implementations
 */
export function createInsertPoleAction(
  poleIndex: number,
  pole: Pole,
  onPolesChange: (poles: Pole[], isClosed?: boolean) => void,
  getCurrentPoles: () => Pole[],
  getCurrentIsClosed: () => boolean,
): InsertPoleAction {
  return {
    type: 'INSERT_POLE',
    description: `Insert pole at line ${poleIndex}`,
    poleIndex,
    pole,
    undo: () => {
      const currentPoles = getCurrentPoles();
      const updatedPoles = [...currentPoles];
      updatedPoles.splice(poleIndex, 1);
      onPolesChange(updatedPoles, getCurrentIsClosed());
    },
    redo: () => {
      const currentPoles = getCurrentPoles();
      const updatedPoles = [...currentPoles];
      updatedPoles.splice(poleIndex, 0, pole);
      onPolesChange(updatedPoles, getCurrentIsClosed());
    },
  };
}

/**
 * Factory function to create a DeletePoleAction
 *
 * Creates a local action for deleting one or more poles in edit mode.
 * Uses closures to capture callbacks without storing them in the interface.
 * Handles restoring multiple poles at their original indices during undo.
 *
 * @param poleIndices - Indices of poles that were deleted
 * @param poles - The poles that were deleted
 * @param onPolesChange - Callback to update poles
 * @param getCurrentPoles - Function to get current poles state
 * @param getCurrentIsClosed - Function to get current isClosed state
 * @returns DeletePoleAction with undo/redo implementations
 */
export function createDeletePoleAction(
  poleIndices: number[],
  poles: Pole[],
  onPolesChange: (poles: Pole[], isClosed?: boolean) => void,
  getCurrentPoles: () => Pole[],
  getCurrentIsClosed: () => boolean,
): DeletePoleAction {
  return {
    type: 'DELETE_POLE',
    description: `Delete ${poles.length} pole(s)`,
    poleIndices,
    poles,
    undo: () => {
      const currentPoles = getCurrentPoles();
      const updatedPoles = [...currentPoles];
      const sortedEntries = poleIndices
        .map((index, i) => ({ index, pole: poles[i] as Pole }))
        .sort((a, b) => b.index - a.index);

      for (const entry of sortedEntries) {
        updatedPoles.splice(entry.index, 0, entry.pole);
      }
      onPolesChange(updatedPoles, getCurrentIsClosed());
    },
    redo: () => {
      const currentPoles = getCurrentPoles();
      const updatedPoles = [...currentPoles];
      const sortedIndices = [...poleIndices].sort((a, b) => b - a);

      for (const index of sortedIndices) {
        updatedPoles.splice(index, 1);
      }
      onPolesChange(updatedPoles, getCurrentIsClosed());
    },
  };
}

/**
 * Factory function to create a MultiMovePoleAction
 *
 * Creates a composite local action for moving multiple selected poles together in edit mode.
 * This is used when the user drags multiple selected poles (Ctrl+Click selection + drag).
 * All pole movements are tracked as a single composite action - one undo reverts ALL poles,
 * one redo reapplies ALL movements.
 *
 * Uses closures to capture callbacks without storing them in the interface.
 *
 * @param moves - Array of pole movements with indices and old/new positions
 * @param onPolesChange - Callback to update poles
 * @param getCurrentPoles - Function to get current poles state
 * @param getCurrentIsClosed - Function to get current isClosed state
 * @returns MultiMovePoleAction with undo/redo implementations
 */
export function createMultiMovePoleAction(
  moves: Array<{
    poleIndex: number;
    oldPosition: { x: number; y: number };
    newPosition: { x: number; y: number };
  }>,
  onPolesChange: (poles: Pole[], isClosed?: boolean) => void,
  getCurrentPoles: () => Pole[],
  getCurrentIsClosed: () => boolean,
): MultiMovePoleAction {
  if (moves.length === 0) {
    throw new Error('MultiMovePoleAction: moves array cannot be empty');
  }

  return {
    type: 'MULTI_MOVE_POLE',
    description: `Move ${moves.length} poles together`,
    moves,
    undo: () => {
      const currentPoles = getCurrentPoles();
      const updatedPoles = [...currentPoles];
      for (const move of moves) {
        updatedPoles[move.poleIndex] = {
          ...move.oldPosition,
          h: updatedPoles[move.poleIndex]?.h ?? 0,
        };
      }
      onPolesChange(updatedPoles, getCurrentIsClosed());
    },
    redo: () => {
      const currentPoles = getCurrentPoles();
      const updatedPoles = [...currentPoles];
      for (const move of moves) {
        updatedPoles[move.poleIndex] = {
          ...move.newPosition,
          h: updatedPoles[move.poleIndex]?.h ?? 0,
        };
      }
      onPolesChange(updatedPoles, getCurrentIsClosed());
    },
  };
}

/**
 * Factory function to create a MoveLineAction
 *
 * Creates a local action for moving an entire line segment in edit mode.
 * This is used when the user drags a selected line segment - both pole endpoints
 * move together maintaining the line geometry and relative distance.
 *
 * Uses closures to capture callbacks without storing them in the interface.
 *
 * @param pole1Index - Index of the first pole endpoint
 * @param pole2Index - Index of the second pole endpoint
 * @param oldPole1 - Original position of first pole before move
 * @param oldPole2 - Original position of second pole before move
 * @param newPole1 - New position of first pole after move
 * @param newPole2 - New position of second pole after move
 * @param onPolesChange - Callback to update poles
 * @param getCurrentPoles - Function to get current poles state
 * @param getCurrentIsClosed - Function to get current isClosed state
 * @returns MoveLineAction with undo/redo implementations
 */
export function createMoveLineAction(
  pole1Index: number,
  pole2Index: number,
  oldPole1: { x: number; y: number; h: number },
  oldPole2: { x: number; y: number; h: number },
  newPole1: { x: number; y: number; h: number },
  newPole2: { x: number; y: number; h: number },
  onPolesChange: (poles: Pole[], isClosed?: boolean) => void,
  getCurrentPoles: () => Pole[],
  getCurrentIsClosed: () => boolean,
): MoveLineAction {
  if (pole1Index === pole2Index) {
    throw new Error('MoveLineAction: pole1Index and pole2Index must be different');
  }

  return {
    type: 'MOVE_LINE',
    description: `Move line segment ${pole1Index}`,
    pole1Index,
    pole2Index,
    oldPole1,
    oldPole2,
    newPole1,
    newPole2,
    undo: () => {
      const currentPoles = getCurrentPoles();
      const updatedPoles = [...currentPoles];
      updatedPoles[pole1Index] = { ...updatedPoles[pole1Index], ...oldPole1 };
      updatedPoles[pole2Index] = { ...updatedPoles[pole2Index], ...oldPole2 };
      onPolesChange(updatedPoles, getCurrentIsClosed());
    },
    redo: () => {
      const currentPoles = getCurrentPoles();
      const updatedPoles = [...currentPoles];
      updatedPoles[pole1Index] = { ...updatedPoles[pole1Index], ...newPole1 };
      updatedPoles[pole2Index] = { ...updatedPoles[pole2Index], ...newPole2 };
      onPolesChange(updatedPoles, getCurrentIsClosed());
    },
  };
}

/**
 * Factory function to create a BreakWallAction
 *
 * Creates the MOST COMPLEX local action for breaking a wall segment into two separate segments.
 * This is used when the user presses Alt+Delete to split a wall at a specific pole.
 *
 * Breaking a wall:
 * - Takes one wall segment with N poles
 * - Splits it at breakPoleIndex into two new segments
 * - First segment: poles[0...breakPoleIndex]
 * - Second segment: poles[breakPoleIndex...N-1]
 * - Both new segments are open (isClosed = false)
 *
 * Undo operation:
 * - Removes both new segments (currentSegment1TempId, currentSegment2TempId)
 * - Re-adds the original segment with originalPoles and originalIsClosed
 * - Updates segmentTempId with the new tempId returned from onAddSegment
 * - Effectively merges the two segments back into one
 *
 * Redo operation:
 * - Removes the merged segment (segmentTempId)
 * - Re-creates both segments with segment1Poles and segment2Poles
 * - Updates currentSegment1TempId and currentSegment2TempId with new tempIds from onAddSegment
 * - Re-applies the wall break
 *
 * Uses closures to capture transaction callbacks without storing them in the interface.
 * TempIds are mutable and updated during undo/redo cycles to track dynamic segment IDs.
 *
 * @param segmentTempId - Temporary ID of the original segment that was broken
 * @param breakPoleIndex - Index of the pole where the wall was broken
 * @param originalPoles - Complete pole array BEFORE the break
 * @param originalIsClosed - Wall closure state BEFORE the break
 * @param newSegment1TempId - Temporary ID for the first resulting segment
 * @param newSegment2TempId - Temporary ID for the second resulting segment
 * @param segment1Poles - Pole array for the first resulting segment
 * @param segment2Poles - Pole array for the second resulting segment
 * @param onRemoveSegment - Callback to remove a segment from transaction
 * @param onAddSegment - Callback to add a segment to transaction (returns tempId)
 * @returns BreakWallAction with undo/redo implementations
 */
export function createBreakWallAction(
  segmentTempId: number,
  breakPoleIndex: number,
  originalPoles: Pole[],
  originalIsClosed: boolean,
  originalWallIndex: number,
  newSegment1TempId: number,
  newSegment2TempId: number,
  segment1Poles: Pole[],
  segment2Poles: Pole[],
  wallName: string,
  wallVisibility: WallVisibility,
  wallColor: string | undefined,
  onRemoveSegment: (tempId: number) => void,
  onUpdateSegment: (tempId: number, changes: { wallIndex: number; poles: Pole[]; isClosed: boolean }) => void,
  onAddSegment: (segment: {
    wallIndex: number | null;
    name: string;
    poles: Pole[];
    isClosed: boolean;
    visibility: WallVisibility;
    color: string | undefined;
  }) => number,
): BreakWallAction {
  const action: BreakWallAction = {
    type: 'BREAK_WALL',
    description: `Break wall into 2 segments at pole ${breakPoleIndex}`,
    segmentTempId,
    breakPoleIndex,
    originalPoles: [...originalPoles],
    originalIsClosed,
    currentSegment1TempId: newSegment1TempId,
    currentSegment2TempId: newSegment2TempId,
    originalSegment1TempId: newSegment1TempId,
    originalSegment2TempId: newSegment2TempId,
    segment1Poles: [...segment1Poles],
    segment2Poles: [...segment2Poles],
    undo: () => {
      onRemoveSegment(action.currentSegment2TempId);
      onUpdateSegment(action.currentSegment1TempId, {
        wallIndex: originalWallIndex,
        poles: [...originalPoles],
        isClosed: originalIsClosed,
      });
      action.segmentTempId = action.currentSegment1TempId;
    },
    redo: () => {
      onUpdateSegment(action.segmentTempId, {
        wallIndex: originalWallIndex,
        poles: [...segment1Poles],
        isClosed: false,
      });
      action.currentSegment1TempId = action.segmentTempId;
      action.currentSegment2TempId = onAddSegment({
        wallIndex: null,
        name: wallName,
        poles: [...segment2Poles],
        isClosed: false,
        visibility: wallVisibility,
        color: wallColor,
      });
    },
  };

  return action;
}
