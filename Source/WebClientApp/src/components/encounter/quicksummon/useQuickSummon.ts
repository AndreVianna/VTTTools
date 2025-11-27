import { useState, useCallback, useMemo } from 'react';
import type { Asset, AssetKind } from '@/types/domain';
import { useGetAssetsQuery } from '@/services/assetsApi';
import {
  type QuickSummonState,
  type QuickSummonResult,
  type ScopeTab,
  type PlacementSettings,
  DEFAULT_PLACEMENT_SETTINGS,
  parseCrToNumeric,
} from './types';

const RECENT_ASSETS_KEY = 'vtt-recent-assets';
const FAVORITE_ASSETS_KEY = 'vtt-favorite-assets';
const MAX_RECENT = 20;

function getRecentAssetIds(): string[] {
  try {
    const stored = localStorage.getItem(RECENT_ASSETS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function addRecentAssetId(id: string): void {
  const recent = getRecentAssetIds().filter((r) => r !== id);
  recent.unshift(id);
  localStorage.setItem(RECENT_ASSETS_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)));
}

function getFavoriteAssetIds(): string[] {
  try {
    const stored = localStorage.getItem(FAVORITE_ASSETS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export interface UseQuickSummonOptions {
  kind?: AssetKind | undefined;
}

export function useQuickSummon(options: UseQuickSummonOptions = {}) {
  const { kind } = options;

  const [state, setState] = useState<QuickSummonState>({
    scopeTab: 'all',
    searchQuery: '',
    typeFilter: null,
    crRangeFilter: null,
    biomeFilter: null,
    selectedAsset: null,
    selectedTokenIndex: 0,
    placementSettings: DEFAULT_PLACEMENT_SETTINGS,
    highlightedIndex: 0,
  });

  const { data: allAssets, isLoading, error } = useGetAssetsQuery(kind ? { kind } : {});

  const recentIds = useMemo(() => getRecentAssetIds(), []);
  const favoriteIds = useMemo(() => getFavoriteAssetIds(), []);

  const filteredResults = useMemo((): QuickSummonResult[] => {
    if (!allAssets) return [];

    let assets = [...allAssets];

    if (state.scopeTab === 'favorites') {
      assets = assets.filter((a) => favoriteIds.includes(a.id));
    } else if (state.scopeTab === 'recent') {
      const recentSet = new Set(recentIds);
      assets = assets.filter((a) => recentSet.has(a.id));
      assets.sort((a, b) => recentIds.indexOf(a.id) - recentIds.indexOf(b.id));
    }

    if (state.searchQuery) {
      const query = state.searchQuery.toLowerCase();

      const crMatch = query.match(/^cr[:\s]*(\d+(?:\/\d+)?)$/i);
      const typeMatch = query.match(/^type[:\s]*(\w+)$/i);

      if (crMatch) {
        const targetCr = parseCrToNumeric(crMatch[1] ?? null);
        if (targetCr !== null) {
          assets = assets.filter((a) => {
            const cr = a.statBlocks[0]?.['CR']?.value ?? null;
            const assetCr = parseCrToNumeric(cr);
            return assetCr !== null && assetCr === targetCr;
          });
        }
      } else if (typeMatch && typeMatch[1]) {
        const targetType = typeMatch[1].toLowerCase();
        assets = assets.filter((a) => {
          const type = a.classification.type?.toLowerCase() || '';
          const category = a.classification.category?.toLowerCase() || '';
          return type.includes(targetType) || category.includes(targetType);
        });
      } else {
        assets = assets.filter((a) => {
          const name = a.name.toLowerCase();
          const desc = a.description.toLowerCase();
          const type = a.classification.type?.toLowerCase() || '';
          return name.includes(query) || desc.includes(query) || type.includes(query);
        });
      }
    }

    if (state.typeFilter) {
      assets = assets.filter((a) => a.classification.type === state.typeFilter);
    }

    if (state.crRangeFilter) {
      const [minCr, maxCr] = state.crRangeFilter;
      assets = assets.filter((a) => {
        const cr = a.statBlocks[0]?.['CR']?.value;
        const numericCr = parseCrToNumeric(cr);
        if (numericCr === null) return false;
        return numericCr >= minCr && numericCr <= maxCr;
      });
    }

    return assets.map((asset): QuickSummonResult => {
      const statBlock = asset.statBlocks[0];
      const cr = statBlock?.['CR']?.value;
      const ac = statBlock?.['AC']?.value;
      const hp = statBlock?.['HP']?.value;
      return {
        asset,
        displayName: asset.name,
        typeInfo: [asset.classification.category, asset.classification.type]
          .filter(Boolean)
          .join(' / '),
        stats: {
          ...(cr !== null && cr !== undefined ? { cr } : {}),
          ...(ac !== null && ac !== undefined ? { ac } : {}),
          ...(hp !== null && hp !== undefined ? { hp } : {}),
        },
      };
    });
  }, [allAssets, state.scopeTab, state.searchQuery, state.typeFilter, state.crRangeFilter, recentIds, favoriteIds]);

  const availableTypes = useMemo(() => {
    if (!allAssets) return [];
    const types = new Set<string>();
    allAssets.forEach((a) => {
      if (a.classification.type) {
        types.add(a.classification.type);
      }
    });
    return Array.from(types).sort();
  }, [allAssets]);

  const setScopeTab = useCallback((tab: ScopeTab) => {
    setState((prev) => ({ ...prev, scopeTab: tab, highlightedIndex: 0 }));
  }, []);

  const setSearchQuery = useCallback((query: string) => {
    setState((prev) => ({ ...prev, searchQuery: query, highlightedIndex: 0 }));
  }, []);

  const setTypeFilter = useCallback((type: string | null) => {
    setState((prev) => ({ ...prev, typeFilter: type, highlightedIndex: 0 }));
  }, []);

  const setCrRangeFilter = useCallback((range: [number, number] | null) => {
    setState((prev) => ({ ...prev, crRangeFilter: range, highlightedIndex: 0 }));
  }, []);

  const setBiomeFilter = useCallback((biome: string | null) => {
    setState((prev) => ({ ...prev, biomeFilter: biome, highlightedIndex: 0 }));
  }, []);

  const selectAsset = useCallback((asset: Asset | null) => {
    setState((prev) => ({
      ...prev,
      selectedAsset: asset,
      selectedTokenIndex: 0,
    }));
  }, []);

  const setSelectedTokenIndex = useCallback((index: number) => {
    setState((prev) => ({ ...prev, selectedTokenIndex: index }));
  }, []);

  const setHighlightedIndex = useCallback((index: number) => {
    setState((prev) => ({ ...prev, highlightedIndex: index }));
  }, []);

  const updatePlacementSettings = useCallback((updates: Partial<PlacementSettings>) => {
    setState((prev) => ({
      ...prev,
      placementSettings: { ...prev.placementSettings, ...updates },
    }));
  }, []);

  const navigateList = useCallback((direction: 'up' | 'down') => {
    setState((prev) => {
      const maxIndex = filteredResults.length - 1;
      let newIndex = prev.highlightedIndex;

      if (direction === 'up') {
        newIndex = Math.max(0, newIndex - 1);
      } else {
        newIndex = Math.min(maxIndex, newIndex + 1);
      }

      const newAsset = filteredResults[newIndex]?.asset ?? null;

      return {
        ...prev,
        highlightedIndex: newIndex,
        selectedAsset: newAsset,
        selectedTokenIndex: 0,
      };
    });
  }, [filteredResults]);

  const selectHighlighted = useCallback(() => {
    const result = filteredResults[state.highlightedIndex];
    if (result) {
      selectAsset(result.asset);
    }
  }, [filteredResults, state.highlightedIndex, selectAsset]);

  const recordRecentAsset = useCallback((asset: Asset) => {
    addRecentAssetId(asset.id);
  }, []);

  const reset = useCallback(() => {
    setState({
      scopeTab: 'all',
      searchQuery: '',
      typeFilter: null,
      crRangeFilter: null,
      biomeFilter: null,
      selectedAsset: null,
      selectedTokenIndex: 0,
      placementSettings: DEFAULT_PLACEMENT_SETTINGS,
      highlightedIndex: 0,
    });
  }, []);

  return {
    ...state,
    filteredResults,
    availableTypes,
    isLoading,
    error,
    setScopeTab,
    setSearchQuery,
    setTypeFilter,
    setCrRangeFilter,
    setBiomeFilter,
    selectAsset,
    setSelectedTokenIndex,
    setHighlightedIndex,
    updatePlacementSettings,
    navigateList,
    selectHighlighted,
    recordRecentAsset,
    reset,
  };
}

export type UseQuickSummonReturn = ReturnType<typeof useQuickSummon>;
