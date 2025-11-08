import React, { useMemo } from 'react';
import { Group, Line } from 'react-konva';
import { GridConfig, GridType } from '@utils/gridCalculator';
import { GroupName } from '@services/layerManager';

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
export const GridRenderer: React.FC<GridRendererProps> = ({
    grid,
    stageWidth,
    stageHeight,
    visible = true
}) => {
    const DEFAULT_GRID_COLOR = 'rgba(0, 0, 0, 0.4)';

    const gridLines = useMemo(() => {
        const lines: React.ReactElement[] = [];

        const cellWidth = grid.cellSize.width;
        const cellHeight = grid.cellSize.height;
        const offsetX = grid.offset.left;
        const offsetY = grid.offset.top;
        const gridColor = (grid as any).color || DEFAULT_GRID_COLOR;

        switch (grid.type) {
            case GridType.Square:
                for (let x = offsetX; x <= stageWidth; x += cellWidth) {
                    lines.push(
                        <Line
                            key={`v-${x}`}
                            points={[x, 0, x, stageHeight]}
                            stroke={gridColor}
                            strokeWidth={1}
                            listening={false}
                        />
                    );
                }
                for (let y = offsetY; y <= stageHeight; y += cellHeight) {
                    lines.push(
                        <Line
                            key={`h-${y}`}
                            points={[0, y, stageWidth, y]}
                            stroke={gridColor}
                            strokeWidth={1}
                            listening={false}
                        />
                    );
                }
                break;

            case GridType.HexH: {
                const sqrt3 = Math.sqrt(3);

                const hexCellWidth = cellWidth * (sqrt3 / 2);
                const hexCellHeight = cellHeight;
                const size = cellHeight / sqrt3;

                const horizSpacing = hexCellWidth;
                const vertSpacing = hexCellHeight;

                const cols = Math.ceil(stageWidth / horizSpacing) + 3;
                const rows = Math.ceil(stageHeight / vertSpacing) + 3;

                for (let row = -1; row < rows; row++) {
                    for (let col = -1; col < cols; col++) {
                        const x = col * horizSpacing + offsetX;
                        const y = row * vertSpacing + (col & 1) * (vertSpacing / 2) + offsetY;

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
                            />
                        );
                    }
                }
                break;
            }

            case GridType.HexV: {
                const sqrt3 = Math.sqrt(3);

                const hexVCellWidth = cellWidth;
                const hexVCellHeight = cellHeight * (sqrt3 / 2);
                const size = cellWidth / sqrt3;

                const horizSpacing = hexVCellWidth;
                const vertSpacing = hexVCellHeight;

                const cols = Math.ceil(stageWidth / horizSpacing) + 3;
                const rows = Math.ceil(stageHeight / vertSpacing) + 3;

                for (let row = -1; row < rows; row++) {
                    for (let col = -1; col < cols; col++) {
                        const x = col * horizSpacing + (row & 1) * (horizSpacing / 2) + offsetX;
                        const y = row * vertSpacing + offsetY;

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
                            />
                        );
                    }
                }
                break;
            }

            case GridType.Isometric: {
                const tileWidth = cellWidth;
                const tileHeight = cellHeight;
                const tileHeightHalf = tileHeight / 2;

                const cols = Math.ceil(stageWidth / tileWidth) + 4;
                const rows = Math.ceil(stageHeight / tileHeight) + 4;

                for (let row = -2; row < rows; row++) {
                    for (let col = -2; col < cols; col++) {
                        const x = (col - row) * tileWidth + offsetX;
                        const y = (col + row) * tileHeightHalf + offsetY;

                        const points = [
                            x, y - tileHeightHalf,      // Top
                            x + tileWidth, y,       // Right
                            x, y + tileHeightHalf,      // Bottom
                            x - tileWidth, y        // Left
                        ];

                        lines.push(
                            <Line
                                key={`iso-${row}-${col}`}
                                points={points}
                                stroke={gridColor}
                                strokeWidth={1}
                                closed={true}
                                listening={false}
                            />
                        );
                    }
                }
                break;
            }
        }

        return lines;
    }, [grid, stageWidth, stageHeight, DEFAULT_GRID_COLOR]);

    if (!visible || grid.type === GridType.NoGrid) {
        return null;
    }

    return (
        <Group name={GroupName.Grid}>
            {gridLines}
        </Group>
    );
};
