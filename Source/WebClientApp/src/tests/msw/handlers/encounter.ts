import { http, HttpResponse } from 'msw';
import type { Encounter, Adventure, EncounterActor } from '@/types/domain';
import { ContentType, AdventureStyle, GridType, Weather } from '@/types/domain';
import type { Stage, StageSettings, StageGrid } from '@/types/stage';
import { AmbientLight } from '@/types/stage';
import { TEST_USER_ID, reindexArray } from '@/tests/utils/mockFactories';

// Type for partial actor data received from API requests
// MSW handlers receive partial data, so we use this to properly type mock operations
type PartialActorData = Partial<EncounterActor> & { index: number };

// Default mock stage settings
const mockStageSettings: StageSettings = {
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
};

const mockStageGrid: StageGrid = {
    type: GridType.Square,
    cellSize: { width: 50, height: 50 },
    offset: { left: 0, top: 0 },
    scale: 1,
};

// Default mock stage for testing
const createMockStage = (id: string): Stage => ({
    id,
    ownerId: TEST_USER_ID,
    name: 'Test Stage',
    description: '',
    isPublished: false,
    isPublic: false,
    settings: mockStageSettings,
    grid: mockStageGrid,
    walls: [],
    regions: [],
    lights: [],
    elements: [],
    sounds: [],
});

// Default mock adventure
const mockAdventure: Adventure = {
    id: 'adventure-1',
    ownerId: TEST_USER_ID,
    type: ContentType.Adventure,
    name: 'Test Adventure',
    description: '',
    isPublished: false,
    style: AdventureStyle.Generic,
    isOneShot: false,
};

// Default mock encounter for testing
export const mockEncounter: Encounter = {
    id: 'encounter-1',
    ownerId: TEST_USER_ID,
    name: 'Test Encounter',
    description: 'A test encounter for unit tests',
    isPublished: false,
    isPublic: false,
    adventure: mockAdventure,
    stage: createMockStage('stage-1'),
    actors: [],
    objects: [],
    effects: [],
};

// In-memory storage for tests
let encounters: Map<string, Encounter> = new Map([['encounter-1', { ...mockEncounter }]]);

export const resetEncounterMocks = () => {
    encounters = new Map([['encounter-1', { ...mockEncounter, stage: createMockStage('stage-1') }]]);
};

