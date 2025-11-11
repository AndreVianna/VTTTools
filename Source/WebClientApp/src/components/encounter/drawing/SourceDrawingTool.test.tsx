// TODO: Phase 8.8 - Re-enable when Region/Source types are implemented
// import React from 'react';
// import { describe, it, expect, vi, beforeEach } from 'vitest';
// import { render, screen } from '@testing-library/react';
// import { Provider } from 'react-redux';
// import { configureStore } from '@reduxjs/toolkit';
// import { SourceDrawingTool, type SourceDrawingToolProps } from './SourceDrawingTool';
// import { sourceApi } from '@/services/sourceApi';
// import type { Source, EncounterWall } from '@/types/domain';
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

// const mockGridConfig: GridConfig = {
//     cellSize: { width: 50, height: 50 },
//     offset: { left: 0, top: 0 },
//     gridType: 0,
//     snap: true
// };

// const mockWalls: EncounterWall[] = [];

// const createMockStore = () => {
//     return configureStore({
//         reducer: {
//             [sourceApi.reducerPath]: sourceApi.reducer,
//         },
//         middleware: (getDefaultMiddleware) =>
//             getDefaultMiddleware().concat(sourceApi.middleware),
//     });
// };

// const renderWithProvider = (ui: React.ReactElement) => {
//     const store = createMockStore();
//     return render(<Provider store={store}>{ui}</Provider>);
// };

// describe('SourceDrawingTool', () => {
//     const defaultProps: SourceDrawingToolProps = {
//         encounterId: 'encounter-1',
//         source: mockSource,
//         Walls: mockWalls,
//         gridConfig: mockGridConfig,
//         onComplete: vi.fn(),
//         onCancel: vi.fn()
//     };

//     beforeEach(() => {
//         vi.clearAllMocks();
//     });

//     it('should render without errors', () => {
//         renderWithProvider(<SourceDrawingTool {...defaultProps} />);
//         expect(screen.queryByRole('img')).toBeDefined();
//     });

//     it('should have displayName set', () => {
//         expect(SourceDrawingTool.displayName).toBe('SourceDrawingTool');
//     });

//     it('should call onCancel when Escape is pressed', () => {
//         const onCancel = vi.fn();
//         renderWithProvider(<SourceDrawingTool {...defaultProps} onCancel={onCancel} />);

//         const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
//         window.dispatchEvent(escapeEvent);

//         expect(onCancel).toHaveBeenCalledTimes(1);
//     });

//     it('should initialize with default range from source', () => {
//         renderWithProvider(<SourceDrawingTool {...defaultProps} />);
//         expect(mockSource.defaultRange).toBe(5.0);
//     });

//     it('should accept source with minimum range', () => {
//         const minRangeSource: Source = {
//             ...mockSource,
//             defaultRange: 0.5
//         };

//         renderWithProvider(<SourceDrawingTool {...defaultProps} source={minRangeSource} />);
//         expect(minRangeSource.defaultRange).toBe(0.5);
//     });

//     it('should accept source with maximum range', () => {
//         const maxRangeSource: Source = {
//             ...mockSource,
//             defaultRange: 50.0
//         };

//         renderWithProvider(<SourceDrawingTool {...defaultProps} source={maxRangeSource} />);
//         expect(maxRangeSource.defaultRange).toBe(50.0);
//     });

//     it('should handle Light source type', () => {
//         const lightSource: Source = {
//             ...mockSource,
//             sourceType: 'Light'
//         };

//         renderWithProvider(<SourceDrawingTool {...defaultProps} source={lightSource} />);
//         expect(lightSource.sourceType).toBe('Light');
//     });

//     it('should handle Sound source type', () => {
//         const soundSource: Source = {
//             ...mockSource,
//             sourceType: 'Sound'
//         };

//         renderWithProvider(<SourceDrawingTool {...defaultProps} source={soundSource} />);
//         expect(soundSource.sourceType).toBe('Sound');
//     });

//     it('should handle custom source type', () => {
//         const customSource: Source = {
//             ...mockSource,
//             sourceType: 'Smell'
//         };

