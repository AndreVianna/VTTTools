// GridRenderer Component Tests
// Tests grid rendering behavior for all grid types
// TARGET_COVERAGE: 70%+

import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GridType, type GridConfig } from '@utils/gridCalculator';
import { GroupName } from '@services/layerManager';
import type { GridRendererProps } from './GridRenderer';

// Track rendered lines for assertions
interface MockLineProps {
    points: number[];
    stroke: string;
    strokeWidth: number;
    closed?: boolean;
    listening: boolean;
}

let renderedLines: MockLineProps[] = [];

// Mock react-konva components to render testable DOM elements
vi.mock('react-konva', () => ({
    Group: ({
        children,
        name,
        ...props
    }: {
        children?: React.ReactNode;
        name?: string;
    }) => (
        <div
            role="group"
            aria-label={name === GroupName.Grid ? 'Grid Overlay' : name}
            data-group-name={name}
            {...props}
        >
            {children}
        </div>
    ),
    Line: ({
        points,
        stroke,
        strokeWidth,
        closed,
        listening,
        ...props
    }: MockLineProps) => {
        // Track rendered lines for assertions
        renderedLines.push({ points, stroke, strokeWidth, closed, listening });
        return (
            <div
                role="presentation"
                aria-label="Grid Line"
                data-points={JSON.stringify(points)}
                data-stroke={stroke}
                data-stroke-width={strokeWidth}
                data-closed={closed}
                data-listening={listening}
                {...props}
            />
        );
    },
}));

// Import after mocking
import { GridRenderer } from './GridRenderer';

