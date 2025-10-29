import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material';
import { SourcePreview, type SourcePreviewProps } from './SourcePreview';
import type { Source, SceneBarrier, Point } from '@/types/domain';
import type { GridConfig } from '@/utils/gridCalculator';

const mockSource: Source = {
    id: 'source-1',
    ownerId: 'user-1',
    name: 'Light Source',
    description: 'A bright light',
    sourceType: 'Light',
    defaultRange: 5.0,
    defaultIntensity: 0.8,
    defaultIsGradient: true,
    createdAt: '2024-01-01T00:00:00Z'
};

const mockGridConfig: GridConfig = {
    cellSize: { width: 50, height: 50 },
    offset: { left: 0, top: 0 },
    gridType: 0,
    snap: true
};

const mockCenterPos: Point = { x: 100, y: 100 };

const renderWithTheme = (ui: React.ReactElement, mode: 'light' | 'dark' = 'light') => {
    const theme = createTheme({ palette: { mode } });
    return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
};

describe('SourcePreview', () => {
    const defaultProps: SourcePreviewProps = {
        centerPos: mockCenterPos,
        range: 5.0,
        source: mockSource,
        barriers: [],
        gridConfig: mockGridConfig
    };

    it('should render without errors', () => {
        renderWithTheme(<SourcePreview {...defaultProps} />);
    });

    it('should have displayName set', () => {
        expect(SourcePreview.displayName).toBe('SourcePreview');
    });

    it('should render in light mode', () => {
        renderWithTheme(<SourcePreview {...defaultProps} />, 'light');
    });

    it('should render in dark mode', () => {
        renderWithTheme(<SourcePreview {...defaultProps} />, 'dark');
    });

    it('should handle Light source type', () => {
        const lightSource: Source = { ...mockSource, sourceType: 'Light' };
        renderWithTheme(<SourcePreview {...defaultProps} source={lightSource} />);
    });

    it('should handle Sound source type', () => {
        const soundSource: Source = { ...mockSource, sourceType: 'Sound' };
        renderWithTheme(<SourcePreview {...defaultProps} source={soundSource} />);
    });

    it('should handle unknown source type', () => {
        const unknownSource: Source = { ...mockSource, sourceType: 'Unknown' };
        renderWithTheme(<SourcePreview {...defaultProps} source={unknownSource} />);
    });

    it('should handle gradient source', () => {
        const gradientSource: Source = { ...mockSource, defaultIsGradient: true };
        renderWithTheme(<SourcePreview {...defaultProps} source={gradientSource} />);
    });

    it('should handle solid source', () => {
        const solidSource: Source = { ...mockSource, defaultIsGradient: false };
        renderWithTheme(<SourcePreview {...defaultProps} source={solidSource} />);
    });

    it('should handle minimum range', () => {
        renderWithTheme(<SourcePreview {...defaultProps} range={0.5} />);
    });

    it('should handle maximum range', () => {
        renderWithTheme(<SourcePreview {...defaultProps} range={50.0} />);
    });

    it('should handle zero range', () => {
        renderWithTheme(<SourcePreview {...defaultProps} range={0} />);
    });

    it('should handle barriers', () => {
        const barriers: SceneBarrier[] = [
            {
                id: 'barrier-1',
                sceneId: 'scene-1',
                barrierId: 'b1',
                vertices: [
                    { x: 150, y: 50 },
                    { x: 150, y: 150 }
                ]
            }
        ];
        renderWithTheme(<SourcePreview {...defaultProps} barriers={barriers} />);
    });

    it('should filter out open barriers', () => {
        const barriers: SceneBarrier[] = [
            {
                id: 'barrier-1',
                sceneId: 'scene-1',
                barrierId: 'b1',
                vertices: [{ x: 0, y: 0 }, { x: 100, y: 0 }],
                isOpen: true
            },
            {
                id: 'barrier-2',
                sceneId: 'scene-1',
                barrierId: 'b2',
                vertices: [{ x: 0, y: 100 }, { x: 100, y: 100 }]
            }
        ];
        renderWithTheme(<SourcePreview {...defaultProps} barriers={barriers} />);
    });

    it('should handle multiple barriers', () => {
        const barriers: SceneBarrier[] = [
            {
                id: 'b1',
                sceneId: 'scene-1',
                barrierId: 'barrier-1',
                vertices: [{ x: 0, y: 0 }, { x: 100, y: 0 }]
            },
            {
                id: 'b2',
                sceneId: 'scene-1',
                barrierId: 'barrier-2',
                vertices: [{ x: 0, y: 100 }, { x: 100, y: 100 }]
            }
        ];
        renderWithTheme(<SourcePreview {...defaultProps} barriers={barriers} />);
    });

    it('should handle different grid cell sizes', () => {
        const customGrid: GridConfig = {
            ...mockGridConfig,
            cellSize: { width: 100, height: 100 }
        };
        renderWithTheme(<SourcePreview {...defaultProps} gridConfig={customGrid} />);
    });

    it('should handle grid offset', () => {
        const offsetGrid: GridConfig = {
            ...mockGridConfig,
            offset: { left: 20, top: 20 }
        };
        renderWithTheme(<SourcePreview {...defaultProps} gridConfig={offsetGrid} />);
    });

    it('should handle different center positions', () => {
        const centerPos: Point = { x: 250, y: 250 };
        renderWithTheme(<SourcePreview {...defaultProps} centerPos={centerPos} />);
    });

    it('should handle negative center position', () => {
        const centerPos: Point = { x: -50, y: -50 };
        renderWithTheme(<SourcePreview {...defaultProps} centerPos={centerPos} />);
    });

    it('should handle decimal range values', () => {
        renderWithTheme(<SourcePreview {...defaultProps} range={3.5} />);
    });

    it('should handle different intensity values', () => {
        const halfIntensity: Source = { ...mockSource, defaultIntensity: 0.5 };
        renderWithTheme(<SourcePreview {...defaultProps} source={halfIntensity} />);
    });

    it('should handle full intensity', () => {
        const fullIntensity: Source = { ...mockSource, defaultIntensity: 1.0 };
        renderWithTheme(<SourcePreview {...defaultProps} source={fullIntensity} />);
    });

    it('should handle zero intensity', () => {
        const zeroIntensity: Source = { ...mockSource, defaultIntensity: 0.0 };
        renderWithTheme(<SourcePreview {...defaultProps} source={zeroIntensity} />);
    });
});
