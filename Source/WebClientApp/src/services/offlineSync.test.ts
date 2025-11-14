import type { Dispatch, MiddlewareAPI, UnknownAction } from '@reduxjs/toolkit';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { storage } from '@/utils/storage';
import {
  clearOfflineMutations,
  getOfflineMutations,
  hydrateFromStorage,
  type OfflineMutation,
  persistMiddleware,
  type RootState,
  removeOfflineMutation,
  syncOfflineMutations,
} from './offlineSync';

vi.mock('@/utils/storage', () => ({
  storage: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  },
}));

describe('offlineSync', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('persistMiddleware', () => {
    it('should persist cache on fulfilled actions', () => {
      const api: MiddlewareAPI<Dispatch<UnknownAction>, RootState> = {
        getState: vi.fn().mockReturnValue({
          encounterApi: {
            queries: { test: 'data' },
            mutations: {},
          },
        }),
        dispatch: vi.fn(),
      };
      const next = vi.fn((action) => action);
      const action = { type: 'encounterApi/getEncounter/fulfilled' };

      const middleware = persistMiddleware(api);
      middleware(next)(action);

      expect(storage.setItem).toHaveBeenCalledWith(
        'rtkQueryCache',
        expect.objectContaining({
          queries: { test: 'data' },
          mutations: {},
          timestamp: expect.any(Number),
        }),
      );
    });

    it('should persist cache on rejected actions', () => {
      const api: MiddlewareAPI<Dispatch<UnknownAction>, RootState> = {
        getState: vi.fn().mockReturnValue({
          encounterApi: {
            queries: {},
            mutations: { test: 'mutation' },
          },
        }),
        dispatch: vi.fn(),
      };
      const next = vi.fn((action) => action);
      const action = { type: 'encounterApi/updateEncounter/rejected' };

      const middleware = persistMiddleware(api);
      middleware(next)(action);

      expect(storage.setItem).toHaveBeenCalled();
    });

    it('should not persist on non-RTK actions', () => {
      const api: MiddlewareAPI<Dispatch<UnknownAction>, RootState> = {
        getState: vi.fn().mockReturnValue({
          encounterApi: {
            queries: {},
            mutations: {},
          },
        }),
        dispatch: vi.fn(),
      };
      const next = vi.fn((action) => action);
      const action = { type: 'some/other/action' };

      const middleware = persistMiddleware(api);
      middleware(next)(action);

      expect(storage.setItem).not.toHaveBeenCalled();
    });

    it('should queue offline mutations on network errors', () => {
      const api: MiddlewareAPI<Dispatch<UnknownAction>, RootState> = {
        getState: vi.fn().mockReturnValue({
          encounterApi: { queries: {}, mutations: {} },
        }),
        dispatch: vi.fn(),
      };
      const next = vi.fn((action) => action);
      const action = {
        type: 'encounterApi/updateEncounter/rejected',
        meta: {
          arg: {
            type: 'mutation',
            endpointName: 'updateEncounter',
            originalArgs: { id: '123', version: 1 },
          },
          rejectedWithValue: true,
        },
        payload: { status: 'FETCH_ERROR' },
        error: { name: 'ConditionError', message: 'Network error' },
      };

      vi.mocked(storage.getItem).mockReturnValue([]);

      const middleware = persistMiddleware(api);
      middleware(next)(action);

      const calls = vi.mocked(storage.setItem).mock.calls;
      const offlineMutationCall = calls.find((call) => call[0] === 'offlineMutations');

      expect(offlineMutationCall).toBeDefined();
      expect(offlineMutationCall?.[1]).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            endpoint: 'updateEncounter',
            args: { id: '123', version: 1 },
          }),
        ]),
      );
    });

    it('should append to existing offline mutations', () => {
      const existingMutations: OfflineMutation[] = [
        { id: 'existing', endpoint: 'test', args: {}, timestamp: Date.now() },
      ];

      const api: MiddlewareAPI<Dispatch<UnknownAction>, RootState> = {
        getState: vi.fn().mockReturnValue({
          encounterApi: { queries: {}, mutations: {} },
        }),
        dispatch: vi.fn(),
      };
      const next = vi.fn((action) => action);
      const action = {
        type: 'encounterApi/updateEncounter/rejected',
        meta: {
          arg: {
            type: 'mutation',
            endpointName: 'updateEncounter',
            originalArgs: { id: '456' },
          },
          rejectedWithValue: true,
        },
        payload: { status: 'FETCH_ERROR' },
        error: { message: 'Network error' },
      };

      vi.mocked(storage.getItem).mockReturnValue(existingMutations);

      const middleware = persistMiddleware(api);
      middleware(next)(action);

      const calls = vi.mocked(storage.setItem).mock.calls;
      const offlineMutationCall = calls.find((call) => call[0] === 'offlineMutations');

      expect(offlineMutationCall).toBeDefined();
      expect(offlineMutationCall?.[1]).toEqual(
        expect.arrayContaining([existingMutations[0], expect.objectContaining({ endpoint: 'updateEncounter' })]),
      );
    });
  });

  describe('hydrateFromStorage', () => {
    it('should return cached state if valid', () => {
      const cachedData = {
        queries: { test: 'data' },
        mutations: {},
        timestamp: Date.now() - 1000,
      };

      vi.mocked(storage.getItem).mockReturnValue(cachedData);

      const result = hydrateFromStorage();

      expect(result).toMatchObject({
        queries: { test: 'data' },
        mutations: {},
        config: expect.objectContaining({
          reducerPath: 'encounterApi',
        }),
      });
    });

    it('should return undefined if cache is expired', () => {
      const oldTimestamp = Date.now() - 25 * 60 * 60 * 1000;
      const cachedData = {
        queries: {},
        mutations: {},
        timestamp: oldTimestamp,
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
        timestamp: Date.now(),
      };

      vi.mocked(storage.getItem).mockReturnValue(cachedData);

      const result = hydrateFromStorage();

      expect(result?.config).toEqual({
        online: true,
        focused: true,
        middlewareRegistered: false,
        reducerPath: 'encounterApi',
        keepUnusedDataFor: 60,
        refetchOnMountOrArgChange: false,
        refetchOnFocus: false,
        refetchOnReconnect: false,
      });
    });
  });

  describe('offline mutation management', () => {
    it('should get offline mutations', () => {
      const mutations: OfflineMutation[] = [{ id: '1', endpoint: 'test', args: {}, timestamp: Date.now() }];

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
        { id: '2', endpoint: 'test2', args: {}, timestamp: Date.now() },
      ];

      vi.mocked(storage.getItem).mockReturnValue(mutations);

      removeOfflineMutation('1');

      expect(storage.setItem).toHaveBeenCalledWith('offlineMutations', [mutations[1]]);
    });
  });

  describe('syncOfflineMutations', () => {
    it('should sync all offline mutations', async () => {
      const mutations: OfflineMutation[] = [
        {
          id: '1',
          endpoint: 'updateEncounter',
          args: { id: '123' },
          timestamp: Date.now(),
        },
        {
          id: '2',
          endpoint: 'addEncounterAsset',
          args: { encounterId: '456' },
          timestamp: Date.now(),
        },
      ];

      vi.mocked(storage.getItem).mockReturnValue(mutations);

      const mockApi = {
        endpoints: {
          updateEncounter: { initiate: vi.fn().mockResolvedValue({}) },
          addEncounterAsset: { initiate: vi.fn().mockResolvedValue({}) },
        },
      };

      await syncOfflineMutations(mockApi);

      expect(mockApi.endpoints.updateEncounter.initiate).toHaveBeenCalledWith({
        id: '123',
      });
      expect(mockApi.endpoints.addEncounterAsset.initiate).toHaveBeenCalledWith({ encounterId: '456' });
    });

    it('should remove synced mutations from queue', async () => {
      const mutations: OfflineMutation[] = [
        {
          id: '1',
          endpoint: 'updateEncounter',
          args: {},
          timestamp: Date.now(),
        },
      ];

      vi.mocked(storage.getItem).mockReturnValue(mutations);

      const mockApi = {
        endpoints: {
          updateEncounter: { initiate: vi.fn().mockResolvedValue({}) },
        },
      };

      await syncOfflineMutations(mockApi);

      expect(storage.setItem).toHaveBeenCalledWith('offlineMutations', []);
    });

    it('should handle sync errors gracefully', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const mutations: OfflineMutation[] = [
        {
          id: '1',
          endpoint: 'updateEncounter',
          args: {},
          timestamp: Date.now(),
        },
      ];

      vi.mocked(storage.getItem).mockReturnValue(mutations);

      const mockApi = {
        endpoints: {
          updateEncounter: {
            initiate: vi.fn().mockRejectedValue(new Error('Sync failed')),
          },
        },
      };

      await syncOfflineMutations(mockApi);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to sync offline mutation'),
        expect.any(Error),
      );
    });

    it('should do nothing if no mutations exist', async () => {
      vi.mocked(storage.getItem).mockReturnValue([]);

      const mockApi = {
        endpoints: {},
      };

      await syncOfflineMutations(mockApi);

      expect(storage.setItem).not.toHaveBeenCalled();
    });
  });
});
