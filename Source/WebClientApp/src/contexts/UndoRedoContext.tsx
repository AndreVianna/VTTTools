import React, { createContext, useContext, useCallback, useEffect, useState } from 'react';
import type { Command } from '@/utils/commands';

interface UndoRedoState {
    past: Command[];
    future: Command[];
}

interface UndoRedoContextValue {
    canUndo: boolean;
    canRedo: boolean;
    execute: (command: Command) => void;
    undo: () => void;
    redo: () => void;
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

    const execute = useCallback((command: Command) => {
        command.execute();

        setState((prev) => {
            const newPast = [...prev.past, command];
            if (newPast.length > maxHistorySize) {
                newPast.shift();
            }

            return {
                past: newPast,
                future: [],
            };
        });
    }, [maxHistorySize]);

    const undo = useCallback(() => {
        setState((prev) => {
            if (prev.past.length === 0) {
                return prev;
            }

            const newPast = [...prev.past];
            const command = newPast.pop();

            if (command === undefined) {
                return prev;
            }

            command.undo();

            return {
                past: newPast,
                future: [command, ...prev.future],
            };
        });
    }, []);

    const redo = useCallback(() => {
        setState((prev) => {
            if (prev.future.length === 0) {
                return prev;
            }

            const newFuture = [...prev.future];
            const command = newFuture.shift();

            if (command === undefined) {
                return prev;
            }

            command.execute();

            return {
                past: [...prev.past, command],
                future: newFuture,
            };
        });
    }, []);

    const clear = useCallback(() => {
        setState({
            past: [],
            future: [],
        });
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
            const modifier = isMac ? e.metaKey : e.ctrlKey;

            if (modifier && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                undo();
            } else if (modifier && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
                e.preventDefault();
                redo();
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [undo, redo]);

    const value: UndoRedoContextValue = {
        canUndo: state.past.length > 0,
        canRedo: state.future.length > 0,
        execute,
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
