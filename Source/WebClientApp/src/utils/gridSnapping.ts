import { GridConfig, GridType } from '@/utils/gridCalculator';
import { SnapMode } from '@/utils/snapping';

/**
 * Snap position to grid based on asset size and snap mode
 * - Small assets (<= 0.5 cell): Base snap 0.5 cells
 * - Medium/Large assets (> 0.5 cell): Base snap 1 cell
 * - Half-step mode: Divides base by 2 (0.25 for small, 0.5 for medium+)
 * - Each dimension calculated independently
 */
export const snapToGridCenter = (
    position: { x: number; y: number },
    assetSize: { width: number; height: number },
    gridConfig: GridConfig,
    snapMode: SnapMode,
): { x: number; y: number } => {
    if (snapMode === SnapMode.Free || gridConfig.type === GridType.NoGrid) {
        return position;
    }

    const { cellSize, offset } = gridConfig;
    const { width: cellWidth, height: cellHeight } = cellSize;
    const { left: offsetX, top: offsetY } = offset;

    // Base snap interval per dimension: <= 0.5 → 0.5 cells, > 0.5 → 1.0 cells
    const getBaseSnapIntervalCells = (sizeInCells: number) => (sizeInCells <= 0.5 ? 0.5 : 1.0);

    const baseSnapWidthCells = getBaseSnapIntervalCells(assetSize.width);
    const baseSnapHeightCells = getBaseSnapIntervalCells(assetSize.height);

    // Apply mode multiplier: Half mode halves the snap interval
    const multiplier = snapMode === SnapMode.Half ? 0.5 : 1.0;
    const snapWidthCells = baseSnapWidthCells * multiplier;
    const snapHeightCells = baseSnapHeightCells * multiplier;

    // Convert to pixels
    const snapWidth = snapWidthCells * cellWidth;
    const snapHeight = snapHeightCells * cellHeight;

    // Offset = half asset size (so asset boundaries align with grid)
    const offsetWidthPixels = (assetSize.width / 2) * cellWidth;
    const offsetHeightPixels = (assetSize.height / 2) * cellHeight;

    // Find nearest snap position
    const snapX =
        Math.round((position.x - offsetX - offsetWidthPixels) / snapWidth) * snapWidth + offsetX + offsetWidthPixels;
    const snapY =
        Math.round((position.y - offsetY - offsetHeightPixels) / snapHeight) * snapHeight + offsetY + offsetHeightPixels;

    return { x: snapX, y: snapY };
};
