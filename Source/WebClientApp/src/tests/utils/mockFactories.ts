import type {
    Encounter,
    EncounterActor,
    Adventure,
    Asset,
} from '@/types/domain';
import {
    AssetKind,
    FrameShape,
    ContentType,
    AdventureStyle,
    GridType,
    Weather,
    LightSourceType,
    RegionType,
    SegmentType,
    SegmentState,
} from '@/types/domain';
import type {
    Stage,
    StageWall,
    StageRegion,
    StageLight,
    StageSound,
    StageSettings,
    StageGrid,
    ResourceMetadata,
} from '@/types/stage';
import { AmbientLight } from '@/types/stage';

// ============ Test Constants ============

/** Standard test user ID - use this constant instead of hardcoding 'test-user-id' */
export const TEST_USER_ID = 'test-user-id';

/** Standard test user email */
export const TEST_USER_EMAIL = 'test@example.com';

/** Standard test user name */
export const TEST_USER_NAME = 'testuser';

// ============ Array Helpers ============

/** Re-index array items after deletion - type-safe helper for MSW handlers */
export const reindexArray = <T extends { index: number }>(arr: T[]): void => {
    arr.forEach((item, i) => { item.index = i; });
};

// ============ User Factories ============

export const createMockUser = (overrides: Partial<{
    id: string;
    email: string;
    userName: string;
    emailConfirmed: boolean;
    twoFactorEnabled: boolean;
}> = {}) => ({
    id: TEST_USER_ID,
    email: TEST_USER_EMAIL,
    userName: TEST_USER_NAME,
    emailConfirmed: true,
    twoFactorEnabled: false,
    ...overrides,
});

// ============ Stage Settings Factories ============

export const createMockStageSettings = (overrides: Partial<StageSettings> = {}): StageSettings => ({
    mainBackground: null,
    alternateBackground: null,
    zoomLevel: 1,
    panning: { x: 0, y: 0 },
    ambientLight: AmbientLight.Default,
    ambientSound: null,
    ambientSoundVolume: 0.5,
    ambientSoundLoop: false,
    ambientSoundIsPlaying: false,
    weather: Weather.Clear,
    ...overrides,
});

export const createMockStageGrid = (overrides: Partial<StageGrid> = {}): StageGrid => ({
    type: GridType.Square,
    cellSize: { width: 50, height: 50 },
    offset: { left: 0, top: 0 },
    scale: 1,
    ...overrides,
});

// ============ Stage Factories ============

export const createMockStage = (overrides: Partial<Stage> = {}): Stage => ({
    id: `stage-${Date.now()}`,
    ownerId: 'test-user-id',
    name: 'Test Stage',
    description: '',
    isPublished: false,
    isPublic: false,
    settings: createMockStageSettings(),
    grid: createMockStageGrid(),
    walls: [],
    regions: [],
    lights: [],
    sounds: [],
    elements: [],
    ...overrides,
});

export const createMockWall = (index: number, overrides: Partial<StageWall> = {}): StageWall => ({
    index,
    name: `Wall ${index}`,
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
    ...overrides,
});

export const createMockRegion = (index: number, overrides: Partial<StageRegion> = {}): StageRegion => ({
    index,
    name: `Region ${index}`,
    type: RegionType.Terrain,
    vertices: [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 100, y: 100 },
        { x: 0, y: 100 },
    ],
    value: 0,
    ...overrides,
});

export const createMockLight = (index: number, overrides: Partial<StageLight> = {}): StageLight => ({
    index,
    name: `Light ${index}`,
    type: LightSourceType.Natural,
    position: { x: 100, y: 100 },
    range: 200,
    color: '#ffffff',
    isOn: true,
    ...overrides,
});

export const createMockResourceMetadata = (overrides: Partial<ResourceMetadata> = {}): ResourceMetadata => ({
    id: 'media-1',
    contentType: 'audio/mp3',
    path: '/sounds/test.mp3',
    fileName: 'test.mp3',
    fileSize: 1024,
    dimensions: { width: 0, height: 0 },
    duration: '00:00:30',
    ...overrides,
});

