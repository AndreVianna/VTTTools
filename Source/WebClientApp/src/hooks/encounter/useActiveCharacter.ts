import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AssetKind, type PlacedAsset, type Point } from '@/types/domain';

/**
 * Storage key prefix for active character selection.
 * Full key is: vtt:activeCharacter:{encounterId}
 */
const STORAGE_KEY_PREFIX = 'vtt:activeCharacter:';

/**
 * Get the storage key for an encounter.
 */
function getStorageKey(encounterId: string): string {
    return `${STORAGE_KEY_PREFIX}${encounterId}`;
}

/**
 * Props for useActiveCharacter hook.
 */
export interface UseActiveCharacterProps {
    /** The ID of the encounter */
    encounterId: string | undefined;
    /** All visible assets in the encounter */
    visibleAssets: PlacedAsset[];
}

/**
 * Result of the useActiveCharacter hook.
 */
export interface UseActiveCharacterResult {
    /** ID of the currently active character (PlacedAsset.id) */
    activeCharacterId: string | null;
    /** Position of the active character in pixels */
    activeCharacterPosition: Point | null;
    /** List of creatures that can be selected (Characters and Creatures) */
    selectableCreatures: PlacedAsset[];
    /** Set the active character by ID */
    setActiveCharacter: (assetId: string | null) => void;
    /** Check if an asset is the active character */
    isActiveCharacter: (assetId: string) => boolean;
    /** The active character asset object */
    activeCharacter: PlacedAsset | null;
}

/**
 * Check if an asset is a creature (Character or Creature kind).
 * These are the only asset types that can be selected as the listener for spatial audio.
 */
function isCreatureAsset(asset: PlacedAsset): boolean {
    const kind = asset.asset?.classification?.kind;
    return kind === AssetKind.Character || kind === AssetKind.Creature;
}

/**
 * Hook to track which creature is the "listener" for spatial audio.
 *
 * Features:
 * - Store selection in localStorage (persists across page reloads)
 * - Auto-clear selection if the creature is removed from the encounter
 * - Filters only Characters and Creatures (not Effects or Objects)
 * - Position updates automatically when the selected creature moves
 *
 * Phase A: DM can select any creature (all creatures are selectable)
 * Phase B: Players will be restricted to creatures they control (ControlledBy field)
 *
 * @param props - Hook configuration
 * @returns Active character state and controls
 */
export function useActiveCharacter({
    encounterId,
    visibleAssets,
}: UseActiveCharacterProps): UseActiveCharacterResult {
    // ═══════════════════════════════════════════════════════════════════════════
    // STATE
    // ═══════════════════════════════════════════════════════════════════════════
    const [activeCharacterId, setActiveCharacterIdState] = useState<string | null>(() => {
        // Initialize from localStorage on first mount
        if (!encounterId) return null;
        try {
            return localStorage.getItem(getStorageKey(encounterId));
        } catch {
            return null;
        }
    });

    // ═══════════════════════════════════════════════════════════════════════════
    // REFS
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Track previous encounterId to detect encounter changes.
     * Initialized to undefined to detect first mount vs subsequent changes.
     */
    const prevEncounterIdRef = useRef<string | undefined>(undefined);
    const isFirstMountRef = useRef(true);

    // ═══════════════════════════════════════════════════════════════════════════
    // DERIVED STATE
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Filter to only creatures (Characters and Creatures).
     * Phase A: All creatures are selectable (DM mode).
     */
    const selectableCreatures = useMemo((): PlacedAsset[] => {
        return visibleAssets.filter(isCreatureAsset);
    }, [visibleAssets]);

    /**
     * Find the active character from the selectable creatures.
     */
    const activeCharacter = useMemo((): PlacedAsset | null => {
        if (!activeCharacterId) return null;
        return selectableCreatures.find((c) => c.id === activeCharacterId) ?? null;
    }, [activeCharacterId, selectableCreatures]);

    /**
     * Get the position of the active character.
     * Returns null if no character is selected.
     */
    const activeCharacterPosition = useMemo((): Point | null => {
        if (!activeCharacter) return null;

        // Return the center of the asset
        return {
            x: activeCharacter.position.x + activeCharacter.size.width / 2,
            y: activeCharacter.position.y + activeCharacter.size.height / 2,
        };
    }, [activeCharacter]);

    // ═══════════════════════════════════════════════════════════════════════════
    // HANDLERS
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Set the active character by ID.
     * Persists to localStorage for the current encounter.
     */
    const setActiveCharacter = useCallback(
        (assetId: string | null) => {
            setActiveCharacterIdState(assetId);

            // Persist to localStorage
            if (!encounterId) return;
            try {
                if (assetId) {
                    localStorage.setItem(getStorageKey(encounterId), assetId);
                } else {
                    localStorage.removeItem(getStorageKey(encounterId));
                }
            } catch {
                // Ignore localStorage errors (e.g., quota exceeded)
            }
        },
        [encounterId]
    );

    /**
     * Check if an asset is the currently active character.
     */
    const isActiveCharacter = useCallback(
        (assetId: string): boolean => {
            return activeCharacterId === assetId;
        },
        [activeCharacterId]
    );

    // ═══════════════════════════════════════════════════════════════════════════
    // EFFECTS
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Load selection from localStorage when encounter changes.
     * Skips first mount (useState lazy initializer handles that).
     */
    useEffect(() => {
        // Skip first mount - useState lazy initializer already loaded from localStorage
        if (isFirstMountRef.current) {
            isFirstMountRef.current = false;
            prevEncounterIdRef.current = encounterId;
            return;
        }

        if (!encounterId) {
            // eslint-disable-next-line react-hooks/set-state-in-effect -- Syncing with external system (localStorage)
            setActiveCharacterIdState(null);
            return;
        }

        try {
            const stored = localStorage.getItem(getStorageKey(encounterId));
            setActiveCharacterIdState(stored);
        } catch {
            setActiveCharacterIdState(null);
        }
    }, [encounterId]);

    /**
     * Auto-clear selection if the creature is removed from the encounter.
     * Skips when encounter just changed (encounterId effect handles loading).
     */
    useEffect(() => {
        // Skip auto-clear if encounter just changed - the encounterId effect handles loading
        const encounterJustChanged = prevEncounterIdRef.current !== encounterId;
        prevEncounterIdRef.current = encounterId;

        if (encounterJustChanged) {
            return;
        }

        if (!activeCharacterId) return;

        const isStillAvailable = selectableCreatures.some((c) => c.id === activeCharacterId);
        if (!isStillAvailable) {
            // eslint-disable-next-line react-hooks/set-state-in-effect -- Syncing state when creature removed from encounter
            setActiveCharacter(null);
        }
    }, [activeCharacterId, selectableCreatures, setActiveCharacter, encounterId]);

    return {
        activeCharacterId,
        activeCharacterPosition,
        selectableCreatures,
        setActiveCharacter,
        isActiveCharacter,
        activeCharacter,
    };
}
