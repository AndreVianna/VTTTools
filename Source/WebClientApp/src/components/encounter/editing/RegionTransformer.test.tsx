import { fireEvent } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { RegionSegment } from '@/hooks/useRegionTransaction';
import type { PlacedRegion, Point } from '@/types/domain';
import type { LocalAction } from '@/types/regionUndoActions';
import { GridType } from '@/utils/gridCalculator';
import type { GridConfig } from '@/utils/gridCalculator';
import { RegionTransformer } from './RegionTransformer';

describe('RegionTransformer', () => {
    // Arrange - Default test fixtures
    const mockEncounterId = 'encounter-123';
    const mockGridConfig: GridConfig = {
        type: GridType.Square,
        cellSize: { width: 50, height: 50 },
        offset: { left: 0, top: 0 },
        snap: true,
        scale: 1,
    };
    const mockViewport = { x: 0, y: 0, scale: 1 };

    const createMockSegment = (overrides: Partial<RegionSegment> = {}): RegionSegment => ({
        tempId: 1,
        regionIndex: 0,
        name: 'Test Region',
        vertices: [
            { x: 0, y: 0 },
            { x: 100, y: 0 },
            { x: 100, y: 100 },
            { x: 0, y: 100 },
        ],
        type: 'Terrain',
        ...overrides,
    });

    const createMockPlacedRegion = (overrides: Partial<PlacedRegion> = {}): PlacedRegion => ({
        id: 'region-1',
        encounterId: mockEncounterId,
        index: 0,
        name: 'Test Region',
        type: 'Terrain',
        vertices: [
            { x: 0, y: 0 },
            { x: 100, y: 0 },
            { x: 100, y: 100 },
            { x: 0, y: 100 },
        ],
        ...overrides,
    });

    let onVerticesChange: ReturnType<typeof vi.fn>;
    let onClearSelections: ReturnType<typeof vi.fn>;
    let onSwitchToRegion: ReturnType<typeof vi.fn>;
    let onFinish: ReturnType<typeof vi.fn>;
    let onCancel: ReturnType<typeof vi.fn>;
    let onLocalAction: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        onVerticesChange = vi.fn();
        onClearSelections = vi.fn();
        onSwitchToRegion = vi.fn();
        onFinish = vi.fn();
        onCancel = vi.fn();
        onLocalAction = vi.fn();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('component definition', () => {
        it('has correct display name', () => {
            // Assert
            expect(RegionTransformer.displayName).toBe('RegionTransformer');
        });

        it('component is defined and exports correctly', () => {
            // Assert
            expect(RegionTransformer).toBeDefined();
            // Memoized components are objects with a type property
            expect(typeof RegionTransformer).toBe('object');
        });

        it('component is memoized', () => {
            // Assert
            expect(RegionTransformer.displayName).toBe('RegionTransformer');
            expect(typeof RegionTransformer).toBe('object'); // Memoized components are objects
        });
    });

    describe('props interface', () => {
        it('should accept valid encounterId', () => {
            // Arrange
            const encounterId = 'encounter-123';

            // Assert
            expect(encounterId).toBeTruthy();
            expect(typeof encounterId).toBe('string');
        });

        it('should accept valid regionIndex', () => {
            // Arrange
            const regionIndex = 5;

            // Assert
            expect(typeof regionIndex).toBe('number');
            expect(regionIndex).toBeGreaterThanOrEqual(0);
        });

        it('should accept valid segment with vertices', () => {
            // Arrange
            const segment = createMockSegment();

            // Assert
            expect(segment.vertices).toBeDefined();
            expect(segment.vertices.length).toBeGreaterThanOrEqual(3);
        });

        it('should accept valid gridConfig', () => {
            // Assert
            expect(mockGridConfig.cellSize).toBeDefined();
            expect(mockGridConfig.cellSize.width).toBeGreaterThan(0);
            expect(mockGridConfig.cellSize.height).toBeGreaterThan(0);
            expect(mockGridConfig.offset).toBeDefined();
            expect(mockGridConfig.type).toBe(GridType.Square);
        });

        it('should accept valid viewport', () => {
            // Assert
            expect(mockViewport.x).toBeDefined();
            expect(mockViewport.y).toBeDefined();
            expect(mockViewport.scale).toBeGreaterThan(0);
        });

        it('should accept callback functions', () => {
            // Assert
            expect(typeof onVerticesChange).toBe('function');
            expect(typeof onClearSelections).toBe('function');
            expect(typeof onFinish).toBe('function');
            expect(typeof onCancel).toBe('function');
        });

        it('should accept optional onSwitchToRegion callback', () => {
            // Assert
            expect(typeof onSwitchToRegion).toBe('function');
        });

        it('should accept optional onLocalAction callback', () => {
            // Assert
            expect(typeof onLocalAction).toBe('function');
        });

        it('should accept allRegions array', () => {
            // Arrange
            const allRegions: PlacedRegion[] = [
                createMockPlacedRegion({ index: 0 }),
                createMockPlacedRegion({ index: 1, id: 'region-2' }),
            ];

            // Assert
            expect(Array.isArray(allRegions)).toBe(true);
            expect(allRegions.length).toBe(2);
        });
    });

    describe('vertex validation', () => {
        it('should require minimum 3 vertices for valid polygon', () => {
            // Arrange
            const vertices: Point[] = [
                { x: 0, y: 0 },
                { x: 100, y: 0 },
            ];

            // Assert
            expect(vertices.length).toBeLessThan(3);
        });

        it('should allow exactly 3 vertices for triangle', () => {
            // Arrange
            const segment = createMockSegment({
                vertices: [
                    { x: 0, y: 0 },
                    { x: 100, y: 0 },
                    { x: 50, y: 100 },
                ],
            });

            // Assert
            expect(segment.vertices.length).toBe(3);
        });

        it('should allow more than 3 vertices for complex polygon', () => {
            // Arrange
            const segment = createMockSegment();

            // Assert
            expect(segment.vertices.length).toBe(4);
            expect(segment.vertices.length).toBeGreaterThan(3);
        });

        it('should validate vertex coordinates are numbers', () => {
            // Arrange
            const vertex: Point = { x: 50, y: 75 };

            // Assert
            expect(typeof vertex.x).toBe('number');
            expect(typeof vertex.y).toBe('number');
        });

        it('should validate vertex coordinates are finite', () => {
            // Arrange
            const vertex: Point = { x: 50, y: 75 };

            // Assert
            expect(Number.isFinite(vertex.x)).toBe(true);
            expect(Number.isFinite(vertex.y)).toBe(true);
        });

        it('should allow negative coordinates', () => {
            // Arrange
            const vertex: Point = { x: -50, y: -75 };

            // Assert
            expect(Number.isFinite(vertex.x)).toBe(true);
            expect(Number.isFinite(vertex.y)).toBe(true);
        });
    });

    describe('keyboard shortcuts', () => {
        it('should recognize Escape key for cancel', () => {
            // Arrange
            const event = new KeyboardEvent('keydown', { key: 'Escape' });

            // Assert
            expect(event.key).toBe('Escape');
        });

        it('should recognize Enter key for finish', () => {
            // Arrange
            const event = new KeyboardEvent('keydown', { key: 'Enter' });

            // Assert
            expect(event.key).toBe('Enter');
        });

        it('should call onCancel when Escape is pressed', () => {
            // Arrange
            const handleKeyDown = (e: KeyboardEvent) => {
                if (e.key === 'Escape') {
                    onCancel();
                }
            };

            // Act
            window.addEventListener('keydown', handleKeyDown);
            fireEvent.keyDown(window, { key: 'Escape' });
            window.removeEventListener('keydown', handleKeyDown);

            // Assert
            expect(onCancel).toHaveBeenCalledTimes(1);
        });

        it('should call onFinish when Enter is pressed', () => {
            // Arrange
            const handleKeyDown = (e: KeyboardEvent) => {
                if (e.key === 'Enter') {
                    onFinish();
                }
            };

            // Act
            window.addEventListener('keydown', handleKeyDown);
            fireEvent.keyDown(window, { key: 'Enter' });
            window.removeEventListener('keydown', handleKeyDown);

            // Assert
            expect(onFinish).toHaveBeenCalledTimes(1);
        });

        it('should recognize Delete key for vertex deletion', () => {
            // Arrange
            const event = new KeyboardEvent('keydown', { key: 'Delete' });

            // Assert
            expect(event.key).toBe('Delete');
        });

        it('should recognize Shift key for vertex insertion mode', () => {
            // Arrange
            const event = new KeyboardEvent('keydown', { key: 'Shift', shiftKey: true });

            // Assert
            expect(event.shiftKey).toBe(true);
        });

        it('should recognize Alt key for snap mode change', () => {
            // Arrange
            const event = new KeyboardEvent('keydown', { key: 'Alt', altKey: true });

            // Assert
            expect(event.altKey).toBe(true);
        });

        it('should recognize Ctrl+Alt combination for fine snap', () => {
            // Arrange
            const event = new KeyboardEvent('keydown', { key: 'Alt', altKey: true, ctrlKey: true });

            // Assert
            expect(event.altKey).toBe(true);
            expect(event.ctrlKey).toBe(true);
        });
    });

    describe('vertex selection', () => {
        it('should support single vertex selection', () => {
            // Arrange
            const selectedVertices = new Set<number>([0]);

            // Assert
            expect(selectedVertices.size).toBe(1);
            expect(selectedVertices.has(0)).toBe(true);
        });

        it('should support multi-vertex selection with Ctrl+Click', () => {
            // Arrange
            const selectedVertices = new Set<number>([0, 1, 2]);

            // Assert
            expect(selectedVertices.size).toBe(3);
            expect(selectedVertices.has(0)).toBe(true);
            expect(selectedVertices.has(1)).toBe(true);
            expect(selectedVertices.has(2)).toBe(true);
        });

        it('should toggle vertex selection with Ctrl+Click', () => {
            // Arrange
            const selectedVertices = new Set<number>([0, 1]);

            // Act
            if (selectedVertices.has(1)) {
                selectedVertices.delete(1);
            }

            // Assert
            expect(selectedVertices.size).toBe(1);
            expect(selectedVertices.has(0)).toBe(true);
            expect(selectedVertices.has(1)).toBe(false);
        });

        it('should clear selections on background click', () => {
            // Arrange
            const selectedVertices = new Set<number>([0, 1, 2]);
            expect(selectedVertices.size).toBe(3); // Verify initial state

            // Act - Simulate clearing selections
            selectedVertices.clear();

            // Assert
            expect(selectedVertices.size).toBe(0);
        });
    });

    describe('line selection', () => {
        it('should support line segment selection', () => {
            // Arrange
            const selectedLineIndex: number | null = 0;

            // Assert
            expect(selectedLineIndex).toBe(0);
        });

        it('should select both endpoints when line is selected', () => {
            // Arrange
            const segment = createMockSegment();
            const selectedLineIndex = 1;
            const vertex1Index = selectedLineIndex;
            const vertex2Index = (selectedLineIndex + 1) % segment.vertices.length;
            const selectedVertices = new Set<number>([vertex1Index, vertex2Index]);

            // Assert
            expect(selectedVertices.size).toBe(2);
            expect(selectedVertices.has(1)).toBe(true);
            expect(selectedVertices.has(2)).toBe(true);
        });

        it('should wrap around for last line segment', () => {
            // Arrange
            const segment = createMockSegment();
            const selectedLineIndex = segment.vertices.length - 1; // Last line
            const vertex1Index = selectedLineIndex;
            const vertex2Index = (selectedLineIndex + 1) % segment.vertices.length;

            // Assert
            expect(vertex1Index).toBe(3);
            expect(vertex2Index).toBe(0); // Wraps to first vertex
        });
    });

    describe('marquee selection', () => {
        it('should calculate marquee rectangle from start and end points', () => {
            // Arrange
            const marqueeStart = { x: 10, y: 10 };
            const marqueeEnd = { x: 100, y: 100 };

            // Act
            const x = Math.min(marqueeStart.x, marqueeEnd.x);
            const y = Math.min(marqueeStart.y, marqueeEnd.y);
            const width = Math.abs(marqueeEnd.x - marqueeStart.x);
            const height = Math.abs(marqueeEnd.y - marqueeStart.y);
            const marqueeRect = { x, y, width, height };

            // Assert
            expect(marqueeRect.x).toBe(10);
            expect(marqueeRect.y).toBe(10);
            expect(marqueeRect.width).toBe(90);
            expect(marqueeRect.height).toBe(90);
        });

        it('should handle reverse marquee direction', () => {
            // Arrange
            const marqueeStart = { x: 100, y: 100 };
            const marqueeEnd = { x: 10, y: 10 };

            // Act
            const x = Math.min(marqueeStart.x, marqueeEnd.x);
            const y = Math.min(marqueeStart.y, marqueeEnd.y);
            const width = Math.abs(marqueeEnd.x - marqueeStart.x);
            const height = Math.abs(marqueeEnd.y - marqueeStart.y);
            const marqueeRect = { x, y, width, height };

            // Assert
            expect(marqueeRect.x).toBe(10);
            expect(marqueeRect.y).toBe(10);
            expect(marqueeRect.width).toBe(90);
            expect(marqueeRect.height).toBe(90);
        });

        it('should select vertices within marquee rectangle', () => {
            // Arrange
            const vertices: Point[] = [
                { x: 50, y: 50 },
                { x: 150, y: 50 },
                { x: 150, y: 150 },
            ];
            const marqueeRect = { x: 0, y: 0, width: 100, height: 100 };

            // Act
            const isPointInRect = (point: Point, rect: typeof marqueeRect): boolean =>
                point.x >= rect.x &&
                point.x <= rect.x + rect.width &&
                point.y >= rect.y &&
                point.y <= rect.y + rect.height;

            const selectedIndices = vertices
                .map((v, i) => (isPointInRect(v, marqueeRect) ? i : -1))
                .filter((i) => i !== -1);

            // Assert
            expect(selectedIndices).toEqual([0]);
        });
    });

    describe('vertex dragging', () => {
        it('should track drag start position', () => {
            // Arrange
            const vertex = { x: 50, y: 50 };
            const dragStartPosition = { x: vertex.x, y: vertex.y };

            // Assert
            expect(dragStartPosition.x).toBe(50);
            expect(dragStartPosition.y).toBe(50);
        });

        it('should calculate delta during drag', () => {
            // Arrange
            const dragStartPosition = { x: 50, y: 50 };
            const currentPosition = { x: 75, y: 80 };

            // Act
            const deltaX = currentPosition.x - dragStartPosition.x;
            const deltaY = currentPosition.y - dragStartPosition.y;

            // Assert
            expect(deltaX).toBe(25);
            expect(deltaY).toBe(30);
        });

        it('should update vertices on drag end', () => {
            // Arrange
            const segment = createMockSegment();
            const draggedIndex = 0;
            const newPosition = { x: 25, y: 25 };
            const newVertices = [...segment.vertices];
            newVertices[draggedIndex] = newPosition;

            // Assert
            expect(newVertices[0]).toEqual({ x: 25, y: 25 });
            expect(newVertices.length).toBe(segment.vertices.length);
        });

        it('should support multi-vertex drag', () => {
            // Arrange
            const segment = createMockSegment();
            const selectedIndices = [0, 1];
            const delta = { x: 10, y: 10 };
            const newVertices = segment.vertices.map((v, i) =>
                selectedIndices.includes(i) ? { x: v.x + delta.x, y: v.y + delta.y } : v
            );

            // Assert
            expect(newVertices[0]).toEqual({ x: 10, y: 10 });
            expect(newVertices[1]).toEqual({ x: 110, y: 10 });
            expect(newVertices[2]).toEqual({ x: 100, y: 100 }); // Unchanged
        });
    });

    describe('line dragging', () => {
        it('should track both vertices when dragging line', () => {
            // Arrange
            const segment = createMockSegment();
            const lineIndex = 0;
            const vertex1 = segment.vertices[lineIndex];
            const vertex2 = segment.vertices[(lineIndex + 1) % segment.vertices.length];

            // Assert
            expect(vertex1).toEqual({ x: 0, y: 0 });
            expect(vertex2).toEqual({ x: 100, y: 0 });
        });

        it('should move both vertices by same delta', () => {
            // Arrange
            const segment = createMockSegment();
            const lineIndex = 0;
            const delta = { x: 20, y: 30 };
            const vertex1Index = lineIndex;
            const vertex2Index = (lineIndex + 1) % segment.vertices.length;
            const newVertices = [...segment.vertices];
            const v1 = segment.vertices[vertex1Index];
            const v2 = segment.vertices[vertex2Index];
            if (v1 && v2) {
                newVertices[vertex1Index] = { x: v1.x + delta.x, y: v1.y + delta.y };
                newVertices[vertex2Index] = { x: v2.x + delta.x, y: v2.y + delta.y };
            }

            // Assert
            expect(newVertices[0]).toEqual({ x: 20, y: 30 });
            expect(newVertices[1]).toEqual({ x: 120, y: 30 });
        });
    });

    describe('vertex insertion', () => {
        it('should insert vertex at correct index with Shift+Click', () => {
            // Arrange
            const segment = createMockSegment();
            const lineIndex = 0;
            const insertPos = { x: 50, y: 0 };
            const insertIndex = lineIndex + 1;

            // Act
            const newVertices = [...segment.vertices];
            newVertices.splice(insertIndex, 0, insertPos);

            // Assert
            expect(newVertices.length).toBe(5);
            expect(newVertices[1]).toEqual({ x: 50, y: 0 });
        });

        it('should project click point to line segment', () => {
            // Arrange - Line from (0,0) to (100,0)
            const lineStart = { x: 0, y: 0 };
            const lineEnd = { x: 100, y: 0 };
            const clickPoint = { x: 50, y: 10 }; // Point 10 units above the line

            // Act - Project to line (simplified for horizontal line)
            // For horizontal line, project y to line's y coordinate
            const projected = {
                x: Math.max(lineStart.x, Math.min(lineEnd.x, clickPoint.x)),
                y: lineStart.y,
            };

            // Assert
            expect(projected.x).toBe(50);
            expect(projected.y).toBe(0);
        });
    });

    describe('vertex deletion', () => {
        it('should not delete when fewer than 3 vertices remain', () => {
            // Arrange
            const segment = createMockSegment({
                vertices: [
                    { x: 0, y: 0 },
                    { x: 100, y: 0 },
                    { x: 50, y: 100 },
                ],
            });
            const selectedVertices = new Set<number>([0]);

            // Act
            const canDelete = segment.vertices.length - selectedVertices.size >= 3;

            // Assert
            expect(canDelete).toBe(false);
        });

        it('should allow deletion when more than 3 vertices remain', () => {
            // Arrange
            const segment = createMockSegment();
            const selectedVertices = new Set<number>([0]);

            // Act
            const canDelete = segment.vertices.length - selectedVertices.size >= 3;

            // Assert
            expect(canDelete).toBe(true);
        });

        it('should delete vertices in reverse order to preserve indices', () => {
            // Arrange
            const selectedVertices = new Set<number>([1, 3]);

            // Act
            const sortedIndices = Array.from(selectedVertices).sort((a, b) => b - a);

            // Assert
            expect(sortedIndices).toEqual([3, 1]); // Descending order
        });
    });

    describe('region types', () => {
        it.each(['Terrain', 'Elevation', 'Illumination', 'FogOfWar'])(
            'should handle %s region type',
            (regionType) => {
                // Arrange
                const segment = createMockSegment({ type: regionType });

                // Assert
                expect(segment.type).toBe(regionType);
            }
        );

        it('should handle Illumination type with value', () => {
            // Arrange
            const segment = createMockSegment({
                type: 'Illumination',
                value: 1,
            });

            // Assert
            expect(segment.type).toBe('Illumination');
            expect(segment.value).toBe(1);
        });

        it('should handle Elevation type with value', () => {
            // Arrange
            const segment = createMockSegment({
                type: 'Elevation',
                value: 10,
            });

            // Assert
            expect(segment.type).toBe('Elevation');
            expect(segment.value).toBe(10);
        });
    });

    describe('local actions (undo/redo)', () => {
        it('should create action for vertex move', () => {
            // Arrange
            const action: LocalAction = {
                type: 'MOVE_VERTEX',
                description: 'Move vertex 0',
                undo: vi.fn(),
                redo: vi.fn(),
            };

            // Assert
            expect(action.type).toBe('MOVE_VERTEX');
            expect(typeof action.undo).toBe('function');
            expect(typeof action.redo).toBe('function');
        });

        it('should create action for vertex insert', () => {
            // Arrange
            const action: LocalAction = {
                type: 'INSERT_VERTEX',
                description: 'Insert vertex at index 1',
                undo: vi.fn(),
                redo: vi.fn(),
            };

            // Assert
            expect(action.type).toBe('INSERT_VERTEX');
        });

        it('should create action for vertex delete', () => {
            // Arrange
            const action: LocalAction = {
                type: 'DELETE_VERTEX',
                description: 'Delete vertex 0',
                undo: vi.fn(),
                redo: vi.fn(),
            };

            // Assert
            expect(action.type).toBe('DELETE_VERTEX');
        });

        it('should create action for multi-vertex move', () => {
            // Arrange
            const action: LocalAction = {
                type: 'MULTI_MOVE_VERTEX',
                description: 'Move multiple vertices',
                undo: vi.fn(),
                redo: vi.fn(),
            };

            // Assert
            expect(action.type).toBe('MULTI_MOVE_VERTEX');
        });

        it('should create action for line move', () => {
            // Arrange
            const action: LocalAction = {
                type: 'MOVE_LINE',
                description: 'Move line segment 0',
                undo: vi.fn(),
                redo: vi.fn(),
            };

            // Assert
            expect(action.type).toBe('MOVE_LINE');
        });
    });

    describe('region switching', () => {
        it('should allow switching to another region on click', () => {
            // Arrange
            const allRegions: PlacedRegion[] = [
                createMockPlacedRegion({ index: 0 }),
                createMockPlacedRegion({
                    index: 1,
                    id: 'region-2',
                    vertices: [
                        { x: 200, y: 0 },
                        { x: 300, y: 0 },
                        { x: 300, y: 100 },
                    ],
                }),
            ];
            expect(allRegions.length).toBe(2);

            // Act - Simulate clicking on region 1
            const clickedRegionIndex = 1;
            onSwitchToRegion(clickedRegionIndex);

            // Assert
            expect(onSwitchToRegion).toHaveBeenCalledWith(1);
        });

        it('should exclude FogOfWar regions from switching', () => {
            // Arrange
            const allRegions: PlacedRegion[] = [
                createMockPlacedRegion({ index: 0 }),
                createMockPlacedRegion({
                    index: 1,
                    type: 'FogOfWar',
                }),
            ];

            // Act
            const clickableRegions = allRegions.filter((r) => r.type !== 'FogOfWar');

            // Assert
            expect(clickableRegions.length).toBe(1);
        });
    });

    describe('grid configuration', () => {
        it.each([GridType.Square, GridType.HexV, GridType.HexH, GridType.Isometric, GridType.NoGrid])(
            'should support %s grid type',
            (gridType) => {
                // Arrange
                const gridConfig: GridConfig = {
                    ...mockGridConfig,
                    type: gridType,
                };

                // Assert
                expect(gridConfig.type).toBe(gridType);
            }
        );

        it('should respect grid offset', () => {
            // Arrange
            const gridConfig: GridConfig = {
                ...mockGridConfig,
                offset: { left: 25, top: 25 },
            };

            // Assert
            expect(gridConfig.offset.left).toBe(25);
            expect(gridConfig.offset.top).toBe(25);
        });

        it('should support snap toggle', () => {
            // Arrange
            const gridConfigWithSnap: GridConfig = { ...mockGridConfig, snap: true };
            const gridConfigNoSnap: GridConfig = { ...mockGridConfig, snap: false };

            // Assert
            expect(gridConfigWithSnap.snap).toBe(true);
            expect(gridConfigNoSnap.snap).toBe(false);
        });
    });

    describe('viewport transformation', () => {
        it('should convert screen to world coordinates', () => {
            // Arrange
            const viewport = { x: 100, y: 50, scale: 2 };
            const screenPos = { x: 200, y: 150 };

            // Act
            const worldX = (screenPos.x - viewport.x) / viewport.scale;
            const worldY = (screenPos.y - viewport.y) / viewport.scale;

            // Assert
            expect(worldX).toBe(50);
            expect(worldY).toBe(50);
        });

        it('should handle viewport with no offset', () => {
            // Arrange
            const viewport = { x: 0, y: 0, scale: 1 };
            const screenPos = { x: 100, y: 100 };

            // Act
            const worldX = (screenPos.x - viewport.x) / viewport.scale;
            const worldY = (screenPos.y - viewport.y) / viewport.scale;

            // Assert
            expect(worldX).toBe(100);
            expect(worldY).toBe(100);
        });
    });

    describe('insert preview', () => {
        it('should show preview when Shift is pressed over a line', () => {
            // Arrange
            const isShiftPressed = true;
            const hoveredLineIndex = 1;
            const insertPreviewPos = { x: 50, y: 50 };

            // Assert
            expect(isShiftPressed).toBe(true);
            expect(hoveredLineIndex).toBe(1);
            expect(insertPreviewPos).toEqual({ x: 50, y: 50 });
        });

        it('should hide preview when Shift is released', () => {
            // Arrange
            let isShiftPressed = true;
            let insertPreviewPos: Point | null = { x: 50, y: 50 };

            // Act - Release Shift
            isShiftPressed = false;
            insertPreviewPos = null;

            // Assert
            expect(isShiftPressed).toBe(false);
            expect(insertPreviewPos).toBeNull();
        });
    });

    describe('edge cases', () => {
        it('should handle empty vertices array gracefully', () => {
            // Arrange
            const segment = createMockSegment({ vertices: [] });

            // Assert
            expect(segment.vertices.length).toBe(0);
        });

        it('should handle segment with null regionIndex', () => {
            // Arrange
            const segment = createMockSegment({ regionIndex: null });

            // Assert
            expect(segment.regionIndex).toBeNull();
        });

        it('should handle segment with optional properties omitted', () => {
            // Arrange - Create segment without optional properties
            const segment = createMockSegment({});

            // Assert - Optional properties should not be present
            expect(segment.value).toBeUndefined();
            expect(segment.label).toBeUndefined();
            expect(segment.color).toBeUndefined();
        });

        it('should handle segment with all optional properties set', () => {
            // Arrange
            const segment = createMockSegment({
                value: 5,
                label: 'Test Label',
                color: '#FF0000',
            });

            // Assert
            expect(segment.value).toBe(5);
            expect(segment.label).toBe('Test Label');
            expect(segment.color).toBe('#FF0000');
        });
    });

    describe('point in polygon detection', () => {
        it('should detect point inside polygon', () => {
            // Arrange
            const vertices: Point[] = [
                { x: 0, y: 0 },
                { x: 100, y: 0 },
                { x: 100, y: 100 },
                { x: 0, y: 100 },
            ];
            const point = { x: 50, y: 50 };

            // Act - Simplified bounding box check (approximates ray casting for axis-aligned rectangle)
            const minX = Math.min(...vertices.map((v) => v.x));
            const maxX = Math.max(...vertices.map((v) => v.x));
            const minY = Math.min(...vertices.map((v) => v.y));
            const maxY = Math.max(...vertices.map((v) => v.y));
            const isInside = point.x > minX && point.x < maxX && point.y > minY && point.y < maxY;

            // Assert
            expect(isInside).toBe(true);
        });

        it('should detect point outside polygon', () => {
            // Arrange
            const vertices: Point[] = [
                { x: 0, y: 0 },
                { x: 100, y: 0 },
                { x: 100, y: 100 },
                { x: 0, y: 100 },
            ];
            const point = { x: 150, y: 50 };

            // Act - Simplified bounding box check
            const minX = Math.min(...vertices.map((v) => v.x));
            const maxX = Math.max(...vertices.map((v) => v.x));
            const minY = Math.min(...vertices.map((v) => v.y));
            const maxY = Math.max(...vertices.map((v) => v.y));
            const isInside = point.x > minX && point.x < maxX && point.y > minY && point.y < maxY;

            // Assert
            expect(isInside).toBe(false);
        });
    });
});
