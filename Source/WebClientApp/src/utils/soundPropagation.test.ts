import { describe, it, expect } from 'vitest';
import type { EncounterWall, Point } from '@/types/domain';
import { SegmentState, SegmentType } from '@/types/domain';
import type { GridConfig } from '@/utils/gridCalculator';
import { GridType } from '@/utils/gridCalculator';
import {
    calculateSoundDistance,
    calculateVolumeAttenuation,
    calculateEffectiveVolume,
} from './soundPropagation';

// Default grid config for tests
const defaultGridConfig: GridConfig = {
    type: GridType.Square,
    cellSize: { width: 50, height: 50 },
    offset: { left: 0, top: 0 },
    snap: true,
    scale: 1,
};

// Helper to create a wall segment
function createWall(
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    type: SegmentType = SegmentType.Wall,
    isOpaque: boolean = true,
    state: SegmentState = SegmentState.Closed
): EncounterWall {
    return {
        index: 0,
        segments: [
            {
                index: 0,
                startPole: { x: startX, y: startY, h: 10 },
                endPole: { x: endX, y: endY, h: 10 },
                type,
                isOpaque,
                state,
            },
        ],
    };
}

describe('soundPropagation', () => {
    describe('calculateVolumeAttenuation', () => {
        it('should return 1 at distance 0', () => {
            expect(calculateVolumeAttenuation(0, 100)).toBe(1);
        });

        it('should return 0 at max range', () => {
            expect(calculateVolumeAttenuation(100, 100)).toBe(0);
        });

        it('should return 0.5 at half range', () => {
            expect(calculateVolumeAttenuation(50, 100)).toBe(0.5);
        });

        it('should return 0 for negative distance', () => {
            expect(calculateVolumeAttenuation(-10, 100)).toBe(0);
        });

        it('should return 0 for zero max range', () => {
            expect(calculateVolumeAttenuation(50, 0)).toBe(0);
        });

        it('should return 0 beyond max range', () => {
            expect(calculateVolumeAttenuation(150, 100)).toBe(0);
        });

        it('should interpolate linearly', () => {
            expect(calculateVolumeAttenuation(25, 100)).toBe(0.75);
            expect(calculateVolumeAttenuation(75, 100)).toBe(0.25);
        });
    });

    describe('calculateSoundDistance', () => {
        describe('with no walls', () => {
            it('should return straight-line distance when no walls', () => {
                const source: Point = { x: 100, y: 100 };
                const listener: Point = { x: 200, y: 100 };
                const radiusInCells = 5; // 250 pixels

                const result = calculateSoundDistance(source, listener, radiusInCells, {
                    walls: [],
                    gridConfig: defaultGridConfig,
                });

                expect(result.isReachable).toBe(true);
                expect(result.isOutOfRange).toBe(false);
                expect(result.distance).toBe(100);
            });

            it('should return out of range when listener is too far', () => {
                const source: Point = { x: 100, y: 100 };
                const listener: Point = { x: 500, y: 100 };
                const radiusInCells = 2; // 100 pixels

                const result = calculateSoundDistance(source, listener, radiusInCells, {
                    walls: [],
                    gridConfig: defaultGridConfig,
                });

                expect(result.isReachable).toBe(false);
                expect(result.isOutOfRange).toBe(true);
                expect(result.distance).toBe(-1);
            });
        });

        describe('with walls', () => {
            it('should return straight-line distance when path is not blocked', () => {
                const source: Point = { x: 100, y: 100 };
                const listener: Point = { x: 200, y: 100 };
                const radiusInCells = 5;

                // Wall is not between source and listener
                const walls: EncounterWall[] = [
                    createWall(100, 200, 200, 200), // Below the path
                ];

                const result = calculateSoundDistance(source, listener, radiusInCells, {
                    walls,
                    gridConfig: defaultGridConfig,
                });

                expect(result.isReachable).toBe(true);
                expect(result.distance).toBe(100);
            });

            it('should find path around a wall', () => {
                const source: Point = { x: 100, y: 100 };
                const listener: Point = { x: 300, y: 100 };
                const radiusInCells = 10; // 500 pixels

                // Short wall between source and listener
                const walls: EncounterWall[] = [
                    createWall(200, 50, 200, 150), // Vertical wall
                ];

                const result = calculateSoundDistance(source, listener, radiusInCells, {
                    walls,
                    gridConfig: defaultGridConfig,
                });

                // Should find a path around the wall
                expect(result.isReachable).toBe(true);
                // Path distance should be greater than straight line (200)
                expect(result.distance).toBeGreaterThan(200);
            });

            it('should block sound when wall completely blocks', () => {
                const source: Point = { x: 100, y: 100 };
                const listener: Point = { x: 300, y: 100 };
                const radiusInCells = 4; // 200 pixels - not enough to go around

                // Long wall between source and listener
                const walls: EncounterWall[] = [
                    createWall(200, 0, 200, 500), // Long vertical wall
                ];

                const result = calculateSoundDistance(source, listener, radiusInCells, {
                    walls,
                    gridConfig: defaultGridConfig,
                });

                // Should not be able to reach the listener
                expect(result.isReachable).toBe(false);
                expect(result.isOutOfRange).toBe(false); // Blocked, not out of range
                expect(result.distance).toBe(-1);
            });

            it('should allow sound through open doors', () => {
                const source: Point = { x: 100, y: 100 };
                const listener: Point = { x: 300, y: 100 };
                const radiusInCells = 5;

                // Door that is open
                const walls: EncounterWall[] = [
                    createWall(200, 0, 200, 500, SegmentType.Door, true, SegmentState.Open),
                ];

                const result = calculateSoundDistance(source, listener, radiusInCells, {
                    walls,
                    gridConfig: defaultGridConfig,
                });

                expect(result.isReachable).toBe(true);
                expect(result.distance).toBe(200);
            });

            it('should block sound through closed doors', () => {
                const source: Point = { x: 100, y: 100 };
                const listener: Point = { x: 300, y: 100 };
                const radiusInCells = 4;

                // Door that is closed
                const walls: EncounterWall[] = [
                    createWall(200, 0, 200, 500, SegmentType.Door, true, SegmentState.Closed),
                ];

                const result = calculateSoundDistance(source, listener, radiusInCells, {
                    walls,
                    gridConfig: defaultGridConfig,
                });

                expect(result.isReachable).toBe(false);
                expect(result.distance).toBe(-1);
            });

            it('should allow sound through non-opaque windows', () => {
                const source: Point = { x: 100, y: 100 };
                const listener: Point = { x: 300, y: 100 };
                const radiusInCells = 5;

                // Window that is not opaque (glass)
                const walls: EncounterWall[] = [
                    createWall(200, 0, 200, 500, SegmentType.Window, false, SegmentState.Closed),
                ];

                const result = calculateSoundDistance(source, listener, radiusInCells, {
                    walls,
                    gridConfig: defaultGridConfig,
                });

                expect(result.isReachable).toBe(true);
                expect(result.distance).toBe(200);
            });
        });
    });

    describe('calculateEffectiveVolume', () => {
        it('should return 0 when listener is out of range', () => {
            const source: Point = { x: 100, y: 100 };
            const listener: Point = { x: 500, y: 100 };
            const baseVolume = 0.8;
            const radiusInCells = 2; // 100 pixels

            const volume = calculateEffectiveVolume(source, listener, baseVolume, radiusInCells, {
                walls: [],
                gridConfig: defaultGridConfig,
            });

            expect(volume).toBe(0);
        });

        it('should return 0 when blocked by wall', () => {
            const source: Point = { x: 100, y: 100 };
            const listener: Point = { x: 300, y: 100 };
            const baseVolume = 0.8;
            const radiusInCells = 4;

            const walls: EncounterWall[] = [
                createWall(200, 0, 200, 500),
            ];

            const volume = calculateEffectiveVolume(source, listener, baseVolume, radiusInCells, {
                walls,
                gridConfig: defaultGridConfig,
            });

            expect(volume).toBe(0);
        });

        it('should return full base volume at source position', () => {
            const source: Point = { x: 100, y: 100 };
            const listener: Point = { x: 100, y: 100 }; // Same position
            const baseVolume = 0.8;
            const radiusInCells = 5;

            const volume = calculateEffectiveVolume(source, listener, baseVolume, radiusInCells, {
                walls: [],
                gridConfig: defaultGridConfig,
            });

            expect(volume).toBe(0.8);
        });

        it('should attenuate volume based on distance', () => {
            const source: Point = { x: 100, y: 100 };
            const listener: Point = { x: 225, y: 100 }; // 125 pixels = half of 250 (5 cells)
            const baseVolume = 1.0;
            const radiusInCells = 5; // 250 pixels

            const volume = calculateEffectiveVolume(source, listener, baseVolume, radiusInCells, {
                walls: [],
                gridConfig: defaultGridConfig,
            });

            // At half distance, volume should be 0.5
            expect(volume).toBe(0.5);
        });

        it('should scale with base volume', () => {
            const source: Point = { x: 100, y: 100 };
            const listener: Point = { x: 100, y: 100 };
            const baseVolume = 0.5;
            const radiusInCells = 5;

            const volume = calculateEffectiveVolume(source, listener, baseVolume, radiusInCells, {
                walls: [],
                gridConfig: defaultGridConfig,
            });

            expect(volume).toBe(0.5);
        });
    });
});
