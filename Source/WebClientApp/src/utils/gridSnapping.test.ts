import { describe, it, expect } from 'vitest';
import { snapToGridCenter } from './gridSnapping';
import { GridConfig, GridType } from '@/utils/gridCalculator';
import { SnapMode } from '@/utils/snapping';

describe('snapToGridCenter', () => {
    const mockGridConfig: GridConfig = {
        type: GridType.Square,
        cellSize: { width: 50, height: 50 },
        offset: { left: 0, top: 0 },
        color: '#000000',
        opacity: 0.5,
    };

    const mockNonZeroOffsetGridConfig: GridConfig = {
        ...mockGridConfig,
        offset: { left: 25, top: 10 },
    };

    it('preserves position when SnapMode is Free', () => {
        const position = { x: 123, y: 456 };
        const result = snapToGridCenter(
            position,
            { width: 1, height: 1 },
            mockGridConfig,
            SnapMode.Free
        );
        expect(result).toEqual(position);
    });

    it('preserves position when GridType is NoGrid', () => {
        const position = { x: 123, y: 456 };
        const noGridConfig = { ...mockGridConfig, type: GridType.NoGrid };
        const result = snapToGridCenter(
            position,
            { width: 1, height: 1 },
            noGridConfig,
            SnapMode.Default
        );
        expect(result).toEqual(position);
    });

    it('snaps a 1x1 asset to nearest grid center (Default Mode)', () => {
        // 1x1 asset (50x50px). Center should snap to 25, 75, 125...
        // Input 30, 30 -> Should snap to 25, 25 (center of 0,0 cell)
        const position = { x: 30, y: 30 };
        const result = snapToGridCenter(
            position,
            { width: 1, height: 1 },
            mockGridConfig,
            SnapMode.Default
        );

        // Center of first cell (0-50, 0-50) is 25,25
        expect(result).toEqual({ x: 25, y: 25 });
    });

    it('snaps a 1x1 asset to nearest grid center (Half Mode)', () => {
        // Half mode allows snapping to 0, 25, 50, 75...
        // Input 48, 48 -> Should snap to 50, 50 (grid line intersection)
        const position = { x: 48, y: 48 };
        const result = snapToGridCenter(
            position,
            { width: 1, height: 1 },
            mockGridConfig,
            SnapMode.Half
        );
        // With 1x1 asset, default snap is 1.0 cells (50px).
        // Half mode snap is 0.5 cells (25px).
        // Asset center offset is 25px.
        // 48 - 25 = 23. Round(23/25)*25 = 1*25 = 25. + 25 = 50.
        expect(result).toEqual({ x: 50, y: 50 });
    });

    it('snaps a 2x2 large asset (Default Mode)', () => {
        // 2x2 asset (100x100px).
        // Center offset = 50px (1 cell).
        // Input 110, 110.
        // X: 110 - 50 = 60. Snap int 50. Round(60/50)*50 = 1*50 = 50. + 50 = 100.
        // Should snap to grid intersection at 100,100 (which is center of the 2x2 block 50-150)
        const position = { x: 110, y: 110 };
        const result = snapToGridCenter(
            position,
            { width: 2, height: 2 },
            mockGridConfig,
            SnapMode.Default
        );
        expect(result).toEqual({ x: 100, y: 100 });
    });

    it('handles grid offset correctly', () => {
        // Offset X=25, Y=10.
        // 1x1 asset. Center offset 25, 25.
        // Total offset X = 50, Y = 35.
        // Input 60, 40.
        // X: 60 - 50 = 10. Round(10/50)*50 = 0. + 50 = 50.
        // Y: 40 - 35 = 5. Round(5/50)*50 = 0. + 35 = 35.
        const position = { x: 60, y: 40 };
        const result = snapToGridCenter(
            position,
            { width: 1, height: 1 },
            mockNonZeroOffsetGridConfig,
            SnapMode.Default
        );
        expect(result).toEqual({ x: 50, y: 35 });
    });

    it('snaps small 0.5x0.5 asset with finer granularity', () => {
        // 0.5x0.5 asset. <=0.5 so base snap is 0.5 cells (25px).
        // Center offset = 12.5px.
        // Input 15, 15.
        // X: 15 - 12.5 = 2.5. Snap 25. Round(0.1) = 0. + 12.5 = 12.5.
        const position = { x: 15, y: 15 };
        const result = snapToGridCenter(
            position,
            { width: 0.5, height: 0.5 },
            mockGridConfig,
            SnapMode.Default
        );
        expect(result).toEqual({ x: 12.5, y: 12.5 });
    });
});
