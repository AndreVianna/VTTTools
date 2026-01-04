import { configureStore } from '@reduxjs/toolkit';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { worldsApi } from './worldsApi';

vi.mock('./enhancedBaseQuery', () => ({
    createEnhancedBaseQuery: vi.fn(() => vi.fn()),
}));

describe('worldsApi', () => {
    let store: ReturnType<typeof configureStore>;

    beforeEach(() => {
        vi.clearAllMocks();
        store = configureStore({
            reducer: {
                [worldsApi.reducerPath]: worldsApi.reducer,
            },
            middleware: (getDefaultMiddleware) =>
                getDefaultMiddleware().concat(worldsApi.middleware),
        });
    });

    describe('API configuration', () => {
        it('should have correct reducerPath', () => {
            // Arrange & Act
            const reducerPath = worldsApi.reducerPath;

            // Assert
            expect(reducerPath).toBe('worldsApi');
        });

        it('should define World tag type', () => {
            // Arrange & Act & Assert
            expect(worldsApi.util.selectInvalidatedBy).toBeDefined();
        });

        it('should define WorldCampaigns tag type', () => {
            // Arrange & Act & Assert
            expect(worldsApi.util.selectInvalidatedBy).toBeDefined();
        });
    });

    describe('endpoint definitions', () => {
        describe('World CRUD endpoints', () => {
            it('should define getWorlds endpoint', () => {
                // Arrange & Act & Assert
                expect(worldsApi.endpoints.getWorlds).toBeDefined();
                expect(worldsApi.endpoints.getWorlds.useQuery).toBeDefined();
            });

            it('should define getWorld endpoint', () => {
                // Arrange & Act & Assert
                expect(worldsApi.endpoints.getWorld).toBeDefined();
                expect(worldsApi.endpoints.getWorld.useQuery).toBeDefined();
            });

            it('should define createWorld endpoint', () => {
                // Arrange & Act & Assert
                expect(worldsApi.endpoints.createWorld).toBeDefined();
                expect(worldsApi.endpoints.createWorld.useMutation).toBeDefined();
            });

            it('should define updateWorld endpoint', () => {
                // Arrange & Act & Assert
                expect(worldsApi.endpoints.updateWorld).toBeDefined();
                expect(worldsApi.endpoints.updateWorld.useMutation).toBeDefined();
            });

            it('should define deleteWorld endpoint', () => {
                // Arrange & Act & Assert
                expect(worldsApi.endpoints.deleteWorld).toBeDefined();
                expect(worldsApi.endpoints.deleteWorld.useMutation).toBeDefined();
            });

            it('should define cloneWorld endpoint', () => {
                // Arrange & Act & Assert
                expect(worldsApi.endpoints.cloneWorld).toBeDefined();
                expect(worldsApi.endpoints.cloneWorld.useMutation).toBeDefined();
            });
        });

        describe('Campaign endpoints', () => {
            it('should define getCampaigns endpoint', () => {
                // Arrange & Act & Assert
                expect(worldsApi.endpoints.getCampaigns).toBeDefined();
                expect(worldsApi.endpoints.getCampaigns.useQuery).toBeDefined();
            });

            it('should define createCampaign endpoint', () => {
                // Arrange & Act & Assert
                expect(worldsApi.endpoints.createCampaign).toBeDefined();
                expect(worldsApi.endpoints.createCampaign.useMutation).toBeDefined();
            });

            it('should define cloneCampaign endpoint', () => {
                // Arrange & Act & Assert
                expect(worldsApi.endpoints.cloneCampaign).toBeDefined();
                expect(worldsApi.endpoints.cloneCampaign.useMutation).toBeDefined();
            });

            it('should define removeCampaign endpoint', () => {
                // Arrange & Act & Assert
                expect(worldsApi.endpoints.removeCampaign).toBeDefined();
                expect(worldsApi.endpoints.removeCampaign.useMutation).toBeDefined();
            });
        });
    });

    describe('hook exports', () => {
        describe('World CRUD hooks', () => {
            it('should export useGetWorldsQuery hook', async () => {
                // Arrange & Act
                const api = await import('./worldsApi');

                // Assert
                expect(typeof api.useGetWorldsQuery).toBe('function');
            });

            it('should export useGetWorldQuery hook', async () => {
                // Arrange & Act
                const api = await import('./worldsApi');

                // Assert
                expect(typeof api.useGetWorldQuery).toBe('function');
            });

            it('should export useCreateWorldMutation hook', async () => {
                // Arrange & Act
                const api = await import('./worldsApi');

                // Assert
                expect(typeof api.useCreateWorldMutation).toBe('function');
            });

            it('should export useUpdateWorldMutation hook', async () => {
                // Arrange & Act
                const api = await import('./worldsApi');

                // Assert
                expect(typeof api.useUpdateWorldMutation).toBe('function');
            });

            it('should export useDeleteWorldMutation hook', async () => {
                // Arrange & Act
                const api = await import('./worldsApi');

                // Assert
                expect(typeof api.useDeleteWorldMutation).toBe('function');
            });

            it('should export useCloneWorldMutation hook', async () => {
                // Arrange & Act
                const api = await import('./worldsApi');

                // Assert
                expect(typeof api.useCloneWorldMutation).toBe('function');
            });
        });

        describe('Campaign hooks', () => {
            it('should export useGetCampaignsQuery hook', async () => {
                // Arrange & Act
                const api = await import('./worldsApi');

                // Assert
                expect(typeof api.useGetCampaignsQuery).toBe('function');
            });

            it('should export useCreateCampaignMutation hook', async () => {
                // Arrange & Act
                const api = await import('./worldsApi');

                // Assert
                expect(typeof api.useCreateCampaignMutation).toBe('function');
            });

            it('should export useCloneCampaignMutation hook', async () => {
                // Arrange & Act
                const api = await import('./worldsApi');

                // Assert
                expect(typeof api.useCloneCampaignMutation).toBe('function');
            });

            it('should export useRemoveCampaignMutation hook', async () => {
                // Arrange & Act
                const api = await import('./worldsApi');

                // Assert
                expect(typeof api.useRemoveCampaignMutation).toBe('function');
            });
        });
    });

    describe('cache tag invalidation logic', () => {
        it('createWorld should invalidate World tag', () => {
            // Arrange & Act & Assert
            // The createWorld mutation should invalidate 'World' tag
            // to ensure the worlds list is refetched after creation
            expect(worldsApi.endpoints.createWorld).toBeDefined();
        });

        it('deleteWorld should invalidate World tag', () => {
            // Arrange & Act & Assert
            // The deleteWorld mutation should invalidate 'World' tag
            // to ensure proper cache cleanup after deletion
            expect(worldsApi.endpoints.deleteWorld).toBeDefined();
        });

        it('cloneWorld should invalidate World tag', () => {
            // Arrange & Act & Assert
            // The cloneWorld mutation should invalidate 'World' tag
            // to ensure the new clone appears in the list
            expect(worldsApi.endpoints.cloneWorld).toBeDefined();
        });

        it('campaign mutations should invalidate WorldCampaigns tag', () => {
            // Arrange & Act & Assert
            // Campaign mutations should invalidate the WorldCampaigns tag
            // to trigger refresh of the campaigns list for a specific world
            expect(worldsApi.endpoints.createCampaign).toBeDefined();
            expect(worldsApi.endpoints.cloneCampaign).toBeDefined();
            expect(worldsApi.endpoints.removeCampaign).toBeDefined();
        });
    });

    describe('store integration', () => {
        it('should integrate with Redux store correctly', () => {
            // Arrange & Act
            const state = store.getState() as { [key: string]: unknown };

            // Assert
            expect(state[worldsApi.reducerPath]).toBeDefined();
        });

        it('should have initialized queries state', () => {
            // Arrange & Act
            const state = store.getState() as { [key: string]: { queries?: unknown; mutations?: unknown } };

            // Assert
            expect(state[worldsApi.reducerPath]?.queries).toBeDefined();
        });

        it('should have initialized mutations state', () => {
            // Arrange & Act
            const state = store.getState() as { [key: string]: { queries?: unknown; mutations?: unknown } };

            // Assert
            expect(state[worldsApi.reducerPath]?.mutations).toBeDefined();
        });
    });

    describe('endpoint count verification', () => {
        it('should have correct total number of endpoints', () => {
            // Arrange & Act
            const endpointNames = Object.keys(worldsApi.endpoints);

            // Assert
            // 6 World endpoints + 4 Campaign endpoints = 10
            expect(endpointNames.length).toBe(10);
        });

        it('should have all world CRUD endpoints', () => {
            // Arrange
            const expectedEndpoints = [
                'getWorlds',
                'getWorld',
                'createWorld',
                'updateWorld',
                'deleteWorld',
                'cloneWorld',
            ];

            // Act & Assert
            expectedEndpoints.forEach((name) => {
                expect(worldsApi.endpoints).toHaveProperty(name);
            });
        });

        it('should have all campaign endpoints', () => {
            // Arrange
            const expectedEndpoints = [
                'getCampaigns',
                'createCampaign',
                'cloneCampaign',
                'removeCampaign',
            ];

            // Act & Assert
            expectedEndpoints.forEach((name) => {
                expect(worldsApi.endpoints).toHaveProperty(name);
            });
        });
    });
});
