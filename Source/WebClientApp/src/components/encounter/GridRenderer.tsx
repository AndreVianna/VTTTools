// GENERATED: 2025-10-03 by Claude Code Phase 2
// SPEC: Documents/Areas/Library/Features/EncounterManagement/UseCases/ConfigureGrid/USE_CASE.md
// USE_CASE: ConfigureGrid
// LAYER: UI (React Component)

/**
 * GridRenderer component
 * Renders grid overlay on Konva Stage for tactical measurement
 * Supports 5 grid types: NoGrid, Square, HexH, HexV, Isometric
 * ACCEPTANCE_CRITERION: AC-06 - All grid types supported
 */

import { GroupName } from '@services/layerManager';
import { type GridConfig, GridType } from '@utils/gridCalculator';
import type React from 'react';
import { useMemo } from 'react';
import { Group, Line } from 'react-konva';

export interface GridRendererProps {
  grid: GridConfig;
  stageWidth: number;
  stageHeight: number;
  visible?: boolean;
}

/**
 * Renders grid overlay based on grid configuration
 * Performance target: 60 FPS with any grid type active (Phase 4 Gate 4)
 */
export const GridRenderer: React.FC<GridRendererProps> = ({ grid, stageWidth, stageHeight, visible = true }) => {
  const DEFAULT_GRID_COLOR = 'rgba(0, 0, 0, 0.4)';

  // Memoize grid lines for performance (60 FPS target)
  // MUST be called before any early returns (React Hooks Rules)
  const gridLines = useMemo(() => {
    const lines: React.ReactElement[] = [];

    const cellWidth = grid.cellSize.width;
    const cellHeight = grid.cellSize.height;

    // Normalize offset to be within [-cellSize/2, +cellSize/2]
    // This ensures partial cells are shown at the edges
    const rawOffsetX = grid.offset.left;
    const rawOffsetY = grid.offset.top;
    const normalizedOffsetX = ((rawOffsetX % cellWidth) + cellWidth + cellWidth / 2) % cellWidth - cellWidth / 2;
    const normalizedOffsetY = ((rawOffsetY % cellHeight) + cellHeight + cellHeight / 2) % cellHeight - cellHeight / 2;

    // Start drawing from before 0,0 to show partial cells at the edges
    const startX = normalizedOffsetX - cellWidth;
    const startY = normalizedOffsetY - cellHeight;

    const gridColor = 'color' in grid && typeof grid.color === 'string' ? grid.color : DEFAULT_GRID_COLOR;

    switch (grid.type) {
      case GridType.Square:
        // Vertical lines - draw from startX but clip to [0, stageWidth]
        for (let x = startX; x <= stageWidth + cellWidth; x += cellWidth) {
          // Only draw lines that are strictly within visible area
          if (x > 0.5 && x < stageWidth - 0.5) {
            lines.push(
              <Line
                key={`v-${x}`}
                points={[x, 0, x, stageHeight]}
                stroke={gridColor}
                strokeWidth={1}
                listening={false}
              />,
            );
          }
        }
        // Horizontal lines - draw from startY but clip to [0, stageHeight]
        for (let y = startY; y <= stageHeight + cellHeight; y += cellHeight) {
          // Only draw lines that are strictly within visible area
          if (y > 0.5 && y < stageHeight - 0.5) {
            lines.push(
              <Line
                key={`h-${y}`}
                points={[0, y, stageWidth, y]}
                stroke={gridColor}
                strokeWidth={1}
                listening={false}
              />,
            );
          }
        }
        break;

      case GridType.HexH: {
        // Hexagonal horizontal (flat-top hexagons)
        // Red Blob Games: https://www.redblobgames.com/grids/hexagons/
        const sqrt3 = Math.sqrt(3);

        const hexCellWidth = cellWidth * (sqrt3 / 2);
        const hexCellHeight = cellHeight;

        const size = cellHeight / sqrt3;

        const horizSpacing = hexCellWidth;
        const vertSpacing = hexCellHeight;

        const cols = Math.ceil((stageWidth + horizSpacing * 2) / horizSpacing) + 3;
        const rows = Math.ceil((stageHeight + vertSpacing * 2) / vertSpacing) + 3;

        for (let row = -2; row < rows; row++) {
          for (let col = -2; col < cols; col++) {
            // Odd-q offset: odd columns are shifted down by cellHeight/2
            const x = col * horizSpacing + normalizedOffsetX;
            const y = row * vertSpacing + (col & 1) * (vertSpacing / 2) + normalizedOffsetY;

            // Draw flat-top hexagon with vertices at 0°, 60°, 120°, 180°, 240°, 300°
            const points = [];
            for (let i = 0; i < 6; i++) {
              const angleDeg = 60 * i;
              const angleRad = (Math.PI / 180) * angleDeg;
              points.push(x + size * Math.cos(angleRad));
              points.push(y + size * Math.sin(angleRad));
            }

            lines.push(
              <Line
                key={`hex-${row}-${col}`}
                points={points}
                stroke={gridColor}
                strokeWidth={1}
                closed={true}
                listening={false}
              />,
            );
          }
        }
        break;
      }

      case GridType.HexV: {
        // Hexagonal vertical (pointy-top hexagons)
        // Red Blob Games: https://www.redblobgames.com/grids/hexagons/
        const sqrt3 = Math.sqrt(3);

        const hexVCellWidth = cellWidth;
        const hexVCellHeight = cellHeight * (sqrt3 / 2);

        const size = cellWidth / sqrt3;

        const horizSpacing = hexVCellWidth;
        const vertSpacing = hexVCellHeight;

        const cols = Math.ceil((stageWidth + horizSpacing * 2) / horizSpacing) + 3;
        const rows = Math.ceil((stageHeight + vertSpacing * 2) / vertSpacing) + 3;

        for (let row = -2; row < rows; row++) {
          for (let col = -2; col < cols; col++) {
            // Odd-r offset: odd rows are shifted right by cellWidth/2
            const x = col * horizSpacing + (row & 1) * (horizSpacing / 2) + normalizedOffsetX;
            const y = row * vertSpacing + normalizedOffsetY;

            // Draw pointy-top hexagon with vertices at 30°, 90°, 150°, 210°, 270°, 330°
            const points = [];
            for (let i = 0; i < 6; i++) {
              const angleDeg = 60 * i + 30;
              const angleRad = (Math.PI / 180) * angleDeg;
              points.push(x + size * Math.cos(angleRad));
              points.push(y + size * Math.sin(angleRad));
            }

            lines.push(
              <Line
                key={`hex-${row}-${col}`}
                points={points}
                stroke={gridColor}
                strokeWidth={1}
                closed={true}
                listening={false}
              />,
            );
          }
        }
        break;
      }

      case GridType.Isometric: {
        // Isometric grid (diamond-shaped cells)
        const tileWidth = cellWidth;
        const tileHeight = cellHeight;

        const tileHeightHalf = tileHeight / 2;

        const cols = Math.ceil((stageWidth + tileWidth * 2) / tileWidth) + 4;
        const rows = Math.ceil((stageHeight + tileHeight * 2) / tileHeight) + 4;

        for (let row = -3; row < rows; row++) {
          for (let col = -3; col < cols; col++) {
            // Isometric projection: half is only applied to vertical direction
            const x = (col - row) * tileWidth + normalizedOffsetX;
            const y = (col + row) * tileHeightHalf + normalizedOffsetY;

            // Draw diamond outline (center point at x,y)
            const points = [
              x,
              y - tileHeightHalf, // Top
              x + tileWidth,
              y, // Right
              x,
              y + tileHeightHalf, // Bottom
              x - tileWidth,
              y, // Left
            ];

            lines.push(
              <Line
                key={`iso-${row}-${col}`}
                points={points}
                stroke={gridColor}
                strokeWidth={1}
                closed={true}
                listening={false}
              />,
            );
          }
        }
        break;
      }
    }

    return lines;
  }, [grid, stageWidth, stageHeight]);

  if (!visible || grid.type === GridType.NoGrid) {
    return null;
  }

  return (
    <Group name={GroupName.Grid} key={`grid-${stageWidth}-${stageHeight}`}>
      {gridLines}
    </Group>
  );
};
