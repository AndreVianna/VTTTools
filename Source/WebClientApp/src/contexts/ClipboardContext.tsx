import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { PlacedAsset } from '../types/domain';

interface ClipboardState {
  assets: PlacedAsset[];
  operation: 'copy' | 'cut' | null;
  sourceSceneId: string | null;
}

interface ClipboardContextValue {
  clipboard: ClipboardState;
  canPaste: boolean;
  copyAssets: (assets: PlacedAsset[], sceneId: string) => void;
  cutAssets: (assets: PlacedAsset[], sceneId: string) => void;
  clearClipboard: () => void;
  getClipboardAssets: () => PlacedAsset[];
}

const ClipboardContext = createContext<ClipboardContextValue | undefined>(undefined);

const INITIAL_CLIPBOARD_STATE: ClipboardState = {
  assets: [],
  operation: null,
  sourceSceneId: null
};

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

export const useClipboard = (): ClipboardContextValue => {
  const context = useContext(ClipboardContext);
  if (context === undefined) {
    throw new Error('useClipboard must be used within a ClipboardProvider');
  }
  return context;
};
