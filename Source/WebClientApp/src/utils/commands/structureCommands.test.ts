import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import type { EncounterRegion, EncounterLightSource, EncounterWall, Point, Pole } from '@/types/domain';
import type { StageSound, ResourceMetadata } from '@/types/stage';
import { LightSourceType, SegmentType, SegmentState } from '@/types/domain';
import {
    PlaceWallCommand,
    RemoveWallCommand,
    PlaceRegionCommand,
    RemoveRegionCommand,
    PlaceSourceCommand,
    RemoveSourceCommand,
    UpdateWallVerticesCommand,
    type PlaceWallCommandParams,
    type RemoveWallCommandParams,
    type PlaceRegionCommandParams,
    type RemoveRegionCommandParams,
    type PlaceSourceCommandParams,
    type RemoveSourceCommandParams,
    type UpdateWallVerticesCommandParams,
} from './structureCommands';

// Type aliases for mock functions
type PlaceWallFn = (encounterId: string, id: number, vertices: Point[]) => Promise<EncounterWall>;
type RemoveWallFn = (encounterId: string, id: number) => Promise<void>;
type PlaceRegionFn = (encounterId: string, id: number, vertices: Point[], value: number) => Promise<EncounterRegion>;
type PlaceRegionWithOptionalValueFn = (encounterId: string, id: number, vertices: Point[], value: number | undefined) => Promise<EncounterRegion>;
type RemoveRegionFn = (encounterId: string, id: number) => Promise<void>;
type PlaceSourceFn = (encounterId: string, id: number, position: Point, range?: number, intensity?: number, hasGradient?: boolean) => Promise<EncounterLightSource | StageSound>;
type RemoveSourceFn = (encounterId: string, id: number) => Promise<void>;
type UpdateWallFn = (encounterId: string, encounterWallId: string, vertices: Point[]) => Promise<void>;

const createMockPole = (x: number, y: number): Pole => ({
    x,
    y,
    h: 10,
});

const createMockEncounterWall = (overrides: Partial<EncounterWall> = {}): EncounterWall => ({
    index: 1,
    segments: [
        {
            index: 0,
            startPole: createMockPole(0, 0),
            endPole: createMockPole(100, 0),
            type: SegmentType.Wall,
            isOpaque: true,
            state: SegmentState.Closed,
        },
        {
            index: 1,
            startPole: createMockPole(100, 0),
            endPole: createMockPole(100, 100),
            type: SegmentType.Wall,
            isOpaque: true,
            state: SegmentState.Closed,
        },
    ],
    ...overrides,
});

const createMockEncounterRegion = (overrides: Partial<EncounterRegion> = {}): EncounterRegion => ({
    encounterId: 'encounter-1',
    index: 5,
    type: 'FogOfWar',
    name: 'Test Region',
    vertices: [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 100, y: 100 },
    ],
    value: 1,
    ...overrides,
});

const createMockLightSource = (overrides: Partial<EncounterLightSource> = {}): EncounterLightSource => ({
    index: 1,
    type: LightSourceType.Natural,
    position: { x: 100, y: 100 },
    range: 50,
    isOn: true,
    ...overrides,
});

const createMockResourceMetadata = (): ResourceMetadata => ({
    id: 'media-1',
    contentType: 'audio/mp3',
    path: '/sounds/ambient.mp3',
    fileName: 'ambient.mp3',
    fileSize: 1024000,
    dimensions: { width: 0, height: 0 },
    duration: '00:03:30',
});

const createMockSoundSource = (overrides: Partial<StageSound> = {}): StageSound => ({
    index: 1,
    position: { x: 200, y: 200 },
    radius: 100,
    volume: 0.8,
    isPlaying: true,
    media: createMockResourceMetadata(),
    loop: true,
    ...overrides,
});

