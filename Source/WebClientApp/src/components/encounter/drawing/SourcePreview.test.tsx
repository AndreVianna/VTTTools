import { createTheme, ThemeProvider } from '@mui/material';
import { render } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { LightSourceType, SegmentType, SegmentState, type EncounterLightSource, type EncounterWall, type Point } from '@/types/domain';
import { GridType, type GridConfig } from '@/utils/gridCalculator';
import {
    LightSourcePreview,
    SoundSourcePreview,
    SOUND_PREVIEW_COLOR,
    type LightSourcePreviewProps,
    type SoundSourcePreviewProps,
} from './SourcePreview';

const mockGridConfig: GridConfig = {
    type: GridType.Square,
    cellSize: { width: 50, height: 50 },
    offset: { left: 0, top: 0 },
    snap: true,
    scale: 1,
};

const mockCenterPos: Point = { x: 100, y: 100 };

const createMockLightSource = (overrides: Partial<EncounterLightSource> = {}): EncounterLightSource => ({
    index: 0,
    type: LightSourceType.Natural,
    position: mockCenterPos,
    range: 5.0,
    isOn: true,
    ...overrides,
});

const renderWithTheme = (ui: React.ReactElement, mode: 'light' | 'dark' = 'light') => {
    const theme = createTheme({ palette: { mode } });
    return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
};

describe('LightSourcePreview', () => {
    const defaultProps: LightSourcePreviewProps = {
        centerPos: mockCenterPos,
        range: 5.0,
        lightSource: createMockLightSource(),
        walls: [],
        gridConfig: mockGridConfig,
    };

    it('should render without errors', () => {
        renderWithTheme(<LightSourcePreview {...defaultProps} />);
    });

    it('should have displayName set', () => {
        expect(LightSourcePreview.displayName).toBe('LightSourcePreview');
    });

    it('should render in light mode', () => {
        renderWithTheme(<LightSourcePreview {...defaultProps} />, 'light');
    });

    it('should render in dark mode', () => {
        renderWithTheme(<LightSourcePreview {...defaultProps} />, 'dark');
    });

    describe('light source types', () => {
        it('should handle Natural light type', () => {
            const lightSource = createMockLightSource({ type: LightSourceType.Natural });
            renderWithTheme(<LightSourcePreview {...defaultProps} lightSource={lightSource} />);
        });

        it('should handle Artificial light type', () => {
            const lightSource = createMockLightSource({ type: LightSourceType.Artificial });
            renderWithTheme(<LightSourcePreview {...defaultProps} lightSource={lightSource} />);
        });

        it('should handle Supernatural light type', () => {
            const lightSource = createMockLightSource({ type: LightSourceType.Supernatural });
            renderWithTheme(<LightSourcePreview {...defaultProps} lightSource={lightSource} />);
        });
    });

    describe('directional light source', () => {
        it('should handle directional light with direction and arc', () => {
            const lightSource = createMockLightSource({
                direction: 45,
                arc: 90,
            });
            renderWithTheme(<LightSourcePreview {...defaultProps} lightSource={lightSource} />);
        });

        it('should handle directional light pointing east', () => {
            const lightSource = createMockLightSource({
                direction: 0,
                arc: 60,
            });
            renderWithTheme(<LightSourcePreview {...defaultProps} lightSource={lightSource} />);
        });

        it('should handle directional light pointing south', () => {
            const lightSource = createMockLightSource({
                direction: 90,
                arc: 45,
            });
            renderWithTheme(<LightSourcePreview {...defaultProps} lightSource={lightSource} />);
        });

        it('should handle wide arc directional light', () => {
            const lightSource = createMockLightSource({
                direction: 180,
                arc: 180,
            });
            renderWithTheme(<LightSourcePreview {...defaultProps} lightSource={lightSource} />);
        });

        it('should handle narrow arc directional light', () => {
            const lightSource = createMockLightSource({
                direction: 270,
                arc: 10,
            });
            renderWithTheme(<LightSourcePreview {...defaultProps} lightSource={lightSource} />);
        });
    });

    describe('light source colors', () => {
        it('should handle light source with custom color', () => {
            const lightSource = createMockLightSource({ color: '#FF0000' });
            renderWithTheme(<LightSourcePreview {...defaultProps} lightSource={lightSource} />);
        });

        it('should handle light source without color (use default)', () => {
            const lightSource = createMockLightSource({ color: undefined });
            renderWithTheme(<LightSourcePreview {...defaultProps} lightSource={lightSource} />);
        });
    });

    describe('range variations', () => {
        it('should handle minimum range', () => {
            renderWithTheme(<LightSourcePreview {...defaultProps} range={0.5} />);
        });

        it('should handle maximum range', () => {
            renderWithTheme(<LightSourcePreview {...defaultProps} range={50.0} />);
        });

        it('should handle zero range', () => {
            renderWithTheme(<LightSourcePreview {...defaultProps} range={0} />);
        });

        it('should handle decimal range', () => {
            renderWithTheme(<LightSourcePreview {...defaultProps} range={3.5} />);
        });
    });

    describe('walls handling', () => {
        it('should handle empty walls', () => {
            renderWithTheme(<LightSourcePreview {...defaultProps} walls={[]} />);
        });

        it('should handle walls for line-of-sight calculation', () => {
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
            renderWithTheme(<LightSourcePreview {...defaultProps} walls={walls} />);
        });

        it('should handle multiple walls', () => {
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
            renderWithTheme(<LightSourcePreview {...defaultProps} walls={walls} />);
        });
    });

    describe('grid configuration', () => {
        it('should handle different grid cell sizes', () => {
            const customGrid: GridConfig = {
                ...mockGridConfig,
                cellSize: { width: 100, height: 100 },
            };
            renderWithTheme(<LightSourcePreview {...defaultProps} gridConfig={customGrid} />);
        });

        it('should handle grid offset', () => {
            const offsetGrid: GridConfig = {
                ...mockGridConfig,
                offset: { left: 20, top: 20 },
            };
            renderWithTheme(<LightSourcePreview {...defaultProps} gridConfig={offsetGrid} />);
        });
    });

    describe('center position variations', () => {
        it('should handle different center positions', () => {
            const centerPos: Point = { x: 250, y: 250 };
            renderWithTheme(<LightSourcePreview {...defaultProps} centerPos={centerPos} />);
        });

        it('should handle negative center position', () => {
            const centerPos: Point = { x: -50, y: -50 };
            renderWithTheme(<LightSourcePreview {...defaultProps} centerPos={centerPos} />);
        });

        it('should handle origin position', () => {
            const centerPos: Point = { x: 0, y: 0 };
            renderWithTheme(<LightSourcePreview {...defaultProps} centerPos={centerPos} />);
        });
    });

    describe('light source with name', () => {
        it('should handle light source with name', () => {
            const lightSource = createMockLightSource({ name: 'Torch' });
            renderWithTheme(<LightSourcePreview {...defaultProps} lightSource={lightSource} />);
        });

        it('should handle light source without name', () => {
            const lightSource = createMockLightSource({ name: undefined });
            renderWithTheme(<LightSourcePreview {...defaultProps} lightSource={lightSource} />);
        });
    });
});

