import { configureStore } from '@reduxjs/toolkit';
import { profileApi } from '@/api/profileApi';
import { recoveryCodesApi } from '@/api/recoveryCodesApi';
import { securityApi } from '@/api/securityApi';
import { twoFactorApi } from '@/api/twoFactorApi';
import { adventuresApi } from '@/services/adventuresApi';
import { assetsApi } from '@/services/assetsApi';
import { authApi } from '@/services/authApi';
import { campaignsApi } from '@/services/campaignsApi';
import { contentApi } from '@/services/contentApi';
import { encounterApi } from '@/services/encounterApi';
import { gameSessionsApi } from '@/services/gameSessionsApi';
import { mediaApi } from '@/services/mediaApi';
import { stageApi } from '@/services/stageApi';
import { worldsApi } from '@/services/worldsApi';
import authSlice from '@/store/slices/authSlice';
import encounterSlice from '@/store/slices/encounterSlice';
import errorSlice from '@/store/slices/errorSlice';
import uiSlice from '@/store/slices/uiSlice';
import type { RootState } from '@/store';

export interface TestStoreOptions {
    preloadedState?: Partial<RootState>;
}

export const createTestStore = (options: TestStoreOptions = {}) => {
    const { preloadedState = {} } = options;

    return configureStore({
        reducer: {
            // Feature slices
            auth: authSlice,
            encounter: encounterSlice,
            ui: uiSlice,
            error: errorSlice,

            // RTK Query API slices
            [authApi.reducerPath]: authApi.reducer,
            [adventuresApi.reducerPath]: adventuresApi.reducer,
            [assetsApi.reducerPath]: assetsApi.reducer,
            [campaignsApi.reducerPath]: campaignsApi.reducer,
            [contentApi.reducerPath]: contentApi.reducer,
            [worldsApi.reducerPath]: worldsApi.reducer,
            [gameSessionsApi.reducerPath]: gameSessionsApi.reducer,
            [mediaApi.reducerPath]: mediaApi.reducer,
            [encounterApi.reducerPath]: encounterApi.reducer,
            [stageApi.reducerPath]: stageApi.reducer,
            [profileApi.reducerPath]: profileApi.reducer,
            [securityApi.reducerPath]: securityApi.reducer,
            [twoFactorApi.reducerPath]: twoFactorApi.reducer,
            [recoveryCodesApi.reducerPath]: recoveryCodesApi.reducer,
        },
        preloadedState: preloadedState as RootState,
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware({
                serializableCheck: false, // Disable for tests
            })
                .concat(authApi.middleware)
                .concat(adventuresApi.middleware)
                .concat(assetsApi.middleware)
                .concat(campaignsApi.middleware)
                .concat(contentApi.middleware)
                .concat(worldsApi.middleware)
                .concat(gameSessionsApi.middleware)
                .concat(mediaApi.middleware)
                .concat(encounterApi.middleware)
                .concat(stageApi.middleware)
                .concat(profileApi.middleware)
                .concat(securityApi.middleware)
                .concat(twoFactorApi.middleware)
                .concat(recoveryCodesApi.middleware),
    });
};

export type TestStore = ReturnType<typeof createTestStore>;
