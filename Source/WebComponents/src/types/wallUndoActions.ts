import type { Pole, WallVisibility } from './domain';

export interface LocalAction {
  type: string;
  description: string;
  undo: () => void;
  redo: () => void;
}

export interface PlacePoleAction extends LocalAction {
  type: 'PLACE_POLE';
  poleIndex: number;
  pole: Pole;
}

export interface MovePoleAction extends LocalAction {
  type: 'MOVE_POLE';
  poleIndex: number;
  oldPosition: { x: number; y: number };
  newPosition: { x: number; y: number };
}

export interface InsertPoleAction extends LocalAction {
  type: 'INSERT_POLE';
  poleIndex: number;
  pole: Pole;
}

export interface DeletePoleAction extends LocalAction {
  type: 'DELETE_POLE';
  poleIndices: number[];
  poles: Pole[];
}

export interface MultiMovePoleAction extends LocalAction {
  type: 'MULTI_MOVE_POLE';
  moves: Array<{
    poleIndex: number;
    oldPosition: { x: number; y: number };
    newPosition: { x: number; y: number };
  }>;
}

export interface MoveLineAction extends LocalAction {
  type: 'MOVE_LINE';
  pole1Index: number;
  pole2Index: number;
  oldPole1: { x: number; y: number };
  oldPole2: { x: number; y: number };
  newPole1: { x: number; y: number };
  newPole2: { x: number; y: number };
}

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
