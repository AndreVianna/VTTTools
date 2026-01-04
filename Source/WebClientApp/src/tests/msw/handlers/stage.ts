import { http, HttpResponse } from 'msw';
import type { Stage, StageSettings, StageGrid, StageListItem, StageWall, StageRegion, StageLight, StageSound } from '@/types/stage';
import { AmbientLight } from '@/types/stage';
import { GridType, Weather } from '@/types/domain';
import { TEST_USER_ID, reindexArray } from '@/tests/utils/mockFactories';

// Types for partial data received from API requests
// MSW handlers receive partial data, so we use these to properly type mock operations
type PartialWallData = Partial<StageWall> & { index: number };
type PartialRegionData = Partial<StageRegion> & { index: number };
type PartialLightData = Partial<StageLight> & { index: number };
type PartialSoundData = Partial<StageSound> & { index: number };

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
export const mockStage: Stage = {
    id: 'stage-1',
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
    sounds: [],
    elements: [],
};

// In-memory storage for tests
let stages: Map<string, Stage> = new Map([['stage-1', { ...mockStage }]]);

export const resetStageMocks = () => {
    stages = new Map([['stage-1', { ...mockStage }]]);
};

export const stageHandlers = [
    // Get stages list
    http.get('/api/stages', () => {
        const list: StageListItem[] = Array.from(stages.values()).map(s => ({
            id: s.id,
            ownerId: s.ownerId,
            name: s.name,
            description: s.description,
            isPublished: s.isPublished,
            isPublic: s.isPublic,
        }));
        return HttpResponse.json(list);
    }),

    // Get single stage
    http.get('/api/stages/:id', ({ params }) => {
        const { id } = params;
        const stage = stages.get(id as string);
        if (!stage) {
            return HttpResponse.json({ error: 'Stage not found' }, { status: 404 });
        }
        return HttpResponse.json(stage);
    }),

    // Create stage
    http.post('/api/stages', async ({ request }) => {
        const body = await request.json() as Partial<Stage>;
        const newStage: Stage = {
            ...mockStage,
            ...body,
            id: `stage-${Date.now()}`,
        };
        stages.set(newStage.id, newStage);
        return HttpResponse.json(newStage, { status: 201 });
    }),

    // Update stage
    http.patch('/api/stages/:id', async ({ params, request }) => {
        const { id } = params;
        const stage = stages.get(id as string);
        if (!stage) {
            return HttpResponse.json({ error: 'Stage not found' }, { status: 404 });
        }
        const body = await request.json() as Partial<Stage>;
        const updated = { ...stage, ...body };
        stages.set(id as string, updated);
        return HttpResponse.json(updated);
    }),

    // Delete stage
    http.delete('/api/stages/:id', ({ params }) => {
        const { id } = params;
        stages.delete(id as string);
        return new HttpResponse(null, { status: 204 });
    }),

    // Clone stage
    http.post('/api/stages/:id/clone', ({ params }) => {
        const { id } = params;
        const stage = stages.get(id as string);
        if (!stage) {
            return HttpResponse.json({ error: 'Stage not found' }, { status: 404 });
        }
        const cloned: Stage = {
            ...stage,
            id: `stage-${Date.now()}`,
            name: `${stage.name} (Copy)`,
        };
        stages.set(cloned.id, cloned);
        return HttpResponse.json(cloned, { status: 201 });
    }),

    // === Walls ===

    http.post('/api/stages/:stageId/walls', async ({ params, request }) => {
        const { stageId } = params;
        const stage = stages.get(stageId as string);
        if (!stage) {
            return HttpResponse.json({ error: 'Stage not found' }, { status: 404 });
        }
        const body = await request.json() as Partial<StageWall>;
        // Create mock wall with required index - cast is safe for test mocks
        const newWall: PartialWallData = {
            index: stage.walls.length,
            ...body,
        };
        stage.walls.push(newWall as StageWall);
        return HttpResponse.json(newWall, { status: 201 });
    }),

    http.patch('/api/stages/:stageId/walls/:index', async ({ params, request }) => {
        const { stageId, index } = params;
        const stage = stages.get(stageId as string);
        if (!stage) {
            return HttpResponse.json({ error: 'Stage not found' }, { status: 404 });
        }
        const idx = parseInt(index as string, 10);
        if (idx < 0 || idx >= stage.walls.length) {
            return HttpResponse.json({ error: 'Wall not found' }, { status: 404 });
        }
        const body = await request.json() as Partial<StageWall>;
        // Merge update into existing wall - cast is safe for test mocks
        stage.walls[idx] = { ...stage.walls[idx], ...body } as StageWall;
        return new HttpResponse(null, { status: 204 });
    }),

    http.delete('/api/stages/:stageId/walls/:index', ({ params }) => {
        const { stageId, index } = params;
        const stage = stages.get(stageId as string);
        if (!stage) {
            return HttpResponse.json({ error: 'Stage not found' }, { status: 404 });
        }
        const idx = parseInt(index as string, 10);
        stage.walls.splice(idx, 1);
        reindexArray(stage.walls as Array<{ index: number }>);
        return new HttpResponse(null, { status: 204 });
    }),

    // === Regions ===

    http.post('/api/stages/:stageId/regions', async ({ params, request }) => {
        const { stageId } = params;
        const stage = stages.get(stageId as string);
        if (!stage) {
            return HttpResponse.json({ error: 'Stage not found' }, { status: 404 });
        }
        const body = await request.json() as Partial<StageRegion>;
        // Create mock region with required index - cast is safe for test mocks
        const newRegion: PartialRegionData = {
            index: stage.regions.length,
            ...body,
        };
        stage.regions.push(newRegion as StageRegion);
        return HttpResponse.json(newRegion, { status: 201 });
    }),

    http.patch('/api/stages/:stageId/regions/:index', async ({ params, request }) => {
        const { stageId, index } = params;
        const stage = stages.get(stageId as string);
        if (!stage) {
            return HttpResponse.json({ error: 'Stage not found' }, { status: 404 });
        }
        const idx = parseInt(index as string, 10);
        if (idx < 0 || idx >= stage.regions.length) {
            return HttpResponse.json({ error: 'Region not found' }, { status: 404 });
        }
        const body = await request.json() as Partial<StageRegion>;
        // Merge update into existing region - cast is safe for test mocks
        stage.regions[idx] = { ...stage.regions[idx], ...body } as StageRegion;
        return new HttpResponse(null, { status: 204 });
    }),

    http.delete('/api/stages/:stageId/regions/:index', ({ params }) => {
        const { stageId, index } = params;
        const stage = stages.get(stageId as string);
        if (!stage) {
            return HttpResponse.json({ error: 'Stage not found' }, { status: 404 });
        }
        const idx = parseInt(index as string, 10);
        stage.regions.splice(idx, 1);
        reindexArray(stage.regions as Array<{ index: number }>);
        return new HttpResponse(null, { status: 204 });
    }),

    // === Lights ===

    http.post('/api/stages/:stageId/lights', async ({ params, request }) => {
        const { stageId } = params;
        const stage = stages.get(stageId as string);
        if (!stage) {
            return HttpResponse.json({ error: 'Stage not found' }, { status: 404 });
        }
        const body = await request.json() as Partial<StageLight>;
        // Create mock light with required index - cast is safe for test mocks
        const newLight: PartialLightData = {
            index: stage.lights.length,
            ...body,
        };
        stage.lights.push(newLight as StageLight);
        return HttpResponse.json(newLight, { status: 201 });
    }),

    http.patch('/api/stages/:stageId/lights/:index', async ({ params, request }) => {
        const { stageId, index } = params;
        const stage = stages.get(stageId as string);
        if (!stage) {
            return HttpResponse.json({ error: 'Stage not found' }, { status: 404 });
        }
        const idx = parseInt(index as string, 10);
        if (idx < 0 || idx >= stage.lights.length) {
            return HttpResponse.json({ error: 'Light not found' }, { status: 404 });
        }
        const body = await request.json() as Partial<StageLight>;
        // Merge update into existing light - cast is safe for test mocks
        stage.lights[idx] = { ...stage.lights[idx], ...body } as StageLight;
        return new HttpResponse(null, { status: 204 });
    }),

    http.delete('/api/stages/:stageId/lights/:index', ({ params }) => {
        const { stageId, index } = params;
        const stage = stages.get(stageId as string);
        if (!stage) {
            return HttpResponse.json({ error: 'Stage not found' }, { status: 404 });
        }
        const idx = parseInt(index as string, 10);
        stage.lights.splice(idx, 1);
        reindexArray(stage.lights as Array<{ index: number }>);
        return new HttpResponse(null, { status: 204 });
    }),

    // === Sounds ===

    http.post('/api/stages/:stageId/sounds', async ({ params, request }) => {
        const { stageId } = params;
        const stage = stages.get(stageId as string);
        if (!stage) {
            return HttpResponse.json({ error: 'Stage not found' }, { status: 404 });
        }
        const body = await request.json() as Partial<StageSound>;
        // Create mock sound with required index - cast is safe for test mocks
        const newSound: PartialSoundData = {
            index: stage.sounds.length,
            ...body,
        };
        stage.sounds.push(newSound as StageSound);
        return HttpResponse.json(newSound, { status: 201 });
    }),

    http.patch('/api/stages/:stageId/sounds/:index', async ({ params, request }) => {
        const { stageId, index } = params;
        const stage = stages.get(stageId as string);
        if (!stage) {
            return HttpResponse.json({ error: 'Stage not found' }, { status: 404 });
        }
        const idx = parseInt(index as string, 10);
        if (idx < 0 || idx >= stage.sounds.length) {
            return HttpResponse.json({ error: 'Sound not found' }, { status: 404 });
        }
        const body = await request.json() as Partial<StageSound>;
        // Merge update into existing sound - cast is safe for test mocks
        stage.sounds[idx] = { ...stage.sounds[idx], ...body } as StageSound;
        return new HttpResponse(null, { status: 204 });
    }),

    http.delete('/api/stages/:stageId/sounds/:index', ({ params }) => {
        const { stageId, index } = params;
        const stage = stages.get(stageId as string);
        if (!stage) {
            return HttpResponse.json({ error: 'Stage not found' }, { status: 404 });
        }
        const idx = parseInt(index as string, 10);
        stage.sounds.splice(idx, 1);
        reindexArray(stage.sounds as Array<{ index: number }>);
        return new HttpResponse(null, { status: 204 });
    }),
];
