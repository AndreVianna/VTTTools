import React, { createContext, useContext, useCallback, useEffect, useState } from 'react';
import type { Command } from '@/utils/commands';

interface UndoRedoState {
    past: Command[];
    future: Command[];
}

interface UndoRedoContextValue {
    canUndo: boolean;
    canRedo: boolean;
    execute: (command: Command) => Promise<void>;
    recordAction: (command: Command) => void;
    undo: () => Promise<void>;
    redo: () => Promise<void>;
    clear: () => void;
}

const UndoRedoContext = createContext<UndoRedoContextValue | null>(null);

const MAX_HISTORY_SIZE = 100;

interface UndoRedoProviderProps {
    children: React.ReactNode;
    maxHistorySize?: number;
}

export const UndoRedoProvider: React.FC<UndoRedoProviderProps> = ({
    children,
    maxHistorySize = MAX_HISTORY_SIZE,
}) => {
    const [state, setState] = useState<UndoRedoState>({
        past: [],
        future: [],
    });

    const execute = useCallback(async (command: Command) => {
        console.log('[UNDO DEBUG] UndoRedoContext.execute() - Adding command to history:', command.description);
        const result = command.execute();
        if (result instanceof Promise) {
            await result;
        }

        setState((prev) => {
            const newPast = [...prev.past, command];
            if (newPast.length > maxHistorySize) {
                newPast.shift();
            }

            console.log('[UNDO DEBUG] UndoRedoContext - History updated. Past length:', newPast.length);

            return {
                past: newPast,
                future: [],
            };
        });
    }, [maxHistorySize]);

    const recordAction = useCallback((command: Command) => {
        console.log('[UNDO DEBUG] UndoRedoContext.recordAction() - Recording without executing:', command.description);
        setState((prev) => {
            const newPast = [...prev.past, command];
            if (newPast.length > maxHistorySize) {
                newPast.shift();
            }

            console.log('[UNDO DEBUG] UndoRedoContext - History updated. Past length:', newPast.length);

            return {
                past: newPast,
                future: [],
            };
        });
    }, [maxHistorySize]);

    const undo = useCallback(async () => {
        let commandToUndo: Command | undefined;

        setState((prev) => {
            console.log('[UNDO DEBUG] UndoRedoContext.undo() - Current history length:', prev.past.length);
            if (prev.past.length === 0) {
                console.log('[UNDO DEBUG] UndoRedoContext.undo() - No commands to undo');
                return prev;
            }

            const newPast = [...prev.past];
            commandToUndo = newPast.pop();

            if (commandToUndo === undefined) {
                return prev;
            }

            console.log('[UNDO DEBUG] UndoRedoContext.undo() - Undoing command:', commandToUndo.description);

            return {
                past: newPast,
                future: [commandToUndo, ...prev.future],
            };
        });

        if (commandToUndo) {
            console.log('[UNDO DEBUG] UndoRedoContext.undo() - Calling command.undo()');
            const result = commandToUndo.undo();
            if (result instanceof Promise) {
                await result;
            }
            console.log('[UNDO DEBUG] UndoRedoContext.undo() - command.undo() completed');
        }
    }, []);

    const redo = useCallback(async () => {
        // Get the command to redo BEFORE calling setState
        let commandToRedo: Command | undefined;

        setState((prev) => {
            if (prev.future.length === 0) {
                return prev;
            }

            const newFuture = [...prev.future];
            commandToRedo = newFuture.shift();

            if (commandToRedo === undefined) {
                return prev;
            }

            return {
                past: [...prev.past, commandToRedo],
                future: newFuture,
            };
        });

        // Execute the redo OUTSIDE of setState to prevent double execution
        if (commandToRedo) {
            const result = commandToRedo.execute();
            if (result instanceof Promise) {
                await result;
            }
        }
    }, []);

    const clear = useCallback(() => {
        setState({
            past: [],
            future: [],
        });
    }, []);

    useEffect(() => {
        const handleKeyDown = async (e: KeyboardEvent) => {
            const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
            const modifier = isMac ? e.metaKey : e.ctrlKey;

            console.log('[UNDO DEBUG] UndoRedoContext keydown event:', {
                key: e.key,
                ctrlKey: e.ctrlKey,
                metaKey: e.metaKey,
                shiftKey: e.shiftKey,
                modifier,
                isMac
            });

            if (modifier && e.key === 'z' && !e.shiftKey) {
                console.log('[UNDO DEBUG] UndoRedoContext - Ctrl+Z detected, calling undo()');
                e.preventDefault();
                await undo();
            } else if (modifier && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
                console.log('[UNDO DEBUG] UndoRedoContext - Ctrl+Y/Ctrl+Shift+Z detected, calling redo()');
                e.preventDefault();
                await redo();
            }
        };

        console.log('[UNDO DEBUG] UndoRedoContext - Registering keydown listener');
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            console.log('[UNDO DEBUG] UndoRedoContext - Removing keydown listener');
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [undo, redo]);

    const value: UndoRedoContextValue = {
        canUndo: state.past.length > 0,
        canRedo: state.future.length > 0,
        execute,
        recordAction,
        undo,
        redo,
        clear,
    };

    return (
        <UndoRedoContext.Provider value={value}>
            {children}
        </UndoRedoContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useUndoRedoContext = (): UndoRedoContextValue => {
    const context = useContext(UndoRedoContext);

    if (context === null) {
        throw new Error('useUndoRedoContext must be used within UndoRedoProvider');
    }

    return context;
};
