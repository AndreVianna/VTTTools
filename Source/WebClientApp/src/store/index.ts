import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { profileApi } from '../api/profileApi';
import { recoveryCodesApi } from '../api/recoveryCodesApi';
import { securityApi } from '../api/securityApi';
import { twoFactorApi } from '../api/twoFactorApi';
import { adventuresApi } from '../services/adventuresApi';
import { assetsApi } from '../services/assetsApi';
// RTK Query APIs for existing microservices
import { authApi } from '../services/authApi';
import { campaignsApi } from '../services/campaignsApi';
import { contentApi } from '../services/contentApi';
import { encounterApi } from '../services/encounterApi';
import { gameSessionsApi } from '../services/gameSessionsApi';
import { mediaApi } from '../services/mediaApi';
import { worldsApi } from '../services/worldsApi';
// Feature slices
import authSlice from './slices/authSlice';
import errorSlice from './slices/errorSlice';
import uiSlice from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    // Feature slices - minimal local state
    auth: authSlice,
    ui: uiSlice,
    error: errorSlice,

    // RTK Query API slices - connect to existing microservices
    [authApi.reducerPath]: authApi.reducer,
    [adventuresApi.reducerPath]: adventuresApi.reducer,
    [assetsApi.reducerPath]: assetsApi.reducer,
    [campaignsApi.reducerPath]: campaignsApi.reducer,
    [contentApi.reducerPath]: contentApi.reducer,
    [worldsApi.reducerPath]: worldsApi.reducer,
    [gameSessionsApi.reducerPath]: gameSessionsApi.reducer,
    [mediaApi.reducerPath]: mediaApi.reducer,
    [encounterApi.reducerPath]: encounterApi.reducer,
    [profileApi.reducerPath]: profileApi.reducer,
    [securityApi.reducerPath]: securityApi.reducer,
    [twoFactorApi.reducerPath]: twoFactorApi.reducer,
    [recoveryCodesApi.reducerPath]: recoveryCodesApi.reducer,
  },
  // preloadedState, // Disabled - causes cache issues
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'persist/PERSIST',
          'persist/REHYDRATE',
          'authApi/executeMutation/pending',
          'authApi/executeMutation/fulfilled',
          'authApi/executeMutation/rejected',
        ],
      },
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
      .concat(profileApi.middleware)
      .concat(securityApi.middleware)
      .concat(twoFactorApi.middleware)
      .concat(recoveryCodesApi.middleware),
  devTools: process.env.NODE_ENV !== 'production',
});

declare global {
  interface Window {
    store: typeof store;
  }
}

if (import.meta.env.DEV || import.meta.env.MODE === 'test') {
  window.store = store;
}

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

import type { TypedUseSelectorHook } from 'react-redux';
import { useDispatch, useSelector } from 'react-redux';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