export const createMockSound = (index: number, overrides: Partial<StageSound> = {}): StageSound => ({
    index,
    name: `Sound ${index}`,
    media: createMockResourceMetadata(),
    position: { x: 100, y: 100 },
    radius: 150,
    volume: 0.8,
    isPlaying: false,
    loop: true,
    ...overrides,
});

// ============ Adventure Factory ============

export const createMockAdventure = (overrides: Partial<Adventure> = {}): Adventure => ({
    id: `adventure-${Date.now()}`,
    ownerId: 'test-user-id',
    type: ContentType.Adventure,
    name: 'Test Adventure',
    description: '',
    isPublished: false,
    style: AdventureStyle.Generic,
    isOneShot: false,
    ...overrides,
});

// ============ Asset Factory ============

export const createMockAsset = (overrides: Partial<Asset> = {}): Asset => ({
    id: `asset-${Date.now()}`,
    ownerId: 'test-user-id',
    classification: {
        kind: AssetKind.Creature,
        category: 'monster',
        type: 'beast',
        subtype: null,
    },
    name: 'Test Asset',
    description: '',
    thumbnail: null,
    portrait: null,
    size: { width: 50, height: 50 },
    tokens: [],
    statBlocks: {},
    tags: [],
    isPublished: false,
    isPublic: false,
    ...overrides,
});

// ============ Encounter Factories ============

export const createMockEncounter = (overrides: Partial<Encounter> = {}): Encounter => ({
    id: `encounter-${Date.now()}`,
    ownerId: 'test-user-id',
    name: 'Test Encounter',
    description: 'A test encounter',
    isPublished: false,
    isPublic: false,
    adventure: createMockAdventure(),
    stage: createMockStage(),
    actors: [],
    objects: [],
    effects: [],
    ...overrides,
});

export const createMockEncounterActor = (index: number, overrides: Partial<EncounterActor> = {}): EncounterActor => ({
    asset: createMockAsset(),
    index,
    name: `Actor ${index}`,
    position: { x: 100 + index * 50, y: 100 + index * 50 },
    rotation: 0,
    elevation: 0,
    size: { width: 50, height: 50 },
    display: null,
    frame: {
        shape: FrameShape.Circle,
        borderColor: '#0d6efd',
        borderThickness: 1,
        background: '#00000000',
    },
    controlledBy: null,
    isHidden: false,
    isLocked: false,
    ...overrides,
});

// ============ Auth State Factories ============

export const createAuthenticatedState = (user = createMockUser()) => ({
    auth: {
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
    },
});

export const createUnauthenticatedState = () => ({
    auth: {
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
    },
});

// ============ Encounter Editor State Factories ============

export const createEncounterWithActors = (actorCount: number = 3) => {
    const actors = Array.from({ length: actorCount }, (_, i) => createMockEncounterActor(i));
    return createMockEncounter({ actors });
};

export const createEncounterWithWalls = (wallCount: number = 2) => {
    const walls = Array.from({ length: wallCount }, (_, i) => createMockWall(i));
    const stage = createMockStage({ walls });
    return createMockEncounter({ stage });
};

export const createEncounterWithRegions = (regionCount: number = 2) => {
    const regions = Array.from({ length: regionCount }, (_, i) => createMockRegion(i));
    const stage = createMockStage({ regions });
    return createMockEncounter({ stage });
};

export const createFullEncounter = () => {
    const walls = [createMockWall(0), createMockWall(1)];
    const regions = [createMockRegion(0), createMockRegion(1)];
    const lights = [createMockLight(0)];
    const sounds = [createMockSound(0)];
    const stage = createMockStage({ walls, regions, lights, sounds });
    const actors = [createMockEncounterActor(0), createMockEncounterActor(1), createMockEncounterActor(2)];
    return createMockEncounter({ stage, actors });
};