describe('PlaceWallCommand', () => {
    let mockPlaceWallFn: Mock<PlaceWallFn>;
    let mockRemoveWallFn: Mock<RemoveWallFn>;

    beforeEach(() => {
        mockPlaceWallFn = vi.fn<PlaceWallFn>().mockResolvedValue(createMockEncounterWall({ index: 10 }));
        mockRemoveWallFn = vi.fn<RemoveWallFn>().mockResolvedValue(undefined);
    });

    it('should set description to "Place Wall"', () => {
        const params: PlaceWallCommandParams = {
            encounterId: 'encounter-1',
            id: 1,
            vertices: [{ x: 0, y: 0 }, { x: 100, y: 0 }],
            placeWallFn: mockPlaceWallFn,
            removeWallFn: mockRemoveWallFn,
        };

        const command = new PlaceWallCommand(params);

        expect(command.description).toBe('Place Wall');
    });

    it('should call placeWallFn with correct params on execute', () => {
        const vertices: Point[] = [{ x: 0, y: 0 }, { x: 100, y: 50 }, { x: 200, y: 100 }];
        const params: PlaceWallCommandParams = {
            encounterId: 'encounter-1',
            id: 5,
            vertices,
            placeWallFn: mockPlaceWallFn,
            removeWallFn: mockRemoveWallFn,
        };

        const command = new PlaceWallCommand(params);
        command.execute();

        expect(mockPlaceWallFn).toHaveBeenCalledWith('encounter-1', 5, vertices);
    });

    it('should store created wall index after execute', async () => {
        mockPlaceWallFn.mockResolvedValue(createMockEncounterWall({ index: 42 }));
        const params: PlaceWallCommandParams = {
            encounterId: 'encounter-1',
            id: 1,
            vertices: [{ x: 0, y: 0 }],
            placeWallFn: mockPlaceWallFn,
            removeWallFn: mockRemoveWallFn,
        };

        const command = new PlaceWallCommand(params);
        command.execute();
        await command.undo();

        expect(mockRemoveWallFn).toHaveBeenCalledWith('encounter-1', 42);
    });

    it('should call removeWallFn with stored index on undo', async () => {
        mockPlaceWallFn.mockResolvedValue(createMockEncounterWall({ index: 15 }));
        const params: PlaceWallCommandParams = {
            encounterId: 'encounter-1',
            id: 1,
            vertices: [{ x: 0, y: 0 }],
            placeWallFn: mockPlaceWallFn,
            removeWallFn: mockRemoveWallFn,
        };

        const command = new PlaceWallCommand(params);
        command.execute();
        await command.undo();

        expect(mockRemoveWallFn).toHaveBeenCalledWith('encounter-1', 15);
    });

    it('should not call removeWallFn if id is undefined', async () => {
        mockPlaceWallFn.mockResolvedValue({ index: undefined } as unknown as EncounterWall);
        const params: PlaceWallCommandParams = {
            encounterId: 'encounter-1',
            id: 1,
            vertices: [{ x: 0, y: 0 }],
            placeWallFn: mockPlaceWallFn,
            removeWallFn: mockRemoveWallFn,
        };

        const command = new PlaceWallCommand(params);
        command.execute();
        await command.undo();

        expect(mockRemoveWallFn).not.toHaveBeenCalled();
    });
});

describe('RemoveWallCommand', () => {
    let mockPlaceWallFn: Mock<PlaceWallFn>;
    let mockRemoveWallFn: Mock<RemoveWallFn>;

    beforeEach(() => {
        mockPlaceWallFn = vi.fn<PlaceWallFn>().mockResolvedValue(createMockEncounterWall());
        mockRemoveWallFn = vi.fn<RemoveWallFn>().mockResolvedValue(undefined);
    });

    it('should set description to "Remove Wall"', () => {
        const params: RemoveWallCommandParams = {
            encounterId: 'encounter-1',
            encounterWall: createMockEncounterWall(),
            placeWallFn: mockPlaceWallFn,
            removeWallFn: mockRemoveWallFn,
        };

        const command = new RemoveWallCommand(params);

        expect(command.description).toBe('Remove Wall');
    });

    it('should call removeWallFn with wall index on execute', () => {
        const wall = createMockEncounterWall({ index: 7 });
        const params: RemoveWallCommandParams = {
            encounterId: 'encounter-1',
            encounterWall: wall,
            placeWallFn: mockPlaceWallFn,
            removeWallFn: mockRemoveWallFn,
        };

        const command = new RemoveWallCommand(params);
        command.execute();

        expect(mockRemoveWallFn).toHaveBeenCalledWith('encounter-1', 7);
    });

    it('should restore wall on undo using poles from segments', async () => {
        const wall = createMockEncounterWall({ index: 3 });
        const params: RemoveWallCommandParams = {
            encounterId: 'encounter-1',
            encounterWall: wall,
            placeWallFn: mockPlaceWallFn,
            removeWallFn: mockRemoveWallFn,
        };

        const command = new RemoveWallCommand(params);
        command.execute();
        await command.undo();

        expect(mockPlaceWallFn).toHaveBeenCalledWith(
            'encounter-1',
            3,
            expect.arrayContaining([
                expect.objectContaining({ x: 0, y: 0 }),
                expect.objectContaining({ x: 100, y: 0 }),
                expect.objectContaining({ x: 100, y: 100 }),
            ])
        );
    });

    it('should handle wall with no segments on undo', async () => {
        const wall = createMockEncounterWall({ index: 1, segments: [] });
        const params: RemoveWallCommandParams = {
            encounterId: 'encounter-1',
            encounterWall: wall,
            placeWallFn: mockPlaceWallFn,
            removeWallFn: mockRemoveWallFn,
        };

        const command = new RemoveWallCommand(params);
        command.execute();
        await command.undo();

        expect(mockPlaceWallFn).toHaveBeenCalledWith('encounter-1', 1, []);
    });
});

