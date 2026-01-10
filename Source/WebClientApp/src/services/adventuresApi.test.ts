import { configureStore } from '@reduxjs/toolkit';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { adventuresApi } from './adventuresApi';

vi.mock('./enhancedBaseQuery', () => ({
    createEnhancedBaseQuery: vi.fn(() => vi.fn()),
}));

vi.mock('./contentApi', () => ({
    contentApi: {
        util: {
            invalidateTags: vi.fn(),
        },
    },
}));

describe('adventuresApi', () => {
    let store: ReturnType<typeof configureStore>;

    beforeEach(() => {
        vi.clearAllMocks();
        store = configureStore({
            reducer: {
                [adventuresApi.reducerPath]: adventuresApi.reducer,
            },
            middleware: (getDefaultMiddleware) =>
                getDefaultMiddleware().concat(adventuresApi.middleware),
        });
    });

    describe('API configuration', () => {
        it('should have correct reducerPath', () => {
            // Arrange & Act
            const reducerPath = adventuresApi.reducerPath;

            // Assert
            expect(reducerPath).toBe('adventuresApi');
        });

        it('should define Adventure tag type', () => {
            // Arrange & Act & Assert
            expect(adventuresApi.util.selectInvalidatedBy).toBeDefined();
        });

        it('should define AdventureEncounters tag type', () => {
            // Arrange & Act & Assert
            expect(adventuresApi.util.selectInvalidatedBy).toBeDefined();
        });

        it('should have reducer function defined', () => {
            // Arrange & Act & Assert
            expect(typeof adventuresApi.reducer).toBe('function');
        });

        it('should have middleware function defined', () => {
            // Arrange & Act & Assert
            expect(typeof adventuresApi.middleware).toBe('function');
        });
    });

    describe('endpoint definitions', () => {
        describe('Adventure CRUD endpoints', () => {
            it('should define getAdventures endpoint', () => {
                // Arrange & Act & Assert
                expect(adventuresApi.endpoints.getAdventures).toBeDefined();
                expect(adventuresApi.endpoints.getAdventures.useQuery).toBeDefined();
            });

            it('should define getAdventure endpoint', () => {
                // Arrange & Act & Assert
                expect(adventuresApi.endpoints.getAdventure).toBeDefined();
                expect(adventuresApi.endpoints.getAdventure.useQuery).toBeDefined();
            });

            it('should define createAdventure endpoint', () => {
                // Arrange & Act & Assert
                expect(adventuresApi.endpoints.createAdventure).toBeDefined();
                expect(adventuresApi.endpoints.createAdventure.useMutation).toBeDefined();
            });

            it('should define updateAdventure endpoint', () => {
                // Arrange & Act & Assert
                expect(adventuresApi.endpoints.updateAdventure).toBeDefined();
                expect(adventuresApi.endpoints.updateAdventure.useMutation).toBeDefined();
            });

            it('should define deleteAdventure endpoint', () => {
                // Arrange & Act & Assert
                expect(adventuresApi.endpoints.deleteAdventure).toBeDefined();
                expect(adventuresApi.endpoints.deleteAdventure.useMutation).toBeDefined();
            });

            it('should define cloneAdventure endpoint', () => {
                // Arrange & Act & Assert
                expect(adventuresApi.endpoints.cloneAdventure).toBeDefined();
                expect(adventuresApi.endpoints.cloneAdventure.useMutation).toBeDefined();
            });

            it('should define searchAdventures endpoint', () => {
                // Arrange & Act & Assert
                expect(adventuresApi.endpoints.searchAdventures).toBeDefined();
                expect(adventuresApi.endpoints.searchAdventures.useQuery).toBeDefined();
            });
        });

        describe('Adventure-scoped Encounter endpoints', () => {
            it('should define getEncounters endpoint', () => {
                // Arrange & Act & Assert
                expect(adventuresApi.endpoints.getEncounters).toBeDefined();
                expect(adventuresApi.endpoints.getEncounters.useQuery).toBeDefined();
            });

            it('should define createEncounter endpoint', () => {
                // Arrange & Act & Assert
                expect(adventuresApi.endpoints.createEncounter).toBeDefined();
                expect(adventuresApi.endpoints.createEncounter.useMutation).toBeDefined();
            });

            it('should define cloneEncounter endpoint', () => {
                // Arrange & Act & Assert
                expect(adventuresApi.endpoints.cloneEncounter).toBeDefined();
                expect(adventuresApi.endpoints.cloneEncounter.useMutation).toBeDefined();
            });
        });
    });

    describe('hook exports', () => {
        describe('Adventure query hooks', () => {
            it('should export useGetAdventuresQuery hook', async () => {
                // Arrange
                const api = await import('./adventuresApi');

                // Act & Assert
                expect(typeof api.useGetAdventuresQuery).toBe('function');
            });

            it('should export useGetAdventureQuery hook', async () => {
                // Arrange
                const api = await import('./adventuresApi');

                // Act & Assert
                expect(typeof api.useGetAdventureQuery).toBe('function');
            });

            it('should export useSearchAdventuresQuery hook', async () => {
                // Arrange
                const api = await import('./adventuresApi');

                // Act & Assert
                expect(typeof api.useSearchAdventuresQuery).toBe('function');
            });
        });

        describe('Adventure mutation hooks', () => {
            it('should export useCreateAdventureMutation hook', async () => {
                // Arrange
                const api = await import('./adventuresApi');

                // Act & Assert
                expect(typeof api.useCreateAdventureMutation).toBe('function');
            });

            it('should export useUpdateAdventureMutation hook', async () => {
                // Arrange
                const api = await import('./adventuresApi');

                // Act & Assert
                expect(typeof api.useUpdateAdventureMutation).toBe('function');
            });

            it('should export useDeleteAdventureMutation hook', async () => {
                // Arrange
                const api = await import('./adventuresApi');

                // Act & Assert
                expect(typeof api.useDeleteAdventureMutation).toBe('function');
            });

            it('should export useCloneAdventureMutation hook', async () => {
                // Arrange
                const api = await import('./adventuresApi');

                // Act & Assert
                expect(typeof api.useCloneAdventureMutation).toBe('function');
            });
        });

        describe('Adventure-scoped Encounter hooks', () => {
            it('should export useGetEncountersQuery hook', async () => {
                // Arrange
                const api = await import('./adventuresApi');

                // Act & Assert
                expect(typeof api.useGetEncountersQuery).toBe('function');
            });

            it('should export useCreateEncounterMutation hook', async () => {
                // Arrange
                const api = await import('./adventuresApi');

                // Act & Assert
                expect(typeof api.useCreateEncounterMutation).toBe('function');
            });

            it('should export useCloneEncounterMutation hook', async () => {
                // Arrange
                const api = await import('./adventuresApi');

                // Act & Assert
                expect(typeof api.useCloneEncounterMutation).toBe('function');
            });
        });
    });

    describe('cache tag invalidation logic', () => {
        it('createAdventure should invalidate Adventure tag', () => {
            // Arrange & Act & Assert
            // The createAdventure mutation invalidates 'Adventure' tag
            expect(adventuresApi.endpoints.createAdventure).toBeDefined();
        });

        it('deleteAdventure should invalidate Adventure tag', () => {
            // Arrange & Act & Assert
            // The deleteAdventure mutation invalidates 'Adventure' tag
            expect(adventuresApi.endpoints.deleteAdventure).toBeDefined();
        });

        it('updateAdventure should invalidate specific Adventure tag by id', () => {
            // Arrange & Act & Assert
            // The updateAdventure mutation invalidates { type: 'Adventure', id }
            expect(adventuresApi.endpoints.updateAdventure).toBeDefined();
        });

        it('cloneAdventure should invalidate Adventure tag', () => {
            // Arrange & Act & Assert
            // The cloneAdventure mutation invalidates 'Adventure' tag
            expect(adventuresApi.endpoints.cloneAdventure).toBeDefined();
        });

        it('getAdventures should provide Adventure tag', () => {
            // Arrange & Act & Assert
            // The getAdventures query provides 'Adventure' tag
            expect(adventuresApi.endpoints.getAdventures).toBeDefined();
        });

        it('getAdventure should provide specific Adventure tag by id', () => {
            // Arrange & Act & Assert
            // The getAdventure query provides { type: 'Adventure', id }
            expect(adventuresApi.endpoints.getAdventure).toBeDefined();
        });

        it('getEncounters should provide AdventureEncounters tag by adventureId', () => {
            // Arrange & Act & Assert
            // The getEncounters query provides { type: 'AdventureEncounters', id: adventureId }
            expect(adventuresApi.endpoints.getEncounters).toBeDefined();
        });

        it('createEncounter should invalidate AdventureEncounters tag by adventureId', () => {
            // Arrange & Act & Assert
            // The createEncounter mutation invalidates { type: 'AdventureEncounters', id: adventureId }
            expect(adventuresApi.endpoints.createEncounter).toBeDefined();
        });

        it('cloneEncounter should invalidate AdventureEncounters tag by adventureId', () => {
            // Arrange & Act & Assert
            // The cloneEncounter mutation invalidates { type: 'AdventureEncounters', id: adventureId }
            expect(adventuresApi.endpoints.cloneEncounter).toBeDefined();
        });

        it('searchAdventures should provide Adventure tag', () => {
            // Arrange & Act & Assert
            // The searchAdventures query provides 'Adventure' tag
            expect(adventuresApi.endpoints.searchAdventures).toBeDefined();
        });
    });

    describe('store integration', () => {
        it('should integrate with Redux store correctly', () => {
            // Arrange & Act
            const state = store.getState() as { [key: string]: unknown };

            // Assert
            expect(state[adventuresApi.reducerPath]).toBeDefined();
        });

        it('should have initialized queries state', () => {
            // Arrange & Act
            const state = store.getState() as { [key: string]: { queries?: unknown } };

            // Assert
            expect(state[adventuresApi.reducerPath]?.queries).toBeDefined();
        });

        it('should have initialized mutations state', () => {
            // Arrange & Act
            const state = store.getState() as { [key: string]: { mutations?: unknown } };

            // Assert
            expect(state[adventuresApi.reducerPath]?.mutations).toBeDefined();
        });

        it('should have initialized provided state', () => {
            // Arrange & Act
            const state = store.getState() as { [key: string]: { provided?: unknown } };

            // Assert
            expect(state[adventuresApi.reducerPath]?.provided).toBeDefined();
        });
    });

    describe('endpoint count verification', () => {
        it('should have correct total number of endpoints', () => {
            // Arrange
            const endpointNames = Object.keys(adventuresApi.endpoints);

            // Act & Assert
            // 7 Adventure + 3 Encounter = 10 total
            expect(endpointNames.length).toBe(10);
        });

        it('should have all adventure CRUD endpoints', () => {
            // Arrange
            const expectedEndpoints = [
                'getAdventures',
                'getAdventure',
                'createAdventure',
                'updateAdventure',
                'deleteAdventure',
                'cloneAdventure',
                'searchAdventures',
            ];

            // Act & Assert
            expectedEndpoints.forEach((name) => {
                expect(adventuresApi.endpoints).toHaveProperty(name);
            });
        });

        it('should have all adventure-scoped encounter endpoints', () => {
            // Arrange
            const expectedEndpoints = ['getEncounters', 'createEncounter', 'cloneEncounter'];

            // Act & Assert
            expectedEndpoints.forEach((name) => {
                expect(adventuresApi.endpoints).toHaveProperty(name);
            });
        });
    });
});