describe('GridRenderer', () => {
    // Default grid configuration for tests
    const defaultGrid: GridConfig = {
        type: GridType.Square,
        cellSize: { width: 50, height: 50 },
        offset: { left: 0, top: 0 },
        snap: true,
        scale: 1,
    };

    // Default props for most tests
    const defaultProps: GridRendererProps = {
        grid: defaultGrid,
        stageWidth: 500,
        stageHeight: 500,
        visible: true,
    };

    beforeEach(() => {
        vi.clearAllMocks();
        renderedLines = [];
    });

    describe('Rendering', () => {
        it('should render grid group with correct name', () => {
            // Arrange
            const props = { ...defaultProps };

            // Act
            render(<GridRenderer {...props} />);

            // Assert
            const gridGroup = screen.getByRole('group', { name: 'Grid Overlay' });
            expect(gridGroup).toBeInTheDocument();
            expect(gridGroup).toHaveAttribute('data-group-name', GroupName.Grid);
        });

        it('should render grid lines inside the group', () => {
            // Arrange
            const props = { ...defaultProps };

            // Act
            render(<GridRenderer {...props} />);

            // Assert
            const lines = screen.getAllByRole('presentation', { name: 'Grid Line' });
            expect(lines.length).toBeGreaterThan(0);
        });

        it('should apply default grid color when not specified', () => {
            // Arrange
            const props = { ...defaultProps };

            // Act
            render(<GridRenderer {...props} />);

            // Assert
            const firstLine = renderedLines[0];
            expect(firstLine).toBeDefined();
            expect(firstLine?.stroke).toBe('rgba(0, 0, 0, 0.4)');
        });

        it('should use stroke width of 1 for performance', () => {
            // Arrange
            const props = { ...defaultProps };

            // Act
            render(<GridRenderer {...props} />);

            // Assert
            renderedLines.forEach((line) => {
                expect(line.strokeWidth).toBe(1);
            });
        });

        it('should set listening to false for all lines', () => {
            // Arrange
            const props = { ...defaultProps };

            // Act
            render(<GridRenderer {...props} />);

            // Assert
            renderedLines.forEach((line) => {
                expect(line.listening).toBe(false);
            });
        });
    });

    describe('Visibility Toggle', () => {
        it('should render nothing when visible is false', () => {
            // Arrange
            const props: GridRendererProps = {
                ...defaultProps,
                visible: false,
            };

            // Act
            const { container } = render(<GridRenderer {...props} />);

            // Assert
            expect(container.firstChild).toBeNull();
            expect(renderedLines).toHaveLength(0);
        });

        it('should render grid when visible is true', () => {
            // Arrange
            const props: GridRendererProps = {
                ...defaultProps,
                visible: true,
            };

            // Act
            render(<GridRenderer {...props} />);

            // Assert
            const gridGroup = screen.getByRole('group', { name: 'Grid Overlay' });
            expect(gridGroup).toBeInTheDocument();
        });

        it('should render grid when visible is undefined (defaults to true)', () => {
            // Arrange
            const props: GridRendererProps = {
                grid: defaultGrid,
                stageWidth: 500,
                stageHeight: 500,
            };

            // Act
            render(<GridRenderer {...props} />);

            // Assert
            const gridGroup = screen.getByRole('group', { name: 'Grid Overlay' });
            expect(gridGroup).toBeInTheDocument();
        });
    });

    describe('NoGrid Type', () => {
        it('should render nothing when grid type is NoGrid', () => {
            // Arrange
            const props: GridRendererProps = {
                ...defaultProps,
                grid: {
                    ...defaultGrid,
                    type: GridType.NoGrid,
                },
            };

            // Act
            const { container } = render(<GridRenderer {...props} />);

            // Assert
            expect(container.firstChild).toBeNull();
            expect(renderedLines).toHaveLength(0);
        });

        it('should render nothing for NoGrid even when visible is true', () => {
            // Arrange
            const props: GridRendererProps = {
                grid: {
                    type: GridType.NoGrid,
                    cellSize: { width: 50, height: 50 },
                    offset: { left: 0, top: 0 },
                    snap: true,
                    scale: 1,
                },
                stageWidth: 500,
                stageHeight: 500,
                visible: true,
            };

            // Act
            const { container } = render(<GridRenderer {...props} />);

            // Assert
            expect(container.firstChild).toBeNull();
        });
    });

    describe('Square Grid Type', () => {
        it('should render vertical and horizontal lines for square grid', () => {
            // Arrange
            const props: GridRendererProps = {
                ...defaultProps,
                grid: {
                    ...defaultGrid,
                    type: GridType.Square,
                    cellSize: { width: 100, height: 100 },
                },
                stageWidth: 300,
                stageHeight: 300,
            };

            // Act
            render(<GridRenderer {...props} />);

            // Assert - should have both vertical and horizontal lines
            const verticalLines = renderedLines.filter((line) => {
                // Vertical lines have same x for start and end
                return line.points[0] === line.points[2];
            });
            const horizontalLines = renderedLines.filter((line) => {
                // Horizontal lines have same y for start and end
                return line.points[1] === line.points[3];
            });

            expect(verticalLines.length).toBeGreaterThan(0);
            expect(horizontalLines.length).toBeGreaterThan(0);
        });

        it('should render vertical lines spanning full stage height', () => {
            // Arrange
            const stageHeight = 400;
            const props: GridRendererProps = {
                ...defaultProps,
                grid: {
                    ...defaultGrid,
                    type: GridType.Square,
                    cellSize: { width: 100, height: 100 },
                },
                stageWidth: 300,
                stageHeight,
            };

            // Act
            render(<GridRenderer {...props} />);

            // Assert
            const verticalLines = renderedLines.filter((line) => line.points[0] === line.points[2]);
            verticalLines.forEach((line) => {
                expect(line.points[1]).toBe(0); // y1 = 0
                expect(line.points[3]).toBe(stageHeight); // y2 = stageHeight
            });
        });

        it('should render horizontal lines spanning full stage width', () => {
            // Arrange
            const stageWidth = 400;
            const props: GridRendererProps = {
                ...defaultProps,
                grid: {
                    ...defaultGrid,
                    type: GridType.Square,
                    cellSize: { width: 100, height: 100 },
                },
                stageWidth,
                stageHeight: 300,
            };

            // Act
            render(<GridRenderer {...props} />);

            // Assert
            const horizontalLines = renderedLines.filter((line) => line.points[1] === line.points[3]);
            horizontalLines.forEach((line) => {
                expect(line.points[0]).toBe(0); // x1 = 0
                expect(line.points[2]).toBe(stageWidth); // x2 = stageWidth
            });
        });

        it('should render more lines for larger stage dimensions', () => {
            // Arrange - small stage
            const smallProps: GridRendererProps = {
                ...defaultProps,
                grid: {
                    ...defaultGrid,
                    cellSize: { width: 50, height: 50 },
                },
                stageWidth: 200,
                stageHeight: 200,
            };

            // Act - small stage
            render(<GridRenderer {...smallProps} />);
            const smallLineCount = renderedLines.length;

            // Reset
            renderedLines = [];

            // Arrange - large stage
            const largeProps: GridRendererProps = {
                ...defaultProps,
                grid: {
                    ...defaultGrid,
                    cellSize: { width: 50, height: 50 },
                },
                stageWidth: 600,
                stageHeight: 600,
            };

            // Act - large stage
            render(<GridRenderer {...largeProps} />);
            const largeLineCount = renderedLines.length;

            // Assert
            expect(largeLineCount).toBeGreaterThan(smallLineCount);
        });

        it('should render fewer lines with larger cell sizes', () => {
            // Arrange - small cells
            const smallCellProps: GridRendererProps = {
                ...defaultProps,
                grid: {
                    ...defaultGrid,
                    cellSize: { width: 25, height: 25 },
                },
                stageWidth: 300,
                stageHeight: 300,
            };

            // Act - small cells
            render(<GridRenderer {...smallCellProps} />);
            const smallCellLineCount = renderedLines.length;

            // Reset
            renderedLines = [];

            // Arrange - large cells
            const largeCellProps: GridRendererProps = {
                ...defaultProps,
                grid: {
                    ...defaultGrid,
                    cellSize: { width: 100, height: 100 },
                },
                stageWidth: 300,
                stageHeight: 300,
            };

            // Act - large cells
            render(<GridRenderer {...largeCellProps} />);
            const largeCellLineCount = renderedLines.length;

            // Assert
            expect(largeCellLineCount).toBeLessThan(smallCellLineCount);
        });
    });

    describe('HexH Grid Type (Flat-Top Hexagons)', () => {
        it('should render closed polygon lines for HexH grid', () => {
            // Arrange
            const props: GridRendererProps = {
                ...defaultProps,
                grid: {
                    ...defaultGrid,
                    type: GridType.HexH,
                    cellSize: { width: 60, height: 52 },
                },
            };

            // Act
            render(<GridRenderer {...props} />);

            // Assert
            renderedLines.forEach((line) => {
                expect(line.closed).toBe(true);
            });
        });

        it('should render hexagons with 12 coordinate values (6 vertices x 2)', () => {
            // Arrange
            const props: GridRendererProps = {
                ...defaultProps,
                grid: {
                    ...defaultGrid,
                    type: GridType.HexH,
                    cellSize: { width: 60, height: 52 },
                },
            };

            // Act
            render(<GridRenderer {...props} />);

            // Assert - each hexagon has 6 vertices (x,y pairs = 12 values)
            renderedLines.forEach((line) => {
                expect(line.points.length).toBe(12);
            });
        });

        it('should render multiple hexagons to cover the stage', () => {
            // Arrange
            const props: GridRendererProps = {
                ...defaultProps,
                grid: {
                    ...defaultGrid,
                    type: GridType.HexH,
                    cellSize: { width: 60, height: 52 },
                },
                stageWidth: 500,
                stageHeight: 500,
            };

            // Act
            render(<GridRenderer {...props} />);

            // Assert
            expect(renderedLines.length).toBeGreaterThan(10);
        });
    });

    describe('HexV Grid Type (Pointy-Top Hexagons)', () => {
        it('should render closed polygon lines for HexV grid', () => {
            // Arrange
            const props: GridRendererProps = {
                ...defaultProps,
                grid: {
                    ...defaultGrid,
                    type: GridType.HexV,
                    cellSize: { width: 52, height: 60 },
                },
            };

            // Act
            render(<GridRenderer {...props} />);

            // Assert
            renderedLines.forEach((line) => {
                expect(line.closed).toBe(true);
            });
        });

        it('should render hexagons with 12 coordinate values (6 vertices x 2)', () => {
            // Arrange
            const props: GridRendererProps = {
                ...defaultProps,
                grid: {
                    ...defaultGrid,
                    type: GridType.HexV,
                    cellSize: { width: 52, height: 60 },
                },
            };

            // Act
            render(<GridRenderer {...props} />);

            // Assert - each hexagon has 6 vertices (x,y pairs = 12 values)
            renderedLines.forEach((line) => {
                expect(line.points.length).toBe(12);
            });
        });

        it('should render multiple hexagons to cover the stage', () => {
            // Arrange
            const props: GridRendererProps = {
                ...defaultProps,
                grid: {
                    ...defaultGrid,
                    type: GridType.HexV,
                    cellSize: { width: 52, height: 60 },
                },
                stageWidth: 500,
                stageHeight: 500,
            };

            // Act
            render(<GridRenderer {...props} />);

            // Assert
            expect(renderedLines.length).toBeGreaterThan(10);
        });
    });

    describe('Isometric Grid Type', () => {
        it('should render closed diamond shapes for isometric grid', () => {
            // Arrange
            const props: GridRendererProps = {
                ...defaultProps,
                grid: {
                    ...defaultGrid,
                    type: GridType.Isometric,
                    cellSize: { width: 64, height: 32 },
                },
            };

            // Act
            render(<GridRenderer {...props} />);

            // Assert
            renderedLines.forEach((line) => {
                expect(line.closed).toBe(true);
            });
        });

        it('should render diamonds with 8 coordinate values (4 vertices x 2)', () => {
            // Arrange
            const props: GridRendererProps = {
                ...defaultProps,
                grid: {
                    ...defaultGrid,
                    type: GridType.Isometric,
                    cellSize: { width: 64, height: 32 },
                },
            };

            // Act
            render(<GridRenderer {...props} />);

            // Assert - each diamond has 4 vertices (x,y pairs = 8 values)
            renderedLines.forEach((line) => {
                expect(line.points.length).toBe(8);
            });
        });

        it('should render multiple diamonds to cover the stage', () => {
            // Arrange
            const props: GridRendererProps = {
                ...defaultProps,
                grid: {
                    ...defaultGrid,
                    type: GridType.Isometric,
                    cellSize: { width: 64, height: 32 },
                },
                stageWidth: 500,
                stageHeight: 500,
            };

            // Act
            render(<GridRenderer {...props} />);

            // Assert
            expect(renderedLines.length).toBeGreaterThan(10);
        });
    });

    describe('Offset Positioning', () => {
        it('should apply positive offset to square grid lines', () => {
            // Arrange
            const offsetX = 25;
            const props: GridRendererProps = {
                ...defaultProps,
                grid: {
                    ...defaultGrid,
                    type: GridType.Square,
                    cellSize: { width: 100, height: 100 },
                    offset: { left: offsetX, top: 0 },
                },
                stageWidth: 300,
                stageHeight: 300,
            };

            // Act
            render(<GridRenderer {...props} />);

            // Assert - vertical line positions should be offset
            const verticalLines = renderedLines.filter((line) => line.points[0] === line.points[2]);
            expect(verticalLines.length).toBeGreaterThan(0);
            // Lines should not be at multiples of 100 exactly (due to offset)
            const linePositions = verticalLines.map((line) => line.points[0]);
            const hasOffset = linePositions.some((pos) => pos % 100 !== 0);
            expect(hasOffset).toBe(true);
        });

        it('should apply negative offset to square grid lines', () => {
            // Arrange
            const offsetX = -25;
            const props: GridRendererProps = {
                ...defaultProps,
                grid: {
                    ...defaultGrid,
                    type: GridType.Square,
                    cellSize: { width: 100, height: 100 },
                    offset: { left: offsetX, top: 0 },
                },
                stageWidth: 300,
                stageHeight: 300,
            };

            // Act
            render(<GridRenderer {...props} />);

            // Assert - should still render lines
            const verticalLines = renderedLines.filter((line) => line.points[0] === line.points[2]);
            expect(verticalLines.length).toBeGreaterThan(0);
        });

        it('should normalize offset larger than cell size', () => {
            // Arrange - offset larger than cell size should wrap
            const props: GridRendererProps = {
                ...defaultProps,
                grid: {
                    ...defaultGrid,
                    type: GridType.Square,
                    cellSize: { width: 50, height: 50 },
                    offset: { left: 125, top: 125 }, // 2.5 cells worth of offset
                },
                stageWidth: 300,
                stageHeight: 300,
            };

            // Act
            render(<GridRenderer {...props} />);

            // Assert - should still render lines (offset is normalized)
            expect(renderedLines.length).toBeGreaterThan(0);
        });

        it('should apply offset to hexagonal grids', () => {
            // Arrange
            const props: GridRendererProps = {
                ...defaultProps,
                grid: {
                    ...defaultGrid,
                    type: GridType.HexH,
                    cellSize: { width: 60, height: 52 },
                    offset: { left: 30, top: 26 },
                },
            };

            // Act
            render(<GridRenderer {...props} />);

            // Assert
            expect(renderedLines.length).toBeGreaterThan(0);
        });

        it('should apply offset to isometric grids', () => {
            // Arrange
            const props: GridRendererProps = {
                ...defaultProps,
                grid: {
                    ...defaultGrid,
                    type: GridType.Isometric,
                    cellSize: { width: 64, height: 32 },
                    offset: { left: 32, top: 16 },
                },
            };

            // Act
            render(<GridRenderer {...props} />);

            // Assert
            expect(renderedLines.length).toBeGreaterThan(0);
        });
    });

    describe('Stage Dimensions', () => {
        it('should handle small stage dimensions', () => {
            // Arrange
            const props: GridRendererProps = {
                ...defaultProps,
                grid: {
                    ...defaultGrid,
                    cellSize: { width: 50, height: 50 },
                },
                stageWidth: 100,
                stageHeight: 100,
            };

            // Act
            render(<GridRenderer {...props} />);

            // Assert
            const gridGroup = screen.getByRole('group', { name: 'Grid Overlay' });
            expect(gridGroup).toBeInTheDocument();
        });

        it('should handle large stage dimensions', () => {
            // Arrange
            const props: GridRendererProps = {
                ...defaultProps,
                grid: {
                    ...defaultGrid,
                    cellSize: { width: 50, height: 50 },
                },
                stageWidth: 4000,
                stageHeight: 4000,
            };

            // Act
            render(<GridRenderer {...props} />);

            // Assert
            const gridGroup = screen.getByRole('group', { name: 'Grid Overlay' });
            expect(gridGroup).toBeInTheDocument();
            // Should render many lines for large stage
            expect(renderedLines.length).toBeGreaterThan(50);
        });

        it('should handle non-square stage dimensions', () => {
            // Arrange
            const props: GridRendererProps = {
                ...defaultProps,
                grid: {
                    ...defaultGrid,
                    cellSize: { width: 50, height: 50 },
                },
                stageWidth: 800,
                stageHeight: 400,
            };

            // Act
            render(<GridRenderer {...props} />);

            // Assert
            const gridGroup = screen.getByRole('group', { name: 'Grid Overlay' });
            expect(gridGroup).toBeInTheDocument();
        });
    });

    describe('Cell Size Variations', () => {
        it('should handle non-square cell sizes for square grid', () => {
            // Arrange
            const props: GridRendererProps = {
                ...defaultProps,
                grid: {
                    ...defaultGrid,
                    type: GridType.Square,
                    cellSize: { width: 80, height: 40 },
                },
            };

            // Act
            render(<GridRenderer {...props} />);

            // Assert
            expect(renderedLines.length).toBeGreaterThan(0);
        });

        it('should handle very small cell sizes', () => {
            // Arrange
            const props: GridRendererProps = {
                ...defaultProps,
                grid: {
                    ...defaultGrid,
                    cellSize: { width: 10, height: 10 },
                },
                stageWidth: 100,
                stageHeight: 100,
            };

            // Act
            render(<GridRenderer {...props} />);

            // Assert - should render many lines
            expect(renderedLines.length).toBeGreaterThan(10);
        });

        it('should handle large cell sizes', () => {
            // Arrange
            const props: GridRendererProps = {
                ...defaultProps,
                grid: {
                    ...defaultGrid,
                    cellSize: { width: 200, height: 200 },
                },
                stageWidth: 500,
                stageHeight: 500,
            };

            // Act
            render(<GridRenderer {...props} />);

            // Assert - should render few lines
            expect(renderedLines.length).toBeLessThan(20);
        });
    });

    describe('Grid Type Switch', () => {
        it.each([
            [GridType.Square, 'Square'],
            [GridType.HexH, 'HexH'],
            [GridType.HexV, 'HexV'],
            [GridType.Isometric, 'Isometric'],
        ])('should render grid for GridType.%s (%s)', (gridType) => {
            // Arrange
            const props: GridRendererProps = {
                ...defaultProps,
                grid: {
                    ...defaultGrid,
                    type: gridType,
                },
            };

            // Act
            render(<GridRenderer {...props} />);

            // Assert
            const gridGroup = screen.getByRole('group', { name: 'Grid Overlay' });
            expect(gridGroup).toBeInTheDocument();
            expect(renderedLines.length).toBeGreaterThan(0);
        });
    });

    describe('Memoization', () => {
        it('should render different output when props change', () => {
            // Arrange - initial props
            const initialProps: GridRendererProps = {
                ...defaultProps,
                grid: {
                    ...defaultGrid,
                    type: GridType.Square,
                    cellSize: { width: 100, height: 100 },
                },
                stageWidth: 300,
                stageHeight: 300,
            };

            // Act - first render
            const { rerender } = render(<GridRenderer {...initialProps} />);
            const firstRenderLineCount = renderedLines.length;

            // Reset and re-render with different props
            renderedLines = [];
            const updatedProps: GridRendererProps = {
                ...initialProps,
                grid: {
                    ...initialProps.grid,
                    cellSize: { width: 50, height: 50 }, // Smaller cells = more lines
                },
            };
            rerender(<GridRenderer {...updatedProps} />);
            const secondRenderLineCount = renderedLines.length;

            // Assert - more lines should be rendered with smaller cells
            expect(secondRenderLineCount).toBeGreaterThan(firstRenderLineCount);
        });

        it('should recalculate grid when stage dimensions change', () => {
            // Arrange - initial props with small stage
            const initialProps: GridRendererProps = {
                ...defaultProps,
                grid: {
                    ...defaultGrid,
                    type: GridType.Square,
                    cellSize: { width: 50, height: 50 },
                },
                stageWidth: 200,
                stageHeight: 200,
            };

            // Act - first render
            const { rerender } = render(<GridRenderer {...initialProps} />);
            const firstRenderLineCount = renderedLines.length;

            // Reset and re-render with larger stage
            renderedLines = [];
            const updatedProps: GridRendererProps = {
                ...initialProps,
                stageWidth: 400,
                stageHeight: 400,
            };
            rerender(<GridRenderer {...updatedProps} />);
            const secondRenderLineCount = renderedLines.length;

            // Assert - more lines should be rendered with larger stage
            expect(secondRenderLineCount).toBeGreaterThan(firstRenderLineCount);
        });

        it('should recalculate grid when grid type changes', () => {
            // Arrange - initial props with square grid
            const initialProps: GridRendererProps = {
                ...defaultProps,
                grid: {
                    ...defaultGrid,
                    type: GridType.Square,
                    cellSize: { width: 100, height: 100 },
                },
                stageWidth: 300,
                stageHeight: 300,
            };

            // Act - first render (square grid)
            const { rerender } = render(<GridRenderer {...initialProps} />);
            const squareLineClosedValues = renderedLines.map((l) => l.closed);

            // Reset and re-render with hexagonal grid
            renderedLines = [];
            const hexProps: GridRendererProps = {
                ...initialProps,
                grid: {
                    ...initialProps.grid,
                    type: GridType.HexH,
                },
            };
            rerender(<GridRenderer {...hexProps} />);
            const hexLineClosedValues = renderedLines.map((l) => l.closed);

            // Assert - square grid lines are not closed, hex lines are closed
            expect(squareLineClosedValues.every((v) => v === undefined)).toBe(true);
            expect(hexLineClosedValues.every((v) => v === true)).toBe(true);
        });
    });
});
