import { useContext } from 'react';
import { ClipboardContext, type ClipboardContextValue } from './clipboardContextDefinition';

export const useClipboard = (): ClipboardContextValue => {
  const context = useContext(ClipboardContext);
  if (context === undefined) {
    throw new Error('useClipboard must be used within a ClipboardProvider');
  }
  return context;
};
