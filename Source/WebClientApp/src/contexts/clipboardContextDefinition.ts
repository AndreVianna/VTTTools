import { createContext } from 'react';
import type { PlacedAsset } from '../types/domain';

interface ClipboardState {
  assets: PlacedAsset[];
  operation: 'copy' | 'cut' | null;
  sourceSceneId: string | null;
}

export interface ClipboardContextValue {
  clipboard: ClipboardState;
  canPaste: boolean;
  copyAssets: (assets: PlacedAsset[], sceneId: string) => void;
  cutAssets: (assets: PlacedAsset[], sceneId: string) => void;
  clearClipboard: () => void;
  getClipboardAssets: () => PlacedAsset[];
}

export const ClipboardContext = createContext<ClipboardContextValue | undefined>(undefined);

export const INITIAL_CLIPBOARD_STATE: ClipboardState = {
  assets: [],
  operation: null,
  sourceSceneId: null
};
