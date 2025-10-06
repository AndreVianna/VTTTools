// GENERATED: 2025-10-03 by Claude Code Phase 2
// SPEC: Documents/Areas/Library/Features/SceneManagement/UseCases/ConfigureGrid/USE_CASE.md
// USE_CASE: ConfigureGrid
// LAYER: UI (Utility)

/**
 * Grid calculation utilities for scene editor
 * Handles coordinate translation and snap-to-grid logic for all 5 grid types
 */

/**
 * Grid type enumeration matching backend GridType enum
 */
export enum GridType {
    NoGrid = 0,
    Square = 1,
    HexH = 2,      // Hexagonal Horizontal
    HexV = 3,      // Hexagonal Vertical
    Isometric = 4
}

/**
 * Grid configuration matching backend Grid value object
 */
export interface GridConfig {
    type: GridType;
    cellWidth: number;
    cellHeight: number;
    offsetX: number;
    offsetY: number;
    color: string;
    snapToGrid: boolean;
}

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
    if (!grid.snapToGrid || grid.type === GridType.NoGrid) {
        return point;
    }

    // Adjust for grid offset
    const adjustedX = point.x - grid.offsetX;
    const adjustedY = point.y - grid.offsetY;

    let snappedX: number;
    let snappedY: number;

    switch (grid.type) {
        case GridType.Square:
            snappedX = Math.round(adjustedX / grid.cellWidth) * grid.cellWidth;
            snappedY = Math.round(adjustedY / grid.cellHeight) * grid.cellHeight;
            break;

        case GridType.HexH: {
            // Hexagonal horizontal (flat-top hexagons)
            const col = Math.round(adjustedX / (grid.cellWidth * 0.75));
            const row = Math.round((adjustedY - (col % 2) * (grid.cellHeight / 2)) / grid.cellHeight);
            snappedX = col * (grid.cellWidth * 0.75);
            snappedY = row * grid.cellHeight + (col % 2) * (grid.cellHeight / 2);
            break;
        }

        case GridType.HexV: {
            // Hexagonal vertical (pointy-top hexagons)
            const row = Math.round(adjustedY / (grid.cellHeight * 0.75));
            const col = Math.round((adjustedX - (row % 2) * (grid.cellWidth / 2)) / grid.cellWidth);
            snappedX = col * grid.cellWidth + (row % 2) * (grid.cellWidth / 2);
            snappedY = row * (grid.cellHeight * 0.75);
            break;
        }

        case GridType.Isometric: {
            // Isometric grid (diamond-shaped cells)
            const tileWidth = grid.cellWidth;
            const tileHeight = grid.cellHeight;
            const col = Math.round((adjustedX / tileWidth + adjustedY / tileHeight) / 2);
            const row = Math.round((adjustedY / tileHeight - adjustedX / tileWidth) / 2);
            snappedX = (col - row) * tileWidth;
            snappedY = (col + row) * tileHeight;
            break;
        }

        default:
            return point;
    }

    // Add offset back
    return {
        x: snappedX + grid.offsetX,
        y: snappedY + grid.offsetY
    };
};

/**
 * Convert pixel coordinates to grid cell coordinates
 * @param point Pixel position
 * @param grid Grid configuration
 * @returns Grid cell coordinates (col, row)
 */
export const pointToCell = (point: Point, grid: GridConfig): GridCell => {
    const adjustedX = point.x - grid.offsetX;
    const adjustedY = point.y - grid.offsetY;

    let col: number;
    let row: number;

    switch (grid.type) {
        case GridType.Square:
            col = Math.floor(adjustedX / grid.cellWidth);
            row = Math.floor(adjustedY / grid.cellHeight);
            break;

        case GridType.HexH:
            col = Math.floor(adjustedX / (grid.cellWidth * 0.75));
            row = Math.floor((adjustedY - (col % 2) * (grid.cellHeight / 2)) / grid.cellHeight);
            break;

        case GridType.HexV:
            row = Math.floor(adjustedY / (grid.cellHeight * 0.75));
            col = Math.floor((adjustedX - (row % 2) * (grid.cellWidth / 2)) / grid.cellWidth);
            break;

        case GridType.Isometric: {
            const tileWidth = grid.cellWidth;
            const tileHeight = grid.cellHeight;
            col = Math.floor((adjustedX / tileWidth + adjustedY / tileHeight) / 2);
            row = Math.floor((adjustedY / tileHeight - adjustedX / tileWidth) / 2);
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
    let x: number;
    let y: number;

    switch (grid.type) {
        case GridType.Square:
            x = cell.col * grid.cellWidth + grid.cellWidth / 2;
            y = cell.row * grid.cellHeight + grid.cellHeight / 2;
            break;

        case GridType.HexH:
            x = cell.col * (grid.cellWidth * 0.75) + grid.cellWidth / 2;
            y = cell.row * grid.cellHeight + (cell.col % 2) * (grid.cellHeight / 2) + grid.cellHeight / 2;
            break;

        case GridType.HexV:
            x = cell.col * grid.cellWidth + (cell.row % 2) * (grid.cellWidth / 2) + grid.cellWidth / 2;
            y = cell.row * (grid.cellHeight * 0.75) + grid.cellHeight / 2;
            break;

        case GridType.Isometric: {
            const tileWidth = grid.cellWidth;
            const tileHeight = grid.cellHeight;
            x = (cell.col - cell.row) * tileWidth + tileWidth / 2;
            y = (cell.col + cell.row) * tileHeight + tileHeight / 2;
            break;
        }

        default:
            x = 0;
            y = 0;
    }

    return {
        x: x + grid.offsetX,
        y: y + grid.offsetY
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

    // INV-10: Cell dimensions must be positive
    if (grid.cellWidth <= 0) {
        errors.push('Grid cell width must be positive');
    }
    if (grid.cellHeight <= 0) {
        errors.push('Grid cell height must be positive');
    }

    // Validate color format (#RRGGBB)
    const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
    if (!hexColorRegex.test(grid.color)) {
        errors.push('Grid color must be hex format #RRGGBB');
    }

    // Validate grid type is valid enum value
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
    cellWidth: 50,
    cellHeight: 50,
    offsetX: 0,
    offsetY: 0,
    color: '#000000',
    snapToGrid: true
});
