import { configureStore } from '@reduxjs/toolkit';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { stageApi } from './stageApi';
import type {
    CreateStageRequest,
    UpdateStageRequest,
    CreateWallRequest,
    UpdateWallRequest,
    CreateRegionRequest,
    UpdateRegionRequest,
    CreateLightRequest,
    UpdateLightRequest,
    CreateElementRequest,
    UpdateElementRequest,
    CreateSoundRequest,
    UpdateSoundRequest,
} from '@/types/stage';
import { LightSourceType, RegionType } from '@/types/domain';

// Captured request for URL verification
let capturedRequest: { url: string; method: string | null; body: unknown } | null = null;

vi.mock('./enhancedBaseQuery', () => ({
    createEnhancedBaseQuery: vi.fn(() => async (args: unknown) => {
        // Capture the request for inspection
        if (typeof args === 'string') {
            capturedRequest = { url: args, method: null, body: null };
            // Return array for getStages endpoint (empty string URL)
            if (args === '') {
                return { data: [] };
            }
        } else if (args && typeof args === 'object') {
            const req = args as { url: string; method?: string; body?: unknown };
            capturedRequest = { url: req.url, method: req.method ?? null, body: req.body ?? null };
            // Return array for getStages endpoint (empty string URL)
            if (req.url === '') {
                return { data: [] };
            }
        }
        // Return a mock response
        return { data: {} };
    }),
}));

