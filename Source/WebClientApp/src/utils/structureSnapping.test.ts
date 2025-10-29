import { describe, it, expect } from 'vitest';
import { snapToNearest, getSnapTargets, SnapMode } from './structureSnapping';
import type { GridConfig } from '@/utils/gridCalculator';
import { GridType } from '@/utils/gridCalculator';

describe('structureSnapping', () => {
    const gridConfig: GridConfig = {
        type: GridType.Square,
        cellSize: { width: 50, height: 50 },
        offset: { left: 0, top: 0 },
        snap: true
    };

    describe('getSnapTargets', () => {
        it('returns empty array in Free mode', () => {
            const targets = getSnapTargets(0, 0, gridConfig, SnapMode.Free);
            expect(targets).toHaveLength(0);
        });

        it('returns 4 corners in any snap mode', () => {
            const targets = getSnapTargets(0, 0, gridConfig, SnapMode.HalfSnap);
            const corners = targets.filter(t => t.type === 'corner');
            expect(corners).toHaveLength(4);
        });

        it('includes edge midpoints and center in HalfSnap mode', () => {
            const targets = getSnapTargets(0, 0, gridConfig, SnapMode.HalfSnap);
            const edges = targets.filter(t => t.type === 'edge');
            const centers = targets.filter(t => t.type === 'center');
            expect(edges).toHaveLength(4);
            expect(centers).toHaveLength(1);
        });

        it('includes quarter points in QuarterSnap mode', () => {
            const targets = getSnapTargets(0, 0, gridConfig, SnapMode.QuarterSnap);
            const quarters = targets.filter(t => t.type === 'quarter');
            expect(quarters.length).toBeGreaterThan(0);
        });

        it('respects grid offset', () => {
            const offsetGrid: GridConfig = {
                ...gridConfig,
                offset: { left: 10, top: 20 }
            };
            const targets = getSnapTargets(0, 0, offsetGrid, SnapMode.HalfSnap);
            const corner = targets.find(t => t.type === 'corner' && t.point.x === 10 && t.point.y === 20);
            expect(corner).toBeDefined();
        });
    });

    describe('snapToNearest', () => {
        it('returns original position in Free mode', () => {
            const mousePos = { x: 23, y: 37 };
            const snapped = snapToNearest(mousePos, gridConfig, SnapMode.Free);
            expect(snapped).toEqual(mousePos);
        });

        it('snaps to nearest corner within threshold', () => {
            const mousePos = { x: 3, y: 4 };
            const snapped = snapToNearest(mousePos, gridConfig, SnapMode.HalfSnap);
            expect(snapped).toEqual({ x: 0, y: 0 });
        });

        it('snaps to edge midpoint in HalfSnap mode', () => {
            const mousePos = { x: 26, y: 3 };
            const snapped = snapToNearest(mousePos, gridConfig, SnapMode.HalfSnap);
            expect(snapped).toEqual({ x: 25, y: 0 });
        });

        it('does not snap if distance exceeds threshold', () => {
            const mousePos = { x: 20, y: 20 };
            const snapped = snapToNearest(mousePos, gridConfig, SnapMode.HalfSnap, 5);
            expect(snapped).toEqual(mousePos);
        });

        it('handles grid offset correctly', () => {
            const offsetGrid: GridConfig = {
                ...gridConfig,
                offset: { left: 100, top: 100 }
            };
            const mousePos = { x: 103, y: 104 };
            const snapped = snapToNearest(mousePos, offsetGrid, SnapMode.HalfSnap);
            expect(snapped).toEqual({ x: 100, y: 100 });
        });

        it('finds nearest snap target across multiple cells', () => {
            const mousePos = { x: 52, y: 48 };
            const snapped = snapToNearest(mousePos, gridConfig, SnapMode.HalfSnap);
            expect(snapped).toEqual({ x: 50, y: 50 });
        });
    });
});
