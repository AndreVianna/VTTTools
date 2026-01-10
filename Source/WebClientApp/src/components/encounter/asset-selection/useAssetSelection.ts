import { useState, useCallback, useMemo } from 'react';
import type { Asset, AssetKind } from '@/types/domain';
import { useGetAssetsQuery } from '@/services/assetsApi';
import {
  type AssetSelectionState,
  type AssetSelectionResult,
  type PlacementSettings,
  DEFAULT_PLACEMENT_SETTINGS,
  getAssetFirstLetter,
} from './types';

const RECENT_ASSETS_KEY = 'vtt-recent-assets';
const MAX_RECENT = 20;

function addRecentAssetId(id: string): void {
  try {
    const stored = localStorage.getItem(RECENT_ASSETS_KEY);
    const recent: string[] = stored ? JSON.parse(stored) : [];
    const filtered = recent.filter((r) => r !== id);
    filtered.unshift(id);
    localStorage.setItem(RECENT_ASSETS_KEY, JSON.stringify(filtered.slice(0, MAX_RECENT)));
  } catch {
    // Ignore storage errors
  }
}

export interface UseAssetSelectionOptions {
  kind?: AssetKind | undefined;
}

export function useAssetSelection(options: UseAssetSelectionOptions = {}) {
  const { kind } = options;

  const [state, setState] = useState<AssetSelectionState>({
    searchQuery: '',
    letterFilter: null,
    categoryFilter: null,
    typeFilter: null,
    subtypeFilter: null,
    selectedAsset: null,
    selectedTokenIndex: 0,
    placementSettings: DEFAULT_PLACEMENT_SETTINGS,
    highlightedIndex: 0,
  });

  const { data: allAssets, isLoading, error } = useGetAssetsQuery(
    kind ? { kind, sortBy: 'Name', sortDirection: 'Ascending' } : { sortBy: 'Name', sortDirection: 'Ascending' }
  );

  const sortedAssets = useMemo(() => {
    if (!allAssets) return [];
    return allAssets;
  }, [allAssets]);

  const availableLetters = useMemo(() => {
    const letters = new Set<string>();
    sortedAssets.forEach((a) => {
      letters.add(getAssetFirstLetter(a.name));
    });
    return letters;
  }, [sortedAssets]);

  const availableCategories = useMemo(() => {
    if (!sortedAssets.length) return [];
    const categories = new Set<string>();
    sortedAssets.forEach((a) => {
      if (a.classification.category) {
        categories.add(a.classification.category);
      }
    });
    return Array.from(categories).sort();
  }, [sortedAssets]);

  const availableTypes = useMemo(() => {
    if (!sortedAssets.length) return [];
    const types = new Set<string>();
    let assets = sortedAssets;
    if (state.categoryFilter) {
      assets = assets.filter((a) => a.classification.category === state.categoryFilter);
    }
    assets.forEach((a) => {
      if (a.classification.type) {
        types.add(a.classification.type);
      }
    });
    return Array.from(types).sort();
  }, [sortedAssets, state.categoryFilter]);

  const availableSubtypes = useMemo(() => {
    if (!sortedAssets.length) return [];
    const subtypes = new Set<string>();
    let assets = sortedAssets;
    if (state.categoryFilter) {
      assets = assets.filter((a) => a.classification.category === state.categoryFilter);
    }
    if (state.typeFilter) {
      assets = assets.filter((a) => a.classification.type === state.typeFilter);
    }
    assets.forEach((a) => {
      if (a.classification.subtype) {
        subtypes.add(a.classification.subtype);
      }
    });
    return Array.from(subtypes).sort();
  }, [sortedAssets, state.categoryFilter, state.typeFilter]);

  const filteredResults = useMemo((): AssetSelectionResult[] => {
    if (!sortedAssets.length) return [];

    let assets = sortedAssets;

    if (state.letterFilter) {
      assets = assets.filter((a) => getAssetFirstLetter(a.name) === state.letterFilter);
    }

    if (state.categoryFilter) {
      assets = assets.filter((a) => a.classification.category === state.categoryFilter);
    }

    if (state.typeFilter) {
      assets = assets.filter((a) => a.classification.type === state.typeFilter);
    }

    if (state.subtypeFilter) {
      assets = assets.filter((a) => a.classification.subtype === state.subtypeFilter);
    }

    if (state.searchQuery) {
      const query = state.searchQuery.toLowerCase();
      assets = assets.filter((a) => {
        const name = a.name.toLowerCase();
        const desc = a.description.toLowerCase();
        const type = a.classification.type?.toLowerCase() || '';
        const category = a.classification.category?.toLowerCase() || '';
        const subtype = a.classification.subtype?.toLowerCase() || '';
        return name.includes(query) || desc.includes(query) || type.includes(query) || category.includes(query) || subtype.includes(query);
      });
    }

    return assets.map((asset): AssetSelectionResult => {
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
  }, [sortedAssets, state.letterFilter, state.categoryFilter, state.typeFilter, state.subtypeFilter, state.searchQuery]);

  const setSearchQuery = useCallback((query: string) => {
    setState((prev) => ({ ...prev, searchQuery: query, highlightedIndex: 0 }));
  }, []);

  const setLetterFilter = useCallback((letter: string | null) => {
    setState((prev) => ({ ...prev, letterFilter: letter, highlightedIndex: 0 }));
  }, []);

  const setCategoryFilter = useCallback((category: string | null) => {
    setState((prev) => ({
      ...prev,
      categoryFilter: category,
      typeFilter: null,
      subtypeFilter: null,
      highlightedIndex: 0,
    }));
  }, []);

  const setTypeFilter = useCallback((type: string | null) => {
    setState((prev) => ({
      ...prev,
      typeFilter: type,
      subtypeFilter: null,
      highlightedIndex: 0,
    }));
  }, []);

  const setSubtypeFilter = useCallback((subtype: string | null) => {
    setState((prev) => ({ ...prev, subtypeFilter: subtype, highlightedIndex: 0 }));
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
      searchQuery: '',
      letterFilter: null,
      categoryFilter: null,
      typeFilter: null,
      subtypeFilter: null,
      selectedAsset: null,
      selectedTokenIndex: 0,
      placementSettings: DEFAULT_PLACEMENT_SETTINGS,
      highlightedIndex: 0,
    });
  }, []);

  return {
    ...state,
    filteredResults,
    availableLetters,
    availableCategories,
    availableTypes,
    availableSubtypes,
    isLoading,
    error,
    setSearchQuery,
    setLetterFilter,
    setCategoryFilter,
    setTypeFilter,
    setSubtypeFilter,
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

export type UseAssetSelectionReturn = ReturnType<typeof useAssetSelection>;
