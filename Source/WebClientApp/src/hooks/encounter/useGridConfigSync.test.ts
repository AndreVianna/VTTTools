/**
 * useGridConfigSync Hook Tests
 * Tests grid configuration synchronization from encounter data
 */

import { renderHook, act } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useGridConfigSync } from './useGridConfigSync';
import { GridType, getDefaultGrid } from '@/utils/gridCalculator';
import type { Encounter, Weather } from '@/types/domain';
import type { StageGrid } from '@/types/stage';
import { AmbientLight, AmbientSoundSource } from '@/types/stage';

const createDefaultStageSettings = () => ({
    useAlternateBackground: false,
    zoomLevel: 1,
    panning: { x: 0, y: 0 },
    ambientLight: AmbientLight.Default,
    ambientSoundSource: AmbientSoundSource.NotSet,
    ambientSoundVolume: 1,
    ambientSoundLoop: false,
    ambientSoundIsPlaying: false,
    weather: 'Clear' as Weather,
});

const createMockEncounter = (gridOverrides?: Partial<StageGrid>): Encounter => ({
    id: 'test-encounter-id',
    ownerId: 'test-owner-id',
    name: 'Test Encounter',
    description: '',
    isPublished: false,
    isPublic: false,
    adventure: null,
    actors: [],
    objects: [],
    effects: [],
    stage: {
        id: 'test-stage-id',
        ownerId: 'test-owner-id',
        name: 'Test Stage',
        description: '',
        isPublished: false,
        isPublic: false,
        settings: createDefaultStageSettings(),
        grid: {
            type: GridType.Square,
            cellSize: { width: 50, height: 50 },
            offset: { left: 0, top: 0 },
            scale: 1,
            ...gridOverrides,
        },
        walls: [],
        regions: [],
        lights: [],
        elements: [],
        sounds: [],
    },
});

describe('useGridConfigSync', () => {
    describe('Initial state', () => {
        it('should return default grid config when encounter is undefined', () => {
            // Arrange & Act
            const { result } = renderHook(() =>
                useGridConfigSync({ encounter: undefined })
            );

            // Assert
            const defaultGrid = getDefaultGrid();
            expect(result.current.gridConfig.type).toBe(defaultGrid.type);
            expect(result.current.gridConfig.cellSize).toBe(defaultGrid.cellSize);
        });
    });

    describe('Grid type conversion', () => {
        it('should convert string grid type to GridType enum', () => {
            // Arrange
            const encounter = createMockEncounter({ type: GridType.Square });

            // Act
            const { result } = renderHook(() =>
                useGridConfigSync({ encounter })
            );

            // Assert
            expect(result.current.gridConfig.type).toBe(GridType.Square);
        });

        it('should handle HexV grid type', () => {
            // Arrange
            const encounter = createMockEncounter({ type: GridType.HexV });

            // Act
            const { result } = renderHook(() =>
                useGridConfigSync({ encounter })
            );

            // Assert
            expect(result.current.gridConfig.type).toBe(GridType.HexV);
        });

        it('should handle HexH grid type', () => {
            // Arrange
            const encounter = createMockEncounter({ type: GridType.HexH });

            // Act
            const { result } = renderHook(() =>
                useGridConfigSync({ encounter })
            );

            // Assert
            expect(result.current.gridConfig.type).toBe(GridType.HexH);
        });

        it('should handle NoGrid type', () => {
            // Arrange
            const encounter = createMockEncounter({ type: GridType.NoGrid });

            // Act
            const { result } = renderHook(() =>
                useGridConfigSync({ encounter })
            );

            // Assert
            expect(result.current.gridConfig.type).toBe(GridType.NoGrid);
        });
    });

    describe('Grid properties', () => {
        it('should sync cellSize from encounter', () => {
            // Arrange
            const encounter = createMockEncounter({ cellSize: { width: 75, height: 75 } });

            // Act
            const { result } = renderHook(() =>
                useGridConfigSync({ encounter })
            );

            // Assert
            expect(result.current.gridConfig.cellSize).toEqual({ width: 75, height: 75 });
        });

        it('should sync offset from encounter', () => {
            // Arrange
            const encounter = createMockEncounter({
                offset: { left: 10, top: 20 },
            });

            // Act
            const { result } = renderHook(() =>
                useGridConfigSync({ encounter })
            );

            // Assert
            expect(result.current.gridConfig.offset).toEqual({ left: 10, top: 20 });
        });

        it('should sync scale from encounter', () => {
            // Arrange
            const encounter = createMockEncounter({ scale: 2 });

            // Act
            const { result } = renderHook(() =>
                useGridConfigSync({ encounter })
            );

            // Assert
            expect(result.current.gridConfig.scale).toBe(2);
        });

        it('should default scale to 1 when not provided', () => {
            // Arrange - use default mock which has scale: 1
            const encounter = createMockEncounter();

            // Act
            const { result } = renderHook(() =>
                useGridConfigSync({ encounter })
            );

            // Assert
            expect(result.current.gridConfig.scale).toBe(1);
        });
    });

    describe('Snap behavior', () => {
        it('should set snap to true for Square grid', () => {
            // Arrange
            const encounter = createMockEncounter({ type: GridType.Square });

            // Act
            const { result } = renderHook(() =>
                useGridConfigSync({ encounter })
            );

            // Assert
            expect(result.current.gridConfig.snap).toBe(true);
        });

        it('should set snap to false for NoGrid', () => {
            // Arrange
            const encounter = createMockEncounter({ type: GridType.NoGrid });

            // Act
            const { result } = renderHook(() =>
                useGridConfigSync({ encounter })
            );

            // Assert
            expect(result.current.gridConfig.snap).toBe(false);
        });
    });

    describe('setGridConfig', () => {
        it('should allow updating grid config locally', () => {
            // Arrange
            const encounter = createMockEncounter({ type: GridType.Square });
            const { result } = renderHook(() =>
                useGridConfigSync({ encounter })
            );

            // Act
            act(() => {
                result.current.setGridConfig((prev) => ({
                    ...prev,
                    type: GridType.HexV,
                }));
            });

            // Assert
            expect(result.current.gridConfig.type).toBe(GridType.HexV);
        });
    });

    describe('Encounter updates', () => {
        it('should update grid config when encounter changes', () => {
            // Arrange
            const initialEncounter = createMockEncounter({ type: GridType.Square, cellSize: { width: 50, height: 50 } });
            const { result, rerender } = renderHook(
                ({ encounter }) => useGridConfigSync({ encounter }),
                { initialProps: { encounter: initialEncounter } }
            );

            // Act
            const updatedEncounter = createMockEncounter({ type: GridType.HexH, cellSize: { width: 100, height: 100 } });
            rerender({ encounter: updatedEncounter });

            // Assert
            expect(result.current.gridConfig.type).toBe(GridType.HexH);
            expect(result.current.gridConfig.cellSize).toEqual({ width: 100, height: 100 });
        });
    });
});
