// GENERATED: 2025-10-03 by Claude Code Phase 2
// SPEC: Documents/Areas/Library/Features/SceneManagement/UseCases/ConfigureGrid/USE_CASE.md
// LAYER: UI (Unit Tests)

/**
 * GridCalculator unit tests
 * Tests snap-to-grid, coordinate conversion, and validation
 * TESTING_STRATEGY: Vitest + AAA pattern
 */

import { describe, it, expect } from 'vitest';
import {
    GridType,
    GridConfig,
    snapToGrid,
    pointToCell,
    cellToPoint,
    validateGrid,
    getDefaultGrid
} from './gridCalculator';

describe('gridCalculator', () => {
    describe('validateGrid', () => {
        it('should accept valid grid configuration', () => {
            // Arrange
            const validGrid: GridConfig = {
                type: GridType.Square,
                cellWidth: 50,
                cellHeight: 50,
                offsetX: 0,
                offsetY: 0,
                color: '#000000',
                snapToGrid: true
            };

            // Act
            const errors = validateGrid(validGrid);

            // Assert
            expect(errors).toEqual([]);
        });

        it('should reject grid with zero cell width (INV-10)', () => {
            // Arrange - ACCEPTANCE_CRITERION: AC-02
            const invalidGrid: GridConfig = {
                type: GridType.Square,
                cellWidth: 0,  // Invalid!
                cellHeight: 50,
                offsetX: 0,
                offsetY: 0,
                color: '#000000',
                snapToGrid: true
            };

            // Act
            const errors = validateGrid(invalidGrid);

            // Assert
            expect(errors).toContain('Grid cell width must be positive');
        });

        it('should reject grid with negative cell height (INV-10)', () => {
            // Arrange - ACCEPTANCE_CRITERION: AC-02
            const invalidGrid: GridConfig = {
                type: GridType.Square,
                cellWidth: 50,
                cellHeight: -10,  // Invalid!
                offsetX: 0,
                offsetY: 0,
                color: '#000000',
                snapToGrid: true
            };

            // Act
            const errors = validateGrid(invalidGrid);

            // Assert
            expect(errors).toContain('Grid cell height must be positive');
        });

        it('should reject invalid color format (ES-05)', () => {
            // Arrange - ACCEPTANCE_CRITERION: AC-05
            const invalidGrid: GridConfig = {
                type: GridType.Square,
                cellWidth: 50,
                cellHeight: 50,
                offsetX: 0,
                offsetY: 0,
                color: 'red',  // Invalid! Must be #RRGGBB
                snapToGrid: true
            };

            // Act
            const errors = validateGrid(invalidGrid);

            // Assert
            expect(errors).toContain('Grid color must be hex format #RRGGBB');
        });

        it('should accept valid hex color formats', () => {
            // Arrange
            const testColors = ['#000000', '#FFFFFF', '#FF5733', '#12AB34'];

            testColors.forEach(color => {
                const grid: GridConfig = {
                    ...getDefaultGrid(),
                    color
                };

                // Act
                const errors = validateGrid(grid);

                // Assert
                expect(errors).toEqual([]);
            });
        });
    });

    describe('snapToGrid', () => {
        it('should snap to square grid correctly', () => {
            // Arrange
            const grid: GridConfig = {
                type: GridType.Square,
                cellWidth: 50,
                cellHeight: 50,
                offsetX: 0,
                offsetY: 0,
                color: '#000000',
                snapToGrid: true
            };
            const point = { x: 37, y: 82 };

            // Act
            const snapped = snapToGrid(point, grid);

            // Assert
            expect(snapped).toEqual({ x: 50, y: 100 }); // Snapped to nearest 50x50 cell center
        });

        it('should not snap when snapToGrid is false', () => {
            // Arrange
            const grid: GridConfig = {
                ...getDefaultGrid(),
                snapToGrid: false
            };
            const point = { x: 37, y: 82 };

            // Act
            const snapped = snapToGrid(point, grid);

            // Assert
            expect(snapped).toEqual(point); // Unchanged
        });

        it('should not snap for NoGrid type', () => {
            // Arrange
            const grid: GridConfig = {
                ...getDefaultGrid(),
                type: GridType.NoGrid
            };
            const point = { x: 123, y: 456 };

            // Act
            const snapped = snapToGrid(point, grid);

            // Assert
            expect(snapped).toEqual(point); // Unchanged
        });

        it('should handle grid offset correctly', () => {
            // Arrange
            const grid: GridConfig = {
                type: GridType.Square,
                cellWidth: 50,
                cellHeight: 50,
                offsetX: 10,
                offsetY: 20,
                color: '#000000',
                snapToGrid: true
            };
            const point = { x: 47, y: 92 }; // Adjusted: 37, 72 → snaps to 50, 50 → adds offset → 60, 70

            // Act
            const snapped = snapToGrid(point, grid);

            // Assert
            expect(snapped.x).toBeCloseTo(60, 0); // 50 + 10 offset
            expect(snapped.y).toBeCloseTo(70, 0); // 50 + 20 offset
        });
    });

    describe('pointToCell', () => {
        it('should convert point to square grid cell', () => {
            // Arrange
            const grid: GridConfig = getDefaultGrid();
            const point = { x: 175, y: 225 };

            // Act
            const cell = pointToCell(point, grid);

            // Assert
            expect(cell).toEqual({ col: 3, row: 4 }); // 175/50=3.5→3, 225/50=4.5→4
        });

        it('should handle negative coordinates', () => {
            // Arrange
            const grid: GridConfig = getDefaultGrid();
            const point = { x: -25, y: -75 };

            // Act
            const cell = pointToCell(point, grid);

            // Assert
            expect(cell.col).toBeLessThan(0);
            expect(cell.row).toBeLessThan(0);
        });
    });

    describe('cellToPoint', () => {
        it('should convert square grid cell to pixel position (center)', () => {
            // Arrange
            const grid: GridConfig = getDefaultGrid(); // 50x50 square
            const cell = { col: 2, row: 3 };

            // Act
            const point = cellToPoint(cell, grid);

            // Assert
            expect(point).toEqual({ x: 125, y: 175 }); // Cell (2,3) center: (2*50+25, 3*50+25)
        });

        it('should handle grid offset in cell-to-point conversion', () => {
            // Arrange
            const grid: GridConfig = {
                ...getDefaultGrid(),
                offsetX: 10,
                offsetY: 20
            };
            const cell = { col: 0, row: 0 };

            // Act
            const point = cellToPoint(cell, grid);

            // Assert
            expect(point.x).toBe(35); // 25 + 10 offset
            expect(point.y).toBe(45); // 25 + 20 offset
        });
    });

    describe('getDefaultGrid', () => {
        it('should return valid default grid configuration', () => {
            // Act
            const defaultGrid = getDefaultGrid();

            // Assert
            expect(defaultGrid.type).toBe(GridType.Square);
            expect(defaultGrid.cellWidth).toBe(50);
            expect(defaultGrid.cellHeight).toBe(50);
            expect(defaultGrid.snapToGrid).toBe(true);
            expect(validateGrid(defaultGrid)).toEqual([]); // Must be valid
        });
    });

    describe('Grid type support', () => {
        it('should support all 5 grid types (AC-06)', () => {
            // Arrange - ACCEPTANCE_CRITERION: AC-06
            const gridTypes = [
                GridType.NoGrid,
                GridType.Square,
                GridType.HexH,
                GridType.HexV,
                GridType.Isometric
            ];

            gridTypes.forEach(type => {
                const grid: GridConfig = {
                    ...getDefaultGrid(),
                    type
                };

                // Act
                const errors = validateGrid(grid);
                const snapped = snapToGrid({ x: 100, y: 100 }, grid);

                // Assert
                expect(errors).toEqual([]); // All types should validate
                expect(snapped).toBeDefined(); // All types should snap
            });
        });
    });
});
