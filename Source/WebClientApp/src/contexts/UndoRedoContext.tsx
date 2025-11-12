import type React from 'react';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { Command } from '@/utils/commands';

interface UndoRedoState {
  past: Command[];
  future: Command[];
}

interface UndoRedoContextValue {
  canUndo: boolean;
  canRedo: boolean;
  execute: (command: Command) => Promise<void>;
  recordAction: (command: Command) => void;
  undo: () => Promise<void>;
  redo: () => Promise<void>;
  clear: () => void;
}

const UndoRedoContext = createContext<UndoRedoContextValue | null>(null);

const MAX_HISTORY_SIZE = 100;

interface UndoRedoProviderProps {
  children: React.ReactNode;
  maxHistorySize?: number;
}

export const UndoRedoProvider: React.FC<UndoRedoProviderProps> = ({ children, maxHistorySize = MAX_HISTORY_SIZE }) => {
  const [state, setState] = useState<UndoRedoState>({
    past: [],
    future: [],
  });

  const execute = useCallback(
    async (command: Command) => {
      const result = command.execute();
      if (result instanceof Promise) {
        await result;
      }

      setState((prev) => {
        const newPast = [...prev.past, command];
        if (newPast.length > maxHistorySize) {
          newPast.shift();
        }

        return {
          past: newPast,
          future: [],
        };
      });
    },
    [maxHistorySize],
  );

  const recordAction = useCallback(
    (command: Command) => {
      setState((prev) => {
        const newPast = [...prev.past, command];
        if (newPast.length > maxHistorySize) {
          newPast.shift();
        }

        return {
          past: newPast,
          future: [],
        };
      });
    },
    [maxHistorySize],
  );

  const undo = useCallback(async () => {
    let commandToUndo: Command | undefined;

    setState((prev) => {
      if (prev.past.length === 0) {
        return prev;
      }

      const newPast = [...prev.past];
      commandToUndo = newPast.pop();

      if (commandToUndo === undefined) {
        return prev;
      }

      return {
        past: newPast,
        future: [commandToUndo, ...prev.future],
      };
    });

    if (commandToUndo) {
      const result = commandToUndo.undo();
      if (result instanceof Promise) {
        await result;
      }
    }
  }, []);

  const redo = useCallback(async () => {
    // Get the command to redo BEFORE calling setState
    let commandToRedo: Command | undefined;

    setState((prev) => {
      if (prev.future.length === 0) {
        return prev;
      }

      const newFuture = [...prev.future];
      commandToRedo = newFuture.shift();

      if (commandToRedo === undefined) {
        return prev;
      }

      return {
        past: [...prev.past, commandToRedo],
        future: newFuture,
      };
    });

    // Execute the redo OUTSIDE of setState to prevent double execution
    if (commandToRedo) {
      const result = commandToRedo.execute();
      if (result instanceof Promise) {
        await result;
      }
    }
  }, []);

  const clear = useCallback(() => {
    setState({
      past: [],
      future: [],
    });
  }, []);

  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modifier = isMac ? e.metaKey : e.ctrlKey;

      if (modifier && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        await undo();
      } else if (modifier && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        await redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [undo, redo]);

  const value: UndoRedoContextValue = {
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
    execute,
    recordAction,
    undo,
    redo,
    clear,
  };

  return <UndoRedoContext.Provider value={value}>{children}</UndoRedoContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useUndoRedoContext = (): UndoRedoContextValue => {
  const context = useContext(UndoRedoContext);

  if (context === null) {
    throw new Error('useUndoRedoContext must be used within UndoRedoProvider');
  }

  return context;
};
