import { createContext } from 'react';
import type { Command } from '@/utils/commands';

export interface UndoRedoContextValue {
  canUndo: boolean;
  canRedo: boolean;
  execute: (command: Command) => Promise<void>;
  recordAction: (command: Command) => void;
  undo: () => Promise<void>;
  redo: () => Promise<void>;
  clear: () => void;
}

export const UndoRedoContext = createContext<UndoRedoContextValue | null>(null);
