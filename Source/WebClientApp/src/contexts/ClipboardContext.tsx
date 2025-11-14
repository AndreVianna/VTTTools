import type React from 'react';
import { useCallback, useMemo, useState } from 'react';
import type { PlacedAsset } from '../types/domain';
import { ClipboardContext, type ClipboardContextValue, INITIAL_CLIPBOARD_STATE } from './clipboardContextDefinition';

interface ClipboardState {
  assets: PlacedAsset[];
  operation: 'copy' | 'cut' | null;
  sourceEncounterId: string | null;
}

export const ClipboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [clipboard, setClipboard] = useState<ClipboardState>(INITIAL_CLIPBOARD_STATE);

  const copyAssets = useCallback((assets: PlacedAsset[], encounterId: string) => {
    setClipboard({
      assets: [...assets],
      operation: 'copy',
      sourceEncounterId: encounterId,
    });
  }, []);

  const cutAssets = useCallback((assets: PlacedAsset[], encounterId: string) => {
    setClipboard({
      assets: [...assets],
      operation: 'cut',
      sourceEncounterId: encounterId,
    });
  }, []);

  const clearClipboard = useCallback(() => {
    setClipboard(INITIAL_CLIPBOARD_STATE);
  }, []);

  const getClipboardAssets = useCallback(() => {
    return [...clipboard.assets];
  }, [clipboard]);

  const canPaste = useMemo(() => {
    return clipboard.assets.length > 0;
  }, [clipboard.assets.length]);

  const value: ClipboardContextValue = {
    clipboard,
    canPaste,
    copyAssets,
    cutAssets,
    clearClipboard,
    getClipboardAssets,
  };

  return <ClipboardContext.Provider value={value}>{children}</ClipboardContext.Provider>;
};
