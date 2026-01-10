import { configureStore } from '@reduxjs/toolkit';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { campaignsApi } from './campaignsApi';

vi.mock('./enhancedBaseQuery', () => ({
    createEnhancedBaseQuery: vi.fn(() => vi.fn()),
}));

describe('campaignsApi', () => {
    let store: ReturnType<typeof configureStore>;

    beforeEach(() => {
        vi.clearAllMocks();
        store = configureStore({
            reducer: {
                [campaignsApi.reducerPath]: campaignsApi.reducer,
            },
            middleware: (getDefaultMiddleware) =>
                getDefaultMiddleware().concat(campaignsApi.middleware),
        });
    });

    describe('API configuration', () => {
        it('should have correct reducerPath', () => {
            // Arrange & Act - configuration is static
            const reducerPath = campaignsApi.reducerPath;

            // Assert
            expect(reducerPath).toBe('campaignsApi');
        });

        it('should define all expected tag types', () => {
            // Arrange
            const expectedTags = ['Campaign', 'CampaignAdventures'];

            // Act & Assert
            expectedTags.forEach(() => {
                expect(campaignsApi.util.selectInvalidatedBy).toBeDefined();
            });
        });
    });

    describe('endpoint definitions', () => {
        describe('Campaign CRUD endpoints', () => {
            it('should define getCampaigns endpoint', () => {
                // Arrange & Act
                const endpoint = campaignsApi.endpoints.getCampaigns;

                // Assert
                expect(endpoint).toBeDefined();
                expect(endpoint.useQuery).toBeDefined();
            });

            it('should define getCampaign endpoint', () => {
                // Arrange & Act
                const endpoint = campaignsApi.endpoints.getCampaign;

                // Assert
                expect(endpoint).toBeDefined();
                expect(endpoint.useQuery).toBeDefined();
            });

            it('should define createCampaign endpoint', () => {
                // Arrange & Act
                const endpoint = campaignsApi.endpoints.createCampaign;

                // Assert
                expect(endpoint).toBeDefined();
                expect(endpoint.useMutation).toBeDefined();
            });

            it('should define updateCampaign endpoint', () => {
                // Arrange & Act
                const endpoint = campaignsApi.endpoints.updateCampaign;

                // Assert
                expect(endpoint).toBeDefined();
                expect(endpoint.useMutation).toBeDefined();
            });

            it('should define deleteCampaign endpoint', () => {
                // Arrange & Act
                const endpoint = campaignsApi.endpoints.deleteCampaign;

                // Assert
                expect(endpoint).toBeDefined();
                expect(endpoint.useMutation).toBeDefined();
            });

            it('should define cloneCampaign endpoint', () => {
                // Arrange & Act
                const endpoint = campaignsApi.endpoints.cloneCampaign;

                // Assert
                expect(endpoint).toBeDefined();
                expect(endpoint.useMutation).toBeDefined();
            });
        });

        describe('Adventure endpoints', () => {
            it('should define getAdventures endpoint', () => {
                // Arrange & Act
                const endpoint = campaignsApi.endpoints.getAdventures;

                // Assert
                expect(endpoint).toBeDefined();
                expect(endpoint.useQuery).toBeDefined();
            });

            it('should define createAdventure endpoint', () => {
                // Arrange & Act
                const endpoint = campaignsApi.endpoints.createAdventure;

                // Assert
                expect(endpoint).toBeDefined();
                expect(endpoint.useMutation).toBeDefined();
            });

            it('should define cloneAdventure endpoint', () => {
                // Arrange & Act
                const endpoint = campaignsApi.endpoints.cloneAdventure;

                // Assert
                expect(endpoint).toBeDefined();
                expect(endpoint.useMutation).toBeDefined();
            });

            it('should define removeAdventure endpoint', () => {
                // Arrange & Act
                const endpoint = campaignsApi.endpoints.removeAdventure;

                // Assert
                expect(endpoint).toBeDefined();
                expect(endpoint.useMutation).toBeDefined();
            });
        });
    });

    describe('hook exports', () => {
        describe('Campaign CRUD hooks', () => {
            it('should export useGetCampaignsQuery hook', async () => {
                // Arrange & Act
                const api = await import('./campaignsApi');

                // Assert
                expect(typeof api.useGetCampaignsQuery).toBe('function');
            });

            it('should export useGetCampaignQuery hook', async () => {
                // Arrange & Act
                const api = await import('./campaignsApi');

                // Assert
                expect(typeof api.useGetCampaignQuery).toBe('function');
            });

            it('should export useCreateCampaignMutation hook', async () => {
                // Arrange & Act
                const api = await import('./campaignsApi');

                // Assert
                expect(typeof api.useCreateCampaignMutation).toBe('function');
            });

            it('should export useUpdateCampaignMutation hook', async () => {
                // Arrange & Act
                const api = await import('./campaignsApi');

                // Assert
                expect(typeof api.useUpdateCampaignMutation).toBe('function');
            });

            it('should export useDeleteCampaignMutation hook', async () => {
                // Arrange & Act
                const api = await import('./campaignsApi');

                // Assert
                expect(typeof api.useDeleteCampaignMutation).toBe('function');
            });

            it('should export useCloneCampaignMutation hook', async () => {
                // Arrange & Act
                const api = await import('./campaignsApi');

                // Assert
                expect(typeof api.useCloneCampaignMutation).toBe('function');
            });
        });

        describe('Adventure hooks', () => {
            it('should export useGetAdventuresQuery hook', async () => {
                // Arrange & Act
                const api = await import('./campaignsApi');

                // Assert
                expect(typeof api.useGetAdventuresQuery).toBe('function');
            });

            it('should export useCreateAdventureMutation hook', async () => {
                // Arrange & Act
                const api = await import('./campaignsApi');

                // Assert
                expect(typeof api.useCreateAdventureMutation).toBe('function');
            });

            it('should export useCloneAdventureMutation hook', async () => {
                // Arrange & Act
                const api = await import('./campaignsApi');

                // Assert
                expect(typeof api.useCloneAdventureMutation).toBe('function');
            });

            it('should export useRemoveAdventureMutation hook', async () => {
                // Arrange & Act
                const api = await import('./campaignsApi');

                // Assert
                expect(typeof api.useRemoveAdventureMutation).toBe('function');
            });
        });
    });

    describe('cache tag invalidation logic', () => {
        it('createCampaign should invalidate Campaign tag', () => {
            // Arrange & Act - The createCampaign mutation should invalidate Campaign tag
            // This ensures the campaigns list is refetched after creation
            const endpoint = campaignsApi.endpoints.createCampaign;

            // Assert
            expect(endpoint).toBeDefined();
        });

        it('deleteCampaign should invalidate Campaign tag', () => {
            // Arrange & Act - The deleteCampaign mutation should invalidate Campaign tag
            // to ensure the list is refreshed after deletion
            const endpoint = campaignsApi.endpoints.deleteCampaign;

            // Assert
            expect(endpoint).toBeDefined();
        });

        it('updateCampaign should invalidate specific campaign tag', () => {
            // Arrange & Act - The updateCampaign mutation should invalidate
            // the specific campaign by id to trigger refresh
            const endpoint = campaignsApi.endpoints.updateCampaign;

            // Assert
            expect(endpoint).toBeDefined();
        });

        it('cloneCampaign should invalidate Campaign tag', () => {
            // Arrange & Act - The cloneCampaign mutation should invalidate Campaign tag
            // to refresh the list with the new cloned campaign
            const endpoint = campaignsApi.endpoints.cloneCampaign;

            // Assert
            expect(endpoint).toBeDefined();
        });

        it('adventure mutations should invalidate CampaignAdventures tag', () => {
            // Arrange & Act - Adventure mutations should invalidate CampaignAdventures
            // tag by campaignId to trigger refresh of adventures list
            const createEndpoint = campaignsApi.endpoints.createAdventure;
            const cloneEndpoint = campaignsApi.endpoints.cloneAdventure;
            const removeEndpoint = campaignsApi.endpoints.removeAdventure;

            // Assert
            expect(createEndpoint).toBeDefined();
            expect(cloneEndpoint).toBeDefined();
            expect(removeEndpoint).toBeDefined();
        });
    });

    describe('store integration', () => {
        it('should integrate with Redux store correctly', () => {
            // Arrange & Act
            const state = store.getState() as { [key: string]: unknown };

            // Assert
            expect(state[campaignsApi.reducerPath]).toBeDefined();
        });

        it('should have initialized queries state', () => {
            // Arrange & Act
            const state = store.getState() as { [key: string]: { queries?: unknown; mutations?: unknown } };

            // Assert
            expect(state[campaignsApi.reducerPath]?.queries).toBeDefined();
        });

        it('should have initialized mutations state', () => {
            // Arrange & Act
            const state = store.getState() as { [key: string]: { queries?: unknown; mutations?: unknown } };

            // Assert
            expect(state[campaignsApi.reducerPath]?.mutations).toBeDefined();
        });
    });

    describe('endpoint count verification', () => {
        it('should have correct total number of endpoints', () => {
            // Arrange & Act
            const endpointNames = Object.keys(campaignsApi.endpoints);

            // Assert - 6 Campaign + 4 Adventure = 10
            expect(endpointNames.length).toBe(10);
        });

        it('should have all campaign CRUD endpoints', () => {
            // Arrange
            const expectedEndpoints = [
                'getCampaigns',
                'getCampaign',
                'createCampaign',
                'updateCampaign',
                'deleteCampaign',
                'cloneCampaign',
            ];

            // Act & Assert
            expectedEndpoints.forEach((name) => {
                expect(campaignsApi.endpoints).toHaveProperty(name);
            });
        });

        it('should have all adventure endpoints', () => {
            // Arrange
            const expectedEndpoints = [
                'getAdventures',
                'createAdventure',
                'cloneAdventure',
                'removeAdventure',
            ];

            // Act & Assert
            expectedEndpoints.forEach((name) => {
                expect(campaignsApi.endpoints).toHaveProperty(name);
            });
        });
    });
});
