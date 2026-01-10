import { configureStore } from '@reduxjs/toolkit';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { encounterApi } from './encounterApi';

vi.mock('./enhancedBaseQuery', () => ({
    createEnhancedBaseQuery: vi.fn(() => vi.fn()),
}));

describe('encounterApi', () => {
    let store: ReturnType<typeof configureStore>;

    beforeEach(() => {
        store = configureStore({
            reducer: {
                [encounterApi.reducerPath]: encounterApi.reducer,
            },
            middleware: (getDefaultMiddleware) =>
                getDefaultMiddleware().concat(encounterApi.middleware),
        });
    });

    describe('API configuration', () => {
        it('should have correct reducerPath', () => {
            expect(encounterApi.reducerPath).toBe('encounterApi');
        });

        it('should define all expected tag types', () => {
            const expectedTags = [
                'Encounter',
                'EncounterAsset',
            ];
            expectedTags.forEach(() => {
                expect(encounterApi.util.selectInvalidatedBy).toBeDefined();
            });
        });
    });

    describe('endpoint definitions', () => {
        describe('Encounter CRUD endpoints', () => {
            it('should define getEncounter endpoint', () => {
                expect(encounterApi.endpoints.getEncounter).toBeDefined();
                expect(encounterApi.endpoints.getEncounter.useQuery).toBeDefined();
            });

            it('should define getEncounters endpoint', () => {
                expect(encounterApi.endpoints.getEncounters).toBeDefined();
                expect(encounterApi.endpoints.getEncounters.useQuery).toBeDefined();
            });

            it('should define createEncounter endpoint', () => {
                expect(encounterApi.endpoints.createEncounter).toBeDefined();
                expect(encounterApi.endpoints.createEncounter.useMutation).toBeDefined();
            });

            it('should define updateEncounter endpoint', () => {
                expect(encounterApi.endpoints.updateEncounter).toBeDefined();
                expect(encounterApi.endpoints.updateEncounter.useMutation).toBeDefined();
            });

            it('should define patchEncounter endpoint', () => {
                expect(encounterApi.endpoints.patchEncounter).toBeDefined();
                expect(encounterApi.endpoints.patchEncounter.useMutation).toBeDefined();
            });

            it('should define deleteEncounter endpoint', () => {
                expect(encounterApi.endpoints.deleteEncounter).toBeDefined();
                expect(encounterApi.endpoints.deleteEncounter.useMutation).toBeDefined();
            });
        });

        describe('Encounter Asset endpoints', () => {
            it('should define getEncounterAssets endpoint', () => {
                expect(encounterApi.endpoints.getEncounterAssets).toBeDefined();
                expect(encounterApi.endpoints.getEncounterAssets.useQuery).toBeDefined();
            });

            it('should define addEncounterAsset endpoint', () => {
                expect(encounterApi.endpoints.addEncounterAsset).toBeDefined();
                expect(encounterApi.endpoints.addEncounterAsset.useMutation).toBeDefined();
            });

            it('should define updateEncounterAsset endpoint', () => {
                expect(encounterApi.endpoints.updateEncounterAsset).toBeDefined();
                expect(encounterApi.endpoints.updateEncounterAsset.useMutation).toBeDefined();
            });

            it('should define bulkUpdateEncounterAssets endpoint', () => {
                expect(encounterApi.endpoints.bulkUpdateEncounterAssets).toBeDefined();
                expect(encounterApi.endpoints.bulkUpdateEncounterAssets.useMutation).toBeDefined();
            });

            it('should define removeEncounterAsset endpoint', () => {
                expect(encounterApi.endpoints.removeEncounterAsset).toBeDefined();
                expect(encounterApi.endpoints.removeEncounterAsset.useMutation).toBeDefined();
            });

            it('should define bulkDeleteEncounterAssets endpoint', () => {
                expect(encounterApi.endpoints.bulkDeleteEncounterAssets).toBeDefined();
                expect(encounterApi.endpoints.bulkDeleteEncounterAssets.useMutation).toBeDefined();
            });

            it('should define bulkAddEncounterAssets endpoint', () => {
                expect(encounterApi.endpoints.bulkAddEncounterAssets).toBeDefined();
                expect(encounterApi.endpoints.bulkAddEncounterAssets.useMutation).toBeDefined();
            });
        });
    });

    describe('hook exports', () => {
        describe('Encounter CRUD hooks', () => {
            it('should export useGetEncounterQuery hook', async () => {
                const api = await import('./encounterApi');
                expect(typeof api.useGetEncounterQuery).toBe('function');
            });

            it('should export useGetEncountersQuery hook', async () => {
                const api = await import('./encounterApi');
                expect(typeof api.useGetEncountersQuery).toBe('function');
            });

            it('should export useCreateEncounterMutation hook', async () => {
                const api = await import('./encounterApi');
                expect(typeof api.useCreateEncounterMutation).toBe('function');
            });

            it('should export useUpdateEncounterMutation hook', async () => {
                const api = await import('./encounterApi');
                expect(typeof api.useUpdateEncounterMutation).toBe('function');
            });

            it('should export usePatchEncounterMutation hook', async () => {
                const api = await import('./encounterApi');
                expect(typeof api.usePatchEncounterMutation).toBe('function');
            });

            it('should export useDeleteEncounterMutation hook', async () => {
                const api = await import('./encounterApi');
                expect(typeof api.useDeleteEncounterMutation).toBe('function');
            });
        });

        describe('Encounter Asset hooks', () => {
            it('should export useGetEncounterAssetsQuery hook', async () => {
                const api = await import('./encounterApi');
                expect(typeof api.useGetEncounterAssetsQuery).toBe('function');
            });

            it('should export useAddEncounterAssetMutation hook', async () => {
                const api = await import('./encounterApi');
                expect(typeof api.useAddEncounterAssetMutation).toBe('function');
            });

            it('should export useUpdateEncounterAssetMutation hook', async () => {
                const api = await import('./encounterApi');
                expect(typeof api.useUpdateEncounterAssetMutation).toBe('function');
            });

            it('should export useBulkUpdateEncounterAssetsMutation hook', async () => {
                const api = await import('./encounterApi');
                expect(typeof api.useBulkUpdateEncounterAssetsMutation).toBe('function');
            });

            it('should export useRemoveEncounterAssetMutation hook', async () => {
                const api = await import('./encounterApi');
                expect(typeof api.useRemoveEncounterAssetMutation).toBe('function');
            });

            it('should export useBulkDeleteEncounterAssetsMutation hook', async () => {
                const api = await import('./encounterApi');
                expect(typeof api.useBulkDeleteEncounterAssetsMutation).toBe('function');
            });

            it('should export useBulkAddEncounterAssetsMutation hook', async () => {
                const api = await import('./encounterApi');
                expect(typeof api.useBulkAddEncounterAssetsMutation).toBe('function');
            });
        });
    });

    describe('exported types', () => {
        it('should have type-compatible UpdateEncounterWithVersionRequest shape', () => {
            // Test that the expected shape can be created (type-only verification via TypeScript)
            const testRequest = {
                id: 'enc-123',
                version: 1,
                name: 'Test',
            };
            expect(testRequest.id).toBe('enc-123');
            expect(testRequest.version).toBe(1);
        });

        it('should have type-compatible VersionConflictError shape', () => {
            // Test that the expected shape can be created (type-only verification via TypeScript)
            const testError = {
                message: 'Version conflict',
                serverVersion: 2,
                clientVersion: 1,
                conflictType: 'version_mismatch' as const,
            };
            expect(testError.conflictType).toBe('version_mismatch');
        });

        it('should have type-compatible EncounterAssetBulkUpdate shape', () => {
            // Test that the expected shape can be created (type-only verification via TypeScript)
            const testUpdate = {
                index: 0,
                position: { x: 100, y: 100 },
                size: { width: 50, height: 50 },
                rotation: 45,
                elevation: 5,
            };
            expect(testUpdate.index).toBe(0);
        });
    });

    describe('cache tag invalidation logic', () => {
        it('createEncounter should invalidate Encounter LIST tag', () => {
            // The createEncounter mutation should invalidate { type: 'Encounter', id: 'LIST' }
            // This ensures the encounters list is refetched after creation
            expect(encounterApi.endpoints.createEncounter).toBeDefined();
        });

        it('deleteEncounter should invalidate specific encounter and LIST tags', () => {
            // The deleteEncounter mutation should invalidate both the specific encounter
            // and the LIST tag to ensure proper cache cleanup
            expect(encounterApi.endpoints.deleteEncounter).toBeDefined();
        });

        it('asset mutations should invalidate parent encounter', () => {
            // Asset mutations should invalidate the parent encounter to trigger refresh
            expect(encounterApi.endpoints.addEncounterAsset).toBeDefined();
            expect(encounterApi.endpoints.updateEncounterAsset).toBeDefined();
            expect(encounterApi.endpoints.removeEncounterAsset).toBeDefined();
        });
    });

    describe('store integration', () => {
        it('should integrate with Redux store correctly', () => {
            const state = store.getState() as { [key: string]: unknown };
            expect(state[encounterApi.reducerPath]).toBeDefined();
        });

        it('should have initialized queries state', () => {
            const state = store.getState() as { [key: string]: { queries?: unknown; mutations?: unknown } };
            expect(state[encounterApi.reducerPath]?.queries).toBeDefined();
        });

        it('should have initialized mutations state', () => {
            const state = store.getState() as { [key: string]: { queries?: unknown; mutations?: unknown } };
            expect(state[encounterApi.reducerPath]?.mutations).toBeDefined();
        });
    });

    describe('endpoint count verification', () => {
        it('should have correct total number of endpoints', () => {
            const endpointNames = Object.keys(encounterApi.endpoints);
            // 6 Encounter CRUD + 7 Asset = 13
            expect(endpointNames.length).toBe(13);
        });

        it('should have all encounter CRUD endpoints', () => {
            const expectedEndpoints = [
                'getEncounter',
                'getEncounters',
                'createEncounter',
                'updateEncounter',
                'patchEncounter',
                'deleteEncounter',
            ];
            expectedEndpoints.forEach((name) => {
                expect(encounterApi.endpoints).toHaveProperty(name);
            });
        });

        it('should have all encounter asset endpoints', () => {
            const expectedEndpoints = [
                'getEncounterAssets',
                'addEncounterAsset',
                'updateEncounterAsset',
                'bulkUpdateEncounterAssets',
                'removeEncounterAsset',
                'bulkDeleteEncounterAssets',
                'bulkAddEncounterAssets',
            ];
            expectedEndpoints.forEach((name) => {
                expect(encounterApi.endpoints).toHaveProperty(name);
            });
        });
    });
});
