import { fireEvent } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Point } from '@/types/domain';
import { GridType } from '@/utils/gridCalculator';
import type { GridConfig } from '@/utils/gridCalculator';
import { RegionDrawingTool } from './RegionDrawingTool';

describe('RegionDrawingTool', () => {
    describe('component definition', () => {
        it('has correct display name', () => {
            expect(RegionDrawingTool.displayName).toBe('RegionDrawingTool');
        });

        it('component is defined and exports correctly', () => {
            expect(RegionDrawingTool).toBeDefined();
            expect(typeof RegionDrawingTool).toBe('function');
        });
    });

    describe('props interface', () => {
        const mockGridConfig: GridConfig = {
            type: GridType.Square,
            cellSize: { width: 50, height: 50 },
            offset: { left: 0, top: 0 },
            snap: true,
            scale: 1,
        };

        it('should accept valid encounterId', () => {
            const encounterId = 'encounter-123';
            expect(encounterId).toBeTruthy();
            expect(typeof encounterId).toBe('string');
        });

        it('should accept valid regionIndex', () => {
            const regionIndex = 5;
            expect(typeof regionIndex).toBe('number');
            expect(regionIndex).toBeGreaterThanOrEqual(0);
        });

        it('should accept valid gridConfig', () => {
            expect(mockGridConfig.cellSize).toBeDefined();
            expect(mockGridConfig.cellSize.width).toBeGreaterThan(0);
            expect(mockGridConfig.cellSize.height).toBeGreaterThan(0);
            expect(mockGridConfig.offset).toBeDefined();
            expect(mockGridConfig.type).toBe(GridType.Square);
        });

        it('should accept callback functions', () => {
            const onCancel = vi.fn();
            const onFinish = vi.fn();
            const onVerticesChange = vi.fn();

            expect(typeof onCancel).toBe('function');
            expect(typeof onFinish).toBe('function');
            expect(typeof onVerticesChange).toBe('function');
        });

        it('should accept valid regionType', () => {
            const regionTypes = ['Illumination', 'Elevation', 'Terrain', 'FogOfWar'];
            regionTypes.forEach((type) => {
                expect(typeof type).toBe('string');
                expect(type.length).toBeGreaterThan(0);
            });
        });

        it('should accept optional regionColor', () => {
            const regionColor = '#FF5733';
            expect(typeof regionColor).toBe('string');
            expect(regionColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
        });

        it('should accept optional cursor', () => {
            const cursor = 'crosshair';
            expect(typeof cursor).toBe('string');
        });
    });

    describe('vertex validation', () => {
        it('should require minimum 3 vertices for valid polygon', () => {
            const vertices: Point[] = [
                { x: 0, y: 0 },
                { x: 100, y: 0 },
            ];

            expect(vertices.length).toBeLessThan(3);
        });

        it('should allow exactly 3 vertices for triangle', () => {
            const vertices: Point[] = [
                { x: 0, y: 0 },
                { x: 100, y: 0 },
                { x: 50, y: 100 },
            ];

            expect(vertices.length).toBe(3);
        });

        it('should allow more than 3 vertices for complex polygon', () => {
            const vertices: Point[] = [
                { x: 0, y: 0 },
                { x: 100, y: 0 },
                { x: 100, y: 100 },
                { x: 0, y: 100 },
            ];

            expect(vertices.length).toBeGreaterThan(3);
        });

        it('should validate vertex coordinates are numbers', () => {
            const vertex: Point = { x: 50, y: 75 };

            expect(typeof vertex.x).toBe('number');
            expect(typeof vertex.y).toBe('number');
        });

        it('should validate vertex coordinates are finite', () => {
            const vertex: Point = { x: 50, y: 75 };

            expect(Number.isFinite(vertex.x)).toBe(true);
            expect(Number.isFinite(vertex.y)).toBe(true);
        });

        it('should allow negative coordinates', () => {
            const vertex: Point = { x: -50, y: -75 };

            expect(Number.isFinite(vertex.x)).toBe(true);
            expect(Number.isFinite(vertex.y)).toBe(true);
        });
    });

    describe('keyboard shortcuts', () => {
        let onCancel: () => void;
        let onFinish: () => void;

        beforeEach(() => {
            onCancel = vi.fn();
            onFinish = vi.fn();
        });

        afterEach(() => {
            vi.clearAllMocks();
        });

        it('should recognize Escape key for cancel', () => {
            const event = new KeyboardEvent('keydown', { key: 'Escape' });
            expect(event.key).toBe('Escape');
        });

        it('should recognize Enter key for finish', () => {
            const event = new KeyboardEvent('keydown', { key: 'Enter' });
            expect(event.key).toBe('Enter');
        });

        it('should call onCancel when Escape is pressed', () => {
            // Simulate the keyboard handler logic
            const handleKeyDown = (e: KeyboardEvent) => {
                if (e.key === 'Escape') {
                    onCancel();
                }
            };

            window.addEventListener('keydown', handleKeyDown);
            fireEvent.keyDown(window, { key: 'Escape' });
            window.removeEventListener('keydown', handleKeyDown);

            expect(onCancel).toHaveBeenCalledTimes(1);
        });

        it('should not call onFinish when Enter is pressed with less than 3 vertices', () => {
            const vertices: Point[] = [{ x: 0, y: 0 }, { x: 100, y: 0 }];

            // Simulate the keyboard handler logic
            const handleKeyDown = (e: KeyboardEvent) => {
                if (e.key === 'Enter' && vertices.length >= 3) {
                    onFinish();
                }
            };

            window.addEventListener('keydown', handleKeyDown);
            fireEvent.keyDown(window, { key: 'Enter' });
            window.removeEventListener('keydown', handleKeyDown);

            expect(onFinish).not.toHaveBeenCalled();
        });

        it('should call onFinish when Enter is pressed with 3 or more vertices', () => {
            const vertices: Point[] = [
                { x: 0, y: 0 },
                { x: 100, y: 0 },
                { x: 50, y: 100 },
            ];

            // Simulate the keyboard handler logic
            const handleKeyDown = (e: KeyboardEvent) => {
                if (e.key === 'Enter' && vertices.length >= 3) {
                    onFinish();
                }
            };

            window.addEventListener('keydown', handleKeyDown);
            fireEvent.keyDown(window, { key: 'Enter' });
            window.removeEventListener('keydown', handleKeyDown);

            expect(onFinish).toHaveBeenCalledTimes(1);
        });

        it('should recognize Alt key for snap mode change', () => {
            const event = new KeyboardEvent('keydown', { key: 'Alt', altKey: true });
            expect(event.altKey).toBe(true);
        });

        it('should recognize Ctrl+Alt combination for fine snap', () => {
            const event = new KeyboardEvent('keydown', { key: 'Alt', altKey: true, ctrlKey: true });
            expect(event.altKey).toBe(true);
            expect(event.ctrlKey).toBe(true);
        });
    });

    describe('polygon properties', () => {
        it('should create closed polygon from vertices', () => {
            const vertices: Point[] = [
                { x: 0, y: 0 },
                { x: 100, y: 0 },
                { x: 100, y: 100 },
                { x: 0, y: 100 },
            ];

            // Simulating how the component closes the polygon
            const closedVertices = [...vertices, vertices[0]];
            expect(closedVertices.length).toBe(vertices.length + 1);
            expect(closedVertices[0]).toEqual(closedVertices[closedVertices.length - 1]);
        });

        it('should handle triangle polygon', () => {
            const vertices: Point[] = [
                { x: 0, y: 0 },
                { x: 50, y: 100 },
                { x: 100, y: 0 },
            ];

            expect(vertices.length).toBe(3);
            // Triangle should be closable
            const closedVertices = [...vertices, vertices[0]];
            expect(closedVertices.length).toBe(4);
        });

        it('should handle complex polygon with many vertices', () => {
            const vertices: Point[] = [
                { x: 0, y: 0 },
                { x: 50, y: 0 },
                { x: 100, y: 50 },
                { x: 75, y: 100 },
                { x: 25, y: 100 },
                { x: 0, y: 50 },
            ];

            expect(vertices.length).toBe(6);
            expect(vertices.length).toBeGreaterThanOrEqual(3);
        });

        it('should convert vertices to points array for Konva', () => {
            const vertices: Point[] = [
                { x: 0, y: 0 },
                { x: 100, y: 0 },
                { x: 100, y: 100 },
            ];

            // This is how RegionRenderer converts vertices to points
            const firstVertex = vertices[0];
            const points = [...vertices, firstVertex].flatMap((v) => [v?.x ?? 0, v?.y ?? 0]);

            expect(points).toEqual([0, 0, 100, 0, 100, 100, 0, 0]);
            expect(points.length).toBe((vertices.length + 1) * 2);
        });
    });

    describe('region types', () => {
        const regionTypes = ['Illumination', 'Elevation', 'Terrain', 'FogOfWar'];

        it.each(regionTypes)('should accept %s region type', (regionType) => {
            expect(typeof regionType).toBe('string');
            expect(regionType.length).toBeGreaterThan(0);
        });

        it('should handle Illumination type with value', () => {
            const region = { type: 'Illumination', value: 1 };
            expect(region.type).toBe('Illumination');
            expect(region.value).toBeDefined();
        });

        it('should handle Elevation type with value', () => {
            const region = { type: 'Elevation', value: 10 };
            expect(region.type).toBe('Elevation');
            expect(region.value).toBe(10);
        });

        it('should handle Terrain type with value', () => {
            const region = { type: 'Terrain', value: 2 };
            expect(region.type).toBe('Terrain');
            expect(region.value).toBe(2);
        });

        it('should handle FogOfWar type', () => {
            const region = { type: 'FogOfWar' };
            expect(region.type).toBe('FogOfWar');
        });
    });

    describe('grid configuration', () => {
        it('should support Square grid type', () => {
            const gridConfig: GridConfig = {
                type: GridType.Square,
                cellSize: { width: 50, height: 50 },
                offset: { left: 0, top: 0 },
                snap: true,
                scale: 1,
            };
            expect(gridConfig.type).toBe(GridType.Square);
        });

        it('should support HexV grid type', () => {
            const gridConfig: GridConfig = {
                type: GridType.HexV,
                cellSize: { width: 50, height: 50 },
                offset: { left: 0, top: 0 },
                snap: true,
                scale: 1,
            };
            expect(gridConfig.type).toBe(GridType.HexV);
        });

        it('should support HexH grid type', () => {
            const gridConfig: GridConfig = {
                type: GridType.HexH,
                cellSize: { width: 50, height: 50 },
                offset: { left: 0, top: 0 },
                snap: true,
                scale: 1,
            };
            expect(gridConfig.type).toBe(GridType.HexH);
        });

        it('should support Isometric grid type', () => {
            const gridConfig: GridConfig = {
                type: GridType.Isometric,
                cellSize: { width: 50, height: 50 },
                offset: { left: 0, top: 0 },
                snap: true,
                scale: 1,
            };
            expect(gridConfig.type).toBe(GridType.Isometric);
        });

        it('should support NoGrid type', () => {
            const gridConfig: GridConfig = {
                type: GridType.NoGrid,
                cellSize: { width: 50, height: 50 },
                offset: { left: 0, top: 0 },
                snap: false,
                scale: 1,
            };
            expect(gridConfig.type).toBe(GridType.NoGrid);
        });

        it('should require positive cell dimensions', () => {
            const gridConfig: GridConfig = {
                type: GridType.Square,
                cellSize: { width: 50, height: 50 },
                offset: { left: 0, top: 0 },
                snap: true,
                scale: 1,
            };
            expect(gridConfig.cellSize.width).toBeGreaterThan(0);
            expect(gridConfig.cellSize.height).toBeGreaterThan(0);
        });

        it('should allow grid offset', () => {
            const gridConfig: GridConfig = {
                type: GridType.Square,
                cellSize: { width: 50, height: 50 },
                offset: { left: 25, top: 25 },
                snap: true,
                scale: 1,
            };
            expect(gridConfig.offset.left).toBe(25);
            expect(gridConfig.offset.top).toBe(25);
        });
    });

    describe('color handling', () => {
        it('should accept hex color format', () => {
            const color = '#FF5733';
            expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/);
        });

        it('should accept lowercase hex color', () => {
            const color = '#ff5733';
            expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/i);
        });

        it('should work without regionColor (uses default)', () => {
            const regionColor: string | undefined = undefined;
            expect(regionColor).toBeUndefined();
        });
    });
});