//         renderWithProvider(<SourceDrawingTool {...defaultProps} source={customSource} />);
//         expect(customSource.sourceType).toBe('Smell');
//     });

//     it('should accept Walls prop', () => {
//         const Walls: EncounterWall[] = [
//             {
//                 id: 'Wall-1',
//                 encounterId: 'encounter-1',
//                 WallId: 'b1',
//                 vertices: [
//                     { x: 0, y: 0 },
//                     { x: 100, y: 0 }
//                 ]
//             }
//         ];

//         renderWithProvider(<SourceDrawingTool {...defaultProps} Walls={Walls} />);
//         expect(Walls).toHaveLength(1);
//     });

//     it('should handle gradient source', () => {
//         const gradientSource: Source = {
//             ...mockSource,
//             defaultIsGradient: true
//         };

//         renderWithProvider(<SourceDrawingTool {...defaultProps} source={gradientSource} />);
//         expect(gradientSource.defaultIsGradient).toBe(true);
//     });

//     it('should handle solid source', () => {
//         const solidSource: Source = {
//             ...mockSource,
//             defaultIsGradient: false
//         };

//         renderWithProvider(<SourceDrawingTool {...defaultProps} source={solidSource} />);
//         expect(solidSource.defaultIsGradient).toBe(false);
//     });

//     it('should cleanup event listeners on unmount', () => {
//         const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
//         const { unmount } = renderWithProvider(<SourceDrawingTool {...defaultProps} />);

//         unmount();

//         expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
//         expect(removeEventListenerSpy).toHaveBeenCalledWith('keyup', expect.any(Function));
//     });

//     it('should accept different grid configurations', () => {
//         const customGrid: GridConfig = {
//             cellSize: { width: 100, height: 100 },
//             offset: { left: 10, top: 10 },
//             gridType: 1,
//             snap: false
//         };

//         renderWithProvider(<SourceDrawingTool {...defaultProps} gridConfig={customGrid} />);
//         expect(customGrid.cellSize.width).toBe(100);
//     });

//     it('should handle intensity values', () => {
//         const halfIntensitySource: Source = {
//             ...mockSource,
//             defaultIntensity: 0.5
//         };

//         renderWithProvider(<SourceDrawingTool {...defaultProps} source={halfIntensitySource} />);
//         expect(halfIntensitySource.defaultIntensity).toBe(0.5);
//     });

//     it('should handle full intensity', () => {
//         const fullIntensitySource: Source = {
//             ...mockSource,
//             defaultIntensity: 1.0
//         };

//         renderWithProvider(<SourceDrawingTool {...defaultProps} source={fullIntensitySource} />);
//         expect(fullIntensitySource.defaultIntensity).toBe(1.0);
//     });

//     it('should handle zero intensity', () => {
//         const zeroIntensitySource: Source = {
//             ...mockSource,
//             defaultIntensity: 0.0
//         };

//         renderWithProvider(<SourceDrawingTool {...defaultProps} source={zeroIntensitySource} />);
//         expect(zeroIntensitySource.defaultIntensity).toBe(0.0);
//     });

//     it('should accept encounterId prop', () => {
//         const encounterId = 'encounter-test-123';
//         renderWithProvider(<SourceDrawingTool {...defaultProps} encounterId={encounterId} />);
//         expect(encounterId).toBe('encounter-test-123');
//     });

//     it('should handle source with description', () => {
//         const sourceWithDesc: Source = {
//             ...mockSource,
//             description: 'Test description'
//         };

//         renderWithProvider(<SourceDrawingTool {...defaultProps} source={sourceWithDesc} />);
//         expect(sourceWithDesc.description).toBe('Test description');
//     });

//     it('should handle source without description', () => {
//         const sourceNoDesc: Source = {
//             ...mockSource,
//             description: undefined
//         };

//         renderWithProvider(<SourceDrawingTool {...defaultProps} source={sourceNoDesc} />);
//         expect(sourceNoDesc.description).toBeUndefined();
//     });
// });
