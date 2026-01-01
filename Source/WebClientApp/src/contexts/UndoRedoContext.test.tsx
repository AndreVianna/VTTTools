import { act, render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { type UndoRedoContextValue, useUndoRedoContext } from '@/hooks/useUndoRedo';
import type { Command } from '@/utils/commands';
import { UndoRedoProvider } from './UndoRedoContext';

const TestComponent = ({ onRender }: { onRender: (context: UndoRedoContextValue) => void }) => {
  const context = useUndoRedoContext();
  onRender(context);
  return null;
};

// Helper that keeps a reference to the latest context value
const createContextRef = () => {
  const ref: { current: UndoRedoContextValue | null } = { current: null };
  const Component = () => {
    const context = useUndoRedoContext();
    ref.current = context;
    return null;
  };
  return { ref, Component };
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
    let capturedContext: UndoRedoContextValue | null = null;
    const ContextCapture = () => {
      capturedContext = useUndoRedoContext();
      return null;
    };

    const { rerender } = render(
      <UndoRedoProvider>
        <ContextCapture />
      </UndoRedoProvider>,
    );

    // Track if undo was called on the command
    const undoSpy = vi.fn().mockResolvedValue(undefined);
    const command: Command = {
      description: 'Test command',
      execute: mockExecute,
      undo: undoSpy,
    };

    await act(async () => {
      await capturedContext?.execute(command);
    });

    // Force rerender to get fresh context
    rerender(
      <UndoRedoProvider>
        <ContextCapture />
      </UndoRedoProvider>,
    );

    expect(capturedContext).not.toBeNull();
    expect(capturedContext!.canUndo).toBe(true);
    expect(capturedContext!.canRedo).toBe(false);
    expect(mockExecute).toHaveBeenCalledTimes(1);

    await act(async () => {
      await capturedContext?.undo();
    });

    // Force rerender to get fresh context
    rerender(
      <UndoRedoProvider>
        <ContextCapture />
      </UndoRedoProvider>,
    );

    expect(capturedContext!.canUndo).toBe(false);
    expect(capturedContext!.canRedo).toBe(true);
    expect(undoSpy).toHaveBeenCalledTimes(1);
  });

  it('redoes command and moves back to past', async () => {
    let capturedContext: UndoRedoContextValue | null = null;
    const ContextCapture = () => {
      capturedContext = useUndoRedoContext();
      return null;
    };

    const { rerender } = render(
      <UndoRedoProvider>
        <ContextCapture />
      </UndoRedoProvider>,
    );

    const executeSpy = vi.fn();
    const command: Command = {
      description: 'Test command',
      execute: executeSpy,
      undo: vi.fn().mockResolvedValue(undefined),
    };

    await act(async () => {
      await capturedContext?.execute(command);
    });

    rerender(
      <UndoRedoProvider>
        <ContextCapture />
      </UndoRedoProvider>,
    );

    await act(async () => {
      await capturedContext?.undo();
    });

    rerender(
      <UndoRedoProvider>
        <ContextCapture />
      </UndoRedoProvider>,
    );

    executeSpy.mockClear();

    await act(async () => {
      await capturedContext?.redo();
    });

    rerender(
      <UndoRedoProvider>
        <ContextCapture />
      </UndoRedoProvider>,
    );

    expect(executeSpy).toHaveBeenCalledTimes(1);
    expect(capturedContext).not.toBeNull();
    expect(capturedContext!.canUndo).toBe(true);
    expect(capturedContext!.canRedo).toBe(false);
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
    let capturedContext: UndoRedoContextValue | null = null;
    const ContextCapture = () => {
      capturedContext = useUndoRedoContext();
      return null;
    };

    const undoSpies = [vi.fn(), vi.fn(), vi.fn(), vi.fn()];
    const commands = undoSpies.map((spy, i) => ({
      description: `Command ${i + 1}`,
      execute: mockExecute,
      undo: spy.mockResolvedValue(undefined),
    }));

    const { rerender } = render(
      <UndoRedoProvider maxHistorySize={3}>
        <ContextCapture />
      </UndoRedoProvider>,
    );

    for (const command of commands) {
      await act(async () => {
        await capturedContext?.execute(command);
      });
      rerender(
        <UndoRedoProvider maxHistorySize={3}>
          <ContextCapture />
        </UndoRedoProvider>,
      );
    }

    expect(mockExecute).toHaveBeenCalledTimes(4);

    // Undo 3 times - should only be able to undo 3 due to maxHistorySize
    for (let i = 0; i < 3; i++) {
      await act(async () => {
        await capturedContext?.undo();
      });
      rerender(
        <UndoRedoProvider maxHistorySize={3}>
          <ContextCapture />
        </UndoRedoProvider>,
      );
    }

    // Commands 2, 3, 4 should have had undo called (command 1 was pushed out)
    expect(undoSpies[1]).toHaveBeenCalledTimes(1);
    expect(undoSpies[2]).toHaveBeenCalledTimes(1);
    expect(undoSpies[3]).toHaveBeenCalledTimes(1);
    expect(capturedContext).not.toBeNull();
    expect(capturedContext!.canUndo).toBe(false);
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

  it('handles Ctrl+Z for undo on Windows', async () => {
    let capturedContext: UndoRedoContextValue | null = null;
    const ContextCapture = () => {
      capturedContext = useUndoRedoContext();
      return null;
    };

    const undoSpy = vi.fn().mockResolvedValue(undefined);
    const command: Command = {
      description: 'Test command',
      execute: mockExecute,
      undo: undoSpy,
    };

    const { rerender } = render(
      <UndoRedoProvider>
        <ContextCapture />
      </UndoRedoProvider>,
    );

    await act(async () => {
      await capturedContext?.execute(command);
    });

    rerender(
      <UndoRedoProvider>
        <ContextCapture />
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
        <ContextCapture />
      </UndoRedoProvider>,
    );

    expect(undoSpy).toHaveBeenCalledTimes(1);
  });

  it('handles Ctrl+Y for redo on Windows', async () => {
    let capturedContext: UndoRedoContextValue | null = null;
    const ContextCapture = () => {
      capturedContext = useUndoRedoContext();
      return null;
    };

    const executeSpy = vi.fn();
    const command: Command = {
      description: 'Test command',
      execute: executeSpy,
      undo: vi.fn().mockResolvedValue(undefined),
    };

    const { rerender } = render(
      <UndoRedoProvider>
        <ContextCapture />
      </UndoRedoProvider>,
    );

    await act(async () => {
      await capturedContext?.execute(command);
    });

    rerender(
      <UndoRedoProvider>
        <ContextCapture />
      </UndoRedoProvider>,
    );

    await act(async () => {
      await capturedContext?.undo();
    });

    rerender(
      <UndoRedoProvider>
        <ContextCapture />
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
        <ContextCapture />
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
