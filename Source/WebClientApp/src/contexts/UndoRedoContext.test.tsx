import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act } from '@testing-library/react';
import { UndoRedoProvider, useUndoRedoContext } from './UndoRedoContext';
import type { Command } from '@/utils/commands';

const TestComponent = ({ onRender }: { onRender: (context: ReturnType<typeof useUndoRedoContext>) => void }) => {
    const context = useUndoRedoContext();
    onRender(context);
    return null;
};

describe('UndoRedoContext', () => {
    let mockExecute: ReturnType<typeof vi.fn>;
    let mockUndo: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        mockExecute = vi.fn();
        mockUndo = vi.fn();
    });

    const createMockCommand = (id: string): Command => ({
        description: `Command ${id}`,
        execute: mockExecute,
        undo: mockUndo,
    });

    it('provides initial state with no history', () => {
        let context: ReturnType<typeof useUndoRedoContext> | null = null;

        render(
            <UndoRedoProvider>
                <TestComponent onRender={(ctx) => { context = ctx; }} />
            </UndoRedoProvider>
        );

        expect(context).not.toBeNull();
        expect(context?.canUndo).toBe(false);
        expect(context?.canRedo).toBe(false);
    });

    it('executes command and adds to history', () => {
        let context: ReturnType<typeof useUndoRedoContext> | null = null;

        render(
            <UndoRedoProvider>
                <TestComponent onRender={(ctx) => { context = ctx; }} />
            </UndoRedoProvider>
        );

        const command = createMockCommand('1');

        act(() => {
            context?.execute(command);
        });

        expect(mockExecute).toHaveBeenCalledTimes(1);
        expect(context?.canUndo).toBe(true);
        expect(context?.canRedo).toBe(false);
    });

    it('undoes command and moves to future', () => {
        let context: ReturnType<typeof useUndoRedoContext> | null = null;

        render(
            <UndoRedoProvider>
                <TestComponent onRender={(ctx) => { context = ctx; }} />
            </UndoRedoProvider>
        );

        const command = createMockCommand('1');

        act(() => {
            context?.execute(command);
        });

        act(() => {
            context?.undo();
        });

        expect(mockUndo).toHaveBeenCalledTimes(1);
        expect(context?.canUndo).toBe(false);
        expect(context?.canRedo).toBe(true);
    });

    it('redoes command and moves back to past', () => {
        let context: ReturnType<typeof useUndoRedoContext> | null = null;

        render(
            <UndoRedoProvider>
                <TestComponent onRender={(ctx) => { context = ctx; }} />
            </UndoRedoProvider>
        );

        const command = createMockCommand('1');

        act(() => {
            context?.execute(command);
            context?.undo();
        });

        mockExecute.mockClear();

        act(() => {
            context?.redo();
        });

        expect(mockExecute).toHaveBeenCalledTimes(1);
        expect(context?.canUndo).toBe(true);
        expect(context?.canRedo).toBe(false);
    });

    it('clears future when new command executed', () => {
        let context: ReturnType<typeof useUndoRedoContext> | null = null;

        render(
            <UndoRedoProvider>
                <TestComponent onRender={(ctx) => { context = ctx; }} />
            </UndoRedoProvider>
        );

        const command1 = createMockCommand('1');
        const command2 = createMockCommand('2');

        act(() => {
            context?.execute(command1);
            context?.undo();
            context?.execute(command2);
        });

        expect(context?.canUndo).toBe(true);
        expect(context?.canRedo).toBe(false);
    });

    it('limits history size to maxHistorySize', () => {
        let context: ReturnType<typeof useUndoRedoContext> | null = null;

        render(
            <UndoRedoProvider maxHistorySize={3}>
                <TestComponent onRender={(ctx) => { context = ctx; }} />
            </UndoRedoProvider>
        );

        act(() => {
            context?.execute(createMockCommand('1'));
            context?.execute(createMockCommand('2'));
            context?.execute(createMockCommand('3'));
            context?.execute(createMockCommand('4'));
        });

        expect(mockExecute).toHaveBeenCalledTimes(4);

        mockUndo.mockClear();

        act(() => {
            context?.undo();
            context?.undo();
            context?.undo();
        });

        expect(mockUndo).toHaveBeenCalledTimes(3);
        expect(context?.canUndo).toBe(false);
    });

    it('does nothing when undo called with empty past', () => {
        let context: ReturnType<typeof useUndoRedoContext> | null = null;

        render(
            <UndoRedoProvider>
                <TestComponent onRender={(ctx) => { context = ctx; }} />
            </UndoRedoProvider>
        );

        act(() => {
            context?.undo();
        });

        expect(mockUndo).not.toHaveBeenCalled();
        expect(context?.canUndo).toBe(false);
    });

    it('does nothing when redo called with empty future', () => {
        let context: ReturnType<typeof useUndoRedoContext> | null = null;

        render(
            <UndoRedoProvider>
                <TestComponent onRender={(ctx) => { context = ctx; }} />
            </UndoRedoProvider>
        );

        act(() => {
            context?.redo();
        });

        expect(mockExecute).not.toHaveBeenCalled();
        expect(context?.canRedo).toBe(false);
    });

    it('clears all history', () => {
        let context: ReturnType<typeof useUndoRedoContext> | null = null;

        render(
            <UndoRedoProvider>
                <TestComponent onRender={(ctx) => { context = ctx; }} />
            </UndoRedoProvider>
        );

        act(() => {
            context?.execute(createMockCommand('1'));
            context?.execute(createMockCommand('2'));
            context?.undo();
        });

        act(() => {
            context?.clear();
        });

        expect(context?.canUndo).toBe(false);
        expect(context?.canRedo).toBe(false);
    });

    it('throws error when useUndoRedoContext used outside provider', () => {
        expect(() => {
            render(<TestComponent onRender={() => {}} />);
        }).toThrow('useUndoRedoContext must be used within UndoRedoProvider');
    });
});

