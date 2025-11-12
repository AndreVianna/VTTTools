import { act, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Command } from '@/utils/commands';
import { UndoRedoProvider, useUndoRedoContext } from './UndoRedoContext';

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
    undo: () => {
      mockUndo();
      return Promise.resolve();
    },
  });

  it('provides initial state with no history', () => {
    let context: ReturnType<typeof useUndoRedoContext> | null = null;

    render(
      <UndoRedoProvider>
        <TestComponent
          onRender={(ctx) => {
            context = ctx;
          }}
        />
      </UndoRedoProvider>,
    );

    expect(context).not.toBeNull();
    expect(context?.canUndo).toBe(false);
    expect(context?.canRedo).toBe(false);
  });

  it('executes command and adds to history', () => {
    let context: ReturnType<typeof useUndoRedoContext> | null = null;

    render(
      <UndoRedoProvider>
        <TestComponent
          onRender={(ctx) => {
            context = ctx;
          }}
        />
      </UndoRedoProvider>,
    );

    const command = createMockCommand('1');

    act(() => {
      context?.execute(command);
    });

    expect(mockExecute).toHaveBeenCalledTimes(1);
    expect(context).not.toBeNull();
    expect(context?.canUndo).toBe(true);
    expect(context?.canRedo).toBe(false);
  });

  it.skip('undoes command and moves to future - TODO: Fix async test handling', async () => {
    let context: ReturnType<typeof useUndoRedoContext> | null = null;

    render(
      <UndoRedoProvider>
        <TestComponent
          onRender={(ctx) => {
            context = ctx;
          }}
        />
      </UndoRedoProvider>,
    );

    const command = createMockCommand('1');

    act(() => {
      context?.execute(command);
    });

    expect(context).not.toBeNull();
    expect(context?.canUndo).toBe(true);
    expect(context?.canRedo).toBe(false);

    await act(async () => {
      const undoPromise = context?.undo();
      await undoPromise;
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(context?.canUndo).toBe(false);
    expect(context?.canRedo).toBe(true);
    expect(mockUndo).toHaveBeenCalledTimes(1);
  });

  it.skip('redoes command and moves back to past - TODO: Fix async test handling', async () => {
    let context: ReturnType<typeof useUndoRedoContext> | null = null;

    render(
      <UndoRedoProvider>
        <TestComponent
          onRender={(ctx) => {
            context = ctx;
          }}
        />
      </UndoRedoProvider>,
    );

    const command = createMockCommand('1');

    act(() => {
      context?.execute(command);
    });

    await act(async () => {
      await context?.undo();
    });

    mockExecute.mockClear();

    act(() => {
      context?.redo();
    });

    expect(mockExecute).toHaveBeenCalledTimes(1);
    expect(context).not.toBeNull();
    expect(context?.canUndo).toBe(true);
    expect(context?.canRedo).toBe(false);
  });

  it('clears future when new command executed', async () => {
    let context: ReturnType<typeof useUndoRedoContext> | null = null;

    render(
      <UndoRedoProvider>
        <TestComponent
          onRender={(ctx) => {
            context = ctx;
          }}
        />
      </UndoRedoProvider>,
    );

    const command1 = createMockCommand('1');
    const command2 = createMockCommand('2');

    act(() => {
      context?.execute(command1);
    });

    await act(async () => {
      await context?.undo();
    });

    act(() => {
      context?.execute(command2);
    });

    expect(context).not.toBeNull();
    expect(context?.canUndo).toBe(true);
    expect(context?.canRedo).toBe(false);
  });

  it.skip('limits history size to maxHistorySize - TODO: Fix async test handling', async () => {
    let context: ReturnType<typeof useUndoRedoContext> | null = null;

    render(
      <UndoRedoProvider maxHistorySize={3}>
        <TestComponent
          onRender={(ctx) => {
            context = ctx;
          }}
        />
      </UndoRedoProvider>,
    );

    act(() => {
      context?.execute(createMockCommand('1'));
      context?.execute(createMockCommand('2'));
      context?.execute(createMockCommand('3'));
      context?.execute(createMockCommand('4'));
    });

    expect(mockExecute).toHaveBeenCalledTimes(4);

    mockUndo.mockClear();

    await act(async () => {
      await context?.undo();
      await context?.undo();
      await context?.undo();
    });

    expect(mockUndo).toHaveBeenCalledTimes(3);
    expect(context).not.toBeNull();
    expect(context?.canUndo).toBe(false);
  });

  it('does nothing when undo called with empty past', () => {
    let context: ReturnType<typeof useUndoRedoContext> | null = null;

    render(
      <UndoRedoProvider>
        <TestComponent
          onRender={(ctx) => {
            context = ctx;
          }}
        />
      </UndoRedoProvider>,
    );

    act(() => {
      context?.undo();
    });

    expect(mockUndo).not.toHaveBeenCalled();
    expect(context).not.toBeNull();
    expect(context?.canUndo).toBe(false);
  });

  it('does nothing when redo called with empty future', () => {
    let context: ReturnType<typeof useUndoRedoContext> | null = null;

    render(
      <UndoRedoProvider>
        <TestComponent
          onRender={(ctx) => {
            context = ctx;
          }}
        />
      </UndoRedoProvider>,
    );

    act(() => {
      context?.redo();
    });

    expect(mockExecute).not.toHaveBeenCalled();
    expect(context).not.toBeNull();
    expect(context?.canRedo).toBe(false);
  });

  it('clears all history', () => {
    let context: ReturnType<typeof useUndoRedoContext> | null = null;

    render(
      <UndoRedoProvider>
        <TestComponent
          onRender={(ctx) => {
            context = ctx;
          }}
        />
      </UndoRedoProvider>,
    );

    act(() => {
      context?.execute(createMockCommand('1'));
      context?.execute(createMockCommand('2'));
      context?.undo();
    });

    act(() => {
      context?.clear();
    });

    expect(context).not.toBeNull();
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
    undo: () => {
      mockUndo();
      return Promise.resolve();
    },
  });

  it.skip('handles Ctrl+Z for undo on Windows - TODO: Fix async test handling', async () => {
    let context: ReturnType<typeof useUndoRedoContext> | null = null;

    render(
      <UndoRedoProvider>
        <TestComponent
          onRender={(ctx) => {
            context = ctx;
          }}
        />
      </UndoRedoProvider>,
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

    await act(async () => {
      window.dispatchEvent(event);
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(mockUndo).toHaveBeenCalledTimes(1);
  });

  it.skip('handles Ctrl+Y for redo on Windows - TODO: Fix async test handling', async () => {
    let context: ReturnType<typeof useUndoRedoContext> | null = null;

    render(
      <UndoRedoProvider>
        <TestComponent
          onRender={(ctx) => {
            context = ctx;
          }}
        />
      </UndoRedoProvider>,
    );

    act(() => {
      context?.execute(createMockCommand('1'));
    });

    await act(async () => {
      await context?.undo();
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

  it.skip('handles Ctrl+Shift+Z for redo on Windows - TODO: Fix async test handling', async () => {
    let context: ReturnType<typeof useUndoRedoContext> | null = null;

    render(
      <UndoRedoProvider>
        <TestComponent
          onRender={(ctx) => {
            context = ctx;
          }}
        />
      </UndoRedoProvider>,
    );

    act(() => {
      context?.execute(createMockCommand('1'));
    });

    await act(async () => {
      await context?.undo();
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

  it.skip('handles Cmd+Z for undo on Mac - TODO: Fix async test handling', async () => {
    Object.defineProperty(navigator, 'platform', {
      writable: true,
      value: 'MacIntel',
    });

    let context: ReturnType<typeof useUndoRedoContext> | null = null;

    render(
      <UndoRedoProvider>
        <TestComponent
          onRender={(ctx) => {
            context = ctx;
          }}
        />
      </UndoRedoProvider>,
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

    await act(async () => {
      window.dispatchEvent(event);
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(mockUndo).toHaveBeenCalledTimes(1);
  });

  it('cleans up event listeners on unmount', () => {
    const { unmount } = render(
      <UndoRedoProvider>
        <TestComponent onRender={() => {}} />
      </UndoRedoProvider>,
    );

    const addEventListenerSpy = vi.spyOn(window, 'removeEventListener');

    unmount();

    expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
  });
});
