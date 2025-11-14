import type { Middleware, UnknownAction } from '@reduxjs/toolkit';
import { storage } from '@/utils/storage';

const RTK_QUERY_CACHE_KEY = 'rtkQueryCache';
const OFFLINE_MUTATIONS_KEY = 'offlineMutations';

export interface OfflineMutation {
  id: string;
  endpoint: string;
  args: unknown;
  timestamp: number;
}

export interface RootState {
  encounterApi?: {
    queries?: unknown;
    mutations?: unknown;
  };
}

interface ActionWithMeta extends UnknownAction {
  meta?: {
    arg?: {
      type?: string;
      endpointName?: string;
      originalArgs?: unknown;
    };
    rejectedWithValue?: boolean;
  };
  payload?: {
    status?: string;
  };
}

export const persistMiddleware: Middleware<object, RootState> = (api) => (next) => (action: unknown) => {
  const result = next(action);

  const unknownAction = action as UnknownAction;

  if (unknownAction?.type?.includes?.('/fulfilled') || unknownAction?.type?.includes?.('/rejected')) {
    const state = api.getState();

    if (state?.encounterApi) {
      storage.setItem(RTK_QUERY_CACHE_KEY, {
        queries: state.encounterApi.queries ?? {},
        mutations: state.encounterApi.mutations ?? {},
        timestamp: Date.now(),
      });
    }
  }

  const typedAction = action as ActionWithMeta;
  const mutation = typedAction?.meta?.arg;
  const isRejectedMutation = unknownAction?.type?.includes?.('/rejected');
  const hasRejectedWithValue = typedAction?.meta?.rejectedWithValue === true;
  const isFetchError = typedAction?.payload?.status === 'FETCH_ERROR';

  if (
    isRejectedMutation &&
    hasRejectedWithValue &&
    mutation?.type === 'mutation' &&
    isFetchError &&
    mutation.endpointName &&
    mutation.originalArgs !== undefined
  ) {
    const offlineMutation: OfflineMutation = {
      id: `${mutation.endpointName}_${Date.now()}`,
      endpoint: mutation.endpointName,
      args: mutation.originalArgs,
      timestamp: Date.now(),
    };

    const existingMutations = storage.getItem<OfflineMutation[]>(OFFLINE_MUTATIONS_KEY) || [];
    storage.setItem(OFFLINE_MUTATIONS_KEY, [...existingMutations, offlineMutation]);
  }

  return result;
};

export const hydrateFromStorage = () => {
  try {
    const cached = storage.getItem<{ queries?: unknown; mutations?: unknown; timestamp: number }>(RTK_QUERY_CACHE_KEY);
    if (!cached) return undefined;

    const age = Date.now() - cached.timestamp;
    const MAX_CACHE_AGE = 5 * 60 * 1000;

    if (age > MAX_CACHE_AGE) {
      storage.removeItem(RTK_QUERY_CACHE_KEY);
      return undefined;
    }

    return {
      queries: cached.queries || {},
      mutations: cached.mutations || {},
      provided: {},
      subscriptions: {},
      config: {
        online: true,
        focused: true,
        middlewareRegistered: false,
        reducerPath: 'encounterApi',
        refetchOnFocus: false,
        refetchOnReconnect: true,
      },
    };
  } catch (error) {
    console.error('Failed to hydrate from storage', error);
    return undefined;
  }
};

export const getOfflineMutations = (): OfflineMutation[] => {
  return storage.getItem<OfflineMutation[]>(OFFLINE_MUTATIONS_KEY) || [];
};

export const clearOfflineMutations = (): void => {
  storage.removeItem(OFFLINE_MUTATIONS_KEY);
};

export const removeOfflineMutation = (id: string): void => {
  const mutations = getOfflineMutations();
  const filtered = mutations.filter((m) => m.id !== id);
  storage.setItem(OFFLINE_MUTATIONS_KEY, filtered);
};

interface ApiWithEndpoints {
  endpoints: {
    [key: string]: {
      initiate: (args: unknown) => Promise<unknown>;
    };
  };
}

export const syncOfflineMutations = async (api: ApiWithEndpoints): Promise<void> => {
  const mutations = getOfflineMutations();

  if (mutations.length === 0) {
    return;
  }

  for (const mutation of mutations) {
    try {
      await api.endpoints[mutation.endpoint]?.initiate(mutation.args);
      removeOfflineMutation(mutation.id);
    } catch (error) {
      console.error(`Failed to sync offline mutation: ${mutation.endpoint}`, error);
    }
  }
};
