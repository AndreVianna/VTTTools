import React, { useEffect } from 'react';
import { act, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { type UndoRedoContextValue, useUndoRedoContext } from '@/hooks/useUndoRedo';
import type { Command } from '@/utils/commands';
import { UndoRedoProvider } from './UndoRedoContext';

const TestComponent = ({ onRender }: { onRender: (context: UndoRedoContextValue) => void }) => {
  const context = useUndoRedoContext();
  onRender(context);
  return null;
};

// Helper component that stores context in a ref (safe pattern for tests)
const ContextCapture = ({ contextRef }: { contextRef: React.MutableRefObject<UndoRedoContextValue | null> }) => {
  const context = useUndoRedoContext();
  useEffect(() => {
    contextRef.current = context;
  });
  return null;
};

describe('UndoRedoContext', () => {
  let mockExecute: ReturnType<typeof vi.fn<() => void | Promise<void>>>;
  let mockUndo: ReturnType<typeof vi.fn<() => void | Promise<void>>>;

  beforeEach(() => {
    mockExecute = vi.fn<() => void | Promise<void>>();
    mockUndo = vi.fn<() => void | Promise<void>>();
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
    let context: UndoRedoContextValue | null = null;

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
    // biome-ignore lint/style/noNonNullAssertion: Checked for null above
    expect(context!.canUndo).toBe(false);
    // biome-ignore lint/style/noNonNullAssertion: Checked for null above
    expect(context!.canRedo).toBe(false);
  });

  it('executes command and adds to history', () => {
    let context: UndoRedoContextValue | null = null;

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
    // biome-ignore lint/style/noNonNullAssertion: Checked for null above
    expect(context!.canUndo).toBe(true);
    // biome-ignore lint/style/noNonNullAssertion: Checked for null above
    expect(context!.canRedo).toBe(false);
  });

  it('undoes command and moves to future', async () => {
    const contextRef = { current: null as UndoRedoContextValue | null };

    const { rerender } = render(
      <UndoRedoProvider>
        <ContextCapture contextRef={contextRef} />
      </UndoRedoProvider>,
    );

    // Track if undo was called on the command
    const undoSpy = vi.fn<() => Promise<void>>().mockResolvedValue(undefined);
    const command: Command = {
      description: 'Test command',
      execute: mockExecute,
      undo: undoSpy,
    };

    await act(async () => {
      await contextRef.current?.execute(command);
    });

    // Force rerender to get fresh context
    rerender(
      <UndoRedoProvider>
        <ContextCapture contextRef={contextRef} />
      </UndoRedoProvider>,
    );

    expect(contextRef.current).not.toBeNull();
    expect(contextRef.current!.canUndo).toBe(true);
    expect(contextRef.current!.canRedo).toBe(false);
    expect(mockExecute).toHaveBeenCalledTimes(1);

    await act(async () => {
      await contextRef.current?.undo();
    });

    // Force rerender to get fresh context
    rerender(
      <UndoRedoProvider>
        <ContextCapture contextRef={contextRef} />
      </UndoRedoProvider>,
    );

    expect(contextRef.current!.canUndo).toBe(false);
    expect(contextRef.current!.canRedo).toBe(true);
    expect(undoSpy).toHaveBeenCalledTimes(1);
  });

  it('redoes command and moves back to past', async () => {
    const contextRef = { current: null as UndoRedoContextValue | null };

    const { rerender } = render(
      <UndoRedoProvider>
        <ContextCapture contextRef={contextRef} />
      </UndoRedoProvider>,
    );

    const executeSpy = vi.fn<() => void | Promise<void>>();
    const command: Command = {
      description: 'Test command',
      execute: executeSpy,
      undo: vi.fn<() => Promise<void>>().mockResolvedValue(undefined),
    };

    await act(async () => {
      await contextRef.current?.execute(command);
    });

    rerender(
      <UndoRedoProvider>
        <ContextCapture contextRef={contextRef} />
      </UndoRedoProvider>,
    );

    await act(async () => {
      await contextRef.current?.undo();
    });

    rerender(
      <UndoRedoProvider>
        <ContextCapture contextRef={contextRef} />
      </UndoRedoProvider>,
    );

    executeSpy.mockClear();

    await act(async () => {
      await contextRef.current?.redo();
    });

    rerender(
      <UndoRedoProvider>
        <ContextCapture contextRef={contextRef} />
      </UndoRedoProvider>,
    );

    expect(executeSpy).toHaveBeenCalledTimes(1);
    expect(contextRef.current).not.toBeNull();
    expect(contextRef.current!.canUndo).toBe(true);
    expect(contextRef.current!.canRedo).toBe(false);
  });

  it('clears future when new command executed', async () => {
    let context: UndoRedoContextValue | null = null;

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
    // biome-ignore lint/style/noNonNullAssertion: Checked for null above
    expect(context!.canUndo).toBe(true);
    // biome-ignore lint/style/noNonNullAssertion: Checked for null above
    expect(context!.canRedo).toBe(false);
  });

  it('limits history size to maxHistorySize', async () => {
    const contextRef = { current: null as UndoRedoContextValue | null };

    const undoSpies = [vi.fn(), vi.fn(), vi.fn(), vi.fn()];
    const commands = undoSpies.map((spy, i) => ({
      description: `Command ${i + 1}`,
      execute: mockExecute,
      undo: spy.mockResolvedValue(undefined),
    }));

    const { rerender } = render(
      <UndoRedoProvider maxHistorySize={3}>
        <ContextCapture contextRef={contextRef} />
      </UndoRedoProvider>,
    );

    for (const command of commands) {
      await act(async () => {
        await contextRef.current?.execute(command);
      });
      rerender(
        <UndoRedoProvider maxHistorySize={3}>
          <ContextCapture contextRef={contextRef} />
        </UndoRedoProvider>,
      );
    }

    expect(mockExecute).toHaveBeenCalledTimes(4);

    // Undo 3 times - should only be able to undo 3 due to maxHistorySize
    for (let i = 0; i < 3; i++) {
      await act(async () => {
        await contextRef.current?.undo();
      });
      rerender(
        <UndoRedoProvider maxHistorySize={3}>
          <ContextCapture contextRef={contextRef} />
        </UndoRedoProvider>,
      );
    }

    // Commands 2, 3, 4 should have had undo called (command 1 was pushed out)
    expect(undoSpies[1]).toHaveBeenCalledTimes(1);
    expect(undoSpies[2]).toHaveBeenCalledTimes(1);
    expect(undoSpies[3]).toHaveBeenCalledTimes(1);
    expect(contextRef.current).not.toBeNull();
    expect(contextRef.current!.canUndo).toBe(false);
  });

  it('does nothing when undo called with empty past', () => {
    let context: UndoRedoContextValue | null = null;

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
    // biome-ignore lint/style/noNonNullAssertion: Checked for null above
    expect(context!.canUndo).toBe(false);
  });

  it('does nothing when redo called with empty future', () => {
    let context: UndoRedoContextValue | null = null;

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
    // biome-ignore lint/style/noNonNullAssertion: Checked for null above
    expect(context!.canRedo).toBe(false);
  });

  it('clears all history', () => {
    let context: UndoRedoContextValue | null = null;

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
    // biome-ignore lint/style/noNonNullAssertion: Checked for null above
    expect(context!.canUndo).toBe(false);
    // biome-ignore lint/style/noNonNullAssertion: Checked for null above
    expect(context!.canRedo).toBe(false);
  });

  it('throws error when useUndoRedoContext used outside provider', () => {
    expect(() => {
      render(<TestComponent onRender={() => {}} />);
    }).toThrow('useUndoRedoContext must be used within UndoRedoProvider');
  });
});

describe('UndoRedoContext keyboard shortcuts', () => {
  let mockExecute: ReturnType<typeof vi.fn<() => void | Promise<void>>>;

  beforeEach(() => {
    mockExecute = vi.fn<() => void | Promise<void>>();
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

  it('handles Ctrl+Z for undo on Windows', async () => {
    const contextRef = { current: null as UndoRedoContextValue | null };

    const undoSpy = vi.fn<() => Promise<void>>().mockResolvedValue(undefined);
    const command: Command = {
      description: 'Test command',
      execute: mockExecute,
      undo: undoSpy,
    };

    const { rerender } = render(
      <UndoRedoProvider>
        <ContextCapture contextRef={contextRef} />
      </UndoRedoProvider>,
    );

    await act(async () => {
      await contextRef.current?.execute(command);
    });

    rerender(
      <UndoRedoProvider>
        <ContextCapture contextRef={contextRef} />
      </UndoRedoProvider>,
    );

    const event = new KeyboardEvent('keydown', {
      key: 'z',
      ctrlKey: true,
      bubbles: true,
    });

    await act(async () => {
      window.dispatchEvent(event);
    });

    rerender(
      <UndoRedoProvider>
        <ContextCapture contextRef={contextRef} />
      </UndoRedoProvider>,
    );

    expect(undoSpy).toHaveBeenCalledTimes(1);
  });

  it('handles Ctrl+Y for redo on Windows', async () => {
    const contextRef = { current: null as UndoRedoContextValue | null };

    const executeSpy = vi.fn<() => void | Promise<void>>();
    const command: Command = {
      description: 'Test command',
      execute: executeSpy,
      undo: vi.fn<() => Promise<void>>().mockResolvedValue(undefined),
    };

    const { rerender } = render(
      <UndoRedoProvider>
        <ContextCapture contextRef={contextRef} />
      </UndoRedoProvider>,
    );

    await act(async () => {
      await contextRef.current?.execute(command);
    });

    rerender(
      <UndoRedoProvider>
        <ContextCapture contextRef={contextRef} />
      </UndoRedoProvider>,
    );

    await act(async () => {
      await contextRef.current?.undo();
    });

    rerender(
      <UndoRedoProvider>
        <ContextCapture contextRef={contextRef} />
      </UndoRedoProvider>,
    );

    executeSpy.mockClear();

    const event = new KeyboardEvent('keydown', {
      key: 'y',
      ctrlKey: true,
      bubbles: true,
    });

    await act(async () => {
      window.dispatchEvent(event);
    });

    rerender(
      <UndoRedoProvider>
        <ContextCapture contextRef={contextRef} />
      </UndoRedoProvider>,
    );

    expect(executeSpy).toHaveBeenCalledTimes(1);
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
