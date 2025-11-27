import type { Asset, AssetKind } from '@/types/domain';

export type ScopeTab = 'all' | 'favorites' | 'recent';

export interface PlacementSettings {
  count: number;
  hidden: boolean;
  rollHp: boolean;
  maxHp: boolean;
  autoNumber: boolean;
}

export interface QuickSummonState {
  scopeTab: ScopeTab;
  searchQuery: string;
  typeFilter: string | null;
  crRangeFilter: [number, number] | null;
  biomeFilter: string | null;
  selectedAsset: Asset | null;
  selectedTokenIndex: number;
  placementSettings: PlacementSettings;
  highlightedIndex: number;
}

export interface QuickSummonResult {
  asset: Asset;
  displayName: string;
  typeInfo: string;
  stats: {
    cr?: string;
    ac?: string;
    hp?: string;
  };
}

export interface QuickSummonDialogProps {
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

export const CR_VALUES = [
  '0', '1/8', '1/4', '1/2', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10',
  '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30'
];

export const CR_NUMERIC: Record<string, number> = {
  '0': 0,
  '1/8': 0.125,
  '1/4': 0.25,
  '1/2': 0.5,
  '1': 1,
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  '10': 10,
  '11': 11,
  '12': 12,
  '13': 13,
  '14': 14,
  '15': 15,
  '16': 16,
  '17': 17,
  '18': 18,
  '19': 19,
  '20': 20,
  '21': 21,
  '22': 22,
  '23': 23,
  '24': 24,
  '25': 25,
  '26': 26,
  '27': 27,
  '28': 28,
  '29': 29,
  '30': 30,
};

export function parseCrToNumeric(cr: string | null | undefined): number | null {
  if (cr === null || cr === undefined) return null;
  const normalized = cr.trim();
  if (normalized in CR_NUMERIC) {
    const value = CR_NUMERIC[normalized];
    return value !== undefined ? value : null;
  }
  const parsed = parseFloat(normalized);
  return isNaN(parsed) ? null : parsed;
}