export const encounterHandlers = [
    // Get single encounter
    http.get('/api/encounters/:id', ({ params }) => {
        const { id } = params;
        const encounter = encounters.get(id as string);
        if (!encounter) {
            return HttpResponse.json({ error: 'Encounter not found' }, { status: 404 });
        }
        return HttpResponse.json(encounter);
    }),

    // Get encounters list
    http.get('/api/encounters', ({ request }) => {
        const url = new URL(request.url);
        const adventureId = url.searchParams.get('adventureId');
        const list = Array.from(encounters.values());
        const filtered = adventureId
            ? list.filter(e => e.adventure?.id === adventureId)
            : list;
        return HttpResponse.json(filtered);
    }),

    // Create encounter
    http.post('/api/encounters', async ({ request }) => {
        const body = await request.json() as Partial<Encounter>;
        const id = `encounter-${Date.now()}`;
        const newEncounter: Encounter = {
            ...mockEncounter,
            ...body,
            id,
            stage: createMockStage(`stage-${id}`),
        };
        encounters.set(newEncounter.id, newEncounter);
        return HttpResponse.json(newEncounter, { status: 201 });
    }),

    // Update encounter (PUT)
    http.put('/api/encounters/:id', async ({ params, request }) => {
        const { id } = params;
        const encounter = encounters.get(id as string);
        if (!encounter) {
            return HttpResponse.json({ error: 'Encounter not found' }, { status: 404 });
        }
        const body = await request.json() as Partial<Encounter>;
        const updated: Encounter = {
            ...encounter,
            ...body,
        };
        encounters.set(id as string, updated);
        return HttpResponse.json(updated);
    }),

    // Patch encounter
    http.patch('/api/encounters/:id', async ({ params, request }) => {
        const { id } = params;
        const encounter = encounters.get(id as string);
        if (!encounter) {
            return HttpResponse.json({ error: 'Encounter not found' }, { status: 404 });
        }
        const body = await request.json() as Partial<Encounter>;
        const updated: Encounter = {
            ...encounter,
            ...body,
        };
        encounters.set(id as string, updated);
        return HttpResponse.json(updated);
    }),

    // Delete encounter
    http.delete('/api/encounters/:id', ({ params }) => {
        const { id } = params;
        encounters.delete(id as string);
        return new HttpResponse(null, { status: 204 });
    }),

    // Add encounter asset (actor)
    http.post('/api/encounters/:encounterId/assets/:libraryAssetId', async ({ params, request }) => {
        const { encounterId } = params;
        const encounter = encounters.get(encounterId as string);
        if (!encounter) {
            return HttpResponse.json({ error: 'Encounter not found' }, { status: 404 });
        }
        const body = await request.json() as Partial<EncounterActor>;
        // Create mock actor with required index - cast is safe for test mocks
        const newActor: PartialActorData = {
            index: encounter.actors.length,
            ...body,
        };
        encounter.actors.push(newActor as EncounterActor);
        return HttpResponse.json(newActor, { status: 201 });
    }),

    // Update encounter asset
    http.patch('/api/encounters/:encounterId/assets/:assetNumber', async ({ params, request }) => {
        const { encounterId, assetNumber } = params;
        const encounter = encounters.get(encounterId as string);
        if (!encounter) {
            return HttpResponse.json({ error: 'Encounter not found' }, { status: 404 });
        }
        const idx = parseInt(assetNumber as string, 10);
        if (idx < 0 || idx >= encounter.actors.length) {
            return HttpResponse.json({ error: 'Asset not found' }, { status: 404 });
        }
        const body = await request.json() as Partial<EncounterActor>;
        // Merge update into existing actor - cast is safe for test mocks
        encounter.actors[idx] = { ...encounter.actors[idx], ...body } as EncounterActor;
        return new HttpResponse(null, { status: 204 });
    }),

    // Bulk update encounter assets
    http.patch('/api/encounters/:encounterId/assets', async ({ params, request }) => {
        const { encounterId } = params;
        const encounter = encounters.get(encounterId as string);
        if (!encounter) {
            return HttpResponse.json({ error: 'Encounter not found' }, { status: 404 });
        }
        const body = await request.json() as { updates: Array<{ index: number } & Partial<EncounterActor>> };
        for (const update of body.updates) {
            const { index, ...rest } = update;
            if (index >= 0 && index < encounter.actors.length) {
                // Merge update into existing actor - cast is safe for test mocks
                encounter.actors[index] = { ...encounter.actors[index], ...rest } as EncounterActor;
            }
        }
        return new HttpResponse(null, { status: 204 });
    }),

    // Remove encounter asset
    http.delete('/api/encounters/:encounterId/assets/:assetNumber', ({ params }) => {
        const { encounterId, assetNumber } = params;
        const encounter = encounters.get(encounterId as string);
        if (!encounter) {
            return HttpResponse.json({ error: 'Encounter not found' }, { status: 404 });
        }
        const idx = parseInt(assetNumber as string, 10);
        encounter.actors.splice(idx, 1);
        // Re-index remaining actors
        reindexArray(encounter.actors as Array<{ index: number }>);
        return new HttpResponse(null, { status: 204 });
    }),

    // Bulk delete encounter assets
    http.delete('/api/encounters/:encounterId/assets', async ({ params, request }) => {
        const { encounterId } = params;
        const encounter = encounters.get(encounterId as string);
        if (!encounter) {
            return HttpResponse.json({ error: 'Encounter not found' }, { status: 404 });
        }
        const body = await request.json() as { indices: number[] };
        // Delete in reverse order to maintain indices
        const sortedIndices = [...body.indices].sort((a, b) => b - a);
        for (const idx of sortedIndices) {
            encounter.actors.splice(idx, 1);
        }
        // Re-index remaining actors
        reindexArray(encounter.actors as Array<{ index: number }>);
        return new HttpResponse(null, { status: 204 });
    }),

    // Bulk add encounter assets
    http.post('/api/encounters/:encounterId/assets', async ({ params, request }) => {
        const { encounterId } = params;
        const encounter = encounters.get(encounterId as string);
        if (!encounter) {
            return HttpResponse.json({ error: 'Encounter not found' }, { status: 404 });
        }
        const body = await request.json() as { assets: Array<Partial<EncounterActor>> };
        for (const asset of body.assets) {
            // Create mock actor with required index - cast is safe for test mocks
            const newActor: PartialActorData = {
                index: encounter.actors.length,
                ...asset,
            };
            encounter.actors.push(newActor as EncounterActor);
        }
        return new HttpResponse(null, { status: 201 });
    }),
];
