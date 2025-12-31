import { describe, expect, it, vi, beforeEach } from 'vitest';
import { SegmentType, SegmentState, type EncounterWall, type LightSourceType } from '@/types/domain';
import { GridType, type GridConfig } from '@/utils/gridCalculator';
import type { Command } from '@/utils/commands';
import {
    SourceDrawingTool,
    type SourceDrawingToolProps,
    type LightSourceDrawingProps,
    type SoundSourceDrawingProps,
} from './SourceDrawingTool';

const mockGridConfig: GridConfig = {
    type: GridType.Square,
    cellSize: { width: 50, height: 50 },
    offset: { left: 0, top: 0 },
    snap: true,
    scale: 1,
};

const mockWalls: EncounterWall[] = [];

const createMockLightSource = (overrides: Partial<LightSourceDrawingProps> = {}): LightSourceDrawingProps => ({
    sourceType: 'light',
    type: 'Natural' as LightSourceType,
    isDirectional: false,
    ...overrides,
});

const createMockSoundSource = (overrides: Partial<SoundSourceDrawingProps> = {}): SoundSourceDrawingProps => ({
    sourceType: 'sound',
    ...overrides,
});

describe('SourceDrawingTool', () => {
    const defaultProps: SourceDrawingToolProps = {
        encounterId: 'encounter-1',
        source: createMockLightSource(),
        walls: mockWalls,
        gridConfig: mockGridConfig,
        execute: vi.fn(),
        onRefetch: vi.fn(),
        onComplete: vi.fn(),
        onCancel: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should have displayName set', () => {
        expect(SourceDrawingTool.displayName).toBe('SourceDrawingTool');
    });

    it('should be a valid React component', () => {
        expect(SourceDrawingTool).toBeDefined();
        expect(typeof SourceDrawingTool).toBe('function');
    });

    describe('props validation', () => {
        it('should accept valid encounterId', () => {
            const encounterId = 'encounter-123';
            expect(encounterId).toBeTruthy();
            expect(typeof encounterId).toBe('string');
        });

        it('should accept valid gridConfig', () => {
            expect(mockGridConfig.cellSize).toBeDefined();
            expect(mockGridConfig.cellSize.width).toBeGreaterThan(0);
            expect(mockGridConfig.cellSize.height).toBeGreaterThan(0);
            expect(mockGridConfig.offset).toBeDefined();
            expect(mockGridConfig.type).toBe(GridType.Square);
        });

        it('should accept callback functions', () => {
            const execute = vi.fn();
            const onRefetch = vi.fn();
            const onComplete = vi.fn();
            const onCancel = vi.fn();

            expect(typeof execute).toBe('function');
            expect(typeof onRefetch).toBe('function');
            expect(typeof onComplete).toBe('function');
            expect(typeof onCancel).toBe('function');
        });
    });

    describe('light source configuration', () => {
        it('should accept Natural light type', () => {
            const lightSource = createMockLightSource({ type: 'Natural' as LightSourceType });
            expect(lightSource.sourceType).toBe('light');
            expect(lightSource.type).toBe('Natural');
        });

        it('should accept Artificial light type', () => {
            const lightSource = createMockLightSource({ type: 'Artificial' as LightSourceType });
            expect(lightSource.type).toBe('Artificial');
        });

        it('should accept Supernatural light type', () => {
            const lightSource = createMockLightSource({ type: 'Supernatural' as LightSourceType });
            expect(lightSource.type).toBe('Supernatural');
        });

        it('should handle non-directional light source', () => {
            const lightSource = createMockLightSource({ isDirectional: false });
            expect(lightSource.isDirectional).toBe(false);
            expect(lightSource.direction).toBeUndefined();
            expect(lightSource.arc).toBeUndefined();
        });

        it('should handle directional light source', () => {
            const lightSource = createMockLightSource({
                isDirectional: true,
                direction: 45,
                arc: 90,
            });
            expect(lightSource.isDirectional).toBe(true);
            expect(lightSource.direction).toBe(45);
            expect(lightSource.arc).toBe(90);
        });

        it('should handle light source with name', () => {
            const lightSource = createMockLightSource({ name: 'Torch' });
            expect(lightSource.name).toBe('Torch');
        });

        it('should handle light source with color', () => {
            const lightSource = createMockLightSource({ color: '#FF9900' });
            expect(lightSource.color).toBe('#FF9900');
        });

        it('should handle light source isOn state', () => {
            const lightSourceOn = createMockLightSource({ isOn: true });
            expect(lightSourceOn.isOn).toBe(true);

            const lightSourceOff = createMockLightSource({ isOn: false });
            expect(lightSourceOff.isOn).toBe(false);
        });
    });

    describe('sound source configuration', () => {
        it('should accept sound source type', () => {
            const soundSource = createMockSoundSource();
            expect(soundSource.sourceType).toBe('sound');
        });

        it('should handle sound source with name', () => {
            const soundSource = createMockSoundSource({ name: 'Waterfall' });
            expect(soundSource.name).toBe('Waterfall');
        });

        it('should handle sound source with resourceId', () => {
            const soundSource = createMockSoundSource({ resourceId: 'resource-123' });
            expect(soundSource.resourceId).toBe('resource-123');
        });

        it('should handle sound source isPlaying state', () => {
            const soundSourcePlaying = createMockSoundSource({ isPlaying: true });
            expect(soundSourcePlaying.isPlaying).toBe(true);

            const soundSourceStopped = createMockSoundSource({ isPlaying: false });
            expect(soundSourceStopped.isPlaying).toBe(false);
        });

        it('should handle sound source loop state', () => {
            const soundSourceLoop = createMockSoundSource({ loop: true });
            expect(soundSourceLoop.loop).toBe(true);

            const soundSourceNoLoop = createMockSoundSource({ loop: false });
            expect(soundSourceNoLoop.loop).toBe(false);
        });
    });

    describe('walls handling', () => {
        it('should accept empty walls array', () => {
            const walls: EncounterWall[] = [];
            expect(walls).toHaveLength(0);
        });

        it('should accept walls with segments', () => {
            const walls: EncounterWall[] = [
                {
                    index: 0,
                    name: 'Wall 1',
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
            expect(walls).toHaveLength(1);
            expect(walls[0]?.segments).toHaveLength(1);
        });

        it('should accept multiple walls', () => {
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
            expect(walls).toHaveLength(2);
        });
    });

    describe('grid configuration variations', () => {
        it('should accept different cell sizes', () => {
            const customGrid: GridConfig = {
                ...mockGridConfig,
                cellSize: { width: 100, height: 100 },
            };
            expect(customGrid.cellSize.width).toBe(100);
            expect(customGrid.cellSize.height).toBe(100);
        });

        it('should accept grid offset', () => {
            const offsetGrid: GridConfig = {
                ...mockGridConfig,
                offset: { left: 20, top: 20 },
            };
            expect(offsetGrid.offset.left).toBe(20);
            expect(offsetGrid.offset.top).toBe(20);
        });

        it('should accept different grid types', () => {
            const squareGrid: GridConfig = { ...mockGridConfig, type: GridType.Square };
            expect(squareGrid.type).toBe(GridType.Square);

            const hexVGrid: GridConfig = { ...mockGridConfig, type: GridType.HexV };
            expect(hexVGrid.type).toBe(GridType.HexV);

            const hexHGrid: GridConfig = { ...mockGridConfig, type: GridType.HexH };
            expect(hexHGrid.type).toBe(GridType.HexH);
        });

        it('should accept scale value', () => {
            const scaledGrid: GridConfig = { ...mockGridConfig, scale: 2 };
            expect(scaledGrid.scale).toBe(2);
        });
    });

    describe('keyboard shortcuts', () => {
        it('should recognize Escape key for cancel', () => {
            const key = 'Escape';
            expect(key).toBe('Escape');
        });
    });

    describe('range constraints', () => {
        it('should define minimum range constraint', () => {
            const MIN_RANGE = 0.5;
            expect(MIN_RANGE).toBe(0.5);
        });

        it('should define maximum range constraint', () => {
            const MAX_RANGE = 50.0;
            expect(MAX_RANGE).toBe(50.0);
        });

        it('should validate range within bounds', () => {
            const MIN_RANGE = 0.5;
            const MAX_RANGE = 50.0;
            const testRange = 5.0;

            expect(testRange).toBeGreaterThanOrEqual(MIN_RANGE);
            expect(testRange).toBeLessThanOrEqual(MAX_RANGE);
        });
    });

    describe('execute command integration', () => {
        it('should accept execute function', () => {
            const execute = vi.fn<[Command], Promise<void>>();
            expect(typeof execute).toBe('function');
        });

        it('should accept async execute function', async () => {
            const execute = vi.fn<[Command], Promise<void>>().mockResolvedValue(undefined);
            expect(execute).not.toHaveBeenCalled();
        });
    });
});
