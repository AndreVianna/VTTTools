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
  // Default grid color (darker for better visibility in both light and dark themes)
  const DEFAULT_GRID_COLOR = 'rgba(0, 0, 0, 0.4)';

  // Memoize grid lines for performance (60 FPS target)
  // MUST be called before any early returns (React Hooks Rules)
  const gridLines = useMemo(() => {
    const lines: React.ReactElement[] = [];

    const cellWidth = grid.cellSize.width;
    const cellHeight = grid.cellSize.height;
    const offsetX = grid.offset.left;
    const offsetY = grid.offset.top;
    const gridColor = (grid as any).color || DEFAULT_GRID_COLOR;

    switch (grid.type) {
      case GridType.Square:
        // Vertical lines
        for (let x = offsetX; x <= stageWidth; x += cellWidth) {
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
        // Horizontal lines
        for (let y = offsetY; y <= stageHeight; y += cellHeight) {
          lines.push(
            <Line key={`h-${y}`} points={[0, y, stageWidth, y]} stroke={gridColor} strokeWidth={1} listening={false} />,
          );
        }
        break;

      case GridType.HexH: {
        // Hexagonal horizontal (flat-top hexagons)
        // Red Blob Games: https://www.redblobgames.com/grids/hexagons/
        // For flat-top hexagons, vertices start at 0° (pointing right)
        // The hexagon width (flat-to-flat) and height (point-to-point) relationship:
        // height = (2/√3) * width OR width = (√3/2) * height

        const sqrt3 = Math.sqrt(3);

        const hexCellWidth = cellWidth * (sqrt3 / 2);
        const hexCellHeight = cellHeight;

        // For flat-top: the outer radius equals cellHeight / √3
        // This makes the point-to-point height = 2 * radius = 2 * cellHeight / √3 = (2/√3) * cellHeight
        const size = cellHeight / sqrt3;

        const horizSpacing = hexCellWidth;
        const vertSpacing = hexCellHeight;

        const cols = Math.ceil(stageWidth / horizSpacing) + 3;
        const rows = Math.ceil(stageHeight / vertSpacing) + 3;

        for (let row = -1; row < rows; row++) {
          for (let col = -1; col < cols; col++) {
            // Odd-q offset: odd columns are shifted down by cellHeight/2
            const x = col * horizSpacing + offsetX;
            const y = row * vertSpacing + (col & 1) * (vertSpacing / 2) + offsetY;

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
        // For pointy-top hexagons, vertices start at 30° (pointing up)
        // The hexagon width (point-to-point) and height (flat-to-flat) relationship:
        // width = (2/√3) * height OR height = (√3/2) * width
        const sqrt3 = Math.sqrt(3);

        const hexVCellWidth = cellWidth;
        const hexVCellHeight = cellHeight * (sqrt3 / 2);

        // For pointy-top: the outer radius equals cellWidth / √3
        // This makes the point-to-point width = 2 * radius = 2 * cellWidth / √3 = (2/√3) * cellWidth
        const size = cellWidth / sqrt3;

        const horizSpacing = hexVCellWidth;
        const vertSpacing = hexVCellHeight;

        const cols = Math.ceil(stageWidth / horizSpacing) + 3;
        const rows = Math.ceil(stageHeight / vertSpacing) + 3;

        for (let row = -1; row < rows; row++) {
          for (let col = -1; col < cols; col++) {
            // Odd-r offset: odd rows are shifted right by cellWidth/2
            const x = col * horizSpacing + (row & 1) * (horizSpacing / 2) + offsetX;
            const y = row * vertSpacing + offsetY;

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
        // Standard isometric projection with 2:1 ratio
        // Horizontal spacing uses full width, vertical spacing uses half height

        const tileWidth = cellWidth;
        const tileHeight = cellHeight;

        // Half dimensions for diamond vertices
        const tileHeightHalf = tileHeight / 2;

        const cols = Math.ceil(stageWidth / tileWidth) + 4;
        const rows = Math.ceil(stageHeight / tileHeight) + 4;

        for (let row = -2; row < rows; row++) {
          for (let col = -2; col < cols; col++) {
            // Isometric projection: half is only applied to vertical direction
            const x = (col - row) * tileWidth + offsetX;
            const y = (col + row) * tileHeightHalf + offsetY;

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

  return <Group name={GroupName.Grid}>{gridLines}</Group>;
};
