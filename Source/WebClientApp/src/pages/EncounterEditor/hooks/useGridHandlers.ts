import { useCallback } from 'react';

import type { GridConfig } from '@/utils/gridCalculator';

interface UseGridHandlersProps {
    setGridConfig: (grid: GridConfig) => void;
    saveChanges: (overrides?: Partial<{
        name: string;
        description: string;
        grid: GridConfig;
        isPublished: boolean;
    }>) => Promise<void>;
}

export const useGridHandlers = ({
    setGridConfig,
    saveChanges
}: UseGridHandlersProps) => {

    const handleGridChange = useCallback((newGrid: GridConfig) => {
        setGridConfig(newGrid);
        saveChanges({ grid: newGrid });
    }, [setGridConfig, saveChanges]);

    return {
        handleGridChange
    };
};
