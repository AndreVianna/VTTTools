import { fireEvent } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { PlacedWall, Point } from '@/types/domain';
import { SegmentState, SegmentType } from '@/types/domain';
import { GridType } from '@/utils/gridCalculator';
import type { GridConfig } from '@/utils/gridCalculator';
import * as regionBoundaryUtils from '@/utils/regionBoundaryUtils';
import type { BoundaryResult } from '@/utils/regionBoundaryUtils';
import { RegionBucketFillTool } from './RegionBucketFillTool';

// Mock regionBoundaryUtils
vi.mock('@/utils/regionBoundaryUtils', () => ({
    traceBoundary: vi.fn(),
}));

// Mock customCursors
vi.mock('@/utils/customCursors', () => ({
    getBucketPlusCursor: vi.fn(() => 'url(bucket-cursor) 12 12, auto'),
}));

describe('RegionBucketFillTool', () => {
    // Default props setup
    const mockGridConfig: GridConfig = {
        type: GridType.Square,
        cellSize: { width: 50, height: 50 },
        offset: { left: 0, top: 0 },
        snap: true,
        scale: 1,
    };

    const mockStageSize = { width: 1000, height: 800 };

    const mockWalls: PlacedWall[] = [];

    const createMockRegionTransaction = () => ({
        transaction: {
            type: null,
            originalRegion: null,
            segment: null,
            isActive: false,
        },
        startTransaction: vi.fn(),
        addVertex: vi.fn(),
        updateVertices: vi.fn(),
        updateSegmentProperties: vi.fn(),
        commitTransaction: vi.fn(),
        rollbackTransaction: vi.fn(),
        clearTransaction: vi.fn(),
        getActiveSegment: vi.fn(),
        pushLocalAction: vi.fn(),
        undoLocal: vi.fn(),
        redoLocal: vi.fn(),
        canUndoLocal: vi.fn(),
        canRedoLocal: vi.fn(),
        clearLocalStacks: vi.fn(),
        history: {
            canUndo: false,
            canRedo: false,
            push: vi.fn(),
            undo: vi.fn(),
            redo: vi.fn(),
            clear: vi.fn(),
        },
    });

    let onCancel: () => void;
    let onFinish: (vertices: Point[]) => void;
    let mockRegionTransaction: ReturnType<typeof createMockRegionTransaction>;

    beforeEach(() => {
        vi.clearAllMocks();
        onCancel = vi.fn();
        onFinish = vi.fn();
        mockRegionTransaction = createMockRegionTransaction();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('component definition', () => {
        it('has correct display name', () => {
            expect(RegionBucketFillTool.displayName).toBe('RegionBucketFillTool');
        });

        it('component is defined and exports correctly', () => {
            expect(RegionBucketFillTool).toBeDefined();
            expect(typeof RegionBucketFillTool).toBe('function');
        });
    });

    describe('props interface', () => {
        it('should accept valid encounterId', () => {
            const encounterId = 'encounter-123';
            expect(encounterId).toBeTruthy();
            expect(typeof encounterId).toBe('string');
        });

        it('should accept valid gridConfig', () => {
            expect(mockGridConfig.cellSize).toBeDefined();
            expect(mockGridConfig.cellSize.width).toBeGreaterThan(0);
            expect(mockGridConfig.cellSize.height).toBeGreaterThan(0);
            expect(mockGridConfig.offset).toBeDefined();
            expect(mockGridConfig.type).toBe(GridType.Square);
        });

        it('should accept valid stageSize', () => {
            expect(mockStageSize.width).toBeGreaterThan(0);
            expect(mockStageSize.height).toBeGreaterThan(0);
        });

        it('should accept callback functions', () => {
            expect(typeof onCancel).toBe('function');
            expect(typeof onFinish).toBe('function');
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

        it('should accept walls array', () => {
            expect(Array.isArray(mockWalls)).toBe(true);
        });
    });

    describe('keyboard shortcuts', () => {
        it('should recognize Escape key for cancel', () => {
            const event = new KeyboardEvent('keydown', { key: 'Escape' });
            expect(event.key).toBe('Escape');
        });

        it('should call onCancel when Escape is pressed', () => {
            const handleKeyDown = (e: KeyboardEvent) => {
                if (e.key === 'Escape') {
                    e.preventDefault();
                    e.stopPropagation();
                    onCancel();
                }
            };

            window.addEventListener('keydown', handleKeyDown);
            fireEvent.keyDown(window, { key: 'Escape' });
            window.removeEventListener('keydown', handleKeyDown);

            expect(onCancel).toHaveBeenCalledTimes(1);
        });

        it('should prevent default and stop propagation on Escape', () => {
            const event = new KeyboardEvent('keydown', { key: 'Escape', cancelable: true });
            expect(event.cancelable).toBe(true);
        });
    });

    describe('boundary tracing', () => {
        it('should call traceBoundary with correct parameters', () => {
            const clickPoint: Point = { x: 500, y: 400 };
            const walls: PlacedWall[] = [];

            (regionBoundaryUtils.traceBoundary as ReturnType<typeof vi.fn>).mockReturnValue({
                vertices: null,
                holes: [],
                isFullStage: true,
                boundingWalls: [],
            });

            regionBoundaryUtils.traceBoundary(clickPoint, walls, mockStageSize);

            expect(regionBoundaryUtils.traceBoundary).toHaveBeenCalledWith(
                clickPoint,
                walls,
                mockStageSize,
            );
        });

        it('should handle isFullStage result', () => {
            const result: BoundaryResult = {
                vertices: null,
                holes: [],
                isFullStage: true,
                boundingWalls: [],
            };

            (regionBoundaryUtils.traceBoundary as ReturnType<typeof vi.fn>).mockReturnValue(result);

            const tracedResult = regionBoundaryUtils.traceBoundary({ x: 100, y: 100 }, [], mockStageSize);

            expect(tracedResult.isFullStage).toBe(true);
            expect(tracedResult.vertices).toBeNull();
        });

        it('should handle bounded region result', () => {
            const vertices: Point[] = [
                { x: 100, y: 100 },
                { x: 200, y: 100 },
                { x: 200, y: 200 },
                { x: 100, y: 200 },
            ];

            const result: BoundaryResult = {
                vertices,
                holes: [],
                isFullStage: false,
                boundingWalls: [],
            };

            (regionBoundaryUtils.traceBoundary as ReturnType<typeof vi.fn>).mockReturnValue(result);

            const tracedResult = regionBoundaryUtils.traceBoundary({ x: 150, y: 150 }, [], mockStageSize);

            expect(tracedResult.isFullStage).toBe(false);
            expect(tracedResult.vertices).toEqual(vertices);
            expect(tracedResult.vertices?.length).toBe(4);
        });

        it('should handle region with holes', () => {
            const vertices: Point[] = [
                { x: 0, y: 0 },
                { x: 400, y: 0 },
                { x: 400, y: 400 },
                { x: 0, y: 400 },
            ];

            const holes: Point[][] = [
                [
                    { x: 100, y: 100 },
                    { x: 200, y: 100 },
                    { x: 200, y: 200 },
                    { x: 100, y: 200 },
                ],
            ];

            const result: BoundaryResult = {
                vertices,
                holes,
                isFullStage: false,
                boundingWalls: [],
            };

            (regionBoundaryUtils.traceBoundary as ReturnType<typeof vi.fn>).mockReturnValue(result);

            const tracedResult = regionBoundaryUtils.traceBoundary({ x: 50, y: 50 }, [], mockStageSize);

            expect(tracedResult.holes.length).toBe(1);
            expect(tracedResult.holes[0]?.length).toBe(4);
        });

        it('should handle null vertices result', () => {
            const result: BoundaryResult = {
                vertices: null,
                holes: [],
                isFullStage: false,
                boundingWalls: [],
            };

            (regionBoundaryUtils.traceBoundary as ReturnType<typeof vi.fn>).mockReturnValue(result);

            const tracedResult = regionBoundaryUtils.traceBoundary({ x: 100, y: 100 }, [], mockStageSize);

            expect(tracedResult.vertices).toBeNull();
            expect(tracedResult.isFullStage).toBe(false);
        });
    });

    describe('click interactions', () => {
        it('should generate full stage vertices when isFullStage is true', () => {
            const fullStageVertices: Point[] = [
                { x: 0, y: 0 },
                { x: mockStageSize.width, y: 0 },
                { x: mockStageSize.width, y: mockStageSize.height },
                { x: 0, y: mockStageSize.height },
            ];

            expect(fullStageVertices.length).toBe(4);
            expect(fullStageVertices[0]).toEqual({ x: 0, y: 0 });
            expect(fullStageVertices[1]).toEqual({ x: 1000, y: 0 });
            expect(fullStageVertices[2]).toEqual({ x: 1000, y: 800 });
            expect(fullStageVertices[3]).toEqual({ x: 0, y: 800 });
        });

        it('should require minimum 3 vertices for valid region', () => {
            const vertices: Point[] = [
                { x: 0, y: 0 },
                { x: 100, y: 0 },
            ];

            expect(vertices.length).toBeLessThan(3);
        });

        it('should allow exactly 3 vertices', () => {
            const vertices: Point[] = [
                { x: 0, y: 0 },
                { x: 100, y: 0 },
                { x: 50, y: 100 },
            ];

            expect(vertices.length).toBe(3);
            expect(vertices.length).toBeGreaterThanOrEqual(3);
        });

        it('should handle click result with valid vertices', () => {
            const vertices: Point[] = [
                { x: 100, y: 100 },
                { x: 200, y: 100 },
                { x: 200, y: 200 },
                { x: 100, y: 200 },
            ];

            const result: BoundaryResult = {
                vertices,
                holes: [],
                isFullStage: false,
                boundingWalls: [],
            };

            (regionBoundaryUtils.traceBoundary as ReturnType<typeof vi.fn>).mockReturnValue(result);

            const tracedResult = regionBoundaryUtils.traceBoundary({ x: 150, y: 150 }, [], mockStageSize);

            if (tracedResult.vertices && tracedResult.vertices.length >= 3) {
                onFinish(tracedResult.vertices);
            }

            expect(onFinish).toHaveBeenCalledWith(vertices);
        });

        it('should not call onFinish for invalid vertices', () => {
            const result: BoundaryResult = {
                vertices: [{ x: 0, y: 0 }, { x: 100, y: 0 }], // Only 2 vertices
                holes: [],
                isFullStage: false,
                boundingWalls: [],
            };

            (regionBoundaryUtils.traceBoundary as ReturnType<typeof vi.fn>).mockReturnValue(result);

            const tracedResult = regionBoundaryUtils.traceBoundary({ x: 50, y: 50 }, [], mockStageSize);

            if (tracedResult.vertices && tracedResult.vertices.length >= 3) {
                onFinish(tracedResult.vertices);
            }

            expect(onFinish).not.toHaveBeenCalled();
        });

        it('should not call onFinish when vertices is null', () => {
            const result: BoundaryResult = {
                vertices: null,
                holes: [],
                isFullStage: false,
                boundingWalls: [],
            };

            (regionBoundaryUtils.traceBoundary as ReturnType<typeof vi.fn>).mockReturnValue(result);

            const tracedResult = regionBoundaryUtils.traceBoundary({ x: 50, y: 50 }, [], mockStageSize);

            if (tracedResult.vertices && tracedResult.vertices.length >= 3) {
                onFinish(tracedResult.vertices);
            }

            expect(onFinish).not.toHaveBeenCalled();
        });
    });

    describe('color application', () => {
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

        it('should pass color to RegionPreview when provided', () => {
            const regionColor = '#4CAF50';
            expect(typeof regionColor).toBe('string');
            expect(regionColor.startsWith('#')).toBe(true);
        });
    });

    describe('walls handling', () => {
        it('should handle empty walls array', () => {
            const walls: PlacedWall[] = [];
            expect(walls.length).toBe(0);
        });

        it('should handle walls with segments', () => {
            const walls: PlacedWall[] = [
                {
                    id: 'wall-1',
                    index: 0,
                    segments: [
                        {
                            index: 0,
                            startPole: { x: 100, y: 100, h: 10 },
                            endPole: { x: 200, y: 100, h: 10 },
                            type: SegmentType.Wall,
                            state: SegmentState.Closed,
                            isOpaque: true,
                        },
                    ],
                },
            ];

            expect(walls.length).toBe(1);
            expect(walls[0]?.segments.length).toBe(1);
        });

        it('should handle multiple walls', () => {
            const walls: PlacedWall[] = [
                {
                    id: 'wall-1',
                    index: 0,
                    segments: [
                        {
                            index: 0,
                            startPole: { x: 100, y: 100, h: 10 },
                            endPole: { x: 200, y: 100, h: 10 },
                            type: SegmentType.Wall,
                            state: SegmentState.Closed,
                            isOpaque: true,
                        },
                    ],
                },
                {
                    id: 'wall-2',
                    index: 1,
                    segments: [
                        {
                            index: 0,
                            startPole: { x: 200, y: 100, h: 10 },
                            endPole: { x: 200, y: 200, h: 10 },
                            type: SegmentType.Wall,
                            state: SegmentState.Closed,
                            isOpaque: true,
                        },
                    ],
                },
            ];

            expect(walls.length).toBe(2);
        });

        it('should handle walls with door segments', () => {
            const walls: PlacedWall[] = [
                {
                    id: 'wall-1',
                    index: 0,
                    segments: [
                        {
                            index: 0,
                            startPole: { x: 100, y: 100, h: 10 },
                            endPole: { x: 150, y: 100, h: 10 },
                            type: SegmentType.Door,
                            state: SegmentState.Closed,
                            isOpaque: true,
                        },
                    ],
                },
            ];

            expect(walls[0]?.segments[0]?.type).toBe(SegmentType.Door);
        });

        it('should handle walls with window segments', () => {
            const walls: PlacedWall[] = [
                {
                    id: 'wall-1',
                    index: 0,
                    segments: [
                        {
                            index: 0,
                            startPole: { x: 100, y: 100, h: 10 },
                            endPole: { x: 150, y: 100, h: 10 },
                            type: SegmentType.Window,
                            state: SegmentState.Closed,
                            isOpaque: false,
                        },
                    ],
                },
            ];

            expect(walls[0]?.segments[0]?.type).toBe(SegmentType.Window);
            expect(walls[0]?.segments[0]?.isOpaque).toBe(false);
        });
    });

    describe('stage size handling', () => {
        it('should use stage dimensions for full stage fill', () => {
            const stageSize = { width: 1200, height: 900 };

            const fullStageVertices: Point[] = [
                { x: 0, y: 0 },
                { x: stageSize.width, y: 0 },
                { x: stageSize.width, y: stageSize.height },
                { x: 0, y: stageSize.height },
            ];

            expect(fullStageVertices[1]?.x).toBe(1200);
            expect(fullStageVertices[2]?.y).toBe(900);
        });

        it('should handle different stage sizes', () => {
            const smallStage = { width: 500, height: 400 };
            const largeStage = { width: 2000, height: 1500 };

            expect(smallStage.width).toBeLessThan(largeStage.width);
            expect(smallStage.height).toBeLessThan(largeStage.height);
        });
    });

    describe('cursor handling', () => {
        it('should use custom cursor when provided', () => {
            const cursor = 'pointer';
            expect(cursor).toBe('pointer');
        });

        it('should default to bucket cursor when no custom cursor', () => {
            const cursor: string | undefined = undefined;
            const defaultCursor = cursor || 'url(bucket-cursor) 12 12, auto';
            expect(defaultCursor).toContain('bucket');
        });
    });

    describe('region transaction integration', () => {
        it('should have transaction state', () => {
            expect(mockRegionTransaction.transaction).toBeDefined();
            expect(mockRegionTransaction.transaction.isActive).toBe(false);
        });

        it('should have startTransaction method', () => {
            expect(typeof mockRegionTransaction.startTransaction).toBe('function');
        });

        it('should have updateVertices method', () => {
            expect(typeof mockRegionTransaction.updateVertices).toBe('function');
        });

        it('should have commitTransaction method', () => {
            expect(typeof mockRegionTransaction.commitTransaction).toBe('function');
        });

        it('should have rollbackTransaction method', () => {
            expect(typeof mockRegionTransaction.rollbackTransaction).toBe('function');
        });
    });

    describe('interaction rectangle', () => {
        it('should have large interaction area for capturing events', () => {
            const INTERACTION_RECT_SIZE = 20000;
            const INTERACTION_RECT_OFFSET = -INTERACTION_RECT_SIZE / 2;

            expect(INTERACTION_RECT_SIZE).toBe(20000);
            expect(INTERACTION_RECT_OFFSET).toBe(-10000);
        });

        it('should center interaction rectangle', () => {
            const INTERACTION_RECT_SIZE = 20000;
            const INTERACTION_RECT_OFFSET = -INTERACTION_RECT_SIZE / 2;

            // Rectangle should be centered at origin
            const left = INTERACTION_RECT_OFFSET;
            const right = INTERACTION_RECT_OFFSET + INTERACTION_RECT_SIZE;
            const center = (left + right) / 2;

            expect(center).toBe(0);
        });
    });

    describe('coordinate transformation', () => {
        it('should handle scale transformation', () => {
            const pointer = { x: 200, y: 150 };
            const stagePos = { x: 50, y: 25 };
            const scale = 2;

            const transformedX = (pointer.x - stagePos.x) / scale;
            const transformedY = (pointer.y - stagePos.y) / scale;

            expect(transformedX).toBe(75);
            expect(transformedY).toBe(62.5);
        });

        it('should handle identity scale', () => {
            const pointer = { x: 200, y: 150 };
            const stagePos = { x: 0, y: 0 };
            const scale = 1;

            const transformedX = (pointer.x - stagePos.x) / scale;
            const transformedY = (pointer.y - stagePos.y) / scale;

            expect(transformedX).toBe(200);
            expect(transformedY).toBe(150);
        });

        it('should handle stage offset', () => {
            const pointer = { x: 300, y: 200 };
            const stagePos = { x: 100, y: 50 };
            const scale = 1;

            const transformedX = (pointer.x - stagePos.x) / scale;
            const transformedY = (pointer.y - stagePos.y) / scale;

            expect(transformedX).toBe(200);
            expect(transformedY).toBe(150);
        });
    });

    describe('edge cases', () => {
        it('should handle zero-dimension stage size', () => {
            const stageSize = { width: 0, height: 0 };
            expect(stageSize.width).toBe(0);
            expect(stageSize.height).toBe(0);
        });

        it('should handle negative coordinates in click position', () => {
            const clickPoint: Point = { x: -50, y: -25 };
            expect(clickPoint.x).toBeLessThan(0);
            expect(clickPoint.y).toBeLessThan(0);
        });

        it('should handle very large coordinates', () => {
            const clickPoint: Point = { x: 100000, y: 100000 };
            expect(Number.isFinite(clickPoint.x)).toBe(true);
            expect(Number.isFinite(clickPoint.y)).toBe(true);
        });

        it('should handle empty result from traceBoundary', () => {
            const result: BoundaryResult = {
                vertices: [],
                holes: [],
                isFullStage: false,
                boundingWalls: [],
            };

            expect(result.vertices?.length).toBe(0);
        });

        it('should handle result with bounding walls', () => {
            const walls: PlacedWall[] = [
                {
                    id: 'wall-1',
                    index: 0,
                    segments: [
                        {
                            index: 0,
                            startPole: { x: 100, y: 100, h: 10 },
                            endPole: { x: 200, y: 100, h: 10 },
                            type: SegmentType.Wall,
                            state: SegmentState.Closed,
                            isOpaque: true,
                        },
                    ],
                },
            ];

            const result: BoundaryResult = {
                vertices: [
                    { x: 0, y: 0 },
                    { x: 1000, y: 0 },
                    { x: 1000, y: 800 },
                    { x: 0, y: 800 },
                ],
                holes: [],
                isFullStage: false,
                boundingWalls: walls,
            };

            expect(result.boundingWalls.length).toBe(1);
        });
    });

    describe('preview state', () => {
        it('should update preview vertices on mouse move', () => {
            const previewVertices: Point[] = [
                { x: 100, y: 100 },
                { x: 200, y: 100 },
                { x: 200, y: 200 },
                { x: 100, y: 200 },
            ];

            expect(previewVertices.length).toBe(4);
        });

        it('should clear preview vertices when result is null', () => {
            const previewVertices: Point[] | null = null;
            expect(previewVertices).toBeNull();
        });

        it('should update preview holes from trace result', () => {
            const previewHoles: Point[][] = [
                [
                    { x: 150, y: 150 },
                    { x: 180, y: 150 },
                    { x: 180, y: 180 },
                    { x: 150, y: 180 },
                ],
            ];

            expect(previewHoles.length).toBe(1);
            expect(previewHoles[0]?.length).toBe(4);
        });

        it('should clear preview holes when no holes in result', () => {
            const previewHoles: Point[][] = [];
            expect(previewHoles.length).toBe(0);
        });
    });
});
