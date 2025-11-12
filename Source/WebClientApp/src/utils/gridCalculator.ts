// GENERATED: 2025-10-03 by Claude Code Phase 2
// SPEC: Documents/Areas/Library/Features/EncounterManagement/UseCases/ConfigureGrid/USE_CASE.md
// USE_CASE: ConfigureGrid
// LAYER: UI (Utility)

/**
 * Grid calculation utilities for encounter editor
 * Handles coordinate translation and snap-to-grid logic for all 5 grid types
 */

/**
 * Grid type enumeration matching backend GridType enum
 */
export enum GridType {
  NoGrid = 0,
  Square = 1,
  HexV = 2, // Hexagonal Vertical (backend order)
  HexH = 3, // Hexagonal Horizontal (backend order)
  Isometric = 4,
}

/**
 * Cell size matching backend CellSize value object
 */
export interface CellSize {
  width: number;
  height: number;
}

/**
 * Offset matching backend Offset value object
 */
export interface Offset {
  left: number;
  top: number;
}

/**
 * Grid configuration matching backend Grid value object
 */
export interface GridConfig {
  type: GridType;
  cellSize: CellSize;
  offset: Offset;
  snap: boolean;
}

/**
 * Helper to get cell width from GridConfig
 */
export const getCellWidth = (grid: GridConfig): number => grid.cellSize.width;

/**
 * Helper to get cell height from GridConfig
 */
export const getCellHeight = (grid: GridConfig): number => grid.cellSize.height;

/**
 * Helper to get offset X from GridConfig
 */
export const getOffsetX = (grid: GridConfig): number => grid.offset.left;

/**
 * Helper to get offset Y from GridConfig
 */
export const getOffsetY = (grid: GridConfig): number => grid.offset.top;

/**
 * Point in 2D space
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * Grid cell coordinates
 */
export interface GridCell {
  col: number;
  row: number;
}

/**
 * Calculate snap-to-grid position for a given point
 * ACCEPTANCE_CRITERION: AC-06 - All grid types supported
 * @param point Original position
 * @param grid Grid configuration
 * @returns Snapped position matching grid type
 */
export const snapToGrid = (point: Point, grid: GridConfig): Point => {
  if (!grid.snap || grid.type === GridType.NoGrid) {
    return point;
  }

  const cellWidth = grid.cellSize.width;
  const cellHeight = grid.cellSize.height;
  const offsetX = grid.offset.left;
  const offsetY = grid.offset.top;

  // Adjust for grid offset
  const adjustedX = point.x - offsetX;
  const adjustedY = point.y - offsetY;

  let snappedX: number;
  let snappedY: number;

  switch (grid.type) {
    case GridType.Square:
      snappedX = Math.round(adjustedX / cellWidth) * cellWidth;
      snappedY = Math.round(adjustedY / cellHeight) * cellHeight;
      break;

    case GridType.HexH: {
      const col = Math.round(adjustedX / (cellWidth * 0.75));
      const row = Math.round((adjustedY - (col % 2) * (cellHeight / 2)) / cellHeight);
      snappedX = col * (cellWidth * 0.75);
      snappedY = row * cellHeight + (col % 2) * (cellHeight / 2);
      break;
    }

    case GridType.HexV: {
      const row = Math.round(adjustedY / (cellHeight * 0.75));
      const col = Math.round((adjustedX - (row % 2) * (cellWidth / 2)) / cellWidth);
      snappedX = col * cellWidth + (row % 2) * (cellWidth / 2);
      snappedY = row * (cellHeight * 0.75);
      break;
    }

    case GridType.Isometric: {
      const col = Math.round((adjustedX / cellWidth + adjustedY / cellHeight) / 2);
      const row = Math.round((adjustedY / cellHeight - adjustedX / cellWidth) / 2);
      snappedX = (col - row) * cellWidth;
      snappedY = (col + row) * cellHeight;
      break;
    }

    default:
      return point;
  }

  return {
    x: Math.round(snappedX + offsetX),
    y: Math.round(snappedY + offsetY),
  };
};

