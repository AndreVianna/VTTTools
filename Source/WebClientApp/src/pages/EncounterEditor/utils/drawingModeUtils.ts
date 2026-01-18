import type { DrawingMode } from '@components/encounter';
import type { InteractionScope } from '@utils/scopeFiltering';

type RegionPlacementMode = 'polygon' | 'bucketFill';

/**
 * Determines the current drawing mode based on active scope and region placement mode.
 * Extracted for readability and testability.
 */
export function getDrawingMode(
    activeScope: InteractionScope,
    regionPlacementMode: RegionPlacementMode
): DrawingMode {
    switch (activeScope) {
        case 'walls':
            return 'wall';
        case 'regions':
            return regionPlacementMode === 'polygon' ? 'region' : 'bucketFill';
        case 'lights':
            return 'light';
        case 'sounds':
            return 'sound';
        default:
            return null;
    }
}

/**
 * Determines if a drawing tool is currently active.
 */
export function isDrawingToolActive(
    drawingMode: DrawingMode,
    drawingWallIndex: number | null,
    drawingRegionIndex: number | null,
    fogDrawingTool: 'polygon' | 'bucketFill' | null
): boolean {
    const isDrawingWall = drawingMode === 'wall' && drawingWallIndex !== null;
    const isDrawingRegion = drawingMode === 'region' && drawingRegionIndex !== null;
    const isDrawingBucketFill = drawingMode === 'bucketFill' && drawingRegionIndex !== null;
    return isDrawingWall || isDrawingRegion || isDrawingBucketFill || fogDrawingTool !== null;
}
