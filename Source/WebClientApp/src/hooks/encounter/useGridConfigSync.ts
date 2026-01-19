import { useEffect, useState } from 'react';
import { type GridConfig, GridType, getDefaultGrid } from '@/utils/gridCalculator';
import type { Encounter } from '@/types/domain';

export interface UseGridConfigSyncProps {
    encounter: Encounter | undefined;
}

export interface UseGridConfigSyncResult {
    gridConfig: GridConfig;
    setGridConfig: React.Dispatch<React.SetStateAction<GridConfig>>;
}

/**
 * Hook to sync grid config from encounter.stage.grid.
 * Converts backend grid type (string) to frontend GridType enum and
 * maintains local state for grid configuration.
 *
 * @example
 * const { gridConfig, setGridConfig } = useGridConfigSync({ encounter });
 *
 * <GridRenderer
 *     grid={gridConfig}
 *     stageWidth={stageSize.width}
 *     stageHeight={stageSize.height}
 *     visible={gridConfig.type !== GridType.NoGrid}
 * />
 */
export const useGridConfigSync = ({ encounter }: UseGridConfigSyncProps): UseGridConfigSyncResult => {
    const [gridConfig, setGridConfig] = useState<GridConfig>(getDefaultGrid());

    useEffect(() => {
        if (encounter?.stage?.grid) {
            const stageGrid = encounter.stage.grid;
            const gridType = typeof stageGrid.type === 'string'
                ? GridType[stageGrid.type as keyof typeof GridType]
                : stageGrid.type;
            setGridConfig({
                type: gridType,
                cellSize: stageGrid.cellSize,
                offset: stageGrid.offset,
                snap: gridType !== GridType.NoGrid, // snap is UI-only
                scale: stageGrid.scale ?? 1,
            });
        }
    }, [encounter]);

    return { gridConfig, setGridConfig };
};
