// GENERATED: 2025-10-03 by Claude Code Phase 2
// SPEC: Documents/Areas/Library/Features/EncounterManagement/UseCases/ConfigureGrid/USE_CASE.md
// LAYER: UI (Unit Tests)

/**
 * GridCalculator unit tests
 * Tests snap-to-grid, coordinate conversion, and validation
 * TESTING_STRATEGY: Vitest + AAA pattern
 */

import { describe, expect, it } from 'vitest';
import {
  cellToPoint,
  type GridConfig,
  GridType,
  getDefaultGrid,
  pointToCell,
  snapToGrid,
  validateGrid,
} from './gridCalculator';

describe('gridCalculator', () => {
  describe('validateGrid', () => {
    it('should accept valid grid configuration', () => {
      // Arrange
      const validGrid: GridConfig = {
        type: GridType.Square,
        cellSize: { width: 50, height: 50 },
        offset: { left: 0, top: 0 },
        snap: true,
      scale: 1,
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
        cellSize: { width: 0, height: 50 },
        offset: { left: 0, top: 0 },
        snap: true,
      scale: 1,
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
        cellSize: { width: 50, height: -10 },
        offset: { left: 0, top: 0 },
        snap: true,
      scale: 1,
      };

      // Act
      const errors = validateGrid(invalidGrid);

      // Assert
      expect(errors).toContain('Grid cell height must be positive');
    });

    it('should reject invalid grid type', () => {
      // Arrange
      const invalidGrid: GridConfig = {
        type: 999 as GridType,
        cellSize: { width: 50, height: 50 },
        offset: { left: 0, top: 0 },
        snap: true,
      scale: 1,
      };

      // Act
      const errors = validateGrid(invalidGrid);

      // Assert
      expect(errors).toContain('Invalid grid type');
    });

    it('should accept default grid configuration', () => {
      // Arrange
      const grid: GridConfig = {
        ...getDefaultGrid(),
      };

      // Act
      const errors = validateGrid(grid);

      // Assert
      expect(errors).toEqual([]);
    });
  });

  describe('snapToGrid', () => {
    it('should snap to square grid correctly', () => {
      // Arrange
      const grid: GridConfig = {
        type: GridType.Square,
        cellSize: { width: 50, height: 50 },
        offset: { left: 0, top: 0 },
        snap: true,
      scale: 1,
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
        snap: false,
      scale: 1,
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
        type: GridType.NoGrid,
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
        cellSize: { width: 50, height: 50 },
        offset: { left: 10, top: 20 },
        snap: true,
      scale: 1,
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
        offset: { left: 10, top: 20 },
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
      expect(defaultGrid.cellSize.width).toBe(50);
      expect(defaultGrid.cellSize.height).toBe(50);
      expect(defaultGrid.snap).toBe(true);
      expect(validateGrid(defaultGrid)).toEqual([]); // Must be valid
    });
  });

  describe('Grid type support', () => {
    it('should support all 5 grid types (AC-06)', () => {
      // Arrange - ACCEPTANCE_CRITERION: AC-06
      const gridTypes = [GridType.NoGrid, GridType.Square, GridType.HexH, GridType.HexV, GridType.Isometric];

      gridTypes.forEach((type) => {
        const grid: GridConfig = {
          ...getDefaultGrid(),
          type,
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