describe('UndoRedoContext keyboard shortcuts', () => {
    let mockExecute: ReturnType<typeof vi.fn>;
    let mockUndo: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        mockExecute = vi.fn();
        mockUndo = vi.fn();
        Object.defineProperty(navigator, 'platform', {
            writable: true,
            value: 'Win32',
        });
    });

    afterEach(() => {
        Object.defineProperty(navigator, 'platform', {
            writable: true,
            value: '',
        });
    });

    const createMockCommand = (id: string): Command => ({
        description: `Command ${id}`,
        execute: mockExecute,
        undo: mockUndo,
    });

    it('handles Ctrl+Z for undo on Windows', () => {
        let context: ReturnType<typeof useUndoRedoContext> | null = null;

        render(
            <UndoRedoProvider>
                <TestComponent onRender={(ctx) => { context = ctx; }} />
            </UndoRedoProvider>
        );

        act(() => {
            context?.execute(createMockCommand('1'));
        });

        mockUndo.mockClear();

        const event = new KeyboardEvent('keydown', {
            key: 'z',
            ctrlKey: true,
            bubbles: true,
        });

        act(() => {
            window.dispatchEvent(event);
        });

        expect(mockUndo).toHaveBeenCalledTimes(1);
    });

    it('handles Ctrl+Y for redo on Windows', () => {
        let context: ReturnType<typeof useUndoRedoContext> | null = null;

        render(
            <UndoRedoProvider>
                <TestComponent onRender={(ctx) => { context = ctx; }} />
            </UndoRedoProvider>
        );

        act(() => {
            context?.execute(createMockCommand('1'));
            context?.undo();
        });

        mockExecute.mockClear();

        const event = new KeyboardEvent('keydown', {
            key: 'y',
            ctrlKey: true,
            bubbles: true,
        });

        act(() => {
            window.dispatchEvent(event);
        });

        expect(mockExecute).toHaveBeenCalledTimes(1);
    });

    it('handles Ctrl+Shift+Z for redo on Windows', () => {
        let context: ReturnType<typeof useUndoRedoContext> | null = null;

        render(
            <UndoRedoProvider>
                <TestComponent onRender={(ctx) => { context = ctx; }} />
            </UndoRedoProvider>
        );

        act(() => {
            context?.execute(createMockCommand('1'));
            context?.undo();
        });

        mockExecute.mockClear();

        const event = new KeyboardEvent('keydown', {
            key: 'z',
            ctrlKey: true,
            shiftKey: true,
            bubbles: true,
        });

        act(() => {
            window.dispatchEvent(event);
        });

        expect(mockExecute).toHaveBeenCalledTimes(1);
    });

    it('handles Cmd+Z for undo on Mac', () => {
        Object.defineProperty(navigator, 'platform', {
            writable: true,
            value: 'MacIntel',
        });

        let context: ReturnType<typeof useUndoRedoContext> | null = null;

        render(
            <UndoRedoProvider>
                <TestComponent onRender={(ctx) => { context = ctx; }} />
            </UndoRedoProvider>
        );

        act(() => {
            context?.execute(createMockCommand('1'));
        });

        mockUndo.mockClear();

        const event = new KeyboardEvent('keydown', {
            key: 'z',
            metaKey: true,
            bubbles: true,
        });

        act(() => {
            window.dispatchEvent(event);
        });

        expect(mockUndo).toHaveBeenCalledTimes(1);
    });

    it('cleans up event listeners on unmount', () => {
        const { unmount } = render(
            <UndoRedoProvider>
                <TestComponent onRender={() => {}} />
            </UndoRedoProvider>
        );

        const addEventListenerSpy = vi.spyOn(window, 'removeEventListener');

        unmount();

        expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    });
});
