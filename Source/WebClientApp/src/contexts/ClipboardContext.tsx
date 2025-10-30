import React, { useState, useCallback, useMemo } from 'react';
import type { PlacedAsset } from '../types/domain';
import { ClipboardContext, INITIAL_CLIPBOARD_STATE, type ClipboardContextValue } from './clipboardContextDefinition';

interface ClipboardState {
  assets: PlacedAsset[];
  operation: 'copy' | 'cut' | null;
  sourceSceneId: string | null;
}

export const ClipboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [clipboard, setClipboard] = useState<ClipboardState>(INITIAL_CLIPBOARD_STATE);

  const copyAssets = useCallback((assets: PlacedAsset[], sceneId: string) => {
    setClipboard({
      assets: [...assets],
      operation: 'copy',
      sourceSceneId: sceneId
    });
  }, []);

  const cutAssets = useCallback((assets: PlacedAsset[], sceneId: string) => {
    setClipboard({
      assets: [...assets],
      operation: 'cut',
      sourceSceneId: sceneId
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
    getClipboardAssets
  };

  return (
    <ClipboardContext.Provider value={value}>
      {children}
    </ClipboardContext.Provider>
  );
};
