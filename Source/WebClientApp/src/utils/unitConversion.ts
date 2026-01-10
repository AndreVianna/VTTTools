import type { GridConfig } from './gridCalculator';
import { UnitSystem, UNIT_CONFIGS } from '@/types/units';

export function pixelsToUnits(pixels: number, gridConfig: GridConfig): number {
    const cellSizePixels = Math.min(gridConfig.cellSize.width, gridConfig.cellSize.height);
    return (pixels / cellSizePixels) * gridConfig.scale;
}

export function unitsToPixels(units: number, gridConfig: GridConfig): number {
    const cellSizePixels = Math.min(gridConfig.cellSize.width, gridConfig.cellSize.height);
    return (units / gridConfig.scale) * cellSizePixels;
}

export function formatDistance(
    pixels: number,
    gridConfig: GridConfig,
    unitSystem: UnitSystem,
    precision: number = 1,
): string {
    const units = pixelsToUnits(pixels, gridConfig);
    const config = UNIT_CONFIGS[unitSystem];
    return `${units.toFixed(precision)} ${config.abbreviation}`;
}

export function formatCellDistance(
    cells: number,
    gridConfig: GridConfig,
    unitSystem: UnitSystem,
): string {
    const units = cells * gridConfig.scale;
    const config = UNIT_CONFIGS[unitSystem];
    return `${units} ${config.abbreviation}`;
}
