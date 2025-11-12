import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { WallVisibility } from '@/types/domain';
import type { LocalAction } from '@/types/wallUndoActions';
import { useWallTransaction } from './useWallTransaction';

describe('useWallTransaction - Local Undo/Redo', () => {
  describe('pushLocalAction', () => {
    it('should add action to undo stack', () => {
      const { result } = renderHook(() => useWallTransaction());
      const mockAction: LocalAction = {
        type: 'TEST_ACTION',
        description: 'Test action',
        undo: vi.fn(),
        redo: vi.fn(),
      };

      act(() => {
        result.current.startTransaction('placement');
      });

      act(() => {
        result.current.pushLocalAction(mockAction);
      });

      expect(result.current.transaction.localUndoStack).toHaveLength(1);
      expect(result.current.transaction.localUndoStack[0]).toBe(mockAction);
    });

    it('should clear redo stack when new action is pushed', () => {
      const { result } = renderHook(() => useWallTransaction());
      const action1: LocalAction = {
        type: 'ACTION_1',
        description: 'Action 1',
        undo: vi.fn(),
        redo: vi.fn(),
      };
      const action2: LocalAction = {
        type: 'ACTION_2',
        description: 'Action 2',
        undo: vi.fn(),
        redo: vi.fn(),
      };
      const action3: LocalAction = {
        type: 'ACTION_3',
        description: 'Action 3',
        undo: vi.fn(),
        redo: vi.fn(),
      };

      act(() => {
        result.current.startTransaction('placement');
      });

      act(() => {
        result.current.pushLocalAction(action1);
        result.current.pushLocalAction(action2);
      });

      act(() => {
        result.current.undoLocal();
      });

      expect(result.current.transaction.localRedoStack).toHaveLength(1);

      act(() => {
        result.current.pushLocalAction(action3);
      });

      expect(result.current.transaction.localRedoStack).toHaveLength(0);
      expect(result.current.transaction.localUndoStack).toHaveLength(2);
    });

    it('should increase undo stack length correctly with multiple actions', () => {
      const { result } = renderHook(() => useWallTransaction());
      const actions: LocalAction[] = [
        {
          type: 'ACTION_1',
          description: 'Action 1',
          undo: vi.fn(),
          redo: vi.fn(),
        },
        {
          type: 'ACTION_2',
          description: 'Action 2',
          undo: vi.fn(),
          redo: vi.fn(),
        },
        {
          type: 'ACTION_3',
          description: 'Action 3',
          undo: vi.fn(),
          redo: vi.fn(),
        },
      ];

      act(() => {
        result.current.startTransaction('placement');
      });

      act(() => {
        for (const action of actions) {
          result.current.pushLocalAction(action);
        }
      });

      expect(result.current.transaction.localUndoStack).toHaveLength(3);
    });
  });

  describe('undoLocal', () => {
    it('should return silently when undo stack is empty', () => {
      const { result } = renderHook(() => useWallTransaction());

      act(() => {
        result.current.startTransaction('placement');
      });

      act(() => {
        result.current.undoLocal();
      });

      expect(result.current.transaction.localUndoStack).toHaveLength(0);
      expect(result.current.transaction.localRedoStack).toHaveLength(0);
    });

    it('should call action.undo() when action exists', () => {
      const { result } = renderHook(() => useWallTransaction());
      const undoFn = vi.fn();
      const mockAction: LocalAction = {
        type: 'TEST_ACTION',
        description: 'Test action',
        undo: undoFn,
        redo: vi.fn(),
      };

      act(() => {
        result.current.startTransaction('placement');
      });

      act(() => {
        result.current.pushLocalAction(mockAction);
      });

      act(() => {
        result.current.undoLocal();
      });

      expect(undoFn).toHaveBeenCalledTimes(1);
    });

    it('should move action from undo stack to redo stack', () => {
      const { result } = renderHook(() => useWallTransaction());
      const mockAction: LocalAction = {
        type: 'TEST_ACTION',
        description: 'Test action',
        undo: vi.fn(),
        redo: vi.fn(),
      };

      act(() => {
        result.current.startTransaction('placement');
      });

      act(() => {
        result.current.pushLocalAction(mockAction);
      });

      expect(result.current.transaction.localUndoStack).toHaveLength(1);
      expect(result.current.transaction.localRedoStack).toHaveLength(0);

      act(() => {
        result.current.undoLocal();
      });

      expect(result.current.transaction.localUndoStack).toHaveLength(0);
      expect(result.current.transaction.localRedoStack).toHaveLength(1);
      expect(result.current.transaction.localRedoStack[0]).toBe(mockAction);
    });

    it('should make canUndoLocal return false after undo on single action', () => {
      const { result } = renderHook(() => useWallTransaction());
      const mockAction: LocalAction = {
        type: 'TEST_ACTION',
        description: 'Test action',
        undo: vi.fn(),
        redo: vi.fn(),
      };

      act(() => {
        result.current.startTransaction('placement');
      });

      act(() => {
        result.current.pushLocalAction(mockAction);
      });

      expect(result.current.canUndoLocal()).toBe(true);

      act(() => {
        result.current.undoLocal();
      });

      expect(result.current.canUndoLocal()).toBe(false);
    });

    it('should undo actions in LIFO order', () => {
      const { result } = renderHook(() => useWallTransaction());
      const callOrder: string[] = [];
      const action1: LocalAction = {
        type: 'ACTION_1',
        description: 'Action 1',
        undo: () => callOrder.push('undo1'),
        redo: vi.fn(),
      };
      const action2: LocalAction = {
        type: 'ACTION_2',
        description: 'Action 2',
        undo: () => callOrder.push('undo2'),
        redo: vi.fn(),
      };
      const action3: LocalAction = {
        type: 'ACTION_3',
        description: 'Action 3',
        undo: () => callOrder.push('undo3'),
        redo: vi.fn(),
      };

      act(() => {
        result.current.startTransaction('placement');
      });

      act(() => {
        result.current.pushLocalAction(action1);
        result.current.pushLocalAction(action2);
        result.current.pushLocalAction(action3);
      });

      act(() => {
        result.current.undoLocal();
      });

      expect(callOrder).toEqual(['undo3']);

      act(() => {
        result.current.undoLocal();
      });

      expect(callOrder).toEqual(['undo3', 'undo2']);

      act(() => {
        result.current.undoLocal();
      });

      expect(callOrder).toEqual(['undo3', 'undo2', 'undo1']);
    });
  });

  describe('redoLocal', () => {
    it('should return silently when redo stack is empty', () => {
      const { result } = renderHook(() => useWallTransaction());

      act(() => {
        result.current.startTransaction('placement');
      });

      act(() => {
        result.current.redoLocal();
      });

      expect(result.current.transaction.localUndoStack).toHaveLength(0);
      expect(result.current.transaction.localRedoStack).toHaveLength(0);
    });

    it('should call action.redo() when action exists', () => {
      const { result } = renderHook(() => useWallTransaction());
      const redoFn = vi.fn();
      const mockAction: LocalAction = {
        type: 'TEST_ACTION',
        description: 'Test action',
        undo: vi.fn(),
        redo: redoFn,
      };

      act(() => {
        result.current.startTransaction('placement');
      });

      act(() => {
        result.current.pushLocalAction(mockAction);
      });

      act(() => {
        result.current.undoLocal();
      });

      act(() => {
        result.current.redoLocal();
      });

      expect(redoFn).toHaveBeenCalledTimes(1);
    });

    it('should move action from redo stack to undo stack', () => {
      const { result } = renderHook(() => useWallTransaction());
      const mockAction: LocalAction = {
        type: 'TEST_ACTION',
        description: 'Test action',
        undo: vi.fn(),
        redo: vi.fn(),
      };

      act(() => {
        result.current.startTransaction('placement');
      });

      act(() => {
        result.current.pushLocalAction(mockAction);
      });

      act(() => {
        result.current.undoLocal();
      });

      expect(result.current.transaction.localUndoStack).toHaveLength(0);
      expect(result.current.transaction.localRedoStack).toHaveLength(1);

      act(() => {
        result.current.redoLocal();
      });

      expect(result.current.transaction.localUndoStack).toHaveLength(1);
      expect(result.current.transaction.localRedoStack).toHaveLength(0);
      expect(result.current.transaction.localUndoStack[0]).toBe(mockAction);
    });

    it('should make canRedoLocal return false after redo on single action', () => {
      const { result } = renderHook(() => useWallTransaction());
      const mockAction: LocalAction = {
        type: 'TEST_ACTION',
        description: 'Test action',
        undo: vi.fn(),
        redo: vi.fn(),
      };

      act(() => {
        result.current.startTransaction('placement');
      });

      act(() => {
        result.current.pushLocalAction(mockAction);
      });

      act(() => {
        result.current.undoLocal();
      });

      expect(result.current.canRedoLocal()).toBe(true);

      act(() => {
        result.current.redoLocal();
      });

      expect(result.current.canRedoLocal()).toBe(false);
    });

    it('should redo actions in LIFO order', () => {
      const { result } = renderHook(() => useWallTransaction());
      const callOrder: string[] = [];
      const action1: LocalAction = {
        type: 'ACTION_1',
        description: 'Action 1',
        undo: vi.fn(),
        redo: () => callOrder.push('redo1'),
      };
      const action2: LocalAction = {
        type: 'ACTION_2',
        description: 'Action 2',
        undo: vi.fn(),
        redo: () => callOrder.push('redo2'),
      };
      const action3: LocalAction = {
        type: 'ACTION_3',
        description: 'Action 3',
        undo: vi.fn(),
        redo: () => callOrder.push('redo3'),
      };

      act(() => {
        result.current.startTransaction('placement');
      });

      act(() => {
        result.current.pushLocalAction(action1);
        result.current.pushLocalAction(action2);
        result.current.pushLocalAction(action3);
      });

      act(() => {
        result.current.undoLocal();
        result.current.undoLocal();
        result.current.undoLocal();
      });

      act(() => {
        result.current.redoLocal();
      });

      expect(callOrder).toEqual(['redo1']);

      act(() => {
        result.current.redoLocal();
      });

      expect(callOrder).toEqual(['redo1', 'redo2']);

      act(() => {
        result.current.redoLocal();
      });

      expect(callOrder).toEqual(['redo1', 'redo2', 'redo3']);
    });
  });

  describe('canUndoLocal', () => {
    it('should return false when undo stack is empty', () => {
      const { result } = renderHook(() => useWallTransaction());

      act(() => {
        result.current.startTransaction('placement');
      });

      expect(result.current.canUndoLocal()).toBe(false);
    });

    it('should return true when undo stack has actions', () => {
      const { result } = renderHook(() => useWallTransaction());
      const mockAction: LocalAction = {
        type: 'TEST_ACTION',
        description: 'Test action',
        undo: vi.fn(),
        redo: vi.fn(),
      };

      act(() => {
        result.current.startTransaction('placement');
      });

      act(() => {
        result.current.pushLocalAction(mockAction);
      });

      expect(result.current.canUndoLocal()).toBe(true);
    });

    it('should return true when multiple actions are in undo stack', () => {
      const { result } = renderHook(() => useWallTransaction());
      const actions: LocalAction[] = [
        {
          type: 'ACTION_1',
          description: 'Action 1',
          undo: vi.fn(),
          redo: vi.fn(),
        },
        {
          type: 'ACTION_2',
          description: 'Action 2',
          undo: vi.fn(),
          redo: vi.fn(),
        },
      ];

      act(() => {
        result.current.startTransaction('placement');
      });

      act(() => {
        for (const action of actions) {
          result.current.pushLocalAction(action);
        }
      });

      expect(result.current.canUndoLocal()).toBe(true);
    });
  });

  describe('canRedoLocal', () => {
    it('should return false when redo stack is empty', () => {
      const { result } = renderHook(() => useWallTransaction());

      act(() => {
        result.current.startTransaction('placement');
      });

      expect(result.current.canRedoLocal()).toBe(false);
    });

    it('should return true when redo stack has actions', () => {
      const { result } = renderHook(() => useWallTransaction());
      const mockAction: LocalAction = {
        type: 'TEST_ACTION',
        description: 'Test action',
        undo: vi.fn(),
        redo: vi.fn(),
      };

      act(() => {
        result.current.startTransaction('placement');
      });

      act(() => {
        result.current.pushLocalAction(mockAction);
      });

      act(() => {
        result.current.undoLocal();
      });

      expect(result.current.canRedoLocal()).toBe(true);
    });

    it('should return true when multiple actions are in redo stack', () => {
      const { result } = renderHook(() => useWallTransaction());
      const actions: LocalAction[] = [
        {
          type: 'ACTION_1',
          description: 'Action 1',
          undo: vi.fn(),
          redo: vi.fn(),
        },
        {
          type: 'ACTION_2',
          description: 'Action 2',
          undo: vi.fn(),
          redo: vi.fn(),
        },
      ];

      act(() => {
        result.current.startTransaction('placement');
      });

      act(() => {
        for (const action of actions) {
          result.current.pushLocalAction(action);
        }
      });

      act(() => {
        result.current.undoLocal();
        result.current.undoLocal();
      });

      expect(result.current.canRedoLocal()).toBe(true);
    });
  });

  describe('removeSegment', () => {
    it('should remove segment by tempId correctly', () => {
      const { result } = renderHook(() => useWallTransaction());
      const mockWall = {
        index: 1,
        name: 'Wall 1',
        poles: [{ x: 0, y: 0, h: 10 }],
        isClosed: false,
        visibility: WallVisibility.Normal,
        material: undefined,
        color: '#808080',
      };

      act(() => {
        result.current.startTransaction('editing', mockWall);
      });

      const initialTempId = result.current.transaction.segments[0]?.tempId;

      let tempId1: number;
      act(() => {
        tempId1 = result.current.addSegment({
          wallIndex: null,
          name: 'Segment 1',
          poles: [{ x: 10, y: 10, h: 10 }],
          isClosed: false,
          visibility: WallVisibility.Normal,
        });
      });

      let tempId2: number;
      act(() => {
        tempId2 = result.current.addSegment({
          wallIndex: null,
          name: 'Segment 2',
          poles: [{ x: 20, y: 20, h: 10 }],
          isClosed: false,
          visibility: WallVisibility.Normal,
        });
      });

      expect(result.current.transaction.segments).toHaveLength(3);

      act(() => {
        result.current.removeSegment(tempId1);
      });

      expect(result.current.transaction.segments).toHaveLength(2);
      expect(result.current.transaction.segments.find((s) => s.tempId === tempId1)).toBeUndefined();
      expect(result.current.transaction.segments.find((s) => s.tempId === tempId2)).toBeDefined();
      expect(result.current.transaction.segments.find((s) => s.tempId === initialTempId)).toBeDefined();
    });

    it('should not affect other segments', () => {
      const { result } = renderHook(() => useWallTransaction());
      const mockWall = {
        index: 1,
        name: 'Wall 1',
        poles: [{ x: 0, y: 0, h: 10 }],
        isClosed: false,
        visibility: WallVisibility.Normal,
        material: undefined,
        color: '#808080',
      };

      act(() => {
        result.current.startTransaction('editing', mockWall);
      });

      let tempId1: number;
      act(() => {
        tempId1 = result.current.addSegment({
          wallIndex: null,
          name: 'Segment 1',
          poles: [{ x: 10, y: 10, h: 10 }],
          isClosed: false,
          visibility: WallVisibility.Normal,
        });
      });

      let tempId2: number;
      act(() => {
        tempId2 = result.current.addSegment({
          wallIndex: null,
          name: 'Segment 2',
          poles: [{ x: 20, y: 20, h: 10 }],
          isClosed: false,
          visibility: WallVisibility.Normal,
        });
      });

      const segment2Before = result.current.transaction.segments.find((s) => s.tempId === tempId2);

      act(() => {
        result.current.removeSegment(tempId1);
      });

      const segment2After = result.current.transaction.segments.find((s) => s.tempId === tempId2);

      expect(segment2After).toEqual(segment2Before);
    });

    it('should return new segments array', () => {
      const { result } = renderHook(() => useWallTransaction());
      const mockWall = {
        index: 1,
        name: 'Wall 1',
        poles: [{ x: 0, y: 0, h: 10 }],
        isClosed: false,
        visibility: WallVisibility.Normal,
        material: undefined,
        color: '#808080',
      };

      act(() => {
        result.current.startTransaction('editing', mockWall);
      });

      let tempId: number;
      act(() => {
        tempId = result.current.addSegment({
          wallIndex: null,
          name: 'Segment 1',
          poles: [{ x: 10, y: 10, h: 10 }],
          isClosed: false,
          visibility: WallVisibility.Normal,
        });
      });

      const segmentsBefore = result.current.transaction.segments;

      act(() => {
        result.current.removeSegment(tempId);
      });

      const segmentsAfter = result.current.transaction.segments;

      expect(segmentsAfter).not.toBe(segmentsBefore);
    });
  });

  describe('Integration scenarios', () => {
    it('should handle push -> undo -> redo -> undo cycle', () => {
      const { result } = renderHook(() => useWallTransaction());
      const callOrder: string[] = [];
      const mockAction: LocalAction = {
        type: 'TEST_ACTION',
        description: 'Test action',
        undo: () => callOrder.push('undo'),
        redo: () => callOrder.push('redo'),
      };

      act(() => {
        result.current.startTransaction('placement');
      });

      act(() => {
        result.current.pushLocalAction(mockAction);
      });

      expect(result.current.canUndoLocal()).toBe(true);
      expect(result.current.canRedoLocal()).toBe(false);

      act(() => {
        result.current.undoLocal();
      });

      expect(result.current.canUndoLocal()).toBe(false);
      expect(result.current.canRedoLocal()).toBe(true);
      expect(callOrder).toEqual(['undo']);

      act(() => {
        result.current.redoLocal();
      });

      expect(result.current.canUndoLocal()).toBe(true);
      expect(result.current.canRedoLocal()).toBe(false);
      expect(callOrder).toEqual(['undo', 'redo']);

      act(() => {
        result.current.undoLocal();
      });

      expect(result.current.canUndoLocal()).toBe(false);
      expect(result.current.canRedoLocal()).toBe(true);
      expect(callOrder).toEqual(['undo', 'redo', 'undo']);
    });

    it('should handle push multiple -> undo all -> redo all', () => {
      const { result } = renderHook(() => useWallTransaction());
      const callOrder: string[] = [];
      const actions: LocalAction[] = [
        {
          type: 'ACTION_1',
          description: 'Action 1',
          undo: () => callOrder.push('undo1'),
          redo: () => callOrder.push('redo1'),
        },
        {
          type: 'ACTION_2',
          description: 'Action 2',
          undo: () => callOrder.push('undo2'),
          redo: () => callOrder.push('redo2'),
        },
        {
          type: 'ACTION_3',
          description: 'Action 3',
          undo: () => callOrder.push('undo3'),
          redo: () => callOrder.push('redo3'),
        },
      ];

      act(() => {
        result.current.startTransaction('placement');
      });

      act(() => {
        for (const action of actions) {
          result.current.pushLocalAction(action);
        }
      });

      expect(result.current.transaction.localUndoStack).toHaveLength(3);

      act(() => {
        result.current.undoLocal();
        result.current.undoLocal();
        result.current.undoLocal();
      });

      expect(result.current.transaction.localUndoStack).toHaveLength(0);
      expect(result.current.transaction.localRedoStack).toHaveLength(3);
      expect(callOrder).toEqual(['undo3', 'undo2', 'undo1']);

      callOrder.length = 0;

      act(() => {
        result.current.redoLocal();
        result.current.redoLocal();
        result.current.redoLocal();
      });

      expect(result.current.transaction.localUndoStack).toHaveLength(3);
      expect(result.current.transaction.localRedoStack).toHaveLength(0);
      expect(callOrder).toEqual(['redo1', 'redo2', 'redo3']);
    });

    it('should clear redo stack when push after undo', () => {
      const { result } = renderHook(() => useWallTransaction());
      const actions: LocalAction[] = [
        {
          type: 'ACTION_1',
          description: 'Action 1',
          undo: vi.fn(),
          redo: vi.fn(),
        },
        {
          type: 'ACTION_2',
          description: 'Action 2',
          undo: vi.fn(),
          redo: vi.fn(),
        },
        {
          type: 'ACTION_3',
          description: 'Action 3',
          undo: vi.fn(),
          redo: vi.fn(),
        },
      ];

      act(() => {
        result.current.startTransaction('placement');
      });

      const [action1, action2, action3] = actions;

      act(() => {
        if (action1) result.current.pushLocalAction(action1);
        if (action2) result.current.pushLocalAction(action2);
      });

      act(() => {
        result.current.undoLocal();
      });

      expect(result.current.transaction.localUndoStack).toHaveLength(1);
      expect(result.current.transaction.localRedoStack).toHaveLength(1);

      act(() => {
        if (action3) result.current.pushLocalAction(action3);
      });

      expect(result.current.transaction.localUndoStack).toHaveLength(2);
      expect(result.current.transaction.localRedoStack).toHaveLength(0);
      expect(result.current.canRedoLocal()).toBe(false);
    });

    it('should maintain state consistency across multiple cycles', () => {
      const { result } = renderHook(() => useWallTransaction());
      const state = { value: 0 };
      const action1: LocalAction = {
        type: 'INCREMENT',
        description: 'Increment',
        undo: () => {
          state.value--;
        },
        redo: () => {
          state.value++;
        },
      };
      const action2: LocalAction = {
        type: 'INCREMENT',
        description: 'Increment',
        undo: () => {
          state.value--;
        },
        redo: () => {
          state.value++;
        },
      };

      act(() => {
        result.current.startTransaction('placement');
      });

      act(() => {
        state.value++;
        result.current.pushLocalAction(action1);
      });
      expect(state.value).toBe(1);

      act(() => {
        state.value++;
        result.current.pushLocalAction(action2);
      });
      expect(state.value).toBe(2);

      act(() => {
        result.current.undoLocal();
      });
      expect(state.value).toBe(1);

      act(() => {
        result.current.undoLocal();
      });
      expect(state.value).toBe(0);

      act(() => {
        result.current.redoLocal();
      });
      expect(state.value).toBe(1);

      act(() => {
        result.current.redoLocal();
      });
      expect(state.value).toBe(2);
    });

    it('should clear both stacks when transaction is rolled back', () => {
      const { result } = renderHook(() => useWallTransaction());
      const mockAction: LocalAction = {
        type: 'TEST_ACTION',
        description: 'Test action',
        undo: vi.fn(),
        redo: vi.fn(),
      };

      act(() => {
        result.current.startTransaction('placement');
      });

      act(() => {
        result.current.pushLocalAction(mockAction);
      });

      act(() => {
        result.current.undoLocal();
      });

      expect(result.current.transaction.localUndoStack).toHaveLength(0);
      expect(result.current.transaction.localRedoStack).toHaveLength(1);

      act(() => {
        result.current.rollbackTransaction();
      });

      expect(result.current.transaction.localUndoStack).toHaveLength(0);
      expect(result.current.transaction.localRedoStack).toHaveLength(0);
      expect(result.current.transaction.isActive).toBe(false);
    });
  });
});
