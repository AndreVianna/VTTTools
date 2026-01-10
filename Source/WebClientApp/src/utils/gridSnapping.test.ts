import { describe, it, expect } from 'vitest';
import { snapToGridCenter } from './gridSnapping';
import { GridConfig, GridType } from '@/utils/gridCalculator';
import { SnapMode } from '@/utils/snapping';

describe('snapToGridCenter', () => {
    const mockGridConfig: GridConfig = {
        type: GridType.Square,
        cellSize: { width: 50, height: 50 },
        offset: { left: 0, top: 0 },
        snap: true,
        scale: 1,
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
            SnapMode.Full
        );
        expect(result).toEqual(position);
    });

    it('snaps a 1x1 asset to nearest grid center (Full Mode)', () => {
        const position = { x: 30, y: 30 };
        const result = snapToGridCenter(
            position,
            { width: 1, height: 1 },
            mockGridConfig,
            SnapMode.Full
        );

        expect(result).toEqual({ x: 25, y: 25 });
    });

    it('snaps a 1x1 asset to nearest grid center (Half Mode)', () => {
        const position = { x: 48, y: 48 };
        const result = snapToGridCenter(
            position,
            { width: 1, height: 1 },
            mockGridConfig,
            SnapMode.Half
        );
        expect(result).toEqual({ x: 50, y: 50 });
    });

    it('snaps a 2x2 large asset (Full Mode)', () => {
        const position = { x: 110, y: 110 };
        const result = snapToGridCenter(
            position,
            { width: 2, height: 2 },
            mockGridConfig,
            SnapMode.Full
        );
        expect(result).toEqual({ x: 100, y: 100 });
    });

    it('handles grid offset correctly', () => {
        const position = { x: 60, y: 40 };
        const result = snapToGridCenter(
            position,
            { width: 1, height: 1 },
            mockNonZeroOffsetGridConfig,
            SnapMode.Full
        );
        expect(result).toEqual({ x: 50, y: 35 });
    });

    it('snaps small 0.5x0.5 asset with finer granularity', () => {
        const position = { x: 15, y: 15 };
        const result = snapToGridCenter(
            position,
            { width: 0.5, height: 0.5 },
            mockGridConfig,
            SnapMode.Full
        );
        expect(result).toEqual({ x: 12.5, y: 12.5 });
    });
});
