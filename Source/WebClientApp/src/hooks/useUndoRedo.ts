import { useContext } from 'react';
import { UndoRedoContext, type UndoRedoContextValue } from '@/contexts/undoRedoContextDefinition';

export type { UndoRedoContextValue };

export const useUndoRedoContext = (): UndoRedoContextValue => {
  const context = useContext(UndoRedoContext);

  if (context === null) {
    throw new Error('useUndoRedoContext must be used within UndoRedoProvider');
  }

  return context;
};

export const useUndoRedo = () => {
  return useUndoRedoContext();
};
