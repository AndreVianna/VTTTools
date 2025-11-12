import { useUndoRedoContext } from '@/contexts/UndoRedoContext';

export const useUndoRedo = () => {
  return useUndoRedoContext();
};