describe('PlaceRegionCommand', () => {
    let mockPlaceRegionFn: Mock<PlaceRegionFn>;
    let mockRemoveRegionFn: Mock<RemoveRegionFn>;

    beforeEach(() => {
        mockPlaceRegionFn = vi.fn<PlaceRegionFn>().mockResolvedValue(createMockEncounterRegion({ index: 10 }));
        mockRemoveRegionFn = vi.fn<RemoveRegionFn>().mockResolvedValue(undefined);
    });

    it('should set description to "Place Region"', () => {
        const params: PlaceRegionCommandParams = {
            encounterId: 'encounter-1',
            id: 1,
            vertices: [{ x: 0, y: 0 }],
            value: 1,
            placeRegionFn: mockPlaceRegionFn,
            removeRegionFn: mockRemoveRegionFn,
        };

        const command = new PlaceRegionCommand(params);

        expect(command.description).toBe('Place Region');
    });

    it('should call placeRegionFn with correct params on execute', () => {
        const vertices: Point[] = [{ x: 0, y: 0 }, { x: 50, y: 50 }];
        const params: PlaceRegionCommandParams = {
            encounterId: 'encounter-1',
            id: 5,
            vertices,
            value: 2,
            placeRegionFn: mockPlaceRegionFn,
            removeRegionFn: mockRemoveRegionFn,
        };

        const command = new PlaceRegionCommand(params);
        command.execute();

        expect(mockPlaceRegionFn).toHaveBeenCalledWith('encounter-1', 5, vertices, 2);
    });

    it('should store created region index after execute', async () => {
        mockPlaceRegionFn.mockResolvedValue(createMockEncounterRegion({ index: 42 }));
        const params: PlaceRegionCommandParams = {
            encounterId: 'encounter-1',
            id: 1,
            vertices: [{ x: 0, y: 0 }],
            value: 1,
            placeRegionFn: mockPlaceRegionFn,
            removeRegionFn: mockRemoveRegionFn,
        };

        const command = new PlaceRegionCommand(params);
        command.execute();
        await command.undo();

        expect(mockRemoveRegionFn).toHaveBeenCalledWith('encounter-1', 42);
    });

    it('should call removeRegionFn with stored index on undo', async () => {
        mockPlaceRegionFn.mockResolvedValue(createMockEncounterRegion({ index: 15 }));
        const params: PlaceRegionCommandParams = {
            encounterId: 'encounter-1',
            id: 1,
            vertices: [{ x: 0, y: 0 }],
            value: 1,
            placeRegionFn: mockPlaceRegionFn,
            removeRegionFn: mockRemoveRegionFn,
        };

        const command = new PlaceRegionCommand(params);
        command.execute();
        await command.undo();

        expect(mockRemoveRegionFn).toHaveBeenCalledWith('encounter-1', 15);
    });

    it('should not call removeRegionFn if id is falsy', async () => {
        mockPlaceRegionFn.mockResolvedValue({ index: 0 } as unknown as EncounterRegion);
        const params: PlaceRegionCommandParams = {
            encounterId: 'encounter-1',
            id: 1,
            vertices: [{ x: 0, y: 0 }],
            value: 1,
            placeRegionFn: mockPlaceRegionFn,
            removeRegionFn: mockRemoveRegionFn,
        };

        const command = new PlaceRegionCommand(params);
        command.execute();
        await command.undo();

        // index 0 is falsy, so removeRegionFn should not be called
        expect(mockRemoveRegionFn).not.toHaveBeenCalled();
    });
});

