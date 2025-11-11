// TODO: Phase 8.8 - Re-enable when Region/Source types are implemented
// import React from 'react';
// import { describe, it, expect } from 'vitest';
// import { render } from '@testing-library/react';
// import { ThemeProvider, createTheme } from '@mui/material';
// import { SourceRenderer, type SourceRendererProps } from './SourceRenderer';
// import type { Source, EncounterSource, EncounterWall } from '@/types/domain';
// import type { GridConfig } from '@/utils/gridCalculator';

// const mockSource: Source = {
//     id: 'source-1',
//     ownerId: 'user-1',
//     name: 'Light Source',
//     description: 'A bright light',
//     sourceType: 'Light',
//     defaultRange: 5.0,
//     defaultIntensity: 0.8,
//     defaultIsGradient: true,
//     createdAt: '2024-01-01T00:00:00Z'
// };

// const mockEncounterSource: EncounterSource = {
//     id: 'encounter-source-1',
//     encounterId: 'encounter-1',
//     sourceId: 'source-1',
//     position: { x: 100, y: 100 },
//     range: 5.0,
//     intensity: 0.8,
//     isGradient: true
// };

// const mockGridConfig: GridConfig = {
//     cellSize: { width: 50, height: 50 },
//     offset: { left: 0, top: 0 },
//     gridType: 0,
//     snap: true
// };

// const renderWithTheme = (ui: React.ReactElement, mode: 'light' | 'dark' = 'light') => {
//     const theme = createTheme({ palette: { mode } });
//     return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
// };

// describe('SourceRenderer', () => {
//     const defaultProps: SourceRendererProps = {
//         encounterSource: mockEncounterSource,
//         source: mockSource,
//         Walls: [],
//         gridConfig: mockGridConfig
//     };

//     it('should render without errors', () => {
//         renderWithTheme(<SourceRenderer {...defaultProps} />);
//     });

//     it('should have displayName set', () => {
//         expect(SourceRenderer.displayName).toBe('SourceRenderer');
//     });

//     it('should render in light mode', () => {
//         renderWithTheme(<SourceRenderer {...defaultProps} />, 'light');
//     });

//     it('should render in dark mode', () => {
//         renderWithTheme(<SourceRenderer {...defaultProps} />, 'dark');
//     });

//     it('should render Light source with warning color', () => {
//         const lightSource: Source = { ...mockSource, sourceType: 'Light' };
//         renderWithTheme(<SourceRenderer {...defaultProps} source={lightSource} />);
//     });

//     it('should render Sound source with info color', () => {
//         const soundSource: Source = { ...mockSource, sourceType: 'Sound' };
//         renderWithTheme(<SourceRenderer {...defaultProps} source={soundSource} />);
//     });

//     it('should render unknown source type with grey color', () => {
//         const unknownSource: Source = { ...mockSource, sourceType: 'Magic' };
//         renderWithTheme(<SourceRenderer {...defaultProps} source={unknownSource} />);
//     });

//     it('should handle gradient rendering', () => {
//         const gradientEncounterSource: EncounterSource = { ...mockEncounterSource, isGradient: true };
//         renderWithTheme(<SourceRenderer {...defaultProps} encounterSource={gradientEncounterSource} />);
//     });

//     it('should handle solid fill rendering', () => {
//         const solidEncounterSource: EncounterSource = { ...mockEncounterSource, isGradient: false };
//         renderWithTheme(<SourceRenderer {...defaultProps} encounterSource={solidEncounterSource} />);
//     });

//     it('should filter opaque Walls', () => {
//         const Walls: EncounterWall[] = [
//             {
//                 id: 'Wall-1',
//                 encounterId: 'encounter-1',
//                 WallId: 'b1',
//                 vertices: [{ x: 0, y: 0 }, { x: 100, y: 0 }]
//             }
//         ];
//         renderWithTheme(<SourceRenderer {...defaultProps} Walls={Walls} />);
//     });

//     it('should exclude open Walls from LOS calculation', () => {
//         const Walls: EncounterWall[] = [
//             {
//                 id: 'Wall-1',
//                 encounterId: 'encounter-1',
//                 WallId: 'b1',
//                 vertices: [{ x: 0, y: 0 }, { x: 100, y: 0 }],
//                 isOpen: true
//             }
//         ];
//         renderWithTheme(<SourceRenderer {...defaultProps} Walls={Walls} />);
//     });

//     it('should handle multiple Walls', () => {
//         const Walls: EncounterWall[] = [
//             {
//                 id: 'b1',
//                 encounterId: 'encounter-1',
//                 WallId: 'Wall-1',
//                 vertices: [{ x: 0, y: 0 }, { x: 100, y: 0 }]
//             },
//             {
//                 id: 'b2',
//                 encounterId: 'encounter-1',
//                 WallId: 'Wall-2',
//                 vertices: [{ x: 0, y: 100 }, { x: 100, y: 100 }]
//             }
//         ];
//         renderWithTheme(<SourceRenderer {...defaultProps} Walls={Walls} />);
//     });