/**
 * Convert pixel coordinates to grid cell coordinates
 * @param point Pixel position
 * @param grid Grid configuration
 * @returns Grid cell coordinates (col, row)
 */
export const pointToCell = (point: Point, grid: GridConfig): GridCell => {
  const cellWidth = grid.cellSize.width;
  const cellHeight = grid.cellSize.height;
  const offsetX = grid.offset.left;
  const offsetY = grid.offset.top;

  const adjustedX = point.x - offsetX;
  const adjustedY = point.y - offsetY;

  let col: number;
  let row: number;

  switch (grid.type) {
    case GridType.Square:
      col = Math.floor(adjustedX / cellWidth);
      row = Math.floor(adjustedY / cellHeight);
      break;

    case GridType.HexH:
      col = Math.floor(adjustedX / (cellWidth * 0.75));
      row = Math.floor((adjustedY - (col % 2) * (cellHeight / 2)) / cellHeight);
      break;

    case GridType.HexV:
      row = Math.floor(adjustedY / (cellHeight * 0.75));
      col = Math.floor((adjustedX - (row % 2) * (cellWidth / 2)) / cellWidth);
      break;

    case GridType.Isometric: {
      col = Math.floor((adjustedX / cellWidth + adjustedY / cellHeight) / 2);
      row = Math.floor((adjustedY / cellHeight - adjustedX / cellWidth) / 2);
      break;
    }

    default:
      col = 0;
      row = 0;
  }

  return { col, row };
};

/**
 * Convert grid cell coordinates to pixel position (center of cell)
 * @param cell Grid cell coordinates
 * @param grid Grid configuration
 * @returns Pixel position at cell center
 */
export const cellToPoint = (cell: GridCell, grid: GridConfig): Point => {
  const cellWidth = grid.cellSize.width;
  const cellHeight = grid.cellSize.height;
  const offsetX = grid.offset.left;
  const offsetY = grid.offset.top;

  let x: number;
  let y: number;

  switch (grid.type) {
    case GridType.Square:
      x = cell.col * cellWidth + cellWidth / 2;
      y = cell.row * cellHeight + cellHeight / 2;
      break;

    case GridType.HexH:
      x = cell.col * (cellWidth * 0.75) + cellWidth / 2;
      y = cell.row * cellHeight + (cell.col % 2) * (cellHeight / 2) + cellHeight / 2;
      break;

    case GridType.HexV:
      x = cell.col * cellWidth + (cell.row % 2) * (cellWidth / 2) + cellWidth / 2;
      y = cell.row * (cellHeight * 0.75) + cellHeight / 2;
      break;

    case GridType.Isometric: {
      x = (cell.col - cell.row) * cellWidth + cellWidth / 2;
      y = (cell.col + cell.row) * cellHeight + cellHeight / 2;
      break;
    }

    default:
      x = 0;
      y = 0;
  }

  return {
    x: x + offsetX,
    y: y + offsetY,
  };
};

/**
 * Validate grid configuration
 * INVARIANT: INV-10 - Grid cell dimensions must be positive
 * @param grid Grid configuration to validate
 * @returns Array of validation errors (empty if valid)
 */
export const validateGrid = (grid: GridConfig): string[] => {
  const errors: string[] = [];

  if (grid.cellSize.width <= 0) {
    errors.push('Grid cell width must be positive');
  }
  if (grid.cellSize.height <= 0) {
    errors.push('Grid cell height must be positive');
  }

  if (!Object.values(GridType).includes(grid.type)) {
    errors.push('Invalid grid type');
  }

  return errors;
};

/**
 * Get default grid configuration
 * @returns Default square grid configuration
 */
export const getDefaultGrid = (): GridConfig => ({
  type: GridType.Square,
  cellSize: { width: 50, height: 50 },
  offset: { left: 0, top: 0 },
  snap: true,
});
