/**
 * useGridConfigSync Hook Tests
 * Tests grid configuration synchronization from encounter data
 */

import { renderHook, act } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useGridConfigSync } from './useGridConfigSync';
import { GridType, getDefaultGrid } from '@/utils/gridCalculator';
import type { Encounter } from '@/types/domain';

const createMockEncounter = (gridOverrides?: Partial<Encounter['stage']['grid']>): Encounter => ({
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
        encounterId: 'test-encounter-id',
        settings: null,
        grid: {
            type: 'Square',
            cellSize: 50,
            offset: { x: 0, y: 0 },
            scale: 1,
            ...gridOverrides,
        },
        walls: [],
        regions: [],
        lights: [],
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
            const encounter = createMockEncounter({ type: 'Square' });

            // Act
            const { result } = renderHook(() =>
                useGridConfigSync({ encounter })
            );

            // Assert
            expect(result.current.gridConfig.type).toBe(GridType.Square);
        });

        it('should handle HexV grid type', () => {
            // Arrange
            const encounter = createMockEncounter({ type: 'HexV' });

            // Act
            const { result } = renderHook(() =>
                useGridConfigSync({ encounter })
            );

            // Assert
            expect(result.current.gridConfig.type).toBe(GridType.HexV);
        });

        it('should handle HexH grid type', () => {
            // Arrange
            const encounter = createMockEncounter({ type: 'HexH' });

            // Act
            const { result } = renderHook(() =>
                useGridConfigSync({ encounter })
            );

            // Assert
            expect(result.current.gridConfig.type).toBe(GridType.HexH);
        });

        it('should handle NoGrid type', () => {
            // Arrange
            const encounter = createMockEncounter({ type: 'NoGrid' });

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
            const encounter = createMockEncounter({ cellSize: 75 });

            // Act
            const { result } = renderHook(() =>
                useGridConfigSync({ encounter })
            );

            // Assert
            expect(result.current.gridConfig.cellSize).toBe(75);
        });

        it('should sync offset from encounter', () => {
            // Arrange
            const encounter = createMockEncounter({
                offset: { x: 10, y: 20 },
            });

            // Act
            const { result } = renderHook(() =>
                useGridConfigSync({ encounter })
            );

            // Assert
            expect(result.current.gridConfig.offset).toEqual({ x: 10, y: 20 });
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
            // Arrange
            const encounter = createMockEncounter({ scale: undefined });

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
            const encounter = createMockEncounter({ type: 'Square' });

            // Act
            const { result } = renderHook(() =>
                useGridConfigSync({ encounter })
            );

            // Assert
            expect(result.current.gridConfig.snap).toBe(true);
        });

        it('should set snap to false for NoGrid', () => {
            // Arrange
            const encounter = createMockEncounter({ type: 'NoGrid' });

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
            const encounter = createMockEncounter({ type: 'Square' });
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
            const initialEncounter = createMockEncounter({ type: 'Square', cellSize: 50 });
            const { result, rerender } = renderHook(
                ({ encounter }) => useGridConfigSync({ encounter }),
                { initialProps: { encounter: initialEncounter } }
            );

            // Act
            const updatedEncounter = createMockEncounter({ type: 'HexH', cellSize: 100 });
            rerender({ encounter: updatedEncounter });

            // Assert
            expect(result.current.gridConfig.type).toBe(GridType.HexH);
            expect(result.current.gridConfig.cellSize).toBe(100);
        });
    });
});
