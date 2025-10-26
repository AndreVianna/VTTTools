import type { Middleware, MiddlewareAPI } from '@reduxjs/toolkit';
import { storage } from '@/utils/storage';

const RTK_QUERY_CACHE_KEY = 'rtkQueryCache';
const OFFLINE_MUTATIONS_KEY = 'offlineMutations';

export interface OfflineMutation {
    id: string;
    endpoint: string;
    args: any;
    timestamp: number;
}

export const persistMiddleware: Middleware = (api: MiddlewareAPI) => (next) => (action: any) => {
    const result = next(action);

    if (action?.type?.includes?.('/fulfilled') || action?.type?.includes?.('/rejected')) {
        const state = api.getState() as any;

        if (state?.sceneApi) {
            storage.setItem(RTK_QUERY_CACHE_KEY, {
                queries: state.sceneApi.queries,
                mutations: state.sceneApi.mutations,
                timestamp: Date.now()
            });
        }
    }

    const mutation = action?.meta?.arg;
    const isRejectedMutation = action?.type?.includes?.('/rejected');
    const hasRejectedWithValue = action?.meta?.rejectedWithValue === true;
    const isFetchError = (action?.payload as any)?.status === 'FETCH_ERROR';

    if (isRejectedMutation && hasRejectedWithValue && mutation?.type === 'mutation' && isFetchError) {
        const offlineMutation: OfflineMutation = {
            id: `${mutation.endpointName}_${Date.now()}`,
            endpoint: mutation.endpointName,
            args: mutation.originalArgs,
            timestamp: Date.now()
        };

        const existingMutations = storage.getItem<OfflineMutation[]>(OFFLINE_MUTATIONS_KEY) || [];
        storage.setItem(OFFLINE_MUTATIONS_KEY, [...existingMutations, offlineMutation]);
    }

    return result;
};

export const hydrateFromStorage = () => {
    try {
        const cached = storage.getItem<any>(RTK_QUERY_CACHE_KEY);
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
                reducerPath: 'sceneApi',
                refetchOnFocus: false,
                refetchOnReconnect: true
            }
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
    const filtered = mutations.filter(m => m.id !== id);
    storage.setItem(OFFLINE_MUTATIONS_KEY, filtered);
};

export const syncOfflineMutations = async (api: any): Promise<void> => {
    const mutations = getOfflineMutations();

    if (mutations.length === 0) {
        return;
    }

    for (const mutation of mutations) {
        try {
            await api.endpoints[mutation.endpoint].initiate(mutation.args);
            removeOfflineMutation(mutation.id);
        } catch (error) {
            console.error(`Failed to sync offline mutation: ${mutation.endpoint}`, error);
        }
    }
};