describe('RemoveRegionCommand', () => {
    let mockPlaceRegionFn: Mock<PlaceRegionWithOptionalValueFn>;
    let mockRemoveRegionFn: Mock<RemoveRegionFn>;

    beforeEach(() => {
        mockPlaceRegionFn = vi.fn<PlaceRegionWithOptionalValueFn>().mockResolvedValue(createMockEncounterRegion());
        mockRemoveRegionFn = vi.fn<RemoveRegionFn>().mockResolvedValue(undefined);
    });

    it('should set description to "Remove Region"', () => {
        const params: RemoveRegionCommandParams = {
            encounterId: 'encounter-1',
            encounterRegion: createMockEncounterRegion(),
            placeRegionFn: mockPlaceRegionFn,
            removeRegionFn: mockRemoveRegionFn,
        };

        const command = new RemoveRegionCommand(params);

        expect(command.description).toBe('Remove Region');
    });

    it('should call removeRegionFn with region index on execute', () => {
        const region = createMockEncounterRegion({ index: 7 });
        const params: RemoveRegionCommandParams = {
            encounterId: 'encounter-1',
            encounterRegion: region,
            placeRegionFn: mockPlaceRegionFn,
            removeRegionFn: mockRemoveRegionFn,
        };

        const command = new RemoveRegionCommand(params);
        command.execute();

        expect(mockRemoveRegionFn).toHaveBeenCalledWith('encounter-1', 7);
    });

    it('should restore region on undo', async () => {
        const region = createMockEncounterRegion({
            index: 3,
            vertices: [{ x: 10, y: 10 }, { x: 20, y: 20 }],
            value: 5,
        });
        const params: RemoveRegionCommandParams = {
            encounterId: 'encounter-1',
            encounterRegion: region,
            placeRegionFn: mockPlaceRegionFn,
            removeRegionFn: mockRemoveRegionFn,
        };

        const command = new RemoveRegionCommand(params);
        command.execute();
        await command.undo();

        expect(mockPlaceRegionFn).toHaveBeenCalledWith(
            'encounter-1',
            3,
            [{ x: 10, y: 10 }, { x: 20, y: 20 }],
            5
        );
    });

    it('should handle region with undefined value on undo', async () => {
        const region = createMockEncounterRegion({ index: 1, value: undefined });
        const params: RemoveRegionCommandParams = {
            encounterId: 'encounter-1',
            encounterRegion: region,
            placeRegionFn: mockPlaceRegionFn,
            removeRegionFn: mockRemoveRegionFn,
        };

        const command = new RemoveRegionCommand(params);
        command.execute();
        await command.undo();

        expect(mockPlaceRegionFn).toHaveBeenCalledWith(
            'encounter-1',
            1,
            expect.any(Array),
            undefined
        );
    });
});

