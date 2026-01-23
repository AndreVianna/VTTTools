import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

/**
 * Storage key prefix for DM asset selection.
 * Full key is: vtt:dmAssetSelection:{encounterId}
 */
const STORAGE_KEY_PREFIX = 'vtt:dmAssetSelection:';

/**
 * Get the storage key for an encounter's selection state.
 */
function getStorageKey(encounterId: string): string {
    return `${STORAGE_KEY_PREFIX}${encounterId}`;
}

/**
 * Load selection from localStorage.
 */
function loadSelectionFromStorage(encounterId: string): string[] {
    try {
        const stored = localStorage.getItem(getStorageKey(encounterId));
        if (stored) {
            const parsed = JSON.parse(stored) as unknown;
            if (Array.isArray(parsed) && parsed.every(item => typeof item === 'string')) {
                return parsed;
            }
        }
    } catch {
        // Ignore parse errors
    }
    return [];
}

/**
 * Save selection to localStorage.
 */
function saveSelectionToStorage(encounterId: string, selectedIds: string[]): void {
    try {
        if (selectedIds.length === 0) {
            localStorage.removeItem(getStorageKey(encounterId));
        } else {
            localStorage.setItem(getStorageKey(encounterId), JSON.stringify(selectedIds));
        }
    } catch {
        // Ignore storage errors (e.g., quota exceeded)
    }
}

/**
 * Configuration for useDMAssetSelection hook.
 */
export interface UseDMAssetSelectionConfig {
    /** The ID of the encounter */
    encounterId: string | undefined;
    /** Whether the current user is the DM (owner) */
    isDM: boolean;
    /** IDs to exclude from selection (e.g., DM Test Character ID) */
    excludeIds?: string[];
    /** Current user ID for player controlled asset check */
    userId?: string;
    /** All visible assets for canInteract check */
    visibleAssets?: Array<{ id: string; controlledBy?: string | null }>;
}

/**
 * Result of the useDMAssetSelection hook.
 */
export interface UseDMAssetSelectionResult {
    /** Currently selected asset IDs */
    selectedAssetIds: string[];
    /** Handle click on an asset (Ctrl for multi-select) */
    handleAssetClick: (assetId: string, isCtrlPressed: boolean) => void;
    /** Handle marquee selection complete */
    handleMarqueeComplete: (assetIds: string[], isCtrlPressed: boolean) => void;
    /** Clear all selection */
    clearSelection: () => void;
    /** Check if an asset is selected */
    isSelected: (assetId: string) => boolean;
    /** Check if user can interact with an asset */
    canInteract: (assetId: string) => boolean;
    /** Whether there's an active selection */
    hasSelection: boolean;
}

/**
 * Hook for managing DM asset selection in EncounterPage.
 *
 * Features:
 * - DM can select ANY asset
 * - Players can only select assets they control (controlledBy === userId)
 * - Supports single-click (replace selection) and Ctrl+click (add/toggle)
 * - Supports marquee multi-select
 * - Persists selection to localStorage per encounter
 * - Excludes specified IDs (e.g., DM Test Character)
 *
 * @param config - Hook configuration
 * @returns Selection state and controls
 */
