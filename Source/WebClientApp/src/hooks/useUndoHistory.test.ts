import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useUndoHistory, UndoableAction } from './useUndoHistory';

describe('useUndoHistory', () => {
    it('initializes with empty stacks', () => {
        const { result } = renderHook(() => useUndoHistory<UndoableAction>());

        expect(result.current.canUndo).toBe(false);
        expect(result.current.canRedo).toBe(false);
        expect(result.current.undoStackSize).toBe(0);
        expect(result.current.redoStackSize).toBe(0);
    });

    it('pushes actions to undo stack and clears redo stack', () => {
        const { result } = renderHook(() => useUndoHistory<UndoableAction>());
        const action1 = { undo: vi.fn(), redo: vi.fn() };
        const action2 = { undo: vi.fn(), redo: vi.fn() };

        act(() => {
            result.current.push(action1);
        });

        expect(result.current.canUndo).toBe(true);
        expect(result.current.undoStackSize).toBe(1);

        act(() => {
            result.current.undo(); // Move action1 to redo
            result.current.push(action2); // Should clear redo
        });

        expect(result.current.undoStackSize).toBe(1);
        expect(result.current.redoStackSize).toBe(0); // Redo cleared
    });

    it('executes undo logic and moves to redo stack', () => {
        const { result } = renderHook(() => useUndoHistory<UndoableAction>());
        const undoMock = vi.fn();
        const action = { undo: undoMock, redo: vi.fn() };

        act(() => {
            result.current.push(action);
        });

        act(() => {
            result.current.undo();
        });

        expect(undoMock).toHaveBeenCalled();
        expect(result.current.canUndo).toBe(false);
        expect(result.current.canRedo).toBe(true);
        expect(result.current.redoStackSize).toBe(1);
    });

    it('executes redo logic and moves back to undo stack', () => {
        const { result } = renderHook(() => useUndoHistory<UndoableAction>());
        const redoMock = vi.fn();
        const action = { undo: vi.fn(), redo: redoMock };

        act(() => {
            result.current.push(action);
            result.current.undo();
        });

        // Reset mock (undo was called)
        redoMock.mockClear();

        act(() => {
            result.current.redo();
        });

        expect(redoMock).toHaveBeenCalled();
        expect(result.current.canUndo).toBe(true);
        expect(result.current.canRedo).toBe(false);
    });

    it('clears history', () => {
        const { result } = renderHook(() => useUndoHistory<UndoableAction>());
        const action = { undo: vi.fn(), redo: vi.fn() };

        act(() => {
            result.current.push(action);
            result.current.clear();
        });

        expect(result.current.canUndo).toBe(false);
        expect(result.current.canRedo).toBe(false);
        expect(result.current.undoStackSize).toBe(0);
        expect(result.current.redoStackSize).toBe(0);
    });
});
