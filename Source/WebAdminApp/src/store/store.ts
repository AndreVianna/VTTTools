import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { authApi } from '@services/authApi';
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';
import jobsReducer from './slices/jobsSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        ui: uiReducer,
        jobs: jobsReducer,
        [authApi.reducerPath]: authApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [
                    'authApi/executeMutation/pending',
                    'authApi/executeMutation/fulfilled',
                    'authApi/executeMutation/rejected',
                ],
            },
        }).concat(authApi.middleware),
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
