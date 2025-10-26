import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';

// Feature slices
import authSlice from './slices/authSlice';
import uiSlice from './slices/uiSlice';
import errorSlice from './slices/errorSlice';

// RTK Query APIs for existing microservices
import { authApi } from '../services/authApi';
import { adventuresApi } from '../services/adventuresApi';
import { assetsApi } from '../services/assetsApi';
import { contentApi } from '../services/contentApi';
import { gameSessionsApi } from '../services/gameSessionsApi';
import { mediaApi } from '../services/mediaApi';
import { sceneApi } from '../services/sceneApi';
// Offline sync temporarily disabled - causes cache invalidation errors
// import { persistMiddleware, hydrateFromStorage } from '../services/offlineSync';

// const preloadedState = {
//   [sceneApi.reducerPath]: hydrateFromStorage()
// };

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
    [contentApi.reducerPath]: contentApi.reducer,
    [gameSessionsApi.reducerPath]: gameSessionsApi.reducer,
    [mediaApi.reducerPath]: mediaApi.reducer,
    [sceneApi.reducerPath]: sceneApi.reducer,
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
    .concat(contentApi.middleware)
    .concat(gameSessionsApi.middleware)
    .concat(mediaApi.middleware)
    .concat(sceneApi.middleware),
    // .concat(persistMiddleware), // Disabled - causes cache invalidation errors
  devTools: process.env.NODE_ENV !== 'production',
});

// Expose store to window for E2E testing
if (import.meta.env.DEV || import.meta.env.MODE === 'test') {
  (window as any).store = store;
}

// Enable listener behavior for the store
setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks for use throughout the app
import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;