//     it('should handle minimum range', () => {
//         const minRangeSource: EncounterSource = { ...mockEncounterSource, range: 0.5 };
//         renderWithTheme(<SourceRenderer {...defaultProps} encounterSource={minRangeSource} />);
//     });

//     it('should handle maximum range', () => {
//         const maxRangeSource: EncounterSource = { ...mockEncounterSource, range: 50.0 };
//         renderWithTheme(<SourceRenderer {...defaultProps} encounterSource={maxRangeSource} />);
//     });

//     it('should handle zero intensity', () => {
//         const zeroIntensity: EncounterSource = { ...mockEncounterSource, intensity: 0.0 };
//         renderWithTheme(<SourceRenderer {...defaultProps} encounterSource={zeroIntensity} />);
//     });

//     it('should handle full intensity', () => {
//         const fullIntensity: EncounterSource = { ...mockEncounterSource, intensity: 1.0 };
//         renderWithTheme(<SourceRenderer {...defaultProps} encounterSource={fullIntensity} />);
//     });

//     it('should handle half intensity', () => {
//         const halfIntensity: EncounterSource = { ...mockEncounterSource, intensity: 0.5 };
//         renderWithTheme(<SourceRenderer {...defaultProps} encounterSource={halfIntensity} />);
//     });

//     it('should handle different grid cell sizes', () => {
//         const largeGrid: GridConfig = {
//             ...mockGridConfig,
//             cellSize: { width: 100, height: 100 }
//         };
//         renderWithTheme(<SourceRenderer {...defaultProps} gridConfig={largeGrid} />);
//     });

//     it('should handle grid offset', () => {
//         const offsetGrid: GridConfig = {
//             ...mockGridConfig,
//             offset: { left: 20, top: 20 }
//         };
//         renderWithTheme(<SourceRenderer {...defaultProps} gridConfig={offsetGrid} />);
//     });

//     it('should handle different source positions', () => {
//         const movedSource: EncounterSource = {
//             ...mockEncounterSource,
//             position: { x: 250, y: 250 }
//         };
//         renderWithTheme(<SourceRenderer {...defaultProps} encounterSource={movedSource} />);
//     });

//     it('should handle negative source position', () => {
//         const negativePos: EncounterSource = {
//             ...mockEncounterSource,
//             position: { x: -50, y: -50 }
//         };
//         renderWithTheme(<SourceRenderer {...defaultProps} encounterSource={negativePos} />);
//     });

//     it('should handle decimal range values', () => {
//         const decimalRange: EncounterSource = { ...mockEncounterSource, range: 3.5 };
//         renderWithTheme(<SourceRenderer {...defaultProps} encounterSource={decimalRange} />);
//     });

//     it('should memoize LOS polygon calculation', () => {
//         const { rerender } = renderWithTheme(<SourceRenderer {...defaultProps} />);

//         rerender(
//             <ThemeProvider theme={createTheme()}>
//                 <SourceRenderer {...defaultProps} />
//             </ThemeProvider>
//         );
//     });

//     it('should invalidate LOS cache on position change', () => {
//         const { rerender } = renderWithTheme(<SourceRenderer {...defaultProps} />);

//         const movedSource: EncounterSource = {
//             ...mockEncounterSource,
//             position: { x: 200, y: 200 }
//         };

//         rerender(
//             <ThemeProvider theme={createTheme()}>
//                 <SourceRenderer {...defaultProps} encounterSource={movedSource} />
//             </ThemeProvider>
//         );
//     });

//     it('should invalidate LOS cache on range change', () => {
//         const { rerender } = renderWithTheme(<SourceRenderer {...defaultProps} />);

//         const changedRange: EncounterSource = { ...mockEncounterSource, range: 10.0 };

//         rerender(
//             <ThemeProvider theme={createTheme()}>
//                 <SourceRenderer {...defaultProps} encounterSource={changedRange} />
//             </ThemeProvider>
//         );
//     });

//     it('should invalidate LOS cache on Wall change', () => {
//         const { rerender } = renderWithTheme(<SourceRenderer {...defaultProps} Walls={[]} />);

//         const Walls: EncounterWall[] = [
//             {
//                 id: 'Wall-1',
//                 encounterId: 'encounter-1',
//                 WallId: 'b1',
//                 vertices: [{ x: 0, y: 0 }, { x: 100, y: 0 }]
//             }
//         ];

//         rerender(
//             <ThemeProvider theme={createTheme()}>
//                 <SourceRenderer {...defaultProps} Walls={Walls} />
//             </ThemeProvider>
//         );
//     });

//     it('should invalidate LOS cache on grid scale change', () => {
//         const { rerender } = renderWithTheme(<SourceRenderer {...defaultProps} />);

//         const newGrid: GridConfig = {
//             ...mockGridConfig,
//             cellSize: { width: 75, height: 75 }
//         };

//         rerender(
//             <ThemeProvider theme={createTheme()}>
//                 <SourceRenderer {...defaultProps} gridConfig={newGrid} />
//             </ThemeProvider>
//         );
//     });
// });