describe('PlaceSourceCommand', () => {
    let mockPlaceSourceFn: Mock<PlaceSourceFn>;
    let mockRemoveSourceFn: Mock<RemoveSourceFn>;

    beforeEach(() => {
        mockPlaceSourceFn = vi.fn<PlaceSourceFn>().mockResolvedValue(createMockLightSource({ index: 10 }));
        mockRemoveSourceFn = vi.fn<RemoveSourceFn>().mockResolvedValue(undefined);
    });

    it('should set description to "Place Source"', () => {
        const params: PlaceSourceCommandParams = {
            encounterId: 'encounter-1',
            id: 1,
            position: { x: 100, y: 100 },
            placeSourceFn: mockPlaceSourceFn,
            removeSourceFn: mockRemoveSourceFn,
        };

        const command = new PlaceSourceCommand(params);

        expect(command.description).toBe('Place Source');
    });

    it('should call placeSourceFn with correct params on execute', () => {
        const position: Point = { x: 50, y: 75 };
        const params: PlaceSourceCommandParams = {
            encounterId: 'encounter-1',
            id: 5,
            position,
            range: 100,
            intensity: 0.8,
            hasGradient: true,
            placeSourceFn: mockPlaceSourceFn,
            removeSourceFn: mockRemoveSourceFn,
        };

        const command = new PlaceSourceCommand(params);
        command.execute();

        expect(mockPlaceSourceFn).toHaveBeenCalledWith(
            'encounter-1',
            5,
            position,
            100,
            0.8,
            true
        );
    });

    it('should call placeSourceFn with undefined optional params when not provided', () => {
        const position: Point = { x: 50, y: 75 };
        const params: PlaceSourceCommandParams = {
            encounterId: 'encounter-1',
            id: 5,
            position,
            placeSourceFn: mockPlaceSourceFn,
            removeSourceFn: mockRemoveSourceFn,
        };

        const command = new PlaceSourceCommand(params);
        command.execute();

        expect(mockPlaceSourceFn).toHaveBeenCalledWith(
            'encounter-1',
            5,
            position,
            undefined,
            undefined,
            undefined
        );
    });

    it('should store created source index after execute', async () => {
        mockPlaceSourceFn.mockResolvedValue(createMockLightSource({ index: 42 }));
        const params: PlaceSourceCommandParams = {
            encounterId: 'encounter-1',
            id: 1,
            position: { x: 0, y: 0 },
            placeSourceFn: mockPlaceSourceFn,
            removeSourceFn: mockRemoveSourceFn,
        };

        const command = new PlaceSourceCommand(params);
        command.execute();
        await command.undo();

        expect(mockRemoveSourceFn).toHaveBeenCalledWith('encounter-1', 42);
    });

    it('should not call removeSourceFn if id is falsy', async () => {
        mockPlaceSourceFn.mockResolvedValue({ index: 0 } as unknown as EncounterLightSource);
        const params: PlaceSourceCommandParams = {
            encounterId: 'encounter-1',
            id: 1,
            position: { x: 0, y: 0 },
            placeSourceFn: mockPlaceSourceFn,
            removeSourceFn: mockRemoveSourceFn,
        };

        const command = new PlaceSourceCommand(params);
        command.execute();
        await command.undo();

        expect(mockRemoveSourceFn).not.toHaveBeenCalled();
    });
});

describe('RemoveSourceCommand', () => {
    let mockPlaceSourceFn: Mock<PlaceSourceFn>;
    let mockRemoveSourceFn: Mock<RemoveSourceFn>;

    beforeEach(() => {
        mockPlaceSourceFn = vi.fn<PlaceSourceFn>().mockResolvedValue(createMockLightSource());
        mockRemoveSourceFn = vi.fn<RemoveSourceFn>().mockResolvedValue(undefined);
    });

    it('should set description to "Remove Source"', () => {
        const params: RemoveSourceCommandParams = {
            encounterId: 'encounter-1',
            encounterSource: createMockLightSource(),
            placeSourceFn: mockPlaceSourceFn,
            removeSourceFn: mockRemoveSourceFn,
        };

        const command = new RemoveSourceCommand(params);

        expect(command.description).toBe('Remove Source');
    });

    it('should call removeSourceFn with source index on execute', () => {
        const source = createMockLightSource({ index: 7 });
        const params: RemoveSourceCommandParams = {
            encounterId: 'encounter-1',
            encounterSource: source,
            placeSourceFn: mockPlaceSourceFn,
            removeSourceFn: mockRemoveSourceFn,
        };

        const command = new RemoveSourceCommand(params);
        command.execute();

        expect(mockRemoveSourceFn).toHaveBeenCalledWith('encounter-1', 7);
    });

    it('should restore light source on undo using range', async () => {
        const source = createMockLightSource({
            index: 3,
            position: { x: 50, y: 50 },
            range: 75,
        });
        const params: RemoveSourceCommandParams = {
            encounterId: 'encounter-1',
            encounterSource: source,
            placeSourceFn: mockPlaceSourceFn,
            removeSourceFn: mockRemoveSourceFn,
        };

        const command = new RemoveSourceCommand(params);
        command.execute();
        await command.undo();

        expect(mockPlaceSourceFn).toHaveBeenCalledWith(
            'encounter-1',
            3,
            { x: 50, y: 50 },
            75,
            undefined,
            undefined
        );
    });

    it('should restore sound source on undo using radius', async () => {
        const source = createMockSoundSource({
            index: 5,
            position: { x: 100, y: 200 },
            radius: 150,
        });
        const params: RemoveSourceCommandParams = {
            encounterId: 'encounter-1',
            encounterSource: source,
            placeSourceFn: mockPlaceSourceFn,
            removeSourceFn: mockRemoveSourceFn,
        };

        const command = new RemoveSourceCommand(params);
        command.execute();
        await command.undo();

        expect(mockPlaceSourceFn).toHaveBeenCalledWith(
            'encounter-1',
            5,
            { x: 100, y: 200 },
            150,
            undefined,
            undefined
        );
    });
});