export function useDMAssetSelection({
    encounterId,
    isDM,
    excludeIds = [],
    userId,
    visibleAssets = [],
}: UseDMAssetSelectionConfig): UseDMAssetSelectionResult {
    // ═══════════════════════════════════════════════════════════════════════════
    // STATE
    // ═══════════════════════════════════════════════════════════════════════════
    const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>(() => {
        if (!encounterId || !isDM) return [];
        return loadSelectionFromStorage(encounterId);
    });

    // ═══════════════════════════════════════════════════════════════════════════
    // REFS
    // ═══════════════════════════════════════════════════════════════════════════
    const prevEncounterIdRef = useRef<string | undefined>(undefined);
    const isFirstMountRef = useRef(true);

    // ═══════════════════════════════════════════════════════════════════════════
    // DERIVED STATE
    // ═══════════════════════════════════════════════════════════════════════════
    const excludeIdSet = useMemo(() => new Set(excludeIds), [excludeIds]);
    const hasSelection = selectedAssetIds.length > 0;

    // ═══════════════════════════════════════════════════════════════════════════
    // HANDLERS
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Check if user can interact with an asset.
     * DM can interact with anything.
     * Players can only interact with assets they control.
     */
    const canInteract = useCallback(
        (assetId: string): boolean => {
            if (isDM) return true;

            if (!userId) return false;

            const asset = visibleAssets.find(a => a.id === assetId);
            if (!asset) return false;

            return asset.controlledBy === userId;
        },
        [isDM, userId, visibleAssets]
    );

    /**
     * Check if an asset is currently selected.
     */
    const isSelected = useCallback(
        (assetId: string): boolean => selectedAssetIds.includes(assetId),
        [selectedAssetIds]
    );

    /**
     * Handle click on an asset.
     * - Simple click: Replace selection with this asset
     * - Ctrl+click: Add/toggle asset in selection
     */
    const handleAssetClick = useCallback(
        (assetId: string, isCtrlPressed: boolean): void => {
            // Check if user can interact
            if (!canInteract(assetId)) return;

            // Check if excluded
            if (excludeIdSet.has(assetId)) return;

            if (!encounterId) return;

            setSelectedAssetIds(prev => {
                let newSelection: string[];

                if (isCtrlPressed) {
                    // Toggle selection
                    if (prev.includes(assetId)) {
                        newSelection = prev.filter(id => id !== assetId);
                    } else {
                        newSelection = [...prev, assetId];
                    }
                } else {
                    // Replace selection
                    if (prev.length === 1 && prev[0] === assetId) {
                        // Click on only selected item - deselect
                        newSelection = [];
                    } else {
                        newSelection = [assetId];
                    }
                }

                // Persist to storage
                saveSelectionToStorage(encounterId, newSelection);
                return newSelection;
            });
        },
        [canInteract, excludeIdSet, encounterId]
    );

    /**
     * Handle marquee selection complete.
     * - Without Ctrl: Replace selection with marqueed assets
     * - With Ctrl: Add marqueed assets to selection
     */
    const handleMarqueeComplete = useCallback(
        (assetIds: string[], isCtrlPressed: boolean): void => {
            if (!encounterId) return;

            // Filter out excluded IDs and assets user can't interact with
            const validIds = assetIds.filter(
                id => !excludeIdSet.has(id) && canInteract(id)
            );

            if (validIds.length === 0 && !isCtrlPressed) {
                // Clear selection if no valid assets in marquee
                setSelectedAssetIds([]);
                saveSelectionToStorage(encounterId, []);
                return;
            }

            setSelectedAssetIds(prev => {
                let newSelection: string[];

                if (isCtrlPressed) {
                    // Add to existing selection (unique)
                    const combined = new Set([...prev, ...validIds]);
                    newSelection = Array.from(combined);
                } else {
                    // Replace selection
                    newSelection = validIds;
                }

                saveSelectionToStorage(encounterId, newSelection);
                return newSelection;
            });
        },
        [canInteract, excludeIdSet, encounterId]
    );

    /**
     * Clear all selection.
     */
    const clearSelection = useCallback((): void => {
        if (!encounterId) return;

        setSelectedAssetIds([]);
        saveSelectionToStorage(encounterId, []);
    }, [encounterId]);

    // ═══════════════════════════════════════════════════════════════════════════
    // EFFECTS
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Load selection from localStorage when encounter changes.
     */
    useEffect(() => {
        // Skip first mount - useState lazy initializer handled it
        if (isFirstMountRef.current) {
            isFirstMountRef.current = false;
            prevEncounterIdRef.current = encounterId;
            return;
        }

        // Only proceed if encounter changed
        if (prevEncounterIdRef.current === encounterId) {
            return;
        }

        prevEncounterIdRef.current = encounterId;

        if (!encounterId || !isDM) {
            // eslint-disable-next-line react-hooks/set-state-in-effect -- Syncing with external system (localStorage)
            setSelectedAssetIds([]);
            return;
        }

        // Load selection for new encounter
        const stored = loadSelectionFromStorage(encounterId);
        // eslint-disable-next-line react-hooks/set-state-in-effect -- Syncing with external system (localStorage)
        setSelectedAssetIds(stored);
    }, [encounterId, isDM]);

    /**
     * Clean up selection when assets are removed.
     * If a selected asset no longer exists in visibleAssets, remove it from selection.
     */
    useEffect(() => {
        if (!encounterId || selectedAssetIds.length === 0) return;

        const visibleIds = new Set(visibleAssets.map(a => a.id));
        const validSelection = selectedAssetIds.filter(id => visibleIds.has(id));

        if (validSelection.length !== selectedAssetIds.length) {
            // eslint-disable-next-line react-hooks/set-state-in-effect -- Syncing with external data (visibleAssets)
            setSelectedAssetIds(validSelection);
            saveSelectionToStorage(encounterId, validSelection);
        }
    }, [encounterId, selectedAssetIds, visibleAssets]);

    // ═══════════════════════════════════════════════════════════════════════════
    // RETURN
    // ═══════════════════════════════════════════════════════════════════════════
    return useMemo(
        () => ({
            selectedAssetIds,
            handleAssetClick,
            handleMarqueeComplete,
            clearSelection,
            isSelected,
            canInteract,
            hasSelection,
        }),
        [
            selectedAssetIds,
            handleAssetClick,
            handleMarqueeComplete,
            clearSelection,
            isSelected,
            canInteract,
            hasSelection,
        ]
    );
}