describe('SoundSourcePreview', () => {
    const defaultProps: SoundSourcePreviewProps = {
        centerPos: mockCenterPos,
        range: 5.0,
        gridConfig: mockGridConfig,
    };

    it('should render without errors', () => {
        renderWithTheme(<SoundSourcePreview {...defaultProps} />);
    });

    it('should have displayName set', () => {
        expect(SoundSourcePreview.displayName).toBe('SoundSourcePreview');
    });

    it('should render in light mode', () => {
        renderWithTheme(<SoundSourcePreview {...defaultProps} />, 'light');
    });

    it('should render in dark mode', () => {
        renderWithTheme(<SoundSourcePreview {...defaultProps} />, 'dark');
    });

    it('should export SOUND_PREVIEW_COLOR constant', () => {
        expect(SOUND_PREVIEW_COLOR).toBeDefined();
        expect(typeof SOUND_PREVIEW_COLOR).toBe('string');
        expect(SOUND_PREVIEW_COLOR).toBe('#4169E1');
    });

    describe('range variations', () => {
        it('should handle minimum range', () => {
            renderWithTheme(<SoundSourcePreview {...defaultProps} range={0.5} />);
        });

        it('should handle maximum range', () => {
            renderWithTheme(<SoundSourcePreview {...defaultProps} range={50.0} />);
        });

        it('should handle zero range', () => {
            renderWithTheme(<SoundSourcePreview {...defaultProps} range={0} />);
        });

        it('should handle decimal range', () => {
            renderWithTheme(<SoundSourcePreview {...defaultProps} range={3.5} />);
        });

        it('should handle integer range', () => {
            renderWithTheme(<SoundSourcePreview {...defaultProps} range={5} />);
        });
    });

    describe('center position variations', () => {
        it('should handle different center positions', () => {
            const centerPos: Point = { x: 250, y: 250 };
            renderWithTheme(<SoundSourcePreview {...defaultProps} centerPos={centerPos} />);
        });

        it('should handle negative center position', () => {
            const centerPos: Point = { x: -50, y: -50 };
            renderWithTheme(<SoundSourcePreview {...defaultProps} centerPos={centerPos} />);
        });

        it('should handle origin position', () => {
            const centerPos: Point = { x: 0, y: 0 };
            renderWithTheme(<SoundSourcePreview {...defaultProps} centerPos={centerPos} />);
        });

        it('should handle large position values', () => {
            const centerPos: Point = { x: 1000, y: 1000 };
            renderWithTheme(<SoundSourcePreview {...defaultProps} centerPos={centerPos} />);
        });
    });

    describe('grid configuration', () => {
        it('should handle different grid cell sizes', () => {
            const customGrid: GridConfig = {
                ...mockGridConfig,
                cellSize: { width: 100, height: 100 },
            };
            renderWithTheme(<SoundSourcePreview {...defaultProps} gridConfig={customGrid} />);
        });

        it('should handle grid offset', () => {
            const offsetGrid: GridConfig = {
                ...mockGridConfig,
                offset: { left: 20, top: 20 },
            };
            renderWithTheme(<SoundSourcePreview {...defaultProps} gridConfig={offsetGrid} />);
        });

        it('should handle different grid types', () => {
            const hexGrid: GridConfig = {
                ...mockGridConfig,
                type: GridType.HexV,
            };
            renderWithTheme(<SoundSourcePreview {...defaultProps} gridConfig={hexGrid} />);
        });

        it('should handle scale value', () => {
            const scaledGrid: GridConfig = {
                ...mockGridConfig,
                scale: 2,
            };
            renderWithTheme(<SoundSourcePreview {...defaultProps} gridConfig={scaledGrid} />);
        });
    });
});
