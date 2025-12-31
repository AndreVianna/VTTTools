import { createTheme, ThemeProvider } from '@mui/material';
import { render } from '@testing-library/react';
import type React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { LightSourceType, SegmentType, SegmentState, type EncounterLightSource, type EncounterWall } from '@/types/domain';
import { GridType, type GridConfig } from '@/utils/gridCalculator';
import type { InteractionScope } from '@/utils/scopeFiltering';
import { LightSourceRenderer, type LightSourceRendererProps } from './SourceRenderer';

const mockGridConfig: GridConfig = {
    type: GridType.Square,
    cellSize: { width: 50, height: 50 },
    offset: { left: 0, top: 0 },
    snap: true,
    scale: 1,
};

const createMockLightSource = (overrides: Partial<EncounterLightSource> = {}): EncounterLightSource => ({
    index: 0,
    type: LightSourceType.Natural,
    position: { x: 100, y: 100 },
    range: 5.0,
    isOn: true,
    ...overrides,
});

const renderWithTheme = (ui: React.ReactElement, mode: 'light' | 'dark' = 'light') => {
    const theme = createTheme({ palette: { mode } });
    return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
};

describe('LightSourceRenderer', () => {
    const defaultProps: LightSourceRendererProps = {
        encounterLightSource: createMockLightSource(),
        walls: [],
        gridConfig: mockGridConfig,
        activeScope: 'lights' as InteractionScope,
    };

    it('should render without errors', () => {
        renderWithTheme(<LightSourceRenderer {...defaultProps} />);
    });

    it('should have displayName set', () => {
        expect(LightSourceRenderer.displayName).toBe('LightSourceRenderer');
    });

    it('should render in light mode', () => {
        renderWithTheme(<LightSourceRenderer {...defaultProps} />, 'light');
    });

    it('should render in dark mode', () => {
        renderWithTheme(<LightSourceRenderer {...defaultProps} />, 'dark');
    });

    describe('light source types', () => {
        it('should render Natural light source', () => {
            const lightSource = createMockLightSource({ type: LightSourceType.Natural });
            renderWithTheme(<LightSourceRenderer {...defaultProps} encounterLightSource={lightSource} />);
        });

        it('should render Artificial light source', () => {
            const lightSource = createMockLightSource({ type: LightSourceType.Artificial });
            renderWithTheme(<LightSourceRenderer {...defaultProps} encounterLightSource={lightSource} />);
        });

        it('should render Supernatural light source', () => {
            const lightSource = createMockLightSource({ type: LightSourceType.Supernatural });
            renderWithTheme(<LightSourceRenderer {...defaultProps} encounterLightSource={lightSource} />);
        });
    });

    describe('light source on/off state', () => {
        it('should render light source when isOn is true', () => {
            const lightSource = createMockLightSource({ isOn: true });
            renderWithTheme(<LightSourceRenderer {...defaultProps} encounterLightSource={lightSource} />);
        });

        it('should render light source when isOn is false', () => {
            const lightSource = createMockLightSource({ isOn: false });
            renderWithTheme(<LightSourceRenderer {...defaultProps} encounterLightSource={lightSource} />);
        });
    });

    describe('directional light source', () => {
        it('should render directional light with direction and arc', () => {
            const lightSource = createMockLightSource({
                direction: 45,
                arc: 90,
            });
            renderWithTheme(<LightSourceRenderer {...defaultProps} encounterLightSource={lightSource} />);
        });

        it('should render directional light pointing east', () => {
            const lightSource = createMockLightSource({
                direction: 0,
                arc: 60,
            });
            renderWithTheme(<LightSourceRenderer {...defaultProps} encounterLightSource={lightSource} />);
        });

        it('should render directional light pointing south', () => {
            const lightSource = createMockLightSource({
                direction: 90,
                arc: 45,
            });
            renderWithTheme(<LightSourceRenderer {...defaultProps} encounterLightSource={lightSource} />);
        });

        it('should render directional light pointing west', () => {
            const lightSource = createMockLightSource({
                direction: 180,
                arc: 90,
            });
            renderWithTheme(<LightSourceRenderer {...defaultProps} encounterLightSource={lightSource} />);
        });

        it('should render directional light pointing north', () => {
            const lightSource = createMockLightSource({
                direction: 270,
                arc: 45,
            });
            renderWithTheme(<LightSourceRenderer {...defaultProps} encounterLightSource={lightSource} />);
        });

        it('should render wide arc directional light', () => {
            const lightSource = createMockLightSource({
                direction: 0,
                arc: 180,
            });
            renderWithTheme(<LightSourceRenderer {...defaultProps} encounterLightSource={lightSource} />);
        });

        it('should render narrow arc directional light', () => {
            const lightSource = createMockLightSource({
                direction: 0,
                arc: 10,
            });
            renderWithTheme(<LightSourceRenderer {...defaultProps} encounterLightSource={lightSource} />);
        });
    });

    describe('light source colors', () => {
        it('should render light source with custom color', () => {
            const lightSource = createMockLightSource({ color: '#FF0000' });
            renderWithTheme(<LightSourceRenderer {...defaultProps} encounterLightSource={lightSource} />);
        });

        it('should render light source with default color', () => {
            const lightSource = createMockLightSource({ color: undefined });
            renderWithTheme(<LightSourceRenderer {...defaultProps} encounterLightSource={lightSource} />);
        });

        it('should render light source with hex color', () => {
            const lightSource = createMockLightSource({ color: '#00FF00' });
            renderWithTheme(<LightSourceRenderer {...defaultProps} encounterLightSource={lightSource} />);
        });
    });

    describe('range variations', () => {
        it('should render minimum range light source', () => {
            const lightSource = createMockLightSource({ range: 0.5 });
            renderWithTheme(<LightSourceRenderer {...defaultProps} encounterLightSource={lightSource} />);
        });

        it('should render maximum range light source', () => {
            const lightSource = createMockLightSource({ range: 50.0 });
            renderWithTheme(<LightSourceRenderer {...defaultProps} encounterLightSource={lightSource} />);
        });

        it('should render zero range light source', () => {
            const lightSource = createMockLightSource({ range: 0 });
            renderWithTheme(<LightSourceRenderer {...defaultProps} encounterLightSource={lightSource} />);
        });

        it('should render decimal range light source', () => {
            const lightSource = createMockLightSource({ range: 3.5 });
            renderWithTheme(<LightSourceRenderer {...defaultProps} encounterLightSource={lightSource} />);
        });
    });

    describe('position variations', () => {
        it('should render light source at different position', () => {
            const lightSource = createMockLightSource({ position: { x: 250, y: 250 } });
            renderWithTheme(<LightSourceRenderer {...defaultProps} encounterLightSource={lightSource} />);
        });

        it('should render light source at negative position', () => {
            const lightSource = createMockLightSource({ position: { x: -50, y: -50 } });
            renderWithTheme(<LightSourceRenderer {...defaultProps} encounterLightSource={lightSource} />);
        });

        it('should render light source at origin', () => {
            const lightSource = createMockLightSource({ position: { x: 0, y: 0 } });
            renderWithTheme(<LightSourceRenderer {...defaultProps} encounterLightSource={lightSource} />);
        });
    });

    describe('walls handling', () => {
        it('should render with empty walls', () => {
            renderWithTheme(<LightSourceRenderer {...defaultProps} walls={[]} />);
        });

        it('should render with walls for line-of-sight calculation', () => {
            const walls: EncounterWall[] = [
                {
                    index: 0,
                    segments: [
                        {
                            index: 0,
                            startPole: { x: 150, y: 50, h: 10 },
                            endPole: { x: 150, y: 150, h: 10 },
                            type: SegmentType.Wall,
                            isOpaque: true,
                            state: SegmentState.Closed,
                        },
                    ],
                },
            ];
            renderWithTheme(<LightSourceRenderer {...defaultProps} walls={walls} />);
        });

        it('should render with multiple walls', () => {
            const walls: EncounterWall[] = [
                {
                    index: 0,
                    segments: [
                        {
                            index: 0,
                            startPole: { x: 0, y: 0, h: 10 },
                            endPole: { x: 100, y: 0, h: 10 },
                            type: SegmentType.Wall,
                            isOpaque: true,
                            state: SegmentState.Closed,
                        },
                    ],
                },
                {
                    index: 1,
                    segments: [
                        {
                            index: 0,
                            startPole: { x: 0, y: 100, h: 10 },
                            endPole: { x: 100, y: 100, h: 10 },
                            type: SegmentType.Wall,
                            isOpaque: true,
                            state: SegmentState.Closed,
                        },
                    ],
                },
            ];
            renderWithTheme(<LightSourceRenderer {...defaultProps} walls={walls} />);
        });
    });

    describe('grid configuration', () => {
        it('should render with different cell sizes', () => {
            const customGrid: GridConfig = {
                ...mockGridConfig,
                cellSize: { width: 100, height: 100 },
            };
            renderWithTheme(<LightSourceRenderer {...defaultProps} gridConfig={customGrid} />);
        });

        it('should render with grid offset', () => {
            const offsetGrid: GridConfig = {
                ...mockGridConfig,
                offset: { left: 20, top: 20 },
            };
            renderWithTheme(<LightSourceRenderer {...defaultProps} gridConfig={offsetGrid} />);
        });

        it('should render with different grid types', () => {
            const hexGrid: GridConfig = {
                ...mockGridConfig,
                type: GridType.HexV,
            };
            renderWithTheme(<LightSourceRenderer {...defaultProps} gridConfig={hexGrid} />);
        });

        it('should render with scale value', () => {
            const scaledGrid: GridConfig = {
                ...mockGridConfig,
                scale: 2,
            };
            renderWithTheme(<LightSourceRenderer {...defaultProps} gridConfig={scaledGrid} />);
        });
    });

    describe('interaction scope', () => {
        it('should be interactive when scope is lights', () => {
            renderWithTheme(<LightSourceRenderer {...defaultProps} activeScope="lights" />);
        });

        it('should not be interactive when scope is walls', () => {
            renderWithTheme(<LightSourceRenderer {...defaultProps} activeScope="walls" />);
        });

        it('should not be interactive when scope is regions', () => {
            renderWithTheme(<LightSourceRenderer {...defaultProps} activeScope="regions" />);
        });

        it('should not be interactive when scope is null', () => {
            renderWithTheme(<LightSourceRenderer {...defaultProps} activeScope={null} />);
        });
    });

    describe('selection state', () => {
        it('should render unselected state', () => {
            renderWithTheme(<LightSourceRenderer {...defaultProps} isSelected={false} />);
        });

        it('should render selected state', () => {
            renderWithTheme(<LightSourceRenderer {...defaultProps} isSelected={true} />);
        });

        it('should default to unselected', () => {
            renderWithTheme(<LightSourceRenderer {...defaultProps} />);
        });
    });

    describe('callback handlers', () => {
        it('should accept onSelect callback', () => {
            const onSelect = vi.fn();
            renderWithTheme(<LightSourceRenderer {...defaultProps} onSelect={onSelect} />);
        });

        it('should accept onContextMenu callback', () => {
            const onContextMenu = vi.fn();
            renderWithTheme(<LightSourceRenderer {...defaultProps} onContextMenu={onContextMenu} />);
        });

        it('should accept onPositionChange callback', () => {
            const onPositionChange = vi.fn();
            renderWithTheme(<LightSourceRenderer {...defaultProps} onPositionChange={onPositionChange} />);
        });

        it('should accept onDirectionChange callback', () => {
            const onDirectionChange = vi.fn();
            renderWithTheme(<LightSourceRenderer {...defaultProps} onDirectionChange={onDirectionChange} />);
        });
    });

    describe('light source index', () => {
        it('should handle index 0', () => {
            const lightSource = createMockLightSource({ index: 0 });
            renderWithTheme(<LightSourceRenderer {...defaultProps} encounterLightSource={lightSource} />);
        });

        it('should handle positive index', () => {
            const lightSource = createMockLightSource({ index: 5 });
            renderWithTheme(<LightSourceRenderer {...defaultProps} encounterLightSource={lightSource} />);
        });

        it('should handle large index', () => {
            const lightSource = createMockLightSource({ index: 100 });
            renderWithTheme(<LightSourceRenderer {...defaultProps} encounterLightSource={lightSource} />);
        });
    });

    describe('light source with name', () => {
        it('should render light source with name', () => {
            const lightSource = createMockLightSource({ name: 'Torch' });
            renderWithTheme(<LightSourceRenderer {...defaultProps} encounterLightSource={lightSource} />);
        });

        it('should render light source without name', () => {
            const lightSource = createMockLightSource({ name: undefined });
            renderWithTheme(<LightSourceRenderer {...defaultProps} encounterLightSource={lightSource} />);
        });
    });

    describe('re-rendering behavior', () => {
        it('should re-render on position change', () => {
            const { rerender } = renderWithTheme(<LightSourceRenderer {...defaultProps} />);
            const movedSource = createMockLightSource({ position: { x: 200, y: 200 } });
            rerender(
                <ThemeProvider theme={createTheme()}>
                    <LightSourceRenderer {...defaultProps} encounterLightSource={movedSource} />
                </ThemeProvider>,
            );
        });

        it('should re-render on range change', () => {
            const { rerender } = renderWithTheme(<LightSourceRenderer {...defaultProps} />);
            const changedRange = createMockLightSource({ range: 10.0 });
            rerender(
                <ThemeProvider theme={createTheme()}>
                    <LightSourceRenderer {...defaultProps} encounterLightSource={changedRange} />
                </ThemeProvider>,
            );
        });

        it('should re-render on wall change', () => {
            const { rerender } = renderWithTheme(<LightSourceRenderer {...defaultProps} walls={[]} />);
            const walls: EncounterWall[] = [
                {
                    index: 0,
                    segments: [
                        {
                            index: 0,
                            startPole: { x: 0, y: 0, h: 10 },
                            endPole: { x: 100, y: 0, h: 10 },
                            type: SegmentType.Wall,
                            isOpaque: true,
                            state: SegmentState.Closed,
                        },
                    ],
                },
            ];
            rerender(
                <ThemeProvider theme={createTheme()}>
                    <LightSourceRenderer {...defaultProps} walls={walls} />
                </ThemeProvider>,
            );
        });

        it('should re-render on grid scale change', () => {
            const { rerender } = renderWithTheme(<LightSourceRenderer {...defaultProps} />);
            const newGrid: GridConfig = {
                ...mockGridConfig,
                cellSize: { width: 75, height: 75 },
            };
            rerender(
                <ThemeProvider theme={createTheme()}>
                    <LightSourceRenderer {...defaultProps} gridConfig={newGrid} />
                </ThemeProvider>,
            );
        });

        it('should re-render on selection change', () => {
            const { rerender } = renderWithTheme(<LightSourceRenderer {...defaultProps} isSelected={false} />);
            rerender(
                <ThemeProvider theme={createTheme()}>
                    <LightSourceRenderer {...defaultProps} isSelected={true} />
                </ThemeProvider>,
            );
        });
    });
});
