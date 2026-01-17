import { useEffect } from 'react';

export interface TransactionState {
    /** Whether a transaction is currently active */
    isActive: boolean;
}

export interface LocalUndoRedo {
    /** Check if local undo is available */
    canUndoLocal: () => boolean;
    /** Check if local redo is available */
    canRedoLocal: () => boolean;
    /** Perform local undo */
    undoLocal: () => void;
    /** Perform local redo */
    redoLocal: () => void;
    /** Current transaction state */
    transaction: TransactionState;
}

export interface UseKeyboardShortcutsProps {
    /** Wall transaction controller for local undo/redo */
    wallTransaction: LocalUndoRedo;
    /** Region transaction controller for local undo/redo */
    regionTransaction: LocalUndoRedo;
    /** Global undo function */
    undo: () => Promise<void>;
    /** Global redo function */
    redo: () => Promise<void>;
}

/**
 * Hook to handle keyboard shortcuts for undo/redo operations.
 * Supports both global undo/redo and local transaction-scoped undo/redo.
 */
export function useKeyboardShortcuts({
    wallTransaction,
    regionTransaction,
    undo,
    redo,
}: UseKeyboardShortcutsProps): void {
    useEffect(() => {
        const handleKeyDown = async (e: KeyboardEvent) => {
            // Skip if typing in input fields
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                return;
            }

            const isWallTransactionActive = wallTransaction.transaction.isActive;
            const isRegionTransactionActive = regionTransaction.transaction.isActive;
            const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
            const modifier = isMac ? e.metaKey : e.ctrlKey;

            // Undo: Ctrl/Cmd + Z (without Shift)
            if (modifier && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                e.stopImmediatePropagation();

                if (isWallTransactionActive && wallTransaction.canUndoLocal()) {
                    wallTransaction.undoLocal();
                } else if (isRegionTransactionActive && regionTransaction.canUndoLocal()) {
                    regionTransaction.undoLocal();
                } else {
                    await undo();
                }
                return;
            }

            // Redo: Ctrl/Cmd + Y or Ctrl/Cmd + Shift + Z
            if (modifier && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
                e.preventDefault();
                e.stopImmediatePropagation();

                if (isWallTransactionActive && wallTransaction.canRedoLocal()) {
                    wallTransaction.redoLocal();
                } else if (isRegionTransactionActive && regionTransaction.canRedoLocal()) {
                    regionTransaction.redoLocal();
                } else {
                    await redo();
                }
                return;
            }
        };

        window.addEventListener('keydown', handleKeyDown, { capture: true });

        return () => {
            window.removeEventListener('keydown', handleKeyDown, { capture: true });
        };
    }, [wallTransaction, regionTransaction, undo, redo]);
}