describe('UpdateWallVerticesCommand', () => {
    let mockUpdateWallFn: Mock<UpdateWallFn>;

    beforeEach(() => {
        mockUpdateWallFn = vi.fn<UpdateWallFn>().mockResolvedValue(undefined);
    });

    it('should set description to "Update Wall Vertices"', () => {
        const params: UpdateWallVerticesCommandParams = {
            encounterId: 'encounter-1',
            encounterWallId: 'wall-1',
            oldVertices: [{ x: 0, y: 0 }],
            newVertices: [{ x: 100, y: 100 }],
            updateWallFn: mockUpdateWallFn,
        };

        const command = new UpdateWallVerticesCommand(params);

        expect(command.description).toBe('Update Wall Vertices');
    });

    it('should call updateWallFn with new vertices on execute', () => {
        const oldVertices: Point[] = [{ x: 0, y: 0 }, { x: 50, y: 50 }];
        const newVertices: Point[] = [{ x: 10, y: 10 }, { x: 60, y: 60 }];
        const params: UpdateWallVerticesCommandParams = {
            encounterId: 'encounter-1',
            encounterWallId: 'wall-5',
            oldVertices,
            newVertices,
            updateWallFn: mockUpdateWallFn,
        };

        const command = new UpdateWallVerticesCommand(params);
        command.execute();

        expect(mockUpdateWallFn).toHaveBeenCalledWith('encounter-1', 'wall-5', newVertices);
    });

    it('should call updateWallFn with old vertices on undo', async () => {
        const oldVertices: Point[] = [{ x: 0, y: 0 }];
        const newVertices: Point[] = [{ x: 100, y: 100 }];
        const params: UpdateWallVerticesCommandParams = {
            encounterId: 'encounter-1',
            encounterWallId: 'wall-1',
            oldVertices,
            newVertices,
            updateWallFn: mockUpdateWallFn,
        };

        const command = new UpdateWallVerticesCommand(params);
        command.execute();
        await command.undo();

        expect(mockUpdateWallFn).toHaveBeenLastCalledWith('encounter-1', 'wall-1', oldVertices);
    });

    it('should handle empty vertices arrays', () => {
        const params: UpdateWallVerticesCommandParams = {
            encounterId: 'encounter-1',
            encounterWallId: 'wall-1',
            oldVertices: [],
            newVertices: [],
            updateWallFn: mockUpdateWallFn,
        };

        const command = new UpdateWallVerticesCommand(params);
        command.execute();

        expect(mockUpdateWallFn).toHaveBeenCalledWith('encounter-1', 'wall-1', []);
    });

    it('should handle complex vertex arrays', async () => {
        const oldVertices: Point[] = [
            { x: 0, y: 0 },
            { x: 100, y: 0 },
            { x: 100, y: 100 },
            { x: 0, y: 100 },
        ];
        const newVertices: Point[] = [
            { x: 10, y: 10 },
            { x: 90, y: 10 },
            { x: 90, y: 90 },
            { x: 10, y: 90 },
        ];
        const params: UpdateWallVerticesCommandParams = {
            encounterId: 'encounter-1',
            encounterWallId: 'wall-complex',
            oldVertices,
            newVertices,
            updateWallFn: mockUpdateWallFn,
        };

        const command = new UpdateWallVerticesCommand(params);
        command.execute();

        expect(mockUpdateWallFn).toHaveBeenCalledWith('encounter-1', 'wall-complex', newVertices);

        await command.undo();

        expect(mockUpdateWallFn).toHaveBeenLastCalledWith('encounter-1', 'wall-complex', oldVertices);
    });
});
