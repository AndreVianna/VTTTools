import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Point } from '@/types/domain';
import type { GridConfig } from '@/utils/gridCalculator';
import { snap, SnapMode } from '@/utils/snapping';

/**
 * Storage key prefix for DM test character position.
 * Full key is: vtt:dmTestCharacter:{encounterId}
 */
const STORAGE_KEY_PREFIX = 'vtt:dmTestCharacter:';

/**
 * Get the storage key for an encounter.
 */
function getStorageKey(encounterId: string): string {
    return `${STORAGE_KEY_PREFIX}${encounterId}`;
}

/**
 * Configuration for useDMTestCharacter hook.
 */
export interface UseDMTestCharacterConfig {
    /** The ID of the encounter */
    encounterId: string | undefined;
    /** Whether the current user is the DM (owner) */
    isDM: boolean;
    /** Grid configuration for snapping */
    gridConfig: GridConfig;
    /** Stage size for calculating default position */
    stageSize: { width: number; height: number };
    /** Currently active creature character ID from useActiveCharacter */
    activeCharacterId: string | null;
    /** Callback to set active character (for mutual exclusion) */
    setActiveCharacter: (id: string | null) => void;
}

/**
 * Result of the useDMTestCharacter hook.
 */
export interface UseDMTestCharacterResult {
    /** Current position of the DM test character in pixels */
    position: Point;
    /** Update the position (called when dragged) */
    setPosition: (position: Point) => void;
    /** Whether the DM test character is currently selected as listener */
    isSelected: boolean;
    /** Select the DM test character as the active listener */
    select: () => void;
}

/**
 * Calculate the default position (center of stage, snapped to grid).
 */
function calculateDefaultPosition(
    stageSize: { width: number; height: number },
    gridConfig: GridConfig
): Point {
    const centerPoint: Point = {
        x: stageSize.width / 2,
        y: stageSize.height / 2,
    };
    return snap(centerPoint, gridConfig, SnapMode.Full);
}

/**
 * Load position from localStorage.
 */
function loadPositionFromStorage(encounterId: string): Point | null {
    try {
        const stored = localStorage.getItem(getStorageKey(encounterId));
        if (stored) {
            const parsed = JSON.parse(stored) as { x: number; y: number };
            if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
                return parsed;
            }
        }
    } catch {
        // Ignore parse errors
    }
    return null;
}

/**
 * Save position to localStorage.
 */
function savePositionToStorage(encounterId: string, position: Point): void {
    try {
        localStorage.setItem(getStorageKey(encounterId), JSON.stringify(position));
    } catch {
        // Ignore storage errors (e.g., quota exceeded)
    }
}

/**
 * Hook to manage the DM test character for testing player-perspective features.
 *
 * The DM test character is a virtual character that allows the DM/Editor to
 * experience the encounter from a player's perspective. It can be used as
 * the listener position for spatial audio and (in the future) for testing
 * line of sight and fog of war.
 *
 * Features:
 * - Frontend-only (not persisted to backend)
 * - Position persisted to localStorage per encounter
 * - Grid snapping on position change
 * - Mutually exclusive selection with creature characters
 * - Only visible/functional for DM (encounter owner)
 *
 * Selection model:
 * - When DM test character is selected, any active creature is deselected
 * - When a creature is selected, DM test character is deselected
 * - Only one can be selected at a time for spatial audio listener
 *
 * @param config - Hook configuration
 * @returns DM test character state and controls
 */
export function useDMTestCharacter({
    encounterId,
    isDM,
    gridConfig,
    stageSize,
    activeCharacterId,
    setActiveCharacter,
}: UseDMTestCharacterConfig): UseDMTestCharacterResult {
    // ═══════════════════════════════════════════════════════════════════════════
    // STATE
    // ═══════════════════════════════════════════════════════════════════════════
    const [position, setPositionState] = useState<Point>(() => {
        // Initialize from localStorage or default to center
        if (!encounterId || !isDM) {
            return calculateDefaultPosition(stageSize, gridConfig);
        }
        const stored = loadPositionFromStorage(encounterId);
        return stored ?? calculateDefaultPosition(stageSize, gridConfig);
    });

    const [isSelected, setIsSelected] = useState(false);

    // ═══════════════════════════════════════════════════════════════════════════
    // REFS
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Track previous encounterId to detect encounter changes.
     */
    const prevEncounterIdRef = useRef<string | undefined>(undefined);
    const isFirstMountRef = useRef(true);

    // ═══════════════════════════════════════════════════════════════════════════
    // HANDLERS
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Set the position with grid snapping and localStorage persistence.
     */
    const setPosition = useCallback(
        (newPosition: Point) => {
            if (!isDM || !encounterId) return;

            // Snap to grid center
            const snappedPosition = snap(newPosition, gridConfig, SnapMode.Full);
            setPositionState(snappedPosition);

            // Persist to localStorage
            savePositionToStorage(encounterId, snappedPosition);
        },
        [isDM, encounterId, gridConfig]
    );

    /**
     * Select the DM test character as the active listener.
     * This deselects any active creature character.
     */
    const select = useCallback(() => {
        if (!isDM) return;

        setIsSelected(true);
        // Deselect any active creature for mutual exclusion
        setActiveCharacter(null);
    }, [isDM, setActiveCharacter]);

    // ═══════════════════════════════════════════════════════════════════════════
    // EFFECTS
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Load position from localStorage when encounter changes.
     * Skip first mount (useState lazy initializer handles that).
     */
    useEffect(() => {
        // Skip first mount - useState lazy initializer already loaded from localStorage
        if (isFirstMountRef.current) {
            isFirstMountRef.current = false;
            prevEncounterIdRef.current = encounterId;
            return;
        }

        if (!encounterId || !isDM) {
            prevEncounterIdRef.current = encounterId;
            return;
        }

        // Load position for new encounter
        const stored = loadPositionFromStorage(encounterId);
        // eslint-disable-next-line react-hooks/set-state-in-effect -- Syncing with external system (localStorage)
        setPositionState(stored ?? calculateDefaultPosition(stageSize, gridConfig));

        // Reset selection when encounter changes
        setIsSelected(false);

        prevEncounterIdRef.current = encounterId;
    }, [encounterId, isDM, stageSize, gridConfig]);

    /**
     * Deselect DM test character when a creature is selected.
     * This ensures mutual exclusion between DM test character and creatures.
     */
    useEffect(() => {
        if (activeCharacterId !== null && isSelected) {
            // eslint-disable-next-line react-hooks/set-state-in-effect -- Syncing selection state with activeCharacter
            setIsSelected(false);
        }
    }, [activeCharacterId, isSelected]);

    // ═══════════════════════════════════════════════════════════════════════════
    // RETURN
    // ═══════════════════════════════════════════════════════════════════════════
    return useMemo(
        () => ({
            position,
            setPosition,
            isSelected,
            select,
        }),
        [position, setPosition, isSelected, select]
    );
}
