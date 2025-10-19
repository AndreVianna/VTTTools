import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
    persistMiddleware,
    hydrateFromStorage,
    getOfflineMutations,
    clearOfflineMutations,
    removeOfflineMutation,
    syncOfflineMutations,
    type OfflineMutation
} from './offlineSync';
import { storage } from '@/utils/storage';

vi.mock('@/utils/storage', () => ({
    storage: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn()
    }
}));

describe('offlineSync', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('persistMiddleware', () => {
        it('should persist cache on fulfilled actions', () => {
            const api = {
                getState: vi.fn().mockReturnValue({
                    sceneApi: {
                        queries: { test: 'data' },
                        mutations: {}
                    }
                })
            };
            const next = vi.fn(action => action);
            const action = { type: 'sceneApi/getScene/fulfilled' };

            const middleware = persistMiddleware(api as any);
            middleware(next)(action);

            expect(storage.setItem).toHaveBeenCalledWith(
                'rtkQueryCache',
                expect.objectContaining({
                    queries: { test: 'data' },
                    mutations: {},
                    timestamp: expect.any(Number)
                })
            );
        });

        it('should persist cache on rejected actions', () => {
            const api = {
                getState: vi.fn().mockReturnValue({
                    sceneApi: {
                        queries: {},
                        mutations: { test: 'mutation' }
                    }
                })
            };
            const next = vi.fn(action => action);
            const action = { type: 'sceneApi/updateScene/rejected' };

            const middleware = persistMiddleware(api as any);
            middleware(next)(action);

            expect(storage.setItem).toHaveBeenCalled();
        });

        it('should not persist on non-RTK actions', () => {
            const api = { getState: vi.fn() };
            const next = vi.fn(action => action);
            const action = { type: 'some/other/action' };

            const middleware = persistMiddleware(api as any);
            middleware(next)(action);

            expect(storage.setItem).not.toHaveBeenCalled();
        });

        it('should queue offline mutations on network errors', () => {
            const api = {
                getState: vi.fn().mockReturnValue({
                    sceneApi: { queries: {}, mutations: {} }
                })
            };
            const next = vi.fn(action => action);
            const action = {
                type: 'sceneApi/updateScene/rejected',
                meta: {
                    arg: {
                        type: 'mutation',
                        endpointName: 'updateScene',
                        originalArgs: { id: '123', version: 1 }
                    },
                    rejectedWithValue: true
                },
                payload: { status: 'FETCH_ERROR' },
                error: { name: 'ConditionError', message: 'Network error' }
            };

            vi.mocked(storage.getItem).mockReturnValue([]);

            const middleware = persistMiddleware(api as any);
            middleware(next)(action);

            const calls = vi.mocked(storage.setItem).mock.calls;
            const offlineMutationCall = calls.find(call => call[0] === 'offlineMutations');

            expect(offlineMutationCall).toBeDefined();
            expect(offlineMutationCall?.[1]).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        endpoint: 'updateScene',
                        args: { id: '123', version: 1 }
                    })
                ])
            );
        });

        it('should append to existing offline mutations', () => {
            const existingMutations: OfflineMutation[] = [
                { id: 'existing', endpoint: 'test', args: {}, timestamp: Date.now() }
            ];

            const api = {
                getState: vi.fn().mockReturnValue({
                    sceneApi: { queries: {}, mutations: {} }
                })
            };
            const next = vi.fn(action => action);
            const action = {
                type: 'sceneApi/updateScene/rejected',
                meta: {
                    arg: {
                        type: 'mutation',
                        endpointName: 'updateScene',
                        originalArgs: { id: '456' }
                    },
                    rejectedWithValue: true
                },
                payload: { status: 'FETCH_ERROR' },
                error: { message: 'Network error' }
            };

            vi.mocked(storage.getItem).mockReturnValue(existingMutations);

            const middleware = persistMiddleware(api as any);
            middleware(next)(action);

            const calls = vi.mocked(storage.setItem).mock.calls;
            const offlineMutationCall = calls.find(call => call[0] === 'offlineMutations');

            expect(offlineMutationCall).toBeDefined();
            expect(offlineMutationCall?.[1]).toEqual(
                expect.arrayContaining([
                    existingMutations[0],
                    expect.objectContaining({ endpoint: 'updateScene' })
                ])
            );
        });
    });

    describe('hydrateFromStorage', () => {
        it('should return cached state if valid', () => {
            const cachedData = {
                queries: { test: 'data' },
                mutations: {},
                timestamp: Date.now() - 1000
            };

            vi.mocked(storage.getItem).mockReturnValue(cachedData);

            const result = hydrateFromStorage();

            expect(result).toMatchObject({
                queries: { test: 'data' },
                mutations: {},
                config: expect.objectContaining({
                    reducerPath: 'sceneApi'
                })
            });
        });

        it('should return undefined if cache is expired', () => {
            const oldTimestamp = Date.now() - (25 * 60 * 60 * 1000);
            const cachedData = {
                queries: {},
                mutations: {},
                timestamp: oldTimestamp
            };

            vi.mocked(storage.getItem).mockReturnValue(cachedData);

            const result = hydrateFromStorage();

            expect(result).toBeUndefined();
            expect(storage.removeItem).toHaveBeenCalledWith('rtkQueryCache');
        });

        it('should return undefined if no cache exists', () => {
            vi.mocked(storage.getItem).mockReturnValue(null);

            const result = hydrateFromStorage();

            expect(result).toBeUndefined();
        });

        it('should handle corrupted cache gracefully', () => {
            const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            vi.mocked(storage.getItem).mockImplementation(() => {
                throw new Error('Corrupted data');
            });

            const result = hydrateFromStorage();

            expect(result).toBeUndefined();
            expect(consoleErrorSpy).toHaveBeenCalled();
        });

        it('should include default config values', () => {
            const cachedData = {
                queries: {},
                mutations: {},
                timestamp: Date.now()
            };

            vi.mocked(storage.getItem).mockReturnValue(cachedData);

            const result = hydrateFromStorage();

            expect(result?.config).toEqual({
                online: true,
                focused: true,
                middlewareRegistered: false,
                reducerPath: 'sceneApi',
                keepUnusedDataFor: 60,
                refetchOnMountOrArgChange: false,
                refetchOnFocus: false,
                refetchOnReconnect: false
            });
        });
    });

    describe('offline mutation management', () => {
        it('should get offline mutations', () => {
            const mutations: OfflineMutation[] = [
                { id: '1', endpoint: 'test', args: {}, timestamp: Date.now() }
            ];

            vi.mocked(storage.getItem).mockReturnValue(mutations);

            const result = getOfflineMutations();

            expect(result).toEqual(mutations);
        });

        it('should return empty array if no mutations', () => {
            vi.mocked(storage.getItem).mockReturnValue(null);

            const result = getOfflineMutations();

            expect(result).toEqual([]);
        });

        it('should clear all offline mutations', () => {
            clearOfflineMutations();

            expect(storage.removeItem).toHaveBeenCalledWith('offlineMutations');
        });

        it('should remove specific mutation by id', () => {
            const mutations: OfflineMutation[] = [
                { id: '1', endpoint: 'test1', args: {}, timestamp: Date.now() },
                { id: '2', endpoint: 'test2', args: {}, timestamp: Date.now() }
            ];

            vi.mocked(storage.getItem).mockReturnValue(mutations);

            removeOfflineMutation('1');

            expect(storage.setItem).toHaveBeenCalledWith(
                'offlineMutations',
                [mutations[1]]
            );
        });
    });

    describe('syncOfflineMutations', () => {
        it('should sync all offline mutations', async () => {
            const mutations: OfflineMutation[] = [
                { id: '1', endpoint: 'updateScene', args: { id: '123' }, timestamp: Date.now() },
                { id: '2', endpoint: 'addSceneAsset', args: { sceneId: '456' }, timestamp: Date.now() }
            ];

            vi.mocked(storage.getItem).mockReturnValue(mutations);

            const mockApi = {
                endpoints: {
                    updateScene: { initiate: vi.fn().mockResolvedValue({}) },
                    addSceneAsset: { initiate: vi.fn().mockResolvedValue({}) }
                }
            };

            await syncOfflineMutations(mockApi);

            expect(mockApi.endpoints.updateScene.initiate).toHaveBeenCalledWith({ id: '123' });
            expect(mockApi.endpoints.addSceneAsset.initiate).toHaveBeenCalledWith({ sceneId: '456' });
        });

        it('should remove synced mutations from queue', async () => {
            const mutations: OfflineMutation[] = [
                { id: '1', endpoint: 'updateScene', args: {}, timestamp: Date.now() }
            ];

            vi.mocked(storage.getItem).mockReturnValue(mutations);

            const mockApi = {
                endpoints: {
                    updateScene: { initiate: vi.fn().mockResolvedValue({}) }
                }
            };

            await syncOfflineMutations(mockApi);

            expect(storage.setItem).toHaveBeenCalledWith('offlineMutations', []);
        });

        it('should handle sync errors gracefully', async () => {
            const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            const mutations: OfflineMutation[] = [
                { id: '1', endpoint: 'updateScene', args: {}, timestamp: Date.now() }
            ];

            vi.mocked(storage.getItem).mockReturnValue(mutations);

            const mockApi = {
                endpoints: {
                    updateScene: { initiate: vi.fn().mockRejectedValue(new Error('Sync failed')) }
                }
            };

            await syncOfflineMutations(mockApi);

            expect(consoleErrorSpy).toHaveBeenCalledWith(
                expect.stringContaining('Failed to sync offline mutation'),
                expect.any(Error)
            );
        });

        it('should do nothing if no mutations exist', async () => {
            vi.mocked(storage.getItem).mockReturnValue([]);

            const mockApi = {
                endpoints: {}
            };

            await syncOfflineMutations(mockApi);

            expect(storage.setItem).not.toHaveBeenCalled();
        });
    });
});