describe('stageApi', () => {
    let store: ReturnType<typeof configureStore>;

    beforeEach(() => {
        capturedRequest = null;
        store = configureStore({
            reducer: {
                [stageApi.reducerPath]: stageApi.reducer,
            },
            middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(stageApi.middleware),
        });
    });

    describe('API configuration', () => {
        it('should have correct reducerPath', () => {
            expect(stageApi.reducerPath).toBe('stageApi');
        });

        it('should define all Stage CRUD endpoints', () => {
            expect(stageApi.endpoints.getStages).toBeDefined();
            expect(stageApi.endpoints.getStageById).toBeDefined();
            expect(stageApi.endpoints.createStage).toBeDefined();
            expect(stageApi.endpoints.updateStage).toBeDefined();
            expect(stageApi.endpoints.deleteStage).toBeDefined();
            expect(stageApi.endpoints.cloneStage).toBeDefined();
        });

        it('should define all Wall endpoints', () => {
            expect(stageApi.endpoints.addWall).toBeDefined();
            expect(stageApi.endpoints.updateWall).toBeDefined();
            expect(stageApi.endpoints.deleteWall).toBeDefined();
        });

        it('should define all Region endpoints', () => {
            expect(stageApi.endpoints.addRegion).toBeDefined();
            expect(stageApi.endpoints.updateRegion).toBeDefined();
            expect(stageApi.endpoints.deleteRegion).toBeDefined();
        });

        it('should define all Light endpoints', () => {
            expect(stageApi.endpoints.addLight).toBeDefined();
            expect(stageApi.endpoints.updateLight).toBeDefined();
            expect(stageApi.endpoints.deleteLight).toBeDefined();
        });

        it('should define all Element endpoints', () => {
            expect(stageApi.endpoints.addElement).toBeDefined();
            expect(stageApi.endpoints.updateElement).toBeDefined();
            expect(stageApi.endpoints.deleteElement).toBeDefined();
        });

        it('should define all Sound endpoints', () => {
            expect(stageApi.endpoints.addSound).toBeDefined();
            expect(stageApi.endpoints.updateSound).toBeDefined();
            expect(stageApi.endpoints.deleteSound).toBeDefined();
        });
    });

    describe('Stage CRUD endpoints', () => {
        describe('getStages endpoint', () => {
            it('should be defined with correct type', () => {
                expect(stageApi.endpoints.getStages.useQuery).toBeDefined();
            });
        });

        describe('getStageById endpoint', () => {
            it('should be defined with correct type', () => {
                expect(stageApi.endpoints.getStageById.useQuery).toBeDefined();
            });
        });

        describe('createStage endpoint', () => {
            it('should be defined as mutation', () => {
                expect(stageApi.endpoints.createStage.useMutation).toBeDefined();
            });
        });

        describe('updateStage endpoint', () => {
            it('should be defined as mutation', () => {
                expect(stageApi.endpoints.updateStage.useMutation).toBeDefined();
            });
        });

        describe('deleteStage endpoint', () => {
            it('should be defined as mutation', () => {
                expect(stageApi.endpoints.deleteStage.useMutation).toBeDefined();
            });
        });

        describe('cloneStage endpoint', () => {
            it('should be defined as mutation', () => {
                expect(stageApi.endpoints.cloneStage.useMutation).toBeDefined();
            });
        });
    });

    describe('Wall endpoints', () => {
        describe('addWall endpoint', () => {
            it('should be defined as mutation', () => {
                expect(stageApi.endpoints.addWall.useMutation).toBeDefined();
            });
        });

        describe('updateWall endpoint', () => {
            it('should be defined as mutation', () => {
                expect(stageApi.endpoints.updateWall.useMutation).toBeDefined();
            });
        });

        describe('deleteWall endpoint', () => {
            it('should be defined as mutation', () => {
                expect(stageApi.endpoints.deleteWall.useMutation).toBeDefined();
            });
        });
    });

    describe('Region endpoints', () => {
        describe('addRegion endpoint', () => {
            it('should be defined as mutation', () => {
                expect(stageApi.endpoints.addRegion.useMutation).toBeDefined();
            });
        });

        describe('updateRegion endpoint', () => {
            it('should be defined as mutation', () => {
                expect(stageApi.endpoints.updateRegion.useMutation).toBeDefined();
            });
        });

        describe('deleteRegion endpoint', () => {
            it('should be defined as mutation', () => {
                expect(stageApi.endpoints.deleteRegion.useMutation).toBeDefined();
            });
        });
    });

    describe('Light endpoints', () => {
        describe('addLight endpoint', () => {
            it('should be defined as mutation', () => {
                expect(stageApi.endpoints.addLight.useMutation).toBeDefined();
            });
        });

        describe('updateLight endpoint', () => {
            it('should be defined as mutation', () => {
                expect(stageApi.endpoints.updateLight.useMutation).toBeDefined();
            });
        });

        describe('deleteLight endpoint', () => {
            it('should be defined as mutation', () => {
                expect(stageApi.endpoints.deleteLight.useMutation).toBeDefined();
            });
        });
    });

    describe('Element endpoints', () => {
        describe('addElement endpoint', () => {
            it('should be defined as mutation', () => {
                expect(stageApi.endpoints.addElement.useMutation).toBeDefined();
            });
        });

        describe('updateElement endpoint', () => {
            it('should be defined as mutation', () => {
                expect(stageApi.endpoints.updateElement.useMutation).toBeDefined();
            });
        });

        describe('deleteElement endpoint', () => {
            it('should be defined as mutation', () => {
                expect(stageApi.endpoints.deleteElement.useMutation).toBeDefined();
            });
        });
    });

    describe('Sound endpoints', () => {
        describe('addSound endpoint', () => {
            it('should be defined as mutation', () => {
                expect(stageApi.endpoints.addSound.useMutation).toBeDefined();
            });
        });

        describe('updateSound endpoint', () => {
            it('should be defined as mutation', () => {
                expect(stageApi.endpoints.updateSound.useMutation).toBeDefined();
            });
        });

        describe('deleteSound endpoint', () => {
            it('should be defined as mutation', () => {
                expect(stageApi.endpoints.deleteSound.useMutation).toBeDefined();
            });
        });
    });

    describe('hook exports', () => {
        describe('Stage CRUD hooks', () => {
            it('should export useGetStagesQuery hook', async () => {
                const api = await import('./stageApi');
                expect(typeof api.useGetStagesQuery).toBe('function');
            });

            it('should export useGetStageByIdQuery hook', async () => {
                const api = await import('./stageApi');
                expect(typeof api.useGetStageByIdQuery).toBe('function');
            });

            it('should export useCreateStageMutation hook', async () => {
                const api = await import('./stageApi');
                expect(typeof api.useCreateStageMutation).toBe('function');
            });

            it('should export useUpdateStageMutation hook', async () => {
                const api = await import('./stageApi');
                expect(typeof api.useUpdateStageMutation).toBe('function');
            });

            it('should export useDeleteStageMutation hook', async () => {
                const api = await import('./stageApi');
                expect(typeof api.useDeleteStageMutation).toBe('function');
            });

            it('should export useCloneStageMutation hook', async () => {
                const api = await import('./stageApi');
                expect(typeof api.useCloneStageMutation).toBe('function');
            });
        });

        describe('Wall hooks', () => {
            it('should export useAddWallMutation hook', async () => {
                const api = await import('./stageApi');
                expect(typeof api.useAddWallMutation).toBe('function');
            });

            it('should export useUpdateWallMutation hook', async () => {
                const api = await import('./stageApi');
                expect(typeof api.useUpdateWallMutation).toBe('function');
            });

            it('should export useDeleteWallMutation hook', async () => {
                const api = await import('./stageApi');
                expect(typeof api.useDeleteWallMutation).toBe('function');
            });
        });

        describe('Region hooks', () => {
            it('should export useAddRegionMutation hook', async () => {
                const api = await import('./stageApi');
                expect(typeof api.useAddRegionMutation).toBe('function');
            });

            it('should export useUpdateRegionMutation hook', async () => {
                const api = await import('./stageApi');
                expect(typeof api.useUpdateRegionMutation).toBe('function');
            });

            it('should export useDeleteRegionMutation hook', async () => {
                const api = await import('./stageApi');
                expect(typeof api.useDeleteRegionMutation).toBe('function');
            });
        });

        describe('Light hooks', () => {
            it('should export useAddLightMutation hook', async () => {
                const api = await import('./stageApi');
                expect(typeof api.useAddLightMutation).toBe('function');
            });

            it('should export useUpdateLightMutation hook', async () => {
                const api = await import('./stageApi');
                expect(typeof api.useUpdateLightMutation).toBe('function');
            });

            it('should export useDeleteLightMutation hook', async () => {
                const api = await import('./stageApi');
                expect(typeof api.useDeleteLightMutation).toBe('function');
            });
        });

        describe('Element hooks', () => {
            it('should export useAddElementMutation hook', async () => {
                const api = await import('./stageApi');
                expect(typeof api.useAddElementMutation).toBe('function');
            });

            it('should export useUpdateElementMutation hook', async () => {
                const api = await import('./stageApi');
                expect(typeof api.useUpdateElementMutation).toBe('function');
            });

            it('should export useDeleteElementMutation hook', async () => {
                const api = await import('./stageApi');
                expect(typeof api.useDeleteElementMutation).toBe('function');
            });
        });

        describe('Sound hooks', () => {
            it('should export useAddSoundMutation hook', async () => {
                const api = await import('./stageApi');
                expect(typeof api.useAddSoundMutation).toBe('function');
            });

            it('should export useUpdateSoundMutation hook', async () => {
                const api = await import('./stageApi');
                expect(typeof api.useUpdateSoundMutation).toBe('function');
            });

            it('should export useDeleteSoundMutation hook', async () => {
                const api = await import('./stageApi');
                expect(typeof api.useDeleteSoundMutation).toBe('function');
            });
        });
    });

    describe('endpoint URL configurations', () => {
        describe('Stage CRUD URL patterns', () => {
            it('getStages should query empty string (base URL)', async () => {
                await store.dispatch(stageApi.endpoints.getStages.initiate());
                expect(capturedRequest?.url).toBe('');
            });

            it('getStageById should query /{id}', async () => {
                await store.dispatch(stageApi.endpoints.getStageById.initiate('stage-123'));
                expect(capturedRequest?.url).toBe('/stage-123');
            });

            it('createStage should POST to empty string with body', async () => {
                const data: CreateStageRequest = { name: 'Test Stage', description: 'Test Description' };
                await store.dispatch(stageApi.endpoints.createStage.initiate(data));
                expect(capturedRequest?.url).toBe('');
                expect(capturedRequest?.method).toBe('POST');
                expect(capturedRequest?.body).toEqual(data);
            });

            it('updateStage should PATCH to /{id} with body', async () => {
                const data: UpdateStageRequest = { name: 'Updated Stage' };
                await store.dispatch(stageApi.endpoints.updateStage.initiate({ id: 'stage-123', data }));
                expect(capturedRequest?.url).toBe('/stage-123');
                expect(capturedRequest?.method).toBe('PATCH');
                expect(capturedRequest?.body).toEqual(data);
            });

            it('deleteStage should DELETE /{id}', async () => {
                await store.dispatch(stageApi.endpoints.deleteStage.initiate('stage-123'));
                expect(capturedRequest?.url).toBe('/stage-123');
                expect(capturedRequest?.method).toBe('DELETE');
            });

            it('cloneStage should POST to /{id}/clone', async () => {
                await store.dispatch(stageApi.endpoints.cloneStage.initiate('stage-123'));
                expect(capturedRequest?.url).toBe('/stage-123/clone');
                expect(capturedRequest?.method).toBe('POST');
            });
        });

        describe('Wall URL patterns', () => {
            it('addWall should POST to /{stageId}/walls', async () => {
                const data: CreateWallRequest = { name: 'Wall 1' };
                await store.dispatch(stageApi.endpoints.addWall.initiate({ stageId: 'stage-123', data }));
                expect(capturedRequest?.url).toBe('/stage-123/walls');
                expect(capturedRequest?.method).toBe('POST');
                expect(capturedRequest?.body).toEqual(data);
            });

            it('updateWall should PATCH to /{stageId}/walls/{index}', async () => {
                const data: UpdateWallRequest = { name: 'Updated Wall' };
                await store.dispatch(stageApi.endpoints.updateWall.initiate({ stageId: 'stage-123', index: 0, data }));
                expect(capturedRequest?.url).toBe('/stage-123/walls/0');
                expect(capturedRequest?.method).toBe('PATCH');
                expect(capturedRequest?.body).toEqual(data);
            });

            it('deleteWall should DELETE /{stageId}/walls/{index}', async () => {
                await store.dispatch(stageApi.endpoints.deleteWall.initiate({ stageId: 'stage-123', index: 2 }));
                expect(capturedRequest?.url).toBe('/stage-123/walls/2');
                expect(capturedRequest?.method).toBe('DELETE');
            });
        });

        describe('Region URL patterns', () => {
            it('addRegion should POST to /{stageId}/regions', async () => {
                const data: CreateRegionRequest = { name: 'Region 1', type: RegionType.Terrain, vertices: [] };
                await store.dispatch(stageApi.endpoints.addRegion.initiate({ stageId: 'stage-123', data }));
                expect(capturedRequest?.url).toBe('/stage-123/regions');
                expect(capturedRequest?.method).toBe('POST');
                expect(capturedRequest?.body).toEqual(data);
            });

            it('updateRegion should PATCH to /{stageId}/regions/{index}', async () => {
                const data: UpdateRegionRequest = { name: 'Updated Region' };
                await store.dispatch(stageApi.endpoints.updateRegion.initiate({ stageId: 'stage-123', index: 1, data }));
                expect(capturedRequest?.url).toBe('/stage-123/regions/1');
                expect(capturedRequest?.method).toBe('PATCH');
                expect(capturedRequest?.body).toEqual(data);
            });

            it('deleteRegion should DELETE /{stageId}/regions/{index}', async () => {
                await store.dispatch(stageApi.endpoints.deleteRegion.initiate({ stageId: 'stage-123', index: 3 }));
                expect(capturedRequest?.url).toBe('/stage-123/regions/3');
                expect(capturedRequest?.method).toBe('DELETE');
            });
        });

        describe('Light URL patterns', () => {
            it('addLight should POST to /{stageId}/lights', async () => {
                const data: CreateLightRequest = { name: 'Torch', type: LightSourceType.Natural, position: { x: 0, y: 0 }, range: 20 };
                await store.dispatch(stageApi.endpoints.addLight.initiate({ stageId: 'stage-123', data }));
                expect(capturedRequest?.url).toBe('/stage-123/lights');
                expect(capturedRequest?.method).toBe('POST');
                expect(capturedRequest?.body).toEqual(data);
            });

            it('updateLight should PATCH to /{stageId}/lights/{index}', async () => {
                const data: UpdateLightRequest = { isOn: false };
                await store.dispatch(stageApi.endpoints.updateLight.initiate({ stageId: 'stage-123', index: 0, data }));
                expect(capturedRequest?.url).toBe('/stage-123/lights/0');
                expect(capturedRequest?.method).toBe('PATCH');
                expect(capturedRequest?.body).toEqual(data);
            });

            it('deleteLight should DELETE /{stageId}/lights/{index}', async () => {
                await store.dispatch(stageApi.endpoints.deleteLight.initiate({ stageId: 'stage-123', index: 4 }));
                expect(capturedRequest?.url).toBe('/stage-123/lights/4');
                expect(capturedRequest?.method).toBe('DELETE');
            });
        });

        describe('Element URL patterns', () => {
            it('addElement should POST to /{stageId}/elements', async () => {
                const data: CreateElementRequest = { name: 'Tree', displayId: 'display-123' };
                await store.dispatch(stageApi.endpoints.addElement.initiate({ stageId: 'stage-123', data }));
                expect(capturedRequest?.url).toBe('/stage-123/elements');
                expect(capturedRequest?.method).toBe('POST');
                expect(capturedRequest?.body).toEqual(data);
            });

            it('updateElement should PATCH to /{stageId}/elements/{index}', async () => {
                const data: UpdateElementRequest = { rotation: 90 };
                await store.dispatch(stageApi.endpoints.updateElement.initiate({ stageId: 'stage-123', index: 2, data }));
                expect(capturedRequest?.url).toBe('/stage-123/elements/2');
                expect(capturedRequest?.method).toBe('PATCH');
                expect(capturedRequest?.body).toEqual(data);
            });

            it('deleteElement should DELETE /{stageId}/elements/{index}', async () => {
                await store.dispatch(stageApi.endpoints.deleteElement.initiate({ stageId: 'stage-123', index: 5 }));
                expect(capturedRequest?.url).toBe('/stage-123/elements/5');
                expect(capturedRequest?.method).toBe('DELETE');
            });
        });

        describe('Sound URL patterns', () => {
            it('addSound should POST to /{stageId}/sounds', async () => {
                const data: CreateSoundRequest = { name: 'Music', mediaId: 'media-123' };
                await store.dispatch(stageApi.endpoints.addSound.initiate({ stageId: 'stage-123', data }));
                expect(capturedRequest?.url).toBe('/stage-123/sounds');
                expect(capturedRequest?.method).toBe('POST');
                expect(capturedRequest?.body).toEqual(data);
            });

            it('updateSound should PATCH to /{stageId}/sounds/{index}', async () => {
                const data: UpdateSoundRequest = { volume: 0.8 };
                await store.dispatch(stageApi.endpoints.updateSound.initiate({ stageId: 'stage-123', index: 1, data }));
                expect(capturedRequest?.url).toBe('/stage-123/sounds/1');
                expect(capturedRequest?.method).toBe('PATCH');
                expect(capturedRequest?.body).toEqual(data);
            });

            it('deleteSound should DELETE /{stageId}/sounds/{index}', async () => {
                await store.dispatch(stageApi.endpoints.deleteSound.initiate({ stageId: 'stage-123', index: 6 }));
                expect(capturedRequest?.url).toBe('/stage-123/sounds/6');
                expect(capturedRequest?.method).toBe('DELETE');
            });
        });
    });
});
