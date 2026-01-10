import type { Asset, AssetKind } from '@/types/domain';

export interface PlacementSettings {
  count: number;
  hidden: boolean;
  rollHp: boolean;
  maxHp: boolean;
  autoNumber: boolean;
}

export interface AssetSelectionState {
  searchQuery: string;
  letterFilter: string | null;
  categoryFilter: string | null;
  typeFilter: string | null;
  subtypeFilter: string | null;
  selectedAsset: Asset | null;
  selectedTokenIndex: number;
  placementSettings: PlacementSettings;
  highlightedIndex: number;
}

export interface AssetSelectionResult {
  asset: Asset;
  displayName: string;
  typeInfo: string;
  stats: {
    cr?: string;
    ac?: string;
    hp?: string;
  };
}

export interface AssetSelectionDialogProps {
  open: boolean;
  onClose: () => void;
  onPlace: (asset: Asset, settings: PlacementSettings, tokenIndex: number) => void;
  kind?: AssetKind;
  title?: string;
}

export const DEFAULT_PLACEMENT_SETTINGS: PlacementSettings = {
  count: 1,
  hidden: false,
  rollHp: true,
  maxHp: false,
  autoNumber: true,
};

export const ALPHABET_LETTERS = ['0-9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

export function getAssetFirstLetter(name: string): string {
  const firstChar = name.charAt(0).toUpperCase();
  if (firstChar >= '0' && firstChar <= '9') {
    return '0-9';
  }
  return firstChar;
}
